export type JobApplicationStatus = 'pending' | 'seen' | 'shortlisted' | 'rejected' | 'hired'

export const APPLICATION_STATUS_LABELS: Record<JobApplicationStatus, string> = {
  'pending':     'Enviada',
  'seen':        'Vista',
  'shortlisted': 'Preseleccionado',
  'rejected':    'Rechazada',
  'hired':       'Contratado',
}

export const APPLICATION_STATUS_COLORS: Record<JobApplicationStatus, string> = {
  'pending':     '#888',
  'seen':        '#0ea5e9',
  'shortlisted': '#f59e0b',
  'rejected':    '#ef4444',
  'hired':       '#22c55e',
}

export interface JobApplication {
  id: string
  jobPostingId: string
  /** denormalized for listing UI */
  jobTitle: string
  jobRole: string
  storeName: string
  storeLogoUrl: string
  professionalHandle: string
  professionalName: string
  professionalImageUrl: string
  professionalCity: string
  /** snapshot at moment of apply */
  professionalExperienceYears: number
  professionalVerifiedOverall: boolean
  coverNote: string
  appliedAt: string     // ISO date
  status: JobApplicationStatus
  /** optional note from the restaurant when responding */
  responseNote?: string
  respondedAt?: string
}
