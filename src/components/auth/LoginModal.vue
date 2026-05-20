<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { GoogleLogin } from 'vue3-google-login'
import { useAuth } from '~/composables/useAuth'
import { notifier } from '~/services/notification'
import Modal from '~/components/global/Modal.vue'
import Spinner from '~/components/shared/Spinner.vue'
import BookingRecap from '~/components/booking/BookingRecap.vue'

const props = defineProps<{
  modelValue: boolean
  title?: string
  guests?: number
  date?: Date
  time?: string
  storeName?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  dismiss: [success: boolean, googleName?: string, googleSurname?: string]
  register: []
}>()

const { t } = useI18n()
const { login, loginWithGoogle, isLoading } = useAuth()

const email = ref('')
const password = ref('')

const isEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))

const emailLogin = async () => {
  if (!isEmailValid.value || password.value.length < 3) return
  try {
    await login(email.value, password.value)
    emit('update:modelValue', false)
    emit('dismiss', true)
  } catch (error) {
    notifier.notifyError(t('loginError'), error as Error)
  }
}

const googleName = ref<string>()
const googleSurname = ref<string>()

const handleGoogleCallback = async (response: { credential: string }) => {
  try {
    const parts = response.credential.split('.')
    if (parts[1]) {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
      const payload = JSON.parse(jsonPayload)
      googleName.value = payload.given_name
      googleSurname.value = payload.family_name
    }
  } catch (e) {
    console.log('error', e)
  }
  
  try {
    await loginWithGoogle(response.credential, googleName.value, googleSurname.value)
    emit('update:modelValue', false)
    emit('dismiss', true, googleName.value, googleSurname.value)
  } catch (error) {
    notifier.notifyError(t('googleLoginError'), error as Error)
  }
}

watch(() => props.modelValue, (val) => {
  if (!val) {
    email.value = ''
    password.value = ''
  }
})
</script>

<template>
  <Modal :model-value="props.modelValue" @update:model-value="(val) => { emit('update:modelValue', val); if (!val) emit('dismiss', false) }" :show-close-button="true" :title="props.title || $t('login')">
    <div class="p-6 flex flex-col gap-6">
      
      <!-- Booking Recap (if booking context is provided) -->
      <BookingRecap 
        v-if="guests && date && time"
        :guests="guests" 
        :date="date" 
        :time="time" 
        :store-name="storeName"
      />

      <div v-if="guests && date && time" class="h-px bg-gray-200"></div>

      <!-- Instruction Text -->
      <p v-if="guests && date && time" class="text-base font-semibold text-[#1E2021] text-center">
        {{ $t('enterEmailToComplete') }}
      </p>
      
      <!-- Google Login -->
      <div class="border-b border-gray-100 dark:border-white/20 pb-4 mb-4 flex items-center justify-center">
        <GoogleLogin :callback="handleGoogleCallback" :button-config="{ size: 'large', text: 'continue_with' }" />
      </div>

      <!-- Email/Password Form -->
      <div class="flex flex-col gap-4">
        <label class="flex flex-col gap-2">
          <span class="text-sm font-semibold">{{ $t('email') }}*</span>
          <input
            v-model="email"
            type="email"
            :placeholder="$t('emailPlaceholder')"
            :disabled="isLoading"
            class="px-4 py-2 border border-gray-200 dark:border-white/20 rounded-lg bg-white dark:bg-white/10 text-gray-900 dark:text-white"
            :class="{ 'border-red-500': email.length > 0 && !isEmailValid }"
          />
        </label>

        <label class="flex flex-col gap-2">
          <span class="text-sm font-semibold">{{ $t('password') }}*</span>
          <input
            v-model="password"
            type="password"
            :placeholder="$t('passwordPlaceholder')"
            :disabled="isLoading"
            class="px-4 py-2 border border-gray-200 dark:border-white/20 rounded-lg bg-white dark:bg-white/10 text-gray-900 dark:text-white"
            :class="{ 'border-red-500': password.length > 0 && password.length < 3 }"
            @keyup.enter="emailLogin"
          />
        </label>

        <p class="text-sm text-center">
          <span>{{ $t('notRegistered') }}</span>
          <button @click="emit('register')" class="text-primary font-semibold hover:underline ml-1">
            {{ $t('register') }}
          </button>
        </p>
      </div>

      <!-- Login Button -->
      <button
        @click="emailLogin"
        :disabled="isLoading || !isEmailValid || password.length < 3"
        class="mt-6 w-full bg-primary hover:bg-primary/90 text-white rounded-full py-3 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Spinner v-if="isLoading" class="w-5 h-5" />
        <span v-else>{{ $t('login') }}</span>
      </button>
    </div>
  </Modal>
</template>
