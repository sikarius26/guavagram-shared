import { ref, computed } from 'vue'

export type ReviewTagCategory = 'occasion' | 'ambience' | 'moment' | 'diet' | 'services'

export interface ReviewTag {
  id: string
  label: string
  icon: string
  category: ReviewTagCategory
}

export interface ReviewTagCategoryDef {
  id: ReviewTagCategory
  label: string
  icon: string
  color: string
}

export const REVIEW_TAG_CATEGORIES: ReviewTagCategoryDef[] = [
  { id: 'occasion', label: 'Ocasión', icon: 'mdi-account-group-outline', color: '#ec4899' },
  { id: 'ambience', label: 'Ambiente', icon: 'mdi-lamp-outline', color: '#8b5cf6' },
  { id: 'moment', label: 'Momento', icon: 'mdi-clock-outline', color: '#f59e0b' },
  { id: 'diet', label: 'Dieta y comida', icon: 'mdi-leaf', color: '#22c55e' },
  { id: 'services', label: 'Servicios', icon: 'mdi-star-cog-outline', color: '#06b6d4' },
]

export const REVIEW_TAGS: ReviewTag[] = [
  { id: 'romantic', label: 'Cita romántica', icon: 'mdi-heart-outline', category: 'occasion' },
  { id: 'friends', label: 'Con amigos', icon: 'mdi-account-multiple-outline', category: 'occasion' },
  { id: 'family', label: 'En familia', icon: 'mdi-human-male-female-child', category: 'occasion' },
  { id: 'solo', label: 'Solo / Teletrabajo', icon: 'mdi-laptop', category: 'occasion' },
  { id: 'celebration', label: 'Celebración', icon: 'mdi-party-popper', category: 'occasion' },
  { id: 'group', label: 'Cena de grupo', icon: 'mdi-account-group', category: 'occasion' },
  { id: 'business', label: 'Reunión de trabajo', icon: 'mdi-briefcase-outline', category: 'occasion' },

  { id: 'terrace', label: 'Terraza', icon: 'mdi-umbrella-outline', category: 'ambience' },
  { id: 'instagrammable', label: 'Instagrameable', icon: 'mdi-camera-outline', category: 'ambience' },
  { id: 'quiet', label: 'Tranquilo', icon: 'mdi-volume-low', category: 'ambience' },
  { id: 'lively', label: 'Animado', icon: 'mdi-fire', category: 'ambience' },
  { id: 'intimate', label: 'Íntimo', icon: 'mdi-candle', category: 'ambience' },
  { id: 'live-music', label: 'Música en vivo', icon: 'mdi-music', category: 'ambience' },
  { id: 'views', label: 'Con vistas', icon: 'mdi-image-filter-hdr', category: 'ambience' },

  { id: 'breakfast', label: 'Desayuno', icon: 'mdi-coffee-outline', category: 'moment' },
  { id: 'brunch', label: 'Brunch', icon: 'mdi-egg-fried', category: 'moment' },
  { id: 'quick-lunch', label: 'Comida rápida', icon: 'mdi-flash-outline', category: 'moment' },
  { id: 'long-dinner', label: 'Cena larga', icon: 'mdi-silverware-fork-knife', category: 'moment' },
  { id: 'drinks', label: 'Copas', icon: 'mdi-glass-cocktail', category: 'moment' },
  { id: 'afterwork', label: 'Afterwork', icon: 'mdi-clock-time-five-outline', category: 'moment' },
  { id: 'takeaway', label: 'Para llevar', icon: 'mdi-bag-personal-outline', category: 'moment' },

  { id: 'vegan', label: 'Opciones veganas', icon: 'mdi-sprout-outline', category: 'diet' },
  { id: 'gluten-free', label: 'Sin gluten', icon: 'mdi-barley-off', category: 'diet' },
  { id: 'lactose-free', label: 'Sin lactosa', icon: 'mdi-cup-off-outline', category: 'diet' },
  { id: 'generous', label: 'Raciones generosas', icon: 'mdi-food-drumstick', category: 'diet' },
  { id: 'good-value', label: 'Buena relación calidad-precio', icon: 'mdi-tag-heart-outline', category: 'diet' },
  { id: 'kids-menu', label: 'Carta infantil', icon: 'mdi-baby-face-outline', category: 'diet' },
  { id: 'tasting-menu', label: 'Menú degustación', icon: 'mdi-chef-hat', category: 'diet' },

  { id: 'reservations', label: 'Acepta reservas', icon: 'mdi-calendar-check-outline', category: 'services' },
  { id: 'pet-friendly', label: 'Pet friendly', icon: 'mdi-dog-side', category: 'services' },
  { id: 'accessible', label: 'Accesible', icon: 'mdi-wheelchair-accessibility', category: 'services' },
  { id: 'wifi', label: 'WiFi', icon: 'mdi-wifi', category: 'services' },
  { id: 'plugs', label: 'Enchufes', icon: 'mdi-power-plug-outline', category: 'services' },
  { id: 'parking', label: 'Parking cercano', icon: 'mdi-parking', category: 'services' },
  { id: 'heated-terrace', label: 'Terraza climatizada', icon: 'mdi-fire-alert', category: 'services' },
]

const DEFAULT_ENABLED_TAG_IDS = new Set<string>([
  'romantic', 'friends', 'family', 'celebration', 'group',
  'terrace', 'instagrammable', 'quiet', 'lively', 'intimate',
  'brunch', 'long-dinner', 'drinks', 'takeaway',
  'vegan', 'gluten-free', 'generous', 'good-value', 'kids-menu',
  'reservations', 'pet-friendly', 'accessible', 'wifi',
])

const enabledTagIds = ref<Set<string>>(new Set(DEFAULT_ENABLED_TAG_IDS))

export function useReviewTags() {
  const tagById = (id: string) => REVIEW_TAGS.find(t => t.id === id)

  const tagsByCategory = computed(() => {
    const map = new Map<ReviewTagCategory, ReviewTag[]>()
    for (const cat of REVIEW_TAG_CATEGORIES) map.set(cat.id, [])
    for (const tag of REVIEW_TAGS) map.get(tag.category)!.push(tag)
    return map
  })

  const enabledTags = computed(() =>
    REVIEW_TAGS.filter(t => enabledTagIds.value.has(t.id))
  )

  const isEnabled = (id: string) => enabledTagIds.value.has(id)

  const toggleTag = (id: string) => {
    const next = new Set(enabledTagIds.value)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    enabledTagIds.value = next
  }

  const setCategoryEnabled = (category: ReviewTagCategory, enabled: boolean) => {
    const next = new Set(enabledTagIds.value)
    for (const tag of REVIEW_TAGS) {
      if (tag.category !== category) continue
      if (enabled) next.add(tag.id)
      else next.delete(tag.id)
    }
    enabledTagIds.value = next
  }

  return {
    enabledTagIds,
    enabledTags,
    tagById,
    tagsByCategory,
    isEnabled,
    toggleTag,
    setCategoryEnabled,
  }
}
