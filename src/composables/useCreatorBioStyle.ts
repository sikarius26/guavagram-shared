import { ref, computed } from 'vue'
import type { SkinId, SkinTypography, SkinRadius, PageBackgroundMode } from '@guava/guavagram-renderer'
import { resolveTextureStyle, getTypographyFamily, getRadiusValue } from '@guava/guavagram-renderer'

export type BioMode = 'light' | 'dark'

export type CreatorBioStyle = {
  accentColor: string
  bgColor: string
  textColor: string
  mode: BioMode
  skinId: SkinId
  skinTypography: SkinTypography
  skinRadius: SkinRadius
  pageBgMode: PageBackgroundMode
  pageTextureId: string
  pageTextureTint: string
}

const DEFAULT_STYLE: CreatorBioStyle = {
  accentColor: '#ff2d23',
  bgColor: '#ffffff',
  textColor: '#1a1c1b',
  mode: 'light',
  skinId: 'classic',
  skinTypography: 'sans',
  skinRadius: 'rounded',
  pageBgMode: 'solid',
  pageTextureId: 'gradient',
  pageTextureTint: '#ff6b4a',
}

const style = ref<CreatorBioStyle>({ ...DEFAULT_STYLE })
const isDirty = ref(false)

// ── Color utils ─────────────────────────────────────────────────────────────
const parseHex = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '')
  const n = h.length === 3 ? h.split('').map(c => c + c).join('') : h
  return [
    parseInt(n.slice(0, 2), 16),
    parseInt(n.slice(2, 4), 16),
    parseInt(n.slice(4, 6), 16),
  ]
}

const toHex = (r: number, g: number, b: number) => {
  const h = (c: number) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')
  return `#${h(r)}${h(g)}${h(b)}`
}

// Mix hex color towards another (0 = a, 1 = b).
const mix = (a: string, b: string, t: number): string => {
  const [ar, ag, ab] = parseHex(a)
  const [br, bg, bb] = parseHex(b)
  return toHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t)
}

const rgba = (hex: string, alpha: number): string => {
  const [r, g, b] = parseHex(hex)
  return `rgba(${r},${g},${b},${alpha})`
}

// Luminance — WCAG formula (simplified).
const luminance = (hex: string): number => {
  const [r, g, b] = parseHex(hex).map(c => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
}

// Pick white or black as the best contrast on top of the given color.
const onColor = (bg: string): string => (luminance(bg) > 0.45 ? '#1a1c1b' : '#ffffff')

// ── Composable ──────────────────────────────────────────────────────────────
export function useCreatorBioStyle() {
  const update = <K extends keyof CreatorBioStyle>(key: K, value: CreatorBioStyle[K]) => {
    style.value = { ...style.value, [key]: value }
    isDirty.value = true
  }

  const reset = () => {
    style.value = { ...DEFAULT_STYLE }
    isDirty.value = true
  }

  // CSS vars that cascade to the whole preview. Every Public* component can
  // reference these to adopt the current theme (bg, cards, borders, text).
  const themeVars = computed<Record<string, string>>(() => {
    const s = style.value
    const isDark = s.mode === 'dark'

    // Surface = card / button-secondary background.
    // CRITICAL: cards must NEVER blend with the page bg. On saturated themes
    // (deep red, teal, etc.), tinting the surface with bgColor makes cards
    // disappear. Use a fixed neutral surface that always contrasts:
    //   - Light mode → pure white
    //   - Dark mode → neutral dark charcoal (tiny accent hint so it feels themed,
    //     but the dominant color is always clearly different from bgColor)
    const surface = isDark ? mix('#1a1a1a', s.accentColor, 0.04) : '#ffffff'
    const surfaceSoft = isDark ? mix('#2a2a2a', s.accentColor, 0.03) : mix(s.bgColor, '#ffffff', 0.5)
    const border = isDark ? rgba('#ffffff', 0.12) : '#e5e7eb'
    const textMuted = isDark ? rgba(s.textColor, 0.6) : rgba(s.textColor, 0.55)
    const onAccent = onColor(s.accentColor)
    const accentSoft = rgba(s.accentColor, 0.1)
    const divider = isDark ? rgba('#ffffff', 0.08) : rgba('#000000', 0.06)

    return {
      '--bio-bg': s.bgColor,
      '--bio-surface': surface,
      '--bio-surface-soft': surfaceSoft,
      '--bio-border': border,
      '--bio-divider': divider,
      '--bio-text': s.textColor,
      '--bio-text-muted': textMuted,
      '--bio-accent': s.accentColor,
      '--bio-accent-soft': accentSoft,
      '--bio-on-accent': onAccent,
    }
  })

  // Style applied to the preview root (bg + font + radius var + text color + theme vars).
  const previewRootStyle = computed<Record<string, string>>(() => {
    const s = style.value
    const bg = s.pageBgMode === 'texture' && s.pageTextureId
      ? resolveTextureStyle(s.pageTextureId, s.pageTextureTint || s.accentColor)
      : { backgroundColor: s.bgColor }
    return {
      ...bg,
      color: s.textColor,
      fontFamily: getTypographyFamily(s.skinTypography),
      '--radius-base': getRadiusValue(s.skinRadius),
      '--creator-accent': s.accentColor,
      ...themeVars.value,
    } as Record<string, string>
  })

  return { style, isDirty, update, reset, previewRootStyle, themeVars }
}

export const CREATOR_TAG_SUGGESTIONS: string[] = [
  'Pasta lover', 'Brunch queen', 'Wine addict', 'Coffee snob', 'Ramen hunter',
  'Pizza freak', 'Vegan foodie', 'Street food', 'Tapas lover', 'Sushi obsessed',
  'Craft beer', 'Natural wine', 'Dessert first', 'Brunch > Dinner', 'Spicy food',
  'Seafood fan', 'BBQ lover', 'Chocoholic', 'Matcha lover', 'Gluten-free',
  'Mediterranean', 'Asian fusion', 'Mexican soul', 'Italian heart',
]

// Shared palette (same as restaurant dashboard GuavagramPanel categoryPalette)
const TAG_PALETTE: Array<{ bg: string; text: string; border: string }> = [
  { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' }, // rojo
  { bg: '#fffbeb', text: '#d97706', border: '#fde68a' }, // ámbar
  { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' }, // verde
  { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' }, // azul
  { bg: '#fdf4ff', text: '#c026d3', border: '#f5d0fe' }, // morado
  { bg: '#ecfeff', text: '#0891b2', border: '#a5f3fc' }, // cian
  { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa' }, // naranja
  { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe' }, // violeta
]

// Keyword → mdi icon map (prefix match, lowercased)
const TAG_ICON_MAP: Array<[string, string]> = [
  ['pasta', 'mdi-pasta'],
  ['pizza', 'mdi-pizza'],
  ['ramen', 'mdi-bowl-mix'],
  ['noodle', 'mdi-noodles'],
  ['asian', 'mdi-noodles'],
  ['sushi', 'mdi-fish'],
  ['seafood', 'mdi-fish'],
  ['fish', 'mdi-fish'],
  ['taco', 'mdi-taco'],
  ['mexican', 'mdi-taco'],
  ['brunch', 'mdi-egg-fried'],
  ['egg', 'mdi-egg-fried'],
  ['coffee', 'mdi-coffee'],
  ['matcha', 'mdi-tea'],
  ['tea', 'mdi-tea'],
  ['wine', 'mdi-glass-wine'],
  ['beer', 'mdi-beer'],
  ['cocktail', 'mdi-glass-cocktail'],
  ['vegan', 'mdi-leaf'],
  ['mediterranean', 'mdi-leaf-circle'],
  ['gluten', 'mdi-barley-off'],
  ['street', 'mdi-food-takeout-box'],
  ['tapas', 'mdi-food-fork-drink'],
  ['bbq', 'mdi-grill'],
  ['grill', 'mdi-grill'],
  ['steak', 'mdi-food-steak'],
  ['meat', 'mdi-food-steak'],
  ['burger', 'mdi-hamburger'],
  ['dessert', 'mdi-cake'],
  ['cake', 'mdi-cake'],
  ['choco', 'mdi-cookie'],
  ['sweet', 'mdi-candy-outline'],
  ['spicy', 'mdi-chili-hot'],
  ['italian', 'mdi-pasta'],
  ['queen', 'mdi-crown-outline'],
  ['king', 'mdi-crown-outline'],
  ['hunter', 'mdi-magnify'],
  ['addict', 'mdi-heart'],
  ['lover', 'mdi-heart-outline'],
  ['freak', 'mdi-fire'],
  ['snob', 'mdi-diamond-stone'],
  ['obsessed', 'mdi-star-outline'],
  ['fan', 'mdi-star-outline'],
]

const hashTag = (s: string): number => {
  const v = s.toLowerCase().trim()
  let h = 0
  for (let i = 0; i < v.length; i++) h = (h * 31 + v.charCodeAt(i)) >>> 0
  return h
}

export const getTagIcon = (tag: string): string => {
  const v = tag.toLowerCase()
  for (const [kw, icon] of TAG_ICON_MAP) {
    if (v.includes(kw)) return icon
  }
  return 'mdi-tag-outline'
}

export const getTagStyle = (tag: string): { bg: string; text: string; border: string; icon: string } => {
  const p = TAG_PALETTE[hashTag(tag) % TAG_PALETTE.length]!
  return { ...p, icon: getTagIcon(tag) }
}
