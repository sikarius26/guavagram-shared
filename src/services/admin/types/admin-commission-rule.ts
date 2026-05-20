// Guavagram commission model: 3 levels of upline × 3 time horizons
// (see /que-es-guavagram.md §3).
//
// - Level 1 = creator who onboarded the restaurant directly
// - Level 2 = creator who onboarded the L1 creator
// - Level 3 = creator who onboarded the L2 creator
// - Commission is paid on everything the restaurant pays to Guava (the SaaS).
// - The percentages evolve over years:
//     Year 1 (ramp)       — half of peak
//     Year 2 (peak)       — full base
//     Year 3+ (permanent) — 25% of peak, forever, while restaurant pays

export type CommissionHorizon = 'year1' | 'year2' | 'year3plus'

export interface CommissionLevelRates {
  l1: number  // % paid to L1 creator
  l2: number  // % paid to L2 creator
  l3: number  // % paid to L3 creator
}

export interface AdminCommissionRule {
  horizons: Record<CommissionHorizon, CommissionLevelRates>
  peak: CommissionLevelRates        // displayed as reference — source of truth
  maxLevels: 3                      // hard-capped
  payoutCondition: string           // human-readable rule
  updatedAt: string
}

export interface AdminGpRule {
  gpToEurRate: number
  perActionGp: { action: string; gp: number }[]
  ranks: { rank: string; gpThreshold: number; perks: string[] }[]
  updatedAt: string
}

export const HORIZON_LABELS: Record<CommissionHorizon, string> = {
  year1: 'Año 1 · rampa',
  year2: 'Año 2 · pico',
  year3plus: 'Año 3+ · permanente',
}

export const HORIZON_DESCRIPTIONS: Record<CommissionHorizon, string> = {
  year1: 'Arranque — el restaurante acaba de entrar, comisión reducida mientras consolida.',
  year2: 'Pico — máxima comisión tras un año de permanencia.',
  year3plus: 'Permanente — comisión residual que cobras para siempre mientras el restaurante siga pagando.',
}
