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

const COLORS = ['#059669', '#10b981', '#34d399', '#f59e0b', '#3b82f6', '#8b5cf6']

export function useMiniConfetti() {
  const particles = ref<ConfettiParticle[]>([])
  const isActive = ref(false)

  const burst = () => {
    if (isActive.value) return
    isActive.value = true

    particles.value = Array.from({ length: 14 }, (_, i) => ({
      id: i,
      color: COLORS[i % COLORS.length]!,
      x: (Math.random() - 0.5) * 180,
      y: -(50 + Math.random() * 120),
      rotation: Math.random() * 720 - 360,
      delay: Math.random() * 0.15,
      size: 4 + Math.random() * 4,
    }))

    setTimeout(() => {
      particles.value = []
      isActive.value = false
    }, 1200)
  }

  return { particles, isActive, burst }
}
