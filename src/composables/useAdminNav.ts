import { computed, type ComputedRef } from 'vue'
import type { NavItem, NavSection } from '~/types/nav'
import { useAdminSidebarCounters } from '~/composables/admin/useAdminSidebarCounters'

export const ADMIN_ACCENT = '#ff2d23'

export function useAdminSections(): ComputedRef<NavSection[]> {
  const counters = useAdminSidebarCounters()
  return computed<NavSection[]>(() => [
    {
      key: 'overview',
      title: 'Overview',
      collapsible: true,
      defaultOpen: true,
      items: [
        { key: 'overview', label: 'Home', icon: 'mdi-view-dashboard-outline', to: '/admin/overview', requires: 'overview.view' },
      ],
    },
    {
      key: 'ops',
      title: 'Operaciones',
      collapsible: true,
      defaultOpen: true,
      items: [
        { key: 'stores',        label: 'Restaurantes',  icon: 'mdi-storefront-outline',        to: '/admin/stores',        requires: 'stores.view' },
        { key: 'users',         label: 'Consumers',     icon: 'mdi-account-group-outline',     to: '/admin/users',         requires: 'users.view' },
        { key: 'creators',      label: 'Creators',      icon: 'mdi-account-star-outline',      to: '/admin/creators',      requires: 'creators.view' },
        { key: 'professionals', label: 'Profesionales', icon: 'mdi-briefcase-account-outline', to: '/admin/professionals', requires: 'professionals.view' },
        { key: 'hiring',        label: 'Hiring (B2B)',  icon: 'mdi-handshake-outline',         to: '/admin/hiring',        requires: 'hiring.view' },
      ],
    },
    {
      key: 'finance',
      title: 'Finanzas',
      collapsible: true,
      defaultOpen: true,
      items: [
        { key: 'earnings', label: 'Earnings', icon: 'mdi-cash-multiple',         to: '/admin/earnings', badge: counters.pendingEarnings.value, requires: 'earnings.view' },
        { key: 'payouts',  label: 'Payouts',  icon: 'mdi-bank-transfer-out',     to: '/admin/payouts',                                          requires: 'payouts.view' },
        { key: 'disputes', label: 'Disputes', icon: 'mdi-alert-octagon-outline', to: '/admin/disputes', badge: counters.openDisputes.value,    requires: 'disputes.view' },
      ],
    },
    {
      key: 'network',
      title: 'Red',
      collapsible: true,
      defaultOpen: true,
      items: [
        { key: 'network',     label: 'Árbol afiliados',  icon: 'mdi-graph-outline',  to: '/admin/network',             requires: 'network.view' },
        { key: 'leaderboard', label: 'Ranking creators', icon: 'mdi-trophy-outline', to: '/admin/network/leaderboard', requires: 'network.view' },
      ],
    },
    {
      key: 'moderation',
      title: 'Moderación',
      collapsible: true,
      defaultOpen: true,
      items: [
        { key: 'moderation-reviews', label: 'Reviews',     icon: 'mdi-check-decagram-outline',  to: '/admin/moderation/reviews', badge: counters.pendingReviews.value, requires: 'moderation.reviews' },
        { key: 'moderation-ugc',     label: 'UGC / Feed',  icon: 'mdi-image-multiple-outline',  to: '/admin/moderation/ugc',                                           requires: 'moderation.ugc' },
        { key: 'moderation-reports', label: 'Denuncias',   icon: 'mdi-flag-outline',            to: '/admin/moderation/reports', badge: counters.openReports.value,    requires: 'moderation.reports' },
      ],
    },
    {
      key: 'settings',
      title: 'Configuración',
      collapsible: true,
      defaultOpen: false,
      items: [
        { key: 'settings-commissions', label: 'Comisiones',           icon: 'mdi-percent-outline',             to: '/admin/settings/commissions',  requires: 'settings.commissions' },
        { key: 'settings-gp',          label: 'Guava Points',         icon: 'mdi-diamond-stone',               to: '/admin/settings/gp',           requires: 'settings.gp' },
        { key: 'settings-plans',       label: 'Planes',               icon: 'mdi-crown-outline',               to: '/admin/settings/plans',        requires: 'settings.plans' },
        { key: 'settings-challenges',  label: 'Challenges',           icon: 'mdi-trophy-award',                to: '/admin/settings/challenges',   requires: 'settings.challenges' },
        { key: 'settings-referrals',   label: 'Referrals',            icon: 'mdi-account-multiple-plus',       to: '/admin/settings/referrals',    requires: 'settings.referrals' },
        { key: 'settings-jobs',        label: 'Empleos (taxonomía)',  icon: 'mdi-briefcase-variant-outline',   to: '/admin/settings/jobs-taxonomy', requires: 'settings.jobs' },
        { key: 'settings-flags',       label: 'Feature flags',        icon: 'mdi-toggle-switch-outline',       to: '/admin/settings/flags',        requires: 'settings.flags' },
        { key: 'settings-team',        label: 'Equipo',               icon: 'mdi-shield-account-outline',      to: '/admin/settings/team',         requires: 'team.view' },
      ],
    },
    {
      key: 'observability',
      title: 'Observabilidad',
      collapsible: true,
      defaultOpen: true,
      items: [
        { key: 'audit', label: 'Audit log', icon: 'mdi-history', to: '/admin/audit', requires: 'audit.view' },
      ],
    },
  ])
}

export function resolveAdminActiveKey(path: string, sections: NavSection[]): string {
  for (const s of sections) {
    for (const i of s.items) {
      if (i.to && (path === i.to || path.startsWith(i.to + '/'))) return i.key
    }
  }
  return ''
}
