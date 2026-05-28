// Reviews data accessor for the public reviews page, the bio "Opiniones"
// widget and the embed widget. Reads real reviews from
// /public/store/{slug}/reviews (publicApiClient) so the list shown on the
// public bio matches what the owner moderates in the admin.
//
// Stats are derived from the live list (overall + distribution). Gallery,
// questions and traveler photos still come from the seeded mock because
// the backend has no aggregate endpoint for them yet — those surfaces
// stay decoupled from the reviews list and will be wired separately.

import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'
import { publicApiClient } from '~/services/apis/api.client.public'
import type { DashboardReviewViewModel } from '~/services/apis/models/dashboard-review-view-model'
import {
  getMockReviewsStats,
  getMockReviewsGallery,
  getMockReviewsQuestions,
  getMockReviewsTravelerPhotos,
  type MockReviewsStats,
  type MockGalleryPhoto,
  type MockTravelerPhoto,
  type MockQuestion,
  type MockReviewItem,
} from '~/services/apis/mocks/publicReviews.mock'

export interface UseReviewsDataOptions {
  /** Cap the number of reviews returned (e.g. embed widget). */
  limit?: number
}

export interface UseReviewsDataReturn {
  stats: ComputedRef<MockReviewsStats>
  gallery: ComputedRef<MockGalleryPhoto[]>
  questions: ComputedRef<MockQuestion[]>
  travelerPhotos: ComputedRef<MockTravelerPhoto[]>
  reviews: ComputedRef<MockReviewItem[]>
}

const REVIEW_AVATAR_COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#0ea5e9', '#a855f7', '#ef4444', '#14b8a6']
const colorForName = (name: string): string => {
  let h = 5381
  for (let i = 0; i < name.length; i++) h = ((h << 5) + h + name.charCodeAt(i)) >>> 0
  return REVIEW_AVATAR_COLORS[h % REVIEW_AVATAR_COLORS.length]!
}

const relativeEs = (d?: Date | string): string => {
  if (!d) return ''
  const date = d instanceof Date ? d : new Date(d as any)
  if (isNaN(date.getTime())) return ''
  const diff = Date.now() - date.getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days < 1) return 'Hoy'
  if (days === 1) return 'Ayer'
  if (days < 7) return `Hace ${days} días`
  if (days < 30) { const w = Math.floor(days / 7); return `Hace ${w} semana${w === 1 ? '' : 's'}` }
  if (days < 365) { const m = Math.floor(days / 30); return `Hace ${m} mes${m === 1 ? '' : 'es'}` }
  const y = Math.floor(days / 365)
  return `Hace ${y} año${y === 1 ? '' : 's'}`
}

// External providers (Google sync) flag a review via `externalAuthor`. Some
// payloads also carry a non-zero `providerId`; treat either signal as external.
const mapDashboardReview = (vm: DashboardReviewViewModel): MockReviewItem => {
  const author = (vm.customerName || vm.externalAuthor || 'Anónimo').trim()
  const text = (vm.review || '').trim()
  const firstStop = text.search(/[.!?](\s|$)/)
  const title = firstStop > 0 && firstStop < 60
    ? text.slice(0, firstStop + 1)
    : (text.length > 50 ? text.slice(0, 50) + '…' : text)
  const isExternal = !!vm.externalAuthor || (typeof vm.providerId === 'number' && vm.providerId > 0)
  const tagsArr = typeof vm.tags === 'string' && vm.tags
    ? vm.tags.split(/[,;]\s*/).filter(Boolean)
    : []
  return {
    id: vm.id || `r-${Math.random().toString(36).slice(2, 9)}`,
    author,
    location: '',
    contributions: 0,
    initial: (author[0] || '?').toUpperCase(),
    color: colorForName(author),
    date: relativeEs(vm.createdAt),
    rating: vm.rating || 0,
    title,
    text,
    photos: vm.photoUrls?.length || 0,
    helpful: 0,
    ownerReply: null,
    tags: tagsArr,
    imageUrl: vm.photoUrls?.[0],
    photoUrls: vm.photoUrls,
    verified: !isExternal && !!vm.id,
    habitual: false,
    isUserReview: false,
    source: isExternal ? 'google' : 'guavagram',
  }
}

export function useReviewsData(
  slug: Ref<string> | (() => string),
  opts: UseReviewsDataOptions = {}
): UseReviewsDataReturn {
  const slugRef = typeof slug === 'function' ? computed(slug) : slug

  // Pin the public client to the configured backend instead of the page
  // origin. Mirrors /menu, /booking and /order.
  const cfg: any = (typeof useRuntimeConfig === 'function') ? useRuntimeConfig() : null
  const apiBase = cfg?.public?.apiBase
  if (apiBase) (publicApiClient as any).baseUrl = apiBase

  const reviewsRaw = ref<MockReviewItem[]>([])

  if (typeof useAsyncData === 'function') {
    // SSR-friendly: hydrate first paint with real data so the "Opiniones"
    // widget doesn't flash an empty state. Key includes the slug so navigating
    // between stores refetches.
    const { data } = useAsyncData<MockReviewItem[]>(
      () => `bio-reviews-${slugRef.value}`,
      async () => {
        const s = slugRef.value
        if (!s) return []
        try {
          const list = await publicApiClient.publicStoreReviews(s, 0, 50)
          return Array.isArray(list) ? list.map(mapDashboardReview) : []
        } catch { return [] }
      },
      { default: () => [], watch: [slugRef] },
    )
    reviewsRaw.value = data.value || []
    watch(data, v => { reviewsRaw.value = Array.isArray(v) ? v : [] })
  } else {
    watch(slugRef, async (s) => {
      if (!s) { reviewsRaw.value = []; return }
      try {
        const list = await publicApiClient.publicStoreReviews(s, 0, 50)
        reviewsRaw.value = Array.isArray(list) ? list.map(mapDashboardReview) : []
      } catch { reviewsRaw.value = [] }
    }, { immediate: true })
  }

  // Stats are derived from the live list. Categories aren't returned by the
  // public endpoint so we leave them empty until the backend ships
  // ReviewsSummary on /public — the /reviews page renders them conditionally.
  const stats = computed<MockReviewsStats>(() => {
    const list = reviewsRaw.value
    if (!list.length) {
      const empty = getMockReviewsStats()
      return {
        ...empty,
        total: 0,
        overall: 0,
        label: '',
        distribution: empty.distribution.map(d => ({ ...d, count: 0 })),
        categories: [],
      }
    }
    const total = list.length
    const sum = list.reduce((a, r) => a + (r.rating || 0), 0)
    const overall = Math.round((sum / total) * 10) / 10
    const buckets: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    for (const r of list) {
      const stars = Math.max(1, Math.min(5, Math.round(r.rating || 0))) as 1 | 2 | 3 | 4 | 5
      buckets[stars] += 1
    }
    return {
      overall,
      label: overall >= 4.5 ? 'Excelente' : overall >= 4 ? 'Muy bueno' : overall >= 3 ? 'Normal' : 'Mejorable',
      total,
      distribution: [
        { label: 'Excelente', count: buckets[5], stars: 5 },
        { label: 'Muy bueno', count: buckets[4], stars: 4 },
        { label: 'Normal',    count: buckets[3], stars: 3 },
        { label: 'Malo',      count: buckets[2], stars: 2 },
        { label: 'Pésimo',    count: buckets[1], stars: 1 },
      ],
      categories: [],
    }
  })

  // Gallery / questions / travelerPhotos still use the seeded mock — backend
  // exposes neither photo gallery nor Q&A endpoints yet. The reviews LIST
  // (above) is fully real.
  const gallery = computed(() => getMockReviewsGallery())
  const questions = computed(() => getMockReviewsQuestions())
  const travelerPhotos = computed(() => getMockReviewsTravelerPhotos(slugRef.value))

  const reviews = computed<MockReviewItem[]>(() => {
    const list = reviewsRaw.value
    return typeof opts.limit === 'number' ? list.slice(0, opts.limit) : list
  })

  return { stats, gallery, questions, travelerPhotos, reviews }
}
