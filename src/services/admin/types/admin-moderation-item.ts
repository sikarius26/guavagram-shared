export type ModerationStatus = 'pending' | 'approved' | 'rejected'

export interface AdminReviewItem {
  id: string
  status: ModerationStatus
  userId: string
  userLabel: string
  storeId: string
  storeLabel: string
  rating: number
  text: string
  receiptUrl: string
  placePhotoUrl: string
  submittedAt: string
  decidedAt?: string
  rejectionReason?: string
}

export interface AdminUgcItem {
  id: string
  status: ModerationStatus
  kind: 'feed_post' | 'story' | 'pick'
  authorHandle: string
  mediaUrl: string
  caption?: string
  reportsCount: number
  submittedAt: string
}

export interface AdminReportItem {
  id: string
  status: 'open' | 'resolved'
  kind: 'user' | 'store' | 'review'
  targetId: string
  targetLabel: string
  reporterUserId: string
  reason: string
  submittedAt: string
  resolvedAt?: string
}
