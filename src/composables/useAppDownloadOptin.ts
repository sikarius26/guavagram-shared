import { watch } from 'vue'

const DISMISSED_KEY = 'guavagram.app_optin_dismissed.v1'
const SHOWN_KEY = 'guavagram.app_optin_shown.v1'

type RouteRule = { match: (path: string) => boolean; delayMs: number }

const RULES: RouteRule[] = [
  { match: (p) => p === '/join' || p === '/join/', delayMs: 6000 },
]

function isDismissed(): boolean {
  if (typeof window === 'undefined') return false
  try { return window.localStorage.getItem(DISMISSED_KEY) === '1' } catch { return false }
}

function isShownThisSession(): boolean {
  if (typeof window === 'undefined') return false
  try { return window.sessionStorage.getItem(SHOWN_KEY) === '1' } catch { return false }
}

function markShown() {
  if (typeof window === 'undefined') return
  try { window.sessionStorage.setItem(SHOWN_KEY, '1') } catch {}
}

function persistDismissed() {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(DISMISSED_KEY, '1') } catch {}
}

export function useAppDownloadOptin() {
  const isOpen = useState<boolean>('app-download-optin-open', () => false)
  const route = useRoute()
  let pendingTimer: ReturnType<typeof setTimeout> | null = null

  function clearPending() {
    if (pendingTimer) { clearTimeout(pendingTimer); pendingTimer = null }
  }

  function open() {
    if (isOpen.value) return
    if (isDismissed()) return
    isOpen.value = true
    markShown()
  }

  function close() {
    isOpen.value = false
    persistDismissed()
    clearPending()
  }

  function evaluate(path: string) {
    clearPending()
    if (isOpen.value || isDismissed() || isShownThisSession()) return
    const rule = RULES.find(r => r.match(path))
    if (!rule) return
    pendingTimer = setTimeout(() => {
      if (!isOpen.value && !isDismissed() && !isShownThisSession()) open()
    }, rule.delayMs)
  }

  if (import.meta.client) {
    watch(() => route.path, (p) => { evaluate(p) }, { immediate: true })

    watch(isOpen, (v) => {
      const body = document.body
      if (!body) return
      body.style.overflow = v ? 'hidden' : ''
    })

    if (!(window as any).__appDownloadOptinEscBound) {
      window.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen.value) close()
      })
      ;(window as any).__appDownloadOptinEscBound = true
    }
  }

  return { isOpen, open, close }
}
