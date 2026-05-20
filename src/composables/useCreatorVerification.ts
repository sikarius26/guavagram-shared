import { computed, ref } from 'vue'

export const VERIFICATION_CONTACT_THRESHOLD = 100

const contactsBrought = ref(12)
const adminApproved = ref(false)
const cardVerified = ref(false)

export function useCreatorVerification() {
  const isContactGateMet = computed(() =>
    adminApproved.value || contactsBrought.value >= VERIFICATION_CONTACT_THRESHOLD
  )
  const isFullyVerified = computed(() => isContactGateMet.value && cardVerified.value)
  const remaining = computed(() => Math.max(0, VERIFICATION_CONTACT_THRESHOLD - contactsBrought.value))
  const progressPct = computed(() =>
    Math.min(100, Math.round((contactsBrought.value / VERIFICATION_CONTACT_THRESHOLD) * 100))
  )

  // Legacy alias kept for callers that gate features (Ofertas/Opiniones) on
  // the contact threshold without caring about the card step.
  const isVerified = isContactGateMet

  const isTabLocked = (tabId: string) => {
    if (isContactGateMet.value) return false
    return tabId === 'reviews' || tabId === 'offers'
  }

  const markCardVerified = () => { cardVerified.value = true }
  const unmarkCardVerified = () => { cardVerified.value = false }
  const setAdminApproved = (v: boolean) => { adminApproved.value = v }

  return {
    contactsBrought,
    adminApproved,
    cardVerified,
    threshold: VERIFICATION_CONTACT_THRESHOLD,
    isContactGateMet,
    isFullyVerified,
    isVerified,
    remaining,
    progressPct,
    isTabLocked,
    markCardVerified,
    unmarkCardVerified,
    setAdminApproved,
  }
}
