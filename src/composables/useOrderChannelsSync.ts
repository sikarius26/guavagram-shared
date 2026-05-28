// Mirrors the per-channel weekly schedule (Para llevar / A domicilio) edited
// inline in the public ServiceConfigModal into the Guava platform via
// storeSchedulesPost + auto-toggles the channel on/off via
// storeOrderchannelStatus. Source of truth = brandingSettings.{takeaway,
// delivery}Availability (persisted by useBioConfig).
//
// Channel ids are discovered from StoreInfoViewModel.orderChannelStatus —
// each entry now carries an `id` (added to the model). When the store has no
// orderChannel for a type, sync is a no-op for that type: the public modal
// is supposed to gate its UI behind "Activa pedidos en Guava" in that case.
//
// Auto-toggle: if the new schedule has any open day → status=true; if every
// day is closed → status=false. Same simple rule the user picked over the
// "respect manual close" alternative.

import { ref, watch, type Ref } from 'vue'
import { storeApiClient } from '../services/apis/api.client.store'
import { ScheduleViewModel } from '../services/apis/models/schedule-view-model'
import { StoreOrderChannelViewModel } from '../services/apis/models/store-order-channel-view-model'

export interface OrderTurnoCfg {
  id?: string
  name?: string
  timeFrom?: string
  timeTo?: string
}
export interface OrderDayCfg {
  dayIndex: number
  open?: boolean
  turnos?: OrderTurnoCfg[]
}

// `orderChannelStatus` in StoreInfoViewModel is keyed by OrderTypeEnum names.
// We pass an opaque map here so the composable doesn't need to know the public
// StoreInfo shape — the modal already has it.
export type ChannelDirectory = {
  [key: string]: StoreOrderChannelViewModel | undefined
}

export interface UseOrderChannelsSyncOptions {
  storeId: Ref<string | null | undefined>
  canManage: Ref<boolean>
  // Backend channel directory (from StoreInfoViewModel.orderChannelStatus).
  // Each entry must carry an `id` for sync to proceed for that channel.
  channels: Ref<ChannelDirectory | null | undefined>
  takeawayAvailability: Ref<OrderDayCfg[]>
  deliveryAvailability: Ref<OrderDayCfg[]>
  debounceMs?: number
}

const parseHM = (s: string) => {
  const [h, m] = (s || '').split(':').map(n => parseInt(n, 10))
  return { h: Number.isFinite(h) ? h : 0, m: Number.isFinite(m) ? m : 0 }
}

// availability uses dayIndex 0=Lunes..6=Domingo; backend `dayOfTheWeek` uses
// JS getDay() convention 0=Sunday..6=Saturday. Map Lunes(0)→1, Domingo(6)→0.
const toDow = (dayIndex: number) => (dayIndex + 1) % 7

function availToSchedules(avail: OrderDayCfg[]): ScheduleViewModel[] {
  const out: ScheduleViewModel[] = []
  for (const day of avail) {
    if (!day?.open || !Array.isArray(day.turnos)) continue
    for (const turno of day.turnos) {
      const from = parseHM(turno?.timeFrom || '12:00')
      const to = parseHM(turno?.timeTo || '23:00')
      const s = new ScheduleViewModel()
      s.dayOfTheWeek = toDow(day.dayIndex)
      s.startingHour = from.h
      s.startingMinute = from.m
      s.endingHour = to.h
      s.endingMinute = to.m
      s.isActive = true
      out.push(s)
    }
  }
  return out
}

function hasAnyOpenDay(avail: OrderDayCfg[]): boolean {
  return avail.some(d => d?.open && Array.isArray(d.turnos) && d.turnos.length > 0)
}

export function useOrderChannelsSync(opts: UseOrderChannelsSyncOptions) {
  const debounceMs = opts.debounceMs ?? 800
  let timer: ReturnType<typeof setTimeout> | null = null

  // Remember the last status we pushed so we don't spam PATCH /status with the
  // same value on every keystroke. -1 = unknown (force first push).
  const lastStatusByChannelId: Record<string, boolean> = {}

  const channelIdFor = (key: 'TakeAway' | 'Delivery'): string | null => {
    const ch = opts.channels.value?.[key]
    return (ch?.id && typeof ch.id === 'string') ? ch.id : null
  }

  const syncChannel = async (
    storeId: string,
    channelId: string,
    availability: OrderDayCfg[],
  ) => {
    // 1) Schedules.
    try {
      await storeApiClient.storeSchedulesPost(storeId, availToSchedules(availability), channelId)
    } catch (e: any) {
      const status = e?.status ?? e?.response?.status
      console.warn('[useOrderChannelsSync] schedulesPost failed', channelId, status)
    }
    // 2) Auto-toggle status based on whether the new schedule has any open day.
    const nextStatus = hasAnyOpenDay(availability)
    if (lastStatusByChannelId[channelId] !== nextStatus) {
      try {
        await storeApiClient.storeOrderchannelStatus(storeId, channelId, nextStatus)
        lastStatusByChannelId[channelId] = nextStatus
      } catch (e: any) {
        const status = e?.status ?? e?.response?.status
        console.warn('[useOrderChannelsSync] orderchannelStatus failed', channelId, nextStatus, status)
      }
    }
  }

  const syncNow = async () => {
    const storeId = opts.storeId.value
    if (!storeId || !opts.canManage.value) return

    const takeawayId = channelIdFor('TakeAway')
    if (takeawayId) await syncChannel(storeId, takeawayId, opts.takeawayAvailability.value ?? [])

    const deliveryId = channelIdFor('Delivery')
    if (deliveryId) await syncChannel(storeId, deliveryId, opts.deliveryAvailability.value ?? [])
  }

  const schedule = () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => { void syncNow() }, debounceMs)
  }

  watch(
    [opts.takeawayAvailability, opts.deliveryAvailability, opts.storeId, opts.canManage, opts.channels],
    () => {
      if (typeof window === 'undefined') return
      if (!opts.storeId.value || !opts.canManage.value) return
      // Skip if no channels exist at all — store doesn't have the Guava
      // orders module contracted. The modal should be hiding its editor in
      // that case; this is defense in depth.
      if (!channelIdFor('TakeAway') && !channelIdFor('Delivery')) return
      schedule()
    },
    { deep: true },
  )

  // True when the backend has any channel id for this store (free Guavagram
  // returns no channels at all). The modal can use this to gate the editor.
  const hasAnyChannel = () =>
    !!(channelIdFor('TakeAway') || channelIdFor('Delivery'))

  return { syncNow, schedule, hasAnyChannel }
}
