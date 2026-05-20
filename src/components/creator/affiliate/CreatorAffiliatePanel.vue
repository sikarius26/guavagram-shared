<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCreatorWallet } from '~/composables/useCreatorWallet'
import { useAffiliateRestaurantsData } from '~/composables/data/useAffiliateRestaurantsData'
import { notifier } from '~/services/notification'

const { t } = useI18n()

const {
  referrals, pendingClaims, earningsHistory,
  pendingBalance, unlockableBalance, potentialFromClaims,
  l1Referrals, l2Referrals,
  isVerified, canWithdrawCash, daysUntilVerificationDeadline, isGracePeriodExpired,
  startVerification, convertToVoucher, requestWithdrawal,
  L1_COMMISSION_PCT, L2_COMMISSION_PCT, VERIFICATION_GRACE_DAYS,
} = useCreatorWallet()

type SubTab = 'wallet' | 'network' | 'claims' | 'history'
const activeSubTab = ref<SubTab>('wallet')

// Share link (mock)
const myReferralLink = computed(() => `${typeof location !== 'undefined' ? location.origin : ''}/?ref=tu-handle`)
const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(myReferralLink.value)
    notifier.notifySuccess(t('linkCopied'))
  } catch {}
}

// Withdrawal modal state
const showWithdrawModal = ref(false)
const withdrawAmount = ref(0)
const onWithdraw = () => {
  if (requestWithdrawal(withdrawAmount.value)) {
    notifier.notifySuccess(t('withdrawalRequested'))
    showWithdrawModal.value = false
    withdrawAmount.value = 0
  } else {
    notifier.notifyError(t('couldNotProcessWithdrawal'))
  }
}

// Voucher modal state
const showVoucherModal = ref(false)
const voucherAmount = ref(20)
const voucherRestaurant = ref('')
const voucherDiscount = ref(20)
const { options: mockRestaurants } = useAffiliateRestaurantsData()
const onConvertVoucher = () => {
  if (!voucherRestaurant.value) return
  if (convertToVoucher(voucherAmount.value, voucherRestaurant.value, voucherDiscount.value)) {
    notifier.notifySuccess(t('voucherGenerated'))
    showVoucherModal.value = false
  }
}

// Add restaurant claim
const showAddRestaurantModal = ref(false)
const newRestName = ref('')
const newRestCity = ref('')
const onAddClaim = () => {
  if (!newRestName.value.trim()) return
  pendingClaims.value.unshift({
    id: `pc-${Date.now()}`,
    type: 'restaurant_added',
    restaurantName: newRestName.value.trim(),
    restaurantCity: newRestCity.value.trim(),
    createdAt: new Date().toISOString().split('T')[0],
    potentialEarnings: 20,
    status: 'pending',
    expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  })
  notifier.notifySuccess(t('restaurantAdded'))
  newRestName.value = ''
  newRestCity.value = ''
  showAddRestaurantModal.value = false
}
</script>

<template>
  <div class="flex flex-col gap-0">

    <!-- ===== HERO ===== -->
    <section class="relative overflow-hidden border-b border-[#e5e5e5] bg-gradient-to-br from-[#fff8f6] via-white to-[#f0f4ff]">
      <div class="pointer-events-none absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full bg-[#ff2d23]/[0.06] blur-[120px]"></div>
      <div class="pointer-events-none absolute -bottom-20 -left-20 w-[300px] h-[300px] rounded-full bg-[#6366f1]/[0.04] blur-[100px]"></div>

      <div class="relative p-6 lg:p-10 pt-10 z-10">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ff2d23]/10 border border-[#ff2d23]/20 mb-4">
          <span class="w-1.5 h-1.5 rounded-full bg-[#ff2d23] animate-pulse"></span>
          <p class="text-[11px] font-black uppercase tracking-[0.2em] text-[#ff2d23]">Afiliación & Wallet</p>
        </div>
        <h1 class="text-[36px] lg:text-[48px] font-black text-[#1a1c1b] tracking-[-0.04em] leading-[0.95] mb-3">
          Gana comisiones<br/>
          <span class="bg-gradient-to-r from-[#ff2d23] to-[#ff6b4a] bg-clip-text text-transparent">recomendando</span>
        </h1>
        <p class="text-[15px] leading-relaxed max-w-lg mb-8 text-[#666]">
          {{ L1_COMMISSION_PCT }}% directo · {{ L2_COMMISSION_PCT }}% de lo que genera tu red · Paga en efectivo (con verificación) o en vouchers restaurante.
        </p>

        <!-- Balance cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div class="rounded-2xl bg-white border border-[#e5e5e5] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div class="flex items-center gap-2 mb-2">
              <div class="size-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                <span class="mdi mdi-wallet text-emerald-600 text-[15px]"></span>
              </div>
              <p class="text-[10px] font-bold text-[#888] uppercase tracking-[0.15em]">Balance disponible</p>
            </div>
            <p class="text-[24px] lg:text-[28px] font-black tracking-[-0.03em] text-[#1a1c1b] tabular-nums leading-none">
              {{ unlockableBalance.toFixed(2) }}<span class="text-[#888] text-[16px] font-bold">€</span>
            </p>
          </div>
          <div class="rounded-2xl bg-white border border-[#e5e5e5] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div class="flex items-center gap-2 mb-2">
              <div class="size-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <span class="mdi mdi-clock-outline text-amber-600 text-[15px]"></span>
              </div>
              <p class="text-[10px] font-bold text-[#888] uppercase tracking-[0.15em]">Pendiente</p>
            </div>
            <p class="text-[24px] lg:text-[28px] font-black tracking-[-0.03em] text-[#1a1c1b] tabular-nums leading-none">
              {{ pendingBalance.toFixed(2) }}<span class="text-[#888] text-[16px] font-bold">€</span>
            </p>
          </div>
          <div class="rounded-2xl bg-white border border-[#e5e5e5] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div class="flex items-center gap-2 mb-2">
              <div class="size-7 rounded-lg bg-violet-50 flex items-center justify-center">
                <span class="mdi mdi-account-group text-violet-600 text-[15px]"></span>
              </div>
              <p class="text-[10px] font-bold text-[#888] uppercase tracking-[0.15em]">Referidos</p>
            </div>
            <p class="text-[24px] lg:text-[28px] font-black tracking-[-0.03em] text-[#1a1c1b] tabular-nums leading-none">
              {{ referrals.length }}
            </p>
          </div>
          <div class="rounded-2xl bg-white border border-[#e5e5e5] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div class="flex items-center gap-2 mb-2">
              <div class="size-7 rounded-lg bg-sky-50 flex items-center justify-center">
                <span class="mdi mdi-star-plus-outline text-sky-600 text-[15px]"></span>
              </div>
              <p class="text-[10px] font-bold text-[#888] uppercase tracking-[0.15em]">Potencial en claims</p>
            </div>
            <p class="text-[24px] lg:text-[28px] font-black tracking-[-0.03em] text-[#1a1c1b] tabular-nums leading-none">
              {{ potentialFromClaims.toFixed(2) }}<span class="text-[#888] text-[16px] font-bold">€</span>
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== VERIFICATION BANNER ===== -->
    <section v-if="!isVerified && unlockableBalance > 0" class="px-6 lg:px-10 pt-6">
      <div class="relative overflow-hidden rounded-2xl border p-5 flex items-start gap-4"
        :class="isGracePeriodExpired ? 'bg-red-50 border-red-200' : 'bg-blue-50/40 border-[#2196f3]/30'">
        <div class="relative w-11 h-11 shrink-0 flex items-center justify-center">
          <template v-if="isGracePeriodExpired">
            <div class="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center">
              <span class="mdi mdi-alert-circle text-red-500 text-xl"></span>
            </div>
          </template>
          <template v-else>
            <span class="mdi mdi-check-decagram absolute text-white text-[40px] leading-none"></span>
            <span class="mdi mdi-check-decagram relative text-[36px] leading-none"
              style="color: #2196f3; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.15));"></span>
          </template>
        </div>
        <div class="flex-1">
          <p class="text-[14px] font-black text-[#1a1c1b] mb-1">
            <template v-if="isGracePeriodExpired">⚠ Período de gracia expirado — tus créditos empezarán a caducar</template>
            <template v-else>Consigue el tick azul para cobrar en efectivo</template>
          </p>
          <p class="text-[12px] leading-relaxed mb-3"
            :class="isGracePeriodExpired ? 'text-red-700' : 'text-[#1976d2]'">
            <template v-if="isGracePeriodExpired">
              Has superado el plazo de {{ VERIFICATION_GRACE_DAYS }} días. 1/3 de tus créditos caducarán cada mes si no te verificas o los conviertes a vouchers.
            </template>
            <template v-else>
              Tienes <b>{{ unlockableBalance.toFixed(2) }}€</b> bloqueados. Verifícate con DNI + justificante de autónomo en los próximos
              <b>{{ daysUntilVerificationDeadline }} días</b> o convierte tus créditos a vouchers restaurante.
            </template>
          </p>
          <div class="flex flex-wrap gap-2">
            <button @click="startVerification"
              class="px-4 py-2 rounded-xl text-white text-[11px] font-bold transition-all flex items-center gap-1.5 shadow-[0_4px_12px_rgba(33,150,243,0.25)] hover:shadow-[0_6px_16px_rgba(33,150,243,0.35)]"
              style="background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);">
              <span class="mdi mdi-shield-check-outline text-[13px]"></span> Verificar ahora
            </button>
            <button @click="activeSubTab = 'wallet'; showVoucherModal = true"
              class="px-4 py-2 rounded-xl border border-[#2196f3]/30 bg-white text-[#1976d2] text-[11px] font-bold hover:bg-blue-50 hover:border-[#2196f3]/50 transition-colors flex items-center gap-1.5">
              <span class="mdi mdi-ticket-percent-outline text-[13px]"></span> Convertir a vouchers
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== SUB-TABS ===== -->
    <section class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#eee]">
      <div class="flex items-center gap-1 px-6 lg:px-10 py-3 overflow-x-auto">
        <button v-for="t in [
          { id: 'wallet', label: 'Wallet', icon: 'mdi-wallet-outline' },
          { id: 'network', label: 'Mi red', icon: 'mdi-account-tree-outline' },
          { id: 'claims', label: 'Restaurantes pendientes', icon: 'mdi-store-plus-outline' },
          { id: 'history', label: 'Historial', icon: 'mdi-history' },
        ]" :key="t.id" @click="activeSubTab = t.id as SubTab"
          class="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-[12px] transition-all whitespace-nowrap"
          :class="activeSubTab === t.id ? 'bg-[#1a1c1b] text-white shadow-sm' : 'text-[#777] hover:bg-[#f5f5f5]'">
          <span class="mdi" :class="t.icon" style="font-size: 15px"></span>
          {{ t.label }}
        </button>
      </div>
    </section>

    <!-- ===== CONTENT ===== -->
    <div class="px-6 lg:px-10 py-8">

      <!-- ──── WALLET ──── -->
      <template v-if="activeSubTab === 'wallet'">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <!-- Withdraw cash -->
          <div class="bg-white rounded-2xl border border-[#e5e5e5] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="size-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <span class="mdi mdi-bank text-emerald-600 text-[18px]"></span>
                </div>
                <div>
                  <h3 class="text-[14px] font-black text-[#1a1c1b] leading-tight">Retirar efectivo</h3>
                  <p class="text-[11px] text-[#888]">A tu cuenta bancaria</p>
                </div>
              </div>
              <span v-if="isVerified" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span class="text-[9px] font-black text-emerald-700 uppercase tracking-wider">Verificado</span>
              </span>
              <span v-else class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200">
                <span class="mdi mdi-lock text-amber-600 text-[11px]"></span>
                <span class="text-[9px] font-black text-amber-700 uppercase tracking-wider">Bloqueado</span>
              </span>
            </div>

            <p class="text-[10px] font-bold text-[#888] uppercase tracking-[0.15em] mb-1.5">Disponible</p>
            <p class="text-[28px] font-black text-[#1a1c1b] tabular-nums leading-none tracking-[-0.03em]">
              {{ unlockableBalance.toFixed(2) }}<span class="text-[#888] text-[16px] font-bold">€</span>
            </p>

            <div class="flex-1"></div>

            <button @click="showWithdrawModal = true" :disabled="!canWithdrawCash"
              class="w-full py-3 rounded-xl font-bold text-[13px] transition-all mt-5 inline-flex items-center justify-center gap-1.5"
              :class="canWithdrawCash ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-[0_4px_14px_rgba(16,185,129,0.3)]' : 'bg-[#f5f5f5] text-[#bbb] cursor-not-allowed'">
              <span class="mdi" :class="canWithdrawCash ? 'mdi-arrow-right' : 'mdi-shield-alert'"></span>
              {{ isVerified ? (unlockableBalance > 0 ? 'Solicitar retiro' : 'Sin balance') : 'Requiere verificación' }}
            </button>
            <p v-if="!isVerified" class="text-[10px] text-amber-700 mt-2 text-center font-medium">
              <span class="mdi mdi-information-outline"></span> Verifica tu cuenta para cobrar en efectivo
            </p>
          </div>

          <!-- Convert to vouchers -->
          <div class="bg-white rounded-2xl border border-[#e5e5e5] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="size-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <span class="mdi mdi-ticket-percent text-amber-600 text-[18px]"></span>
                </div>
                <div>
                  <h3 class="text-[14px] font-black text-[#1a1c1b] leading-tight">Vouchers restaurante</h3>
                  <p class="text-[11px] text-[#888]">Sin verificación · Instantáneo</p>
                </div>
              </div>
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500">
                <span class="text-[9px] font-black text-white uppercase tracking-wider">5–100%</span>
              </span>
            </div>

            <p class="text-[10px] font-bold text-[#888] uppercase tracking-[0.15em] mb-1.5">Convertible</p>
            <p class="text-[28px] font-black text-[#1a1c1b] tabular-nums leading-none tracking-[-0.03em] mb-3">
              {{ unlockableBalance.toFixed(2) }}<span class="text-[#888] text-[16px] font-bold">€</span>
            </p>

            <div class="flex flex-wrap gap-1.5 mb-4">
              <span class="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-1 rounded-full">
                <span class="mdi mdi-flash text-[12px]"></span> Sin trámites
              </span>
              <span class="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-1 rounded-full">
                <span class="mdi mdi-silverware-fork-knife text-[12px]"></span> Todos los locales
              </span>
            </div>

            <div class="flex-1"></div>

            <button @click="showVoucherModal = true" :disabled="unlockableBalance <= 0"
              class="w-full py-3 rounded-xl font-bold text-[13px] transition-all inline-flex items-center justify-center gap-1.5"
              :class="unlockableBalance > 0 ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-[0_4px_14px_rgba(245,158,11,0.3)]' : 'bg-[#f5f5f5] text-[#bbb] cursor-not-allowed'">
              <span class="mdi mdi-ticket-confirmation"></span>
              Generar voucher
            </button>
          </div>

          <!-- Share link -->
          <div class="bg-white rounded-2xl border border-[#e5e5e5] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="size-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <span class="mdi mdi-share-variant text-indigo-600 text-[18px]"></span>
                </div>
                <div>
                  <h3 class="text-[14px] font-black text-[#1a1c1b] leading-tight">Tu enlace de afiliado</h3>
                  <p class="text-[11px] text-[#888]">Gana {{ L1_COMMISSION_PCT }}% por cada registro</p>
                </div>
              </div>
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span class="text-[9px] font-black text-emerald-700 uppercase tracking-wider">Activo</span>
              </span>
            </div>

            <p class="text-[10px] font-bold text-[#888] uppercase tracking-[0.15em] mb-1.5">Tu link único</p>
            <div class="bg-[#fafafa] border border-[#eee] rounded-xl px-3 py-2.5 flex items-center gap-2 mb-3">
              <span class="mdi mdi-link-variant text-indigo-600 text-[14px] shrink-0"></span>
              <code class="text-[11px] text-[#555] break-all flex-1 font-mono">{{ myReferralLink }}</code>
            </div>

            <div class="grid grid-cols-2 gap-2 mb-4">
              <div class="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                <p class="text-[9px] font-black text-emerald-700 uppercase tracking-wider">L1</p>
                <p class="text-[16px] font-black text-emerald-700 tabular-nums leading-none mt-0.5">{{ L1_COMMISSION_PCT }}%</p>
              </div>
              <div class="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                <p class="text-[9px] font-black text-blue-700 uppercase tracking-wider">L2</p>
                <p class="text-[16px] font-black text-blue-700 tabular-nums leading-none mt-0.5">{{ L2_COMMISSION_PCT }}%</p>
              </div>
            </div>

            <div class="flex-1"></div>

            <button @click="copyLink" class="w-full py-3 rounded-xl bg-[#1a1c1b] text-white font-bold text-[13px] hover:bg-[#2a2a2a] transition-colors inline-flex items-center justify-center gap-1.5">
              <span class="mdi mdi-content-copy"></span> Copiar enlace
            </button>
          </div>
        </div>

        <!-- Commission rates info -->
        <div class="mt-6 bg-white rounded-2xl border border-[#e5e5e5] p-6">
          <h3 class="text-[14px] font-black text-[#1a1c1b] mb-4">Cómo funcionan las comisiones</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <div class="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
                <span class="text-white font-black text-[12px]">L1</span>
              </div>
              <div>
                <p class="text-[13px] font-black text-emerald-900 mb-1">Nivel 1 — {{ L1_COMMISSION_PCT }}%</p>
                <p class="text-[11px] text-emerald-700 leading-relaxed">Si recomiendas un restaurante o traes a un usuario, ganas {{ L1_COMMISSION_PCT }}% de lo que genere en GuavaGram.</p>
              </div>
            </div>
            <div class="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
              <div class="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
                <span class="text-white font-black text-[12px]">L2</span>
              </div>
              <div>
                <p class="text-[13px] font-black text-blue-900 mb-1">Nivel 2 — {{ L2_COMMISSION_PCT }}%</p>
                <p class="text-[11px] text-blue-700 leading-relaxed">Cuando alguien a quien invitaste trae a otro restaurante/usuario, te llevas {{ L2_COMMISSION_PCT }}% de esas transacciones. Sin más niveles.</p>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ──── NETWORK ──── -->
      <template v-else-if="activeSubTab === 'network'">
        <div class="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden">
          <div class="p-5 border-b border-[#f0f0f0] flex items-center justify-between">
            <div>
              <h3 class="text-[15px] font-black text-[#1a1c1b]">Mi red de afiliados</h3>
              <p class="text-[12px] text-[#888]">{{ l1Referrals.length }} directos · {{ l2Referrals.length }} indirectos</p>
            </div>
          </div>

          <!-- L1 -->
          <div class="p-5">
            <div class="flex items-center gap-2 mb-4">
              <span class="w-6 h-6 rounded-full bg-emerald-500 text-white font-black text-[10px] flex items-center justify-center">L1</span>
              <h4 class="text-[12px] font-black text-[#1a1c1b] uppercase tracking-wider">Directos · {{ L1_COMMISSION_PCT }}% comisión</h4>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div v-for="r in l1Referrals" :key="r.id"
                class="p-4 rounded-xl border border-[#e5e5e5] bg-white hover:border-emerald-300 hover:shadow-[0_4px_16px_rgba(16,185,129,0.08)] transition-all">
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    :class="r.type === 'user_invite' ? 'bg-indigo-50' : 'bg-emerald-50'">
                    <span class="mdi text-lg" :class="r.type === 'user_invite' ? 'mdi-account text-indigo-600' : 'mdi-storefront text-emerald-600'"></span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-[13px] font-bold text-[#1a1c1b] truncate">{{ r.displayName }}</p>
                    <p class="text-[10px] text-[#888]">{{ r.type === 'user_invite' ? 'Usuario invitado' : 'Restaurante' }}</p>
                    <div class="flex items-baseline gap-1 mt-2">
                      <span class="text-[16px] font-black text-emerald-600 tabular-nums">{{ (r.paidCommission + r.pendingCommission).toFixed(2) }}€</span>
                      <span v-if="r.pendingCommission > 0" class="text-[9px] font-bold text-amber-600">+{{ r.pendingCommission.toFixed(2) }}€ pendiente</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="!l1Referrals.length" class="md:col-span-2 lg:col-span-3 py-8 text-center">
                <p class="text-[12px] text-[#888]">Aún no tienes referidos directos. Comparte tu enlace para empezar.</p>
              </div>
            </div>
          </div>

          <!-- L2 -->
          <div class="p-5 border-t border-[#f0f0f0]">
            <div class="flex items-center gap-2 mb-4">
              <span class="w-6 h-6 rounded-full bg-blue-500 text-white font-black text-[10px] flex items-center justify-center">L2</span>
              <h4 class="text-[12px] font-black text-[#1a1c1b] uppercase tracking-wider">Indirectos · {{ L2_COMMISSION_PCT }}% comisión</h4>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div v-for="r in l2Referrals" :key="r.id"
                class="p-4 rounded-xl border border-[#e5e5e5] bg-white hover:border-blue-300 transition-all">
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <span class="mdi mdi-storefront text-blue-600 text-lg"></span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-[13px] font-bold text-[#1a1c1b] truncate">{{ r.displayName }}</p>
                    <p class="text-[10px] text-[#888]">Vía <b>{{ r.viaUserName }}</b></p>
                    <div class="flex items-baseline gap-1 mt-2">
                      <span class="text-[16px] font-black text-blue-600 tabular-nums">{{ (r.paidCommission + r.pendingCommission).toFixed(2) }}€</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="!l2Referrals.length" class="md:col-span-2 lg:col-span-3 py-8 text-center">
                <p class="text-[12px] text-[#888]">Tus referidos directos aún no han traído nuevos registros.</p>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ──── PENDING CLAIMS ──── -->
      <template v-else-if="activeSubTab === 'claims'">
        <div class="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden">
          <div class="p-5 border-b border-[#f0f0f0] flex items-center justify-between">
            <div>
              <h3 class="text-[15px] font-black text-[#1a1c1b]">Restaurantes pendientes de registro</h3>
              <p class="text-[12px] text-[#888]">Si se registran, ganas {{ L1_COMMISSION_PCT }}% de lo que generen</p>
            </div>
            <button @click="showAddRestaurantModal = true"
              class="px-4 py-2 rounded-xl bg-[#1a1c1b] text-white font-bold text-[12px] hover:bg-[#2a2a2a] transition-colors">
              <span class="mdi mdi-plus text-sm"></span> Añadir restaurante
            </button>
          </div>
          <div class="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div v-for="c in pendingClaims" :key="c.id"
              class="p-4 rounded-xl border border-[#e5e5e5] bg-white">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center shrink-0">
                  <span class="mdi text-lg" :class="c.type === 'review_of_unregistered' ? 'mdi-star-outline text-amber-600' : 'mdi-store-plus-outline text-amber-600'"></span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-0.5">
                    <p class="text-[13px] font-bold text-[#1a1c1b] truncate">{{ c.restaurantName }}</p>
                    <span class="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      :class="c.status === 'matched' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'">
                      {{ c.status === 'matched' ? 'Matched' : 'Pendiente' }}
                    </span>
                  </div>
                  <p class="text-[10px] text-[#888]">{{ c.restaurantCity }} · {{ c.type === 'review_of_unregistered' ? 'Reseña fantasma' : 'Añadido manualmente' }}</p>
                  <p class="text-[14px] font-black text-emerald-600 tabular-nums mt-2">Potencial: {{ c.potentialEarnings }}€</p>
                  <p class="text-[9px] text-[#bbb] mt-1">Expira: {{ c.expiresAt }}</p>
                </div>
              </div>
            </div>
            <div v-if="!pendingClaims.length" class="md:col-span-2 py-12 text-center">
              <span class="mdi mdi-store-plus-outline text-[#ddd] text-4xl"></span>
              <p class="text-[12px] text-[#888] mt-2">Añade restaurantes que conozcas. Si se registran, cobras.</p>
            </div>
          </div>
        </div>
      </template>

      <!-- ──── HISTORY ──── -->
      <template v-else-if="activeSubTab === 'history'">
        <div class="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden">
          <div class="p-5 border-b border-[#f0f0f0]">
            <h3 class="text-[15px] font-black text-[#1a1c1b]">Historial de movimientos</h3>
          </div>
          <div class="divide-y divide-[#f5f5f5]">
            <div v-for="e in earningsHistory" :key="e.id"
              class="flex items-center gap-3 p-4 hover:bg-[#fafafa] transition-colors">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                :class="{
                  'bg-emerald-50': e.kind === 'commission_l1',
                  'bg-blue-50': e.kind === 'commission_l2',
                  'bg-amber-50': e.kind === 'voucher_conversion',
                  'bg-gray-50': e.kind === 'withdrawal',
                  'bg-red-50': e.kind === 'expired',
                  'bg-violet-50': e.kind === 'claim_bonus',
                }">
                <span class="mdi text-lg"
                  :class="{
                    'mdi-arrow-bottom-left text-emerald-600': e.kind === 'commission_l1',
                    'mdi-arrow-bottom-left text-blue-600': e.kind === 'commission_l2',
                    'mdi-ticket-percent-outline text-amber-600': e.kind === 'voucher_conversion',
                    'mdi-bank-outline text-gray-600': e.kind === 'withdrawal',
                    'mdi-alert-circle text-red-500': e.kind === 'expired',
                    'mdi-gift-outline text-violet-600': e.kind === 'claim_bonus',
                  }"></span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[13px] font-bold text-[#1a1c1b] truncate">{{ e.description }}</p>
                <p class="text-[10px] text-[#888]">{{ e.date }}</p>
              </div>
              <p class="text-[14px] font-black tabular-nums shrink-0"
                :class="e.amount > 0 ? 'text-emerald-600' : 'text-[#888]'">
                {{ e.amount > 0 ? '+' : '' }}{{ e.amount.toFixed(2) }}€
              </p>
            </div>
            <div v-if="!earningsHistory.length" class="py-12 text-center">
              <p class="text-[12px] text-[#888]">Sin movimientos aún.</p>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- ─── Withdraw modal ─── -->
    <Teleport to="body">
      <div v-if="showWithdrawModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" @click="showWithdrawModal = false"></div>
        <div class="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
          <h3 class="text-[20px] font-black text-[#1a1c1b] mb-2">Solicitar retiro</h3>
          <p class="text-[13px] text-[#666] mb-4">Disponible: <b>{{ unlockableBalance.toFixed(2) }}€</b></p>
          <label class="block text-[11px] font-bold text-[#555] uppercase tracking-wider mb-2">Cantidad (€)</label>
          <input v-model.number="withdrawAmount" type="number" :max="unlockableBalance" min="10"
            class="w-full h-12 px-4 rounded-xl border border-[#ddd] bg-[#fafafa] text-[16px] font-bold outline-none focus:border-[#1a1c1b] mb-4" />
          <div class="flex gap-2">
            <button @click="showWithdrawModal = false" class="flex-1 h-12 rounded-xl border border-[#ddd] text-[#666] font-bold text-[13px] hover:bg-[#f5f5f5]">{{ $t('cancel') }}</button>
            <button @click="onWithdraw" :disabled="withdrawAmount <= 0 || withdrawAmount > unlockableBalance"
              class="flex-1 h-12 rounded-xl bg-[#1a1c1b] text-white font-bold text-[13px] hover:bg-[#2a2a2a] disabled:opacity-50">
              Confirmar retiro
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ─── Voucher modal ─── -->
    <Teleport to="body">
      <div v-if="showVoucherModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" @click="showVoucherModal = false"></div>
        <div class="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
          <h3 class="text-[20px] font-black text-[#1a1c1b] mb-2">Generar voucher</h3>
          <p class="text-[13px] text-[#666] mb-4">Convierte créditos en descuento en un restaurante.</p>
          <label class="block text-[11px] font-bold text-[#555] uppercase tracking-wider mb-2">Restaurante</label>
          <select v-model="voucherRestaurant"
            class="w-full h-11 px-3 rounded-xl border border-[#ddd] bg-[#fafafa] text-[13px] outline-none focus:border-[#1a1c1b] mb-4">
            <option value="" disabled>Elige uno</option>
            <option v-for="r in mockRestaurants" :key="r.id" :value="r.id">{{ r.name }} — {{ r.city }}</option>
          </select>
          <label class="block text-[11px] font-bold text-[#555] uppercase tracking-wider mb-2">Cantidad (€)</label>
          <input v-model.number="voucherAmount" type="number" :max="unlockableBalance" min="5"
            class="w-full h-11 px-3 rounded-xl border border-[#ddd] bg-[#fafafa] text-[13px] font-bold outline-none focus:border-[#1a1c1b] mb-4" />
          <label class="block text-[11px] font-bold text-[#555] uppercase tracking-wider mb-2">Descuento ({{ voucherDiscount }}%)</label>
          <input v-model.number="voucherDiscount" type="range" min="5" max="100" step="5" class="w-full mb-4 accent-amber-500" />
          <div class="flex gap-2">
            <button @click="showVoucherModal = false" class="flex-1 h-12 rounded-xl border border-[#ddd] text-[#666] font-bold text-[13px] hover:bg-[#f5f5f5]">{{ $t('cancel') }}</button>
            <button @click="onConvertVoucher" :disabled="!voucherRestaurant || voucherAmount <= 0"
              class="flex-1 h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-[13px] hover:shadow-lg disabled:opacity-50">
              Generar voucher
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ─── Add restaurant modal ─── -->
    <Teleport to="body">
      <div v-if="showAddRestaurantModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" @click="showAddRestaurantModal = false"></div>
        <div class="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
          <h3 class="text-[20px] font-black text-[#1a1c1b] mb-2">Añadir restaurante</h3>
          <p class="text-[13px] text-[#666] mb-4">Si este restaurante se registra en GuavaGram, ganas {{ L1_COMMISSION_PCT }}% de lo que genere.</p>
          <label class="block text-[11px] font-bold text-[#555] uppercase tracking-wider mb-2">Nombre del restaurante</label>
          <input v-model="newRestName" type="text" placeholder="Ej: Bar Manolo"
            class="w-full h-11 px-3 rounded-xl border border-[#ddd] bg-[#fafafa] text-[13px] outline-none focus:border-[#1a1c1b] mb-3" />
          <label class="block text-[11px] font-bold text-[#555] uppercase tracking-wider mb-2">Ciudad</label>
          <input v-model="newRestCity" type="text" placeholder="Ej: Madrid"
            class="w-full h-11 px-3 rounded-xl border border-[#ddd] bg-[#fafafa] text-[13px] outline-none focus:border-[#1a1c1b] mb-4" />
          <div class="flex gap-2">
            <button @click="showAddRestaurantModal = false" class="flex-1 h-12 rounded-xl border border-[#ddd] text-[#666] font-bold text-[13px] hover:bg-[#f5f5f5]">{{ $t('cancel') }}</button>
            <button @click="onAddClaim" :disabled="!newRestName.trim()"
              class="flex-1 h-12 rounded-xl bg-[#1a1c1b] text-white font-bold text-[13px] hover:bg-[#2a2a2a] disabled:opacity-50">
              Añadir
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>
