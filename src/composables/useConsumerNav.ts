import type { NavItem } from '~/types/nav'

export type ConsumerNavKey = 'discover' | 'affiliates' | 'saved' | 'profile'

export const CONSUMER_NAV_ITEMS: readonly NavItem[] = [
  { key: 'discover',   to: '/u',                icon: 'mdi-compass-outline', activeIcon: 'mdi-compass',  label: 'Discover' },
  { key: 'saved',      to: '/wallet',           icon: 'mdi-heart-outline',   activeIcon: 'mdi-heart',    label: 'Guardados' },
  { key: 'affiliates', to: '/user/commissions', icon: 'mdi-wallet-bifold-outline', activeIcon: 'mdi-wallet-bifold', label: 'Afiliados' },
  { key: 'profile',    to: '/user/profile',     icon: 'mdi-account-outline', activeIcon: 'mdi-account',  label: 'Perfil' },
] as const

export function resolveConsumerActiveKey(path: string): ConsumerNavKey {
  if (path.startsWith('/user/commissions')
   || path.startsWith('/user/payouts')
   || path.startsWith('/user/payout-onboarding')
   || path.startsWith('/affiliate')
   || path.startsWith('/invitar'))                                return 'affiliates'
  if (path.startsWith('/wallet')
   || path.startsWith('/user/stores'))                            return 'saved'
  if (path.startsWith('/user/profile')
   || path.startsWith('/user/settings')
   || path.startsWith('/pricing'))                                return 'profile'
  return 'discover'
}
