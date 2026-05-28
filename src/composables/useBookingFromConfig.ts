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

export type BookingTurnoCfg = { id?: string; name?: string; timeFrom?: string; timeTo?: string; intervalMinutes?: number; durationMinutes?: number; tableGroupId?: string }
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
          // Si el editor no aportó intervalMinutes/durationMinutes (turno
          // creado antes de exponer esos campos) caemos a los defaults
          // estándar de Guava: slot cada 30 min, mesa libre tras 90 min.
          // Cuando sí están, se respetan — el widget público genera los
          // timeslots con el intervalo real configurado por el dueño.
          intervalMinutes: (t.intervalMinutes && t.intervalMinutes > 0) ? Math.floor(t.intervalMinutes) : 30,
          durationMinutes: (t.durationMinutes && t.durationMinutes > 0) ? Math.floor(t.durationMinutes) : 90,
          noticePeriodMinutes: 0,
          // tableGroupId vincula este shift a una sala (TableGroup) de Guava.
          // El widget público lo usa para validar que la sala seleccionada
          // por el visitante es compatible con el turno elegido.
          tableGroupId: t.tableGroupId || undefined,
          weeklySchedule: {} as Record<number, any>,
        })
      } else {
        // Si el mismo turno ya existía y este día trae interval/duration
        // distintos, nos quedamos con el primer valor no-default visto. El
        // BookingShift es uno-por-nombre y los tres campos (interval, duration,
        // tableGroupId) viven a nivel shift, no día — si difieren entre días
        // es config inconsistente del dueño, no lo arreglamos aquí.
        const existing = byName.get(name)
        if (existing.intervalMinutes === 30 && t.intervalMinutes && t.intervalMinutes > 0) {
          existing.intervalMinutes = Math.floor(t.intervalMinutes)
        }
        if (existing.durationMinutes === 90 && t.durationMinutes && t.durationMinutes > 0) {
          existing.durationMinutes = Math.floor(t.durationMinutes)
        }
        if (!existing.tableGroupId && t.tableGroupId) {
          existing.tableGroupId = t.tableGroupId
        }
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
