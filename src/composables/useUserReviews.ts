import { ref, computed, watch, type Ref } from 'vue'

// User-submitted reviews live here (mock-only — backend will replace this).
// Each entry is keyed by restaurant slug so the same user can review multiple
// restaurants, but a cooldown + verified-history gate prevents spam within
// the same slug.
//
// Cooldown rules (per slug):
// - First review → always allowed
// - <72h since last → blocked (reason: 'cooldown')
// - Any previous review unverified → blocked (reason: 'unverified')
// - All previous verified AND >72h since last → allowed
//
// "Cliente habitual" = ≥3 verified reviews on the same slug.

export type CategoryKey = 'food' | 'service' | 'value' | 'ambience'

export interface ReviewOwnerReply {
  text: string
  repliedAt: number
}

export interface UserReview {
  id: string
  slug: string
  rating: number                          // overall rating (avg of categoryRatings)
  categoryRatings: Record<CategoryKey, number>
  title: string
  text: string
  tags: string[]
  photos: string[]   // data-URLs (≤3, ≤1280 px JPEG q=0.82)
  verified: boolean
  createdAt: number  // Date.now()
  ownerReply?: ReviewOwnerReply
}

const LS_KEY = 'guava.user_reviews.v1'
const COOLDOWN_MS = 72 * 60 * 60 * 1000
const HABITUAL_THRESHOLD = 3

const allReviewsBySlug = ref<Record<string, UserReview[]>>({})

function loadFromStorage() {
  if (!import.meta.client) return
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw) as Record<string, UserReview[]>
    allReviewsBySlug.value = parsed || {}
  } catch { /* ignore */ }
}

function saveToStorage() {
  if (!import.meta.client) return
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(allReviewsBySlug.value))
  } catch (err) {
    // localStorage full — most likely from photo data-URLs. Drop the photos
    // of older reviews of OTHER slugs before giving up entirely.
    console.warn('[useUserReviews] localStorage full, trimming photos', err)
    const trimmed: Record<string, UserReview[]> = {}
    for (const [k, list] of Object.entries(allReviewsBySlug.value)) {
      trimmed[k] = list.map(r => ({ ...r, photos: [] }))
    }
    try { localStorage.setItem(LS_KEY, JSON.stringify(trimmed)) } catch { /* give up */ }
  }
}

if (import.meta.client) {
  loadFromStorage()
  watch(allReviewsBySlug, saveToStorage, { deep: true })
}

export function useUserReviews(slugRef: Ref<string>) {
  const userReviews = computed<UserReview[]>(() => {
    const s = slugRef.value
    if (!s) return []
    return [...(allReviewsBySlug.value[s] ?? [])].sort((a, b) => b.createdAt - a.createdAt)
  })

  const verifiedCount = computed(() => userReviews.value.filter(r => r.verified).length)
  const isHabitual = computed(() => verifiedCount.value >= HABITUAL_THRESHOLD)

  const hasRecentReview = (): { blocked: boolean; reason?: 'cooldown' | 'unverified'; hoursLeft?: number } => {
    const list = userReviews.value
    if (!list.length) return { blocked: false }
    const last = list[0]
    if (!last) return { blocked: false }
    const since = Date.now() - last.createdAt
    if (since < COOLDOWN_MS) {
      return {
        blocked: true,
        reason: 'cooldown',
        hoursLeft: Math.max(1, Math.ceil((COOLDOWN_MS - since) / (60 * 60 * 1000))),
      }
    }
    const anyUnverified = list.some(r => !r.verified)
    if (anyUnverified) return { blocked: true, reason: 'unverified' }
    return { blocked: false }
  }

  const addReview = (input: Omit<UserReview, 'id' | 'slug' | 'createdAt' | 'verified'>): UserReview => {
    const s = slugRef.value
    const review: UserReview = {
      id: `user-${Date.now()}`,
      slug: s,
      rating: input.rating,
      categoryRatings: input.categoryRatings,
      title: input.title,
      text: input.text,
      tags: input.tags ?? [],
      photos: (input.photos ?? []).slice(0, 3),
      verified: false,
      createdAt: Date.now(),
    }
    const next = { ...allReviewsBySlug.value }
    next[s] = [review, ...(next[s] ?? [])]
    allReviewsBySlug.value = next
    return review
  }

  const markVerified = (id: string) => {
    const s = slugRef.value
    const list = allReviewsBySlug.value[s]
    if (!list) return
    const next = { ...allReviewsBySlug.value }
    next[s] = list.map(r => r.id === id ? { ...r, verified: true } : r)
    allReviewsBySlug.value = next
  }

  const replyToReview = (id: string, text: string) => {
    const clean = text.trim().slice(0, 500)
    if (!clean) return
    const s = slugRef.value
    const list = allReviewsBySlug.value[s]
    if (!list) return
    const next = { ...allReviewsBySlug.value }
    next[s] = list.map(r => r.id === id ? { ...r, ownerReply: { text: clean, repliedAt: Date.now() } } : r)
    allReviewsBySlug.value = next
  }

  return {
    userReviews,
    verifiedCount,
    isHabitual,
    hasRecentReview,
    addReview,
    markVerified,
    replyToReview,
  }
}
