// TEMP: dev-only mock fixtures for creator/marketplace/marketing flows.
// Safe to import from any module in dev mode. In prod builds, consumers
// should branch on `import.meta.dev` before calling these helpers.
//
// Cross-agent note: some of the returned shapes reference types that Agent 1A
// is authoring (CreatorMarketplaceItem, CreatorDetailViewModel, CampaignViewModel,
// CreatorPickViewModel, etc.). For now these helpers return plain objects typed
// as `any` so the mock file remains compilable regardless of model ordering.

import { CreatorLevelEnum } from '../models/creator-level-enum'
import { CreatorPickCategoryEnum } from '../models/creator-pick-category-enum'
import { CampaignStatusEnum } from '../models/campaign-status-enum'
import { CreatorProposalStatusEnum } from '../models/creator-proposal-status-enum'
import { CreatorReviewViewModel } from '../models/creator-review-view-model'
import { CreatorWishlistItemViewModel } from '../models/creator-wishlist-item-view-model'
import { CreatorDiscountCodeViewModel } from '../models/creator-discount-code-view-model'
import { CreatorLevelViewModel } from '../models/creator-level-view-model'
import { CreatorRecommendedStoreViewModel } from '../models/creator-recommended-store-view-model'
import { CreatorFeaturedStoreViewModel } from '../models/creator-featured-store-view-model'
import { StoreCreatorLeadViewModel } from '../models/store-creator-lead-view-model'
import { StoreCreatorLeadStatusEnum } from '../models/store-creator-lead-status-enum'

// ---- utility ----
function daysFromNow(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d
}

function iso(d: Date): string {
  return d.toISOString()
}

// ---- creators ----

const creatorsRaw: any[] = [
  {
    handle: 'alexfoodie',
    displayName: 'Alex Foodie',
    avatarUrl: 'https://i.pravatar.cc/200?img=1',
    coverUrl: 'https://picsum.photos/seed/alex/1200/400',
    city: 'Barcelona',
    bio: 'Tapas & natural wine in BCN.',
    level: { level: CreatorLevelEnum.GUAVAGRAM_RECOMMENDED, label: 'Guavagram Recommended', completedCampaigns: 54, avgRating: 4.9 },
    rating: 4.9,
    completedCampaigns: 54,
    basePriceEur: 350,
    categories: ['food', 'wine'],
    languages: ['es', 'en', 'ca'],
    boostedUntil: iso(daysFromNow(5)),
    badges: ['GUAVAGRAM_RECOMMENDED'],
    followers: 48200,
  },
  {
    handle: 'sofiamadrid',
    displayName: 'Sofía Madrid',
    avatarUrl: 'https://i.pravatar.cc/200?img=5',
    coverUrl: 'https://picsum.photos/seed/sofia/1200/400',
    city: 'Madrid',
    bio: 'Brunch hunter + coffee nerd.',
    level: { level: CreatorLevelEnum.TOP_RATED, label: 'Top Rated', completedCampaigns: 32, avgRating: 4.8 },
    rating: 4.8,
    completedCampaigns: 32,
    basePriceEur: 220,
    categories: ['brunch', 'coffee'],
    languages: ['es', 'en'],
    boostedUntil: null,
    badges: ['TOP_RATED'],
    followers: 31400,
  },
  {
    handle: 'diegotapas',
    displayName: 'Diego Tapas',
    avatarUrl: 'https://i.pravatar.cc/200?img=12',
    coverUrl: 'https://picsum.photos/seed/diego/1200/400',
    city: 'Sevilla',
    bio: 'Tapeo andaluz por todo lo alto.',
    level: { level: CreatorLevelEnum.TOP_RATED, label: 'Top Rated', completedCampaigns: 28, avgRating: 4.7 },
    rating: 4.7,
    completedCampaigns: 28,
    basePriceEur: 180,
    categories: ['tapas', 'traditional'],
    languages: ['es'],
    boostedUntil: null,
    badges: ['TOP_RATED'],
    followers: 24100,
  },
  {
    handle: 'lauraveggies',
    displayName: 'Laura Veggies',
    avatarUrl: 'https://i.pravatar.cc/200?img=20',
    coverUrl: 'https://picsum.photos/seed/laura/1200/400',
    city: 'Valencia',
    bio: 'Plant-based everything.',
    level: { level: CreatorLevelEnum.LEVEL_2, label: 'Level 2', completedCampaigns: 14, avgRating: 4.6 },
    rating: 4.6,
    completedCampaigns: 14,
    basePriceEur: 130,
    categories: ['vegan', 'healthy'],
    languages: ['es', 'en'],
    boostedUntil: null,
    badges: [],
    followers: 12800,
  },
  {
    handle: 'marcbarcelona',
    displayName: 'Marc Barcelona',
    avatarUrl: 'https://i.pravatar.cc/200?img=33',
    coverUrl: 'https://picsum.photos/seed/marc/1200/400',
    city: 'Barcelona',
    bio: 'Gastro con criterio.',
    level: { level: CreatorLevelEnum.LEVEL_2, label: 'Level 2', completedCampaigns: 11, avgRating: 4.5 },
    rating: 4.5,
    completedCampaigns: 11,
    basePriceEur: 160,
    categories: ['fine-dining'],
    languages: ['es', 'en', 'ca'],
    boostedUntil: null,
    badges: [],
    followers: 9700,
  },
  {
    handle: 'juliabilbao',
    displayName: 'Julia Bilbao',
    avatarUrl: 'https://i.pravatar.cc/200?img=47',
    coverUrl: 'https://picsum.photos/seed/julia/1200/400',
    city: 'Bilbao',
    bio: 'Pintxos + Txakoli.',
    level: { level: CreatorLevelEnum.LEVEL_2, label: 'Level 2', completedCampaigns: 9, avgRating: 4.7 },
    rating: 4.7,
    completedCampaigns: 9,
    basePriceEur: 140,
    categories: ['pintxos', 'wine'],
    languages: ['es', 'eu'],
    boostedUntil: null,
    badges: [],
    followers: 7200,
  },
  {
    handle: 'chefcarlos',
    displayName: 'Chef Carlos',
    avatarUrl: 'https://i.pravatar.cc/200?img=52',
    coverUrl: 'https://picsum.photos/seed/carlos/1200/400',
    city: 'Madrid',
    bio: 'Cocinas del mundo sin filtros.',
    level: { level: CreatorLevelEnum.LEVEL_1, label: 'Level 1', completedCampaigns: 5, avgRating: 4.4 },
    rating: 4.4,
    completedCampaigns: 5,
    basePriceEur: 90,
    categories: ['global', 'chef'],
    languages: ['es', 'en'],
    boostedUntil: null,
    badges: [],
    followers: 4100,
  },
  {
    handle: 'reviewsnoel',
    displayName: 'Noel Reviews',
    avatarUrl: 'https://i.pravatar.cc/200?img=60',
    coverUrl: 'https://picsum.photos/seed/noel/1200/400',
    city: 'Málaga',
    bio: 'Sin rodeos.',
    level: { level: CreatorLevelEnum.LEVEL_1, label: 'Level 1', completedCampaigns: 4, avgRating: 4.2 },
    rating: 4.2,
    completedCampaigns: 4,
    basePriceEur: 75,
    categories: ['reviews'],
    languages: ['es'],
    boostedUntil: null,
    badges: [],
    followers: 3600,
  },
  {
    handle: 'brunchgirl',
    displayName: 'Brunch Girl',
    avatarUrl: 'https://i.pravatar.cc/200?img=65',
    coverUrl: 'https://picsum.photos/seed/brunch/1200/400',
    city: 'Barcelona',
    bio: 'Eggs, pancakes & vibes.',
    level: { level: CreatorLevelEnum.LEVEL_1, label: 'Level 1', completedCampaigns: 3, avgRating: 4.6 },
    rating: 4.6,
    completedCampaigns: 3,
    basePriceEur: 80,
    categories: ['brunch'],
    languages: ['es', 'en'],
    boostedUntil: null,
    badges: [],
    followers: 5800,
  },
  {
    handle: 'newkid',
    displayName: 'New Kid',
    avatarUrl: 'https://i.pravatar.cc/200?img=70',
    coverUrl: 'https://picsum.photos/seed/newkid/1200/400',
    city: 'Zaragoza',
    bio: 'Recién llegado.',
    level: { level: CreatorLevelEnum.NEW, label: 'New', completedCampaigns: 0, avgRating: 0 },
    rating: 0,
    completedCampaigns: 0,
    basePriceEur: 50,
    categories: ['food'],
    languages: ['es'],
    boostedUntil: null,
    badges: ['NEW'],
    followers: 900,
  },
  {
    handle: 'winelover',
    displayName: 'Wine Lover',
    avatarUrl: 'https://i.pravatar.cc/200?img=75',
    coverUrl: 'https://picsum.photos/seed/wine/1200/400',
    city: 'Barcelona',
    bio: 'Vinos naturales y mas.',
    level: { level: CreatorLevelEnum.NEW, label: 'New', completedCampaigns: 1, avgRating: 5.0 },
    rating: 5.0,
    completedCampaigns: 1,
    basePriceEur: 60,
    categories: ['wine'],
    languages: ['es', 'en'],
    boostedUntil: null,
    badges: ['NEW'],
    followers: 1200,
  },
  {
    handle: 'tapasqueen',
    displayName: 'Tapas Queen',
    avatarUrl: 'https://i.pravatar.cc/200?img=80',
    coverUrl: 'https://picsum.photos/seed/tapasq/1200/400',
    city: 'Madrid',
    bio: 'La reina del pincho.',
    level: { level: CreatorLevelEnum.TOP_RATED, label: 'Top Rated', completedCampaigns: 21, avgRating: 4.8 },
    rating: 4.8,
    completedCampaigns: 21,
    basePriceEur: 200,
    categories: ['tapas', 'traditional'],
    languages: ['es', 'en'],
    boostedUntil: null,
    badges: ['TOP_RATED'],
    followers: 19800,
  },
]

// ---- picks ----
// Canonical deliverable catalog — mirrored from creator-pick-package-view-model.ts
const DELIVERABLE_CATALOG = [
  { key: 'stories',   label: 'Stories',                     hasQuantity: true  },
  { key: 'reels',     label: 'Reel / vídeo corto',          hasQuantity: true  },
  { key: 'posts',     label: 'Post en feed',                hasQuantity: true  },
  { key: 'bio',       label: 'Mención en bio',              hasQuantity: true  },
  { key: 'highlight', label: 'Destacado permanente',        hasQuantity: false },
  { key: 'dofollow',  label: 'Link dofollow en perfil',     hasQuantity: false },
  { key: 'repost',    label: 'Repost en cuenta secundaria', hasQuantity: false },
]

function buildDeliverables(included: string[], qty: Record<string, number> = {}): any[] {
  return DELIVERABLE_CATALOG.map(d => ({
    key: d.key,
    label: d.label,
    quantity: d.hasQuantity ? (qty[d.key] ?? (included.includes(d.key) ? 1 : 0)) : undefined,
    included: included.includes(d.key),
  }))
}

const PICK_TEMPLATES: ((handle: string, idx: number) => any)[] = [
  (handle, idx) => ({
    id: `${handle}-pick-${idx}`,
    creatorHandle: handle,
    category: CreatorPickCategoryEnum.CAMPAIGN,
    title: 'Campaña completa: reseña + stories + reel',
    shortPitch: 'Cobertura 360º para presentar tu local a toda mi audiencia foodie.',
    description: 'Pack más completo: visito el local, cubro en stories y entrego un reel editado.',
    longDescription: 'Perfecto si tu restaurante acaba de abrir o está relanzando carta. Incluye visita al local, cobertura en stories durante la experiencia, 1 reel editado con voz en off y post en feed. Coordino fecha contigo y me adapto a tu público objetivo.',
    tags: ['#foodie', '#restaurante', '#review', '#reel'],
    gallery: {
      coverUrl: `https://picsum.photos/seed/${handle}-p${idx}-cover/900/600`,
      images: [
        `https://picsum.photos/seed/${handle}-p${idx}-1/600/400`,
        `https://picsum.photos/seed/${handle}-p${idx}-2/600/400`,
      ],
      videoUrl: undefined,
    },
    packages: [
      {
        tier: 'BASIC', name: 'Básico',
        description: '3 stories durante la visita + etiqueta en bio 24h.',
        priceEur: 90, deliveryDays: 3, revisions: 1,
        deliverables: buildDeliverables(['stories', 'bio'], { stories: 3, bio: 1 }),
      },
      {
        tier: 'STANDARD', name: 'Recomendado',
        description: 'Stories + 1 reel de 30s + destacado permanente.',
        priceEur: 220, deliveryDays: 5, revisions: 2,
        deliverables: buildDeliverables(['stories', 'reels', 'bio', 'highlight'], { stories: 5, reels: 1, bio: 3 }),
      },
      {
        tier: 'PREMIUM', name: 'Premium',
        description: 'Todo + post en feed + link dofollow + repost en secundaria.',
        priceEur: 420, deliveryDays: 7, revisions: 3,
        deliverables: buildDeliverables(
          ['stories', 'reels', 'posts', 'bio', 'highlight', 'dofollow', 'repost'],
          { stories: 7, reels: 1, posts: 1, bio: 7 },
        ),
      },
    ],
    faq: [
      { q: '¿Cuánto tardas en publicar después de la visita?', a: 'Normalmente en 48–72h tienes el contenido listo.' },
      { q: '¿Puedo ver el reel antes de que se publique?', a: 'Sí. Te lo envío para validación y tienes las revisiones incluidas en tu pack.' },
      { q: '¿El contenido es exclusivo?', a: 'Durante 30 días no publico reseñas de restaurantes directamente competidores.' },
    ],
    buyerRequirements: [
      'Invitación a probar el menú (para mí y un acompañante)',
      'Briefing del plato o producto que quieres destacar',
      'Fechas preferidas de visita',
    ],
    active: true, salesCount: 12, rating: 4.8,
    priceEur: 90, durationDays: 3,
    deliverables: ['3 stories durante la visita', 'Mención en bio'],
    thumbnailUrl: `https://picsum.photos/seed/${handle}-p${idx}-cover/900/600`,
  }),

  (handle, idx) => ({
    id: `${handle}-pick-${idx}`,
    creatorHandle: handle,
    category: CreatorPickCategoryEnum.STORY,
    title: 'Stories con etiqueta y swipe-up',
    shortPitch: 'Stories directas con link a tu reserva. Rápido y con tracking.',
    description: 'Cobertura ágil en stories con swipe-up a tu web o reserva.',
    longDescription: 'Ideal para promocionar un evento concreto, un menú especial o una apertura puntual. Grabo stories naturales, añado link directo y menciones al perfil del restaurante.',
    tags: ['#stories', '#foodie', '#reserva'],
    gallery: {
      coverUrl: `https://picsum.photos/seed/${handle}-p${idx}-cover/900/600`,
      images: [`https://picsum.photos/seed/${handle}-p${idx}-1/600/400`],
      videoUrl: undefined,
    },
    packages: [
      {
        tier: 'BASIC', name: 'Básico',
        description: '3 stories con mención y link.',
        priceEur: 50, deliveryDays: 1, revisions: 1,
        deliverables: buildDeliverables(['stories'], { stories: 3 }),
      },
      {
        tier: 'STANDARD', name: 'Recomendado',
        description: '5 stories + destacado permanente.',
        priceEur: 120, deliveryDays: 2, revisions: 1,
        deliverables: buildDeliverables(['stories', 'highlight'], { stories: 5 }),
      },
    ],
    faq: [
      { q: '¿Cómo envío el link?', a: 'Me lo pasas por chat y lo pongo en el swipe-up de cada story.' },
      { q: '¿Qué métricas me das?', a: 'Comparto captura con impresiones y clicks cuando caduquen las stories.' },
    ],
    buyerRequirements: [
      'Link final (reserva o web)',
      'Invitación para probar el menú',
    ],
    active: true, salesCount: 28, rating: 4.9,
    priceEur: 50, durationDays: 1,
    deliverables: ['3 stories con mención'],
    thumbnailUrl: `https://picsum.photos/seed/${handle}-p${idx}-cover/900/600`,
  }),

  (handle, idx) => ({
    id: `${handle}-pick-${idx}`,
    creatorHandle: handle,
    category: CreatorPickCategoryEnum.VIDEO_REVIEW,
    title: 'Review en reel editado',
    shortPitch: 'Reel de 30–60s con guion, voz en off y cortes dinámicos.',
    description: 'Reel editado centrado en tus platos clave, listo para ads.',
    longDescription: 'Grabo en el local (o con producto enviado), edito un reel dinámico con voz en off y te entrego también la versión en vertical y cuadrada para ads.',
    tags: ['#reel', '#review', '#contenido', '#ads'],
    gallery: {
      coverUrl: `https://picsum.photos/seed/${handle}-p${idx}-cover/900/600`,
      images: [],
      videoUrl: undefined,
    },
    packages: [
      {
        tier: 'BASIC', name: 'Básico',
        description: 'Reel de 30s sin voz en off.',
        priceEur: 130, deliveryDays: 5, revisions: 1,
        deliverables: buildDeliverables(['reels'], { reels: 1 }),
      },
      {
        tier: 'STANDARD', name: 'Recomendado',
        description: 'Reel de 45s con voz en off + 2 stories de teaser.',
        priceEur: 260, deliveryDays: 7, revisions: 2,
        deliverables: buildDeliverables(['reels', 'stories'], { reels: 1, stories: 2 }),
      },
      {
        tier: 'PREMIUM', name: 'Premium',
        description: 'Reel 60s + post + cesión de derechos para ads 90 días.',
        priceEur: 520, deliveryDays: 10, revisions: 3,
        deliverables: buildDeliverables(['reels', 'posts', 'stories', 'dofollow'], { reels: 1, posts: 1, stories: 3 }),
      },
    ],
    faq: [
      { q: '¿Puedo usar el reel en ads?', a: 'En el pack Premium sí, durante 90 días y con mi @ visible.' },
      { q: '¿Grabáis con qué cámara?', a: 'iPhone 15 Pro + micro de solapa. Edición en CapCut Pro.' },
    ],
    buyerRequirements: [
      'Briefing claro de qué plato destacar',
      'Acceso al local o delivery del producto',
      'Logos de marca en alta resolución',
    ],
    active: true, salesCount: 7, rating: 4.7,
    priceEur: 130, durationDays: 5,
    deliverables: ['1 reel de 30s'],
    thumbnailUrl: `https://picsum.photos/seed/${handle}-p${idx}-cover/900/600`,
  }),

  (handle, idx) => ({
    id: `${handle}-pick-${idx}`,
    creatorHandle: handle,
    category: CreatorPickCategoryEnum.BIO_SLOT,
    title: 'Slot en bio 30 días',
    shortPitch: 'Enlace directo a tu local en mi bio durante 30 días.',
    description: 'Tu web aparece como link destacado en mi perfil.',
    longDescription: 'Todos los días me visitan miles de personas en el perfil. Tener tu link en mi bio significa tráfico cualificado durante 30 días seguidos.',
    tags: ['#bio', '#perfil', '#link'],
    gallery: {
      coverUrl: `https://picsum.photos/seed/${handle}-p${idx}-cover/900/600`,
      images: [],
      videoUrl: undefined,
    },
    packages: [
      {
        tier: 'BASIC', name: 'Pack único',
        description: 'Link en bio 30 días + 1 story anunciándolo.',
        priceEur: 150, deliveryDays: 1, revisions: 0,
        deliverables: buildDeliverables(['bio', 'stories', 'dofollow'], { bio: 30, stories: 1 }),
      },
    ],
    faq: [
      { q: '¿Cómo verifico que el link está activo?', a: 'Te mando captura del perfil al publicar y un recordatorio a los 15 días.' },
    ],
    buyerRequirements: [
      'URL final',
      'Texto corto para la story anuncio (opcional)',
    ],
    active: false, salesCount: 3, rating: 4.6,
    priceEur: 150, durationDays: 30,
    deliverables: ['Link en bio 30 días'],
    thumbnailUrl: `https://picsum.photos/seed/${handle}-p${idx}-cover/900/600`,
  }),

  (handle, idx) => ({
    id: `${handle}-pick-${idx}`,
    creatorHandle: handle,
    category: CreatorPickCategoryEnum.PRINCIPAL_FEATURED,
    title: 'Destacado en mis "recomendados"',
    shortPitch: 'Apareces fijado en mi sección de favoritos del mes.',
    description: 'Espacio destacado en mi perfil como "restaurante recomendado".',
    longDescription: 'Mi sección de recomendados es lo primero que ven los visitantes. Aparecer ahí durante un mes da muchísima visibilidad y credibilidad.',
    tags: ['#destacado', '#favoritos', '#recomendado'],
    gallery: {
      coverUrl: `https://picsum.photos/seed/${handle}-p${idx}-cover/900/600`,
      images: [`https://picsum.photos/seed/${handle}-p${idx}-1/600/400`],
      videoUrl: undefined,
    },
    packages: [
      {
        tier: 'BASIC', name: 'Básico',
        description: 'Destacado 15 días.',
        priceEur: 80, deliveryDays: 1, revisions: 0,
        deliverables: buildDeliverables(['highlight', 'bio'], { bio: 15 }),
      },
      {
        tier: 'STANDARD', name: 'Recomendado',
        description: 'Destacado 30 días + 2 stories + post en feed.',
        priceEur: 200, deliveryDays: 2, revisions: 1,
        deliverables: buildDeliverables(['highlight', 'bio', 'stories', 'posts'], { bio: 30, stories: 2, posts: 1 }),
      },
    ],
    faq: [
      { q: '¿Puedo renovar el destacado?', a: 'Sí, con un 10% de descuento para recurrencia.' },
    ],
    buyerRequirements: [
      'Logo y 2–3 fotos del local',
      'URL o teléfono de reserva',
    ],
    active: true, salesCount: 9, rating: 4.8,
    priceEur: 80, durationDays: 15,
    deliverables: ['Destacado 15 días'],
    thumbnailUrl: `https://picsum.photos/seed/${handle}-p${idx}-cover/900/600`,
  }),
]

function buildPicksFor(handle: string): any[] {
  return PICK_TEMPLATES.map((tpl, idx) => tpl(handle, idx))
}

// ---- campaign reviews (restaurant -> creator feedback after a campaign) ----
const campaignReviewsPool: any[] = Array.from({ length: 18 }).map((_, i) => ({
  id: `campaign-review-${i}`,
  creatorHandle: creatorsRaw[i % creatorsRaw.length]!.handle,
  storeId: `store-${(i % 6) + 1}`,
  storeName: `Restaurante Demo ${(i % 6) + 1}`,
  rating: 3 + ((i * 7) % 3),
  comment: `Colaboración impecable. El creador entregó a tiempo y con gran calidad. (mock ${i})`,
  createdAt: iso(daysFromNow(-(i * 4 + 2))),
  reviewerName: `Restaurant ${(i % 6) + 1}`,
  campaignId: `campaign-${i}`,
}))

// ---- campaigns ----
const campaignsRaw: any[] = [
  { id: 'cmp-1', creatorHandle: 'alexfoodie', storeId: 'store-1', storeName: 'Bodega Nova', status: CampaignStatusEnum.IN_PROGRESS, priceEur: 300, createdAt: iso(daysFromNow(-3)), deliveryAt: iso(daysFromNow(4)), brief: 'Review video + 2 stories' },
  { id: 'cmp-2', creatorHandle: 'sofiamadrid', storeId: 'store-2', storeName: 'Brunch & Co', status: CampaignStatusEnum.ACCEPTED, priceEur: 220, createdAt: iso(daysFromNow(-1)), deliveryAt: iso(daysFromNow(10)), brief: 'Cobertura completa del brunch dominical' },
  { id: 'cmp-3', creatorHandle: 'diegotapas', storeId: 'store-3', storeName: 'Pepe Tapas', status: CampaignStatusEnum.DELIVERED, priceEur: 180, createdAt: iso(daysFromNow(-15)), deliveryAt: iso(daysFromNow(-2)), brief: 'Video 60s + 3 stories' },
  { id: 'cmp-4', creatorHandle: 'lauraveggies', storeId: 'store-4', storeName: 'Green Lab', status: CampaignStatusEnum.COMPLETED, priceEur: 130, createdAt: iso(daysFromNow(-30)), deliveryAt: iso(daysFromNow(-20)), brief: 'Review menu degustación vegano' },
  { id: 'cmp-5', creatorHandle: 'marcbarcelona', storeId: 'store-5', storeName: 'Cata Gourmet', status: CampaignStatusEnum.COMPLETED, priceEur: 160, createdAt: iso(daysFromNow(-45)), deliveryAt: iso(daysFromNow(-35)), brief: 'Menú degustación invierno' },
  { id: 'cmp-6', creatorHandle: 'juliabilbao', storeId: 'store-6', storeName: 'Pintxo Palace', status: CampaignStatusEnum.REJECTED, priceEur: 140, createdAt: iso(daysFromNow(-10)), deliveryAt: null, brief: 'Ruta de pintxos' },
  { id: 'cmp-7', creatorHandle: 'tapasqueen', storeId: 'store-1', storeName: 'Bodega Nova', status: CampaignStatusEnum.COMPLETED, priceEur: 200, createdAt: iso(daysFromNow(-60)), deliveryAt: iso(daysFromNow(-50)), brief: 'Cobertura nueva carta' },
  { id: 'cmp-8', creatorHandle: 'chefcarlos', storeId: 'store-2', storeName: 'Brunch & Co', status: CampaignStatusEnum.REQUESTED, priceEur: 90, createdAt: iso(daysFromNow(-1)), deliveryAt: null, brief: 'Review casual' },
]

// ---- proposals ----
const proposalsRaw: any[] = [
  { id: 'prop-1', storeId: 'store-1', storeName: 'Bodega Nova', creatorHandle: 'alexfoodie', status: CreatorProposalStatusEnum.PENDING, priceEur: 300, message: 'Nos encanta tu estilo, ¿colaboramos?', createdAt: iso(daysFromNow(-2)) },
  { id: 'prop-2', storeId: 'store-3', storeName: 'Pepe Tapas', creatorHandle: 'alexfoodie', status: CreatorProposalStatusEnum.PENDING, priceEur: 250, message: 'Queremos un video.', createdAt: iso(daysFromNow(-4)) },
  { id: 'prop-3', storeId: 'store-5', storeName: 'Cata Gourmet', creatorHandle: 'alexfoodie', status: CreatorProposalStatusEnum.ACCEPTED, priceEur: 350, message: 'Nuestra nueva carta te va a encantar.', createdAt: iso(daysFromNow(-10)) },
]

// ---- bio reviews (creator's own verified reviews with video/photo) ----
const reviewsMockData: any[] = [
  { id: 'review-1', mediaUrl: 'https://picsum.photos/seed/review1/400/700', mediaType: 'image', caption: 'Risotto perfecto en Bodega Nova', storeId: 'store-1', storeName: 'Bodega Nova', rating: 4.8, publishedAt: iso(daysFromNow(-1)), views: 1240, likes: 94, orderIdx: 0 },
  { id: 'review-2', mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', mediaType: 'video', caption: 'Pintxos a tope en Bilbao', storeId: 'store-6', storeName: 'Pintxo Palace', rating: 4.5, publishedAt: iso(daysFromNow(-3)), views: 860, likes: 52, orderIdx: 1 },
  { id: 'review-3', mediaUrl: 'https://picsum.photos/seed/review3/400/700', mediaType: 'image', caption: 'Brunch domingo', storeId: 'store-2', storeName: 'Brunch & Co', rating: 4.2, publishedAt: iso(daysFromNow(-5)), views: 2100, likes: 160, orderIdx: 2 },
]

// ---- wishlist ----
// Each entry includes `creatorHandle` so restaurants can do an inverse lookup:
// "which creators have wishlisted my store?".
const wishlistMockData: any[] = [
  { id: 'wl-1', creatorHandle: 'alexfoodie',  source: 'guavagram', storeId: 'store-1',  slugName: 'bodega-nova', googlePlaceId: 'ChIJbodeganova_bcn', name: 'Bodega Nova',      city: 'Barcelona', address: 'Carrer de Verdi 31, Gràcia',    category: 'Catalana moderna', rating: 4.7, imageUrl: 'https://picsum.photos/seed/wl1/400/500', reason: 'Quiero ir desde hace meses', addedAt: iso(daysFromNow(-15)), priority: 0 },
  { id: 'wl-2', creatorHandle: 'sofiamadrid', source: 'guavagram', storeId: 'store-1',  slugName: 'bodega-nova', googlePlaceId: 'ChIJbodeganova_bcn', name: 'Bodega Nova',      city: 'Barcelona', address: 'Carrer de Verdi 31, Gràcia',    category: 'Catalana moderna', rating: 4.7, imageUrl: 'https://picsum.photos/seed/wl2/400/500', reason: 'Sueño gastronómico',         addedAt: iso(daysFromNow(-3)),  priority: 1 },
  { id: 'wl-3', creatorHandle: 'diegotapas',  source: 'guavagram', storeId: 'store-1',  slugName: 'bodega-nova', googlePlaceId: 'ChIJbodeganova_bcn', name: 'Bodega Nova',      city: 'Barcelona', address: 'Carrer de Verdi 31, Gràcia',    category: 'Catalana moderna', rating: 4.7, imageUrl: 'https://picsum.photos/seed/wl3/400/500', reason: 'Brasa top',                  addedAt: iso(daysFromNow(-8)),  priority: 2 },
  { id: 'wl-4', creatorHandle: 'alexfoodie',  source: 'guavagram', storeId: 'store-11', slugName: 'diverxo',     googlePlaceId: 'ChIJdiverxo_mad',    name: 'DiverXO',          city: 'Madrid',    address: 'Calle Padre Damián 23',         category: 'Alta cocina',       rating: 4.9, imageUrl: 'https://picsum.photos/seed/wl4/400/500', reason: 'Sueño gastronómico',         addedAt: iso(daysFromNow(-30)), priority: 3 },
  { id: 'wl-5', creatorHandle: 'alexfoodie',  source: 'google',    googlePlaceId: 'ChIJetxebarri-axpe',                                                                    name: 'Asador Etxebarri', city: 'Axpe',      address: 'Plaza San Juan 1, Axpe',        category: 'Asador',                          imageUrl: 'https://picsum.photos/seed/wl5/400/500', reason: 'Brasa top — ojalá se sumen', addedAt: iso(daysFromNow(-60)), priority: 4 },
  { id: 'wl-6', creatorHandle: 'alexfoodie',  source: 'google',    googlePlaceId: 'ChIJquique-dacosta',                                                                    name: 'Quique Dacosta',   city: 'Dénia',     address: 'Urb. El Poblet, Dénia',         category: 'Alta cocina',                     imageUrl: 'https://picsum.photos/seed/wl6/400/500', reason: 'Menú degustación pendiente', addedAt: iso(daysFromNow(-45)), priority: 5 },
]

// ---- discount codes ----
const discountCodesMockData: any[] = [
  { code: 'ALEX10', percentOff: 10, flatOffCents: undefined, description: '10% en Bodega Nova', storeId: 'store-1', expireAt: iso(daysFromNow(60)), usageCount: 24, maxUses: 200 },
  { code: 'ALEXBRUNCH', percentOff: 15, flatOffCents: undefined, description: '15% brunch dominical', storeId: 'store-2', expireAt: iso(daysFromNow(30)), usageCount: 8, maxUses: 100 },
]

// ---- public store coupons (restaurant-side, exposed publicly on Guavagram) ----
// Real implementation: this comes from the restaurant's public marketing offers
// (Store.publicCoupon). Keyed by storeId. A creator can attach it to their
// Recomendados without needing a B2B match.
type PublicStoreCoupon = {
  storeId: string
  code: string
  percentOff?: number
  flatOffCents?: number
  description?: string
  expireAt?: string
}
const publicStoreCouponsMockData: PublicStoreCoupon[] = [
  { storeId: 'store-10', code: 'GUAVA10', percentOff: 10, description: 'Cupón público 10% en Disfrutar' },
  { storeId: 'store-5',  code: 'CASALOLA-WELCOME', percentOff: 12, description: '12% bienvenida en Casa Lola' },
]

export function getMockPublicStoreCoupon(storeId: string | undefined): PublicStoreCoupon | undefined {
  if (!storeId) return undefined
  return publicStoreCouponsMockData.find(c => c.storeId === storeId)
}

// ---- home stats ----
const homeStatsMockData: any = {
  earningsMonthEur: 1240,
  earningsAllTimeEur: 18750,
  pendingPayoutsEur: 430,
  activeCampaigns: 2,
  completedCampaigns: 54,
  pendingProposals: 2,
  avgRating: 4.9,
  profileViewsMonth: 3210,
  followers: 48200,
  storiesPublished: 3,
  wishlistItems: 3,
  recentActivity: [
    { type: 'proposal', title: 'Nueva propuesta de Bodega Nova', timestamp: iso(daysFromNow(-1)) },
    { type: 'payout', title: 'Pago recibido: 300€', timestamp: iso(daysFromNow(-2)) },
    { type: 'review', title: 'Nueva reseña 5★', timestamp: iso(daysFromNow(-4)) },
  ],
}

// ---- level ----
const levelMockData: any = {
  level: CreatorLevelEnum.LEVEL_2,
  label: 'Level 2',
  completedCampaigns: 14,
  avgRating: 4.6,
  nextLevelProgress: 0.65,
  nextLevelName: 'Top Rated',
  benefits: [
    { icon: 'star', label: 'Aparece en búsquedas destacadas' },
    { icon: 'euro', label: 'Comisión reducida 10%' },
  ],
}

// ---- current creator profile ----
const currentCreatorMockData: any = {
  userId: 'user-self-001',
  handle: 'pau_creator',
  displayName: 'Pau Creator',
  email: 'pau.artiso@guavapp.com',
  bio: 'Creador demo del dashboard.',
  city: 'Barcelona',
  avatarUrl: 'https://i.pravatar.cc/200?img=11',
  coverUrl: 'https://picsum.photos/seed/pau/1200/400',
  accountType: 'creator',
  categories: ['food', 'brunch'],
  languages: ['es', 'en', 'ca'],
  basePriceEur: 150,
  cities: ['Barcelona', 'Madrid'],
  tags: ['Pasta lover', 'Natural wine', 'Brunch queen'],
  externalLinks: [
    { externalLinkTypeId: 1, value: 'https://instagram.com/paucreator' },
    { externalLinkTypeId: 2, value: 'https://tiktok.com/@paucreator' },
  ],
  createdAt: iso(daysFromNow(-120)),
}

// ---- marketing stats (restaurant side) ----
const marketingStatsMockData: any = {
  storeId: 'store-1',
  spendMonthEur: 720,
  spendAllTimeEur: 4380,
  activeCampaigns: 1,
  totalCampaigns: 7,
  totalReach: 82000,
  totalEngagement: 4300,
  avgRating: 4.7,
}

const myCampaignsMockData: any[] = campaignsRaw.filter(c => c.storeId === 'store-1')

// ==================== exported helpers ====================

export function getMockCreators(): any[] {
  return creatorsRaw.map(c => ({ ...c }))
}

export function getMockCreatorByHandle(handle: string): any | null {
  const c = creatorsRaw.find(x => x.handle === handle)
  if (!c) return null
  return {
    ...c,
    externalLinks: [
      { externalLinkTypeId: 1, value: `https://instagram.com/${handle}` },
      { externalLinkTypeId: 2, value: `https://tiktok.com/@${handle}` },
    ],
    picks: buildPicksFor(handle),
    recentReviews: campaignReviewsPool.filter(r => r.creatorHandle === handle).slice(0, 3),
  }
}

export function getMockPicks(handle: string): any[] {
  return buildPicksFor(handle)
}

export function getMockCampaignReviews(handle: string): any[] {
  return campaignReviewsPool.filter(r => r.creatorHandle === handle)
}

export function getMockCampaigns(): any[] {
  return campaignsRaw.map(c => ({ ...c }))
}

export function getMockProposals(): any[] {
  return proposalsRaw.map(p => ({ ...p }))
}

export function getMockHomeStats(): any {
  return { ...homeStatsMockData }
}

export function getMockLevel(): CreatorLevelViewModel {
  return CreatorLevelViewModel.fromJS(levelMockData)
}

export function getMockReviews(): CreatorReviewViewModel[] {
  return reviewsMockData.map(s => CreatorReviewViewModel.fromJS(s))
}

export function getMockWishlist(): CreatorWishlistItemViewModel[] {
  // The creator-side wishlist is scoped to the current creator ('alexfoodie' in mocks).
  // Items added for other creators exist only so restaurants can see inverse leads.
  return wishlistMockData
    .filter(w => !w.creatorHandle || w.creatorHandle === 'alexfoodie')
    .map(w => CreatorWishlistItemViewModel.fromJS(w))
}

export function getMockDiscountCodes(): CreatorDiscountCodeViewModel[] {
  return discountCodesMockData.map(d => CreatorDiscountCodeViewModel.fromJS(d))
}

export function getMockMarketingStats(): any {
  return { ...marketingStatsMockData }
}

export function getMockMyCampaigns(): any[] {
  return myCampaignsMockData.map(c => ({ ...c }))
}

export function getMockFeaturedStore(): CreatorFeaturedStoreViewModel {
  return CreatorFeaturedStoreViewModel.fromJS({
    userProfileStoreId: 'feat-1',
    storeId: 'store-1',
    slugName: 'bodega-nova',
    name: 'Bodega Nova',
    logoUrl: 'https://picsum.photos/seed/bn-logo/200/200',
    coverUrl: 'https://picsum.photos/seed/bn-cover/1200/400',
    headline: 'Mi favorito absoluto en BCN',
    personalNotes: 'El risotto de tinta y el pan con tomate son oro.',
    discountCode: 'ALEX10',
    discountPercent: 10,
    discountLabel: '10% off con ALEX10',
  })
}

export function getMockRecommendedStores(): CreatorRecommendedStoreViewModel[] {
  return [
    { userProfileStoreId: 'rec-1', storeId: 'store-2', slugName: 'brunch-co', name: 'Brunch & Co', logoUrl: 'https://picsum.photos/seed/brunchco-logo/200/200', weight: 1, personalPick: true, personalNotes: 'Brunch gigante.', coverUrl: 'https://picsum.photos/seed/brunchco-cover/800/600', category: 'brunch', badges: [], discountCode: 'ALEXBRUNCH', discountPercent: 15, discountLabel: '15%', personalQuote: 'Si vas un domingo a las 10, te cambia el día.' },
    { userProfileStoreId: 'rec-2', storeId: 'store-3', slugName: 'pepe-tapas', name: 'Pepe Tapas', logoUrl: 'https://picsum.photos/seed/pepetapas-logo/200/200', weight: 2, personalPick: true, personalNotes: 'Tapeo clásico.', coverUrl: 'https://picsum.photos/seed/pepetapas-cover/800/600', category: 'tapas', badges: [], discountCode: undefined, discountPercent: undefined, discountLabel: undefined, personalQuote: undefined },
    { userProfileStoreId: 'rec-3', storeId: 'store-6', slugName: 'pintxo-palace', name: 'Pintxo Palace', logoUrl: 'https://picsum.photos/seed/pintxopalace-logo/200/200', weight: 3, personalPick: false, personalNotes: '', coverUrl: 'https://picsum.photos/seed/pintxopalace-cover/800/600', category: 'pintxos', badges: [], discountCode: undefined, discountPercent: undefined, discountLabel: undefined, personalQuote: undefined },
  ].map(r => CreatorRecommendedStoreViewModel.fromJS(r))
}

// ---- store → creator leads (inverse wishlist) ----
// Keyed by leadId. State lives in this module so the UI can mutate it
// optimistically during dev (e.g., after "send offer" is clicked).
type StoreLeadState = {
  status: StoreCreatorLeadStatusEnum
  lastOfferedAt: string | undefined
  offerCode: string | undefined
  offerExpireAt: string | undefined
}
const storeLeadsState = new Map<string, StoreLeadState>()

function ensureLeadState(leadId: string): StoreLeadState {
  let s = storeLeadsState.get(leadId)
  if (!s) {
    s = { status: StoreCreatorLeadStatusEnum.NEW, lastOfferedAt: undefined, offerCode: undefined, offerExpireAt: undefined }
    storeLeadsState.set(leadId, s)
  }
  return s
}

export function getMockLeadsForStore(storeId: string): StoreCreatorLeadViewModel[] {
  const relevant = wishlistMockData.filter(w => w.storeId === storeId)
  return relevant.map(w => {
    const creator = creatorsRaw.find(c => c.handle === w.creatorHandle)
    const state = ensureLeadState(w.id)
    return StoreCreatorLeadViewModel.fromJS({
      leadId: w.id,
      creator: creator ? {
        handle: creator.handle,
        displayName: creator.displayName,
        profileImageUrl: creator.avatarUrl,
        city: creator.city,
        verified: true,
        followers: creator.followers,
        rating: creator.rating,
        level: creator.level?.level,
      } : {
        handle: w.creatorHandle,
        displayName: w.creatorHandle,
        profileImageUrl: '',
        city: '',
        verified: false,
        followers: 0,
        rating: 0,
      },
      wishlistedAt: w.addedAt,
      priority: w.priority,
      reason: w.reason,
      status: state.status,
      lastOfferedAt: state.lastOfferedAt,
      offerCode: state.offerCode,
      offerExpireAt: state.offerExpireAt,
    })
  }).sort((a, b) => a.priority - b.priority)
}

export function getMockLeadsStatsForStore(storeId: string): { new: number; offerSent: number; accepted: number } {
  const leads = getMockLeadsForStore(storeId)
  return {
    new: leads.filter(l => l.status === StoreCreatorLeadStatusEnum.NEW).length,
    offerSent: leads.filter(l => l.status === StoreCreatorLeadStatusEnum.OFFER_SENT).length,
    accepted: leads.filter(l => l.status === StoreCreatorLeadStatusEnum.ACCEPTED).length,
  }
}

// Auto-generates a per-creator discount code from a handle. Falls back to
// "CREATOR" when the handle is missing, and appends "-2", "-3"… suffixes on
// collision so the mock matches the collision-handling contract.
function autoCodeForHandle(handle: string | undefined, discountLabel: string, taken: Set<string>): string {
  const base = (handle ?? 'CREATOR').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12)
  let candidate = `${base}${discountLabel}`
  let n = 2
  while (taken.has(candidate)) {
    candidate = `${base}${discountLabel}-${n++}`
  }
  return candidate
}

export function recordBulkOffersSent(
  leadIds: string[],
  template: { percentOff?: number; flatOffCents?: number; expireAt: Date | string; maxUses?: number; message?: string },
): { success: boolean; created: CreatorDiscountCodeViewModel[]; failed: Array<{ leadId: string; reason: string }> } {
  const expireIso = template.expireAt instanceof Date
    ? template.expireAt.toISOString()
    : new Date(template.expireAt).toISOString()

  const discountLabel = template.percentOff && template.percentOff > 0
    ? `${template.percentOff}`
    : template.flatOffCents && template.flatOffCents > 0
      ? `${Math.round(template.flatOffCents / 100)}E`
      : 'DTO'

  const taken = new Set<string>(discountCodesMockData.map(d => d.code))
  const created: CreatorDiscountCodeViewModel[] = []
  const failed: Array<{ leadId: string; reason: string }> = []

  for (const leadId of leadIds) {
    const wl = wishlistMockData.find(w => w.id === leadId)
    if (!wl) {
      failed.push({ leadId, reason: 'lead-not-found' })
      continue
    }
    const code = autoCodeForHandle(wl.creatorHandle, discountLabel, taken)
    taken.add(code)
    const discount = recordOfferSent(leadId, {
      code,
      percentOff: template.percentOff,
      flatOffCents: template.flatOffCents,
      expireAt: expireIso,
      description: template.message,
      maxUses: template.maxUses,
    })
    created.push(discount)
  }

  return { success: failed.length === 0, created, failed }
}

// Dev-only helper: simulate a restaurant sending a coupon to the current
// creator for `storeSlug`, which will trigger useMatchWallet.promote().
export function simulateMatchCouponArrival(
  storeSlug: string,
  opts: { percentOff?: number; code?: string } = {},
): any {
  const restaurant = wishlistMockData.find(w => w.slugName === storeSlug)
  const store = restaurant || { slugName: storeSlug, storeId: storeSlug, name: storeSlug }
  const code = opts.code ?? `MATCH${(opts.percentOff ?? 15)}-${Date.now().toString(36).slice(-4).toUpperCase()}`
  const coupon = {
    code,
    percentOff: opts.percentOff ?? 15,
    flatOffCents: undefined,
    description: `Cupón match para ${store.name}`,
    storeId: (store as any).storeId,
    expireAt: iso(daysFromNow(30)),
    usageCount: 0,
    maxUses: 1,
  }
  discountCodesMockData.push(coupon)
  // Also register into the WalletCoupon via a direct localStorage write so
  // the creator-side useCouponWallet observes it without further wiring.
  if (typeof window !== 'undefined') {
    const STORAGE_KEY = 'guavagram.coupon_wallet.v1'
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      const list = raw ? JSON.parse(raw) : []
      const id = `${store.slugName}:${code}`.toLowerCase()
      if (!list.some((c: any) => c.id === id)) {
        list.push({
          id,
          code,
          storeName: store.name,
          storeSlug: store.slugName,
          storeCity: (store as any).city,
          storeLogoUrl: (store as any).imageUrl,
          discountPercent: coupon.percentOff,
          creatorHandle: undefined,
          creatorName: undefined,
          savedAt: new Date().toISOString(),
        })
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
      }
    } catch {}
  }
  return coupon
}

export function recordOfferSent(leadId: string, payload: { code: string; percentOff?: number; flatOffCents?: number; expireAt: string; description?: string; maxUses?: number }): CreatorDiscountCodeViewModel {
  const wl = wishlistMockData.find(w => w.id === leadId)
  const state = ensureLeadState(leadId)
  state.status = StoreCreatorLeadStatusEnum.OFFER_SENT
  state.lastOfferedAt = new Date().toISOString()
  state.offerCode = payload.code
  state.offerExpireAt = payload.expireAt

  const discount = {
    code: payload.code,
    percentOff: payload.percentOff,
    flatOffCents: payload.flatOffCents,
    description: payload.description ?? `Oferta para ${wl?.creatorHandle ?? 'creator'}`,
    storeId: wl?.storeId,
    expireAt: payload.expireAt,
    usageCount: 0,
    maxUses: payload.maxUses ?? 1,
  }
  discountCodesMockData.push(discount)
  return CreatorDiscountCodeViewModel.fromJS(discount)
}

// Raw export for composables that need the shaped objects directly
export const currentCreatorMock = currentCreatorMockData
export const homeStatsMock = homeStatsMockData
export const levelMock = levelMockData
export const reviewsMock = reviewsMockData
export const wishlistMock = wishlistMockData
export const discountCodesMock = discountCodesMockData
