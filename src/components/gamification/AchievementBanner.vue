<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { useGamification, type AchievementBanner } from '~/composables/useGamification'
import { useCelebrate } from '~/composables/useCelebrate'

const { pendingBanner, consumeBanner } = useGamification()
const { confetti } = useCelebrate()

const visible = ref(false)
const current = ref<AchievementBanner | null>(null)
const phase = ref<'enter' | 'show' | 'exit'>('enter')
const particlesRef = ref<HTMLElement>()

watch(pendingBanner, (val) => {
  if (val && !visible.value) show()
})

const show = async () => {
  const banner = consumeBanner()
  if (!banner) return

  current.value = banner
  visible.value = true
  phase.value = 'enter'

  // Extra confetti burst for rank-up — bigger reward feel than normal actions
  if (banner.type === 'rank-up') confetti(64, 2400)
  else if (banner.type === 'badge' || banner.type === 'challenge') confetti()

  await nextTick()

  // Animate particles with GSAP
  try {
    const { gsap } = await import('gsap')
    // Icon entrance
    gsap.fromTo('.ab-icon', { scale: 0, rotation: -180 }, { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(2)', delay: 0.2 })
    // Title
    gsap.fromTo('.ab-title', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.4 })
    // Subtitle
    gsap.fromTo('.ab-subtitle', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.55 })
    // Points/rank
    gsap.fromTo('.ab-detail', { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)', delay: 0.7 })
    // Particles
    gsap.fromTo('.ab-particle', { scale: 0, opacity: 1 },
      { scale: 1, opacity: 0, duration: 1.5, ease: 'power2.out', delay: 0.3, stagger: { each: 0.05, from: 'random' } })
    // Rays
    gsap.fromTo('.ab-ray', { scaleY: 0, opacity: 0 },
      { scaleY: 1, opacity: 0.15, duration: 1, ease: 'power2.out', delay: 0.2, stagger: 0.04 })
  } catch { /* GSAP not available, still works without animation */ }

  phase.value = 'show'

  // Auto dismiss after 4 seconds
  setTimeout(() => dismiss(), 4000)
}

const dismiss = async () => {
  phase.value = 'exit'
  try {
    const { gsap } = await import('gsap')
    gsap.to('.ab-content', { y: -30, opacity: 0, duration: 0.3, ease: 'power2.in' })
  } catch {}
  setTimeout(() => {
    visible.value = false
    current.value = null
    // Check for next banner in queue
    if (pendingBanner.value) {
      setTimeout(() => show(), 300)
    }
  }, 350)
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-300"
      leave-to-class="opacity-0">
      <div v-if="visible && current"
        class="fixed inset-0 z-[10000] flex items-center justify-center cursor-pointer"
        @click="dismiss">

        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/75"></div>

        <!-- Content -->
        <div class="ab-content relative z-10 flex flex-col items-center text-center px-8 max-w-lg">

          <!-- Rays -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="relative w-[400px] h-[400px]">
              <div v-for="i in 16" :key="i"
                class="ab-ray absolute left-1/2 bottom-1/2 w-[2px] h-[200px] origin-bottom"
                :style="{
                  transform: `rotate(${i * 22.5}deg)`,
                  background: `linear-gradient(to top, ${current.color}00, ${current.color}40)`,
                }">
              </div>
            </div>
          </div>

          <!-- Particles -->
          <div ref="particlesRef" class="absolute inset-0 pointer-events-none overflow-hidden">
            <div v-for="i in 24" :key="i"
              class="ab-particle absolute w-2 h-2 rounded-full"
              :style="{
                backgroundColor: current.color,
                left: `${15 + Math.random() * 70}%`,
                top: `${15 + Math.random() * 70}%`,
                boxShadow: `0 0 8px ${current.color}`,
              }">
            </div>
          </div>

          <!-- Glow behind icon -->
          <div class="absolute w-40 h-40 rounded-full blur-[60px] opacity-40"
            :style="{ backgroundColor: current.color }"></div>

          <!-- Icon -->
          <div class="ab-icon relative mb-6">
            <div class="w-24 h-24 rounded-3xl bg-gradient-to-br flex items-center justify-center shadow-2xl ring-4 ring-white/20"
              :class="current.gradient"
              :style="{ boxShadow: `0 0 60px ${current.color}50` }">
              <span class="mdi text-white text-[44px] drop-shadow-lg" :class="current.icon"></span>
            </div>
          </div>

          <!-- Title -->
          <h2 class="ab-title text-white text-[28px] lg:text-[36px] font-black tracking-tight leading-none mb-3 drop-shadow-lg">
            {{ current.title }}
          </h2>

          <!-- Subtitle -->
          <p class="ab-subtitle text-white/60 text-[15px] lg:text-[17px] font-medium mb-6">
            {{ current.subtitle }}
          </p>

          <!-- Detail badge -->
          <div class="ab-detail">
            <!-- Rank up -->
            <div v-if="current.type === 'rank-up'" class="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
              <span class="mdi text-[24px]" :class="current.icon" :style="{ color: current.color }"></span>
              <span class="text-white text-[20px] font-black">{{ current.rankName }}</span>
            </div>

            <!-- Points -->
            <div v-else-if="current.type === 'points' && current.points" class="px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
              <span class="text-white text-[28px] font-black">+{{ current.points }}</span>
              <span class="text-[16px] font-bold ml-1" :style="{ color: current.color }">GP</span>
            </div>

            <!-- Badge -->
            <div v-else-if="current.type === 'badge'" class="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
              <span class="mdi text-[24px]" :class="current.icon" :style="{ color: current.color }"></span>
              <span class="text-white text-[16px] font-bold">{{ current.badgeName }}</span>
            </div>

            <!-- Challenge -->
            <div v-else-if="current.type === 'challenge' && current.points" class="px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
              <span class="text-white text-[24px] font-black">+{{ current.points }}</span>
              <span class="text-[14px] font-bold ml-1" :style="{ color: current.color }">GP</span>
            </div>
          </div>

          <!-- Tap to dismiss -->
          <p class="text-white/20 text-[11px] mt-8 uppercase tracking-[0.2em] font-bold">Toca para cerrar</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
