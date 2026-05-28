import { ref, computed, watch, type Ref } from 'vue'

// Pending coupon: a coupon code the visitor "claimed" by tapping a discount
// campaign on the public bio (or by typing it into the menu's voucher input).
// The cart (/order) reads this on mount and pushes it to the platform via
// `orderVoucherPut` so the discount is auto-applied — no need to retype.
//
// Per-slug so two tabs viewing different restaurants don't collide.
// sessionStorage by design: same lifecycle as useActiveCampaign (closing the
// tab clears it, refreshing keeps it). SSR-safe (writes only after onMounted /
// explicit action; reads default to null until first client read).

const PREFIX = 'guavagram.pending_coupon.v1'

const cache: Record<string, Ref<string | null>> = {}

function readStorage(slug: string): string | null {
  if (typeof window === 'undefined') return null
  try { return window.sessionStorage.getItem(`${PREFIX}:${slug}`) }
  catch { return null }
}

function writeStorage(slug: string, value: string | null) {
  if (typeof window === 'undefined') return
  try {
    if (value) window.sessionStorage.setItem(`${PREFIX}:${slug}`, value)
    else window.sessionStorage.removeItem(`${PREFIX}:${slug}`)
  } catch { /* private mode / quota — in-memory ref still works */ }
}

export function usePendingCoupon(slug: Ref<string> | (() => string) | string) {
  const slugRef = typeof slug === 'string'
    ? ref(slug)
    : typeof slug === 'function'
      ? computed(slug)
      : slug

  function refFor(s: string): Ref<string | null> {
    if (!cache[s]) cache[s] = ref<string | null>(null)
    return cache[s]
  }

  const pending = computed<string | null>({
    get: () => refFor(slugRef.value).value,
    set: (v) => { refFor(slugRef.value).value = v },
  })

  if (typeof window !== 'undefined' && pending.value === null) {
    const stored = readStorage(slugRef.value)
    if (stored) refFor(slugRef.value).value = stored
  }

  watch(pending, (v) => writeStorage(slugRef.value, v))

  function setCoupon(code: string | undefined | null) {
    const trimmed = (code || '').trim().toUpperCase().replace(/\s+/g, '')
    if (!trimmed) return
    pending.value = trimmed
  }

  function clearCoupon() {
    pending.value = null
  }

  return { pending, setCoupon, clearCoupon }
}
