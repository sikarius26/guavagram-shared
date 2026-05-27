import { ref, computed, type Ref } from 'vue'

// ─── Types ────────────────────────────────────────────────────────────────────
export type SubscriptionPlan = 'free' | 'pro'
export type GuavaModule = 'orders' | 'bookings' | 'marketing' | 'inventory' | 'employees' | 'analytics'
export type UpgradeIntent = 'upgrade-pro' | 'verified-badge' | 'activate-module' | 'upgrade-all' | 'verify-account'

// Mapping `GuavaModule` → `PlatformFeatureTypeEnum` (numeric values from
// guavagram-admin/app/services/apis/models/platform-feature-type-enum.ts).
// Numbers used literally so this composable stays in `guavagram-shared`
// without importing from `guavagram-admin` (forbidden by package topology).
export const MODULE_TO_FEATURE: Record<GuavaModule, number> = {
  orders: 13,     // ONLINE_ORDERING
  bookings: 31,   // ONLINE_BOOKING
  marketing: 16,  // MARKETING_AUTOMATIONS
  inventory: 4,   // INVENTORY
  employees: 5,   // EMPLOYEES_SHIFTS
  analytics: 21,  // ADVANCED_REPORTS
}

export interface PlanFeature {
  featureTypeId: number
  name?: string
  description?: string
  monthlyPricing?: number
  annualPricing?: number
}

export interface PlanCatalogEntry {
  id: string
  name?: string
  description?: string
  monthlyPricing: number
  annualPricing?: number
  isRecommended?: boolean
  includedFeatures: number[]
  features?: PlanFeature[]
}

export interface PaymentMethodInfo {
  id: string
  last4?: string
  scheme?: string
  expiryMonth?: number
  expiryYear?: number
}

export interface StorePlanInfo {
  id: string
  planId: string
  isActive: boolean
  daysTrial: number
  startAt?: Date
  activatedAt?: Date
  expireAt?: Date
  price: number
  renewAutomatically: boolean
}

export interface SubscriptionSnapshot {
  plan: SubscriptionPlan
  verifiedBadge: boolean
  activeFeatures: number[]
  storePlans: StorePlanInfo[]
  paymentMethods: PaymentMethodInfo[]
  loyaltyCardsUsed: number
}

// ─── Pricing constants (Guavagram-native only) ────────────────────────────────
// Pro / verifiedBadge are Guavagram-native subscriptions (Stripe Checkout from
// /api/mock/billing/checkout) and keep hardcoded prices. Module prices used to
// live here too; they now come from Guava Platform's `billingPlansAvailable`
// catalog (see `planCatalog` below). Kept as last-resort fallbacks so the
// upgrade modal still renders if the catalog endpoint is unreachable.
export const PRICES = {
  verifiedBadge: 2,
  orders: 59,
  bookings: 79,
  marketing: 79,
  employees: 79,
} as const

const LOYALTY_LIMIT_FREE = 15   // lifetime cap
const LOYALTY_LIMIT_PRO  = 30   // per month

// ─── Resolvers injected from admin (Guava Platform billing API) ───────────────
// Shared can't import `billingApiClient` directly — it lives in
// guavagram-admin's NSwag-generated client folder. Admin's
// `subscription-wiring.client.ts` plugin registers these at boot.
//
// All resolvers return `null` when admin hasn't wired anything (consumer app,
// build-time SSR, network failure). Composable falls back to mock state in
// that case so the rest of the UI keeps working.
export type SubscriptionResolver = (storeId: string) => Promise<{
  activeFeatures: number[]
  storePlans: StorePlanInfo[]
  paymentMethods: PaymentMethodInfo[]
} | null>

export type PlanCatalogResolver = (storeId: string) => Promise<PlanCatalogEntry[] | null>

export type ConfirmSubscriptionResolver = (
  storeId: string,
  args: { planId: string; paymentMethodId: string; isAnnualBilling?: boolean }
) => Promise<{ ok: boolean; transactionId?: string; error?: string }>

let subscriptionResolver: SubscriptionResolver | null = null
let planCatalogResolver: PlanCatalogResolver | null = null
let confirmSubscriptionResolver: ConfirmSubscriptionResolver | null = null

export function setSubscriptionResolver(r: SubscriptionResolver | null) { subscriptionResolver = r }
export function setPlanCatalogResolver(r: PlanCatalogResolver | null) { planCatalogResolver = r }
export function setConfirmSubscriptionResolver(r: ConfirmSubscriptionResolver | null) { confirmSubscriptionResolver = r }

// ─── Module-level reactive state (shared across all composable calls) ────────
//
// Cross-app sync (dashboard ↔ public bio) goes through the billing API on the
// admin side. The `/api/_mock/store/<id>/subscription` PUT remains as a dev
// fallback only — when admin has wired a real resolver, `loadSubscription`
// uses Guava directly and skips the mock entirely.
//
// Dev unlock flag: defaults to ON so the test account can exercise all gated
// features without paying. Flip localStorage.guava_dev_unlock_all to "false"
// (e.g. via DashboardSettingsPanel toggle) to verify the real upgrade flow.
const _devUnlock = (typeof localStorage === 'undefined') || localStorage.getItem('guava_dev_unlock_all') !== 'false'

const plan            = ref<SubscriptionPlan>(_devUnlock ? 'pro' : 'free')
const verifiedBadge   = ref(_devUnlock)
const activeModules   = ref<Set<GuavaModule>>(_devUnlock
  ? new Set<GuavaModule>(['orders', 'bookings', 'marketing', 'inventory', 'employees', 'analytics'])
  : new Set())
const activeFeatures   = ref<Set<number>>(_devUnlock
  ? new Set<number>(Object.values(MODULE_TO_FEATURE))
  : new Set())
const storePlans      = ref<StorePlanInfo[]>([])
const paymentMethods  = ref<PaymentMethodInfo[]>([])
const planCatalog     = ref<PlanCatalogEntry[]>([])
const loyaltyCardsUsed = ref(0)
const loyaltyCardsLimit = computed(() => plan.value === 'pro' ? LOYALTY_LIMIT_PRO : LOYALTY_LIMIT_FREE)

let currentRestaurantId: string | null = null
let pushTimer: ReturnType<typeof setTimeout> | null = null

function schedulePush() {
  if (typeof window === 'undefined') return
  if (!currentRestaurantId) return
  // When a real resolver is wired (i.e. we're talking to Guava Platform),
  // the platform is the source of truth — don't echo state back to the mock.
  if (subscriptionResolver) return
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

  // Module activation lookup: prefers Guava's feature flags (source of truth
  // when admin has wired the resolver). Falls back to the legacy
  // `activeModules` set for consumer-side / dev-mock flows.
  const hasModule = (m: GuavaModule): boolean => {
    const fid = MODULE_TO_FEATURE[m]
    if (activeFeatures.value.has(fid)) return true
    return activeModules.value.has(m)
  }

  const hasValidPaymentMethod = computed(() => {
    if (paymentMethods.value.length === 0) return false
    const now = new Date()
    return paymentMethods.value.some(pm => {
      if (!pm.expiryYear || !pm.expiryMonth) return true
      const exp = new Date(pm.expiryYear, pm.expiryMonth, 0)
      return exp >= now
    })
  })

  const defaultPaymentMethod = computed<PaymentMethodInfo | null>(() => {
    return paymentMethods.value[0] ?? null
  })

  const canCreateLoyaltyCard = computed(() =>
    loyaltyCardsUsed.value < loyaltyCardsLimit.value
  )

  const remainingLoyaltyCards = computed(() =>
    Math.max(0, loyaltyCardsLimit.value - loyaltyCardsUsed.value)
  )

  // Look up the catalog entry that includes the requested feature. Used by the
  // upgrade modal to render real bullets / price / trial without hardcoding.
  const planForModule = (m: GuavaModule): PlanCatalogEntry | null => {
    const fid = MODULE_TO_FEATURE[m]
    return planCatalog.value.find(p => p.includedFeatures.includes(fid)) ?? null
  }

  // ─── Load subscription from Guava Platform (or mock fallback) ─────────────
  const loadSubscription = async (restaurantId: string) => {
    currentRestaurantId = restaurantId
    // Don't let a backend refresh undo the dev unlock — keep plan/modules
    // forced when the test flag is on. Still record currentRestaurantId for
    // possible PUTs.
    if (_devUnlock) return

    // Prefer the real Guava resolver if admin has wired it.
    if (subscriptionResolver) {
      try {
        const data = await subscriptionResolver(restaurantId)
        if (data) {
          activeFeatures.value = new Set(data.activeFeatures)
          storePlans.value = data.storePlans
          paymentMethods.value = data.paymentMethods
          // Derive `plan` from store plans — any non-trial active plan = pro.
          // Guavagram-native Pro lives in Stripe Checkout / mock; if a Guava
          // plan is active that's a strictly stronger position so we surface
          // it as 'pro' for UI gating consistency.
          plan.value = data.storePlans.some(sp => sp.isActive && !sp.daysTrial)
            ? 'pro'
            : 'free'
          // Backfill legacy activeModules set so any consumer still relying
          // on it (consumer-side pages, mock paths) stays in sync.
          const mods = new Set<GuavaModule>()
          for (const [mod, fid] of Object.entries(MODULE_TO_FEATURE) as [GuavaModule, number][]) {
            if (activeFeatures.value.has(fid)) mods.add(mod)
          }
          activeModules.value = mods
          return
        }
      } catch (err) {
        console.warn('[useSubscription] subscriptionResolver failed, falling back to mock', err)
      }
    }

    // Mock fallback (consumer side / pre-wiring / network error).
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
      activeFeatures.value  = new Set(data.activeModules.map(m => MODULE_TO_FEATURE[m]))
      loyaltyCardsUsed.value = data.loyaltyCardsUsed
    } catch (err) {
      console.warn('[useSubscription] loadSubscription failed', err)
    }
  }

  // ─── Plan catalog (Guava) ──────────────────────────────────────────────────
  const loadPlanCatalog = async (restaurantId: string) => {
    if (!planCatalogResolver) return
    try {
      const catalog = await planCatalogResolver(restaurantId)
      if (catalog) planCatalog.value = catalog
    } catch (err) {
      console.warn('[useSubscription] loadPlanCatalog failed', err)
    }
  }

  // ─── Contract a Guava-hosted module (in-app, 15-day trial) ────────────────
  // Returns ok=true once Guava confirms the subscription. Caller is
  // responsible for ensuring `hasValidPaymentMethod` is true first (the
  // upgrade modal opens VerificationModal otherwise).
  const subscribeToModule = async (
    restaurantId: string,
    planId: string,
    opts: { isAnnualBilling?: boolean } = {}
  ): Promise<{ ok: boolean; error?: string }> => {
    if (!confirmSubscriptionResolver) {
      return { ok: false, error: 'NO_RESOLVER' }
    }
    const pm = defaultPaymentMethod.value
    if (!pm) return { ok: false, error: 'NO_PAYMENT_METHOD' }
    try {
      const res = await confirmSubscriptionResolver(restaurantId, {
        planId,
        paymentMethodId: pm.id,
        isAnnualBilling: !!opts.isAnnualBilling,
      })
      if (res.ok) {
        // Refresh state so newly-activated features unlock in the UI.
        await loadSubscription(restaurantId)
      }
      return res
    } catch (err) {
      console.error('[useSubscription] subscribeToModule failed', err)
      return { ok: false, error: (err as Error)?.message ?? 'UNKNOWN' }
    }
  }

  // ─── Trigger Stripe Checkout (Guavagram-native — Pro, badge, upgrade-all) ──
  // For `activate-module` the upgrade modal calls `subscribeToModule` directly
  // instead. Keeping this for Pro / verified-badge / upgrade-all which remain
  // Guavagram-native (their Stripe customer lives in /api/mock/billing/checkout).
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

  // ─── Dev helpers: directly set state (for testing) ────────────────────────
  const devSetPlan = (p: SubscriptionPlan) => {
    plan.value = p
    schedulePush()
  }

  const devActivateModule = (m: GuavaModule) => {
    activeModules.value.add(m)
    activeFeatures.value.add(MODULE_TO_FEATURE[m])
    schedulePush()
  }

  const devDeactivateModule = (m: GuavaModule) => {
    activeModules.value.delete(m)
    activeFeatures.value.delete(MODULE_TO_FEATURE[m])
    schedulePush()
  }

  const devToggleModule = (m: GuavaModule) => {
    if (hasModule(m)) devDeactivateModule(m)
    else devActivateModule(m)
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
    activeFeatures: activeFeatures as Ref<Set<number>>,
    storePlans,
    paymentMethods,
    planCatalog,
    loyaltyCardsUsed,
    loyaltyCardsLimit,
    // Computed
    isProPlan,
    canCreateLoyaltyCard,
    remainingLoyaltyCards,
    hasValidPaymentMethod,
    defaultPaymentMethod,
    // Methods
    hasModule,
    planForModule,
    loadSubscription,
    loadPlanCatalog,
    subscribeToModule,
    startCheckout,
    // Dev helpers
    devSetPlan,
    devActivateModule,
    devDeactivateModule,
    devToggleModule,
    devSetLoyaltyUsed,
    // Constants
    PRICES,
    MODULE_TO_FEATURE,
  }
}
