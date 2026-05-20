<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { notifier } from '~/services/notification'

const { t } = useI18n()

type Step = 'intro' | 'subscription' | 'verify' | 'pending' | 'success'

const props = defineProps<{
  open: boolean
  restaurantId: string
  restaurantName: string
  /** Whether the owner already completed Stripe subscription. Claim is gated behind this. */
  hasSubscription: boolean
  /** Google Business data we pre-filled — used to prompt for matching fiscal data */
  phoneFromGoogle?: string
  addressFromGoogle?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'claimed'): void
}>()

const step = ref<Step>('intro')

watch(() => props.open, (v) => {
  if (v) {
    step.value = props.hasSubscription ? 'intro' : 'intro'
  }
})

// ═══ Fiscal verification state ═══
const fiscalId = ref('')         // CIF/NIF
const legalName = ref('')        // Razón social
const domainEmail = ref('')      // e.g. contacto@casapepe.com (must match a domain we can validate)
const publicPhone = ref('')      // must match Google Business listing
const acceptTerms = ref(false)

const submitting = ref(false)
const errorMsg = ref('')

const canSubmitVerify = computed(() =>
  fiscalId.value.trim().length >= 8 &&
  legalName.value.trim().length >= 3 &&
  domainEmail.value.includes('@') &&
  publicPhone.value.trim().length >= 6 &&
  acceptTerms.value &&
  !submitting.value
)

const goToVerify = () => {
  if (!props.hasSubscription) {
    step.value = 'subscription'
    return
  }
  step.value = 'verify'
}

const goSubscribe = async () => {
  // TODO: redirect to Stripe Checkout for restaurant subscription plan.
  // After checkout success, user returns here and hasSubscription flips to true.
  try {
    // TODO: swap to `${config.public.apiBase}/billing/checkout` when backend is ready.
    const res = await $fetch<{ url: string }>(`/api/mock/billing/checkout`, {
      method: 'POST',
      body: { restaurantId: props.restaurantId, intent: 'claim' },
    }).catch(() => null)
    if (res?.url) {
      window.location.href = res.url
      return
    }
    notifier.notifyError(t('couldNotStartPaymentLater'))
  } catch {
    notifier.notifyError(t('couldNotStartPayment'))
  }
}

const submitVerify = async () => {
  if (!canSubmitVerify.value) return
  submitting.value = true
  errorMsg.value = ''
  try {
    // TODO: swap to `${config.public.apiBase}/restaurants/${id}/claim` when backend is ready.
    // Backend verifies: CIF in tax registry, email domain ownership (send confirm link),
    // phone match against Google Business listing.
    // Returns { status: 'pending' | 'approved', claimId }
    const res = await $fetch<{ status: 'pending' | 'approved' }>(
      `/api/mock/restaurants/${props.restaurantId}/claim`,
      { method: 'POST', body: {
        fiscalId: fiscalId.value.trim(),
        legalName: legalName.value.trim(),
        domainEmail: domainEmail.value.trim(),
        publicPhone: publicPhone.value.trim(),
      } }
    ).catch(() => ({ status: 'pending' as const }))

    if (res.status === 'approved') {
      step.value = 'success'
      notifier.notifySuccess(t('restaurantClaimed'))
      emit('claimed')
    } else {
      step.value = 'pending'
      notifier.notifySuccess(t('claimRequestSent'))
    }
  } catch {
    errorMsg.value = 'Hubo un problema al enviar la solicitud. Inténtalo de nuevo.'
  } finally {
    submitting.value = false
  }
}

const close = () => emit('close')
</script>

<template>
  <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
    <div v-if="open" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 font-display"
      @click.self="close">
      <div class="w-full max-w-[560px] bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">

        <!-- ═══ Intro ═══ -->
        <template v-if="step === 'intro'">
          <div class="relative px-6 pt-6 pb-5 bg-gradient-to-br from-[#fff5f2] via-white to-[#fef3c7]">
            <button @click="close" class="absolute top-5 right-5 w-8 h-8 rounded-full hover:bg-white/60 flex items-center justify-center">
              <span class="mdi mdi-close text-[#666]"></span>
            </button>
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ff2d23] to-[#ff6b4a] flex items-center justify-center shadow-[0_6px_16px_rgba(255,45,35,0.25)] mb-4">
              <span class="mdi mdi-crown-outline text-white text-[28px]"></span>
            </div>
            <h2 class="text-[20px] font-black text-[#1a1c1b] leading-tight">Reclama {{ restaurantName }}</h2>
            <p class="text-[13px] text-[#666] mt-1.5">Toma el control de este perfil para responder reseñas, publicar menú, vouchers y más.</p>
          </div>

          <div class="flex-1 overflow-y-auto px-6 py-5">
            <div class="grid grid-cols-1 gap-2.5">
              <div class="flex items-start gap-3 p-3 rounded-xl bg-[#fafafa] border border-[#eee]">
                <span class="mdi mdi-reply-outline text-[#6366f1] text-lg shrink-0 mt-0.5"></span>
                <div><p class="text-[13px] font-bold text-[#1a1c1b]">Responde a las reseñas</p><p class="text-[12px] text-[#666]">Contesta públicamente y reclama reseñas sin verificar.</p></div>
              </div>
              <div class="flex items-start gap-3 p-3 rounded-xl bg-[#fafafa] border border-[#eee]">
                <span class="mdi mdi-silverware-fork-knife text-[#ff2d23] text-lg shrink-0 mt-0.5"></span>
                <div><p class="text-[13px] font-bold text-[#1a1c1b]">Publica menú y fotos</p><p class="text-[12px] text-[#666]">Edita el perfil con tus datos reales.</p></div>
              </div>
              <div class="flex items-start gap-3 p-3 rounded-xl bg-[#fafafa] border border-[#eee]">
                <span class="mdi mdi-ticket-percent-outline text-[#f59e0b] text-lg shrink-0 mt-0.5"></span>
                <div><p class="text-[13px] font-bold text-[#1a1c1b]">Activa vouchers y marketing</p><p class="text-[12px] text-[#666]">Campañas, fidelización, referral.</p></div>
              </div>
            </div>

            <div class="mt-5 flex items-start gap-2 p-3 rounded-xl bg-[#eff6ff] border border-[#dbeafe] text-[11.5px] text-[#1e40af]">
              <span class="mdi mdi-information-outline text-base shrink-0"></span>
              <span>Los afiliados fundadores (usuarios que ya dejaron reseñas verificadas) mantienen su comisión histórica y futura — el claim solo te da el control del perfil.</span>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-[#eee] flex items-center justify-end gap-2">
            <button type="button" @click="close" class="px-5 py-2.5 rounded-xl text-[12px] font-semibold text-[#666] hover:bg-[#f5f5f5]">{{ $t('cancel') }}</button>
            <button type="button" @click="goToVerify"
              class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-[#ff2d23] to-[#ff6b4a] text-white text-[12px] font-bold shadow-[0_6px_16px_rgba(255,45,35,0.25)] hover:shadow-[0_8px_20px_rgba(255,45,35,0.35)] transition-all">
              <span class="mdi mdi-arrow-right"></span> Continuar
            </button>
          </div>
        </template>

        <!-- ═══ Subscription required ═══ -->
        <template v-else-if="step === 'subscription'">
          <div class="relative px-6 pt-6 pb-5">
            <button @click="close" class="absolute top-5 right-5 w-8 h-8 rounded-full hover:bg-[#f5f5f5] flex items-center justify-center">
              <span class="mdi mdi-close text-[#666]"></span>
            </button>
            <div class="w-14 h-14 rounded-2xl bg-[#eff6ff] flex items-center justify-center mb-4">
              <span class="mdi mdi-credit-card-outline text-[#2563eb] text-[28px]"></span>
            </div>
            <h2 class="text-[20px] font-black text-[#1a1c1b] leading-tight">Necesitas una suscripción activa</h2>
            <p class="text-[13px] text-[#666] mt-1.5">Para reclamar un restaurante en Guavagram tienes que tener la suscripción del plan restaurante activa. Así protegemos la plataforma de reclamaciones fraudulentas.</p>
          </div>
          <div class="flex-1 overflow-y-auto px-6 pb-5">
            <div class="rounded-2xl border border-[#e5e5e5] bg-white p-4">
              <p class="text-[12px] font-bold text-[#1a1c1b] mb-2">Qué incluye la suscripción</p>
              <ul class="text-[12px] text-[#555] space-y-1.5 pl-4 list-disc leading-relaxed">
                <li>Perfil público completo (menú, fotos, reservas)</li>
                <li>Respuesta a reseñas y reclamación de no verificadas</li>
                <li>Vouchers, fidelización y campañas</li>
                <li>Estadísticas de visitas, contactos y conversión</li>
                <li>Widgets para tu web</li>
              </ul>
            </div>
          </div>
          <div class="px-6 py-4 border-t border-[#eee] flex items-center justify-between gap-2">
            <button type="button" @click="step = 'intro'" class="text-[12px] font-semibold text-[#888] hover:text-[#1a1c1b]">
              ← Volver
            </button>
            <button type="button" @click="goSubscribe"
              class="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1a1c1b] text-white text-[13px] font-bold hover:bg-[#2a2a2a] transition-colors">
              <span class="mdi mdi-credit-card-check-outline"></span> Ver planes y suscribirse
            </button>
          </div>
        </template>

        <!-- ═══ Fiscal verification ═══ -->
        <template v-else-if="step === 'verify'">
          <div class="relative px-6 pt-6 pb-4 border-b border-[#eee]">
            <button @click="close" class="absolute top-5 right-5 w-8 h-8 rounded-full hover:bg-[#f5f5f5] flex items-center justify-center">
              <span class="mdi mdi-close text-[#666]"></span>
            </button>
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-xl bg-[#f0fdf4] flex items-center justify-center">
                <span class="mdi mdi-shield-check text-[#16a34a] text-[22px]"></span>
              </div>
              <div>
                <h2 class="text-[18px] font-black text-[#1a1c1b] leading-tight">Verifica la titularidad</h2>
                <p class="text-[12px] text-[#666] mt-0.5">Comprobamos que eres el dueño legal de <b>{{ restaurantName }}</b>.</p>
              </div>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="text-[11px] font-bold text-[#555] uppercase tracking-wider mb-1.5 block">CIF / NIF</label>
                <input v-model="fiscalId" type="text" placeholder="B12345678"
                  class="w-full rounded-xl border border-[#ddd] bg-white px-4 h-11 text-[13px] outline-none focus:border-[#16a34a]" />
              </div>
              <div>
                <label class="text-[11px] font-bold text-[#555] uppercase tracking-wider mb-1.5 block">Razón social</label>
                <input v-model="legalName" type="text" placeholder="Casa Pepe Restauración SL"
                  class="w-full rounded-xl border border-[#ddd] bg-white px-4 h-11 text-[13px] outline-none focus:border-[#16a34a]" />
              </div>
            </div>

            <div>
              <label class="text-[11px] font-bold text-[#555] uppercase tracking-wider mb-1.5 block">Email del dominio del restaurante</label>
              <input v-model="domainEmail" type="email" placeholder="contacto@casapepe.com"
                class="w-full rounded-xl border border-[#ddd] bg-white px-4 h-11 text-[13px] outline-none focus:border-[#16a34a]" />
              <p class="text-[11px] text-[#888] mt-1">Te mandaremos un enlace de confirmación a este email.</p>
            </div>

            <div>
              <label class="text-[11px] font-bold text-[#555] uppercase tracking-wider mb-1.5 block">Teléfono público del restaurante</label>
              <input v-model="publicPhone" type="tel" :placeholder="phoneFromGoogle || '+34 91 123 4567'"
                class="w-full rounded-xl border border-[#ddd] bg-white px-4 h-11 text-[13px] outline-none focus:border-[#16a34a]" />
              <p v-if="phoneFromGoogle" class="text-[11px] text-[#888] mt-1">Debe coincidir con el listado público: <b>{{ phoneFromGoogle }}</b></p>
            </div>

            <label class="flex items-start gap-2 cursor-pointer">
              <input v-model="acceptTerms" type="checkbox" class="mt-0.5 rounded border-[#ccc]" />
              <span class="text-[12px] text-[#555] leading-relaxed">
                Confirmo que soy representante legal del restaurante y que los datos son veraces.
                Los afiliados fundadores mantendrán su comisión.
              </span>
            </label>

            <div v-if="errorMsg" class="flex items-start gap-2 p-3 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-[12px] text-[#b91c1c]">
              <span class="mdi mdi-alert-circle-outline text-base shrink-0"></span>
              <span>{{ errorMsg }}</span>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-[#eee] flex items-center justify-between gap-2">
            <button type="button" @click="step = 'intro'" class="text-[12px] font-semibold text-[#888] hover:text-[#1a1c1b]">
              ← Volver
            </button>
            <button type="button" @click="submitVerify" :disabled="!canSubmitVerify"
              class="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-emerald text-white text-[13px] font-bold shadow-pill-emerald disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              <span v-if="submitting" class="mdi mdi-loading animate-spin"></span>
              <span v-else class="mdi mdi-shield-check"></span>
              {{ submitting ? t('sendingClaim') : t('sendClaimRequest') }}
            </button>
          </div>
        </template>

        <!-- ═══ Pending ═══ -->
        <template v-else-if="step === 'pending'">
          <div class="p-10 text-center">
            <div class="w-20 h-20 mx-auto mb-5 rounded-full bg-[#fef3c7] flex items-center justify-center">
              <span class="mdi mdi-clock-outline text-[#f59e0b] text-[44px]"></span>
            </div>
            <h2 class="text-[22px] font-black text-[#1a1c1b]">Solicitud enviada</h2>
            <p class="text-[13px] text-[#666] mt-2">
              Verificaremos CIF, dominio y teléfono en 24-48h. Te avisamos por email cuando quede aprobado.
            </p>
            <button @click="close" class="mt-6 px-6 py-3 bg-[#1a1c1b] text-white rounded-xl font-bold text-[13px]">Entendido</button>
          </div>
        </template>

        <!-- ═══ Success ═══ -->
        <template v-else-if="step === 'success'">
          <div class="p-10 text-center">
            <div class="w-20 h-20 mx-auto mb-5 rounded-full bg-[#dcfce7] flex items-center justify-center">
              <span class="mdi mdi-check-decagram text-[#16a34a] text-[44px]"></span>
            </div>
            <h2 class="text-[22px] font-black text-[#1a1c1b]">¡Restaurante reclamado!</h2>
            <p class="text-[13px] text-[#666] mt-2">Ya tienes control total de <b>{{ restaurantName }}</b>.</p>
            <button @click="close" class="mt-6 px-6 py-3 bg-gradient-emerald text-white rounded-xl font-bold text-[13px] shadow-pill-emerald">
              Ir al dashboard
            </button>
          </div>
        </template>

      </div>
    </div>
  </Transition>
</template>
