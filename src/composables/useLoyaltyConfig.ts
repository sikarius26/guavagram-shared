import { ref, computed, type Ref } from 'vue'

// Shared loyalty-card configuration store. Dashboard's FidelizacionPanel writes
// here; the public menu's Sidebar teaser reads from here. Persisted to
// localStorage per slug while the backend endpoint is wired up, so refreshing
// the page (or switching between dashboard and public preview) keeps the same
// state — same pattern as `useMenuPrefs`.

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

const LS_KEY = 'guava:loyalty-config'

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

function loadAll(): Record<string, LoyaltyConfig> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveAll(all: Record<string, LoyaltyConfig>) {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(LS_KEY, JSON.stringify(all)) } catch { /* ignore */ }
}

// Module-level store so dashboard + sidebar share the same source of truth
// inside one tab session.
const store = ref<Record<string, LoyaltyConfig>>(loadAll())

function keyFor(slugOrStoreId: string): string {
  return slugOrStoreId || '__default__'
}

export function useLoyaltyConfig(slugRef: Ref<string | null | undefined> | string) {
  const getKey = (): string => {
    const v = typeof slugRef === 'string' ? slugRef : slugRef.value
    return keyFor(v || '')
  }

  const config = computed<LoyaltyConfig>({
    get: () => store.value[getKey()] ?? defaults(),
    set: (next: LoyaltyConfig) => {
      store.value = { ...store.value, [getKey()]: next }
      saveAll(store.value)
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
