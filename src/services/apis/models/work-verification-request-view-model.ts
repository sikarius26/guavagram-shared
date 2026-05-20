import type { ProfessionalRoleTag } from './professional-profile-view-model'

export type WorkVerificationStatus = 'pending' | 'approved' | 'rejected'

export const WORK_VERIFICATION_STATUS_LABELS: Record<WorkVerificationStatus, string> = {
  'pending':  'Pendiente',
  'approved': 'Aprobada',
  'rejected': 'Rechazada',
}

export type RehireAnswer = 'yes' | 'maybe' | 'no'

export const REHIRE_LABELS: Record<RehireAnswer, string> = {
  'yes':   'Sí, sin duda',
  'maybe': 'Tal vez',
  'no':    'No',
}

/**
 * Optional per-dimension evaluation attached by the restaurant when approving
 * a work verification. Scores are 1 (muy bajo) to 5 (excelente). These scores
 * become the public "rating de empleador" visible on the professional's profile.
 */
export interface WorkEvaluation {
  punctuality: number       // Puntualidad
  attitude: number          // Actitud / trato con clientes y equipo
  teamwork: number          // Trabajo en equipo
  technicalSkills: number   // Conocimientos técnicos del puesto
  cleanliness: number       // Limpieza y orden
  wouldRehire: RehireAnswer
}

/** Dimension definitions, used to render the evaluation UI */
export const EVALUATION_DIMENSIONS: { key: keyof Omit<WorkEvaluation, 'wouldRehire'>; label: string; icon: string; color: string }[] = [
  { key: 'punctuality',     label: 'Puntualidad',           icon: 'mdi-clock-outline',         color: '#0ea5e9' },
  { key: 'attitude',        label: 'Actitud y trato',       icon: 'mdi-emoticon-happy-outline', color: '#f59e0b' },
  { key: 'teamwork',        label: 'Trabajo en equipo',     icon: 'mdi-account-group-outline', color: '#8b5cf6' },
  { key: 'technicalSkills', label: 'Conocimientos técnicos', icon: 'mdi-school-outline',        color: '#22c55e' },
  { key: 'cleanliness',     label: 'Limpieza y orden',       icon: 'mdi-broom',                 color: '#ec4899' },
]

export interface WorkVerificationRequest {
  id: string
  professionalHandle: string
  professionalName: string
  professionalImageUrl: string
  workExperienceId: string
  /** claimed details the restaurant is asked to confirm */
  claimedRole: ProfessionalRoleTag
  claimedStartMonth: string   // 'YYYY-MM'
  claimedEndMonth: string | null
  /** target restaurant (must be a Guavagram-onboarded store) */
  targetStoreId: string
  targetStoreName: string
  targetStoreLogoUrl: string
  requestedAt: string          // ISO date
  status: WorkVerificationStatus
  /** optional comment from restaurant on approve/reject */
  responseNote?: string
  respondedAt?: string
  /** only populated when status === 'approved' and restaurant decided to evaluate */
  evaluation?: WorkEvaluation
}
