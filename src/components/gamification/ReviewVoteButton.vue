<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = defineProps<{
  reviewId: string
  initialCount: number
  initialHasVoted?: boolean
}>()

const hasVoted = ref(!!props.initialHasVoted)
const count = ref(props.initialCount)
const isAnimating = ref(false)
const isSubmitting = ref(false)

const displayCount = computed(() => {
  if (count.value >= 1000) return (count.value / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return count.value.toString()
})

onMounted(async () => {
  try {
    const res = await $fetch<Array<{ reviewId: string; helpfulCount: number; hasVoted: boolean }>>(
      '/api/stubs/reviews/votes',
      { method: 'POST', body: { reviewIds: [props.reviewId] } }
    )
    const entry = res?.[0]
    if (entry) {
      hasVoted.value = entry.hasVoted
      count.value = props.initialCount + entry.helpfulCount
    }
  } catch {
    // server stub unavailable, use seed
  }
})

async function toggleVote() {
  if (isSubmitting.value) return

  const prevVoted = hasVoted.value
  const prevCount = count.value
  hasVoted.value = !hasVoted.value
  count.value += hasVoted.value ? 1 : -1

  isAnimating.value = true
  setTimeout(() => { isAnimating.value = false }, 400)

  isSubmitting.value = true
  try {
    const res = await $fetch<{ reviewId: string; helpfulCount: number; hasVoted: boolean }>(
      '/api/stubs/reviews/vote',
      { method: 'POST', body: { reviewId: props.reviewId } }
    )
    if (res) {
      hasVoted.value = res.hasVoted
      count.value = props.initialCount + res.helpfulCount
    }
  } catch {
    hasVoted.value = prevVoted
    count.value = prevCount
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <button
    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 select-none"
    :class="hasVoted
      ? 'bg-[#1A3C34]/20 text-[#1A3C34] border border-[#1A3C34]/30 shadow-sm shadow-[#1A3C34]/10'
      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-gray-300'"
    @click="toggleVote"
  >
    <span
      class="mdi transition-all duration-300"
      :class="[
        hasVoted ? 'mdi-thumb-up text-[#1A3C34]' : 'mdi-thumb-up-outline',
        isAnimating ? 'scale-125' : 'scale-100'
      ]"
      style="display: inline-block"
    ></span>
    <span
      class="transition-all duration-300"
      :class="{ 'font-bold': hasVoted }"
    >
      Útil · {{ displayCount }}
    </span>
  </button>
</template>

<style scoped>
button:active {
  transform: scale(0.95);
}
.scale-125 {
  transform: scale(1.25);
}
.scale-100 {
  transform: scale(1);
}
</style>
