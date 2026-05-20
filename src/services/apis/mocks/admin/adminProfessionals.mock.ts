import { mulberry32, pick, randomInt, daysAgoISO, fullName, emailFor, CITIES } from './_seed'

export interface AdminProfessionalRow {
  id: string
  name: string
  email: string
  city: string
  role: string
  yearsExperience: number
  applicationsCount: number
  hiredCount: number
  avgTimeToHireDays?: number
  joinedAt: string
  lastActiveAt: string
  status: 'active' | 'suspended'
}

const rand = mulberry32(44)
const ROLES = ['Camarero/a', 'Cocinero/a', 'Jefe de cocina', 'Ayudante cocina', 'Barista', 'Sumiller', 'Maître', 'Pastelero/a', 'Pizzero/a', 'Bartender']

const PROS: AdminProfessionalRow[] = Array.from({ length: 45 }, (_, i) => {
  const name = fullName(rand)
  const hired = randomInt(rand, 0, 4)
  return {
    id: `pro_${String(i).padStart(3, '0')}`,
    name,
    email: emailFor(name),
    city: pick(rand, CITIES),
    role: pick(rand, ROLES),
    yearsExperience: randomInt(rand, 0, 15),
    applicationsCount: randomInt(rand, 1, 28),
    hiredCount: hired,
    avgTimeToHireDays: hired > 0 ? randomInt(rand, 3, 28) : undefined,
    joinedAt: daysAgoISO(randomInt(rand, 10, 400)),
    lastActiveAt: daysAgoISO(randomInt(rand, 0, 15)),
    status: 'active',
  }
})

export function getProfessionals(): AdminProfessionalRow[] { return PROS }
export function getProfessionalById(id: string): AdminProfessionalRow | null { return PROS.find(p => p.id === id) ?? null }
