<script setup lang="ts">
import { computed } from 'vue'
import type { NavItem } from '~/types/nav'

const props = withDefaults(defineProps<{
  items: readonly NavItem[]
  activeKey: string
  accentColor?: string
  onCreateClick?: () => void
}>(), {
  accentColor: '#ff2d23',
  onCreateClick: undefined,
})

defineEmits<{
  (e: 'select', key: string): void
}>()

const fabGradient = computed(() => {
  if (props.accentColor === '#10b981') return 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  if (props.accentColor === '#ff2d23') return 'linear-gradient(135deg, #ff2d23 0%, #ff6b4a 100%)'
  return `linear-gradient(135deg, ${props.accentColor} 0%, ${props.accentColor} 100%)`
})
</script>

<template>
  <nav
    class="hidden lg:flex lg:flex-col items-center gap-2 w-[72px] shrink-0 py-4 text-white"
    style="background: linear-gradient(180deg, #1f2937 0%, #111827 100%);"
    aria-label="Navegación principal"
  >
    <slot name="top" />

    <button
      v-if="onCreateClick"
      type="button"
      aria-label="Crear"
      class="size-11 rounded-full flex items-center justify-center text-white transition-all active:scale-95 hover:-translate-y-0.5 mb-1"
      :style="`background: ${fabGradient}; box-shadow: 0 8px 24px -6px rgba(0,0,0,0.45);`"
      @click="onCreateClick"
    >
      <span class="mdi mdi-plus text-2xl"></span>
    </button>

    <template v-for="item in items" :key="item.key">
      <div
        v-if="activeKey === item.key"
        class="size-11 rounded-2xl bg-white flex items-center justify-center shadow-[0_4px_12px_-2px_rgba(0,0,0,0.25)]"
        :aria-label="`${item.label} (activa)`"
        aria-current="page"
      >
        <span
          class="mdi text-2xl"
          :class="item.activeIcon || item.icon"
          :style="`color: ${accentColor}`"
        ></span>
      </div>
      <NuxtLink
        v-else-if="item.to"
        :to="item.to"
        class="size-11 rounded-2xl bg-black/20 hover:bg-black/30 flex items-center justify-center transition-colors"
        :aria-label="item.label"
      >
        <span class="mdi text-2xl" :class="item.icon"></span>
      </NuxtLink>
      <button
        v-else
        type="button"
        class="size-11 rounded-2xl bg-black/20 hover:bg-black/30 flex items-center justify-center transition-colors"
        :aria-label="item.label"
        @click="$emit('select', item.key)"
      >
        <span class="mdi text-2xl" :class="item.icon"></span>
      </button>
    </template>

    <slot name="bottom" />
  </nav>
</template>
