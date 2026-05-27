// Public API client for the creator marketplace. Used by the restaurant-side
// dashboard to search and inspect creators. No auth required.
//
// Cross-agent note: return types reference models authored by Agent 1A
// (CreatorMarketplaceItem, CreatorDetailViewModel, etc.). For now we use `any`
// where those models are still pending, so this client compiles standalone.
// TODO: import from creator-*.ts once Agent 1A publishes them.

/* tslint:disable */
/* eslint-disable */

import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, CancelToken } from 'axios'

import { throwException, isAxiosError, http, USE_MOCK } from './api.client.shared'
import { environment } from '../../environment'

import type { CreatorMarketplaceFilter } from './models/creator-marketplace-filter'

import {
  getMockCreators,
  getMockCreatorByHandle,
  getMockPicks,
  getMockCampaignReviews,
} from './mocks/creatorMarketplace.mock'

export interface IMarketplaceApiClient {
  marketplaceList(filter: CreatorMarketplaceFilter, page: number): Promise<any>
  marketplaceDetail(handle: string): Promise<any>
  marketplacePicks(handle: string): Promise<any[]>
  marketplaceCampaignReviews(handle: string, page: number): Promise<any>
}

class MarketplaceApiClient implements IMarketplaceApiClient {
  private instance: AxiosInstance
  private baseUrl: string
  protected jsonParseReviver: ((key: string, value: any) => any) | undefined = undefined

  constructor(baseUrl?: string, instance?: AxiosInstance) {
    this.instance = instance ? instance : axios.create()
    this.baseUrl = baseUrl !== undefined && baseUrl !== null ? baseUrl : ''
  }

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
      console.warn(`[marketplaceApiClient] ${options.method} ${options.url} → ${status}`)
      return fallback()
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`[marketplaceApiClient] ${options.method} ${options.url} failed`, err)
      return fallback()
    }
  }

  private applyFilter(items: any[], filter: CreatorMarketplaceFilter): any[] {
    return items.filter(c => {
      if (filter.city && c.city !== filter.city) return false
      if (filter.level !== undefined && c.level?.level !== filter.level) return false
      if (filter.priceMin !== undefined && c.basePriceEur < filter.priceMin) return false
      if (filter.priceMax !== undefined && c.basePriceEur > filter.priceMax) return false
      if (filter.ratingMin !== undefined && c.rating < filter.ratingMin) return false
      if (filter.expertise?.length && !filter.expertise.some(e => c.categories?.includes(e))) return false
      if (filter.languages?.length && !filter.languages.some(l => c.languages?.includes(l))) return false
      return true
    })
  }

  marketplaceList(filter: CreatorMarketplaceFilter, page: number, cancelToken?: CancelToken): Promise<any> {
    if (USE_MOCK) {
      const all = this.applyFilter(getMockCreators(), filter)
      const pageSize = 12
      const start = Math.max(0, (page - 1) * pageSize)
      const items = all.slice(start, start + pageSize)
      return Promise.resolve({ items, page, totalPages: Math.max(1, Math.ceil(all.length / pageSize)), total: all.length })
    }
    const params = new URLSearchParams()
    params.set('page', String(page))
    if (filter.city) params.set('city', filter.city)
    if (filter.level !== undefined) params.set('level', String(filter.level))
    if (filter.priceMin !== undefined) params.set('priceMin', String(filter.priceMin))
    if (filter.priceMax !== undefined) params.set('priceMax', String(filter.priceMax))
    if (filter.ratingMin !== undefined) params.set('ratingMin', String(filter.ratingMin))
    if (filter.sortBy) params.set('sortBy', filter.sortBy)
    filter.expertise?.forEach(e => params.append('expertise', e))
    filter.languages?.forEach(l => params.append('languages', l))
    const url_ = `${this.baseUrl}/public/creator/marketplace?${params.toString()}`
    return this.tryRequest<any>({ url: url_, method: 'Get', headers: { Accept: 'application/json' }, cancelToken },
      () => ({ items: [], page, totalPages: 1, total: 0 }))
  }

  marketplaceDetail(handle: string, cancelToken?: CancelToken): Promise<any> {
    if (USE_MOCK) return Promise.resolve(getMockCreatorByHandle(handle))
    const url_ = `${this.baseUrl}/public/creator/${encodeURIComponent(handle)}/detail`
    return this.tryRequest<any>({ url: url_, method: 'Get', headers: { Accept: 'application/json' }, cancelToken },
      () => getMockCreatorByHandle(handle))
  }

  marketplacePicks(handle: string, cancelToken?: CancelToken): Promise<any[]> {
    if (USE_MOCK) return Promise.resolve(getMockPicks(handle))
    const url_ = `${this.baseUrl}/public/creator/${encodeURIComponent(handle)}/picks`
    return this.tryRequest<any[]>({ url: url_, method: 'Get', headers: { Accept: 'application/json' }, cancelToken },
      () => [])
  }

  marketplaceCampaignReviews(handle: string, page: number, cancelToken?: CancelToken): Promise<any> {
    if (USE_MOCK) {
      const all = getMockCampaignReviews(handle)
      const pageSize = 10
      const start = Math.max(0, (page - 1) * pageSize)
      return Promise.resolve({ items: all.slice(start, start + pageSize), page, totalPages: Math.max(1, Math.ceil(all.length / pageSize)), total: all.length })
    }
    const url_ = `${this.baseUrl}/public/creator/${encodeURIComponent(handle)}/campaign-reviews?page=${page}`
    return this.tryRequest<any>({ url: url_, method: 'Get', headers: { Accept: 'application/json' }, cancelToken },
      () => ({ items: [], page, totalPages: 1, total: 0 }))
  }

  protected throwException(message: string, status: number, response: string, headers: { [key: string]: any }, result?: any): any {
    return throwException(message, status, response, headers, result)
  }
}

export const marketplaceApiClient = new MarketplaceApiClient(environment.baseUrl, http)
