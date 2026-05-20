// Affiliate restaurants accessor for both the rich earnings table and
// the voucher-selector dropdown. Both views read from the same mock so
// demos stay consistent. Future swap: a single
// `apiClient.creator.affiliate.getRestaurants()`.

import { computed, type ComputedRef } from 'vue'
import {
  getMockAffiliateRestaurants,
  getMockAffiliateRestaurantOptions,
  type MockAffiliateRestaurantRich,
  type MockAffiliateRestaurantOption,
} from '~/services/apis/mocks/affiliateRestaurants.mock'

export interface UseAffiliateRestaurantsDataReturn {
  rich: ComputedRef<MockAffiliateRestaurantRich[]>
  options: ComputedRef<MockAffiliateRestaurantOption[]>
}

export function useAffiliateRestaurantsData(): UseAffiliateRestaurantsDataReturn {
  const rich = computed(() => getMockAffiliateRestaurants())
  const options = computed(() => getMockAffiliateRestaurantOptions())
  return { rich, options }
}
