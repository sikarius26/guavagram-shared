import type { CreatorDiscountCodeViewModel } from './creator-discount-code-view-model'

export interface BulkOfferTemplate {
  percentOff?: number
  flatOffCents?: number
  expireAt: Date
  maxUses?: number
  message?: string
}

export interface BulkSendOfferRequest {
  leadIds: string[]
  template: BulkOfferTemplate
}

export interface BulkSendOfferFailure {
  leadId: string
  reason: string
}

export interface BulkSendOfferResponse {
  success: boolean
  created: CreatorDiscountCodeViewModel[]
  failed: BulkSendOfferFailure[]
}
