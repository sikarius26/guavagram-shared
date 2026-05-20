<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  showLogo?: boolean
}>(), {
  title: '',
  showLogo: false,
})
</script>

<template>
  <header class="lg:hidden sticky top-0 z-40 flex items-center justify-between p-4 backdrop-blur-sm dark:backdrop-blur-xl bg-white/80 dark:bg-white/5 border-b border-black/5 dark:border-white/20">
    <div class="flex items-center shrink-0">
      <slot name="left" />
      <span v-if="!$slots.left" class="w-10 h-10"></span>
    </div>

    <div class="flex-1 min-w-0 flex items-center justify-center">
      <NuxtLink v-if="showLogo" to="/" class="flex items-center justify-center">
        <img src="/images/logo-guavagram-color.png" alt="Guavagram" class="h-8 w-auto" />
      </NuxtLink>
      <h1 v-else-if="title" class="text-base font-extrabold text-gray-900 dark:text-white truncate">{{ title }}</h1>
    </div>

    <div class="flex items-center shrink-0">
      <slot name="right" />
      <span v-if="!$slots.right" class="w-10 h-10"></span>
    </div>
  </header>
</template>
