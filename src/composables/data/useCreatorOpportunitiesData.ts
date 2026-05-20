// Creator home "Oportunidades" accessor. Wraps proposal + nearby
// fixtures so the component never embeds Unsplash URLs or hardcoded
// brand names. Future swap: `apiClient.creator.getOpportunities()`.

import { computed, type ComputedRef } from 'vue'
import {
  getMockCreatorProposals,
  getMockNearbyOffers,
  type MockProposal,
  type MockNearbyOffer,
} from '~/services/apis/mocks/creatorOpportunities.mock'

export interface UseCreatorOpportunitiesDataReturn {
  proposals: ComputedRef<MockProposal[]>
  nearby: ComputedRef<MockNearbyOffer[]>
}

export function useCreatorOpportunitiesData(): UseCreatorOpportunitiesDataReturn {
  const proposals = computed(() => getMockCreatorProposals())
  const nearby = computed(() => getMockNearbyOffers())
  return { proposals, nearby }
}
