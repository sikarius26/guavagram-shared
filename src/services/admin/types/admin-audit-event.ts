export type AuditEventType =
  | 'impersonate.start'
  | 'impersonate.exit'
  | 'store.plan_changed'
  | 'store.suspended'
  | 'user.gp_adjusted'
  | 'user.suspended'
  | 'creator.verified'
  | 'creator.unverified'
  | 'creator.card_verified'
  | 'creator.card_unverified'
  | 'earning.approved'
  | 'earning.rejected'
  | 'payout.executed'
  | 'dispute.resolved'
  | 'review.approved'
  | 'review.rejected'
  | 'ugc.hidden'
  | 'report.resolved'
  | 'network.fraud_flagged'
  | 'settings.commissions_updated'
  | 'settings.gp_updated'
  | 'settings.plans_updated'
  | 'settings.referrals_updated'
  | 'settings.flag_toggled'
  | 'hiring.offer_approved'
  | 'hiring.offer_rejected'
  | 'hiring.closed'

export interface AdminAuditEvent {
  id: string
  at: string // ISO
  actorId: string
  actorEmail: string
  actorRole: string
  type: AuditEventType
  targetId?: string
  targetLabel?: string
  payload?: Record<string, unknown>
  impersonationSessionId?: string
}
