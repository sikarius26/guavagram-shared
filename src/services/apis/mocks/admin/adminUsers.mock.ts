import { mulberry32, pick, randomInt, daysAgoISO, fullName, emailFor, CITIES, HANDLES } from './_seed'

export interface AdminUserRow {
  id: string
  name: string
  handle: string
  email: string
  city: string
  avatarUrl?: string
  verified: boolean
  affiliate: boolean
  gpBalance: number
  gpLifetime: number
  reviewsCount: number
  createdAt: string
  lastActiveAt: string
  status: 'active' | 'suspended'
  referralCount: number
}

const rand = mulberry32(22)

const USERS: AdminUserRow[] = Array.from({ length: 120 }, (_, i) => {
  const name = fullName(rand)
  const handle = pick(rand, HANDLES) + (i > 19 ? String(i) : '')
  const verified = rand() > 0.55
  return {
    id: `usr_${String(i).padStart(3, '0')}`,
    name,
    handle,
    email: emailFor(name),
    city: pick(rand, CITIES),
    verified,
    affiliate: verified,
    gpBalance: randomInt(rand, 0, 9_800),
    gpLifetime: randomInt(rand, 100, 45_000),
    reviewsCount: randomInt(rand, 0, 42),
    createdAt: daysAgoISO(randomInt(rand, 5, 600)),
    lastActiveAt: daysAgoISO(randomInt(rand, 0, 45)),
    status: rand() > 0.95 ? 'suspended' : 'active',
    referralCount: randomInt(rand, 0, 18),
  }
})

export function getUsers(): AdminUserRow[] { return USERS }
export function getUserById(id: string): AdminUserRow | null { return USERS.find(u => u.id === id) ?? null }
