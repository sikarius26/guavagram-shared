<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  availableEur: number
  directEur: number
  networkEur: number
  claimsEur: number
  monthEarningsEur: number
  monthEarningsDelta?: number
}>()

const emit = defineEmits<{
  (e: 'cashout'): void
  (e: 'voucher'): void
  (e: 'navigate', tab: string): void
}>()

const formatEur = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const deltaLabel = computed(() => {
  const d = props.monthEarningsDelta ?? 0
  if (d === 0) return null
  const sign = d > 0 ? '+' : ''
  return `${sign}${d.toFixed(1)}%`
})
const deltaPositive = computed(() => (props.monthEarningsDelta ?? 0) >= 0)
</script>

<template>
  <section class="relative rounded-3xl overflow-hidden border border-[#e5e5e5] shadow-[0_8px_24px_rgba(0,0,0,0.04)]">

    <!-- ============ HERO WARM: TUS GANANCIAS ============ -->
    <div class="relative overflow-hidden bg-gradient-to-br from-[#fff8f6] via-white to-[#f0f4ff]">
      <!-- ambient glows -->
      <div class="pointer-events-none absolute inset-0">
        <div class="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full bg-[#ff2d23]/[0.06] blur-[120px]"></div>
        <div class="absolute -bottom-20 -left-20 w-[300px] h-[300px] rounded-full bg-[#6366f1]/[0.04] blur-[100px]"></div>
      </div>

      <div class="relative p-6 md:p-8">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div class="flex items-start gap-3">
            <div class="size-12 rounded-2xl bg-gradient-to-br from-[#22c55e] to-[#10b981] flex items-center justify-center shrink-0 shadow-[0_6px_18px_rgba(34,197,94,0.28)]">
              <span class="mdi mdi-cash-multiple text-2xl text-white"></span>
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h2 class="text-[24px] lg:text-[30px] font-bold tracking-[-0.03em] text-[#1a1c1b]">
                  Tus ganancias
                </h2>
                <span v-if="deltaLabel"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black"
                  :class="deltaPositive ? 'text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200' : 'text-rose-700 bg-rose-50 ring-1 ring-rose-200'">
                  <span class="mdi text-[11px]" :class="deltaPositive ? 'mdi-trending-up' : 'mdi-trending-down'"></span>
                  {{ deltaLabel }} este mes
                </span>
              </div>
              <p class="text-[13px] text-[#666] mt-1">
                <span class="font-black text-[#1a1c1b]">{{ formatEur(availableEur) }}€</span> disponibles para cobrar ahora mismo.
              </p>
            </div>
          </div>

          <div class="flex gap-2 flex-wrap">
            <button
              type="button"
              :disabled="availableEur <= 0"
              @click="emit('cashout')"
              class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-[12px] font-bold transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow: 0 4px 12px rgba(16,185,129,0.25);">
              <span class="mdi mdi-bank-transfer-out text-[14px]"></span>
              Cobrar ahora
            </button>
            <button
              type="button"
              :disabled="availableEur <= 0"
              @click="emit('voucher')"
              class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#ddd] text-[#1a1c1b] text-[12px] font-bold hover:bg-[#f5f5f5] hover:border-[#ccc] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm">
              <span class="mdi mdi-ticket-percent-outline text-[14px]"></span>
              Convertir en vouchers
            </button>
          </div>
        </div>

        <!-- 4 stat cards — patrón restaurant (left border 3px + watermark + delta) -->
        <div class="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <!-- Disponible (emerald) -->
          <div class="bg-gradient-to-br from-white to-green-50/40 rounded-2xl p-5 border border-[#ddd] border-l-[3px] border-l-[#22c55e] shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-4px_rgba(34,197,94,0.12)] transition-all duration-300">
            <div class="flex items-center justify-between mb-3 relative z-10">
              <div class="w-9 h-9 rounded-xl bg-[#f0fdf4] flex items-center justify-center">
                <span class="mdi mdi-wallet text-[#22c55e] text-lg"></span>
              </div>
            </div>
            <p class="text-[28px] lg:text-[32px] font-black tracking-[-0.03em] text-[#1a1c1b] tabular-nums leading-none relative z-10">
              {{ formatEur(availableEur) }}<span class="text-[#888] text-[16px] font-bold">€</span>
            </p>
            <p class="text-[10px] text-[#888] font-medium mt-1.5 relative z-10">Disponible</p>
            <span class="absolute bottom-2 right-2 mdi mdi-wallet text-[80px] text-[#22c55e]/[0.06] leading-none"></span>
          </div>

          <!-- Directo (rose/primary) -->
          <div class="bg-gradient-to-br from-white to-[#fff5f4] rounded-2xl p-5 border border-[#ddd] border-l-[3px] border-l-[#ff2d23] shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-4px_rgba(255,45,35,0.12)] transition-all duration-300">
            <div class="flex items-center justify-between mb-3 relative z-10">
              <div class="w-9 h-9 rounded-xl bg-[#fff5f4] flex items-center justify-center">
                <span class="mdi mdi-star text-[#ff2d23] text-lg"></span>
              </div>
            </div>
            <p class="text-[28px] lg:text-[32px] font-black tracking-[-0.03em] text-[#1a1c1b] tabular-nums leading-none relative z-10">
              {{ formatEur(directEur) }}<span class="text-[#888] text-[16px] font-bold">€</span>
            </p>
            <p class="text-[10px] text-[#888] font-medium mt-1.5 relative z-10">Directo · picks + reservas</p>
            <span class="absolute bottom-2 right-2 mdi mdi-star text-[80px] text-[#ff2d23]/[0.06] leading-none"></span>
          </div>

          <!-- Red / L2 (indigo) -->
          <div class="bg-gradient-to-br from-white to-indigo-50/40 rounded-2xl p-5 border border-[#ddd] border-l-[3px] border-l-[#6366f1] shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-4px_rgba(99,102,241,0.12)] transition-all duration-300">
            <div class="flex items-center justify-between mb-3 relative z-10">
              <div class="w-9 h-9 rounded-xl bg-[#eef2ff] flex items-center justify-center">
                <span class="mdi mdi-account-group text-[#6366f1] text-lg"></span>
              </div>
            </div>
            <p class="text-[28px] lg:text-[32px] font-black tracking-[-0.03em] text-[#1a1c1b] tabular-nums leading-none relative z-10">
              {{ formatEur(networkEur) }}<span class="text-[#888] text-[16px] font-bold">€</span>
            </p>
            <p class="text-[10px] text-[#888] font-medium mt-1.5 relative z-10">De tu red · L2</p>
            <span class="absolute bottom-2 right-2 mdi mdi-account-group text-[80px] text-[#6366f1]/[0.06] leading-none"></span>
          </div>

          <!-- Claims pendientes (amber) -->
          <div class="bg-gradient-to-br from-white to-[#fff7ed] rounded-2xl p-5 border border-[#ddd] border-l-[3px] border-l-[#f59e0b] shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-4px_rgba(245,158,11,0.12)] transition-all duration-300">
            <div class="flex items-center justify-between mb-3 relative z-10">
              <div class="w-9 h-9 rounded-xl bg-[#fff7ed] flex items-center justify-center">
                <span class="mdi mdi-clock-outline text-[#f59e0b] text-lg"></span>
              </div>
            </div>
            <p class="text-[28px] lg:text-[32px] font-black tracking-[-0.03em] text-[#1a1c1b] tabular-nums leading-none relative z-10">
              {{ formatEur(claimsEur) }}<span class="text-[#888] text-[16px] font-bold">€</span>
            </p>
            <p class="text-[10px] text-[#888] font-medium mt-1.5 relative z-10">Claims pendientes</p>
            <span class="absolute bottom-2 right-2 mdi mdi-clock-outline text-[80px] text-[#f59e0b]/[0.06] leading-none"></span>
          </div>
        </div>
      </div>
    </div>

    <!--
      "Así se gana dinero en Guavagram" removed — the 3 core revenue streams
      (pick / review / bio) + network now live in CreatorOnboardingHero at the
      top of the home. Having them here too was duplicate noise for new users.
      The 4th stream (brand campaigns) is promoted as a separate CTA
      elsewhere (Hub > Campañas).
    -->
  </section>
</template>
