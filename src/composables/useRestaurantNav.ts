import type { NavItem, NavSection } from '~/types/nav'

export type RestaurantTabKey =
  | 'home' | 'menu' | 'bio' | 'loyalty' | 'fans' | 'widgets' | 'settings'
  | 'orders' | 'bookings' | 'inventory' | 'staff' | 'accounting' | 'analytics'

export const RESTAURANT_ACCENT = '#ff2d23'

// Mobile bottom tabs: Widgets web sólo en sidebar de escritorio (no aporta en
// móvil); Ajustes vive como icono en el top-bar móvil. Por eso no hay tab "Más".
//
// "Te quieren" (fans) intentionally removed: coupons are being phased out in
// favour of fidelity cards (see product spec from Pau, May 2026). The Vue
// component still renders if the URL is hit directly (?tab=fans) but it's no
// longer surfaced through navigation.
export const RESTAURANT_BOTTOM_TABS: readonly NavItem[] = [
  { key: 'home',    icon: 'mdi-home-outline',                   activeIcon: 'mdi-home',                label: 'Inicio' },
  { key: 'menu',    icon: 'mdi-silverware-fork-knife',                                                  label: 'Menú' },
  { key: 'bio',     icon: 'mdi-account-box-outline',            activeIcon: 'mdi-account-box',         label: 'Bio' },
  { key: 'loyalty', icon: 'mdi-card-account-details-star-outline', activeIcon: 'mdi-card-account-details-star', label: 'Fidelizar' },
] as const

export function restaurantSections(): NavSection[] {
  return [
    {
      key: 'principal',
      // Labels are i18n keys — resolved at render time by AppSidebar's
      // `resolveLabel()` helper. Falls back to the literal string if a key
      // doesn't exist, so legacy strings keep working.
      title: 'navMain',
      collapsible: false,
      defaultOpen: true,
      items: [
        { key: 'home',    icon: 'mdi-home-outline',                      label: 'navHome' },
        { key: 'menu',    icon: 'mdi-silverware-fork-knife',             label: 'navMenu' },
        { key: 'bio',     icon: 'mdi-account-box-outline',               label: 'navBio' },
        { key: 'loyalty', icon: 'mdi-card-account-details-star-outline', label: 'navLoyalty' },
      ],
    },
  ]
}

// Reservado por si en el futuro quieres reintroducir un bottom-sheet "Más".
// Actualmente vacío: Widgets web vive en sidebar (escritorio) y Ajustes vive
// como icono en el top-bar móvil.
export function restaurantMoreSheetItems(): NavItem[] {
  return []
}
