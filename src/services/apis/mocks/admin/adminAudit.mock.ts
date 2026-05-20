import { mulberry32, pick, randomInt, daysAgoISO, HANDLES, RESTAURANT_NAMES } from './_seed'
import type { AdminAuditEvent, AuditEventType } from '~/services/admin/types/admin-audit-event'

const rand = mulberry32(123)

const ADMIN_EMAILS = ['pau.artiso@guavapp.com', 'ops@guavapp.com', 'finance@guavapp.com', 'moderation@guavapp.com', 'support@guavapp.com']

const TYPES: AuditEventType[] = [
  'store.plan_changed', 'store.suspended', 'creator.verified',
  'user.gp_adjusted', 'earning.approved', 'payout.executed',
  'dispute.resolved', 'review.approved', 'review.rejected',
  'network.fraud_flagged', 'settings.commissions_updated',
  'hiring.offer_approved', 'impersonate.start', 'impersonate.exit',
]

const SEEDED: AdminAuditEvent[] = Array.from({ length: 120 }, (_, i) => {
  const type = pick(rand, TYPES)
  const email = pick(rand, ADMIN_EMAILS)
  return {
    id: `aud_${String(i).padStart(4, '0')}`,
    at: daysAgoISO(randomInt(rand, 0, 45)),
    actorId: `adm_0${ADMIN_EMAILS.indexOf(email) + 1}`,
    actorEmail: email,
    actorRole: email.includes('finance') ? 'finance' : email.includes('ops') ? 'ops' : email.includes('moderation') ? 'content_mod' : email.includes('support') ? 'support' : 'super_admin',
    type,
    targetId: type.startsWith('store.') ? `sto_${randomInt(rand, 0, 19)}` : type.startsWith('creator.') ? `cre_${randomInt(rand, 0, 59)}` : `usr_${randomInt(rand, 0, 119)}`,
    targetLabel: type.startsWith('store.') ? pick(rand, RESTAURANT_NAMES) : '@' + pick(rand, HANDLES),
    payload: type === 'store.plan_changed' ? { from: 'pro', to: 'guava' }
      : type === 'user.gp_adjusted' ? { delta: randomInt(rand, -1000, 2000) }
      : type === 'earning.approved' ? { amount: randomInt(rand, 10, 200) }
      : undefined,
    impersonationSessionId: type.startsWith('impersonate.') ? `imp_${String(i).padStart(4, '0')}` : undefined,
  }
})

export function getAuditEvents(): AdminAuditEvent[] {
  return SEEDED.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
}
