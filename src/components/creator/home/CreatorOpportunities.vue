<script setup lang="ts">
import { computed } from 'vue'
import { useCreatorOpportunitiesData } from '~/composables/data/useCreatorOpportunitiesData'

const emit = defineEmits<{
  (e: 'navigate', tab: string): void
}>()

const { proposals: pendingProposals, nearby: nearbyOffers } = useCreatorOpportunitiesData()

const totalPotential = computed(() => pendingProposals.value.reduce((s, p) => s + p.budgetEur, 0))
const avgFee = computed(() => Math.round(nearbyOffers.value.reduce((s, o) => s + o.feePerPostEur, 0) / nearbyOffers.value.length))
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

    <!-- ======== PROPUESTAS ESPERÁNDOTE ======== -->
    <div class="group relative rounded-3xl overflow-hidden border border-[#ececec] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03),0_8px_24px_-12px_rgba(0,0,0,0.08)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.04),0_16px_32px_-16px_rgba(0,0,0,0.12)] transition-shadow">
      <!-- Warm header w/ floating stat -->
      <div class="relative p-5 bg-gradient-to-br from-[#fff8f6] via-white to-[#f0f4ff] border-b border-[#eee] overflow-hidden">
        <div class="pointer-events-none absolute -top-10 -right-8 size-40 rounded-full bg-[#ff2d23]/[0.08] blur-2xl"></div>
        <div class="pointer-events-none absolute -bottom-12 -left-4 size-32 rounded-full bg-[#6366f1]/[0.06] blur-2xl"></div>
        <div class="relative flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="size-11 rounded-2xl bg-gradient-to-br from-[#ff2d23] to-[#ff6b4a] flex items-center justify-center shadow-[0_6px_16px_rgba(255,45,35,0.3)]">
              <span class="mdi mdi-email-fast-outline text-white text-[22px]"></span>
            </div>
            <div>
              <h3 class="text-[15px] font-black text-[#1a1c1b] tracking-tight">Propuestas esperándote</h3>
              <p class="text-[11px] text-[#666] mt-0.5">{{ pendingProposals.length }} marcas te han escrito</p>
            </div>
          </div>
          <div class="shrink-0 flex flex-col items-end">
            <p class="text-[9px] font-bold text-[#888] uppercase tracking-[0.15em]">Potencial</p>
            <p class="text-[22px] font-black text-[#1a1c1b] tabular-nums leading-none mt-0.5">{{ totalPotential }}€</p>
          </div>
        </div>
      </div>

      <!-- List -->
      <div class="divide-y divide-[#f5f5f5]">
        <button
          v-for="(p, i) in pendingProposals"
          :key="i"
          type="button"
          @click="emit('navigate', 'offers')"
          class="w-full flex items-center gap-3 p-3.5 hover:bg-[#fafafa] transition-colors text-left relative">
          <!-- Cover thumbnail with logo badge -->
          <div class="relative size-14 rounded-xl overflow-hidden shrink-0 bg-gray-100 ring-1 ring-black/5">
            <img :src="p.coverUrl" :alt="p.brand" class="absolute inset-0 w-full h-full object-cover" loading="lazy" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            <span v-if="p.urgent" class="absolute top-1 right-1 size-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse"></span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5">
              <p class="text-[13px] font-black text-[#1a1c1b] truncate">{{ p.brand }}</p>
              <span class="px-1.5 py-0.5 rounded-md bg-[#f5f5f5] text-[#666] text-[9px] font-bold uppercase tracking-wider">{{ p.category }}</span>
            </div>
            <p class="text-[11px] font-semibold flex items-center gap-1 mt-1"
              :class="p.urgent ? 'text-rose-600' : 'text-[#888]'">
              <span v-if="p.urgent" class="mdi mdi-fire text-[12px]"></span>
              <span v-else class="mdi mdi-clock-outline text-[11px]"></span>
              {{ p.deadline }}
            </p>
          </div>
          <div class="text-right shrink-0 flex items-center gap-1.5">
            <div class="px-2.5 py-1.5 rounded-xl bg-[#fff5f4] border border-[#ff2d23]/20">
              <p class="text-[15px] font-black text-[#ff2d23] tabular-nums leading-none">{{ p.budgetEur }}€</p>
              <p class="text-[8px] text-[#ff2d23] uppercase tracking-wider mt-0.5 font-bold">Tarifa</p>
            </div>
            <span class="mdi mdi-chevron-right text-[#ccc] text-[16px]"></span>
          </div>
        </button>
      </div>
      <button
        type="button"
        @click="emit('navigate', 'offers')"
        class="w-full flex items-center justify-center gap-1.5 py-3 border-t border-[#f0f0f0] text-[11px] font-black text-[#1a1c1b] hover:bg-[#fafafa] transition-colors">
        Ver todas las propuestas
        <span class="mdi mdi-arrow-right text-[13px]"></span>
      </button>
    </div>

    <!-- ======== OPORTUNIDADES CERCA ======== -->
    <div class="group relative rounded-3xl overflow-hidden border border-[#ececec] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03),0_8px_24px_-12px_rgba(0,0,0,0.08)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.04),0_16px_32px_-16px_rgba(0,0,0,0.12)] transition-shadow">
      <!-- Warm header -->
      <div class="relative p-5 bg-gradient-to-br from-[#fff8f6] via-white to-[#f0f4ff] border-b border-[#eee] overflow-hidden">
        <div class="pointer-events-none absolute -top-10 -right-8 size-40 rounded-full bg-[#22c55e]/[0.08] blur-2xl"></div>
        <div class="pointer-events-none absolute -bottom-12 -left-4 size-32 rounded-full bg-[#ff2d23]/[0.06] blur-2xl"></div>
        <div class="relative flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="size-11 rounded-2xl bg-gradient-to-br from-[#22c55e] to-[#16a34a] flex items-center justify-center shadow-[0_6px_16px_rgba(34,197,94,0.3)]">
              <span class="mdi mdi-map-marker-radius-outline text-white text-[22px]"></span>
            </div>
            <div>
              <h3 class="text-[15px] font-black text-[#1a1c1b] tracking-tight">Cerca de ti</h3>
              <p class="text-[11px] text-[#666] mt-0.5">{{ nearbyOffers.length }} restaurantes abiertos a colabs</p>
            </div>
          </div>
          <div class="shrink-0 flex flex-col items-end">
            <p class="text-[9px] font-bold text-[#888] uppercase tracking-[0.15em]">Media / post</p>
            <p class="text-[22px] font-black text-[#1a1c1b] tabular-nums leading-none mt-0.5">{{ avgFee }}€</p>
          </div>
        </div>
      </div>

      <!-- List -->
      <div class="divide-y divide-[#f5f5f5]">
        <button
          v-for="(o, i) in nearbyOffers"
          :key="i"
          type="button"
          @click="emit('navigate', 'offers')"
          class="w-full flex items-center gap-3 p-3.5 hover:bg-[#fafafa] transition-colors text-left">
          <!-- Cover thumbnail with emoji badge -->
          <div class="relative size-14 rounded-xl overflow-hidden shrink-0 bg-gray-100 ring-1 ring-black/5">
            <img :src="o.coverUrl" :alt="o.name" class="absolute inset-0 w-full h-full object-cover" loading="lazy" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            <span class="absolute bottom-0.5 right-0.5 text-[13px] drop-shadow-sm">{{ o.emoji }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-[13px] font-black text-[#1a1c1b] truncate">{{ o.name }}</p>
            <div class="flex items-center gap-1.5 mt-1 flex-wrap">
              <span class="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md">
                <span class="mdi mdi-map-marker text-[10px]"></span>
                {{ o.distanceKm }} km
              </span>
              <span class="px-1.5 py-0.5 rounded-md bg-[#f5f5f5] text-[#666] text-[10px] font-semibold">{{ o.tag }}</span>
            </div>
          </div>
          <div class="text-right shrink-0 flex items-center gap-1.5">
            <div class="px-2.5 py-1.5 rounded-xl bg-[#fff5f4] border border-[#ff2d23]/20">
              <p class="text-[15px] font-black text-[#ff2d23] tabular-nums leading-none">{{ o.feePerPostEur }}€</p>
              <p class="text-[8px] text-[#ff2d23] uppercase tracking-wider mt-0.5 font-bold">/ post</p>
            </div>
            <span class="mdi mdi-chevron-right text-[#ccc] text-[16px]"></span>
          </div>
        </button>
      </div>
      <button
        type="button"
        @click="emit('navigate', 'offers')"
        class="w-full flex items-center justify-center gap-1.5 py-3 border-t border-[#f0f0f0] text-[11px] font-black text-[#1a1c1b] hover:bg-[#fafafa] transition-colors">
        Explorar todas las oportunidades
        <span class="mdi mdi-arrow-right text-[13px]"></span>
      </button>
    </div>

  </div>
</template>
