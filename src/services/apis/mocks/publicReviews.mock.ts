// Public reviews mock for `pages/r/[slug]/reviews.vue` and the embed
// widget. The data is deterministic per store slug (mulberry32) so
// reloads don't shuffle reviewers.
//
// Future API contract (single endpoint suggested):
//   GET /api/store/{slug}/reviews →
//     { stats, gallery, travelerPhotos, questions, reviews }

import {
  mulberry32,
  pick,
  randomInt,
  hashSeed,
  CITIES as SEED_CITIES,
  FIRST_NAMES,
  LAST_NAMES,
  placeholderDishPhoto,
} from './_seed'

export interface MockReviewsOptions {
  /** Reviewers can be from anywhere; this seeds the rotation when no city pool is given. */
  defaultCityName?: string
}

export interface MockReviewsStats {
  overall: number
  label: string
  total: number
  distribution: { label: string; count: number; stars: number }[]
  categories: { name: string; score: number }[]
}

export interface MockGalleryPhoto {
  id: string
  type: 'hero' | 'interior' | 'food' | 'exterior'
  category: string
}

export interface MockTravelerPhoto {
  id: string
  type: 'food' | 'interior' | 'exterior'
  user: string
}

export interface MockQuestion {
  text: string
  replies: number
  date: string
}

export interface MockReviewItem {
  id: string
  author: string
  location: string
  contributions: number
  initial: string
  color: string
  date: string
  rating: number
  title: string
  text: string
  photos: number
  helpful: number
  ownerReply: string | null
  tags: string[]
  imageUrl?: string
  // Real photo URLs (data-URLs for user-submitted reviews). When present,
  // these render as <img> in the review card instead of placeholder gradients.
  photoUrls?: string[]
  // Set on reviews that passed verification (receipt + place photo).
  verified?: boolean
  // True on every review of a user that has reached the habitual threshold
  // (≥3 verified reviews) in the same slug.
  habitual?: boolean
  // Sort hint so user-submitted reviews land at the top of the list.
  isUserReview?: boolean
  // Where the review came from. 'guavagram' = written in-app (can be verified);
  // 'google' = synced from the restaurant's Google Business Profile. Real
  // Google sync needs a Guava endpoint (GBP read API) — until then a subset of
  // the mock list is flagged 'google' so the dual-source UI is exercised.
  source?: 'guavagram' | 'google'
}

const REVIEW_AVATAR_COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#0ea5e9', '#a855f7', '#ef4444', '#14b8a6']

const REVIEW_TEMPLATES: Array<{
  rating: number
  title: string
  text: string
  photos: number
  helpful: number
  ownerReply: string | null
  tags: string[]
}> = [
  {
    rating: 5,
    title: 'Increíble experiencia gastronómica',
    text: 'Todo estaba perfecto. La atención del personal fue excepcional y los platos superaron mis expectativas. El ambiente es acogedor y elegante. Sin duda volveremos. La relación calidad precio es inmejorable para la zona.',
    photos: 2,
    helpful: 8,
    ownerReply: '¡Muchas gracias! Nos alegra mucho que disfrutaras de la experiencia. Te esperamos pronto.',
    tags: ['romantic', 'intimate', 'long-dinner', 'good-value'],
  },
  {
    rating: 4,
    title: 'Muy buena comida, servicio mejorable',
    text: 'Los platos estaban deliciosos, especialmente el chuletón. El único pero es que tardaron bastante en traer la cuenta. Pero repetiremos seguro. Las patatas bravas espectaculares.',
    photos: 0,
    helpful: 3,
    ownerReply: null,
    tags: ['friends', 'lively', 'generous'],
  },
  {
    rating: 5,
    title: 'El mejor restaurante de la zona',
    text: 'Llevamos viniendo años y nunca decepciona. La calidad de los ingredientes es top y el trato es familiar. Muy recomendable para cualquier ocasión. El menú del día es imbatible.',
    photos: 3,
    helpful: 12,
    ownerReply: '¡Sois como de la familia! Gracias por vuestra fidelidad.',
    tags: ['family', 'celebration', 'kids-menu', 'good-value'],
  },
  {
    rating: 3,
    title: 'Correcto pero esperaba más',
    text: 'El sitio está bien y la comida es correcta, pero para el precio que tiene esperaba algo más elaborado. El postre sí que estaba muy bueno.',
    photos: 1,
    helpful: 2,
    ownerReply: null,
    tags: ['friends', 'quiet'],
  },
]

const TRAVELER_PHOTO_TEMPLATES: Array<{ type: MockTravelerPhoto['type']; nameSeed: string }> = [
  { type: 'food',     nameSeed: 't1' },
  { type: 'food',     nameSeed: 't2' },
  { type: 'interior', nameSeed: 't3' },
  { type: 'food',     nameSeed: 't4' },
  { type: 'food',     nameSeed: 't5' },
  { type: 'exterior', nameSeed: 't6' },
  { type: 'food',     nameSeed: 't7' },
  { type: 'food',     nameSeed: 't8' },
]

const QUESTIONS: MockQuestion[] = [
  { text: '¿Ofrecen alternativas sin gluten?', replies: 3, date: 'dic 2024' },
  { text: '¿Admiten mascotas en la terraza?', replies: 5, date: 'mar 2025' },
]

const GALLERY_PHOTOS: MockGalleryPhoto[] = [
  { id: 'g1', type: 'hero',     category: 'Negocio'  },
  { id: 'g2', type: 'interior', category: 'Interior' },
  { id: 'g3', type: 'food',     category: 'Comida'   },
  { id: 'g4', type: 'food',     category: 'Comida'   },
  { id: 'g5', type: 'exterior', category: 'Exterior' },
]

const STATS: MockReviewsStats = {
  overall: 4.5,
  label: 'Excelente',
  total: 209,
  distribution: [
    { label: 'Excelente', count: 84, stars: 5 },
    { label: 'Muy bueno', count: 55, stars: 4 },
    { label: 'Normal',    count: 38, stars: 3 },
    { label: 'Malo',      count: 20, stars: 2 },
    { label: 'Pésimo',    count: 12, stars: 1 },
  ],
  categories: [
    { name: 'Comida',         score: 4.6 },
    { name: 'Servicio',       score: 4.3 },
    { name: 'Calidad/precio', score: 4.1 },
    { name: 'Ambiente',       score: 4.5 },
  ],
}

const REVIEW_DATES = ['mar 2026', 'feb 2026', 'ene 2026', 'dic 2025']

export function getMockReviewsStats(): MockReviewsStats {
  return STATS
}

export function getMockReviewsGallery(): MockGalleryPhoto[] {
  return GALLERY_PHOTOS
}

export function getMockReviewsQuestions(): MockQuestion[] {
  return QUESTIONS
}

export function getMockReviewsTravelerPhotos(slug: string): MockTravelerPhoto[] {
  const rand = mulberry32(hashSeed(`${slug}-traveler`))
  return TRAVELER_PHOTO_TEMPLATES.map((tpl, i) => {
    const first = pick(rand, FIRST_NAMES)
    const lastInitial = pick(rand, LAST_NAMES).slice(0, 1)
    return {
      id: `${slug}-t${i + 1}`,
      type: tpl.type,
      user: `${first} ${lastInitial}.`,
    }
  })
}

export function getMockReviewsList(slug: string, _opts: MockReviewsOptions = {}): MockReviewItem[] {
  const rand = mulberry32(hashSeed(`${slug}-reviews`))

  return REVIEW_TEMPLATES.map((tpl, i) => {
    const first = pick(rand, FIRST_NAMES)
    const last = pick(rand, LAST_NAMES)
    const author = `${first} ${last}`
    const location = pick(rand, SEED_CITIES)
    const date = REVIEW_DATES[i] ?? REVIEW_DATES[0]!
    const color = REVIEW_AVATAR_COLORS[i % REVIEW_AVATAR_COLORS.length]!
    return {
      id: String(i + 1),
      author,
      location,
      contributions: randomInt(rand, 8, 90),
      initial: first.slice(0, 1),
      color,
      date,
      rating: tpl.rating,
      title: tpl.title,
      text: tpl.text,
      photos: tpl.photos,
      helpful: tpl.helpful,
      ownerReply: tpl.ownerReply,
      tags: [...tpl.tags],
      imageUrl: tpl.photos > 0 ? placeholderDishPhoto(`${slug}-r${i + 1}`, 800, 600) : undefined,
      // Flag ~1 in 3 as Google-sourced so both badges show until the real
      // GBP sync endpoint lands.
      source: (i % 3 === 1 ? 'google' : 'guavagram') as 'guavagram' | 'google',
    }
  })
}
