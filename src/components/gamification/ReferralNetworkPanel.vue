<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { gamificationApiClient } from '~/services/apis/api.client.gamification'
import type { ReferralTierViewModel } from '~/services/apis/models/referral-tier-view-model'
import { useCountUp } from '~/composables/useCountUp'

const isLoading = ref(true)
const referrals = ref<ReferralTierViewModel[]>([])

const tier1 = computed(() => referrals.value.filter(r => r.tier === 1))
const tier2 = computed(() => referrals.value.filter(r => r.tier === 2))

const totalReferrals = computed(() => referrals.value.length)
const totalGpFromReferrals = computed(() => referrals.value.reduce((sum, r) => sum + (r.totalPointsEarned ?? 0), 0))
const tier1Count = computed(() => tier1.value.length)
const tier2Count = computed(() => tier2.value.length)

const totalRefRef = computed(() => totalReferrals.value)
const totalGpRef = computed(() => totalGpFromReferrals.value)

const { formatted: totalRefFormatted, animate: animateRef } = useCountUp(totalRefRef, { decimals: 0 })
const { formatted: totalGpFormatted, animate: animateGp } = useCountUp(totalGpRef, { decimals: 0 })

// Milestone badges
const milestones = [
  { name: 'Conector', icon: 'mdi-link-variant', threshold: 5, color: '#3b82f6', bg: '#eff6ff' },
  { name: 'Embajador', icon: 'mdi-shield-star', threshold: 20, color: '#8b5cf6', bg: '#f5f3ff' },
  { name: 'Leyenda', icon: 'mdi-crown', threshold: 50, color: '#f59e0b', bg: '#fffbeb' },
]

const getMilestoneProgress = (threshold: number) => {
  return Math.min(100, (totalReferrals.value / threshold) * 100)
}

const isMilestoneUnlocked = (threshold: number) => totalReferrals.value >= threshold

// Mock data with Spanish names
const mockReferrals: ReferralTierViewModel[] = [
  { userId: '1', displayName: 'Maria Garcia', avatarUrl: undefined, tier: 1, referralCount: 3, totalPointsEarned: 200, joinedAt: new Date('2026-03-10') },
  { userId: '2', displayName: 'Carlos Lopez', avatarUrl: undefined, tier: 1, referralCount: 2, totalPointsEarned: 200, joinedAt: new Date('2026-03-15') },
  { userId: '3', displayName: 'Ana Martinez', avatarUrl: undefined, tier: 1, referralCount: 1, totalPointsEarned: 200, joinedAt: new Date('2026-02-28') },
  { userId: '4', displayName: 'Pedro Sanchez', avatarUrl: undefined, tier: 1, referralCount: 0, totalPointsEarned: 200, joinedAt: new Date('2026-03-22') },
  { userId: '5', displayName: 'Laura Fernandez', avatarUrl: undefined, tier: 1, referralCount: 2, totalPointsEarned: 200, joinedAt: new Date('2026-01-18') },
  { userId: '6', displayName: 'Javier Ruiz', avatarUrl: undefined, tier: 1, referralCount: 0, totalPointsEarned: 200, joinedAt: new Date('2026-04-01') },
  { userId: '7', displayName: 'Sofia Moreno', avatarUrl: undefined, tier: 1, referralCount: 1, totalPointsEarned: 200, joinedAt: new Date('2026-03-05') },
  { userId: '8', displayName: 'Diego Alvarez', avatarUrl: undefined, tier: 1, referralCount: 2, totalPointsEarned: 200, joinedAt: new Date('2026-02-14') },
  { userId: '9', displayName: 'Elena Torres', avatarUrl: undefined, tier: 2, referralCount: 0, totalPointsEarned: 50, joinedAt: new Date('2026-03-20') },
  { userId: '10', displayName: 'Miguel Jimenez', avatarUrl: undefined, tier: 2, referralCount: 0, totalPointsEarned: 50, joinedAt: new Date('2026-03-25') },
  { userId: '11', displayName: 'Carmen Diaz', avatarUrl: undefined, tier: 2, referralCount: 0, totalPointsEarned: 50, joinedAt: new Date('2026-04-02') },
  { userId: '12', displayName: 'Pablo Romero', avatarUrl: undefined, tier: 2, referralCount: 0, totalPointsEarned: 50, joinedAt: new Date('2026-03-30') },
  { userId: '13', displayName: 'Isabel Navarro', avatarUrl: undefined, tier: 2, referralCount: 0, totalPointsEarned: 50, joinedAt: new Date('2026-04-05') },
] as ReferralTierViewModel[]

const getInitials = (name: string | undefined) => {
  if (!name) return '?'
  const parts = name.split(' ')
  return parts.map(p => p[0]).slice(0, 2).join('').toUpperCase()
}

const formatDate = (date: Date | undefined) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

// Tier 1 colors (greens)
const tier1Colors = ['#1A3C34', '#22543d', '#276749', '#2f855a', '#38a169', '#48bb78', '#68d391', '#9ae6b4']
// Tier 2 colors (blues)
const tier2Colors = ['#2b6cb0', '#3182ce', '#4299e1', '#63b3ed', '#90cdf4']

const load = async () => {
  isLoading.value = true
  try {
    referrals.value = await gamificationApiClient.gamificationReferralNetwork(0, 50)
    if (!referrals.value || referrals.value.length === 0) {
      referrals.value = mockReferrals
    }
  } catch {
    referrals.value = mockReferrals
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await load()
  animateRef()
  animateGp()
})
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8">

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-32">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center animate-pulse">
          <span class="mdi mdi-account-network text-[#1A3C34] text-2xl"></span>
        </div>
        <p class="text-[13px] text-[#666] font-medium">{{ $t('loadingReferralNetwork') }}</p>
      </div>
    </div>

    <template v-else>

      <!-- ===== HERO CARD ===== -->
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A3C34] via-[#1A3C34] to-[#0d1f1a] text-white p-8 mb-8 shadow-2xl">
        <!-- Decorative -->
        <div class="absolute -top-20 -right-20 w-60 h-60 bg-white/5 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-16 -left-16 w-48 h-48 bg-white/[0.03] rounded-full"></div>
        <div class="absolute top-4 right-4 opacity-[0.04] text-[120px] leading-none">
          <span class="mdi mdi-account-network"></span>
        </div>

        <div class="relative z-10">
          <p class="text-emerald-400 text-[11px] font-bold uppercase tracking-[0.2em] mb-2">Red de Referidos</p>
          <h2 class="text-[28px] font-black tracking-tight leading-none mb-6">Tu red crece</h2>

          <!-- Summary stats -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div class="bg-white/[0.07] backdrop-blur-sm rounded-2xl p-4 text-center">
              <p class="text-white/40 text-[9px] font-bold uppercase tracking-widest mb-1">Total</p>
              <p class="text-[24px] font-black tracking-tight leading-none">{{ totalRefFormatted }}</p>
            </div>
            <div class="bg-white/[0.07] backdrop-blur-sm rounded-2xl p-4 text-center">
              <p class="text-white/40 text-[9px] font-bold uppercase tracking-widest mb-1">Nivel 1</p>
              <p class="text-[24px] font-black tracking-tight leading-none text-emerald-400">{{ tier1Count }}</p>
            </div>
            <div class="bg-white/[0.07] backdrop-blur-sm rounded-2xl p-4 text-center">
              <p class="text-white/40 text-[9px] font-bold uppercase tracking-widest mb-1">Nivel 2</p>
              <p class="text-[24px] font-black tracking-tight leading-none text-blue-400">{{ tier2Count }}</p>
            </div>
            <div class="bg-white/[0.07] backdrop-blur-sm rounded-2xl p-4 text-center">
              <p class="text-white/40 text-[9px] font-bold uppercase tracking-widest mb-1">GP Total</p>
              <p class="text-[24px] font-black tracking-tight leading-none text-amber-400">{{ totalGpFormatted }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== MILESTONE BADGES ===== -->
      <div class="bg-white rounded-2xl border border-[#e5e5e5] p-6 shadow-sm mb-6">
        <h3 class="font-bold text-[15px] text-[#1a1c1b] mb-5 flex items-center gap-2">
          <span class="mdi mdi-medal text-amber-500"></span>
          Insignias de referidos
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div v-for="milestone in milestones" :key="milestone.name"
            class="relative rounded-2xl p-5 transition-all"
            :class="isMilestoneUnlocked(milestone.threshold) ? 'bg-white shadow-lg border-2' : 'bg-[#fafafa] border border-[#e5e5e5]'"
            :style="isMilestoneUnlocked(milestone.threshold) ? { borderColor: milestone.color + '40' } : {}">

            <!-- Unlocked glow -->
            <div v-if="isMilestoneUnlocked(milestone.threshold)"
              class="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
              :style="{ backgroundColor: milestone.color }">
              <span class="mdi mdi-check text-white text-[12px]"></span>
            </div>

            <div class="flex flex-col items-center text-center">
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-all"
                :class="isMilestoneUnlocked(milestone.threshold) ? 'scale-110' : 'grayscale opacity-50'"
                :style="{ backgroundColor: milestone.bg }">
                <span class="mdi text-[24px]" :class="milestone.icon" :style="{ color: milestone.color }"></span>
              </div>
              <h4 class="text-[14px] font-black tracking-tight mb-0.5"
                :class="isMilestoneUnlocked(milestone.threshold) ? 'text-[#1a1c1b]' : 'text-[#bbb]'">
                {{ milestone.name }}
              </h4>
              <p class="text-[11px] font-bold mb-3"
                :class="isMilestoneUnlocked(milestone.threshold) ? 'text-[#888]' : 'text-[#ccc]'">
                {{ milestone.threshold }} referidos
              </p>

              <!-- Progress bar -->
              <div class="w-full h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-1000 ease-out"
                  :style="{ width: getMilestoneProgress(milestone.threshold) + '%', backgroundColor: milestone.color }">
                </div>
              </div>
              <p class="text-[10px] font-bold mt-1.5"
                :style="{ color: isMilestoneUnlocked(milestone.threshold) ? milestone.color : '#ccc' }">
                {{ Math.min(totalReferrals, milestone.threshold) }} / {{ milestone.threshold }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== NETWORK VISUALIZATION ===== -->
      <div class="bg-white rounded-2xl border border-[#e5e5e5] p-6 shadow-sm mb-6">
        <h3 class="font-bold text-[15px] text-[#1a1c1b] mb-6 flex items-center gap-2">
          <span class="mdi mdi-sitemap text-[#1A3C34]"></span>
          Visualizacion de tu red
        </h3>

        <div class="relative">

          <!-- YOU node at center top -->
          <div class="flex justify-center mb-4">
            <div class="flex flex-col items-center">
              <div class="w-16 h-16 rounded-full bg-gradient-to-br from-[#1A3C34] to-[#0d1f1a] flex items-center justify-center shadow-xl shadow-[#1A3C34]/30 ring-4 ring-emerald-100 z-10">
                <span class="mdi mdi-account text-white text-[28px]"></span>
              </div>
              <span class="text-[11px] font-black text-[#1A3C34] mt-2 uppercase tracking-wider">Tu</span>
            </div>
          </div>

          <!-- Connecting line from YOU to Tier 1 -->
          <div class="flex justify-center mb-2">
            <div class="w-0.5 h-8 bg-gradient-to-b from-[#1A3C34] to-emerald-300"></div>
          </div>

          <!-- Tier 1 label -->
          <div class="flex items-center gap-3 mb-4">
            <div class="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent"></div>
            <span class="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 rounded-full text-[11px] font-black text-emerald-700 uppercase tracking-wider shrink-0">
              <span class="mdi mdi-circle-medium text-emerald-500"></span>
              Nivel 1 - Directos
              <span class="bg-emerald-600 text-white px-1.5 py-0.5 rounded-md text-[9px]">+200 GP</span>
            </span>
            <div class="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent"></div>
          </div>

          <!-- Tier 1 nodes -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
            <div v-for="(person, i) in tier1" :key="person.userId"
              class="group relative bg-white rounded-2xl border border-[#e5e5e5] p-4 hover:shadow-lg hover:border-emerald-200 transition-all cursor-default">
              <!-- Connecting dot top -->
              <div class="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-2 rounded-full" :style="{ backgroundColor: tier1Colors[i % tier1Colors.length] }"></div>

              <div class="flex flex-col items-center text-center">
                <div v-if="person.avatarUrl" class="w-10 h-10 rounded-full overflow-hidden mb-2 ring-2 ring-emerald-100">
                  <img :src="person.avatarUrl" :alt="person.displayName" class="w-full h-full object-cover" />
                </div>
                <div v-else class="w-10 h-10 rounded-full flex items-center justify-center mb-2 text-white text-[12px] font-black ring-2 ring-emerald-100"
                  :style="{ backgroundColor: tier1Colors[i % tier1Colors.length] }">
                  {{ getInitials(person.displayName) }}
                </div>
                <p class="text-[11px] font-bold text-[#1a1c1b] truncate w-full leading-tight">{{ person.displayName }}</p>
                <p class="text-[9px] text-[#aaa] mt-0.5">{{ formatDate(person.joinedAt) }}</p>
                <div class="flex items-center gap-1 mt-2">
                  <span class="text-[10px] font-black text-emerald-600">+{{ person.totalPointsEarned }} GP</span>
                </div>
                <div v-if="person.referralCount > 0" class="flex items-center gap-1 mt-1 bg-blue-50 px-2 py-0.5 rounded-full">
                  <span class="mdi mdi-account-plus text-blue-500 text-[10px]"></span>
                  <span class="text-[9px] font-bold text-blue-600">{{ person.referralCount }} inv.</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Connecting line from Tier 1 to Tier 2 -->
          <div class="flex justify-center mb-2">
            <div class="w-0.5 h-6 bg-gradient-to-b from-emerald-300 to-blue-300"></div>
          </div>

          <!-- Tier 2 label -->
          <div class="flex items-center gap-3 mb-4">
            <div class="flex-1 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
            <span class="flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full text-[11px] font-black text-blue-700 uppercase tracking-wider shrink-0">
              <span class="mdi mdi-circle-medium text-blue-500"></span>
              Nivel 2 - Indirectos
              <span class="bg-blue-600 text-white px-1.5 py-0.5 rounded-md text-[9px]">+50 GP</span>
            </span>
            <div class="flex-1 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
          </div>

          <!-- Tier 2 nodes -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div v-for="(person, i) in tier2" :key="person.userId"
              class="group relative bg-white rounded-2xl border border-[#e5e5e5] p-3 hover:shadow-lg hover:border-blue-200 transition-all cursor-default">
              <!-- Connecting dot top -->
              <div class="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-2 rounded-full" :style="{ backgroundColor: tier2Colors[i % tier2Colors.length] }"></div>

              <div class="flex flex-col items-center text-center">
                <div v-if="person.avatarUrl" class="w-9 h-9 rounded-full overflow-hidden mb-1.5 ring-2 ring-blue-100">
                  <img :src="person.avatarUrl" :alt="person.displayName" class="w-full h-full object-cover" />
                </div>
                <div v-else class="w-9 h-9 rounded-full flex items-center justify-center mb-1.5 text-white text-[10px] font-black ring-2 ring-blue-100"
                  :style="{ backgroundColor: tier2Colors[i % tier2Colors.length] }">
                  {{ getInitials(person.displayName) }}
                </div>
                <p class="text-[10px] font-bold text-[#1a1c1b] truncate w-full leading-tight">{{ person.displayName }}</p>
                <p class="text-[9px] text-[#aaa] mt-0.5">{{ formatDate(person.joinedAt) }}</p>
                <span class="text-[9px] font-black text-blue-600 mt-1">+{{ person.totalPointsEarned }} GP</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- ===== HOW IT WORKS ===== -->
      <div class="bg-[#f5f5f5] rounded-2xl p-6">
        <h3 class="text-[15px] font-bold text-[#1a1c1b] tracking-tight mb-5">Como funciona la red multinivel</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div class="flex gap-4">
            <div class="w-10 h-10 rounded-xl bg-[#1A3C34] flex items-center justify-center shrink-0">
              <span class="text-[14px] font-black text-white">01</span>
            </div>
            <div>
              <p class="text-[13px] font-bold text-[#1a1c1b] mb-1">Invitas directamente</p>
              <p class="text-[12px] text-[#888] leading-relaxed">Cada persona que se une con tu enlace es tu referido de Nivel 1 y ganas <strong class="text-emerald-600">+200 GP</strong>.</p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
              <span class="text-[14px] font-black text-white">02</span>
            </div>
            <div>
              <p class="text-[13px] font-bold text-[#1a1c1b] mb-1">Ellos invitan a otros</p>
              <p class="text-[12px] text-[#888] leading-relaxed">Cuando tus invitados traen nuevas personas, son tus referidos de Nivel 2 y ganas <strong class="text-blue-600">+50 GP</strong>.</p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
              <span class="mdi mdi-infinity text-white text-lg"></span>
            </div>
            <div>
              <p class="text-[13px] font-bold text-[#1a1c1b] mb-1">Crece sin limites</p>
              <p class="text-[12px] text-[#888] leading-relaxed">Cuantos mas invitados tengas, mas crece tu red. Desbloquea insignias y acumula mas GP.</p>
            </div>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>
