import { ref, computed, watch, type Ref } from 'vue'

// Shared loyalty-card configuration store. Dashboard's FidelizacionPanel
// writes here; the public menu's Sidebar teaser reads from here. Backed
// by `/api/_mock/store/<slug>/loyalty-config` (Nuxt Nitro mock in dev,
// real Guava API later) so dashboard ↔ public sync survives the process
// boundary once admin lives in a separate Nuxt app (`guavagram-admin/`).

export type LoyaltyRewardType =
  | 'free_item'
  | 'discount_pct'
  | 'discount_fixed'
  | 'free_drink'
  | 'free_dessert'
  | 'free_meal'
  | 'surprise'

export interface LoyaltyReward {
  visitNumber: number
  rewardType: LoyaltyRewardType
  rewardLabel: string
  rewardValue: string
  icon: string
}

// ─── Premium card styling (Pro-only) ─────────────────────────────────────────
// Estos 7 ejes se aplican sobre la card en el preview y en el render público.
// Free se queda con classic + rounded + numbers + sans (los defaults). Pro
// desbloquea las 6 plantillas alternativas y los 5 ejes de composición.

export type LoyaltyCardTemplate =
  | 'classic'    // free — bloque sólido + sello redondo
  | 'gradient'   // diagonal soft + glow accent
  | 'glass'      // glassmorphism con noise + borde fino
  | 'mono'       // alto contraste b/n editorial
  | 'vintage'    // papel beige + serif + sello rojo
  | 'metal'      // shimmer holográfico animado
  | 'neon'       // dark + accent fluor con glow

export type LoyaltyCardPattern = 'none' | 'dots' | 'grid' | 'mesh' | 'waves' | 'noise'
export type LoyaltyStampStyle  = 'numbers' | 'icons' | 'hearts' | 'stars' | 'coffee'
export type LoyaltyCardShape   = 'rounded' | 'sharp' | 'ticket' | 'passbook'
export type LoyaltyTypography  = 'sans' | 'serif' | 'display' | 'mono'
export type LoyaltyLogoPosition = 'top-left' | 'top-center' | 'top-right'

// Icono del badge esquina superior (el ⭐ por defecto). Iconos MDI.
export type LoyaltyBadgeIcon = 'star' | 'heart' | 'diamond' | 'crown' | 'leaf' | 'sparkle' | 'coffee' | 'chef'

// Dirección del gradient/surface — solo aplica a templates gradient/metal/neon
// (classic, glass, mono, vintage tienen surface fijo). 'radial' = radial-gradient
// desde el centro; el resto = linear con ese ángulo.
export type LoyaltyGradientDirection = '0deg' | '45deg' | '90deg' | '135deg' | '180deg' | '225deg' | '270deg' | '315deg' | 'radial'

export type LoyaltyCardBorder = 'none' | 'thin' | 'thick' | 'dashed'
export type LoyaltyGlowIntensity = 'off' | 'low' | 'medium' | 'high'
export type LoyaltyStampDensity = 'compact' | 'normal' | 'loose'
export type LoyaltyStampSize = 'normal' | 'xl'

// `cardTemplate` no es Pro per se (classic queda libre); el resto sí. La
// UI muestra los premium con badge Pro y dispara promptUpgrade al
// seleccionar si el plan es free.
export const PRO_TEMPLATES: ReadonlyArray<LoyaltyCardTemplate> = [
  'gradient', 'glass', 'mono', 'vintage', 'metal', 'neon',
]

export interface LoyaltyConfig {
  isActive: boolean
  cardName: string
  totalVisits: number
  rewards: LoyaltyReward[]
  cardColor: string
  cardAccent: string
  // Optional logo override for the loyalty card. When unset the card falls
  // back to the store's bio logo + cardName text. Stored as base64 data URL
  // (or remote URL once a CDN endpoint exists). Pro-only feature.
  cardLogoUrl?: string
  // ─── Premium styling (Pro-only en la UI, defaults Pro-safe) ────────────
  cardTemplate: LoyaltyCardTemplate
  cardPattern: LoyaltyCardPattern
  stampStyle: LoyaltyStampStyle
  cardShape: LoyaltyCardShape
  cardTypography: LoyaltyTypography
  logoPosition: LoyaltyLogoPosition
  cardShine: boolean
  // Composición avanzada (segundo set, Pro-only)
  badgeIcon: LoyaltyBadgeIcon
  gradientDirection: LoyaltyGradientDirection
  cardBorder: LoyaltyCardBorder
  glowIntensity: LoyaltyGlowIntensity
  // Texto custom
  headerSubtitle: string       // por defecto 'Tarjeta fidelización' — Pro puede cambiarlo
  showCounter: boolean         // mostrar '4/10 visitas' (default true)
  watermarkText: string        // texto grande difuminado de fondo (default '')
  // Stamps avanzado
  stampDensity: LoyaltyStampDensity
  stampSize: LoyaltyStampSize
  showNextReward: boolean      // banner footer con la siguiente recompensa
  animateLastStamp: boolean    // pulsa el último stamp marcado
  autoCheckin: boolean
  checkinMethod: 'qr' | 'nfc' | 'manual' | 'auto_order'
  showInBio: boolean
  showInMenu: boolean
  expirationDays: number
}

const API_PREFIX = '/api/_mock/store'

const defaults = (): LoyaltyConfig => ({
  isActive: true,
  cardName: 'Tarjeta de fidelización',
  totalVisits: 10,
  rewards: [
    { visitNumber: 3,  rewardType: 'free_drink',   rewardLabel: 'Bebida gratis',   rewardValue: 'Cualquier bebida', icon: 'mdi-cup-outline' },
    { visitNumber: 5,  rewardType: 'discount_pct', rewardLabel: '10% descuento',   rewardValue: '10%',              icon: 'mdi-percent-outline' },
    { visitNumber: 7,  rewardType: 'free_dessert', rewardLabel: 'Postre gratis',   rewardValue: 'Cualquier postre', icon: 'mdi-cupcake' },
    { visitNumber: 10, rewardType: 'free_meal',    rewardLabel: 'Comida gratis',   rewardValue: 'Plato principal',  icon: 'mdi-silverware-fork-knife' },
  ],
  cardColor: '#1a1c1b',
  cardAccent: '#f59e0b',
  cardTemplate: 'classic',
  cardPattern: 'dots',
  stampStyle: 'numbers',
  cardShape: 'rounded',
  cardTypography: 'sans',
  logoPosition: 'top-left',
  cardShine: false,
  badgeIcon: 'star',
  gradientDirection: '135deg',
  cardBorder: 'none',
  glowIntensity: 'medium',
  headerSubtitle: 'Tarjeta fidelización',
  showCounter: true,
  watermarkText: '',
  stampDensity: 'normal',
  stampSize: 'normal',
  showNextReward: false,
  animateLastStamp: false,
  autoCheckin: false,
  checkinMethod: 'qr',
  showInBio: true,
  showInMenu: true,
  expirationDays: 90,
})

// Module-scoped per-slug cache. Hydrates lazily on first access (client-only)
// and PUT-debounces writes the same way `useBioConfig` does.
const store = ref<Record<string, LoyaltyConfig>>({})
const hydrating = new Set<string>()
const pushTimers: Record<string, ReturnType<typeof setTimeout> | null> = {}

async function hydrate(slug: string) {
  if (typeof window === 'undefined') return
  if (hydrating.has(slug) || store.value[slug]) { hydratedKeys.add(slug); return }
  hydrating.add(slug)
  try {
    const res = await fetch(`${API_PREFIX}/${encodeURIComponent(slug)}/loyalty-config`)
    if (res.ok) {
      const data = await res.json().catch(() => null)
      if (data) store.value = { ...store.value, [slug]: { ...defaults(), ...data } }
    }
  } catch { /* network failure → defaults */ }
  finally {
    hydrating.delete(slug)
    // Mark hydrated AFTER any in-flight write completes so the next mutation
    // is the first one that actually persists.
    hydratedKeys.add(slug)
  }
}

// Gate per-slug so the initial hydrate doesn't trigger a PUT that round-trips
// defaults back to disk before the real data arrives. Flipped to true after
// hydrate() completes (success or fail). Mirrors useRestaurantMedia's pattern.
const hydratedKeys = new Set<string>()

function schedulePush(slug: string) {
  if (typeof window === 'undefined') return
  if (!hydratedKeys.has(slug)) return
  if (pushTimers[slug]) clearTimeout(pushTimers[slug]!)
  pushTimers[slug] = setTimeout(() => {
    const body = store.value[slug]
    if (!body) return
    fetch(`${API_PREFIX}/${encodeURIComponent(slug)}/loyalty-config`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => {})
  }, 300)
}

function keyFor(slugOrStoreId: string): string {
  return slugOrStoreId || '__default__'
}

// Deep watcher attached once per slug — fires schedulePush whenever any
// nested field on the cached config mutates. Without this, direct v-model
// edits in the panel (loyaltyConfig.cardColor = '#abc') mutate the inner
// object but never go through the computed setter → no PUT → no persistence.
const watchedKeys = new Set<string>()
function attachDeepWatcher(slug: string) {
  if (typeof window === 'undefined') return
  if (watchedKeys.has(slug)) return
  watchedKeys.add(slug)
  watch(
    () => store.value[slug],
    () => { if (store.value[slug]) schedulePush(slug) },
    { deep: true },
  )
}

// ─── Shared surface + pattern helpers ────────────────────────────────────
// Same logic LoyaltyCardPreview.vue uses internally, exported so the bio
// teaser in GuavagramPanel (and any other surface that wants to "look like
// the loyalty card") can pull a consistent treatment without duplicating
// the template switch. Pure functions on LoyaltyConfig — no Vue refs.
//
// `gradientDirection` is honored only for templates whose surface is a
// gradient/conic (gradient/metal/neon); classic/glass/mono/vintage have
// fixed surfaces.

function dirFor(config: LoyaltyConfig, prefix: 'linear' | 'conic', stops: string): string {
  const d = config.gradientDirection
  if (prefix === 'conic') return `conic-gradient(from ${d === 'radial' ? '220deg' : d} at 50% 50%, ${stops})`
  if (d === 'radial')     return `radial-gradient(circle at 30% 30%, ${stops})`
  return `linear-gradient(${d}, ${stops})`
}

export function loyaltyCardSurfaceStyle(config: LoyaltyConfig): Record<string, string> {
  const c = config.cardColor
  const a = config.cardAccent
  switch (config.cardTemplate) {
    case 'gradient':
      return { background: `radial-gradient(130% 110% at 15% 10%, ${a}55 0%, transparent 45%), ${dirFor(config, 'linear', `${c} 0%, ${c}cc 45%, ${a}dd 100%`)}` }
    case 'glass':
      return {
        background: `linear-gradient(150deg, rgba(255,255,255,0.18) 0%, ${c}66 38%, ${c}99 70%, ${a}44 100%)`,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }
    case 'mono':
      return { background: 'linear-gradient(160deg, #ffffff 0%, #f2f2f0 100%)', color: '#0a0a0a' }
    case 'vintage':
      return { background: 'linear-gradient(165deg, #faf3e3 0%, #f0e2c6 55%, #e6d4ad 100%)' }
    case 'metal':
      return { background: dirFor(config, 'conic', `${c}, ${a}, #ffffff66, ${c}, ${a}, ${c}`) }
    case 'neon':
      return { background: `radial-gradient(120% 90% at 100% 0%, ${a}40 0%, transparent 45%), radial-gradient(100% 80% at 0% 100%, ${a}26 0%, transparent 50%), ${dirFor(config, 'linear', `#070707 0%, ${c} 100%`)}` }
    case 'classic':
    default:
      return { background: `radial-gradient(120% 100% at 100% 0%, ${a}22 0%, transparent 40%), ${dirFor(config, 'linear', `${c} 0%, ${c}f0 55%, ${c}d8 100%`)}` }
  }
}

export function loyaltyCardPatternStyle(config: LoyaltyConfig): Record<string, string | number> {
  switch (config.cardPattern) {
    case 'dots':
      return { backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '14px 14px', opacity: 0.06 }
    case 'grid':
      return { backgroundImage: 'linear-gradient(white 0.5px, transparent 0.5px), linear-gradient(90deg, white 0.5px, transparent 0.5px)', backgroundSize: '18px 18px', opacity: 0.06 }
    case 'mesh':
      return { backgroundImage: 'radial-gradient(at 20% 30%, rgba(255,255,255,0.18) 0px, transparent 50%), radial-gradient(at 80% 70%, rgba(255,255,255,0.12) 0px, transparent 50%)', opacity: 1 }
    case 'waves':
      return { backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 12px)', opacity: 1 }
    case 'noise':
      return { backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"160\\" height=\\"160\\"><filter id=\\"n\\"><feTurbulence type=\\"fractalNoise\\" baseFrequency=\\"0.85\\" numOctaves=\\"2\\"/><feColorMatrix values=\\"0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.15 0\\"/></filter><rect width=\\"100%\\" height=\\"100%\\" filter=\\"url(%23n)\\"/></svg>")', opacity: 0.7 }
    case 'none':
    default:
      return { display: 'none' }
  }
}

// Light-on-dark contrast helper. Returns '#1a1c1b' for light surfaces (Mono,
// Vintage when the picked color is pale) and '#ffffff' otherwise. Callers
// should pass the same `cardColor` they're using to paint the surface.
export function loyaltyCardForegroundColor(cardColor: string | undefined | null): string {
  const hex = (cardColor || '#1a1c1b').replace('#', '')
  if (hex.length < 6) return '#ffffff'
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  const luma = 0.299 * r + 0.587 * g + 0.114 * b
  return luma > 160 ? '#1a1c1b' : '#ffffff'
}

export function useLoyaltyConfig(slugRef: Ref<string | null | undefined> | string) {
  const getKey = (): string => {
    const v = typeof slugRef === 'string' ? slugRef : slugRef.value
    return keyFor(v || '')
  }

  hydrate(getKey())
  attachDeepWatcher(getKey())

  const config = computed<LoyaltyConfig>({
    get: () => {
      const k = getKey()
      // Materialise defaults into the store on first read so direct mutations
      // (e.g. v-model on inputs) have a writable target — without this, the
      // initial getter returns the throwaway `defaults()` object and edits
      // disappear into a detached reference.
      if (!store.value[k]) store.value = { ...store.value, [k]: defaults() }
      return store.value[k]
    },
    set: (next: LoyaltyConfig) => {
      const k = getKey()
      store.value = { ...store.value, [k]: next }
      schedulePush(k)
    },
  })

  const updateConfig = (patch: Partial<LoyaltyConfig>) => {
    const current = config.value
    config.value = { ...current, ...patch }
  }

  // The "final reward" — the one at totalVisits. Drives the teaser headline.
  const finalReward = computed<LoyaltyReward | undefined>(() => {
    const cfg = config.value
    return cfg.rewards.find(r => r.visitNumber === cfg.totalVisits)
      ?? cfg.rewards.slice().sort((a, b) => b.visitNumber - a.visitNumber)[0]
  })

  return { config, updateConfig, finalReward }
}
