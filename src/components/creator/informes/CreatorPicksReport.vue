<script setup lang="ts">
import { ref, computed } from 'vue'
import ReportSection from '~/components/dashboard/informes/ReportSection.vue'
import LineChart from '~/components/dashboard/informes/LineChart.vue'
import BarChart from '~/components/dashboard/informes/BarChart.vue'
import KpiCard from '~/components/dashboard/informes/KpiCard.vue'
import type { KpiDelta } from '~/composables/useCreatorInformesMockData'

interface PicksData {
  kpis: {
    totalClicks: KpiDelta
    ctrPct: KpiDelta
    bookings: KpiDelta
    bookRatePct: KpiDelta
    impressions: KpiDelta
  }
  clicksSeries: number[]
  clicksPrevSeries: number[]
  topPicks: Array<{ label: string; value: number; previous?: number }>
  funnel: Array<{ label: string; value: number; color: string }>
}

const props = defineProps<{
  data: PicksData
  compare?: boolean
}>()

type KpiKey = 'totalClicks' | 'ctrPct' | 'bookings' | 'bookRatePct'
const selectedKpi = ref<KpiKey>('totalClicks')

// Project a base per-day series onto a different mean while preserving its
// daily shape. Keeps the rhythm of the clicks series so CTR / conversion
// series don't look pasted in.
const projectSeries = (base: number[], targetMean: number): number[] => {
  if (!base.length) return []
  const baseMean = base.reduce((a, b) => a + b, 0) / base.length
  if (baseMean === 0) return base.map(() => targetMean)
  return base.map(v => Math.max(0, Math.round((v / baseMean) * targetMean * 100) / 100))
}

const activeSeries = computed(() => {
  const { clicksSeries, clicksPrevSeries, kpis } = props.data
  const bookingRate = kpis.totalClicks.current > 0 ? kpis.bookings.current / kpis.totalClicks.current : 0
  const prevBookingRate = kpis.totalClicks.previous > 0 ? kpis.bookings.previous / kpis.totalClicks.previous : 0
  switch (selectedKpi.value) {
    case 'totalClicks':
      return { values: clicksSeries, prev: clicksPrevSeries }
    case 'ctrPct':
      return {
        values: projectSeries(clicksSeries, kpis.ctrPct.current),
        prev: projectSeries(clicksPrevSeries, kpis.ctrPct.previous),
      }
    case 'bookings':
      return {
        values: clicksSeries.map(v => Math.max(0, Math.round(v * bookingRate))),
        prev: clicksPrevSeries.map(v => Math.max(0, Math.round(v * prevBookingRate))),
      }
    case 'bookRatePct':
      return {
        values: projectSeries(clicksSeries, kpis.bookRatePct.current),
        prev: projectSeries(clicksPrevSeries, kpis.bookRatePct.previous),
      }
  }
})

const kpiMeta = computed(() => {
  const cfgs = {
    totalClicks: { title: 'Clicks en tus picks', subtitle: 'Tendencia de clicks por día',
      icon: 'mdi-cursor-default-click-outline', color: '#3b82f6',
      formatValue: (v: number) => v.toLocaleString('es-ES', { maximumFractionDigits: 0 }) },
    ctrPct: { title: 'CTR', subtitle: 'Click-through rate por día (%)',
      icon: 'mdi-gesture-tap', color: '#6366f1',
      formatValue: (v: number) => `${v.toFixed(1)}%` },
    bookings: { title: 'Reservas generadas', subtitle: 'Reservas por día',
      icon: 'mdi-calendar-check-outline', color: '#22c55e',
      formatValue: (v: number) => v.toLocaleString('es-ES', { maximumFractionDigits: 0 }) },
    bookRatePct: { title: 'Click → reserva', subtitle: 'Conversión de clic a reserva por día (%)',
      icon: 'mdi-progress-check', color: '#f59e0b',
      formatValue: (v: number) => `${v.toFixed(1)}%` },
  } as const
  return cfgs[selectedKpi.value]
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <KpiCard label="Clicks totales" :value="data.kpis.totalClicks.current.toLocaleString('es-ES')"
        :delta-pct="compare ? data.kpis.totalClicks.deltaPct : undefined" icon="mdi-cursor-default-click-outline" accent="#3b82f6"
        clickable :active="selectedKpi === 'totalClicks'" @click="selectedKpi = 'totalClicks'" />
      <KpiCard label="CTR" :value="data.kpis.ctrPct.current.toFixed(1)" unit="%"
        :delta-pct="compare ? data.kpis.ctrPct.deltaPct : undefined" icon="mdi-gesture-tap" accent="#6366f1"
        clickable :active="selectedKpi === 'ctrPct'" @click="selectedKpi = 'ctrPct'" />
      <KpiCard label="Reservas generadas" :value="data.kpis.bookings.current"
        :delta-pct="compare ? data.kpis.bookings.deltaPct : undefined" icon="mdi-calendar-check-outline" accent="#22c55e"
        clickable :active="selectedKpi === 'bookings'" @click="selectedKpi = 'bookings'" />
      <KpiCard label="Click → reserva" :value="data.kpis.bookRatePct.current.toFixed(1)" unit="%"
        :delta-pct="compare ? data.kpis.bookRatePct.deltaPct : undefined" icon="mdi-progress-check" accent="#f59e0b"
        clickable :active="selectedKpi === 'bookRatePct'" @click="selectedKpi = 'bookRatePct'" />
    </div>

    <ReportSection :title="kpiMeta.title" :subtitle="kpiMeta.subtitle"
      :icon="kpiMeta.icon" :accent="kpiMeta.color">
      <LineChart :values="activeSeries.values" :compare-values="compare ? activeSeries.prev : undefined"
        :color="kpiMeta.color" :height="180" :format-value="kpiMeta.formatValue" />
    </ReportSection>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ReportSection title="Tus picks que más rinden" subtitle="Clicks acumulados por restaurante"
        icon="mdi-trophy-outline" accent="#f59e0b">
        <BarChart :items="data.topPicks" color="#f59e0b" />
      </ReportSection>

      <ReportSection title="Embudo de conversión" subtitle="De impresión a reserva"
        icon="mdi-filter-variant" accent="#22c55e">
        <BarChart :items="data.funnel" color="#22c55e" />
      </ReportSection>
    </div>
  </div>
</template>
