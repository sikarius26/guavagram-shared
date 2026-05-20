import { ref } from 'vue'
import { userApiClient } from '~/services/apis/api.client.user'
import { UserLoginRequest } from '~/services/apis/models/user-login-request'
import { LoginProviderTypeEnum } from '~/services/apis/models/login-provider-type-enum'
import { RequestMembershipRequest } from '~/services/apis/models/request-membership-request'
import { notifier } from '~/services/notification'

const HANDLE_REGEX = /^[a-z0-9_.]{3,24}$/

export function isValidHandle(value: string): boolean {
  return HANDLE_REGEX.test(value.trim().toLowerCase())
}

export function suggestHandleFromEmail(email: string): string {
  const local = (email || '').split('@')[0] || ''
  return local.toLowerCase().replace(/[^a-z0-9_.]/g, '').slice(0, 24)
}

export function useCreatorOnboarding() {
  const handle = ref('')
  const isLoading = ref(false)

  const registerCreatorWithGoogle = async (googleCredential: string): Promise<boolean> => {
    if (!isValidHandle(handle.value)) {
      notifier.notifyError('Elige un nombre de usuario válido (3-24 caracteres, letras/números/_.)')
      return false
    }

    isLoading.value = true
    try {
      const platformUserToken = useCookie('pu_token')

      const jwt = await userApiClient.userRegister(UserLoginRequest.fromJS({
        loginProviderTypeId: LoginProviderTypeEnum.GOOGLE,
        tokenOrPassword: googleCredential,
        extraRegistrationInfos: {
          accountType: 'creator',
          handlePreference: handle.value.trim().toLowerCase(),
        },
      })!)
      if (jwt) platformUserToken.value = jwt

      if (import.meta.dev && typeof localStorage !== 'undefined') {
        localStorage.setItem('dev_account_type', 'creator')
      }

      // Persist handle preference via membership request. The endpoint is
      // tolerant of partial payloads — we send the handle and leave the rest
      // to the dashboard's inline bio editor.
      await userApiClient.userMembershipRequest(RequestMembershipRequest.fromJS({
        acceptAgreement: true,
        handlePreference: handle.value.trim().toLowerCase(),
      })).catch(() => undefined)

      return true
    } catch (error) {
      notifier.notifyError('No se pudo crear la cuenta', error as Error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    handle,
    isLoading,
    registerCreatorWithGoogle,
  }
}

export type CreatorOnboardingFlow = ReturnType<typeof useCreatorOnboarding>
