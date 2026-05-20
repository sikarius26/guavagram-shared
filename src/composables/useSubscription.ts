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

// ─── Module-level reactive state (shared across all composable calls) ────────
//
// Cross-app sync (dashboard ↔ public bio) goes through the billing API:
// `loadSubscription(restaurantId)` GETs `/api/mock/billing/status` and the
// `devActivateModule` / `devSetPlan` / `devSetLoyaltyUsed` helpers below PUT
// to `/api/_mock/store/<restaurantId>/subscription` so two browser windows
// (one on admin, one on public) see the same state after a refresh. The old
// localStorage cache (`guavagram.subscription.v1`) was dropped because it
// couldn't survive the upcoming split into two separate Nuxt processes.
const plan            = ref<SubscriptionPlan>('free')
const verifiedBadge   = ref(false)
const activeModules   = ref<Set<GuavaModule>>(new Set())
const loyaltyCardsUsed = ref(0)
const loyaltyCardsLimit = computed(() => plan.value === 'pro' ? LOYALTY_LIMIT_PRO : LOYALTY_LIMIT_FREE)

// Last restaurant id we synced against — needed by the dev helpers below so
// `devActivateModule('bookings')` can PUT to the right slug.
let currentRestaurantId: string | null = null
let pushTimer: ReturnType<typeof setTimeout> | null = null

function schedulePush() {
  if (typeof window === 'undefined') return
  if (!currentRestaurantId) return
  if (pushTimer) clearTimeout(pushTimer)
  pushTimer = setTimeout(() => {
    fetch(`/api/_mock/store/${encodeURIComponent(currentRestaurantId!)}/subscription`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        plan: plan.value,
        verifiedBadge: verifiedBadge.value,
        activeModules: [...activeModules.value],
        loyaltyCardsUsed: loyaltyCardsUsed.value,
      }),
    }).catch(() => {})
  }, 300)
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
    currentRestaurantId = restaurantId
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
    } catch (err) {
      // Network error — keep whatever in-memory state we had (defaults if first
      // call). Cross-app sync was the localStorage cache's only job before;
      // it's now via the `/api/_mock/store/<id>/subscription` PUT in the dev
      // helpers below.
      console.warn('[useSubscription] loadSubscription failed', err)
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
    schedulePush()
  }

  const devActivateModule = (m: GuavaModule) => {
    activeModules.value.add(m)
    schedulePush()
  }

  const devSetLoyaltyUsed = (n: number) => {
    loyaltyCardsUsed.value = n
    schedulePush()
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
