<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { creatorApiClient } from '~/services/apis/api.client.creator'

const { t } = useI18n()
import type { CreatorHomeStatsViewModel } from '~/services/apis/models/creator-home-stats-view-model'
import type { CreatorLevelViewModel } from '~/services/apis/models/creator-level-view-model'
import type { CreatorHomeActivityItem } from '~/services/apis/models/creator-home-activity-item'
import { useCurrentCreator } from '~/composables/useCurrentCreator'
import { useCreatorWallet } from '~/composables/useCreatorWallet'
import { useGamification } from '~/composables/useGamification'
import { notifier } from '~/services/notification'

import CreatorOnboardingHero from './CreatorOnboardingHero.vue'
import CreatorEarningsHero from './CreatorEarningsHero.vue'
import CreatorActivityFeed from './CreatorActivityFeed.vue'
import CreatorGpPanel from './CreatorGpPanel.vue'
import CreatorLevelBadge from '~/components/creator/shared/CreatorLevelBadge.vue'
import CreatorInformesPanel from '~/components/creator/informes/CreatorInformesPanel.vue'
import CreatorAffiliatePanel from '~/components/creator/affiliate/CreatorAffiliatePanel.vue'
import CreatorGamificationPanel from '~/components/creator/gamification/CreatorGamificationPanel.vue'

const emit = defineEmits<{
  (e: 'navigate', tab: 'home' | 'bio' | 'hub' | 'settings'): void
}>()

const { profile, load: loadCreator } = useCurrentCreator()

const {
  unlockableBalance,
  isVerified,
  daysUntilVerificationDeadline,
  isGracePeriodExpired,
  startVerification,
  VERIFICATION_GRACE_DAYS,
} = useCreatorWallet()

// Guava Points — cargado para alimentar el panel GP (rangos, streak, logros)
const { loadProfile: loadGpProfile } = useGamification()

const stats = ref<CreatorHomeStatsViewModel | null>(null)
const level = ref<CreatorLevelViewModel | null>(null)
const isLoading = ref(true)

// ---- Greeting ----
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 13) return t('goodMorning')
  if (h < 20) return t('goodAfternoon')
  return t('goodEvening')
})

const handle = computed(() => profile.value?.handle ?? 'creador')
const publicUrl = computed(() => `/u/${handle.value}`)
const levelCurrent = computed(() => (level.value?.level as unknown as number) ?? 0)

// ---- Earnings hero data (mock — wire to API) ----
const earningsData = computed(() => {
  const s: any = stats.value ?? {}
  const monthEur = Number(s.monthEarningsCents ? s.monthEarningsCents / 100 : s.earningsMonthEur ?? 124.5)
  const available = Number(s.availableEur ?? 124.5)
  const direct = Number(s.directEur ?? 45)
  const network = Number(s.networkEur ?? 62)
  const claims = Number(s.claimsEur ?? 17.5)
  const delta = Number(s.monthEarningsDelta ?? 12.4)
  return { monthEur, available, direct, network, claims, delta }
})

// ---- Drawers ----
const showInformesDrawer = ref(false)
const showWalletDrawer = ref(false)
const showLogrosDrawer = ref(false)
const openInformes = () => { showInformesDrawer.value = true }
const openWallet = () => { showWalletDrawer.value = true }
const openLogros = () => { showLogrosDrawer.value = true }
const closeDrawers = () => {
  showInformesDrawer.value = false
  showWalletDrawer.value = false
  showLogrosDrawer.value = false
}

const onCashout = () => openWallet()
const onVoucher = () => openWallet()

// ---- Referral link ----
const referralLink = computed(() => {
  const origin = typeof location !== 'undefined' ? location.origin : 'https://guavagram.com'
  return `${origin}/?ref=${handle.value}`
})
const copyReferralLink = async () => {
  try {
    await navigator.clipboard.writeText(referralLink.value)
    notifier.notifySuccess(t('linkCopied'))
  } catch {
    notifier.notifyError(t('couldNotCopyLink'))
  }
}

// ---- Referral actions ----
// Two clear CTAs: add a restaurant (N1 · 15%) or invite a creator (N2/N3 · 10/5%).
const inviteShareText = computed(() =>
  `Oye, en Guavagram cobro hasta 15% por recomendar los restaurantes que ya me gustan. Si te animas, entra por mi enlace y montamos red: ${referralLink.value}`
)
const inviteEmailSubject = 'Gana dinero recomendando restaurantes'
const inviteEmailBody = computed(() =>
  `Hola,\n\nEstoy en Guavagram cobrando comisión por recomendar los restaurantes que ya me gustan: cuando uno contrata el plan, me llevo hasta el 15%.\n\nSi te apuntas con mi enlace montamos red juntos y cobramos los dos:\n\n${referralLink.value}\n\n¡Un saludo!`
)

const showInviteMenu = ref(false)

const goAddRestaurant = () => {
  navigateTo('/r/new')
}

const openInviteCreator = async () => {
  // Native share sheet (mobile) — fall back to menu otherwise
  if (typeof navigator !== 'undefined' && typeof (navigator as any).share === 'function') {
    try {
      await (navigator as any).share({ title: 'Guavagram', text: inviteShareText.value })
      return
    } catch {
      // user cancelled — open the manual menu as fallback
    }
  }
  showInviteMenu.value = true
}

const shareWhatsApp = () => {
  const url = `https://wa.me/?text=${encodeURIComponent(inviteShareText.value)}`
  if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener')
  showInviteMenu.value = false
}
const shareEmail = () => {
  const url = `mailto:?subject=${encodeURIComponent(inviteEmailSubject)}&body=${encodeURIComponent(inviteEmailBody.value)}`
  if (typeof window !== 'undefined') window.location.href = url
  showInviteMenu.value = false
}
const copyAndCloseMenu = async () => {
  await copyReferralLink()
  showInviteMenu.value = false
}

// ---- Getting-started checklist state ----
// externalLinkTypeId: 1 = Instagram, 2 = TikTok (see CreatorSocialLinksEditor)
const onboardingSteps = computed(() => {
  const l: any = level.value ?? {}
  const p: any = profile.value ?? {}
  const links: { externalLinkTypeId: number; value: string }[] = p.externalLinks ?? []
  const hasSocial = links.some(x => (x.externalLinkTypeId === 1 || x.externalLinkTypeId === 2) && !!x.value?.trim())
  return {
    socials: hasSocial,
    bio: !!(p.bio && p.avatarUrl && p.city),
    // TODO: replace with dedicated flags (picksCount / verifiedReviewsCount / invitedCreatorsCount) once backend exposes them
    firstPick: (l.completedCampaigns ?? 0) > 0 || !!p.hasFirstPick,
    firstReview: !!p.hasVerifiedReview,
    invite: (l.invitedCreators ?? 0) > 0 || !!p.hasInvitedCreator,
  }
})

// Core onboarding = the 3 revenue-unlocking actions (pick / review / bio).
// While incomplete, the OnboardingHero is the star of the home and the GpPanel
// stays collapsed so we don't drown the user in gamification before action.
const coreOnboardingDone = computed(() =>
  !!onboardingSteps.value.firstPick &&
  !!onboardingSteps.value.firstReview &&
  !!onboardingSteps.value.bio
)

// Map checklist + earnings-hero target tabs onto the new collapsed nav
const onChildNavigate = (target: string) => {
  if (target === 'bio') return emit('navigate', 'bio')
  if (target === 'reviews' || target === 'campaigns' || target === 'offers') return emit('navigate', 'hub')
  if (target === 'affiliate') return openWallet()
  if (target === 'informes') return openInformes()
  if (target === 'settings') return emit('navigate', 'settings')
  emit('navigate', 'home')
}

// ---- Mock activity feed ----
const mockActivities = ref<CreatorHomeActivityItem[]>([
  { icon: 'mdi-account-plus', color: '#22c55e', text: '12 nuevos seguidores esta semana', time: 'Hace 2 horas', type: 'follower' },
  { icon: 'mdi-calendar-check', color: '#f59e0b', text: 'Nueva reserva en Bodega Nova desde tu pick', time: 'Hace 5 horas', type: 'booking' },
  { icon: 'mdi-ticket-percent', color: '#6366f1', text: 'Codigo ALEX10 canjeado 3 veces hoy', time: 'Hace 8 horas', type: 'code' },
  { icon: 'mdi-email', color: '#3b82f6', text: 'Propuesta recibida de Brunch & Co', time: 'Ayer', type: 'proposal' },
  { icon: 'mdi-star', color: '#f59e0b', text: 'Nueva reseña 5 estrellas', time: 'Ayer', type: 'review' },
  { icon: 'mdi-account-plus', color: '#22c55e', text: '8 nuevos seguidores', time: 'Hace 2 dias', type: 'follower' },
  { icon: 'mdi-calendar-check', color: '#f59e0b', text: 'Reserva confirmada en Pepe Tapas', time: 'Hace 3 dias', type: 'booking' },
  { icon: 'mdi-email', color: '#3b82f6', text: 'Propuesta de campana recibida', time: 'Hace 4 dias', type: 'proposal' },
  { icon: 'mdi-ticket-percent', color: '#6366f1', text: 'Codigo ALEXBRUNCH canjeado', time: 'Hace 5 dias', type: 'code' },
  { icon: 'mdi-account-plus', color: '#22c55e', text: '15 nuevos seguidores', time: 'Hace 6 dias', type: 'follower' },
])

// ---- Load data ----
onMounted(async () => {
  try {
    await loadCreator()
    const [statsRes, levelRes] = await Promise.all([
      creatorApiClient.creatorHomeStats(),
      creatorApiClient.creatorLevel(),
      loadGpProfile(),
    ])
    stats.value = statsRes
    level.value = levelRes
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[CreatorHomePanel] load error', err)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="p-6 lg:p-8 flex flex-col gap-6 bg-gradient-to-br from-[#fff8f6] via-white to-[#f0f4ff] min-h-full">

    <!-- ============ HERO ============ -->
    <div class="flex items-center justify-between flex-wrap gap-4 opacity-0 animate-fade-in-up">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl overflow-hidden bg-[#f0f0f0] flex items-center justify-center shrink-0 ring-2 ring-white shadow-sm">
          <img v-if="profile?.avatarUrl" :src="profile.avatarUrl" class="h-full w-full object-cover" alt="" />
          <span v-else class="mdi mdi-account text-[#666] text-xl"></span>
        </div>
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h2 class="text-[24px] lg:text-[28px] font-bold tracking-[-0.03em] text-[#1a1c1b]">
              {{ greeting }}, @{{ handle }}
            </h2>
            <CreatorLevelBadge :level="levelCurrent" size="sm" />
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-semibold">
              <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Online
            </span>
          </div>
          <p class="text-[13px] text-[#666]">Tu panel de creador</p>
        </div>
      </div>

      <NuxtLink
        :to="publicUrl"
        target="_blank"
        class="inline-flex items-center gap-2 px-4 py-2.5 text-white text-[11px] font-bold rounded-xl transition-all hover:-translate-y-0.5"
        style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow: 0 4px 12px rgba(16,185,129,0.25);"
      >
        <span class="mdi mdi-open-in-new text-sm"></span>
        Ver perfil publico
      </NuxtLink>
    </div>

    <!-- ============ VERIFICATION ALERT (sólo si hay balance bloqueado) ============ -->
    <div
      v-if="!isVerified && unlockableBalance > 0"
      class="opacity-0 animate-fade-in-up rounded-2xl border p-4 flex items-start gap-3 flex-wrap"
      :class="isGracePeriodExpired ? 'bg-red-50 border-red-200' : 'bg-blue-50/40 border-[#2196f3]/30'"
      style="animation-delay: 10ms"
    >
      <div class="size-10 rounded-xl flex items-center justify-center shrink-0"
        :class="isGracePeriodExpired ? 'bg-red-100' : 'bg-blue-100'">
        <span class="mdi text-[18px]"
          :class="isGracePeriodExpired ? 'mdi-alert-circle text-red-600' : 'mdi-check-decagram text-[#1976d2]'"></span>
      </div>
      <div class="flex-1 min-w-[260px]">
        <p class="text-[13px] font-black text-[#1a1c1b]">
          <template v-if="isGracePeriodExpired">Período de gracia expirado — tus créditos empezarán a caducar</template>
          <template v-else>Verifica tu cuenta para cobrar en efectivo</template>
        </p>
        <p class="text-[11px] mt-0.5 leading-relaxed"
          :class="isGracePeriodExpired ? 'text-red-700' : 'text-[#1976d2]'">
          <template v-if="isGracePeriodExpired">
            Plazo de {{ VERIFICATION_GRACE_DAYS }} días superado. 1/3 de tus créditos caducarán cada mes hasta que te verifiques o los conviertas en vouchers.
          </template>
          <template v-else>
            Tienes <b>{{ unlockableBalance.toFixed(2) }}€</b> bloqueados. Verifícate en los próximos
            <b>{{ daysUntilVerificationDeadline }} días</b> o conviértelos en vouchers restaurante.
          </template>
        </p>
      </div>
      <div class="flex gap-2 shrink-0">
        <button
          type="button"
          @click="startVerification"
          class="px-3 py-2 rounded-xl text-white text-[11px] font-bold transition-all inline-flex items-center gap-1.5 shadow-[0_4px_12px_rgba(33,150,243,0.25)]"
          style="background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);"
        >
          <span class="mdi mdi-shield-check-outline text-[13px]"></span>
          Verificar
        </button>
        <button
          type="button"
          @click="openWallet"
          class="px-3 py-2 rounded-xl border border-[#2196f3]/30 bg-white text-[#1976d2] text-[11px] font-bold hover:bg-blue-50 transition-colors inline-flex items-center gap-1.5"
        >
          Vouchers
        </button>
      </div>
    </div>

    <!-- ============ ONBOARDING HERO (value prop + 3 core actions) ============ -->
    <!-- Shown until the 3 core actions are done — then collapses to the GpPanel rank view. -->
    <div v-if="!coreOnboardingDone" class="opacity-0 animate-fade-in-up" style="animation-delay: 15ms">
      <CreatorOnboardingHero
        :steps-completed="onboardingSteps"
        @navigate="onChildNavigate"
      />
    </div>

    <!-- ============ GUAVA POINTS PANEL (rango + logros) ============ -->
    <!-- While onboarding is incomplete, hide the big gamification panel to keep
         the focus on "what to do". User still accesses it via the sidebar /
         "Ver logros" link inside the onboarding hero footer. -->
    <div v-if="coreOnboardingDone" class="opacity-0 animate-fade-in-up" style="animation-delay: 20ms">
      <CreatorGpPanel
        :steps-completed="onboardingSteps"
        @navigate="onChildNavigate"
        @view-logros="openLogros"
      />
    </div>

    <!-- ============ EARNINGS + WALLET (unificado) ============ -->
    <div class="opacity-0 animate-fade-in-up flex flex-col gap-3" style="animation-delay: 40ms">
      <CreatorEarningsHero
        :available-eur="earningsData.available"
        :direct-eur="earningsData.direct"
        :network-eur="earningsData.network"
        :claims-eur="earningsData.claims"
        :month-earnings-eur="earningsData.monthEur"
        :month-earnings-delta="earningsData.delta"
        @cashout="onCashout"
        @voucher="onVoucher"
        @navigate="(t) => onChildNavigate(t as string)"
      />

      <!-- Referral link + acceso al wallet completo — neutral surface,
           emerald only on % (gain), red only on the Copy CTA (action). -->
      <div class="relative rounded-2xl p-4 flex flex-wrap items-center gap-3 overflow-hidden ring-1 ring-[#e5e5e5] bg-white shadow-[0_4px_12px_-6px_rgba(0,0,0,0.06)]">

        <!-- Gift icon — neutral surface, dark monochrome icon -->
        <div class="relative size-11 rounded-2xl flex items-center justify-center shrink-0 bg-[#f5f5f5] ring-1 ring-[#e5e5e5]">
          <span class="mdi mdi-gift-outline text-[#1a1c1b] text-[19px]"></span>
        </div>

        <div class="relative flex-1 min-w-[280px]">
          <p class="text-[13px] font-black text-[#1a1c1b] tracking-tight leading-tight">Crea tu red y cobra en 3 niveles</p>
          <p class="text-[10.5px] text-[#6b6560] mt-0.5 leading-snug">Trae restaurantes o creadores. Cobras sobre lo que pagan a Guava.</p>

          <!-- Visual chain: cada fila es un nivel de la red (más lejos = menos %) -->
          <div class="flex flex-col gap-1 mt-2">
            <!-- N1: TÚ → Restaurante = 15% -->
            <div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/20">
              <span class="text-[9px] font-black text-emerald-800 bg-white rounded-md px-1.5 py-0.5 ring-1 ring-emerald-500/30">TÚ</span>
              <span class="mdi mdi-arrow-right-thin text-emerald-600 text-[14px]"></span>
              <span class="inline-flex items-center gap-1 text-[10px] font-bold text-[#1a1c1b]">
                <span class="mdi mdi-silverware-fork-knife text-[13px]"></span>
                Restaurante
              </span>
              <span class="ml-auto text-[12px] font-black text-emerald-700">15%</span>
            </div>

            <!-- N2: TÚ → Creador → Restaurante = 10% -->
            <div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/[0.06] ring-1 ring-emerald-500/15">
              <span class="text-[9px] font-black text-emerald-800 bg-white rounded-md px-1.5 py-0.5 ring-1 ring-emerald-500/30">TÚ</span>
              <span class="mdi mdi-arrow-right-thin text-emerald-600 text-[14px]"></span>
              <span class="mdi mdi-account-circle text-[#6b6560] text-[15px]"></span>
              <span class="mdi mdi-arrow-right-thin text-emerald-600 text-[14px]"></span>
              <span class="inline-flex items-center gap-1 text-[10px] font-bold text-[#1a1c1b]">
                <span class="mdi mdi-silverware-fork-knife text-[13px]"></span>
                Restaurante
              </span>
              <span class="ml-auto text-[12px] font-black text-emerald-700">10%</span>
            </div>

            <!-- N3: TÚ → Creador → Creador → Restaurante = 5% -->
            <div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/[0.03] ring-1 ring-emerald-500/10">
              <span class="text-[9px] font-black text-emerald-800 bg-white rounded-md px-1.5 py-0.5 ring-1 ring-emerald-500/30">TÚ</span>
              <span class="mdi mdi-arrow-right-thin text-emerald-600 text-[14px]"></span>
              <span class="mdi mdi-account-circle text-[#6b6560] text-[15px]"></span>
              <span class="mdi mdi-arrow-right-thin text-emerald-600 text-[14px]"></span>
              <span class="mdi mdi-account-circle text-[#6b6560] text-[15px]"></span>
              <span class="mdi mdi-arrow-right-thin text-emerald-600 text-[14px]"></span>
              <span class="inline-flex items-center gap-1 text-[10px] font-bold text-[#1a1c1b]">
                <span class="mdi mdi-silverware-fork-knife text-[13px]"></span>
                Restaurante
              </span>
              <span class="ml-auto text-[12px] font-black text-emerald-700">5%</span>
            </div>
          </div>

          <!-- ACTION CTAs — one per row-type: N1 = añadir restaurante, N2/N3 = invitar creador -->
          <div class="flex flex-wrap items-center gap-2 mt-2.5">
            <!-- Primary: add a restaurant (direct N1 — 15%) → /r/new (Google Places flow) -->
            <button
              type="button"
              @click="goAddRestaurant"
              class="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-white text-[12px] font-black transition-all hover:-translate-y-0.5"
              style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow: 0 4px 12px -4px rgba(16,185,129,0.35);"
            >
              <span class="mdi mdi-silverware-fork-knife text-[14px]"></span>
              Añadir restaurante
            </button>

            <!-- Secondary: invite a creator (N2/N3 — 10/5%) → native share / popover -->
            <div class="relative">
              <button
                type="button"
                @click.stop="openInviteCreator"
                class="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#1a1c1b] text-white text-[12px] font-black transition-all hover:-translate-y-0.5 hover:bg-black shadow-[0_4px_12px_-4px_rgba(0,0,0,0.25)]"
              >
                <span class="mdi mdi-account-plus text-[14px]"></span>
                Invitar creador
                <span class="mdi mdi-chevron-down text-[14px] opacity-70"></span>
              </button>

              <!-- Popover menu (fallback when navigator.share isn't available) -->
              <div
                v-if="showInviteMenu"
                class="absolute left-0 top-[calc(100%+6px)] z-50 w-[260px] rounded-2xl bg-white ring-1 ring-[#e5e5e5] shadow-[0_12px_32px_-8px_rgba(0,0,0,0.18)] overflow-hidden"
                @click.stop
              >
                <div class="px-3 py-2 border-b border-[#f0f0f0]">
                  <p class="text-[10px] font-black text-[#6b6560] uppercase tracking-wide">Compartir con</p>
                </div>
                <button
                  type="button"
                  @click="shareWhatsApp"
                  class="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-[#fafafa] text-left transition-colors"
                >
                  <span class="size-8 rounded-lg bg-[#25D366]/10 text-[#25D366] flex items-center justify-center">
                    <span class="mdi mdi-whatsapp text-[18px]"></span>
                  </span>
                  <div class="flex-1 min-w-0">
                    <p class="text-[12px] font-bold text-[#1a1c1b]">WhatsApp</p>
                    <p class="text-[10px] text-[#6b6560] truncate">Mensaje predefinido con tu enlace</p>
                  </div>
                </button>
                <button
                  type="button"
                  @click="shareEmail"
                  class="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-[#fafafa] text-left transition-colors"
                >
                  <span class="size-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <span class="mdi mdi-email-outline text-[18px]"></span>
                  </span>
                  <div class="flex-1 min-w-0">
                    <p class="text-[12px] font-bold text-[#1a1c1b]">Email</p>
                    <p class="text-[10px] text-[#6b6560] truncate">Correo con tu enlace y explicación</p>
                  </div>
                </button>
                <button
                  type="button"
                  @click="copyAndCloseMenu"
                  class="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-[#fafafa] text-left transition-colors border-t border-[#f0f0f0]"
                >
                  <span class="size-8 rounded-lg bg-[#f5f5f5] text-[#1a1c1b] flex items-center justify-center">
                    <span class="mdi mdi-content-copy text-[16px]"></span>
                  </span>
                  <div class="flex-1 min-w-0">
                    <p class="text-[12px] font-bold text-[#1a1c1b]">Copiar enlace</p>
                    <p class="text-[10px] text-[#6b6560] truncate font-mono">{{ referralLink }}</p>
                  </div>
                </button>
              </div>
            </div>

            <!-- Wallet access — tertiary text link, pushed right -->
            <button
              type="button"
              @click="openWallet"
              class="ml-auto inline-flex items-center gap-1 text-[11px] font-black text-[#6b6560] hover:text-[#1a1c1b] transition-colors"
            >
              Wallet completo
              <span class="mdi mdi-arrow-right text-[13px]"></span>
            </button>
          </div>
        </div>
      </div>

      <!-- Backdrop to close the invite menu when clicking outside -->
      <div
        v-if="showInviteMenu"
        class="fixed inset-0 z-40"
        @click="showInviteMenu = false"
      ></div>
    </div>

    <!-- ============ ACTIVITY FEED ============ -->
    <div class="opacity-0 animate-fade-in-up" style="animation-delay: 220ms">
      <CreatorActivityFeed :activities="mockActivities" />
    </div>

    <!-- ============ DRAWER: INFORMES ============ -->
    <Teleport to="body">
      <Transition name="drawer">
        <div v-if="showInformesDrawer" class="fixed inset-0 z-[100] flex" @keydown.esc="closeDrawers">
          <div class="absolute inset-0 bg-black/50" @click="closeDrawers"></div>
          <div class="relative ml-auto w-full max-w-5xl h-full bg-[#f4f5f7] shadow-2xl flex flex-col overflow-hidden">
            <header class="flex items-center justify-between gap-3 px-6 py-4 border-b border-[#e5e5e5] bg-white">
              <div class="flex items-center gap-2">
                <span class="mdi mdi-chart-box-outline text-blue-600 text-[20px]"></span>
                <h3 class="text-[16px] font-black text-[#1a1c1b]">Informes detallados</h3>
              </div>
              <button
                type="button"
                @click="closeDrawers"
                class="size-9 rounded-xl flex items-center justify-center text-[#666] hover:bg-[#f5f5f5] transition-colors"
                aria-label="Cerrar"
              >
                <span class="mdi mdi-close text-lg"></span>
              </button>
            </header>
            <div class="flex-1 overflow-y-auto">
              <CreatorInformesPanel @navigate="onChildNavigate" />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ============ DRAWER: WALLET / AFILIACIÓN ============ -->
    <Teleport to="body">
      <Transition name="drawer">
        <div v-if="showWalletDrawer" class="fixed inset-0 z-[100] flex" @keydown.esc="closeDrawers">
          <div class="absolute inset-0 bg-black/50" @click="closeDrawers"></div>
          <div class="relative ml-auto w-full max-w-5xl h-full bg-white shadow-2xl flex flex-col overflow-hidden">
            <header class="flex items-center justify-between gap-3 px-6 py-4 border-b border-[#e5e5e5]">
              <div class="flex items-center gap-2">
                <span class="mdi mdi-wallet-outline text-emerald-600 text-[20px]"></span>
                <h3 class="text-[16px] font-black text-[#1a1c1b]">Wallet & Afiliación</h3>
              </div>
              <button
                type="button"
                @click="closeDrawers"
                class="size-9 rounded-xl flex items-center justify-center text-[#666] hover:bg-[#f5f5f5] transition-colors"
                aria-label="Cerrar"
              >
                <span class="mdi mdi-close text-lg"></span>
              </button>
            </header>
            <div class="flex-1 overflow-y-auto">
              <CreatorAffiliatePanel />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ============ DRAWER: LOGROS / GAMIFICATION ============ -->
    <Teleport to="body">
      <Transition name="drawer">
        <div v-if="showLogrosDrawer" class="fixed inset-0 z-[100] flex" @keydown.esc="closeDrawers">
          <div class="absolute inset-0 bg-black/50" @click="closeDrawers"></div>
          <div class="relative ml-auto w-full max-w-5xl h-full bg-white shadow-2xl flex flex-col overflow-hidden">
            <header class="flex items-center justify-between gap-3 px-6 py-4 border-b border-[#e5e5e5] bg-white">
              <div class="flex items-center gap-2">
                <span class="mdi mdi-trophy-award text-amber-600 text-[20px]"></span>
                <h3 class="text-[16px] font-black text-[#1a1c1b]">Logros & Guava Points</h3>
              </div>
              <button
                type="button"
                @click="closeDrawers"
                class="size-9 rounded-xl flex items-center justify-center text-[#666] hover:bg-[#f5f5f5] transition-colors"
                aria-label="Cerrar"
              >
                <span class="mdi mdi-close text-lg"></span>
              </button>
            </header>
            <div class="flex-1 overflow-y-auto">
              <CreatorGamificationPanel />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 200ms ease;
}
.drawer-enter-active > .relative,
.drawer-leave-active > .relative {
  transition: transform 250ms cubic-bezier(0.32, 0.72, 0, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
.drawer-enter-from > .relative,
.drawer-leave-to > .relative {
  transform: translateX(100%);
}
</style>
