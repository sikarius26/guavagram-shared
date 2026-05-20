<script setup lang="ts">
const emit = defineEmits<{ revealed: [] }>()

const canvasRef = ref<HTMLCanvasElement>()
const isRevealed = ref(false)
const isDrawing = ref(false)
let ctx: CanvasRenderingContext2D | null = null
let totalPixels = 0
let clearedPixels = 0

const CANVAS_W = 300
const CANVAS_H = 200
const REVEAL_THRESHOLD = 0.45

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = CANVAS_W
  canvas.height = CANVAS_H
  totalPixels = CANVAS_W * CANVAS_H

  // Draw scratch overlay
  const grad = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H)
  grad.addColorStop(0, '#c0c0c0')
  grad.addColorStop(0.5, '#d8d8d8')
  grad.addColorStop(1, '#a8a8a8')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

  // Diagonal hatch pattern
  ctx.strokeStyle = 'rgba(0,0,0,0.06)'
  ctx.lineWidth = 1
  for (let i = -CANVAS_H; i < CANVAS_W + CANVAS_H; i += 8) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i + CANVAS_H, CANVAS_H)
    ctx.stroke()
  }

  // "Scratch here" text
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  ctx.font = 'bold 18px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('✦ Scratch here ✦', CANVAS_W / 2, CANVAS_H / 2)
})

const scratch = (x: number, y: number) => {
  if (!ctx || isRevealed.value) return
  ctx.globalCompositeOperation = 'destination-out'
  ctx.beginPath()
  ctx.arc(x, y, 22, 0, Math.PI * 2)
  ctx.fill()
  checkReveal()
}

const checkReveal = () => {
  if (!ctx || isRevealed.value) return
  const imageData = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H)
  let cleared = 0
  for (let i = 3; i < imageData.data.length; i += 4) {
    if (imageData.data[i] === 0) cleared++
  }
  clearedPixels = cleared
  if (clearedPixels / totalPixels >= REVEAL_THRESHOLD) {
    reveal()
  }
}

const reveal = () => {
  if (isRevealed.value) return
  isRevealed.value = true
  // Fade out remaining overlay
  if (ctx) {
    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillStyle = 'rgba(0,0,0,1)'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
  }
  setTimeout(() => emit('revealed'), 600)
}

const getPos = (e: PointerEvent) => {
  const canvas = canvasRef.value
  if (!canvas) return { x: 0, y: 0 }
  const rect = canvas.getBoundingClientRect()
  return {
    x: (e.clientX - rect.left) * (CANVAS_W / rect.width),
    y: (e.clientY - rect.top) * (CANVAS_H / rect.height)
  }
}

const onPointerDown = (e: PointerEvent) => {
  isDrawing.value = true
  const { x, y } = getPos(e)
  scratch(x, y)
}

const onPointerMove = (e: PointerEvent) => {
  if (!isDrawing.value) return
  const { x, y } = getPos(e)
  scratch(x, y)
}

const onPointerUp = () => {
  isDrawing.value = false
}
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <div class="relative w-full max-w-[300px] aspect-[3/2] rounded-xl overflow-hidden shadow-lg">
      <!-- Reward underneath -->
      <div class="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 flex flex-col items-center justify-center gap-2">
        <span class="mdi mdi-gift text-white text-5xl"></span>
        <span class="text-white font-bold text-lg">Your reward!</span>
      </div>
      <!-- Scratch canvas overlay -->
      <canvas
        ref="canvasRef"
        class="absolute inset-0 w-full h-full touch-none"
        :class="{ 'transition-opacity duration-500 opacity-0': isRevealed }"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointerleave="onPointerUp"
      />
    </div>
    <button v-if="!isRevealed" @click="reveal" class="text-sm text-gray-400 underline">
      Tap to reveal
    </button>
  </div>
</template>
