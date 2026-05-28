// Derives the public order channels' "isOpen now" flag from the owner's
// ServiceConfigModal "Pedidos" tab (persisted in brandingSettings.takeawayAvailability
// / deliveryAvailability). The public menu reads this to override
// store.orderChannelStatus and decide whether to show the "+" / add-to-cart
// button on each ItemCard.
//
// Same dayIndex convention as bookingAvailability: 0=Lunes..6=Domingo.
// JS getDay() is 0=Sunday..6=Saturday → configDayIndex = (jsDay + 6) % 7.
//
// Lives in guavagram-shared because the public app aliases `~/composables/*`
// to the shared package, so an app-local composable here would not resolve.

export type OrderTurnoCfg = { id?: string; name?: string; timeFrom?: string; timeTo?: string }
export type OrderDayCfg = { dayIndex: number; open?: boolean; turnos?: OrderTurnoCfg[] }

const parseHM = (s: string): number => {
  const [h, m] = (s || '').split(':').map(n => parseInt(n, 10))
  const hh = Number.isFinite(h) ? h : 0
  const mm = Number.isFinite(m) ? m : 0
  return hh * 60 + mm
}

const jsDayToConfigIndex = (jsDay: number) => (jsDay + 6) % 7

// True iff the schedule has any open day with at least one turno. Used to
// detect "owner configured this channel at all" — drives both the override of
// store.orderChannelStatus (only override when configured) and the "Abierto a
// las X" hint copy.
export function ordersConfigured(avail: OrderDayCfg[] | undefined | null): boolean {
  if (!Array.isArray(avail)) return false
  return avail.some(d => d?.open && Array.isArray(d.turnos) && d.turnos.length > 0)
}

// True iff `now` falls within any turno of today's open day in `avail`.
// `now` defaults to current time; pass a Date for deterministic testing.
export function isOrdersOpenNow(avail: OrderDayCfg[] | undefined | null, now: Date = new Date()): boolean {
  if (!Array.isArray(avail) || !avail.length) return false
  const dayCfg = avail.find(d => d?.dayIndex === jsDayToConfigIndex(now.getDay()))
  if (!dayCfg?.open || !Array.isArray(dayCfg.turnos) || !dayCfg.turnos.length) return false
  const nowMin = now.getHours() * 60 + now.getMinutes()
  return dayCfg.turnos.some(t => {
    const from = parseHM(t?.timeFrom || '')
    const to = parseHM(t?.timeTo || '')
    // timeTo can be "00:00" (midnight) meaning end-of-day — treat 0 as 24*60
    // when it's strictly less than from, so the window wraps to midnight.
    const toAdjusted = to <= from ? 24 * 60 : to
    return nowMin >= from && nowMin < toAdjusted
  })
}
