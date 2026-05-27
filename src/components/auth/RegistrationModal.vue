<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { GoogleLogin } from 'vue3-google-login'
import { useAuth } from '~/composables/useAuth'
import { notifier } from '~/services/notification'
import { TemporaryTokenTypeEnum } from '~/services/apis/models/temporary-token-type-enum'
import { userApiClient } from '~/services/apis/api.client.user'
import Modal from '~/components/global/Modal.vue'
import Spinner from '~/components/shared/Spinner.vue'
import PhoneInput from '~/components/shared/PhoneInput.vue'
import TokenVerify from './TokenVerify.vue'
import BookingRecap from '~/components/booking/BookingRecap.vue'

const config = useRuntimeConfig()

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
  dismiss: [success: boolean, googleName?: string, googleSurname?: string, verifiedContact?: string, contactType?: 'email' | 'phone', userExists?: boolean]
  login: []
}>()

const { t } = useI18n()
const { register, loginWithGoogle, isLoading } = useAuth()

const contactType = ref<'email' | 'phone'>('email')
const email = ref('')
const phoneNumber = ref('')
const phoneDialCode = ref('+34')
const postRegistration = ref(false)
const registrationSource = ref('')
const userExists = ref(false)
const acceptTerms = ref(false)

const isEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))
const isPhoneValid = computed(() => phoneNumber.value.trim().length > 6)

const canProceed = computed(() => {
  if (contactType.value === 'email') return isEmailValid.value
  if (contactType.value === 'phone') return isPhoneValid.value
  return false
})

const continueWithContact = async () => {
  if (!canProceed.value) return

  // The trimmed shared user client has no `userCheckExists`, so we don't
  // branch new-vs-existing up front. We register (which creates the account
  // and sends the verification code) and always land on the code screen; if
  // the account already exists the register call throws — harmless, the
  // TokenVerify screen has a "resend" button to re-issue the code.
  try {
    ;(userApiClient as any).baseUrl = config.public.apiBase

    if (contactType.value === 'email') {
      try {
        await register(email.value, 'temp-password-not-used')
      } catch (e: any) {
        userExists.value = true
      }
      registrationSource.value = email.value
      postRegistration.value = true
    } else if (contactType.value === 'phone') {
      const cleanPhone = phoneNumber.value.replace(/\s+/g, '')
      const fullPhone = `${phoneDialCode.value}${cleanPhone}`
      try {
        await register(fullPhone, 'temp-password-not-used', phoneDialCode.value)
      } catch (e: any) {
        userExists.value = true
      }
      registrationSource.value = fullPhone
      postRegistration.value = true
    }
  } catch (error) {
    notifier.notifyError(t('registrationError'), error as Error)
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

const handleVerified = () => {
  emit('update:modelValue', false)
  const cleanPhone = phoneNumber.value.replace(/\s+/g, '')
  const verifiedContact = contactType.value === 'email' ? email.value : `${phoneDialCode.value}${cleanPhone}`
  emit('dismiss', true, undefined, undefined, verifiedContact, contactType.value, userExists.value)
}

const modalTitle = computed(() => {
  if (postRegistration.value) return t('verifyCode')
  if (props.storeName && props.guests) {
    return t('yourReservationIn', { storeName: props.storeName })
  }
  return props.title || t('register')
})

watch(() => props.modelValue, (val) => {
  if (!val) {
    postRegistration.value = false
    email.value = ''
    phoneNumber.value = ''
    phoneDialCode.value = '+34'
    registrationSource.value = ''
    acceptTerms.value = false
    userExists.value = false
    contactType.value = 'email'
  }
})
</script>

<template>
  <Modal :model-value="props.modelValue" @update:model-value="(val) => { emit('update:modelValue', val); if (!val) emit('dismiss', false) }" :show-close-button="true" :title="modalTitle" :title-centered="!!(props.storeName && props.guests)">
    <div class="p-7 flex flex-col gap-6" v-if="!postRegistration">
      <BookingRecap 
        v-if="guests && date && time"
        :guests="guests" 
        :date="date" 
        :time="time"
      />

      <div v-if="guests && date && time" class="h-px bg-gray-200"></div>

      <!-- Email/Phone Form -->
      <div class="flex flex-col gap-4">
        <!-- Toggle Email/Phone -->
        <div class="flex gap-2 p-1 bg-gray-100 dark:bg-white/10 rounded-lg">
          <button
            @click="contactType = 'email'"
            class="flex-1 py-2.5 rounded-lg font-semibold text-[15px] transition"
            :class="contactType === 'email' ? 'bg-white dark:bg-white/20 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-white/60'"
          >
            {{ $t('email') }}
          </button>
          <button
            @click="contactType = 'phone'"
            class="flex-1 py-2.5 rounded-lg font-semibold text-[15px] transition"
            :class="contactType === 'phone' ? 'bg-white dark:bg-white/20 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-white/60'"
          >
            {{ $t('phone') }}
          </button>
        </div>

        <!-- Email Input -->
        <label v-if="contactType === 'email'" class="flex flex-col gap-2">
          <span class="text-[15px] font-semibold text-[#1E2021]">{{ $t('email') }}*</span>
          <input
            v-model="email"
            type="email"
            :placeholder="$t('enterYourEmail')"
            :disabled="isLoading"
            class="p-3.5 rounded-lg border border-[#1E202133] bg-white text-[15px] text-[#1E2021] outline-none transition-colors focus:border-[#00AF66] placeholder:text-[#1E202180] disabled:bg-[#EDEEF166] disabled:text-[#1E202180] disabled:cursor-not-allowed"
            :class="{ 'border-[#F5484A]': email.length > 0 && !isEmailValid }"
            @keyup.enter="continueWithContact"
          />
        </label>

        <!-- Phone Input -->
        <label v-if="contactType === 'phone'" class="flex flex-col gap-2">
          <span class="text-[15px] font-semibold text-[#1E2021]">{{ $t('phoneNumber') }}*</span>
          <PhoneInput 
            v-model:phone="phoneNumber" 
            v-model:phone-dial-code="phoneDialCode"
          />
        </label>

        <!-- Divider with "or" -->
        <div class="relative flex items-center py-2">
          <div class="flex-1 border-t border-gray-200"></div>
          <span class="px-4 text-[15px] text-gray-500">{{ $t('or') }}</span>
          <div class="flex-1 border-t border-gray-200"></div>
        </div>

        <!-- Google Login -->
        <div class="flex items-center justify-center">
          <GoogleLogin :callback="handleGoogleCallback" :button-config="{ size: 'large', text: 'continue_with' }" />
        </div>

        <!-- Terms and Conditions -->
        <p class="text-sm text-[#1E2021] text-center">
          {{ $t('byClickingContinue') }} 
          <a href="/terms" target="_blank" class="text-[#F5484A] cursor-pointer hover:underline">{{ $t('termsAndConditions') }}</a>
        </p>

        <!-- Continue Button -->
        <button
          @click="continueWithContact"
          :disabled="isLoading || !canProceed"
          class="w-full rounded-lg py-3.5 font-semibold text-[15px] transition disabled:cursor-not-allowed flex items-center justify-center gap-2"
          :class="(isLoading || !canProceed) ? 'bg-[#00AF6666]' : 'bg-[#00AF66] hover:bg-[#00AF66]/90'"
        >
          <Spinner v-if="isLoading" class="w-5 h-5 text-white" />
          <span v-else class="text-white">{{ $t('continue') }}</span>
        </button>
      </div>
    </div>

    <!-- Post Registration - Verification -->
    <div v-else class="flex flex-col items-center gap-4 p-4">
      <TokenVerify
        :source="registrationSource"
        :token-type-id="contactType === 'email' ? TemporaryTokenTypeEnum.EMAIL_VERIFICATION : TemporaryTokenTypeEnum.PHONE_VERIFICATION"
        @verified="handleVerified"
        @close="emit('dismiss', false)"
      />
    </div>
  </Modal>
</template>
