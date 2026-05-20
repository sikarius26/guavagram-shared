<script setup lang="ts">
const emit = defineEmits<{ revealed: [] }>()

const picked = ref<number | null>(null)
const showOthers = ref(false)
const isRevealed = ref(false)

const pickCard = (index: number) => {
  if (picked.value !== null) return
  picked.value = index

  // Flip other cards after delay
  setTimeout(() => {
    showOthers.value = true
  }, 600)

  // Emit revealed after animations
  setTimeout(() => {
    isRevealed.value = true
    emit('revealed')
  }, 1600)
}

const reveal = () => {
  if (isRevealed.value) return
  pickCard(1) // pick middle card
}

const cardResults = ['😢', '🎁', '😢'] // middle card always wins
</script>

<template>
  <div class="flex flex-col items-center gap-6">
    <p class="text-sm text-gray-600 dark:text-gray-300 font-medium">Pick a card to reveal your reward!</p>

    <div class="flex gap-4">
      <div
        v-for="(result, i) in cardResults"
        :key="i"
        class="relative cursor-pointer"
        :class="{ 'pointer-events-none': picked !== null }"
        style="perspective: 600px;"
        @click="pickCard(i)"
      >
        <div
          class="w-[80px] h-[110px] transition-transform duration-500 relative"
          style="transform-style: preserve-3d;"
          :style="{
            transform: (picked === i || (showOthers && picked !== i)) ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }"
        >
          <!-- Front (face down) -->
          <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-lg flex items-center justify-center border-2 border-indigo-400 backface-hidden">
            <span class="text-white text-3xl font-bold">?</span>
          </div>

          <!-- Back (face up) -->
          <div
            class="absolute inset-0 rounded-xl shadow-lg flex items-center justify-center border-2 backface-hidden"
            :class="i === 1
              ? 'bg-gradient-to-br from-green-400 to-emerald-600 border-green-300'
              : 'bg-gradient-to-br from-gray-200 to-gray-300 border-gray-200'"
            style="transform: rotateY(180deg);"
          >
            <span class="text-3xl">{{ result }}</span>
          </div>
        </div>

        <!-- Glow on picked winner -->
        <div
          v-if="picked === i && i === 1"
          class="absolute -inset-2 rounded-2xl bg-green-400/20 animate-pulse -z-10"
        ></div>
      </div>
    </div>

    <button v-if="picked === null" @click="reveal" class="text-sm text-gray-400 underline">Tap to reveal</button>
  </div>
</template>

<style scoped>
.backface-hidden {
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}
</style>
