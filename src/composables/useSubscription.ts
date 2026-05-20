import { ref, computed } from 'vue'

// ─── Types ────────────────────────────────────────────────────────────────────
export type SubscriptionPlan = 'free' | 'pro'
export type GuavaModule = 'orders' | 'bookings' | 'marketing' | 'inventory' | 'employees' | 'analytics'
export type UpgradeIntent = 'upgrade-pro' | 'verified-badge' | 'activate-module' | 'upgrade-all' | 'verify-account'

export interface SubscriptionState {
  plan: SubscriptionPlan
  verifiedBadge: boolean
  activeModules: Set<GuavaModule>
  loyaltyCardsUsed: number
}

// ─── Pricing constants ────────────────────────────────────────────────────────
export const PRICES = {
  verifiedBadge: 2,
  orders: 59,
  bookings: 79,
  marketing: 79,
  employees: 79,
} as const

const LOYALTY_LIMIT_FREE = 15   // lifetime cap
const LOYALTY_LIMIT_PRO  = 30   // per month

const STORAGE_KEY = 'guavagram.subscription.v1'

// ─── Module-level reactive state (shared across all composable calls) ─────────
const plan            = ref<SubscriptionPlan>('free')
const verifiedBadge   = ref(false)
const activeModules   = ref<Set<GuavaModule>>(new Set())
const loyaltyCardsUsed = ref(0)
const loyaltyCardsLimit = computed(() => plan.value === 'pro' ? LOYALTY_LIMIT_PRO : LOYALTY_LIMIT_FREE)

// ─── Persistence helpers (localStorage, dev only) ────────────────────────────
function saveToStorage() {
  if (!import.meta.client) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      plan: plan.value,
      verifiedBadge: verifiedBadge.value,
      activeModules: [...activeModules.value],
      loyaltyCardsUsed: loyaltyCardsUsed.value,
    }))
  } catch {}
}

function loadFromStorage() {
  if (!import.meta.client) return
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const data = JSON.parse(raw) as {
      plan: SubscriptionPlan
      verifiedBadge: boolean
      activeModules: GuavaModule[]
      loyaltyCardsUsed: number
    }
    plan.value           = data.plan ?? 'free'
    verifiedBadge.value  = data.verifiedBadge ?? false
    activeModules.value  = new Set(data.activeModules ?? [])
    loyaltyCardsUsed.value = data.loyaltyCardsUsed ?? 0
  } catch {}
}

// Hydrate on module load (client-side only)
if (import.meta.client) {
  loadFromStorage()
}

// ─── Composable ───────────────────────────────────────────────────────────────
export function useSubscription() {
  // Derived
  const isProPlan = computed(() => plan.value === 'pro')

  const hasModule = (m: GuavaModule): boolean => activeModules.value.has(m)

  const canCreateLoyaltyCard = computed(() =>
    loyaltyCardsUsed.value < loyaltyCardsLimit.value
  )

  const remainingLoyaltyCards = computed(() =>
    Math.max(0, loyaltyCardsLimit.value - loyaltyCardsUsed.value)
  )

  // ─── Load subscription from mock API ───────────────────────────────────────
  const loadSubscription = async (restaurantId: string) => {
    try {
      const data = await $fetch<{
        plan: SubscriptionPlan
        verifiedBadge: boolean
        activeModules: GuavaModule[]
        loyaltyCardsUsed: number
      }>(`/api/mock/billing/status?restaurantId=${restaurantId}`)

      plan.value            = data.plan
      verifiedBadge.value   = data.verifiedBadge
      activeModules.value   = new Set(data.activeModules)
      loyaltyCardsUsed.value = data.loyaltyCardsUsed
      saveToStorage()
    } catch (err) {
      // Fallback to storage state — don't wipe existing state on network error
      console.warn('[useSubscription] loadSubscription failed, using cached state', err)
    }
  }

  // ─── Trigger Stripe Checkout (mock) ────────────────────────────────────────
  const startCheckout = async (
    intent: UpgradeIntent,
    opts: { module?: GuavaModule; restaurantId?: string } = {}
  ) => {
    const returnUrl = import.meta.client
      ? `${window.location.origin}/checkout/success?intent=${intent}${opts.module ? `&module=${opts.module}` : ''}&restaurantId=${opts.restaurantId ?? ''}`
      : '/checkout/success'

    try {
      const result = await $fetch<{ url: string }>('/api/mock/billing/checkout', {
        method: 'POST',
        body: {
          restaurantId: opts.restaurantId ?? '',
          intent,
          module: opts.module,
          returnUrl,
        },
      })
      if (import.meta.client && result?.url) {
        window.location.href = result.url
      }
    } catch (err) {
      console.error('[useSubscription] startCheckout failed', err)
    }
  }

  // ─── Dev helper: directly set state (for testing) ──────────────────────────
  const devSetPlan = (p: SubscriptionPlan) => {
    plan.value = p
    saveToStorage()
  }

  const devActivateModule = (m: GuavaModule) => {
    activeModules.value.add(m)
    saveToStorage()
  }

  const devSetLoyaltyUsed = (n: number) => {
    loyaltyCardsUsed.value = n
    saveToStorage()
  }

  return {
    // State
    plan,
    verifiedBadge,
    activeModules,
    loyaltyCardsUsed,
    loyaltyCardsLimit,
    // Computed
    isProPlan,
    canCreateLoyaltyCard,
    remainingLoyaltyCards,
    // Methods
    hasModule,
    loadSubscription,
    startCheckout,
    // Dev helpers
    devSetPlan,
    devActivateModule,
    devSetLoyaltyUsed,
    // Constants
    PRICES,
  }
}
