import { ref, computed, watch } from 'vue'

export interface WalletCoupon {
  id: string
  code: string
  storeName: string
  storeSlug: string
  storeCity?: string
  storeLogoUrl?: string
  storeCoverUrl?: string
  discountPercent?: number
  discountFlatCents?: number
  discountLabel?: string
  creatorHandle?: string
  creatorName?: string
  savedAt: string
}

const STORAGE_KEY = 'guavagram.coupon_wallet.v1'

const coupons = ref<WalletCoupon[]>([])
let hydrated = false

const hydrate = () => {
  if (hydrated || typeof window === 'undefined') return
  hydrated = true
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) coupons.value = JSON.parse(raw) as WalletCoupon[]
  } catch {
    coupons.value = []
  }
}

if (typeof window !== 'undefined') {
  watch(coupons, (v) => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(v)) } catch {}
  }, { deep: true })
}

const makeId = (code: string, slug: string) => `${slug}:${code}`.toLowerCase()

export function useCouponWallet() {
  hydrate()

  const list = computed(() => [...coupons.value].sort((a, b) => b.savedAt.localeCompare(a.savedAt)))
  const count = computed(() => coupons.value.length)

  const isSaved = (code: string, storeSlug: string) =>
    coupons.value.some(c => c.id === makeId(code, storeSlug))

  const save = (input: Omit<WalletCoupon, 'id' | 'savedAt'>) => {
    if (!input.code || !input.storeSlug) return
    const id = makeId(input.code, input.storeSlug)
    if (coupons.value.some(c => c.id === id)) return
    coupons.value = [...coupons.value, { ...input, id, savedAt: new Date().toISOString() }]
  }

  const remove = (id: string) => {
    coupons.value = coupons.value.filter(c => c.id !== id)
  }

  const toggle = (input: Omit<WalletCoupon, 'id' | 'savedAt'>) => {
    const id = makeId(input.code, input.storeSlug)
    if (coupons.value.some(c => c.id === id)) {
      remove(id)
      return false
    }
    save(input)
    return true
  }

  return { list, count, isSaved, save, remove, toggle }
}
