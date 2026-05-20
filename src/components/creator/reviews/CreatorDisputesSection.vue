<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useReviewDisputes, DISPUTE_STATUS_META, DISPUTE_REASON_LABELS, type ReviewDispute } from '~/composables/useReviewDisputes'
import { notifier } from '~/services/notification'

const { t } = useI18n()

const props = defineProps<{ creatorHandle: string }>()

const { forCreator, respondWithEvidence } = useReviewDisputes()
const myDisputes = forCreator(props.creatorHandle)

// Active (needs action or in review) first, then resolved.
const activeDisputes = computed(() =>
  myDisputes.value.filter(d => d.status === 'disputed' || d.status === 'under_review')
)
const resolvedDisputes = computed(() =>
  myDisputes.value.filter(d => d.status !== 'disputed' && d.status !== 'under_review')
)

// Response modal
const responseModalId = ref<string | null>(null)
const defenseText = ref('')
const evidenceUrl = ref('')
const openResponse = (d: ReviewDispute) => {
  responseModalId.value = d.id
  defenseText.value = ''
  evidenceUrl.value = ''
}
const closeResponse = () => { responseModalId.value = null }
const submitResponse = () => {
  if (!responseModalId.value || !defenseText.value.trim()) return
  respondWithEvidence(
    responseModalId.value,
    defenseText.value.trim(),
    evidenceUrl.value.trim() ? [evidenceUrl.value.trim()] : undefined
  )
  notifier.notifySuccess(t('disputeResponseSent'))
  closeResponse()
}

const daysUntilDeadline = (iso: string): number => {
  const diff = new Date(iso).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)))
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
</script>

<template>
  <section v-if="myDisputes.length" class="px-6 lg:px-10 py-6 border-b border-[#e5e5e5] bg-[#fffaf8]">
    <div class="flex items-center gap-2 mb-4">
      <span class="mdi mdi-gavel text-[#ef4444] text-[20px]"></span>
      <h2 class="text-[16px] font-black text-[#1a1c1b] tracking-[-0.01em]">{{ $t('disputesTitle') }}</h2>
      <span v-if="activeDisputes.length"
        class="inline-flex items-center px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black">
        {{ activeDisputes.length }} {{ activeDisputes.length === 1 ? $t('disputeActive') : $t('disputeActives') }}
      </span>
    </div>

    <!-- Active disputes: need creator action -->
    <div v-if="activeDisputes.length" class="flex flex-col gap-3">
      <article v-for="d in activeDisputes" :key="d.id"
        class="rounded-2xl border border-red-200 bg-white p-4 shadow-[0_4px_14px_-4px_rgba(239,68,68,0.15)]">
        <!-- Status header -->
        <div class="flex items-start justify-between gap-3 flex-wrap mb-3">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black"
              :style="{ backgroundColor: DISPUTE_STATUS_META[d.status].color + '20', color: DISPUTE_STATUS_META[d.status].color }">
              <span class="mdi text-[12px]" :class="DISPUTE_STATUS_META[d.status].icon"></span>
              {{ DISPUTE_STATUS_META[d.status].label }}
            </span>
            <span class="text-[11px] text-[#888]">{{ formatDate(d.createdAt) }}</span>
          </div>
          <div v-if="d.status === 'disputed'" class="text-right">
            <p class="text-[11px] text-[#888]">{{ $t('youHaveLeft') }}</p>
            <p class="text-[14px] font-black text-red-600 tabular-nums">{{ daysUntilDeadline(d.counterProofDeadline) }} {{ $t('days') }}</p>
          </div>
        </div>

        <!-- Restaurant info + claim -->
        <div class="flex items-start gap-3 mb-3">
          <div class="w-10 h-10 rounded-xl bg-[#f5f5f5] flex items-center justify-center shrink-0">
            <span class="mdi mdi-storefront text-[#888] text-[18px]"></span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-[13px] font-black text-[#1a1c1b] truncate">{{ d.storeName }}</p>
            <p class="text-[11px] text-[#666]">
              {{ $t('disputedYourReview') }} <span class="font-bold">{{ DISPUTE_REASON_LABELS[d.reason] }}</span>
            </p>
          </div>
        </div>

        <!-- Original review quote -->
        <div v-if="d.reviewText" class="rounded-xl bg-[#fafafa] border border-[#eee] p-3 mb-3">
          <div class="flex items-center gap-1 mb-1">
            <span v-for="n in (d.reviewRating ?? 0)" :key="n" class="mdi mdi-star text-yellow-500 text-[12px]"></span>
            <span class="mdi mdi-star-outline text-[#ccc] text-[12px]" v-for="n in (5 - (d.reviewRating ?? 0))" :key="'e'+n"></span>
          </div>
          <p class="text-[12px] text-[#444] italic leading-snug">"{{ d.reviewText }}"</p>
        </div>

        <!-- Restaurant explanation -->
        <div class="rounded-xl bg-red-50 border border-red-100 p-3 mb-3">
          <p class="text-[10px] font-black text-red-700 uppercase tracking-wider mb-1">{{ $t('restaurantArgument') }}</p>
          <p class="text-[12px] text-[#555] leading-snug">{{ d.restaurantExplanation }}</p>
        </div>

        <!-- Creator's response (if already submitted) -->
        <div v-if="d.creatorDefense" class="rounded-xl bg-emerald-50 border border-emerald-100 p-3 mb-3">
          <p class="text-[10px] font-black text-emerald-700 uppercase tracking-wider mb-1">{{ $t('yourResponse') }} · {{ d.creatorRespondedAt ? formatDate(d.creatorRespondedAt) : '' }}</p>
          <p class="text-[12px] text-[#555] leading-snug">{{ d.creatorDefense }}</p>
          <div v-if="d.creatorEvidenceUrls?.length" class="flex gap-1.5 mt-2">
            <a v-for="(url, i) in d.creatorEvidenceUrls" :key="i" :href="url" target="_blank"
              class="text-[10px] font-semibold text-emerald-700 underline">{{ $t('viewEvidence', { n: i + 1 }) }}</a>
          </div>
        </div>

        <!-- CTA: respond (only if still 'disputed') -->
        <div v-if="d.status === 'disputed'" class="flex items-center gap-2 flex-wrap">
          <button @click="openResponse(d)" type="button"
            class="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-gradient-primary text-white text-[12px] font-black shadow-pill-primary hover:bg-gradient-primary-hover transition-all">
            <span class="mdi mdi-shield-check-outline"></span> {{ $t('defendWithEvidence') }}
          </button>
          <p class="text-[10px] text-[#888]">{{ $t('noResponseWarning') }}</p>
        </div>
        <div v-else-if="d.status === 'under_review'" class="flex items-center gap-1.5 text-[11px] text-[#888]">
          <span class="mdi mdi-clock-outline"></span>
          {{ $t('sentToModeration') }}
        </div>
      </article>
    </div>

    <!-- Resolved disputes (collapsed summary) -->
    <details v-if="resolvedDisputes.length" class="mt-4 rounded-xl border border-[#e5e5e5] bg-white overflow-hidden">
      <summary class="cursor-pointer px-4 py-3 flex items-center justify-between hover:bg-[#fafafa] transition-colors">
        <span class="text-[12px] font-bold text-[#555]">{{ $t('disputeHistory') }} · {{ resolvedDisputes.length }}</span>
        <span class="mdi mdi-chevron-down text-[#888]"></span>
      </summary>
      <ul class="divide-y divide-[#f0f0f0]">
        <li v-for="d in resolvedDisputes" :key="d.id" class="px-4 py-3 flex items-center gap-3">
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black shrink-0"
            :style="{ backgroundColor: DISPUTE_STATUS_META[d.status].color + '20', color: DISPUTE_STATUS_META[d.status].color }">
            <span class="mdi text-[12px]" :class="DISPUTE_STATUS_META[d.status].icon"></span>
            {{ DISPUTE_STATUS_META[d.status].label }}
          </span>
          <div class="flex-1 min-w-0">
            <p class="text-[12px] font-bold text-[#1a1c1b] truncate">{{ d.storeName }}</p>
            <p class="text-[10px] text-[#888]">{{ formatDate(d.resolvedAt ?? d.createdAt) }}</p>
          </div>
        </li>
      </ul>
    </details>
  </section>

  <!-- ===== Response Modal ===== -->
  <Teleport to="body">
    <div v-if="responseModalId" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/55"
      @click.self="closeResponse">
      <div class="w-full max-w-[520px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div class="px-6 pt-6 pb-4 bg-gradient-to-br from-[#fff5f4] to-white">
          <h3 class="text-[18px] font-black text-[#1a1c1b]">{{ $t('defendReview') }}</h3>
          <p class="text-[12px] text-[#666] mt-1">{{ $t('defendExplain') }}</p>
        </div>
        <div class="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          <label class="flex flex-col gap-1.5">
            <span class="text-[11px] font-bold text-[#666] uppercase tracking-wider">{{ $t('yourArgument') }}</span>
            <textarea v-model="defenseText" rows="5" maxlength="800"
              :placeholder="$t('argPlaceholder')"
              class="rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-3 py-2.5 text-[13px] outline-none focus:border-[#ff2d23] resize-none"></textarea>
            <span class="text-[10px] text-[#999] self-end tabular-nums">{{ defenseText.length }} / 800</span>
          </label>
          <label class="flex flex-col gap-1.5">
            <span class="text-[11px] font-bold text-[#666] uppercase tracking-wider">{{ $t('evidenceUrl') }}</span>
            <input v-model="evidenceUrl" type="url" :placeholder="$t('evidenceUrlPlaceholder')"
              class="h-10 rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-3 text-[13px] outline-none focus:border-[#ff2d23]" />
            <p class="text-[10px] text-[#888]">{{ $t('evidenceComingSoon') }}</p>
          </label>
          <div class="p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-2">
            <span class="mdi mdi-information-outline text-blue-500 mt-0.5"></span>
            <p class="text-[11px] text-blue-800 leading-snug">
              {{ $t('adminWillReview') }}
            </p>
          </div>
        </div>
        <div class="px-6 py-4 bg-[#fafafa] border-t border-[#eee] flex items-center justify-end gap-2">
          <button @click="closeResponse" type="button"
            class="px-5 py-2.5 rounded-xl text-[12px] font-bold text-[#666] hover:bg-[#eee] transition-colors">{{ $t('cancelBtn') }}</button>
          <button @click="submitResponse" :disabled="!defenseText.trim()" type="button"
            class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[12px] font-bold bg-gradient-primary shadow-pill-primary hover:bg-gradient-primary-hover active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            <span class="mdi mdi-send"></span> {{ $t('sendResponse') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
