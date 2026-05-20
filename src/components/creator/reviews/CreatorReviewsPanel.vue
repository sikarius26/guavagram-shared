<script setup lang="ts">
// TODO(re-scope): This panel currently shows the creator's RECEIVED rating dashboard
// (stars, review cards). The hub tab that routes here is now labeled "Reseñas pagadas",
// meaning the marketplace of paid review briefings (pending + completed, restaurant briefs,
// price, deadline). Replace this content with that marketplace UI, or rename the tab back.
// Owner decision: "Reseñas pagadas" = ingreso. Current dashboard is rating-received, wrong fit.
import { ref, computed, onMounted } from 'vue'
import { creatorApiClient } from '~/services/apis/api.client.creator'
import { useCreatorMocks } from '~/composables/useCreatorMocks'
import CreatorReviewStats from './CreatorReviewStats.vue'
import CreatorReviewCard from './CreatorReviewCard.vue'
import CreatorDisputesSection from './CreatorDisputesSection.vue'
import CreatorLevelBadge from '~/components/creator/shared/CreatorLevelBadge.vue'
import CreatorBadgesRow from '~/components/creator/shared/CreatorBadgesRow.vue'
import { useCurrentCreator } from '~/composables/useCurrentCreator'

const { profile: currentCreator } = useCurrentCreator()
const creatorHandle = computed(() => currentCreator.value?.handle ?? 'maria_foodie')

// ------ state ------
const reviews = ref<any[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// UI state
const starFilter = ref<number>(0) // 0 = All
const sortBy = ref<'recent' | 'best' | 'worst'>('recent')
const searchQuery = ref('')

// Cached creator responses keyed by review id (mock-only for now)
const responsesById = ref<Record<string, string>>({})

// ------ fetch ------
onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    const result = await creatorApiClient.creatorCampaignReviewsGet()
    reviews.value = Array.isArray(result) ? result : []
  } catch (e: any) {
    error.value = 'No se pudieron cargar las opiniones'
    try {
      const { getCampaignReviews } = useCreatorMocks()
      // fallback to any mock creator handle; creatorCampaignReviewsGet already handles dev mode
      reviews.value = getCampaignReviews('alexfoodie') || []
    } catch {
      reviews.value = []
    }
  } finally {
    loading.value = false
  }
})

// ------ derived stats ------
const totalCount = computed(() => reviews.value.length)

const overallRating = computed(() => {
  if (!totalCount.value) return 0
  const sum = reviews.value.reduce((acc, r) => acc + Number(r?.rating || 0), 0)
  return Math.round((sum / totalCount.value) * 10) / 10
})

const distribution = computed(() => {
  const labels: Record<number, string> = {
    5: 'Excelente', 4: 'Muy bueno', 3: 'Normal', 2: 'Malo', 1: 'Pesimo',
  }
  return [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.value.filter(r => Math.round(Number(r?.rating || 0)) === stars).length,
    label: labels[stars],
  }))
})

// Synthetic category breakdown derived from overall rating
const categories = computed(() => {
  const base = overallRating.value
  const clamp = (n: number) => Math.max(0, Math.min(5, Math.round(n * 10) / 10))
  return [
    { name: 'Profesionalismo', score: clamp(base * 1.02), icon: 'mdi-briefcase-check-outline', color: '#6366f1' },
    { name: 'Calidad contenido', score: clamp(base * 1.04), icon: 'mdi-star-four-points-outline', color: '#ff2d23' },
    { name: 'Puntualidad', score: clamp(base * 0.97), icon: 'mdi-clock-check-outline', color: '#f59e0b' },
    { name: 'ROI', score: clamp(base * 0.95), icon: 'mdi-trending-up', color: '#22c55e' },
  ]
})

const stats = computed(() => ({
  overall: overallRating.value,
  total: totalCount.value,
  distribution: distribution.value,
  categories: categories.value,
}))

// ------ badges ganados ------
const earnedBadges = computed(() => {
  const arr: any[] = []
  if (overallRating.value >= 4.8 && totalCount.value >= 50) {
    arr.push({ type: 'top-rated', label: 'Top Rated', iconMdi: 'mdi-crown', colorHex: '#f59e0b' })
  }
  if (responseRate.value >= 0.5) {
    arr.push({ type: 'fast-response', label: 'Fast Response', iconMdi: 'mdi-lightning-bolt', colorHex: '#06b6d4' })
  }
  // Verified creator (mock: always true if has >= 3 reviews)
  if (totalCount.value >= 3) {
    arr.push({ type: 'verified', label: 'Verified creator', iconMdi: 'mdi-check-decagram', colorHex: '#10b981' })
  }
  return arr
})

const guessedLevel = computed(() => {
  if (overallRating.value >= 4.8 && totalCount.value >= 50) return 3
  if (overallRating.value >= 4.5) return 2
  if (totalCount.value >= 5) return 1
  return 0
})

// ------ response stats ------
const respondedCount = computed(() => Object.keys(responsesById.value).length)
const responseRate = computed(() => {
  if (!totalCount.value) return 0
  return respondedCount.value / totalCount.value
})
const responseRatePct = computed(() => Math.round(responseRate.value * 100))
const avgResponseTimeHours = computed(() => (totalCount.value ? Math.max(4, Math.round(24 - overallRating.value * 3)) : 0))

// ------ featured review ------
const featuredReview = computed(() => {
  if (!reviews.value.length) return null
  const sorted = [...reviews.value].sort((a, b) => {
    const ra = Number(a?.rating || 0)
    const rb = Number(b?.rating || 0)
    if (rb !== ra) return rb - ra
    const la = (a?.text || a?.comment || '').length
    const lb = (b?.text || b?.comment || '').length
    return lb - la
  })
  return sorted[0] || null
})

// ------ filtered list ------
const filteredReviews = computed(() => {
  let list = [...reviews.value]
  // exclude featured from list if we have one
  if (featuredReview.value) {
    list = list.filter(r => r.id !== featuredReview.value.id)
  }
  if (starFilter.value > 0) {
    list = list.filter(r => Math.round(Number(r?.rating || 0)) === starFilter.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(r => {
      const text = (r?.text || r?.comment || '').toLowerCase()
      const store = (r?.reviewerStoreName || r?.storeName || r?.reviewerName || '').toLowerCase()
      return text.includes(q) || store.includes(q)
    })
  }
  if (sortBy.value === 'best') list.sort((a, b) => Number(b?.rating || 0) - Number(a?.rating || 0))
  else if (sortBy.value === 'worst') list.sort((a, b) => Number(a?.rating || 0) - Number(b?.rating || 0))
  else list.sort((a, b) => {
    const da = new Date(a?.createdAt || 0).getTime()
    const db = new Date(b?.createdAt || 0).getTime()
    return db - da
  })
  return list
})

// ------ handlers ------
const onReply = (payload: { reviewId: string; text: string }) => {
  if (!payload.reviewId) return
  responsesById.value = { ...responsesById.value, [payload.reviewId]: payload.text }
}
const onReport = (reviewId: string) => {
  // placeholder: wire to real abuse endpoint later
  // eslint-disable-next-line no-console
  console.warn('[CreatorReviewsPanel] report review', reviewId)
}

// ------ featured helpers ------
const featuredStoreName = computed(() => {
  const r: any = featuredReview.value
  return r?.reviewerStoreName || r?.storeName || r?.reviewerName || 'Restaurante'
})
const featuredStoreLogo = computed(() => {
  const r: any = featuredReview.value
  return r?.reviewerStoreLogoUrl || r?.storeLogoUrl || ''
})
const featuredText = computed(() => {
  const r: any = featuredReview.value
  return r?.text || r?.comment || ''
})
const featuredRating = computed(() => Math.round(Number((featuredReview.value as any)?.rating || 0)))

// Star filter buttons
const starPills = [0, 5, 4, 3, 2, 1]
</script>

<template>
  <div class="flex flex-col gap-0 bg-[#fafafa] min-h-full">

    <!-- ================== HERO ================== -->
    <div class="px-6 lg:px-10 py-8 bg-gradient-to-br from-[#fff8f6] via-white to-[#f0f4ff] border-b border-[#e5e5e5]">
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div class="min-w-0">
          <div class="flex items-center gap-2 mb-1.5">
            <span class="mdi mdi-star-four-points text-[#ff2d23] text-[18px]"></span>
            <h1 class="text-[24px] lg:text-[28px] font-black tracking-[-0.02em] text-[#1a1c1b]">Opiniones de negocios</h1>
            <CreatorLevelBadge :level="guessedLevel" size="sm" />
          </div>
          <p class="text-[13px] text-[#666] max-w-[620px]">Lo que dicen los restaurantes con los que has colaborado. Tu reputacion como creador se construye aqui.</p>
          <div v-if="earnedBadges.length" class="mt-3">
            <CreatorBadgesRow :badges="earnedBadges" :max-visible="5" />
          </div>
        </div>

        <!-- Response stats -->
        <div class="flex gap-3 shrink-0">
          <div class="rounded-2xl border border-[#e5e5e5] bg-white px-4 py-3 min-w-[130px] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div class="flex items-center gap-1.5 mb-1">
              <span class="mdi mdi-reply text-emerald-600 text-[14px]"></span>
              <p class="text-[10px] font-bold text-[#888] uppercase tracking-wider">Respondidas</p>
            </div>
            <p class="text-[22px] font-black text-[#1a1c1b] leading-none tabular-nums">{{ responseRatePct }}%</p>
            <p class="text-[10px] text-[#999] mt-1">{{ respondedCount }}/{{ totalCount }} reviews</p>
          </div>
          <div class="rounded-2xl border border-[#e5e5e5] bg-white px-4 py-3 min-w-[130px] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div class="flex items-center gap-1.5 mb-1">
              <span class="mdi mdi-timer-outline text-[#6366f1] text-[14px]"></span>
              <p class="text-[10px] font-bold text-[#888] uppercase tracking-wider">T. respuesta</p>
            </div>
            <p class="text-[22px] font-black text-[#1a1c1b] leading-none tabular-nums">{{ avgResponseTimeHours }}h</p>
            <p class="text-[10px] text-[#999] mt-1">Media</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ================== DISPUTES ================== -->
    <CreatorDisputesSection :creator-handle="creatorHandle" />

    <!-- ================== LOADING ================== -->
    <div v-if="loading" class="px-6 lg:px-10 py-10 flex items-center justify-center text-[#888]">
      <span class="mdi mdi-loading mdi-spin text-[22px] mr-2"></span>
      <span class="text-[13px] font-semibold">{{ $t('loadingOpinions') }}</span>
    </div>

    <!-- ================== EMPTY ================== -->
    <div v-else-if="!totalCount" class="px-6 lg:px-10 py-16">
      <div class="max-w-[540px] mx-auto text-center bg-white rounded-3xl border border-[#e5e5e5] p-10 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div class="w-16 h-16 mx-auto rounded-2xl bg-[#fff7ed] border border-[#fed7aa] flex items-center justify-center mb-4">
          <span class="mdi mdi-message-star-outline text-[32px] text-[#f59e0b]"></span>
        </div>
        <h3 class="text-[18px] font-black text-[#1a1c1b] mb-2">Aun no tienes opiniones</h3>
        <p class="text-[13px] text-[#666] leading-relaxed max-w-[400px] mx-auto">
          Cuando colabores con un restaurante y cierres una campana, el negocio podra dejarte una resena que vera el resto de la comunidad.
        </p>
        <div class="mt-5 flex items-center justify-center gap-2 flex-wrap">
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f5f5f5] text-[#555] text-[11px] font-semibold">
            <span class="mdi mdi-fire text-[13px] text-[#ff2d23]"></span> Acepta una oferta
          </span>
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f5f5f5] text-[#555] text-[11px] font-semibold">
            <span class="mdi mdi-movie-open-outline text-[13px] text-[#6366f1]"></span> Entrega el contenido
          </span>
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f5f5f5] text-[#555] text-[11px] font-semibold">
            <span class="mdi mdi-star-outline text-[13px] text-[#f59e0b]"></span> Recibe tu resena
          </span>
        </div>
      </div>
    </div>

    <!-- ================== CONTENT ================== -->
    <template v-else>

      <!-- Stats overview -->
      <div class="px-6 lg:px-10 py-6">
        <CreatorReviewStats :stats="stats" />
      </div>

      <!-- Featured review -->
      <div v-if="featuredReview" class="px-6 lg:px-10 pb-6">
        <div class="relative rounded-3xl overflow-hidden border border-[#f59e0b]/30 bg-gradient-to-br from-[#fffbeb] via-white to-[#fff7ed] p-6 shadow-[0_8px_30px_rgba(245,158,11,0.08)]">
          <div class="absolute top-4 right-4 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-[#f59e0b] to-[#eab308] text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
            <span class="mdi mdi-crown text-[11px]"></span> Destacada
          </div>

          <div class="flex items-start gap-4">
            <span class="mdi mdi-format-quote-open text-[40px] text-[#f59e0b]/30 shrink-0 leading-none"></span>
            <div class="flex-1 min-w-0">
              <blockquote class="text-[16px] text-[#1a1c1b] italic leading-relaxed font-medium">
                "{{ featuredText }}"
              </blockquote>
              <div class="flex items-center gap-3 mt-4">
                <div class="w-10 h-10 rounded-xl bg-white border border-[#eee] overflow-hidden flex items-center justify-center shrink-0">
                  <img v-if="featuredStoreLogo" :src="featuredStoreLogo" :alt="featuredStoreName" class="w-full h-full object-cover" />
                  <span v-else class="text-[14px] font-black text-[#888]">{{ featuredStoreName.charAt(0).toUpperCase() }}</span>
                </div>
                <div>
                  <p class="text-[13px] font-bold text-[#1a1c1b]">{{ featuredStoreName }}</p>
                  <div class="flex items-center gap-1 mt-0.5">
                    <span v-for="s in 5" :key="s" class="mdi text-[12px]"
                      :class="s <= featuredRating ? 'mdi-star text-yellow-500' : 'mdi-star-outline text-[#ddd]'"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters row -->
      <div class="px-6 lg:px-10 pb-4">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 flex-wrap">
          <!-- Star pills -->
          <div class="flex items-center gap-2 flex-wrap">
            <button v-for="s in starPills" :key="s" @click="starFilter = s"
              class="flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold text-[11px] transition-all border"
              :class="starFilter === s
                ? 'bg-[#1a1c1b] text-white border-[#1a1c1b]'
                : 'bg-white border-[#ddd] text-[#666] hover:border-[#aaa]'">
              <template v-if="s === 0">
                <span class="mdi mdi-filter-variant text-[12px]"></span> Todas
              </template>
              <template v-else>
                {{ s }}<span class="mdi mdi-star text-[10px]" :class="starFilter === s ? 'text-white' : 'text-yellow-500'"></span>
              </template>
            </button>
          </div>

          <!-- Search + sort -->
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#ddd]">
              <span class="mdi mdi-magnify text-[#999] text-sm"></span>
              <input v-model="searchQuery" type="text" placeholder="Buscar opiniones..."
                class="bg-transparent text-[12px] text-[#1a1c1b] placeholder-[#bbb] outline-none w-[180px]" />
            </div>
            <select v-model="sortBy"
              class="px-3 py-2 rounded-xl bg-white border border-[#ddd] text-[12px] font-semibold text-[#555] outline-none cursor-pointer">
              <option value="recent">Recientes</option>
              <option value="best">Mejores</option>
              <option value="worst">Peores</option>
            </select>
          </div>
        </div>
      </div>

      <!-- List -->
      <div class="px-6 lg:px-10 pb-10">
        <div v-if="!filteredReviews.length" class="text-center py-12 bg-white rounded-2xl border border-[#e5e5e5]">
          <span class="mdi mdi-filter-remove-outline text-[40px] text-[#ddd] block mb-2"></span>
          <p class="text-[13px] font-semibold text-[#888]">No hay opiniones con estos filtros</p>
        </div>
        <div v-else class="flex flex-col gap-3">
          <CreatorReviewCard v-for="r in filteredReviews" :key="r.id"
            :review="r"
            :creator-response="responsesById[r.id] || null"
            @reply="onReply"
            @report="onReport" />
        </div>
      </div>

    </template>
  </div>
</template>
