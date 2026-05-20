import { reactive, computed, ref } from 'vue'

export interface CustomCenter {
  lat: number
  lng: number
  label: string
}

export type PriceLevel = 1 | 2 | 3 | 4

export interface DeckFilterState {
  // Multi-select. Empty array = no cuisine filter.
  cuisines: string[]
  customCenter: CustomCenter | null
  radiusKm: number
  useDeviceLocation: boolean
  minRating: number | undefined
  priceLevels: PriceLevel[]
}

export type LocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable'

const DEFAULT_RADIUS_KM = 10
export const RADIUS_MIN_KM = 1
export const RADIUS_MAX_KM = 50

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function useDiscoveryDeckFilters() {
  const filters = reactive<DeckFilterState>({
    cuisines: [],
    customCenter: null,
    radiusKm: DEFAULT_RADIUS_KM,
    useDeviceLocation: false,
    minRating: undefined,
    priceLevels: [],
  })

  const deviceCoords = ref<{ lat: number; lng: number } | null>(null)
  const locationStatus = ref<LocationStatus>('idle')

  function toggleCuisine(key: string) {
    const idx = filters.cuisines.indexOf(key)
    if (idx >= 0) filters.cuisines.splice(idx, 1)
    else filters.cuisines.push(key)
  }

  function clearCuisines() {
    filters.cuisines = []
  }

  function setCustomCenter(c: CustomCenter | null) {
    filters.customCenter = c
    if (c) filters.useDeviceLocation = false
  }

  function setRadius(v: number) {
    const clamped = Math.max(RADIUS_MIN_KM, Math.min(RADIUS_MAX_KM, Math.round(v)))
    filters.radiusKm = clamped
  }

  function setMinRating(v: number | undefined) {
    filters.minRating = v
  }

  function togglePriceLevel(level: PriceLevel) {
    const idx = filters.priceLevels.indexOf(level)
    if (idx >= 0) filters.priceLevels.splice(idx, 1)
    else filters.priceLevels.push(level)
  }

  function clearPriceLevels() {
    filters.priceLevels = []
  }

  function requestLocation() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      locationStatus.value = 'unavailable'
      return
    }
    locationStatus.value = 'requesting'
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        deviceCoords.value = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        filters.useDeviceLocation = true
        filters.customCenter = null
        locationStatus.value = 'granted'
      },
      () => {
        locationStatus.value = 'denied'
        filters.useDeviceLocation = false
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 }
    )
  }

  function disableDeviceLocation() {
    filters.useDeviceLocation = false
  }

  const center = computed<{ lat: number; lng: number; label?: string } | undefined>(() => {
    if (filters.useDeviceLocation && deviceCoords.value) {
      return { ...deviceCoords.value, label: 'Tu ubicación' }
    }
    if (filters.customCenter) return filters.customCenter
    return undefined
  })

  const activeCount = computed(() => {
    let n = 0
    if (filters.cuisines.length > 0) n++
    if (filters.useDeviceLocation || filters.customCenter) n++
    if (filters.radiusKm !== DEFAULT_RADIUS_KM) n++
    if (filters.minRating != null) n++
    if (filters.priceLevels.length > 0) n++
    return n
  })

  return {
    filters,
    center,
    deviceCoords,
    locationStatus,
    activeCount,
    toggleCuisine,
    clearCuisines,
    setCustomCenter,
    setRadius,
    setMinRating,
    togglePriceLevel,
    clearPriceLevels,
    requestLocation,
    disableDeviceLocation,
  }
}
