import { mulberry32, pick, randomInt, daysAgoISO, fullName, emailFor, CITIES, HANDLES, CATEGORIES } from './_seed'

export interface AdminCreatorRow {
  id: string
  name: string
  handle: string
  email: string
  avatarUrl?: string
  city: string
  category: string
  verified: boolean
  cardVerified: boolean
  earnings30dEur: number
  earningsLifetimeEur: number
  // Breakdown by level (Guavagram 3-level model)
  earningsByLevel: { l1: number; l2: number; l3: number }
  restaurantsL1: number
  restaurantsL2: number
  restaurantsL3: number
  campaignsCount: number
  contactsBrought: number
  rating: number
  joinedAt: string
  lastActiveAt: string
  status: 'active' | 'suspended'
  stripeConnected: boolean
  tier: 'bronze' | 'silver' | 'gold'
}

const rand = mulberry32(33)

const CREATORS: AdminCreatorRow[] = Array.from({ length: 60 }, (_, i) => {
  const name = fullName(rand)
  const handle = pick(rand, HANDLES) + (i > 19 ? String(i) : '')
  const contacts = randomInt(rand, 0, 280)
  const verified = contacts >= 100
  const life = verified ? randomInt(rand, 600, 12_800) : randomInt(rand, 0, 400)
  const l1 = Math.round(life * (0.55 + rand() * 0.15))
  const l2 = Math.round(life * (0.20 + rand() * 0.10))
  const l3 = Math.max(0, life - l1 - l2)
  return {
    id: `cre_${String(i).padStart(3, '0')}`,
    name,
    handle,
    email: emailFor(name),
    city: pick(rand, CITIES),
    category: pick(rand, CATEGORIES),
    verified,
    cardVerified: verified && rand() > 0.35,
    earnings30dEur: verified ? randomInt(rand, 40, 1_800) : randomInt(rand, 0, 80),
    earningsLifetimeEur: life,
    earningsByLevel: { l1, l2, l3 },
    restaurantsL1: verified ? randomInt(rand, 1, 12) : 0,
    restaurantsL2: verified ? randomInt(rand, 0, 28) : 0,
    restaurantsL3: verified ? randomInt(rand, 0, 54) : 0,
    campaignsCount: verified ? randomInt(rand, 3, 42) : randomInt(rand, 0, 3),
    contactsBrought: contacts,
    rating: Math.round((4 + rand()) * 10) / 10,
    joinedAt: daysAgoISO(randomInt(rand, 10, 720)),
    lastActiveAt: daysAgoISO(randomInt(rand, 0, 30)),
    status: rand() > 0.97 ? 'suspended' : 'active',
    stripeConnected: verified && rand() > 0.15,
    tier: life > 5000 ? 'gold' : life > 1500 ? 'silver' : 'bronze',
  }
})

export function getCreators(): AdminCreatorRow[] { return CREATORS }
export function getCreatorById(id: string): AdminCreatorRow | null { return CREATORS.find(c => c.id === id) ?? null }
