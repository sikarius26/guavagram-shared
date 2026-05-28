// Restaurant dashboard KPI accessor. Wires the home cards to the real
// Platform endpoints (rating, vouchers, customers) PLUS the local Nitro
// tracker (profile views + CTA clicks) — Platform doesn't expose a bio
// analytics endpoint yet, so we keep that tracking in-house via the
// /api/track/{slug}/summary route and fold it into the same overview.
//
//   - avgRating         ← storeprofileReviewsSummary  (per-period or all-time)
//   - vouchersRedeemed  ← campaignSummary.totalVouchersRedeemed
//   - loyaltyMembers    ← customerRecap.totalCustomers (best available
//                         proxy — there's no dedicated "loyalty enrollment
//                         count" endpoint)
//   - profileViews      ← /api/track/{slug}/summary.profileViews
//   - ctaClicks         ← /api/track/{slug}/summary.ctaClicks
//
// When Platform exposes a real bio-analytics endpoint, swap the local
// tracker fetch for that call — the rest of the composable stays the same.

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
  profileViews: DashboardOverviewKpi
  ctaClicks: DashboardOverviewKpi
  ctaByType: Record<string, number>
  bySourceType: Record<string, number>
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
  profileViews: { display: '—', value: 0 },
  ctaClicks: { display: '—', value: 0 },
  ctaByType: {},
  bySourceType: {},
  loyalty: { membersDisplay: '0', membersCount: 0 },
}

// Local tracking summary shape — mirror of `server/utils/tracking.ts.TrackingSummary`.
// `profileViews` is the deduped session count; `pageViewsRaw` is the total
// event count (engagement signal). We show `profileViews` on the home KPI
// because "Visitas al perfil" reads naturally as unique visits.
interface TrackingSummary {
  profileViews: number
  pageViewsRaw?: number
  uniqueVisitors?: number
  ctaClicks: number
  ctaByType: Record<string, number>
  bySourceType: Record<string, number>
}

export function useDashboardStatsData(
  storeId?: Ref<string> | (() => string),
  slug?: Ref<string> | (() => string),
): UseDashboardStatsDataReturn {
  const idRef = typeof storeId === 'function' ? computed(storeId) : storeId
  const slugRef = typeof slug === 'function' ? computed(slug) : slug

  const data = ref<DashboardOverview>(EMPTY_OVERVIEW)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  // Each endpoint can fail independently — wrap each in its own catch so a
  // 404 on, say, campaignSummary doesn't blank out the rating card too.
  const fetchAll = async () => {
    const id = idRef?.value
    const s = slugRef?.value
    if (!id && !s) { data.value = EMPTY_OVERVIEW; return }
    isLoading.value = true
    error.value = null
    try {
      // The tracking summary lives on the local Nitro (same workspace file
      // both apps share). Skipped when no slug is in scope — admin pages
      // that only know storeId still get the other 3 KPIs.
      const trackingFetch: Promise<TrackingSummary | null> = s
        ? (typeof fetch !== 'undefined'
            ? fetch(`/api/track/${encodeURIComponent(s)}/summary`).then(r => r.ok ? r.json() : null).catch(() => null)
            : Promise.resolve(null))
        : Promise.resolve(null)

      const [reviewsRes, recapRes, campaignsRes, trackingRes] = await Promise.allSettled([
        id ? storeProfileApiClient.storeprofileReviewsSummary(id, null, null) : Promise.resolve(null as any),
        id ? customerApiClient.customerRecap(id)                              : Promise.resolve(null as any),
        id ? campaignApiClient.campaignSummary(id)                            : Promise.resolve(null as any),
        trackingFetch,
      ])

      const avg = reviewsRes.status === 'fulfilled' ? (reviewsRes.value?.avgOverall ?? 0) : 0
      const totalCustomers = recapRes.status === 'fulfilled' ? (recapRes.value?.totalCustomers ?? 0) : 0
      const redeemed = campaignsRes.status === 'fulfilled' ? (campaignsRes.value?.totalVouchersRedeemed ?? 0) : 0
      const tracking = trackingRes.status === 'fulfilled' ? (trackingRes.value as TrackingSummary | null) : null

      const views = tracking?.profileViews ?? 0
      const clicks = tracking?.ctaClicks ?? 0

      data.value = {
        avgRating: { display: formatRating(avg), value: avg },
        vouchersRedeemed: { display: formatCompact(redeemed), value: redeemed },
        // "—" until at least one event lands — avoids painting a misleading
        // "0" on stores that haven't been visited yet.
        profileViews: { display: views > 0 ? formatCompact(views) : '—', value: views },
        ctaClicks:    { display: clicks > 0 ? formatCompact(clicks) : '—', value: clicks },
        ctaByType:    tracking?.ctaByType ?? {},
        bySourceType: tracking?.bySourceType ?? {},
        loyalty: { membersDisplay: formatCompact(totalCustomers), membersCount: totalCustomers },
      }

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

  if (idRef || slugRef) watch([idRef, slugRef].filter(Boolean) as any, fetchAll, { immediate: true })
  else fetchAll()

  return {
    overview: computed(() => data.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    refresh: fetchAll,
  }
}
