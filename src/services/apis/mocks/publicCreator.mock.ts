// Public creator profile mock — replaces inline arrays in
// `pages/u/[slug]/index.vue`. The shape mirrors what
// `publicUserApiClient.publicUserGet(slug)` and `.publicUserStores(slug)`
// will eventually return. When the API is wired, the composable
// `useCreatorPublicData` swaps these calls for the real client.

import {
  placeholderUserPhoto,
  placeholderCoverPhoto,
  placeholderRestaurantPhoto,
  placeholderDishPhoto,
  placeholderBrandLogo,
} from './_seed'

export interface MockPublicCreatorOptions {
  cityName: string
}

export interface MockBadge {
  label: string
  icon: string
}

export interface MockExternalLink {
  externalLinkTypeId: number
  value: string
}

export interface MockFeaturedStore {
  userProfileStoreId: string
  storeId: string
  slugName: string
  name: string
  logoUrl: string
  coverUrl: string
  city: string
  headline: string
  personalNotes: string
  discountCode?: string
  discountPercent?: number
  discountLabel?: string
}

export interface MockWishlistItem {
  id: number
  name: string
  city: string
  source: string
  storeId: string
  slugName: string
  rating: number
  imageUrl: string
}

export interface MockCreatorReviewItem {
  id: number
  caption: string
  storeName: string
  rating: number
  imageUrl: string
}

export interface MockPublicCreatorProfile {
  handle: string
  name: string
  bio: string
  city: string
  profileImageUrl: string
  coverImageUrl: string
  verified: boolean
  badges: MockBadge[]
  stats: { storesCount: number; viewsCount: number; clicksCount: number; followersCount: number }
  externalLinks: MockExternalLink[]
  featuredStore: MockFeaturedStore
  wishlist: MockWishlistItem[]
  reviews: MockCreatorReviewItem[]
}

export interface MockCreatorStore {
  userProfileStoreId: string
  storeId: string
  slugName: string
  name: string
  logoUrl: string
  coverUrl: string
  city: string
  weight: number
  personalPick: boolean
  status: number
  discountCode?: string
  discountPercent?: number
  personalNotes: string
}

const WISHLIST_ITEMS = [
  { name: 'Disfrutar',     slugName: 'disfrutar',     rating: 4.9 },
  { name: 'Dos Palillos',  slugName: 'dos-palillos',  rating: 4.7 },
  { name: 'Enigma',        slugName: 'enigma',        rating: 4.8 },
  { name: 'Cinc Sentits',  slugName: 'cinc-sentits',  rating: 4.6 },
]

const REVIEW_ITEMS = [
  { caption: 'Brunch de domingo en Brunch & Cake', storeName: 'Brunch & Cake', rating: 4.6, slug: 'brunch-and-cake' },
  { caption: 'Cocktails con vistas',                storeName: 'Sky Bar',       rating: 4.3, slug: 'sky-bar' },
  { caption: 'Tartare que quita el hipo',           storeName: 'La Mundana',    rating: 4.9, slug: 'la-mundana' },
  { caption: 'El mejor pastel de chocolate',        storeName: 'Dulcinea',      rating: 5.0, slug: 'dulcinea' },
]

const STORE_ITEMS = [
  { slugName: 'el-nacional',     name: 'El Nacional',    notes: 'Cuatro ambientes en uno. Los tacos son top.',   code: 'MARIA10', percent: 10, personalPick: true  },
  { slugName: 'paradiso',        name: 'Paradiso',       notes: 'Speakeasy premiado. Reserva con tiempo.',        code: 'PARA5',   percent: 5,  personalPick: false },
  { slugName: 'brunch-and-cake', name: 'Brunch & Cake',  notes: 'Mi brunch dominguero obligado.',                 code: undefined, percent: undefined, personalPick: false },
  { slugName: 'teoria-kafka',    name: 'Teoria Kafka',   notes: 'Tapas creativas y carta de vinos brutal.',       code: 'KAFKA15', percent: 15, personalPick: false },
]

export function getMockCreatorWishlist(handle: string, opts: MockPublicCreatorOptions): MockWishlistItem[] {
  return WISHLIST_ITEMS.map((it, i) => ({
    id: i + 1,
    name: it.name,
    city: opts.cityName,
    source: 'guavagram',
    storeId: `mock-w-${i + 1}`,
    slugName: it.slugName,
    rating: it.rating,
    imageUrl: placeholderRestaurantPhoto(it.slugName, 400, 400),
  }))
}

export function getMockCreatorReviews(handle: string, _opts: MockPublicCreatorOptions): MockCreatorReviewItem[] {
  return REVIEW_ITEMS.map((it, i) => ({
    id: i + 1,
    caption: it.caption,
    storeName: it.storeName,
    rating: it.rating,
    imageUrl: placeholderDishPhoto(`${handle}-${it.slug}`, 600, 800),
  }))
}

export function getMockCreatorStores(_handle: string, opts: MockPublicCreatorOptions): MockCreatorStore[] {
  return STORE_ITEMS.map((it, i) => ({
    userProfileStoreId: `mock-${i + 1}`,
    storeId: `mock-s-${i + 1}`,
    slugName: it.slugName,
    name: it.name,
    logoUrl: placeholderBrandLogo(it.slugName, 200),
    coverUrl: placeholderRestaurantPhoto(it.slugName, 600, 450),
    city: opts.cityName,
    weight: i + 1,
    personalPick: it.personalPick,
    status: 1,
    discountCode: it.code,
    discountPercent: it.percent,
    personalNotes: it.notes,
  }))
}

export function getMockPublicCreatorProfile(handle: string, opts: MockPublicCreatorOptions): MockPublicCreatorProfile {
  return {
    handle,
    name: 'Maria Gomez',
    bio: `${opts.cityName} food curator. Descubro lugares con alma — desde brunchs luminosos hasta cenas con cocktail escondido.`,
    city: `${opts.cityName}, ES`,
    profileImageUrl: placeholderUserPhoto(`${handle}-profile`, 400),
    coverImageUrl: placeholderCoverPhoto(`${handle}-cover`, 1200, 600),
    verified: true,
    badges: [
      { label: 'Top Curator',   icon: 'mdi-trophy' },
      { label: 'Brunch Expert', icon: 'mdi-egg-fried' },
    ],
    stats: { storesCount: 12, viewsCount: 15420, clicksCount: 3280, followersCount: 1840 },
    externalLinks: [
      { externalLinkTypeId: 1, value: handle },
      { externalLinkTypeId: 2, value: handle },
      { externalLinkTypeId: 3, value: `https://youtube.com/@${handle}` },
      { externalLinkTypeId: 4, value: `https://${handle}.com` },
    ],
    featuredStore: {
      userProfileStoreId: 'mock-featured',
      storeId: 'mock-store-1',
      slugName: 'la-mundana',
      name: 'La Mundana',
      logoUrl: placeholderBrandLogo('la-mundana', 200),
      coverUrl: placeholderRestaurantPhoto('la-mundana-featured', 1200, 675),
      city: opts.cityName,
      headline: 'Mi lugar favorito para una cena con amigas',
      personalNotes: 'El tartare de atun y los cocteles son espectaculares. Pide el Aperol speciale — no esta en la carta.',
      discountCode: 'MARIA10',
      discountPercent: 10,
      discountLabel: '10% OFF en toda la carta',
    },
    wishlist: getMockCreatorWishlist(handle, opts),
    reviews: getMockCreatorReviews(handle, opts),
  }
}
