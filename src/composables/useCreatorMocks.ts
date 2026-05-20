// Thin composable around creatorMarketplace.mock — used by UI that wants
// guaranteed-sample data in dev mode without going through the API clients.
// This composable is DEV-ONLY: calling any of these getters in production
// throws. Use the API clients for the real runtime path.

import type { CreatorLevelViewModel } from '~/services/apis/models/creator-level-view-model'
import type { CreatorReviewViewModel } from '~/services/apis/models/creator-review-view-model'
import type { CreatorWishlistItemViewModel } from '~/services/apis/models/creator-wishlist-item-view-model'
import type { CreatorDiscountCodeViewModel } from '~/services/apis/models/creator-discount-code-view-model'

import {
  getMockCreators,
  getMockCreatorByHandle,
  getMockPicks,
  getMockCampaignReviews,
  getMockCampaigns,
  getMockProposals,
  getMockHomeStats,
  getMockLevel,
  getMockReviews,
  getMockWishlist,
  getMockDiscountCodes,
  getMockMarketingStats,
  getMockMyCampaigns,
  getMockFeaturedStore,
  getMockRecommendedStores,
} from '~/services/apis/mocks/creatorMarketplace.mock'

function assertDev(name: string): void {
  if (!import.meta.dev) {
    throw new Error(`[useCreatorMocks] ${name}() called outside dev mode`)
  }
}

export function useCreatorMocks() {
  const getCreators = (): any[] => {
    assertDev('getCreators')
    return getMockCreators()
  }

  const getCreatorByHandle = (handle: string): any | null => {
    assertDev('getCreatorByHandle')
    return getMockCreatorByHandle(handle)
  }

  const getPicks = (handle: string): any[] => {
    assertDev('getPicks')
    return getMockPicks(handle)
  }

  const getCampaignReviews = (handle: string): any[] => {
    assertDev('getCampaignReviews')
    return getMockCampaignReviews(handle)
  }

  const getCampaigns = (): any[] => {
    assertDev('getCampaigns')
    return getMockCampaigns()
  }

  const getProposals = (): any[] => {
    assertDev('getProposals')
    return getMockProposals()
  }

  const getHomeStats = (): any => {
    assertDev('getHomeStats')
    return getMockHomeStats()
  }

  const getLevel = (): CreatorLevelViewModel => {
    assertDev('getLevel')
    return getMockLevel()
  }

  const getReviews = (): CreatorReviewViewModel[] => {
    assertDev('getReviews')
    return getMockReviews()
  }

  const getWishlist = (): CreatorWishlistItemViewModel[] => {
    assertDev('getWishlist')
    return getMockWishlist()
  }

  const getDiscountCodes = (): CreatorDiscountCodeViewModel[] => {
    assertDev('getDiscountCodes')
    return getMockDiscountCodes()
  }

  const getMarketingStats = (): any => {
    assertDev('getMarketingStats')
    return getMockMarketingStats()
  }

  const getMyCampaigns = (): any[] => {
    assertDev('getMyCampaigns')
    return getMockMyCampaigns()
  }

  const getFeaturedStore = (): any => {
    assertDev('getFeaturedStore')
    return getMockFeaturedStore()
  }

  const getRecommendedStores = (): any[] => {
    assertDev('getRecommendedStores')
    return getMockRecommendedStores()
  }

  return {
    getCreators,
    getCreatorByHandle,
    getPicks,
    getCampaignReviews,
    getCampaigns,
    getProposals,
    getHomeStats,
    getLevel,
    getReviews,
    getWishlist,
    getDiscountCodes,
    getMarketingStats,
    getMyCampaigns,
    getFeaturedStore,
    getRecommendedStores,
  }
}
