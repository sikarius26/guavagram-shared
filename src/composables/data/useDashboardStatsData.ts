// Restaurant dashboard KPI accessor. Calls the real backend overview
// endpoint and normalizes its payload into the display shape the home
// dashboard already consumes (display strings, sparkline series, deltas).
//
// Until the user has a storeId we return zeroed values so the dashboard
// can render its loading state without conditionals everywhere.

import { ref, watch, computed, type ComputedRef, type Ref } from 'vue'
import { dashboardApiClient } from '~/services/apis/api.client.dashboard'
import type { DashboardOverviewResponse } from '~/services/apis/models/dashboard-overview-response'
import type { DashboardKpiCard } from '~/services/apis/models/dashboard-kpi-card'
import { applyVerificationState } from '~/composables/useVerification'

export interface DashboardOverviewKpi {
  /** Pre-formatted human display ("1.2k", "87", "4.8"). */
  display: string
  /** Raw numeric value — useful for sorting / sparklines. */
  value: number
  /** Pre-formatted delta string ("+12.5%", "−3.2%") — undefined when no prior period to compare. */
  delta?: string
  /** Daily series for the sparkline. Length matches the requested window. */
  series: number[]
}

export interface DashboardOverview {
  profileViews: DashboardOverviewKpi
  ctaClicks: DashboardOverviewKpi
  fidelityCards: DashboardOverviewKpi
  avgRating: DashboardOverviewKpi
  plan: {
    currentPlanName?: string
    isPro: boolean
    upgradePlanId?: string
    upgradePlanName?: string
    proMonthlyPrice: number
    currency: string
    trialDays: number
  }
  loyalty: {
    membersDisplay: string
    membersCount: number
  }
  verification: {
    isVerified: boolean
    daysUntilHidden: number | null
  }
}

export interface UseDashboardStatsDataReturn {
  overview: ComputedRef<DashboardOverview>
  isLoading: ComputedRef<boolean>
  error: ComputedRef<Error | null>
  refresh: () => Promise<void>
}

// ─── Display helpers ────────────────────────────────────────────────
// Numbers compress to "1.2k", "12.3M" once they get past 1k so the cards
// never show a 7-digit string that breaks the layout.
const formatCompact = (n: number): string => {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  return n.toString()
}

const formatRating = (n: number): string => n > 0 ? n.toFixed(1) : '—'

const formatDelta = (deltaPercent: number | null | undefined): string | undefined => {
  if (deltaPercent == null) return undefined
  const sign = deltaPercent >= 0 ? '+' : ''
  return `${sign}${deltaPercent.toFixed(1)}%`
}

// Backend returns ISO codes; cards prefer the symbol (mock historically used '€').
const CURRENCY_SYMBOLS: Record<string, string> = { EUR: '€', USD: '$', GBP: '£' }
const currencySymbol = (iso?: string): string => CURRENCY_SYMBOLS[(iso || 'EUR').toUpperCase()] ?? (iso || '€')

const ratingFromCard = (card: DashboardKpiCard | undefined | null): DashboardOverviewKpi => ({
  display: formatRating(card?.value ?? 0),
  value: card?.value ?? 0,
  delta: formatDelta(card?.deltaPercent),
  series: card?.series ?? [],
})

const countFromCard = (card: DashboardKpiCard | undefined | null): DashboardOverviewKpi => ({
  display: formatCompact(card?.value ?? 0),
  value: card?.value ?? 0,
  delta: formatDelta(card?.deltaPercent),
  series: card?.series ?? [],
})

const EMPTY_KPI: DashboardOverviewKpi = { display: '0', value: 0, series: [] }
const EMPTY_OVERVIEW: DashboardOverview = {
  profileViews: EMPTY_KPI,
  ctaClicks: EMPTY_KPI,
  fidelityCards: EMPTY_KPI,
  avgRating: { display: '—', value: 0, series: [] },
  plan: { isPro: false, proMonthlyPrice: 0, currency: 'EUR', trialDays: 0 },
  loyalty: { membersDisplay: '0', membersCount: 0 },
  verification: { isVerified: false, daysUntilHidden: null },
}

const mapResponse = (res: DashboardOverviewResponse): DashboardOverview => ({
  profileViews: countFromCard(res.profileViews),
  ctaClicks: countFromCard(res.ctaClicks),
  fidelityCards: countFromCard(res.fidelityCards),
  avgRating: ratingFromCard(res.avgRating),
  plan: {
    currentPlanName: res.plan?.currentPlanName ?? undefined,
    isPro: res.plan?.isPro ?? false,
    upgradePlanId: res.plan?.upgradePlanId ?? undefined,
    upgradePlanName: res.plan?.upgradePlanName ?? undefined,
    proMonthlyPrice: res.plan?.upgradeMonthlyPrice ?? 0,
    currency: currencySymbol(res.plan?.currency ?? 'EUR'),
    trialDays: res.plan?.upgradeTrialDays ?? 0,
  },
  loyalty: {
    membersDisplay: formatCompact(res.loyaltyMembers ?? 0),
    membersCount: res.loyaltyMembers ?? 0,
  },
  verification: {
    isVerified: res.verification?.isVerified ?? false,
    daysUntilHidden: res.verification?.daysUntilHidden ?? null,
  },
})

export function useDashboardStatsData(
  storeId?: Ref<string> | (() => string),
  days = 30,
): UseDashboardStatsDataReturn {
  const idRef = typeof storeId === 'function' ? computed(storeId) : storeId

  const data = ref<DashboardOverview>(EMPTY_OVERVIEW)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const fetchOverview = async () => {
    const id = idRef?.value
    if (!id) { data.value = EMPTY_OVERVIEW; return }
    isLoading.value = true
    error.value = null
    try {
      const res = await dashboardApiClient.dashboardOverview(id, days)
      data.value = mapResponse(res)
      // Sync verification banner state with the same payload — avoids a
      // second round-trip just to know whether the store is verified.
      applyVerificationState({
        isVerified: res.verification?.isVerified ?? false,
        daysUntilHidden: res.verification?.daysUntilHidden ?? null,
      })
    } catch (e) {
      error.value = e as Error
      data.value = EMPTY_OVERVIEW
    } finally {
      isLoading.value = false
    }
  }

  // Fetch on mount and whenever the storeId changes.
  if (idRef) watch(idRef, fetchOverview, { immediate: true })
  else fetchOverview()

  return {
    overview: computed(() => data.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    refresh: fetchOverview,
  }
}
