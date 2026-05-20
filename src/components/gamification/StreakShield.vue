<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useGamification } from '~/composables/useGamification'
import { gamificationApiClient } from '~/services/apis/api.client.gamification'
import type { StreakShieldViewModel } from '~/services/apis/models/streak-shield-view-model'
import gsap from 'gsap'

const { profile, loadProfile } = useGamification()

const shield = ref<StreakShieldViewModel | null>(null)
const isPurchasing = ref(false)
const showPurchaseSuccess = ref(false)
const shieldRef = ref<HTMLElement | null>(null)
const fireRef = ref<HTMLElement | null>(null)

const SHIELD_COST = 100

const streak = computed(() => profile.value?.currentStreak ?? 0)

const flameSize = computed(() => {
  if (streak.value >= 30) return 'text-[48px]'
  if (streak.value >= 14) return 'text-[40px]'
  if (streak.value >= 7) return 'text-[32px]'
  return 'text-[24px]'
})

const flameColor = computed(() => {
  if (streak.value >= 30) return 'text-red-500'
  if (streak.value >= 14) return 'text-orange-500'
  if (streak.value >= 7) return 'text-amber-500'
  return 'text-gray-400'
})

const flameGlow = computed(() => {
  if (streak.value >= 30) return 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.6)) drop-shadow(0 0 24px rgba(239, 68, 68, 0.3))'
  if (streak.value >= 14) return 'drop-shadow(0 0 10px rgba(249, 115, 22, 0.5)) drop-shadow(0 0 20px rgba(249, 115, 22, 0.2))'
  if (streak.value >= 7) return 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.4))'
  return 'none'
})

const flameBg = computed(() => {
  if (streak.value >= 30) return 'bg-red-500/10'
  if (streak.value >= 14) return 'bg-orange-500/10'
  if (streak.value >= 7) return 'bg-amber-500/10'
  return 'bg-gray-100'
})

const canAfford = computed(() => (profile.value?.availablePoints ?? 0) >= SHIELD_COST)

const shieldsOwned = computed(() => shield.value?.shieldsOwned ?? 0)
const shieldActive = computed(() => shield.value?.isActive ?? false)

const buyShield = async () => {
  if (isPurchasing.value || !canAfford.value) return
  isPurchasing.value = true

  try {
    const result = await gamificationApiClient.gamificationBuyStreakShield()
    shield.value = result
    await loadProfile()

    showPurchaseSuccess.value = true

    // Animate shield icon
    await nextTick()
    if (shieldRef.value) {
      gsap.fromTo(shieldRef.value, {
        scale: 0.5,
        rotation: -15,
        opacity: 0,
      }, {
        scale: 1,
        rotation: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'back.out(1.7)',
      })
    }

    setTimeout(() => { showPurchaseSuccess.value = false }, 2500)
  } catch (err) {
    console.warn('Failed to buy streak shield', err)
  } finally {
    isPurchasing.value = false
  }
}

onMounted(async () => {
  try {
    shield.value = await gamificationApiClient.gamificationStreakShield()
  } catch (err) {
    console.warn('Streak shield load failed', err)
  }

  // Animate fire on mount
  await nextTick()
  if (fireRef.value && streak.value > 0) {
    gsap.fromTo(fireRef.value, {
      scale: 0.6,
      y: 10,
    }, {
      scale: 1,
      y: 0,
      duration: 0.8,
      ease: 'elastic.out(1.2, 0.5)',
    })
  }
})
</script>

<template>
  <div class="bg-white rounded-2xl border border-[#e5e5e5] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300">

    <div class="flex items-center gap-4">
      <!-- Fire icon -->
      <div class="relative flex items-center justify-center w-16 h-16 rounded-2xl shrink-0" :class="flameBg">
        <span ref="fireRef" class="mdi mdi-fire" :class="[flameSize, flameColor]"
          :style="{ filter: flameGlow, transition: 'all 0.3s ease' }"></span>
        <!-- Streak number overlay -->
        <span v-if="streak > 0"
          class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border-2 flex items-center justify-center text-[10px] font-black shadow-sm"
          :class="streak >= 30 ? 'border-red-400 text-red-600' :
                  streak >= 14 ? 'border-orange-400 text-orange-600' :
                  streak >= 7 ? 'border-amber-400 text-amber-600' :
                  'border-gray-300 text-gray-500'">
          {{ streak }}
        </span>
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <h4 class="text-[14px] font-bold text-[#1a1c1b] tracking-tight">Racha de {{ streak }} días</h4>
          <span v-if="streak >= 7" class="text-[9px] font-black px-1.5 py-0.5 rounded-full"
            :class="streak >= 30 ? 'bg-red-100 text-red-600' :
                    streak >= 14 ? 'bg-orange-100 text-orange-600' :
                    'bg-amber-100 text-amber-600'">
            x{{ streak >= 30 ? '3' : streak >= 14 ? '2' : '1.5' }}
          </span>
        </div>
        <p class="text-[11px] text-[#888] leading-snug">Protege tu racha con un escudo</p>
      </div>

      <!-- Shield status & buy -->
      <div class="flex flex-col items-center gap-2 shrink-0">
        <!-- Shields owned -->
        <div class="flex items-center gap-1.5">
          <div ref="shieldRef" class="relative">
            <span class="mdi mdi-shield-check text-[22px]"
              :class="shieldsOwned > 0 || shieldActive ? 'text-[#1A3C34]' : 'text-[#ddd]'"></span>
            <span v-if="shieldsOwned > 0"
              class="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-[#1A3C34] text-white text-[8px] font-black flex items-center justify-center">
              {{ shieldsOwned }}
            </span>
          </div>
        </div>

        <!-- Buy button -->
        <button @click="buyShield" :disabled="isPurchasing || !canAfford"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
          :class="canAfford
            ? 'bg-[#1A3C34] text-white hover:bg-[#2a4a42] shadow-sm hover:shadow-md active:scale-95'
            : 'bg-[#f0f0f0] text-[#bbb] cursor-not-allowed'">
          <span v-if="isPurchasing" class="mdi mdi-loading animate-spin text-xs"></span>
          <template v-else>
            <span class="mdi mdi-shield-plus-outline text-xs"></span>
            <span>{{ SHIELD_COST }} GP</span>
          </template>
        </button>
      </div>
    </div>

    <!-- Active shield indicator -->
    <div v-if="shieldActive"
      class="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
      <span class="mdi mdi-shield-check text-emerald-600 text-sm"></span>
      <span class="text-[11px] font-bold text-emerald-700">Escudo activo</span>
      <span class="text-[10px] text-emerald-500 ml-auto">Tu racha está protegida</span>
    </div>

    <!-- Purchase success animation -->
    <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 scale-90" enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="showPurchaseSuccess"
        class="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1A3C34] text-white">
        <span class="mdi mdi-check-circle text-emerald-400 text-sm"></span>
        <span class="text-[11px] font-bold">Escudo comprado</span>
        <span class="text-[10px] text-white/60 ml-auto">-{{ SHIELD_COST }} GP</span>
      </div>
    </Transition>
  </div>
</template>
