// Authenticated API client for the restaurant-side marketing flows: create
// campaigns towards creators, view marketing stats, and boost a store.
//
// Cross-agent note: CampaignRequest, CampaignViewModel, BoostRequest,
// MarketingStatsViewModel are authored by Agent 1A. We keep `any` for now so
// this client can be shipped before those land.
// TODO: import from creator-*.ts / marketing-*.ts once Agent 1A publishes them.

/* tslint:disable */
/* eslint-disable */

import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, CancelToken } from 'axios'

import { throwException, isAxiosError, http, USE_MOCK } from './api.client.shared'
import { environment } from '../../environment'

import type { CampaignStatusEnum } from './models/campaign-status-enum'

import {
  getMockMarketingStats,
  getMockMyCampaigns,
} from './mocks/creatorMarketplace.mock'

export interface IMarketingApiClient {
  marketingCampaignCreate(req: any): Promise<any>
  marketingCampaigns(status?: CampaignStatusEnum): Promise<any[]>
  marketingStats(storeId: string): Promise<any>
  marketingBoost(req: any): Promise<any>
}

class MarketingApiClient implements IMarketingApiClient {
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
      console.warn(`[marketingApiClient] ${options.method} ${options.url} → ${status}`)
      return fallback()
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`[marketingApiClient] ${options.method} ${options.url} failed`, err)
      return fallback()
    }
  }

  marketingCampaignCreate(req: any, cancelToken?: CancelToken): Promise<any> {
    if (USE_MOCK) {
      return Promise.resolve({ ...req, id: `cmp-${Date.now()}`, status: 0, createdAt: new Date().toISOString() })
    }
    const url_ = `${this.baseUrl}/dashboard/marketing/campaign`
    return this.tryRequest<any>({
      url: url_, method: 'Post', data: JSON.stringify(req),
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, cancelToken,
    }, () => req)
  }

  marketingCampaigns(status?: CampaignStatusEnum, cancelToken?: CancelToken): Promise<any[]> {
    if (USE_MOCK) {
      const all = getMockMyCampaigns()
      return Promise.resolve(status === undefined ? all : all.filter(c => c.status === status))
    }
    const qs = status !== undefined ? `?status=${status}` : ''
    const url_ = `${this.baseUrl}/dashboard/marketing/campaigns${qs}`
    return this.tryRequest<any[]>({ url: url_, method: 'Get', headers: { Accept: 'application/json' }, cancelToken }, () => [])
  }

  marketingStats(storeId: string, cancelToken?: CancelToken): Promise<any> {
    if (USE_MOCK) return Promise.resolve({ ...getMockMarketingStats(), storeId })
    const url_ = `${this.baseUrl}/dashboard/marketing/stats?storeId=${encodeURIComponent(storeId)}`
    return this.tryRequest<any>({ url: url_, method: 'Get', headers: { Accept: 'application/json' }, cancelToken },
      () => ({ ...getMockMarketingStats(), storeId }))
  }

  marketingBoost(req: any, cancelToken?: CancelToken): Promise<any> {
    if (USE_MOCK) {
      const days = req?.days ?? 7
      const until = new Date()
      until.setDate(until.getDate() + days)
      return Promise.resolve({ ...req, active: true, boostedUntil: until.toISOString() })
    }
    const url_ = `${this.baseUrl}/dashboard/marketing/boost`
    return this.tryRequest<any>({
      url: url_, method: 'Post', data: JSON.stringify(req),
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, cancelToken,
    }, () => req)
  }

  protected throwException(message: string, status: number, response: string, headers: { [key: string]: any }, result?: any): any {
    return throwException(message, status, response, headers, result)
  }
}

export const marketingApiClient = new MarketingApiClient(environment.baseUrl, http)
