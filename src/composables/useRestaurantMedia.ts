import { ref, computed, watch } from 'vue'

// Restaurant media (venue photos + menu item photos). Used by the dashboard's
// GuavagramPanel/MenuPanel/ReviewsPanel to add/reorder/tag photos, and by the
// public app's gallery to render them. Backed by `/api/_mock/store/media`
// (single global store today; will key by slug once the dashboard always has
// store context) so the photos survive the process boundary once admin lives
// in a separate Nuxt app.

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

export function useRestaurantMedia() {
  hydrate()
  attachWatchersOnce()

  const setMenuPhoto = (itemId: string, itemName: string, url: string, isVideo: boolean) => {
    menuItemPhotos.value[itemId] = { url, isVideo, itemName }
  }

  const clearMenuPhoto = (itemId: string) => {
    delete menuItemPhotos.value[itemId]
  }

  const addVenuePhoto = (photo: VenuePhoto) => {
    venuePhotos.value.push(photo)
  }

  const removeVenuePhoto = (idx: number) => {
    venuePhotos.value.splice(idx, 1)
  }

  const reorderVenuePhotos = (from: number, to: number) => {
    const arr = [...venuePhotos.value]
    const [moved] = arr.splice(from, 1)
    if (moved) arr.splice(to, 0, moved)
    venuePhotos.value = arr
  }

  const setVenueAspect = (photoId: string, aspect: VenueAspect) => {
    const photo = venuePhotos.value.find(p => p.id === photoId)
    if (photo) photo.aspect = aspect
  }

  // Gallery = venue photos only (menu item photos stay with the menu)
  const galleryEntries = computed(() => venuePhotos.value)

  return {
    menuItemPhotos,
    venuePhotos,
    galleryEntries,
    setMenuPhoto,
    clearMenuPhoto,
    addVenuePhoto,
    removeVenuePhoto,
    reorderVenuePhotos,
    setVenueAspect,
  }
}
