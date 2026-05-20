import { computed, type Ref } from 'vue'
import type { DateRange } from './useDateRange'

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

export interface Series { dates: Date[]; values: number[] }
export interface KpiDelta { current: number; previous: number; deltaPct: number }

const mkDelta = (current: number, previous: number): KpiDelta => ({
  current,
  previous,
  deltaPct: previous === 0 ? 0 : Math.round(((current - previous) / previous) * 100),
})

const genSeries = (seed: number, days: Date[], base: number, variance: number, drift = 0): Series => {
  const rnd = mulberry32(seed)
  const values = days.map((_, i) => {
    const noise = (rnd() - 0.5) * 2 * variance
    const trend = (i / Math.max(1, days.length - 1)) * drift
    return Math.max(0, Math.round((base + noise + trend) * 100) / 100)
  })
  return { dates: days, values }
}

export function useInformesMockData(storeId: Ref<string>, range: Ref<DateRange>, previousRange: Ref<DateRange>) {
  const baseSeed = computed(() => hashStr(storeId.value || 'demo'))

  // Day-count scale factors (all per-30-day baselines scale with range size)
  const dayScale = computed(() => {
    const d = Math.max(1, Math.round((range.value.end.getTime() - range.value.start.getTime()) / 86400000) + 1)
    return d / 30
  })
  const prevDayScale = computed(() => {
    const d = Math.max(1, Math.round((previousRange.value.end.getTime() - previousRange.value.start.getTime()) / 86400000) + 1)
    return d / 30
  })

  // ─── Reviews ──────────────────────────────────────────────────────
  const reviewsSeries = computed(() => {
    const days = iterDays(range.value)
    return {
      rating: genSeries(baseSeed.value + 1, days, 4.5, 0.25),
      volume: genSeries(baseSeed.value + 2, days, 3.2, 2.5, 1.2).values.map(v => Math.round(v)),
      dates: days,
    }
  })

  const reviewsPrevSeries = computed(() => {
    const days = iterDays(previousRange.value)
    return {
      rating: genSeries(baseSeed.value + 1001, days, 4.35, 0.28),
      volume: genSeries(baseSeed.value + 1002, days, 2.7, 2.2).values.map(v => Math.round(v)),
      dates: days,
    }
  })

  const reviewsKpis = computed(() => {
    const curRating = Math.round((sum(reviewsSeries.value.rating.values) / reviewsSeries.value.rating.values.length) * 10) / 10
    const prevRating = Math.round((sum(reviewsPrevSeries.value.rating.values) / reviewsPrevSeries.value.rating.values.length) * 10) / 10
    const curVol = sum(reviewsSeries.value.volume)
    const prevVol = sum(reviewsPrevSeries.value.volume)
    return {
      rating:         mkDelta(curRating, prevRating),
      newReviews:     mkDelta(curVol, prevVol),
      verifiedPct:    mkDelta(87, 82),
      responseHours:  mkDelta(6.4, 9.1),
      respondedPct:   mkDelta(92, 85),
    }
  })

  const starsDistribution = computed(() => {
    const rnd = mulberry32(baseSeed.value + 10)
    const total = reviewsKpis.value.newReviews.current
    const weights = [0.62, 0.22, 0.09, 0.04, 0.03]
    return [5, 4, 3, 2, 1].map((s, i) => ({
      stars: s,
      current:  Math.max(0, Math.round(total * weights[i]! + (rnd() - 0.5) * 2)),
      previous: Math.max(0, Math.round(reviewsKpis.value.newReviews.previous * weights[i]! + (rnd() - 0.5) * 2)),
    }))
  })

  const reviewSources = computed(() => {
    const total = reviewsKpis.value.newReviews.current
    return [
      { label: 'Guavagram', value: Math.round(total * 0.72), color: '#ff2d23' },
      { label: 'Google',    value: total - Math.round(total * 0.72), color: '#4285f4' },
    ]
  })

  const reviewTopicsPositive = computed(() => {
    const rnd = mulberry32(baseSeed.value + 20)
    return [
      { key: 'atencion',     label: 'Atención',           count: 18 + Math.floor(rnd() * 8) },
      { key: 'calidad',      label: 'Calidad ingredientes', count: 15 + Math.floor(rnd() * 7) },
      { key: 'ambiente',     label: 'Ambiente',           count: 12 + Math.floor(rnd() * 6) },
      { key: 'postres',      label: 'Postres',            count: 10 + Math.floor(rnd() * 5) },
      { key: 'rel-calidad',  label: 'Relación calidad-precio', count: 8 + Math.floor(rnd() * 4) },
      { key: 'familia',      label: 'Familiar',           count: 7 + Math.floor(rnd() * 4) },
      { key: 'romantic',     label: 'Romántico',          count: 5 + Math.floor(rnd() * 3) },
      { key: 'tasting',      label: 'Menú degustación',   count: 4 + Math.floor(rnd() * 3) },
    ].sort((a, b) => b.count - a.count)
  })

  const reviewTopicsNegative = computed(() => {
    const rnd = mulberry32(baseSeed.value + 21)
    return [
      { key: 'espera',       label: 'Tiempo de espera',    count: 7 + Math.floor(rnd() * 4) },
      { key: 'precio',       label: 'Precio alto',         count: 5 + Math.floor(rnd() * 3) },
      { key: 'ruido',        label: 'Ruido',               count: 4 + Math.floor(rnd() * 3) },
      { key: 'cuenta',       label: 'Cuenta tardó',        count: 3 + Math.floor(rnd() * 2) },
      { key: 'raciones',     label: 'Raciones pequeñas',   count: 3 + Math.floor(rnd() * 2) },
      { key: 'reserva',      label: 'Problemas reserva',   count: 2 + Math.floor(rnd() * 2) },
      { key: 'temperatura',  label: 'Comida fría',         count: 2 + Math.floor(rnd() * 2) },
      { key: 'aparcamiento', label: 'Aparcamiento',        count: 1 + Math.floor(rnd() * 2) },
    ].sort((a, b) => b.count - a.count)
  })

  const reviewMediaTypes = computed(() => ([
    { key: 'photo-food',     label: 'Fotos · Comida',    count: 48, color: '#0ea5e9', kind: 'photo' },
    { key: 'photo-interior', label: 'Fotos · Interior',  count: 21, color: '#0ea5e9', kind: 'photo' },
    { key: 'photo-exterior', label: 'Fotos · Exterior',  count: 9,  color: '#0ea5e9', kind: 'photo' },
    { key: 'video-food',     label: 'Vídeos · Comida',   count: 14, color: '#ec4899', kind: 'video' },
    { key: 'video-venue',    label: 'Vídeos · Local',    count: 6,  color: '#ec4899', kind: 'video' },
  ]))
  // Back-compat alias for any consumer still reading reviewPhotoTypes
  const reviewPhotoTypes = reviewMediaTypes

  const pendingReviews = computed(() => ([
    { id: 'r-12', author: 'Marta G.',   rating: 2, hours: 96, date: 'hace 4 días' },
    { id: 'r-18', author: 'Raúl B.',    rating: 3, hours: 84, date: 'hace 3,5 días' },
    { id: 'r-24', author: 'Sandra V.',  rating: 4, hours: 80, date: 'hace 3 días' },
    { id: 'r-31', author: 'Ismael F.',  rating: 1, hours: 78, date: 'hace 3 días' },
  ]))

  // ─── Fidelización ─────────────────────────────────────────────────
  const fidelizacionKpis = computed(() => {
    const s = dayScale.value, p = prevDayScale.value
    return {
      totalRedemptions: mkDelta(Math.round(284 * s), Math.round(241 * p)),
      assistedGmv:      mkDelta(Math.round(8420 * s), Math.round(7310 * p)),
      discountGiven:    mkDelta(Math.round(1680 * s), Math.round(1545 * p)),
      roi:              mkDelta(5.0, 4.7),
    }
  })

  const redemptionsSeries = computed(() => {
    const days = iterDays(range.value)
    return genSeries(baseSeed.value + 30, days, 8, 5, 3).values.map(v => Math.round(v))
  })
  const redemptionsPrevSeries = computed(() => {
    const days = iterDays(previousRange.value)
    return genSeries(baseSeed.value + 1030, days, 6.5, 4.5).values.map(v => Math.round(v))
  })

  const campaignRows = computed(() => {
    const rnd = mulberry32(baseSeed.value + 40)
    const rows = [
      { name: 'Happy Hour 17-19h', tpl: 'happy-hour',   redemptions: 86, gmv: 2420, discount: 484,  avgTicket: 28.1, conversionPct: 34 },
      { name: 'Bienvenida 10%',    tpl: 'first-order',  redemptions: 52, gmv: 1560, discount: 156,  avgTicket: 30.0, conversionPct: 21 },
      { name: 'Finde en grupo',    tpl: 'weekend',      redemptions: 41, gmv: 1845, discount: 277,  avgTicket: 45.0, conversionPct: 18 },
      { name: 'Invita a un amigo', tpl: 'invite',       redemptions: 34, gmv: 1360, discount: 204,  avgTicket: 40.0, conversionPct: 26 },
      { name: 'Código @lauraeats', tpl: 'influencer',   redemptions: 28, gmv:  840, discount:  84,  avgTicket: 30.0, conversionPct: 15 },
      { name: 'Flash 30% hoy',     tpl: 'flash',        redemptions: 24, gmv:  528, discount: 158,  avgTicket: 22.0, conversionPct: 12 },
      { name: '2x1 segundos',      tpl: '2x1',          redemptions: 19, gmv:  437, discount: 219,  avgTicket: 23.0, conversionPct: 10 },
    ].map(r => ({ ...r, roi: Math.round((r.gmv / Math.max(1, r.discount)) * 10) / 10, redemptions: r.redemptions + Math.floor(rnd() * 3) }))
    return rows.sort((a, b) => b.roi - a.roi)
  })

  const templateRanking = computed(() => {
    const rows = campaignRows.value
    const byTpl = new Map<string, { tpl: string; redemptions: number; gmv: number; discount: number }>()
    for (const r of rows) {
      const e = byTpl.get(r.tpl) || { tpl: r.tpl, redemptions: 0, gmv: 0, discount: 0 }
      e.redemptions += r.redemptions; e.gmv += r.gmv; e.discount += r.discount
      byTpl.set(r.tpl, e)
    }
    return Array.from(byTpl.values())
      .map(r => ({ ...r, roi: Math.round((r.gmv / Math.max(1, r.discount)) * 10) / 10 }))
      .sort((a, b) => b.roi - a.roi)
  })

  const redemptionsHeatmap = computed(() => {
    const rnd = mulberry32(baseSeed.value + 50)
    const grid: number[][] = []
    for (let d = 0; d < 7; d++) {
      const row: number[] = []
      for (let h = 0; h < 24; h++) {
        let base = 0
        if (h >= 13 && h <= 15) base = 4
        if (h >= 17 && h <= 20) base = 6
        if (h >= 21 && h <= 23) base = 3
        if (d >= 4) base += 2
        row.push(Math.max(0, Math.round(base + rnd() * 4 - 1)))
      }
      grid.push(row)
    }
    return grid
  })

  const couponsKpis = computed(() => ({
    redemptionRate:    mkDelta(62, 54),
    avgTicketUplift:   mkDelta(18, 14),
    avgTimeToRedeemH:  mkDelta(72, 96),
    expiredLost:       mkDelta(38, 52),
    expiredValueEur:   mkDelta(420, 580),
  }))

  const topCoupons = computed(() => ([
    { code: '27J6WMHZ', uses: 48, value: 10, type: '%' },
    { code: 'VERANO25', uses: 32, value: 25, type: '%' },
    { code: 'LAURA10',  uses: 28, value: 10, type: '%' },
    { code: 'BIENVEN',  uses: 21, value: 5,  type: '€' },
    { code: 'FINDE15',  uses: 18, value: 15, type: '%' },
  ]))

  const creatorAttribution = computed(() => ([
    { creator: '@lauraeats',  redemptions: 28, gmv: 840,  cac: 6.5 },
    { creator: '@madridfoodie', redemptions: 19, gmv: 570, cac: 7.8 },
    { creator: '@gastro_pau', redemptions: 14, gmv: 420,  cac: 8.2 },
    { creator: '@tapas_and_co', redemptions: 9, gmv: 270, cac: 9.1 },
  ]))

  const newVsReturning = computed(() => ([
    { label: 'Nuevos',      value: 118, color: '#22c55e' },
    { label: 'Recurrentes', value: 166, color: '#6366f1' },
  ]))

  // ─── Bio ──────────────────────────────────────────────────────────
  const bioKpis = computed(() => {
    const s = dayScale.value, p = prevDayScale.value
    return {
      profileViews:    mkDelta(Math.round(1842 * s), Math.round(1520 * p)),
      ctaConversion:   mkDelta(23, 19),
      widgetImpressions: mkDelta(Math.round(4120 * s), Math.round(3080 * p)),
      completeness:    mkDelta(78, 65),
    }
  })

  const bioViewsSeries = computed(() => {
    const days = iterDays(range.value)
    return { dates: days, values: genSeries(baseSeed.value + 60, days, 52, 22, 18).values.map(v => Math.round(v)) }
  })
  const bioViewsPrevSeries = computed(() => {
    const days = iterDays(previousRange.value)
    return { dates: days, values: genSeries(baseSeed.value + 1060, days, 43, 20).values.map(v => Math.round(v)) }
  })

  const ctaClicks = computed(() => ([
    { key: 'reserve',    label: 'Reservar',   value: 148, deltaPct: 22, color: '#ff2d23' },
    { key: 'call',       label: 'Llamar',     value: 96,  deltaPct: 8,  color: '#22c55e' },
    { key: 'directions', label: 'Cómo llegar', value: 82,  deltaPct: 14, color: '#0ea5e9' },
    { key: 'website',    label: 'Web',        value: 47,  deltaPct: -4, color: '#6366f1' },
    { key: 'instagram',  label: 'Instagram',  value: 52,  deltaPct: 11, color: '#ec4899' },
  ]))

  const trafficSources = computed(() => ([
    { label: 'Directo',          value: 620, color: '#ff2d23' },
    { label: 'QR físico',        value: 480, color: '#fb923c' },
    { label: 'Widget externo',   value: 310, color: '#facc15' },
    { label: 'Perfil creador',   value: 230, color: '#f9a8d4' },
    { label: 'Redes sociales',   value: 128, color: '#a5b4fc' },
    { label: 'Buscadores',       value: 74,  color: '#6ee7b7' },
  ]))

  const devices = computed(() => ([
    { label: 'Móvil',   value: 1480, color: '#ff2d23' },
    { label: 'Desktop', value: 280,  color: '#a5b4fc' },
    { label: 'Tablet',  value: 82,   color: '#facc15' },
  ]))

  const languages = computed(() => ([
    { label: 'Español',  value: 1380, color: '#ff2d23' },
    { label: 'Inglés',   value: 280,  color: '#a5b4fc' },
    { label: 'Francés',  value: 84,   color: '#c4b5fd' },
    { label: 'Italiano', value: 58,   color: '#6ee7b7' },
    { label: 'Portugués', value: 40,  color: '#facc15' },
  ]))

  const completenessActions = computed(() => ([
    { key: 'cover',     label: 'Añadir foto de portada de alta calidad', done: true,  deepLink: 'cover' },
    { key: 'logo',      label: 'Subir logo transparente', done: true,  deepLink: 'profile' },
    { key: 'hours',     label: 'Configurar horarios completos', done: true,  deepLink: 'hours' },
    { key: 'menu',      label: 'Enlazar menú completo con fotos', done: true,  deepLink: 'dishes' },
    { key: 'gallery',   label: 'Añadir al menos 6 fotos a la galería', done: false, deepLink: 'gallery' },
    { key: 'owners',    label: 'Completar sección "Sobre nosotros"', done: false, deepLink: 'owners' },
    { key: 'badges',    label: 'Activar badges de verificación', done: false, deepLink: 'badges' },
    { key: 'campaigns', label: 'Destacar una campaña activa', done: true,  deepLink: 'campaigns' },
  ]))

  const widgetDomains = computed(() => ([
    { domain: 'restaurante-ejemplo.com', impressions: 1840, clicks: 128 },
    { domain: 'guiagastro.es',           impressions:  920, clicks:  67 },
    { domain: 'madridmola.com',          impressions:  680, clicks:  41 },
    { domain: 'foodblog.me',             impressions:  420, clicks:  22 },
    { domain: 'opinioneshoy.es',         impressions:  260, clicks:  12 },
  ]))

  return {
    // Reviews
    reviewsSeries, reviewsPrevSeries, reviewsKpis, starsDistribution, reviewSources,
    reviewTopicsPositive, reviewTopicsNegative, reviewMediaTypes, reviewPhotoTypes, pendingReviews,
    // Fidelización
    fidelizacionKpis, redemptionsSeries, redemptionsPrevSeries, campaignRows, templateRanking, redemptionsHeatmap,
    couponsKpis, topCoupons, creatorAttribution, newVsReturning,
    // Bio
    bioKpis, bioViewsSeries, bioViewsPrevSeries, ctaClicks, trafficSources, devices, languages,
    completenessActions, widgetDomains,
  }
}
