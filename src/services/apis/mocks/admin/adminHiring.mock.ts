import { mulberry32, pick, randomInt, daysAgoISO, RESTAURANT_NAMES, CITIES } from './_seed'

export type OfferStatus = 'open' | 'in_review' | 'closed' | 'canceled'

export interface AdminHiringApplication {
  id: string
  professionalId: string
  professionalName: string
  appliedAt: string
  status: 'new' | 'shortlisted' | 'rejected' | 'hired'
  yearsExperience: number
}

export interface AdminHiringOffer {
  id: string
  storeId: string
  storeName: string
  city: string
  role: string
  salaryEur: number
  status: OfferStatus
  createdAt: string
  closedAt?: string
  applicationsCount: number
  applications: AdminHiringApplication[]
  platformCommissionPct: number
  platformCommissionEur: number
}

const rand = mulberry32(55)
const ROLES = ['Camarero/a', 'Cocinero/a', 'Ayudante cocina', 'Barista', 'Sumiller', 'Pastelero/a']

const OFFERS: AdminHiringOffer[] = Array.from({ length: 24 }, (_, i) => {
  const status = pick(rand, ['open', 'open', 'open', 'in_review', 'closed', 'closed', 'canceled']) as OfferStatus
  const storeName = pick(rand, RESTAURANT_NAMES)
  const role = pick(rand, ROLES)
  const applicationsCount = status === 'open' ? randomInt(rand, 2, 14) : randomInt(rand, 5, 22)
  const salary = randomInt(rand, 18_000, 32_000)
  const pct = 8 + randomInt(rand, 0, 4)
  return {
    id: `off_${String(i).padStart(3, '0')}`,
    storeId: `sto_${i % 20}`,
    storeName,
    city: pick(rand, CITIES),
    role,
    salaryEur: salary,
    status,
    createdAt: daysAgoISO(randomInt(rand, 2, 90)),
    closedAt: status === 'closed' ? daysAgoISO(randomInt(rand, 0, 30)) : undefined,
    applicationsCount,
    applications: Array.from({ length: applicationsCount }, (_, j) => ({
      id: `app_${i}_${j}`,
      professionalId: `pro_${String(randomInt(rand, 0, 44)).padStart(3, '0')}`,
      professionalName: ['Laura Sanz', 'Miguel Ortega', 'Beatriz Ríos', 'Samuel Pinto', 'Nerea Vega'][j % 5]!,
      appliedAt: daysAgoISO(randomInt(rand, 0, 30)),
      status: pick(rand, ['new', 'new', 'shortlisted', 'rejected', j === 0 && status === 'closed' ? 'hired' : 'new']) as any,
      yearsExperience: randomInt(rand, 0, 12),
    })),
    platformCommissionPct: pct,
    platformCommissionEur: status === 'closed' ? Math.round((salary * pct) / 100) : 0,
  }
})

export function getOffers(): AdminHiringOffer[] { return OFFERS }
export function getOfferById(id: string): AdminHiringOffer | null { return OFFERS.find(o => o.id === id) ?? null }
