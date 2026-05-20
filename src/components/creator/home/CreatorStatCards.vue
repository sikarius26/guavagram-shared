<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { CreatorHomeStatsViewModel } from '~/services/apis/models/creator-home-stats-view-model'

const { t } = useI18n()

const props = defineProps<{
  stats: CreatorHomeStatsViewModel | null
}>()

interface StatCardDef {
  key: 'followers' | 'clicks' | 'bookings' | 'earnings'
  label: string
  icon: string
  decorativeIcon: string
  color: string
  bgClass: string
  iconClass: string
  value: number
  delta: number
  deltaSuffix: string
  formattedValue: string
  isPercentDelta?: boolean
}

const formatNumber = (n: number): string => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 10_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k'
  return n.toLocaleString('es-ES')
}

const formatEuros = (cents: number): string => {
  const euros = (cents || 0) / 100
  return euros.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
}

const cards = computed<StatCardDef[]>(() => {
  const s: any = props.stats ?? {}

  // Handle both canonical model shape + mock shape gracefully
  const followers = Number(s.followers ?? 0)
  const followersDelta = Number(s.followersDelta7d ?? 0)

  const pickClicks = Number(s.pickClicks ?? s.profileViewsMonth ?? 0)
  const pickClicksDelta = Number(s.pickClicksDelta7d ?? 0)

  const bookings = Number(s.bookingsGenerated ?? s.completedCampaigns ?? 0)
  const bookingsDelta = Number(s.bookingsDelta7d ?? 0)

  const earningsCents = Number(
    s.monthEarningsCents ?? (typeof s.earningsMonthEur === 'number' ? s.earningsMonthEur * 100 : 0)
  )
  const earningsDelta = Number(s.monthEarningsDelta ?? 0)

  return [
    {
      key: 'followers',
      label: t('followers'),
      icon: 'mdi-account-multiple',
      decorativeIcon: 'mdi-account-multiple',
      color: '#22c55e',
      bgClass: 'bg-emerald-50',
      iconClass: 'text-emerald-600',
      value: followers,
      delta: followersDelta,
      deltaSuffix: '',
      formattedValue: formatNumber(followers),
    },
    {
      key: 'clicks',
      label: t('picksClicks'),
      icon: 'mdi-gesture-tap',
      decorativeIcon: 'mdi-gesture-tap',
      color: '#3b82f6',
      bgClass: 'bg-blue-50',
      iconClass: 'text-blue-600',
      value: pickClicks,
      delta: pickClicksDelta,
      deltaSuffix: '',
      formattedValue: formatNumber(pickClicks),
    },
    {
      key: 'bookings',
      label: t('bookingsGenerated'),
      icon: 'mdi-calendar-check',
      decorativeIcon: 'mdi-silverware-fork-knife',
      color: '#f59e0b',
      bgClass: 'bg-amber-50',
      iconClass: 'text-amber-600',
      value: bookings,
      delta: bookingsDelta,
      deltaSuffix: '',
      formattedValue: formatNumber(bookings),
    },
    {
      key: 'earnings',
      label: t('monthlyEarnings'),
      icon: 'mdi-currency-eur',
      decorativeIcon: 'mdi-cash-multiple',
      color: '#6366f1',
      bgClass: 'bg-indigo-50',
      iconClass: 'text-indigo-600',
      value: earningsCents,
      delta: earningsDelta,
      deltaSuffix: '%',
      formattedValue: formatEuros(earningsCents),
      isPercentDelta: true,
    },
  ]
})

const deltaClasses = (delta: number) => {
  if (delta > 0) return 'text-emerald-700 bg-emerald-50'
  if (delta < 0) return 'text-rose-700 bg-rose-50'
  return 'text-[#888] bg-[#f0f0f0]'
}

const deltaIcon = (delta: number) => {
  if (delta > 0) return 'mdi-trending-up'
  if (delta < 0) return 'mdi-trending-down'
  return 'mdi-minus'
}

const formatDelta = (card: StatCardDef): string => {
  if (card.delta === 0) return card.isPercentDelta ? '0%' : '0'
  const sign = card.delta > 0 ? '+' : '-'
  const absValue = Math.abs(card.delta)
  if (card.isPercentDelta) {
    return `${sign}${absValue.toFixed(1)}%`
  }
  return `${sign}${formatNumber(absValue)}`
}
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div
      v-for="(card, i) in cards"
      :key="card.key"
      class="bg-gradient-to-br from-white rounded-2xl p-5 border border-[#ddd] shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:-translate-y-0.5 transition-all duration-300 opacity-0 animate-fade-in-up"
      :style="{
        animationDelay: 60 + i * 60 + 'ms',
        borderLeftWidth: '3px',
        borderLeftColor: card.color,
        backgroundImage: `linear-gradient(to bottom right, white, ${card.color}0d)`,
      }"
    >
      <!-- Header row: icon + delta -->
      <div class="flex items-center justify-between mb-3 relative z-10">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" :class="card.bgClass">
          <span class="mdi text-lg leading-none" :class="[card.icon, card.iconClass]"></span>
        </div>
        <span
          class="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-tight shrink-0"
          :class="deltaClasses(card.delta)"
        >
          <span class="mdi text-[10px] leading-none" :class="deltaIcon(card.delta)"></span>
          {{ formatDelta(card) }}
        </span>
      </div>

      <!-- Big number -->
      <p class="text-[32px] lg:text-[40px] font-black tracking-[-0.04em] text-[#1a1c1b] tabular-nums leading-none relative z-10">
        {{ card.formattedValue }}
      </p>
      <p class="text-[10px] text-[#888] font-medium mt-1.5 relative z-10">{{ card.label }}</p>

      <!-- Watermark icon bottom-right -->
      <span class="absolute bottom-2 right-2 mdi text-[80px] leading-none"
        :class="card.decorativeIcon"
        :style="{ color: card.color, opacity: 0.06 }"></span>
    </div>
  </div>
</template>
