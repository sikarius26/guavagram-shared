// Ambient rail + match-card fallback data accessor for the swipe deck.
// Centralizes the right-side rail copy (live ticker, expiring coupons,
// GP progress, pro hook) and the fallback reviews used by the back of
// match cards. When the API ships, swap each getter for the real call.

import { computed, type ComputedRef } from 'vue'
import { useCityContext } from '../useCityContext'
import {
  getMockDiscoveryTicker,
  getMockExpiringCoupons,
  getMockGpProgress,
  getMockProHook,
  getMockDiscoveryFallbackReviews,
  type MockTickerItem,
  type MockExpiringCoupon,
  type MockGpProgress,
  type MockProHook,
  type MockMatchCardReview,
} from '~/services/apis/mocks/discoveryAmbient.mock'

export interface UseDiscoveryAmbientDataReturn {
  ticker: ComputedRef<MockTickerItem[]>
  coupons: ComputedRef<MockExpiringCoupon[]>
  gp: ComputedRef<MockGpProgress>
  proHook: ComputedRef<MockProHook>
  fallbackReviews: ComputedRef<MockMatchCardReview[]>
}

export function useDiscoveryAmbientData(): UseDiscoveryAmbientDataReturn {
  const { currentCityName } = useCityContext()

  const ticker          = computed(() => getMockDiscoveryTicker({ cityName: currentCityName.value }))
  const coupons         = computed(() => getMockExpiringCoupons())
  const gp              = computed(() => getMockGpProgress())
  const proHook         = computed(() => getMockProHook())
  const fallbackReviews = computed(() => getMockDiscoveryFallbackReviews())

  return { ticker, coupons, gp, proHook, fallbackReviews }
}
