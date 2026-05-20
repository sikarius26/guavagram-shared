<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { TemporaryTokenTypeEnum } from '~/services/apis/models/temporary-token-type-enum'
import { VerifyTokenRequest } from '~/services/apis/models/verify-token-request'
import { notifier } from '~/services/notification'

const props = defineProps<{
  source: string
  tokenTypeId: TemporaryTokenTypeEnum
}>()

const emit = defineEmits<{
  verified: []
  close: []
}>()

const { t } = useI18n()
const { verifyToken, resendToken } = useAuth()

const digits = ref(['', '', '', ''])
const inputRefs = ref<HTMLInputElement[]>([])

const isVerifying = ref(false)
const resendCooldown = ref(0)

const canResend = computed(() => resendCooldown.value === 0 && !isVerifying.value)
const code = computed(() => digits.value.join(''))
const isCodeComplete = computed(() => code.value.length === 4)

const handleInput = (idx: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const numericValue = target.value.replace(/\D/g, '').slice(0, 1)
  digits.value[idx] = numericValue
  target.value = numericValue
  if (numericValue && idx < 3) {
    nextTick(() => inputRefs.value[idx + 1]?.focus())
  }
}

const handleKeydown = (idx: number, event: KeyboardEvent) => {
  const target = event.target as HTMLInputElement
  if (event.key === 'Backspace') {
    if (target.value) {
      digits.value[idx] = ''
      target.value = ''
    } else if (idx > 0) {
      digits.value[idx - 1] = ''
      nextTick(() => inputRefs.value[idx - 1]?.focus())
    }
    event.preventDefault()
  }
}

const verify = async () => {
  if (!isCodeComplete.value) return
  isVerifying.value = true
  try {
    const request = VerifyTokenRequest.fromJS({
      source: props.source,
      token: code.value,
      tokenTypeId: props.tokenTypeId
    })
    await verifyToken(request)
    notifier.notifySuccess(t('codeVerifiedSuccessfully'))
    emit('verified')
  } catch (error) {
    notifier.notifyError(t('invalidCode'), error as Error)
  } finally {
    isVerifying.value = false
  }
}

const resend = async () => {
  if (!canResend.value) return
  try {
    const request = VerifyTokenRequest.fromJS({
      source: props.source,
      token: '',
      tokenTypeId: props.tokenTypeId
    })
    await resendToken(request)
    notifier.notifySuccess(t('codeResent'))
    resendCooldown.value = 60
    startCooldown()
  } catch (error: any) {
    const msg = error?.message || error?.toString() || ''
    if (msg.toLowerCase().includes('already sent')) {
      resendCooldown.value = 60
      startCooldown()
    } else {
      notifier.notifyError(t('errorResendingCode'), error as Error)
    }
  }
}

const startCooldown = () => {
  const interval = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      clearInterval(interval)
    }
  }, 1000)
}

onMounted(() => {
  resendCooldown.value = 60
  startCooldown()
  nextTick(() => inputRefs.value[0]?.focus())
})
</script>

<template>
  <div class="flex flex-col px-2 gap-2 pt-2 pb-6 w-full">
    <!-- Success Checkmark -->
    <div class="flex justify-center items-center mb-8 mt-4">
      <svg width="80" height="80" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 40C31.0456 40 40 31.0456 40 20C40 8.9543 31.0456 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0456 8.9543 40 20 40ZM30.9142 14.9142L18 27.8284L9.58578 19.4142L12.4142 16.5858L18 22.1716L28.0858 12.0858L30.9142 14.9142Z" fill="#00AF66"/>
      </svg>
    </div>

    <div class="flex flex-col gap-2 items-center justify-center mt-2">
      <div class="text-center pb-6">
        <span class="text-gray-500">{{ $t('codeSentTo') }}<br></span>
        <span class="font-semibold">{{ source }}</span>
      </div>

      <strong 
        v-if="canResend"
        @click="resend"
        class="text-primary cursor-pointer"
      >
        {{ $t('retry') }}
      </strong>
      <strong v-else class="text-gray-500">
        {{ $t('retry') }} &nbsp;({{ resendCooldown }})
      </strong>
    </div>

    <label class="flex flex-col gap-2 w-full text-center my-6">
      <span class="font-semibold text-sm text-[#1E2021]">{{ $t('code') }}*</span>
      <div class="flex items-center justify-center gap-2">
        <input
          v-for="(_, idx) in digits"
          :key="idx"
          :ref="(el) => { if (el) inputRefs[idx] = el as HTMLInputElement }"
          :value="digits[idx]"
          @input="handleInput(idx, $event)"
          @keydown="handleKeydown(idx, $event)"
          @keyup.enter="verify"
          @focus="($event.target as HTMLInputElement).select()"
          class="text-center w-16 h-12 border border-[#1E202133] rounded-lg font-semibold text-xl text-[#1E2021] bg-white placeholder:text-[#1E202180] focus:outline-none focus:border-[#00AF66]"
          type="text"
          inputmode="numeric"
          maxlength="1"
        />
      </div>
    </label>

    <footer class="flex flex-col items-center justify-center mt-2 w-full">
      <div class="w-full h-px bg-[#1E202133] my-4"></div>
      <button
        @click="verify"
        :disabled="!isCodeComplete || isVerifying"
        class="w-full h-12 rounded-lg bg-[#00AF66] text-white font-semibold text-base flex items-center justify-center disabled:bg-[#00AF6666] disabled:cursor-not-allowed hover:bg-[#00AF66E6] transition-all"
      >
        <span>{{ isVerifying ? $t('verifying') : $t('confirm') }}</span>
      </button>
    </footer>
  </div>
  
  <span 
    @click="emit('close')"
    class="text-gray-500 font-semibold cursor-pointer hover:underline pb-4"
  >
    {{ $t('illDoItLater') }}
  </span>
</template>
