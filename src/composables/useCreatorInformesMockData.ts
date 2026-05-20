import { computed, type Ref } from 'vue'
import type { DateRange } from './useDateRange'

// ─── Helpers (same deterministic pattern as useInformesMockData) ─────────────
const hashStr = (s: string) => {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}

const mulberry32 = (seed: number) => () => {
  let t = (seed += 0x6D2B79F5)
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const iterDays = (r: DateRange): Date[] => {
  const out: Date[] = []
  const cur = new Date(r.start); cur.setHours(0, 0, 0, 0)
  const end = new Date(r.end);   end.setHours(0, 0, 0, 0)
  while (cur <= end) { out.push(new Date(cur)); cur.setDate(cur.getDate() + 1) }
  return out
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

export interface KpiDelta { current: number; previous: number; deltaPct: number }

const mkDelta = (current: number, previous: number): KpiDelta => ({
  current,
  previous,
  deltaPct: previous === 0 ? 0 : Math.round(((current - previous) / previous) * 1000) / 10,
})

// Generates a value series with trend + noise, seed-driven for determinism
const genSeries = (seed: number, days: Date[], base: number, variance: number, drift = 0): number[] => {
  const rnd = mulberry32(seed)
  return days.map((_, i) => {
    const noise = (rnd() - 0.5) * 2 * variance
    const trend = (i / Math.max(1, days.length - 1)) * drift
    return Math.max(0, Math.round((base + noise + trend) * 100) / 100)
  })
}

// Cumulative (monotonic-ish) series — good for "followers" or "total earnings"
const genCumulativeSeries = (seed: number, days: Date[], start: number, growthPerDay: number, variance: number): number[] => {
  const rnd = mulberry32(seed)
  let acc = start
  return days.map(() => {
    const step = growthPerDay + (rnd() - 0.3) * variance
    acc = Math.max(start, acc + step)
    return Math.round(acc * 10) / 10
  })
}

// ─── Public composable ──────────────────────────────────────────────────────
export function useCreatorInformesMockData(
  creatorHandle: Ref<string>,
  range: Ref<DateRange>,
  previousRange: Ref<DateRange>
) {
  const baseSeed = computed(() => hashStr(creatorHandle.value || 'demo-creator'))

  const dayScale = computed(() => {
    const d = Math.max(1, Math.round((range.value.end.getTime() - range.value.start.getTime()) / 86400000) + 1)
    return d / 30
  })
  const prevDayScale = computed(() => {
    const d = Math.max(1, Math.round((previousRange.value.end.getTime() - previousRange.value.start.getTime()) / 86400000) + 1)
    return d / 30
  })

  // ═══════════════════════════════════════════════════════════════════════════
  //  AUDIENCE
  // ═══════════════════════════════════════════════════════════════════════════
  const followersSeries = computed(() => {
    const days = iterDays(range.value)
    return genCumulativeSeries(baseSeed.value + 1, days, 820, 7, 6)
  })
  const followersPrevSeries = computed(() => {
    const days = iterDays(previousRange.value)
    return genCumulativeSeries(baseSeed.value + 1001, days, 720, 4.5, 5)
  })

  const audienceKpis = computed(() => {
    const cur = followersSeries.value
    const prev = followersPrevSeries.value
    const totalFollowers = Math.round(cur[cur.length - 1] ?? 0)
    const prevTotal = Math.round(prev[prev.length - 1] ?? 0)
    const newFollowers = Math.round((cur[cur.length - 1] ?? 0) - (cur[0] ?? 0))
    const newFollowersPrev = Math.round((prev[prev.length - 1] ?? 0) - (prev[0] ?? 0))
    return {
      totalFollowers: mkDelta(totalFollowers, prevTotal),
      newFollowers:   mkDelta(newFollowers, newFollowersPrev),
      engagementRate: mkDelta(4.2, 3.9),
      monthlyReach:   mkDelta(Math.round(18400 * dayScale.value), Math.round(16400 * prevDayScale.value)),
    }
  })

  const audienceSources = computed(() => {
    const s = dayScale.value
    const ps = prevDayScale.value
    return [
      { label: 'Instagram bio',        value: Math.round(720 * s), previous: Math.round(610 * ps) },
      { label: 'TikTok perfil',        value: Math.round(540 * s), previous: Math.round(380 * ps) },
      { label: 'Compartidos directos', value: Math.round(310 * s), previous: Math.round(290 * ps) },
      { label: 'Búsqueda Guavagram',   value: Math.round(180 * s), previous: Math.round(145 * ps) },
      { label: 'Widget restaurante',   value: Math.round(90 * s),  previous: Math.round(45 * ps) },
    ]
  })

  const audienceDemographics = computed(() => {
    const total = audienceKpis.value.totalFollowers.current
    return [
      { label: '18-24', value: Math.round(total * 0.23), color: '#ff2d23' },
      { label: '25-34', value: Math.round(total * 0.37), color: '#f59e0b' },
      { label: '35-44', value: Math.round(total * 0.26), color: '#22c55e' },
      { label: '45-54', value: Math.round(total * 0.10), color: '#6366f1' },
      { label: '55+',   value: Math.round(total * 0.04), color: '#888' },
    ]
  })

  // ═══════════════════════════════════════════════════════════════════════════
  //  PICKS
  // ═══════════════════════════════════════════════════════════════════════════
  const picksClicksSeries = computed(() => {
    const days = iterDays(range.value)
    return genSeries(baseSeed.value + 2, days, 80, 35, 40).map(v => Math.round(v))
  })
  const picksClicksPrevSeries = computed(() => {
    const days = iterDays(previousRange.value)
    return genSeries(baseSeed.value + 1002, days, 55, 25, 25).map(v => Math.round(v))
  })

  const picksKpis = computed(() => {
    const curClicks = sum(picksClicksSeries.value)
    const prevClicks = sum(picksClicksPrevSeries.value)
    const impressions = Math.round(curClicks * 7.8)
    const prevImpressions = Math.round(prevClicks * 7.8)
    const bookings = Math.round(curClicks * 0.062)
    const prevBookings = Math.round(prevClicks * 0.062)
    const ctr = impressions > 0 ? Math.round((curClicks / impressions) * 1000) / 10 : 0
    const prevCtr = prevImpressions > 0 ? Math.round((prevClicks / prevImpressions) * 1000) / 10 : 0
    const bookRate = curClicks > 0 ? Math.round((bookings / curClicks) * 1000) / 10 : 0
    const prevBookRate = prevClicks > 0 ? Math.round((prevBookings / prevClicks) * 1000) / 10 : 0
    return {
      totalClicks: mkDelta(curClicks, prevClicks),
      ctrPct:      mkDelta(ctr, prevCtr),
      bookings:    mkDelta(bookings, prevBookings),
      bookRatePct: mkDelta(bookRate, prevBookRate),
      impressions: mkDelta(impressions, prevImpressions),
    }
  })

  const picksTop = computed(() => {
    const s = dayScale.value
    const ps = prevDayScale.value
    return [
      { label: 'Bodega Nova',   value: Math.round(340 * s), previous: Math.round(280 * ps) },
      { label: 'Casa Lola',     value: Math.round(285 * s), previous: Math.round(210 * ps) },
      { label: 'Kanoa Poke',    value: Math.round(220 * s), previous: Math.round(180 * ps) },
      { label: 'Tigre Dorado',  value: Math.round(180 * s), previous: Math.round(160 * ps) },
      { label: 'Pepe Tapas',    value: Math.round(145 * s), previous: Math.round(120 * ps) },
      { label: 'Brunch & Co',   value: Math.round(120 * s), previous: Math.round(95 * ps) },
    ]
  })

  const picksFunnel = computed(() => [
    { label: 'Impresiones', value: picksKpis.value.impressions.current, color: '#6366f1' },
    { label: 'Clicks',      value: picksKpis.value.totalClicks.current, color: '#f59e0b' },
    { label: 'Reservas',    value: picksKpis.value.bookings.current,    color: '#22c55e' },
  ])

  // ═══════════════════════════════════════════════════════════════════════════
  //  EARNINGS
  // ═══════════════════════════════════════════════════════════════════════════
  const earningsSeries = computed(() => {
    const days = iterDays(range.value)
    return genCumulativeSeries(baseSeed.value + 3, days, 0, 8.3, 2)
  })
  const earningsPrevSeries = computed(() => {
    const days = iterDays(previousRange.value)
    return genCumulativeSeries(baseSeed.value + 1003, days, 0, 5.7, 1.8)
  })

  const earningsKpis = computed(() => {
    const cur = earningsSeries.value[earningsSeries.value.length - 1] ?? 0
    const prev = earningsPrevSeries.value[earningsPrevSeries.value.length - 1] ?? 0
    const bookings = picksKpis.value.bookings.current
    const avgPerBooking = bookings > 0 ? Math.round((cur / bookings) * 100) / 100 : 0
    const prevBookings = picksKpis.value.bookings.previous
    const prevAvg = prevBookings > 0 ? Math.round((prev / prevBookings) * 100) / 100 : 0
    const claimsPending = Math.round(cur * 0.14 * 100) / 100
    const prevClaimsPending = Math.round(prev * 0.18 * 100) / 100
    const projection = Math.round(cur * (30 / Math.max(1, earningsSeries.value.length)) * 10) / 10
    const prevProjection = Math.round(prev * (30 / Math.max(1, earningsPrevSeries.value.length)) * 10) / 10
    return {
      total:          mkDelta(Math.round(cur * 100) / 100, Math.round(prev * 100) / 100),
      avgPerBooking:  mkDelta(avgPerBooking, prevAvg),
      claimsPending:  mkDelta(claimsPending, prevClaimsPending),
      projection:     mkDelta(projection, prevProjection),
    }
  })

  const earningsBreakdown = computed(() => {
    const total = earningsKpis.value.total.current
    return [
      { label: 'Comisión directa',    value: Math.round(total * 0.36 * 100) / 100, color: '#22c55e' },
      { label: 'Red L2 (afiliación)', value: Math.round(total * 0.50 * 100) / 100, color: '#8b5cf6' },
      { label: 'Claims validados',    value: Math.round(total * 0.14 * 100) / 100, color: '#f59e0b' },
    ]
  })

  const earningsTopRestaurants = computed(() => {
    const s = dayScale.value
    const ps = prevDayScale.value
    return [
      { label: 'Bodega Nova',  value: Math.round(38.5 * s * 10) / 10, previous: Math.round(28 * ps * 10) / 10 },
      { label: 'Casa Lola',    value: Math.round(28.2 * s * 10) / 10, previous: Math.round(22 * ps * 10) / 10 },
      { label: 'Kanoa Poke',   value: Math.round(19.8 * s * 10) / 10, previous: Math.round(18 * ps * 10) / 10 },
      { label: 'Tigre Dorado', value: Math.round(15.4 * s * 10) / 10, previous: Math.round(12 * ps * 10) / 10 },
      { label: 'Pepe Tapas',   value: Math.round(12.1 * s * 10) / 10, previous: Math.round(9 * ps * 10) / 10 },
      { label: 'Otros',        value: Math.round(10.5 * s * 10) / 10, previous: Math.round(8 * ps * 10) / 10 },
    ]
  })

  // ═══════════════════════════════════════════════════════════════════════════
  //  NETWORK (L2)
  // ═══════════════════════════════════════════════════════════════════════════
  const networkEarningsSeries = computed(() => {
    const days = iterDays(range.value)
    return genCumulativeSeries(baseSeed.value + 4, days, 0, 4.1, 1.2)
  })
  const networkEarningsPrevSeries = computed(() => {
    const days = iterDays(previousRange.value)
    return genCumulativeSeries(baseSeed.value + 1004, days, 0, 3.0, 1)
  })

  const networkKpis = computed(() => {
    const cur = networkEarningsSeries.value[networkEarningsSeries.value.length - 1] ?? 0
    const prev = networkEarningsPrevSeries.value[networkEarningsPrevSeries.value.length - 1] ?? 0
    const scale = dayScale.value
    const active = Math.round(5 * Math.min(1.3, scale))
    const prevActive = Math.round(4 * Math.min(1.3, prevDayScale.value))
    const total = Math.round(13 * Math.min(1.3, scale))
    const prevTotal = Math.round(9 * Math.min(1.3, prevDayScale.value))
    const conversionPct = total > 0 ? Math.round((active / total) * 1000) / 10 : 0
    const prevConv = prevTotal > 0 ? Math.round((prevActive / prevTotal) * 1000) / 10 : 0
    return {
      total:         mkDelta(Math.round(cur * 100) / 100, Math.round(prev * 100) / 100),
      activeInvitees: mkDelta(active, prevActive),
      totalInvitees:  mkDelta(total, prevTotal),
      conversionPct:  mkDelta(conversionPct, prevConv),
    }
  })

  const networkTopInvitees = computed(() => {
    const s = dayScale.value
    const ps = prevDayScale.value
    return [
      { label: '@luna_bites',        value: Math.round(28.4 * s * 10) / 10, previous: Math.round(18 * ps * 10) / 10 },
      { label: '@alex_foodie',       value: Math.round(15.2 * s * 10) / 10, previous: Math.round(12 * ps * 10) / 10 },
      { label: '@marta_gourmet',     value: Math.round(10.8 * s * 10) / 10, previous: Math.round(8 * ps * 10) / 10 },
      { label: '@josep_barcelona',   value: Math.round(5.4 * s * 10) / 10,  previous: Math.round(3 * ps * 10) / 10 },
      { label: '@clara_tapas',       value: Math.round(2.2 * s * 10) / 10,  previous: Math.round(1 * ps * 10) / 10 },
    ]
  })

  const networkInviteStatus = computed(() => {
    const { activeInvitees, totalInvitees } = networkKpis.value
    const registered = Math.max(0, totalInvitees.current - activeInvitees.current - 3)
    return [
      { label: 'Activos generando',    value: activeInvitees.current,        color: '#22c55e' },
      { label: 'Registrados',          value: registered,                    color: '#f59e0b' },
      { label: 'Invitados pendientes', value: 3,                             color: '#888' },
    ]
  })

  // ═══════════════════════════════════════════════════════════════════════════
  //  REVIEWS (written by creator)
  // ═══════════════════════════════════════════════════════════════════════════
  const reviewsVolumeSeries = computed(() => {
    const days = iterDays(range.value)
    return genCumulativeSeries(baseSeed.value + 5, days, 0, 0.45, 0.2).map(v => Math.round(v))
  })
  const reviewsVolumePrevSeries = computed(() => {
    const days = iterDays(previousRange.value)
    return genCumulativeSeries(baseSeed.value + 1005, days, 0, 0.30, 0.15).map(v => Math.round(v))
  })

  const reviewsKpis = computed(() => {
    const curTotal = reviewsVolumeSeries.value[reviewsVolumeSeries.value.length - 1] ?? 0
    const prevTotal = reviewsVolumePrevSeries.value[reviewsVolumePrevSeries.value.length - 1] ?? 0
    const verified = Math.round(curTotal * 0.71)
    const prevVerified = Math.round(prevTotal * 0.66)
    const verifiedPct = curTotal > 0 ? Math.round((verified / curTotal) * 100) : 0
    const prevVerifiedPct = prevTotal > 0 ? Math.round((prevVerified / prevTotal) * 100) : 0
    return {
      total:         mkDelta(curTotal, prevTotal),
      verifiedPct:   mkDelta(verifiedPct, prevVerifiedPct),
      avgRating:     mkDelta(4.4, 4.2),
      pendingClaims: mkDelta(Math.max(0, curTotal - verified - 1), Math.max(0, prevTotal - prevVerified - 1)),
    }
  })

  const reviewsStarsDistribution = computed(() => {
    const total = reviewsKpis.value.total.current
    const weights = [0.64, 0.21, 0.08, 0.05, 0.02]
    const colors  = ['#22c55e', '#84cc16', '#f59e0b', '#f97316', '#ef4444']
    return [5, 4, 3, 2, 1].map((s, i) => ({
      label: `${s} ★`,
      value: Math.round(total * weights[i]!),
      color: colors[i]!,
    }))
  })

  const reviewsClaimStatus = computed(() => {
    const total = reviewsKpis.value.total.current
    const verified = Math.round(total * 0.71)
    const pending = Math.max(0, reviewsKpis.value.pendingClaims.current)
    const rejected = Math.max(0, total - verified - pending)
    return [
      { label: 'Validadas',  value: verified, color: '#22c55e' },
      { label: 'Pendientes', value: pending,  color: '#f59e0b' },
      { label: 'Rechazadas', value: rejected, color: '#ef4444' },
    ]
  })

  return {
    // audience
    audience: {
      kpis: audienceKpis,
      followersSeries,
      followersPrevSeries,
      sources: audienceSources,
      demographics: audienceDemographics,
    },
    // picks
    picks: {
      kpis: picksKpis,
      clicksSeries: picksClicksSeries,
      clicksPrevSeries: picksClicksPrevSeries,
      topPicks: picksTop,
      funnel: picksFunnel,
    },
    // earnings
    earnings: {
      kpis: earningsKpis,
      series: earningsSeries,
      prevSeries: earningsPrevSeries,
      breakdown: earningsBreakdown,
      topRestaurants: earningsTopRestaurants,
    },
    // network
    network: {
      kpis: networkKpis,
      series: networkEarningsSeries,
      prevSeries: networkEarningsPrevSeries,
      topInvitees: networkTopInvitees,
      inviteStatus: networkInviteStatus,
    },
    // reviews
    reviews: {
      kpis: reviewsKpis,
      volumeSeries: reviewsVolumeSeries,
      volumePrevSeries: reviewsVolumePrevSeries,
      starsDistribution: reviewsStarsDistribution,
      claimStatus: reviewsClaimStatus,
    },
  }
}
