import { ref, computed, watch } from 'vue'
import type { WalletPendingMatch, WalletPendingMatchStatus } from '~/services/apis/models/wallet-pending-match-view-model'
import { useCouponWallet, type WalletCoupon } from '~/composables/useCouponWallet'

const STORAGE_KEY = 'guavagram.match_pending.v1'
const DEFAULT_TTL_DAYS = 30

const pending = ref<WalletPendingMatch[]>([])
let hydrated = false
let syncedOnce = false

const hydrate = () => {
  if (hydrated || typeof window === 'undefined') return
  hydrated = true
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) pending.value = JSON.parse(raw) as WalletPendingMatch[]
  } catch {
    pending.value = []
  }
}

if (typeof window !== 'undefined') {
  watch(pending, (v) => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(v)) } catch {}
  }, { deep: true })
}

type AddPendingInput = Omit<WalletPendingMatch, 'id' | 'status' | 'addedAt' | 'expiresAt'> & {
  status?: WalletPendingMatchStatus
  ttlDays?: number
}

// Global DOM event so UI (wallet page) can react to a promotion with confetti.
const PROMOTED_EVENT = 'guavagram:match-promoted'

export interface MatchPromotedDetail {
  storeSlug: string
  storeName: string
  code: string
}

const emitPromoted = (detail: MatchPromotedDetail) => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<MatchPromotedDetail>(PROMOTED_EVENT, { detail }))
}

export function onMatchPromoted(handler: (detail: MatchPromotedDetail) => void) {
  if (typeof window === 'undefined') return () => {}
  const listener = (e: Event) => handler((e as CustomEvent<MatchPromotedDetail>).detail)
  window.addEventListener(PROMOTED_EVENT, listener)
  return () => window.removeEventListener(PROMOTED_EVENT, listener)
}

export function useMatchWallet() {
  hydrate()

  const list = computed(() =>
    [...pending.value].sort((a, b) => b.addedAt.localeCompare(a.addedAt))
  )
  const pendingCount = computed(() =>
    pending.value.filter(p => p.status === 'pending').length
  )

  const isPending = (storeSlug: string) =>
    pending.value.some(p => p.storeSlug === storeSlug && p.status === 'pending')

  const addPending = (input: AddPendingInput) => {
    if (!input.storeSlug) return
    if (pending.value.some(p => p.storeSlug === input.storeSlug && p.status === 'pending')) return
    const now = new Date()
    const ttl = input.ttlDays ?? DEFAULT_TTL_DAYS
    const expires = new Date(now)
    expires.setDate(expires.getDate() + ttl)
    pending.value = [
      ...pending.value,
      {
        id: input.storeSlug,
        storeSlug: input.storeSlug,
        storeId: input.storeId,
        storeName: input.storeName,
        storeCity: input.storeCity,
        storeLogoUrl: input.storeLogoUrl,
        storeCoverUrl: input.storeCoverUrl,
        cuisine: input.cuisine,
        status: input.status ?? 'pending',
        addedAt: now.toISOString(),
        expiresAt: expires.toISOString(),
      },
    ]
  }

  const decline = (id: string) => {
    pending.value = pending.value.filter(p => p.id !== id)
  }

  const reopen = (id: string) => {
    const now = new Date()
    const expires = new Date(now)
    expires.setDate(expires.getDate() + DEFAULT_TTL_DAYS)
    pending.value = pending.value.map(p =>
      p.id === id ? { ...p, status: 'pending', addedAt: now.toISOString(), expiresAt: expires.toISOString() } : p
    )
  }

  const purgeExpired = () => {
    const now = Date.now()
    pending.value = pending.value.map(p => {
      if (p.status !== 'pending' || !p.expiresAt) return p
      return new Date(p.expiresAt).getTime() < now ? { ...p, status: 'expired' as const } : p
    })
  }

  // Promotes a pending match by slug using a just-arrived coupon.
  // Removes the pending entry and fires the global promotion event so UI can celebrate.
  const promote = (storeSlug: string, coupon: WalletCoupon) => {
    const match = pending.value.find(p => p.storeSlug === storeSlug)
    if (!match) return false
    pending.value = pending.value.filter(p => p.id !== match.id)
    emitPromoted({ storeSlug, storeName: match.storeName, code: coupon.code })
    return true
  }

  // Scans the coupon wallet for codes matching any pending storeSlug and promotes them.
  // Called from wallet/app mount. INTEGRATION: swap for real coupon push channel.
  const syncFromCoupons = () => {
    const wallet = useCouponWallet()
    for (const coupon of wallet.list.value) {
      if (!coupon.storeSlug) continue
      promote(coupon.storeSlug, coupon)
    }
    if (!syncedOnce) syncedOnce = true
  }

  return {
    list,
    pendingCount,
    isPending,
    addPending,
    decline,
    reopen,
    purgeExpired,
    promote,
    syncFromCoupons,
  }
}
