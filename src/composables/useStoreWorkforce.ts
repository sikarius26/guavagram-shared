import type { ProfessionalProfile } from '~/services/apis/models/professional-profile-view-model'

export interface StoreWorkforce {
  total: number
  verified: number
  currentlyThere: number
  professionals: { handle: string; name: string; verified: boolean; current: boolean }[]
}

const norm = (s: string) => s.trim().toLowerCase()

export function getStoreWorkforce(storeName: string, professionals: ProfessionalProfile[]): StoreWorkforce {
  const target = norm(storeName)
  const matched: StoreWorkforce['professionals'] = []
  let verified = 0
  let currentlyThere = 0

  for (const p of professionals) {
    const entry = p.workHistory.find(w => norm(w.restaurantName) === target)
    if (!entry) continue
    const current = entry.endMonth === null
    matched.push({ handle: p.handle, name: p.name, verified: entry.verified, current })
    if (entry.verified) verified++
    if (current) currentlyThere++
  }

  return {
    total: matched.length,
    verified,
    currentlyThere,
    professionals: matched,
  }
}
