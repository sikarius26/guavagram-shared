<script setup lang="ts">
import { computed } from 'vue'
import type { NavItem } from '~/types/nav'

const props = withDefaults(defineProps<{
  items: readonly NavItem[]
  activeKey: string
  accentColor?: string
  onCreateClick?: () => void
  forceVisible?: boolean
  theme?: 'light' | 'dark'
}>(), {
  accentColor: '#ff2d23',
  onCreateClick: undefined,
  forceVisible: false,
  theme: 'light',
})

const isDark = computed(() => props.theme === 'dark')

const navClasses = computed(() =>
  isDark.value
    ? 'border-t border-white/5 text-white'
    : 'bg-white/80 dark:bg-white/5 backdrop-blur-xl border-t border-gray-100 dark:border-white/20'
)
const navStyle = computed(() =>
  isDark.value
    ? 'background: linear-gradient(180deg, #1f2937 0%, #111827 100%);'
    : ''
)
const inactiveClasses = computed(() =>
  isDark.value ? 'text-white/70' : 'text-gray-500 dark:text-white/60'
)

defineEmits<{
  (e: 'select', key: string): void
}>()

// Cuando hay FAB central, partimos los tabs por la mitad: izquierda + FAB + derecha.
// Asumimos `items.length === 4` (consumer y creator). Si no son 4, el FAB va al final.
const splitIndex = computed(() => {
  if (!props.onCreateClick) return null
  return Math.ceil(props.items.length / 2)
})
const leftItems = computed(() => splitIndex.value === null ? props.items : props.items.slice(0, splitIndex.value))
const rightItems = computed(() => splitIndex.value === null ? [] : props.items.slice(splitIndex.value))

// FAB usa el accentColor como tono base con un shade más claro para el gradiente.
// Para los dos colores actuales (#ff2d23 y #10b981) este mapping da resultados buenos;
// para colores arbitrarios cae en gradiente sólido (mismo tono).
const fabGradient = computed(() => {
  if (props.accentColor === '#10b981') return 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  if (props.accentColor === '#ff2d23') return 'linear-gradient(135deg, #ff2d23 0%, #ff6b4a 100%)'
  return `linear-gradient(135deg, ${props.accentColor} 0%, ${props.accentColor} 100%)`
})
</script>

<template>
  <nav
    class="fixed bottom-0 left-0 right-0 px-8 py-3 z-[500] safe-area-bottom"
    :class="[navClasses, forceVisible ? '' : 'lg:hidden']"
    :style="navStyle"
    aria-label="Navegación inferior"
  >
    <div class="max-w-lg mx-auto flex justify-between items-center">
      <template v-for="tab in leftItems" :key="tab.key">
        <NuxtLink
          v-if="tab.to"
          :to="tab.to"
          class="flex flex-col items-center gap-1 transition-colors flex-1"
          :class="activeKey === tab.key ? '' : inactiveClasses"
          :style="activeKey === tab.key ? `color: ${accentColor}` : ''"
          :aria-current="activeKey === tab.key ? 'page' : undefined"
        >
          <span
            class="mdi text-xl"
            :class="activeKey === tab.key && tab.activeIcon ? tab.activeIcon : tab.icon"
          ></span>
          <span class="text-[10px] font-extrabold">{{ tab.label }}</span>
        </NuxtLink>
        <button
          v-else
          type="button"
          class="flex flex-col items-center gap-1 transition-colors flex-1"
          :class="activeKey === tab.key ? '' : inactiveClasses"
          :style="activeKey === tab.key ? `color: ${accentColor}` : ''"
          :aria-current="activeKey === tab.key ? 'page' : undefined"
          @click="$emit('select', tab.key)"
        >
          <span
            class="mdi text-xl"
            :class="activeKey === tab.key && tab.activeIcon ? tab.activeIcon : tab.icon"
          ></span>
          <span class="text-[10px] font-extrabold">{{ tab.label }}</span>
        </button>
      </template>

      <button
        v-if="onCreateClick"
        type="button"
        aria-label="Crear"
        class="shrink-0 -mt-6 h-12 w-12 rounded-full flex items-center justify-center text-white transition-all active:scale-95 hover:-translate-y-0.5"
        :style="`background: ${fabGradient}; box-shadow: 0 8px 24px -4px rgba(0,0,0,0.25);`"
        @click="onCreateClick"
      >
        <span class="mdi mdi-plus text-2xl"></span>
      </button>

      <template v-for="tab in rightItems" :key="tab.key">
        <NuxtLink
          v-if="tab.to"
          :to="tab.to"
          class="flex flex-col items-center gap-1 transition-colors flex-1"
          :class="activeKey === tab.key ? '' : inactiveClasses"
          :style="activeKey === tab.key ? `color: ${accentColor}` : ''"
          :aria-current="activeKey === tab.key ? 'page' : undefined"
        >
          <span
            class="mdi text-xl"
            :class="activeKey === tab.key && tab.activeIcon ? tab.activeIcon : tab.icon"
          ></span>
          <span class="text-[10px] font-extrabold">{{ tab.label }}</span>
        </NuxtLink>
        <button
          v-else
          type="button"
          class="flex flex-col items-center gap-1 transition-colors flex-1"
          :class="activeKey === tab.key ? '' : inactiveClasses"
          :style="activeKey === tab.key ? `color: ${accentColor}` : ''"
          :aria-current="activeKey === tab.key ? 'page' : undefined"
          @click="$emit('select', tab.key)"
        >
          <span
            class="mdi text-xl"
            :class="activeKey === tab.key && tab.activeIcon ? tab.activeIcon : tab.icon"
          ></span>
          <span class="text-[10px] font-extrabold">{{ tab.label }}</span>
        </button>
      </template>
    </div>
  </nav>
</template>

<style scoped>
.safe-area-bottom {
  padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
}
</style>
