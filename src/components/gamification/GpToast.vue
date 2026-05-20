<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useGamification } from '~/composables/useGamification'

const { pendingToast, consumeToast, currentRank } = useGamification()

const visible = ref(false)
const currentToast = ref<{ points: number; description: string } | null>(null)
const animateClass = ref('')

watch(pendingToast, (val) => {
  if (val) showToast()
}, { immediate: true })

const showToast = () => {
  const toast = consumeToast()
  if (!toast) return

  currentToast.value = toast
  visible.value = true
  animateClass.value = 'animate-slide-in'

  setTimeout(() => {
    animateClass.value = 'animate-slide-out'
    setTimeout(() => {
      visible.value = false
      currentToast.value = null
      animateClass.value = ''
    }, 400)
  }, 3000)
}
</script>

<template>
  <Teleport to="body">
    <Transition>
      <div v-if="visible && currentToast"
        class="fixed top-6 right-6 z-[9999] pointer-events-none"
        :class="animateClass">
        <div class="pointer-events-auto flex items-center gap-3 text-white pl-4 pr-5 py-3.5 rounded-2xl shadow-2xl min-w-[280px]"
          style="background: linear-gradient(135deg, #0f172a, #1e293b); box-shadow: 0 20px 60px rgba(15, 23, 42, 0.5);">
          <!-- Rank icon with glow -->
          <div class="w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-lg"
            :class="currentRank.gradient">
            <span class="mdi text-white text-xl drop-shadow" :class="currentRank.icon"></span>
          </div>
          <!-- Content -->
          <div class="flex-1">
            <p class="text-[10px] text-white/40 font-bold leading-none mb-1.5 uppercase tracking-wider">{{ currentToast.description }}</p>
            <p class="text-[22px] font-black tracking-tight leading-none">
              +{{ currentToast.points }} <span class="text-[14px] font-bold" :style="{ color: currentRank.color }">GP</span>
            </p>
          </div>
          <!-- Sparkle effect -->
          <span class="mdi mdi-star-four-points text-[20px] animate-pulse" :style="{ color: currentRank.color }"></span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.animate-slide-in {
  animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.animate-slide-out {
  animation: slideOut 0.4s cubic-bezier(0.7, 0, 0.84, 0) forwards;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100px) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes slideOut {
  from {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(100px) scale(0.8);
  }
}
</style>
