// Affiliate restaurants fixtures used by:
//   - components/affiliate/AffiliateRestaurants.vue (rich table)
//   - components/creator/affiliate/CreatorAffiliatePanel.vue (voucher selector)
//
// Single source of truth: a canonical seed list. Both consumer shapes
// derive from the same entries so demos stay consistent across screens.
//
// Future API contract: GET /api/creator/affiliate/restaurants

export interface MockAffiliateRestaurantSeed {
  id: string
  name: string
  city: string
  plan: 'Premium Gold' | 'Plan Gratuito' | 'Premium Plus' | 'Premium Basic'
  status: 'Activo' | 'Inactivo' | 'En Riesgo'
  lastAccess: string
  earningsCents: number
  earningsChangePct?: number
}

export interface MockAffiliateRestaurantRich {
  name: string
  location: string
  plan: string
  planColor: string
  planBg: string
  status: string
  statusColor: string
  statusDot: string
  lastAccess: string
  earnings: string
  earningsChange: string
  earningsChangeColor: string
}

export interface MockAffiliateRestaurantOption {
  id: string
  name: string
  city: string
}

const SEED: MockAffiliateRestaurantSeed[] = [
  { id: 'r1', name: 'La Terraza del Valle', city: 'Madrid',    plan: 'Premium Gold',  status: 'Activo',    lastAccess: 'Hace 7 horas',  earningsCents: 124000, earningsChangePct: -12.3 },
  { id: 'r2', name: 'Bistrot Central',      city: 'Barcelona', plan: 'Plan Gratuito', status: 'Inactivo',  lastAccess: 'Hace 5 días',   earningsCents: 0 },
  { id: 'r3', name: 'Sakura Sushi Lab',     city: 'Sevilla',   plan: 'Premium Plus',  status: 'En Riesgo', lastAccess: 'Hace 12 min',   earningsCents:  89050, earningsChangePct: -4.2 },
  { id: 'r4', name: 'Le Petit Café',        city: 'Valencia',  plan: 'Premium Basic', status: 'Activo',    lastAccess: 'Hace 1 hora',   earningsCents:  45500, earningsChangePct:  9.1 },
]

const PLAN_STYLE: Record<MockAffiliateRestaurantSeed['plan'], { color: string; bg: string }> = {
  'Premium Gold':  { color: '#92400e', bg: '#fef3c7' },
  'Plan Gratuito': { color: '#6b7280', bg: '#f3f4f6' },
  'Premium Plus':  { color: '#059669', bg: '#ecfdf5' },
  'Premium Basic': { color: '#059669', bg: '#ecfdf5' },
}

const STATUS_STYLE: Record<MockAffiliateRestaurantSeed['status'], { color: string; dot: string }> = {
  'Activo':    { color: '#059669', dot: '#10b981' },
  'Inactivo':  { color: '#9ca3af', dot: '#d1d5db' },
  'En Riesgo': { color: '#ef4444', dot: '#ef4444' },
}

function formatEarnings(cents: number): string {
  if (cents === 0) return '€ 0,00'
  const euros = cents / 100
  // Spanish-style thousand separator + comma decimal.
  return '€ ' + euros.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatChange(pct?: number): { text: string; color: string } {
  if (typeof pct !== 'number') return { text: '', color: '#6b7280' }
  const sign = pct >= 0 ? '+' : ''
  return {
    text: `${sign}${pct}% vs mes ant.`,
    color: pct >= 0 ? '#059669' : '#ef4444',
  }
}

export function getMockAffiliateRestaurants(): MockAffiliateRestaurantRich[] {
  return SEED.map(s => {
    const plan = PLAN_STYLE[s.plan]
    const status = STATUS_STYLE[s.status]
    const change = formatChange(s.earningsChangePct)
    return {
      name: s.name,
      location: `${s.city}, España`,
      plan: s.plan,
      planColor: plan.color,
      planBg: plan.bg,
      status: s.status,
      statusColor: status.color,
      statusDot: status.dot,
      lastAccess: s.lastAccess,
      earnings: formatEarnings(s.earningsCents),
      earningsChange: change.text,
      earningsChangeColor: change.color,
    }
  })
}

export function getMockAffiliateRestaurantOptions(): MockAffiliateRestaurantOption[] {
  return SEED.map(s => ({ id: s.id, name: s.name, city: s.city }))
}
