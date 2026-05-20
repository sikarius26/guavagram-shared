<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useGamification } from '~/composables/useGamification'

const {
  profile,
  currentRank,
  nextRank,
  progressToNextRank,
  streakMultiplier,
  RANKS,
  loadProfile,
} = useGamification()

const totalPoints = computed(() => profile.value?.totalPoints ?? 0)
const availablePoints = computed(() => profile.value?.availablePoints ?? totalPoints.value)
const streak = computed(() => profile.value?.currentStreak ?? 0)

// ─────────────────────────────────────────────────────────────────────────────
// Creator-specific achievements (logros)
// ─────────────────────────────────────────────────────────────────────────────
interface CreatorAchievement {
  id: string
  title: string
  description: string
  icon: string
  color: string
  points: number
  unlocked: boolean
  category: string
}

const achievements = computed<CreatorAchievement[]>(() => {
  const p: any = profile.value ?? {}
  const total = totalPoints.value
  return [
    // Onboarding
    { id: 'first-pick',         category: 'Onboarding',  title: 'Primera recomendación',     description: 'Añade tu primer pick al perfil',                            icon: 'mdi-silverware-fork-knife',  color: '#22c55e', points: 100, unlocked: !!p.hasFirstPick || total >= 100 },
    { id: 'bio-complete',       category: 'Onboarding',  title: 'Bio al 100%',               description: 'Foto, descripción, ciudad y enlaces',                       icon: 'mdi-account-box-outline',    color: '#0ea5e9', points: 75,  unlocked: !!p.hasCompleteBio },
    { id: 'socials-connected',  category: 'Onboarding',  title: 'Redes conectadas',          description: 'Instagram y TikTok vinculados',                             icon: 'mdi-instagram',              color: '#e1306c', points: 75,  unlocked: !!p.hasSocials },
    // Reputación
    { id: 'verified-review',    category: 'Reputación',  title: 'Reseña verificada',         description: 'Ticket + foto del local — activa afiliación',               icon: 'mdi-star-check-outline',     color: '#f59e0b', points: 150, unlocked: !!p.hasVerifiedReview },
    { id: 'ten-reviews',        category: 'Reputación',  title: '10 reseñas verificadas',    description: 'Demuestra constancia como creator',                         icon: 'mdi-star-four-points',       color: '#f59e0b', points: 500, unlocked: (p.verifiedReviewCount ?? 0) >= 10 },
    { id: 'featured-photo',     category: 'Reputación',  title: 'Foto destacada',            description: 'Un restaurante destaca una foto tuya',                      icon: 'mdi-camera-iris',            color: '#f97316', points: 50,  unlocked: (p.featuredPhotoCount ?? 0) > 0 },
    // Red / referidos
    { id: 'first-invite',       category: 'Red',         title: 'Primer creator invitado',   description: 'Tu red L2 empieza a mover GP',                              icon: 'mdi-account-multiple-plus-outline', color: '#10b981', points: 100, unlocked: (p.invitedCreators ?? 0) >= 1 },
    { id: 'five-invites',       category: 'Red',         title: 'Comunidad creator',         description: '5 creators invitados por ti',                               icon: 'mdi-account-group-outline',  color: '#10b981', points: 400, unlocked: (p.invitedCreators ?? 0) >= 5 },
    { id: 'first-booking-pick', category: 'Red',         title: 'Primera reserva desde pick',description: 'Alguien reserva gracias a tu recomendación',                icon: 'mdi-calendar-check',         color: '#22c55e', points: 30,  unlocked: (p.bookingsFromPicks ?? 0) >= 1 },
    { id: 'code-redeemed',      category: 'Red',         title: 'Código canjeado',           description: 'Tu código se usa en un restaurante',                        icon: 'mdi-ticket-percent',         color: '#6366f1', points: 25,  unlocked: (p.codeRedemptions ?? 0) >= 1 },
    // Contenido
    { id: 'tag-store',          category: 'Contenido',   title: 'Tag al restaurante',        description: 'Menciona al local en una story o reel externo',             icon: 'mdi-at',                     color: '#a855f7', points: 75,  unlocked: (p.externalTagCount ?? 0) > 0 },
    { id: 'campaign-done',      category: 'Contenido',   title: 'Primera campaña',           description: 'Entregas el deliverable de una colab',                      icon: 'mdi-flag-checkered',         color: '#8b5cf6', points: 200, unlocked: (p.completedCampaigns ?? 0) >= 1 },
    // Fidelidad
    { id: 'week-streak',        category: 'Fidelidad',   title: 'Racha de 7 días',           description: 'Una semana seguida activo',                                  icon: 'mdi-fire',                   color: '#f97316', points: 50,  unlocked: streak.value >= 7 },
    { id: 'month-streak',       category: 'Fidelidad',   title: 'Racha de 30 días',          description: 'Un mes entero en Guavagram',                                icon: 'mdi-fire',                   color: '#ef4444', points: 300, unlocked: streak.value >= 30 },
    // Rangos
    { id: 'rank-foodie',        category: 'Rangos',      title: 'Foodie',                    description: 'Alcanza el rango Foodie',                                    icon: 'mdi-fire',                   color: '#f97316', points: 250, unlocked: total >= 250 },
    { id: 'rank-critico',       category: 'Rangos',      title: 'Crítico',                   description: 'Alcanza el rango Crítico',                                   icon: 'mdi-star-shooting',          color: '#8b5cf6', points: 750, unlocked: total >= 750 },
    { id: 'rank-gourmet',       category: 'Rangos',      title: 'Gourmet',                   description: 'Alcanza el rango Gourmet',                                   icon: 'mdi-diamond-stone',          color: '#0ea5e9', points: 2000, unlocked: total >= 2000 },
    { id: 'rank-embajador',     category: 'Rangos',      title: 'Embajador',                 description: 'Alcanza el rango Embajador',                                 icon: 'mdi-shield-crown',           color: '#f59e0b', points: 5000, unlocked: total >= 5000 },
    { id: 'rank-leyenda',       category: 'Rangos',      title: 'Leyenda',                   description: 'Inmortal del sabor',                                         icon: 'mdi-crown',                  color: '#ef4444', points: 15000, unlocked: total >= 15000 },
  ]
})

const unlockedAchievements = computed(() => achievements.value.filter(a => a.unlocked))

// ─────────────────────────────────────────────────────────────────────────────
// Earn categories (how to get GP)
// ─────────────────────────────────────────────────────────────────────────────
const earnCategories = [
  {
    category: 'Onboarding',
    color: '#10b981',
    icon: 'mdi-rocket-launch-outline',
    description: 'Empieza con buen pie',
    items: [
      { icon: 'mdi-instagram',                    label: 'Conectar redes sociales',            points: '75'  },
      { icon: 'mdi-account-box-outline',          label: 'Bio pública al 100%',                points: '75'  },
      { icon: 'mdi-silverware-fork-knife',        label: 'Añadir primera recomendación',       points: '100' },
      { icon: 'mdi-star-check-outline',           label: 'Primera reseña verificada',          points: '150' },
      { icon: 'mdi-gift-outline',                 label: 'Bonus por completar onboarding',     points: '200' },
    ],
  },
  {
    category: 'Reputación',
    color: '#f59e0b',
    icon: 'mdi-star-outline',
    description: 'Tu criterio genera confianza',
    items: [
      { icon: 'mdi-star-check-outline',           label: 'Reseña verificada (ticket + foto)',  points: '150' },
      { icon: 'mdi-camera-iris',                  label: 'Foto destacada por el local',        points: '50'  },
      { icon: 'mdi-thumb-up-outline',             label: 'Reseña marcada útil',                points: '10'  },
    ],
  },
  {
    category: 'Red / referidos',
    color: '#10b981',
    icon: 'mdi-account-multiple-plus-outline',
    description: 'Tu red L2 te paga en GP y en €',
    items: [
      { icon: 'mdi-account-multiple-plus-outline', label: 'Invitar a otro creator',            points: '100' },
      { icon: 'mdi-calendar-check',               label: 'Reserva desde tu pick',              points: '30'  },
      { icon: 'mdi-ticket-percent',               label: 'Código canjeado por un usuario',     points: '25'  },
    ],
  },
  {
    category: 'Contenido',
    color: '#a855f7',
    icon: 'mdi-image-multiple-outline',
    description: 'Crea y menciona',
    items: [
      { icon: 'mdi-at',                           label: 'Tag al restaurante en stories/reels',points: '75'  },
      { icon: 'mdi-flag-checkered',               label: 'Campaña / colab completada',         points: '200' },
    ],
  },
  {
    category: 'Fidelidad',
    color: '#f97316',
    icon: 'mdi-fire',
    description: 'Constancia = multiplicador',
    items: [
      { icon: 'mdi-calendar-check-outline',       label: 'Racha 7 días activos',               points: '50'  },
      { icon: 'mdi-calendar-month-outline',       label: 'Racha 30 días activos',              points: '300' },
      { icon: 'mdi-lightning-bolt',               label: 'Multiplicador x1.5 / x2 / x3',       points: '—'   },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Rewards catalog (what you can redeem)
// ─────────────────────────────────────────────────────────────────────────────
const creatorRewardsCatalog = [
  { icon: 'mdi-rocket-launch', gradient: 'from-violet-100 to-purple-200', iconColor: 'text-violet-700',
    title: 'Boost de perfil 7 días',   desc: 'Tu perfil público destaca en búsquedas y descubrimiento', points: '500' },
  { icon: 'mdi-crown-outline', gradient: 'from-amber-100 to-yellow-200', iconColor: 'text-amber-700',
    title: 'Badge "Creator verificado" extra', desc: 'Aceleras la verificación oficial de 100 contactos', points: '1500' },
  { icon: 'mdi-store-plus',    gradient: 'from-emerald-100 to-emerald-200', iconColor: 'text-emerald-700',
    title: 'Pitch directo a un restaurante top', desc: 'Presentas campaña personalizada a un local verificado', points: '800' },
  { icon: 'mdi-cash-multiple', gradient: 'from-green-100 to-emerald-200', iconColor: 'text-green-700',
    title: '10€ voucher restaurante',  desc: 'Canjeable en cualquier local Guavagram',                 points: '1000' },
  { icon: 'mdi-email-fast-outline', gradient: 'from-sky-100 to-blue-200', iconColor: 'text-sky-700',
    title: 'Push a tus seguidores',    desc: 'Una notificación a todos los que te siguen',             points: '400' },
  { icon: 'mdi-account-star-outline', gradient: 'from-pink-100 to-rose-200', iconColor: 'text-rose-700',
    title: 'Aparición en home 48h',    desc: 'Tu perfil aparece en la home de descubrimiento',         points: '2500' },
]

const parsePoints = (s: string) => {
  const n = parseInt(s.replace(/[^0-9]/g, ''), 10)
  return isNaN(n) ? Infinity : n
}

onMounted(() => {
  if (!profile.value) void loadProfile()
})
</script>

<template>
  <div class="flex flex-col">

    <!-- ===== HERO ===== -->
    <section class="relative min-h-[280px] lg:min-h-[340px] overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-[#0d1f1a] via-[#1A3C34] to-[#0a2b23]"></div>
      <div class="absolute -top-40 right-[5%] w-[600px] h-[600px] rounded-full blur-[160px] opacity-30"
        :style="{ backgroundColor: currentRank.color }"></div>
      <div class="absolute -bottom-40 -left-20 w-[400px] h-[400px] rounded-full blur-[120px] opacity-20"
        :style="{ backgroundColor: nextRank ? nextRank.color : currentRank.color }"></div>
      <div class="absolute inset-0 opacity-[0.04]"
        style="background-image: linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px); background-size: 48px 48px;"></div>
      <div class="absolute top-10 right-[8%] text-white/[0.06] text-[140px] rotate-[-8deg] pointer-events-none">
        <span class="mdi" :class="currentRank.icon"></span>
      </div>

      <div class="relative p-6 lg:p-10 pt-10 lg:pt-14 z-10">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-4"
          :style="{ backgroundColor: currentRank.color + '26', borderColor: currentRank.color + '66' }">
          <span class="w-1.5 h-1.5 rounded-full animate-pulse" :style="{ backgroundColor: currentRank.color }"></span>
          <p class="text-[11px] font-black uppercase tracking-[0.2em]" :style="{ color: currentRank.color }">Tus GuavaPoints como creator</p>
        </div>
        <h1 class="text-[36px] lg:text-[52px] font-black text-white tracking-[-0.04em] leading-[0.95] mb-3">
          Tus <span :style="{ color: currentRank.color }">GuavaPoints</span><br/>de creator
        </h1>
        <p class="text-[15px] leading-relaxed max-w-md mb-8" style="color: rgba(255, 255, 255, 0.85);">
          Gana GP creando contenido, trayendo reservas y recomendando restaurantes. Canjéalos por beneficios de creator.
        </p>

        <!-- KPIs -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div class="rounded-2xl bg-white border border-[#e5e5e5] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div class="flex items-center gap-2 mb-2">
              <div class="size-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                <span class="mdi mdi-wallet text-emerald-600 text-[15px]"></span>
              </div>
              <p class="text-[10px] font-bold text-[#888] uppercase tracking-[0.15em]">GP disponibles</p>
            </div>
            <p class="text-[24px] lg:text-[28px] font-black tracking-[-0.03em] text-[#1a1c1b] tabular-nums leading-none">
              {{ availablePoints.toLocaleString('es-ES') }}
            </p>
          </div>

          <div class="rounded-2xl bg-white border border-[#e5e5e5] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div class="flex items-center gap-2 mb-2">
              <div class="size-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <span class="mdi mdi-trophy text-amber-600 text-[15px]"></span>
              </div>
              <p class="text-[10px] font-bold text-[#888] uppercase tracking-[0.15em]">Logros</p>
            </div>
            <p class="text-[24px] lg:text-[28px] font-black tracking-[-0.03em] text-[#1a1c1b] tabular-nums leading-none">
              {{ unlockedAchievements.length }}<span class="text-[#888] text-[16px] font-bold">/{{ achievements.length }}</span>
            </p>
          </div>

          <div class="rounded-2xl bg-white border border-[#e5e5e5] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div class="flex items-center gap-2 mb-2">
              <div class="size-7 rounded-lg flex items-center justify-center"
                :style="{ backgroundColor: currentRank.color + '18' }">
                <span class="mdi text-[15px]" :class="currentRank.icon" :style="{ color: currentRank.color }"></span>
              </div>
              <p class="text-[10px] font-bold text-[#888] uppercase tracking-[0.15em]">Rango actual</p>
            </div>
            <p class="text-[20px] lg:text-[22px] font-black tracking-[-0.03em] text-[#1a1c1b] leading-none">
              {{ currentRank.name }}
            </p>
          </div>

          <div class="rounded-2xl bg-white border border-[#e5e5e5] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div class="flex items-center gap-2 mb-2">
              <div class="size-7 rounded-lg bg-orange-50 flex items-center justify-center">
                <span class="mdi mdi-fire text-orange-500 text-[15px]"></span>
              </div>
              <p class="text-[10px] font-bold text-[#888] uppercase tracking-[0.15em]">Racha</p>
            </div>
            <p class="text-[24px] lg:text-[28px] font-black tracking-[-0.03em] text-[#1a1c1b] tabular-nums leading-none">
              {{ streak }}<span class="text-[#888] text-[14px] font-bold ml-1">días</span>
              <span v-if="streakMultiplier > 1"
                class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black align-middle"
                style="background: #fef3c7; color: #b45309;">x{{ streakMultiplier }}</span>
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== CONTENT ===== -->
    <div class="px-6 lg:px-10 py-10 space-y-8 bg-gradient-to-br from-[#fff8f6] via-white to-[#f0f4ff]">

      <!-- ===== RANKS + ACHIEVEMENTS ===== -->
      <div class="bg-white rounded-3xl border border-[#e5e5e5] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
        <!-- Rank bar -->
        <div class="p-6 lg:p-8 relative overflow-hidden" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);">
          <div class="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-[60px] opacity-25"
            :style="{ backgroundColor: currentRank.color }"></div>
          <div class="relative z-10 flex items-center justify-between gap-6 flex-wrap">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center ring-1 ring-white/10 shadow-lg"
                :style="{ background: `linear-gradient(135deg, ${currentRank.color}, ${currentRank.color}bb)` }">
                <span class="mdi text-white text-[26px] drop-shadow" :class="currentRank.icon"></span>
              </div>
              <div>
                <p class="text-white/40 text-[9px] font-bold uppercase tracking-[0.2em] mb-1">Tu rango como creator</p>
                <h3 class="text-[24px] font-black text-white tracking-tight leading-none">{{ currentRank.name }}</h3>
                <p class="text-white/50 text-[11px] mt-1">{{ currentRank.tagline }}</p>
              </div>
            </div>
            <div class="flex-1 min-w-[220px] max-w-[420px]">
              <div v-if="nextRank" class="flex justify-between text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1.5">
                <span>{{ totalPoints.toLocaleString('es-ES') }} GP</span>
                <span>Siguiente: {{ nextRank.name }} · {{ nextRank.minPoints.toLocaleString('es-ES') }} GP</span>
              </div>
              <div v-if="nextRank" class="h-2 bg-white/10 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-1000 ease-out"
                  :style="{ width: progressToNextRank + '%', background: `linear-gradient(90deg, ${currentRank.color}, ${nextRank.color})` }"></div>
              </div>
              <div v-else class="text-center text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                <span class="mdi mdi-crown"></span> Máximo rango alcanzado
              </div>
            </div>
            <div class="flex flex-col items-center bg-white/5 rounded-xl px-4 py-2.5 border border-white/10">
              <p class="text-[22px] font-black text-white tabular-nums leading-none">
                {{ unlockedAchievements.length }}<span class="text-white/30 text-[14px]">/{{ achievements.length }}</span>
              </p>
              <p class="text-[9px] font-bold text-white/40 uppercase tracking-wider mt-1">Logros</p>
            </div>
          </div>

          <!-- All ranks path -->
          <div class="mt-7 grid grid-cols-3 md:grid-cols-6 gap-2 relative z-10">
            <div v-for="r in RANKS" :key="r.name"
              class="rounded-xl p-3 text-center transition-all"
              :class="totalPoints >= r.minPoints
                ? 'bg-white/[0.08] border border-white/[0.14]'
                : 'bg-white/[0.02] border border-white/[0.06]'">
              <div class="size-9 mx-auto rounded-lg flex items-center justify-center mb-1.5 ring-1 ring-white/10"
                :style="totalPoints >= r.minPoints
                  ? { background: `linear-gradient(135deg, ${r.color}, ${r.color}bb)` }
                  : { backgroundColor: 'rgba(255,255,255,0.06)' }">
                <span class="mdi text-[17px]" :class="r.icon"
                  :style="{ color: totalPoints >= r.minPoints ? '#fff' : 'rgba(255,255,255,0.5)' }"></span>
              </div>
              <p class="text-[11px] font-black"
                :class="totalPoints >= r.minPoints ? 'text-white' : 'text-white/50'">{{ r.name }}</p>
              <p class="text-[9px] tabular-nums font-bold mt-0.5"
                :style="{ color: totalPoints >= r.minPoints ? r.color : 'rgba(255,255,255,0.35)' }">
                {{ r.minPoints.toLocaleString('es-ES') }} GP
              </p>
            </div>
          </div>
        </div>

        <!-- Achievements grid -->
        <div class="p-6 lg:p-8">
          <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
                <span class="mdi mdi-trophy-award text-amber-600 text-[20px]"></span>
              </div>
              <div>
                <h3 class="text-[16px] font-bold text-[#1a1c1b] tracking-tight">Logros del creator</h3>
                <p class="text-[12px] text-[#888]">Completa hitos para subir de rango y desbloquear beneficios</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div v-for="ach in achievements" :key="ach.id"
              class="rounded-2xl border p-4 flex items-start gap-3 transition-all"
              :class="ach.unlocked
                ? 'bg-gradient-to-br from-white to-[#fafafa] border-[#e5e5e5] hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)]'
                : 'bg-[#fafafa] border-dashed border-[#e5e5e5] opacity-75'">
              <div class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all"
                :style="ach.unlocked ? { backgroundColor: ach.color + '15' } : { backgroundColor: '#f0f0f0' }">
                <span class="mdi text-[22px]" :class="ach.icon"
                  :style="{ color: ach.unlocked ? ach.color : '#bbb' }"></span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-0.5">
                  <p class="text-[13px] font-black truncate"
                    :class="ach.unlocked ? 'text-[#1a1c1b]' : 'text-[#888]'">{{ ach.title }}</p>
                  <span v-if="ach.unlocked" class="mdi mdi-check-decagram text-[#22c55e] text-[14px] shrink-0"></span>
                  <span v-else class="mdi mdi-lock-outline text-[#ccc] text-[12px] shrink-0"></span>
                </div>
                <p class="text-[11px] text-[#888] leading-relaxed line-clamp-2 mb-1.5">{{ ach.description }}</p>
                <span class="text-[10px] font-black tabular-nums"
                  :style="{ color: ach.unlocked ? ach.color : '#bbb' }">+{{ ach.points }} GP</span>
              </div>
            </div>
          </div>

          <p v-if="!unlockedAchievements.length" class="text-[12px] text-[#888] text-center mt-6 p-4 rounded-xl bg-[#fafafa] border border-dashed border-[#e5e5e5]">
            Aún no has desbloqueado ningún logro. Completa el onboarding para empezar.
          </p>
        </div>
      </div>

      <!-- ===== HOW TO EARN GP ===== -->
      <div class="bg-white rounded-3xl border border-[#e5e5e5] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div class="p-6 lg:p-7 border-b border-[#f0f0f0] flex items-start justify-between gap-4 bg-gradient-to-br from-[#fafafa] to-white">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center shadow-[0_4px_12px_rgba(16,185,129,0.2)]">
              <span class="mdi mdi-star-four-points text-emerald-700 text-[22px]"></span>
            </div>
            <div>
              <h3 class="text-[18px] font-black text-[#1a1c1b] tracking-tight">Cómo ganas GP como creator</h3>
              <p class="text-[12px] text-[#666] mt-0.5">Usa bien la plataforma — cada acción suma</p>
            </div>
          </div>
          <span class="shrink-0 px-3.5 py-1.5 rounded-full bg-[#1a1c1b] text-[11px] font-black text-white tabular-nums shadow-sm">
            {{ earnCategories.reduce((s, c) => s + c.items.length, 0) }} acciones
          </span>
        </div>

        <div class="p-6 lg:p-7 space-y-7">
          <div v-for="cat in earnCategories" :key="cat.category" class="relative">
            <div class="flex items-center gap-3 mb-4">
              <div class="relative">
                <div class="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                  :style="{ background: `linear-gradient(135deg, ${cat.color}20, ${cat.color}10)` }">
                  <span class="mdi text-[20px]" :class="cat.icon" :style="{ color: cat.color }"></span>
                </div>
                <div class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full ring-2 ring-white"
                  :style="{ backgroundColor: cat.color }"></div>
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="text-[12px] font-black uppercase tracking-[0.15em]" :style="{ color: cat.color }">{{ cat.category }}</h4>
                <p class="text-[11px] text-[#888] mt-0.5">{{ cat.description }}</p>
              </div>
              <span class="text-[10px] font-bold text-[#bbb] tabular-nums">{{ cat.items.length }}</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pl-4 relative">
              <div class="absolute top-0 bottom-0 left-0 w-0.5 rounded-full opacity-20"
                :style="{ backgroundColor: cat.color }"></div>
              <div v-for="item in cat.items" :key="item.label"
                class="group flex items-center justify-between gap-2 p-3 rounded-xl bg-white border border-[#eee] hover:border-transparent transition-all cursor-default"
                @mouseenter="($event.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px ${cat.color}20`"
                @mouseleave="($event.currentTarget as HTMLElement).style.boxShadow = ''">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    :style="{ backgroundColor: cat.color + '12' }">
                    <span class="mdi text-[15px]" :class="item.icon" :style="{ color: cat.color }"></span>
                  </div>
                  <span class="text-[12px] font-semibold text-[#1a1c1b] truncate">{{ item.label }}</span>
                </div>
                <span class="shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-black tabular-nums shadow-sm"
                  :style="{ background: `linear-gradient(135deg, ${cat.color}, ${cat.color}dd)`, color: '#fff' }">
                  +{{ item.points }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== REWARDS CATALOG ===== -->
      <div class="bg-white rounded-3xl border border-[#e5e5e5] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div class="p-6 lg:p-7 flex items-center justify-between border-b border-[#f0f0f0] bg-gradient-to-br from-[#fafafa] to-white">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#fef3c7] to-[#fde68a] flex items-center justify-center shadow-[0_4px_12px_rgba(245,158,11,0.2)]">
              <span class="mdi mdi-gift-outline text-[#f59e0b] text-[22px]"></span>
            </div>
            <div>
              <h3 class="text-[18px] font-black text-[#1a1c1b] tracking-tight">Canjea tus GP por beneficios</h3>
              <p class="text-[12px] text-[#666] mt-0.5">Boosts, aparición en home, vouchers y más</p>
            </div>
          </div>
          <div class="shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200">
            <span class="mdi mdi-wallet-outline text-emerald-700 text-[16px]"></span>
            <div>
              <p class="text-[10px] font-bold text-emerald-700 uppercase tracking-wider leading-none">Tu balance</p>
              <p class="text-[14px] font-black text-emerald-900 tabular-nums leading-none mt-0.5">{{ availablePoints.toLocaleString('es-ES') }} GP</p>
            </div>
          </div>
        </div>

        <div class="p-6 lg:p-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="(r, i) in creatorRewardsCatalog" :key="i"
            class="group rounded-2xl border border-[#e5e5e5] p-5 hover:border-emerald-300 hover:shadow-[0_8px_24px_rgba(16,185,129,0.1)] hover:-translate-y-0.5 transition-all cursor-pointer">
            <div class="flex items-start justify-between mb-4">
              <div class="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br"
                :class="r.gradient">
                <span class="mdi text-[22px]" :class="[r.icon, r.iconColor]"></span>
              </div>
              <span class="px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[10px] font-black tabular-nums shadow-sm">{{ r.points }} GP</span>
            </div>
            <p class="text-[14px] font-bold text-[#1a1c1b] mb-1">{{ r.title }}</p>
            <p class="text-[11px] text-[#888] leading-relaxed mb-4">{{ r.desc }}</p>
            <button
              :disabled="availablePoints < parsePoints(r.points)"
              class="w-full py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all"
              :class="availablePoints >= parsePoints(r.points)
                ? 'bg-[#1a1c1b] text-white hover:bg-[#2a2a2a] group-hover:bg-emerald-600'
                : 'bg-[#f5f5f5] text-[#bbb] cursor-not-allowed'">
              {{ availablePoints >= parsePoints(r.points) ? 'Canjear' : `Te faltan ${(parsePoints(r.points) - availablePoints).toLocaleString('es-ES')} GP` }}
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
