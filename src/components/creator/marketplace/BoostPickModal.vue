<script setup lang="ts">
import { computed } from 'vue'
import Modal from '~/components/global/Modal.vue'

interface BoostTier {
  key: 'basic' | 'pro' | 'elite'
  label: string
  tagline: string
  days: number
  priceEur: number
  features: string[]
  accent: 'amber' | 'rose' | 'violet'
}

const props = defineProps<{
  modelValue: boolean
  tier?: BoostTier | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [tier: BoostTier]
}>()

const startDate = computed(() => new Date())

const endDate = computed(() => {
  if (!props.tier) return new Date()
  const d = new Date()
  d.setDate(d.getDate() + props.tier.days)
  return d
})

const formatDate = (d: Date) =>
  d.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })

const close = () => emit('update:modelValue', false)

const onConfirm = () => {
  if (props.tier) emit('confirm', props.tier)
}
</script>

<template>
  <Modal
    :model-value="modelValue"
    title="Confirmar boost"
    max-width="max-w-md"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div v-if="tier" class="p-5 flex flex-col gap-4">
      <!-- Summary -->
      <div class="rounded-2xl border border-[#e5e5e5] bg-gradient-to-br from-[#fff8f6] to-white p-4 text-center">
        <div class="mx-auto w-14 h-14 rounded-2xl bg-white border border-[#e5e5e5] flex items-center justify-center mb-2 shadow-sm">
          <span class="mdi mdi-fire text-[26px] text-primary"></span>
        </div>
        <p class="text-[10px] font-bold text-[#888] uppercase tracking-[0.15em]">Plan seleccionado</p>
        <p class="text-[16px] font-bold text-[#1a1c1b] mt-0.5">{{ tier.label }}</p>
        <p class="text-[11px] text-[#666] mt-1">{{ tier.tagline }}</p>
      </div>

      <!-- Activation dates -->
      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-xl border border-[#e5e5e5] p-3 bg-[#fafafa]">
          <p class="text-[10px] font-bold text-[#888] uppercase tracking-[0.12em]">Comienza</p>
          <p class="text-[12px] font-bold text-[#1a1c1b] mt-0.5">{{ formatDate(startDate) }}</p>
        </div>
        <div class="rounded-xl border border-[#e5e5e5] p-3 bg-[#fafafa]">
          <p class="text-[10px] font-bold text-[#888] uppercase tracking-[0.12em]">Termina</p>
          <p class="text-[12px] font-bold text-[#1a1c1b] mt-0.5">{{ formatDate(endDate) }}</p>
        </div>
      </div>

      <!-- Features recap -->
      <ul class="flex flex-col gap-1.5">
        <li
          v-for="(f, i) in tier.features"
          :key="i"
          class="flex items-start gap-2 text-[12px] text-[#1a1c1b]"
        >
          <span class="mdi mdi-check-circle text-emerald-500 text-[14px] leading-none mt-0.5 shrink-0"></span>
          <span class="leading-snug">{{ f }}</span>
        </li>
      </ul>

      <!-- Total -->
      <div class="rounded-xl border border-[#ff2d23]/20 bg-[#fff5f4] p-4 flex items-center justify-between">
        <div>
          <p class="text-[10px] font-bold text-[#ff2d23] uppercase tracking-[0.12em]">Total a pagar</p>
          <p class="text-[11px] text-[#666] mt-0.5">IVA incluido, pago único</p>
        </div>
        <p class="text-[28px] font-black tracking-[-0.03em] text-[#ff2d23] tabular-nums leading-none">
          {{ tier.priceEur }}<span class="text-[16px]">€</span>
        </p>
      </div>

      <p class="text-[11px] text-[#999] text-center">
        <span class="mdi mdi-lock-outline"></span>
        Pago seguro procesado por Stripe (mock en dev)
      </p>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-2 p-4">
        <button
          type="button"
          class="px-4 py-2 rounded-full text-[12px] font-bold text-[#666] hover:bg-[#f0f0f0] transition-colors"
          @click="close"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-primary text-white text-[12px] font-bold shadow-pill-primary hover:bg-gradient-primary-hover transition-all"
          @click="onConfirm"
        >
          <span class="mdi mdi-credit-card-outline text-[14px]"></span>
          Pagar con Stripe
        </button>
      </div>
    </template>
  </Modal>
</template>
