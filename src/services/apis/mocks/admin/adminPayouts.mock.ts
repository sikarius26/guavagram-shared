import { mulberry32, pick, randomInt, daysAgoISO, HANDLES } from './_seed'
import type { AdminPayout, PayoutStatus } from '~/services/admin/types/admin-payout'

const rand = mulberry32(77)

const PAYOUTS: AdminPayout[] = Array.from({ length: 48 }, (_, i) => {
  const status = pick(rand, ['pending', 'pending', 'in_transit', 'paid', 'paid', 'paid', 'failed']) as PayoutStatus
  const creatorIdx = randomInt(rand, 0, 59)
  const amount = randomInt(rand, 45, 2_800)
  const created = daysAgoISO(randomInt(rand, 0, 40))
  return {
    id: `pyo_${String(i).padStart(3, '0')}`,
    stripePayoutId: `po_stripe_${String(i).padStart(4, '0')}`,
    status,
    userId: `cre_${String(creatorIdx).padStart(3, '0')}`,
    userLabel: `@${HANDLES[creatorIdx % HANDLES.length]}`,
    amountEur: amount,
    createdAt: created,
    executedAt: status === 'paid' || status === 'in_transit' ? daysAgoISO(randomInt(rand, 0, 30)) : undefined,
    failureReason: status === 'failed' ? pick(rand, ['Insufficient funds', 'Invalid bank account', 'Account closed']) : undefined,
    earningIds: Array.from({ length: randomInt(rand, 1, 6) }, (_, k) => `ern_${String(i * 10 + k).padStart(4, '0')}`),
  }
})

export function getPayouts(): AdminPayout[] { return PAYOUTS }
