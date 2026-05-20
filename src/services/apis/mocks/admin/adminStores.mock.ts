import { mulberry32, pick, randomInt, daysAgoISO, RESTAURANT_NAMES, CITIES, slugify } from './_seed'

export type StorePlan = 'free' | 'pro' | 'guava' | 'guava_plus'
export type StoreStatus = 'active' | 'suspended' | 'churned'

export interface AdminStoreRow {
  id: string
  name: string
  slug: string
  logoUrl?: string
  city: string
  plan: StorePlan
  status: StoreStatus
  widgetInstalled: boolean
  gbpSyncStatus: 'synced' | 'stale' | 'not_linked'
  gmv30dEur: number
  createdAt: string
  lastActivityAt: string
  ownerEmail: string
  monthlyFeeEur: number
}

const rand = mulberry32(11)

const STORES: AdminStoreRow[] = RESTAURANT_NAMES.flatMap((name, i) => {
  const variants = randomInt(rand, 1, 3)
  return Array.from({ length: variants }, (_, v) => {
    const fullName = v === 0 ? name : `${name} ${v + 1}`
    const plan = pick(rand, ['free', 'pro', 'pro', 'guava', 'guava', 'guava_plus']) as StorePlan
    const status = pick(rand, ['active', 'active', 'active', 'active', 'suspended', 'churned']) as StoreStatus
    return {
      id: `sto_${i}_${v}`,
      name: fullName,
      slug: slugify(fullName),
      city: pick(rand, CITIES),
      plan,
      status,
      widgetInstalled: rand() > 0.3,
      gbpSyncStatus: pick(rand, ['synced', 'synced', 'stale', 'not_linked']) as 'synced' | 'stale' | 'not_linked',
      gmv30dEur: randomInt(rand, 400, 8_500),
      createdAt: daysAgoISO(randomInt(rand, 10, 700)),
      lastActivityAt: daysAgoISO(randomInt(rand, 0, 30)),
      ownerEmail: `contacto@${slugify(fullName)}.com`,
      monthlyFeeEur: plan === 'free' ? 0 : plan === 'pro' ? 49 : plan === 'guava' ? 89 : 149,
    }
  })
})

export function getStores(): AdminStoreRow[] {
  return STORES
}

export function getStoreById(id: string): AdminStoreRow | null {
  return STORES.find(s => s.id === id) ?? null
}
