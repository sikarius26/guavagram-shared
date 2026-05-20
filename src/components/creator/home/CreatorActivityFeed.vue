<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CreatorHomeActivityItem } from '~/services/apis/models/creator-home-activity-item'

const props = defineProps<{
  activities: CreatorHomeActivityItem[]
}>()

type FilterKey = 'all' | 'follower' | 'earnings' | 'proposal'

const activeFilter = ref<FilterKey>('all')
const showAll = ref(false)

const filters: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Todo' },
  { key: 'follower', label: 'Seguidores' },
  { key: 'earnings', label: 'Ingresos' },
  { key: 'proposal', label: 'Propuestas' },
]

const filteredActivities = computed(() => {
  const list = props.activities ?? []
  if (activeFilter.value === 'all') return list
  if (activeFilter.value === 'follower') return list.filter(a => a.type === 'follower')
  if (activeFilter.value === 'earnings') return list.filter(a => a.type === 'booking' || a.type === 'code')
  if (activeFilter.value === 'proposal') return list.filter(a => a.type === 'proposal')
  return list
})

const visibleActivities = computed(() => {
  if (showAll.value) return filteredActivities.value
  return filteredActivities.value.slice(0, 8)
})

const hasMore = computed(() => filteredActivities.value.length > 8 && !showAll.value)

const iconColorBg = (color: string): string => {
  // Normalize common hex colors to Tailwind-like backgrounds
  // We use inline style for the badge background color/10
  return color
}
</script>

<template>
  <div class="rounded-2xl bg-white border border-[#ddd] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
    <!-- Header -->
    <div class="flex items-center justify-between mb-5 flex-wrap gap-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#fff1f0] to-[#ffe5e3] flex items-center justify-center">
          <span class="mdi mdi-lightning-bolt-outline text-primary text-[18px]"></span>
        </div>
        <div>
          <h3 class="text-[16px] font-bold text-[#1a1c1b] tracking-[-0.01em]">Actividad reciente</h3>
          <p class="text-[12px] text-[#888]">Ultimos eventos de tu perfil</p>
        </div>
      </div>

      <!-- Filter pills -->
      <div class="flex items-center gap-1.5 flex-wrap">
        <button
          v-for="f in filters"
          :key="f.key"
          type="button"
          @click="activeFilter = f.key"
          class="px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border"
          :class="activeFilter === f.key
            ? 'bg-[#1a1c1b] text-white border-[#1a1c1b] shadow-sm'
            : 'bg-white text-[#666] border-[#e5e5e5] hover:border-[#ccc] hover:text-[#1a1c1b]'"
        >
          {{ f.label }}
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="visibleActivities.length === 0"
      class="flex flex-col items-center justify-center py-10 text-center"
    >
      <div class="w-12 h-12 rounded-2xl bg-[#fafafa] flex items-center justify-center mb-3">
        <span class="mdi mdi-inbox-outline text-[#bbb] text-[22px]"></span>
      </div>
      <p class="text-[13px] font-semibold text-[#666]">Sin actividad</p>
      <p class="text-[11px] text-[#888] mt-1">No hay eventos para este filtro.</p>
    </div>

    <!-- Timeline list -->
    <ul v-else class="relative flex flex-col">
      <!-- vertical connector -->
      <span
        aria-hidden="true"
        class="absolute left-[19px] top-3 bottom-3 w-px bg-gradient-to-b from-[#e5e5e5] via-[#e5e5e5] to-transparent"
      ></span>

      <li
        v-for="(item, idx) in visibleActivities"
        :key="idx"
        class="relative flex items-start gap-3 py-2.5"
      >
        <!-- Icon -->
        <div
          class="relative z-10 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ring-4 ring-white"
          :style="{ backgroundColor: iconColorBg(item.color) + '1a' }"
        >
          <span
            class="mdi text-[18px] leading-none"
            :class="item.icon"
            :style="{ color: item.color }"
          ></span>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0 pt-1">
          <p class="text-[13px] text-[#1a1c1b] leading-snug">{{ item.text }}</p>
          <p class="text-[11px] text-[#888] mt-0.5">{{ item.time }}</p>
        </div>
      </li>
    </ul>

    <!-- Show more -->
    <button
      v-if="hasMore"
      type="button"
      @click="showAll = true"
      class="w-full mt-4 py-2.5 rounded-xl text-[12px] font-bold text-[#1a1c1b] bg-[#fafafa] hover:bg-[#f0f0f0] transition-colors"
    >
      Ver mas ({{ filteredActivities.length - 8 }})
    </button>
  </div>
</template>
