<script setup lang="ts">
import { computed } from 'vue'
import { useGpRedemptionGates } from '~/composables/useGpRedemptionGates'

const router = useRouter()

const {
  hasBroughtVerifiedRestaurant,
  hasVerifiedReview,
  hasReferredSignup,
  modalOpen,
  closeModal,
} = useGpRedemptionGates()

type GateItem = {
  key: 'restaurant' | 'review' | 'signup'
  done: boolean
  icon: string
  title: string
  desc: string
  ctaLabel: string
  cta: () => void
}

// We keep CTA logic local so we don't hard-couple the modal to /user/commissions.
// The 3 actions match the "Acciones que suman GP" list there.
const goToReview = () => {
  closeModal()
  router.push('/u/create/review')
}

const shareInviteCreator = async () => {
  closeModal()
  // Same WhatsApp-share pattern used in /user/commissions.
  const handle = (typeof window !== 'undefined' ? (window.localStorage.getItem('guavagram.creator.handle') || 'creador') : 'creador')
  const link = `${typeof location === 'undefined' ? 'https://guavagram.com' : location.origin}/join?ref=${handle}`
  const text = `Oye, en Guavagram cobro hasta 15% por recomendar los restaurantes que ya me gustan. Si te animas, entra por mi enlace y montamos red: ${link}`
  if (typeof navigator !== 'undefined' && typeof (navigator as any).share === 'function') {
    try { await (navigator as any).share({ title: 'Guavagram', text }); return } catch { /* fall through */ }
  }
  if (typeof window !== 'undefined') {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
  }
}

const goToInviteRestaurant = () => {
  closeModal()
  // The full-blown restaurant search lives in /user/commissions; deep-link there
  // with a query flag so that page can auto-open its invite sheet.
  router.push({ path: '/user/commissions', query: { invite: 'restaurant' } })
}

const items = computed<GateItem[]>(() => [
  {
    key: 'restaurant',
    done: hasBroughtVerifiedRestaurant.value,
    icon: 'mdi-gift-outline',
    title: 'Trae 1 restaurante verificado',
    desc: 'Que ponga su tarjeta y verifique su negocio en Guavagram.',
    ctaLabel: 'Regalar Guavagram',
    cta: goToInviteRestaurant,
  },
  {
    key: 'review',
    done: hasVerifiedReview.value,
    icon: 'mdi-star-outline',
    title: 'Sube 1 reseña verificada',
    desc: 'Recibo + foto del local. El OCR valida nombre legal, dirección y pago real.',
    ctaLabel: 'Hacer reseña',
    cta: goToReview,
  },
  {
    key: 'signup',
    done: hasReferredSignup.value,
    icon: 'mdi-account-plus-outline',
    title: 'Invita a 1 persona que se registre',
    desc: 'Que se registre con tu enlace de invitación (queda atribuido por UTM).',
    ctaLabel: 'Invitar por WhatsApp',
    cta: shareInviteCreator,
  },
])

const doneCount = computed(() => items.value.filter(i => i.done).length)
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div v-if="modalOpen" @click="closeModal"
        class="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center p-5">
        <div @click.stop
          class="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
          <!-- Header -->
          <div class="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white px-6 pt-6 pb-5 text-center">
            <button type="button" @click="closeModal"
              class="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              aria-label="Cerrar">
              <span class="mdi mdi-close text-white text-[18px]"></span>
            </button>
            <span class="mdi mdi-lock-open-variant-outline text-4xl"></span>
            <h3 class="text-[18px] font-black leading-tight mt-2">Desbloquea el canje</h3>
            <p class="text-[12px] opacity-90 mt-1 leading-snug">
              Para canjear Guava Points necesitas cumplir estos 3 pasos una vez.
            </p>
            <div class="mt-3 inline-flex items-center gap-2 px-3 h-7 rounded-full bg-white/20 text-[11px] font-bold tabular-nums">
              <span class="mdi mdi-progress-check text-[14px]"></span>
              {{ doneCount }} / 3 completados
            </div>
          </div>

          <!-- Body -->
          <div class="p-5 space-y-3 overflow-y-auto">
            <div v-for="item in items" :key="item.key"
              class="rounded-2xl border p-4 flex items-start gap-3 transition-colors"
              :class="item.done
                ? 'border-emerald-200 bg-emerald-50/60'
                : 'border-gray-200 bg-white'">
              <span class="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                :class="item.done
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white'
                  : 'bg-gray-100 text-gray-400'">
                <span class="mdi text-xl" :class="item.done ? 'mdi-check-bold' : item.icon"></span>
              </span>
              <div class="flex-1 min-w-0">
                <p class="text-[13px] font-black leading-tight"
                  :class="item.done ? 'text-emerald-800 line-through decoration-emerald-400' : 'text-gray-900'">
                  {{ item.title }}
                </p>
                <p class="text-[11px] text-gray-500 leading-snug mt-0.5">{{ item.desc }}</p>
                <button v-if="!item.done" type="button" @click="item.cta"
                  class="mt-2 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[11px] font-bold text-white active:scale-[0.98] transition-all"
                  style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow: 0 4px 12px -4px rgba(5,150,105,0.45);">
                  <span class="mdi mdi-arrow-right text-[13px]"></span>
                  {{ item.ctaLabel }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
