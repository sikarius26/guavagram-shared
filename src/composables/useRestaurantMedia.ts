import { ref, computed, watch, type Ref } from 'vue'
import { useBioConfig } from './useBioConfig'

// Restaurant media (venue photos + menu item photos). Used by the dashboard's
// GuavagramPanel/MenuPanel/ReviewsPanel to add/reorder/tag photos, and by the
// public app's gallery to render them.
//
// `venuePhotos` lives in `brandingSettings.venuePhotos` on the StoreProfile —
// same path the rest of the bio config uses. When a slug is passed to the
// composable we proxy reads/writes through useBioConfig so the gallery stays
// in sync across the bio, /menu sidebar strip and /reviews header gallery,
// AND survives F5 / app-process boundaries via the real backend (no more
// `.mock-store.json` write-through file).
//
// When called WITHOUT a slug, we fall back to the legacy module-scoped ref
// (`/api/_mock/store/media`) — kept temporarily so admin panels not yet
// updated keep compiling. Will be removed once every caller passes the slug.

export type VenueAspect = 'interior' | 'exterior' | 'terraza' | 'barra' | 'equipo' | 'general'

export const VENUE_ASPECTS: Array<{ id: VenueAspect; label: string; icon: string; color: string }> = [
  { id: 'interior', label: 'Interior',  icon: 'mdi-sofa-outline',          color: '#8b5cf6' },
  { id: 'exterior', label: 'Exterior',  icon: 'mdi-home-outline',          color: '#0ea5e9' },
  { id: 'terraza',  label: 'Terraza',   icon: 'mdi-umbrella-outline',      color: '#22c55e' },
  { id: 'barra',    label: 'Barra',     icon: 'mdi-glass-cocktail',        color: '#f59e0b' },
  { id: 'equipo',   label: 'Equipo',    icon: 'mdi-account-group-outline', color: '#ec4899' },
  { id: 'general',  label: 'Ambiente',  icon: 'mdi-image-outline',         color: '#6366f1' },
]

export const getAspect = (id: VenueAspect) => VENUE_ASPECTS.find(a => a.id === id) || VENUE_ASPECTS[5]

export interface VenuePhoto {
  id: string
  aspect: VenueAspect
  url?: string
  isVideo?: boolean
  // Fallback visual for demo placeholders when no url
  icon?: string
  color?: string
  gradient?: string
}

interface MediaState {
  venuePhotos: VenuePhoto[]
  menuItemPhotos: Record<string, { url: string; isVideo: boolean; itemName: string }>
}

const API_URL = '/api/_mock/store/media'

const defaultVenuePhotos = (): VenuePhoto[] => ([
  { id: 'v1', aspect: 'interior', icon: 'mdi-sofa-outline',   color: '#8b5cf6', gradient: 'from-purple-50 to-violet-50' },
  { id: 'v2', aspect: 'barra',    icon: 'mdi-glass-cocktail', color: '#f59e0b', gradient: 'from-amber-100 to-orange-100' },
])

const venuePhotos = ref<VenuePhoto[]>(defaultVenuePhotos())
const menuItemPhotos = ref<Record<string, { url: string; isVideo: boolean; itemName: string }>>({})

let hydrated = false
let hydrating = false
let pushTimer: ReturnType<typeof setTimeout> | null = null

// Strip session-scoped blob: URLs from a photo list. Old entries created
// before we switched gallery uploads to base64 still live in the mock
// backend file and would 404 on every render. Returning them filtered also
// lets the next schedulePush rewrite the cleaner list to disk.
function dropDeadBlobUrls(photos: VenuePhoto[]): VenuePhoto[] {
  return photos.filter(p => !p.url || !p.url.startsWith('blob:'))
}

async function hydrate() {
  if (typeof window === 'undefined') return
  if (hydrated || hydrating) return
  hydrating = true
  let didCleanup = false
  try {
    const res = await fetch(API_URL)
    if (res.ok) {
      const data: MediaState | null = await res.json().catch(() => null)
      if (data) {
        if (Array.isArray(data.venuePhotos)) {
          const cleaned = dropDeadBlobUrls(data.venuePhotos)
          if (cleaned.length !== data.venuePhotos.length) didCleanup = true
          venuePhotos.value = cleaned
        }
        if (data.menuItemPhotos && typeof data.menuItemPhotos === 'object') {
          const cleaned: typeof data.menuItemPhotos = {}
          for (const [k, v] of Object.entries(data.menuItemPhotos)) {
            if (!v?.url?.startsWith('blob:')) cleaned[k] = v
            else didCleanup = true
          }
          menuItemPhotos.value = cleaned
        }
      }
    }
  } catch { /* network failure → defaults */ }
  finally {
    hydrating = false
    hydrated = true
    // If we filtered out dead blob: URLs during hydrate, push the cleaned
    // state back to disk so the next reload doesn't re-load the same dead
    // entries. Without this the watcher's schedulePush short-circuits
    // because `hydrated` flipped after the assignment.
    if (didCleanup) schedulePush()
  }
}

function schedulePush() {
  if (typeof window === 'undefined') return
  if (!hydrated) return // skip until after hydration so first PUT doesn't overwrite real data with defaults
  if (pushTimer) clearTimeout(pushTimer)
  pushTimer = setTimeout(() => {
    const body: MediaState = {
      venuePhotos: venuePhotos.value,
      menuItemPhotos: menuItemPhotos.value,
    }
    fetch(API_URL, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => {})
  }, 300)
}

// One global watcher persists any mutation to either ref.
let watchersAttached = false
function attachWatchersOnce() {
  if (watchersAttached) return
  watchersAttached = true
  watch(venuePhotos, schedulePush, { deep: true })
  watch(menuItemPhotos, schedulePush, { deep: true })
}

export function useRestaurantMedia(slug?: Ref<string | null | undefined> | string) {
  // Slug-bound mode: venuePhotos lives in bioConfig.venuePhotos (= the same
  // brandingSettings bag the admin Save / autosave POSTs to /platform). Any
  // mutation here triggers useBioConfig.schedulePush, so the gallery
  // round-trips through Guava platform like every other bio field.
  const bioBound = (() => {
    if (!slug) return null
    const slugVal = typeof slug === 'string' ? slug : (slug.value || '')
    if (!slugVal) return null
    const { config } = useBioConfig(slug as any)
    const venuePhotosBound = computed<VenuePhoto[]>({
      get: () => (Array.isArray(config.value.venuePhotos) ? (config.value.venuePhotos as VenuePhoto[]) : []),
      set: (next: VenuePhoto[]) => { (config.value as any).venuePhotos = next },
    })
    return { config, venuePhotosBound }
  })()

  if (!bioBound) {
    // Legacy mode (no slug): keep the local-mock state alive for old callers.
    hydrate()
    attachWatchersOnce()
  }

  const activeVenuePhotos = bioBound
    ? bioBound.venuePhotosBound
    : venuePhotos

  const setMenuPhoto = (itemId: string, itemName: string, url: string, isVideo: boolean) => {
    menuItemPhotos.value[itemId] = { url, isVideo, itemName }
  }

  const clearMenuPhoto = (itemId: string) => {
    delete menuItemPhotos.value[itemId]
  }

  const addVenuePhoto = (photo: VenuePhoto) => {
    if (bioBound) {
      const next = [...activeVenuePhotos.value, photo]
      activeVenuePhotos.value = next
    } else {
      venuePhotos.value.push(photo)
    }
  }

  const removeVenuePhoto = (idx: number) => {
    if (bioBound) {
      const next = [...activeVenuePhotos.value]
      next.splice(idx, 1)
      activeVenuePhotos.value = next
    } else {
      venuePhotos.value.splice(idx, 1)
    }
  }

  const reorderVenuePhotos = (from: number, to: number) => {
    const arr = [...activeVenuePhotos.value]
    const [moved] = arr.splice(from, 1)
    if (moved) arr.splice(to, 0, moved)
    if (bioBound) activeVenuePhotos.value = arr
    else venuePhotos.value = arr
  }

  const setVenueAspect = (photoId: string, aspect: VenueAspect) => {
    if (bioBound) {
      const next = activeVenuePhotos.value.map(p => p.id === photoId ? { ...p, aspect } : p)
      activeVenuePhotos.value = next
    } else {
      const photo = venuePhotos.value.find(p => p.id === photoId)
      if (photo) photo.aspect = aspect
    }
  }

  // Gallery = venue photos only (menu item photos stay with the menu)
  const galleryEntries = computed(() => activeVenuePhotos.value)

  return {
    menuItemPhotos,
    venuePhotos: activeVenuePhotos,
    galleryEntries,
    setMenuPhoto,
    clearMenuPhoto,
    addVenuePhoto,
    removeVenuePhoto,
    reorderVenuePhotos,
    setVenueAspect,
  }
}
