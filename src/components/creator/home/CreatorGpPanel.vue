<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGamification } from '~/composables/useGamification'

interface ChecklistStep {
  id: string
  label: string
  description: string
  icon: string
  iconColor: string
  iconBg: string
  ctaLabel: string
  target: 'home' | 'bio' | 'reviews' | 'campaigns' | 'offers' | 'affiliate' | 'settings'
  completed: boolean
  gp: number
}

const props = withDefaults(defineProps<{
  stepsCompleted?: Partial<Record<'socials' | 'firstPick' | 'firstReview' | 'bio' | 'invite', boolean>>
  completionBonusGp?: number
}>(), {
  stepsCompleted: () => ({}),
  completionBonusGp: 200,
})

const emit = defineEmits<{
  (e: 'navigate', tab: 'home' | 'bio' | 'reviews' | 'campaigns' | 'offers' | 'affiliate' | 'settings'): void
  (e: 'view-logros'): void
  (e: 'dismiss-checklist'): void
}>()

const {
  profile,
  currentRank,
  nextRank,
  progressToNextRank,
  streakMultiplier,
  RANKS,
} = useGamification()

const totalPoints = computed(() => profile.value?.totalPoints ?? 0)
const availablePoints = computed(() => profile.value?.availablePoints ?? totalPoints.value)
const streak = computed(() => profile.value?.currentStreak ?? 0)
const pointsToNext = computed(() => {
  if (!nextRank.value) return 0
  return Math.max(0, nextRank.value.minPoints - totalPoints.value)
})

// ─── Checklist ───
const checklistDismissed = ref(false)
const steps = computed<ChecklistStep[]>(() => [
  { id: 'socials',     label: 'Conecta tus redes sociales',        description: 'Instagram, TikTok — verifica tu audiencia y sube tu nivel',   icon: 'mdi-instagram',                      iconColor: '#e1306c', iconBg: '#fdf2f8', ctaLabel: 'Conectar',    target: 'bio',       completed: !!props.stepsCompleted.socials,     gp: 75  },
  { id: 'bio',         label: 'Personaliza tu bio pública',        description: 'Foto, descripción, ciudad — lo primero que ven las marcas',   icon: 'mdi-account-box-outline',            iconColor: '#6366f1', iconBg: '#eef2ff', ctaLabel: 'Editar',      target: 'bio',       completed: !!props.stepsCompleted.bio,         gp: 75  },
  { id: 'firstPick',   label: 'Añade tu primera recomendación',    description: 'Un restaurante que te encante — desbloquea la comisión',      icon: 'mdi-silverware-fork-knife',          iconColor: '#22c55e', iconBg: '#f0fdf4', ctaLabel: 'Añadir pick', target: 'bio',       completed: !!props.stepsCompleted.firstPick,   gp: 100 },
  { id: 'firstReview', label: 'Publica tu primera reseña verificada', description: 'Ticket + foto del sitio = activas la afiliación',          icon: 'mdi-star-check-outline',             iconColor: '#f59e0b', iconBg: '#fffbeb', ctaLabel: 'Ir a reseñas',target: 'reviews',   completed: !!props.stepsCompleted.firstReview, gp: 150 },
  { id: 'invite',      label: 'Invita a otro creator a Guavagram', description: 'Ganas un % de todo lo que generen ellos — tu red (L2)',       icon: 'mdi-account-multiple-plus-outline',  iconColor: '#10b981', iconBg: '#ecfdf5', ctaLabel: 'Invitar',     target: 'affiliate', completed: !!props.stepsCompleted.invite,      gp: 100 },
])

const total = computed(() => steps.value.length)
const done = computed(() => steps.value.filter(s => s.completed).length)
const allDone = computed(() => done.value === total.value)
const showChecklist = computed(() => !checklistDismissed.value && !allDone.value)

const onboardingTotalGp = computed(() => steps.value.reduce((a, s) => a + s.gp, 0))
const onboardingEarnedGp = computed(() => steps.value.filter(s => s.completed).reduce((a, s) => a + s.gp, 0))
const onboardingRemainingGp = computed(() => onboardingTotalGp.value - onboardingEarnedGp.value)

// ─── Details (ranks + how to earn) ───
const showDetails = ref(false)
const visibleRanks = computed(() => {
  const currentIdx = RANKS.findIndex(r => r.name === currentRank.value.name)
  const showUntil = Math.min(currentIdx + 2, RANKS.length - 1)
  return RANKS.slice(0, showUntil + 1).map((r, i) => ({
    ...r,
    unlocked: totalPoints.value >= r.minPoints,
    isCurrent: r.name === currentRank.value.name,
    isNext: i === currentIdx + 1,
  }))
})
const hiddenRanksCount = computed(() => {
  const currentIdx = RANKS.findIndex(r => r.name === currentRank.value.name)
  return Math.max(0, RANKS.length - currentIdx - 3)
})

const creatorRewards = [
  { id: 'verified-review',   title: 'Reseña verificada',          description: 'Ticket + foto del local — activa tu afiliación',    icon: 'mdi-star-check-outline',             color: '#f59e0b', points: 150 },
  { id: 'first-pick',        title: 'Añadir pick al perfil',      description: 'Recomienda un restaurante que te encante',          icon: 'mdi-silverware-fork-knife',          color: '#22c55e', points: 100 },
  { id: 'booking-from-pick', title: 'Reserva desde tu pick',      description: 'Un seguidor reserva desde una recomendación tuya',  icon: 'mdi-calendar-check',                 color: '#22c55e', points: 30  },
  { id: 'code-redeemed',     title: 'Código canjeado',            description: 'Alguien usa tu código en un restaurante',           icon: 'mdi-ticket-percent',                 color: '#6366f1', points: 25  },
  { id: 'invite-creator',    title: 'Invitar a otro creator',     description: 'Tu red L2 — ganas % de lo que generen',             icon: 'mdi-account-multiple-plus-outline',  color: '#10b981', points: 100 },
  { id: 'connect-socials',   title: 'Conectar redes sociales',    description: 'Instagram y TikTok verifican tu audiencia',         icon: 'mdi-instagram',                      color: '#e1306c', points: 75  },
  { id: 'campaign-done',     title: 'Campaña completada',         description: 'Entregas el deliverable de una colab',              icon: 'mdi-flag-checkered',                 color: '#8b5cf6', points: 200 },
  { id: 'tag-store',         title: 'Tag al restaurante',         description: 'Menciona al local en una story o reel externo',     icon: 'mdi-at',                             color: '#a855f7', points: 75  },
]

// ─── UI helpers ───
const formatInt = (n: number) => n.toLocaleString('es-ES', { maximumFractionDigits: 0 })
const streakFlameColor = computed(() => {
  const s = streak.value
  if (s >= 30) return 'text-red-500'
  if (s >= 14) return 'text-orange-500'
  if (s >= 7) return 'text-amber-400'
  return 'text-white/40'
})
const streakGlow = computed(() => streak.value > 0 ? 'filter: drop-shadow(0 0 8px currentColor)' : '')

const collapsed = ref(false)
const toggleCollapsed = () => { collapsed.value = !collapsed.value }
const onDismissChecklist = () => { checklistDismissed.value = true; emit('dismiss-checklist') }
</script>

<template>
  <div class="relative overflow-hidden rounded-3xl shadow-[0_8px_32px_rgba(15,23,42,0.15)]">

    <!-- ============ DARK HERO ============ -->
    <div class="relative overflow-hidden text-white p-6 md:p-7"
      style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%);">

      <!-- Decorative blurs using rank color -->
      <div class="absolute -top-24 -right-24 size-72 rounded-full blur-[100px] opacity-30 pointer-events-none"
        :style="{ backgroundColor: currentRank.color }"></div>
      <div class="absolute -bottom-20 -left-20 size-56 rounded-full blur-[80px] opacity-10 pointer-events-none"
        :style="{ backgroundColor: currentRank.color }"></div>
      <div class="absolute inset-0 opacity-[0.03] pointer-events-none"
        style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 20px 20px;"></div>
      <div class="absolute top-1/2 right-8 -translate-y-1/2 opacity-[0.05] text-[140px] leading-none pointer-events-none">
        <span class="mdi" :class="currentRank.icon"></span>
      </div>

      <div class="relative z-10">

        <!-- Top row: Rank + action buttons -->
        <div class="flex items-start justify-between gap-3 mb-6 flex-wrap">
          <div class="flex items-center gap-4 min-w-0">
            <!-- Rank icon -->
            <div class="relative shrink-0">
              <div class="absolute inset-0 rounded-2xl blur-xl opacity-40"
                :style="{ backgroundColor: currentRank.color }"></div>
              <div class="relative size-[64px] rounded-2xl bg-gradient-to-br flex items-center justify-center ring-2 ring-white/10 shadow-2xl"
                :class="currentRank.gradient">
                <span class="mdi text-white text-[28px] drop-shadow-lg" :class="currentRank.icon"></span>
              </div>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] bg-white/10 backdrop-blur-sm border border-white/10">
                  Rango actual
                </span>
                <span v-if="showChecklist"
                  class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] bg-emerald-500/20 text-emerald-300 border border-emerald-500/20">
                  Onboarding {{ done }}/{{ total }}
                </span>
              </div>
              <h2 class="text-[24px] md:text-[26px] font-black tracking-tight leading-none mb-1 truncate">{{ currentRank.name }}</h2>
              <p class="text-white/40 text-[11px] italic truncate">{{ currentRank.tagline }}</p>
            </div>
          </div>

          <!-- Action buttons + streak -->
          <div class="flex items-center gap-2 flex-wrap">
            <!-- Como funciona -->
            <button @click="showDetails = !showDetails" type="button"
              class="flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold text-white/80 hover:text-white bg-white/[0.08] hover:bg-white/[0.14] rounded-xl transition-colors border border-white/[0.06]">
              <span class="mdi text-[13px]" :class="showDetails ? 'mdi-chevron-up' : 'mdi-information-outline'"></span>
              {{ showDetails ? 'Cerrar' : 'Como funciona' }}
            </button>
            <!-- Ver logros (primary) -->
            <button @click="emit('view-logros')" type="button"
              class="flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold text-[#1a1c1b] bg-white hover:bg-white/90 rounded-xl transition-colors">
              Ver logros
              <span class="mdi mdi-arrow-right text-[12px]"></span>
            </button>

            <!-- Streak pill -->
            <div class="flex items-center gap-2.5 bg-white/[0.06] backdrop-blur-sm rounded-xl px-3 py-2 border border-white/[0.08]">
              <span class="mdi mdi-fire text-[18px]" :class="streakFlameColor" :style="streakGlow"></span>
              <div class="text-center">
                <p class="text-white font-black text-[16px] leading-none">{{ streak }}</p>
                <p class="text-white/30 text-[8px] uppercase tracking-[0.2em] font-bold mt-0.5">días</p>
              </div>
              <span v-if="streakMultiplier > 1"
                class="text-[10px] font-black px-1.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/20">
                x{{ streakMultiplier }}
              </span>
            </div>

            <!-- Collapse -->
            <button @click="toggleCollapsed" type="button"
              class="size-10 rounded-xl flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition-colors"
              :title="collapsed ? 'Expandir' : 'Colapsar'">
              <span class="mdi text-lg transition-transform" :class="collapsed ? 'mdi-chevron-down' : 'mdi-chevron-up'"></span>
            </button>
          </div>
        </div>

        <template v-if="!collapsed">
          <!-- Progress to next rank -->
          <div v-if="nextRank" class="mb-5 bg-white/[0.04] rounded-2xl p-4 border border-white/[0.06]">
            <div class="flex items-center justify-between mb-2.5">
              <div class="flex items-center gap-1.5">
                <span class="mdi text-[13px]" :class="currentRank.icon" :style="{ color: currentRank.color }"></span>
                <span class="text-[11px] font-bold text-white/50">{{ currentRank.name }}</span>
              </div>
              <p class="text-[14px] font-black text-white tabular-nums">{{ Math.round(progressToNextRank) }}%</p>
              <div class="flex items-center gap-1.5">
                <span class="text-[11px] font-bold text-white/50">{{ nextRank.name }}</span>
                <span class="mdi text-[13px]" :class="nextRank.icon" :style="{ color: nextRank.color }"></span>
              </div>
            </div>
            <div class="h-2.5 bg-white/[0.08] rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-1000 ease-out"
                :style="{ width: progressToNextRank + '%', background: `linear-gradient(90deg, ${currentRank.color}, ${nextRank.color})` }"></div>
            </div>
            <div class="flex justify-between mt-2">
              <span class="text-white/25 text-[10px] font-mono">{{ formatInt(totalPoints) }} GP</span>
              <span v-if="pointsToNext > 0" class="text-white/40 text-[10px] font-bold">
                Faltan {{ formatInt(pointsToNext) }} GP
              </span>
            </div>
          </div>

          <!-- Stat cards: 3 when onboarding incomplete, 2 when done -->
          <div class="grid grid-cols-3 gap-3" v-if="showChecklist">
            <div class="bg-white/[0.05] backdrop-blur-sm rounded-2xl p-4 text-center border border-white/[0.06]">
              <p class="text-white/30 text-[9px] font-bold uppercase tracking-[0.15em] mb-1.5">Total GP</p>
              <p class="text-[24px] md:text-[26px] font-black tracking-tight leading-none">{{ formatInt(totalPoints) }}</p>
            </div>
            <div class="bg-white/[0.05] backdrop-blur-sm rounded-2xl p-4 text-center border border-white/[0.06]">
              <p class="text-white/30 text-[9px] font-bold uppercase tracking-[0.15em] mb-1.5">Por onboarding</p>
              <p class="text-[24px] md:text-[26px] font-black tracking-tight leading-none" :style="{ color: currentRank.color }">
                +{{ formatInt(onboardingRemainingGp) }}
              </p>
            </div>
            <div class="bg-white/[0.05] backdrop-blur-sm rounded-2xl p-4 text-center border border-white/[0.06]">
              <p class="text-white/30 text-[9px] font-bold uppercase tracking-[0.15em] mb-1.5">Bonus al 100%</p>
              <p class="text-[24px] md:text-[26px] font-black tracking-tight leading-none text-amber-400">
                +{{ formatInt(completionBonusGp) }}
              </p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3" v-else>
            <div class="bg-white/[0.05] backdrop-blur-sm rounded-2xl p-4 text-center border border-white/[0.06]">
              <p class="text-white/30 text-[9px] font-bold uppercase tracking-[0.15em] mb-1.5">Total GP</p>
              <p class="text-[24px] md:text-[26px] font-black tracking-tight leading-none">{{ formatInt(totalPoints) }}</p>
            </div>
            <div class="bg-white/[0.05] backdrop-blur-sm rounded-2xl p-4 text-center border border-white/[0.06]">
              <p class="text-white/30 text-[9px] font-bold uppercase tracking-[0.15em] mb-1.5">GP disponibles</p>
              <p class="text-[24px] md:text-[26px] font-black tracking-tight leading-none text-emerald-400">
                {{ formatInt(availablePoints) }}
              </p>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- ============ CHECKLIST (white) — only while onboarding incomplete ============ -->
    <div v-if="!collapsed && showChecklist" class="bg-white">
      <div class="px-5 md:px-6 pt-5 pb-4">
        <div class="flex items-center justify-between gap-3 flex-wrap mb-2.5">
          <div class="flex items-center gap-2">
            <span class="mdi mdi-rocket-launch-outline text-emerald-600 text-[16px]"></span>
            <h3 class="text-[13px] font-black text-[#1a1c1b] uppercase tracking-[0.08em]">Primeros pasos en Guavagram</h3>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-[11px] font-black tabular-nums text-emerald-700">
              {{ formatInt(onboardingEarnedGp) }} / {{ formatInt(onboardingTotalGp) }} GP
            </span>
            <button type="button" @click="onDismissChecklist"
              class="text-[10px] font-bold text-[#888] hover:text-[#1a1c1b] transition-colors"
              title="Ocultar onboarding">
              Ocultar
            </button>
          </div>
        </div>
        <div class="h-1.5 bg-emerald-50 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-700 ease-out"
            :style="{ width: (onboardingTotalGp > 0 ? (onboardingEarnedGp / onboardingTotalGp) * 100 : 0) + '%' }"></div>
        </div>
      </div>

      <ol class="relative px-5 md:px-6 pb-5">
        <span class="absolute left-[calc(1.25rem+19px)] md:left-[calc(1.5rem+19px)] top-3 bottom-3 w-px bg-gradient-to-b from-[#e5e7eb] via-[#e5e7eb] to-transparent pointer-events-none"></span>

        <li v-for="(step, idx) in steps" :key="step.id"
          class="relative flex items-center gap-3 py-3 group">
          <div class="shrink-0 relative z-10">
            <div v-if="step.completed"
              class="size-10 rounded-full flex items-center justify-center ring-4 ring-white"
              style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow: 0 6px 16px rgba(16,185,129,0.35);">
              <span class="mdi mdi-check-bold text-white text-[20px]"></span>
            </div>
            <div v-else
              class="size-10 rounded-full flex items-center justify-center ring-4 ring-white border-2 transition-transform group-hover:scale-105"
              :style="{ backgroundColor: step.iconBg, borderColor: step.iconColor + '33' }">
              <span class="mdi text-[18px]" :class="step.icon" :style="{ color: step.iconColor }"></span>
            </div>
            <span v-if="!step.completed"
              class="absolute -top-1 -right-1 size-[18px] rounded-full bg-white border border-[#e5e7eb] text-[9px] font-black text-[#6b7280] flex items-center justify-center tabular-nums shadow-sm">
              {{ idx + 1 }}
            </span>
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <p class="text-[13px] font-bold truncate transition-colors"
                :class="step.completed ? 'text-[#9ca3af] line-through decoration-[#d1d5db]' : 'text-[#1a1c1b]'">
                {{ step.label }}
              </p>
              <span v-if="!step.completed"
                class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-black tabular-nums whitespace-nowrap"
                :style="{ backgroundColor: step.iconBg, color: step.iconColor }">
                +{{ step.gp }} GP
              </span>
            </div>
            <p class="text-[11px] truncate mt-0.5"
              :class="step.completed ? 'text-[#b5b5b5]' : 'text-[#888]'">{{ step.description }}</p>
          </div>

          <button v-if="!step.completed" type="button"
            @click="emit('navigate', step.target)"
            class="shrink-0 inline-flex items-center gap-1 pl-3 pr-2.5 py-1.5 rounded-full text-white text-[11px] font-black transition-all shadow-sm hover:shadow-lg active:scale-95"
            :style="{ backgroundColor: step.iconColor }">
            {{ step.ctaLabel }}
            <span class="mdi mdi-arrow-right text-[12px]"></span>
          </button>
          <span v-else
            class="shrink-0 inline-flex items-center gap-1 text-emerald-600 text-[11px] font-black tabular-nums"
            title="Completado">
            +{{ step.gp }}
            <span class="mdi mdi-check-circle text-[14px]"></span>
          </span>
        </li>
      </ol>
    </div>

    <!-- ============ EXPANDABLE DETAILS (ranks + how to earn) ============ -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out overflow-hidden"
      leave-active-class="transition-all duration-200 ease-in overflow-hidden"
      enter-from-class="max-h-0 opacity-0"
      enter-to-class="max-h-[2400px] opacity-100"
      leave-from-class="max-h-[2400px] opacity-100"
      leave-to-class="max-h-0 opacity-0">
      <div v-if="showDetails && !collapsed"
        class="border-t border-white/[0.06]"
        style="background: linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(2,6,23,0.92) 100%);">
        <div class="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

          <!-- Ranks list -->
          <div>
            <p class="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-3">Tu camino</p>
            <div class="space-y-2">
              <div v-for="r in visibleRanks" :key="r.name"
                class="flex items-center gap-3 p-3 rounded-xl border transition-all"
                :class="r.isCurrent
                  ? 'bg-white/[0.1] border-white/25 shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                  : r.unlocked
                    ? 'bg-white/[0.04] border-white/[0.08]'
                    : 'bg-white/[0.03] border-white/[0.08]'">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-white/10"
                  :style="r.unlocked
                    ? { background: `linear-gradient(135deg, ${r.color}, ${r.color}bb)` }
                    : { backgroundColor: 'rgba(255,255,255,0.06)' }">
                  <span class="mdi text-[18px]" :class="r.icon" :style="{ color: r.unlocked ? '#ffffff' : 'rgba(255,255,255,0.5)' }"></span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <p class="text-[13px] font-black" :class="r.unlocked ? 'text-white' : 'text-white/70'">{{ r.name }}</p>
                    <span v-if="r.isCurrent" class="text-[9px] font-black px-2 py-0.5 rounded-full text-[#1a1c1b] bg-white uppercase tracking-widest">Actual</span>
                    <span v-else-if="r.isNext" class="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-[#1a1c1b] uppercase tracking-widest">Siguiente</span>
                    <span v-else-if="!r.unlocked" class="mdi mdi-lock-outline text-white/40 text-[12px]"></span>
                  </div>
                  <p class="text-[11px] text-white/60 truncate">{{ r.tagline }}</p>
                </div>
                <div class="text-right shrink-0">
                  <p class="text-[12px] font-black tabular-nums" :style="{ color: r.unlocked ? r.color : 'rgba(255,255,255,0.6)' }">{{ formatInt(r.minPoints) }}</p>
                  <p class="text-[9px] text-white/50 font-bold uppercase tracking-wider">GP</p>
                </div>
              </div>

              <div v-if="hiddenRanksCount > 0"
                class="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-dashed border-white/[0.12]">
                <div class="w-10 h-10 rounded-lg bg-white/[0.08] flex items-center justify-center shrink-0 ring-1 ring-white/5">
                  <span class="mdi mdi-help-circle-outline text-white/60 text-[18px]"></span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[13px] font-black text-white/70">??? · {{ hiddenRanksCount }} rangos por descubrir</p>
                  <p class="text-[11px] text-white/50">Sigue avanzando para desbloquear</p>
                </div>
                <span class="mdi mdi-lock text-white/50 text-[14px] shrink-0"></span>
              </div>
            </div>
          </div>

          <!-- Rewards list -->
          <div>
            <p class="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-3">Como ganar GP</p>
            <div class="space-y-2">
              <div v-for="a in creatorRewards" :key="a.id"
                class="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-colors">
                <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  :style="{ backgroundColor: a.color + '22' }">
                  <span class="mdi text-[16px]" :class="a.icon" :style="{ color: a.color }"></span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[12px] font-bold text-white truncate">{{ a.title }}</p>
                  <p class="text-[10px] text-white/50 leading-tight line-clamp-1">{{ a.description }}</p>
                </div>
                <span class="text-[12px] font-black tabular-nums shrink-0 min-w-[3rem] text-right" :style="{ color: a.color }">+{{ a.points }}</span>
              </div>
            </div>

            <button type="button" @click="emit('view-logros')"
              class="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-[11px] font-bold text-white bg-white/[0.08] hover:bg-white/[0.14] rounded-xl transition-colors border border-white/[0.06]">
              Ver panel completo de logros
              <span class="mdi mdi-arrow-right text-[12px]"></span>
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </div>
</template>
