<script setup lang="ts">
import type { CreatorPickFaqItem } from '~/services/apis/models/creator-pick-view-model'

const props = defineProps<{
  modelValue: CreatorPickFaqItem[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: CreatorPickFaqItem[]]
}>()

const add = () => {
  emit('update:modelValue', [...props.modelValue, { q: '', a: '' }])
}

const update = (i: number, patch: Partial<CreatorPickFaqItem>) => {
  const next = props.modelValue.map((item, idx) => idx === i ? { ...item, ...patch } : item)
  emit('update:modelValue', next)
}

const remove = (i: number) => {
  emit('update:modelValue', props.modelValue.filter((_, idx) => idx !== i))
}
</script>

<template>
  <div class="space-y-3">
    <div v-if="modelValue.length === 0" class="rounded-xl border border-dashed border-[#ddd] p-4 text-center text-[12px] text-[#888]">
      Añade preguntas frecuentes para que el negocio resuelva dudas sin tener que escribirte.
    </div>

    <div
      v-for="(item, i) in modelValue"
      :key="i"
      class="rounded-xl border border-[#e5e5e5] bg-white p-3 space-y-2"
    >
      <div class="flex items-start gap-2">
        <span class="mdi mdi-help-circle-outline text-[#ff2d23] text-[16px] mt-1.5 shrink-0"></span>
        <input
          :value="item.q"
          type="text"
          placeholder="Pregunta del negocio"
          class="flex-1 px-2 py-1.5 rounded-lg border border-[#e5e5e5] text-[13px] font-bold focus:outline-none focus:border-[#1a1c1b]"
          @input="update(i, { q: ($event.target as HTMLInputElement).value })"
        />
        <button
          type="button"
          class="w-7 h-7 inline-flex items-center justify-center rounded-full text-[#888] hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
          :aria-label="$t('delete')"
          @click="remove(i)"
        >
          <span class="mdi mdi-close text-[14px]"></span>
        </button>
      </div>
      <textarea
        :value="item.a"
        rows="2"
        placeholder="Tu respuesta"
        class="w-full px-3 py-2 rounded-lg border border-[#e5e5e5] text-[12px] focus:outline-none focus:border-[#1a1c1b] resize-none"
        @input="update(i, { a: ($event.target as HTMLTextAreaElement).value })"
      ></textarea>
    </div>

    <button
      type="button"
      class="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full border border-dashed border-[#d0d0d0] text-[12px] font-bold text-[#ff2d23] hover:bg-[#fff5f4] transition-colors"
      @click="add"
    >
      <span class="mdi mdi-plus text-[14px]"></span>
      Añadir pregunta
    </button>
  </div>
</template>
