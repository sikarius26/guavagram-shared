<script setup lang="ts">
import { ref, computed } from 'vue'
import ReportSection from '~/components/dashboard/informes/ReportSection.vue'
import LineChart from '~/components/dashboard/informes/LineChart.vue'
import BarChart from '~/components/dashboard/informes/BarChart.vue'
import DonutChart from '~/components/dashboard/informes/DonutChart.vue'
import KpiCard from '~/components/dashboard/informes/KpiCard.vue'
import type { KpiDelta } from '~/composables/useCreatorInformesMockData'

interface ReviewsData {
  kpis: {
    total: KpiDelta
    verifiedPct: KpiDelta
    avgRating: KpiDelta
    pendingClaims: KpiDelta
  }
  volumeSeries: number[]
  volumePrevSeries: number[]
  starsDistribution: Array<{ label: string; value: number; color: string }>
  claimStatus: Array<{ label: string; value: number; color: string }>
}

const props = defineProps<{
  data: ReviewsData
  compare?: boolean
}>()

type KpiKey = 'total' | 'verifiedPct' | 'avgRating' | 'pendingClaims'
const selectedKpi = ref<KpiKey>('total')

// volumeSeries is cumulative — derive per-day for non-cumulative ratios.
const perDay = computed(() => {
  const s = props.data.volumeSeries
  return s.map((v, i) => i === 0 ? v : Math.max(0, v - (s[i - 1] ?? 0)))
})
const perDayPrev = computed(() => {
  const s = props.data.volumePrevSeries
  return s.map((v, i) => i === 0 ? v : Math.max(0, v - (s[i - 1] ?? 0)))
})

const projectSeries = (base: number[], targetMean: number): number[] => {
  if (!base.length) return []
  const baseMean = base.reduce((a, b) => a + b, 0) / base.length
  if (baseMean === 0) return base.map(() => targetMean)
  return base.map(v => Math.max(0, Math.round((v / baseMean) * targetMean * 100) / 100))
}

const rampTo = (target: number, n: number, start = 0): number[] => {
  if (n === 0) return []
  const step = (target - start) / Math.max(1, n - 1)
  return Array.from({ length: n }, (_, i) => Math.max(0, Math.round(start + step * i)))
}

const activeSeries = computed(() => {
  const { volumeSeries, volumePrevSeries, kpis } = props.data
  switch (selectedKpi.value) {
    case 'total':
      return { values: volumeSeries, prev: volumePrevSeries }
    case 'verifiedPct':
      // Hover around the % with the daily rhythm from volume
      return {
        values: projectSeries(perDay.value, kpis.verifiedPct.current),
        prev: projectSeries(perDayPrev.value, kpis.verifiedPct.previous),
      }
    case 'avgRating':
      return {
        values: projectSeries(perDay.value.length ? perDay.value : volumeSeries, kpis.avgRating.current),
        prev: projectSeries(perDayPrev.value.length ? perDayPrev.value : volumePrevSeries, kpis.avgRating.previous),
      }
    case 'pendingClaims':
      return {
        values: rampTo(kpis.pendingClaims.current, volumeSeries.length),
        prev: rampTo(kpis.pendingClaims.previous, volumePrevSeries.length),
      }
  }
})

const kpiMeta = computed(() => {
  const cfgs = {
    total: { title: 'Reseñas publicadas', subtitle: 'Acumulado diario en el periodo',
      icon: 'mdi-chart-timeline-variant', color: '#f59e0b',
      formatValue: (v: number) => v.toLocaleString('es-ES', { maximumFractionDigits: 0 }) },
    verifiedPct: { title: '% reseñas verificadas', subtitle: 'Reseñas con ticket y foto validados',
      icon: 'mdi-shield-check-outline', color: '#22c55e',
      formatValue: (v: number) => `${v.toFixed(0)}%` },
    avgRating: { title: 'Rating medio que das', subtitle: 'Media de estrellas por día',
      icon: 'mdi-star-outline', color: '#f59e0b',
      formatValue: (v: number) => v.toFixed(1) },
    pendingClaims: { title: 'Claims pendientes', subtitle: 'Reseñas esperando validación',
      icon: 'mdi-clock-outline', color: '#6366f1',
      formatValue: (v: number) => v.toLocaleString('es-ES', { maximumFractionDigits: 0 }) },
  } as const
  return cfgs[selectedKpi.value]
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <KpiCard label="Reseñas totales" :value="data.kpis.total.current"
        :delta-pct="compare ? data.kpis.total.deltaPct : undefined" icon="mdi-comment-multiple-outline" accent="#f59e0b"
        clickable :active="selectedKpi === 'total'" @click="selectedKpi = 'total'" />
      <KpiCard label="% verificadas" :value="data.kpis.verifiedPct.current" unit="%"
        :delta-pct="compare ? data.kpis.verifiedPct.deltaPct : undefined" icon="mdi-shield-check-outline" accent="#22c55e"
        clickable :active="selectedKpi === 'verifiedPct'" @click="selectedKpi = 'verifiedPct'" />
      <KpiCard label="Rating medio dado" :value="data.kpis.avgRating.current.toFixed(1)"
        :delta-pct="compare ? data.kpis.avgRating.deltaPct : undefined" icon="mdi-star-outline" accent="#f59e0b"
        clickable :active="selectedKpi === 'avgRating'" @click="selectedKpi = 'avgRating'" />
      <KpiCard label="Claims pendientes" :value="data.kpis.pendingClaims.current"
        :delta-pct="compare ? data.kpis.pendingClaims.deltaPct : undefined" icon="mdi-clock-outline" accent="#6366f1" invert-delta
        clickable :active="selectedKpi === 'pendingClaims'" @click="selectedKpi = 'pendingClaims'" />
    </div>

    <ReportSection :title="kpiMeta.title" :subtitle="kpiMeta.subtitle"
      :icon="kpiMeta.icon" :accent="kpiMeta.color">
      <LineChart :values="activeSeries.values" :compare-values="compare ? activeSeries.prev : undefined"
        :color="kpiMeta.color" :height="180" :format-value="kpiMeta.formatValue" />
    </ReportSection>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ReportSection title="Rating que das" subtitle="Distribución de estrellas"
        icon="mdi-star-settings-outline" accent="#f59e0b">
        <DonutChart :items="data.starsDistribution" :center-value="data.kpis.avgRating.current.toFixed(1)" center-label="MEDIA" />
      </ReportSection>

      <ReportSection title="Estado de validación" subtitle="Reseñas validadas por los restaurantes"
        icon="mdi-shield-check-outline" accent="#22c55e">
        <BarChart :items="data.claimStatus" color="#22c55e" />
      </ReportSection>
    </div>
  </div>
</template>
