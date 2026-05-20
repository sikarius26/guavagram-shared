declare global {
  interface Window {
    fbq: any
    _fbq: any
  }
}

export function useMetaPixel() {
  const isInitialized = ref(false)

  const init = (pixelId: string) => {
    if (!pixelId || isInitialized.value || !import.meta.client) return

    // Meta Pixel base code
    const f = window
    const b = document
    if (f.fbq) return
    const n: any = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    }
    if (!f._fbq) f._fbq = n
    n.push = n
    n.loaded = true
    n.version = '2.0'
    n.queue = []
    const s = b.createElement('script')
    s.async = true
    s.src = 'https://connect.facebook.net/en_US/fbevents.js'
    const t = b.getElementsByTagName('script')[0]
    t?.parentNode?.insertBefore(s, t)

    window.fbq('init', pixelId)
    isInitialized.value = true
  }

  const trackPageView = () => {
    if (!isInitialized.value || !import.meta.client) return
    window.fbq('track', 'PageView')
  }

  const trackLead = (eventId?: string, data?: Record<string, any>) => {
    if (!isInitialized.value || !import.meta.client) return
    window.fbq('track', 'Lead', data ?? {}, eventId ? { eventID: eventId } : {})
  }

  const getFbp = (): string | undefined => {
    if (!import.meta.client) return undefined
    const match = document.cookie.match(/_fbp=([^;]+)/)
    return match?.[1]
  }

  const getFbc = (): string | undefined => {
    if (!import.meta.client) return undefined
    // Check URL param first (fbclid), then cookie
    const url = new URL(window.location.href)
    const fbclid = url.searchParams.get('fbclid')
    if (fbclid) return `fb.1.${Date.now()}.${fbclid}`
    const match = document.cookie.match(/_fbc=([^;]+)/)
    return match?.[1]
  }

  return { init, trackPageView, trackLead, getFbp, getFbc, isInitialized }
}
