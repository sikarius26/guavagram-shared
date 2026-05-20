import { sessionApiClient } from '~/services/apis/api.client.session'
import { SessionRequest } from '~/services/apis/models/session-request'
import { http } from '~/services/apis/api.client.shared'

export function useStoreSession() {
  const config = useRuntimeConfig()
  const sessionToken = useCookie('token', { sameSite: 'lax' })

  const createSessionForStore = async (restaurantSlug: string) => {
    ;(sessionApiClient as any).baseUrl = config.public.apiBase as string
    const request = SessionRequest.fromJS({
      restaurantSlug,
      fingerPrintId: typeof navigator !== 'undefined' ? `fp-${Date.now()}` : undefined
    })
    const response = await sessionApiClient.sessionPost(request)
    const session = response.session
    if (session?.token) {
      // The global plugin interceptor reads the token from this cookie on every request
      sessionToken.value = session.token
      http.defaults.headers.common.Authorization = `Bearer ${session.token}`
    }
    return session
  }

  return { createSessionForStore }
}
