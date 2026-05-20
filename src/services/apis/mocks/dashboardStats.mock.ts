// Dashboard "home" KPI fixtures used by `pages/dashboard.vue`. Each KPI
// future-maps to a metric returned by the dashboard overview endpoint.
//
// Future API contract (suggested):
//   GET /api/store/{id}/dashboard/overview →
//     { profileViews, ctaClicks, vouchersRedeemed, avgRating, plan, loyaltyMembers }

export interface MockDashboardKpi {
  /** Display value as already humanized (e.g. "1.2k") */
  display: string
  /** Raw numeric value for sparkline / sorting */
  value: number
  /** Optional delta vs previous period (e.g. "+12.5%", "+3") */
  delta?: string
}

export interface MockDashboardOverview {
  profileViews: MockDashboardKpi
  ctaClicks: MockDashboardKpi
  vouchersRedeemed: MockDashboardKpi
  avgRating: MockDashboardKpi
  plan: {
    proMonthlyPrice: number
    currency: string
    trialDays: number
  }
  loyalty: {
    membersDisplay: string
    membersCount: number
  }
}

const OVERVIEW: MockDashboardOverview = {
  profileViews:     { display: '1.2k', value: 1200, delta: '+12.5%' },
  ctaClicks:        { display: '87',   value: 87,   delta: '+5.2%'  },
  vouchersRedeemed: { display: '12',   value: 12 },
  avgRating:        { display: '4.8',  value: 4.8,  delta: '+3'     },
  plan: {
    proMonthlyPrice: 99,
    currency: '€',
    trialDays: 30,
  },
  loyalty: {
    membersDisplay: '+2.4k',
    membersCount: 2400,
  },
}

export function getMockDashboardOverview(_storeId?: string): MockDashboardOverview {
  return OVERVIEW
}
