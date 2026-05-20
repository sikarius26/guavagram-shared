export type ProfessionalRoleTag =
  | 'cocinero' | 'jefe-cocina' | 'segundo' | 'ayudante-cocina' | 'lavaplatos'
  | 'camarero' | 'maitre' | 'host' | 'runner'
  | 'barman' | 'sumiller' | 'barista'
  | 'repartidor' | 'office' | 'manager'

export const PROFESSIONAL_ROLES: { id: ProfessionalRoleTag; label: string; icon: string; category: 'cocina' | 'sala' | 'barra' | 'otros' }[] = [
  { id: 'jefe-cocina',      label: 'Jefe de cocina',     icon: 'mdi-chef-hat',           category: 'cocina' },
  { id: 'segundo',          label: 'Segundo de cocina',  icon: 'mdi-silverware-variant', category: 'cocina' },
  { id: 'cocinero',         label: 'Cocinero',           icon: 'mdi-pot-steam',          category: 'cocina' },
  { id: 'ayudante-cocina',  label: 'Ayudante de cocina', icon: 'mdi-food-takeout-box-outline', category: 'cocina' },
  { id: 'lavaplatos',       label: 'Lavaplatos / office', icon: 'mdi-dishwasher',        category: 'cocina' },
  { id: 'maitre',           label: 'Maître',             icon: 'mdi-crown-outline',      category: 'sala' },
  { id: 'camarero',         label: 'Camarero / sala',    icon: 'mdi-silverware-fork-knife', category: 'sala' },
  { id: 'host',             label: 'Host / recibidor',   icon: 'mdi-account-tie-voice-outline', category: 'sala' },
  { id: 'runner',           label: 'Runner',             icon: 'mdi-run',                category: 'sala' },
  { id: 'barman',           label: 'Barman',             icon: 'mdi-glass-cocktail',     category: 'barra' },
  { id: 'sumiller',         label: 'Sumiller',           icon: 'mdi-glass-wine',         category: 'barra' },
  { id: 'barista',          label: 'Barista',            icon: 'mdi-coffee',             category: 'barra' },
  { id: 'manager',          label: 'Manager / encargado', icon: 'mdi-account-supervisor-outline', category: 'otros' },
  { id: 'repartidor',       label: 'Repartidor',         icon: 'mdi-moped-outline',      category: 'otros' },
  { id: 'office',           label: 'Office / back',      icon: 'mdi-broom',              category: 'otros' },
]

export type ShiftPreference = 'morning' | 'afternoon' | 'night' | 'weekend'

export const SHIFT_LABELS: Record<ShiftPreference, string> = {
  morning:   'Mañana',
  afternoon: 'Tarde',
  night:     'Noche',
  weekend:   'Finde',
}

export type CertificateTag =
  | 'manipulador-alimentos' | 'alergenos' | 'sommelier' | 'coctelería'
  | 'barista-nivel-2' | 'primeros-auxilios' | 'prl' | 'ingles-b2'

export const CERTIFICATES: { id: CertificateTag; label: string }[] = [
  { id: 'manipulador-alimentos', label: 'Manipulador de alimentos' },
  { id: 'alergenos',             label: 'Alérgenos' },
  { id: 'sommelier',             label: 'Sommelier certificado' },
  { id: 'coctelería',            label: 'Coctelería avanzada' },
  { id: 'barista-nivel-2',       label: 'Barista nivel 2' },
  { id: 'primeros-auxilios',     label: 'Primeros auxilios' },
  { id: 'prl',                   label: 'Prevención riesgos laborales' },
  { id: 'ingles-b2',             label: 'Inglés B2+' },
]

export interface WorkExperience {
  id: string
  restaurantName: string
  role: ProfessionalRoleTag
  startMonth: string      // 'YYYY-MM'
  endMonth: string | null // 'YYYY-MM' or null if still there
  description?: string
  verified: boolean
  verifiedByStoreId?: string
  verifiedByStoreName?: string
  verifiedAt?: string     // ISO date
}

export interface ProfessionalProfile {
  handle: string
  name: string
  email: string
  phone?: string
  profileImageUrl: string
  city: string
  bio: string
  availableFrom: string   // ISO date; 'immediate' handled by checking if <= now
  seekingRoles: ProfessionalRoleTag[]
  experienceYears: number
  workHistory: WorkExperience[]
  languages: string[]     // ISO 639-1 codes: 'es', 'en', 'fr', ...
  shiftPreferences: ShiftPreference[]
  hoursPerWeekMin: number
  hoursPerWeekMax: number
  hourlyRateEurMin: number
  hourlyRateEurMax: number
  certificates: CertificateTag[]
  /** true if ≥1 WorkExperience is verified */
  verifiedOverall: boolean
  /** visibility in search */
  publicProfile: boolean
  stats: {
    profileViews: number
    applicationsSent: number
    shortlistedCount: number
    hiredCount: number
  }
}
