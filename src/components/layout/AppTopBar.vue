<script setup lang="ts">
import { useSidebarDrawer } from '~/composables/useSidebarDrawer'

withDefaults(defineProps<{
  title?: string
  showLogo?: boolean
  noMenu?: boolean
  alwaysVisible?: boolean
  variant?: 'light' | 'dark'
}>(), {
  title: '',
  showLogo: false,
  noMenu: false,
  alwaysVisible: false,
  variant: 'light',
})

const { toggle } = useSidebarDrawer()
</script>

<template>
  <header
    class="sticky top-0 z-40 h-14 flex items-center gap-3 px-3 backdrop-blur-xl border-b"
    :class="[
      alwaysVisible ? '' : 'lg:hidden',
      variant === 'dark'
        ? 'bg-gradient-to-b from-black/70 to-black/30 border-white/10 text-white'
        : 'bg-white/80 border-[#eee] text-[#1a1c1b]',
    ]"
  >
    <button
      v-if="!noMenu"
      type="button"
      aria-label="Abrir menú"
      @click="toggle"
      class="h-10 w-10 rounded-lg flex items-center justify-center hover:bg-black/5 active:scale-95 transition-all shrink-0"
      :class="variant === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/5'"
    >
      <span
        class="mdi mdi-menu text-[22px]"
        :class="variant === 'dark' ? 'text-white' : 'text-[#1a1c1b]'"
      ></span>
    </button>

    <div v-if="$slots.left" class="flex items-center shrink-0">
      <slot name="left" />
    </div>

    <div class="flex-1 min-w-0 flex items-center gap-2">
      <NuxtImg
        v-if="showLogo"
        :src="variant === 'dark' ? '/images/logo-guavagram-white.png' : '/images/logo-guavagram-color.png'"
        alt="Guavagram"
        width="110"
        class="h-auto shrink-0"
      />
      <p v-else-if="title" class="text-[14px] font-bold truncate">{{ title }}</p>
    </div>

    <div class="flex items-center gap-1 shrink-0">
      <slot name="right" />
    </div>
  </header>
</template>
