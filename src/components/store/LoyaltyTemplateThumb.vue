<script setup lang="ts">
// Mini-thumbnail de un template de tarjeta de fidelización. Se usa en el grid
// de selección "Plantilla" del editor para que el dueño vea exactamente cómo
// se va a ver el look antes de aplicarlo — no un swatch genérico de color.
//
// Recibe el id del template + el color actual + acento, y dibuja una mini
// versión (160×93 aprox, ratio 1.72) con stamps reducidos y un fake header.

import { computed } from 'vue'
import type { LoyaltyCardTemplate } from '~/composables/useLoyaltyConfig'

const props = withDefaults(defineProps<{
  template: LoyaltyCardTemplate
  cardColor?: string
  cardAccent?: string
  selected?: boolean
  locked?: boolean
  label?: string
}>(), {
  cardColor: '#1a1c1b',
  cardAccent: '#f59e0b',
  selected: false,
  locked: false,
  label: '',
})

const surfaceStyle = computed(() => {
  const c = props.cardColor
  const a = props.cardAccent
  switch (props.template) {
    case 'gradient':
      return { background: `linear-gradient(135deg, ${c} 0%, ${c}d0 40%, ${a}c8 100%)`, color: 'white' }
    case 'glass':
      return { background: `linear-gradient(135deg, ${c}b0, ${c}80)`, color: 'white' }
    case 'mono':
      return { background: '#f4f4f4', color: '#0a0a0a' }
    case 'vintage':
      return { background: 'linear-gradient(180deg, #f7eedb, #ead9b8)', color: '#3a2a1a' }
    case 'metal':
      return { background: `conic-gradient(from 220deg at 50% 50%, ${c}, ${a}, ${c}, ${a}, ${c})`, color: 'white' }
    case 'neon':
      return { background: `radial-gradient(120% 80% at 0% 0%, ${a}30, transparent 50%), linear-gradient(135deg, #0a0a0a, ${c})`, color: 'white' }
    case 'classic':
    default:
      return { background: `linear-gradient(135deg, ${c}, ${c}e8 55%, ${c}c0)`, color: 'white' }
  }
})

const isAnimated = computed(() => props.template === 'metal')
</script>

<template>
  <button
    type="button"
    class="lt-thumb group relative aspect-[1.72/1] rounded-md overflow-hidden transition-all"
    :class="[
      selected
        ? 'ring-2 ring-[#f59e0b] ring-offset-1 ring-offset-white'
        : 'ring-1 ring-black/5 hover:ring-2 hover:ring-[#bbb] hover:-translate-y-0.5',
      isAnimated ? 'lt-shine' : '',
    ]"
    :style="surfaceStyle">
    <!-- Mini header: pseudo-logo + tiny title -->
    <div class="absolute inset-x-1 top-1 flex items-center gap-1">
      <div class="w-2.5 h-2.5 rounded-sm bg-white/25 backdrop-blur-sm shrink-0"></div>
      <div class="h-1.5 rounded-full bg-current opacity-40 flex-1 max-w-[60%]"></div>
      <div class="w-2 h-2 rounded-full shrink-0" :style="{ backgroundColor: cardAccent + 'aa' }"></div>
    </div>

    <!-- Mini stamps row -->
    <div class="absolute inset-x-1 bottom-1 flex items-center gap-0.5">
      <div v-for="n in 6" :key="n"
        class="w-1.5 h-1.5 rounded-full transition-colors"
        :style="n <= 2 ? { backgroundColor: cardAccent } : { backgroundColor: 'currentColor', opacity: 0.2 }"></div>
    </div>

    <!-- Locked overlay -->
    <span v-if="locked"
      class="absolute inset-0 bg-black/35 flex items-center justify-center backdrop-blur-[1px]">
      <span class="mdi mdi-lock text-white text-[14px]"></span>
    </span>

    <!-- Selected check -->
    <span v-else-if="selected"
      class="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#f59e0b] flex items-center justify-center shadow-sm">
      <span class="mdi mdi-check text-white text-[8px]"></span>
    </span>

    <!-- Label inferior (tooltip-style, fuera del recuadro porque ocuparía demasiado dentro) -->
  </button>
</template>

<style scoped>
/* Shimmer animado para template metal (mismo patrón que en LoyaltyCardPreview). */
.lt-shine::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%);
  background-size: 200% 100%;
  animation: lt-shine-anim 4s linear infinite;
  mix-blend-mode: overlay;
}
@keyframes lt-shine-anim {
  0%   { background-position: 200% 0; }
  100% { background-position: -100% 0; }
}
</style>
