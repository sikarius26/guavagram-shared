import { ref } from 'vue'

export interface ConfettiParticle {
  id: number
  color: string
  x: number
  y: number
  rotation: number
  delay: number
  size: number
}

export interface MatchOverlayPayload {
  storeName: string
  storeSlug?: string
  storeLogoUrl?: string
  storeCoverUrl?: string
  code?: string
  message?: string
}

const COLORS = ['#ff2d23', '#ff6b4a', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6']

const confettiParticles = ref<ConfettiParticle[]>([])
const confettiActive = ref(false)
const matchPayload = ref<MatchOverlayPayload | null>(null)

let confettiTimer: ReturnType<typeof setTimeout> | null = null
let matchTimer: ReturnType<typeof setTimeout> | null = null

const fireConfetti = (count = 36, durationMs = 1800) => {
  if (typeof window === 'undefined') return
  if (confettiTimer) clearTimeout(confettiTimer)
  confettiActive.value = true
  confettiParticles.value = Array.from({ length: count }, (_, i) => ({
    id: Date.now() + i,
    color: COLORS[i % COLORS.length]!,
    x: (Math.random() - 0.5) * 360,
    y: -(80 + Math.random() * 220),
    rotation: Math.random() * 720 - 360,
    delay: Math.random() * 0.25,
    size: 5 + Math.random() * 6,
  }))
  confettiTimer = setTimeout(() => {
    confettiParticles.value = []
    confettiActive.value = false
  }, durationMs)
}

const showMatch = (payload: MatchOverlayPayload, autoCloseMs = 4200) => {
  if (typeof window === 'undefined') return
  if (matchTimer) clearTimeout(matchTimer)
  matchPayload.value = payload
  fireConfetti(48, 2200)
  if (autoCloseMs > 0) {
    matchTimer = setTimeout(() => { matchPayload.value = null }, autoCloseMs)
  }
}

const dismissMatch = () => {
  if (matchTimer) clearTimeout(matchTimer)
  matchPayload.value = null
}

export function useCelebrate() {
  return {
    confettiParticles,
    confettiActive,
    matchPayload,
    confetti: fireConfetti,
    match: showMatch,
    dismissMatch,
  }
}
