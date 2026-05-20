// Preset themes for the creator bio — bundles background + colors + typography + radius.
// Inspired by the Stitch restaurant landing-page templates and famous brands.

import type { CreatorBioStyle } from './useCreatorBioStyle'

export type CreatorBioTheme = {
  id: string
  label: string
  tier: 'free' | 'premium'
  cuisine?: string
  thumb: {
    bgCss: string
    textColor: string
    buttonBg: string
    buttonBorder?: string
    buttonText?: string
  }
  style: CreatorBioStyle
}

const base: Pick<CreatorBioStyle, 'skinId' | 'pageBgMode' | 'pageTextureId' | 'pageTextureTint'> = {
  skinId: 'classic',
  pageBgMode: 'solid',
  pageTextureId: 'gradient',
  pageTextureTint: '#ff6b4a',
}

// ═══════════════ FREE — 6 plantillas cuisine-bespoke ═══════════════
// Una por cada tipo de restaurante. Cada paleta calca un referente mundial
// para que la marca se sienta inmediatamente legítima.

const FREE_THEMES: CreatorBioTheme[] = [

  // 1 · Mediterráneo — ref. ESTIATORIO MILOS
  // Blanco yeso puro + azul Egeo profundo + serif tight tracking. Sin gradiente:
  // su sello es la pureza del blanco contra el azul.
  {
    id: 'mediterraneo',
    label: 'Mediterráneo',
    tier: 'free',
    cuisine: 'mediterraneo',
    thumb: { bgCss: '#ffffff', textColor: '#0a1929', buttonBg: '#1b3a5c', buttonText: '#ffffff' },
    style: {
      ...base,
      mode: 'light',
      skinTypography: 'serif',
      skinRadius: 'squared',
      accentColor: '#1b3a5c',
      bgColor: '#ffffff',
      textColor: '#0a1929',
      pageTextureTint: '#1b3a5c',
    },
  },

  // 2 · Sushi — ref. NOBU
  // Papel washi cálido + sumi negro + sello hanko rojo. Serif condensado
  // sobre crema parchment, tipografía con peso y tracking medido.
  {
    id: 'sushi',
    label: 'Sushi',
    tier: 'free',
    cuisine: 'sushi',
    thumb: { bgCss: '#f1e8d4', textColor: '#1a1a1a', buttonBg: '#1a1a1a', buttonText: '#f1e8d4' },
    style: {
      ...base,
      mode: 'light',
      skinTypography: 'serif',
      skinRadius: 'squared',
      accentColor: '#c8102e',
      bgColor: '#f1e8d4',
      textColor: '#1a1a1a',
      pageTextureTint: '#c8102e',
    },
  },

  // 3 · Hamburguesería — ref. BURGER KING 2021 (Jones Knowles Ritchie rebrand)
  // Sundae cream + Flaming red + Fiery mustard. La nueva identidad de BK es
  // light mode, tipografía rounded chunky (Flame Sans) y radios redondos.
  {
    id: 'hamburgueseria',
    label: 'Hamburguesería',
    tier: 'free',
    cuisine: 'hamburgueseria',
    thumb: { bgCss: '#f5ebdc', textColor: '#502314', buttonBg: '#d62300', buttonText: '#f5ebdc' },
    style: {
      ...base,
      mode: 'light',
      skinTypography: 'rounded',
      skinRadius: 'rounded',
      accentColor: '#d62300',
      bgColor: '#f5ebdc',
      textColor: '#502314',
      pageTextureTint: '#f5b335',
    },
  },

  // 4 · Pizzería — ref. EATALY + ROBERTA'S
  // Crema mozzarella + verde basílico (forest, no oliva) + rojo tomate vivo.
  // Serif italiana editorial. Eataly cuaja con esta paleta exacta.
  {
    id: 'pizzeria',
    label: 'Pizzería',
    tier: 'free',
    cuisine: 'pizzeria',
    thumb: { bgCss: '#f5efe0', textColor: '#1b3d1f', buttonBg: '#d7263d', buttonText: '#f5efe0' },
    style: {
      ...base,
      mode: 'light',
      skinTypography: 'serif',
      skinRadius: 'rounded',
      accentColor: '#d7263d',
      bgColor: '#f5efe0',
      textColor: '#1b3d1f',
      pageTextureTint: '#d7263d',
    },
  },

  // 5 · Italiano — ref. CARBONE NY
  // Pergamino + espresso oscuro + Carbone burgundy. Slab/serif americano
  // estilo Major Food Group. Sustituye al verde oliva por borgoña.
  {
    id: 'italiano',
    label: 'Italiano',
    tier: 'free',
    cuisine: 'italiano',
    thumb: { bgCss: '#efe5cc', textColor: '#2b1810', buttonBg: '#722f37', buttonText: '#efe5cc' },
    style: {
      ...base,
      mode: 'light',
      skinTypography: 'serif',
      skinRadius: 'rounded',
      accentColor: '#722f37',
      bgColor: '#efe5cc',
      textColor: '#2b1810',
      pageTextureTint: '#722f37',
    },
  },

  // 6 · Mexicano — ref. PUJOL + COSME + TACOMBI
  // Papel artesanal off-white + cocoa oscuro + terracota refinada. Pujol es
  // sobrio (rounded sans, casi sin acento); Tacombi añade el rojo terracota.
  {
    id: 'mexicano',
    label: 'Mexicano',
    tier: 'free',
    cuisine: 'mexicano',
    thumb: { bgCss: '#f4ecd9', textColor: '#2b1810', buttonBg: '#c73e1a', buttonText: '#f4ecd9' },
    style: {
      ...base,
      mode: 'light',
      skinTypography: 'rounded',
      skinRadius: 'rounded',
      accentColor: '#c73e1a',
      bgColor: '#f4ecd9',
      textColor: '#2b1810',
      pageTextureTint: '#c73e1a',
    },
  },
]

// ═══════════════ PREMIUM — galería completa (Pro) ═══════════════
// Las 22 plantillas originales (cosmic, brand-inspired, etc.) gateadas
// detrás del plan Pro. Se ven más sofisticadas y permiten más expresividad.

const PREMIUM_THEMES: Omit<CreatorBioTheme, 'tier'>[] = [

  // ───────── ★ Featured premium — "increíbles" (3) ─────────
  // Tres direcciones premium muy distintas: pastel iridescent (Aurora),
  // dark luxury lounge (Velvet) y editorial magazine (Editorial). Diseñadas
  // como showcase del plan Pro — texturas, paletas sofisticadas, tipografía
  // intencional. Más memorables que las brand-inspired clásicas.

  // ★ 1 · Aurora — Pastel iridescent gradient · violet · sans modern
  {
    id: 'aurora',
    label: 'Aurora',
    thumb: { bgCss: 'linear-gradient(135deg, #f8e8ff 0%, #ffd5e5 35%, #ffe8c8 70%, #d5f0ff 100%)', textColor: '#2d1b4e', buttonBg: '#7c3aed', buttonText: '#ffffff' },
    style: {
      ...base,
      mode: 'light',
      skinTypography: 'sans',
      skinRadius: 'rounded',
      accentColor: '#7c3aed',
      bgColor: '#f8f3ff',
      textColor: '#2d1b4e',
      pageBgMode: 'texture',
      pageTextureId: 'aurora',
      pageTextureTint: '#a855f7',
    },
  },

  // ★ 2 · Velvet — Deep emerald lounge · champagne gold · serif
  {
    id: 'velvet',
    label: 'Velvet',
    thumb: { bgCss: 'linear-gradient(160deg, #0f3d2e 0%, #082018 100%)', textColor: '#f5ecd7', buttonBg: '#d4a85a', buttonText: '#0f3d2e' },
    style: {
      ...base,
      mode: 'dark',
      skinTypography: 'serif',
      skinRadius: 'rounded',
      accentColor: '#d4a85a',
      bgColor: '#0f3d2e',
      textColor: '#f5ecd7',
      pageBgMode: 'solid',
      pageTextureId: 'gradient',
      pageTextureTint: '#1a5f47',
    },
  },

  // ★ 3 · Editorial — Kinfolk warm cream · ink black · oxblood serif
  {
    id: 'editorial',
    label: 'Editorial',
    thumb: { bgCss: '#f4ede1', textColor: '#1a1a1a', buttonBg: '#8b3a3a', buttonText: '#f4ede1' },
    style: {
      ...base,
      mode: 'light',
      skinTypography: 'serif',
      skinRadius: 'squared',
      accentColor: '#8b3a3a',
      bgColor: '#f4ede1',
      textColor: '#1a1a1a',
      pageBgMode: 'texture',
      pageTextureId: 'linen',
      pageTextureTint: '#8b3a3a',
    },
  },

  // ───────── Stitch-inspired warm/natural (5) ─────────

  // 1 · Serene
  {
    id: 'serene',
    label: 'Serene',
    thumb: { bgCss: '#f8f8f8', textColor: '#212121', buttonBg: '#ffffff', buttonBorder: '#e0e0e0', buttonText: '#212121' },
    style: {
      ...base,
      mode: 'light',
      skinTypography: 'sans',
      skinRadius: 'rounded',
      accentColor: '#20B2AA',
      bgColor: '#f8f8f8',
      textColor: '#212121',
      pageTextureTint: '#f8f8f8',
    },
  },

  // 2 · Flavor Pop
  {
    id: 'flavor-pop',
    label: 'Flavor Pop',
    thumb: { bgCss: 'linear-gradient(135deg, #FFF3E0 0%, #FFE4E1 50%, #FFD9EC 100%)', textColor: '#222222', buttonBg: '#FF0080', buttonText: '#ffffff' },
    style: {
      ...base,
      mode: 'light',
      skinTypography: 'rounded',
      skinRadius: 'pill',
      accentColor: '#FF0080',
      bgColor: '#FFF3E0',
      textColor: '#222222',
      pageBgMode: 'texture',
      pageTextureId: 'aurora',
      pageTextureTint: '#FF0080',
    },
  },

  // 3 · Homestead
  {
    id: 'homestead',
    label: 'Homestead',
    thumb: { bgCss: '#FDFBF5', textColor: '#4A3222', buttonBg: '#8BA88F', buttonText: '#ffffff' },
    style: {
      ...base,
      mode: 'light',
      skinTypography: 'serif',
      skinRadius: 'rounded',
      accentColor: '#8BA88F',
      bgColor: '#FDFBF5',
      textColor: '#4A3222',
      pageBgMode: 'texture',
      pageTextureId: 'linen',
      pageTextureTint: '#B08968',
    },
  },

  // 4 · Rapid
  {
    id: 'rapid',
    label: 'Rapid',
    thumb: { bgCss: '#FDF7F3', textColor: '#1A1A1A', buttonBg: '#FF7F00', buttonText: '#ffffff' },
    style: {
      ...base,
      mode: 'light',
      skinTypography: 'sans',
      skinRadius: 'pill',
      accentColor: '#FF7F00',
      bgColor: '#FDF7F3',
      textColor: '#1A1A1A',
      pageTextureTint: '#FDF7F3',
    },
  },

  // 5 · Aetherium
  {
    id: 'aetherium',
    label: 'Aetherium',
    thumb: { bgCss: 'linear-gradient(135deg, #0A0A0A 0%, #1A0A1A 60%, #0A0A0A 100%)', textColor: '#E0E0E0', buttonBg: 'transparent', buttonBorder: '#B8860B', buttonText: '#D4AF37' },
    style: {
      ...base,
      mode: 'dark',
      skinTypography: 'serif',
      skinRadius: 'squared',
      accentColor: '#D4AF37',
      bgColor: '#0A0A0A',
      textColor: '#E0E0E0',
      pageTextureTint: '#B8860B',
    },
  },

  // ───────── Stitch-inspired cosmic (5) ─────────

  // 6 · Cosmos
  {
    id: 'cosmos',
    label: 'Cosmos',
    thumb: { bgCss: 'linear-gradient(135deg, #1E0F3D 0%, #3C1F6D 70%, #6A0DAD 100%)', textColor: '#FFF3E0', buttonBg: '#A2D9CE', buttonText: '#1E0F3D' },
    style: {
      ...base,
      mode: 'dark',
      skinTypography: 'rounded',
      skinRadius: 'pill',
      accentColor: '#A2D9CE',
      bgColor: '#1E0F3D',
      textColor: '#FFF3E0',
      pageTextureTint: '#6A0DAD',
    },
  },

  // 7 · Interstellar
  {
    id: 'interstellar',
    label: 'Interstellar',
    thumb: { bgCss: 'linear-gradient(180deg, #0A0A1F 0%, #1C1C30 100%)', textColor: '#f6f6f8', buttonBg: '#00BCD4', buttonText: '#0A0A1F' },
    style: {
      ...base,
      mode: 'dark',
      skinTypography: 'sans',
      skinRadius: 'rounded',
      accentColor: '#00BCD4',
      bgColor: '#0A0A1F',
      textColor: '#f6f6f8',
      pageTextureTint: '#00BCD4',
    },
  },

  // ───────── Brand-inspired palettes — renamed to evocative descriptors ─────────

  // 12 · Mostaza (Glovo-inspired): yellow + teal
  {
    id: 'mostaza',
    label: 'Mostaza',
    thumb: { bgCss: '#ffc244', textColor: '#1a1c1b', buttonBg: '#00a082', buttonText: '#ffffff' },
    style: {
      ...base,
      mode: 'light',
      skinTypography: 'rounded',
      skinRadius: 'pill',
      accentColor: '#00a082',
      bgColor: '#ffc244',
      textColor: '#1a1c1b',
      pageTextureTint: '#ffc244',
    },
  },

  // 13 · Menta (Wallapop-inspired): lime + white
  {
    id: 'menta',
    label: 'Menta',
    thumb: { bgCss: '#ffffff', textColor: '#1a1c1b', buttonBg: '#00c896', buttonText: '#ffffff' },
    style: {
      ...base,
      mode: 'light',
      skinTypography: 'rounded',
      skinRadius: 'pill',
      accentColor: '#00c896',
      bgColor: '#f6fefb',
      textColor: '#0a2a22',
      pageTextureTint: '#00c896',
    },
  },

  // Ketchup (Goiko-inspired): black + red + mustard
  {
    id: 'ketchup',
    label: 'Ketchup',
    thumb: { bgCss: '#0a0a0a', textColor: '#fde047', buttonBg: '#e30613', buttonText: '#ffffff' },
    style: {
      ...base,
      mode: 'dark',
      skinTypography: 'sans',
      skinRadius: 'squared',
      accentColor: '#e30613',
      bgColor: '#0a0a0a',
      textColor: '#fde047',
      pageTextureTint: '#e30613',
    },
  },

  // 16 · Vermut (Estrella Damm-inspired): red + gold + cream (catalan tavern)
  {
    id: 'vermut',
    label: 'Vermut',
    thumb: { bgCss: '#c8102e', textColor: '#f4e4bc', buttonBg: '#d4af37', buttonText: '#1a0a0a' },
    style: {
      ...base,
      mode: 'dark',
      skinTypography: 'serif',
      skinRadius: 'rounded',
      accentColor: '#d4af37',
      bgColor: '#c8102e',
      textColor: '#f4e4bc',
      pageTextureTint: '#d4af37',
    },
  },

  // 17 · Coral (Airbnb-inspired): warm coral + white
  {
    id: 'coral',
    label: 'Coral',
    thumb: { bgCss: '#ffffff', textColor: '#1a1c1b', buttonBg: '#ff5a5f', buttonText: '#ffffff' },
    style: {
      ...base,
      mode: 'light',
      skinTypography: 'rounded',
      skinRadius: 'rounded',
      accentColor: '#ff5a5f',
      bgColor: '#ffffff',
      textColor: '#222222',
      pageTextureTint: '#ff5a5f',
    },
  },

  // 18 · Vinilo (Spotify-inspired): black + neon green
  {
    id: 'vinilo',
    label: 'Vinilo',
    thumb: { bgCss: '#121212', textColor: '#ffffff', buttonBg: '#1db954', buttonText: '#000000' },
    style: {
      ...base,
      mode: 'dark',
      skinTypography: 'sans',
      skinRadius: 'pill',
      accentColor: '#1db954',
      bgColor: '#121212',
      textColor: '#ffffff',
      pageTextureTint: '#1db954',
    },
  },

  // ───────── Extras ─────────

  // Rosa Polvo
  {
    id: 'rosa',
    label: 'Rosa Polvo',
    thumb: { bgCss: '#f0d8d8', textColor: '#1a1c1b', buttonBg: '#ffffff' },
    style: {
      ...base,
      mode: 'light',
      skinTypography: 'rounded',
      skinRadius: 'pill',
      accentColor: '#c06666',
      bgColor: '#f0d8d8',
      textColor: '#1a1c1b',
      pageTextureTint: '#f0d8d8',
    },
  },

  // Minimal
  {
    id: 'minimal',
    label: 'Minimal',
    thumb: { bgCss: '#f0ebdf', textColor: '#1a1c1b', buttonBg: 'transparent', buttonBorder: '#1a1c1b', buttonText: '#1a1c1b' },
    style: {
      ...base,
      mode: 'light',
      skinTypography: 'serif',
      skinRadius: 'pill',
      accentColor: '#1a1c1b',
      bgColor: '#f0ebdf',
      textColor: '#1a1c1b',
      pageTextureTint: '#f0ebdf',
    },
  },
]

export const CREATOR_BIO_THEMES: CreatorBioTheme[] = [
  ...FREE_THEMES,
  ...PREMIUM_THEMES.map(t => ({ ...t, tier: 'premium' as const })),
]

export const getTheme = (id: string): CreatorBioTheme | undefined =>
  CREATOR_BIO_THEMES.find(t => t.id === id)
