import type { NavItem, NavSection } from '~/types/nav'

export type ProfessionalTabKey = 'home' | 'profile' | 'jobs' | 'applications' | 'settings'

export const PROFESSIONAL_ACCENT = '#10b981'

export const PROFESSIONAL_BOTTOM_TABS: readonly NavItem[] = [
  { key: 'home',         icon: 'mdi-home-outline',           activeIcon: 'mdi-home',         label: 'Inicio' },
  { key: 'profile',      icon: 'mdi-account-box-outline',    activeIcon: 'mdi-account-box',  label: 'Perfil' },
  { key: 'jobs',         icon: 'mdi-briefcase-outline',      activeIcon: 'mdi-briefcase',    label: 'Ofertas' },
  { key: 'applications', icon: 'mdi-send-check-outline',     activeIcon: 'mdi-send-check',   label: 'Mías' },
  { key: 'settings',     icon: 'mdi-cog-outline',            activeIcon: 'mdi-cog',          label: 'Ajustes' },
] as const

export function professionalSections(): NavSection[] {
  return [
    {
      key: 'principal',
      title: 'Principal',
      collapsible: true,
      defaultOpen: true,
      items: [
        { key: 'home',         icon: 'mdi-home-outline',        label: 'Inicio' },
        { key: 'profile',      icon: 'mdi-account-box-outline', label: 'Mi perfil' },
        { key: 'jobs',         icon: 'mdi-briefcase-outline',   label: 'Ofertas' },
        { key: 'applications', icon: 'mdi-send-check-outline',  label: 'Mis aplicaciones' },
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

export function resolveProfessionalTab(query: string | undefined): ProfessionalTabKey {
  if (!query) return 'home'
  if (['home', 'profile', 'jobs', 'applications', 'settings'].includes(query)) {
    return query as ProfessionalTabKey
  }
  return 'home'
}
