// Central reactive admin store. All admin panels read/write through this
// module so actions (approve, execute, resolve, verify, suspend...) mutate
// state and propagate automatically via Vue reactivity.
//
// Persistence: any change is auto-saved to localStorage (debounced 300ms).
// On load, the stored snapshot is restored — if none exists, seed generators
// run from the *.mock.ts files to build initial deterministic data.

import { reactive, watch } from 'vue'
import { getStores as seedStores, type AdminStoreRow } from './adminStores.mock'
import { getUsers as seedUsers, type AdminUserRow } from './adminUsers.mock'
import { getCreators as seedCreators, type AdminCreatorRow } from './adminCreators.mock'
import { getProfessionals as seedProfessionals, type AdminProfessionalRow } from './adminProfessionals.mock'
import { getOffers as seedOffers, type AdminHiringOffer } from './adminHiring.mock'
import { getEarnings as seedEarnings, type AdminEarningRow } from './adminEarnings.mock'
import { getPayouts as seedPayouts } from './adminPayouts.mock'
import { getDisputes as seedDisputes } from './adminDisputes.mock'
import { getReviewQueue as seedReviewQueue, getUgcQueue as seedUgcQueue, getReports as seedReports } from './adminModeration.mock'
import { getAuditEvents as seedAudit } from './adminAudit.mock'
import type { AdminPayout } from '~/services/admin/types/admin-payout'
import type { AdminDispute, DisputeStatus } from '~/services/admin/types/admin-dispute'
import type { AdminReviewItem, AdminUgcItem, AdminReportItem } from '~/services/admin/types/admin-moderation-item'
import type { AdminAuditEvent, AuditEventType } from '~/services/admin/types/admin-audit-event'
import { useReviewDisputes } from '~/composables/useReviewDisputes'

export interface AdminStoreState {
  stores: AdminStoreRow[]
  users: AdminUserRow[]
  creators: AdminCreatorRow[]
  professionals: AdminProfessionalRow[]
  offers: AdminHiringOffer[]
  earnings: AdminEarningRow[]
  payouts: AdminPayout[]
  disputes: AdminDispute[]
  reviewQueue: AdminReviewItem[]
  ugcQueue: AdminUgcItem[]
  reports: AdminReportItem[]
  auditEvents: AdminAuditEvent[]
  schemaVersion: number
}

const STORE_KEY = 'admin_store_v1'
const SCHEMA_VERSION = 1

function freshSeed(): AdminStoreState {
  return {
    stores: JSON.parse(JSON.stringify(seedStores())),
    users: JSON.parse(JSON.stringify(seedUsers())),
    creators: JSON.parse(JSON.stringify(seedCreators())),
    professionals: JSON.parse(JSON.stringify(seedProfessionals())),
    offers: JSON.parse(JSON.stringify(seedOffers())),
    earnings: JSON.parse(JSON.stringify(seedEarnings())),
    payouts: JSON.parse(JSON.stringify(seedPayouts())),
    disputes: JSON.parse(JSON.stringify(seedDisputes())),
    reviewQueue: JSON.parse(JSON.stringify(seedReviewQueue())),
    ugcQueue: JSON.parse(JSON.stringify(seedUgcQueue())),
    reports: JSON.parse(JSON.stringify(seedReports())),
    auditEvents: JSON.parse(JSON.stringify(seedAudit())),
    schemaVersion: SCHEMA_VERSION,
  }
}

function loadInitialState(): AdminStoreState {
  if (typeof localStorage === 'undefined') return freshSeed()
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AdminStoreState>
      if (parsed && parsed.schemaVersion === SCHEMA_VERSION && Array.isArray(parsed.stores)) {
        return parsed as AdminStoreState
      }
    }
  } catch {}
  return freshSeed()
}

export const adminStore = reactive<AdminStoreState>(loadInitialState())

let saveTimer: ReturnType<typeof setTimeout> | null = null
if (typeof window !== 'undefined') {
  watch(adminStore, () => {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(adminStore)) } catch {}
    }, 300)
  }, { deep: true })
}

export function resetAdminStore() {
  const fresh = freshSeed()
  Object.assign(adminStore, fresh)
  try { localStorage.removeItem(STORE_KEY) } catch {}
}

// -------- Audit logging helper --------

let auditCounter = 0
export function appendAudit(entry: {
  type: AuditEventType
  actorId?: string
  actorEmail?: string
  actorRole?: string
  targetId?: string
  targetLabel?: string
  payload?: Record<string, unknown>
  impersonationSessionId?: string
}) {
  const event: AdminAuditEvent = {
    id: `aud_live_${Date.now()}_${auditCounter++}`,
    at: new Date().toISOString(),
    actorId: entry.actorId ?? 'adm_01',
    actorEmail: entry.actorEmail ?? 'pau.artiso@guavapp.com',
    actorRole: entry.actorRole ?? 'super_admin',
    type: entry.type,
    targetId: entry.targetId,
    targetLabel: entry.targetLabel,
    payload: entry.payload,
    impersonationSessionId: entry.impersonationSessionId,
  }
  adminStore.auditEvents.unshift(event)
}

// Helper to re-derive sidebar badge counts reactively
export function countOpenReviews(): number {
  return adminStore.reviewQueue.filter(r => r.status === 'pending').length
}
export function countOpenDisputes(): number {
  const seeded = adminStore.disputes.filter(d =>
    d.status === 'open' || d.status === 'in_review' ||
    d.status === 'awaiting_creator' || d.status === 'awaiting_restaurant'
  ).length
  // Include real review disputes (created by restaurants in their dashboard).
  const real = useReviewDisputes().disputes.value.filter(d =>
    d.status === 'disputed' || d.status === 'under_review'
  ).length
  return seeded + real
}
export function countPendingEarnings(): number {
  return adminStore.earnings.filter(e => e.status === 'pending').length
}
export function countOpenReports(): number {
  return adminStore.reports.filter(r => r.status === 'open').length
}
