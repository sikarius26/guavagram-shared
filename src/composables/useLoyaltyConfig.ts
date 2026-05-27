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
