<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { creatorApiClient } from '~/services/apis/api.client.creator'
import { notifier } from '~/services/notification'
import BoostPickModal from './BoostPickModal.vue'

const { t } = useI18n()

type TierKey = 'basic' | 'pro' | 'elite'

interface BoostTier {
  key: TierKey
  label: string
  tagline: string
  days: number
  priceEur: number
  features: string[]
  accent: 'amber' | 'rose' | 'violet'
}

const tiers: BoostTier[] = [
  {
    key: 'basic',
    label: 'Destacar pick 7 dias',
    tagline: 'Para probar el canal',
    days: 7,
    priceEur: 10,
    features: [
      'Pick destacado 7 dias',
      'Aparicion priorizada en busquedas',
      'Stats de impresiones',
    ],
    accent: 'amber',
  },
  {
    key: 'pro',
    label: 'Top marketplace 24h',
    tagline: 'Maxima visibilidad en picos',
    days: 1,
    priceEur: 25,
    features: [
      'Posicion TOP del marketplace 24h',
      'Badge "Destacado hoy"',
      'Notificacion a negocios cercanos',
    ],
    accent: 'rose',
  },
  {
    key: 'elite',
    label: 'Mega boost 30 dias',
    tagline: 'Mes entero arriba',
    days: 30,
    priceEur: 99,
    features: [
      '30 dias de boost continuo',
      'Todos tus picks destacados',
      'Reporte semanal de performance',
      'Prioridad en propuestas',
    ],
    accent: 'violet',
  },
]

const boostStatus = ref<any | null>(null)
const loading = ref(false)

// Countdown
const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | null = null

const modalOpen = ref(false)
const selectedTier = ref<BoostTier | null>(null)

const load = async () => {
  loading.value = true
  try {
    const data = await creatorApiClient.creatorBoostGet()
    boostStatus.value = data
  } catch (e) {
    notifier.notifyError(t('couldNotLoadBoost'), e as Error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  load()
  timer = setInterval(() => { now.value = Date.now() }, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

const isActive = computed(() => Boolean(boostStatus.value?.active))

const boostUntilMs = computed<number | null>(() => {
  const raw = boostStatus.value?.expireAt ?? boostStatus.value?.boostedUntil
  if (!raw) return null
  const t = new Date(raw).getTime()
  return Number.isNaN(t) ? null : t
})

const countdownLabel = computed(() => {
  if (!boostUntilMs.value) return null
  const diff = boostUntilMs.value - now.value
  if (diff <= 0) return 'Expira en breve'
  const s = Math.floor(diff / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m ${sec}s`
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
})

const currentTierLabel = computed(() => {
  const t = boostStatus.value?.tier
  if (!t) return null
  const tier = tiers.find(x => x.key === t)
  return tier?.label ?? t
})

const expireFormatted = computed(() => {
  if (!boostUntilMs.value) return ''
  return new Date(boostUntilMs.value).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
})

const accentClasses = (accent: BoostTier['accent']) => {
  switch (accent) {
    case 'amber':
      return {
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        glow: 'hover:shadow-[0_18px_40px_-10px_rgba(245,158,11,0.45)]',
        border: 'hover:border-amber-300',
        icon: 'text-amber-500',
        button: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-[0_8px_20px_rgba(245,158,11,0.45)]',
      }
    case 'rose':
      return {
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        glow: 'hover:shadow-[0_18px_40px_-10px_rgba(244,63,94,0.45)]',
        border: 'hover:border-rose-300',
        icon: 'text-rose-500',
        button: 'bg-gradient-to-r from-rose-500 to-red-500 text-white hover:shadow-[0_8px_20px_rgba(244,63,94,0.45)]',
      }
    case 'violet':
    default:
      return {
        badge: 'bg-violet-50 text-violet-700 border-violet-200',
        glow: 'hover:shadow-[0_18px_40px_-10px_rgba(139,92,246,0.45)]',
        border: 'hover:border-violet-300',
        icon: 'text-violet-500',
        button: 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:shadow-[0_8px_20px_rgba(139,92,246,0.45)]',
      }
  }
}

const openModal = (tier: BoostTier) => {
  selectedTier.value = tier
  modalOpen.value = true
}

const onConfirmBoost = async (tier: BoostTier) => {
  try {
    const updated = await creatorApiClient.creatorBoostPost({
      tier: tier.key,
      days: tier.days,
      priceEur: tier.priceEur,
    })
    boostStatus.value = { ...updated, tier: tier.key, active: true }
    notifier.notifySuccess(t('boostActivated'))
    modalOpen.value = false
  } catch (e) {
    notifier.notifyError(t('couldNotActivateBoost'), e as Error)
  }
}
</script>

<template>
  <div class="flex flex-col gap-5">

    <!-- Header -->
    <div>
      <h3 class="text-[18px] font-bold tracking-[-0.02em] text-[#1a1c1b]">Boost</h3>
      <p class="text-[12px] text-[#666] mt-0.5">Paga para destacar tus picks y subir en el marketplace.</p>
    </div>

    <!-- Active status -->
    <div
      v-if="isActive"
      class="rounded-2xl border border-[#ff2d23]/20 bg-gradient-to-br from-[#fff5f4] via-white to-[#fff5f4]/30 p-5 shadow-[0_4px_18px_rgba(255,45,35,0.12)] relative overflow-hidden"
    >
      <div class="flex items-start gap-4 flex-wrap">
        <div class="w-12 h-12 rounded-2xl text-white flex items-center justify-center shrink-0 shadow-[0_4px_14px_rgba(255,45,35,0.45)]"
          style="background: linear-gradient(135deg, #ff2d23 0%, #ff6b4a 100%);">
          <span class="mdi mdi-rocket-launch text-[22px]"></span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <p class="text-[10px] font-bold text-[#ff2d23] uppercase tracking-[0.15em]">Boost activo</p>
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ff2d23] text-white">
              <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              LIVE
            </span>
          </div>
          <p v-if="currentTierLabel" class="text-[16px] font-bold text-[#1a1c1b] mt-0.5">{{ currentTierLabel }}</p>
          <p v-if="expireFormatted" class="text-[12px] text-[#666] mt-0.5">Activo hasta: <span class="font-bold text-[#1a1c1b]">{{ expireFormatted }}</span></p>
        </div>
        <div v-if="countdownLabel" class="text-right shrink-0">
          <p class="text-[10px] font-bold text-[#888] uppercase tracking-[0.12em]">Termina en</p>
          <p class="text-[22px] font-black tracking-[-0.02em] text-[#ff2d23] tabular-nums mt-0.5">{{ countdownLabel }}</p>
        </div>
      </div>
      <div v-if="boostStatus?.impressionsLastWeek || boostStatus?.rankImprovement" class="mt-4 grid grid-cols-2 gap-3">
        <div class="rounded-xl bg-white border border-[#eee] p-3">
          <p class="text-[10px] font-bold text-[#888] uppercase tracking-[0.12em]">Impresiones 7d</p>
          <p class="text-[18px] font-black text-[#1a1c1b] tabular-nums mt-0.5">{{ (boostStatus?.impressionsLastWeek ?? 0).toLocaleString('es-ES') }}</p>
        </div>
        <div class="rounded-xl bg-white border border-[#eee] p-3">
          <p class="text-[10px] font-bold text-[#888] uppercase tracking-[0.12em]">Mejora en ranking</p>
          <p class="text-[18px] font-black text-[#22c55e] tabular-nums mt-0.5 inline-flex items-center gap-1">
            <span class="mdi mdi-trending-up text-[18px]"></span>
            +{{ boostStatus?.rankImprovement ?? 0 }}
          </p>
        </div>
      </div>
    </div>

    <div v-else-if="!loading" class="rounded-2xl border border-[#e5e5e5] bg-white p-5 text-center">
      <p class="text-[13px] text-[#666]">Sin boost activo ahora mismo.</p>
      <p class="text-[11px] text-[#999] mt-1">Contrata un plan abajo para multiplicar tu visibilidad.</p>
    </div>

    <!-- Tier cards -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <article
        v-for="tier in tiers"
        :key="tier.key"
        class="group relative rounded-2xl bg-white border border-[#e5e5e5] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 flex flex-col gap-4 hover:-translate-y-1 hover:scale-[1.015]"
        :class="[accentClasses(tier.accent).border, accentClasses(tier.accent).glow]"
      >
        <!-- Icon + tagline -->
        <div class="flex items-start justify-between gap-2">
          <div
            class="w-12 h-12 rounded-2xl bg-[#f7f7f7] flex items-center justify-center transition-transform group-hover:scale-110"
            :class="accentClasses(tier.accent).icon"
          >
            <span class="mdi mdi-fire text-[24px]"></span>
          </div>
          <span
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border"
            :class="accentClasses(tier.accent).badge"
          >
            {{ tier.tagline }}
          </span>
        </div>

        <!-- Title -->
        <div>
          <h4 class="text-[16px] font-bold tracking-[-0.02em] text-[#1a1c1b]">{{ tier.label }}</h4>
          <div class="mt-2 flex items-baseline gap-1">
            <span class="text-[34px] font-black tracking-[-0.03em] text-[#1a1c1b] tabular-nums leading-none">{{ tier.priceEur }}</span>
            <span class="text-[16px] font-bold text-[#888]">€</span>
          </div>
        </div>

        <!-- Features -->
        <ul class="flex flex-col gap-1.5 flex-1">
          <li
            v-for="(f, i) in tier.features"
            :key="i"
            class="flex items-start gap-2 text-[12px] text-[#1a1c1b]"
          >
            <span class="mdi mdi-check text-emerald-500 text-[14px] leading-none mt-0.5 shrink-0"></span>
            <span class="leading-snug">{{ f }}</span>
          </li>
        </ul>

        <!-- CTA -->
        <button
          type="button"
          class="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-[12px] font-bold transition-all"
          :class="accentClasses(tier.accent).button"
          @click="openModal(tier)"
        >
          <span class="mdi mdi-fire text-[14px]"></span>
          Contratar
        </button>
      </article>
    </div>

    <!-- Confirm modal -->
    <BoostPickModal
      v-model="modalOpen"
      :tier="selectedTier"
      @confirm="onConfirmBoost"
    />
  </div>
</template>
