<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ChallengeViewModel } from '~/services/apis/models/challenge-view-model'
import { gamificationApiClient } from '~/services/apis/api.client.gamification'

const challenges = ref<ChallengeViewModel[]>([])
const isLoading = ref(false)
const activeFilter = ref<'all' | 'weekly' | 'monthly'>('all')

const mockChallenges: ChallengeViewModel[] = [
  ChallengeViewModel.fromJS({ id: 'mock-1', title: 'Descubridor', description: 'Visita 3 restaurantes nuevos', iconName: 'mdi-compass-outline', targetCount: 3, currentCount: 1, rewardPoints: 150, type: 'weekly', isCompleted: false, expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000) }),
  ChallengeViewModel.fromJS({ id: 'mock-2', title: 'Crítico', description: 'Escribe 3 reseñas con foto', iconName: 'mdi-camera-outline', targetCount: 3, currentCount: 2, rewardPoints: 200, type: 'weekly', isCompleted: false, expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000) }),
  ChallengeViewModel.fromJS({ id: 'mock-3', title: 'Social', description: 'Comparte 5 restaurantes con amigos', iconName: 'mdi-share-variant-outline', targetCount: 5, currentCount: 3, rewardPoints: 100, type: 'weekly', isCompleted: false, expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000) }),
  ChallengeViewModel.fromJS({ id: 'mock-4', title: 'Constante', description: 'Haz check-in 5 días seguidos', iconName: 'mdi-calendar-check-outline', targetCount: 5, currentCount: 5, rewardPoints: 120, type: 'weekly', isCompleted: true, expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000) }),
  ChallengeViewModel.fromJS({ id: 'mock-5', title: 'Explorador del mes', description: 'Visita 15 restaurantes diferentes', iconName: 'mdi-map-marker-multiple-outline', targetCount: 15, currentCount: 7, rewardPoints: 500, type: 'monthly', isCompleted: false, expiresAt: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), badgeId: 'explorer-badge' }),
  ChallengeViewModel.fromJS({ id: 'mock-6', title: 'Influencer', description: 'Consigue 10 referidos este mes', iconName: 'mdi-account-group-outline', targetCount: 10, currentCount: 3, rewardPoints: 800, type: 'monthly', isCompleted: false, expiresAt: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), badgeId: 'influencer-badge' }),
]

const filteredChallenges = computed(() => {
  const list = challenges.value.length > 0 ? challenges.value : mockChallenges
  if (activeFilter.value === 'all') return list
  return list.filter(c => c.type === activeFilter.value)
})

const weeklyChallenges = computed(() => filteredChallenges.value.filter(c => c.type === 'weekly'))
const monthlyChallenges = computed(() => filteredChallenges.value.filter(c => c.type === 'monthly'))

const getProgress = (challenge: ChallengeViewModel) => {
  if (challenge.targetCount === 0) return 0
  return Math.min(100, Math.round((challenge.currentCount / challenge.targetCount) * 100))
}

const getTimeRemaining = (expiresAt: Date | undefined) => {
  if (!expiresAt) return ''
  const now = new Date()
  const expiry = new Date(expiresAt)
  const diffMs = expiry.getTime() - now.getTime()
  if (diffMs <= 0) return 'Expirado'
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days > 0) return `${days}d ${hours}h`
  return `${hours}h`
}

const getProgressColor = (challenge: ChallengeViewModel) => {
  if (challenge.isCompleted) return 'bg-emerald-500'
  const pct = getProgress(challenge)
  if (pct >= 75) return 'bg-emerald-500'
  if (pct >= 50) return 'bg-amber-500'
  return 'bg-[#1A3C34]'
}

const getProgressGradient = (challenge: ChallengeViewModel) => {
  if (challenge.isCompleted) return 'background: linear-gradient(90deg, #34d399, #10b981, #059669);'
  const pct = getProgress(challenge)
  if (pct >= 75) return 'background: linear-gradient(90deg, #34d399, #10b981);'
  if (pct >= 50) return 'background: linear-gradient(90deg, #fbbf24, #f59e0b);'
  return 'background: linear-gradient(90deg, #2a5a4e, #1A3C34);'
}

onMounted(async () => {
  isLoading.value = true
  try {
    const result = await gamificationApiClient.gamificationChallenges()
    if (result && result.length > 0) {
      challenges.value = result
    }
  } catch (err) {
    console.warn('Challenges load failed, using mock data', err)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1A3C34] to-[#0d1f1a] flex items-center justify-center shadow-lg">
          <span class="mdi mdi-sword-cross text-white text-lg"></span>
        </div>
        <div>
          <h3 class="text-[16px] font-bold text-[#1a1c1b] tracking-tight">Desafíos</h3>
          <p class="text-[11px] text-[#888]">Completa retos para ganar puntos extra</p>
        </div>
      </div>
      <!-- Filter pills -->
      <div class="flex gap-1.5">
        <button v-for="f in [
          { id: 'all', label: 'Todos' },
          { id: 'weekly', label: 'Semanal' },
          { id: 'monthly', label: 'Mensual' },
        ]" :key="f.id"
          @click="activeFilter = f.id as any"
          class="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
          :class="activeFilter === f.id
            ? 'bg-[#1A3C34] text-white shadow-sm'
            : 'bg-[#f5f5f5] text-[#888] hover:bg-[#eee]'">
          {{ f.label }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <span class="mdi mdi-loading animate-spin text-2xl text-[#1A3C34]"></span>
    </div>

    <template v-else>

      <!-- Weekly Challenges -->
      <div v-if="weeklyChallenges.length > 0 && (activeFilter === 'all' || activeFilter === 'weekly')">
        <div class="flex items-center gap-2 mb-3" v-if="activeFilter === 'all'">
          <span class="mdi mdi-calendar-week text-[#1A3C34] text-sm"></span>
          <span class="text-[11px] font-bold text-[#888] uppercase tracking-[0.12em]">Semanal</span>
          <div class="flex-1 h-px bg-[#e5e5e5]"></div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div v-for="challenge in weeklyChallenges" :key="challenge.id"
            class="group relative bg-white rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5"
            :class="challenge.isCompleted
              ? 'border-emerald-200 bg-gradient-to-br from-white to-emerald-50/40 shadow-[0_2px_12px_rgba(16,185,129,0.08)] hover:shadow-[0_8px_24px_rgba(16,185,129,0.15)]'
              : 'border-[#e5e5e5] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]'">

            <!-- Completed overlay -->
            <div v-if="challenge.isCompleted" class="absolute top-3 right-3">
              <div class="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <span class="mdi mdi-check text-white text-sm font-bold"></span>
              </div>
            </div>

            <!-- Type tag -->
            <div class="absolute top-3 right-3" v-if="!challenge.isCompleted">
              <span class="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#1A3C34]/10 text-[#1A3C34]">
                {{ challenge.type === 'weekly' ? 'Semanal' : 'Mensual' }}
              </span>
            </div>

            <div class="flex items-start gap-4">
              <!-- Icon -->
              <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-3"
                :class="challenge.isCompleted ? 'bg-emerald-100' : 'bg-[#1A3C34]/[0.08]'">
                <span class="mdi text-xl"
                  :class="[challenge.iconName || 'mdi-target', challenge.isCompleted ? 'text-emerald-600' : 'text-[#1A3C34]']"></span>
              </div>

              <div class="flex-1 min-w-0">
                <!-- Title & description -->
                <h4 class="text-[14px] font-bold tracking-tight"
                  :class="challenge.isCompleted ? 'text-emerald-700' : 'text-[#1a1c1b]'">
                  {{ challenge.title }}
                </h4>
                <p class="text-[11px] text-[#888] mt-0.5 leading-snug">{{ challenge.description }}</p>

                <!-- Progress bar -->
                <div class="mt-3">
                  <div class="flex items-center justify-between mb-1.5">
                    <span class="text-[10px] font-bold"
                      :class="challenge.isCompleted ? 'text-emerald-600' : 'text-[#666]'">
                      {{ challenge.currentCount }}/{{ challenge.targetCount }}
                    </span>
                    <span class="text-[10px] font-bold text-[#bbb]">{{ getProgress(challenge) }}%</span>
                  </div>
                  <div class="h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-700 ease-out"
                      :style="[getProgressGradient(challenge), { width: getProgress(challenge) + '%' }]">
                    </div>
                  </div>
                </div>

                <!-- Footer: reward + expiry -->
                <div class="flex items-center justify-between mt-3">
                  <div class="flex items-center gap-1.5">
                    <span class="mdi mdi-star-four-points text-amber-500 text-xs"></span>
                    <span class="text-[12px] font-black text-[#1A3C34]">+{{ challenge.rewardPoints }} GP</span>
                    <span v-if="challenge.badgeId" class="mdi mdi-shield-star text-purple-500 text-xs ml-1" title="Incluye insignia"></span>
                  </div>
                  <div class="flex items-center gap-1" v-if="!challenge.isCompleted">
                    <span class="mdi mdi-clock-outline text-[#ccc] text-[10px]"></span>
                    <span class="text-[10px] text-[#aaa] font-medium">{{ getTimeRemaining(challenge.expiresAt) }}</span>
                  </div>
                  <span v-else class="text-[10px] font-bold text-emerald-500">Completado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Monthly Challenges -->
      <div v-if="monthlyChallenges.length > 0 && (activeFilter === 'all' || activeFilter === 'monthly')">
        <div class="flex items-center gap-2 mb-3" v-if="activeFilter === 'all'">
          <span class="mdi mdi-calendar-month text-purple-500 text-sm"></span>
          <span class="text-[11px] font-bold text-[#888] uppercase tracking-[0.12em]">Mensual</span>
          <div class="flex-1 h-px bg-[#e5e5e5]"></div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div v-for="challenge in monthlyChallenges" :key="challenge.id"
            class="group relative bg-white rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5"
            :class="challenge.isCompleted
              ? 'border-emerald-200 bg-gradient-to-br from-white to-emerald-50/40 shadow-[0_2px_12px_rgba(16,185,129,0.08)] hover:shadow-[0_8px_24px_rgba(16,185,129,0.15)]'
              : 'border-purple-100 bg-gradient-to-br from-white to-purple-50/30 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(147,51,234,0.1)]'">

            <!-- Completed overlay -->
            <div v-if="challenge.isCompleted" class="absolute top-3 right-3">
              <div class="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <span class="mdi mdi-check text-white text-sm font-bold"></span>
              </div>
            </div>

            <!-- Type tag -->
            <div class="absolute top-3 right-3" v-if="!challenge.isCompleted">
              <span class="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600">
                Mensual
              </span>
            </div>

            <div class="flex items-start gap-4">
              <!-- Icon -->
              <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-3"
                :class="challenge.isCompleted ? 'bg-emerald-100' : 'bg-purple-100'">
                <span class="mdi text-xl"
                  :class="[challenge.iconName || 'mdi-target', challenge.isCompleted ? 'text-emerald-600' : 'text-purple-600']"></span>
              </div>

              <div class="flex-1 min-w-0">
                <h4 class="text-[14px] font-bold tracking-tight"
                  :class="challenge.isCompleted ? 'text-emerald-700' : 'text-[#1a1c1b]'">
                  {{ challenge.title }}
                </h4>
                <p class="text-[11px] text-[#888] mt-0.5 leading-snug">{{ challenge.description }}</p>

                <!-- Progress bar -->
                <div class="mt-3">
                  <div class="flex items-center justify-between mb-1.5">
                    <span class="text-[10px] font-bold"
                      :class="challenge.isCompleted ? 'text-emerald-600' : 'text-purple-600'">
                      {{ challenge.currentCount }}/{{ challenge.targetCount }}
                    </span>
                    <span class="text-[10px] font-bold text-[#bbb]">{{ getProgress(challenge) }}%</span>
                  </div>
                  <div class="h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-700 ease-out"
                      :style="[
                        challenge.isCompleted
                          ? 'background: linear-gradient(90deg, #34d399, #10b981, #059669);'
                          : 'background: linear-gradient(90deg, #c084fc, #a855f7, #9333ea);',
                        { width: getProgress(challenge) + '%' }
                      ]">
                    </div>
                  </div>
                </div>

                <!-- Footer -->
                <div class="flex items-center justify-between mt-3">
                  <div class="flex items-center gap-1.5">
                    <span class="mdi mdi-star-four-points text-amber-500 text-xs"></span>
                    <span class="text-[12px] font-black text-[#1A3C34]">+{{ challenge.rewardPoints }} GP</span>
                    <span v-if="challenge.badgeId" class="mdi mdi-shield-star text-purple-500 text-xs ml-1" title="Incluye insignia"></span>
                  </div>
                  <div class="flex items-center gap-1" v-if="!challenge.isCompleted">
                    <span class="mdi mdi-clock-outline text-[#ccc] text-[10px]"></span>
                    <span class="text-[10px] text-[#aaa] font-medium">{{ getTimeRemaining(challenge.expiresAt) }}</span>
                  </div>
                  <span v-else class="text-[10px] font-bold text-emerald-500">Completado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="filteredChallenges.length === 0" class="text-center py-16">
        <span class="mdi mdi-sword-cross text-5xl text-[#ddd] mb-3 block"></span>
        <p class="text-[#999] text-[13px]">No hay desafíos disponibles ahora.</p>
      </div>

    </template>
  </div>
</template>
