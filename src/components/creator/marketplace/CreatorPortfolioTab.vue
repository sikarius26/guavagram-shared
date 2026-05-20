<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { creatorApiClient } from '~/services/apis/api.client.creator'
import { CampaignStatusEnum } from '~/services/apis/models/campaign-status-enum'
import { notifier } from '~/services/notification'

type PortfolioSubTab = 'active' | 'completed'

const { t } = useI18n()
const campaigns = ref<any[]>([])
const loading = ref(false)
const subTab = ref<PortfolioSubTab>('active')

const statusMeta = computed<Record<number, { label: string; cls: string; dotCls: string; active: boolean }>>(() => ({
  [CampaignStatusEnum.REQUESTED]: { label: t('campaignStatusRequested'), cls: 'bg-amber-50 text-amber-700 border-amber-200', dotCls: 'bg-amber-500', active: true },
  [CampaignStatusEnum.ACCEPTED]: { label: t('campaignStatusAccepted'), cls: 'bg-green-50 text-green-700 border-green-200', dotCls: 'bg-green-500', active: true },
  [CampaignStatusEnum.IN_PROGRESS]: { label: t('campaignStatusInProgress'), cls: 'bg-blue-50 text-blue-700 border-blue-200', dotCls: 'bg-blue-500', active: true },
  [CampaignStatusEnum.DELIVERED]: { label: t('campaignStatusDelivered'), cls: 'bg-indigo-50 text-indigo-700 border-indigo-200', dotCls: 'bg-indigo-500', active: true },
  [CampaignStatusEnum.COMPLETED]: { label: t('campaignStatusCompleted'), cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotCls: 'bg-emerald-500', active: false },
  [CampaignStatusEnum.REJECTED]: { label: t('campaignStatusRejected'), cls: 'bg-red-50 text-red-700 border-red-200', dotCls: 'bg-red-500', active: false },
  [CampaignStatusEnum.CANCELED]: { label: t('campaignStatusCanceled'), cls: 'bg-gray-100 text-gray-600 border-gray-200', dotCls: 'bg-gray-400', active: false },
}))

const load = async () => {
  loading.value = true
  try {
    const data = await creatorApiClient.creatorCampaignsGet()
    campaigns.value = data ?? []
  } catch (e) {
    notifier.notifyError(t('couldNotLoadPortfolio'), e as Error)
  } finally {
    loading.value = false
  }
}

onMounted(load)

const completedCampaigns = computed(() => campaigns.value.filter(c => !statusMeta.value[c.status]?.active))
const activeCampaigns = computed(() => campaigns.value.filter(c => statusMeta.value[c.status]?.active))

const filtered = computed(() => (subTab.value === 'active' ? activeCampaigns.value : completedCampaigns.value))

const completedCount = computed(() => completedCampaigns.value.length)

const totalEarningsEur = computed(() => {
  const cents = campaigns.value.reduce((acc, c) => acc + Number(c.metrics?.earningsCents ?? 0), 0)
  return Math.round(cents / 100)
})

const avgRating = computed(() => {
  const rated = campaigns.value.filter(c => typeof c.metrics?.rating === 'number')
  if (!rated.length) return 0
  const sum = rated.reduce((acc, c) => acc + Number(c.metrics.rating), 0)
  return sum / rated.length
})

const formatDateRange = (started: Date | string | undefined, ended: Date | string | undefined): string => {
  const start = started ? new Date(started as any) : null
  const end = ended ? new Date(ended as any) : null
  const fmt = (d: Date) => d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
  if (start && end && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) return `${fmt(start)} — ${fmt(end)}`
  if (start && !Number.isNaN(start.getTime())) return `${fmt(start)} — en curso`
  return ''
}

const formatEur = (cents: number | undefined): string => {
  const eur = Math.round(Number(cents ?? 0) / 100)
  return eur.toLocaleString('es-ES')
}
</script>

<template>
  <div class="flex flex-col gap-5">

    <!-- Header with stats -->
    <div>
      <h3 class="text-[18px] font-bold tracking-[-0.02em] text-[#1a1c1b]">Tu portfolio</h3>
      <p class="text-[12px] text-[#666] mt-0.5">Historial de campanas realizadas y en curso.</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div class="rounded-2xl bg-white border border-[#e5e5e5] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <p class="text-[10px] font-bold text-[#888] uppercase tracking-[0.15em]">Campanas completadas</p>
        <p class="text-[24px] font-black tracking-[-0.03em] text-[#1a1c1b] mt-1 tabular-nums">{{ completedCount }}</p>
      </div>
      <div class="rounded-2xl bg-white border border-[#e5e5e5] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <p class="text-[10px] font-bold text-[#888] uppercase tracking-[0.15em]">Ingresos totales</p>
        <p class="text-[24px] font-black tracking-[-0.03em] text-[#1a1c1b] mt-1 tabular-nums">
          {{ totalEarningsEur.toLocaleString('es-ES') }}<span class="text-[16px] font-bold text-[#888]">€</span>
        </p>
      </div>
      <div class="rounded-2xl bg-white border border-[#e5e5e5] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <p class="text-[10px] font-bold text-[#888] uppercase tracking-[0.15em]">Rating medio</p>
        <p class="text-[24px] font-black tracking-[-0.03em] text-[#1a1c1b] mt-1 tabular-nums inline-flex items-center gap-1">
          <span class="mdi mdi-star text-amber-500 text-[22px]"></span>
          {{ avgRating.toFixed(1) }}
        </p>
      </div>
    </div>

    <!-- Sub-tabs -->
    <nav class="flex items-center gap-1.5">
      <button
        v-for="tab in ([{ key: 'active', label: 'En curso', count: activeCampaigns.length }, { key: 'completed', label: 'Completadas', count: completedCampaigns.length }] as const)"
        :key="tab.key"
        type="button"
        :class="[
          'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-semibold transition-all border',
          subTab === tab.key
            ? 'bg-[#1a1c1b] text-white border-[#1a1c1b]'
            : 'bg-white text-[#1a1c1b] border-[#e5e5e5] hover:border-[#1a1c1b]/30'
        ]"
        @click="subTab = tab.key"
      >
        {{ tab.label }}
        <span
          v-if="tab.count > 0"
          :class="[
            'inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-bold tabular-nums',
            subTab === tab.key ? 'bg-white/15 text-white' : 'bg-[#f0f0f0] text-[#666]'
          ]"
        >
          {{ tab.count }}
        </span>
      </button>
    </nav>

    <!-- Loading -->
    <div v-if="loading && campaigns.length === 0" class="rounded-2xl border border-dashed border-[#ddd] p-10 text-center text-[#888] text-[13px]">
      {{ $t('loadingPortfolio') }}
    </div>

    <!-- Empty -->
    <div
      v-else-if="filtered.length === 0"
      class="rounded-2xl border border-dashed border-[#ddd] bg-white p-10 text-center"
    >
      <div class="mx-auto w-14 h-14 rounded-2xl bg-[#f7f7f7] flex items-center justify-center mb-3">
        <span class="mdi mdi-briefcase-outline text-[#bbb] text-[28px]"></span>
      </div>
      <p class="text-[15px] font-bold text-[#1a1c1b]">
        {{ subTab === 'active' ? 'Sin campanas en curso' : 'Sin campanas completadas' }}
      </p>
      <p class="text-[12px] text-[#888] mt-1 max-w-xs mx-auto">
        {{ subTab === 'active'
          ? 'Cuando aceptes una propuesta, aparecera aqui.'
          : 'Las campanas que cierres apareceran en tu portfolio publico.' }}
      </p>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <article
        v-for="c in filtered"
        :key="c.id"
        class="rounded-2xl bg-white border border-[#e5e5e5] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_18px_rgba(0,0,0,0.08)] transition-shadow flex flex-col gap-3"
      >
        <!-- Header -->
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-xl overflow-hidden bg-[#f3f3f3] flex items-center justify-center shrink-0 ring-1 ring-[#eee]">
            <img v-if="c.storeLogoUrl" :src="c.storeLogoUrl" class="w-full h-full object-cover" :alt="c.storeName" />
            <span v-else class="mdi mdi-store-outline text-[#bbb] text-[20px]"></span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-[13px] font-bold tracking-[-0.01em] text-[#1a1c1b] truncate">{{ c.storeName }}</p>
            <p class="text-[11px] text-[#666] truncate">{{ c.pickTitle }}</p>
          </div>
          <span
            v-if="statusMeta[c.status]"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0"
            :class="statusMeta[c.status].cls"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="statusMeta[c.status].dotCls"></span>
            {{ statusMeta[c.status].label }}
          </span>
        </div>

        <!-- Dates -->
        <p class="text-[11px] text-[#888] inline-flex items-center gap-1">
          <span class="mdi mdi-calendar-blank-outline text-[12px]"></span>
          {{ formatDateRange(c.startedAt, c.endedAt) }}
        </p>

        <!-- Metrics -->
        <div v-if="c.metrics" class="grid grid-cols-3 gap-2 pt-3 border-t border-[#f0f0f0]">
          <div class="text-center">
            <p class="text-[14px] font-black text-[#1a1c1b] tabular-nums">{{ c.metrics.bookings ?? 0 }}</p>
            <p class="text-[9px] font-bold text-[#888] uppercase tracking-[0.12em] mt-0.5">Reservas</p>
          </div>
          <div class="text-center border-x border-[#f0f0f0]">
            <p class="text-[14px] font-black text-[#1a1c1b] tabular-nums">{{ c.metrics.codeRedemptions ?? 0 }}</p>
            <p class="text-[9px] font-bold text-[#888] uppercase tracking-[0.12em] mt-0.5">Cupones</p>
          </div>
          <div class="text-center">
            <p class="text-[14px] font-black text-[#1a1c1b] tabular-nums">{{ (c.metrics.views ?? 0).toLocaleString('es-ES') }}</p>
            <p class="text-[9px] font-bold text-[#888] uppercase tracking-[0.12em] mt-0.5">Vistas</p>
          </div>
        </div>

        <!-- Earnings + rating -->
        <div class="flex items-center justify-between pt-3 border-t border-[#f0f0f0]">
          <div>
            <p class="text-[10px] font-bold text-[#888] uppercase tracking-[0.12em]">Ganado</p>
            <p class="text-[18px] font-black tracking-[-0.02em] text-emerald-600 tabular-nums leading-none mt-0.5">
              {{ formatEur(c.metrics?.earningsCents) }}<span class="text-[12px] text-emerald-400">€</span>
            </p>
          </div>
          <div v-if="typeof c.metrics?.rating === 'number'" class="text-right">
            <p class="text-[10px] font-bold text-[#888] uppercase tracking-[0.12em]">Rating</p>
            <p class="text-[16px] font-bold text-[#1a1c1b] tabular-nums inline-flex items-center gap-1 mt-0.5">
              <span class="mdi mdi-star text-amber-500 text-[15px]"></span>
              {{ Number(c.metrics.rating).toFixed(1) }}
            </p>
          </div>
        </div>

        <!-- Review -->
        <blockquote v-if="c.buyerReview" class="rounded-xl bg-[#fafafa] border border-[#f0f0f0] p-3">
          <p class="text-[12px] italic text-[#444] leading-relaxed">
            <span class="mdi mdi-format-quote-open text-[#bbb]"></span>
            {{ c.buyerReview }}
          </p>
        </blockquote>
      </article>
    </div>
  </div>
</template>
