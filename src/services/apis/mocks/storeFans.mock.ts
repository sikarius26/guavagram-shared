// Mock data for the "Te quieren" (Fans / Wish List) panel.
//
// Privacy model: fans stay anonymous to the store until they redeem a coupon.
// Until then we only expose aggregated, non-identifying signals (age range,
// city at city level only, favorite cuisines, GP level, days since like).
// `realName`/`realHandle`/`realAvatarUrl` are only set when `status` flips to
// 'redeemed' — UI must respect the status field and never leak the real fields
// while status === 'anonymous'.

export type FanStatus = 'anonymous' | 'redeemed'
export type FanAgeRange = '18-24' | '25-34' | '35-44' | '45-54' | '55+'

export interface AnonymousFan {
  id: string                  // opaque internal id
  shortId: string             // human-friendly label, e.g. "Usuario #4821"
  status: FanStatus
  ageRange: FanAgeRange
  city: string                // city level only, no exact location
  favoriteCuisines: string[]  // top 3
  gpLevel: number             // 1-5 stars (Guava Points level)
  hasVisitedBefore: boolean   // whether they previously redeemed/visited
  likedAt: string             // ISO timestamp
  // Only populated once status === 'redeemed':
  realHandle?: string
  realName?: string
  realAvatarUrl?: string
}

export type CouponTemplateType = 'percent_off' | 'fixed_off' | 'free_item'

export interface CouponTemplate {
  id: string
  name: string
  type: CouponTemplateType
  value?: number              // % for percent_off, € for fixed_off
  itemId?: string             // for free_item
  itemName?: string
  description: string
  emoji: string
}

export const COUPON_TEMPLATES: CouponTemplate[] = [
  { id: 'pct-5',    name: '5 % descuento',  type: 'percent_off', value: 5,  description: 'Suave incentivo, perfecto para tibios.', emoji: '🎟️' },
  { id: 'pct-10',   name: '10 % descuento', type: 'percent_off', value: 10, description: 'Clásico que casi siempre convierte.',    emoji: '🎟️' },
  { id: 'pct-15',   name: '15 % descuento', type: 'percent_off', value: 15, description: 'Empuja a los indecisos a reservar.',     emoji: '🎟️' },
  { id: 'pct-50',   name: '50 % descuento', type: 'percent_off', value: 50, description: 'Bombazo. Úsalo con moderación.',         emoji: '💥' },
  { id: 'free-app', name: 'Entrante gratis', type: 'free_item', itemId: 'item-app',     itemName: 'Croquetas de jamón', description: 'Engánchalos con un detalle de la casa.', emoji: '🥟' },
  { id: 'free-drk', name: 'Bebida gratis',   type: 'free_item', itemId: 'item-drink',   itemName: 'Caña o copa de vino', description: 'Universal. La excusa perfecta.', emoji: '🍷' },
  { id: 'free-des', name: 'Postre gratis',   type: 'free_item', itemId: 'item-dessert', itemName: 'Postre del día',      description: 'Cierra la experiencia con un wow.', emoji: '🍰' },
  { id: 'fix-10',   name: '10 € descuento',  type: 'fixed_off', value: 10,                                              description: 'Cuando la cuenta media supera 30 €.', emoji: '💶' },
]

export interface CouponConditions {
  minOrderAmount?: number       // € (only valid for orders ≥ this)
  maxUsesPerUser?: number       // default 1
  validDays?: number[]          // 0-6 (Sun-Sat); undefined = any day
  newCustomersOnly?: boolean
  freeItems?: { id: string; name: string }[]   // owner-picked items for free_item coupons
}

// Lightweight menu items the owner can pick from when sending a free_item
// coupon. Grouped by the same category buckets the COUPON_TEMPLATES use
// (`item-app`, `item-drink`, `item-dessert`). Once the real menu API is
// wired we swap this for a fetch keyed by the store id.
export type FreeItemCategory = 'item-app' | 'item-drink' | 'item-dessert'

export const FREE_ITEMS_BY_CATEGORY: Record<FreeItemCategory, { id: string; name: string; description?: string }[]> = {
  'item-app': [
    { id: 'app-pan-cristal',   name: 'Pan de cristal con tomate' },
    { id: 'app-croquetas',     name: 'Croquetas de jamón ibérico' },
    { id: 'app-burrata',       name: 'Burrata con tomates confitados' },
    { id: 'app-tartar-atun',   name: 'Tartar de atún rojo' },
    { id: 'app-ensaladilla',   name: 'Ensaladilla premium' },
  ],
  'item-drink': [
    { id: 'drk-cana',          name: 'Caña' },
    { id: 'drk-copa-vino',     name: 'Copa de vino de la casa' },
    { id: 'drk-cerveza-art',   name: 'Cerveza artesana local' },
    { id: 'drk-sangria-cava',  name: 'Sangría de cava' },
    { id: 'drk-cafe',          name: 'Café de especialidad' },
    { id: 'drk-agua',          name: 'Agua mineral' },
  ],
  'item-dessert': [
    { id: 'des-coulant',       name: 'Coulant de chocolate 70%' },
    { id: 'des-crema-cat',     name: 'Crema catalana tradicional' },
    { id: 'des-cheesecake',    name: 'Cheesecake de queso de cabra' },
    { id: 'des-sorbete',       name: 'Sorbete de limón al cava' },
    { id: 'des-tiramisu',      name: 'Tiramisú de pistacho' },
  ],
}

export interface CouponSchedule {
  validFrom: string             // ISO date (00:00 of that day)
  validUntil: string            // ISO date (23:59 of that day)
  timeFrom?: string             // HH:MM (24h)
  timeUntil?: string             // HH:MM (24h)
}

export type SentCouponDeliveryStatus = 'delivered' | 'opened' | 'redeemed' | 'expired'

export interface CouponReminder {
  sentAt: string
  message?: string
}

export interface SentCouponRecipient {
  fanId: string
  status: SentCouponDeliveryStatus
  deliveredAt: string
  redeemedAt?: string
  reminders?: CouponReminder[]
}

export interface SentCoupon {
  id: string
  templateId: string
  template: CouponTemplate
  conditions?: CouponConditions
  schedule?: CouponSchedule
  recipients: SentCouponRecipient[]
  sentAt: string
  origin: 'manual' | 'auto-rule'
  ruleId?: string
}

export type AutoRuleTrigger = 'first_n' | 'all_new' | 'specific_users'

export interface FansAutoRule {
  id: string
  name: string
  enabled: boolean
  trigger: AutoRuleTrigger
  triggerN?: number             // for first_n
  fanIds?: string[]             // for specific_users
  templateId: string
  conditions?: CouponConditions
  schedule?: CouponSchedule
  sentCount: number
  createdAt: string
}

// ─── Mock fans (anonymized) ──────────────────────────────────────────────
// Mix of statuses + ages + cities to exercise the UI.
const CITIES = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga', 'Zaragoza']
const CUISINES = ['Italiana', 'Japonesa', 'Mexicana', 'Mediterránea', 'Tapas', 'Brunch', 'Vegetariana', 'Asiática', 'Carnes', 'Mariscos']

const pickN = <T>(arr: T[], n: number, seed: number): T[] => {
  const out: T[] = []
  let s = seed
  const pool = [...arr]
  for (let i = 0; i < n && pool.length; i++) {
    s = (s * 9301 + 49297) % 233280
    const idx = s % pool.length
    out.push(pool.splice(idx, 1)[0]!)
  }
  return out
}

const ages: FanAgeRange[] = ['18-24', '25-34', '35-44', '45-54', '55+']

const daysAgo = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

export const STORE_FANS: AnonymousFan[] = Array.from({ length: 28 }).map((_, i) => {
  const seed = i * 7 + 13
  const isRedeemed = i < 4   // first 4 have already redeemed → real identity revealed
  const realHandles = ['lauram', 'carlos_g', 'sofia.rojo', 'pau_artiso']
  const realNames   = ['Laura M.', 'Carlos G.', 'Sofía R.', 'Pau Artiso']
  return {
    id: `fan-${1000 + i}`,
    shortId: `Usuario #${4800 + i}`,
    status: isRedeemed ? 'redeemed' : 'anonymous',
    ageRange: ages[i % ages.length]!,
    city: CITIES[i % CITIES.length]!,
    favoriteCuisines: pickN(CUISINES, 3, seed),
    gpLevel: 1 + (i % 5),
    hasVisitedBefore: i % 3 === 0,
    likedAt: daysAgo(i + 1),
    ...(isRedeemed
      ? { realHandle: realHandles[i]!, realName: realNames[i]! }
      : {}),
  }
})

// ─── Mock sent coupons history ───────────────────────────────────────────
export const STORE_SENT_COUPONS: SentCoupon[] = [
  {
    id: 'sent-001',
    templateId: 'pct-15',
    template: COUPON_TEMPLATES.find(t => t.id === 'pct-15')!,
    sentAt: daysAgo(7),
    origin: 'manual',
    conditions: { minOrderAmount: 25, maxUsesPerUser: 1 },
    schedule: {
      validFrom: daysAgo(7),
      validUntil: daysAgo(-7),  // valid for next 7 days
    },
    recipients: STORE_FANS.slice(0, 8).map((f, idx) => ({
      fanId: f.id,
      status: idx < 2 ? 'redeemed' : idx < 5 ? 'opened' : 'delivered',
      deliveredAt: daysAgo(7),
      redeemedAt: idx < 2 ? daysAgo(3) : undefined,
    })),
  },
  {
    id: 'sent-002',
    templateId: 'free-drk',
    template: COUPON_TEMPLATES.find(t => t.id === 'free-drk')!,
    sentAt: daysAgo(14),
    origin: 'auto-rule',
    ruleId: 'rule-welcome',
    conditions: { newCustomersOnly: true, maxUsesPerUser: 1 },
    schedule: {
      validFrom: daysAgo(14),
      validUntil: daysAgo(-30),
    },
    recipients: STORE_FANS.slice(8, 18).map((f, idx) => ({
      fanId: f.id,
      status: idx < 4 ? 'redeemed' : idx < 7 ? 'opened' : 'delivered',
      deliveredAt: daysAgo(14),
      redeemedAt: idx < 4 ? daysAgo(8) : undefined,
    })),
  },
]

// ─── Mock auto-rules ─────────────────────────────────────────────────────
export const STORE_AUTO_RULES: FansAutoRule[] = [
  {
    id: 'rule-welcome',
    name: 'Bienvenida automática',
    enabled: true,
    trigger: 'all_new',
    templateId: 'free-drk',
    conditions: { newCustomersOnly: true, maxUsesPerUser: 1 },
    schedule: {
      validFrom: daysAgo(30),
      validUntil: daysAgo(-60),
    },
    sentCount: 47,
    createdAt: daysAgo(30),
  },
  {
    id: 'rule-first50',
    name: 'Primeros 50 — 15 % descuento',
    enabled: false,
    trigger: 'first_n',
    triggerN: 50,
    templateId: 'pct-15',
    conditions: { minOrderAmount: 20, maxUsesPerUser: 1 },
    sentCount: 22,
    createdAt: daysAgo(45),
  },
]
