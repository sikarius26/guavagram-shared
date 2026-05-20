// Creator home "Oportunidades" fixtures. Replaces inline arrays in
// `components/creator/home/CreatorOpportunities.vue`.
//
// Future API contract: GET /api/creator/opportunities → { proposals, nearby }

import { placeholderRestaurantPhoto, placeholderBrandLogo } from './_seed'

export interface MockProposal {
  brand: string
  coverUrl: string
  logoUrl: string
  budgetEur: number
  deadline: string
  urgent: boolean
  category: string
}

export interface MockNearbyOffer {
  name: string
  coverUrl: string
  logoUrl: string
  distanceKm: number
  feePerPostEur: number
  tag: string
  emoji: string
}

const PROPOSAL_SEEDS = [
  { brand: 'Bodega Nova', budgetEur: 80, deadline: 'Responde en 2 días', urgent: true,  category: 'Bodega' },
  { brand: 'Brunch & Co', budgetEur: 60, deadline: 'Responde en 4 días', urgent: false, category: 'Brunch' },
  { brand: 'Pepe Tapas',  budgetEur: 40, deadline: 'Responde en 5 días', urgent: false, category: 'Tapas'  },
]

const NEARBY_SEEDS = [
  { name: 'Casa Lola',     distanceKm: 0.8, feePerPostEur: 45, tag: 'Tapas',         emoji: '🍷' },
  { name: 'Kanoa Poke',    distanceKm: 1.2, feePerPostEur: 35, tag: 'Healthy',       emoji: '🥗' },
  { name: 'Tigre Dorado',  distanceKm: 2.1, feePerPostEur: 55, tag: 'Asian fusion',  emoji: '🍜' },
]

export function getMockCreatorProposals(): MockProposal[] {
  return PROPOSAL_SEEDS.map(s => ({
    brand: s.brand,
    coverUrl: placeholderRestaurantPhoto(`${s.brand}-cover`, 600, 400),
    logoUrl: placeholderBrandLogo(`${s.brand}-logo`, 200),
    budgetEur: s.budgetEur,
    deadline: s.deadline,
    urgent: s.urgent,
    category: s.category,
  }))
}

export function getMockNearbyOffers(): MockNearbyOffer[] {
  return NEARBY_SEEDS.map(s => ({
    name: s.name,
    coverUrl: placeholderRestaurantPhoto(`${s.name}-cover`, 600, 400),
    logoUrl: placeholderBrandLogo(`${s.name}-logo`, 200),
    distanceKm: s.distanceKm,
    feePerPostEur: s.feePerPostEur,
    tag: s.tag,
    emoji: s.emoji,
  }))
}
