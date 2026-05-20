import { ref, computed } from 'vue'
import { notifier } from '~/services/notification'
import type {
  ProfessionalRoleTag, ShiftPreference, CertificateTag, WorkExperience,
} from '~/services/apis/models/professional-profile-view-model'

export type ProfessionalOnboardingStepId = 'contact' | 'identity' | 'experience' | 'preferences'

export const PROFESSIONAL_ONBOARDING_STEPS: ProfessionalOnboardingStepId[] = ['contact', 'identity', 'experience', 'preferences']

export interface ProfessionalContactState {
  email: string
  password: string
  name: string
  phoneNumber: string
  phoneDialCode: string
}

export interface ProfessionalIdentityState {
  handle: string
  bio: string
  city: string
  profileImageUrl?: string
}

export interface ProfessionalExperienceState {
  experienceYears: number
  workHistory: WorkExperience[]
}

export interface ProfessionalPreferencesState {
  seekingRoles: ProfessionalRoleTag[]
  shiftPreferences: ShiftPreference[]
  hoursPerWeekMin: number
  hoursPerWeekMax: number
  hourlyRateEurMin: number
  hourlyRateEurMax: number
  certificates: CertificateTag[]
  languages: string[]
  availableFrom: string
}

export function useProfessionalOnboarding() {
  const currentStepIndex = ref(0)
  const isLoading = ref(false)

  const contact = ref<ProfessionalContactState>({
    email: '', password: '', name: '', phoneNumber: '', phoneDialCode: '+34',
  })
  const identity = ref<ProfessionalIdentityState>({
    handle: '', bio: '', city: '', profileImageUrl: undefined,
  })
  const experience = ref<ProfessionalExperienceState>({
    experienceYears: 0,
    workHistory: [],
  })
  const preferences = ref<ProfessionalPreferencesState>({
    seekingRoles: [],
    shiftPreferences: [],
    hoursPerWeekMin: 20,
    hoursPerWeekMax: 40,
    hourlyRateEurMin: 10,
    hourlyRateEurMax: 18,
    certificates: [],
    languages: ['es'],
    availableFrom: new Date().toISOString().slice(0, 10),
  })

  const currentStep = computed(() => PROFESSIONAL_ONBOARDING_STEPS[currentStepIndex.value]!)
  const progress = computed(() => ({
    current: currentStepIndex.value + 1,
    total: PROFESSIONAL_ONBOARDING_STEPS.length,
  }))
  const canGoBack = computed(() => currentStepIndex.value > 0 && !isLoading.value)

  const next = () => {
    if (currentStepIndex.value < PROFESSIONAL_ONBOARDING_STEPS.length - 1) currentStepIndex.value++
  }
  const prev = () => {
    if (canGoBack.value) currentStepIndex.value--
  }
  const goTo = (step: ProfessionalOnboardingStepId) => {
    const idx = PROFESSIONAL_ONBOARDING_STEPS.indexOf(step)
    if (idx >= 0) currentStepIndex.value = idx
  }

  const canAdvance = computed(() => {
    switch (currentStep.value) {
      case 'contact':
        return !!contact.value.email && !!contact.value.password && !!contact.value.name
      case 'identity':
        return !!identity.value.handle && !!identity.value.city
      case 'experience':
        return true  // optional; workers without experience are welcome
      case 'preferences':
        return preferences.value.seekingRoles.length > 0
    }
  })

  const addWorkExperience = (item: Omit<WorkExperience, 'id' | 'verified'>) => {
    experience.value.workHistory.push({
      ...item,
      id: `we-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      verified: false,
    })
  }
  const removeWorkExperience = (id: string) => {
    experience.value.workHistory = experience.value.workHistory.filter(w => w.id !== id)
  }

  /**
   * MVP: no real backend endpoint yet. We simulate registration:
   *  - Set localStorage fallback so useAccountType returns 'professional'
   *  - Return success and let caller navigate to /professional-dashboard
   */
  const registerProfessional = async (): Promise<{ success: true; handle: string }> => {
    isLoading.value = true
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('dev_account_type', 'professional')
        localStorage.setItem('dev_professional_handle', identity.value.handle)
      }
      // Simulate latency
      await new Promise(r => setTimeout(r, 400))
      notifier.notifySuccess('¡Bienvenido a Guavagram Professional!')
      return { success: true, handle: identity.value.handle }
    } catch (err) {
      notifier.notifyError('No se pudo completar el registro', err as Error)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    currentStepIndex, currentStep, progress, canGoBack, canAdvance,
    isLoading, contact, identity, experience, preferences,
    next, prev, goTo, addWorkExperience, removeWorkExperience, registerProfessional,
  }
}
