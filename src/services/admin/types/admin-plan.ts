export type PlanTier = 'free' | 'pro' | 'guava' | 'guava_plus'

export interface AdminPlan {
  tier: PlanTier
  label: string
  priceMonthlyEur: number
  priceYearlyEur: number
  features: string[]
  active: boolean
}
