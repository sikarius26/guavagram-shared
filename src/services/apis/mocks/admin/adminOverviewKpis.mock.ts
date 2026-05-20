import { mulberry32, randomInt } from './_seed'

export interface OverviewKpis {
  gmvEur: number
  gmvDeltaPct: number
  mrrEur: number
  mrrDeltaPct: number
  activeUsers30d: number
  activeUsersDeltaPct: number
  pendingEarningsEur: number
  openDisputes: number
  pendingReviews: number
  openReports: number
  newStores30d: number
  newCreators30d: number
}

export interface SeriesPoint { label: string; value: number }
export interface SeriesMulti { label: string; values: number[] }

export interface OverviewSeries {
  registrationsByType: { labels: string[]; restaurant: number[]; creator: number[]; professional: number[] }
  revenueByPlan: { labels: string[]; free: number[]; pro: number[]; guava: number[]; guavaPlus: number[] }
  topCities: { city: string; gmv: number; stores: number }[]
  gmvSparkline: number[]
}

export function getOverviewKpis(): OverviewKpis {
  return {
    gmvEur: 128_430,
    gmvDeltaPct: 12.4,
    mrrEur: 28_560,
    mrrDeltaPct: 8.1,
    activeUsers30d: 5_842,
    activeUsersDeltaPct: 18.6,
    pendingEarningsEur: 4_213,
    openDisputes: 7,
    pendingReviews: 23,
    openReports: 4,
    newStores30d: 42,
    newCreators30d: 89,
  }
}

export function getOverviewSeries(): OverviewSeries {
  const rand = mulberry32(42)
  const labels = Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (11 - i))
    return d.toLocaleString('es', { month: 'short' })
  })

  return {
    registrationsByType: {
      labels,
      restaurant: labels.map(() => randomInt(rand, 8, 30)),
      creator: labels.map(() => randomInt(rand, 20, 90)),
      professional: labels.map(() => randomInt(rand, 2, 15)),
    },
    revenueByPlan: {
      labels,
      free: labels.map(() => 0),
      pro: labels.map(() => randomInt(rand, 8_000, 15_000)),
      guava: labels.map(() => randomInt(rand, 3_000, 7_000)),
      guavaPlus: labels.map(() => randomInt(rand, 1_500, 4_500)),
    },
    topCities: [
      { city: 'Madrid', gmv: 48_200, stores: 112 },
      { city: 'Barcelona', gmv: 38_900, stores: 94 },
      { city: 'Valencia', gmv: 15_400, stores: 41 },
      { city: 'Sevilla', gmv: 12_300, stores: 36 },
      { city: 'Bilbao', gmv: 8_700, stores: 22 },
      { city: 'Málaga', gmv: 6_100, stores: 18 },
    ],
    gmvSparkline: Array.from({ length: 30 }, () => randomInt(rand, 2_500, 6_500)),
  }
}
