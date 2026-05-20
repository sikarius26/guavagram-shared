import { mulberry32, pick, randomInt, daysAgoISO, HANDLES, CITIES, fullName } from './_seed'
import type { AdminNetworkNode, AffiliateTier, AdminNetworkTreeKpis } from '~/services/admin/types/admin-network-node'

const rand = mulberry32(99)

// Build a flat list first, then nest by parentId
const FLAT: AdminNetworkNode[] = []

// Root: platform (virtual)
const ROOT_ID = 'root'

function tierFromEarnings(life: number): AffiliateTier {
  if (life > 5000) return 'gold'
  if (life > 1500) return 'silver'
  return 'bronze'
}

function createNode(id: string, parentId: string | null, depth: number): AdminNetworkNode {
  const suspicious = rand() > 0.93 ? Math.round(rand() * 100) / 100 : Math.round(rand() * 60) / 100
  const life = randomInt(rand, 0, 12000)
  const handle = pick(rand, HANDLES) + randomInt(rand, 10, 9999)
  return {
    userId: id,
    handle,
    displayName: fullName(rand),
    tier: tierFromEarnings(life),
    city: pick(rand, CITIES),
    earnings30dEur: randomInt(rand, 0, 1800),
    earningsLifetimeEur: life,
    gpLifetime: randomInt(rand, 100, 40000),
    downlineDirectCount: 0,
    downlineTotalCount: 0,
    joinedAt: daysAgoISO(randomInt(rand, 10 + depth * 30, 300 + depth * 60)),
    lastActiveAt: daysAgoISO(randomInt(rand, 0, 60)),
    suspiciousScore: Math.max(0, Math.min(1, suspicious > 0.6 ? suspicious : suspicious * 0.4)),
    parentId,
  }
}

function buildLevel(parents: string[], size: number, depth: number): string[] {
  const created: string[] = []
  for (const pid of parents) {
    const childCount = depth === 1 ? randomInt(rand, 4, 9) : randomInt(rand, 0, 4)
    for (let c = 0; c < childCount; c++) {
      const id = `nod_${FLAT.length + 1}`
      FLAT.push(createNode(id, pid, depth))
      created.push(id)
      if (FLAT.length >= size) return created
    }
  }
  return created
}

// Seed top-level leaders
const TOP_LEADERS = Array.from({ length: 8 }, (_, i) => {
  const id = `top_${i}`
  const node = createNode(id, ROOT_ID, 0)
  // Top leaders tend to be verified gold
  node.tier = 'gold'
  node.earningsLifetimeEur = randomInt(rand, 6000, 18000)
  node.earnings30dEur = randomInt(rand, 400, 2200)
  node.suspiciousScore = 0
  FLAT.push(node)
  return id
})

let current = TOP_LEADERS
for (let d = 1; d <= 3; d++) {
  if (FLAT.length > 200) break
  current = buildLevel(current, 200, d)
  if (current.length === 0) break
}

// Compute downline counts
function subtreeSize(id: string, cache = new Map<string, number>()): number {
  if (cache.has(id)) return cache.get(id)!
  const children = FLAT.filter(n => n.parentId === id)
  let total = children.length
  for (const c of children) total += subtreeSize(c.userId, cache)
  cache.set(id, total)
  return total
}
const cache = new Map<string, number>()
for (const n of FLAT) {
  n.downlineDirectCount = FLAT.filter(x => x.parentId === n.userId).length
  n.downlineTotalCount = subtreeSize(n.userId, cache)
}

// Build tree structure by nesting children under each node
function toTree(id: string): AdminNetworkNode | null {
  const node = FLAT.find(n => n.userId === id)
  if (!node) return null
  const children = FLAT
    .filter(n => n.parentId === id)
    .map(n => toTree(n.userId)!)
  return { ...node, children }
}

export function getNetworkRoot(): AdminNetworkNode {
  return {
    userId: ROOT_ID,
    handle: 'guavagram',
    displayName: 'Plataforma Guavagram',
    tier: 'gold',
    earnings30dEur: FLAT.reduce((s, n) => s + n.earnings30dEur, 0),
    earningsLifetimeEur: FLAT.reduce((s, n) => s + n.earningsLifetimeEur, 0),
    gpLifetime: FLAT.reduce((s, n) => s + n.gpLifetime, 0),
    downlineDirectCount: TOP_LEADERS.length,
    downlineTotalCount: FLAT.length,
    joinedAt: daysAgoISO(900),
    suspiciousScore: 0,
    parentId: null,
    children: TOP_LEADERS.map(id => toTree(id)!).filter(Boolean),
  }
}

export function getNetworkNode(userId: string): AdminNetworkNode | null {
  if (userId === ROOT_ID) return getNetworkRoot()
  return toTree(userId)
}

export function getNetworkKpis(): AdminNetworkTreeKpis {
  const flagged = FLAT.filter(n => n.suspiciousScore > 0.6).length
  const depths: number[] = []
  for (const n of FLAT) {
    let d = 0
    let cur: string | null = n.parentId
    while (cur && cur !== ROOT_ID) {
      const p = FLAT.find(x => x.userId === cur)
      if (!p) break
      cur = p.parentId
      d++
    }
    depths.push(d)
  }
  return {
    totalNodes: FLAT.length,
    activeLast30d: FLAT.filter(n => n.lastActiveAt && (Date.now() - new Date(n.lastActiveAt).getTime()) < 30 * 864e5).length,
    avgDepth: depths.length ? Math.round((depths.reduce((s, d) => s + d, 0) / depths.length) * 10) / 10 : 0,
    maxDepth: depths.length ? Math.max(...depths) : 0,
    fraudFlagged: flagged,
    totalEarningsEur: FLAT.reduce((s, n) => s + n.earningsLifetimeEur, 0),
  }
}
