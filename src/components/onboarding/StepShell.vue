<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  step: number
  totalSteps: number
  canGoBack: boolean
  canProceed: boolean
  nextLabel?: string
  isLoading?: boolean
}>()

const emit = defineEmits<{
  back: []
  next: []
}>()
</script>

<template>
  <div class="w-full max-w-[480px] mx-auto bg-white dark:bg-[#2a2a2a] rounded-3xl shadow-soft border border-gray-100 dark:border-white/5 p-6 md:p-8">
    <div class="flex items-center gap-1.5 mb-6">
      <div v-for="i in totalSteps" :key="i"
        class="h-1.5 flex-1 rounded-full transition-colors"
        :class="i <= step ? 'bg-gradient-emerald' : 'bg-gray-200 dark:bg-white/10'" />
    </div>

    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold text-text-main">{{ title }}</h2>
      <p v-if="subtitle" class="text-sm text-text-secondary mt-1.5">{{ subtitle }}</p>
    </div>

    <div class="flex flex-col gap-5">
      <slot />
    </div>

    <div class="flex items-center gap-3 mt-7">
      <button v-if="canGoBack" type="button" @click="emit('back')"
        aria-label="Atrás"
        class="h-12 w-12 shrink-0 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-white/80 hover:bg-gray-50 dark:hover:bg-white/10 flex items-center justify-center transition-all">
        <span class="mdi mdi-arrow-left text-xl"></span>
      </button>
      <button type="button" :disabled="!canProceed || isLoading" @click="emit('next')"
        class="flex-1 h-12 rounded-full bg-gradient-emerald hover:bg-gradient-emerald-hover text-white font-medium text-base flex items-center justify-center gap-2 shadow-pill-emerald disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all">
        <span v-if="isLoading" class="mdi mdi-loading animate-spin text-lg"></span>
        <template v-else>
          {{ nextLabel || $t?.('next') || 'Continue' }}
          <span class="mdi mdi-arrow-forward text-lg"></span>
        </template>
      </button>
    </div>
  </div>
</template>
