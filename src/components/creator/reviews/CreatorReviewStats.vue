<script setup lang="ts">
import { computed } from 'vue'

interface DistributionEntry {
  stars: number
  count: number
  label?: string
}

interface CategoryEntry {
  name: string
  score: number
  icon: string
  color: string
}

interface ReviewStats {
  overall: number
  total: number
  distribution: DistributionEntry[]
  categories: CategoryEntry[]
}

const props = defineProps<{
  stats: ReviewStats
}>()

const maxCount = computed(() => {
  const counts = (props.stats?.distribution || []).map(d => d.count)
  return counts.length ? Math.max(...counts, 1) : 1
})

const overallRounded = computed(() => Math.round((props.stats?.overall ?? 0) * 10) / 10)
const overallStars = computed(() => Math.round(props.stats?.overall ?? 0))

const barColor = (stars: number) => {
  if (stars >= 4) return '#22c55e'
  if (stars === 3) return '#f59e0b'
  return '#f97316'
}

const pctFor = (count: number): number => {
  const total = props.stats?.total || 0
  if (!total) return 0
  return Math.round((count / total) * 100)
}

const qualifier = computed(() => {
  const v = props.stats?.overall ?? 0
  if (v >= 4.8) return 'Excelente'
  if (v >= 4.5) return 'Muy bueno'
  if (v >= 4.0) return 'Bueno'
  if (v >= 3.0) return 'Normal'
  return 'Mejorable'
})
</script>

<template>
  <div class="rounded-2xl border border-[#e5e5e5] p-6 bg-gradient-to-br from-[#fff8f6] via-white to-[#fff7ed] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">

    <!-- Top row: overall + distribution -->
    <div class="flex flex-col lg:flex-row lg:items-center gap-6">

      <!-- Left: big rating -->
      <div class="flex items-center gap-5 shrink-0">
        <div class="relative">
          <div class="w-[110px] h-[110px] rounded-3xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] flex flex-col items-center justify-center border border-[#e5e5e5]">
            <p class="text-[44px] font-black text-[#1a1c1b] leading-none tabular-nums">{{ overallRounded }}</p>
            <div class="flex gap-0.5 mt-1.5">
              <span v-for="s in 5" :key="s" class="mdi text-[13px]"
                :class="s <= overallStars ? 'mdi-star text-yellow-500' : 'mdi-star-outline text-[#ddd]'"></span>
            </div>
          </div>
          <div class="absolute -top-2 -right-2 px-2 py-0.5 rounded-lg bg-gradient-primary text-white text-[9px] font-black uppercase tracking-wider shadow-pill-primary">
            {{ qualifier }}
          </div>
        </div>

        <div class="flex flex-col">
          <p class="text-[12px] font-semibold text-[#888] uppercase tracking-wider">Valoración general</p>
          <p class="text-[16px] font-bold text-[#1a1c1b] leading-tight mt-1">Basada en <span class="tabular-nums">{{ stats.total }}</span> opiniones</p>
          <p class="text-[12px] text-[#666] mt-1">De negocios con los que colaboraste</p>
        </div>
      </div>

      <!-- Right: distribution bars -->
      <div class="flex-1 flex flex-col gap-2 min-w-0">
        <div v-for="d in stats.distribution" :key="d.stars" class="flex items-center gap-3 group">
          <span class="flex items-center gap-1 text-[11px] font-bold w-[36px] shrink-0 text-[#555] tabular-nums">
            {{ d.stars }}<span class="mdi mdi-star text-yellow-500 text-[10px]"></span>
          </span>
          <div class="flex-1 h-2.5 bg-white/80 rounded-full overflow-hidden border border-[#eee]">
            <div class="h-full rounded-full transition-all duration-500" :style="{ width: `${(d.count / maxCount) * 100}%`, backgroundColor: barColor(d.stars) }"></div>
          </div>
          <span class="text-[11px] text-[#666] w-[56px] text-right tabular-nums font-semibold shrink-0">
            {{ d.count }} <span class="text-[#bbb]">({{ pctFor(d.count) }}%)</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div class="my-6 h-px bg-[#eee]"></div>

    <!-- Category scores grid 2x2 -->
    <div>
      <p class="text-[11px] font-bold text-[#888] uppercase tracking-wider mb-3">Puntuación por categoría</p>
      <div class="grid grid-cols-2 gap-3">
        <div v-for="cat in stats.categories" :key="cat.name"
          class="bg-white rounded-2xl border border-[#e5e5e5] p-4 flex items-center gap-3 hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-shadow">
          <div class="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center" :style="{ backgroundColor: cat.color + '14' }">
            <span class="mdi text-[22px]" :class="cat.icon" :style="{ color: cat.color }"></span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-[10px] font-bold text-[#888] uppercase tracking-wider">{{ cat.name }}</p>
            <div class="flex items-baseline gap-2 mt-0.5">
              <p class="text-[22px] font-black text-[#1a1c1b] leading-none tabular-nums">{{ cat.score.toFixed(1) }}</p>
              <div class="flex gap-0.5">
                <span v-for="s in 5" :key="s" class="mdi text-[10px]"
                  :class="s <= Math.round(cat.score) ? 'mdi-star text-yellow-500' : 'mdi-star-outline text-[#ddd]'"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
