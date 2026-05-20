<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  currentLevel: number
  progressPct: number
  nextLevelName: string
  requirementsMet?: string[]
  requirementsRemaining?: string[]
  nextLevelRewards?: string[]
}>(), {
  requirementsMet: () => [],
  requirementsRemaining: () => [],
  nextLevelRewards: () => [],
})

const clampedPct = computed(() => Math.min(100, Math.max(0, props.progressPct || 0)))
</script>

<template>
  <div class="rounded-2xl border border-[#e5e5e5] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
    <!-- Header -->
    <div class="flex items-center justify-between mb-3">
      <div>
        <p class="text-[10px] font-bold text-[#888] uppercase tracking-[0.15em]">Progreso de nivel</p>
        <h4 class="text-[14px] font-bold text-[#1a1c1b] tracking-[-0.01em] mt-0.5">
          Siguiente: <span class="text-primary">{{ nextLevelName }}</span>
        </h4>
      </div>
      <span class="text-[18px] font-black tracking-[-0.03em] text-[#1a1c1b] tabular-nums">
        {{ clampedPct }}%
      </span>
    </div>

    <!-- Progress bar -->
    <div class="relative w-full h-2.5 rounded-full bg-[#f5f5f5] overflow-hidden mb-4">
      <div
        class="absolute top-0 left-0 h-full rounded-full bg-gradient-primary transition-all duration-500"
        :style="{ width: clampedPct + '%' }"
      ></div>
    </div>

    <!-- Unlocks at next level (money hook) -->
    <div v-if="nextLevelRewards.length" class="rounded-xl bg-gradient-to-br from-[#fff5f4] to-amber-50/50 border border-[#ff2d23]/20 p-3 mb-3">
      <div class="flex items-center gap-1.5 mb-2">
        <span class="mdi mdi-lock-open-variant-outline text-[#ff2d23] text-[13px]"></span>
        <p class="text-[10px] font-black text-[#ff2d23] uppercase tracking-[0.12em]">Desbloqueas en {{ nextLevelName }}</p>
      </div>
      <ul class="flex flex-col gap-1">
        <li v-for="(r, i) in nextLevelRewards" :key="'reward-' + i" class="flex items-start gap-2">
          <span class="mdi mdi-cash text-[#ff2d23] text-[13px] leading-none mt-0.5 shrink-0"></span>
          <span class="text-[12px] text-[#1a1c1b] font-semibold leading-snug">{{ r }}</span>
        </li>
      </ul>
    </div>

    <!-- Requirements met -->
    <div v-if="requirementsMet.length" class="mb-3">
      <p class="text-[10px] font-bold text-[#666] uppercase tracking-[0.12em] mb-1.5">Cumplido</p>
      <ul class="flex flex-col gap-1">
        <li v-for="(r, i) in requirementsMet" :key="'met-' + i" class="flex items-start gap-2">
          <span class="mdi mdi-check-circle text-emerald-500 text-[14px] leading-none mt-0.5 shrink-0"></span>
          <span class="text-[12px] text-[#1a1c1b] leading-snug">{{ r }}</span>
        </li>
      </ul>
    </div>

    <!-- Requirements remaining -->
    <div v-if="requirementsRemaining.length">
      <p class="text-[10px] font-bold text-[#666] uppercase tracking-[0.12em] mb-1.5">Te falta</p>
      <ul class="flex flex-col gap-1">
        <li v-for="(r, i) in requirementsRemaining" :key="'rem-' + i" class="flex items-start gap-2">
          <span class="mdi mdi-circle-outline text-[#ccc] text-[14px] leading-none mt-0.5 shrink-0"></span>
          <span class="text-[12px] text-[#666] leading-snug">{{ r }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
