<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { gamificationApiClient } from '~/services/apis/api.client.gamification'
import type { GamificationLeaderboardEntryViewModel } from '~/services/apis/models/gamification-leaderboard-entry-view-model'

type Period = 'weekly' | 'monthly' | 'alltime'

const activePeriod = ref<Period>('weekly')
const entries = ref<GamificationLeaderboardEntryViewModel[]>([])
const isLoading = ref(false)

const periods: { key: Period; label: string }[] = [
  { key: 'weekly', label: 'Semanal' },
  { key: 'monthly', label: 'Mensual' },
  { key: 'alltime', label: 'Total' },
]

const MOCK_ENTRIES = [
  { rank: 1, userId: '1', displayName: 'Sofia Martinez', avatarUrl: undefined, points: 12450, isCurrentUser: false },
  { rank: 2, userId: '2', displayName: 'Carlos Ramirez', avatarUrl: undefined, points: 11200, isCurrentUser: false },
  { rank: 3, userId: '3', displayName: 'Valentina Lopez', avatarUrl: undefined, points: 9870, isCurrentUser: false },
  { rank: 4, userId: '4', displayName: 'Diego Hernandez', avatarUrl: undefined, points: 8540, isCurrentUser: false },
  { rank: 5, userId: '5', displayName: 'Camila Torres', avatarUrl: undefined, points: 7320, isCurrentUser: true },
  { rank: 6, userId: '6', displayName: 'Andres Gutierrez', avatarUrl: undefined, points: 6100, isCurrentUser: false },
  { rank: 7, userId: '7', displayName: 'Isabella Morales', avatarUrl: undefined, points: 5480, isCurrentUser: false },
  { rank: 8, userId: '8', displayName: 'Sebastian Diaz', avatarUrl: undefined, points: 4950, isCurrentUser: false },
  { rank: 9, userId: '9', displayName: 'Lucia Fernandez', avatarUrl: undefined, points: 3720, isCurrentUser: false },
  { rank: 10, userId: '10', displayName: 'Mateo Castillo', avatarUrl: undefined, points: 2890, isCurrentUser: false },
]

const top3 = computed(() => entries.value.slice(0, 3))
const restEntries = computed(() => entries.value.slice(3, 10))

const rankConfig: Record<number, { bg: string; border: string; text: string; shadow: string; medal: string }> = {
  1: { bg: 'bg-gradient-to-br from-amber-400 to-yellow-500', border: 'border-amber-400', text: 'text-amber-700', shadow: 'shadow-amber-400/30', medal: 'mdi-trophy' },
  2: { bg: 'bg-gradient-to-br from-slate-300 to-gray-400', border: 'border-slate-400', text: 'text-slate-600', shadow: 'shadow-slate-400/20', medal: 'mdi-medal' },
  3: { bg: 'bg-gradient-to-br from-orange-400 to-amber-600', border: 'border-orange-400', text: 'text-orange-700', shadow: 'shadow-orange-400/20', medal: 'mdi-medal-outline' },
}

function formatPoints(pts: number) {
  if (pts >= 10000) return (pts / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  if (pts >= 1000) return (pts / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return pts.toLocaleString('es-ES')
}

function getInitials(name: string | undefined) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
}

async function loadLeaderboard(period: Period) {
  activePeriod.value = period
  isLoading.value = true
  try {
    const result = await gamificationApiClient.gamificationLeaderboard(period)
    entries.value = result && result.length > 0 ? result : MOCK_ENTRIES as any
  } catch {
    entries.value = MOCK_ENTRIES as any
  } finally {
    isLoading.value = false
  }
}

onMounted(() => loadLeaderboard('weekly'))
</script>

<template>
  <div class="w-full">

    <!-- Period selector -->
    <div class="flex bg-[#f0f0f0] rounded-2xl p-1 mb-8">
      <button v-for="p in periods" :key="p.key" @click="loadLeaderboard(p.key)"
        class="flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300"
        :class="activePeriod === p.key
          ? 'bg-[#1a1c1b] text-white shadow-md'
          : 'text-[#999] hover:text-[#555]'">
        {{ p.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <span class="mdi mdi-loading animate-spin text-3xl text-[#1A3C34]"></span>
    </div>

    <template v-else-if="top3.length === 3">

      <!-- ===== TOP 3 PODIUM ===== -->
      <div class="relative mb-8">
        <!-- Background card -->
        <div class="bg-[#1a1c1b] rounded-3xl pt-12 pb-6 px-6 relative overflow-hidden">
          <!-- Decorative -->
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-amber-500/10 rounded-full blur-[80px]"></div>
          <div class="absolute inset-0 opacity-[0.03]" style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 16px 16px;"></div>

          <!-- Podium layout: 2nd | 1st | 3rd -->
          <div class="relative z-10 flex items-end justify-center gap-4 lg:gap-8">

            <!-- 2nd place -->
            <div class="flex flex-col items-center flex-1 max-w-[140px]">
              <div class="relative mb-3">
                <div class="w-16 h-16 rounded-full border-[3px] border-slate-400/60 p-0.5">
                  <div class="w-full h-full rounded-full bg-gradient-to-br from-slate-300 to-gray-400 flex items-center justify-center text-white font-bold text-[15px]">
                    {{ getInitials(top3[1].displayName) }}
                  </div>
                </div>
                <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gradient-to-br from-slate-300 to-gray-400 flex items-center justify-center shadow-lg">
                  <span class="text-white text-[11px] font-black">2</span>
                </div>
              </div>
              <p class="text-white text-[13px] font-bold text-center truncate w-full mb-0.5">{{ top3[1].displayName }}</p>
              <p class="text-slate-400 text-[12px] font-mono font-bold">{{ formatPoints(top3[1].points) }} GP</p>
              <!-- Podium bar -->
              <div class="w-full mt-3 h-20 rounded-t-2xl bg-gradient-to-t from-slate-700 to-slate-600 border-t-2 border-slate-400/40 flex items-start justify-center pt-3">
                <span class="mdi mdi-medal text-slate-400 text-xl"></span>
              </div>
            </div>

            <!-- 1st place -->
            <div class="flex flex-col items-center flex-1 max-w-[160px] -mt-4">
              <!-- Crown -->
              <span class="mdi mdi-crown text-amber-400 text-[28px] mb-1 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]"></span>
              <div class="relative mb-3">
                <div class="absolute inset-0 rounded-full blur-xl bg-amber-400/30"></div>
                <div class="relative w-20 h-20 rounded-full border-[3px] border-amber-400/70 p-0.5">
                  <div class="w-full h-full rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white font-bold text-[18px] shadow-xl">
                    {{ getInitials(top3[0].displayName) }}
                  </div>
                </div>
                <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg ring-2 ring-amber-400/30">
                  <span class="text-white text-[11px] font-black">1</span>
                </div>
              </div>
              <p class="text-white text-[14px] font-extrabold text-center truncate w-full mb-0.5">{{ top3[0].displayName }}</p>
              <p class="text-amber-400 text-[13px] font-mono font-bold">{{ formatPoints(top3[0].points) }} GP</p>
              <!-- Podium bar -->
              <div class="w-full mt-3 h-28 rounded-t-2xl bg-gradient-to-t from-amber-900/60 to-amber-800/40 border-t-2 border-amber-400/40 flex items-start justify-center pt-3">
                <span class="mdi mdi-trophy text-amber-400 text-2xl drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]"></span>
              </div>
            </div>

            <!-- 3rd place -->
            <div class="flex flex-col items-center flex-1 max-w-[140px]">
              <div class="relative mb-3">
                <div class="w-16 h-16 rounded-full border-[3px] border-orange-400/50 p-0.5">
                  <div class="w-full h-full rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center text-white font-bold text-[15px]">
                    {{ getInitials(top3[2].displayName) }}
                  </div>
                </div>
                <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center shadow-lg">
                  <span class="text-white text-[11px] font-black">3</span>
                </div>
              </div>
              <p class="text-white text-[13px] font-bold text-center truncate w-full mb-0.5">{{ top3[2].displayName }}</p>
              <p class="text-orange-400 text-[12px] font-mono font-bold">{{ formatPoints(top3[2].points) }} GP</p>
              <!-- Podium bar -->
              <div class="w-full mt-3 h-14 rounded-t-2xl bg-gradient-to-t from-orange-900/40 to-orange-800/30 border-t-2 border-orange-400/30 flex items-start justify-center pt-2.5">
                <span class="mdi mdi-medal-outline text-orange-400 text-lg"></span>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- ===== POSITIONS 4-10 ===== -->
      <div class="space-y-2.5">
        <div v-for="entry in restEntries" :key="entry.userId"
          class="flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200"
          :class="entry.isCurrentUser
            ? 'bg-[#1A3C34]/[0.08] border-2 border-[#1A3C34]/20 shadow-sm'
            : 'bg-white border border-[#e5e5e5] hover:border-[#ddd] hover:shadow-sm'">

          <!-- Rank -->
          <span class="text-[15px] font-black w-7 text-center text-[#bbb]">{{ entry.rank }}</span>

          <!-- Avatar -->
          <div class="w-10 h-10 rounded-full overflow-hidden shrink-0 shadow-sm">
            <img v-if="entry.avatarUrl" :src="entry.avatarUrl" :alt="entry.displayName" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full bg-gradient-to-br from-[#1A3C34] to-[#2a5c4a] flex items-center justify-center text-white text-[12px] font-bold">
              {{ getInitials(entry.displayName) }}
            </div>
          </div>

          <!-- Name -->
          <div class="flex-1 min-w-0">
            <p class="text-[14px] font-bold text-[#1a1c1b] truncate">
              {{ entry.displayName || 'Anonimo' }}
              <span v-if="entry.isCurrentUser" class="text-[11px] font-bold text-[#1A3C34] ml-1">(Tu)</span>
            </p>
          </div>

          <!-- Points -->
          <div class="text-right shrink-0">
            <span class="text-[15px] font-black text-[#1a1c1b]">{{ formatPoints(entry.points) }}</span>
            <span class="text-[10px] text-[#999] font-bold ml-1">GP</span>
          </div>
        </div>
      </div>
    </template>

    <!-- Empty state -->
    <div v-else class="text-center py-16">
      <span class="mdi mdi-trophy-outline text-5xl text-[#ddd] mb-3 block"></span>
      <p class="text-[#999] text-[13px]">No hay datos del ranking aun</p>
    </div>
  </div>
</template>
