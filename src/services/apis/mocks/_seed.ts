// Shared seed utilities and placeholder helpers for ALL mock fixtures
// (public + admin). The goal: every mock file imports from here, so when
// the real API ships we change one place per domain (the *.mock.ts files
// disappear or get gated by `import.meta.dev`) and we keep a single
// catalog of "fake" inputs.
//
// Migration note: this used to live at `mocks/admin/_seed.ts`. The admin
// file now re-exports from here so existing imports keep working.

export function mulberry32(seed: number): () => number {
  let t = seed >>> 0
  return function () {
    t = (t + 0x6D2B79F5) >>> 0
    let r = t
    r = Math.imul(r ^ (r >>> 15), r | 1)
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

export function pick<T>(rand: () => number, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)]!
}

export function randomInt(rand: () => number, min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min
}

export function pad(n: number, size = 2): string {
  return String(n).padStart(size, '0')
}

export function daysAgoISO(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

// Stable string → integer hash so a given seed always produces the same
// pravatar/picsum image. Avoids `Math.random()` flicker between reloads.
export function hashSeed(input: string | number): number {
  const s = String(input)
  let h = 2166136261 >>> 0
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// ---------- Catalogs of stable demo strings ----------

export const CITIES = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga', 'Zaragoza', 'Valladolid', 'Granada', 'Palma']
export const FIRST_NAMES = ['Juliana', 'Marc', 'Aitor', 'Laia', 'Diego', 'Rocío', 'Iván', 'Noa', 'Pau', 'Carla', 'Nico', 'Sofía', 'Andrés', 'Lucía', 'Álvaro', 'María', 'Hugo', 'Valentina', 'Bruno', 'Clara']
export const LAST_NAMES = ['Ramírez', 'Torres', 'Martín', 'Pérez', 'Giménez', 'Navarro', 'Alonso', 'Molina', 'Serrano', 'Vega', 'Ibáñez', 'Cano', 'Ferrer', 'Blanco', 'Castillo']
export const RESTAURANT_NAMES = [
  'La Cantina del Pez', 'Sushi Kumo', 'Picasso Brasa', 'Taco Libre', 'Trattoria Nonna',
  'Bistró Aurora', 'Burger Atlas', 'Ramen Taisho', 'Pizzería Lombarda', 'Asador La Brasa',
  'Café Central', 'Taberna Elvira', 'Sakura Izakaya', 'El Rincón de Ana', 'Mercado Fuego',
  'Bao Street', 'Viña Norte', 'Tapa & Rock', 'Pan de Ayer', 'Saffron House',
]
export const CATEGORIES = ['Food Blogger', 'Family', 'Travel', 'Lifestyle', 'Nightlife', 'Brunch', 'Couple', 'Fitness', 'Influencer']
export const HANDLES = ['juliana.r', 'marcfoodie', 'aitor.eats', 'laia.bites', 'diegograms', 'rocio.bcn', 'ivanshots', 'noabites', 'paublog', 'carlaeats', 'nico.vlog', 'sofiaeats', 'andres.gram', 'luciabites', 'alvarodrive', 'maria.insta', 'hugofood', 'valentina.v', 'bruno.brb', 'clara.c']

export function fullName(rand: () => number): string {
  return `${pick(rand, FIRST_NAMES)} ${pick(rand, LAST_NAMES)}`
}

export function emailFor(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ /g, '.') + '@mail.com'
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

// ---------- Placeholder image helpers ----------
//
// One layer between components and the placeholder providers we use today
// (i.pravatar.cc, picsum.photos). When we wire the real CDN, we change
// THESE helpers and nothing else.
//
// Rules:
//  - Always derive image identity from a stable seed (handle, slug, id).
//  - Never use `Math.random()` here — output must be reproducible.
//  - Components and pages MUST go through these helpers; no literal URLs
//    to pravatar/unsplash/picsum anywhere else in `app/`.

const PRAVATAR_RANGE = 70 // i.pravatar.cc supports img=1..70

export function placeholderAvatar(seed: string | number, size = 200): string {
  const idx = (hashSeed(seed) % PRAVATAR_RANGE) + 1
  return `https://i.pravatar.cc/${size}?img=${idx}`
}

export function placeholderUserPhoto(seed: string | number, size = 200): string {
  return placeholderAvatar(seed, size)
}

export function placeholderRestaurantPhoto(seed: string | number, width = 600, height = 400): string {
  return `https://picsum.photos/seed/restaurant-${slugify(String(seed))}/${width}/${height}`
}

export function placeholderDishPhoto(seed: string | number, width = 600, height = 400): string {
  return `https://picsum.photos/seed/dish-${slugify(String(seed))}/${width}/${height}`
}

export function placeholderCityPhoto(citySlug: string, width = 1200, height = 600): string {
  return `https://picsum.photos/seed/city-${slugify(citySlug)}/${width}/${height}`
}

export function placeholderBrandLogo(seed: string | number, size = 200): string {
  return `https://picsum.photos/seed/brand-${slugify(String(seed))}/${size}/${size}`
}

export function placeholderCoverPhoto(seed: string | number, width = 1200, height = 600): string {
  return `https://picsum.photos/seed/cover-${slugify(String(seed))}/${width}/${height}`
}
