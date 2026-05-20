import { ref, computed } from 'vue'
import type {
  ProfessionalProfile, ProfessionalRoleTag, WorkExperience,
} from '~/services/apis/models/professional-profile-view-model'
import type { JobPosting } from '~/services/apis/models/job-posting-view-model'
import type { JobApplication } from '~/services/apis/models/job-application-view-model'
import type { WorkVerificationRequest } from '~/services/apis/models/work-verification-request-view-model'

// ─── Seed data ────────────────────────────────────────────────────
const avatarGradients = [
  'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
  'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
  'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
  'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
  'linear-gradient(135deg, #22c55e 0%, #84cc16 100%)',
]

export const avatarGradientFor = (handle: string) => {
  let h = 0
  for (let i = 0; i < handle.length; i++) h = (h * 31 + handle.charCodeAt(i)) >>> 0
  return avatarGradients[h % avatarGradients.length]!
}

// Mock professionals — used as restaurant-side search results
const mockProfessionals: ProfessionalProfile[] = [
  {
    handle: 'maria.cocinera', name: 'María García', email: 'maria@example.com', profileImageUrl: '',
    city: 'Madrid', bio: 'Cocinera con 6 años en mediterránea moderna. Busco carta creativa.',
    availableFrom: '2026-04-25', seekingRoles: ['cocinero', 'segundo'], experienceYears: 6,
    workHistory: [
      { id: 'we-1', restaurantName: 'Casa Paco', role: 'cocinero', startMonth: '2022-09', endMonth: '2025-12', verified: true, verifiedByStoreId: 'store-casapaco', verifiedByStoreName: 'Casa Paco', verifiedAt: '2026-01-15' },
      { id: 'we-2', restaurantName: 'Tasca Verde', role: 'ayudante-cocina', startMonth: '2020-03', endMonth: '2022-08', verified: false },
      { id: 'we-1b', restaurantName: 'Casa Verde', role: 'cocinero', startMonth: '2018-05', endMonth: '2020-02', verified: true, verifiedByStoreId: 'store-2', verifiedByStoreName: 'Casa Verde', verifiedAt: '2024-06-10' },
    ],
    languages: ['es', 'en'], shiftPreferences: ['afternoon', 'night'],
    hoursPerWeekMin: 35, hoursPerWeekMax: 45, hourlyRateEurMin: 12, hourlyRateEurMax: 16,
    certificates: ['manipulador-alimentos', 'alergenos'], verifiedOverall: true, publicProfile: true,
    stats: { profileViews: 142, applicationsSent: 8, shortlistedCount: 3, hiredCount: 1 },
  },
  {
    handle: 'carlos.sala', name: 'Carlos Ruiz', email: 'carlos@example.com', profileImageUrl: '',
    city: 'Barcelona', bio: 'Camarero profesional, 8 años. Nivel alto de inglés, experiencia en hoteles 5*.',
    availableFrom: '2026-05-01', seekingRoles: ['camarero', 'maitre'], experienceYears: 8,
    workHistory: [
      { id: 'we-3', restaurantName: 'Hotel Colón', role: 'camarero', startMonth: '2021-06', endMonth: null, verified: false },
      { id: 'we-4', restaurantName: 'Mercat Sant Pau', role: 'camarero', startMonth: '2018-01', endMonth: '2021-05', verified: true, verifiedByStoreId: 'store-mercatsp', verifiedByStoreName: 'Mercat Sant Pau', verifiedAt: '2024-10-03' },
      { id: 'we-3b', restaurantName: 'Sunset Rooftop', role: 'camarero', startMonth: '2017-04', endMonth: '2017-09', verified: true, verifiedByStoreId: 'store-5', verifiedByStoreName: 'Sunset Rooftop', verifiedAt: '2024-02-12' },
    ],
    languages: ['es', 'ca', 'en'], shiftPreferences: ['afternoon', 'night', 'weekend'],
    hoursPerWeekMin: 30, hoursPerWeekMax: 40, hourlyRateEurMin: 11, hourlyRateEurMax: 15,
    certificates: ['manipulador-alimentos', 'ingles-b2'], verifiedOverall: true, publicProfile: true,
    stats: { profileViews: 98, applicationsSent: 12, shortlistedCount: 5, hiredCount: 2 },
  },
  {
    handle: 'ana.barman', name: 'Ana López', email: 'ana@example.com', profileImageUrl: '',
    city: 'Madrid', bio: 'Barman con especialización en coctelería. Nivel 2 IBA.',
    availableFrom: '2026-04-22', seekingRoles: ['barman', 'sumiller'], experienceYears: 4,
    workHistory: [
      { id: 'we-5', restaurantName: 'Sky Bar Madrid', role: 'barman', startMonth: '2023-04', endMonth: '2025-11', verified: true, verifiedByStoreId: 'store-skybar', verifiedByStoreName: 'Sky Bar Madrid', verifiedAt: '2025-12-02' },
      { id: 'we-5b', restaurantName: 'Bar Central', role: 'barman', startMonth: '2022-01', endMonth: '2023-03', verified: true, verifiedByStoreId: 'store-3', verifiedByStoreName: 'Bar Central', verifiedAt: '2023-04-08' },
    ],
    languages: ['es', 'en', 'fr'], shiftPreferences: ['night', 'weekend'],
    hoursPerWeekMin: 20, hoursPerWeekMax: 35, hourlyRateEurMin: 13, hourlyRateEurMax: 18,
    certificates: ['coctelería', 'manipulador-alimentos'], verifiedOverall: true, publicProfile: true,
    stats: { profileViews: 210, applicationsSent: 6, shortlistedCount: 4, hiredCount: 1 },
  },
  {
    handle: 'jorge.chef', name: 'Jorge Méndez', email: 'jorge@example.com', profileImageUrl: '',
    city: 'Valencia', bio: 'Jefe de cocina, 12 años. Especialidad en arroces y producto local.',
    availableFrom: '2026-06-01', seekingRoles: ['jefe-cocina', 'segundo'], experienceYears: 12,
    workHistory: [
      { id: 'we-6', restaurantName: 'Arroz y Fuego', role: 'jefe-cocina', startMonth: '2019-02', endMonth: null, verified: false },
    ],
    languages: ['es', 'en'], shiftPreferences: ['morning', 'afternoon'],
    hoursPerWeekMin: 40, hoursPerWeekMax: 50, hourlyRateEurMin: 18, hourlyRateEurMax: 25,
    certificates: ['manipulador-alimentos', 'alergenos', 'prl'], verifiedOverall: false, publicProfile: true,
    stats: { profileViews: 78, applicationsSent: 2, shortlistedCount: 1, hiredCount: 0 },
  },
  {
    handle: 'laura.host', name: 'Laura Torres', email: 'laura@example.com', profileImageUrl: '',
    city: 'Sevilla', bio: 'Host y recepción. Manejo de Cover Manager y TheFork. Inglés y portugués.',
    availableFrom: '2026-04-28', seekingRoles: ['host', 'camarero'], experienceYears: 3,
    workHistory: [
      { id: 'we-7', restaurantName: 'El Rinconcillo', role: 'host', startMonth: '2023-01', endMonth: null, verified: true, verifiedByStoreId: 'store-rinconcillo', verifiedByStoreName: 'El Rinconcillo', verifiedAt: '2025-06-12' },
    ],
    languages: ['es', 'en', 'pt'], shiftPreferences: ['afternoon', 'night', 'weekend'],
    hoursPerWeekMin: 25, hoursPerWeekMax: 40, hourlyRateEurMin: 10, hourlyRateEurMax: 13,
    certificates: ['ingles-b2'], verifiedOverall: true, publicProfile: true,
    stats: { profileViews: 56, applicationsSent: 4, shortlistedCount: 2, hiredCount: 0 },
  },
  {
    handle: 'diego.ayudante', name: 'Diego Santos', email: 'diego@example.com', profileImageUrl: '',
    city: 'Madrid', bio: 'Recién graduado de escuela de hostelería. Muchas ganas de aprender.',
    availableFrom: '2026-04-21', seekingRoles: ['ayudante-cocina', 'office'], experienceYears: 0,
    workHistory: [],
    languages: ['es'], shiftPreferences: ['morning', 'afternoon', 'night', 'weekend'],
    hoursPerWeekMin: 20, hoursPerWeekMax: 40, hourlyRateEurMin: 8.5, hourlyRateEurMax: 11,
    certificates: ['manipulador-alimentos'], verifiedOverall: false, publicProfile: true,
    stats: { profileViews: 22, applicationsSent: 1, shortlistedCount: 0, hiredCount: 0 },
  },
]

// Mock job postings — used as professional-side search results
const mockJobPostings: JobPosting[] = [
  {
    id: 'jp-1', storeId: 'store-1', storeName: 'Pau Artiso · Demo Store', storeLogoUrl: '/images/logo-guavagram-color.png',
    storeCity: 'Madrid', title: 'Camarero/a fin de semana', role: 'camarero',
    description: 'Buscamos incorporar camarero/a para viernes noche + sábado + domingo. Ambiente familiar, turnos de 8h, propinas compartidas. Imprescindible actitud y experiencia mínima 1 año.',
    contractType: 'temporal', shifts: ['afternoon', 'night', 'weekend'], hoursPerWeek: 24,
    hourlyRateEur: 12, requiredExperienceYears: 1, requiredCertificates: ['manipulador-alimentos'],
    languagesRequired: ['es'], postedAt: '2026-04-15', expiresAt: '2026-05-15', status: 'active',
    applicationsCount: 8, viewsCount: 124,
  },
  {
    id: 'jp-2', storeId: 'store-2', storeName: 'Casa Verde', storeLogoUrl: '',
    storeCity: 'Madrid', title: 'Jefe de cocina', role: 'jefe-cocina',
    description: 'Restaurante de mediterránea moderna busca jefe/a de cocina con experiencia demostrable (5+ años). Libertad creativa en la carta.',
    contractType: 'indefinido', shifts: ['afternoon', 'night'], hoursPerWeek: 40,
    monthlySalaryEur: 2800, requiredExperienceYears: 5, requiredCertificates: ['manipulador-alimentos', 'alergenos'],
    languagesRequired: ['es'], postedAt: '2026-04-10', expiresAt: '2026-05-10', status: 'active',
    applicationsCount: 14, viewsCount: 280, boosted: true,
  },
  {
    id: 'jp-3', storeId: 'store-3', storeName: 'Bar Central', storeLogoUrl: '',
    storeCity: 'Madrid', title: 'Barman nocturno', role: 'barman',
    description: 'Coctelería clásica y moderna. Turno de 20h a 3h, 4 noches a la semana. Ambiente dinámico.',
    contractType: 'indefinido', shifts: ['night'], hoursPerWeek: 32,
    hourlyRateEur: 14, requiredExperienceYears: 2, requiredCertificates: ['coctelería'],
    languagesRequired: ['es', 'en'], postedAt: '2026-04-12', expiresAt: '2026-05-12', status: 'active',
    applicationsCount: 6, viewsCount: 89,
  },
  {
    id: 'jp-4', storeId: 'store-1', storeName: 'Pau Artiso · Demo Store', storeLogoUrl: '/images/logo-guavagram-color.png',
    storeCity: 'Madrid', title: 'Ayudante de cocina sin experiencia', role: 'ayudante-cocina',
    description: 'Buscamos persona con ganas de aprender. No necesaria experiencia previa, formamos. Turno de mediodía, lunes a viernes.',
    contractType: 'indefinido', shifts: ['morning', 'afternoon'], hoursPerWeek: 30,
    hourlyRateEur: 9.5, requiredExperienceYears: 0, requiredCertificates: ['manipulador-alimentos'],
    languagesRequired: ['es'], postedAt: '2026-04-18', expiresAt: '2026-05-18', status: 'active',
    applicationsCount: 3, viewsCount: 42,
  },
  {
    id: 'jp-5', storeId: 'store-4', storeName: 'La Trattoria', storeLogoUrl: '',
    storeCity: 'Barcelona', title: 'Maître sala principal', role: 'maitre',
    description: 'Restaurante italiano premium busca maître con experiencia en gestión de equipos de 8+ personas. Indefinido + variable.',
    contractType: 'indefinido', shifts: ['afternoon', 'night'], hoursPerWeek: 42,
    monthlySalaryEur: 2400, requiredExperienceYears: 4, requiredCertificates: ['ingles-b2'],
    languagesRequired: ['es', 'en'], postedAt: '2026-04-08', expiresAt: '2026-05-08', status: 'active',
    applicationsCount: 11, viewsCount: 198,
  },
  {
    id: 'jp-6', storeId: 'store-5', storeName: 'Sunset Rooftop', storeLogoUrl: '',
    storeCity: 'Málaga', title: 'Extra eventos fin de semana', role: 'camarero',
    description: 'Eventos privados los sábados de temporada. Pago extra por evento, 10h por evento.',
    contractType: 'extra', shifts: ['weekend'], hoursPerWeek: 10,
    hourlyRateEur: 13, requiredExperienceYears: 1, requiredCertificates: [],
    languagesRequired: ['es', 'en'], postedAt: '2026-04-17', expiresAt: '2026-07-17', status: 'active',
    applicationsCount: 22, viewsCount: 345,
  },
  {
    id: 'jp-7', storeId: 'store-1', storeName: 'Pau Artiso · Demo Store', storeLogoUrl: '/images/logo-guavagram-color.png',
    storeCity: 'Madrid', title: 'Host / recibidor', role: 'host',
    description: 'Recepción y gestión de reservas. Uso de TheFork + CoverManager. Turno de mediodía y noche.',
    contractType: 'indefinido', shifts: ['afternoon', 'night'], hoursPerWeek: 35,
    hourlyRateEur: 11, requiredExperienceYears: 1, requiredCertificates: ['ingles-b2'],
    languagesRequired: ['es', 'en'], postedAt: '2026-04-05', expiresAt: '2026-05-05', status: 'active',
    applicationsCount: 5, viewsCount: 67,
  },
  {
    id: 'jp-8', storeId: 'store-6', storeName: 'Cafetería Norte', storeLogoUrl: '',
    storeCity: 'Valencia', title: 'Barista mañanas', role: 'barista',
    description: 'Especialidad en café de filtro y latte art. Turno 7h-15h.',
    contractType: 'indefinido', shifts: ['morning'], hoursPerWeek: 40,
    hourlyRateEur: 10.5, requiredExperienceYears: 1, requiredCertificates: ['barista-nivel-2'],
    languagesRequired: ['es'], postedAt: '2026-04-14', expiresAt: '2026-05-14', status: 'active',
    applicationsCount: 4, viewsCount: 71,
  },
]

// Mock applications for MyApplicationsPanel (as the professional viewing)
const mockMyApplications: JobApplication[] = [
  {
    id: 'ja-1', jobPostingId: 'jp-2', jobTitle: 'Jefe de cocina', jobRole: 'jefe-cocina',
    storeName: 'Casa Verde', storeLogoUrl: '',
    professionalHandle: 'tu-perfil', professionalName: 'Tú',
    professionalImageUrl: '', professionalCity: 'Madrid',
    professionalExperienceYears: 5, professionalVerifiedOverall: true,
    coverNote: 'Llevo 7 años en cocina mediterránea y me interesa mucho la libertad creativa que ofrecéis.',
    appliedAt: '2026-04-16', status: 'shortlisted',
    responseNote: '¡Nos ha gustado mucho tu perfil! Te llamamos esta semana para una entrevista.',
    respondedAt: '2026-04-18',
  },
  {
    id: 'ja-2', jobPostingId: 'jp-3', jobTitle: 'Barman nocturno', jobRole: 'barman',
    storeName: 'Bar Central', storeLogoUrl: '',
    professionalHandle: 'tu-perfil', professionalName: 'Tú',
    professionalImageUrl: '', professionalCity: 'Madrid',
    professionalExperienceYears: 5, professionalVerifiedOverall: true,
    coverNote: 'Vuestra carta de cócteles es referencia. Me encantaría formar parte.',
    appliedAt: '2026-04-14', status: 'seen',
  },
  {
    id: 'ja-3', jobPostingId: 'jp-5', jobTitle: 'Maître sala principal', jobRole: 'maitre',
    storeName: 'La Trattoria', storeLogoUrl: '',
    professionalHandle: 'tu-perfil', professionalName: 'Tú',
    professionalImageUrl: '', professionalCity: 'Madrid',
    professionalExperienceYears: 5, professionalVerifiedOverall: true,
    coverNote: 'Tengo experiencia gestionando equipos de sala y me gustaría dar el salto a Barcelona.',
    appliedAt: '2026-04-10', status: 'pending',
  },
  {
    id: 'ja-4', jobPostingId: 'jp-1', jobTitle: 'Camarero/a fin de semana', jobRole: 'camarero',
    storeName: 'Pau Artiso · Demo Store', storeLogoUrl: '/images/logo-guavagram-color.png',
    professionalHandle: 'tu-perfil', professionalName: 'Tú',
    professionalImageUrl: '', professionalCity: 'Madrid',
    professionalExperienceYears: 5, professionalVerifiedOverall: true,
    coverNote: 'Disponibilidad total los findes. Vivo a 10 min en metro.',
    appliedAt: '2026-04-11', status: 'rejected',
    responseNote: 'Gracias por aplicar. Hemos cubierto el puesto con otra candidatura.',
    respondedAt: '2026-04-15',
  },
]

// Mock applications for a specific job posting (restaurant-side view)
const mockApplicationsByJob: Record<string, JobApplication[]> = {
  'jp-1': [
    {
      id: 'ja-r1', jobPostingId: 'jp-1', jobTitle: 'Camarero/a fin de semana', jobRole: 'camarero',
      storeName: 'Pau Artiso · Demo Store', storeLogoUrl: '/images/logo-guavagram-color.png',
      professionalHandle: 'carlos.sala', professionalName: 'Carlos Ruiz',
      professionalImageUrl: '', professionalCity: 'Madrid',
      professionalExperienceYears: 8, professionalVerifiedOverall: true,
      coverNote: 'Tengo 8 años de experiencia en sala, libre los findes.',
      appliedAt: '2026-04-16', status: 'shortlisted',
    },
    {
      id: 'ja-r2', jobPostingId: 'jp-1', jobTitle: 'Camarero/a fin de semana', jobRole: 'camarero',
      storeName: 'Pau Artiso · Demo Store', storeLogoUrl: '/images/logo-guavagram-color.png',
      professionalHandle: 'laura.host', professionalName: 'Laura Torres',
      professionalImageUrl: '', professionalCity: 'Madrid',
      professionalExperienceYears: 3, professionalVerifiedOverall: true,
      coverNote: 'Host con 3 años de experiencia, también manejo sala.',
      appliedAt: '2026-04-17', status: 'pending',
    },
    {
      id: 'ja-r3', jobPostingId: 'jp-1', jobTitle: 'Camarero/a fin de semana', jobRole: 'camarero',
      storeName: 'Pau Artiso · Demo Store', storeLogoUrl: '/images/logo-guavagram-color.png',
      professionalHandle: 'diego.ayudante', professionalName: 'Diego Santos',
      professionalImageUrl: '', professionalCity: 'Madrid',
      professionalExperienceYears: 0, professionalVerifiedOverall: false,
      coverNote: 'Recién graduado de escuela, disponibilidad total.',
      appliedAt: '2026-04-18', status: 'pending',
    },
  ],
}

// Mock verification inbox for restaurants
const mockVerificationRequests: WorkVerificationRequest[] = [
  {
    id: 'wvr-1', professionalHandle: 'diego.ayudante', professionalName: 'Diego Santos', professionalImageUrl: '',
    workExperienceId: 'we-claim-1', claimedRole: 'office', claimedStartMonth: '2024-06', claimedEndMonth: '2024-12',
    targetStoreId: 'store-1', targetStoreName: 'Pau Artiso · Demo Store', targetStoreLogoUrl: '/images/logo-guavagram-color.png',
    requestedAt: '2026-04-18', status: 'pending',
  },
  {
    id: 'wvr-2', professionalHandle: 'ana.barman', professionalName: 'Ana López', professionalImageUrl: '',
    workExperienceId: 'we-claim-2', claimedRole: 'barman', claimedStartMonth: '2024-02', claimedEndMonth: '2025-03',
    targetStoreId: 'store-1', targetStoreName: 'Pau Artiso · Demo Store', targetStoreLogoUrl: '/images/logo-guavagram-color.png',
    requestedAt: '2026-04-16', status: 'pending',
  },
]

// Mock profile of the logged-in professional ("yo") — drives % match scoring
const mockMyProfile: ProfessionalProfile = {
  handle: 'tu-perfil', name: 'Tú', email: 'tu@example.com', profileImageUrl: '',
  city: 'Madrid', bio: 'Sala con 4 años. Disponibilidad tardes y noches entre semana.',
  availableFrom: '2026-04-25', seekingRoles: ['camarero', 'maitre'], experienceYears: 4,
  workHistory: [
    { id: 'we-me-1', restaurantName: 'Mesón El Olivo', role: 'camarero', startMonth: '2022-03', endMonth: null, verified: true, verifiedByStoreId: 'store-elolivo', verifiedByStoreName: 'Mesón El Olivo', verifiedAt: '2025-09-10' },
  ],
  languages: ['es'], shiftPreferences: ['afternoon', 'night'],
  hoursPerWeekMin: 25, hoursPerWeekMax: 40, hourlyRateEurMin: 11, hourlyRateEurMax: 14,
  certificates: ['manipulador-alimentos'], verifiedOverall: true, publicProfile: true,
  stats: { profileViews: 0, applicationsSent: 4, shortlistedCount: 1, hiredCount: 0 },
}

// ─── Singleton reactive stores ────────────────────────────────────
const professionalsRef   = ref<ProfessionalProfile[]>(mockProfessionals)
const jobPostingsRef     = ref<JobPosting[]>(mockJobPostings)
const myApplicationsRef  = ref<JobApplication[]>(mockMyApplications)
const applicationsByJobRef = ref<Record<string, JobApplication[]>>(mockApplicationsByJob)
const verificationInboxRef = ref<WorkVerificationRequest[]>(mockVerificationRequests)
const myProfileRef       = ref<ProfessionalProfile>(mockMyProfile)
const savedJobIdsRef     = ref<Set<string>>(new Set(['jp-2', 'jp-5']))

export function useProfessionalMocks() {
  return {
    professionals: professionalsRef,
    jobPostings: jobPostingsRef,
    myApplications: myApplicationsRef,
    applicationsByJob: applicationsByJobRef,
    verificationInbox: verificationInboxRef,
    myProfile: myProfileRef,
    savedJobIds: savedJobIdsRef,
  }
}

export function toggleSavedJob(jobId: string) {
  const next = new Set(savedJobIdsRef.value)
  if (next.has(jobId)) next.delete(jobId)
  else next.add(jobId)
  savedJobIdsRef.value = next
}
