<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCreatorVerification } from '~/composables/useCreatorVerification'
import { notifier } from '~/services/notification'

const { t } = useI18n()

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

const { markCardVerified } = useCreatorVerification()

const cardNumber = ref('')
const cardExpiry = ref('')
const cardCvc = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')

const reset = () => {
  cardNumber.value = ''
  cardExpiry.value = ''
  cardCvc.value = ''
  errorMessage.value = ''
  isSubmitting.value = false
}

watch(() => props.modelValue, (open) => { if (!open) reset() })

const formatCardNumber = (raw: string) =>
  raw.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
const formatExpiry = (raw: string) => {
  const d = raw.replace(/\D/g, '').slice(0, 4)
  return d.length <= 2 ? d : `${d.slice(0, 2)}/${d.slice(2)}`
}

const onCardInput = (e: Event) => { cardNumber.value = formatCardNumber((e.target as HTMLInputElement).value) }
const onExpiryInput = (e: Event) => { cardExpiry.value = formatExpiry((e.target as HTMLInputElement).value) }
const onCvcInput = (e: Event) => {
  cardCvc.value = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 4)
}

const isFormValid = () =>
  cardNumber.value.replace(/\s/g, '').length === 16 &&
  /^\d{2}\/\d{2}$/.test(cardExpiry.value) &&
  cardCvc.value.length >= 3

const submit = async () => {
  if (!isFormValid()) return
  isSubmitting.value = true
  errorMessage.value = ''
  try {
    await new Promise(r => setTimeout(r, 900))
    markCardVerified()
    notifier.notifySuccess(t('accountVerified'))
    emit('update:modelValue', false)
  } catch (err) {
    errorMessage.value = (err as Error)?.message || 'La verificación falló'
  } finally {
    isSubmitting.value = false
  }
}

const close = () => emit('update:modelValue', false)
</script>

<template>
  <Modal
    :model-value="modelValue"
    @update:model-value="(v) => emit('update:modelValue', v)"
    title="Verificar identidad"
    :show-close-button="true"
    max-width="max-w-md">

    <div class="p-6 flex flex-col gap-5">

      <div class="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-[#f0fdf4] to-white border border-[#22c55e]/20">
        <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-[#dcfce7] to-[#bbf7d0] flex items-center justify-center shrink-0">
          <span class="mdi mdi-shield-check text-[#22c55e] text-lg"></span>
        </div>
        <div>
          <p class="text-[13px] font-bold text-[#1a1c1b]">{{ $t('noCharge') }}</p>
          <p class="text-[12px] text-[#666] mt-0.5 leading-relaxed">{{ $t('cardAuthorizationInfo') }}</p>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-[10px] font-bold text-[#888] uppercase tracking-[0.12em]">Número de tarjeta</label>
        <input
          :value="cardNumber"
          @input="onCardInput"
          inputmode="numeric"
          autocomplete="cc-number"
          placeholder="1234 5678 9012 3456"
          class="rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-4 h-12 text-[15px] outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/10 transition-all" />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-2">
          <label class="text-[10px] font-bold text-[#888] uppercase tracking-[0.12em]">Caducidad</label>
          <input
            :value="cardExpiry"
            @input="onExpiryInput"
            inputmode="numeric"
            autocomplete="cc-exp"
            placeholder="MM/AA"
            class="rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-4 h-12 text-[15px] outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/10 transition-all" />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-[10px] font-bold text-[#888] uppercase tracking-[0.12em]">CVC</label>
          <input
            :value="cardCvc"
            @input="onCvcInput"
            inputmode="numeric"
            autocomplete="cc-csc"
            placeholder="123"
            class="rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-4 h-12 text-[15px] outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/10 transition-all" />
        </div>
      </div>

      <p v-if="errorMessage" class="text-[12px] text-red-500 font-medium">{{ errorMessage }}</p>

      <div class="flex items-center justify-center gap-2 text-[11px] text-[#999]">
        <span class="mdi mdi-lock"></span>
        <span>Datos protegidos. No se almacena tu tarjeta.</span>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between gap-3 px-6 py-4">
        <button @click="close"
          class="px-5 py-2.5 rounded-xl text-[13px] font-bold text-[#888] hover:text-[#555] hover:bg-[#f5f5f5] transition-all">
          {{ $t('cancel') }}
        </button>
        <button @click="submit" :disabled="!isFormValid() || isSubmitting"
          class="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-[13px] shadow-[0_4px_12px_rgba(16,185,129,0.25)] hover:shadow-[0_8px_20px_rgba(16,185,129,0.35)] hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
          <span v-if="isSubmitting" class="mdi mdi-loading animate-spin"></span>
          <span v-else class="mdi mdi-shield-check-outline"></span>
          {{ isSubmitting ? $t('verifying') : $t('verifyNow') }}
        </button>
      </div>
    </template>
  </Modal>
</template>
