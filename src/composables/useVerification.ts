import { ref, computed, type Ref } from 'vue'

// Verification state lives in module-scope so the banner, modal trigger
// and the underlying composable share the same source of truth across
// components. The values themselves are pushed in by the dashboard
// overview fetcher (see `useDashboardStatsData`) — this composable just
// exposes them and the modal state.

const isVerified = ref(false)
const daysRemaining = ref<number | null>(null)
const showVerificationModal = ref(false)

/**
 * Pushes verification state from the dashboard overview into the shared
 * refs so any component using `useVerification()` gets the latest values.
 * Called once per overview refresh.
 */
export function applyVerificationState(input: { isVerified: boolean; daysUntilHidden: number | null }) {
  isVerified.value = input.isVerified
  daysRemaining.value = input.daysUntilHidden
}

export function useVerification() {
  const markVerified = () => {
    isVerified.value = true
    daysRemaining.value = null
  }

  const openVerification = () => {
    showVerificationModal.value = true
  }

  const closeVerification = () => {
    showVerificationModal.value = false
  }

  // "Urgent" once we're inside the 30-day grace window. Until verification
  // state lands, we fall back to false so the banner doesn't pulse before
  // we actually know.
  const isUrgent = computed(() => !isVerified.value && daysRemaining.value != null && daysRemaining.value <= 30)

  return {
    isVerified: isVerified as Ref<boolean>,
    daysRemaining: daysRemaining as Ref<number | null>,
    isUrgent,
    showVerificationModal,
    markVerified,
    openVerification,
    closeVerification,
  }
}
