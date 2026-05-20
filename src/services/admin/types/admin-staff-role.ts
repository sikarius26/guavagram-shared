export type StaffRole =
  | 'super_admin'
  | 'ops'
  | 'finance'
  | 'content_mod'
  | 'support'

export type Permission =
  | 'overview.view'
  | 'audit.view'
  | 'stores.view' | 'stores.edit' | 'stores.suspend' | 'stores.impersonate'
  | 'users.view' | 'users.edit' | 'users.gp_adjust' | 'users.suspend' | 'users.impersonate'
  | 'creators.view' | 'creators.verify' | 'creators.impersonate'
  | 'professionals.view' | 'professionals.impersonate'
  | 'hiring.view' | 'hiring.edit'
  | 'earnings.view' | 'earnings.approve'
  | 'payouts.view' | 'payouts.execute'
  | 'disputes.view' | 'disputes.resolve'
  | 'network.view' | 'network.fraud_flag'
  | 'moderation.reviews' | 'moderation.ugc' | 'moderation.reports'
  | 'settings.commissions' | 'settings.gp' | 'settings.plans'
  | 'settings.challenges' | 'settings.referrals' | 'settings.jobs' | 'settings.flags'
  | 'team.view' | 'team.manage'

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  super_admin: 'Super admin',
  ops: 'Operaciones',
  finance: 'Finanzas',
  content_mod: 'Moderación',
  support: 'Soporte',
}
