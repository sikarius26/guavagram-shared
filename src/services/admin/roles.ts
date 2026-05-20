import type { Permission, StaffRole } from './types/admin-staff-role'

const VIEW_ALL: Permission[] = [
  'overview.view',
  'audit.view',
  'stores.view',
  'users.view',
  'creators.view',
  'professionals.view',
  'hiring.view',
  'network.view',
  'team.view',
]

const OPS_EXTRA: Permission[] = [
  'stores.edit', 'stores.suspend', 'stores.impersonate',
  'users.edit', 'users.suspend', 'users.impersonate',
  'creators.verify', 'creators.impersonate',
  'professionals.impersonate',
  'hiring.edit',
  'network.fraud_flag',
]

const FINANCE_EXTRA: Permission[] = [
  'earnings.view', 'earnings.approve',
  'payouts.view', 'payouts.execute',
  'disputes.view', 'disputes.resolve',
  'settings.commissions', 'settings.gp',
]

const MOD_EXTRA: Permission[] = [
  'moderation.reviews', 'moderation.ugc', 'moderation.reports',
  'users.suspend',
]

const SUPPORT_EXTRA: Permission[] = [
  'earnings.view', 'payouts.view', 'disputes.view',
  'stores.impersonate', 'users.impersonate', 'creators.impersonate', 'professionals.impersonate',
]

export const ROLE_MATRIX: Record<StaffRole, Permission[]> = {
  super_admin: [], // wildcard — handled in useAdminSession.can()
  ops: [...VIEW_ALL, ...OPS_EXTRA],
  finance: [...VIEW_ALL, ...FINANCE_EXTRA],
  content_mod: [...VIEW_ALL, ...MOD_EXTRA],
  support: [...VIEW_ALL, ...SUPPORT_EXTRA],
}

export type { Permission, StaffRole }
