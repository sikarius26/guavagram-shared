<script setup lang="ts">
import { ref, computed } from 'vue'
import ReportSection from '~/components/dashboard/informes/ReportSection.vue'
import LineChart from '~/components/dashboard/informes/LineChart.vue'
import BarChart from '~/components/dashboard/informes/BarChart.vue'
import DonutChart from '~/components/dashboard/informes/DonutChart.vue'
import KpiCard from '~/components/dashboard/informes/KpiCard.vue'
import type { KpiDelta } from '~/composables/useCreatorInformesMockData'

interface EarningsData {
  kpis: {
    total: KpiDelta
    avgPerBooking: KpiDelta
    claimsPending: KpiDelta
    projection: KpiDelta
  }
  series: number[]
  prevSeries: number[]
  breakdown: Array<{ label: string; value: number; color: string }>
  topRestaurants: Array<{ label: string; value: number; previous?: number }>
}

const props = defineProps<{
  data: EarningsData
  compare?: boolean
}>()

type KpiKey = 'total' | 'avgPerBooking' | 'claimsPending' | 'projection'
const selectedKpi = ref<KpiKey>('total')

const formatEur = (v: number) => `${v.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}€`

// ---- Derived data for "€ medio por reserva" ----
const avgPerBookingSeries = computed(() => {
  const s = props.data.series
  if (!s.length) return []
  // Convert cumulative → per-day, then approximate avg by assuming a steady booking pace
  const perDay = s.map((v, i) => i === 0 ? v : v - s[i - 1]!)
  const avg = props.data.kpis.avgPerBooking.current || 1
  return perDay.map((v, i) => {
    const jitter = ((i % 5) - 2) * 0.07 * avg
    return Math.max(0, Math.round((avg + jitter + (v > 0 ? 0 : -avg * 0.2)) * 100) / 100)
  })
})
const avgPerBookingPrevSeries = computed(() => {
  const s = props.data.prevSeries
  if (!s.length) return []
  const avg = props.data.kpis.avgPerBooking.previous || 1
  return s.map((_, i) => {
    const jitter = ((i % 5) - 2) * 0.06 * avg
    return Math.max(0, Math.round((avg + jitter) * 100) / 100)
  })
})

const topRestaurantsAvg = computed(() => {
  // Derive per-restaurant avg from top restaurants by scaling around overall avg
  const overallAvg = props.data.kpis.avgPerBooking.current || 1
  const weights = [1.35, 1.15, 1.05, 0.95, 0.85, 0.75]
  return props.data.topRestaurants.map((r, i) => ({
    label: r.label,
    value: Math.round(overallAvg * (weights[i] ?? 1) * 100) / 100,
  }))
})

// ---- Derived data for "Claims pendientes" ----
const pendingClaims = computed(() => {
  const total = props.data.kpis.claimsPending.current
  const list = [
    { restaurant: 'Bodega Nova',  amount: 12.40, days: 5, reason: 'Validación de factura' },
    { restaurant: 'Casa Lola',    amount: 8.20,  days: 3, reason: 'Foto de reserva pendiente' },
    { restaurant: 'Kanoa Poke',   amount: 9.15,  days: 9, reason: 'Esperando confirmación' },
    { restaurant: 'Tigre Dorado', amount: 3.50,  days: 2, reason: 'Ticket en revisión' },
    { restaurant: 'Pepe Tapas',   amount: 2.62,  days: 1, reason: 'Validación de factura' },
  ]
  // Scale to hit the KPI total
  const sumMock = list.reduce((a, b) => a + b.amount, 0)
  const ratio = sumMock > 0 ? total / sumMock : 1
  return list.map(x => ({ ...x, amount: Math.round(x.amount * ratio * 100) / 100 }))
})

const claimsByStatus = computed(() => {
  const total = props.data.kpis.claimsPending.current
  return [
    { label: 'En validación',  value: Math.round(total * 0.55 * 100) / 100, color: '#f59e0b' },
    { label: 'Falta ticket',   value: Math.round(total * 0.28 * 100) / 100, color: '#ef4444' },
    { label: 'Espera factura', value: Math.round(total * 0.17 * 100) / 100, color: '#6366f1' },
  ]
})

// ---- Derived data for "Proyección mensual" ----
const projectionActualSeries = computed(() => {
  // Pad forward with empty so the chart shows the "gap" where forecast takes over
  const cur = props.data.series
  const daysTotal = 30
  if (cur.length >= daysTotal) return cur.slice(0, daysTotal)
  return cur
})

const projectionForecastSeries = computed(() => {
  const cur = props.data.series
  if (!cur.length) return []
  const last = cur[cur.length - 1] ?? 0
  const target = props.data.kpis.projection.current
  const daysTotal = 30
  const remaining = Math.max(0, daysTotal - cur.length)
  if (remaining === 0) return cur.map(() => last)
  // Replace historical with nulls (approximated via repeating last value so LineChart stays flat there),
  // then linearly interpolate to target over remaining days
  const out: number[] = []
  for (let i = 0; i < cur.length; i++) out.push(cur[i] ?? 0)
  const step = (target - last) / remaining
  for (let i = 1; i <= remaining; i++) out.push(Math.round((last + step * i) * 100) / 100)
  return out
})

const projectionDrivers = computed(() => {
  const avg = props.data.kpis.avgPerBooking.current || 1
  const toGo = Math.max(0, props.data.kpis.projection.current - props.data.kpis.total.current)
  const neededBookings = avg > 0 ? Math.ceil(toGo / avg) : 0
  return { toGo: Math.round(toGo * 100) / 100, neededBookings }
})

// ---- Header config per selected KPI ----
const selectedMeta = computed(() => {
  switch (selectedKpi.value) {
    case 'total':
      return {
        title: 'Ingresos del periodo',
        subtitle: `${formatEur(props.data.kpis.total.current)} generados — desglose por origen y restaurante`,
        accent: '#22c55e',
        icon: 'mdi-cash-multiple',
      }
    case 'avgPerBooking':
      return {
        title: '€ medio por reserva',
        subtitle: `Ticket promedio ${formatEur(props.data.kpis.avgPerBooking.current)} — evolución y comparativa`,
        accent: '#10b981',
        icon: 'mdi-calendar-check',
      }
    case 'claimsPending':
      return {
        title: 'Claims pendientes',
        subtitle: `${formatEur(props.data.kpis.claimsPending.current)} esperando validación`,
        accent: '#f59e0b',
        icon: 'mdi-clock-outline',
      }
    case 'projection':
      return {
        title: 'Proyección mensual',
        subtitle: `A ritmo actual cerrarás ${formatEur(props.data.kpis.projection.current)} este mes`,
        accent: '#6366f1',
        icon: 'mdi-trending-up',
      }
  }
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <KpiCard label="Ingresos del periodo" :value="data.kpis.total.current.toFixed(2)" unit="€"
        :delta-pct="compare ? data.kpis.total.deltaPct : undefined" icon="mdi-cash-multiple" accent="#22c55e"
        clickable :active="selectedKpi === 'total'" @click="selectedKpi = 'total'" />
      <KpiCard label="€ medio por reserva" :value="data.kpis.avgPerBooking.current.toFixed(2)" unit="€"
        :delta-pct="compare ? data.kpis.avgPerBooking.deltaPct : undefined" icon="mdi-calendar-check" accent="#10b981"
        clickable :active="selectedKpi === 'avgPerBooking'" @click="selectedKpi = 'avgPerBooking'" />
      <KpiCard label="Claims pendientes" :value="data.kpis.claimsPending.current.toFixed(2)" unit="€"
        :delta-pct="compare ? data.kpis.claimsPending.deltaPct : undefined" icon="mdi-clock-outline" accent="#f59e0b" invert-delta
        clickable :active="selectedKpi === 'claimsPending'" @click="selectedKpi = 'claimsPending'" />
      <KpiCard label="Proyección mensual" :value="data.kpis.projection.current.toFixed(0)" unit="€"
        :delta-pct="compare ? data.kpis.projection.deltaPct : undefined" icon="mdi-trending-up" accent="#6366f1"
        clickable :active="selectedKpi === 'projection'" @click="selectedKpi = 'projection'" />
    </div>

    <!-- Selected KPI header -->
    <div class="flex items-center gap-3 px-1">
      <span class="text-[10px] font-bold uppercase tracking-[0.15em]" :style="{ color: selectedMeta!.accent }">Informe</span>
      <div class="flex-1 h-px bg-[#ddd]"></div>
    </div>

    <!-- =========================== TOTAL =========================== -->
    <template v-if="selectedKpi === 'total'">
      <ReportSection title="Evolución de ingresos" subtitle="Acumulado diario"
        icon="mdi-chart-line-variant" accent="#22c55e">
        <LineChart :values="data.series" :compare-values="compare ? data.prevSeries : undefined"
          color="#22c55e" :height="260" :format-value="formatEur" />
      </ReportSection>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReportSection title="De dónde vienen tus ingresos" subtitle="Directo vs red vs claims"
          icon="mdi-chart-donut-variant" accent="#8b5cf6">
          <DonutChart :items="data.breakdown" :center-value="formatEur(data.kpis.total.current)" center-label="TOTAL" />
        </ReportSection>

        <ReportSection title="Restaurantes que más generan" subtitle="€ acumulados por sitio"
          icon="mdi-silverware-fork-knife" accent="#22c55e">
          <BarChart :items="data.topRestaurants" color="#22c55e" :format-value="formatEur" />
        </ReportSection>
      </div>
    </template>

    <!-- =========================== AVG PER BOOKING =========================== -->
    <template v-else-if="selectedKpi === 'avgPerBooking'">
      <ReportSection title="Ticket medio por día" subtitle="Evolución del € por reserva"
        icon="mdi-chart-line-variant" accent="#10b981">
        <LineChart :values="avgPerBookingSeries" :compare-values="compare ? avgPerBookingPrevSeries : undefined"
          color="#10b981" :height="260" :format-value="formatEur" />
      </ReportSection>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReportSection title="Ticket medio por restaurante" subtitle="€ por reserva según sitio"
          icon="mdi-silverware-fork-knife" accent="#10b981">
          <BarChart :items="topRestaurantsAvg" color="#10b981" :format-value="formatEur" />
        </ReportSection>

        <ReportSection title="Cómo subir tu ticket medio" subtitle="Palancas que funcionan"
          icon="mdi-lightbulb-on-outline" accent="#f59e0b">
          <ul class="flex flex-col gap-3 p-1">
            <li class="flex gap-3 items-start">
              <span class="mdi mdi-arrow-top-right text-[#10b981] text-[18px] shrink-0 mt-0.5"></span>
              <div>
                <p class="text-[13px] font-bold text-[#1a1c1b]">Recomienda platos de tiquet alto</p>
                <p class="text-[11px] text-[#666]">Menciona degustación / maridaje en tus picks.</p>
              </div>
            </li>
            <li class="flex gap-3 items-start">
              <span class="mdi mdi-account-multiple text-[#6366f1] text-[18px] shrink-0 mt-0.5"></span>
              <div>
                <p class="text-[13px] font-bold text-[#1a1c1b]">Apunta a reservas de 2+ personas</p>
                <p class="text-[11px] text-[#666]">Más comensales = más ticket por reserva.</p>
              </div>
            </li>
            <li class="flex gap-3 items-start">
              <span class="mdi mdi-star text-[#f59e0b] text-[18px] shrink-0 mt-0.5"></span>
              <div>
                <p class="text-[13px] font-bold text-[#1a1c1b]">Prioriza marcas premium</p>
                <p class="text-[11px] text-[#666]">Sube de nivel para acceder a tarifas desde 80€.</p>
              </div>
            </li>
          </ul>
        </ReportSection>
      </div>
    </template>

    <!-- =========================== CLAIMS PENDING =========================== -->
    <template v-else-if="selectedKpi === 'claimsPending'">
      <ReportSection title="Claims pendientes" :subtitle="`${pendingClaims.length} pagos en validación`"
        icon="mdi-clock-outline" accent="#f59e0b">
        <div class="flex flex-col divide-y divide-[#f0f0f0]">
          <div v-for="c in pendingClaims" :key="c.restaurant"
            class="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <div class="w-10 h-10 rounded-xl bg-[#fff7ed] flex items-center justify-center shrink-0">
              <span class="mdi mdi-clock-outline text-[#f59e0b] text-[18px]"></span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[13px] font-bold text-[#1a1c1b] truncate">{{ c.restaurant }}</p>
              <p class="text-[11px] text-[#666] truncate">{{ c.reason }}</p>
            </div>
            <div class="text-right shrink-0">
              <p class="text-[14px] font-black text-[#1a1c1b] tabular-nums">{{ formatEur(c.amount) }}</p>
              <p class="text-[10px]" :class="c.days > 7 ? 'text-[#ef4444] font-bold' : 'text-[#666]'">
                {{ c.days }} {{ c.days === 1 ? 'día' : 'días' }}
              </p>
            </div>
          </div>
        </div>
      </ReportSection>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReportSection title="Por qué están bloqueados" subtitle="Desglose por motivo"
          icon="mdi-chart-donut-variant" accent="#f59e0b">
          <DonutChart :items="claimsByStatus" :center-value="formatEur(data.kpis.claimsPending.current)" center-label="BLOQUEADO" />
        </ReportSection>

        <ReportSection title="Cómo desbloquearlos" subtitle="Pasos para cobrar antes"
          icon="mdi-lightbulb-on-outline" accent="#22c55e">
          <ul class="flex flex-col gap-3 p-1">
            <li class="flex gap-3 items-start">
              <span class="mdi mdi-camera text-[#f59e0b] text-[18px] shrink-0 mt-0.5"></span>
              <div>
                <p class="text-[13px] font-bold text-[#1a1c1b]">Sube el ticket o factura</p>
                <p class="text-[11px] text-[#666]">Los claims sin ticket se retrasan hasta 10 días.</p>
              </div>
            </li>
            <li class="flex gap-3 items-start">
              <span class="mdi mdi-email-check text-[#6366f1] text-[18px] shrink-0 mt-0.5"></span>
              <div>
                <p class="text-[13px] font-bold text-[#1a1c1b]">Confirma la reserva con el restaurante</p>
                <p class="text-[11px] text-[#666]">Un mensaje suele acelerar la validación.</p>
              </div>
            </li>
            <li class="flex gap-3 items-start">
              <span class="mdi mdi-alert-circle text-[#ef4444] text-[18px] shrink-0 mt-0.5"></span>
              <div>
                <p class="text-[13px] font-bold text-[#1a1c1b]">Escala los de +7 días</p>
                <p class="text-[11px] text-[#666]">Puedes pedir revisión manual desde el detalle.</p>
              </div>
            </li>
          </ul>
        </ReportSection>
      </div>
    </template>

    <!-- =========================== PROJECTION =========================== -->
    <template v-else-if="selectedKpi === 'projection'">
      <ReportSection title="Proyección de cierre de mes" subtitle="Acumulado real + forecast al día 30"
        icon="mdi-trending-up" accent="#6366f1">
        <LineChart :values="projectionForecastSeries" :compare-values="projectionActualSeries"
          color="#6366f1" :height="260" :format-value="formatEur" />
        <div class="flex items-center gap-4 text-[11px] text-[#666] mt-2 px-1">
          <span class="flex items-center gap-1.5"><span class="w-3 h-0.5 bg-[#6366f1]"></span>Real + proyección</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-px border-t border-dashed border-[#c7c7c7]"></span>Solo acumulado real</span>
        </div>
      </ReportSection>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReportSection title="Lo que te falta" subtitle="Para llegar a la proyección"
          icon="mdi-target" accent="#6366f1">
          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-xl bg-[#f5f5ff] border border-[#6366f1]/15 p-4">
              <p class="text-[10px] font-bold uppercase tracking-wider text-[#6366f1] mb-1">Faltan</p>
              <p class="text-[22px] font-black text-[#1a1c1b] tabular-nums leading-none">{{ formatEur(projectionDrivers.toGo) }}</p>
              <p class="text-[11px] text-[#666] mt-1">para cerrar el mes proyectado</p>
            </div>
            <div class="rounded-xl bg-[#ecfdf5] border border-[#10b981]/15 p-4">
              <p class="text-[10px] font-bold uppercase tracking-wider text-[#10b981] mb-1">Reservas necesarias</p>
              <p class="text-[22px] font-black text-[#1a1c1b] tabular-nums leading-none">{{ projectionDrivers.neededBookings }}</p>
              <p class="text-[11px] text-[#666] mt-1">a tu ticket medio actual</p>
            </div>
          </div>
        </ReportSection>

        <ReportSection title="Cómo acelerar" subtitle="Acciones con mayor impacto"
          icon="mdi-rocket-launch-outline" accent="#22c55e">
          <ul class="flex flex-col gap-3 p-1">
            <li class="flex gap-3 items-start">
              <span class="mdi mdi-map-marker text-[#22c55e] text-[18px] shrink-0 mt-0.5"></span>
              <div>
                <p class="text-[13px] font-bold text-[#1a1c1b]">Publica 2 picks nuevos esta semana</p>
                <p class="text-[11px] text-[#666]">Los picks frescos convierten ~2x más.</p>
              </div>
            </li>
            <li class="flex gap-3 items-start">
              <span class="mdi mdi-account-multiple-plus text-[#8b5cf6] text-[18px] shrink-0 mt-0.5"></span>
              <div>
                <p class="text-[13px] font-bold text-[#1a1c1b]">Invita a 1 creator afín</p>
                <p class="text-[11px] text-[#666]">Cada invitado activo suma a tu red L2.</p>
              </div>
            </li>
            <li class="flex gap-3 items-start">
              <span class="mdi mdi-instagram text-[#ec4899] text-[18px] shrink-0 mt-0.5"></span>
              <div>
                <p class="text-[13px] font-bold text-[#1a1c1b]">Comparte tu perfil en bio</p>
                <p class="text-[11px] text-[#666]">Fuente estable de clicks y reservas.</p>
              </div>
            </li>
          </ul>
        </ReportSection>
      </div>
    </template>
  </div>
</template>
