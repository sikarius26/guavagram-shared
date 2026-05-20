// Reviews data accessor for the public reviews page and embed widget.
// Wrap the deterministic mock fixtures so consumers stay agnostic of
// the data source. When the API ships, this composable swaps to
// `apiClient.store.getReviews(slug)`.

import { computed, type ComputedRef, type Ref } from 'vue'
import { useCityContext } from '../useCityContext'
import {
  getMockReviewsStats,
  getMockReviewsGallery,
  getMockReviewsQuestions,
  getMockReviewsTravelerPhotos,
  getMockReviewsList,
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

export function useReviewsData(
  slug: Ref<string> | (() => string),
  opts: UseReviewsDataOptions = {}
): UseReviewsDataReturn {
  const { currentCityName } = useCityContext()
  const slugRef = typeof slug === 'function' ? computed(slug) : slug

  const stats = computed(() => getMockReviewsStats())
  const gallery = computed(() => getMockReviewsGallery())
  const questions = computed(() => getMockReviewsQuestions())
  const travelerPhotos = computed(() => getMockReviewsTravelerPhotos(slugRef.value))

  const reviews = computed(() => {
    const all = getMockReviewsList(slugRef.value, { defaultCityName: currentCityName.value })
    return typeof opts.limit === 'number' ? all.slice(0, opts.limit) : all
  })

  return { stats, gallery, questions, travelerPhotos, reviews }
}
