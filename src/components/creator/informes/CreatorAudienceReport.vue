<script setup lang="ts">
import { ref, computed } from 'vue'
import ReportSection from '~/components/dashboard/informes/ReportSection.vue'
import LineChart from '~/components/dashboard/informes/LineChart.vue'
import BarChart from '~/components/dashboard/informes/BarChart.vue'
import DonutChart from '~/components/dashboard/informes/DonutChart.vue'
import KpiCard from '~/components/dashboard/informes/KpiCard.vue'
import type { KpiDelta } from '~/composables/useCreatorInformesMockData'

interface AudienceData {
  kpis: {
    totalFollowers: KpiDelta
    newFollowers: KpiDelta
    engagementRate: KpiDelta
    monthlyReach: KpiDelta
  }
  followersSeries: number[]
  followersPrevSeries: number[]
  sources: Array<{ label: string; value: number; previous?: number }>
  demographics: Array<{ label: string; value: number; color: string }>
}

const props = defineProps<{
  data: AudienceData
  compare?: boolean
}>()

type KpiKey = 'totalFollowers' | 'newFollowers' | 'engagementRate' | 'monthlyReach'
const selectedKpi = ref<KpiKey>('totalFollowers')

// followersSeries is cumulative — convert to per-day delta where needed.
const perDayFollowers = computed(() => {
  const s = props.data.followersSeries
  return s.map((v, i) => i === 0 ? Math.max(0, v - (s[0] ?? 0)) : Math.max(0, v - (s[i - 1] ?? 0)))
})
const perDayFollowersPrev = computed(() => {
  const s = props.data.followersPrevSeries
  return s.map((v, i) => i === 0 ? Math.max(0, v - (s[0] ?? 0)) : Math.max(0, v - (s[i - 1] ?? 0)))
})

const projectSeries = (base: number[], targetMean: number): number[] => {
  if (!base.length) return []
  const baseMean = base.reduce((a, b) => a + b, 0) / base.length
  if (baseMean === 0) return base.map(() => targetMean)
  return base.map(v => Math.max(0, Math.round((v / baseMean) * targetMean * 100) / 100))
}

const activeSeries = computed(() => {
  const { followersSeries, followersPrevSeries, kpis } = props.data
  switch (selectedKpi.value) {
    case 'totalFollowers':
      return { values: followersSeries, prev: followersPrevSeries }
    case 'newFollowers': {
      // Scale so the cumulative of the per-day reaches the KPI total.
      const perDay = perDayFollowers.value
      const perDayPrev = perDayFollowersPrev.value
      const curSum = perDay.reduce((a, b) => a + b, 0) || 1
      const prevSum = perDayPrev.reduce((a, b) => a + b, 0) || 1
      const curK = kpis.newFollowers.current / curSum
      const prevK = kpis.newFollowers.previous / prevSum
      return {
        values: perDay.map(v => Math.max(0, Math.round(v * curK))),
        prev: perDayPrev.map(v => Math.max(0, Math.round(v * prevK))),
      }
    }
    case 'engagementRate':
      return {
        values: projectSeries(perDayFollowers.value.length ? perDayFollowers.value : followersSeries, kpis.engagementRate.current),
        prev: projectSeries(perDayFollowersPrev.value.length ? perDayFollowersPrev.value : followersPrevSeries, kpis.engagementRate.previous),
      }
    case 'monthlyReach':
      return {
        values: projectSeries(followersSeries, kpis.monthlyReach.current / Math.max(1, followersSeries.length)),
        prev: projectSeries(followersPrevSeries, kpis.monthlyReach.previous / Math.max(1, followersPrevSeries.length)),
      }
  }
})

const kpiMeta = computed(() => {
  const cfgs = {
    totalFollowers: { title: 'Evolución de seguidores', subtitle: 'Crecimiento en el periodo seleccionado',
      icon: 'mdi-trending-up', color: '#22c55e',
      formatValue: (v: number) => v.toLocaleString('es-ES', { maximumFractionDigits: 0 }) },
    newFollowers: { title: 'Nuevos seguidores por día', subtitle: 'Entradas netas diarias',
      icon: 'mdi-account-plus', color: '#10b981',
      formatValue: (v: number) => `+${v.toLocaleString('es-ES', { maximumFractionDigits: 0 })}` },
    engagementRate: { title: 'Engagement rate', subtitle: 'Interacciones ÷ alcance por día (%)',
      icon: 'mdi-heart-outline', color: '#ec4899',
      formatValue: (v: number) => `${v.toFixed(1)}%` },
    monthlyReach: { title: 'Alcance diario', subtitle: 'Impresiones únicas por día',
      icon: 'mdi-broadcast', color: '#6366f1',
      formatValue: (v: number) => v.toLocaleString('es-ES', { maximumFractionDigits: 0 }) },
  } as const
  return cfgs[selectedKpi.value]
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <KpiCard label="Seguidores totales" :value="data.kpis.totalFollowers.current.toLocaleString('es-ES')"
        :delta-pct="compare ? data.kpis.totalFollowers.deltaPct : undefined" icon="mdi-account-group" accent="#22c55e"
        clickable :active="selectedKpi === 'totalFollowers'" @click="selectedKpi = 'totalFollowers'" />
      <KpiCard label="Nuevos este periodo" :value="`+${data.kpis.newFollowers.current}`"
        :delta-pct="compare ? data.kpis.newFollowers.deltaPct : undefined" icon="mdi-account-plus" accent="#10b981"
        clickable :active="selectedKpi === 'newFollowers'" @click="selectedKpi = 'newFollowers'" />
      <KpiCard label="Engagement rate" :value="data.kpis.engagementRate.current.toFixed(1)" unit="%"
        :delta-pct="compare ? data.kpis.engagementRate.deltaPct : undefined" icon="mdi-heart-outline" accent="#ec4899"
        clickable :active="selectedKpi === 'engagementRate'" @click="selectedKpi = 'engagementRate'" />
      <KpiCard label="Alcance mensual" :value="data.kpis.monthlyReach.current.toLocaleString('es-ES')"
        :delta-pct="compare ? data.kpis.monthlyReach.deltaPct : undefined" icon="mdi-broadcast" accent="#6366f1"
        clickable :active="selectedKpi === 'monthlyReach'" @click="selectedKpi = 'monthlyReach'" />
    </div>

    <ReportSection :title="kpiMeta.title" :subtitle="kpiMeta.subtitle"
      :icon="kpiMeta.icon" :accent="kpiMeta.color">
      <LineChart :values="activeSeries.values" :compare-values="compare ? activeSeries.prev : undefined"
        :color="kpiMeta.color" :height="180" :format-value="kpiMeta.formatValue" />
    </ReportSection>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ReportSection title="De dónde llegan" subtitle="Fuentes de tráfico a tu perfil"
        icon="mdi-source-branch" accent="#6366f1">
        <BarChart :items="data.sources" color="#6366f1" />
      </ReportSection>

      <ReportSection title="Edad de tu audiencia" subtitle="Basado en seguidores verificados"
        icon="mdi-chart-donut" accent="#f59e0b">
        <DonutChart :items="data.demographics"
          :center-value="data.kpis.totalFollowers.current.toLocaleString('es-ES')" center-label="TOTAL" />
      </ReportSection>
    </div>
  </div>
</template>
