import type { StaffRole } from './admin-staff-role'

export interface AdminTeamMember {
  userId: string
  email: string
  name: string
  role: StaffRole
  lastActiveAt?: string
  createdAt: string
  active: boolean
}
