export interface AdminFeatureFlag {
  key: string
  label: string
  description: string
  enabled: boolean
  rolloutPct?: number
  updatedAt: string
}
