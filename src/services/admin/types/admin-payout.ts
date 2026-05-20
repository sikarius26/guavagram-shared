export type PayoutStatus = 'pending' | 'in_transit' | 'paid' | 'failed' | 'canceled'

export interface AdminPayout {
  id: string
  stripePayoutId?: string
  status: PayoutStatus
  userId: string
  userLabel: string
  amountEur: number
  createdAt: string
  executedAt?: string
  failureReason?: string
  earningIds: string[]
}
