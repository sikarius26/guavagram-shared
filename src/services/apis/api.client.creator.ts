// Authenticated API client for the creator-side of the dual Restaurant+Creator
// platform. Follows the same patterns as api.client.dashboard.ts.
//
// Cross-agent note: this file references some model types authored by Agent 1A
// (CreatorPickViewModel, CreatorProposalViewModel, CampaignViewModel,
// BoostRequest, CreatorHomeStats, etc.). Until those land we use `any` for
// request/response shapes so the module compiles independently.
// TODO: replace `any` with concrete imports from creator-*.ts once Agent 1A
// publishes them.

/* tslint:disable */
/* eslint-disable */

import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, CancelToken } from 'axios'

import { throwException, isAxiosError, http, USE_MOCK } from './api.client.shared'
import { environment } from '../../environment'

import { CreatorLevelViewModel } from './models/creator-level-view-model'
import { CreatorReviewViewModel } from './models/creator-review-view-model'
import { CreatorWishlistItemViewModel } from './models/creator-wishlist-item-view-model'
import { CreatorDiscountCodeViewModel } from './models/creator-discount-code-view-model'

import {
  getMockHomeStats,
  getMockLevel,
  getMockReviews,
  getMockWishlist,
  getMockDiscountCodes,
  getMockPicks,
  getMockProposals,
  getMockMyCampaigns,
  getMockCampaignReviews,
  currentCreatorMock,
} from './mocks/creatorMarketplace.mock'

export interface ICreatorApiClient {
  creatorHomeStats(): Promise<any>
  creatorLevel(): Promise<CreatorLevelViewModel>
  creatorReviewsGet(): Promise<CreatorReviewViewModel[]>
  creatorReviewsPost(review: CreatorReviewViewModel): Promise<CreatorReviewViewModel>
  creatorReviewsDelete(id: string): Promise<void>
  creatorWishlistGet(): Promise<CreatorWishlistItemViewModel[]>
  creatorWishlistPost(item: CreatorWishlistItemViewModel): Promise<CreatorWishlistItemViewModel>
  creatorWishlistDelete(id: string): Promise<void>
  creatorDiscountCodesGet(): Promise<CreatorDiscountCodeViewModel[]>
  creatorDiscountCodesPut(codes: CreatorDiscountCodeViewModel[]): Promise<void>
  creatorPicksGet(): Promise<any[]>
  creatorPicksPost(pick: any): Promise<any>
  creatorPicksPut(pick: any): Promise<any>
  creatorPicksDelete(id: string): Promise<void>
  creatorProposalsGet(): Promise<any[]>
  creatorProposalAccept(id: string): Promise<void>
  creatorProposalReject(id: string): Promise<void>
  creatorCampaignsGet(): Promise<any[]>
  creatorBoostGet(): Promise<any>
  creatorBoostPost(request: any): Promise<any>
  storeFeaturedPut(storeId: string, featured: boolean): Promise<void>
  creatorCampaignReviewsGet(): Promise<any[]>
}

class CreatorApiClient implements ICreatorApiClient {
  private instance: AxiosInstance
  private baseUrl: string
  protected jsonParseReviver: ((key: string, value: any) => any) | undefined = undefined

  constructor(baseUrl?: string, instance?: AxiosInstance) {
    this.instance = instance ? instance : axios.create()
    this.baseUrl = baseUrl !== undefined && baseUrl !== null ? baseUrl : ''
  }

  // ---- shared helpers ----
  private async tryRequest<T>(options: AxiosRequestConfig, fallback: () => T): Promise<T> {
    try {
      const response = await this.instance.request(options).catch((err: any) => {
        if (isAxiosError(err) && err.response) return err.response
        throw err
      })
      const status = (response as AxiosResponse).status
      if (status === 200) return (response as AxiosResponse).data as T
      if (status === 204) return fallback()
      // eslint-disable-next-line no-console
      console.warn(`[creatorApiClient] ${options.method} ${options.url} → ${status}`, (response as AxiosResponse).data)
      return fallback()
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`[creatorApiClient] ${options.method} ${options.url} failed`, err)
      return fallback()
    }
  }

  // ---- endpoints ----

  creatorHomeStats(cancelToken?: CancelToken): Promise<any> {
    if (USE_MOCK) return Promise.resolve(getMockHomeStats())
    const url_ = this.baseUrl + '/user/creator/home-stats'
    return this.tryRequest<any>({ url: url_, method: 'Get', headers: { Accept: 'application/json' }, cancelToken }, () => getMockHomeStats())
  }

  creatorLevel(cancelToken?: CancelToken): Promise<CreatorLevelViewModel> {
    if (USE_MOCK) return Promise.resolve(getMockLevel())
    const url_ = this.baseUrl + '/user/creator/level'
    return this.tryRequest<any>({ url: url_, method: 'Get', headers: { Accept: 'application/json' }, cancelToken }, () => null)
      .then(data => (data ? CreatorLevelViewModel.fromJS(data) : getMockLevel()))
  }

  // ---- bio reviews (creator's own verified reviews with video/photo) ----
  creatorReviewsGet(cancelToken?: CancelToken): Promise<CreatorReviewViewModel[]> {
    if (USE_MOCK) return Promise.resolve(getMockReviews())
    const url_ = this.baseUrl + '/user/creator/reviews'
    return this.tryRequest<any[]>({ url: url_, method: 'Get', headers: { Accept: 'application/json' }, cancelToken }, () => [])
      .then(arr => (Array.isArray(arr) ? arr.map(x => CreatorReviewViewModel.fromJS(x)) : []))
  }

  creatorReviewsPost(review: CreatorReviewViewModel, cancelToken?: CancelToken): Promise<CreatorReviewViewModel> {
    if (USE_MOCK) return Promise.resolve(review)
    const url_ = this.baseUrl + '/user/creator/reviews'
    return this.tryRequest<any>({
      url: url_, method: 'Post', data: JSON.stringify(review),
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, cancelToken,
    }, () => review).then(data => (data ? CreatorReviewViewModel.fromJS(data) : review))
  }

  creatorReviewsDelete(id: string, cancelToken?: CancelToken): Promise<void> {
    if (USE_MOCK) return Promise.resolve()
    const url_ = this.baseUrl + `/user/creator/reviews/${encodeURIComponent(id)}`
    return this.tryRequest<void>({ url: url_, method: 'Delete', headers: {}, cancelToken }, () => undefined as any)
  }

  // ---- wishlist ----
  creatorWishlistGet(cancelToken?: CancelToken): Promise<CreatorWishlistItemViewModel[]> {
    if (USE_MOCK) return Promise.resolve(getMockWishlist())
    const url_ = this.baseUrl + '/user/creator/wishlist'
    return this.tryRequest<any[]>({ url: url_, method: 'Get', headers: { Accept: 'application/json' }, cancelToken }, () => [])
      .then(arr => (Array.isArray(arr) ? arr.map(x => CreatorWishlistItemViewModel.fromJS(x)) : []))
  }

  creatorWishlistPost(item: CreatorWishlistItemViewModel, cancelToken?: CancelToken): Promise<CreatorWishlistItemViewModel> {
    if (USE_MOCK) return Promise.resolve(item)
    const url_ = this.baseUrl + '/user/creator/wishlist'
    return this.tryRequest<any>({
      url: url_, method: 'Post', data: JSON.stringify(item),
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, cancelToken,
    }, () => item).then(data => (data ? CreatorWishlistItemViewModel.fromJS(data) : item))
  }

  creatorWishlistDelete(id: string, cancelToken?: CancelToken): Promise<void> {
    if (USE_MOCK) return Promise.resolve()
    const url_ = this.baseUrl + `/user/creator/wishlist/${encodeURIComponent(id)}`
    return this.tryRequest<void>({ url: url_, method: 'Delete', headers: {}, cancelToken }, () => undefined as any)
  }

  // ---- discount codes ----
  creatorDiscountCodesGet(cancelToken?: CancelToken): Promise<CreatorDiscountCodeViewModel[]> {
    if (USE_MOCK) return Promise.resolve(getMockDiscountCodes())
    const url_ = this.baseUrl + '/user/creator/discount-codes'
    return this.tryRequest<any[]>({ url: url_, method: 'Get', headers: { Accept: 'application/json' }, cancelToken }, () => [])
      .then(arr => (Array.isArray(arr) ? arr.map(x => CreatorDiscountCodeViewModel.fromJS(x)) : []))
  }

  creatorDiscountCodesPut(codes: CreatorDiscountCodeViewModel[], cancelToken?: CancelToken): Promise<void> {
    if (USE_MOCK) return Promise.resolve()
    const url_ = this.baseUrl + '/user/creator/discount-codes'
    return this.tryRequest<void>({
      url: url_, method: 'Put', data: JSON.stringify(codes),
      headers: { 'Content-Type': 'application/json' }, cancelToken,
    }, () => undefined as any)
  }

  // ---- picks ----
  creatorPicksGet(cancelToken?: CancelToken): Promise<any[]> {
    if (USE_MOCK) return Promise.resolve(getMockPicks(currentCreatorMock.handle))
    const url_ = this.baseUrl + '/user/creator/picks'
    return this.tryRequest<any[]>({ url: url_, method: 'Get', headers: { Accept: 'application/json' }, cancelToken }, () => [])
  }

  creatorPicksPost(pick: any, cancelToken?: CancelToken): Promise<any> {
    if (USE_MOCK) return Promise.resolve({ ...pick, id: pick.id ?? `pick-${Date.now()}` })
    const url_ = this.baseUrl + '/user/creator/picks'
    return this.tryRequest<any>({
      url: url_, method: 'Post', data: JSON.stringify(pick),
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, cancelToken,
    }, () => pick)
  }

  creatorPicksPut(pick: any, cancelToken?: CancelToken): Promise<any> {
    if (USE_MOCK) return Promise.resolve(pick)
    const url_ = this.baseUrl + '/user/creator/picks'
    return this.tryRequest<any>({
      url: url_, method: 'Put', data: JSON.stringify(pick),
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, cancelToken,
    }, () => pick)
  }

  creatorPicksDelete(id: string, cancelToken?: CancelToken): Promise<void> {
    if (USE_MOCK) return Promise.resolve()
    const url_ = this.baseUrl + `/user/creator/picks/${encodeURIComponent(id)}`
    return this.tryRequest<void>({ url: url_, method: 'Delete', headers: {}, cancelToken }, () => undefined as any)
  }

  // ---- proposals ----
  creatorProposalsGet(cancelToken?: CancelToken): Promise<any[]> {
    if (USE_MOCK) return Promise.resolve(getMockProposals())
    const url_ = this.baseUrl + '/user/creator/proposals'
    return this.tryRequest<any[]>({ url: url_, method: 'Get', headers: { Accept: 'application/json' }, cancelToken }, () => [])
  }

  creatorProposalAccept(id: string, cancelToken?: CancelToken): Promise<void> {
    if (USE_MOCK) return Promise.resolve()
    const url_ = this.baseUrl + `/user/creator/proposals/${encodeURIComponent(id)}/accept`
    return this.tryRequest<void>({ url: url_, method: 'Post', headers: {}, cancelToken }, () => undefined as any)
  }

  creatorProposalReject(id: string, cancelToken?: CancelToken): Promise<void> {
    if (USE_MOCK) return Promise.resolve()
    const url_ = this.baseUrl + `/user/creator/proposals/${encodeURIComponent(id)}/reject`
    return this.tryRequest<void>({ url: url_, method: 'Post', headers: {}, cancelToken }, () => undefined as any)
  }

  // ---- campaigns ----
  creatorCampaignsGet(cancelToken?: CancelToken): Promise<any[]> {
    if (USE_MOCK) return Promise.resolve(getMockMyCampaigns())
    const url_ = this.baseUrl + '/user/creator/campaigns'
    return this.tryRequest<any[]>({ url: url_, method: 'Get', headers: { Accept: 'application/json' }, cancelToken }, () => [])
  }

  // ---- boost ----
  creatorBoostGet(cancelToken?: CancelToken): Promise<any> {
    if (USE_MOCK) {
      return Promise.resolve({ active: false, boostedUntil: null, tierOptions: [
        { days: 3, priceEur: 9 },
        { days: 7, priceEur: 19 },
        { days: 14, priceEur: 34 },
      ] })
    }
    const url_ = this.baseUrl + '/user/creator/boost'
    return this.tryRequest<any>({ url: url_, method: 'Get', headers: { Accept: 'application/json' }, cancelToken }, () => null)
  }

  creatorBoostPost(request: any, cancelToken?: CancelToken): Promise<any> {
    if (USE_MOCK) {
      const days = request?.days ?? 7
      const until = new Date()
      until.setDate(until.getDate() + days)
      return Promise.resolve({ active: true, boostedUntil: until.toISOString(), days, priceEur: request?.priceEur ?? 19 })
    }
    const url_ = this.baseUrl + '/user/creator/boost'
    return this.tryRequest<any>({
      url: url_, method: 'Post', data: JSON.stringify(request),
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, cancelToken,
    }, () => request)
  }

  // ---- featured toggle ----
  storeFeaturedPut(storeId: string, featured: boolean, cancelToken?: CancelToken): Promise<void> {
    if (USE_MOCK) return Promise.resolve()
    const url_ = this.baseUrl + `/user/stores/${encodeURIComponent(storeId)}/featured`
    return this.tryRequest<void>({
      url: url_, method: 'Put', data: JSON.stringify({ featured }),
      headers: { 'Content-Type': 'application/json' }, cancelToken,
    }, () => undefined as any)
  }

  // ---- campaign reviews (restaurant -> creator feedback) ----
  creatorCampaignReviewsGet(cancelToken?: CancelToken): Promise<any[]> {
    if (USE_MOCK) return Promise.resolve(getMockCampaignReviews(currentCreatorMock.handle))
    const url_ = this.baseUrl + '/user/creator/campaign-reviews'
    return this.tryRequest<any[]>({ url: url_, method: 'Get', headers: { Accept: 'application/json' }, cancelToken }, () => [])
  }

  protected throwException(message: string, status: number, response: string, headers: { [key: string]: any }, result?: any): any {
    return throwException(message, status, response, headers, result)
  }
}

export const creatorApiClient = new CreatorApiClient(environment.baseUrl, http)
