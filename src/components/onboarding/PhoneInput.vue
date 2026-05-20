<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  modelValue: string
  defaultDialCode?: string
}>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:isValid': [valid: boolean]
}>()

const COUNTRIES: { code: string; flag: string; dial: string; name: string }[] = [
  { code: 'ES', flag: '🇪🇸', dial: '+34', name: 'Spain' },
  { code: 'IT', flag: '🇮🇹', dial: '+39', name: 'Italy' },
  { code: 'FR', flag: '🇫🇷', dial: '+33', name: 'France' },
  { code: 'DE', flag: '🇩🇪', dial: '+49', name: 'Germany' },
  { code: 'GB', flag: '🇬🇧', dial: '+44', name: 'United Kingdom' },
  { code: 'PT', flag: '🇵🇹', dial: '+351', name: 'Portugal' },
  { code: 'NL', flag: '🇳🇱', dial: '+31', name: 'Netherlands' },
  { code: 'BE', flag: '🇧🇪', dial: '+32', name: 'Belgium' },
  { code: 'IE', flag: '🇮🇪', dial: '+353', name: 'Ireland' },
  { code: 'CH', flag: '🇨🇭', dial: '+41', name: 'Switzerland' },
  { code: 'AT', flag: '🇦🇹', dial: '+43', name: 'Austria' },
  { code: 'US', flag: '🇺🇸', dial: '+1', name: 'United States' },
  { code: 'BR', flag: '🇧🇷', dial: '+55', name: 'Brazil' },
  { code: 'MX', flag: '🇲🇽', dial: '+52', name: 'Mexico' },
  { code: 'AR', flag: '🇦🇷', dial: '+54', name: 'Argentina' }
]

const parseInitial = (val: string) => {
  const match = COUNTRIES.find(c => val?.startsWith(c.dial))
  if (match) return { dial: match.dial, national: val.slice(match.dial.length).trim() }
  return { dial: props.defaultDialCode || '+34', national: val || '' }
}

const initial = parseInitial(props.modelValue || '')
const dial = ref(initial.dial)
const national = ref(initial.national)

const fullNumber = computed(() => `${dial.value}${national.value.replace(/\s/g, '')}`)
const isValid = computed(() => {
  const digits = national.value.replace(/\D/g, '')
  return digits.length >= 6 && digits.length <= 15
})

watch([dial, national], () => {
  emit('update:modelValue', fullNumber.value)
  emit('update:isValid', isValid.value)
}, { immediate: true })
</script>

<template>
  <div class="flex items-stretch w-full">
    <select v-model="dial"
      class="rounded-l-xl border border-r-0 border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-3 h-12 text-sm outline-none focus:border-primary text-text-main">
      <option v-for="c in COUNTRIES" :key="c.code" :value="c.dial">{{ c.flag }} {{ c.dial }}</option>
    </select>
    <input v-model="national" type="tel" inputmode="tel"
      :placeholder="$t?.('phoneNumber') || 'Phone number'"
      class="form-input flex-1 rounded-r-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 h-12 text-base outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-gray-400 text-text-main" />
  </div>
</template>
