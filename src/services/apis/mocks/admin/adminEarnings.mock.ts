import { mulberry32, pick, randomInt, daysAgoISO, RESTAURANT_NAMES, HANDLES } from './_seed'

export type EarningStatus = 'pending' | 'approved' | 'rejected' | 'paid'

export interface AdminEarningRow {
  id: string
  creatorId: string
  creatorHandle: string
  storeId: string
  storeName: string
  amountEur: number
  orderTotalEur: number
  commissionPct: number
  status: EarningStatus
  createdAt: string
  approvedAt?: string
  paidAt?: string
  payoutId?: string
  orderId?: string
  bookingId?: string
}

const rand = mulberry32(66)

const EARNINGS: AdminEarningRow[] = Array.from({ length: 180 }, (_, i) => {
  const status = pick(rand, ['pending', 'pending', 'approved', 'approved', 'approved', 'paid', 'paid', 'rejected']) as EarningStatus
  const orderTotal = randomInt(rand, 25, 380)
  const pct = pick(rand, [8, 10, 10, 12, 15])
  const amount = Math.round((orderTotal * pct) / 100)
  const creatorIdx = randomInt(rand, 0, 59)
  const createdAt = daysAgoISO(randomInt(rand, 0, 120))
  const approvedAt = (status === 'approved' || status === 'paid') ? daysAgoISO(randomInt(rand, 0, 90)) : undefined
  const paidAt = status === 'paid' ? daysAgoISO(randomInt(rand, 0, 60)) : undefined
  return {
    id: `ern_${String(i).padStart(4, '0')}`,
    creatorId: `cre_${String(creatorIdx).padStart(3, '0')}`,
    creatorHandle: HANDLES[creatorIdx % HANDLES.length]!,
    storeId: `sto_${randomInt(rand, 0, 19)}`,
    storeName: pick(rand, RESTAURANT_NAMES),
    amountEur: amount,
    orderTotalEur: orderTotal,
    commissionPct: pct,
    status,
    createdAt,
    approvedAt,
    paidAt,
    payoutId: status === 'paid' ? `pyo_${randomInt(rand, 100, 999)}` : undefined,
    orderId: rand() > 0.3 ? `ord_${randomInt(rand, 1000, 9999)}` : undefined,
    bookingId: rand() > 0.7 ? `bkg_${randomInt(rand, 100, 999)}` : undefined,
  }
})

export function getEarnings(): AdminEarningRow[] { return EARNINGS }
export function getEarningById(id: string): AdminEarningRow | null { return EARNINGS.find(e => e.id === id) ?? null }
