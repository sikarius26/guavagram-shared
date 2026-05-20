<script setup lang="ts">
import { ref, computed } from 'vue'
import StepShell from './StepShell.vue'
import { environment } from '~/environment'
import type { OnboardingV2Flow } from '~/composables/useOnboardingV2'

const props = defineProps<{ flow: OnboardingV2Flow }>()

const config = useRuntimeConfig()
const googleClientId = (config.public as any).googleAuthClientId
  || (environment as any).googleAuthClientId
  || ''

// Local UI states. Once a location is picked we show a summary card
// instead of the picker — owner can still hit "back" to change their mind.
type Stage = 'idle' | 'locations' | 'confirmed' | 'manual'
const stage = ref<Stage>(
  props.flow.storePreview.value ? 'confirmed' :
  props.flow.googleBusinessConnected.value ? 'locations' :
  'idle',
)

const error = ref('')
const manualForm = ref({
  displayName: '',
  addressLine1: '',
  city: '',
  postalCode: '',
  phoneNumber: '',
})

const onConnect = async () => {
  error.value = ''
  const ok = await props.flow.connectGoogleBusiness(googleClientId)
  if (ok) {
    stage.value = 'locations'
    if (!props.flow.googleBusinessLocations.value.length) {
      error.value = 'Tu cuenta de Google no tiene ningún negocio verificado. Puedes introducirlo manualmente abajo.'
    }
  }
}

const onPickLocation = async (gbpId: string) => {
  error.value = ''
  const ok = await props.flow.linkGoogleBusiness(gbpId)
  if (ok) stage.value = 'confirmed'
  else error.value = 'No se pudo vincular el negocio. Intenta otra vez.'
}

const canSubmitManual = computed(() =>
  manualForm.value.displayName.trim().length > 1 &&
  manualForm.value.addressLine1.trim().length > 1 &&
  manualForm.value.city.trim().length > 1,
)

const onSubmitManual = async () => {
  if (!canSubmitManual.value) return
  error.value = ''
  const ok = await props.flow.setManualStoreInfo({
    displayName: manualForm.value.displayName.trim(),
    addressLine1: manualForm.value.addressLine1.trim(),
    city: manualForm.value.city.trim(),
    postalCode: manualForm.value.postalCode.trim() || undefined,
    phoneNumber: manualForm.value.phoneNumber.trim() || undefined,
  })
  if (ok) stage.value = 'confirmed'
  else error.value = 'No se pudo guardar. Comprueba los datos.'
}

const goManual = () => { stage.value = 'manual'; error.value = '' }
const backToIdle = () => { stage.value = 'idle'; error.value = '' }
const backToLocations = () => { stage.value = 'locations' }

const canProceed = computed(() => stage.value === 'confirmed')

const onNext = () => { if (canProceed.value) props.flow.next() }

const stepTitle = computed(() => {
  switch (stage.value) {
    case 'manual': return 'Datos del restaurante'
    case 'locations': return 'Elige tu negocio'
    case 'confirmed': return '¡Listo!'
    default: return 'Vincula tu Google Business'
  }
})

const stepSubtitle = computed(() => {
  switch (stage.value) {
    case 'manual': return 'Lo introduces a mano y listo.'
    case 'locations': return 'Estos son los negocios verificados de tu cuenta.'
    case 'confirmed': return 'Hemos importado tu información desde Google.'
    default: return 'Para autorrellenar nombre, dirección, horario y reseñas.'
  }
})
</script>

<template>
  <StepShell
    :title="stepTitle"
    :subtitle="stepSubtitle"
    :step="3"
    :total-steps="4"
    :can-go-back="stage === 'idle' || stage === 'confirmed'"
    :can-proceed="canProceed"
    :is-loading="flow.isLoading.value"
    next-label="Continuar"
    @back="stage === 'idle' ? flow.back() : backToIdle()"
    @next="onNext"
  >

    <!-- ═══ Stage: idle (not connected yet) ═══ -->
    <template v-if="stage === 'idle'">
      <button type="button" @click="onConnect" :disabled="flow.isLoading.value"
        class="w-full h-14 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30 flex items-center justify-center gap-3 font-medium text-text-main transition-all active:scale-[0.99] disabled:opacity-50">
        <svg class="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.5 12.3c0-.7-.1-1.4-.2-2H12v3.8h5.9c-.3 1.4-1 2.5-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-7.8z"/>
          <path fill="#34A853" d="M12 23c2.9 0 5.4-.9 7.2-2.6l-3.5-2.7c-1 .7-2.2 1.1-3.7 1.1-2.8 0-5.2-1.9-6-4.4H2.3v2.7C4.2 20.7 7.8 23 12 23z"/>
          <path fill="#FBBC04" d="M6 14.4c-.2-.6-.3-1.3-.3-1.9s.1-1.3.3-1.9V7.9H2.3C1.6 9.3 1.2 10.6 1.2 12.5s.4 3.2 1.1 4.6L6 14.4z"/>
          <path fill="#EA4335" d="M12 5.4c1.6 0 3 .5 4.1 1.6l3.1-3.1C17.4 2.1 14.9 1 12 1 7.8 1 4.2 3.3 2.3 6.9l3.7 2.7c.8-2.5 3.2-4.2 6-4.2z"/>
        </svg>
        Conectar con Google Business
      </button>

      <div class="rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-3 flex gap-2.5 text-[12px] text-text-secondary">
        <span class="mdi mdi-shield-check-outline text-emerald-600 text-base shrink-0 mt-0.5"></span>
        <p class="leading-snug">
          Sólo necesitamos los datos de tu ficha (nombre, dirección, horario, reseñas).
          No publicaremos nada en tu perfil sin tu permiso.
        </p>
      </div>

      <button type="button" @click="goManual"
        class="text-xs text-text-secondary hover:text-gray-900 underline self-center">
        Mi negocio no está en Google Business
      </button>

      <p v-if="error" class="text-xs text-red-500 text-center">{{ error }}</p>
    </template>

    <!-- ═══ Stage: locations (after OAuth) ═══ -->
    <template v-else-if="stage === 'locations'">
      <div v-if="flow.googleBusinessLocations.value.length" class="flex flex-col gap-2.5">
        <button v-for="loc in flow.googleBusinessLocations.value" :key="loc.googleBusinessId"
          type="button" @click="onPickLocation(loc.googleBusinessId!)"
          :disabled="flow.isLoading.value"
          class="text-left rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-3.5 hover:border-emerald-400 hover:shadow-sm transition-all disabled:opacity-50">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
              <span class="mdi mdi-storefront-outline text-emerald-600 text-lg"></span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[14px] font-bold text-gray-900 dark:text-white truncate">{{ loc.name || 'Sin nombre' }}</p>
              <p v-if="loc.formattedAddress" class="text-[11px] text-text-secondary truncate mt-0.5">{{ loc.formattedAddress }}</p>
              <div class="flex items-center gap-2 mt-1.5 text-[10px] text-text-secondary">
                <span v-if="loc.businessType" class="inline-flex items-center gap-1">
                  <span class="mdi mdi-tag-outline text-[11px]"></span>{{ loc.businessType }}
                </span>
                <span v-if="loc.phoneNumber" class="inline-flex items-center gap-1">
                  <span class="mdi mdi-phone-outline text-[11px]"></span>{{ loc.phoneNumber }}
                </span>
              </div>
            </div>
            <span class="mdi mdi-chevron-right text-text-secondary text-lg shrink-0"></span>
          </div>
        </button>
      </div>
      <div v-else class="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-700/30 p-4 text-center">
        <span class="mdi mdi-alert-outline text-amber-600 text-2xl"></span>
        <p class="text-[13px] font-semibold text-amber-700 dark:text-amber-400 mt-1.5">Tu cuenta no tiene negocios verificados</p>
        <p class="text-[11px] text-amber-700/80 dark:text-amber-400/70 mt-1">Puedes introducir los datos a mano.</p>
      </div>

      <button type="button" @click="goManual"
        class="text-xs text-text-secondary hover:text-gray-900 underline self-center">
        Introducir manualmente
      </button>

      <p v-if="error" class="text-xs text-red-500 text-center">{{ error }}</p>
    </template>

    <!-- ═══ Stage: manual entry ═══ -->
    <template v-else-if="stage === 'manual'">
      <div class="flex flex-col gap-3">
        <div>
          <label class="text-sm font-semibold ml-1 text-gray-800 dark:text-white">Nombre *</label>
          <input v-model="manualForm.displayName" type="text"
            class="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 dark:bg-white/5 dark:border-white/10 px-4 h-12 text-base outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            placeholder="Ej. La Bodega de Pepe" />
        </div>
        <div>
          <label class="text-sm font-semibold ml-1 text-gray-800 dark:text-white">Dirección *</label>
          <input v-model="manualForm.addressLine1" type="text"
            class="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 dark:bg-white/5 dark:border-white/10 px-4 h-12 text-base outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            placeholder="Calle Mayor 12" />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="text-sm font-semibold ml-1 text-gray-800 dark:text-white">Ciudad *</label>
            <input v-model="manualForm.city" type="text"
              class="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 dark:bg-white/5 dark:border-white/10 px-4 h-12 text-base outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              placeholder="Madrid" />
          </div>
          <div>
            <label class="text-sm font-semibold ml-1 text-gray-800 dark:text-white">CP</label>
            <input v-model="manualForm.postalCode" type="text"
              class="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 dark:bg-white/5 dark:border-white/10 px-4 h-12 text-base outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              placeholder="28013" />
          </div>
        </div>
        <div>
          <label class="text-sm font-semibold ml-1 text-gray-800 dark:text-white">Teléfono</label>
          <input v-model="manualForm.phoneNumber" type="tel"
            class="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 dark:bg-white/5 dark:border-white/10 px-4 h-12 text-base outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            placeholder="+34 600 000 000" />
        </div>
        <button type="button" @click="onSubmitManual" :disabled="!canSubmitManual || flow.isLoading.value"
          class="h-12 mt-1 rounded-full bg-gradient-emerald hover:bg-gradient-emerald-hover text-white font-medium shadow-pill-emerald disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all">
          Guardar datos
        </button>
        <button type="button" @click="flow.googleBusinessConnected.value ? backToLocations() : backToIdle()"
          class="text-xs text-text-secondary hover:text-gray-900 underline self-center">
          {{ flow.googleBusinessConnected.value ? 'Volver a la lista' : 'Volver' }}
        </button>
      </div>
      <p v-if="error" class="text-xs text-red-500 text-center">{{ error }}</p>
    </template>

    <!-- ═══ Stage: confirmed ═══ -->
    <template v-else>
      <div class="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-5">
        <div class="flex flex-col gap-3.5">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5">
              <span class="mdi mdi-storefront-outline text-lg text-gray-500"></span>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Nombre</p>
              <p class="text-base font-semibold text-gray-900 dark:text-white">{{ flow.storePreview.value?.displayName || '—' }}</p>
            </div>
          </div>
          <div class="h-px bg-gray-200/80 dark:bg-white/10" />
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5">
              <span class="mdi mdi-map-marker-outline text-lg text-gray-500"></span>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Dirección</p>
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ [flow.storePreview.value?.addressLine1, flow.storePreview.value?.city].filter(Boolean).join(', ') || '—' }}
              </p>
            </div>
          </div>
          <template v-if="flow.storePreview.value?.phoneNumber">
            <div class="h-px bg-gray-200/80 dark:bg-white/10" />
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5">
                <span class="mdi mdi-phone-outline text-lg text-gray-500"></span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Teléfono</p>
                <p class="text-sm font-medium text-gray-900 dark:text-white tabular-nums">{{ flow.storePreview.value.phoneNumber }}</p>
              </div>
            </div>
          </template>
        </div>
      </div>
      <button type="button" @click="flow.googleBusinessConnected.value ? backToLocations() : goManual()"
        class="text-xs text-text-secondary hover:text-gray-900 underline self-center">
        <span class="mdi mdi-pencil-outline mr-1"></span>Cambiar
      </button>
    </template>
  </StepShell>
</template>
