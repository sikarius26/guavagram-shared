<script setup lang="ts">
import { ref, computed } from 'vue'
import StepShell from '~/components/onboarding/StepShell.vue'
import { PROFESSIONAL_ROLES, type ProfessionalRoleTag } from '~/services/apis/models/professional-profile-view-model'

const props = defineProps<{ flow: any }>()
const experience = computed(() => props.flow.experience.value)

const showForm = ref(false)
const draft = ref<{ restaurantName: string; role: ProfessionalRoleTag | ''; startMonth: string; endMonth: string; current: boolean; description: string }>({
  restaurantName: '', role: '', startMonth: '', endMonth: '', current: false, description: '',
})

const draftValid = computed(() =>
  !!draft.value.restaurantName && !!draft.value.role &&
  !!draft.value.startMonth &&
  (draft.value.current || !!draft.value.endMonth)
)

const addItem = () => {
  if (!draftValid.value) return
  props.flow.addWorkExperience({
    restaurantName: draft.value.restaurantName,
    role: draft.value.role as ProfessionalRoleTag,
    startMonth: draft.value.startMonth,
    endMonth: draft.value.current ? null : draft.value.endMonth,
    description: draft.value.description || undefined,
  })
  draft.value = { restaurantName: '', role: '', startMonth: '', endMonth: '', current: false, description: '' }
  showForm.value = false
}

const removeItem = (id: string) => props.flow.removeWorkExperience(id)

const roleLabel = (id: ProfessionalRoleTag) =>
  PROFESSIONAL_ROLES.find(r => r.id === id)?.label || id
const formatMonth = (m: string) => {
  if (!m) return '—'
  const [y, mo] = m.split('-')
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  return `${months[parseInt(mo || '1', 10) - 1]} ${y}`
}

const onNext = () => props.flow.next()
const onBack = () => props.flow.prev()
</script>

<template>
  <StepShell
    title="Tu experiencia"
    subtitle="Añade dónde has trabajado. Luego podrás pedir a cada restaurante que verifique tu paso por allí."
    :step="3" :total-steps="4" :can-go-back="true"
    :can-proceed="true" :is-loading="!!flow.isLoading.value"
    @next="onNext" @back="onBack">

    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-semibold text-text-main ml-1">Años totales de experiencia</label>
      <input v-model.number="experience.experienceYears" type="number" min="0" max="50" placeholder="0"
        class="form-input w-full rounded-xl border border-gray-200 bg-gray-50 dark:bg-white/5 dark:border-white/10 px-4 h-12 text-base outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-gray-400 text-text-main" />
    </div>

    <!-- Work history list -->
    <div class="flex flex-col gap-2">
      <label class="text-sm font-semibold text-text-main ml-1">Restaurantes donde has trabajado</label>
      <div v-for="item in experience.workHistory" :key="item.id"
        class="flex items-start gap-3 p-3 rounded-xl border border-gray-200 bg-white">
        <div class="w-9 h-9 rounded-lg bg-[#f0f9ff] flex items-center justify-center shrink-0">
          <span class="mdi mdi-briefcase-outline text-[#0ea5e9]"></span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[13px] font-bold text-text-main">{{ item.restaurantName }}</p>
          <p class="text-[11px] text-gray-500">{{ roleLabel(item.role) }} · {{ formatMonth(item.startMonth) }} — {{ item.endMonth ? formatMonth(item.endMonth) : 'Actualidad' }}</p>
          <p v-if="item.description" class="text-[11px] text-gray-600 mt-1 line-clamp-2">{{ item.description }}</p>
        </div>
        <button @click="removeItem(item.id)" type="button" class="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50">
          <span class="mdi mdi-delete-outline text-red-400 text-[14px]"></span>
        </button>
      </div>

      <button v-if="!showForm" @click="showForm = true" type="button"
        class="h-11 rounded-xl border border-dashed border-gray-300 text-[13px] font-bold text-gray-600 hover:border-[#0ea5e9] hover:text-[#0ea5e9] transition-colors flex items-center justify-center gap-1.5">
        <span class="mdi mdi-plus"></span> Añadir experiencia
      </button>

      <!-- Inline form -->
      <div v-if="showForm" class="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col gap-3">
        <input v-model="draft.restaurantName" type="text" placeholder="Nombre del restaurante"
          class="h-11 rounded-lg border border-gray-200 bg-white px-3 text-[13px] outline-none focus:border-primary" />
        <select v-model="draft.role"
          class="h-11 rounded-lg border border-gray-200 bg-white px-3 text-[13px] outline-none focus:border-primary">
          <option value="">Puesto que ocupaste</option>
          <option v-for="r in PROFESSIONAL_ROLES" :key="r.id" :value="r.id">{{ r.label }}</option>
        </select>
        <div class="grid grid-cols-2 gap-2">
          <input v-model="draft.startMonth" type="month" placeholder="Inicio"
            class="h-11 rounded-lg border border-gray-200 bg-white px-3 text-[13px] outline-none focus:border-primary" />
          <input v-model="draft.endMonth" type="month" :disabled="draft.current" placeholder="Fin"
            class="h-11 rounded-lg border border-gray-200 bg-white px-3 text-[13px] outline-none focus:border-primary disabled:bg-gray-100 disabled:text-gray-400" />
        </div>
        <label class="flex items-center gap-2 text-[12px] text-gray-700">
          <input v-model="draft.current" type="checkbox" class="rounded"> Sigo trabajando aquí actualmente
        </label>
        <textarea v-model="draft.description" rows="2" maxlength="200"
          placeholder="Responsabilidades o proyectos destacados (opcional)"
          class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] outline-none focus:border-primary resize-none"></textarea>
        <div class="flex items-center gap-2">
          <button @click="showForm = false" type="button"
            class="flex-1 h-10 rounded-lg border border-gray-200 text-[12px] font-bold text-gray-600 hover:bg-gray-100">{{ $t('cancel') }}</button>
          <button @click="addItem" :disabled="!draftValid" type="button"
            class="flex-1 h-10 rounded-lg bg-[#0ea5e9] text-white text-[12px] font-bold hover:bg-[#0284c7] disabled:opacity-40 disabled:cursor-not-allowed">Guardar</button>
        </div>
      </div>
    </div>

    <p class="text-[11px] text-gray-500 leading-relaxed">
      <span class="mdi mdi-information-outline"></span>
      Si no tienes experiencia todavía, no pasa nada — puedes saltarte este paso. Muchos restaurantes buscan ayudantes sin experiencia previa.
    </p>
  </StepShell>
</template>
