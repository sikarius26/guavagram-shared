// Client wrapper for the "creators que te quieren" (store → creator leads) flow.
// Kept outside the auto-generated `api.client.store.ts` to avoid clobbering
// regenerated code. In dev builds it returns mock data; in prod it should call
// the backend endpoints documented in the plan:
//
//   GET  /api/stores/{storeId}/creator-leads
//   POST /api/stores/{storeId}/creator-leads/{leadId}/offer
//   GET  /api/stores/{storeId}/creator-leads/stats

import { http, throwException, isAxiosError, USE_MOCK } from './api.client.shared'
import { StoreCreatorLeadViewModel } from './models/store-creator-lead-view-model'
import { CreatorDiscountCodeViewModel } from './models/creator-discount-code-view-model'
import type { SendCreatorOfferRequest } from './models/send-creator-offer-request'
import type { BulkSendOfferRequest, BulkSendOfferResponse } from './models/bulk-offer-template'
import { getMockLeadsForStore, getMockLeadsStatsForStore, recordOfferSent, recordBulkOffersSent } from './mocks/creatorMarketplace.mock'
import { environment } from '../../environment'

export interface StoreCreatorLeadsStats {
  new: number
  offerSent: number
  accepted: number
}

export interface SendOfferResponse {
  success: boolean
  discountCode: CreatorDiscountCodeViewModel
}

function baseUrl(): string {
  return environment?.baseUrl ?? ''
}

export async function storeCreatorLeadsGet(storeId: string): Promise<StoreCreatorLeadViewModel[]> {
  if (USE_MOCK) return getMockLeadsForStore(storeId)
  try {
    const res = await http.get(`${baseUrl()}/api/stores/${encodeURIComponent(storeId)}/creator-leads`, {
      headers: { Accept: 'application/json' },
    })
    const arr = Array.isArray(res.data) ? res.data : []
    return arr.map((x: any) => StoreCreatorLeadViewModel.fromJS(x))
  } catch (err: any) {
    if (isAxiosError(err) && err.response) {
      throwException('Failed to load creator leads', err.response.status, JSON.stringify(err.response.data ?? {}), err.response.headers as any)
    }
    throw err
  }
}

export async function storeCreatorLeadsStatsGet(storeId: string): Promise<StoreCreatorLeadsStats> {
  if (USE_MOCK) return getMockLeadsStatsForStore(storeId)
  try {
    const res = await http.get(`${baseUrl()}/api/stores/${encodeURIComponent(storeId)}/creator-leads/stats`, {
      headers: { Accept: 'application/json' },
    })
    return res.data as StoreCreatorLeadsStats
  } catch (err: any) {
    if (isAxiosError(err) && err.response) {
      throwException('Failed to load creator lead stats', err.response.status, JSON.stringify(err.response.data ?? {}), err.response.headers as any)
    }
    throw err
  }
}

export async function storeCreatorLeadsBulkSendOffer(
  storeId: string,
  request: BulkSendOfferRequest,
): Promise<BulkSendOfferResponse> {
  if (!request.leadIds || request.leadIds.length === 0) {
    return { success: true, created: [], failed: [] }
  }
  if (USE_MOCK) {
    return recordBulkOffersSent(request.leadIds, request.template)
  }
  try {
    const body = {
      ...request,
      template: {
        ...request.template,
        expireAt: request.template.expireAt instanceof Date
          ? request.template.expireAt.toISOString()
          : new Date(request.template.expireAt).toISOString(),
      },
    }
    const res = await http.post(
      `${baseUrl()}/api/stores/${encodeURIComponent(storeId)}/creator-leads/bulk-offer`,
      JSON.stringify(body),
      { headers: { 'Content-Type': 'application/json', Accept: 'application/json' } },
    )
    const data = res.data ?? {}
    return {
      success: !!data.success,
      created: Array.isArray(data.created) ? data.created.map((c: any) => CreatorDiscountCodeViewModel.fromJS(c)) : [],
      failed: Array.isArray(data.failed) ? data.failed : [],
    }
  } catch (err: any) {
    if (isAxiosError(err) && err.response) {
      throwException('Failed to bulk-send offers', err.response.status, JSON.stringify(err.response.data ?? {}), err.response.headers as any)
    }
    throw err
  }
}

export async function storeCreatorLeadSendOffer(storeId: string, request: SendCreatorOfferRequest): Promise<SendOfferResponse> {
  if (!request.leadId) throw new Error('leadId is required')
  if (USE_MOCK) {
    const discount = recordOfferSent(request.leadId, {
      code: request.code ?? '',
      percentOff: request.percentOff,
      flatOffCents: request.flatOffCents,
      expireAt: (request.expireAt instanceof Date ? request.expireAt : new Date(request.expireAt)).toISOString(),
      description: request.message,
      maxUses: request.maxUses,
    })
    return { success: true, discountCode: discount }
  }
  try {
    const res = await http.post(
      `${baseUrl()}/api/stores/${encodeURIComponent(storeId)}/creator-leads/${encodeURIComponent(request.leadId)}/offer`,
      JSON.stringify(request),
      { headers: { 'Content-Type': 'application/json', Accept: 'application/json' } },
    )
    const data = res.data ?? {}
    return {
      success: !!data.success,
      discountCode: CreatorDiscountCodeViewModel.fromJS(data.discountCode ?? {}),
    }
  } catch (err: any) {
    if (isAxiosError(err) && err.response) {
      throwException('Failed to send offer', err.response.status, JSON.stringify(err.response.data ?? {}), err.response.headers as any)
    }
    throw err
  }
}
