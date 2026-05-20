import { ref, computed } from 'vue'

// Review dispute flow (MVP mock — localStorage-backed).
// 3 actors: restaurante (inicia disputa), creator/user (defiende con pruebas),
// admin (resuelve). Real impl would live in the backend + notifications.

export type DisputeStatus =
  | 'none'                    // no dispute
  | 'disputed'                // restaurante disputó — esperando respuesta del creator
  | 'under_review'            // creator respondió con pruebas — admin revisa
  | 'resolved_creator'        // admin falló a favor del creator (reseña se queda)
  | 'resolved_restaurant'     // admin falló a favor del restaurante (reseña se elimina/oculta)
  | 'dismissed'               // disputa rechazada sin resolución (p.ej. por spam)

export type DisputeReason =
  | 'fake'        // reseña falsa o spam
  | 'offensive'   // lenguaje ofensivo
  | 'not-customer' // no es cliente real
  | 'competitor'  // competencia desleal
  | 'other'

export interface ReviewDispute {
  id: string                  // unique dispute id
  reviewId: string            // the review being disputed
  storeId: string             // restaurant that initiated the dispute
  storeName: string
  creatorHandle: string       // the creator whose review it is
  creatorName: string
  reviewText?: string         // snapshot of the review
  reviewRating?: number       // snapshot
  status: DisputeStatus
  reason: DisputeReason
  restaurantExplanation: string  // restaurant's initial claim
  creatorDefense?: string        // creator's counter-argument
  creatorEvidenceUrls?: string[] // creator-uploaded evidence (ticket, photo)
  adminNotes?: string            // admin's resolution reasoning
  createdAt: string              // ISO date
  creatorRespondedAt?: string
  resolvedAt?: string
  counterProofDeadline: string   // 7 days after createdAt
}

const STORAGE_KEY = 'guavagram_review_disputes_v1'

const disputes = ref<ReviewDispute[]>([])
let initialized = false

// ── Storage helpers ─────────────────────────────────────────────────────────
const load = () => {
  if (typeof localStorage === 'undefined') return
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) disputes.value = JSON.parse(raw)
  } catch {
    disputes.value = []
  }
}

const persist = () => {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(disputes.value))
  } catch {}
}

const seedDevMocks = () => {
  // Dev-only: seed a couple of disputes so the UI has something to render.
  if (disputes.value.length > 0) return
  const now = Date.now()
  const mk = (days: number) => new Date(now - days * 24 * 60 * 60 * 1000).toISOString()
  const deadline = (days: number) => new Date(now + days * 24 * 60 * 60 * 1000).toISOString()

  disputes.value = [
    {
      id: 'disp-001',
      reviewId: 'rev-demo-001',
      storeId: 'dev-store-001',
      storeName: 'Pau Artiso · Demo Store',
      creatorHandle: 'maria_foodie',
      creatorName: 'Maria Gomez',
      reviewText: 'Comida decente pero el servicio fue muy lento.',
      reviewRating: 3,
      status: 'disputed',
      reason: 'not-customer',
      restaurantExplanation: 'No tenemos registro de que esta persona haya venido. El ticket no aparece en nuestro POS.',
      createdAt: mk(2),
      counterProofDeadline: deadline(5),
    },
    {
      id: 'disp-002',
      reviewId: 'rev-demo-002',
      storeId: 'dev-store-001',
      storeName: 'Pau Artiso · Demo Store',
      creatorHandle: 'jordi_tapas',
      creatorName: 'Jordi Farre',
      reviewText: 'Pésimo. Sabor artificial, parecía comida de microondas.',
      reviewRating: 1,
      status: 'under_review',
      reason: 'competitor',
      restaurantExplanation: 'Este perfil pertenece al propietario de un restaurante competidor (La Tasca) a 200m de distancia.',
      creatorDefense: 'Soy cliente habitual, aquí el ticket del 14 de marzo.',
      creatorEvidenceUrls: ['https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=400'],
      createdAt: mk(5),
      creatorRespondedAt: mk(3),
      counterProofDeadline: deadline(2),
    },
  ]
  persist()
}

// ── Public API ──────────────────────────────────────────────────────────────
export function useReviewDisputes() {
  if (!initialized && typeof window !== 'undefined') {
    load()
    if (import.meta.dev) seedDevMocks()
    initialized = true
  }

  // Lookup by review id (for rendering state in a review card).
  const byReviewId = (reviewId: string) =>
    disputes.value.find(d => d.reviewId === reviewId && d.status !== 'none')

  // Lookup by creator handle (for the creator's "My disputes" tab).
  const forCreator = (handle: string) =>
    computed(() => disputes.value.filter(d => d.creatorHandle === handle))

  // Lookup by store (for the restaurant dashboard).
  const forStore = (storeId: string) =>
    computed(() => disputes.value.filter(d => d.storeId === storeId))

  // All pending (admin view).
  const pending = computed(() =>
    disputes.value.filter(d => d.status === 'disputed' || d.status === 'under_review')
  )

  // Restaurant: open a new dispute.
  const openDispute = (params: {
    reviewId: string
    storeId: string
    storeName: string
    creatorHandle: string
    creatorName: string
    reviewText?: string
    reviewRating?: number
    reason: DisputeReason
    restaurantExplanation: string
  }): ReviewDispute => {
    const now = Date.now()
    const dispute: ReviewDispute = {
      id: `disp-${now}-${Math.random().toString(36).slice(2, 8)}`,
      status: 'disputed',
      createdAt: new Date(now).toISOString(),
      counterProofDeadline: new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString(),
      ...params,
    }
    disputes.value = [dispute, ...disputes.value]
    persist()
    return dispute
  }

  // Creator: respond with evidence.
  const respondWithEvidence = (id: string, defense: string, evidenceUrls?: string[]) => {
    const idx = disputes.value.findIndex(d => d.id === id)
    if (idx < 0) return
    disputes.value[idx] = {
      ...disputes.value[idx]!,
      status: 'under_review',
      creatorDefense: defense,
      creatorEvidenceUrls: evidenceUrls,
      creatorRespondedAt: new Date().toISOString(),
    }
    persist()
  }

  // Admin: resolve.
  const resolve = (id: string, outcome: 'creator' | 'restaurant' | 'dismiss', notes?: string) => {
    const idx = disputes.value.findIndex(d => d.id === id)
    if (idx < 0) return
    const status: DisputeStatus =
      outcome === 'creator' ? 'resolved_creator' :
      outcome === 'restaurant' ? 'resolved_restaurant' :
      'dismissed'
    disputes.value[idx] = {
      ...disputes.value[idx]!,
      status,
      adminNotes: notes,
      resolvedAt: new Date().toISOString(),
    }
    persist()
  }

  return {
    disputes,
    byReviewId,
    forCreator,
    forStore,
    pending,
    openDispute,
    respondWithEvidence,
    resolve,
  }
}

// ── UI helpers ──────────────────────────────────────────────────────────────
export const DISPUTE_STATUS_META: Record<DisputeStatus, { label: string; color: string; icon: string }> = {
  none:                  { label: '—',                         color: '#999',    icon: 'mdi-circle-outline' },
  disputed:              { label: 'En disputa',                color: '#ef4444', icon: 'mdi-alert-octagon-outline' },
  under_review:          { label: 'En revisión',               color: '#f59e0b', icon: 'mdi-gavel' },
  resolved_creator:      { label: 'Resuelta · a tu favor',     color: '#22c55e', icon: 'mdi-check-decagram' },
  resolved_restaurant:   { label: 'Resuelta · a favor restaurante', color: '#6b7280', icon: 'mdi-close-circle-outline' },
  dismissed:             { label: 'Descartada',                color: '#6b7280', icon: 'mdi-cancel' },
}

export const DISPUTE_REASON_LABELS: Record<DisputeReason, string> = {
  'fake':         'Reseña falsa o spam',
  'offensive':    'Lenguaje ofensivo o inapropiado',
  'not-customer': 'No es cliente real',
  'competitor':   'Competencia desleal',
  'other':        'Otro motivo',
}
