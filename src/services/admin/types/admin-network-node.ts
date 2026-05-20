export type AffiliateTier = 'bronze' | 'silver' | 'gold'

export interface AdminNetworkNode {
  userId: string
  handle: string
  displayName: string
  avatarUrl?: string
  tier: AffiliateTier
  city?: string
  earnings30dEur: number
  earningsLifetimeEur: number
  gpLifetime: number
  downlineDirectCount: number
  downlineTotalCount: number
  joinedAt: string // ISO
  lastActiveAt?: string // ISO
  suspiciousScore: number // 0..1
  parentId: string | null
  children?: AdminNetworkNode[]
}

export interface AdminNetworkTreeKpis {
  totalNodes: number
  activeLast30d: number
  avgDepth: number
  maxDepth: number
  fraudFlagged: number
  totalEarningsEur: number
}
