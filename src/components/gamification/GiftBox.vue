<script setup lang="ts">
const emit = defineEmits<{ revealed: [] }>()

const isOpened = ref(false)
const isRevealed = ref(false)
const confettiPieces = ref<Array<{ id: number; color: string; x: number; y: number; rotation: number; delay: number }>>([])

const CONFETTI_COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6']

const open = () => {
  if (isOpened.value) return
  isOpened.value = true

  // Generate confetti
  confettiPieces.value = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    x: (Math.random() - 0.5) * 200,
    y: -(80 + Math.random() * 120),
    rotation: Math.random() * 720 - 360,
    delay: Math.random() * 0.3,
  }))

  setTimeout(() => {
    isRevealed.value = true
    emit('revealed')
  }, 1800)
}
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <p v-if="!isOpened" class="text-sm text-gray-600 dark:text-gray-300 font-medium">Tap the gift to open!</p>

    <div class="relative cursor-pointer" @click="open" :class="{ 'pointer-events-none': isOpened }">
      <!-- Confetti -->
      <div
        v-for="piece in confettiPieces"
        :key="piece.id"
        class="absolute w-2 h-2 rounded-sm left-1/2 top-1/2 z-20"
        :style="{
          backgroundColor: piece.color,
          transform: isOpened
            ? `translate(${piece.x}px, ${piece.y}px) rotate(${piece.rotation}deg) scale(0)`
            : 'translate(0, 0) rotate(0deg) scale(0)',
          transition: `transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${piece.delay}s, opacity 1.2s ease ${piece.delay}s`,
          opacity: isOpened ? 0 : 1,
        }"
      ></div>

      <!-- Gift box assembly -->
      <div class="relative w-[120px]">
        <!-- Lid -->
        <div
          class="relative z-10 w-[120px] h-[30px] bg-gradient-to-b from-red-500 to-red-600 rounded-t-lg shadow-md transition-all duration-700 ease-out"
          :style="{
            transform: isOpened ? 'translateY(-60px) rotate(-15deg) scale(0.8)' : 'translateY(0)',
            opacity: isOpened ? 0 : 1,
          }"
        >
          <!-- Ribbon horizontal -->
          <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 h-3 bg-yellow-400"></div>
          <!-- Ribbon vertical -->
          <div class="absolute inset-y-0 left-1/2 -translate-x-1/2 w-3 bg-yellow-400"></div>
        </div>

        <!-- Bow -->
        <div
          class="absolute -top-4 left-1/2 -translate-x-1/2 z-20 flex transition-all duration-700 ease-out"
          :style="{
            transform: isOpened ? 'translate(-50%, -60px) rotate(-15deg) scale(0.8)' : 'translate(-50%, 0)',
            opacity: isOpened ? 0 : 1,
          }"
        >
          <div class="w-5 h-5 rounded-full border-[3px] border-yellow-400 bg-transparent -mr-1"></div>
          <div class="w-5 h-5 rounded-full border-[3px] border-yellow-400 bg-transparent -ml-1"></div>
        </div>

        <!-- Box body -->
        <div class="w-[100px] h-[80px] mx-auto bg-gradient-to-b from-red-600 to-red-700 rounded-b-lg shadow-lg relative overflow-hidden">
          <!-- Ribbon vertical -->
          <div class="absolute inset-y-0 left-1/2 -translate-x-1/2 w-3 bg-yellow-400"></div>
          <!-- Reward inside -->
          <div
            class="absolute inset-0 flex items-center justify-center transition-all duration-500"
            :style="{ opacity: isOpened ? 1 : 0, transform: isOpened ? 'scale(1)' : 'scale(0.5)' }"
          >
            <span class="text-4xl">🎁</span>
          </div>
        </div>
      </div>

      <!-- Glow on open -->
      <div
        v-if="isOpened"
        class="absolute -inset-4 rounded-2xl bg-yellow-400/15 animate-pulse -z-10"
      ></div>
    </div>

    <button v-if="!isOpened" @click="open" class="text-sm text-gray-400 underline">Tap to reveal</button>
  </div>
</template>
