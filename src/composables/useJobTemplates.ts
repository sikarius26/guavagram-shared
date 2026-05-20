import type { ProfessionalRoleTag, ShiftPreference, CertificateTag } from '~/services/apis/models/professional-profile-view-model'
import type { ContractType } from '~/services/apis/models/job-posting-view-model'

export interface JobTemplate {
  id: string
  name: string
  description: string
  icon: string
  color: string
  defaults: {
    title: string
    role: ProfessionalRoleTag
    description: string
    contractType: ContractType
    shifts: ShiftPreference[]
    hoursPerWeek: number
    hourlyRateEur?: number
    monthlySalaryEur?: number
    requiredExperienceYears: number
    requiredCertificates: CertificateTag[]
    languagesRequired: string[]
  }
}

export const JOB_TEMPLATES: JobTemplate[] = [
  {
    id: 'tpl-waiter-weekend',
    name: 'Camarero fin de semana',
    description: 'Turno viernes tarde + sábado + domingo. Ideal para complementar otro trabajo.',
    icon: 'mdi-silverware-fork-knife', color: '#ff2d23',
    defaults: {
      title: 'Camarero/a fin de semana', role: 'camarero',
      description: 'Incorporación a equipo de sala para viernes noche + sábado + domingo. Ambiente dinámico, propinas compartidas. Imprescindible experiencia mínima 1 año y buena actitud.',
      contractType: 'temporal', shifts: ['afternoon', 'night', 'weekend'], hoursPerWeek: 24,
      hourlyRateEur: 11, requiredExperienceYears: 1, requiredCertificates: ['manipulador-alimentos'],
      languagesRequired: ['es'],
    },
  },
  {
    id: 'tpl-line-cook',
    name: 'Cocinero de línea',
    description: 'Cocinero con experiencia, contrato estable, turno rotativo.',
    icon: 'mdi-pot-steam', color: '#f59e0b',
    defaults: {
      title: 'Cocinero/a de línea', role: 'cocinero',
      description: 'Buscamos cocinero/a con 2+ años para cubrir puesto de línea. Turnos rotativos mañana/tarde. Dominio de mise en place y producción.',
      contractType: 'indefinido', shifts: ['morning', 'afternoon', 'night'], hoursPerWeek: 40,
      hourlyRateEur: 12, requiredExperienceYears: 2, requiredCertificates: ['manipulador-alimentos', 'alergenos'],
      languagesRequired: ['es'],
    },
  },
  {
    id: 'tpl-extra-event',
    name: 'Extra evento puntual',
    description: 'Refuerzo para eventos especiales. Pago por evento.',
    icon: 'mdi-party-popper', color: '#ec4899',
    defaults: {
      title: 'Extra para evento fin de semana', role: 'camarero',
      description: 'Necesitamos extras para evento privado. 10h aproximadas. Se valora experiencia previa en eventos y disponibilidad inmediata.',
      contractType: 'extra', shifts: ['weekend'], hoursPerWeek: 10,
      hourlyRateEur: 13, requiredExperienceYears: 1, requiredCertificates: [],
      languagesRequired: ['es'],
    },
  },
  {
    id: 'tpl-maitre',
    name: 'Jefe de sala',
    description: 'Gestión de equipo, reservas y experiencia cliente.',
    icon: 'mdi-crown-outline', color: '#8b5cf6',
    defaults: {
      title: 'Maître / jefe de sala', role: 'maitre',
      description: 'Restaurante consolidado busca maître con 5+ años gestionando equipos. Gestión de reservas (TheFork, CoverManager), coordinación con cocina, experiencia cliente premium.',
      contractType: 'indefinido', shifts: ['afternoon', 'night'], hoursPerWeek: 42,
      monthlySalaryEur: 2400, requiredExperienceYears: 5, requiredCertificates: ['ingles-b2'],
      languagesRequired: ['es', 'en'],
    },
  },
  {
    id: 'tpl-kitchen-helper',
    name: 'Ayudante sin experiencia',
    description: 'Entrada a hostelería — formamos desde cero.',
    icon: 'mdi-school-outline', color: '#22c55e',
    defaults: {
      title: 'Ayudante de cocina sin experiencia', role: 'ayudante-cocina',
      description: 'Buscamos persona con ganas de aprender hostelería. No requiere experiencia previa, formación a cargo del restaurante. Actitud y puntualidad son lo más importante.',
      contractType: 'indefinido', shifts: ['morning', 'afternoon'], hoursPerWeek: 30,
      hourlyRateEur: 9.5, requiredExperienceYears: 0, requiredCertificates: ['manipulador-alimentos'],
      languagesRequired: ['es'],
    },
  },
  {
    id: 'tpl-barman',
    name: 'Barman coctelería',
    description: 'Carta de cócteles de autor, turno nocturno.',
    icon: 'mdi-glass-cocktail', color: '#0ea5e9',
    defaults: {
      title: 'Barman coctelería nocturno', role: 'barman',
      description: 'Coctelería clásica y de autor. Turno de 20h a 3h, 4 noches a la semana. Ambiente dinámico con foco en producto premium.',
      contractType: 'indefinido', shifts: ['night'], hoursPerWeek: 32,
      hourlyRateEur: 14, requiredExperienceYears: 2, requiredCertificates: ['coctelería'],
      languagesRequired: ['es', 'en'],
    },
  },
]
