<script setup lang="ts">
import { ref, computed } from 'vue'
import { GoogleLogin } from 'vue3-google-login'
import StepShell from './StepShell.vue'
import EmailSignupForm from './EmailSignupForm.vue'
import { environment } from '~/environment'
import type { OnboardingV2Flow } from '~/composables/useOnboardingV2'

const props = defineProps<{ flow: OnboardingV2Flow }>()

const credential = ref<string | undefined>()
const error = ref('')

const showEmailForm = computed({
  get: () => props.flow.signupMethod.value === 'email',
  set: (v: boolean) => { props.flow.signupMethod.value = v ? 'email' : 'google' },
})

const onGoogleCredential = async (response: { credential: string }) => {
  credential.value = response.credential
  error.value = ''
  // Auto-advance once Google returns — saves a click.
  const ok = await props.flow.signupWithGoogle(response.credential)
  if (ok) props.flow.next()
  else error.value = 'No se pudo crear la cuenta. Intenta otra vez.'
}

const onEmailSignup = async (info: { email: string; password: string; name: string }) => {
  error.value = ''
  const ok = await props.flow.signupWithEmail(info.email, info.password, info.name)
  if (ok) props.flow.next()
  else error.value = 'No se pudo crear la cuenta. Comprueba el email y la contraseña.'
}

// The next button on the StepShell is a no-op here — sign-up auto-advances.
const canProceed = computed(() => false)
</script>

<template>
  <StepShell
    title="Crea tu cuenta"
    subtitle="Empieza con Google o con tu email."
    :step="1"
    :total-steps="4"
    :can-go-back="false"
    :can-proceed="canProceed"
    :is-loading="flow.isLoading.value"
    hide-next
    @back="flow.back()"
    @next="() => {}"
  >
    <template v-if="!showEmailForm">
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-semibold text-text-main ml-1">Continuar con Google</label>
        <div class="flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-4">
          <ClientOnly v-if="!credential">
            <GoogleLogin
              :client-id="environment.googleAuthClientId"
              :callback="onGoogleCredential"
              :button-config="{ size: 'large', text: 'signup_with', shape: 'pill' }"
            />
          </ClientOnly>
          <div v-else class="flex items-center gap-2 text-sm text-emerald-600 font-medium">
            <span class="mdi mdi-check-circle text-xl"></span>
            Cuenta conectada
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3 my-1">
        <div class="h-px flex-1 bg-gray-200 dark:bg-white/10"></div>
        <span class="text-xs text-text-secondary">o</span>
        <div class="h-px flex-1 bg-gray-200 dark:bg-white/10"></div>
      </div>

      <button type="button" @click="showEmailForm = true"
        class="text-sm font-semibold text-text-main hover:underline self-center">
        Registrarse con email
      </button>
    </template>

    <template v-else>
      <EmailSignupForm
        :is-loading="flow.isLoading.value"
        @submit="onEmailSignup"
      />
      <button type="button" @click="showEmailForm = false"
        class="text-xs text-text-secondary hover:text-gray-900 underline self-center">
        Volver a Google
      </button>
    </template>

    <p v-if="error" class="text-xs text-red-500 text-center">{{ error }}</p>
  </StepShell>
</template>
