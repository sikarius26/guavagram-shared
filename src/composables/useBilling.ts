import { ref, computed } from 'vue'
import { billingApiClient } from '~/services/apis/api.client.billing'
import { BillingCheckoutRequest } from '~/services/apis/models/billing-checkout-request'
import type { BillingStatusResponse } from '~/services/apis/models/billing-status-response'

// Module-level singletons so any component reading isProPlan reacts to the
// same status without each having to re-fetch (or worse, hardcode false).
const status = ref<BillingStatusResponse | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

/**
 * Billing composable for the restaurant dashboard. Wraps the Stripe
 * server-side checkout session flow described in
 * /docs/call-ale-2026-05-05.md sec 4. The webhook (StripeHookController →
 * BillingService) is what actually flips StorePlan to Pro after Stripe
 * confirms payment.
 */
export function useBilling() {
  // status / loading / error live at module level above; everything below
  // reads/writes them as a shared singleton.

  const fetchStatus = async (storeId: string) => {
    loading.value = true
    error.value = null
    try {
      status.value = await billingApiClient.dashboardBillingStatus(storeId)
      return status.value
    } catch (e: any) {
      error.value = e?.message || 'No se pudo cargar el estado'
      throw e
    } finally {
      loading.value = false
    }
  }

  const upgradeToPlan = async (storeId: string, platformPlanId: string, isAnnual: boolean) => {
    const req = new BillingCheckoutRequest()
    req.platformPlanId = platformPlanId
    req.isAnnualBilling = isAnnual
    const res = await billingApiClient.dashboardBillingCheckout(storeId, req)
    // Redirect to Stripe Checkout. Stripe handles the form, comes back to
    // our success URL, and the webhook activates the StorePlan.
    if (res.url) window.location.href = res.url
    return res
  }

  // True while the user has an active StorePlan. Defaults true while
  // billing/status hasn't resolved to avoid flashing upgrade CTAs to a
  // paid user on first paint.
  const isProPlan = computed(() => status.value?.isActive !== false)

  return { status, loading, error, fetchStatus, upgradeToPlan, isProPlan }
}
