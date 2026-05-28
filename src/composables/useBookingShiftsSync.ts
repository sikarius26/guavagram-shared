// Mirrors bookingAvailability (the day×turno editor in ServiceConfigModal,
// persisted to brandingSettings) into real BookingShift entities on the Guava
// platform via bookingShift{Post,Delete}. Port of the same sync that the
// admin's GuavagramPanel does — extracted here so the public's owner-scope
// editor can keep the platform's bookings table in lockstep without needing
// the owner to open the admin.
//
// Source of truth = brandingSettings.bookingAvailability (already persisted by
// useBioConfig). This composable is a one-way mirror to backend: it observes
// the array, builds a desired set of BookingShifts (one per day×turno) and
// upserts / deletes to converge.
//
// Mapping rule: each turno becomes one shift with a deterministic id
// `bav-{dayIndex}-{turno.id}` so re-syncs are idempotent. Non-configurable
// fields (interval, duration, guest limits) use sensible defaults until the
// editor surfaces them.

import { ref, watch, type Ref } from 'vue'
import { bookingApiClient } from '../services/apis/api.client.booking'
import { BookingShiftViewModel } from '../services/apis/models/booking-shift-view-model'
import { ScheduleViewModel } from '../services/apis/models/schedule-view-model'

export interface BookingTurnoCfg {
  id?: string
  name?: string
  timeFrom?: string
  timeTo?: string
}
export interface BookingDayCfg {
  dayIndex: number
  open?: boolean
  turnos?: BookingTurnoCfg[]
}

export interface UseBookingShiftsSyncOptions {
  // Store id to write against. Pass a ref so the sync activates the moment the
  // owner's session lands (storeId may be null on first paint).
  storeId: Ref<string | null | undefined>
  // Gate writes: only sync when the current viewer can manage the store.
  canManage: Ref<boolean>
  // The owner's edited schedule (same shape as brandingSettings.bookingAvailability).
  availability: Ref<BookingDayCfg[]>
  // Debounce in ms before pushing changes. 800ms matches admin's GuavagramPanel
  // so rapid edits (typing a turno name) don't fire one POST per keystroke.
  debounceMs?: number
}

const parseHM = (s: string) => {
  const [h, m] = (s || '').split(':').map(n => parseInt(n, 10))
  return { h: Number.isFinite(h) ? h : 0, m: Number.isFinite(m) ? m : 0 }
}

function buildDesiredShifts(availability: BookingDayCfg[]): BookingShiftViewModel[] {
  const shifts: BookingShiftViewModel[] = []
  for (const day of availability) {
    if (!day?.open || !Array.isArray(day.turnos)) continue
    for (const turno of day.turnos) {
      const from = parseHM(turno?.timeFrom || '13:00')
      const to = parseHM(turno?.timeTo || '23:30')
      const shift = new BookingShiftViewModel()
      shift.id = `bav-${day.dayIndex}-${turno?.id ?? 'unknown'}`
      shift.name = turno?.name || 'Turno'
      shift.isRecurring = true
      shift.minGuests = 1
      shift.maxGuests = 10
      shift.intervalMinutes = 30
      shift.durationMinutes = 90
      shift.noticePeriodMinutes = 0
      const schedule = new ScheduleViewModel()
      schedule.startingHour = from.h
      schedule.startingMinute = from.m
      schedule.endingHour = to.h
      schedule.endingMinute = to.m
      shift.weeklySchedule = { [String(day.dayIndex)]: schedule }
      shifts.push(shift)
    }
  }
  return shifts
}

export function useBookingShiftsSync(opts: UseBookingShiftsSyncOptions) {
  const debounceMs = opts.debounceMs ?? 800
  // Tracks what's currently on the backend so the first sync after page load
  // correctly DELETEs anything the owner removed locally vs the server state.
  const lastSyncedIds = ref<Set<string>>(new Set())
  let timer: ReturnType<typeof setTimeout> | null = null
  let seeded = false

  const seedFromServer = async () => {
    if (seeded || !opts.storeId.value || !opts.canManage.value) return
    seeded = true
    try {
      const shifts = await bookingApiClient.bookingShifts(opts.storeId.value)
      lastSyncedIds.value = new Set((shifts ?? []).map(s => s.id!).filter(Boolean) as string[])
    } catch {
      // 404 / unauth → leave the set empty; first sync becomes pure POSTs.
    }
  }

  const syncNow = async () => {
    const storeId = opts.storeId.value
    if (!storeId || !opts.canManage.value) return
    await seedFromServer()

    const desired = buildDesiredShifts(opts.availability.value ?? [])
    const desiredIds = new Set<string>(desired.map(s => s.id!).filter(Boolean) as string[])

    // DELETE shifts that disappeared. Fire-and-forget per id — if one fails
    // (e.g. shift never existed yet) keep going so the rest sync.
    for (const oldId of lastSyncedIds.value) {
      if (desiredIds.has(oldId)) continue
      try { await bookingApiClient.bookingShiftDelete(storeId, oldId) }
      catch (e: any) {
        const status = e?.status ?? e?.response?.status
        if (status !== 404) console.warn('[useBookingShiftsSync] delete failed', oldId, status)
      }
    }

    // Upsert each desired shift. Backend treats POST as idempotent on id.
    for (const shift of desired) {
      try { await bookingApiClient.bookingShiftPost(storeId, shift) }
      catch (e: any) {
        const status = e?.status ?? e?.response?.status
        if (status !== 404) console.warn('[useBookingShiftsSync] post failed', shift.id, status)
      }
    }

    lastSyncedIds.value = desiredIds
  }

  const schedule = () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => { void syncNow() }, debounceMs)
  }

  // Auto-fire on availability mutations. Deep watch because turnos are nested.
  // Client-only: bookingApiClient lacks a session token during SSR anyway.
  watch(
    [opts.availability, opts.storeId, opts.canManage],
    () => {
      if (typeof window === 'undefined') return
      if (!opts.storeId.value || !opts.canManage.value) return
      schedule()
    },
    { deep: true },
  )

  return { syncNow, schedule }
}
