import { ref, computed } from 'vue'

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

const menuItemPhotos = ref<Record<string, { url: string; isVideo: boolean; itemName: string }>>({})

const venuePhotos = ref<VenuePhoto[]>([
  { id: 'v1', aspect: 'interior', icon: 'mdi-sofa-outline',     color: '#8b5cf6', gradient: 'from-purple-50 to-violet-50' },
  { id: 'v2', aspect: 'barra',    icon: 'mdi-glass-cocktail',   color: '#f59e0b', gradient: 'from-amber-100 to-orange-100' },
])

export function useRestaurantMedia() {
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
