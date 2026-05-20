<script setup lang="ts">
import { ref, computed } from 'vue'

defineProps<{
  isLoading?: boolean
}>()

const emit = defineEmits<{
  submit: [info: { email: string; password: string; name: string }]
}>()

const name = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)

const emailValid = computed(() => /.+@.+\..+/.test(email.value.trim()))
// Loose policy that matches what the backend (BCrypt-hashed) accepts; the
// owner can tighten it later in account settings.
const passwordValid = computed(() => password.value.length >= 8)
const nameValid = computed(() => name.value.trim().length >= 2)

const canSubmit = computed(() => emailValid.value && passwordValid.value && nameValid.value)

const onSubmit = () => {
  if (!canSubmit.value) return
  emit('submit', {
    name: name.value.trim(),
    email: email.value.trim().toLowerCase(),
    password: password.value,
  })
}
</script>

<template>
  <form class="flex flex-col gap-3" @submit.prevent="onSubmit">
    <div>
      <label class="text-sm font-semibold ml-1 text-gray-800 dark:text-white">Tu nombre</label>
      <input v-model="name" type="text" autocomplete="name" required
        class="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 dark:bg-white/5 dark:border-white/10 px-4 h-12 text-base outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
        placeholder="Pau Artiso" />
    </div>

    <div>
      <label class="text-sm font-semibold ml-1 text-gray-800 dark:text-white">Email</label>
      <input v-model="email" type="email" autocomplete="email" required
        class="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 dark:bg-white/5 dark:border-white/10 px-4 h-12 text-base outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
        placeholder="tu@restaurante.com" />
    </div>

    <div>
      <label class="text-sm font-semibold ml-1 text-gray-800 dark:text-white">Contraseña</label>
      <div class="relative mt-1">
        <input v-model="password" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" required
          class="w-full rounded-xl border border-gray-200 bg-gray-50 dark:bg-white/5 dark:border-white/10 px-4 pr-11 h-12 text-base outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
          placeholder="Mínimo 8 caracteres" />
        <button type="button" @click="showPassword = !showPassword"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 dark:hover:text-white">
          <span class="mdi" :class="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"></span>
        </button>
      </div>
      <p v-if="password.length > 0 && !passwordValid" class="text-[11px] text-red-500 mt-1 ml-1">Mínimo 8 caracteres.</p>
    </div>

    <button type="submit" :disabled="!canSubmit || isLoading"
      class="h-12 mt-1 rounded-full bg-gradient-emerald hover:bg-gradient-emerald-hover text-white font-medium shadow-pill-emerald disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all flex items-center justify-center gap-2">
      <span v-if="isLoading" class="mdi mdi-loading animate-spin text-lg"></span>
      <template v-else>Crear cuenta</template>
    </button>
  </form>
</template>
