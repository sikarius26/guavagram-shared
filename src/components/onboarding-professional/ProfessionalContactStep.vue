<script setup lang="ts">
import { computed } from 'vue'
import StepShell from '~/components/onboarding/StepShell.vue'
import PhoneInput from '~/components/onboarding/PhoneInput.vue'

const props = defineProps<{ flow: any }>()
const contact = computed(() => props.flow.contact.value)

const nameValid     = computed(() => (contact.value.name || '').trim().length >= 2)
const emailValid    = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.value.email || ''))
const passwordValid = computed(() => (contact.value.password || '').length >= 8)
const phoneValid    = computed(() => !!contact.value.phoneNumber)
const canProceed    = computed(() => nameValid.value && emailValid.value && passwordValid.value && phoneValid.value)

const onNext = () => { if (canProceed.value) props.flow.next() }
</script>

<template>
  <StepShell
    title="Crea tu cuenta profesional"
    subtitle="Perfil para buscar trabajo en hostelería. Gratis, sin compromiso."
    :step="1" :total-steps="4" :can-go-back="false"
    :can-proceed="canProceed" :is-loading="!!flow.isLoading.value"
    @next="onNext">

    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-semibold text-text-main ml-1">Nombre completo</label>
      <div class="relative group">
        <input v-model="contact.name" type="text" placeholder="María Gómez"
          class="form-input w-full rounded-xl border border-gray-200 bg-gray-50 dark:bg-white/5 dark:border-white/10 px-4 h-12 text-base outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-gray-400 text-text-main" />
        <span class="mdi mdi-account absolute right-3 top-3 text-gray-400"></span>
      </div>
      <p v-if="contact.name && !nameValid" class="text-xs text-red-500 ml-1">Mínimo 2 caracteres.</p>
    </div>

    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-semibold text-text-main ml-1">Email</label>
      <div class="relative group">
        <input v-model="contact.email" type="email" placeholder="tu@email.com"
          class="form-input w-full rounded-xl border border-gray-200 bg-gray-50 dark:bg-white/5 dark:border-white/10 px-4 h-12 text-base outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-gray-400 text-text-main" />
        <span class="mdi mdi-email absolute right-3 top-3 text-gray-400"></span>
      </div>
      <p v-if="contact.email && !emailValid" class="text-xs text-red-500 ml-1">Email inválido.</p>
    </div>

    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-semibold text-text-main ml-1">Contraseña</label>
      <div class="relative group">
        <input v-model="contact.password" type="password" placeholder="Mínimo 8 caracteres"
          class="form-input w-full rounded-xl border border-gray-200 bg-gray-50 dark:bg-white/5 dark:border-white/10 px-4 h-12 text-base outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-gray-400 text-text-main" />
        <span class="mdi mdi-lock absolute right-3 top-3 text-gray-400"></span>
      </div>
      <p v-if="contact.password && !passwordValid" class="text-xs text-red-500 ml-1">Mínimo 8 caracteres.</p>
    </div>

    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-semibold text-text-main ml-1">Teléfono</label>
      <PhoneInput v-model="contact.phoneNumber" v-model:dial-code="contact.phoneDialCode" />
    </div>
  </StepShell>
</template>
