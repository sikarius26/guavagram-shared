<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Modal from '~/components/global/Modal.vue'
import { CreatorProposalStatusEnum } from '~/services/apis/models/creator-proposal-status-enum'
import { CreatorPickCategoryEnum } from '~/services/apis/models/creator-pick-category-enum'

const props = defineProps<{
  modelValue: boolean
  proposal?: any | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  accept: [proposal: any]
  reject: [proposal: any, reason?: string]
  negotiate: [proposal: any, message: string]
}>()

const negotiating = ref(false)
const negotiationMessage = ref('')
const rejectingReason = ref('')
const showRejectInput = ref(false)

const statusMeta: Record<number, { label: string; cls: string; dotCls: string }> = {
  [CreatorProposalStatusEnum.PENDING]: { label: 'Pendiente', cls: 'bg-amber-50 text-amber-700 border-amber-200', dotCls: 'bg-amber-500' },
  [CreatorProposalStatusEnum.ACCEPTED]: { label: 'Aceptada', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotCls: 'bg-emerald-500' },
  [CreatorProposalStatusEnum.REJECTED]: { label: 'Rechazada', cls: 'bg-red-50 text-red-700 border-red-200', dotCls: 'bg-red-500' },
  [CreatorProposalStatusEnum.EXPIRED]: { label: 'Expirada', cls: 'bg-gray-100 text-gray-600 border-gray-200', dotCls: 'bg-gray-400' },
}

const categoryLabels: Record<number, string> = {
  [CreatorPickCategoryEnum.BIO_SLOT]: 'Slot en bio',
  [CreatorPickCategoryEnum.PRINCIPAL_FEATURED]: 'Principal destacado',
  [CreatorPickCategoryEnum.STORY]: 'Story',
  [CreatorPickCategoryEnum.VIDEO_REVIEW]: 'Video review',
  [CreatorPickCategoryEnum.CAMPAIGN]: 'Campana',
}

watch(() => props.modelValue, (open) => {
  if (open) {
    negotiating.value = false
    negotiationMessage.value = ''
    showRejectInput.value = false
    rejectingReason.value = ''
  }
})

const isPending = computed(() => props.proposal?.status === CreatorProposalStatusEnum.PENDING)

const offerEur = computed(() => Math.round((props.proposal?.offerCents ?? 0) / 100))

const deadlineFormatted = computed(() => {
  const d = props.proposal?.deadline
  if (!d) return null
  const date = d instanceof Date ? d : new Date(d)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
})

const receivedFormatted = computed(() => {
  const d = props.proposal?.receivedAt
  if (!d) return ''
  const date = d instanceof Date ? d : new Date(d)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
})

const close = () => emit('update:modelValue', false)

const doAccept = () => {
  if (!props.proposal) return
  emit('accept', props.proposal)
}

const startReject = () => {
  showRejectInput.value = true
  negotiating.value = false
}

const confirmReject = () => {
  if (!props.proposal) return
  emit('reject', props.proposal, rejectingReason.value.trim() || undefined)
}

const startNegotiate = () => {
  negotiating.value = true
  showRejectInput.value = false
}

const confirmNegotiate = () => {
  if (!props.proposal) return
  const msg = negotiationMessage.value.trim()
  if (!msg) return
  emit('negotiate', props.proposal, msg)
}
</script>

<template>
  <Modal
    :model-value="modelValue"
    title="Detalles de la propuesta"
    max-width="max-w-xl"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div v-if="proposal" class="p-5 flex flex-col gap-5">
      <!-- Store info -->
      <div class="flex items-center gap-3">
        <div class="w-14 h-14 rounded-2xl overflow-hidden bg-[#f3f3f3] flex items-center justify-center shrink-0 ring-1 ring-[#eee]">
          <img v-if="proposal.storeLogoUrl" :src="proposal.storeLogoUrl" class="w-full h-full object-cover" :alt="proposal.fromStoreName" />
          <span v-else class="mdi mdi-store-outline text-[#bbb] text-[26px]"></span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[16px] font-bold tracking-[-0.02em] text-[#1a1c1b] truncate">{{ proposal.fromStoreName }}</p>
          <div class="flex items-center gap-2 mt-0.5 flex-wrap">
            <span
              v-if="statusMeta[proposal.status]"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border"
              :class="statusMeta[proposal.status].cls"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="statusMeta[proposal.status].dotCls"></span>
              {{ statusMeta[proposal.status].label }}
            </span>
            <span class="text-[11px] text-[#888]">Recibida: {{ receivedFormatted }}</span>
          </div>
        </div>
        <a
          v-if="proposal.fromStoreId"
          :href="`/r/${proposal.fromStoreId}`"
          target="_blank"
          class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#e5e5e5] text-[11px] font-bold text-[#1a1c1b] hover:bg-[#fafafa] shrink-0"
        >
          <span class="mdi mdi-open-in-new text-[12px]"></span>
          Perfil
        </a>
      </div>

      <!-- Info grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="rounded-xl border border-[#e5e5e5] p-3 bg-[#fafafa]">
          <p class="text-[10px] font-bold text-[#888] uppercase tracking-[0.12em]">Pick solicitado</p>
          <p class="text-[13px] font-bold text-[#1a1c1b] mt-1">
            {{ categoryLabels[proposal.pickCategory] ?? 'Sin categoria' }}
          </p>
        </div>
        <div class="rounded-xl border border-[#ff2d23]/20 p-3 bg-[#fff5f4]">
          <p class="text-[10px] font-bold text-[#ff2d23] uppercase tracking-[0.12em]">Oferta</p>
          <p class="text-[22px] font-black tracking-[-0.02em] text-[#ff2d23] tabular-nums mt-0.5 leading-none">
            {{ offerEur.toLocaleString('es-ES') }}<span class="text-[14px]">€</span>
          </p>
        </div>
      </div>

      <!-- Deadline -->
      <div v-if="deadlineFormatted" class="flex items-center gap-2 text-[12px] text-[#666]">
        <span class="mdi mdi-clock-outline text-[14px] text-amber-500"></span>
        <span>Deadline para responder: <span class="font-bold text-[#1a1c1b]">{{ deadlineFormatted }}</span></span>
      </div>

      <!-- Message -->
      <div v-if="proposal.message">
        <p class="text-[10px] font-bold text-[#888] uppercase tracking-[0.12em] mb-1.5">Mensaje del negocio</p>
        <div class="rounded-xl border border-[#e5e5e5] bg-white p-3">
          <p class="text-[13px] text-[#1a1c1b] leading-relaxed whitespace-pre-wrap">{{ proposal.message }}</p>
        </div>
      </div>

      <!-- Already-responded message -->
      <div v-if="!isPending && proposal.responseMessage" class="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-3">
        <p class="text-[10px] font-bold text-[#888] uppercase tracking-[0.12em] mb-1">Tu respuesta</p>
        <p class="text-[13px] text-[#1a1c1b] leading-relaxed whitespace-pre-wrap">{{ proposal.responseMessage }}</p>
      </div>

      <!-- Negotiate input -->
      <div v-if="isPending && negotiating" class="flex flex-col gap-2">
        <label class="text-[10px] font-bold text-[#888] uppercase tracking-[0.12em]">Mensaje para negociar</label>
        <textarea
          v-model="negotiationMessage"
          rows="3"
          placeholder="Propon una contra-oferta o aclaraciones..."
          class="w-full px-3 py-2 rounded-xl border border-[#e5e5e5] text-[13px] focus:outline-none focus:border-[#1a1c1b] transition-colors resize-none"
        ></textarea>
        <div class="flex items-center justify-end gap-2">
          <button
            type="button"
            class="px-3 py-1.5 rounded-full text-[11px] font-bold text-[#666] hover:bg-[#f0f0f0]"
            @click="negotiating = false"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-[#1a1c1b] text-white text-[11px] font-bold hover:bg-black"
            :disabled="!negotiationMessage.trim()"
            :class="!negotiationMessage.trim() ? 'opacity-50 cursor-not-allowed' : ''"
            @click="confirmNegotiate"
          >
            <span class="mdi mdi-send text-[13px]"></span>
            Enviar
          </button>
        </div>
      </div>

      <!-- Reject input -->
      <div v-if="isPending && showRejectInput" class="flex flex-col gap-2">
        <label class="text-[10px] font-bold text-[#888] uppercase tracking-[0.12em]">Motivo del rechazo (opcional)</label>
        <textarea
          v-model="rejectingReason"
          rows="2"
          placeholder="Explica brevemente por que rechazas..."
          class="w-full px-3 py-2 rounded-xl border border-[#e5e5e5] text-[13px] focus:outline-none focus:border-red-400 transition-colors resize-none"
        ></textarea>
        <div class="flex items-center justify-end gap-2">
          <button
            type="button"
            class="px-3 py-1.5 rounded-full text-[11px] font-bold text-[#666] hover:bg-[#f0f0f0]"
            @click="showRejectInput = false"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold hover:bg-red-600"
            @click="confirmReject"
          >
            <span class="mdi mdi-close text-[13px]"></span>
            Confirmar rechazo
          </button>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between gap-2 p-4 flex-wrap">
        <button
          type="button"
          class="px-4 py-2 rounded-full text-[12px] font-bold text-[#666] hover:bg-[#f0f0f0] transition-colors"
          @click="close"
        >
          Cerrar
        </button>
        <div v-if="isPending && !negotiating && !showRejectInput" class="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            class="inline-flex items-center gap-1 px-4 py-2 rounded-full border border-[#e5e5e5] text-[12px] font-bold text-[#1a1c1b] hover:bg-[#fafafa] transition-colors"
            @click="startNegotiate"
          >
            <span class="mdi mdi-chat-outline text-[14px]"></span>
            Negociar
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1 px-4 py-2 rounded-full border border-red-200 text-red-600 text-[12px] font-bold hover:bg-red-50 transition-colors"
            @click="startReject"
          >
            <span class="mdi mdi-close text-[14px]"></span>
            Rechazar
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1 px-5 py-2 rounded-full bg-gradient-primary text-white text-[12px] font-bold shadow-pill-primary hover:bg-gradient-primary-hover transition-all"
            @click="doAccept"
          >
            <span class="mdi mdi-check text-[14px]"></span>
            Aceptar
          </button>
        </div>
      </div>
    </template>
  </Modal>
</template>
