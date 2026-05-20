import { getCreators } from './adminCreators.mock'

export interface AdminLeaderboardRow {
  rank: number
  creatorId: string
  handle: string
  name: string
  city: string
  category: string
  earnings30dEur: number
  earningsLifetimeEur: number
  campaignsCount: number
  tier: 'bronze' | 'silver' | 'gold'
  verified: boolean
}

export function getLeaderboard(period: '30d' | 'all' = 'all'): AdminLeaderboardRow[] {
  return getCreators()
    .filter(c => c.verified)
    .slice()
    .sort((a, b) => period === '30d' ? b.earnings30dEur - a.earnings30dEur : b.earningsLifetimeEur - a.earningsLifetimeEur)
    .map((c, i) => ({
      rank: i + 1,
      creatorId: c.id,
      handle: c.handle,
      name: c.name,
      city: c.city,
      category: c.category,
      earnings30dEur: c.earnings30dEur,
      earningsLifetimeEur: c.earningsLifetimeEur,
      campaignsCount: c.campaignsCount,
      tier: c.tier,
      verified: c.verified,
    }))
}
