import { ref } from 'vue'
import type { UpgradeIntent, GuavaModule } from '~/composables/useSubscription'
import { useSubscription } from '~/composables/useSubscription'

// Shared upgrade-prompt state. Any component can call `promptUpgrade(...)` to
// open a global modal that previews the plan/module + free trial before
// actually redirecting to Stripe. The CTA inside the modal fires the real
// `startCheckout` call from `useSubscription`.

export interface UpgradePromptPayload {
  intent: UpgradeIntent
  module?: GuavaModule
  restaurantId?: string
}

const isOpen = ref(false)
const payload = ref<UpgradePromptPayload | null>(null)

export function useUpgradePrompt() {
  // `force: true` skips the "user already has it" early-returns. Use it when
  // the caller deliberately surfaces a locked entry point even though the dev
  // unlock flag (or a real subscription) would mark the feature as active —
  // e.g. the admin sidebar showing Bookings/Orders as locked because the
  // panels haven't shipped yet.
  const promptUpgrade = (
    intent: UpgradeIntent,
    opts: { module?: GuavaModule; restaurantId?: string; force?: boolean } = {}
  ) => {
    const sub = useSubscription()
    if (!opts.force) {
      if (intent === 'upgrade-pro' || intent === 'upgrade-all') {
        if (sub.isProPlan.value) return
      }
      // upgrade-plus es upgrade desde Completo: NO bloquear por isProPlan.
      // El panel decide cuándo mostrar el CTA (gateado por isPlusActive).
      if (intent === 'activate-module' && opts.module) {
        if (sub.hasModule(opts.module)) return
      }
      if (intent === 'verified-badge' || intent === 'verify-account') {
        if (sub.verifiedBadge.value) return
      }
    }
    payload.value = { intent, module: opts.module, restaurantId: opts.restaurantId }
    isOpen.value = true
  }

  const closePrompt = () => {
    isOpen.value = false
    // Clear payload after a tick so the modal exit animation can still read it.
    setTimeout(() => { payload.value = null }, 250)
  }

  return { isOpen, payload, promptUpgrade, closePrompt }
}
