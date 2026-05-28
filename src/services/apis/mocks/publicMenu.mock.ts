// Dev-only mock: converts the dashboard `mockCatalog` into the shape returned
// by the public menu endpoints (`MenuViewModel`, `StoreInfoViewModel`).
// Used by /r/[slug]/menu when running against a dev store that the backend
// doesn't know about yet.

import { mockCatalog } from './catalog.mock'

// Slugs we recognize as dev mock stores. Matches `useCurrentStore.ts` dev data.
const DEV_SLUGS: Record<string, { name: string; city: string }> = {
  'pau-artiso-demo': { name: 'Demo Store', city: 'Barcelona' },
  'pau-artiso-bcn':  { name: 'Barcelona Centro', city: 'Barcelona' },
  'pau-artiso-mad':  { name: 'Madrid Sol', city: 'Madrid' },
}

export const isDevSlug = (slug: string) => slug in DEV_SLUGS

const titleFromSlug = (slug: string) =>
  slug.split('-').filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

const metaForSlug = (slug: string) =>
  DEV_SLUGS[slug] ?? { name: titleFromSlug(slug), city: 'Barcelona' }

// ─── Demo modifiers ───────────────────────────────────────────────────────────
// We attach example variant groups and attribute groups to a few items so the
// modifier modal flow is visible in dev. The data shape matches the public
// /menu endpoint: groups live at the menu level (attributeGroups + attributes),
// items reference them by id (variantAttributeGroupId / attributeGroupIds).

const DEMO_ATTRIBUTES = [
  // Wine serving — variant (replaces base price)
  { id: 'attr-copa', name: 'Copa', price: 4.50, maxSelections: 1, defaultSelected: true, labels: [] },
  { id: 'attr-botella', name: 'Botella', price: 22.00, maxSelections: 1, defaultSelected: false, labels: [] },

  // Steak doneness — required radio, no price
  { id: 'attr-poco-hecho', name: 'Poco hecho', price: 0, maxSelections: 1, defaultSelected: false, labels: [] },
  { id: 'attr-al-punto', name: 'Al punto', price: 0, maxSelections: 1, defaultSelected: true, labels: [] },
  { id: 'attr-hecho', name: 'Hecho', price: 0, maxSelections: 1, defaultSelected: false, labels: [] },
  { id: 'attr-muy-hecho', name: 'Muy hecho', price: 0, maxSelections: 1, defaultSelected: false, labels: [] },

  // Steak extras — optional checkbox with +price
  { id: 'attr-extra-bearnesa', name: 'Salsa bearnesa', price: 1.80, maxSelections: 1, defaultSelected: false, labels: [] },
  { id: 'attr-extra-pimienta', name: 'Pimienta verde', price: 1.50, maxSelections: 1, defaultSelected: false, labels: [] },
  { id: 'attr-extra-foie', name: 'Escalopa de foie', price: 4.00, maxSelections: 1, defaultSelected: false, labels: [] },
  { id: 'attr-extra-trufa', name: 'Lasca de trufa negra', price: 5.50, maxSelections: 1, defaultSelected: false, labels: [] },

  // Burger “sin/con” — checkbox, free
  { id: 'attr-sin-cebolla', name: 'Sin cebolla', price: 0, maxSelections: 1, defaultSelected: false, labels: [] },
  { id: 'attr-sin-pepinillo', name: 'Sin pepinillo', price: 0, maxSelections: 1, defaultSelected: false, labels: [] },
  { id: 'attr-sin-tomate', name: 'Sin tomate', price: 0, maxSelections: 1, defaultSelected: false, labels: [] },
  { id: 'attr-extra-queso', name: 'Extra queso', price: 1.20, maxSelections: 1, defaultSelected: false, labels: [] },
  { id: 'attr-extra-bacon', name: 'Extra bacon', price: 1.80, maxSelections: 1, defaultSelected: false, labels: [] },

  // Water size — variant
  { id: 'attr-agua-pequena', name: '50 cl', price: 2.50, maxSelections: 1, defaultSelected: true, labels: [] },
  { id: 'attr-agua-grande', name: '1 L', price: 3.50, maxSelections: 1, defaultSelected: false, labels: [] },
  { id: 'attr-agua-gas', name: 'Con gas 50 cl', price: 2.80, maxSelections: 1, defaultSelected: false, labels: [] },

  // Coffee — variant (espresso/cortado/americano/cappuccino)
  { id: 'attr-espresso', name: 'Espresso', price: 2.20, maxSelections: 1, defaultSelected: true, labels: [] },
  { id: 'attr-cortado', name: 'Cortado', price: 2.50, maxSelections: 1, defaultSelected: false, labels: [] },
  { id: 'attr-americano', name: 'Americano', price: 2.80, maxSelections: 1, defaultSelected: false, labels: [] },
  { id: 'attr-cappuccino', name: 'Cappuccino', price: 3.20, maxSelections: 1, defaultSelected: false, labels: [] },

  // Coffee milk type — checkbox (alternative milks, optional, +price)
  { id: 'attr-leche-normal', name: 'Leche entera', price: 0, maxSelections: 1, defaultSelected: false, labels: [] },
  { id: 'attr-leche-avena', name: 'Bebida de avena', price: 0.40, maxSelections: 1, defaultSelected: false, labels: [] },
  { id: 'attr-leche-soja', name: 'Bebida de soja', price: 0.40, maxSelections: 1, defaultSelected: false, labels: [] },
]

const DEMO_GROUPS = [
  // Variant: Wine serving
  { id: 'g-vino-formato', name: 'Formato', attributeIds: ['attr-copa', 'attr-botella'], minSelections: 1, maxSelections: 1, defaultVariantAttributeId: 'attr-copa' },
  // Variant: Water size
  { id: 'g-agua-formato', name: 'Formato', attributeIds: ['attr-agua-pequena', 'attr-agua-grande', 'attr-agua-gas'], minSelections: 1, maxSelections: 1, defaultVariantAttributeId: 'attr-agua-pequena' },
  // Variant: Coffee
  { id: 'g-cafe-tipo', name: 'Tipo de café', attributeIds: ['attr-espresso', 'attr-cortado', 'attr-americano', 'attr-cappuccino'], minSelections: 1, maxSelections: 1, defaultVariantAttributeId: 'attr-espresso' },

  // Required radio (no price): steak doneness
  { id: 'g-chuleton-punto', name: 'Punto de la carne', attributeIds: ['attr-poco-hecho', 'attr-al-punto', 'attr-hecho', 'attr-muy-hecho'], minSelections: 1, maxSelections: 1, defaultVariantAttributeId: undefined },

  // Optional checkbox: steak extras (max 2)
  { id: 'g-chuleton-extras', name: 'Extras', attributeIds: ['attr-extra-bearnesa', 'attr-extra-pimienta', 'attr-extra-foie', 'attr-extra-trufa'], minSelections: 0, maxSelections: 2, defaultVariantAttributeId: undefined },

  // Optional checkbox: burger ingredients to remove
  { id: 'g-burger-sin', name: 'Personaliza', attributeIds: ['attr-sin-cebolla', 'attr-sin-pepinillo', 'attr-sin-tomate'], minSelections: 0, maxSelections: 3, defaultVariantAttributeId: undefined },

  // Optional checkbox: burger extras
  { id: 'g-burger-extras', name: 'Extras', attributeIds: ['attr-extra-queso', 'attr-extra-bacon'], minSelections: 0, maxSelections: 2, defaultVariantAttributeId: undefined },

  // Optional: coffee milk substitute
  { id: 'g-cafe-leche', name: 'Tipo de leche', attributeIds: ['attr-leche-normal', 'attr-leche-avena', 'attr-leche-soja'], minSelections: 0, maxSelections: 1, defaultVariantAttributeId: undefined },
]

// Maps item id → modifiers config. We pick a handful so the demo shows all
// 3 modifier shapes (variant price, required radio, optional checkboxes).
const MODIFIERS_BY_ITEM: Record<string, { variantAttributeGroupId?: string; attributeGroupIds?: string[] }> = {
  // Chuletón: required doneness + optional extras with +price
  'p-01': { attributeGroupIds: ['g-chuleton-punto', 'g-chuleton-extras'] },

  // Water: variant size (50cl / 1L / con gas)
  'b-01': { variantAttributeGroupId: 'g-agua-formato' },

  // Coffee: variant type + optional alternative milk
  'b-05': { variantAttributeGroupId: 'g-cafe-tipo', attributeGroupIds: ['g-cafe-leche'] },

  // Wines get per-bottle variant groups generated below (Copa + Botella with
  // different prices per wine), wired in buildDevMenu().
}

// Per-wine copa/botella prices. Lets the demo show "the same modifier UI" but
// with real-feel pricing — each wine has its own Copa price.
const WINE_VARIANTS: Record<string, { copa: number; botella: number }> = {
  'v-b-01': { copa: 5.50, botella: 28.00 }, // Albariño Pazo de Señoráns
  'v-b-02': { copa: 4.50, botella: 22.00 }, // Verdejo Naia
  'v-b-03': { copa: 4.80, botella: 24.00 }, // Chardonnay Enate 234
  'v-t-01': { copa: 6.50, botella: 35.00 }, // Ribera del Duero Crianza
  'v-t-02': { copa: 7.50, botella: 42.00 }, // Rioja Reserva
  'v-t-03': { copa: 8.50, botella: 48.00 }, // Garnacha del Priorat
  'v-r-01': { copa: 5.00, botella: 26.00 }, // Provence Rosé
  'v-r-02': { copa: 4.00, botella: 18.00 }, // Garnacha rosada
}

// New burger item we inject into the principales category, with sin/extras attribute groups
const DEMO_BURGER = {
  id: 'p-burger-demo',
  name: 'Hamburguesa de la casa',
  description: 'Carne de vaca madurada 200g, queso curado, cebolla caramelizada, tomate raf y pan brioche artesano.',
  price: 13.50,
}

// Use keyword-based topical placeholders (LoremFlickr) instead of hardcoded
// Unsplash photo IDs. Why: hand-picking IDs is fragile — one wrong digit and
// the burger image ends up on "pan con tomate". LoremFlickr serves a CC photo
// matching the keywords reliably, every time.
const dishImage = (keywords: string, w = 480, h = 480) =>
  `https://loremflickr.com/${w}/${h}/${encodeURIComponent(keywords)}/all?lock=${hashKey(keywords)}`

// Deterministic hash so the same dish always gets the same image across reloads.
function hashKey(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) + s.charCodeAt(i)
  return Math.abs(h) % 100000
}

const IMAGES_BY_ITEM: Record<string, string> = {
  // Entrantes
  'e-01': dishImage('toast,tomato,bread'),
  'e-02': dishImage('croquette,fried,spanish'),
  'e-03': dishImage('burrata,mozzarella,cheese'),
  'e-04': dishImage('tuna,tartare,sashimi'),
  'e-05': dishImage('ensaladilla,potato,salad'),
  // Para compartir
  's-01': dishImage('ham,jamon,charcuterie'),
  's-02': dishImage('cheese,board,platter'),
  's-03': dishImage('octopus,pulpo,grilled'),
  's-04': dishImage('seafood,anchovy,mediterranean'),
  // Arroces
  'a-01': dishImage('paella,rice,spanish'),
  'a-02': dishImage('squid,black-rice,arroz'),
  'a-03': dishImage('rice,seafood,prawn'),
  'a-04': dishImage('fideua,noodle,seafood'),
  // Principales
  'p-01': dishImage('steak,beef,grilled'),
  'p-02': dishImage('duck,magret,plated'),
  'p-03': dishImage('cod,fish,plated'),
  'p-04': dishImage('risotto,mushroom,truffle'),
  'p-05': dishImage('beef,wellington,roast'),
  'p-06': dishImage('seabass,fish,roasted'),
  'p-burger-demo': dishImage('hamburger,burger,brioche'),
  // Postres
  'd-01': dishImage('chocolate,fondant,cake'),
  'd-02': dishImage('crema-catalana,custard,dessert'),
  'd-03': dishImage('cheesecake,fig,dessert'),
  'd-04': dishImage('sorbet,lemon,dessert'),
  'd-05': dishImage('tiramisu,pistachio,dessert'),
  // Bebidas
  'b-01': dishImage('mineral-water,bottle,glass'),
  'b-03': dishImage('craft-beer,ale,glass'),
  'b-04': dishImage('sangria,fruit,pitcher'),
  'b-05': dishImage('espresso,coffee,cup'),
  // Vinos
  'v-b-01': dishImage('white-wine,vineyard,bottle'),
  'v-b-02': dishImage('white-wine,verdejo,bottle'),
  'v-b-03': dishImage('chardonnay,white-wine,bottle'),
  'v-t-01': dishImage('red-wine,ribera,bottle'),
  'v-t-02': dishImage('red-wine,rioja,bottle'),
  'v-t-03': dishImage('red-wine,garnacha,bottle'),
  'v-r-01': dishImage('rose-wine,bottle,glass'),
  'v-r-02': dishImage('rose-wine,garnacha,bottle'),
  // Combos
  'combo-1': dishImage('menu,plated,restaurant'),
  'combo-2': dishImage('tasting-menu,fine-dining,plated'),
  'combo-3': dishImage('shared-table,group,dining'),
}

// Sample videos so the "Videos" toggle is testeable across the menu.
// Hosted by W3C since 2010 — small (~1-5 MB), H.264 MP4s, no hotlink
// protection, autoplay-friendly on every modern browser. Loop kicks in
// because the clips are short (15-30 s).
const SAMPLE_VIDEOS = [
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
  'https://media.w3.org/2010/05/bunny/trailer.mp4',
  'https://media.w3.org/2010/05/bunny/movie.mp4',
  'https://media.w3.org/2010/05/video/movie_300.mp4',
  'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
]
const pickVideo = (i: number) => SAMPLE_VIDEOS[i % SAMPLE_VIDEOS.length]!

const VIDEOS_BY_ITEM: Record<string, string> = {
  // Entrantes
  'e-01': pickVideo(0), // pan tomate
  'e-03': pickVideo(1), // burrata
  'e-04': pickVideo(2), // tartar
  // Para compartir
  's-03': pickVideo(3), // pulpo
  // Arroces
  'a-01': pickVideo(0), // paella
  'a-02': pickVideo(4), // arroz negro
  // Principales
  'p-01': pickVideo(1), // chuletón
  'p-04': pickVideo(2), // risotto
  'p-burger-demo': pickVideo(3),
  // Postres
  'd-01': pickVideo(4), // coulant
  // Vinos
  'v-t-01': pickVideo(0),
  'v-b-01': pickVideo(1),
}

export const buildDevMenu = (slug: string) => {
  if (!slug) return null

  // Inject the demo burger into the principales category for richer modifier examples
  const categoriesWithDemos = (mockCatalog.categories ?? []).map(cat => {
    if (cat.id === 'cat-principales') {
      const items = cat.items ?? []
      const alreadyHasBurger = items.some(i => i.id === 'p-burger-demo')
      return {
        ...cat,
        items: alreadyHasBurger ? items : [...items, DEMO_BURGER as any],
      }
    }
    return cat
  })

  const categories = categoriesWithDemos.map(cat => ({
    id: cat.id,
    name: cat.name,
    description: undefined,
    imageUrl: undefined,
    showOrderCourseSelection: false,
    menuItemIds: (cat.items ?? []).map(i => i.id).filter(Boolean) as string[],
    // Propagate parent for the 2-level hierarchy (family > subfamily).
    // A top-level category leaves this undefined; a subcategory points to its parent's id.
    parentCategoryId: (cat as any).parentCategoryId,
  }))

  // Demo burger uses both kinds of attribute groups (sin/con + extras with price)
  MODIFIERS_BY_ITEM['p-burger-demo'] = {
    attributeGroupIds: ['g-burger-sin', 'g-burger-extras'],
  }

  // Per-wine variant generation: create dedicated copa/botella attributes and a
  // dedicated group for each wine so prices reflect each bottle accurately.
  const wineAttributes: any[] = []
  const wineGroups: any[] = []
  const winePriceFloor: Record<string, number> = {} // wineId → cheapest variant
  for (const [wineId, prices] of Object.entries(WINE_VARIANTS)) {
    const copaId = `attr-${wineId}-copa`
    const botellaId = `attr-${wineId}-botella`
    wineAttributes.push(
      { id: copaId, name: 'Copa', price: prices.copa, maxSelections: 1, defaultSelected: true, labels: [] },
      { id: botellaId, name: 'Botella', price: prices.botella, maxSelections: 1, defaultSelected: false, labels: [] },
    )
    const groupId = `g-${wineId}-formato`
    wineGroups.push({
      id: groupId,
      name: 'Formato',
      attributeIds: [copaId, botellaId],
      minSelections: 1,
      maxSelections: 1,
      defaultVariantAttributeId: copaId,
    })
    MODIFIERS_BY_ITEM[wineId] = { variantAttributeGroupId: groupId }
    winePriceFloor[wineId] = Math.min(prices.copa, prices.botella)
  }

  const items = categoriesWithDemos.flatMap(cat =>
    (cat.items ?? []).map(i => {
      const mods = MODIFIERS_BY_ITEM[i.id ?? ''] ?? {}
      const isVariant = !!mods.variantAttributeGroupId
      // For wine items, the card shows the cheapest variant (Copa). The cart
      // logic still REPLACES this with the selected variant's price.
      const cardPrice = isVariant
        ? (winePriceFloor[i.id ?? ''] ?? (i.price ?? 0))
        : (i.price ?? 0)
      // Compose medias from the per-item image / video maps so the public menu
      // has something to show (and so the view-settings toggle has an effect).
      const itemId = i.id ?? ''
      const medias: { mediaUrl: string; isVideo: boolean }[] = []
      if (IMAGES_BY_ITEM[itemId]) {
        medias.push({ mediaUrl: IMAGES_BY_ITEM[itemId], isVideo: false })
      }
      if (VIDEOS_BY_ITEM[itemId]) {
        medias.push({ mediaUrl: VIDEOS_BY_ITEM[itemId], isVideo: true })
      }
      return {
        id: i.id,
        name: i.name,
        description: i.description,
        price: cardPrice,
        inventoryProductMeasureUnitTypeId: 0,
        showOrderCourseSelection: false,
        variantAttributeGroupId: mods.variantAttributeGroupId,
        attributeGroupIds: mods.attributeGroupIds ?? [],
        labels: [],
        medias,
        recommendedMenuItems: [],
      }
    })
  )

  return {
    languageCode: 'es',
    id: 'mock-menu',
    name: 'Tu Menú',
    description: undefined,
    isFixedPrice: false,
    price: undefined,
    orderCourses: [],
    availableLanguages: ['es'],
    categories,
    items,
    // Demo combo so the bio's "combo" campaign deep-links to a real BundleModal.
    bundles: [
      {
        id: 'demo-bundle-1',
        price: 14.90,
        name: 'Menú del día',
        description: 'Primer plato + segundo + bebida',
        imageUrl: undefined,
        bundleCategories: [
          { id: 'bc-primero', name: 'Primer plato', description: 'Elige uno', itemsCount: 1, menuItems: { 'e-01': 0, 'e-02': 0, 'e-03': 0 } },
          { id: 'bc-segundo', name: 'Segundo plato', description: 'Elige uno', itemsCount: 1, menuItems: { 'p-01': 0, 'p-burger-demo': 0 } },
          { id: 'bc-bebida', name: 'Bebida', description: 'Elige una', itemsCount: 1, menuItems: { 'b-01': 0, 'b-05': 0 } },
        ],
      },
    ],
    attributeGroups: [...DEMO_GROUPS, ...wineGroups],
    attributes: [...DEMO_ATTRIBUTES, ...wineAttributes],
    suggestedItems: [],
  }
}

export const buildDevStore = (slug: string) => {
  if (!slug) return null
  const meta = metaForSlug(slug)
  return {
    id: slug,
    slugName: slug,
    name: meta.name,
    logoUrl: undefined,
    currencyCode: 'EUR',
    description: 'Restaurante mediterráneo moderno con toques de autor.',
    address: {
      addressLine1: 'Carrer Example 123',
      city: meta.city,
      state: meta.city,
      country: 'España',
      countryCode: 'ES',
      postalCode: '08001',
    },
    phoneNumber: '600000000',
    phoneDialCode: '+34',
    emailAddress: `hola@${slug}.com`,
    menuImageUrl: undefined,
    welcomeMessage: undefined,
    receiptMessage: undefined,
    allowTableChange: false,
    hasPaymentBeforeOrder: false,
    displayServiceButton: false,
    hideNotes: false,
    hasBookings: true,
    socialShareDiscountPercentage: undefined,
    tipsEnabled: false,
    hasPaylater: false,
    isLiveMode: false,
    orderChannelStatus: {
      TakeAway: { isOpen: true, openingTime: undefined, closingTime: undefined },
      Delivery: { isOpen: true, openingTime: undefined, closingTime: undefined },
    },
    countryCode: 'ES',
    enableCashOrders: false,
    defaultLangCode: 'es',
    externalLinks: {},
    externalScripts: {},
    weeklySchedule: {},
    bookingShifts: [],
    bookingOffers: [],
  }
}

export const buildDevProfile = (slug: string) => {
  if (!slug) return null
  // Dev fallback when the public /profile endpoint returns null (offline /
  // unreachable backend during local development). Intentionally has NO
  // campaigns, NO featured items, NO socials — the public bio should render
  // empty states for those sections rather than fabricated data the owner
  // never created. If you need demo data, gate it behind VITE_USE_MOCK.
  return {
    accentColor: '#ff2d23',
    useDarkMode: false,
    skinId: 'modern',
    textColor: '#1a1c1b',
    isDarkMode: false,
    brandingSettings: {},
  }
}
