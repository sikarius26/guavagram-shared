<script setup lang="ts">
import { computed } from 'vue'

// Onboarding hero for new creators — the FIRST thing they see on the home.
// States the value proposition + the 3 core actions (pick/review/bio) + 1
// secondary action (network). Auto-hides when the 3 core actions are done.

type CoreStepKey = 'firstPick' | 'firstReview' | 'bio'
type NetworkStepKey = 'invite'

const props = withDefaults(defineProps<{
  stepsCompleted?: Partial<Record<CoreStepKey | NetworkStepKey | 'socials', boolean>>
  // Show even if all 3 core actions are done (e.g. via a "Ver guía" link elsewhere)
  alwaysVisible?: boolean
}>(), {
  stepsCompleted: () => ({}),
  alwaysVisible: false,
})

const emit = defineEmits<{
  (e: 'navigate', target: 'home' | 'bio' | 'reviews' | 'campaigns' | 'offers' | 'affiliate' | 'settings'): void
}>()

// ─── Core actions ───
interface CoreAction {
  key: CoreStepKey
  icon: string
  emoji: string
  title: string
  subtitle: string
  earn: string              // what the user earns
  earnHighlight: string     // bold number/% in earn text
  target: 'bio' | 'reviews'
  ctaLabel: string
  color: string
  accentBg: string
  order: number
}

const coreActions = computed<CoreAction[]>(() => [
  {
    key: 'firstPick',
    icon: 'mdi-silverware-fork-knife',
    emoji: '🍽️',
    title: 'Añade restaurantes',
    subtitle: 'Recomienda los sitios que te encantan',
    earn: 'Hasta {{h}} por cada reserva',
    earnHighlight: '15%',
    target: 'bio',
    ctaLabel: 'Añadir pick',
    color: '#22c55e',
    accentBg: '#f0fdf4',
    order: 1,
  },
  {
    key: 'firstReview',
    icon: 'mdi-star-check-outline',
    emoji: '⭐',
    title: 'Escribe reseñas',
    subtitle: 'Ticket + foto del local = reseña verificada',
    earn: 'Activa tu {{h}}',
    earnHighlight: 'comisión',
    target: 'reviews',
    ctaLabel: 'Ir a reseñas',
    color: '#f59e0b',
    accentBg: '#fffbeb',
    order: 2,
  },
  {
    key: 'bio',
    icon: 'mdi-account-box-outline',
    emoji: '👤',
    title: 'Completa tu bio',
    subtitle: 'Foto, descripción, ciudad',
    earn: 'Las marcas te {{h}}',
    earnHighlight: 'encuentran',
    target: 'bio',
    ctaLabel: 'Editar bio',
    color: '#6366f1',
    accentBg: '#eef2ff',
    order: 3,
  },
])

// ─── Done / progress ───
const isDone = (key: CoreStepKey) => !!props.stepsCompleted[key]
const doneCount = computed(() => coreActions.value.filter(a => isDone(a.key)).length)
const totalCount = computed(() => coreActions.value.length)
const progressPct = computed(() => Math.round((doneCount.value / totalCount.value) * 100))
const allDone = computed(() => doneCount.value === totalCount.value)

const isVisible = computed(() => props.alwaysVisible || !allDone.value)

// Secondary: network invite
const inviteDone = computed(() => !!props.stepsCompleted.invite)

const handleCta = (target: 'bio' | 'reviews' | 'affiliate') => emit('navigate', target)
</script>

<template>
  <section v-if="isVisible"
    class="relative rounded-3xl overflow-hidden border border-[#1a1c1b]/10 bg-gradient-to-br from-[#fafaf7] via-white to-[#f0fdf4] shadow-[0_8px_28px_-12px_rgba(0,0,0,0.08)]">
    <!-- Ambient glows — amber (optimism) + green (growth/progress), no red flood -->
    <div class="pointer-events-none absolute -top-20 -left-16 w-[360px] h-[360px] rounded-full bg-amber-300/[0.12] blur-[100px]"></div>
    <div class="pointer-events-none absolute -bottom-24 -right-16 w-[320px] h-[320px] rounded-full bg-emerald-300/[0.14] blur-[100px]"></div>
    <div class="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full bg-indigo-200/[0.08] blur-[120px]"></div>

    <div class="relative p-6 lg:p-8">
      <!-- ============ HEADER ============ -->
      <div class="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div class="min-w-0">
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/15 border border-amber-500/30 mb-3">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            <p class="text-[10px] font-black uppercase tracking-[0.15em] text-amber-700">Empieza aquí</p>
          </div>
          <h2 class="text-[24px] lg:text-[32px] font-black tracking-[-0.03em] text-[#1a1c1b] leading-[1.05]">
            Gana dinero recomendando
            <span class="relative inline-block">
              <span class="relative z-10">restaurantes</span>
              <span class="absolute left-0 right-0 bottom-1 h-[6px] bg-amber-300/60 -z-0 rounded-sm"></span>
            </span>
          </h2>
          <p class="text-[14px] text-[#555] mt-2 leading-snug">
            <span v-if="doneCount === 0">3 pasos y empiezas a cobrar.</span>
            <span v-else-if="!allDone">Te queda{{ totalCount - doneCount === 1 ? '' : 'n' }} {{ totalCount - doneCount }} paso{{ totalCount - doneCount === 1 ? '' : 's' }}. Sigue así.</span>
            <span v-else>¡Tus 3 acciones core están listas! Ahora a generar.</span>
          </p>
        </div>

        <!-- Progress ring -->
        <div class="flex items-center gap-3 shrink-0">
          <div class="relative w-16 h-16">
            <svg viewBox="0 0 64 64" class="w-16 h-16 -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="#e7ebe7" stroke-width="6" fill="none" />
              <circle cx="32" cy="32" r="28" stroke="url(#onb-grad)" stroke-width="6" fill="none" stroke-linecap="round"
                :stroke-dasharray="Math.PI * 2 * 28"
                :stroke-dashoffset="((1 - progressPct / 100) * Math.PI * 2 * 28).toFixed(2)"
                style="transition: stroke-dashoffset 600ms ease" />
              <defs>
                <linearGradient id="onb-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#22c55e" />
                  <stop offset="100%" stop-color="#16a34a" />
                </linearGradient>
              </defs>
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <p class="text-[14px] font-black text-[#1a1c1b] tabular-nums leading-none">{{ doneCount }}<span class="text-[#999] font-bold">/{{ totalCount }}</span></p>
              <p class="text-[8px] font-bold text-[#888] uppercase tracking-wider">pasos</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ============ 3 CORE ACTIONS ============ -->
      <!-- Each card keeps its accent color (green/amber/indigo) as identity.
           Active vs done is told through the CTA (pill = do this now, link = already done). -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 relative z-10">
        <button v-for="a in coreActions" :key="a.key"
          type="button"
          @click="handleCta(a.target)"
          class="group relative text-left rounded-2xl bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-[0_16px_32px_-12px_rgba(0,0,0,0.18)] overflow-hidden flex flex-col ring-1 ring-[#1a1c1b]/10 hover:ring-[#1a1c1b]/25">

          <!-- Step number + status. "Done" is a universal semantic state → always emerald,
               not the card's accent color. Only the card's big icon keeps its identity color. -->
          <div class="flex items-center justify-between mb-3">
            <span class="size-7 rounded-full flex items-center justify-center text-[11px] font-black"
              :style="isDone(a.key)
                ? { backgroundColor: '#ecfdf5', color: '#059669' }
                : { backgroundColor: a.accentBg, color: a.color }">
              <span v-if="isDone(a.key)" class="mdi mdi-check-bold text-[14px]"></span>
              <span v-else>{{ a.order }}</span>
            </span>
            <span v-if="isDone(a.key)"
              class="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-600">
              <span class="mdi mdi-check-circle text-[12px]"></span> Hecho
            </span>
          </div>

          <!-- Big icon — always in card's accent color -->
          <div class="mb-3">
            <div class="inline-flex size-14 rounded-2xl items-center justify-center shadow-[0_6px_16px_-4px_rgba(0,0,0,0.15)]"
              :style="{ background: `linear-gradient(135deg, ${a.color} 0%, ${a.color}cc 100%)` }">
              <span class="mdi text-[26px] text-white" :class="a.icon"></span>
            </div>
          </div>

          <!-- Title + subtitle -->
          <h3 class="text-[16px] font-black text-[#1a1c1b] leading-tight mb-1">{{ a.title }}</h3>
          <p class="text-[12px] text-[#666] leading-snug mb-3">{{ a.subtitle }}</p>

          <!-- Earn chip — always in card's accent color -->
          <div class="flex items-center gap-1.5 mb-4">
            <span class="mdi mdi-currency-eur text-[14px]" :style="{ color: a.color }"></span>
            <p class="text-[12px] font-semibold text-[#555] leading-snug">
              <template v-for="(part, i) in a.earn.split('{{h}}')" :key="i">
                <span v-if="i > 0" class="font-black" :style="{ color: a.color }">{{ a.earnHighlight }}</span>{{ part }}
              </template>
            </p>
          </div>

          <!-- CTA — unified emerald across all cards. Navegar no es una acción que
               necesite color distinto por card; el color solo aporta ruido. El
               icono grande ya lleva la identidad visual del paso. -->
          <div class="mt-auto">
            <span
              class="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-white text-[12px] font-black shadow-sm"
              style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
              <template v-if="isDone(a.key)">
                Ver mis {{ a.key === 'bio' ? 'datos' : (a.key === 'firstPick' ? 'picks' : 'reseñas') }}
              </template>
              <template v-else>{{ a.ctaLabel }}</template>
              <span class="mdi mdi-arrow-right text-[13px] group-hover:translate-x-0.5 transition-transform"></span>
            </span>
          </div>
        </button>
      </div>

      <!-- ============ SECONDARY: NETWORK / L2 ============ -->
      <!-- Neutral surface, emerald only on % (gain), black CTA. Secondary action
           deliberately muted so it doesn't compete with the main 3 above. -->
      <button type="button" @click="handleCta('affiliate')"
        class="group mt-3 w-full text-left rounded-2xl bg-white/70 backdrop-blur-sm ring-1 ring-[#e5e5e5] p-4 flex items-center gap-3 transition-all hover:bg-white hover:ring-[#1a1c1b]/20 hover:-translate-y-0.5 flex-wrap">
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <div class="size-10 rounded-xl flex items-center justify-center shrink-0 bg-[#f5f5f5] ring-1 ring-[#e5e5e5]">
            <span class="mdi mdi-account-multiple-plus-outline text-[#1a1c1b] text-[18px]"></span>
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <p class="text-[13px] font-black text-[#1a1c1b]">Y además: invita a otros creators</p>
              <span v-if="inviteDone"
                class="inline-flex items-center gap-0.5 text-[9px] font-black text-[#9ca3af] uppercase tracking-wider">
                <span class="mdi mdi-check-circle text-[11px]"></span> Hecho
              </span>
            </div>
            <p class="text-[11px] text-[#666] mt-0.5 leading-snug">
              Ganas <span class="font-black text-emerald-700">15%</span> de lo que facturen tus invitados directos
              <span class="text-[#999]">(L1)</span> + <span class="font-black text-emerald-700">10%</span> de lo que facturen los suyos
              <span class="text-[#999]">(L2)</span>.
            </p>
          </div>
        </div>
        <span class="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-[#1a1c1b] text-white text-[11px] font-black shrink-0 group-hover:bg-black transition-colors">
          Invitar creators
          <span class="mdi mdi-arrow-right text-[12px] group-hover:translate-x-0.5 transition-transform"></span>
        </span>
      </button>

      <!-- ============ Progress bar (bottom) — solid emerald ============ -->
      <div class="mt-4 flex items-center gap-3">
        <div class="flex-1 h-2 rounded-full bg-[#e5e7eb] overflow-hidden">
          <div class="h-full rounded-full bg-emerald-500 transition-all duration-700 ease-out"
            :style="{ width: progressPct + '%' }"></div>
        </div>
        <p class="text-[11px] font-bold text-[#666] tabular-nums shrink-0">
          {{ doneCount }}/{{ totalCount }} · {{ progressPct }}%
        </p>
      </div>
    </div>
  </section>
</template>
