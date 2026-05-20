// Reactive "current city" context. Replaces every hardcoded "Barcelona"
// literal in pages/components. Today the city is sticky in localStorage
// and falls back to Barcelona; later this can be driven by geolocation,
// user preference, or a /api/me endpoint with no callsite changes.
//
// Usage:
//   const { currentCity, currentCityName, currentCitySlug, setCity } = useCityContext()
//   <p>Restaurantes en {{ currentCityName }}</p>
//
// SSR-safe: uses Nuxt `useState` for shared reactive state and only
// touches `localStorage` on the client.

import { computed, watch } from 'vue'
import { useCities, type CityInfo } from './useCities'

const STORAGE_KEY = 'guavagram.city.slug.v1'
const DEFAULT_CITY_SLUG = 'barcelona'

export function useCityContext() {
  const { findBySlug, list } = useCities()

  const slug = useState<string>('city.context.slug', () => {
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored && findBySlug(stored)) return stored
      } catch { /* ignore */ }
    }
    return DEFAULT_CITY_SLUG
  })

  // Persist on client whenever slug changes.
  if (typeof window !== 'undefined') {
    watch(slug, (next) => {
      try { localStorage.setItem(STORAGE_KEY, next) } catch { /* ignore */ }
    })
  }

  const currentCity = computed<CityInfo>(() => {
    return findBySlug(slug.value) ?? findBySlug(DEFAULT_CITY_SLUG) ?? list.value[0]!
  })

  const currentCityName = computed(() => currentCity.value.name)
  const currentCitySlug = computed(() => currentCity.value.slug)
  const currentCityCoords = computed(() => ({ lat: currentCity.value.lat, lng: currentCity.value.lng }))

  function setCity(nextSlug: string): boolean {
    const found = findBySlug(nextSlug)
    if (!found) return false
    slug.value = found.slug
    return true
  }

  return {
    currentCity,
    currentCityName,
    currentCitySlug,
    currentCityCoords,
    setCity,
  }
}
