<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { creatorApiClient } from '~/services/apis/api.client.creator'
import { CreatorProposalStatusEnum } from '~/services/apis/models/creator-proposal-status-enum'
import { CreatorPickCategoryEnum } from '~/services/apis/models/creator-pick-category-enum'
import { notifier } from '~/services/notification'
import CreatorProposalDetailModal from './CreatorProposalDetailModal.vue'

const { t } = useI18n()
const emit = defineEmits<{ change: [] }>()

type FilterKey = 'all' | 'pending' | 'accepted' | 'rejected'

const proposals = ref<any[]>([])
const loading = ref(false)
const filter = ref<FilterKey>('all')

// Modal
const detailOpen = ref(false)
const selected = ref<any | null>(null)

const statusMeta = computed<Record<number, { label: string; cls: string; dotCls: string }>>(() => ({
  [CreatorProposalStatusEnum.PENDING]: { label: t('proposalStatusPending'), cls: 'bg-amber-50 text-amber-700 border-amber-200', dotCls: 'bg-amber-500' },
  [CreatorProposalStatusEnum.ACCEPTED]: { label: t('proposalStatusAccepted'), cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotCls: 'bg-emerald-500' },
  [CreatorProposalStatusEnum.REJECTED]: { label: t('proposalStatusRejected'), cls: 'bg-red-50 text-red-700 border-red-200', dotCls: 'bg-red-500' },
  [CreatorProposalStatusEnum.EXPIRED]: { label: t('proposalStatusExpired'), cls: 'bg-gray-100 text-gray-600 border-gray-200', dotCls: 'bg-gray-400' },
}))

const categoryLabels = computed<Record<number, string>>(() => ({
  [CreatorPickCategoryEnum.BIO_SLOT]: t('categoryBioSlot'),
  [CreatorPickCategoryEnum.PRINCIPAL_FEATURED]: t('categoryPrincipalFeatured'),
  [CreatorPickCategoryEnum.STORY]: t('categoryStory'),
  [CreatorPickCategoryEnum.VIDEO_REVIEW]: t('categoryVideoReview'),
  [CreatorPickCategoryEnum.CAMPAIGN]: t('categoryCampaign'),
}))

const load = async () => {
  loading.value = true
  try {
    const data = await creatorApiClient.creatorProposalsGet()
    proposals.value = data ?? []
  } catch (e) {
    notifier.notifyError(t('couldNotLoadProposals'), e as Error)
  } finally {
    loading.value = false
  }
}

onMounted(load)

const counts = computed(() => ({
  all: proposals.value.length,
  pending: proposals.value.filter(p => p.status === CreatorProposalStatusEnum.PENDING).length,
  accepted: proposals.value.filter(p => p.status === CreatorProposalStatusEnum.ACCEPTED).length,
  rejected: proposals.value.filter(p => p.status === CreatorProposalStatusEnum.REJECTED).length,
}))

const filteredProposals = computed(() => {
  const list = [...proposals.value].sort((a, b) => {
    const aT = a.receivedAt ? new Date(a.receivedAt).getTime() : 0
    const bT = b.receivedAt ? new Date(b.receivedAt).getTime() : 0
    return bT - aT
  })
  switch (filter.value) {
    case 'pending': return list.filter(p => p.status === CreatorProposalStatusEnum.PENDING)
    case 'accepted': return list.filter(p => p.status === CreatorProposalStatusEnum.ACCEPTED)
    case 'rejected': return list.filter(p => p.status === CreatorProposalStatusEnum.REJECTED)
    default: return list
  }
})

const filters = computed<{ key: FilterKey; label: string }[]>(() => [
  { key: 'all', label: t('proposalsAll') },
  { key: 'pending', label: t('proposalsPending') },
  { key: 'accepted', label: t('proposalsAccepted') },
  { key: 'rejected', label: t('proposalsRejected') },
])

const formatOffer = (cents: number): string => {
  const eur = Math.round((cents ?? 0) / 100)
  return eur.toLocaleString('es-ES')
}

const formatReceived = (d: Date | string | undefined): string => {
  if (!d) return ''
  const date = d instanceof Date ? d : new Date(d)
  if (Number.isNaN(date.getTime())) return ''
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'hace un momento'
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `hace ${days} d`
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

const formatDeadline = (d: Date | string | undefined): string => {
  if (!d) return ''
  const date = d instanceof Date ? d : new Date(d)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

const openDetail = (p: any) => {
  selected.value = p
  detailOpen.value = true
}

const onAccept = async (p: any) => {
  if (!p.id) return
  try {
    await creatorApiClient.creatorProposalAccept(p.id)
    const i = proposals.value.findIndex(x => x.id === p.id)
    if (i >= 0) proposals.value[i] = { ...proposals.value[i], status: CreatorProposalStatusEnum.ACCEPTED }
    notifier.notifySuccess(t('proposalAccepted'))
    detailOpen.value = false
    emit('change')
  } catch (e) {
    notifier.notifyError(t('couldNotAcceptProposal'), e as Error)
  }
}

const onReject = async (p: any, reason?: string) => {
  if (!p.id) return
  try {
    await creatorApiClient.creatorProposalReject(p.id)
    const i = proposals.value.findIndex(x => x.id === p.id)
    if (i >= 0) proposals.value[i] = { ...proposals.value[i], status: CreatorProposalStatusEnum.REJECTED, responseMessage: reason }
    notifier.notifySuccess(t('proposalRejected'))
    detailOpen.value = false
    emit('change')
  } catch (e) {
    notifier.notifyError(t('couldNotRejectProposal'), e as Error)
  }
}

const onNegotiate = (p: any, message: string) => {
  // Mock negotiation: keep pending but attach note locally.
  const i = proposals.value.findIndex(x => x.id === p.id)
  if (i >= 0) proposals.value[i] = { ...proposals.value[i], responseMessage: message }
  notifier.notifySuccess(t('messageSentToBusiness'))
  detailOpen.value = false
}

const hasProposals = computed(() => filteredProposals.value.length > 0)
</script>

<template>
  <div class="flex flex-col gap-4">

    <!-- Header + filter pills -->
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div>
        <h3 class="text-[18px] font-bold tracking-[-0.02em] text-[#1a1c1b]">{{ $t('receivedProposals') }}</h3>
        <p class="text-[12px] text-[#666] mt-0.5">{{ $t('receivedProposalsDesc') }}</p>
      </div>
    </div>

    <nav class="flex items-center gap-1.5 flex-wrap">
      <button
        v-for="f in filters"
        :key="f.key"
        type="button"
        :class="[
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all border',
          filter === f.key
            ? 'bg-[#1a1c1b] text-white border-[#1a1c1b]'
            : 'bg-white text-[#1a1c1b] border-[#e5e5e5] hover:border-[#1a1c1b]/30'
        ]"
        @click="filter = f.key"
      >
        {{ f.label }}
        <span
          v-if="counts[f.key] > 0"
          :class="[
            'inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-bold tabular-nums',
            filter === f.key ? 'bg-white/15 text-white' : 'bg-[#f0f0f0] text-[#666]'
          ]"
        >
          {{ counts[f.key] }}
        </span>
      </button>
    </nav>

    <!-- Loading -->
    <div v-if="loading && proposals.length === 0" class="rounded-2xl border border-dashed border-[#ddd] p-10 text-center text-[#888] text-[13px]">
      {{ $t('loadingProposals') }}
    </div>

    <!-- Empty -->
    <div
      v-else-if="!hasProposals"
      class="rounded-2xl border border-dashed border-[#ddd] bg-white p-10 text-center"
    >
      <div class="mx-auto w-14 h-14 rounded-2xl bg-[#f7f7f7] flex items-center justify-center mb-3">
        <span class="mdi mdi-email-outline text-[#bbb] text-[28px]"></span>
      </div>
      <p class="text-[15px] font-bold text-[#1a1c1b]">{{ $t('noProposals') }}</p>
      <p class="text-[12px] text-[#888] mt-1 max-w-xs mx-auto">
        {{ $t('noProposalsDesc') }}
      </p>
    </div>

    <!-- List -->
    <ul v-else class="flex flex-col gap-3">
      <li
        v-for="p in filteredProposals"
        :key="p.id"
        class="rounded-2xl bg-white border border-[#e5e5e5] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_18px_rgba(0,0,0,0.08)] transition-shadow cursor-pointer"
        @click="openDetail(p)"
      >
        <div class="flex items-start gap-4">
          <!-- Store logo -->
          <div class="w-12 h-12 rounded-xl overflow-hidden bg-[#f3f3f3] flex items-center justify-center shrink-0 ring-1 ring-[#eee]">
            <img v-if="p.storeLogoUrl" :src="p.storeLogoUrl" class="w-full h-full object-cover" :alt="p.fromStoreName" />
            <span v-else class="mdi mdi-store-outline text-[#bbb] text-[22px]"></span>
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-3 flex-wrap">
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <p class="text-[14px] font-bold tracking-[-0.01em] text-[#1a1c1b] truncate">{{ p.fromStoreName }}</p>
                  <span
                    v-if="statusMeta[p.status]"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border"
                    :class="statusMeta[p.status].cls"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="statusMeta[p.status].dotCls"></span>
                    {{ statusMeta[p.status].label }}
                  </span>
                </div>
                <p v-if="p.pickCategory !== undefined" class="text-[11px] text-[#666] mt-0.5">
                  <span class="mdi mdi-package-variant-closed text-[12px] mr-0.5"></span>
                  {{ categoryLabels[p.pickCategory] ?? 'Pick' }}
                </p>
              </div>
              <div class="text-right shrink-0">
                <p class="text-[20px] font-black tracking-[-0.02em] text-[#1a1c1b] tabular-nums leading-none">
                  {{ formatOffer(p.offerCents) }}<span class="text-[#888] text-[13px] font-bold">€</span>
                </p>
                <p class="text-[10px] text-[#888] mt-0.5">{{ formatReceived(p.receivedAt) }}</p>
              </div>
            </div>
            <p v-if="p.message" class="text-[12px] text-[#444] mt-2 line-clamp-2 leading-snug">
              "{{ p.message }}"
            </p>
            <div class="flex items-center justify-between mt-3 gap-3 flex-wrap">
              <p v-if="p.deadline" class="text-[11px] text-[#888] inline-flex items-center gap-1">
                <span class="mdi mdi-clock-outline text-[12px]"></span>
                {{ $t('deadlineLabel') }}: {{ formatDeadline(p.deadline) }}
              </p>
              <span v-else></span>
              <button
                type="button"
                class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#e5e5e5] text-[11px] font-bold text-[#1a1c1b] hover:border-[#1a1c1b] hover:bg-[#fafafa] transition-all"
                @click.stop="openDetail(p)"
              >
                {{ $t('viewDetails') }}
                <span class="mdi mdi-chevron-right text-[14px]"></span>
              </button>
            </div>
          </div>
        </div>
      </li>
    </ul>

    <!-- Detail modal -->
    <CreatorProposalDetailModal
      v-model="detailOpen"
      :proposal="selected"
      @accept="onAccept"
      @reject="onReject"
      @negotiate="onNegotiate"
    />
  </div>
</template>
