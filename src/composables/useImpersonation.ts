import { computed, ref } from 'vue'

// Impersonation state: when an admin impersonates another user, `pu_token`
// is swapped with a short-lived target token while the admin's original
// token is stashed in `pu_staff_token`. The app keeps working unchanged —
// only the banner + audit listens to the extra cookie.

interface ImpersonationMeta {
  targetUserId: string
  targetLabel: string
  targetAccountType: 'restaurant' | 'creator' | 'professional'
  originalAdminEmail: string
  originalAdminId: string
  startedAt: number // epoch ms
  expiresAt: number // epoch ms
  sessionId: string
}

const META_COOKIE = 'pu_staff_meta'

function safeRead(): ImpersonationMeta | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`${META_COOKIE}=([^;]+)`))
  if (!match) return null
  try {
    return JSON.parse(decodeURIComponent(match[1]!))
  } catch {
    return null
  }
}

// Module-level tick so all callers share a single interval (no leaks).
const tick = ref(0)
let tickStarted = false
function startTick() {
  if (tickStarted || !import.meta.client) return
  tickStarted = true
  setInterval(() => { tick.value++ }, 1000)
}

export function useImpersonation() {
  const staffToken = useCookie<string | null>('pu_staff_token')
  startTick()

  const meta = computed<ImpersonationMeta | null>(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    tick.value
    if (!staffToken.value) return null
    return safeRead()
  })

  const isImpersonating = computed(() => !!staffToken.value && !!meta.value)
  const originalAdminEmail = computed(() => meta.value?.originalAdminEmail ?? '')
  const targetUserLabel = computed(() => meta.value?.targetLabel ?? '')
  const targetAccountType = computed(() => meta.value?.targetAccountType ?? null)
  const sessionId = computed(() => meta.value?.sessionId ?? '')

  const remainingMs = computed(() => {
    const m = meta.value
    if (!m) return 0
    return Math.max(0, m.expiresAt - Date.now())
  })

  const remainingLabel = computed(() => {
    const ms = remainingMs.value
    if (ms <= 0) return '00:00'
    const total = Math.round(ms / 1000)
    const mm = String(Math.floor(total / 60)).padStart(2, '0')
    const ss = String(total % 60).padStart(2, '0')
    return `${mm}:${ss}`
  })

  const exit = async () => {
    if (import.meta.client) {
      const token = staffToken.value
      // restore original admin token, clear staff shadow
      const original = useCookie<string | null>('pu_token')
      original.value = token
      staffToken.value = null
      // clear meta cookie
      document.cookie = `${META_COOKIE}=; Max-Age=0; path=/`
      // log exit via mock (no-op if backend is wired later)
      try {
        const { logImpersonateExit } = await import('~/composables/admin/useAdminImpersonateMock')
        logImpersonateExit(meta.value?.sessionId)
      } catch {}
      await navigateTo('/admin/overview')
    }
  }

  return {
    isImpersonating,
    originalAdminEmail,
    targetUserLabel,
    targetAccountType,
    sessionId,
    remainingMs,
    remainingLabel,
    exit,
  }
}

export type { ImpersonationMeta }
export { META_COOKIE as IMPERSONATION_META_COOKIE }
