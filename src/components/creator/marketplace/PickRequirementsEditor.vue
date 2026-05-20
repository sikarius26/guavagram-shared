<script setup lang="ts">
const props = defineProps<{
  modelValue: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const SUGGESTIONS = [
  'Invitación a probar el menú',
  'Briefing del producto o plato destacado',
  'Acceso al local o delivery',
  'Fotos / assets de marca',
  'Fechas preferidas de visita',
  'Link o teléfono de reserva',
  'Logo en alta resolución',
]

const add = (value = '') => {
  emit('update:modelValue', [...props.modelValue, value])
}

const update = (i: number, value: string) => {
  emit('update:modelValue', props.modelValue.map((v, idx) => idx === i ? value : v))
}

const remove = (i: number) => {
  emit('update:modelValue', props.modelValue.filter((_, idx) => idx !== i))
}

const availableSuggestions = () => SUGGESTIONS.filter(s => !props.modelValue.includes(s))
</script>

<template>
  <div class="space-y-3">
    <div v-if="modelValue.length === 0" class="rounded-xl border border-dashed border-[#ddd] p-4 text-center text-[12px] text-[#888]">
      Dile al negocio qué necesitas de su parte para arrancar la colaboración.
    </div>

    <ul v-else class="space-y-2">
      <li
        v-for="(req, i) in modelValue"
        :key="i"
        class="flex items-center gap-2"
      >
        <span class="mdi mdi-check-circle text-[#ff2d23] text-[16px] shrink-0"></span>
        <input
          :value="req"
          type="text"
          class="flex-1 px-3 py-2 rounded-xl border border-[#e5e5e5] text-[13px] focus:outline-none focus:border-[#1a1c1b]"
          @input="update(i, ($event.target as HTMLInputElement).value)"
        />
        <button
          type="button"
          class="w-8 h-8 inline-flex items-center justify-center rounded-full text-[#888] hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
          :aria-label="$t('delete')"
          @click="remove(i)"
        >
          <span class="mdi mdi-close text-[14px]"></span>
        </button>
      </li>
    </ul>

    <!-- Quick-add suggestions -->
    <div v-if="availableSuggestions().length > 0" class="flex flex-wrap gap-1.5">
      <button
        v-for="s in availableSuggestions()"
        :key="s"
        type="button"
        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#e5e5e5] bg-[#fafafa] text-[11px] text-[#555] hover:border-[#ff2d23]/40 hover:bg-[#fff5f4] hover:text-[#ff2d23] transition-colors"
        @click="add(s)"
      >
        <span class="mdi mdi-plus text-[12px]"></span>
        {{ s }}
      </button>
    </div>

    <button
      type="button"
      class="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full border border-dashed border-[#d0d0d0] text-[12px] font-bold text-[#ff2d23] hover:bg-[#fff5f4] transition-colors"
      @click="add('')"
    >
      <span class="mdi mdi-pencil-plus-outline text-[14px]"></span>
      Añadir requisito personalizado
    </button>
  </div>
</template>
