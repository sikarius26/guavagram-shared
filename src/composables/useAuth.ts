import { ref, computed } from 'vue'
import type { UserViewModel } from '~/services/apis/models/user-view-model'
import { userApiClient } from '~/services/apis/api.client.user'
import { sessionApiClient } from '~/services/apis/api.client.session'
import { LoginProviderTypeEnum } from '~/services/apis/models/login-provider-type-enum'
import { UserLoginRequest } from '~/services/apis/models/user-login-request'
import type { PhoneNumberViewModel } from '~/services/apis/models/phone-number-view-model'
import type { VerifyTokenRequest } from '~/services/apis/models/verify-token-request'
import { http } from '~/services/apis/api.client.shared'

const user = ref<UserViewModel | null>(null)
const isLoading = ref(false)

export const useAuth = () => {
  const config = useRuntimeConfig()
  const isAuthenticated = computed(() => !!user.value)

  const initApiClients = () => {
    (userApiClient as any).baseUrl = config.public.apiBase
    ;(sessionApiClient as any).baseUrl = config.public.apiBase
  }

  const loadUser = async () => {
    initApiClients()
    try {
      user.value = await userApiClient.userProfileGet()
    } catch (error) {
      user.value = null
    }
  }

  const reloadSession = async () => {
    initApiClients()
    try {
      const fingerPrintId = `fp-${Date.now()}`
      const session = await sessionApiClient.sessionGet(fingerPrintId)
      if (session?.token) {
        http.defaults.headers.common.Authorization = `Bearer ${session.token}`
        if (session.userId) {
          try {
            await loadUser()
          } catch (error) {
            // User profile load failed, non-critical
          }
        }
      }
    } catch (error) {
      // Session reload failed
    }
  }

  const register = async (
    emailOrPhone: string,
    password: string,
    phoneDialCode?: string,
    name?: string,
    surname?: string,
    additionalEmail?: string
  ) => {
    isLoading.value = true
    try {
      initApiClients()
      const isPhone = phoneDialCode !== undefined
      const loginProviderType = isPhone ? LoginProviderTypeEnum.PHONE : LoginProviderTypeEnum.EMAIL
      const calculatedPhoneNumber = isPhone ? emailOrPhone.replace(phoneDialCode, '') : undefined
      const request = UserLoginRequest.fromJS({
        loginProviderTypeId: loginProviderType,
        tokenOrPassword: password,
        email: additionalEmail || (isPhone ? undefined : emailOrPhone),
        phoneNumber: calculatedPhoneNumber,
        phoneDialCode: phoneDialCode,
        name: name,
        surname: surname
      })
      const token = await userApiClient.userRegister(request!)
      await reloadSession()
      return token
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const login = async (email: string, password: string) => {
    isLoading.value = true
    try {
      initApiClients()
      const request = UserLoginRequest.fromJS({
        loginProviderTypeId: LoginProviderTypeEnum.EMAIL,
        tokenOrPassword: password,
        email: email
      })
      await userApiClient.userLogin(request!)
      await reloadSession()
    } finally {
      isLoading.value = false
    }
  }

  const loginWithGoogle = async (credential: string, name?: string, surname?: string) => {
    isLoading.value = true
    try {
      initApiClients()
      const request = UserLoginRequest.fromJS({
        loginProviderTypeId: LoginProviderTypeEnum.GOOGLE,
        tokenOrPassword: credential,
        email: undefined,
        name: name,
        surname: surname
      })
      await userApiClient.userLogin(request!)
      await reloadSession()
    } finally {
      isLoading.value = false
    }
  }

  const sendVerificationEmail = async (email: string) => {
    initApiClients()
    return await userApiClient.userLoginTokenEmail(email)
  }

  const sendVerificationPhone = async (phoneNumber: PhoneNumberViewModel) => {
    initApiClients()
    return await userApiClient.userLoginTokenPhone(phoneNumber)
  }

  const verifyToken = async (request: VerifyTokenRequest) => {
    initApiClients()
    try {
      await userApiClient.userVerify(request)
      await reloadSession()
    } catch (error) {
      throw error
    }
  }

  const resendToken = async (request: VerifyTokenRequest) => {
    initApiClients()
    return await userApiClient.userVerificationRetry(request)
  }

  const logout = async () => {
    // Clear in-memory auth state
    user.value = null
    delete http.defaults.headers.common.Authorization
    // Clear dev-only fallbacks used by useAccountType
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem('dev_account_type')
        localStorage.removeItem('dev_professional_handle')
      } catch {}
    }
    // Hard reload to public home so every composable resets its state
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    loadUser,
    reloadSession,
    register,
    login,
    loginWithGoogle,
    sendVerificationEmail,
    sendVerificationPhone,
    verifyToken,
    resendToken,
    logout,
  }
}
