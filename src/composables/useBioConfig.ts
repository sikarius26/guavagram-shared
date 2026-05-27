import { ref, computed, type Ref } from 'vue'
import { publicApiClient } from '~/services/apis/api.client.public'

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

  // ── Bookings availability (days × turnos + salas) ──────────────────────
  // Configured from the dashboard's bookings editor. The public bio doesn't
  // render this directly yet (it shows the promo calendar + a simple CTA);
  // round-trips via brandingSettings so a future Reservas widget can read it.
  bookingAvailability: Array<{
    dayIndex: number  // 0=Lunes .. 6=Domingo
    open: boolean
    turnos: Array<{ id: string; name: string; timeFrom: string; timeTo: string }>
  }>
  bookingSalas: Array<{ id: string; name: string; capacity?: number }>

  // ── Dishes preview ──────────────────────────────────────────────────────
  dishesTitle: string
  dishesMediaMode: 'photo' | 'video' | 'text'
  // IDs of catalog items the owner marked as "Recomendados del chef".
  // Stored here so the choice survives reloads (useCatalog.featuredIds is
  // module-scope only and resets on every page load).
  featuredItemIds: string[]

  // ── Badges ──────────────────────────────────────────────────────────────
  priceRange: string
  rating: number
}

// Endpoint prefix for the per-app local mock store. Used as fallback when
// no /platform sync handler is registered (e.g. anonymous public bio at
// :3003 that doesn't have a storeId yet).
const API_PREFIX = '/api/_mock/store'

// /platform sync — when the call site provides a storeId + a profile fetcher,
// `hydrate()` reads from /platform/storeprofile/{storeId}/profile (mapping
// `description, logoUrl, accentColor, useDarkMode` to native fields and
// EVERYTHING else from `brandingSettings`). Decision 2026-05-25: persist all
// BioConfig overflow inside the existing `brandingSettings: any` bag on
// StoreProfileViewModel rather than ampliar el modelo backend (see
// docs/BACKEND_GAPS.md sección 1).
//
// When the call site ALSO provides `putProfile`, autosaves (schedulePush)
// PUT directly to /platform via that callback instead of the local mock.
// This is what turns the editor into a "every edit reflects in Guava
// platform" experience: the manual Save button becomes a forced flush
// rather than the only path to persistence.
export interface BioConfigSync {
  storeId: string | null | undefined | Ref<string | null | undefined>
  fetchProfile: (storeId: string) => Promise<PlatformProfileShape | null>
  putProfile?: (storeId: string, profile: PlatformProfileShape) => Promise<void>
}

export interface PlatformProfileShape {
  description?: string
  logoUrl?: string
  accentColor?: string
  useDarkMode?: boolean
  brandingSettings?: any
}

// Inverse of platformToBioConfig: splits a BioConfig back into the 4 native
// StoreProfileViewModel columns + the brandingSettings overflow bag. Used by
// schedulePush so autosaves round-trip through the same endpoint the manual
// Save button uses (storeprofileProfilePost). Anything not in BioConfig
// (campaigns, bookingPromos with their own panel-scoped autosave paths) is
// preserved by the caller's putProfile implementation, which merges this
// payload with the last cached profile before POSTing.
function bioConfigToPlatform(c: BioConfig): PlatformProfileShape {
  return {
    description: c.description,
    logoUrl: c.logoUrl,
    accentColor: c.accentColor,
    useDarkMode: c.useDarkMode,
    brandingSettings: {
      coverUrl: c.coverUrl,
      // StoreProfileViewModel has no native logoUrl column and its dynamic
      // (de)serializer drops undeclared keys, so the native logoUrl above never
      // survives the round-trip. Mirror it into brandingSettings (the free-form
      // bag, same as coverUrl) so a bio-editor logo upload actually reaches the
      // public bio + loyalty landing.
      logoUrl: c.logoUrl,
      bgColor: c.bgColor,
      textColor: c.textColor,
      skinId: c.skinId,
      skinTypography: c.skinTypography,
      skinRadius: c.skinRadius,
      pageBgMode: c.pageBgMode,
      pageTextureId: c.pageTextureId,
      pageTextureTint: c.pageTextureTint,
      ctaMode: c.ctaMode,
      profileData: c.profileData,
      sections: c.sections,
      locationData: c.locationData,
      locationSyncedWithGoogle: c.locationSyncedWithGoogle,
      hoursData: c.hoursData,
      hoursSyncedWithGoogle: c.hoursSyncedWithGoogle,
      cuisines: c.cuisines,
      priceLevel: c.priceLevel,
      externalLinks: c.externalLinks,
      socials: c.socials,
      loyaltyData: c.loyaltyData,
      reviewsData: c.reviewsData,
      bookingAvailability: c.bookingAvailability,
      bookingSalas: c.bookingSalas,
      dishesTitle: c.dishesTitle,
      dishesMediaMode: c.dishesMediaMode,
      featuredItemIds: c.featuredItemIds,
      priceRange: c.priceRange,
      rating: c.rating,
    },
  }
}

const syncHandlers: Record<string, BioConfigSync> = {}

function resolveStoreId(sync: BioConfigSync): string | null {
  const v = sync.storeId
  const raw = (v && typeof v === 'object' && 'value' in v) ? (v as Ref<any>).value : v
  return typeof raw === 'string' && raw.length ? raw : null
}

function platformToBioConfig(p: PlatformProfileShape | null): Partial<BioConfig> {
  if (!p) return {}
  const b = (p.brandingSettings && typeof p.brandingSettings === 'object') ? p.brandingSettings : {}
  // Pick native first, then overlay brandingSettings — the bag is the
  // overflow store, so any field that lives there wins over a stale native
  // column. `undefined` keys are dropped so withDefaults() can fill them.
  const merged: Record<string, any> = {
    description: p.description,
    logoUrl: p.logoUrl,
    accentColor: p.accentColor,
    useDarkMode: p.useDarkMode,
    ...b,
  }
  for (const k of Object.keys(merged)) if (merged[k] === undefined) delete merged[k]
  return merged as Partial<BioConfig>
}

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

  bookingAvailability: Array.from({ length: 7 }, (_, i) => ({ dayIndex: i, open: false, turnos: [] })),
  bookingSalas: [],

  dishesTitle: 'Platos estrella',
  dishesMediaMode: 'photo',
  featuredItemIds: [],

  priceRange: '€€',
  rating: 4.8,
})

// Module-scoped per-slug cache, hydrated lazily from the API on first
// access (client-only) and PUT-debounced on writes. Two components in the
// same app reading the same slug share the same source of truth.
const store = ref<Record<string, BioConfig>>({})
const hydrating = new Set<string>()
const pushTimers: Record<string, ReturnType<typeof setTimeout> | null> = {}

async function hydrate(slug: string, opts: { force?: boolean } = {}) {
  if (typeof window === 'undefined') return
  if (hydrating.has(slug)) return
  // `force` skips the cache guard so callers can re-fetch after a save.
  // Without this the public bio kept showing the first response we ever
  // got even after the owner edited brandingSettings in admin and saved.
  if (!opts.force && store.value[slug]) return
  hydrating.add(slug)
  try {
    // 1) Preferred: /platform/storeprofile/{storeId}/profile. The call site
    // (admin GuavagramPanel) registers a fetcher when it knows the storeId;
    // this is the source of truth that survives F5 because the save button
    // POSTs back to the same endpoint.
    const sync = syncHandlers[slug]
    const storeId = sync ? resolveStoreId(sync) : null
    if (sync && storeId) {
      try {
        const p = await sync.fetchProfile(storeId)
        if (p) {
          store.value = { ...store.value, [slug]: withDefaults(platformToBioConfig(p)) }
          return
        }
      } catch (err: any) {
        const status = err?.status ?? err?.response?.status
        // 404 = store doesn't exist on /platform yet (typical for the dev
        // demo storeId before /r/new is run). Fall through to mock so the
        // editor still has a working baseline.
        if (status !== 404) console.warn('[useBioConfig] /platform fetch failed', status, err)
      }
    }
    // 2) Public anonymous read via /public/store/{slug}/profile. Same shape
    // (StoreProfileViewModel with brandingSettings), no JWT required, so the
    // public bio at :3003 sees the same data the owner just saved from the
    // admin editor. Skipped when slug is the fallback key (__default__).
    if (slug && slug !== '__default__') {
      try {
        const p: any = await publicApiClient.publicStoreProfile(slug)
        if (p) {
          const brandingKeys = p?.brandingSettings && typeof p.brandingSettings === 'object'
            ? Object.keys(p.brandingSettings).length
            : 0
          console.log(`[useBioConfig] hydrated ${slug} via publicStoreProfile — accentColor=${p.accentColor || '(none)'}, brandingKeys=${brandingKeys}, hasCover=${!!(p.brandingSettings?.coverUrl)}, skin=${p.brandingSettings?.skinId || '(none)'}`)
          store.value = { ...store.value, [slug]: withDefaults(platformToBioConfig(p)) }
          return
        }
      } catch (err: any) {
        const status = err?.status ?? err?.response?.status
        if (status !== 404) console.warn('[useBioConfig] publicStoreProfile failed', status)
      }
    }
    // 3) Last resort: per-app local mock (`/api/_mock/store/<slug>/bio-config`)
    // — keeps dev flowing when neither /platform nor /public are reachable.
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
    // Prefer /platform when a sync handler with a write callback is
    // registered (admin GuavagramPanel does this on mount). The BioConfig is
    // mapped back to the StoreProfileViewModel shape (4 native fields +
    // brandingSettings bag) so the autosave round-trips through the same
    // endpoint the Save button posts to. Without this, every keystroke went
    // to a per-app local mock and changes never reached Guava platform until
    // the user clicked Save.
    const sync = syncHandlers[slug]
    const storeId = sync ? resolveStoreId(sync) : null
    if (sync?.putProfile && storeId) {
      sync.putProfile(storeId, bioConfigToPlatform(body)).catch((err: any) => {
        const status = err?.status ?? err?.response?.status
        // 404 = demo storeId not on /platform yet; silent. Other errors are
        // surfaced as warnings so dev notices outages without scary toasts.
        if (status && status !== 404) console.warn('[useBioConfig] /platform PUT failed', status)
      })
      return
    }
    // Fallback: per-app local mock — used by the public bio at :3003 (no
    // storeId in scope) and dev environments without backend reachability.
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
    featuredItemIds: Array.isArray(stored.featuredItemIds) ? stored.featuredItemIds : d.featuredItemIds,
    bookingAvailability: Array.isArray(stored.bookingAvailability) && stored.bookingAvailability.length === 7
      ? stored.bookingAvailability
      : d.bookingAvailability,
    bookingSalas: Array.isArray(stored.bookingSalas) ? stored.bookingSalas : d.bookingSalas,
  }
}

export function useBioConfig(
  slugRef: Ref<string | null | undefined> | string,
  sync?: BioConfigSync,
) {
  const getKey = (): string => {
    const v = typeof slugRef === 'string' ? slugRef : slugRef.value
    return keyFor(v || '')
  }

  // Register the /platform sync handler for this slug (if the caller
  // provided one). hydrate() consults the registry per-slug, so multiple
  // mount points sharing the same slug see the same source.
  if (sync) syncHandlers[getKey()] = sync

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

  // Force a fresh fetch from backend, bypassing the per-slug cache. Use
  // after a save to ensure the new brandingSettings round-trip is visible
  // immediately (and so the public bio reflects style/skin changes without
  // waiting for the next browser session).
  const refresh = async () => {
    const k = getKey()
    // Wipe the cached entry so the hydrate() cache guard doesn't bail.
    if (store.value[k]) {
      const next = { ...store.value }
      delete next[k]
      store.value = next
    }
    await hydrate(k, { force: true })
  }

  return { config, updateConfig, hasConfig, refresh }
}
