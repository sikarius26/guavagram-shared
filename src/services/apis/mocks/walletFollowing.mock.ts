// Wallet "Siguiendo" tab fixtures. Replaces the inline mock array in
// `components/wallet/WalletFollowingPanel.vue`.
//
// Future API contract: GET /api/me/following → MockFollowingCreator[]

import { placeholderAvatar, hashSeed } from './_seed'

export interface MockFollowingCreator {
  handle: string
  displayName: string
  city: string
  avatarUrl: string
  verified: boolean
  followedAt: string
}

const SEEDS: Array<Omit<MockFollowingCreator, 'avatarUrl' | 'city'> & { citySlug: string }> = [
  { handle: 'martamadrid', displayName: 'Marta Vega',           citySlug: 'madrid',    verified: true,  followedAt: '2026-04-25T10:00:00Z' },
  { handle: 'sergiotapas', displayName: 'Sergio · Tapas y vino', citySlug: 'sevilla',   verified: false, followedAt: '2026-04-22T18:30:00Z' },
  { handle: 'lucia.eats',  displayName: 'Lucía Foodie',          citySlug: 'barcelona', verified: true,  followedAt: '2026-04-19T08:15:00Z' },
  { handle: 'pauelchef',   displayName: 'Pau el Chef',           citySlug: 'valencia',  verified: false, followedAt: '2026-04-12T21:00:00Z' },
  { handle: 'nuriabites',  displayName: 'Nuria Bites',           citySlug: 'bilbao',    verified: false, followedAt: '2026-04-05T14:45:00Z' },
]

const CITY_NAMES: Record<string, string> = {
  madrid: 'Madrid',
  sevilla: 'Sevilla',
  barcelona: 'Barcelona',
  valencia: 'Valencia',
  bilbao: 'Bilbao',
}

export function getMockFollowingCreators(): MockFollowingCreator[] {
  return SEEDS.map(s => ({
    handle: s.handle,
    displayName: s.displayName,
    city: CITY_NAMES[s.citySlug] ?? s.citySlug,
    avatarUrl: placeholderAvatar(s.handle, 200),
    verified: s.verified,
    followedAt: s.followedAt,
  }))
}

// Re-export for tooling that wants a deterministic id from a handle.
export { hashSeed as followingSeedFromHandle }
