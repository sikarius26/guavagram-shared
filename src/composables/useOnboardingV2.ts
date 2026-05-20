import { ref, computed } from 'vue'
import { onboardingApiClient } from '~/services/apis/api.client.onboarding'
import { storeApiClient } from '~/services/apis/api.client.store'
import { http } from '~/services/apis/api.client.shared'
import { GoogleBusinessLocationViewModel } from '~/services/apis/models/google-business-location-view-model'
import { OnboardingInitRequest } from '~/services/apis/models/onboarding-init-request'
import { OnboardingLinkGoogleBusinessRequest } from '~/services/apis/models/onboarding-link-google-business-request'
import { OnboardingManualStoreRequest } from '~/services/apis/models/onboarding-manual-store-request'
import { OnboardingMediaViewModel } from '~/services/apis/models/onboarding-media-view-model'
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
  const currentStepIndex = ref(0)
  const isLoading = ref(false)

  // ─── Step 1: Account ────────────────────────────────────────────────
  const signupMethod = ref<SignupMethod>('google')
  const owner = ref<OwnerAccount>({ email: '', name: '' })
  const storeId = ref<string | undefined>(undefined)
  const slugName = ref<string | undefined>(undefined)

  // ─── Step 2: Menu ───────────────────────────────────────────────────
  const pendingMenuFile = ref<File | null>(null)
  const menuImportState = ref<MenuImportState>('idle')
  const menuOperationId = ref<string | undefined>(undefined)

  // ─── Step 3: GBP ────────────────────────────────────────────────────
  const googleBusinessConnected = ref(false)
  const googleBusinessLocations = ref<GoogleBusinessLocationViewModel[]>([])
  const selectedGoogleBusinessId = ref<string | undefined>(undefined)
  const storePreview = ref<StorePreview | undefined>(undefined)
  const manualMode = ref(false)

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
   * the token, capture the email/name we already know, and ask the backend
   * for a placeholder store so the rest of the wizard has a storeId.
   */
  const finalizeSignup = async (jwt: string, email: string, name: string): Promise<boolean> => {
    const platformUserToken = useCookie('pu_token')
    platformUserToken.value = jwt
    // Setting the cookie alone isn't enough: the axios interceptor reads the
    // cookie ref at request time, but the ref it grabs is the one created in
    // the plugin scope — by the time we hit /onboarding/account/init it may
    // still be holding the pre-signup (empty) value due to ref propagation
    // timing. Pinning the Authorization header on the http defaults makes
    // the immediately-following request use the fresh JWT regardless.
    http.defaults.headers.common.Authorization = `Bearer ${jwt}`
    owner.value = { email, name }

    try {
      const res = await onboardingApiClient.onboardingAccountInit(OnboardingInitRequest.fromJS({
        displayName: name ? `${name}'s Restaurant` : undefined,
      }))
      storeId.value = res.storeId
      slugName.value = res.slugName
      return true
    } catch (error) {
      notifier.notifyError('No se pudo inicializar el restaurante', error as Error)
      return false
    }
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

  const setManualStoreInfo = async (info: {
    displayName: string
    addressLine1: string
    city: string
    postalCode?: string
    phoneNumber?: string
  }): Promise<boolean> => {
    if (!storeId.value) return false
    isLoading.value = true
    try {
      const res = await onboardingApiClient.onboardingManual(
        storeId.value,
        OnboardingManualStoreRequest.fromJS(info),
      )
      slugName.value = res.slugName
      storePreview.value = {
        displayName: res.displayName,
        addressLine1: res.addressLine1,
        city: res.city,
        phoneNumber: res.phoneNumber,
      }
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
