import { ref, computed, type Ref } from 'vue'

// Shared loyalty-card configuration store. Dashboard's FidelizacionPanel
// writes here; the public menu's Sidebar teaser reads from here. Backed
// by `/api/_mock/store/<slug>/loyalty-config` (Nuxt Nitro mock in dev,
// real Guava API later) so dashboard ↔ public sync survives the process
// boundary once admin lives in a separate Nuxt app (`guavagram-admin/`).

export type LoyaltyRewardType =
  | 'free_item'
  | 'discount_pct'
  | 'discount_fixed'
  | 'free_drink'
  | 'free_dessert'
  | 'free_meal'
  | 'surprise'

export interface LoyaltyReward {
  visitNumber: number
  rewardType: LoyaltyRewardType
  rewardLabel: string
  rewardValue: string
  icon: string
}

export interface LoyaltyConfig {
  isActive: boolean
  cardName: string
  totalVisits: number
  rewards: LoyaltyReward[]
  cardColor: string
  cardAccent: string
  autoCheckin: boolean
  checkinMethod: 'qr' | 'nfc' | 'manual' | 'auto_order'
  showInBio: boolean
  showInMenu: boolean
  expirationDays: number
}

const API_PREFIX = '/api/_mock/store'

const defaults = (): LoyaltyConfig => ({
  isActive: true,
  cardName: 'Tarjeta de fidelización',
  totalVisits: 10,
  rewards: [
    { visitNumber: 3,  rewardType: 'free_drink',   rewardLabel: 'Bebida gratis',   rewardValue: 'Cualquier bebida', icon: 'mdi-cup-outline' },
    { visitNumber: 5,  rewardType: 'discount_pct', rewardLabel: '10% descuento',   rewardValue: '10%',              icon: 'mdi-percent-outline' },
    { visitNumber: 7,  rewardType: 'free_dessert', rewardLabel: 'Postre gratis',   rewardValue: 'Cualquier postre', icon: 'mdi-cupcake' },
    { visitNumber: 10, rewardType: 'free_meal',    rewardLabel: 'Comida gratis',   rewardValue: 'Plato principal',  icon: 'mdi-silverware-fork-knife' },
  ],
  cardColor: '#1a1c1b',
  cardAccent: '#f59e0b',
  autoCheckin: false,
  checkinMethod: 'qr',
  showInBio: true,
  showInMenu: true,
  expirationDays: 90,
})

// Module-scoped per-slug cache. Hydrates lazily on first access (client-only)
// and PUT-debounces writes the same way `useBioConfig` does.
const store = ref<Record<string, LoyaltyConfig>>({})
const hydrating = new Set<string>()
const pushTimers: Record<string, ReturnType<typeof setTimeout> | null> = {}

async function hydrate(slug: string) {
  if (typeof window === 'undefined') return
  if (hydrating.has(slug) || store.value[slug]) return
  hydrating.add(slug)
  try {
    const res = await fetch(`${API_PREFIX}/${encodeURIComponent(slug)}/loyalty-config`)
    if (res.ok) {
      const data = await res.json().catch(() => null)
      if (data) store.value = { ...store.value, [slug]: { ...defaults(), ...data } }
    }
  } catch { /* network failure → defaults */ }
  finally { hydrating.delete(slug) }
}

function schedulePush(slug: string) {
  if (typeof window === 'undefined') return
  if (pushTimers[slug]) clearTimeout(pushTimers[slug]!)
  pushTimers[slug] = setTimeout(() => {
    const body = store.value[slug]
    if (!body) return
    fetch(`${API_PREFIX}/${encodeURIComponent(slug)}/loyalty-config`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => {})
  }, 300)
}

function keyFor(slugOrStoreId: string): string {
  return slugOrStoreId || '__default__'
}

export function useLoyaltyConfig(slugRef: Ref<string | null | undefined> | string) {
  const getKey = (): string => {
    const v = typeof slugRef === 'string' ? slugRef : slugRef.value
    return keyFor(v || '')
  }

  hydrate(getKey())

  const config = computed<LoyaltyConfig>({
    get: () => store.value[getKey()] ?? defaults(),
    set: (next: LoyaltyConfig) => {
      const k = getKey()
      store.value = { ...store.value, [k]: next }
      schedulePush(k)
    },
  })

  const updateConfig = (patch: Partial<LoyaltyConfig>) => {
    const current = config.value
    config.value = { ...current, ...patch }
  }

  // The "final reward" — the one at totalVisits. Drives the teaser headline.
  const finalReward = computed<LoyaltyReward | undefined>(() => {
    const cfg = config.value
    return cfg.rewards.find(r => r.visitNumber === cfg.totalVisits)
      ?? cfg.rewards.slice().sort((a, b) => b.visitNumber - a.visitNumber)[0]
  })

  return { config, updateConfig, finalReward }
}
