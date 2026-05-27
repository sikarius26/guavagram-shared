// Unified entry point for admin data + mutations.
// Readers return reactive arrays from the central store so any mutation
// propagates to all consumers. Mutators update state AND log an audit event.

import { adminStore, appendAudit, countOpenReviews, countOpenDisputes, countPendingEarnings, countOpenReports } from '~/services/apis/mocks/admin/_store'
import { getOverviewKpis, getOverviewSeries } from '~/services/apis/mocks/admin/adminOverviewKpis.mock'
import { getNetworkRoot, getNetworkNode, getNetworkKpis } from '~/services/apis/mocks/admin/adminNetworkTree.mock'
import { getLeaderboard } from '~/services/apis/mocks/admin/adminLeaderboard.mock'
import {
  DEFAULT_COMMISSIONS, DEFAULT_GP_RULES, DEFAULT_PLANS,
  DEFAULT_CHALLENGES, DEFAULT_FEATURE_FLAGS, DEFAULT_JOBS_TAXONOMY,
  DEFAULT_TEAM, DEFAULT_REFERRAL_CONFIG,
} from '~/services/apis/mocks/admin/adminSettings.mock'
import type { StorePlan } from '~/services/apis/mocks/admin/adminStores.mock'
import type { AdminDispute, DisputeStatus } from '~/services/admin/types/admin-dispute'
import { useReviewDisputes, type ReviewDispute, type DisputeStatus as ReviewDisputeStatus } from '~/composables/useReviewDisputes'

// Map a real ReviewDispute (created by a restaurant in the dashboard) into the
// AdminDispute shape used by AdminDisputesPanel. Keeps a single source of truth
// for review claims while the broader admin panel keeps financial mocks.
const REVIEW_TO_ADMIN_STATUS: Record<ReviewDisputeStatus, DisputeStatus> = {
  none:                'open',
  disputed:            'awaiting_creator',
  under_review:        'in_review',
  resolved_creator:    'resolved_for_creator',
  resolved_restaurant: 'resolved_for_restaurant',
  dismissed:           'rejected',
}

function adaptReviewDispute(d: ReviewDispute): AdminDispute {
  const messages: AdminDispute['messages'] = [
    { at: d.createdAt, from: 'restaurant', authorLabel: d.storeName, text: d.restaurantExplanation },
  ]
  if (d.creatorDefense && d.creatorRespondedAt) {
    messages.push({
      at: d.creatorRespondedAt,
      from: 'creator',
      authorLabel: '@' + d.creatorHandle,
      text: d.creatorDefense,
    })
  }
  if (d.adminNotes && d.resolvedAt) {
    messages.push({
      at: d.resolvedAt,
      from: 'support',
      authorLabel: 'Soporte Guavagram',
      text: d.adminNotes,
    })
  }
  return {
    id: d.id,
    kind: 'review_claim',
    status: REVIEW_TO_ADMIN_STATUS[d.status],
    openedAt: d.createdAt,
    resolvedAt: d.resolvedAt,
    actorUserId: d.storeId,
    actorLabel: d.storeName,
    counterpartyUserId: d.creatorHandle,
    counterpartyLabel: '@' + d.creatorHandle,
    amountEur: 0,
    summary: `Reclamación sobre reseña de ${d.reviewRating ?? '?'}⭐ publicada por @${d.creatorHandle}`,
    messages,
    reviewClaim: {
      reviewId: d.reviewId,
      reviewRating: d.reviewRating ?? 0,
      reviewText: d.reviewText ?? '',
      reviewReceiptUrl: '',
      reviewPlacePhotoUrl: '',
      reviewAuthorId: d.creatorHandle,
      reviewAuthorHandle: d.creatorHandle,
      reviewPublishedAt: d.createdAt,
      restaurantClaim: {
        reasons: [d.reason],
        text: d.restaurantExplanation,
        evidenceUrls: [],
        submittedAt: d.createdAt,
      },
      creatorDefense: d.creatorDefense && d.creatorRespondedAt ? {
        text: d.creatorDefense,
        evidenceUrls: d.creatorEvidenceUrls ?? [],
        submittedAt: d.creatorRespondedAt,
      } : undefined,
    },
  }
}

function assertDev(name: string): void {
  if (!import.meta.dev) {
    throw new Error(`[useAdminMocks] ${name}() called outside dev mode`)
  }
}

const LS_COMMISSIONS = 'admin_settings_commissions'
const LS_GP = 'admin_settings_gp'
const LS_PLANS = 'admin_settings_plans'
const LS_CHALLENGES = 'admin_settings_challenges'
const LS_FLAGS = 'admin_settings_flags'
const LS_JOBS = 'admin_settings_jobs'
const LS_TEAM = 'admin_settings_team'
const LS_REFERRAL = 'admin_settings_referral'

function readLS<T>(key: string, fallback: T): T {
  if (typeof localStorage === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}
function writeLS<T>(key: string, value: T) {
  if (typeof localStorage === 'undefined') return
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

function planFee(plan: StorePlan): number {
  return plan === 'free' ? 0 : plan === 'pro' ? 49 : plan === 'guava' ? 89 : 149
}

export function useAdminMocks() {
  const reviewDisputes = useReviewDisputes()
  return {
    // ============ READERS (reactive) ============
    getStores: () => adminStore.stores,
    getStoreById: (id: string) => adminStore.stores.find(s => s.id === id) ?? null,
    getUsers: () => adminStore.users,
    getUserById: (id: string) => adminStore.users.find(u => u.id === id) ?? null,
    getCreators: () => adminStore.creators,
    getCreatorById: (id: string) => adminStore.creators.find(c => c.id === id) ?? null,
    getProfessionals: () => adminStore.professionals,
    getProfessionalById: (id: string) => adminStore.professionals.find(p => p.id === id) ?? null,
    getOffers: () => adminStore.offers,
    getOfferById: (id: string) => adminStore.offers.find(o => o.id === id) ?? null,
    getEarnings: () => adminStore.earnings,
    getEarningById: (id: string) => adminStore.earnings.find(e => e.id === id) ?? null,
    getPayouts: () => adminStore.payouts,
    // Merges seeded admin-platform disputes (financial + sample review_claims)
    // with the real review-claim disputes created by restaurants via the
    // dashboard. Both sources are reactive so admins see new disputes live.
    getDisputes: (): AdminDispute[] => [
      ...reviewDisputes.disputes.value.map(adaptReviewDispute),
      ...adminStore.disputes,
    ],
    getDisputeById: (id: string): AdminDispute | null => {
      const real = reviewDisputes.disputes.value.find(d => d.id === id)
      if (real) return adaptReviewDispute(real)
      return adminStore.disputes.find(d => d.id === id) ?? null
    },
    getReviewQueue: () => adminStore.reviewQueue,
    getUgcQueue: () => adminStore.ugcQueue,
    getReports: () => adminStore.reports,
    getAuditEvents: () => adminStore.auditEvents,

    // ============ STATIC READERS (not mutated) ============
    getOverviewKpis: () => { assertDev('getOverviewKpis'); return getOverviewKpis() },
    getOverviewSeries: () => { assertDev('getOverviewSeries'); return getOverviewSeries() },
    getNetworkRoot: () => { assertDev('getNetworkRoot'); return getNetworkRoot() },
    getNetworkNode: (userId: string) => { assertDev('getNetworkNode'); return getNetworkNode(userId) },
    getNetworkKpis: () => { assertDev('getNetworkKpis'); return getNetworkKpis() },
    getLeaderboard: (period: '30d' | 'all' = 'all') => { assertDev('getLeaderboard'); return getLeaderboard(period) },

    // ============ STORES ============
    updateStorePlan: (storeId: string, newPlan: StorePlan) => {
      const s = adminStore.stores.find(s => s.id === storeId)
      if (!s) return
      const from = s.plan
      s.plan = newPlan
      s.monthlyFeeEur = planFee(newPlan)
      appendAudit({
        type: 'store.plan_changed',
        targetId: s.id, targetLabel: s.name,
        payload: { from, to: newPlan },
      })
    },
    suspendStore: (storeId: string) => {
      const s = adminStore.stores.find(s => s.id === storeId)
      if (!s) return
      s.status = s.status === 'suspended' ? 'active' : 'suspended'
      appendAudit({
        type: 'store.suspended',
        targetId: s.id, targetLabel: s.name,
        payload: { status: s.status },
      })
    },

    // ============ USERS ============
    adjustUserGp: (userId: string, delta: number, reason?: string) => {
      const u = adminStore.users.find(u => u.id === userId)
      if (!u) return
      u.gpBalance = Math.max(0, u.gpBalance + delta)
      u.gpLifetime = Math.max(u.gpLifetime, u.gpLifetime + Math.max(0, delta))
      appendAudit({
        type: 'user.gp_adjusted',
        targetId: u.id, targetLabel: '@' + u.handle,
        payload: { delta, reason },
      })
    },
    suspendUser: (userId: string) => {
      const u = adminStore.users.find(u => u.id === userId)
      if (!u) return
      u.status = u.status === 'suspended' ? 'active' : 'suspended'
      appendAudit({
        type: 'user.suspended',
        targetId: u.id, targetLabel: '@' + u.handle,
        payload: { status: u.status },
      })
    },

    // ============ CREATORS ============
    verifyCreator: (creatorId: string) => {
      const c = adminStore.creators.find(c => c.id === creatorId)
      if (!c) return
      c.verified = true
      appendAudit({
        type: 'creator.verified',
        targetId: c.id, targetLabel: '@' + c.handle,
        payload: { contacts: c.contactsBrought },
      })
    },
    unverifyCreator: (creatorId: string) => {
      const c = adminStore.creators.find(c => c.id === creatorId)
      if (!c) return
      c.verified = false
      appendAudit({
        type: 'creator.unverified',
        targetId: c.id, targetLabel: '@' + c.handle,
      })
    },
    setCreatorCardVerified: (creatorId: string, value: boolean) => {
      const c = adminStore.creators.find(c => c.id === creatorId)
      if (!c) return
      c.cardVerified = value
      appendAudit({
        type: value ? 'creator.card_verified' : 'creator.card_unverified',
        targetId: c.id, targetLabel: '@' + c.handle,
      })
    },

    // ============ EARNINGS ============
    approveEarning: (earningId: string) => {
      const e = adminStore.earnings.find(e => e.id === earningId)
      if (!e || e.status !== 'pending') return
      e.status = 'approved'
      e.approvedAt = new Date().toISOString()
      appendAudit({
        type: 'earning.approved',
        targetId: e.id, targetLabel: `@${e.creatorHandle} · ${e.storeName}`,
        payload: { amount: e.amountEur },
      })
    },
    rejectEarning: (earningId: string, reason?: string) => {
      const e = adminStore.earnings.find(e => e.id === earningId)
      if (!e) return
      e.status = 'rejected'
      appendAudit({
        type: 'earning.rejected',
        targetId: e.id, targetLabel: `@${e.creatorHandle}`,
        payload: { amount: e.amountEur, reason },
      })
    },
    bulkApproveEarnings: (ids: string[]) => {
      let count = 0
      let amount = 0
      for (const id of ids) {
        const e = adminStore.earnings.find(e => e.id === id)
        if (e && e.status === 'pending') {
          e.status = 'approved'
          e.approvedAt = new Date().toISOString()
          count++
          amount += e.amountEur
        }
      }
      if (count > 0) {
        appendAudit({
          type: 'earning.approved',
          payload: { count, totalAmount: amount, bulk: true },
        })
      }
      return count
    },

    // ============ PAYOUTS ============
    executePayout: (payoutId: string) => {
      const p = adminStore.payouts.find(p => p.id === payoutId)
      if (!p) return
      if (p.status === 'pending') {
        p.status = 'in_transit'
      } else if (p.status === 'failed') {
        p.status = 'pending'
      }
      p.executedAt = new Date().toISOString()
      // Simulate Stripe callback 1.5s later
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          const pp = adminStore.payouts.find(x => x.id === payoutId)
          if (pp && pp.status === 'in_transit') pp.status = 'paid'
        }, 1500)
      }
      appendAudit({
        type: 'payout.executed',
        targetId: p.id, targetLabel: p.userLabel,
        actorRole: 'finance',
        payload: { amount: p.amountEur },
      })
    },

    // ============ DISPUTES ============
    resolveDispute: (disputeId: string, side: 'restaurant' | 'creator' | 'request_info', supportMessage?: string) => {
      // Real review-claim disputes (created from the restaurant dashboard) live
      // in useReviewDisputes. Delegate so the restaurant + creator UIs reflect
      // the resolution immediately.
      const real = reviewDisputes.disputes.value.find(d => d.id === disputeId)
      if (real) {
        if (side === 'request_info') return // not a terminal action for review claims
        reviewDisputes.resolve(disputeId, side === 'restaurant' ? 'restaurant' : 'creator', supportMessage)
        appendAudit({
          type: side === 'restaurant' ? 'review.rejected' : 'review.approved',
          actorRole: 'content_mod',
          targetId: real.id, targetLabel: `${real.storeName} vs @${real.creatorHandle}`,
          payload: { side, kind: 'review_claim' },
        })
        return
      }

      const d = adminStore.disputes.find(d => d.id === disputeId)
      if (!d) return
      const now = new Date().toISOString()

      if (side === 'request_info') {
        d.status = d.messages.some(m => m.from === 'creator') ? 'awaiting_restaurant' : 'awaiting_creator'
      } else {
        d.status = side === 'restaurant' ? 'resolved_for_restaurant' : 'resolved_for_creator' as DisputeStatus
        d.resolvedAt = now
      }

      d.messages.push({
        at: now,
        from: 'support',
        authorLabel: 'Soporte Guavagram',
        text: supportMessage || (side === 'request_info'
          ? 'Necesitamos más pruebas antes de tomar una decisión.'
          : side === 'restaurant'
          ? 'Retiramos la reseña / resolvemos a favor del restaurante.'
          : 'Mantenemos la reseña / resolvemos a favor del creator.'),
      })

      appendAudit({
        type: side === 'restaurant' ? 'review.rejected'
          : side === 'creator' ? 'review.approved'
          : 'dispute.resolved',
        actorRole: 'content_mod',
        targetId: d.id, targetLabel: d.summary,
        payload: { side, kind: d.kind },
      })
    },

    // ============ MODERATION ============
    approveReview: (reviewId: string) => {
      const r = adminStore.reviewQueue.find(r => r.id === reviewId)
      if (!r) return
      r.status = 'approved'
      r.decidedAt = new Date().toISOString()
      // Auto-affiliate the user
      const u = adminStore.users.find(u => u.id === r.userId)
      if (u) {
        u.affiliate = true
        u.verified = true
      }
      // Remove from pending queue (mark as processed)
      adminStore.reviewQueue = adminStore.reviewQueue.filter(x => x.id !== reviewId)
      appendAudit({
        type: 'review.approved',
        actorRole: 'content_mod',
        targetId: r.id, targetLabel: r.userLabel,
        payload: { storeLabel: r.storeLabel, autoAffiliate: true },
      })
    },
    rejectReview: (reviewId: string, reason: string) => {
      const r = adminStore.reviewQueue.find(r => r.id === reviewId)
      if (!r) return
      r.status = 'rejected'
      r.decidedAt = new Date().toISOString()
      r.rejectionReason = reason
      adminStore.reviewQueue = adminStore.reviewQueue.filter(x => x.id !== reviewId)
      appendAudit({
        type: 'review.rejected',
        actorRole: 'content_mod',
        targetId: r.id, targetLabel: r.userLabel,
        payload: { reason },
      })
    },
    hideUgc: (ugcId: string) => {
      const item = adminStore.ugcQueue.find(u => u.id === ugcId)
      if (!item) return
      item.status = 'rejected'
      adminStore.ugcQueue = adminStore.ugcQueue.filter(x => x.id !== ugcId)
      appendAudit({
        type: 'ugc.hidden',
        actorRole: 'content_mod',
        targetId: item.id, targetLabel: '@' + item.authorHandle,
      })
    },
    approveUgc: (ugcId: string) => {
      const item = adminStore.ugcQueue.find(u => u.id === ugcId)
      if (!item) return
      item.status = 'approved'
      adminStore.ugcQueue = adminStore.ugcQueue.filter(x => x.id !== ugcId)
    },
    resolveReport: (reportId: string) => {
      const r = adminStore.reports.find(x => x.id === reportId)
      if (!r) return
      r.status = 'resolved'
      r.resolvedAt = new Date().toISOString()
      appendAudit({
        type: 'report.resolved',
        actorRole: 'content_mod',
        targetId: r.id, targetLabel: r.targetLabel,
      })
    },

    // ============ HIRING ============
    approveOffer: (offerId: string) => {
      const o = adminStore.offers.find(o => o.id === offerId)
      if (!o) return
      o.status = 'open'
      appendAudit({
        type: 'hiring.offer_approved',
        actorRole: 'ops',
        targetId: o.id, targetLabel: `${o.role} @ ${o.storeName}`,
      })
    },
    closeOffer: (offerId: string) => {
      const o = adminStore.offers.find(o => o.id === offerId)
      if (!o) return
      o.status = 'closed'
      o.closedAt = new Date().toISOString()
      o.platformCommissionEur = Math.round((o.salaryEur * o.platformCommissionPct) / 100)
      appendAudit({
        type: 'hiring.closed',
        actorRole: 'ops',
        targetId: o.id, targetLabel: `${o.role} @ ${o.storeName}`,
        payload: { commission: o.platformCommissionEur },
      })
    },

    // ============ COUNTERS (reactive helpers for sidebar) ============
    countOpenReviews, countOpenDisputes, countPendingEarnings, countOpenReports,

    // ============ SETTINGS (persist to dedicated localStorage keys) ============
    getCommissions: () => readLS(LS_COMMISSIONS, DEFAULT_COMMISSIONS),
    saveCommissions: (v: any) => {
      writeLS(LS_COMMISSIONS, { ...v, updatedAt: new Date().toISOString() })
      appendAudit({ type: 'settings.commissions_updated', actorRole: 'finance', payload: { peak: v.peak } })
    },
    getGpRules: () => readLS(LS_GP, DEFAULT_GP_RULES),
    saveGpRules: (v: any) => {
      writeLS(LS_GP, { ...v, updatedAt: new Date().toISOString() })
      appendAudit({ type: 'settings.gp_updated', actorRole: 'finance' })
    },
    getPlans: () => readLS(LS_PLANS, DEFAULT_PLANS),
    savePlans: (v: any) => {
      writeLS(LS_PLANS, v)
      appendAudit({ type: 'settings.plans_updated', actorRole: 'super_admin' })
    },
    getChallenges: () => readLS(LS_CHALLENGES, DEFAULT_CHALLENGES),
    saveChallenges: (v: any) => writeLS(LS_CHALLENGES, v),
    getFeatureFlags: () => readLS(LS_FLAGS, DEFAULT_FEATURE_FLAGS),
    saveFeatureFlags: (v: any) => writeLS(LS_FLAGS, v),
    getJobsTaxonomy: () => readLS(LS_JOBS, DEFAULT_JOBS_TAXONOMY),
    saveJobsTaxonomy: (v: any) => writeLS(LS_JOBS, v),
    getTeam: () => readLS(LS_TEAM, DEFAULT_TEAM),
    saveTeam: (v: any) => writeLS(LS_TEAM, v),
    getReferralConfig: () => readLS(LS_REFERRAL, DEFAULT_REFERRAL_CONFIG),
    saveReferralConfig: (v: any) => {
      writeLS(LS_REFERRAL, { ...v, updatedAt: new Date().toISOString() })
      appendAudit({ type: 'settings.referrals_updated', actorRole: 'super_admin', payload: { bonus: v.referralBonus, active: v.isActive } })
    },
  }
}
