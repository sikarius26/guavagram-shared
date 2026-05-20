import type { NavItem, NavSection } from '~/types/nav'

export type CreatorTabKey = 'hub' | 'bio' | 'informes' | 'settings'

export const CREATOR_ACCENT = '#10b981'

export const CREATOR_BOTTOM_TABS: readonly NavItem[] = [
  { key: 'hub',      icon: 'mdi-view-dashboard-outline', activeIcon: 'mdi-view-dashboard', label: 'Hub' },
  { key: 'bio',      icon: 'mdi-account-box-outline',    activeIcon: 'mdi-account-box',    label: 'Bio' },
  { key: 'informes', icon: 'mdi-chart-line',             activeIcon: 'mdi-chart-line',     label: 'Informes' },
  { key: 'settings', icon: 'mdi-cog-outline',            activeIcon: 'mdi-cog',            label: 'Ajustes' },
] as const

export function creatorSections(): NavSection[] {
  return [
    {
      key: 'principal',
      title: 'Principal',
      collapsible: true,
      defaultOpen: true,
      items: [
        { key: 'hub',      icon: 'mdi-view-dashboard-outline', label: 'Hub' },
        { key: 'bio',      icon: 'mdi-account-box-outline',    label: 'Bio' },
        { key: 'informes', icon: 'mdi-chart-line',             label: 'Informes' },
      ],
    },
    {
      key: 'cuenta',
      title: 'Cuenta',
      collapsible: true,
      defaultOpen: true,
      items: [
        { key: 'settings', icon: 'mdi-cog-outline', label: 'Ajustes' },
      ],
    },
  ]
}

export function resolveCreatorTab(query: string | undefined): CreatorTabKey {
  if (!query) return 'hub'
  if (['reviews', 'campaigns', 'offers'].includes(query)) return 'hub'
  if (query === 'home' || query === 'affiliate') return 'bio'
  if (['hub', 'bio', 'informes', 'settings'].includes(query)) return query as CreatorTabKey
  return 'hub'
}
