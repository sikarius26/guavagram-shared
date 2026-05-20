<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Modal from '~/components/global/Modal.vue'
import PublicDiscountCodePill from '~/components/creator/public/PublicDiscountCodePill.vue'
import { CreatorDiscountCodeViewModel } from '~/services/apis/models/creator-discount-code-view-model'
import { notifier } from '~/services/notification'

const { t } = useI18n()

const props = defineProps<{
  modelValue: boolean
  storeId: string | undefined
  storeName?: string
  initial?: CreatorDiscountCodeViewModel | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'save': [code: CreatorDiscountCodeViewModel]
}>()

type DiscountMode = 'percent' | 'flat'

const code = ref('')
const mode = ref<DiscountMode>('percent')
const percentOff = ref<number | undefined>(10)
const flatOffCents = ref<number | undefined>(undefined)
const description = ref('')
const expireAtStr = ref('')
const maxUses = ref<number | undefined>(undefined)

const resetFromInitial = () => {
  const init = props.initial
  code.value = (init?.code ?? '').toUpperCase()
  if (init?.flatOffCents && init.flatOffCents > 0) {
    mode.value = 'flat'
    flatOffCents.value = init.flatOffCents
    percentOff.value = undefined
  } else {
    mode.value = 'percent'
    percentOff.value = init?.percentOff ?? 10
    flatOffCents.value = undefined
  }
  description.value = init?.description ?? ''
  expireAtStr.value = init?.expireAt ? new Date(init.expireAt).toISOString().slice(0, 10) : ''
  maxUses.value = init?.maxUses ?? undefined
}

watch(() => props.modelValue, (v) => { if (v) resetFromInitial() }, { immediate: true })

// Auto-uppercase
watch(code, (v) => {
  const up = (v || '').toUpperCase().replace(/\s+/g, '')
  if (up !== v) code.value = up
})

const flatEurosModel = computed({
  get: () => flatOffCents.value != null ? (flatOffCents.value / 100) : undefined,
  set: (v: number | undefined) => { flatOffCents.value = (v != null && !isNaN(v)) ? Math.round(v * 100) : undefined }
})

const canSave = computed(() => {
  if (!code.value.trim()) return false
  if (mode.value === 'percent') return !!percentOff.value && percentOff.value > 0 && percentOff.value <= 100
  return !!flatOffCents.value && flatOffCents.value > 0
})

const previewCode = computed(() => ({
  code: code.value || 'CODIGO',
  percentOff: mode.value === 'percent' ? percentOff.value : undefined,
  flatOffCents: mode.value === 'flat' ? flatOffCents.value : undefined,
  description: description.value,
}))

const close = () => emit('update:modelValue', false)

const handleSave = () => {
  if (!canSave.value) {
    notifier.notifyWarning(t('completeCodeAndDiscount'))
    return
  }
  const vm = CreatorDiscountCodeViewModel.fromJS({
    code: code.value.trim().toUpperCase(),
    percentOff: mode.value === 'percent' ? percentOff.value : undefined,
    flatOffCents: mode.value === 'flat' ? flatOffCents.value : undefined,
    description: description.value.trim() || undefined,
    storeId: props.storeId,
    expireAt: expireAtStr.value ? new Date(expireAtStr.value) : undefined,
    usageCount: props.initial?.usageCount ?? 0,
    maxUses: maxUses.value ?? undefined,
  })
  emit('save', vm)
  emit('update:modelValue', false)
}
</script>

<template>
  <Modal :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)"
    title="Codigo de descuento" max-width="max-w-lg" no-scroll>
    <div class="p-4 space-y-2.5">

      <!-- Store info -->
      <div v-if="storeName" class="flex items-center gap-2 text-[11px] text-[#666] bg-[#fafafa] rounded-lg px-3 py-1.5 border border-[#eee]">
        <span class="mdi mdi-silverware-fork-knife text-sm text-primary"></span>
        <span>Para: <strong class="text-[#1a1c1b]">{{ storeName }}</strong></span>
      </div>

      <!-- Live preview -->
      <div class="rounded-xl border border-dashed border-[#ddd] bg-[#fafafa] p-2.5 flex items-center justify-center">
        <PublicDiscountCodePill
          :code="previewCode.code"
          :percent-off="previewCode.percentOff"
          :flat-off-cents="previewCode.flatOffCents"
          :description="previewCode.description"
          size="lg" />
      </div>

      <!-- Code + discount type -->
      <div class="grid grid-cols-2 gap-2">
        <div class="flex flex-col gap-1">
          <label class="text-[10px] font-bold uppercase tracking-wider text-[#666]">Codigo</label>
          <input v-model="code" type="text" placeholder="WELCOME10"
            class="rounded-lg border border-[#ddd] bg-[#fafafa] px-3 h-9 text-[13px] font-mono font-bold tracking-wider outline-none focus:border-primary" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-[10px] font-bold uppercase tracking-wider text-[#666]">Tipo</label>
          <div class="grid grid-cols-2 gap-1.5">
            <label class="flex items-center justify-center gap-1.5 cursor-pointer rounded-lg border border-[#ddd] bg-[#fafafa] px-2 h-9 hover:border-primary transition-colors"
              :class="mode === 'percent' ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : ''">
              <input type="radio" v-model="mode" value="percent" class="accent-primary h-3 w-3" />
              <span class="text-[12px] font-semibold">%</span>
            </label>
            <label class="flex items-center justify-center gap-1.5 cursor-pointer rounded-lg border border-[#ddd] bg-[#fafafa] px-2 h-9 hover:border-primary transition-colors"
              :class="mode === 'flat' ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : ''">
              <input type="radio" v-model="mode" value="flat" class="accent-primary h-3 w-3" />
              <span class="text-[12px] font-semibold">EUR</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Amount + description -->
      <div class="grid grid-cols-2 gap-2">
        <div v-if="mode === 'percent'" class="flex flex-col gap-1">
          <label class="text-[10px] font-bold uppercase tracking-wider text-[#666]">Porcentaje</label>
          <div class="relative">
            <input v-model.number="percentOff" type="number" min="1" max="100"
              class="rounded-lg border border-[#ddd] bg-[#fafafa] px-3 h-9 text-[13px] outline-none focus:border-primary w-full pr-8" />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-[#888]">%</span>
          </div>
        </div>
        <div v-else class="flex flex-col gap-1">
          <label class="text-[10px] font-bold uppercase tracking-wider text-[#666]">Importe</label>
          <div class="relative">
            <input v-model.number="flatEurosModel" type="number" min="0.5" step="0.5"
              class="rounded-lg border border-[#ddd] bg-[#fafafa] px-3 h-9 text-[13px] outline-none focus:border-primary w-full pr-10" />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-[#888]">EUR</span>
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-[10px] font-bold uppercase tracking-wider text-[#666]">Descripcion (opcional)</label>
          <input v-model="description" type="text" placeholder="Lun-Jue"
            class="rounded-lg border border-[#ddd] bg-[#fafafa] px-3 h-9 text-[13px] outline-none focus:border-primary" />
        </div>
      </div>

      <!-- Expire + max uses -->
      <div class="grid grid-cols-2 gap-2">
        <div class="flex flex-col gap-1">
          <label class="text-[10px] font-bold uppercase tracking-wider text-[#666]">Caduca</label>
          <input v-model="expireAtStr" type="date"
            class="rounded-lg border border-[#ddd] bg-[#fafafa] px-3 h-9 text-[13px] outline-none focus:border-primary" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-[10px] font-bold uppercase tracking-wider text-[#666]">Usos maximos</label>
          <input v-model.number="maxUses" type="number" min="1" placeholder="Sin limite"
            class="rounded-lg border border-[#ddd] bg-[#fafafa] px-3 h-9 text-[13px] outline-none focus:border-primary" />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2 p-3">
        <button type="button" @click="close"
          class="h-9 px-4 rounded-lg text-[12px] font-semibold text-[#666] hover:bg-[#f0f0f0] transition-colors">
          Cancelar
        </button>
        <button type="button" @click="handleSave" :disabled="!canSave"
          class="h-9 px-4 rounded-lg text-[12px] font-bold text-white active:scale-[0.98] transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow: 0 4px 12px rgba(16,185,129,0.25);">
          <span class="mdi mdi-content-save-outline mr-1"></span>
          Guardar codigo
        </button>
      </div>
    </template>
  </Modal>
</template>
