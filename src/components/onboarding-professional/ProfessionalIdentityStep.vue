<script setup lang="ts">
import { computed } from 'vue'
import StepShell from '~/components/onboarding/StepShell.vue'

const props = defineProps<{ flow: any }>()
const identity = computed(() => props.flow.identity.value)

const handleValid = computed(() => /^[a-z0-9._-]{3,24}$/.test(identity.value.handle || ''))
const cityValid   = computed(() => (identity.value.city || '').trim().length >= 2)
const canProceed  = computed(() => handleValid.value && cityValid.value)

const onNext = () => { if (canProceed.value) props.flow.next() }
const onBack = () => props.flow.prev()

const normalizeHandle = () => {
  identity.value.handle = (identity.value.handle || '')
    .toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, 24)
}
</script>

<template>
  <StepShell
    title="Tu perfil público"
    subtitle="Así te verán los restaurantes. Puedes editarlo después."
    :step="2" :total-steps="4" :can-go-back="true"
    :can-proceed="canProceed" :is-loading="!!flow.isLoading.value"
    @next="onNext" @back="onBack">

    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-semibold text-text-main ml-1">Handle</label>
      <div class="relative group">
        <span class="absolute left-4 top-3 text-gray-400">@</span>
        <input v-model="identity.handle" @input="normalizeHandle" type="text" placeholder="maria.cocinera"
          class="form-input w-full rounded-xl border border-gray-200 bg-gray-50 dark:bg-white/5 dark:border-white/10 pl-8 pr-4 h-12 text-base outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-gray-400 text-text-main" />
      </div>
      <p v-if="identity.handle && !handleValid" class="text-xs text-red-500 ml-1">3-24 caracteres. Solo letras, números, puntos, guiones.</p>
      <p v-else-if="handleValid" class="text-xs text-emerald-600 ml-1">guavagram.com/p/{{ identity.handle }}</p>
    </div>

    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-semibold text-text-main ml-1">Ciudad principal</label>
      <div class="relative group">
        <input v-model="identity.city" type="text" placeholder="Madrid"
          class="form-input w-full rounded-xl border border-gray-200 bg-gray-50 dark:bg-white/5 dark:border-white/10 px-4 h-12 text-base outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-gray-400 text-text-main" />
        <span class="mdi mdi-map-marker absolute right-3 top-3 text-gray-400"></span>
      </div>
    </div>

    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-semibold text-text-main ml-1">Presentación <span class="text-gray-400 font-normal">(opcional)</span></label>
      <textarea v-model="identity.bio" rows="3" maxlength="280"
        placeholder="Cocinero con 5 años de experiencia en mediterránea, ganas de proyectos de carta creativa."
        class="form-input w-full rounded-xl border border-gray-200 bg-gray-50 dark:bg-white/5 dark:border-white/10 px-4 py-3 text-base outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-gray-400 text-text-main resize-none"></textarea>
      <p class="text-xs text-gray-400 ml-1">{{ (identity.bio || '').length }} / 280</p>
    </div>
  </StepShell>
</template>
