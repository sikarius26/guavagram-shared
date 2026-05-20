<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CreatorCampaignReviewViewModel } from '~/services/apis/models/creator-campaign-review-view-model'

const props = defineProps<{
  review: CreatorCampaignReviewViewModel | any
  /** Optional pre-existing response from the creator (mock only for now). */
  creatorResponse?: string | null
}>()

const emit = defineEmits<{
  (e: 'reply', payload: { reviewId: string; text: string }): void
  (e: 'report', reviewId: string): void
}>()

const replying = ref(false)
const replyText = ref('')

const localResponse = ref<string | null>(props.creatorResponse ?? null)

const storeName = computed(() => (props.review?.reviewerStoreName || props.review?.storeName || props.review?.reviewerName || 'Restaurante'))
const storeLogo = computed(() => (props.review?.reviewerStoreLogoUrl || props.review?.storeLogoUrl || ''))
const storeInitial = computed(() => (storeName.value || '?').charAt(0).toUpperCase())
const ratingValue = computed(() => Number(props.review?.rating ?? 0))
const ratingRounded = computed(() => Math.round(ratingValue.value))

const pickTitle = computed(() => props.review?.pickTitle || '')
const text = computed(() => props.review?.text || props.review?.comment || '')

const createdAtDate = computed<Date | null>(() => {
  const raw = props.review?.createdAt
  if (!raw) return null
  if (raw instanceof Date) return raw
  const d = new Date(raw)
  return isNaN(d.getTime()) ? null : d
})

const relativeDate = computed(() => {
  const d = createdAtDate.value
  if (!d) return ''
  const diffMs = Date.now() - d.getTime()
  const day = 24 * 60 * 60 * 1000
  const days = Math.floor(diffMs / day)
  if (days < 1) return 'Hoy'
  if (days === 1) return 'Ayer'
  if (days < 7) return `Hace ${days} dias`
  if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`
  if (days < 365) return `Hace ${Math.floor(days / 30)} meses`
  return `Hace ${Math.floor(days / 365)} anos`
})

// campaign metrics mocked from review for display pulse
const campaignMetrics = computed(() => {
  const seed = (props.review?.id || '').length || 1
  return {
    impressions: ((ratingValue.value * 1200) + seed * 37).toFixed(0),
    engagementRate: (ratingValue.value * 0.9 + (seed % 3) * 0.1).toFixed(1),
  }
})

const startReply = () => {
  replying.value = true
  replyText.value = ''
}
const cancelReply = () => {
  replying.value = false
  replyText.value = ''
}
const submitReply = () => {
  const txt = replyText.value.trim()
  if (!txt) return
  localResponse.value = txt
  emit('reply', { reviewId: props.review?.id || '', text: txt })
  replying.value = false
  replyText.value = ''
}
const onReport = () => emit('report', props.review?.id || '')
</script>

<template>
  <article class="bg-white rounded-2xl border border-[#e5e5e5] p-5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-shadow">
    <!-- Header -->
    <div class="flex items-start justify-between gap-3 mb-3">
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-12 h-12 rounded-xl bg-[#f5f5f5] border border-[#eee] overflow-hidden flex items-center justify-center shrink-0">
          <img v-if="storeLogo" :src="storeLogo" :alt="storeName" class="w-full h-full object-cover" />
          <span v-else class="text-[16px] font-black text-[#888]">{{ storeInitial }}</span>
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <p class="text-[14px] font-bold text-[#1a1c1b] truncate">{{ storeName }}</p>
            <span v-if="pickTitle" class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#fff1ef] text-[#ff2d23] text-[9px] font-bold uppercase tracking-wider">
              <span class="mdi mdi-bookmark-check-outline text-[10px]"></span>
              {{ pickTitle }}
            </span>
          </div>
          <p class="text-[11px] text-[#999] mt-0.5">{{ relativeDate }}</p>
        </div>
      </div>
      <div class="flex gap-0.5 shrink-0">
        <span v-for="s in 5" :key="s" class="mdi text-[15px]"
          :class="s <= ratingRounded ? 'mdi-star text-yellow-500' : 'mdi-star-outline text-[#ddd]'"></span>
      </div>
    </div>

    <!-- Body text -->
    <p class="text-[14px] text-[#444] leading-relaxed">{{ text }}</p>

    <!-- Campaign metrics chip row -->
    <div class="flex items-center gap-2 flex-wrap mt-3">
      <span class="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#f5f5f5] text-[#555] text-[10px] font-semibold">
        <span class="mdi mdi-eye-outline text-[12px] text-[#888]"></span>
        {{ campaignMetrics.impressions }} impresiones
      </span>
      <span class="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#f0fdf4] text-[#16a34a] text-[10px] font-semibold">
        <span class="mdi mdi-heart-outline text-[12px]"></span>
        {{ campaignMetrics.engagementRate }}% engagement
      </span>
    </div>

    <!-- Creator response -->
    <blockquote v-if="localResponse" class="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
      <div class="flex items-center gap-2 mb-1">
        <span class="mdi mdi-reply text-[13px] text-emerald-700"></span>
        <p class="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Tu respuesta</p>
      </div>
      <p class="text-[13px] text-[#1a1c1b] leading-relaxed">{{ localResponse }}</p>
    </blockquote>

    <!-- Actions -->
    <div class="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-[#f2f2f2]">
      <button v-if="!localResponse && !replying" @click="startReply"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold bg-gradient-primary text-white shadow-pill-primary hover:shadow-[0_6px_20px_rgba(255,45,35,0.35)] transition-all">
        <span class="mdi mdi-reply text-[14px]"></span> Responder
      </button>
      <span v-else-if="localResponse" class="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
        <span class="mdi mdi-check-circle-outline text-[14px]"></span> Respondida
      </span>
      <span v-else></span>

      <button @click="onReport"
        class="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-[#888] hover:text-[#ef4444] hover:bg-[#fef2f2] transition-colors">
        <span class="mdi mdi-flag-outline text-[13px]"></span> Reportar
      </button>
    </div>

    <!-- Reply form -->
    <div v-if="replying" class="mt-3 p-3 rounded-xl bg-[#fafafa] border border-[#eee]">
      <p class="text-[11px] font-bold text-[#555] mb-2">Tu respuesta como creador</p>
      <textarea v-model="replyText" rows="3" placeholder="Agradece o comparte tu experiencia..."
        class="w-full rounded-xl border border-[#ddd] bg-white px-3 py-2.5 text-[13px] outline-none focus:border-emerald-500 resize-none"></textarea>
      <div class="flex items-center gap-2 mt-2">
        <button @click="submitReply" :disabled="!replyText.trim()"
          class="px-4 py-2 bg-gradient-primary text-white rounded-xl font-bold text-[11px] shadow-pill-primary disabled:opacity-40 disabled:cursor-not-allowed">
          Publicar
        </button>
        <button @click="cancelReply" class="px-4 py-2 text-[#888] rounded-xl font-semibold text-[11px] hover:bg-[#f0f0f0]">
          Cancelar
        </button>
      </div>
    </div>
  </article>
</template>
