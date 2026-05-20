// Ambient discovery rail fixtures + match-card fallback reviews.
//
// Replaces inline arrays in:
//   - components/discovery/DiscoveryAmbientRail.vue (ticker, coupons, GP, pro hook)
//   - components/discovery/DiscoveryMatchCard.vue (review fallback strip)
//
// Future API contract (suggested):
//   GET /api/discover/ambient → { ticker, coupons, gp, proHook }
//   GET /api/store/{slug}/reviews?limit=2 → fallback reviews

export interface MockDiscoveryAmbientOptions {
  cityName: string
}

export interface MockTickerItem { icon: string; text: string }
export interface MockExpiringCoupon { restaurant: string; perk: string; minutesLeft: number }
export interface MockGpProgress {
  current: number
  rankCurrent: string
  rankNext: string
  rankNextThreshold: number
  reward: string
}
export interface MockProHook {
  trigger: string
  perk: string
  bullets: string
}

const COUPONS: MockExpiringCoupon[] = [
  { restaurant: 'Sushi Bay',       perk: 'Postre gratis',  minutesLeft: 134 },
  { restaurant: 'Kebab Hermanos',  perk: '−15%',           minutesLeft:  47 },
  { restaurant: 'La Brasería',     perk: '2x1 entrante',   minutesLeft: 311 },
]

const GP: MockGpProgress = {
  current: 580,
  rankCurrent: 'Foodie',
  rankNext: 'Crítico',
  rankNextThreshold: 750,
  reward: 'cupón −10% libre',
}

const PRO_HOOK: MockProHook = {
  trigger: 'Has dudado en 3 sitios',
  perk: 'Volver atrás',
  bullets: 'Super-like · Boost · Cupones en primicia',
}

export function getMockDiscoveryTicker(opts: MockDiscoveryAmbientOptions): MockTickerItem[] {
  return [
    { icon: 'mdi-fire',              text: 'Carla acaba de hacer match con La Pasta Nera' },
    { icon: 'mdi-account-group',     text: `12 personas en ${opts.cityName} tienen cupón activo` },
    { icon: 'mdi-ticket-percent',    text: 'Marc canjeó −20% en Sushi Bay hace 2 min' },
    { icon: 'mdi-trending-up',       text: 'Italiana tendencia ↑ 38% esta semana' },
    { icon: 'mdi-map-marker-radius', text: '3 sitios nuevos cerca de tu ubicación' },
  ]
}

export function getMockExpiringCoupons(): MockExpiringCoupon[] {
  return COUPONS
}

export function getMockGpProgress(): MockGpProgress {
  return GP
}

export function getMockProHook(): MockProHook {
  return PRO_HOOK
}

// ---------- Match-card review fallbacks ----------

export interface MockMatchCardReview {
  user: string
  rating: number
  text: string
}

const FALLBACK_REVIEWS: MockMatchCardReview[] = [
  { user: 'María G.',  rating: 5, text: 'Producto fresco, trato impecable. Volveré seguro.' },
  { user: 'Carlos R.', rating: 4, text: 'Muy buena relación calidad-precio. Recomendado.' },
]

export function getMockDiscoveryFallbackReviews(): MockMatchCardReview[] {
  return FALLBACK_REVIEWS
}
