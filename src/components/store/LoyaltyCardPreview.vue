<script setup lang="ts">
// Premium loyalty card preview — renderiza la tarjeta según el LoyaltyConfig
// completo (template + pattern + stampStyle + shape + typography + logo
// position + shine). Usado tanto en el editor de FidelizacionPanel como
// en el render público de /r/[slug] (cuando el cliente la abre).
//
// El editor de la izquierda muta los fields y este componente reactivamente
// repinta. CERO lógica de plan/gating aquí — el gating (Pro vs free) vive
// en el editor. Aquí solo pintamos lo que diga el config.

import { computed } from 'vue'
import type { LoyaltyConfig } from '~/composables/useLoyaltyConfig'

const props = withDefaults(defineProps<{
  config: LoyaltyConfig
  progress?: number // visitas YA marcadas (para preview = 4)
  storeName?: string
}>(), { progress: 4, storeName: '' })

// ─── Helpers de axes nuevos ──────────────────────────────────────────────

// Icono del badge esquina superior. Map enum → clase MDI.
const BADGE_ICON_MAP: Record<string, string> = {
  star: 'mdi-star',
  heart: 'mdi-heart',
  diamond: 'mdi-diamond-stone',
  crown: 'mdi-crown',
  leaf: 'mdi-leaf',
  sparkle: 'mdi-creation',
  coffee: 'mdi-coffee',
  chef: 'mdi-chef-hat',
}
const badgeIconClass = computed(() => BADGE_ICON_MAP[props.config.badgeIcon] ?? 'mdi-star')

// Borde de la card (clase + estilo composables con shape rounded/sharp/etc).
const borderClass = computed(() => {
  switch (props.config.cardBorder) {
    case 'thin':   return 'ring-1 ring-white/30'
    case 'thick':  return 'ring-2 ring-white/40'
    case 'dashed': return 'lc-border-dashed'
    case 'none':
    default:       return ''
  }
})

// Intensidad de los glows accent. Modulamos el blur y opacity-multiplier.
const glowMultiplier = computed(() => {
  switch (props.config.glowIntensity) {
    case 'off':    return 0
    case 'low':    return 0.5
    case 'high':   return 1.6
    case 'medium':
    default:       return 1
  }
})

// Stamp size + density se traducen a Tailwind classes inline.
const stampSizeClass = computed(() => props.config.stampSize === 'xl'
  ? 'w-8 h-8 text-[10px]'
  : 'w-6 h-6 text-[9px]')
const stampGapClass = computed(() => {
  switch (props.config.stampDensity) {
    case 'compact': return 'gap-1'
    case 'loose':   return 'gap-2.5'
    case 'normal':
    default:        return 'gap-1.5'
  }
})

// Próxima recompensa según `progress` actual. Si no hay (todas conseguidas),
// devuelve null y el banner se oculta.
const nextReward = computed(() => {
  if (!props.config.showNextReward) return null
  const upcoming = props.config.rewards
    .filter(r => r.visitNumber > props.progress)
    .sort((a, b) => a.visitNumber - b.visitNumber)[0]
  return upcoming ?? null
})

// ─── Variantes por template ──────────────────────────────────────────────
// Cada template define background + text color + accent treatment. Los
// helpers se basan en `cardColor` y `cardAccent` del config para que el
// dueño pueda seguir personalizando el matiz dentro de cada plantilla.
const templateClasses = computed(() => {
  switch (props.config.cardTemplate) {
    case 'gradient':
      return { surface: 'lc-tpl-gradient', text: 'text-white' }
    case 'glass':
      return { surface: 'lc-tpl-glass', text: 'text-white' }
    case 'mono':
      return { surface: 'lc-tpl-mono', text: 'text-black' }
    case 'vintage':
      return { surface: 'lc-tpl-vintage', text: 'text-[#3a2a1a]' }
    case 'metal':
      return { surface: 'lc-tpl-metal', text: 'text-white' }
    case 'neon':
      return { surface: 'lc-tpl-neon', text: 'text-white' }
    case 'classic':
    default:
      return { surface: 'lc-tpl-classic', text: 'text-white' }
  }
})

// Direction-aware gradient. Solo aplica a templates donde el surface es un
// gradient/conic (gradient/metal/neon). Para classic/glass/mono/vintage el
// surface es fijo y este field se ignora.
function dir(prefix: string, stops: string) {
  // 'radial' usa radial-gradient en lugar de linear/conic.
  const d = props.config.gradientDirection
  if (prefix === 'conic') return `conic-gradient(from ${d === 'radial' ? '220deg' : d} at 50% 50%, ${stops})`
  if (d === 'radial')     return `radial-gradient(circle at 30% 30%, ${stops})`
  return `linear-gradient(${d}, ${stops})`
}

// Background inline. Cada template tiene un tratamiento distinto para que se
// vea premium — no un flat color. La paleta (cardColor + cardAccent) la define
// el template al seleccionarse (ver `cardTemplates` en FidelizacionPanel), así
// que aquí podemos confiar en que c/a combinan bien.
const surfaceStyle = computed(() => {
  const c = props.config.cardColor
  const a = props.config.cardAccent
  switch (props.config.cardTemplate) {
    case 'gradient':
      // Degradado rico de 3 paradas: color → mezcla → acento, con un glow
      // radial extra arriba-izquierda para profundidad.
      return {
        background: `radial-gradient(130% 110% at 15% 10%, ${a}55 0%, transparent 45%), ${dir('linear', `${c} 0%, ${c}cc 45%, ${a}dd 100%`)}`,
      }
    case 'glass':
      // Cristal ahumado de verdad: highlight claro arriba + tinte del color a
      // media opacidad + tinte del acento abajo. El blur lo da el CSS. Texto
      // blanco se mantiene legible por el tinte oscuro central.
      return {
        background: `linear-gradient(150deg, rgba(255,255,255,0.18) 0%, ${c}66 38%, ${c}99 70%, ${a}44 100%)`,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }
    case 'mono':
      // Blanco editorial cálido con un sutilísimo degradado.
      return { background: 'linear-gradient(160deg, #ffffff 0%, #f2f2f0 100%)', color: '#0a0a0a' }
    case 'vintage':
      // Papel envejecido con grano cálido.
      return { background: 'linear-gradient(165deg, #faf3e3 0%, #f0e2c6 55%, #e6d4ad 100%)' }
    case 'metal':
      // Conic metálico de 6 paradas para brillo holográfico más realista.
      return { background: dir('conic', `${c}, ${a}, #ffffff66, ${c}, ${a}, ${c}`) }
    case 'neon':
      // Fondo casi negro con dos glows de acento (esquinas opuestas) que dan
      // el efecto fluor sin lavar el contraste.
      return {
        background: `radial-gradient(120% 90% at 100% 0%, ${a}40 0%, transparent 45%), radial-gradient(100% 80% at 0% 100%, ${a}26 0%, transparent 50%), ${dir('linear', `#070707 0%, ${c} 100%`)}`,
      }
    case 'classic':
    default:
      // Charcoal con degradado vertical suave + glow de acento arriba-derecha.
      return {
        background: `radial-gradient(120% 100% at 100% 0%, ${a}22 0%, transparent 40%), ${dir('linear', `${c} 0%, ${c}f0 55%, ${c}d8 100%`)}`,
      }
  }
})

// ─── Pattern overlay (textura sobre el surface) ──────────────────────────
const patternStyle = computed(() => {
  switch (props.config.cardPattern) {
    case 'dots':
      return { backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '14px 14px', opacity: 0.06 }
    case 'grid':
      return { backgroundImage: 'linear-gradient(white 0.5px, transparent 0.5px), linear-gradient(90deg, white 0.5px, transparent 0.5px)', backgroundSize: '18px 18px', opacity: 0.06 }
    case 'mesh':
      return { backgroundImage: 'radial-gradient(at 20% 30%, rgba(255,255,255,0.18) 0px, transparent 50%), radial-gradient(at 80% 70%, rgba(255,255,255,0.12) 0px, transparent 50%)', opacity: 1 }
    case 'waves':
      return { backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 12px)', opacity: 1 }
    case 'noise':
      // Inline SVG turbulence (tiny, ~ 200 bytes) — patrón de ruido sin
      // depender de un asset externo.
      return { backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"160\\" height=\\"160\\"><filter id=\\"n\\"><feTurbulence type=\\"fractalNoise\\" baseFrequency=\\"0.85\\" numOctaves=\\"2\\"/><feColorMatrix values=\\"0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.15 0\\"/></filter><rect width=\\"100%\\" height=\\"100%\\" filter=\\"url(%23n)\\"/></svg>")', opacity: 0.7 }
    case 'none':
    default:
      return { display: 'none' as const }
  }
})

// ─── Shape (border-radius + ticket notches via clip-path) ────────────────
const shapeClass = computed(() => {
  switch (props.config.cardShape) {
    case 'sharp': return 'rounded-none'
    case 'ticket': return 'rounded-[22px] lc-ticket'
    case 'passbook': return 'rounded-[14px]'
    case 'rounded':
    default: return 'rounded-[22px]'
  }
})

// ─── Typography (font-family inline para no depender de Tailwind config) ─
const typoFamily = computed(() => {
  switch (props.config.cardTypography) {
    case 'serif':   return "'Playfair Display', 'Times New Roman', serif"
    case 'display': return "'Anton', 'Bebas Neue', Impact, sans-serif"
    case 'mono':    return "'JetBrains Mono', 'Courier New', monospace"
    case 'sans':
    default:        return "Urbanist, system-ui, sans-serif"
  }
})

// ─── Logo position (absolute corners) ────────────────────────────────────
const logoBlockClass = computed(() => {
  switch (props.config.logoPosition) {
    case 'top-center': return 'justify-center'
    case 'top-right':  return 'justify-end flex-row-reverse'
    case 'top-left':
    default: return 'justify-start'
  }
})

// ─── Stamp rendering ─────────────────────────────────────────────────────
function stampIcon(idx: number): string {
  switch (props.config.stampStyle) {
    case 'icons':   return 'mdi-check'
    case 'hearts':  return 'mdi-heart'
    case 'stars':   return 'mdi-star'
    case 'coffee':  return 'mdi-coffee'
    case 'numbers':
    default:        return '' // numbers se renderiza como texto, no icono
  }
}

const cardTitle = computed(() =>
  props.config.cardName || props.storeName || 'Tu restaurante'
)

const stampedCount = computed(() => Math.min(props.progress, props.config.totalVisits))
</script>

<template>
  <div
    class="lc-card relative overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.4),0_8px_20px_-8px_rgba(0,0,0,0.25)] ring-1 ring-black/5 transition-all hover:-translate-y-0.5 hover:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.45)] w-full max-w-[420px] mx-auto aspect-[1.72/1]"
    :class="[templateClasses.surface, templateClasses.text, shapeClass, borderClass, { 'lc-shine': config.cardShine }]"
    :style="{ ...surfaceStyle, fontFamily: typoFamily, '--lc-accent': config.cardAccent + '80' }">

    <!-- Pattern overlay -->
    <div class="absolute inset-0 pointer-events-none" :style="patternStyle"></div>

    <!-- Sheen for some templates (gradient / metal) -->
    <div class="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none"></div>

    <!-- Accent glows — opacity multiplicada por glowIntensity. Off = no glow.
         high = 1.6x; medium = 1; low = 0.5 (ver `glowMultiplier`). -->
    <template v-if="glowMultiplier > 0">
      <div class="absolute -top-16 -right-16 rounded-full blur-xl pointer-events-none transition-all"
        :style="{
          backgroundColor: config.cardAccent + Math.round(0x30 * glowMultiplier).toString(16).padStart(2, '0'),
          width: (160 * glowMultiplier) + 'px',
          height: (160 * glowMultiplier) + 'px',
        }"></div>
      <div class="absolute -bottom-10 -left-10 rounded-full blur-lg pointer-events-none transition-all"
        :style="{
          backgroundColor: config.cardAccent + Math.round(0x15 * glowMultiplier).toString(16).padStart(2, '0'),
          width: (112 * glowMultiplier) + 'px',
          height: (112 * glowMultiplier) + 'px',
        }"></div>
    </template>

    <!-- Watermark text de fondo (luxury) — texto grande tras los blobs, antes
         del contenido. Solo si el dueño puso algo en config.watermarkText. -->
    <div v-if="config.watermarkText"
      class="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
      <p class="font-black opacity-[0.06] uppercase tracking-[0.2em] text-center px-4 leading-none"
        :style="{ fontSize: 'clamp(28px, 12vw, 92px)' }">{{ config.watermarkText }}</p>
    </div>

    <div class="relative z-10 p-5 h-full flex flex-col justify-between">
      <!-- HEAD: logo + title + accent badge -->
      <div class="flex items-start gap-3" :class="logoBlockClass">
        <div class="flex items-center gap-2.5 min-w-0">
          <!-- Logo: si el dueño subió uno, lo usamos; si no, cae al placeholder -->
          <div v-if="config.cardLogoUrl"
            class="w-11 h-11 rounded-xl overflow-hidden bg-white/15 ring-1 ring-white/25 backdrop-blur-sm shrink-0">
            <img :src="config.cardLogoUrl" alt="" class="w-full h-full object-cover" />
          </div>
          <div class="min-w-0" :class="config.logoPosition === 'top-center' ? 'text-center' : ''">
            <p class="text-[9px] font-bold uppercase tracking-[0.22em] opacity-60">{{ config.headerSubtitle || 'Tarjeta fidelización' }}</p>
            <p class="font-black text-[17px] tracking-tight mt-1 truncate">{{ cardTitle }}</p>
          </div>
        </div>
        <!-- Accent badge con icono configurable (oculto en center para no romper layout) -->
        <div v-if="config.logoPosition !== 'top-center'"
          class="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-sm ring-1 ring-white/20 shrink-0"
          :style="{ backgroundColor: config.cardAccent + '35' }">
          <span class="mdi text-base" :class="badgeIconClass" :style="{ color: config.cardAccent }"></span>
        </div>
      </div>

      <!-- STAMPS -->
      <div>
        <div class="flex flex-wrap mb-3" :class="stampGapClass">
          <div v-for="v in config.totalVisits" :key="v"
            class="rounded-full flex items-center justify-center font-bold border transition-all duration-300"
            :class="[
              stampSizeClass,
              v <= stampedCount ? 'border-transparent shadow-[0_2px_6px_rgba(0,0,0,0.15)] text-white' : 'border-current/15 opacity-35',
              config.animateLastStamp && v === stampedCount ? 'lc-stamp-pulse' : '',
            ]"
            :style="v <= stampedCount ? { backgroundColor: config.cardAccent } : {}">
            <!-- Numbers style -->
            <template v-if="config.stampStyle === 'numbers'">
              <span v-if="v <= stampedCount" class="mdi mdi-check" :style="{ fontSize: config.stampSize === 'xl' ? '14px' : '10px' }"></span>
              <span v-else>{{ v }}</span>
            </template>
            <!-- Icon-style -->
            <template v-else>
              <span class="mdi" :class="[stampIcon(v), v <= stampedCount ? 'text-white' : '']"
                :style="{ fontSize: config.stampSize === 'xl' ? '16px' : '12px' }"></span>
            </template>
          </div>
        </div>

        <!-- Next reward preview (Pro feature). Si está activo y queda una
             recompensa por venir, mostramos un mini-banner con icono + label. -->
        <div v-if="nextReward" class="flex items-center gap-1.5 mb-2 px-2 py-1 rounded-md backdrop-blur-sm w-fit"
          :style="{ backgroundColor: config.cardAccent + '20' }">
          <span class="mdi" :class="nextReward.icon || 'mdi-gift-outline'" :style="{ color: config.cardAccent, fontSize: '12px' }"></span>
          <p class="text-[9px] font-bold opacity-90">{{ nextReward.rewardLabel }} · v{{ nextReward.visitNumber }}</p>
        </div>

        <div class="flex items-center justify-between">
          <p v-if="config.showCounter" class="text-[10px] font-medium opacity-55">{{ stampedCount }} / {{ config.totalVisits }} visitas</p>
          <span v-else></span>
          <p class="text-[9px] font-semibold uppercase tracking-[0.15em] opacity-35">Demo</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ticket shape — muescas semicirculares en los laterales, mid-height.
   Usamos masks compuestas (un rect grande - dos círculos) para que el
   contenido siga clipeado sin SVG inline. */
.lc-ticket {
  -webkit-mask:
    radial-gradient(circle 10px at 0 50%, transparent 99%, #000 100%) -10px 0,
    radial-gradient(circle 10px at 100% 50%, transparent 99%, #000 100%) 10px 0;
  -webkit-mask-composite: source-over;
          mask:
    radial-gradient(circle 10px at 0 50%, transparent 99%, #000 100%) -10px 0,
    radial-gradient(circle 10px at 100% 50%, transparent 99%, #000 100%) 10px 0;
}

/* Animated shimmer for metal/holographic template (and `cardShine` toggle).
   Se aplica como overlay traslúcido animado — no afecta el contenido. */
.lc-shine::after,
.lc-tpl-metal::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%);
  background-size: 200% 100%;
  animation: lc-shine-anim 4s linear infinite;
  mix-blend-mode: overlay;
}
@keyframes lc-shine-anim {
  0%   { background-position: 200% 0; }
  100% { background-position: -100% 0; }
}

/* Glass template: frosted con doble capa + highlight superior + reflejo
   diagonal sutil que da sensación de cristal real. */
.lc-tpl-glass {
  border: 1px solid rgba(255,255,255,0.25);
  box-shadow:
    inset 0 1px 1px rgba(255,255,255,0.4),
    inset 0 -20px 40px -20px rgba(0,0,0,0.3),
    0 20px 50px -12px rgba(0,0,0,0.35);
}
.lc-tpl-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.22) 0%, transparent 35%),
    linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%);
  pointer-events: none;
}

/* Mono template: borde nítido negro + línea de acento inferior editorial. */
.lc-tpl-mono {
  border: 1.5px solid #0a0a0a;
}
.lc-tpl-mono::after {
  content: '';
  position: absolute;
  left: 20px; right: 20px; bottom: 14px;
  height: 2px;
  background: #0a0a0a;
  opacity: 0.85;
  pointer-events: none;
}

/* Vintage: doble borde inset estilo papel + esquinas con marco fino. */
.lc-tpl-vintage {
  box-shadow:
    inset 0 0 0 2px rgba(120,80,40,0.18),
    inset 0 0 0 5px rgba(247,238,219,0.6),
    0 12px 30px -10px rgba(120,80,40,0.3);
}
.lc-tpl-vintage::before {
  content: '';
  position: absolute;
  inset: 8px;
  border: 1px solid rgba(120,80,40,0.25);
  border-radius: inherit;
  pointer-events: none;
}

/* Neon: glow exterior accent + grid sutil + borde brillante. */
.lc-tpl-neon {
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.08),
    0 0 24px rgba(255,255,255,0.06),
    0 0 60px -10px var(--lc-accent, rgba(249,115,22,0.5)),
    0 20px 50px -12px rgba(0,0,0,0.7);
}
.lc-tpl-neon::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 22px 22px;
  pointer-events: none;
}

/* Gradient: sheen diagonal animado lento que recorre la superficie. */
.lc-tpl-gradient::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.15) 50%, transparent 65%);
  background-size: 250% 100%;
  animation: lc-sheen 6s ease-in-out infinite;
  pointer-events: none;
}
@keyframes lc-sheen {
  0%, 100% { background-position: 180% 0; }
  50%      { background-position: -80% 0; }
}

/* Border dashed estilo cupón. Usa outline para no afectar la shape mask. */
.lc-border-dashed {
  outline: 2px dashed rgba(255,255,255,0.4);
  outline-offset: -6px;
}

/* Pulso del último stamp marcado — escala suave + brillo. Solo se aplica si
   config.animateLastStamp es true. */
.lc-stamp-pulse {
  animation: lc-stamp-pulse-anim 1.6s ease-in-out infinite;
}
@keyframes lc-stamp-pulse-anim {
  0%, 100% { transform: scale(1);    box-shadow: 0 2px 6px rgba(0,0,0,0.15); }
  50%      { transform: scale(1.15); box-shadow: 0 0 0 4px currentColor, 0 4px 10px rgba(0,0,0,0.2); }
}
</style>
