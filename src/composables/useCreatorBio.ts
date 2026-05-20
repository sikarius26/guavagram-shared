import { ref } from 'vue'
import { creatorApiClient } from '~/services/apis/api.client.creator'
import { CreatorReviewViewModel } from '~/services/apis/models/creator-review-view-model'
import { CreatorWishlistItemViewModel } from '~/services/apis/models/creator-wishlist-item-view-model'
import { CreatorDiscountCodeViewModel } from '~/services/apis/models/creator-discount-code-view-model'
import type { CreatorFeaturedStoreViewModel } from '~/services/apis/models/creator-featured-store-view-model'
import type { CreatorRecommendedStoreViewModel } from '~/services/apis/models/creator-recommended-store-view-model'
import {
  getMockFeaturedStore,
  getMockRecommendedStores,
  getMockReviews,
  getMockWishlist,
  getMockDiscountCodes,
} from '~/services/apis/mocks/creatorMarketplace.mock'

// Persist user-added reviews so they survive reload and merge with seed mocks.
// Removed when the real `creatorApiClient.creatorReviewsPost` endpoint exists.
const LOCAL_REVIEWS_KEY = 'guavagram.creator.reviews.local.v1'
const loadLocalReviews = (): CreatorReviewViewModel[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(LOCAL_REVIEWS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map((r: any) => CreatorReviewViewModel.fromJS(r))
  } catch { return [] }
}
const persistLocalReviews = (list: CreatorReviewViewModel[]) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      LOCAL_REVIEWS_KEY,
      JSON.stringify(list.map(r => r.toJSON()))
    )
  } catch {}
}

// Shared bio-editor state (module-scoped — same pattern as useCurrentStore).
const featuredStore = ref<CreatorFeaturedStoreViewModel | null>(null)
const recommended = ref<CreatorRecommendedStoreViewModel[]>([])
const wishlist = ref<CreatorWishlistItemViewModel[]>([])
const reviews = ref<CreatorReviewViewModel[]>([])
const discountCodes = ref<Map<string, CreatorDiscountCodeViewModel>>(new Map())
const isLoading = ref(false)
const isDirty = ref(false)

export function useCreatorBio() {
  const load = async () => {
    isLoading.value = true
    try {
      if (import.meta.dev) {
        featuredStore.value = getMockFeaturedStore()
        recommended.value = getMockRecommendedStores()
        wishlist.value = getMockWishlist()
        reviews.value = [...loadLocalReviews(), ...getMockReviews()]
        const codes = getMockDiscountCodes()
        const map = new Map<string, CreatorDiscountCodeViewModel>()
        codes.forEach(c => { if (c.storeId) map.set(c.storeId, c) })
        discountCodes.value = map
        isDirty.value = false
        return
      }
      const [wl, rv, dc] = await Promise.all([
        creatorApiClient.creatorWishlistGet().catch(() => []),
        creatorApiClient.creatorReviewsGet().catch(() => []),
        creatorApiClient.creatorDiscountCodesGet().catch(() => []),
      ])
      wishlist.value = wl
      reviews.value = rv
      const map = new Map<string, CreatorDiscountCodeViewModel>()
      dc.forEach(c => { if (c.storeId) map.set(c.storeId, c) })
      discountCodes.value = map
      isDirty.value = false
    } finally {
      isLoading.value = false
    }
  }

  const save = async () => {
    isLoading.value = true
    try {
      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.log('[useCreatorBio] save() no-op (dev mock)', {
          featuredStore: featuredStore.value,
          recommended: recommended.value,
          wishlist: wishlist.value,
          reviews: reviews.value,
          discountCodes: Array.from(discountCodes.value.values()),
        })
        isDirty.value = false
        return
      }
      const codeList = Array.from(discountCodes.value.values())
      await Promise.all([
        creatorApiClient.creatorDiscountCodesPut(codeList).catch((e) => console.warn('discount codes save failed', e)),
        // Reviews, wishlist, featured and recommended are synced via their
        // individual endpoints at the point of add/remove — nothing to flush
        // on "save" once backend endpoints exist.
      ])
      isDirty.value = false
    } finally {
      isLoading.value = false
    }
  }

  const addRecommended = (store: CreatorRecommendedStoreViewModel) => {
    recommended.value.push(store)
    isDirty.value = true
  }

  const removeRecommended = (storeId: string) => {
    recommended.value = recommended.value.filter(r => r.storeId !== storeId)
    isDirty.value = true
  }

  const reorderRecommended = (fromIdx: number, toIdx: number) => {
    const arr = [...recommended.value]
    if (fromIdx < 0 || fromIdx >= arr.length || toIdx < 0 || toIdx >= arr.length) return
    const [picked] = arr.splice(fromIdx, 1)
    if (!picked) return
    arr.splice(toIdx, 0, picked)
    arr.forEach((r, i) => { r.weight = i })
    recommended.value = arr
    isDirty.value = true
  }

  const setDiscountCode = (storeId: string, code: CreatorDiscountCodeViewModel) => {
    const map = new Map(discountCodes.value)
    map.set(storeId, code)
    discountCodes.value = map
    isDirty.value = true
  }

  const addWishlistItem = async (item: CreatorWishlistItemViewModel) => {
    wishlist.value.push(item)
    isDirty.value = true
    if (!import.meta.dev) {
      await creatorApiClient.creatorWishlistPost(item).catch(e => console.warn('wishlist post failed', e))
    }
  }

  const removeWishlistItem = async (id: string) => {
    wishlist.value = wishlist.value.filter(w => w.id !== id)
    isDirty.value = true
    if (!import.meta.dev) {
      await creatorApiClient.creatorWishlistDelete(id).catch(e => console.warn('wishlist delete failed', e))
    }
  }

  const addReview = async (review: CreatorReviewViewModel) => {
    reviews.value = [review, ...reviews.value]
    isDirty.value = true
    if (import.meta.dev) {
      persistLocalReviews([review, ...loadLocalReviews()])
    } else {
      await creatorApiClient.creatorReviewsPost(review).catch(e => console.warn('review post failed', e))
    }
  }

  const removeReview = async (id: string) => {
    reviews.value = reviews.value.filter(s => s.id !== id)
    isDirty.value = true
    if (import.meta.dev) {
      persistLocalReviews(loadLocalReviews().filter(r => r.id !== id))
    } else {
      await creatorApiClient.creatorReviewsDelete(id).catch(e => console.warn('review delete failed', e))
    }
  }

  const setFeaturedStore = (store: CreatorFeaturedStoreViewModel | null) => {
    featuredStore.value = store
    isDirty.value = true
  }

  return {
    featuredStore,
    recommended,
    wishlist,
    reviews,
    discountCodes,
    isLoading,
    isDirty,
    load,
    save,
    addRecommended,
    removeRecommended,
    reorderRecommended,
    setDiscountCode,
    addWishlistItem,
    removeWishlistItem,
    addReview,
    removeReview,
    setFeaturedStore,
  }
}
