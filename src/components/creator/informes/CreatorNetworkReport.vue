<script setup lang="ts">
import { ref, computed } from 'vue'
import ReportSection from '~/components/dashboard/informes/ReportSection.vue'
import LineChart from '~/components/dashboard/informes/LineChart.vue'
import BarChart from '~/components/dashboard/informes/BarChart.vue'
import KpiCard from '~/components/dashboard/informes/KpiCard.vue'
import type { KpiDelta } from '~/composables/useCreatorInformesMockData'

interface NetworkData {
  kpis: {
    total: KpiDelta
    activeInvitees: KpiDelta
    totalInvitees: KpiDelta
    conversionPct: KpiDelta
  }
  series: number[]
  prevSeries: number[]
  topInvitees: Array<{ label: string; value: number; previous?: number }>
  inviteStatus: Array<{ label: string; value: number; color: string }>
}

const props = defineProps<{
  data: NetworkData
  compare?: boolean
}>()

type KpiKey = 'total' | 'activeInvitees' | 'totalInvitees' | 'conversionPct'
const selectedKpi = ref<KpiKey>('total')

const formatEur = (v: number) => `${v.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}€`

// series is cumulative €; derive per-day delta for non-cumulative metrics.
const perDay = computed(() => {
  const s = props.data.series
  return s.map((v, i) => i === 0 ? v : Math.max(0, v - (s[i - 1] ?? 0)))
})
const perDayPrev = computed(() => {
  const s = props.data.prevSeries
  return s.map((v, i) => i === 0 ? v : Math.max(0, v - (s[i - 1] ?? 0)))
})

// Monotonic ramp from start to target over N days — for "X invitees" which only grow.
const rampTo = (target: number, n: number, start = 0): number[] => {
  if (n === 0) return []
  const step = (target - start) / Math.max(1, n - 1)
  return Array.from({ length: n }, (_, i) => Math.max(0, Math.round(start + step * i)))
}

const projectSeries = (base: number[], targetMean: number): number[] => {
  if (!base.length) return []
  const baseMean = base.reduce((a, b) => a + b, 0) / base.length
  if (baseMean === 0) return base.map(() => targetMean)
  return base.map(v => Math.max(0, Math.round((v / baseMean) * targetMean * 100) / 100))
}

const activeSeries = computed(() => {
  const { series, prevSeries, kpis } = props.data
  switch (selectedKpi.value) {
    case 'total':
      return { values: series, prev: prevSeries }
    case 'activeInvitees': {
      const startCur = Math.max(0, kpis.activeInvitees.current - Math.ceil(kpis.activeInvitees.current * 0.3))
      const startPrev = Math.max(0, kpis.activeInvitees.previous - Math.ceil(kpis.activeInvitees.previous * 0.3))
      return {
        values: rampTo(kpis.activeInvitees.current, series.length, startCur),
        prev: rampTo(kpis.activeInvitees.previous, prevSeries.length, startPrev),
      }
    }
    case 'totalInvitees': {
      const startCur = Math.max(0, kpis.totalInvitees.current - Math.ceil(kpis.totalInvitees.current * 0.4))
      const startPrev = Math.max(0, kpis.totalInvitees.previous - Math.ceil(kpis.totalInvitees.previous * 0.4))
      return {
        values: rampTo(kpis.totalInvitees.current, series.length, startCur),
        prev: rampTo(kpis.totalInvitees.previous, prevSeries.length, startPrev),
      }
    }
    case 'conversionPct':
      return {
        values: projectSeries(perDay.value, kpis.conversionPct.current),
        prev: projectSeries(perDayPrev.value, kpis.conversionPct.previous),
      }
  }
})

const kpiMeta = computed(() => {
  const cfgs = {
    total: { title: 'Ingresos por tu red (L2)', subtitle: 'Lo que generan los creators que has invitado',
      icon: 'mdi-account-network-outline', color: '#8b5cf6',
      formatValue: formatEur },
    activeInvitees: { title: 'Creators activos', subtitle: 'Invitados generando ingresos',
      icon: 'mdi-account-multiple-check', color: '#22c55e',
      formatValue: (v: number) => v.toLocaleString('es-ES', { maximumFractionDigits: 0 }) },
    totalInvitees: { title: 'Invitados totales', subtitle: 'Evolución de tu red',
      icon: 'mdi-account-multiple-plus', color: '#10b981',
      formatValue: (v: number) => v.toLocaleString('es-ES', { maximumFractionDigits: 0 }) },
    conversionPct: { title: 'Conversión de invites', subtitle: 'Activos ÷ total invitados (%)',
      icon: 'mdi-percent-outline', color: '#6366f1',
      formatValue: (v: number) => `${v.toFixed(1)}%` },
  } as const
  return cfgs[selectedKpi.value]
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <KpiCard label="Ingresos por red L2" :value="data.kpis.total.current.toFixed(2)" unit="€"
        :delta-pct="compare ? data.kpis.total.deltaPct : undefined" icon="mdi-account-network" accent="#8b5cf6"
        clickable :active="selectedKpi === 'total'" @click="selectedKpi = 'total'" />
      <KpiCard label="Creators activos" :value="data.kpis.activeInvitees.current"
        :delta-pct="compare ? data.kpis.activeInvitees.deltaPct : undefined" icon="mdi-account-multiple-check" accent="#22c55e"
        clickable :active="selectedKpi === 'activeInvitees'" @click="selectedKpi = 'activeInvitees'" />
      <KpiCard label="Total invitados" :value="data.kpis.totalInvitees.current"
        :delta-pct="compare ? data.kpis.totalInvitees.deltaPct : undefined" icon="mdi-account-multiple-plus" accent="#10b981"
        clickable :active="selectedKpi === 'totalInvitees'" @click="selectedKpi = 'totalInvitees'" />
      <KpiCard label="% conversión invite" :value="data.kpis.conversionPct.current.toFixed(1)" unit="%"
        :delta-pct="compare ? data.kpis.conversionPct.deltaPct : undefined" icon="mdi-percent-outline" accent="#6366f1"
        clickable :active="selectedKpi === 'conversionPct'" @click="selectedKpi = 'conversionPct'" />
    </div>

    <ReportSection :title="kpiMeta.title" :subtitle="kpiMeta.subtitle"
      :icon="kpiMeta.icon" :accent="kpiMeta.color">
      <LineChart :values="activeSeries.values" :compare-values="compare ? activeSeries.prev : undefined"
        :color="kpiMeta.color" :height="180" :format-value="kpiMeta.formatValue" />
    </ReportSection>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ReportSection title="Tus creators top" subtitle="Quién te está generando más"
        icon="mdi-medal-outline" accent="#f59e0b">
        <BarChart :items="data.topInvitees" color="#8b5cf6" :format-value="formatEur" />
      </ReportSection>

      <ReportSection title="Estado de tus invitados" subtitle="De invite a creator activo"
        icon="mdi-account-switch-outline" accent="#22c55e">
        <BarChart :items="data.inviteStatus" color="#22c55e" />
      </ReportSection>
    </div>
  </div>
</template>
