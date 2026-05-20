<script setup lang="ts">
import { computed } from 'vue'
import StepShell from '~/components/onboarding/StepShell.vue'
import {
  PROFESSIONAL_ROLES, SHIFT_LABELS, CERTIFICATES,
  type ProfessionalRoleTag, type ShiftPreference, type CertificateTag,
} from '~/services/apis/models/professional-profile-view-model'

const props = defineProps<{ flow: any }>()
const prefs = computed(() => props.flow.preferences.value)

const toggleRole = (id: ProfessionalRoleTag) => {
  const i = prefs.value.seekingRoles.indexOf(id)
  if (i >= 0) prefs.value.seekingRoles.splice(i, 1)
  else prefs.value.seekingRoles.push(id)
}
const toggleShift = (id: ShiftPreference) => {
  const i = prefs.value.shiftPreferences.indexOf(id)
  if (i >= 0) prefs.value.shiftPreferences.splice(i, 1)
  else prefs.value.shiftPreferences.push(id)
}
const shiftEntries: { id: ShiftPreference; label: string }[] = (Object.entries(SHIFT_LABELS) as [ShiftPreference, string][])
  .map(([id, label]) => ({ id, label }))
const isShiftActive = (id: ShiftPreference) => prefs.value.shiftPreferences.includes(id)
const toggleCert = (id: CertificateTag) => {
  const i = prefs.value.certificates.indexOf(id)
  if (i >= 0) prefs.value.certificates.splice(i, 1)
  else prefs.value.certificates.push(id)
}

const canProceed = computed(() => prefs.value.seekingRoles.length > 0)

const onFinish = async () => {
  if (!canProceed.value) return
  try {
    const result = await props.flow.registerProfessional()
    if (result.success) await navigateTo('/professional-dashboard')
  } catch { /* notifier handles */ }
}
const onBack = () => props.flow.prev()

const rolesByCategory = computed(() => {
  const groups: Record<string, typeof PROFESSIONAL_ROLES> = { cocina: [], sala: [], barra: [], otros: [] }
  for (const r of PROFESSIONAL_ROLES) groups[r.category]!.push(r)
  return groups
})
</script>

<template>
  <StepShell
    title="¿Qué buscas?"
    subtitle="Completa tus preferencias — así te mostramos ofertas que encajan."
    :step="4" :total-steps="4" :can-go-back="true"
    :can-proceed="canProceed" :is-loading="!!flow.isLoading.value"
    next-label="Crear cuenta"
    @next="onFinish" @back="onBack">

    <!-- Seeking roles -->
    <div class="flex flex-col gap-2">
      <label class="text-sm font-semibold text-text-main ml-1">Puestos que buscas <span class="text-red-500">*</span></label>
      <div v-for="(roles, cat) in rolesByCategory" :key="cat" class="flex flex-col gap-1">
        <p class="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">{{ cat }}</p>
        <div class="flex flex-wrap gap-1.5">
          <button v-for="r in roles" :key="r.id" @click="toggleRole(r.id)" type="button"
            class="flex items-center gap-1.5 px-3 h-9 rounded-lg text-[12px] font-semibold transition-all border"
            :class="prefs.seekingRoles.includes(r.id)
              ? 'bg-[#0ea5e9] border-[#0ea5e9] text-white'
              : 'bg-white border-gray-200 text-gray-700 hover:border-[#0ea5e9] hover:text-[#0ea5e9]'">
            <span class="mdi" :class="r.icon"></span>
            {{ r.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Shifts -->
    <div class="flex flex-col gap-2">
      <label class="text-sm font-semibold text-text-main ml-1">Turnos disponibles</label>
      <div class="grid grid-cols-4 gap-2">
        <button v-for="s in shiftEntries" :key="s.id" @click="toggleShift(s.id)" type="button"
          class="h-10 rounded-lg text-[12px] font-semibold transition-all border"
          :class="isShiftActive(s.id)
            ? 'bg-[#0ea5e9] border-[#0ea5e9] text-white'
            : 'bg-white border-gray-200 text-gray-700 hover:border-[#0ea5e9]'">
          {{ s.label }}
        </button>
      </div>
    </div>

    <!-- Hours + rate -->
    <div class="grid grid-cols-2 gap-3">
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-semibold text-text-main ml-1">Horas / semana</label>
        <div class="flex items-center gap-2">
          <input v-model.number="prefs.hoursPerWeekMin" type="number" min="1" max="60"
            class="flex-1 h-11 rounded-lg border border-gray-200 bg-white px-3 text-[13px] text-center outline-none focus:border-primary" />
          <span class="text-gray-400">—</span>
          <input v-model.number="prefs.hoursPerWeekMax" type="number" min="1" max="60"
            class="flex-1 h-11 rounded-lg border border-gray-200 bg-white px-3 text-[13px] text-center outline-none focus:border-primary" />
        </div>
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-semibold text-text-main ml-1">Salario / hora (€)</label>
        <div class="flex items-center gap-2">
          <input v-model.number="prefs.hourlyRateEurMin" type="number" min="0" step="0.5"
            class="flex-1 h-11 rounded-lg border border-gray-200 bg-white px-3 text-[13px] text-center outline-none focus:border-primary" />
          <span class="text-gray-400">—</span>
          <input v-model.number="prefs.hourlyRateEurMax" type="number" min="0" step="0.5"
            class="flex-1 h-11 rounded-lg border border-gray-200 bg-white px-3 text-[13px] text-center outline-none focus:border-primary" />
        </div>
      </div>
    </div>

    <!-- Certificates -->
    <div class="flex flex-col gap-2">
      <label class="text-sm font-semibold text-text-main ml-1">Certificaciones que tienes</label>
      <div class="flex flex-wrap gap-1.5">
        <button v-for="c in CERTIFICATES" :key="c.id" @click="toggleCert(c.id)" type="button"
          class="flex items-center gap-1.5 px-3 h-8 rounded-lg text-[11px] font-semibold transition-all border"
          :class="prefs.certificates.includes(c.id)
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'bg-white border-gray-200 text-gray-700 hover:border-emerald-500 hover:text-emerald-600'">
          <span class="mdi mdi-certificate-outline text-[13px]"></span>
          {{ c.label }}
        </button>
      </div>
    </div>

    <!-- Availability -->
    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-semibold text-text-main ml-1">Disponible desde</label>
      <input v-model="prefs.availableFrom" type="date"
        class="form-input w-full rounded-xl border border-gray-200 bg-gray-50 px-4 h-12 text-base outline-none focus:border-primary" />
    </div>
  </StepShell>
</template>
