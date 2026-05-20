import { computed } from 'vue'

export type AccountType = 'restaurant' | 'creator' | 'professional' | null

// Decodes the `pu_token` cookie payload without verifying the signature —
// purely client-side, used to branch dashboard UI between restaurant and
// creator variants. The server remains the source of truth for authz.

function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payloadPart = parts[1]
    if (!payloadPart) return null
    // base64url → base64
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '==='.slice((base64.length + 3) % 4)
    const json = typeof atob === 'function' ? atob(padded) : Buffer.from(padded, 'base64').toString('utf-8')
    return JSON.parse(json)
  } catch {
    return null
  }
}

function readFromCookieValue(token: string | null | undefined): AccountType {
  if (!token) return null
  const payload = decodeJwtPayload(token)
  const claim = payload?.account_type ?? payload?.accountType ?? payload?.['extra:accountType']
  if (claim === 'restaurant' || claim === 'creator' || claim === 'professional') return claim
  return null
}

export function useAccountType() {
  const cached = useState<AccountType>('accountType', () => null)
  const cookie = useCookie<string | null>('pu_token')

  const computeFromSources = (): AccountType => {
    const fromCookie = readFromCookieValue(cookie.value)
    if (fromCookie) return fromCookie
    if (import.meta.dev && typeof localStorage !== 'undefined') {
      const fallback = localStorage.getItem('dev_account_type')
      if (fallback === 'restaurant' || fallback === 'creator' || fallback === 'professional') return fallback
    }
    return null
  }

  if (cached.value === null) {
    cached.value = computeFromSources()
  }

  const refresh = () => {
    cached.value = computeFromSources()
    return cached.value
  }

  const accountType = computed<AccountType>(() => cached.value)

  return { accountType, refresh }
}
