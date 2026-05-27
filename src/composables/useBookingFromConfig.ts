// Derives the public booking widget's inputs from the owner's bio-editor
// reservation config (persisted in brandingSettings.bookingAvailability /
// bookingSalas). Both /bio (Sidebar → BookingWidget) and /booking
// (booking.vue → BookingWidget) need the SAME mapping, so it lives here
// instead of being copy-pasted per page. No backend BookingShift sync — the
// turnos round-trip through brandingSettings like cover/logo/etc.
//
// Lives in guavagram-shared (not guavagram/app/composables) because the
// public app aliases `~/composables/*` to the shared package — an app-local
// composable imported via `~/composables/...` would not resolve.

export type BookingTurnoCfg = { id?: string; name?: string; timeFrom?: string; timeTo?: string }
export type BookingDayCfg = { dayIndex: number; open?: boolean; turnos?: BookingTurnoCfg[] }
export type BookingSalaCfg = { id: string; name: string; capacity?: number }

const parseHM = (s: string) => {
  const [h, m] = (s || '').split(':').map(n => parseInt(n, 10))
  return { h: Number.isFinite(h) ? h : 0, m: Number.isFinite(m) ? m : 0 }
}

// bookingAvailability.dayIndex: 0=Lunes..6=Domingo. The widget keys
// weeklySchedule by JS getDay() (0=Sunday..6=Saturday): Lunes(0)→1 … Domingo(6)→0.
const toJsDay = (dayIndex: number) => (dayIndex + 1) % 7

// Map the editor's day×turno availability into the BookingShift shape the
// public BookingWidget consumes (one shift per distinct turno name, with a
// weeklySchedule keyed by JS getDay()).
export function bookingShiftsFromAvailability(avail: BookingDayCfg[] | undefined | null): any[] {
  if (!Array.isArray(avail) || !avail.length) return []
  const byName = new Map<string, any>()
  for (const day of avail) {
    if (!day?.open || !Array.isArray(day.turnos) || !day.turnos.length) continue
    const jsDay = toJsDay(day.dayIndex)
    for (const t of day.turnos) {
      const name = (t?.name || '').trim() || 'Reserva'
      if (!byName.has(name)) {
        byName.set(name, {
          id: `cfg-${name.toLowerCase().replace(/\s+/g, '-')}`,
          name,
          intervalMinutes: 30,
          noticePeriodMinutes: 0,
          weeklySchedule: {} as Record<number, any>,
        })
      }
      const from = parseHM(t.timeFrom || ''), to = parseHM(t.timeTo || '')
      byName.get(name).weeklySchedule[jsDay] = {
        isActive: true,
        startingHour: from.h, startingMinute: from.m,
        endingHour: to.h, endingMinute: to.m,
      }
    }
  }
  return Array.from(byName.values())
}

// Normalize the editor's salas (rooms/spaces) bag into a clean array the
// widget can offer as a selection. Drops entries without a name.
export function salasFromConfig(raw: unknown): BookingSalaCfg[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((s: any) => ({
      id: String(s?.id ?? ''),
      name: String(s?.name ?? '').trim(),
      capacity: typeof s?.capacity === 'number' ? s.capacity : undefined,
    }))
    .filter(s => s.name)
}
