<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import { useDateRange, type DateRangePreset } from '~/composables/useDateRange'
import { useCreatorInformesMockData } from '~/composables/useCreatorInformesMockData'
import { useCurrentCreator } from '~/composables/useCurrentCreator'
import KpiCard from '~/components/dashboard/informes/KpiCard.vue'
import CreatorAudienceReport from './CreatorAudienceReport.vue'
import CreatorPicksReport from './CreatorPicksReport.vue'
import CreatorEarningsReport from './CreatorEarningsReport.vue'
import CreatorNetworkReport from './CreatorNetworkReport.vue'
import CreatorReviewsReport from './CreatorReviewsReport.vue'

const emit = defineEmits<{ (e: 'navigate', tab: string): void }>()

const { preset, range, previousRange, setPreset, setCustom } = useDateRange('30d')

const compareEnabled = ref(true)

// Data layer — reactive to range changes
const { profile } = useCurrentCreator()
const creatorHandle = computed(() => profile.value?.handle ?? 'demo-creator')
const data = useCreatorInformesMockData(creatorHandle, range, previousRange)

const presets: { id: DateRangePreset; label: string }[] = [
  { id: '7d',      label: '7 días' },
  { id: '30d',     label: '30 días' },
  { id: '90d',     label: '90 días' },
  { id: 'month',   label: 'Este mes' },
  { id: 'quarter', label: 'Trimestre' },
  { id: 'year',    label: 'Año' },
]

const rangeLabel = computed(() => {
  const f = (d: Date) => d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
  return `${f(range.value.start)} — ${f(range.value.end)}`
})

// Custom range popover
const customOpen = ref(false)
const toDateInput = (d: Date) => {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
const customStart = ref(toDateInput(range.value.start))
const customEnd   = ref(toDateInput(range.value.end))
const toggleCustom = () => {
  customOpen.value = !customOpen.value
  if (customOpen.value) {
    customStart.value = toDateInput(range.value.start)
    customEnd.value = toDateInput(range.value.end)
  }
}
const applyCustom = () => {
  const s = new Date(customStart.value)
  const e = new Date(customEnd.value)
  if (isNaN(s.getTime()) || isNaN(e.getTime()) || s > e) return
  setCustom(s, e)
  customOpen.value = false
}
const closeCustomOnOutside = (e: MouseEvent) => {
  const el = document.getElementById('creator-informes-custom-pop')
  const btn = document.getElementById('creator-informes-custom-btn')
  if (!el || !btn) return
  if (!el.contains(e.target as Node) && !btn.contains(e.target as Node)) customOpen.value = false
}
if (typeof window !== 'undefined') {
  window.addEventListener('click', closeCustomOnOutside)
  onBeforeUnmount(() => window.removeEventListener('click', closeCustomOnOutside))
}

// Drill-down
type Drill = 'earnings' | 'audience' | 'picks' | 'network' | 'reviews' | null
const drillOpen = ref<Drill>('earnings')

// Which executive KPI card is highlighted (independent from drill so two cards
// pointing to the same drill don't both appear active)
type KpiKey = 'earnings' | 'followers' | 'clicks' | 'bookings' | 'networkEur' | 'rating'
const selectedKpi = ref<KpiKey>('earnings')

const toggleDrill = (d: Exclude<Drill, null>) => {
  drillOpen.value = drillOpen.value === d ? null : d
}

// Selects the KPI card and opens its drill-down
const selectKpi = (kpi: KpiKey, d: Exclude<Drill, null>) => {
  selectedKpi.value = kpi
  drillOpen.value = d
}

// Executive KPIs — driven by the composable
const executiveKpis = computed(() => ({
  earnings:   { value: data.earnings.kpis.value.total.current.toFixed(2),            unit: '€', delta: data.earnings.kpis.value.total.deltaPct,          icon: 'mdi-cash-multiple',               accent: '#22c55e' },
  followers:  { value: data.audience.kpis.value.totalFollowers.current.toLocaleString('es-ES'), unit: '', delta: data.audience.kpis.value.totalFollowers.deltaPct, icon: 'mdi-account-group',               accent: '#10b981' },
  clicks:     { value: data.picks.kpis.value.totalClicks.current.toLocaleString('es-ES'),       unit: '', delta: data.picks.kpis.value.totalClicks.deltaPct,        icon: 'mdi-cursor-default-click-outline', accent: '#3b82f6' },
  bookings:   { value: String(data.picks.kpis.value.bookings.current),               unit: '', delta: data.picks.kpis.value.bookings.deltaPct,         icon: 'mdi-calendar-check-outline',       accent: '#6366f1' },
  networkEur: { value: data.network.kpis.value.total.current.toFixed(2),              unit: '€', delta: data.network.kpis.value.total.deltaPct,          icon: 'mdi-account-network',              accent: '#8b5cf6' },
  rating:     { value: data.reviews.kpis.value.avgRating.current.toFixed(1),          unit: '',  delta: data.reviews.kpis.value.avgRating.deltaPct,      icon: 'mdi-star-outline',                 accent: '#f59e0b' },
}))

interface DrillDef { id: Exclude<Drill, null>; title: string; subtitle: string; icon: string; accent: string; stat1: { label: string; value: string }; stat2: { label: string; value: string } }
const drills = computed<DrillDef[]>(() => [
  { id: 'earnings',  title: 'Ingresos',  subtitle: '¿Cuánto he ganado y de dónde?',     icon: 'mdi-cash-multiple',           accent: '#22c55e',
    stat1: { label: 'total',       value: `${data.earnings.kpis.value.total.current.toFixed(2)}€` },
    stat2: { label: 'vs anterior', value: `${data.earnings.kpis.value.total.deltaPct >= 0 ? '+' : ''}${data.earnings.kpis.value.total.deltaPct}%` } },
  { id: 'audience',  title: 'Audiencia', subtitle: '¿Cuánto crece mi comunidad?',       icon: 'mdi-account-group',           accent: '#10b981',
    stat1: { label: 'seguidores',  value: data.audience.kpis.value.totalFollowers.current.toLocaleString('es-ES') },
    stat2: { label: 'engagement',  value: `${data.audience.kpis.value.engagementRate.current.toFixed(1)}%` } },
  { id: 'picks',     title: 'Picks',     subtitle: '¿Qué recomendaciones rinden más?',   icon: 'mdi-silverware-fork-knife',   accent: '#3b82f6',
    stat1: { label: 'clicks',      value: data.picks.kpis.value.totalClicks.current.toLocaleString('es-ES') },
    stat2: { label: 'CTR',         value: `${data.picks.kpis.value.ctrPct.current.toFixed(1)}%` } },
  { id: 'network',   title: 'Red L2',    subtitle: '¿Cuánto generan mis invitados?',     icon: 'mdi-account-network-outline', accent: '#8b5cf6',
    stat1: { label: 'activos',     value: `${data.network.kpis.value.activeInvitees.current}/${data.network.kpis.value.totalInvitees.current}` },
    stat2: { label: 'ingresos',    value: `${data.network.kpis.value.total.current.toFixed(2)}€` } },
  { id: 'reviews',   title: 'Reseñas',   subtitle: '¿Cuánto y cómo reseño?',             icon: 'mdi-star-outline',            accent: '#f59e0b',
    stat1: { label: 'total',       value: String(data.reviews.kpis.value.total.current) },
    stat2: { label: 'verificadas', value: `${data.reviews.kpis.value.verifiedPct.current}%` } },
])
</script>

<template>
  <div class="flex flex-col gap-5 pb-10">
    <!-- Header sticky -->
    <div class="sticky top-0 z-10 px-6 lg:px-10 py-4 bg-white/95 backdrop-blur-md border-b border-[#eee]">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h1 class="text-[22px] font-black tracking-[-0.02em] text-[#1a1c1b] leading-tight">Informes</h1>
          <p class="text-[12px] text-[#666] mt-0.5">
            {{ rangeLabel }}
            <span v-if="compareEnabled"> · comparado con periodo anterior</span>
          </p>
        </div>
        <div class="flex items-center gap-2 flex-wrap lg:flex-nowrap lg:justify-end lg:ml-auto">
          <div class="flex items-center gap-1 bg-[#f5f5f5] rounded-xl p-1 overflow-x-auto max-w-full">
            <button v-for="p in presets" :key="p.id" @click="setPreset(p.id)" type="button"
              class="px-3 h-8 rounded-lg text-[12px] font-bold whitespace-nowrap transition-colors"
              :class="preset === p.id ? 'bg-white text-[#1a1c1b] shadow-sm' : 'text-[#888] hover:text-[#1a1c1b]'">
              {{ p.label }}
            </button>
          </div>

          <div class="relative">
            <button id="creator-informes-custom-btn" @click="toggleCustom" type="button"
              class="flex items-center gap-1.5 h-9 px-3 rounded-xl text-[12px] font-bold whitespace-nowrap transition-colors"
              :class="preset === 'custom'
                ? 'bg-[#1a1c1b] text-white'
                : 'bg-[#f5f5f5] text-[#888] hover:text-[#1a1c1b]'">
              <span class="mdi mdi-calendar-range text-[14px]"></span>
              {{ preset === 'custom' ? rangeLabel : 'Personalizado' }}
            </button>
            <div v-if="customOpen" id="creator-informes-custom-pop"
              class="absolute right-0 top-full mt-2 w-[280px] rounded-2xl bg-white border border-[#e5e5e5] shadow-[0_12px_32px_rgba(0,0,0,0.12)] p-4 z-20">
              <p class="text-[11px] font-bold text-[#666] uppercase tracking-wider mb-2">Rango personalizado</p>
              <div class="flex flex-col gap-2">
                <label class="flex flex-col gap-1">
                  <span class="text-[10px] font-semibold text-[#888]">Desde</span>
                  <input v-model="customStart" type="date"
                    class="h-9 rounded-lg border border-[#ddd] bg-[#fafafa] px-3 text-[12px] outline-none focus:border-[#1a1c1b]" />
                </label>
                <label class="flex flex-col gap-1">
                  <span class="text-[10px] font-semibold text-[#888]">Hasta</span>
                  <input v-model="customEnd" type="date" :max="toDateInput(new Date())"
                    class="h-9 rounded-lg border border-[#ddd] bg-[#fafafa] px-3 text-[12px] outline-none focus:border-[#1a1c1b]" />
                </label>
              </div>
              <div class="flex items-center gap-2 mt-3">
                <button @click="customOpen = false" type="button"
                  class="flex-1 h-8 rounded-lg text-[11px] font-bold text-[#888] hover:bg-[#f5f5f5] transition-colors">
                  Cancelar
                </button>
                <button @click="applyCustom" type="button"
                  class="flex-1 h-8 rounded-lg bg-[#1a1c1b] text-white text-[11px] font-bold hover:bg-[#333] transition-colors">
                  Aplicar
                </button>
              </div>
            </div>
          </div>

          <label class="flex items-center gap-2 h-9 pl-3 pr-1 rounded-xl bg-[#f5f5f5] cursor-pointer select-none"
            :title="compareEnabled ? 'Dejar de comparar con periodo anterior' : 'Comparar con periodo anterior'">
            <span class="text-[11px] font-bold whitespace-nowrap transition-colors"
              :class="compareEnabled ? 'text-[#1a1c1b]' : 'text-[#888]'">
              Comparar
            </span>
            <input v-model="compareEnabled" type="checkbox" class="sr-only" />
            <span class="relative inline-block w-9 h-5 rounded-full transition-colors shrink-0"
              :class="compareEnabled ? 'bg-[#1a1c1b]' : 'bg-[#d4d4d4]'">
              <span class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform"
                :class="compareEnabled ? 'translate-x-4' : 'translate-x-0'"></span>
            </span>
          </label>
        </div>
      </div>
    </div>

    <!-- Executive KPIs — click any card to jump into its drill-down -->
    <section class="px-6 lg:px-10">
      <div class="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <KpiCard label="Ingresos" :value="executiveKpis.earnings.value" :unit="executiveKpis.earnings.unit"
          :delta-pct="compareEnabled ? executiveKpis.earnings.delta : undefined"
          :icon="executiveKpis.earnings.icon" :accent="executiveKpis.earnings.accent"
          clickable :active="selectedKpi === 'earnings'" @click="selectKpi('earnings', 'earnings')" />
        <KpiCard label="Seguidores" :value="executiveKpis.followers.value"
          :delta-pct="compareEnabled ? executiveKpis.followers.delta : undefined"
          :icon="executiveKpis.followers.icon" :accent="executiveKpis.followers.accent"
          clickable :active="selectedKpi === 'followers'" @click="selectKpi('followers', 'audience')" />
        <KpiCard label="Clicks en picks" :value="executiveKpis.clicks.value"
          :delta-pct="compareEnabled ? executiveKpis.clicks.delta : undefined"
          :icon="executiveKpis.clicks.icon" :accent="executiveKpis.clicks.accent"
          clickable :active="selectedKpi === 'clicks'" @click="selectKpi('clicks', 'picks')" />
        <KpiCard label="Reservas generadas" :value="executiveKpis.bookings.value"
          :delta-pct="compareEnabled ? executiveKpis.bookings.delta : undefined"
          :icon="executiveKpis.bookings.icon" :accent="executiveKpis.bookings.accent"
          clickable :active="selectedKpi === 'bookings'" @click="selectKpi('bookings', 'picks')" />
        <KpiCard label="Red L2 (€)" :value="executiveKpis.networkEur.value" :unit="executiveKpis.networkEur.unit"
          :delta-pct="compareEnabled ? executiveKpis.networkEur.delta : undefined"
          :icon="executiveKpis.networkEur.icon" :accent="executiveKpis.networkEur.accent"
          clickable :active="selectedKpi === 'networkEur'" @click="selectKpi('networkEur', 'network')" />
        <KpiCard label="Rating medio" :value="executiveKpis.rating.value"
          :delta-pct="compareEnabled ? executiveKpis.rating.delta : undefined"
          :icon="executiveKpis.rating.icon" :accent="executiveKpis.rating.accent"
          clickable :active="selectedKpi === 'rating'" @click="selectKpi('rating', 'reviews')" />
      </div>
    </section>

    <!-- Drill-down accordions -->
    <section class="px-6 lg:px-10 flex flex-col gap-4">
      <article v-for="d in drills" :key="d.id" :id="`creator-drill-${d.id}`"
        class="rounded-2xl border border-[#e5e5e5] bg-white overflow-hidden scroll-mt-24">
        <button @click="toggleDrill(d.id)" type="button"
          class="w-full flex items-center gap-3 px-5 py-4 hover:bg-[#fafafa] transition-colors text-left">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 pointer-events-none"
            :style="{ backgroundColor: d.accent + '15' }">
            <span class="mdi text-[20px]" :class="d.icon" :style="{ color: d.accent }"></span>
          </div>
          <div class="flex-1 min-w-0 pointer-events-none">
            <h2 class="text-[15px] font-black text-[#1a1c1b] tracking-[-0.01em]">{{ d.title }}</h2>
            <p class="text-[11px] text-[#888]">{{ d.subtitle }}</p>
          </div>
          <div class="hidden md:flex items-center gap-3 mr-2 shrink-0 pointer-events-none">
            <div class="text-right">
              <p class="text-[16px] font-black text-[#1a1c1b] tabular-nums leading-none">{{ d.stat1.value }}</p>
              <p class="text-[9px] text-[#888]">{{ d.stat1.label }}</p>
            </div>
            <div class="w-px h-8 bg-[#eee]"></div>
            <div class="text-right">
              <p class="text-[16px] font-black text-[#1a1c1b] tabular-nums leading-none">{{ d.stat2.value }}</p>
              <p class="text-[9px] text-[#888]">{{ d.stat2.label }}</p>
            </div>
          </div>
          <span class="mdi text-[24px] text-[#bbb] transition-transform shrink-0 pointer-events-none"
            :class="[drillOpen === d.id ? 'mdi-chevron-up' : 'mdi-chevron-down']"></span>
        </button>
        <div v-if="drillOpen === d.id" class="border-t border-[#f0f0f0] p-5 bg-[#fafafa]">
          <CreatorEarningsReport v-if="d.id === 'earnings'" :compare="compareEnabled" :data="{
            kpis: data.earnings.kpis.value,
            series: data.earnings.series.value,
            prevSeries: data.earnings.prevSeries.value,
            breakdown: data.earnings.breakdown.value,
            topRestaurants: data.earnings.topRestaurants.value,
          }" />
          <CreatorAudienceReport v-else-if="d.id === 'audience'" :compare="compareEnabled" :data="{
            kpis: data.audience.kpis.value,
            followersSeries: data.audience.followersSeries.value,
            followersPrevSeries: data.audience.followersPrevSeries.value,
            sources: data.audience.sources.value,
            demographics: data.audience.demographics.value,
          }" />
          <CreatorPicksReport v-else-if="d.id === 'picks'" :compare="compareEnabled" :data="{
            kpis: data.picks.kpis.value,
            clicksSeries: data.picks.clicksSeries.value,
            clicksPrevSeries: data.picks.clicksPrevSeries.value,
            topPicks: data.picks.topPicks.value,
            funnel: data.picks.funnel.value,
          }" />
          <CreatorNetworkReport v-else-if="d.id === 'network'" :compare="compareEnabled" :data="{
            kpis: data.network.kpis.value,
            series: data.network.series.value,
            prevSeries: data.network.prevSeries.value,
            topInvitees: data.network.topInvitees.value,
            inviteStatus: data.network.inviteStatus.value,
          }" />
          <CreatorReviewsReport v-else-if="d.id === 'reviews'" :compare="compareEnabled" :data="{
            kpis: data.reviews.kpis.value,
            volumeSeries: data.reviews.volumeSeries.value,
            volumePrevSeries: data.reviews.volumePrevSeries.value,
            starsDistribution: data.reviews.starsDistribution.value,
            claimStatus: data.reviews.claimStatus.value,
          }" />
        </div>
      </article>
    </section>

    <!-- Nota metodológica -->
    <section class="px-6 lg:px-10">
      <div class="flex items-start gap-3 p-4 rounded-xl bg-[#fafafa] border border-[#eee]">
        <span class="mdi mdi-information-outline text-[#888] text-lg shrink-0 mt-0.5"></span>
        <div class="min-w-0">
          <p class="text-[11px] font-bold text-[#1a1c1b]">Cómo leer este informe</p>
          <p class="text-[11px] text-[#666] mt-0.5 leading-relaxed">
            Cada KPI se compara contra el mismo periodo inmediatamente anterior. Lo más accionable está en <strong>Picks</strong> (qué recomendaciones rinden) y <strong>Red L2</strong> (qué invitados están activos): duplica lo que funciona y pausa lo que no.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
