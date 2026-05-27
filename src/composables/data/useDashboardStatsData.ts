// Restaurant dashboard KPI accessor. Wires the home cards to the real
// Platform endpoints — we deliberately fetch from three different sources
// instead of waiting for a single `/dashboard/overview` endpoint that
// doesn't exist yet:
//
//   - avgRating         ← storeprofileReviewsSummary  (per-period or all-time)
//   - vouchersRedeemed  ← campaignSummary.totalVouchersRedeemed
//   - loyaltyMembers    ← customerRecap.totalCustomers (best available
//                         proxy — there's no dedicated "loyalty enrollment
//                         count" endpoint, and totalCustomers represents the
//                         universe of identified customers in the store)
//
// profileViews and ctaClicks have NO Platform endpoint. The home renders
// upgrade CTAs in those slots; this composable does not return them.
// When/if the Platform adds a bio-analytics endpoint, extend `Overview`
// and add a fourth fetch alongside the others.

import { ref, watch, computed, type ComputedRef, type Ref } from 'vue'
import { storeProfileApiClient } from '~/services/apis/api.client.storeprofile'
import { customerApiClient } from '~/services/apis/api.client.customer'
import { campaignApiClient } from '~/services/apis/api.client.campaign'

export interface DashboardOverviewKpi {
  /** Pre-formatted human display ("1.2k", "87", "4.8"). */
  display: string
  /** Raw numeric value — useful for sorting / sparklines. */
  value: number
}

export interface DashboardOverview {
  avgRating: DashboardOverviewKpi
  vouchersRedeemed: DashboardOverviewKpi
  loyalty: {
    membersDisplay: string
    membersCount: number
  }
}

export interface UseDashboardStatsDataReturn {
  overview: ComputedRef<DashboardOverview>
  isLoading: ComputedRef<boolean>
  error: ComputedRef<Error | null>
  refresh: () => Promise<void>
}

// ─── Display helpers ────────────────────────────────────────────────
const formatCompact = (n: number): string => {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  return n.toString()
}

const formatRating = (n: number): string => n > 0 ? n.toFixed(1) : '—'

const EMPTY_OVERVIEW: DashboardOverview = {
  avgRating: { display: '—', value: 0 },
  vouchersRedeemed: { display: '0', value: 0 },
  loyalty: { membersDisplay: '0', membersCount: 0 },
}

export function useDashboardStatsData(
  storeId?: Ref<string> | (() => string),
): UseDashboardStatsDataReturn {
  const idRef = typeof storeId === 'function' ? computed(storeId) : storeId

  const data = ref<DashboardOverview>(EMPTY_OVERVIEW)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  // Each endpoint can fail independently — wrap each in its own catch so a
  // 404 on, say, campaignSummary doesn't blank out the rating card too.
  const fetchAll = async () => {
    const id = idRef?.value
    if (!id) { data.value = EMPTY_OVERVIEW; return }
    isLoading.value = true
    error.value = null
    try {
      const [reviewsRes, recapRes, campaignsRes] = await Promise.allSettled([
        storeProfileApiClient.storeprofileReviewsSummary(id, null, null),
        customerApiClient.customerRecap(id),
        campaignApiClient.campaignSummary(id),
      ])

      const avg = reviewsRes.status === 'fulfilled' ? (reviewsRes.value?.avgOverall ?? 0) : 0
      const totalCustomers = recapRes.status === 'fulfilled' ? (recapRes.value?.totalCustomers ?? 0) : 0
      const redeemed = campaignsRes.status === 'fulfilled' ? (campaignsRes.value?.totalVouchersRedeemed ?? 0) : 0

      data.value = {
        avgRating: { display: formatRating(avg), value: avg },
        vouchersRedeemed: { display: formatCompact(redeemed), value: redeemed },
        loyalty: { membersDisplay: formatCompact(totalCustomers), membersCount: totalCustomers },
      }

      // Surface any of the individual rejections as a soft error so the UI
      // can show a stale-data hint if needed. Not blocking — partial data is
      // still useful.
      const firstFailure = [reviewsRes, recapRes, campaignsRes].find(r => r.status === 'rejected')
      if (firstFailure && firstFailure.status === 'rejected') {
        error.value = firstFailure.reason as Error
      }
    } catch (e) {
      error.value = e as Error
      data.value = EMPTY_OVERVIEW
    } finally {
      isLoading.value = false
    }
  }

  if (idRef) watch(idRef, fetchAll, { immediate: true })
  else fetchAll()

  return {
    overview: computed(() => data.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    refresh: fetchAll,
  }
}
