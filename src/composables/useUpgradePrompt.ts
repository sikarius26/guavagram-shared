import { ref } from 'vue'
import type { UpgradeIntent, GuavaModule } from '~/composables/useSubscription'

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
  const promptUpgrade = (intent: UpgradeIntent, opts: { module?: GuavaModule; restaurantId?: string } = {}) => {
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
