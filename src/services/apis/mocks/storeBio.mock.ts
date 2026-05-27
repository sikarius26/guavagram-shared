// Mock public-store payloads used as a fallback when the backend endpoints
// (`/public/store/{slug}/profile|info|menu|promotions`) are unreachable.
// Each entry is a fully-configured demo restaurant: 4-image food gallery,
// branded GuavaGram skin, address, schedule, suggested top picks and one
// promo banner — enough to render the public bio end-to-end.

import { StoreProfileViewModel } from '../models/store-profile-view-model'
import { StoreInfoViewModel } from '../models/store-info-view-model'
import { MenuViewModel } from '../models/menu-view-model'
import { PromotionViewModel } from '../models/promotion-view-model'
import type { BioConfig } from '../../../composables/useBioConfig'

const u = (id: string, w = 800, h = 1000) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80&auto=format`

export interface MockStoreBio {
  slug: string
  storeId: string
  name: string
  description: string
  cuisine: string
  city: string
  // Cover + gallery share the same photo IDs the discovery deck cycles through.
  cover: string
  gallery: string[]
  logoUrl: string
  isVerified: boolean
  accentColor: string
  useDarkMode: boolean
  skin: 'classic' | 'portada' | 'editorial' | 'showcase'
  pageBackgroundColor: string
  // Display-only badges that surface in the preview header. Synced with Google
  // in production; here we just mock plausible values so the preview ships
  // populated.
  priceRange: '€' | '€€' | '€€€' | '€€€€'
  rating: number
  phoneDialCode: string
  phoneNumber: string
  emailAddress: string
  address: {
    line1: string
    city: string
    state: string
    postalCode: string
    lat: number
    lon: number
  }
  weeklySchedule: Record<string, { isOpen: boolean; openTime: string; closeTime: string } | undefined>
  externalLinks: { instagram?: string; facebook?: string; tiktok?: string; web?: string }
  // Sister stores in the chain. Drives the "Otros locales" section.
  groupStores?: Array<{ storeId: string; slugName: string; displayName: string; logoUrl?: string; city?: string }>
  menuItems: Array<{
    id: string
    name: string
    description: string
    price: number
    imageId: string
    suggested?: boolean
  }>
  promotions: Array<{ name: string; description: string; imageId: string }>
  // Campañas (Campaigns) — large promotional cards in a horizontal carousel.
  campaigns?: Array<{
    icon: string
    badge?: string
    title: string
    subtitle: string
    price?: string
    schedule?: string
    cta: string
    accent: string
  }>
  // Tarjeta de Fidelización — loyalty club card.
  loyalty?: { title: string; subtitle: string; description: string; cta: string }
  // Opiniones — featured reviews shown in the bio.
  reviews?: Array<{ author: string; rating: number; text: string }>
}

export const MOCK_STORE_BIOS: MockStoreBio[] = [
  // 1. Cata Gourmet — fine dining tasting menu, EDITORIAL skin
  {
    slug: 'cata-gourmet',
    storeId: 'store-5',
    name: 'Cata Gourmet',
    description:
      'Menú degustación de temporada con producto de proximidad. 9 pases que cuentan la historia del Mediterráneo.',
    cuisine: 'fine-dining',
    city: 'Barcelona',
    cover: u('1414235077428-338989a2e8c0'),
    gallery: [
      u('1414235077428-338989a2e8c0'),
      u('1559339352-11d035aa65de'),
      u('1473093295043-cdd812d0e601'),
      u('1551218808-94e220e084d2'),
    ],
    logoUrl: u('1414235077428-338989a2e8c0', 200, 200),
    isVerified: true,
    accentColor: '#0f6b4a',
    useDarkMode: false,
    skin: 'editorial',
    pageBackgroundColor: '#f8f6f1',
    priceRange: '€€€€',
    rating: 4.8,
    phoneDialCode: '+34',
    phoneNumber: '932 145 678',
    emailAddress: 'reservas@catagourmet.es',
    address: {
      line1: 'Carrer de Provença, 245',
      city: 'Barcelona',
      state: 'Barcelona',
      postalCode: '08008',
      lat: 41.394,
      lon: 2.156,
    },
    weeklySchedule: {
      monday: undefined,
      tuesday: { isOpen: true, openTime: '20:00', closeTime: '23:30' },
      wednesday: { isOpen: true, openTime: '20:00', closeTime: '23:30' },
      thursday: { isOpen: true, openTime: '20:00', closeTime: '23:30' },
      friday: { isOpen: true, openTime: '13:30', closeTime: '15:30' },
      saturday: { isOpen: true, openTime: '13:30', closeTime: '15:30' },
      sunday: { isOpen: true, openTime: '13:30', closeTime: '15:30' },
    },
    externalLinks: {
      instagram: 'https://instagram.com/catagourmet',
      web: 'https://catagourmet.es',
    },
    menuItems: [
      { id: 'cg-1', name: 'Snack de mar', description: 'Tartaleta de erizo y caviar cítrico', price: 18, imageId: '1559339352-11d035aa65de', suggested: true },
      { id: 'cg-2', name: 'Calçot a la brasa', description: 'Con romesco ahumado y aceite de oliva arbequina', price: 16, imageId: '1473093295043-cdd812d0e601', suggested: true },
      { id: 'cg-3', name: 'Cigala curada', description: 'Sobre dashi de algas y manzana verde', price: 24, imageId: '1565958011703-44f9829ba187', suggested: true },
      { id: 'cg-4', name: 'Cordero de los Pirineos', description: 'Lacado en miel del Montseny y mostaza antigua', price: 32, imageId: '1504674900247-0877df9cc836', suggested: true },
      { id: 'cg-5', name: 'Sorbete de hinojo', description: 'Con yogur de oveja y ralladura de yuzu', price: 12, imageId: '1551782450-a2132b4ba21d' },
      { id: 'cg-6', name: 'Maridaje de 5 vinos', description: 'Selección del sumiller con cada pase', price: 45, imageId: '1510812431401-41d2bd2722f3' },
    ],
    promotions: [
      {
        name: 'Maridaje incluido en el degustación',
        description: '5 copas seleccionadas por nuestro sumiller, sin coste extra de martes a jueves.',
        imageId: '1510812431401-41d2bd2722f3',
      },
    ],
    campaigns: [
      { icon: 'mdi-glass-wine', badge: 'Maridaje', title: 'Cena con vino', subtitle: 'Menú degustación + 5 copas', price: '95€', schedule: 'Mar-Jue', cta: 'Reservar', accent: '#d4a42a' },
      { icon: 'mdi-silverware-fork-knife', badge: 'Estrenos', title: 'Menú primavera', subtitle: '9 pases nuevos cada temporada', schedule: 'Hasta junio', cta: 'Ver menú', accent: '#0f6b4a' },
    ],
    loyalty: { title: 'Club Cata', subtitle: 'Fidelización gourmet', description: 'Acumula visitas y desbloquea cenas privadas con el chef.', cta: 'UNIRSE AL CLUB' },
    reviews: [
      { author: 'Marc Andreu', rating: 5, text: 'Una experiencia gastronómica de otro nivel. El maridaje vale cada euro.' },
      { author: 'Sofia Ruiz', rating: 5, text: 'Producto impecable. El cordero del 5º pase fue inolvidable.' },
    ],
  },

  // 2. Brunch & Co — bright weekend brunch, CLASSIC skin
  {
    slug: 'brunch-co',
    storeId: 'store-2',
    name: 'Brunch & Co',
    description:
      'Brunch de domingo todos los días. Especialidad: huevos benedictinos, pancakes y café de especialidad.',
    cuisine: 'brunch',
    city: 'Madrid',
    cover: u('1559329007-40df8a9345d8'),
    gallery: [
      u('1559329007-40df8a9345d8'),
      u('1466637574441-749b8f19452f'),
      u('1495474472287-4d71bcdd2085'),
      u('1432139509613-5c4255815697'),
    ],
    logoUrl: u('1495474472287-4d71bcdd2085', 200, 200),
    isVerified: true,
    accentColor: '#ff8a3d',
    useDarkMode: false,
    skin: 'classic',
    pageBackgroundColor: '#fff8ef',
    priceRange: '€€',
    rating: 4.6,
    phoneDialCode: '+34',
    phoneNumber: '914 562 010',
    emailAddress: 'hola@brunchandco.es',
    address: {
      line1: 'Calle de Hermosilla, 92',
      city: 'Madrid',
      state: 'Madrid',
      postalCode: '28006',
      lat: 40.428,
      lon: -3.679,
    },
    weeklySchedule: {
      monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      tuesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      wednesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      thursday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      friday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      saturday: { isOpen: true, openTime: '09:30', closeTime: '18:00' },
      sunday: { isOpen: true, openTime: '09:30', closeTime: '18:00' },
    },
    externalLinks: {
      instagram: 'https://instagram.com/brunchandco',
      tiktok: 'https://tiktok.com/@brunchandco',
    },
    menuItems: [
      { id: 'bc-1', name: 'Huevos benedictinos clásicos', description: 'Muffin inglés, jamón curado, holandesa casera', price: 13.5, imageId: '1466637574441-749b8f19452f', suggested: true },
      { id: 'bc-2', name: 'Pancakes con frutos rojos', description: 'Stack de tres con mantequilla de vainilla y sirope', price: 11, imageId: '1432139509613-5c4255815697', suggested: true },
      { id: 'bc-3', name: 'Açaí bowl tropical', description: 'Açaí, mango, plátano, granola y coco', price: 9.5, imageId: '1540189549336-e6e99c3679fe', suggested: true },
      { id: 'bc-4', name: 'Avocado toast', description: 'Pan masa madre, aguacate, huevo poché y dukkah', price: 10, imageId: '1551782450-a2132b4ba21d', suggested: true },
      { id: 'bc-5', name: 'Flat white', description: 'Café de especialidad, leche entera microespumada', price: 3.2, imageId: '1495474472287-4d71bcdd2085' },
      { id: 'bc-6', name: 'Limonada de jengibre', description: 'Casera con menta fresca y miel cruda', price: 4, imageId: '1546069901-ba9599a7e63c' },
    ],
    promotions: [
      {
        name: 'Café gratis con cualquier brunch',
        description: 'De lunes a viernes hasta las 12h. Pide cualquier plato y el café va con nosotros.',
        imageId: '1495474472287-4d71bcdd2085',
      },
    ],
    campaigns: [
      { icon: 'mdi-coffee-outline', badge: 'Mañanas', title: 'Café gratis', subtitle: 'Con cualquier brunch L-V', schedule: 'Antes de las 12h', cta: 'Ver carta', accent: '#ff8a3d' },
      { icon: 'mdi-cake-variant-outline', badge: 'Fines de semana', title: 'Pancakes ilimitados', subtitle: 'Niños hasta 12 años', price: '6,50€', schedule: 'Sáb-Dom', cta: 'Reservar', accent: '#fb923c' },
    ],
    loyalty: { title: 'Club Brunch', subtitle: 'Fidelización dulce', description: 'Cada 8 brunchs, el siguiente corre por nuestra cuenta.', cta: 'EMPEZAR A SUMAR' },
    reviews: [
      { author: 'Ana López', rating: 5, text: 'Los benedictinos son adictivos. El sitio es luminoso y el equipo encantador.' },
      { author: 'Carlos Vega', rating: 4, text: 'Buen brunch, café excelente. A veces hay cola pero merece la pena.' },
    ],
  },

  // 3. Sakura Rol — Japanese omakase, PORTADA skin
  {
    slug: 'sakura-rol',
    storeId: 'store-7',
    name: 'Sakura Rol',
    description:
      'Omakase de 12 pases con producto japonés y atún rojo de almadraba. Barra de 8 plazas, una sesión por noche.',
    cuisine: 'asian',
    city: 'Madrid',
    cover: u('1547573854-74d2a71d0826'),
    gallery: [
      u('1547573854-74d2a71d0826'),
      u('1565958011703-44f9829ba187'),
      u('1517248135467-4c7edcad34c4'),
      u('1559339352-11d035aa65de'),
    ],
    logoUrl: u('1547573854-74d2a71d0826', 200, 200),
    isVerified: true,
    accentColor: '#c0392b',
    useDarkMode: true,
    skin: 'portada',
    pageBackgroundColor: '#1a1010',
    priceRange: '€€€€',
    rating: 4.9,
    phoneDialCode: '+34',
    phoneNumber: '915 678 234',
    emailAddress: 'omakase@sakurarol.es',
    address: {
      line1: 'Calle de Ayala, 24',
      city: 'Madrid',
      state: 'Madrid',
      postalCode: '28001',
      lat: 40.426,
      lon: -3.685,
    },
    weeklySchedule: {
      monday: undefined,
      tuesday: { isOpen: true, openTime: '20:30', closeTime: '23:00' },
      wednesday: { isOpen: true, openTime: '20:30', closeTime: '23:00' },
      thursday: { isOpen: true, openTime: '20:30', closeTime: '23:00' },
      friday: { isOpen: true, openTime: '20:30', closeTime: '23:30' },
      saturday: { isOpen: true, openTime: '20:30', closeTime: '23:30' },
      sunday: undefined,
    },
    externalLinks: {
      instagram: 'https://instagram.com/sakurarol',
      web: 'https://sakurarol.es',
    },
    menuItems: [
      { id: 'sr-1', name: 'Nigiri de toro', description: 'Atún rojo de almadraba madurado 7 días', price: 12, imageId: '1547573854-74d2a71d0826', suggested: true },
      { id: 'sr-2', name: 'Sashimi de hamachi', description: 'Pez limón con yuzu kosho y sal de Maldon', price: 18, imageId: '1565958011703-44f9829ba187', suggested: true },
      { id: 'sr-3', name: 'Roll Sakura', description: 'Salmón flameado, aguacate, kizami wasabi', price: 16, imageId: '1559339352-11d035aa65de', suggested: true },
      { id: 'sr-4', name: 'Tempura de gamba blanca', description: 'Gamba de Huelva, sal verde y limón asado', price: 14, imageId: '1473093295043-cdd812d0e601', suggested: true },
      { id: 'sr-5', name: 'Omakase 12 pases', description: 'Selección del chef. Reserva con 24h de antelación', price: 95, imageId: '1517248135467-4c7edcad34c4' },
      { id: 'sr-6', name: 'Sake premium', description: 'Junmai daiginjo de la prefectura de Niigata', price: 12, imageId: '1510812431401-41d2bd2722f3' },
    ],
    promotions: [
      {
        name: '-20% omakase entre semana',
        description: 'De martes a jueves el omakase de 12 pases con descuento. Reserva online.',
        imageId: '1547573854-74d2a71d0826',
      },
    ],
    campaigns: [
      { icon: 'mdi-fish', badge: 'Premium', title: 'Omakase 12 pases', subtitle: 'Selección del chef · 8 plazas/noche', price: '95€', schedule: 'Mar-Sáb', cta: 'Reservar', accent: '#c0392b' },
      { icon: 'mdi-glass-cocktail', badge: 'Maridaje', title: 'Sake pairing', subtitle: '5 sakes premium con el omakase', price: '+45€', cta: 'Añadir', accent: '#e74c3c' },
    ],
    loyalty: { title: 'Club Sakura', subtitle: 'Reservas prioritarias', description: 'Acceso anticipado a cambios de temporada y eventos privados.', cta: 'UNIRSE' },
    reviews: [
      { author: 'Hiroshi Tanaka', rating: 5, text: 'Producto japonés auténtico. El toro madurado es excepcional.' },
      { author: 'Laura Jiménez', rating: 5, text: 'Cena íntima en barra, atención impecable del itamae.' },
    ],
  },

  // 4. Pepe Tapas — andalusian tapeo, SHOWCASE skin
  {
    slug: 'pepe-tapas',
    storeId: 'store-3',
    name: 'Pepe Tapas',
    description:
      'Tapeo sevillano sin complejos. Producto fresco de la lonja, frituras como las de antes y vinos de Jerez.',
    cuisine: 'tapas',
    city: 'Sevilla',
    cover: u('1551218808-94e220e084d2'),
    gallery: [
      u('1551218808-94e220e084d2'),
      u('1485921325833-c519f76c4927'),
      u('1551782450-a2132b4ba21d'),
      u('1559329007-40df8a9345d8'),
    ],
    logoUrl: u('1551218808-94e220e084d2', 200, 200),
    isVerified: true,
    accentColor: '#d92d20',
    useDarkMode: false,
    skin: 'showcase',
    pageBackgroundColor: '#fef6ed',
    priceRange: '€€',
    rating: 4.7,
    phoneDialCode: '+34',
    phoneNumber: '954 223 011',
    emailAddress: 'reservas@pepetapas.es',
    groupStores: [
      { storeId: 'pt-c', slugName: 'pepe-tapas-centro', displayName: 'Pepe Tapas · Centro', city: 'Sevilla' },
      { storeId: 'pt-t', slugName: 'pepe-tapas-triana', displayName: 'Pepe Tapas · Triana', city: 'Sevilla' },
    ],
    address: {
      line1: 'Calle Mateos Gago, 12',
      city: 'Sevilla',
      state: 'Sevilla',
      postalCode: '41004',
      lat: 37.386,
      lon: -5.992,
    },
    weeklySchedule: {
      monday: { isOpen: true, openTime: '12:30', closeTime: '16:00' },
      tuesday: { isOpen: true, openTime: '12:30', closeTime: '16:00' },
      wednesday: { isOpen: true, openTime: '12:30', closeTime: '16:00' },
      thursday: { isOpen: true, openTime: '12:30', closeTime: '23:30' },
      friday: { isOpen: true, openTime: '12:30', closeTime: '00:30' },
      saturday: { isOpen: true, openTime: '12:30', closeTime: '00:30' },
      sunday: { isOpen: true, openTime: '12:30', closeTime: '17:00' },
    },
    externalLinks: {
      instagram: 'https://instagram.com/pepetapas',
      facebook: 'https://facebook.com/pepetapas',
    },
    menuItems: [
      { id: 'pt-1', name: 'Croquetas de jamón', description: 'Bechamel cremosa con jamón ibérico y nuez moscada', price: 8, imageId: '1551782450-a2132b4ba21d', suggested: true },
      { id: 'pt-2', name: 'Tortilla de patatas trufada', description: 'Poco hecha, con cebolla pochada y trufa de verano', price: 9.5, imageId: '1466637574441-749b8f19452f', suggested: true },
      { id: 'pt-3', name: 'Solomillo al whisky', description: 'Receta de la abuela, con patatas paja', price: 12, imageId: '1504674900247-0877df9cc836', suggested: true },
      { id: 'pt-4', name: 'Pescaíto frito', description: 'Boquerones, calamares y cazón en adobo', price: 14, imageId: '1485921325833-c519f76c4927', suggested: true },
      { id: 'pt-5', name: 'Salmorejo cordobés', description: 'Con jamón y huevo cocido', price: 7, imageId: '1540189549336-e6e99c3679fe' },
      { id: 'pt-6', name: 'Manzanilla en rama', description: 'Copa de jerez seco directa de la bota', price: 3.5, imageId: '1510812431401-41d2bd2722f3' },
    ],
    promotions: [
      {
        name: '2x1 en tapas de lunes a jueves',
        description: 'De 13h a 15h, pide una tapa y la segunda corre por nuestra cuenta. Solo en barra.',
        imageId: '1551218808-94e220e084d2',
      },
    ],
    campaigns: [
      { icon: 'mdi-silverware-variant', badge: '2x1', title: 'Tapeo doble', subtitle: 'Pide una, la segunda gratis', schedule: 'L-J de 13 a 15h', cta: 'Ver tapas', accent: '#d92d20' },
      { icon: 'mdi-glass-wine', badge: 'Vermutas', title: 'Vermut + 2 tapas', subtitle: 'Aperitivo sevillano completo', price: '8€', schedule: 'Sáb 12-14h', cta: 'Reservar', accent: '#f97316' },
    ],
    loyalty: { title: 'Club Pepe', subtitle: 'Tapeo sin freno', description: 'A la 5ª visita, una ronda de croquetas invita la casa.', cta: 'APUNTARME' },
    reviews: [
      { author: 'Manolo García', rating: 5, text: 'El solomillo al whisky de aquí es mítico. Sabor de toda la vida.' },
      { author: 'Beatriz Cano', rating: 4, text: 'Ambiente auténtico, raciones generosas. La tortilla, top.' },
    ],
  },

  // 5. Mar y Brasa — beachfront grill, PORTADA skin (light, ocean tones)
  {
    slug: 'mar-y-brasa',
    storeId: 'store-12',
    name: 'Mar y Brasa',
    description:
      'Pescado de la lonja a la brasa de carbón frente al Mediterráneo. Arroces caldosos y ensaladas de huerta malagueña.',
    cuisine: 'gastronomy',
    city: 'Málaga',
    cover: u('1485921325833-c519f76c4927'),
    gallery: [
      u('1485921325833-c519f76c4927'),
      u('1504674900247-0877df9cc836'),
      u('1547573854-74d2a71d0826'),
      u('1551218808-94e220e084d2'),
    ],
    logoUrl: u('1485921325833-c519f76c4927', 200, 200),
    isVerified: true,
    accentColor: '#1f7a8c',
    useDarkMode: false,
    skin: 'portada',
    pageBackgroundColor: '#eef6f8',
    priceRange: '€€€',
    rating: 4.7,
    phoneDialCode: '+34',
    phoneNumber: '952 224 187',
    emailAddress: 'reservas@marybrasa.es',
    address: {
      line1: 'Paseo Marítimo Pablo Ruiz Picasso, 78',
      city: 'Málaga',
      state: 'Málaga',
      postalCode: '29016',
      lat: 36.722,
      lon: -4.412,
    },
    weeklySchedule: {
      monday: { isOpen: true, openTime: '13:00', closeTime: '16:30' },
      tuesday: { isOpen: true, openTime: '13:00', closeTime: '16:30' },
      wednesday: { isOpen: true, openTime: '13:00', closeTime: '23:00' },
      thursday: { isOpen: true, openTime: '13:00', closeTime: '23:00' },
      friday: { isOpen: true, openTime: '13:00', closeTime: '00:00' },
      saturday: { isOpen: true, openTime: '13:00', closeTime: '00:00' },
      sunday: { isOpen: true, openTime: '13:00', closeTime: '18:00' },
    },
    externalLinks: {
      instagram: 'https://instagram.com/marybrasa',
      web: 'https://marybrasa.es',
    },
    menuItems: [
      { id: 'mb-1', name: 'Espeto de sardinas', description: 'A la brasa de carbón, con sal gruesa de Salinas', price: 11, imageId: '1485921325833-c519f76c4927', suggested: true },
      { id: 'mb-2', name: 'Lubina salvaje a la sal', description: 'Pieza entera, abierta en mesa con aceite de Periana', price: 28, imageId: '1547573854-74d2a71d0826', suggested: true },
      { id: 'mb-3', name: 'Arroz caldoso de bogavante', description: 'Mínimo 2 personas. Arroz bomba y fumet de pescado', price: 32, imageId: '1473093295043-cdd812d0e601', suggested: true },
      { id: 'mb-4', name: 'Chuletón de retinto', description: 'Madurado 30 días, brasa de encina, patatas asadas', price: 38, imageId: '1504674900247-0877df9cc836', suggested: true },
      { id: 'mb-5', name: 'Ensalada malagueña', description: 'Naranja, bacalao, cebolla morada y aceitunas aliñadas', price: 9, imageId: '1540189549336-e6e99c3679fe' },
      { id: 'mb-6', name: 'Vino blanco D.O. Málaga', description: 'Moscatel seco de los Montes', price: 16, imageId: '1510812431401-41d2bd2722f3' },
    ],
    promotions: [
      {
        name: '-15% menú de mediodía',
        description: 'De lunes a viernes, todos los arroces y pescados con descuento si reservas mesa antes de las 14h.',
        imageId: '1485921325833-c519f76c4927',
      },
    ],
    campaigns: [
      { icon: 'mdi-fish', badge: 'Mediodía', title: 'Menú al -15%', subtitle: 'Arroces y pescados a la brasa', schedule: 'L-V antes de 14h', cta: 'Reservar', accent: '#1f7a8c' },
      { icon: 'mdi-rice', badge: 'Domingos', title: 'Arroz para 2', subtitle: 'Bogavante + copa de blanco', price: '38€', schedule: 'Solo domingos', cta: 'Reservar', accent: '#2ea4b8' },
    ],
    loyalty: { title: 'Club Mar', subtitle: 'Pescado fresco siempre', description: 'Avisos por SMS cuando llega producto excepcional de la lonja.', cta: 'AVÍSAME' },
    reviews: [
      { author: 'Jordi Pons', rating: 5, text: 'La lubina a la sal en mesa es un espectáculo. Producto y punto perfectos.' },
      { author: 'Elena Romero', rating: 5, text: 'Vistas al mar y arroces magistrales. Repetir seguro.' },
    ],
  },

  // 6. Bodega Nova — Catalana moderna, EDITORIAL skin (wine tones)
  {
    slug: 'bodega-nova',
    storeId: 'store-1',
    name: 'Bodega Nova',
    description:
      'Catalana moderna con producto de proximidad y carta de vinos naturales. Cocina viva en el corazón de Gràcia.',
    cuisine: 'gastronomy',
    city: 'Barcelona',
    cover: u('1510812431401-41d2bd2722f3'),
    gallery: [
      u('1510812431401-41d2bd2722f3'),
      u('1473093295043-cdd812d0e601'),
      u('1551218808-94e220e084d2'),
      u('1504674900247-0877df9cc836'),
    ],
    logoUrl: u('1510812431401-41d2bd2722f3', 200, 200),
    isVerified: true,
    accentColor: '#7c2d12',
    useDarkMode: false,
    skin: 'editorial',
    pageBackgroundColor: '#fdf6f3',
    priceRange: '€€€',
    rating: 4.7,
    phoneDialCode: '+34',
    phoneNumber: '932 187 540',
    emailAddress: 'reservas@bodeganova.cat',
    address: {
      line1: 'Carrer de Verdi, 31',
      city: 'Barcelona',
      state: 'Barcelona',
      postalCode: '08012',
      lat: 41.404,
      lon: 2.158,
    },
    weeklySchedule: {
      monday: undefined,
      tuesday: { isOpen: true, openTime: '13:30', closeTime: '16:00' },
      wednesday: { isOpen: true, openTime: '13:30', closeTime: '23:30' },
      thursday: { isOpen: true, openTime: '13:30', closeTime: '23:30' },
      friday: { isOpen: true, openTime: '13:30', closeTime: '00:00' },
      saturday: { isOpen: true, openTime: '13:30', closeTime: '00:00' },
      sunday: { isOpen: true, openTime: '13:30', closeTime: '17:00' },
    },
    externalLinks: {
      instagram: 'https://instagram.com/bodeganova',
      web: 'https://bodeganova.cat',
    },
    menuItems: [
      { id: 'bn-1', name: 'Calçots con romesco', description: 'A la brasa, salsa romesco de la abuela', price: 13, imageId: '1473093295043-cdd812d0e601', suggested: true },
      { id: 'bn-2', name: 'Canelón de pollo de payés', description: 'Receta de domingo, bechamel quemada', price: 16, imageId: '1504674900247-0877df9cc836', suggested: true },
      { id: 'bn-3', name: 'Bacalao con samfaina', description: 'Confitado a baja temperatura, verduras de mercado', price: 22, imageId: '1485921325833-c519f76c4927', suggested: true },
      { id: 'bn-4', name: 'Crema catalana 2.0', description: 'Con helado de avellana del Camp de Tarragona', price: 8, imageId: '1551782450-a2132b4ba21d', suggested: true },
      { id: 'bn-5', name: 'Pan con tomate', description: 'Pan de coca con tomate de colgar y aceite arbequina', price: 4.5, imageId: '1466637574441-749b8f19452f' },
      { id: 'bn-6', name: 'Vinos naturales D.O. Penedès', description: 'Carta corta, productores locales', price: 18, imageId: '1510812431401-41d2bd2722f3' },
    ],
    promotions: [
      {
        name: '-15% en tu primera visita',
        description: 'Reserva online y enseña el código en mesa. Aplicable a la cuenta total.',
        imageId: '1551218808-94e220e084d2',
      },
    ],
    campaigns: [
      { icon: 'mdi-glass-wine', badge: 'Bienvenida', title: '-15% primera visita', subtitle: 'Reserva online · cuenta total', schedule: 'Mar-Dom', cta: 'Reservar', accent: '#7c2d12' },
      { icon: 'mdi-silverware-fork-knife', badge: 'Menú diario', title: 'Menú de mercado', subtitle: 'Entrante + principal + postre', price: '22€', schedule: 'L-V mediodía', cta: 'Ver menú', accent: '#a3461d' },
    ],
    loyalty: { title: 'Club Nova', subtitle: 'Cata mensual', description: 'A la 4ª visita, cata gratis con productores invitados.', cta: 'APUNTARME' },
    reviews: [
      { author: 'Pau Vallet', rating: 5, text: 'El bacalao con samfaina es de matrícula. Vino natural increíble.' },
      { author: 'Núria Soler', rating: 5, text: 'Atención cercana, producto top. La crema catalana, brutal.' },
    ],
  },

  // 7. Green Lab — Cocina vegana creativa, CLASSIC skin (verde fresh)
  {
    slug: 'green-lab',
    storeId: 'store-4',
    name: 'Green Lab',
    description:
      'Cocina 100% vegetal sin renunciar al sabor. Bowls, hamburguesas plant-based y postres sin azúcar refinado.',
    cuisine: 'vegan',
    city: 'Valencia',
    cover: u('1540189549336-e6e99c3679fe'),
    gallery: [
      u('1540189549336-e6e99c3679fe'),
      u('1551782450-a2132b4ba21d'),
      u('1495474472287-4d71bcdd2085'),
      u('1432139509613-5c4255815697'),
    ],
    logoUrl: u('1540189549336-e6e99c3679fe', 200, 200),
    isVerified: false,
    accentColor: '#16a34a',
    useDarkMode: false,
    skin: 'classic',
    pageBackgroundColor: '#f0fdf4',
    priceRange: '€€',
    rating: 4.5,
    phoneDialCode: '+34',
    phoneNumber: '963 458 217',
    emailAddress: 'hola@greenlab.es',
    address: {
      line1: 'Carrer de Cádiz, 18',
      city: 'Valencia',
      state: 'Valencia',
      postalCode: '46006',
      lat: 39.461,
      lon: -0.376,
    },
    weeklySchedule: {
      monday: { isOpen: true, openTime: '12:30', closeTime: '16:30' },
      tuesday: { isOpen: true, openTime: '12:30', closeTime: '16:30' },
      wednesday: { isOpen: true, openTime: '12:30', closeTime: '23:00' },
      thursday: { isOpen: true, openTime: '12:30', closeTime: '23:00' },
      friday: { isOpen: true, openTime: '12:30', closeTime: '23:30' },
      saturday: { isOpen: true, openTime: '12:30', closeTime: '23:30' },
      sunday: { isOpen: true, openTime: '12:30', closeTime: '17:00' },
    },
    externalLinks: {
      instagram: 'https://instagram.com/greenlab.vlc',
      tiktok: 'https://tiktok.com/@greenlabvlc',
    },
    menuItems: [
      { id: 'gl-1', name: 'Buddha bowl mediterráneo', description: 'Hummus, falafel, quinoa, tomate seco y tahini', price: 13, imageId: '1540189549336-e6e99c3679fe', suggested: true },
      { id: 'gl-2', name: 'Burger Beyond cheddar', description: 'Pan brioche vegano, queso cheddar plant-based, aros de cebolla', price: 14.5, imageId: '1551782450-a2132b4ba21d', suggested: true },
      { id: 'gl-3', name: 'Curry de coco y garbanzos', description: 'Arroz basmati, leche de coco, espinacas tiernas', price: 12, imageId: '1485921325833-c519f76c4927', suggested: true },
      { id: 'gl-4', name: 'Cheesecake de anacardos', description: 'Sin gluten, sin azúcar refinado, frutos rojos frescos', price: 7, imageId: '1432139509613-5c4255815697', suggested: true },
      { id: 'gl-5', name: 'Smoothie verde detox', description: 'Espinacas, manzana, jengibre, limón y semillas de chía', price: 6, imageId: '1495474472287-4d71bcdd2085' },
      { id: 'gl-6', name: 'Café orgánico', description: 'Especialidad de comercio justo, leche de avena incluida', price: 3.5, imageId: '1495474472287-4d71bcdd2085' },
    ],
    promotions: [
      {
        name: '-10% en el menú del día',
        description: 'Menú vegano completo (entrante + principal + postre + bebida) con descuento de lunes a viernes.',
        imageId: '1540189549336-e6e99c3679fe',
      },
    ],
    campaigns: [
      { icon: 'mdi-leaf', badge: 'Menú diario', title: '-10% menú del día', subtitle: 'Entrante + principal + postre + bebida', price: '13,50€', schedule: 'L-V mediodía', cta: 'Ver menú', accent: '#16a34a' },
    ],
    loyalty: { title: 'Club Green', subtitle: 'Más verde, menos huella', description: 'Cada 10 menús, planta un árbol con nosotros.', cta: 'EMPEZAR' },
    reviews: [
      { author: 'Marta Ribes', rating: 5, text: 'El curry de coco es adictivo. Carta variada y nada de "comida triste".' },
      { author: 'Iván Costa', rating: 4, text: 'Burger plant-based muy lograda. Postres también top.' },
    ],
  },

  // 8. Pintxo Palace — Pintxos y txakoli, SHOWCASE skin (basque red)
  {
    slug: 'pintxo-palace',
    storeId: 'store-6',
    name: 'Pintxo Palace',
    description:
      'Barra de pintxos clásicos y de autor frente al Guggenheim. Producto del Cantábrico y txakoli del valle.',
    cuisine: 'pintxos',
    city: 'Bilbao',
    cover: u('1485921325833-c519f76c4927'),
    gallery: [
      u('1485921325833-c519f76c4927'),
      u('1551218808-94e220e084d2'),
      u('1466637574441-749b8f19452f'),
      u('1565958011703-44f9829ba187'),
    ],
    logoUrl: u('1485921325833-c519f76c4927', 200, 200),
    isVerified: true,
    accentColor: '#15803d',
    useDarkMode: false,
    skin: 'showcase',
    pageBackgroundColor: '#f4faf3',
    priceRange: '€€',
    rating: 4.6,
    phoneDialCode: '+34',
    phoneNumber: '944 567 120',
    emailAddress: 'kaixo@pintxopalace.eus',
    address: {
      line1: 'Alameda Mazarredo, 28',
      city: 'Bilbao',
      state: 'Bizkaia',
      postalCode: '48009',
      lat: 43.268,
      lon: -2.937,
    },
    weeklySchedule: {
      monday: { isOpen: true, openTime: '12:00', closeTime: '23:30' },
      tuesday: { isOpen: true, openTime: '12:00', closeTime: '23:30' },
      wednesday: { isOpen: true, openTime: '12:00', closeTime: '23:30' },
      thursday: { isOpen: true, openTime: '12:00', closeTime: '00:00' },
      friday: { isOpen: true, openTime: '12:00', closeTime: '00:30' },
      saturday: { isOpen: true, openTime: '12:00', closeTime: '00:30' },
      sunday: { isOpen: true, openTime: '12:00', closeTime: '17:00' },
    },
    externalLinks: {
      instagram: 'https://instagram.com/pintxopalace',
      web: 'https://pintxopalace.eus',
    },
    menuItems: [
      { id: 'pp-1', name: 'Gilda clásica', description: 'Anchoa del Cantábrico, guindilla y aceituna', price: 3, imageId: '1551218808-94e220e084d2', suggested: true },
      { id: 'pp-2', name: 'Txangurro al horno', description: 'Centollo del Cantábrico gratinado en su caparazón', price: 6.5, imageId: '1485921325833-c519f76c4927', suggested: true },
      { id: 'pp-3', name: 'Carrillera al vino tinto', description: 'Sobre puré de patata trufado', price: 5.5, imageId: '1504674900247-0877df9cc836', suggested: true },
      { id: 'pp-4', name: 'Bacalao confitado', description: 'Con pil-pil ligero y pan tostado', price: 5, imageId: '1485921325833-c519f76c4927', suggested: true },
      { id: 'pp-5', name: 'Tortilla de bacalao', description: 'Receta vasca tradicional con cebolla pochada', price: 4, imageId: '1466637574441-749b8f19452f' },
      { id: 'pp-6', name: 'Txakoli D.O. Bizkaiko', description: 'Joven, escanciado en alto', price: 3.5, imageId: '1510812431401-41d2bd2722f3' },
    ],
    promotions: [
      {
        name: 'Txakoli gratis con 5 pintxos',
        description: 'Pide 5 pintxos en barra y la primera copa de txakoli corre por nuestra cuenta.',
        imageId: '1551218808-94e220e084d2',
      },
    ],
    campaigns: [
      { icon: 'mdi-glass-wine', badge: 'Barra', title: 'Txakoli gratis', subtitle: 'Con cualquier ronda de 5 pintxos', schedule: 'Todos los días', cta: 'Ver pintxos', accent: '#15803d' },
      { icon: 'mdi-silverware-variant', badge: 'Menú', title: 'Cata de 8 pintxos', subtitle: 'Selección del chef + 1 copa', price: '22€', cta: 'Reservar', accent: '#22c55e' },
    ],
    loyalty: { title: 'Klub Pintxo', subtitle: 'Para los habituales', description: 'Cada 6 visitas, ronda de gildas para tu mesa.', cta: 'APUNTARME' },
    reviews: [
      { author: 'Aitor Etxebarria', rating: 5, text: 'El txangurro merece el viaje desde donde sea. Producto top.' },
      { author: 'Maite Larrea', rating: 4, text: 'Barra siempre llena pero el equipo es ágil. Pintxos de 10.' },
    ],
  },

  // 9. La Pasta Nera — Pasta italiana, CLASSIC skin (italian red)
  {
    slug: 'la-pasta-nera',
    storeId: 'store-8',
    name: 'La Pasta Nera',
    description:
      'Pasta fresca italiana hecha cada mañana. Recetas de la nonna y producto importado de Emilia-Romagna.',
    cuisine: 'italian',
    city: 'Barcelona',
    cover: u('1473093295043-cdd812d0e601'),
    gallery: [
      u('1473093295043-cdd812d0e601'),
      u('1551782450-a2132b4ba21d'),
      u('1559329007-40df8a9345d8'),
      u('1504674900247-0877df9cc836'),
    ],
    logoUrl: u('1473093295043-cdd812d0e601', 200, 200),
    isVerified: false,
    accentColor: '#b91c1c',
    useDarkMode: false,
    skin: 'classic',
    pageBackgroundColor: '#fff7f1',
    priceRange: '€€',
    rating: 4.4,
    phoneDialCode: '+34',
    phoneNumber: '934 092 167',
    emailAddress: 'ciao@lapastanera.cat',
    address: {
      line1: 'Carrer de Tallers, 47',
      city: 'Barcelona',
      state: 'Barcelona',
      postalCode: '08001',
      lat: 41.385,
      lon: 2.169,
    },
    weeklySchedule: {
      monday: undefined,
      tuesday: { isOpen: true, openTime: '13:00', closeTime: '16:00' },
      wednesday: { isOpen: true, openTime: '13:00', closeTime: '23:00' },
      thursday: { isOpen: true, openTime: '13:00', closeTime: '23:00' },
      friday: { isOpen: true, openTime: '13:00', closeTime: '23:30' },
      saturday: { isOpen: true, openTime: '13:00', closeTime: '23:30' },
      sunday: { isOpen: true, openTime: '13:00', closeTime: '17:00' },
    },
    externalLinks: {
      instagram: 'https://instagram.com/lapastanera.bcn',
    },
    menuItems: [
      { id: 'pn-1', name: 'Tagliatelle al ragù', description: 'Pasta fresca al huevo, ragù de ternera 6 horas', price: 14, imageId: '1473093295043-cdd812d0e601', suggested: true },
      { id: 'pn-2', name: 'Cacio e pepe', description: 'Spaghetti, pecorino romano DOP y pimienta negra', price: 13, imageId: '1551782450-a2132b4ba21d', suggested: true },
      { id: 'pn-3', name: 'Lasaña de la nonna', description: 'Bechamel, ragù y mozzarella fior di latte', price: 15, imageId: '1504674900247-0877df9cc836', suggested: true },
      { id: 'pn-4', name: 'Tiramisú casero', description: 'Mascarpone, café espresso y cacao 70%', price: 7, imageId: '1551782450-a2132b4ba21d', suggested: true },
      { id: 'pn-5', name: 'Burrata pugliese', description: 'Servida con tomate seco y aceite de albahaca', price: 11, imageId: '1559329007-40df8a9345d8' },
      { id: 'pn-6', name: 'Vino tinto Chianti', description: 'Copa de Chianti Classico DOCG', price: 5.5, imageId: '1510812431401-41d2bd2722f3' },
    ],
    promotions: [
      {
        name: 'Postre gratis con cada pasta',
        description: 'Pide cualquier pasta principal y elige tiramisú o panna cotta sin coste extra.',
        imageId: '1551782450-a2132b4ba21d',
      },
    ],
    campaigns: [
      { icon: 'mdi-pasta', badge: 'Postre incluido', title: 'Pasta + dolce', subtitle: 'Tiramisú o panna cotta gratis', schedule: 'Todos los días', cta: 'Ver carta', accent: '#b91c1c' },
    ],
    loyalty: { title: 'Famiglia Nera', subtitle: 'Pasta nonostante tutto', description: 'Cada 5 platos, una copa de Chianti invita la casa.', cta: 'UNIRMI' },
    reviews: [
      { author: 'Giulia Romano', rating: 5, text: 'La cacio e pepe está al nivel de Roma. Pasta fresca de verdad.' },
      { author: 'Eric Pons', rating: 4, text: 'Sitio íntimo, raciones generosas. El tiramisú, una pasada.' },
    ],
  },

  // 10. Dulce Taller — Pastelería + café especialidad, CLASSIC skin (rose)
  {
    slug: 'dulce-taller',
    storeId: 'store-9',
    name: 'Dulce Taller',
    description:
      'Pastelería de autor con café de especialidad. Tartas a medida, croissants de mantequilla y filtros V60.',
    cuisine: 'desserts',
    city: 'Málaga',
    cover: u('1432139509613-5c4255815697'),
    gallery: [
      u('1432139509613-5c4255815697'),
      u('1495474472287-4d71bcdd2085'),
      u('1466637574441-749b8f19452f'),
      u('1546069901-ba9599a7e63c'),
    ],
    logoUrl: u('1432139509613-5c4255815697', 200, 200),
    isVerified: false,
    accentColor: '#db2777',
    useDarkMode: false,
    skin: 'classic',
    pageBackgroundColor: '#fdf2f8',
    priceRange: '€€',
    rating: 4.6,
    phoneDialCode: '+34',
    phoneNumber: '952 304 891',
    emailAddress: 'hola@dulcetaller.es',
    address: {
      line1: 'Calle Granada, 56',
      city: 'Málaga',
      state: 'Málaga',
      postalCode: '29015',
      lat: 36.722,
      lon: -4.418,
    },
    weeklySchedule: {
      monday: undefined,
      tuesday: { isOpen: true, openTime: '08:30', closeTime: '20:30' },
      wednesday: { isOpen: true, openTime: '08:30', closeTime: '20:30' },
      thursday: { isOpen: true, openTime: '08:30', closeTime: '20:30' },
      friday: { isOpen: true, openTime: '08:30', closeTime: '21:00' },
      saturday: { isOpen: true, openTime: '09:00', closeTime: '21:00' },
      sunday: { isOpen: true, openTime: '09:00', closeTime: '15:00' },
    },
    externalLinks: {
      instagram: 'https://instagram.com/dulcetaller',
      tiktok: 'https://tiktok.com/@dulcetaller',
    },
    menuItems: [
      { id: 'dt-1', name: 'Croissant clásico', description: 'Mantequilla francesa AOP, hojaldrado 72 horas', price: 2.8, imageId: '1466637574441-749b8f19452f', suggested: true },
      { id: 'dt-2', name: 'Cheesecake estilo Basque', description: 'Cremoso por dentro, caramelizado por fuera', price: 5.5, imageId: '1432139509613-5c4255815697', suggested: true },
      { id: 'dt-3', name: 'Cinnamon roll', description: 'Brioche con canela ceylán y glaseado de queso', price: 4.2, imageId: '1432139509613-5c4255815697', suggested: true },
      { id: 'dt-4', name: 'V60 origen único', description: 'Cafés de finca de Etiopía, Colombia y Costa Rica', price: 3.8, imageId: '1495474472287-4d71bcdd2085', suggested: true },
      { id: 'dt-5', name: 'Matcha latte', description: 'Matcha ceremonial de Uji con leche de avena', price: 4.5, imageId: '1495474472287-4d71bcdd2085' },
      { id: 'dt-6', name: 'Tarta de cumpleaños', description: 'A medida, encarga con 48h. Ver opciones en mostrador', price: 35, imageId: '1432139509613-5c4255815697' },
    ],
    promotions: [
      {
        name: '-5€ en tu segunda visita',
        description: 'Vuelve durante el mes siguiente y enseña tu ticket: te aplicamos 5€ de descuento.',
        imageId: '1432139509613-5c4255815697',
      },
    ],
    campaigns: [
      { icon: 'mdi-cake-variant-outline', badge: 'Vuelve', title: '-5€ 2ª visita', subtitle: 'Enseña ticket previo · 30 días', schedule: 'Cualquier día', cta: 'Ver carta', accent: '#db2777' },
      { icon: 'mdi-coffee-outline', badge: 'Mañanas', title: 'Croissant + café', subtitle: 'Combo desayuno con café de especialidad', price: '5€', schedule: 'Hasta 11h', cta: 'Pedir', accent: '#ec4899' },
    ],
    loyalty: { title: 'Club Dulce', subtitle: 'Para golosos crónicos', description: 'A la 8ª pieza dulce, la siguiente la invita el taller.', cta: 'EMPEZAR A SUMAR' },
    reviews: [
      { author: 'Lucía Méndez', rating: 5, text: 'Los croissants son los mejores de Málaga. El V60 también es para enmarcar.' },
      { author: 'Pablo Ruiz', rating: 4, text: 'Cheesecake espectacular. Local pequeño pero acogedor.' },
    ],
  },

  // 11. Street Bao — Bao buns + asian street food, PORTADA dark (orange/amber)
  {
    slug: 'street-bao',
    storeId: 'store-10',
    name: 'Street Bao',
    description:
      'Bao buns al vapor y street food asiático con producto local. Cocina de barrio asiático en plena Russafa.',
    cuisine: 'street-food',
    city: 'Valencia',
    cover: u('1565958011703-44f9829ba187'),
    gallery: [
      u('1565958011703-44f9829ba187'),
      u('1547573854-74d2a71d0826'),
      u('1517248135467-4c7edcad34c4'),
      u('1551782450-a2132b4ba21d'),
    ],
    logoUrl: u('1565958011703-44f9829ba187', 200, 200),
    isVerified: false,
    accentColor: '#ea580c',
    useDarkMode: true,
    skin: 'portada',
    pageBackgroundColor: '#1a1410',
    priceRange: '€',
    rating: 4.3,
    phoneDialCode: '+34',
    phoneNumber: '963 712 405',
    emailAddress: 'hola@streetbao.es',
    address: {
      line1: 'Carrer de Cuba, 24',
      city: 'Valencia',
      state: 'Valencia',
      postalCode: '46006',
      lat: 39.461,
      lon: -0.378,
    },
    weeklySchedule: {
      monday: undefined,
      tuesday: { isOpen: true, openTime: '13:00', closeTime: '16:00' },
      wednesday: { isOpen: true, openTime: '13:00', closeTime: '23:30' },
      thursday: { isOpen: true, openTime: '13:00', closeTime: '23:30' },
      friday: { isOpen: true, openTime: '13:00', closeTime: '00:00' },
      saturday: { isOpen: true, openTime: '13:00', closeTime: '00:00' },
      sunday: { isOpen: true, openTime: '13:00', closeTime: '17:00' },
    },
    externalLinks: {
      instagram: 'https://instagram.com/streetbao.vlc',
      tiktok: 'https://tiktok.com/@streetbao',
    },
    menuItems: [
      { id: 'sb-1', name: 'Bao de panceta glaseada', description: 'Panceta lacada en hoisin, pepino encurtido y cilantro', price: 4.5, imageId: '1565958011703-44f9829ba187', suggested: true },
      { id: 'sb-2', name: 'Bao de pollo crujiente', description: 'Buttermilk fried, mayo de sriracha y lima kaffir', price: 4.5, imageId: '1547573854-74d2a71d0826', suggested: true },
      { id: 'sb-3', name: 'Bao vegano de seitán', description: 'Seitán glaseado, kimchi y mayo de sésamo', price: 4.5, imageId: '1517248135467-4c7edcad34c4', suggested: true },
      { id: 'sb-4', name: 'Gyozas de gamba', description: 'Hechas en casa, salsa ponzu y cebollino', price: 7.5, imageId: '1551782450-a2132b4ba21d', suggested: true },
      { id: 'sb-5', name: 'Edamame al miso', description: 'Salteado con mantequilla de miso blanco', price: 5, imageId: '1540189549336-e6e99c3679fe' },
      { id: 'sb-6', name: 'Cerveza Sapporo', description: 'Cerveza japonesa servida muy fría', price: 3.5, imageId: '1510812431401-41d2bd2722f3' },
    ],
    promotions: [
      {
        name: '3x2 en baos hasta las 18h',
        description: 'Pide 3 baos cualesquiera y solo pagas 2. Solo en horario de comidas, hasta las 18h.',
        imageId: '1565958011703-44f9829ba187',
      },
    ],
    campaigns: [
      { icon: 'mdi-food-takeout-box-outline', badge: '3x2', title: 'Bao party', subtitle: 'Pide 3, paga 2 · solo comidas', schedule: 'Hasta las 18h', cta: 'Ver baos', accent: '#ea580c' },
      { icon: 'mdi-glass-mug-variant', badge: 'After', title: 'Bao + cerveza', subtitle: 'Combo street food asiático', price: '7€', schedule: 'L-V 19-21h', cta: 'Reservar', accent: '#f97316' },
    ],
    loyalty: { title: 'Bao Crew', subtitle: 'Para fans del bao', description: 'Cada 10 baos, el siguiente es gratis (incluido vegano).', cta: 'UNIRME' },
    reviews: [
      { author: 'Sara Martín', rating: 5, text: 'El bao de panceta glaseada es adicción pura. Precio imbatible.' },
      { author: 'Diego Aliaga', rating: 4, text: 'Sitio chico pero los baos son brutales. Mejor llegar pronto.' },
    ],
  },

  // 12. Bar Molino — Cócteles de autor, PORTADA dark (purple speakeasy)
  {
    slug: 'bar-molino',
    storeId: 'store-11',
    name: 'Bar Molino',
    description:
      'Coctelería de autor sin pretensiones. Clásicos perfectos y creaciones de temporada en una barra de barrio.',
    cuisine: 'cocktails',
    city: 'Madrid',
    cover: u('1510812431401-41d2bd2722f3'),
    gallery: [
      u('1510812431401-41d2bd2722f3'),
      u('1546069901-ba9599a7e63c'),
      u('1551218808-94e220e084d2'),
      u('1547573854-74d2a71d0826'),
    ],
    logoUrl: u('1510812431401-41d2bd2722f3', 200, 200),
    isVerified: false,
    accentColor: '#7c3aed',
    useDarkMode: true,
    skin: 'portada',
    pageBackgroundColor: '#15101e',
    priceRange: '€€',
    rating: 4.5,
    phoneDialCode: '+34',
    phoneNumber: '915 234 087',
    emailAddress: 'hola@barmolino.es',
    address: {
      line1: 'Calle del Molino de Viento, 12',
      city: 'Madrid',
      state: 'Madrid',
      postalCode: '28004',
      lat: 40.423,
      lon: -3.704,
    },
    weeklySchedule: {
      monday: undefined,
      tuesday: { isOpen: true, openTime: '19:00', closeTime: '01:30' },
      wednesday: { isOpen: true, openTime: '19:00', closeTime: '01:30' },
      thursday: { isOpen: true, openTime: '19:00', closeTime: '02:00' },
      friday: { isOpen: true, openTime: '19:00', closeTime: '02:30' },
      saturday: { isOpen: true, openTime: '19:00', closeTime: '02:30' },
      sunday: { isOpen: true, openTime: '19:00', closeTime: '01:00' },
    },
    externalLinks: {
      instagram: 'https://instagram.com/barmolino',
      web: 'https://barmolino.es',
    },
    menuItems: [
      { id: 'bm-1', name: 'Negroni de la casa', description: 'Gin botánico, vermut rojo italiano y Campari infusionado con naranja sanguina', price: 9, imageId: '1510812431401-41d2bd2722f3', suggested: true },
      { id: 'bm-2', name: 'Old Fashioned ahumado', description: 'Bourbon, azúcar moreno y angostura, ahumado en mesa', price: 11, imageId: '1546069901-ba9599a7e63c', suggested: true },
      { id: 'bm-3', name: 'Margarita de mango y chile', description: 'Tequila reposado, mango natural y twist picante', price: 9.5, imageId: '1546069901-ba9599a7e63c', suggested: true },
      { id: 'bm-4', name: 'Mocktail de jengibre', description: 'Sin alcohol: jengibre, lima, miel y agua tónica', price: 6, imageId: '1546069901-ba9599a7e63c', suggested: true },
      { id: 'bm-5', name: 'Tabla de embutido ibérico', description: 'Para acompañar la copa: jamón, lomo y queso curado', price: 14, imageId: '1551218808-94e220e084d2' },
      { id: 'bm-6', name: 'Vermut Molino casero', description: 'Receta propia, escanciado en grifo', price: 4, imageId: '1510812431401-41d2bd2722f3' },
    ],
    promotions: [
      {
        name: '2x1 en cócteles de 19 a 21h',
        description: 'Pide cualquier cóctel de la carta y el segundo invita la casa. Solo en horario after-work.',
        imageId: '1510812431401-41d2bd2722f3',
      },
    ],
    campaigns: [
      { icon: 'mdi-glass-cocktail', badge: 'After-work', title: '2x1 cócteles', subtitle: 'Pide uno, el segundo gratis', schedule: 'L-V de 19 a 21h', cta: 'Ver carta', accent: '#7c3aed' },
      { icon: 'mdi-music-note', badge: 'Jueves', title: 'Vinilo + cóctel', subtitle: 'DJ en directo y carta especial', schedule: 'Jueves desde las 22h', cta: 'Reservar', accent: '#a855f7' },
    ],
    loyalty: { title: 'Club Molino', subtitle: 'Para los del barrio', description: 'A la 6ª copa, la siguiente la pone el bartender.', cta: 'APUNTARME' },
    reviews: [
      { author: 'Andrés Vidal', rating: 5, text: 'El old fashioned ahumado es teatro y sabor. Bartenders de 10.' },
      { author: 'Carla Vera', rating: 4, text: 'Sitio íntimo, música cuidada. Carta con sorpresas.' },
    ],
  },
]

// ── Builders that map a MockStoreBio into the viewmodels the bio page expects.

// Dev demo slugs (pau-artiso-*) don't have their own bios — alias them to the
// first seeded bio so the page renders end-to-end during development.
const PAU_DEV_PREFIX = 'pau-artiso'
const resolveSlug = (slug: string): string => {
  if (MOCK_STORE_BIOS.find(b => b.slug === slug)) return slug
  if (slug.startsWith(PAU_DEV_PREFIX)) return MOCK_STORE_BIOS[0]!.slug
  return slug
}

// Initial bio-config seed for the public bio + dashboard editor when nothing
// has been saved yet. Without this, useBioConfig defaults (skinId 'classic',
// empty cover, etc.) silently override the mock's editorial/portada skin and
// the public page renders disconnected from what the editor will show.
const DAY_LABELS_ES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] as const
const WEEKDAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

export function getMockBioConfigSeed(slug: string): Partial<BioConfig> | null {
  const m = MOCK_STORE_BIOS.find(b => b.slug === resolveSlug(slug))
  if (!m) return null

  const hoursData = WEEKDAY_KEYS.map((key, idx) => {
    const row = m.weeklySchedule[key]
    return row && row.isOpen
      ? { day: DAY_LABELS_ES[idx]!, open: row.openTime, close: row.closeTime, closed: false }
      : { day: DAY_LABELS_ES[idx]!, open: '', close: '', closed: true }
  })

  const socials = Object.entries(m.externalLinks)
    .filter(([, url]) => !!url)
    .map(([key, url]) => ({ key, url: url as string }))

  return {
    description: m.description,
    coverUrl: m.cover,
    logoUrl: m.logoUrl,

    accentColor: m.accentColor,
    bgColor: m.pageBackgroundColor,
    useDarkMode: m.useDarkMode,
    skinId: m.skin,
    skinTypography: m.skin === 'editorial' ? 'serif' : 'sans',
    skinRadius: 'rounded',
    pageBgMode: 'solid',
    pageTextureTint: m.accentColor,

    profileData: { name: m.name, contactPhone: m.phoneNumber },

    locationData: {
      addressLine: m.address.line1,
      address: `${m.address.line1}, ${m.address.city}`,
      phone: m.phoneNumber,
    },
    hoursData,

    socials,

    // Loyalty card config (used by /loyalty + the bio's "Fidelización" widget).
    ...(m.loyalty ? { loyaltyData: m.loyalty } : {}),

    priceRange: m.priceRange,
    rating: m.rating,
  }
}

export function getMockStoreProfile(slug: string): StoreProfileViewModel | null {
  const m = MOCK_STORE_BIOS.find(b => b.slug === resolveSlug(slug))
  if (!m) return null
  // brandingSettings is `any` on the viewmodel; the renderer reads its fields
  // directly, so we hand it a plain object matching GuavaGramSettings shape.
  return StoreProfileViewModel.fromJS({
    accentColor: m.accentColor,
    useDarkMode: m.useDarkMode,
    googlePlaceId: undefined,
    description: m.description,
    phoneNumber: m.phoneNumber,
    // logo + cover + loyalty inside brandingSettings mirror what a real
    // dashboard save persists (see bioConfigToPlatform): StoreProfileViewModel
    // has no native columns for these and its serializer drops undeclared keys,
    // so the bag is the only thing that round-trips. Keeps useBioConfig — and
    // thus the public bio AND the loyalty landing — in sync with "Ajustes".
    brandingSettings: {
      accentColor: m.accentColor,
      isDarkMode: m.useDarkMode,
      coverUrl: m.cover,
      logoUrl: m.logoUrl,
      loyaltyData: m.loyalty,
      // Venue photos the public bio's "Galería" section + lightbox render.
      galleryImages: m.gallery,
      pageBackgroundMode: 'solid',
      pageBackgroundColor: m.pageBackgroundColor,
      pageTextureTint: m.accentColor,
      skin: m.skin,
      skinTokens: { typography: m.skin === 'editorial' ? 'serif' : 'sans', radius: 'rounded' },
      ctaMode: 2, // Bookings
      moduleReviews: true,
      moduleTopDishes: true,
      moduleReactionsEnabled: true,
      moduleReactionsSprinkle: true,
      moduleSocialLinks: true,
      modulePromoBanner: true,
      moduleBookings: true,
      moduleGallery: true,
      menuItemsSettings: { enabled: true, layout: 'carousel', cardStyle: 'default', showPrices: true, showDescriptions: true },
      gallerySettings: { enabled: true, gridLayout: '2x2', showOverlay: true },
      reviewsSettings: { enabled: true, showRating: true },
    },
  })
}

export function getMockStoreInfo(slug: string): StoreInfoViewModel | null {
  const m = MOCK_STORE_BIOS.find(b => b.slug === resolveSlug(slug))
  if (!m) return null
  return StoreInfoViewModel.fromJS({
    id: m.storeId,
    slugName: m.slug,
    name: m.name,
    logoUrl: m.logoUrl,
    currencyCode: 'EUR',
    description: m.description,
    address: {
      addressLine1: m.address.line1,
      city: m.address.city,
      state: m.address.state,
      postalCode: m.address.postalCode,
      lat: m.address.lat,
      lon: m.address.lon,
      countryId: 1,
    },
    phoneNumber: m.phoneNumber,
    phoneDialCode: m.phoneDialCode,
    emailAddress: m.emailAddress,
    hasBookings: true,
    hasOrders: false,
    isPro: false,
    isLiveMode: true,
    defaultLangCode: 'es',
    countryCode: 'ES',
    externalLinks: m.externalLinks,
    weeklySchedule: m.weeklySchedule,
    bookingShifts: [
      {
        id: `${m.slug}-shift-1`,
        name: 'Cena',
        startTime: '20:00',
        endTime: '23:00',
        durationMinutes: 120,
        maxPartySize: 8,
      },
    ],
    bookingOffers: [],
  })
}

export function getMockStoreMenu(slug: string): MenuViewModel | null {
  const m = MOCK_STORE_BIOS.find(b => b.slug === resolveSlug(slug))
  if (!m) return null
  return MenuViewModel.fromJS({
    id: `${m.slug}-menu`,
    name: 'Carta',
    description: m.description,
    languageCode: 'es',
    isFixedPrice: false,
    items: m.menuItems.map(it => ({
      id: it.id,
      name: it.name,
      description: it.description,
      price: it.price,
      inventoryProductMeasureUnitTypeId: 1,
      showOrderCourseSelection: false,
      medias: [{ mediaUrl: u(it.imageId, 600, 600) }],
    })),
    suggestedItems: m.menuItems.filter(it => it.suggested).map(it => it.id),
    categories: [],
    bundles: [],
    attributeGroups: [],
    attributes: [],
  })
}

export function getMockStorePromotions(slug: string): PromotionViewModel[] {
  const m = MOCK_STORE_BIOS.find(b => b.slug === resolveSlug(slug))
  if (!m) return []
  return m.promotions.map((p, i) =>
    PromotionViewModel.fromJS({
      id: `${m.slug}-promo-${i}`,
      name: p.name,
      description: p.description,
      mediaUrl: u(p.imageId, 800, 600),
    })
  )
}

// ── GuavaGramRenderer bundle ────────────────────────────────────────────────
// Builds every prop the renderer needs in one pass. Used by the deck card
// (info flip) and the public bio page so both render the exact same surface.

const DAY_INDEX: Record<string, number> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
}

const parseHHmm = (s: string | undefined): { h: number; m: number } => {
  if (!s) return { h: 0, m: 0 }
  const [h, m] = s.split(':').map(Number)
  return { h: Number.isFinite(h) ? h! : 0, m: Number.isFinite(m) ? m! : 0 }
}

// Maps the mock string-keyed externalLinks ({ instagram, facebook, ... })
// into the renderer's array of { value, externalLinkTypeId } entries.
const EXTERNAL_LINK_TYPE_BY_KEY: Record<string, number> = {
  web: 1, website: 1,
  facebook: 2,
  instagram: 3,
  tripadvisor: 4,
  google: 5,
  x: 6, twitter: 6,
  tiktok: 7,
  youtube: 8,
  guavagram: 9,
  threads: 11,
}

export interface MockBioRendererBundle {
  found: boolean
  accentColor: string
  useDarkMode: boolean
  storeName: string
  logoUrl: string
  coverUrl: string
  storeDescription: string
  isVerified: boolean
  pageBackgroundColor: string
  skin: 'classic' | 'portada' | 'editorial' | 'showcase'
  priceRange: string
  rating: number
  city: string
  cuisine: string
  groupStores: Array<{ storeId: string; slugName: string; displayName: string; logoUrl?: string; city?: string }>
  // Preview-friendly fields (flat shape, mediaUrl ready to bind to <img>).
  previewTopPicks: Array<{ id: string; name: string; description: string; price: number; mediaUrl: string }>
  previewPromotion?: { name: string; description: string; mediaUrl: string }
  previewExternalLinks: Array<{ key: 'instagram' | 'tiktok' | 'facebook' | 'twitter' | 'youtube' | 'web' | 'whatsapp'; value: string }>
  previewCampaigns: Array<{ icon: string; badge?: string; title: string; subtitle: string; price?: string; schedule?: string; cta: string; accent: string }>
  previewLoyalty?: { title: string; subtitle: string; description: string; cta: string }
  previewReviews: Array<{ author: string; rating: number; text: string; initial: string }>
  previewHours: Array<{ day: string; open: string; close: string; closed: boolean }>
  previewLocation: { addressLine: string; addressDetails: string; phone: string }
  // Renderer-shaped fields (kept for the legacy `/r/[slug]/bio` page).
  settings: any
  externalLinks: Array<{ value: string; externalLinkTypeId: number }>
  reactionsCount: number
  topPicks: Array<{ id: string; languageInfo: { name: string; description: string }; medias: Array<{ mediaUrl: string }>; price: number }>
  promotions: Array<{ languageInfo: { name: string; description: string }; media?: { mediaUrl: string } }>
  bookingShift: any
  address: { addressLine1: string; city: string; state: string; postalCode: string; position?: { lat: number; lng: number } } | undefined
  schedules: Array<{ isActive: boolean; dayOfTheWeek: number; startingHour: number; startingMinute: number; endingHour: number; endingMinute: number }>
  phoneNumber: string
  currencyCode: string
}

export function getMockBioRendererBundle(slug: string): MockBioRendererBundle | null {
  const m = MOCK_STORE_BIOS.find(b => b.slug === slug)
  if (!m) return null

  const schedules = Object.entries(m.weeklySchedule)
    .filter(([, v]) => v && v.isOpen)
    .map(([day, v]) => {
      const open = parseHHmm(v!.openTime)
      const close = parseHHmm(v!.closeTime)
      return {
        isActive: true,
        dayOfTheWeek: DAY_INDEX[day] ?? 0,
        startingHour: open.h,
        startingMinute: open.m,
        endingHour: close.h,
        endingMinute: close.m,
      }
    })

  const externalLinks = Object.entries(m.externalLinks)
    .filter(([, v]) => !!v)
    .map(([key, value]) => ({
      value: value!,
      externalLinkTypeId: EXTERNAL_LINK_TYPE_BY_KEY[key.toLowerCase()] ?? 1,
    }))

  const suggested = m.menuItems.filter(it => it.suggested)
  const topPicksItems = suggested.length > 0 ? suggested : m.menuItems.slice(0, 6)
  const topPicks = topPicksItems.map(it => ({
    id: it.id,
    languageInfo: { name: it.name, description: it.description },
    medias: [{ mediaUrl: u(it.imageId, 600, 600) }],
    price: it.price,
  }))

  const promotions = m.promotions.map(p => ({
    languageInfo: { name: p.name, description: p.description },
    media: { mediaUrl: u(p.imageId, 800, 600) },
  }))

  const previewTopPicks = topPicksItems.map(it => ({
    id: it.id,
    name: it.name,
    description: it.description,
    price: it.price,
    mediaUrl: u(it.imageId, 600, 600),
  }))

  const firstPromo = m.promotions[0]
  const previewPromotion = firstPromo
    ? { name: firstPromo.name, description: firstPromo.description, mediaUrl: u(firstPromo.imageId, 800, 600) }
    : undefined

  const DAY_LABELS: Record<string, string> = {
    monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles', thursday: 'Jueves',
    friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo',
  }
  const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const previewHours = DAY_ORDER.map(day => {
    const v = m.weeklySchedule[day]
    if (!v || !v.isOpen) return { day: DAY_LABELS[day]!, open: '', close: '', closed: true }
    return { day: DAY_LABELS[day]!, open: v.openTime, close: v.closeTime, closed: false }
  })

  const previewLocation = {
    addressLine: m.address.line1,
    addressDetails: `${m.address.postalCode} ${m.address.city}`,
    phone: `${m.phoneDialCode} ${m.phoneNumber}`.trim(),
  }

  const previewReviews = (m.reviews ?? []).map(r => ({
    ...r,
    initial: (r.author?.[0] ?? '?').toUpperCase(),
  }))

  const previewExternalLinks = (Object.entries(m.externalLinks) as Array<[string, string | undefined]>)
    .filter((entry): entry is [string, string] => !!entry[1])
    .map(([key, value]): { key: 'instagram' | 'tiktok' | 'facebook' | 'twitter' | 'youtube' | 'web' | 'whatsapp'; value: string } => {
      const k = key.toLowerCase()
      const mapped: 'instagram' | 'tiktok' | 'facebook' | 'twitter' | 'youtube' | 'web' | 'whatsapp' =
        k === 'instagram' ? 'instagram'
        : k === 'tiktok' ? 'tiktok'
        : k === 'facebook' ? 'facebook'
        : k === 'twitter' || k === 'x' ? 'twitter'
        : k === 'youtube' ? 'youtube'
        : k === 'whatsapp' ? 'whatsapp'
        : 'web'
      return { key: mapped, value }
    })

  return {
    found: true,
    accentColor: m.accentColor,
    useDarkMode: m.useDarkMode,
    storeName: m.name,
    logoUrl: m.logoUrl,
    coverUrl: m.cover,
    storeDescription: m.description,
    isVerified: m.isVerified,
    pageBackgroundColor: m.pageBackgroundColor,
    skin: m.skin,
    priceRange: m.priceRange,
    rating: m.rating,
    city: m.city,
    cuisine: m.cuisine,
    groupStores: m.groupStores ?? [],
    previewTopPicks,
    previewPromotion,
    previewExternalLinks,
    previewCampaigns: m.campaigns ?? [],
    previewLoyalty: m.loyalty,
    previewReviews,
    previewHours,
    previewLocation,
    settings: {
      accentColor: m.accentColor,
      isDarkMode: m.useDarkMode,
      pageBackgroundMode: 'solid',
      pageBackgroundColor: m.pageBackgroundColor,
      pageTextureTint: m.accentColor,
      skin: m.skin,
      skinTokens: { typography: m.skin === 'editorial' ? 'serif' : 'sans', radius: 'rounded' },
      ctaMode: 2,
      moduleReviews: true,
      moduleTopDishes: true,
      moduleReactionsEnabled: true,
      moduleReactionsSprinkle: true,
      moduleSocialLinks: true,
      modulePromoBanner: true,
      moduleBookings: true,
      moduleGallery: true,
      menuItemsSettings: { enabled: true, layout: 'carousel', cardStyle: 'default', showPrices: true, showDescriptions: true },
      gallerySettings: { enabled: true, gridLayout: '2x2', showOverlay: true },
      reviewsSettings: { enabled: true, showRating: true },
    },
    externalLinks,
    reactionsCount: 132,
    topPicks,
    promotions,
    bookingShift: {
      minGuests: 1,
      maxGuests: 8,
      intervalMinutes: 30,
      visibilitySchedules: schedules.map(s => ({
        isVisible: true,
        isActive: true,
        dayOfTheWeek: s.dayOfTheWeek,
        startingHour: s.startingHour,
        startingMinute: s.startingMinute,
        endingHour: s.endingHour,
        endingMinute: s.endingMinute,
      })),
    },
    address: {
      addressLine1: m.address.line1,
      city: m.address.city,
      state: m.address.state,
      postalCode: m.address.postalCode,
      position: { lat: m.address.lat, lng: m.address.lon },
    },
    schedules,
    phoneNumber: m.phoneNumber,
    currencyCode: 'EUR',
  }
}
