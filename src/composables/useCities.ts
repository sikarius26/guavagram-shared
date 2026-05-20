import { computed } from 'vue'

export interface CityInfo {
  slug: string
  name: string
  heroImageUrl: string
  lat: number
  lng: number
}

const BARCELONA_HERO = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuoYqLZsinnmdzTq12_G29ZzlsGd8grPq6NRlYFrv6mg56qWAoFhANKkpW9-C4djIJmzsf-zJQFT8Sq2GVwBXpMsmGZS1qgOUgD62OgdTxfJW1-zQvYqURfxPuORsoXW233getUFFiiBDi3cXcIl8EEoarmckk03scLmacc_K-OxZ6F0U-A3n7LD1WpYTR0nvL5KZpaOSgoWXDBdIYd5Cj___Se_gxfwOH9yMowPOTeVzj172pTYCqyt-lH4xQrqYwozVuWbQI2tIh'

const CITIES: CityInfo[] = [
  { slug: 'barcelona', name: 'Barcelona', heroImageUrl: BARCELONA_HERO,                                           lat: 41.3851, lng:  2.1734 },
  { slug: 'madrid',    name: 'Madrid',    heroImageUrl: 'https://picsum.photos/seed/city-madrid/1200/600',        lat: 40.4168, lng: -3.7038 },
  { slug: 'valencia',  name: 'Valencia',  heroImageUrl: 'https://picsum.photos/seed/city-valencia/1200/600',      lat: 39.4699, lng: -0.3763 },
  { slug: 'sevilla',   name: 'Sevilla',   heroImageUrl: 'https://picsum.photos/seed/city-sevilla/1200/600',       lat: 37.3891, lng: -5.9845 },
  { slug: 'bilbao',    name: 'Bilbao',    heroImageUrl: 'https://picsum.photos/seed/city-bilbao/1200/600',        lat: 43.2630, lng: -2.9350 },
  { slug: 'malaga',    name: 'Málaga',    heroImageUrl: 'https://picsum.photos/seed/city-malaga/1200/600',        lat: 36.7213, lng: -4.4213 },
  { slug: 'zaragoza',  name: 'Zaragoza',  heroImageUrl: 'https://picsum.photos/seed/city-zaragoza/1200/600',      lat: 41.6488, lng: -0.8891 },
]

const bySlug = new Map(CITIES.map(c => [c.slug, c]))
const slugByName = new Map(CITIES.map(c => [c.name.toLowerCase(), c.slug]))

export function useCities() {
  const list = computed(() => CITIES)
  const featured = computed(() => CITIES.slice(0, 6))

  function findBySlug(slug: string | undefined | null): CityInfo | undefined {
    if (!slug) return undefined
    return bySlug.get(slug.toLowerCase())
  }
  function slugFromName(name: string | undefined | null): string | undefined {
    if (!name) return undefined
    return slugByName.get(name.toLowerCase())
  }
  function nameFromSlug(slug: string | undefined | null): string | undefined {
    return findBySlug(slug)?.name
  }

  return { list, featured, findBySlug, slugFromName, nameFromSlug }
}
