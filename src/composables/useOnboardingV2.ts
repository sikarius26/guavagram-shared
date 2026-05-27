import { ref, computed, watch } from 'vue'
import { onboardingApiClient } from '~/services/apis/api.client.onboarding'
import { storeApiClient } from '~/services/apis/api.client.store'
import { http } from '~/services/apis/api.client.shared'
import { GoogleBusinessLocationViewModel } from '~/services/apis/models/google-business-location-view-model'
import { OnboardingLinkGoogleBusinessRequest } from '~/services/apis/models/onboarding-link-google-business-request'
import { OnboardingMediaViewModel } from '~/services/apis/models/onboarding-media-view-model'
import { OnboardingRegisterRequest } from '~/services/apis/models/onboarding-register-request'
import { UserLoginRequest } from '~/services/apis/models/user-login-request'
import { LoginProviderTypeEnum } from '~/services/apis/models/login-provider-type-enum'
import { notifier } from '~/services/notification'

export type OnboardingStepId = 'account' | 'menu' | 'gbp' | 'gallery'

export const ONBOARDING_STEPS: OnboardingStepId[] = ['account', 'menu', 'gbp', 'gallery']

export type MenuImportState = 'idle' | 'pending' | 'processing' | 'ready' | 'error'

export type SignupMethod = 'google' | 'email'

export interface StorePreview {
  displayName?: string
  addressLine1?: string
  city?: string
  phoneNumber?: string
}

interface OwnerAccount {
  email: string
  name: string
}

// Subset of wizard state we persist across reloads. The store is created in
// step 1, but everything used to live in memory only — a mid-alta refresh
// wiped `storeId` and stranded the owner on "sesión no iniciada". We keep this
// in a cookie (not localStorage) so SSR and the first client render agree and
// there's no step flash on hydration. File handles / transient menu state are
// deliberately excluded (not serialisable / re-derivable).
interface OnboardingSnapshot {
  step: number
  owner: OwnerAccount
  storeId?: string
  slugName?: string
  googleBusinessConnected: boolean
  selectedGoogleBusinessId?: string
  storePreview?: StorePreview
}

const ONBOARDING_COOKIE = 'gg_onboarding_v2'

const decodeJwtPayload = (token: string): Record<string, any> => {
  try {
    const part = token.split('.')[1]
    if (!part) return {}
    const padded = part.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, '='))
    return JSON.parse(json)
  } catch {
    return {}
  }
}

/**
 * Drives the 4-step restaurant onboarding wizard:
 *   account → menu → gbp → gallery
 *
 * Holds all state in the same composable so steps can navigate freely
 * (e.g. "back from gallery to fix a photo upload" or "skip gallery"). The
 * store is created up-front in the account step so subsequent steps have
 * a real `storeId` to attach uploads / GBP info to.
 */
export function useOnboardingV2() {
  // Cookie-backed snapshot of the wizard so a refresh mid-alta doesn't lose
  // the store. Restored synchronously here (SSR-safe) so the first render lands
  // on the right step. `useCookie` is provided by the host Nuxt app.
  const snapshot = useCookie<OnboardingSnapshot | null>(ONBOARDING_COOKIE, {
    default: () => null,
    maxAge: 60 * 60 * 24, // 1 day — enough to resume, not stale forever
    sameSite: 'lax',
    path: '/',
  })
  const restored = snapshot.value
  // A saved step past "account" is only meaningful with a storeId; without one
  // the owner can't proceed anyway, so fall back to the start.
  const restoredStep = restored?.storeId ? (restored.step ?? 0) : 0

  const currentStepIndex = ref(restoredStep)
  const isLoading = ref(false)

  // ─── Step 1: Account ────────────────────────────────────────────────
  const signupMethod = ref<SignupMethod>('google')
  const owner = ref<OwnerAccount>(restored?.owner ?? { email: '', name: '' })
  const storeId = ref<string | undefined>(restored?.storeId)
  const slugName = ref<string | undefined>(restored?.slugName)

  // ─── Step 2: Menu ───────────────────────────────────────────────────
  const pendingMenuFile = ref<File | null>(null)
  const menuImportState = ref<MenuImportState>('idle')
  const menuOperationId = ref<string | undefined>(undefined)

  // ─── Step 3: GBP ────────────────────────────────────────────────────
  const googleBusinessConnected = ref(restored?.googleBusinessConnected ?? false)
  const googleBusinessLocations = ref<GoogleBusinessLocationViewModel[]>([])
  const selectedGoogleBusinessId = ref<string | undefined>(restored?.selectedGoogleBusinessId)
  const storePreview = ref<StorePreview | undefined>(restored?.storePreview)
  const manualMode = ref(false)

  // Mirror the resumable slice back into the cookie whenever it changes.
  watch(
    [currentStepIndex, storeId, slugName, owner, googleBusinessConnected, selectedGoogleBusinessId, storePreview],
    () => {
      snapshot.value = {
        step: currentStepIndex.value,
        owner: owner.value,
        storeId: storeId.value,
        slugName: slugName.value,
        googleBusinessConnected: googleBusinessConnected.value,
        selectedGoogleBusinessId: selectedGoogleBusinessId.value,
        storePreview: storePreview.value,
      }
    },
    { deep: true },
  )

  // Wipe persisted state once the wizard is done (or to start fresh).
  const resetOnboarding = () => {
    snapshot.value = null
    currentStepIndex.value = 0
    owner.value = { email: '', name: '' }
    storeId.value = undefined
    slugName.value = undefined
    pendingMenuFile.value = null
    menuImportState.value = 'idle'
    menuOperationId.value = undefined
    googleBusinessConnected.value = false
    googleBusinessLocations.value = []
    selectedGoogleBusinessId.value = undefined
    storePreview.value = undefined
    manualMode.value = false
    galleryPhotos.value = []
  }

  // ─── Step 4: Gallery ────────────────────────────────────────────────
  const galleryPhotos = ref<OnboardingMediaViewModel[]>([])
  const GALLERY_MAX = 8

  // ─── Derived ────────────────────────────────────────────────────────
  const currentStep = computed<OnboardingStepId>(() => ONBOARDING_STEPS[currentStepIndex.value]!)
  const progress = computed(() => ({
    current: currentStepIndex.value + 1,
    total: ONBOARDING_STEPS.length,
  }))
  const canGoBack = computed(() => currentStepIndex.value > 0 && !isLoading.value)
  const galleryFull = computed(() => galleryPhotos.value.length >= GALLERY_MAX)

  const next = () => {
    if (currentStepIndex.value < ONBOARDING_STEPS.length - 1) currentStepIndex.value++
  }
  const back = () => {
    if (canGoBack.value) currentStepIndex.value--
  }

  // ─── Step 1 actions ─────────────────────────────────────────────────

  /**
   * Common path after we've obtained a JWT (regardless of provider): persist
   * the token and capture the email/name we already know. The store itself is
   * created later — from the chosen Google place via `onboardingRegister`
   * (see setManualStoreInfo) — because the deployed backend is place-first and
   * has no separate placeholder-store step.
   */
  const finalizeSignup = async (jwt: string, email: string, name: string): Promise<boolean> => {
    const platformUserToken = useCookie('pu_token')
    platformUserToken.value = jwt
    // The axios interceptor reads the cookie ref at request time, but it may
    // still hold the pre-signup (empty) value due to ref propagation timing.
    // Pinning the Authorization header on the http defaults makes the
    // immediately-following requests use the fresh JWT regardless.
    http.defaults.headers.common.Authorization = `Bearer ${jwt}`
    owner.value = { email, name }
    return true
  }

  const signupWithGoogle = async (credential: string): Promise<boolean> => {
    isLoading.value = true
    try {
      const jwt = await storeApiClient.storeRegister(UserLoginRequest.fromJS({
        loginProviderTypeId: LoginProviderTypeEnum.GOOGLE,
        tokenOrPassword: credential,
      })!)
      const payload = decodeJwtPayload(credential)
      return await finalizeSignup(jwt, payload.email || '', payload.name || payload.given_name || '')
    } catch (error) {
      notifier.notifyError('No se pudo crear la cuenta con Google', error as Error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const signupWithEmail = async (email: string, password: string, name: string): Promise<boolean> => {
    isLoading.value = true
    try {
      const jwt = await storeApiClient.storeRegister(UserLoginRequest.fromJS({
        loginProviderTypeId: LoginProviderTypeEnum.EMAIL,
        email,
        tokenOrPassword: password,
        name,
      })!)
      return await finalizeSignup(jwt, email, name)
    } catch (error) {
      notifier.notifyError('No se pudo crear la cuenta', error as Error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // ─── Step 2 actions ─────────────────────────────────────────────────

  const setMenuFile = (file: File | null) => {
    pendingMenuFile.value = file
    menuImportState.value = file ? 'pending' : 'idle'
  }

  const readFileAsBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  /**
   * Fires the menu file at the AI-OCR endpoint. Best-effort: a failure here
   * doesn't block the wizard — owners can retry from the dashboard.
   */
  const submitMenu = async (): Promise<boolean> => {
    if (!pendingMenuFile.value || !storeId.value) return false
    menuImportState.value = 'processing'
    try {
      const base64 = await readFileAsBase64(pendingMenuFile.value)
      const res = await onboardingApiClient.onboardingMenuImportPost(storeId.value, base64)
      if (res.status === 'ready') menuImportState.value = 'ready'
      else { menuImportState.value = 'pending'; menuOperationId.value = res.operationId }
      return true
    } catch {
      menuImportState.value = 'error'
      return false
    }
  }

  // ─── Step 3 actions (GBP) ───────────────────────────────────────────

  /**
   * Pops the Google consent screen with the `business.manage` scope, sends
   * the resulting auth code to the backend so it can stash a refresh token
   * on the user, then loads the user's verified locations.
   */
  const connectGoogleBusiness = async (clientId: string): Promise<boolean> => {
    isLoading.value = true
    try {
      const code = await new Promise<string>((resolve, reject) => {
        if (typeof window === 'undefined' || !window.google?.accounts?.oauth2) {
          reject(new Error('Google SDK not loaded'))
          return
        }
        const codeClient = window.google.accounts.oauth2.initCodeClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/business.manage',
          ux_mode: 'popup',
          callback: (resp) => {
            if (resp.code) resolve(resp.code)
            else reject(new Error('No code returned'))
          },
          error_callback: (err) => reject(new Error(err?.message || 'OAuth error')),
        })
        codeClient.requestCode()
      })

      await onboardingApiClient.onboardingGoogleBusinessToken(code)
      googleBusinessConnected.value = true

      const locations = await onboardingApiClient.onboardingGoogleBusinessLocations()
      googleBusinessLocations.value = (locations || []).filter(l => l.isValid)
      return true
    } catch (error) {
      notifier.notifyError('No se pudo conectar con Google Business', error as Error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const linkGoogleBusiness = async (googleBusinessId: string): Promise<boolean> => {
    if (!storeId.value) return false
    isLoading.value = true
    try {
      const res = await onboardingApiClient.onboardingGoogleBusinessLink(
        storeId.value,
        OnboardingLinkGoogleBusinessRequest.fromJS({ googleBusinessId }),
      )
      selectedGoogleBusinessId.value = googleBusinessId
      slugName.value = res.slugName
      storePreview.value = {
        displayName: res.displayName,
        addressLine1: res.addressLine1,
        city: res.city,
        phoneNumber: res.phoneNumber,
      }
      return true
    } catch (error) {
      notifier.notifyError('No se pudo vincular el negocio', error as Error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Creates the store via the (deployed) `onboarding/register` endpoint and
   * captures the returned storeId. The deployed backend is place-first: pass a
   * `googlePlaceId` and it pulls name/address/hours from the place. The pure
   * manual fallback (no place) registers with just email/phone — the typed
   * name/address are kept locally for the summary, but the place-first backend
   * can't persist them yet (no manual endpoint deployed).
   */
  const setManualStoreInfo = async (info: {
    displayName: string
    addressLine1: string
    city: string
    postalCode?: string
    phoneNumber?: string
    googlePlaceId?: string
  }): Promise<boolean> => {
    isLoading.value = true
    try {
      const res = await onboardingApiClient.onboardingRegister(OnboardingRegisterRequest.fromJS({
        googlePlaceId: info.googlePlaceId || undefined,
        emailAddress: owner.value.email || undefined,
        phoneNumber: info.phoneNumber || undefined,
      }))
      if (!res.storeId) {
        notifier.notifyError('No se pudo crear el restaurante. Inténtalo de nuevo.')
        return false
      }
      storeId.value = res.storeId
      slugName.value = res.slugName
      storePreview.value = {
        displayName: info.displayName,
        addressLine1: info.addressLine1,
        city: info.city,
        phoneNumber: info.phoneNumber,
      }
      // The store didn't exist while the owner was on the menu step, so flush
      // any menu they uploaded now that we finally have a storeId (best-effort).
      if (pendingMenuFile.value) submitMenu().catch(() => {})
      return true
    } catch (error) {
      notifier.notifyError('No se pudo guardar la información', error as Error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // ─── Step 4 actions (Gallery) ───────────────────────────────────────

  const addGalleryPhoto = async (file: File): Promise<boolean> => {
    if (!storeId.value || galleryFull.value) return false
    isLoading.value = true
    try {
      const base64 = await readFileAsBase64(file)
      const media = await onboardingApiClient.onboardingGalleryPut(
        storeId.value,
        OnboardingMediaViewModel.fromJS({ mediaUrl: base64, name: file.name }),
      )
      galleryPhotos.value = [...galleryPhotos.value, media]
      return true
    } catch (error) {
      notifier.notifyError('No se pudo subir la foto', error as Error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const removeGalleryPhoto = async (imageId: string): Promise<boolean> => {
    if (!storeId.value || !imageId) return false
    isLoading.value = true
    try {
      await onboardingApiClient.onboardingGalleryDelete(storeId.value, imageId)
      galleryPhotos.value = galleryPhotos.value.filter(p => p.id !== imageId)
      return true
    } catch (error) {
      notifier.notifyError('No se pudo eliminar la foto', error as Error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    // state
    currentStepIndex,
    currentStep,
    progress,
    canGoBack,
    isLoading,
    signupMethod,
    owner,
    storeId,
    slugName,
    pendingMenuFile,
    menuImportState,
    menuOperationId,
    googleBusinessConnected,
    googleBusinessLocations,
    selectedGoogleBusinessId,
    storePreview,
    manualMode,
    galleryPhotos,
    GALLERY_MAX,
    galleryFull,
    // navigation
    next,
    back,
    resetOnboarding,
    // actions
    signupWithGoogle,
    signupWithEmail,
    setMenuFile,
    submitMenu,
    connectGoogleBusiness,
    linkGoogleBusiness,
    setManualStoreInfo,
    addGalleryPhoto,
    removeGalleryPhoto,
  }
}

export type OnboardingV2Flow = ReturnType<typeof useOnboardingV2>
