import { computed, type ComputedRef } from 'vue'
import { getMockCreators } from '~/services/apis/mocks/creatorMarketplace.mock'
import { MOCK_STORE_BIOS } from '~/services/apis/mocks/storeBio.mock'

export type DiscoveryEntity = 'creators' | 'restaurants'

export interface DiscoveryStats {
  followers?: number
  views?: number
  rating?: number
  reviewsCount?: number
}

export interface DiscoveryCoupon {
  label: string
  caption?: string
}

export interface DiscoveryItem {
  id: string
  slug: string
  kind: DiscoveryEntity
  name: string
  bio: string
  city: string
  cuisine?: string[]
  expertise?: string[]
  imageUrl: string
  coverImageUrl?: string
  // Gallery shown when the user taps through the deck card (Instagram-stories
  // style). First image should match imageUrl. Falls back to [imageUrl] when
  // missing so tap navigation degrades gracefully.
  gallery?: string[]
  verified: boolean
  badge?: string
  stats: DiscoveryStats
  coupon?: DiscoveryCoupon
  lat?: number
  lng?: number
  priceLevel?: 1 | 2 | 3 | 4
}

export interface DiscoveryFilterValues {
  city?: string
  cuisine?: string
  // Multi-select cuisines (preferred). Falls back to `cuisine` (single) when
  // empty so legacy callers keep working.
  cuisines?: string[]
  expertise?: string
  search?: string
  minRating?: number
  priceLevels?: Array<1 | 2 | 3 | 4>
}

interface PublicUserProfile {
  handle: string
  name: string
  bio?: string
  city?: string
  profileImageUrl?: string
  verified?: boolean
  stats?: { storesCount?: number; viewsCount?: number; clicksCount?: number }
}

function badgeFromBadges(badges: string[] | undefined): string | undefined {
  if (!badges || badges.length === 0) return undefined
  if (badges.includes('GUAVAGRAM_RECOMMENDED')) return "Editor's Pick"
  if (badges.includes('TOP_RATED')) return 'Top Rated'
  if (badges.includes('NEW')) return 'New'
  return undefined
}

function creatorToDiscoveryItem(c: any): DiscoveryItem {
  return {
    id: c.handle,
    slug: c.handle,
    kind: 'creators',
    name: c.displayName ?? c.handle,
    bio: c.bio || '',
    city: c.city || '',
    expertise: Array.isArray(c.categories) ? c.categories : [],
    imageUrl: c.avatarUrl || '',
    coverImageUrl: c.coverUrl || undefined,
    verified: (c.badges || []).length > 0 || (c.rating ?? 0) >= 4.5,
    badge: badgeFromBadges(c.badges),
    stats: { followers: c.followers, rating: c.rating },
  }
}

function publicUserToDiscoveryItem(u: PublicUserProfile): DiscoveryItem {
  return {
    id: u.handle,
    slug: u.handle,
    kind: 'creators',
    name: u.name,
    bio: u.bio || u.city || '',
    city: u.city || '',
    expertise: [],
    imageUrl: u.profileImageUrl || '',
    verified: !!u.verified,
    badge: u.verified ? "Editor's Pick" : undefined,
    stats: { views: u.stats?.viewsCount },
  }
}

// City coordinates used to scatter mock restaurants geographically.
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Barcelona: { lat: 41.3851, lng:  2.1734 },
  Madrid:    { lat: 40.4168, lng: -3.7038 },
  Valencia:  { lat: 39.4699, lng: -0.3763 },
  Sevilla:   { lat: 37.3891, lng: -5.9845 },
  Bilbao:    { lat: 43.2630, lng: -2.9350 },
  Málaga:    { lat: 36.7213, lng: -4.4213 },
  Zaragoza:  { lat: 41.6488, lng: -0.8891 },
}
function jitter(base: number, seed: number): number {
  const n = (Math.sin(seed * 9301 + 49297) * 233280) % 1
  return base + (n - 0.5) * 0.04
}
function coordsFor(city: string, seed: number): { lat?: number; lng?: number } {
  const base = CITY_COORDS[city]
  if (!base) return {}
  return { lat: jitter(base.lat, seed), lng: jitter(base.lng, seed + 1) }
}

const RESTAURANTS_MOCK: DiscoveryItem[] = [
  { id: 'store-1',  slug: 'bodega-nova',   kind: 'restaurants', name: 'Bodega Nova',     bio: 'Catalana moderna con toque natural',        city: 'Barcelona', cuisine: ['gastronomy', 'wines'],        imageUrl: 'https://picsum.photos/seed/rest-bodeganova/800/1000',  verified: true,  badge: "Editor's Pick", stats: { rating: 4.7, reviewsCount: 284, followers: 3400 }, coupon: { label: '-15%', caption: 'en tu primera visita' } },
  { id: 'store-2',  slug: 'brunch-co',     kind: 'restaurants', name: 'Brunch & Co',     bio: 'Brunch de domingo que quita el sentido',     city: 'Madrid',    cuisine: ['brunch', 'coffee'],           imageUrl: 'https://picsum.photos/seed/rest-brunchco/800/1000',    verified: true,  badge: 'Top Rated',     stats: { rating: 4.6, reviewsCount: 512, followers: 5100 }, coupon: { label: 'Café gratis', caption: 'con cualquier brunch' } },
  { id: 'store-3',  slug: 'pepe-tapas',    kind: 'restaurants', name: 'Pepe Tapas',      bio: 'Tapeo sevillano sin complejos',              city: 'Sevilla',   cuisine: ['tapas', 'traditional'],       imageUrl: 'https://picsum.photos/seed/rest-pepetapas/800/1000',   verified: true,  badge: 'Top Rated',     stats: { rating: 4.7, reviewsCount: 401, followers: 2800 }, coupon: { label: '2x1 tapas', caption: 'de lunes a jueves' } },
  { id: 'store-4',  slug: 'green-lab',     kind: 'restaurants', name: 'Green Lab',       bio: 'Cocina vegana creativa',                      city: 'Valencia',  cuisine: ['vegan'],                      imageUrl: 'https://picsum.photos/seed/rest-greenlab/800/1000',    verified: false,                          stats: { rating: 4.5, reviewsCount: 198, followers: 1600 }, coupon: { label: '-10%', caption: 'menú del día' } },
  { id: 'store-5',  slug: 'cata-gourmet',  kind: 'restaurants', name: 'Cata Gourmet',    bio: 'Menú degustación de temporada',              city: 'Barcelona', cuisine: ['fine-dining', 'gastronomy'],  imageUrl: 'https://picsum.photos/seed/rest-catagourmet/800/1000', verified: true,  badge: "Editor's Pick", stats: { rating: 4.8, reviewsCount: 156, followers: 2100 }, coupon: { label: 'Maridaje incluido', caption: 'en el degustación' } },
  { id: 'store-6',  slug: 'pintxo-palace', kind: 'restaurants', name: 'Pintxo Palace',   bio: 'Pintxos y txakoli frente al Guggenheim',     city: 'Bilbao',    cuisine: ['pintxos', 'wines'],           imageUrl: 'https://picsum.photos/seed/rest-pintxopalace/800/1000', verified: true,                          stats: { rating: 4.6, reviewsCount: 340, followers: 2500 }, coupon: { label: 'Txakoli gratis', caption: 'con 5 pintxos' } },
  { id: 'store-7',  slug: 'sakura-rol',    kind: 'restaurants', name: 'Sakura Rol',      bio: 'Omakase con producto local',                  city: 'Madrid',    cuisine: ['asian', 'fine-dining'],       imageUrl: 'https://picsum.photos/seed/rest-sakurarol/800/1000',   verified: true,  badge: 'Top Rated',     stats: { rating: 4.9, reviewsCount: 221, followers: 4200 }, coupon: { label: '-20%', caption: 'omakase entre semana' } },
  { id: 'store-8',  slug: 'la-pasta-nera', kind: 'restaurants', name: 'La Pasta Nera',   bio: 'Pasta fresca italiana artesanal',            city: 'Barcelona', cuisine: ['italian'],                    imageUrl: 'https://picsum.photos/seed/rest-pastanera/800/1000',   verified: false,                          stats: { rating: 4.4, reviewsCount: 140, followers: 1100 }, coupon: { label: 'Postre gratis', caption: 'con cada pasta' } },
  { id: 'store-9',  slug: 'dulce-taller',  kind: 'restaurants', name: 'Dulce Taller',    bio: 'Pastelería de autor y café de especialidad', city: 'Málaga',    cuisine: ['desserts', 'coffee'],         imageUrl: 'https://picsum.photos/seed/rest-dulcetaller/800/1000', verified: false,                          stats: { rating: 4.6, reviewsCount: 95,  followers: 900 },  coupon: { label: '-5€', caption: 'en tu segunda visita' } },
  { id: 'store-10', slug: 'street-bao',    kind: 'restaurants', name: 'Street Bao',      bio: 'Bao buns y street food asiático',            city: 'Valencia',  cuisine: ['street-food', 'asian'],       imageUrl: 'https://picsum.photos/seed/rest-streetbao/800/1000',   verified: false,                          stats: { rating: 4.3, reviewsCount: 88,  followers: 760 },  coupon: { label: '3x2 baos', caption: 'hasta las 18h' } },
  { id: 'store-11', slug: 'bar-molino',    kind: 'restaurants', name: 'Bar Molino',      bio: 'Cocteles de autor sin pretensiones',         city: 'Madrid',    cuisine: ['cocktails'],                  imageUrl: 'https://picsum.photos/seed/rest-barmolino/800/1000',   verified: false,                          stats: { rating: 4.5, reviewsCount: 118, followers: 1000 }, coupon: { label: '2x1 cócteles', caption: 'de 19 a 21h' } },
  { id: 'store-12', slug: 'mar-y-brasa',   kind: 'restaurants', name: 'Mar y Brasa',     bio: 'Pescado a la brasa frente al mar',           city: 'Málaga',    cuisine: ['gastronomy', 'traditional'],  imageUrl: 'https://picsum.photos/seed/rest-marbrasa/800/1000',    verified: true,                          stats: { rating: 4.7, reviewsCount: 260, followers: 1800 }, coupon: { label: '-15%', caption: 'menú de mediodía' } },
].map((r, i) => {
  // For seeded restaurants we have curated food photos in the bio mock —
  // reuse them so the deck card, the tap-through gallery and the public bio
  // page all show the same images.
  const seeded = MOCK_STORE_BIOS.find(b => b.slug === r.slug)
  const imageUrl = seeded?.cover || r.imageUrl
  const gallery = seeded?.gallery || [
    r.imageUrl,
    `https://picsum.photos/seed/${r.slug}-dish/800/1000`,
    `https://picsum.photos/seed/${r.slug}-interior/800/1000`,
    `https://picsum.photos/seed/${r.slug}-detail/800/1000`,
  ]
  return {
    ...r,
    imageUrl,
    ...coordsFor(r.city, i + 1),
    priceLevel: ([3, 2, 2, 2, 4, 3, 4, 2, 2, 2, 2, 3] as const)[i] ?? 2,
    gallery,
  }
}) as DiscoveryItem[]

function creatorsFromMocks(): DiscoveryItem[] {
  return getMockCreators()
    .map(creatorToDiscoveryItem)
    .map((item, i) => ({ ...item, ...coordsFor(item.city, i + 100) }))
}

async function fetchCreatorsFromApi(apiBase: string): Promise<DiscoveryItem[]> {
  try {
    const users = await $fetch<PublicUserProfile[]>(`${apiBase}/public/user`)
    if (!Array.isArray(users) || users.length === 0) return []
    return users.map(publicUserToDiscoveryItem)
  } catch {
    return []
  }
}

function matches(item: DiscoveryItem, f: DiscoveryFilterValues): boolean {
  if (f.city && item.city.toLowerCase() !== f.city.toLowerCase()) return false
  // Multi-select wins over the legacy single-cuisine field. An item matches
  // when ANY of its cuisines matches ANY of the requested ones (OR semantics).
  const requested = (f.cuisines && f.cuisines.length > 0)
    ? f.cuisines.map(c => c.toLowerCase())
    : (f.cuisine ? [f.cuisine.toLowerCase()] : [])
  if (requested.length > 0) {
    const itemCuisines = (item.cuisine || []).map(c => c.toLowerCase())
    if (!itemCuisines.some(c => requested.includes(c))) return false
  }
  if (f.expertise && !(item.expertise || []).some(c => c.toLowerCase() === f.expertise!.toLowerCase())) return false
  if (f.minRating != null && (item.stats.rating ?? 0) < f.minRating) return false
  if (f.priceLevels && f.priceLevels.length > 0) {
    if (item.priceLevel == null || !f.priceLevels.includes(item.priceLevel)) return false
  }
  if (f.search) {
    const q = f.search.trim().toLowerCase()
    if (!q) return true
    const haystack = `${item.name} ${item.bio} ${item.slug} ${item.city}`.toLowerCase()
    if (!haystack.includes(q)) return false
  }
  return true
}

export function useDiscoveryData(filtersGetter?: () => DiscoveryFilterValues) {
  const config = useRuntimeConfig()
  const apiBase = (config.public as any)?.apiBase || ''

  const { data: creatorsRaw } = useAsyncData<DiscoveryItem[]>(
    'discovery-creators',
    async () => {
      const fromApi = await fetchCreatorsFromApi(apiBase)
      return fromApi.length > 0 ? fromApi : creatorsFromMocks()
    },
    { default: () => [] }
  )

  const creators = computed<DiscoveryItem[]>(() => creatorsRaw.value || [])
  const restaurants = computed<DiscoveryItem[]>(() => RESTAURANTS_MOCK)
  const combined = computed<DiscoveryItem[]>(() => [...creators.value, ...restaurants.value])

  const currentFilters = () => filtersGetter?.() ?? {}

  const filteredCreators = computed(() => creators.value.filter(i => matches(i, currentFilters())))
  const filteredRestaurants = computed(() => restaurants.value.filter(i => matches(i, currentFilters())))
  const filteredCombined = computed(() => [...filteredCreators.value, ...filteredRestaurants.value])

  function byEntity(entity: DiscoveryEntity): ComputedRef<DiscoveryItem[]> {
    return entity === 'creators' ? filteredCreators : filteredRestaurants
  }

  return {
    creators, restaurants, combined,
    filteredCreators, filteredRestaurants, filteredCombined,
    byEntity,
    matches,
  }
}

export function useDiscoverySections(
  entity: () => DiscoveryEntity,
  filtersGetter: () => DiscoveryFilterValues
) {
  const { byEntity } = useDiscoveryData(filtersGetter)

  const list = computed<DiscoveryItem[]>(() => byEntity(entity()).value)

  const featured = computed<DiscoveryItem[]>(() => {
    const badged = list.value.filter(i => i.badge === "Editor's Pick" || i.badge === 'Top Rated')
    const rest = list.value.filter(i => !badged.includes(i))
    return [...badged, ...rest].slice(0, 2)
  })

  const top = computed<DiscoveryItem[]>(() => {
    const ranked = [...list.value].sort(
      (a, b) => ((b.stats.rating || 0) - (a.stats.rating || 0)) ||
                 ((b.stats.followers || 0) - (a.stats.followers || 0))
    )
    return ranked.slice(0, 4)
  })

  const trending = computed<DiscoveryItem[]>(() => {
    const ranked = [...list.value].sort(
      (a, b) => ((b.stats.followers || 0) - (a.stats.followers || 0)) ||
                 ((b.stats.views || 0) - (a.stats.views || 0))
    )
    return ranked.slice(0, 6)
  })

  return { list, featured, top, trending }
}
