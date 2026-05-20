// Client-side shape for a creator's "pending match" — a restaurant they
// swiped-right on in Discover but who hasn't sent a coupon back yet.
// Promoted to a WalletCoupon when the restaurant accepts.

export type WalletPendingMatchStatus = 'pending' | 'declined' | 'expired'

export interface WalletPendingMatch {
  id: string
  storeSlug: string
  storeId?: string
  storeName: string
  storeCity?: string
  storeLogoUrl?: string
  storeCoverUrl?: string
  cuisine?: string
  status: WalletPendingMatchStatus
  addedAt: string
  expiresAt?: string
}
