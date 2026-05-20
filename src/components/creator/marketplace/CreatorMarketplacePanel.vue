<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { creatorApiClient } from '~/services/apis/api.client.creator'
import { CreatorProposalStatusEnum } from '~/services/apis/models/creator-proposal-status-enum'
import CreatorPicksTab from './CreatorPicksTab.vue'
import CreatorProposalsTab from './CreatorProposalsTab.vue'
import CreatorPortfolioTab from './CreatorPortfolioTab.vue'
import CreatorLevelTab from './CreatorLevelTab.vue'
import CreatorBoostTab from './CreatorBoostTab.vue'

type MarketplaceTab = 'picks' | 'proposals' | 'portfolio' | 'level' | 'boost'

const activeTab = ref<MarketplaceTab>('picks')

// ---------- Stats for hero ----------
const picks = ref<any[]>([])
const proposals = ref<any[]>([])
const campaigns = ref<any[]>([])
const loading = ref(false)

const loadStats = async () => {
  loading.value = true
  try {
    const [p, pr, c] = await Promise.all([
      creatorApiClient.creatorPicksGet(),
      creatorApiClient.creatorProposalsGet(),
      creatorApiClient.creatorCampaignsGet(),
    ])
    picks.value = p ?? []
    proposals.value = pr ?? []
    campaigns.value = c ?? []
  } catch (e) {
    // swallow — individual tabs handle their own errors
  } finally {
    loading.value = false
  }
}

onMounted(loadStats)

const pendingProposalsCount = computed(() =>
  proposals.value.filter((p: any) => p.status === CreatorProposalStatusEnum.PENDING).length
)

const activePicksCount = computed(() =>
  picks.value.filter((p: any) => p.active).length
)

const monthRevenueEur = computed(() => {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
  let cents = 0
  for (const c of campaigns.value) {
    const ended = c.endedAt ? new Date(c.endedAt).getTime() : null
    if (ended && ended >= monthStart) {
      cents += Number(c.metrics?.earningsCents ?? 0)
    }
  }
  return Math.round(cents / 100)
})

const tabs = computed(() => [
  { id: 'picks' as const, label: 'Picks', count: picks.value.length, icon: 'mdi-package-variant-closed' },
  { id: 'proposals' as const, label: 'Propuestas', count: pendingProposalsCount.value, icon: 'mdi-email-outline', highlight: true },
  { id: 'portfolio' as const, label: 'Portfolio', count: campaigns.value.length, icon: 'mdi-briefcase-outline' },
  { id: 'level' as const, label: 'Mi nivel', icon: 'mdi-shield-star-outline' },
  { id: 'boost' as const, label: 'Boost', icon: 'mdi-rocket-launch-outline' },
])
</script>

<template>
  <div class="p-6 lg:p-8 flex flex-col gap-6 bg-gradient-to-br from-[#fff8f6] via-white to-[#f0f4ff] min-h-full">

    <!-- ============ HERO ============ -->
    <section class="opacity-0 animate-fade-in-up">
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 class="text-[24px] lg:text-[30px] font-bold tracking-[-0.03em] text-[#1a1c1b]">
            Mis ofertas
          </h2>
          <p class="text-[13px] text-[#666] mt-1">
            Tu marketplace personal — vende picks, gestiona propuestas y mide el impacto.
          </p>
        </div>
      </div>

      <!-- Stats row -->
      <div class="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div class="rounded-2xl bg-white border border-[#e5e5e5] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <p class="text-[10px] font-bold text-[#888] uppercase tracking-[0.15em]">Ingresos este mes</p>
          <p class="text-[26px] font-black tracking-[-0.03em] text-[#1a1c1b] mt-1 tabular-nums">
            {{ monthRevenueEur.toLocaleString('es-ES') }}<span class="text-[#888] text-[18px] font-bold">€</span>
          </p>
        </div>
        <div class="rounded-2xl bg-white border border-[#e5e5e5] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <p class="text-[10px] font-bold text-[#888] uppercase tracking-[0.15em]">Propuestas pendientes</p>
          <p class="text-[26px] font-black tracking-[-0.03em] mt-1 tabular-nums" :class="pendingProposalsCount > 0 ? 'text-amber-500' : 'text-[#1a1c1b]'">
            {{ pendingProposalsCount }}
            <span v-if="pendingProposalsCount > 0" class="mdi mdi-circle-medium text-amber-500 text-[18px] animate-pulse"></span>
          </p>
        </div>
        <div class="rounded-2xl bg-white border border-[#e5e5e5] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <p class="text-[10px] font-bold text-[#888] uppercase tracking-[0.15em]">Picks activos</p>
          <p class="text-[26px] font-black tracking-[-0.03em] text-[#1a1c1b] mt-1 tabular-nums">
            {{ activePicksCount }}<span class="text-[#888] text-[14px] font-bold">/{{ picks.length }}</span>
          </p>
        </div>
      </div>
    </section>

    <!-- ============ SUB TABS ============ -->
    <nav class="flex items-center gap-2 flex-wrap opacity-0 animate-fade-in-up" style="animation-delay: 60ms">
      <button
        v-for="t in tabs"
        :key="t.id"
        type="button"
        :class="[
          'inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold transition-all',
          activeTab === t.id
            ? 'bg-[#1a1c1b] text-white shadow-[0_4px_14px_rgba(0,0,0,0.18)]'
            : 'bg-white text-[#1a1c1b] border border-[#e5e5e5] hover:border-[#1a1c1b]/30'
        ]"
        @click="activeTab = t.id"
      >
        <span class="mdi" :class="t.icon"></span>
        <span>{{ t.label }}</span>
        <span
          v-if="t.count !== undefined && t.count > 0"
          :class="[
            'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-bold tabular-nums',
            activeTab === t.id
              ? 'bg-white/15 text-white'
              : t.highlight
                ? 'bg-amber-100 text-amber-700'
                : 'bg-[#f0f0f0] text-[#666]'
          ]"
        >
          {{ t.count }}
        </span>
      </button>
    </nav>

    <!-- ============ TAB CONTENT ============ -->
    <section class="opacity-0 animate-fade-in-up" style="animation-delay: 120ms">
      <CreatorPicksTab
        v-if="activeTab === 'picks'"
        @change="loadStats"
      />
      <CreatorProposalsTab
        v-else-if="activeTab === 'proposals'"
        @change="loadStats"
      />
      <CreatorPortfolioTab v-else-if="activeTab === 'portfolio'" />
      <CreatorLevelTab v-else-if="activeTab === 'level'" />
      <CreatorBoostTab v-else-if="activeTab === 'boost'" />
    </section>

  </div>
</template>
