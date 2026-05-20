import { ref, computed, watch } from 'vue'

// Once the user has met the 3 prerequisites for the first time, the gate stays
// unlocked forever. Persist that fact so it survives reloads.
const STORAGE_KEY = 'guavagram.gp_redemption_unlocked.v1'

const everUnlocked = ref(false)
const modalOpen = ref(false)
let hydrated = false

const hydrate = () => {
  if (hydrated || typeof window === 'undefined') return
  hydrated = true
  try {
    everUnlocked.value = window.localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    /* ignore */
  }
}

if (typeof window !== 'undefined') {
  watch(everUnlocked, (v) => {
    try { window.localStorage.setItem(STORAGE_KEY, v ? '1' : '0') } catch { /* ignore */ }
  })
}

// TODO(backend): wire these to real data sources.
//
// hasBroughtVerifiedRestaurant — true once any restaurant in the user's referral
//   N1 (directs) has completed verification (card on file). Likely source: an
//   endpoint that returns referral.directRestaurants[*].store.verificationStatus.
//
// hasVerifiedReview — true once at least one review by the user has passed
//   OCR validation (legal name + address + payment + fiscal info match the
//   place). See `project_review_verification.md`.
//
// hasReferredSignup — true once at least one user/creator has registered using
//   the user's `?ref={handle}` link. Needs a UTM/attribution tracker on signup.
//
// Until those exist we keep them as plain refs that default to false; tests can
// flip them in localStorage with the keys below to QA the unlocked state.
const MOCK_KEYS = {
  restaurant: 'guavagram.gp_gate.mock.restaurant',
  review: 'guavagram.gp_gate.mock.review',
  signup: 'guavagram.gp_gate.mock.signup',
}

const readMock = (key: string) => {
  if (typeof window === 'undefined') return false
  try { return window.localStorage.getItem(key) === '1' } catch { return false }
}

const hasBroughtVerifiedRestaurant = ref(readMock(MOCK_KEYS.restaurant))
const hasVerifiedReview = ref(readMock(MOCK_KEYS.review))
const hasReferredSignup = ref(readMock(MOCK_KEYS.signup))

export function useGpRedemptionGates() {
  hydrate()

  const allMet = computed(() =>
    hasBroughtVerifiedRestaurant.value
    && hasVerifiedReview.value
    && hasReferredSignup.value,
  )

  // First time all 3 are true → flip the persistent flag. From then on the
  // gate is open even if the underlying counts somehow regress.
  watch(allMet, (v) => {
    if (v && !everUnlocked.value) everUnlocked.value = true
  }, { immediate: true })

  const canRedeem = computed(() => everUnlocked.value || allMet.value)

  const openModal = () => { modalOpen.value = true }
  const closeModal = () => { modalOpen.value = false }

  return {
    hasBroughtVerifiedRestaurant,
    hasVerifiedReview,
    hasReferredSignup,
    everUnlocked,
    canRedeem,
    modalOpen,
    openModal,
    closeModal,
  }
}
