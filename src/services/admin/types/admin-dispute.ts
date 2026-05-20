export type DisputeStatus = 'open' | 'in_review' | 'awaiting_creator' | 'awaiting_restaurant' | 'resolved_for_restaurant' | 'resolved_for_creator' | 'rejected'
export type DisputeKind = 'missing_commission' | 'chargeback' | 'fraud' | 'bug' | 'review_claim' | 'other'

export interface DisputeMessage {
  at: string
  from: 'restaurant' | 'creator' | 'support' | 'system'
  authorLabel: string
  text: string
}

export interface AdminReviewClaim {
  reviewId: string
  reviewRating: number
  reviewText: string
  reviewReceiptUrl: string
  reviewPlacePhotoUrl: string
  reviewAuthorId: string
  reviewAuthorHandle: string
  reviewPublishedAt: string
  restaurantClaim: {
    reasons: string[]       // e.g. ['never_visited', 'fake_photo']
    text: string
    evidenceUrls: string[]
    submittedAt: string
  }
  creatorDefense?: {
    text: string
    evidenceUrls: string[]
    submittedAt: string
  }
}

export interface AdminDispute {
  id: string
  status: DisputeStatus
  kind: DisputeKind
  openedAt: string
  resolvedAt?: string
  actorUserId: string         // who opened the dispute
  actorLabel: string
  counterpartyUserId?: string
  counterpartyLabel?: string
  amountEur: number           // 0 for review claims
  summary: string
  messages: DisputeMessage[]
  // Populated only when kind === 'review_claim'
  reviewClaim?: AdminReviewClaim
}

export const DISPUTE_KIND_LABELS: Record<DisputeKind, string> = {
  missing_commission: 'Comisión no registrada',
  chargeback: 'Chargeback',
  fraud: 'Sospecha de fraude',
  bug: 'Bug técnico',
  review_claim: 'Reclamación de reseña',
  other: 'Otro',
}

export const REVIEW_CLAIM_REASONS: Record<string, string> = {
  never_visited: 'El cliente nunca visitó el local',
  fake_photo: 'Foto del ticket o del lugar falsificada',
  wrong_business: 'Reseña del sitio equivocado',
  personal_attack: 'Ataque personal / lenguaje abusivo',
  competitor: 'Sospecha de reseña de competencia',
  extortion: 'Intento de extorsión (quitar reseña a cambio de algo)',
  outdated: 'Reseña muy antigua, problemas ya resueltos',
}
