import type { NavItem, NavSection } from '~/types/nav'

export type RestaurantTabKey =
  | 'home' | 'menu' | 'bio' | 'loyalty' | 'clientes' | 'marketing' | 'fans' | 'widgets' | 'settings'
  | 'orders' | 'bookings' | 'inventory' | 'employees' | 'staff' | 'accounting' | 'analytics'
  | 'informes'

export const RESTAURANT_ACCENT = '#ff2d23'

// Módulos de pago cuya gestión vive en la plataforma Guava, no embebida en
// Guavagram. Cuando están contratados (hasModule = true), su entrada del
// sidebar lleva directamente a Guava en vez de abrir un panel local; cuando no,
// el item está bloqueado y su click abre el flujo de suscripción del plan.
export const GUAVA_MANAGED_MODULES = new Set<RestaurantTabKey>(['orders', 'employees'])

// Mobile bottom tabs: Widgets web sólo en sidebar de escritorio (no aporta en
// móvil); Ajustes vive como icono en el top-bar móvil. Por eso no hay tab "Más".
//
// "Te quieren" (fans) intentionally removed: coupons are being phased out in
// favour of fidelity cards (see product spec from Pau, May 2026). The Vue
// component still renders if the URL is hit directly (/dashboard/fans) but
// it's no longer surfaced through navigation.
export const RESTAURANT_BOTTOM_TABS: readonly NavItem[] = [
  { key: 'home',    icon: 'mdi-home-outline',                   activeIcon: 'mdi-home',                label: 'Inicio' },
  { key: 'menu',    icon: 'mdi-silverware-fork-knife',                                                  label: 'Menú' },
  { key: 'bio',     icon: 'mdi-account-box-outline',            activeIcon: 'mdi-account-box',         label: 'Bio' },
  { key: 'loyalty', icon: 'mdi-card-account-details-star-outline', activeIcon: 'mdi-card-account-details-star', label: 'Fidelizar' },
] as const

// Bookings + Orders are paid add-ons (see dashboard `lockedTools`). The
// sidebar surfaces them as an upgrade entry point: when the restaurant hasn't
// activated the module, the items render with a lock icon and a click emits
// `locked-click` so the layout can open the upgrade prompt. Pass an
// `unlocked` set to mark items as accessible (the layout reads this from
// `useSubscription().hasModule`).
export function restaurantSections(opts: { unlocked?: Set<'bookings' | 'orders' | 'employees'> } = {}): NavSection[] {
  const unlocked = opts.unlocked ?? new Set()
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
        { key: 'home',      icon: 'mdi-home-outline',                      label: 'navHome' },
        { key: 'menu',      icon: 'mdi-silverware-fork-knife',             label: 'navMenu' },
        { key: 'bio',       icon: 'mdi-account-box-outline',               label: 'navBio' },
        // Clientes lives inside Fidelización as its own tab — not a top-level sidebar item.
        { key: 'loyalty',   icon: 'mdi-card-account-details-star-outline', label: 'navLoyalty' },
        { key: 'marketing', icon: 'mdi-bullhorn-outline',                  label: 'Marketing' },
      ],
    },
    {
      key: 'premium',
      title: 'Premium',
      collapsible: false,
      defaultOpen: true,
      items: [
        {
          key: 'bookings',
          icon: 'mdi-calendar-check-outline',
          label: 'moduleBookings',
          ...(unlocked.has('bookings') ? {} : { lockReason: 'Premium' }),
        },
        {
          key: 'orders',
          icon: 'mdi-shopping-outline',
          label: 'moduleOrders',
          ...(unlocked.has('orders') ? {} : { lockReason: 'Premium' }),
        },
        {
          // `employees` (Guava Empleados) → /dashboard/employees (HiringPanel).
          // Key matches the GuavaModule so the layout's `locked-click` handler
          // opens the right upgrade prompt without a key→module mapping.
          key: 'employees',
          icon: 'mdi-account-group-outline',
          label: 'moduleEmployees',
          ...(unlocked.has('employees') ? {} : { lockReason: 'Premium' }),
        },
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
