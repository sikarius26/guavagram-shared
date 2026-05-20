<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  bars?: number[]
  labels?: string[]
}>(), {
  bars: () => [0, 0, 0, 0, 0, 0, 0],
  labels: () => ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
})

const total = computed(() => props.bars.reduce((a, b) => a + (b || 0), 0))

const maxBar = computed(() => Math.max(...props.bars, 1))

const barHeight = (v: number): string => {
  const pct = (v / maxBar.value) * 100
  return Math.max(4, pct) + '%'
}

const formatValue = (v: number): string => {
  if (v >= 1000) return (v / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return v.toLocaleString('es-ES')
}

const formatTotal = computed(() => formatValue(total.value))
</script>

<template>
  <div class="rounded-2xl bg-white border border-[#ddd] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
    <!-- Header -->
    <div class="flex items-start justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#fff5f4] to-[#ffe9e5] flex items-center justify-center">
          <span class="mdi mdi-chart-bar text-[#ff2d23] text-[18px]"></span>
        </div>
        <div>
          <h3 class="text-[16px] font-bold text-[#1a1c1b] tracking-[-0.01em]">Actividad semanal</h3>
          <p class="text-[12px] text-[#888]">Clicks + reservas por dia</p>
        </div>
      </div>
      <div class="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl">
        <span class="mdi mdi-pulse text-emerald-600 text-[14px]"></span>
        <span class="text-[12px] font-bold text-emerald-700 tabular-nums">{{ formatTotal }} total</span>
      </div>
    </div>

    <!-- Chart -->
    <div class="flex gap-3 h-[160px]">
      <div
        v-for="(bar, i) in props.bars"
        :key="i"
        class="flex-1 flex flex-col items-stretch gap-2 h-full"
      >
        <div class="flex-1 flex items-end">
          <div
            class="w-full rounded-t-xl relative group transition-all duration-700 ease-out"
            :style="{ height: barHeight(bar), background: 'linear-gradient(180deg, #22c55e 0%, #15803d 100%)' }"
          >
            <!-- Tooltip -->
            <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1a1c1b] text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {{ formatValue(bar) }}
            </div>
          </div>
        </div>
        <span class="text-[10px] font-bold text-[#888] uppercase tracking-wider text-center shrink-0">{{ props.labels[i] }}</span>
      </div>
    </div>
  </div>
</template>
