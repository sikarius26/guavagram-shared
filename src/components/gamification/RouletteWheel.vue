<script setup lang="ts">
const emit = defineEmits<{ revealed: [] }>()

const wheelRef = ref<HTMLDivElement>()
const isSpinning = ref(false)
const isRevealed = ref(false)

const SEGMENTS = 8
const SEGMENT_DEG = 360 / SEGMENTS
const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']
const LABELS = ['🎁', '⭐', '🎉', '💰', '🎊', '✨', '🏆', '🎀']

const conicGradient = computed(() => {
  return COLORS.map((c, i) =>
    `${c} ${i * SEGMENT_DEG}deg ${(i + 1) * SEGMENT_DEG}deg`
  ).join(', ')
})

const rotation = ref(0)

onMounted(() => {
  setTimeout(spin, 500)
})

const spin = () => {
  if (isSpinning.value) return
  isSpinning.value = true

  // Land on winning segment (index 0) — spin 5-7 full rotations + offset
  const fullRotations = (5 + Math.random() * 2) * 360
  const winOffset = SEGMENT_DEG / 2 // center of winning segment
  rotation.value = fullRotations + (360 - winOffset)
}

const onTransitionEnd = () => {
  if (!isSpinning.value) return
  isRevealed.value = true
  setTimeout(() => emit('revealed'), 800)
}

const reveal = () => {
  if (isRevealed.value) return
  isRevealed.value = true
  emit('revealed')
}
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <div class="relative">
      <!-- Pointer -->
      <div class="absolute -top-3 left-1/2 -translate-x-1/2 z-10 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-gray-800 drop-shadow-md"></div>

      <!-- Wheel -->
      <div
        ref="wheelRef"
        class="w-[260px] h-[260px] rounded-full shadow-xl border-4 border-gray-800 relative"
        :style="{
          background: `conic-gradient(${conicGradient})`,
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.08, 0.98)' : 'none',
        }"
        @transitionend="onTransitionEnd"
      >
        <!-- Segment labels -->
        <div
          v-for="(label, i) in LABELS"
          :key="i"
          class="absolute text-xl"
          :style="{
            top: '50%',
            left: '50%',
            transform: `rotate(${i * SEGMENT_DEG + SEGMENT_DEG / 2}deg) translateY(-90px) rotate(-${i * SEGMENT_DEG + SEGMENT_DEG / 2}deg)`,
            marginLeft: '-12px',
            marginTop: '-12px',
          }"
        >
          {{ label }}
        </div>
      </div>

      <!-- Center button -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg border-2 border-gray-300 flex items-center justify-center z-10">
        <span class="mdi mdi-star text-yellow-500 text-xl"></span>
      </div>
    </div>

    <p v-if="isSpinning && !isRevealed" class="text-sm text-gray-500 animate-pulse">Spinning...</p>
    <button v-if="!isSpinning" @click="spin" class="text-sm text-gray-400 underline">Tap to spin</button>
    <button v-if="isSpinning && !isRevealed" @click="reveal" class="text-sm text-gray-400 underline">Tap to reveal</button>
  </div>
</template>
