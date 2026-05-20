import type { ProfessionalRoleTag, ShiftPreference, CertificateTag } from './professional-profile-view-model'

export type ContractType = 'indefinido' | 'temporal' | 'por-horas' | 'extra' | 'practicas'

export const CONTRACT_LABELS: Record<ContractType, string> = {
  'indefinido': 'Indefinido',
  'temporal':   'Temporal',
  'por-horas':  'Por horas',
  'extra':      'Extra / evento puntual',
  'practicas':  'Prácticas',
}

export type JobPostingStatus = 'draft' | 'active' | 'paused' | 'filled' | 'expired'

export const JOB_STATUS_LABELS: Record<JobPostingStatus, string> = {
  'draft':    'Borrador',
  'active':   'Activa',
  'paused':   'Pausada',
  'filled':   'Cubierta',
  'expired':  'Expirada',
}

export interface JobPosting {
  id: string
  storeId: string
  storeName: string
  storeLogoUrl: string
  storeCity: string
  title: string
  role: ProfessionalRoleTag
  description: string
  contractType: ContractType
  shifts: ShiftPreference[]
  hoursPerWeek: number
  /** one of the two is used depending on contract */
  hourlyRateEur?: number
  monthlySalaryEur?: number
  requiredExperienceYears: number
  requiredCertificates: CertificateTag[]
  languagesRequired: string[]
  postedAt: string      // ISO date
  expiresAt: string     // ISO date (auto = postedAt + 30d)
  status: JobPostingStatus
  applicationsCount: number
  viewsCount: number
  /** applied to make the posting prominent on search */
  boosted?: boolean
}
