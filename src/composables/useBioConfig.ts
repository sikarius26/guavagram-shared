import { ref, computed, type Ref } from 'vue'

// Shared restaurant-bio config: dashboard's GuavagramPanel writes here, the
// public `/r/[slug]/bio` reads from here. Now backed by a backend endpoint
// (`/api/_mock/store/<slug>/bio-config` in dev, a real Guava API later) so
// the dashboard and the public bio survive the process boundary once admin
// lives in a separate Nuxt app (`guavagram-admin/`). Hydrates lazily on
// first call client-side; PUTs are debounced 300ms.

export type BioSkinId = 'classic' | 'editorial' | 'portada' | 'showcase'
export type BioTypography = 'sans' | 'serif' | 'rounded' | 'mono'
export type BioRadius = 'squared' | 'rounded' | 'pill'
export type BioPageBgMode = 'solid' | 'texture'
// (BioMode lives in useCreatorBioStyle.ts and is auto-imported when needed.)

export interface BioSectionsState {
  cover: boolean
  badges: boolean
  dishes: boolean
  gallery: boolean
  campaigns: boolean
  loyalty: boolean
  reviews: boolean
  location: boolean
  hours: boolean
  owners: boolean
  reviewCta: boolean
  group: boolean
  hiring: boolean
  bookings: boolean
}

export interface BioProfileData {
  name: string
  contactPhone: string
}

export interface BioLocationData {
  address: string
  phone: string
  addressLine: string
}

export interface BioHoursRow {
  day: string
  open: string
  close: string
  closed: boolean
}

export interface BioLoyaltyData {
  title: string
  subtitle: string
  description: string
  cta: string
}

export interface BioReviewsData {
  showGoogleLink: boolean
  minRating: number
  prioritizeFiveStar: boolean
}

export interface BioSocial {
  key: string
  url: string
}

export interface BioConfig {
  // ── Identity ────────────────────────────────────────────────────────────
  description: string
  coverUrl: string
  logoUrl: string

  // ── Theme / look ────────────────────────────────────────────────────────
  accentColor: string
  bgColor: string
  textColor: string
  useDarkMode: boolean
  skinId: BioSkinId
  skinTypography: BioTypography
  skinRadius: BioRadius
  pageBgMode: BioPageBgMode
  pageTextureId: string
  pageTextureTint: string

  // ── CTAs ────────────────────────────────────────────────────────────────
  // CtaModeEnum: Phone=1, Bookings=2, Orders=3, Menu=4
  ctaMode: number

  // ── Profile / contact ───────────────────────────────────────────────────
  profileData: BioProfileData

  // ── Sections on/off (also drives renderer module flags) ────────────────
  sections: BioSectionsState

  // ── Location / hours ────────────────────────────────────────────────────
  locationData: BioLocationData
  locationSyncedWithGoogle: boolean
  hoursData: BioHoursRow[]
  hoursSyncedWithGoogle: boolean

  // ── Catalog / story ─────────────────────────────────────────────────────
  cuisines: string[]
  priceLevel: number | undefined

  // ── Social / external links ─────────────────────────────────────────────
  externalLinks: Record<string, string>
  socials: BioSocial[]

  // ── Loyalty (display labels) ────────────────────────────────────────────
  loyaltyData: BioLoyaltyData

  // ── Reviews preview ─────────────────────────────────────────────────────
  reviewsData: BioReviewsData

  // ── Dishes preview ──────────────────────────────────────────────────────
  dishesTitle: string
  dishesMediaMode: 'photo' | 'video' | 'text'

  // ── Badges ──────────────────────────────────────────────────────────────
  priceRange: string
  rating: number
}

// Endpoint prefix. Both apps include the matching server route
// (see `server/api/_mock/store/[slug]/bio-config.{get,put}.ts`).
const API_PREFIX = '/api/_mock/store'

const defaults = (): BioConfig => ({
  description: '',
  coverUrl: '',
  logoUrl: '',

  accentColor: '#1A3C34',
  bgColor: '#f9f9f7',
  textColor: '#1a1c1b',
  useDarkMode: false,
  skinId: 'classic',
  skinTypography: 'sans',
  skinRadius: 'rounded',
  pageBgMode: 'solid',
  pageTextureId: 'gradient',
  pageTextureTint: '#ff6b4a',

  ctaMode: 2, // Bookings

  profileData: { name: '', contactPhone: '' },

  sections: {
    cover: true,
    badges: true,
    dishes: true,
    gallery: true,
    campaigns: true,
    loyalty: true,
    reviews: true,
    location: true,
    hours: true,
    owners: true,
    reviewCta: true,
    group: false,
    hiring: false,
    bookings: false,
  },

  locationData: { address: '', phone: '', addressLine: '' },
  locationSyncedWithGoogle: true,
  hoursData: [
    { day: 'Lunes', open: '13:00', close: '23:00', closed: false },
    { day: 'Martes', open: '13:00', close: '23:00', closed: false },
    { day: 'Miércoles', open: '13:00', close: '23:00', closed: false },
    { day: 'Jueves', open: '13:00', close: '23:00', closed: false },
    { day: 'Viernes', open: '13:00', close: '00:00', closed: false },
    { day: 'Sábado', open: '13:00', close: '00:00', closed: false },
    { day: 'Domingo', open: '13:00', close: '17:00', closed: false },
  ],
  hoursSyncedWithGoogle: true,

  cuisines: [],
  priceLevel: undefined,

  externalLinks: {},
  socials: [
    { key: 'instagram', url: '' },
    { key: 'tiktok', url: '' },
    { key: 'web', url: '' },
  ],

  loyaltyData: {
    title: 'Club',
    subtitle: 'Fidelización',
    description: 'Acumula sellos y canjea recompensas exclusivas.',
    cta: 'UNIRSE AL CLUB',
  },

  reviewsData: { showGoogleLink: true, minRating: 4, prioritizeFiveStar: false },

  dishesTitle: 'Platos estrella',
  dishesMediaMode: 'photo',

  priceRange: '€€',
  rating: 4.8,
})

// Module-scoped per-slug cache, hydrated lazily from the API on first
// access (client-only) and PUT-debounced on writes. Two components in the
// same app reading the same slug share the same source of truth.
const store = ref<Record<string, BioConfig>>({})
const hydrating = new Set<string>()
const pushTimers: Record<string, ReturnType<typeof setTimeout> | null> = {}

async function hydrate(slug: string) {
  if (typeof window === 'undefined') return
  if (hydrating.has(slug)) return
  if (store.value[slug]) return
  hydrating.add(slug)
  try {
    const res = await fetch(`${API_PREFIX}/${encodeURIComponent(slug)}/bio-config`)
    if (res.ok) {
      const data = await res.json().catch(() => null)
      if (data) store.value = { ...store.value, [slug]: withDefaults(data) }
    }
  } catch { /* network failure → fall through to defaults */ }
  finally { hydrating.delete(slug) }
}

function schedulePush(slug: string) {
  if (typeof window === 'undefined') return
  if (pushTimers[slug]) clearTimeout(pushTimers[slug]!)
  pushTimers[slug] = setTimeout(() => {
    const body = store.value[slug]
    if (!body) return
    fetch(`${API_PREFIX}/${encodeURIComponent(slug)}/bio-config`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => { /* swallow — UI already optimistic */ })
  }, 300)
}

function keyFor(slug: string): string {
  return slug || '__default__'
}

// Deep-merge defaults with the stored entry so newly-added BioConfig fields
// don't read as `undefined` for users who saved before the schema grew.
function withDefaults(stored: Partial<BioConfig> | undefined): BioConfig {
  const d = defaults()
  if (!stored) return d
  return {
    ...d,
    ...stored,
    profileData: { ...d.profileData, ...(stored.profileData || {}) },
    sections: { ...d.sections, ...(stored.sections || {}) },
    locationData: { ...d.locationData, ...(stored.locationData || {}) },
    hoursData: Array.isArray(stored.hoursData) && stored.hoursData.length ? stored.hoursData : d.hoursData,
    socials: Array.isArray(stored.socials) ? stored.socials : d.socials,
    loyaltyData: { ...d.loyaltyData, ...(stored.loyaltyData || {}) },
    reviewsData: { ...d.reviewsData, ...(stored.reviewsData || {}) },
    externalLinks: { ...d.externalLinks, ...(stored.externalLinks || {}) },
    cuisines: Array.isArray(stored.cuisines) ? stored.cuisines : d.cuisines,
  }
}

export function useBioConfig(slugRef: Ref<string | null | undefined> | string) {
  const getKey = (): string => {
    const v = typeof slugRef === 'string' ? slugRef : slugRef.value
    return keyFor(v || '')
  }

  // Trigger lazy hydration on first call. Safe to call repeatedly; the
  // function early-outs if already hydrated or in-flight.
  hydrate(getKey())

  const config = computed<BioConfig>({
    get: () => withDefaults(store.value[getKey()]),
    set: (next: BioConfig) => {
      const k = getKey()
      store.value = { ...store.value, [k]: next }
      schedulePush(k)
    },
  })

  const updateConfig = (patch: Partial<BioConfig>) => {
    config.value = { ...config.value, ...patch }
  }

  // True when the restaurant has saved at least one meaningful field (so the
  // public page can decide whether to show the "Configura tu bio" CTA).
  const hasConfig = computed<boolean>(() => {
    const c = store.value[getKey()]
    if (!c) return false
    return !!(c.description?.trim() || c.coverUrl || c.logoUrl)
  })

  return { config, updateConfig, hasConfig }
}
