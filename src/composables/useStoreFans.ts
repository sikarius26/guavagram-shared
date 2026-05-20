import { ref, computed, watch } from 'vue'
import {
  STORE_FANS,
  STORE_SENT_COUPONS,
  STORE_AUTO_RULES,
  COUPON_TEMPLATES,
  type AnonymousFan,
  type SentCoupon,
  type SentCouponRecipient,
  type FansAutoRule,
  type CouponTemplate,
  type CouponConditions,
  type CouponSchedule,
} from '~/services/apis/mocks/storeFans.mock'

export type FanCouponStatus = 'pending' | 'delivered' | 'opened' | 'redeemed'

// Per-store state, hydrated from localStorage so manual coupon sends and
// rule toggles persist across reloads in the demo. When the API ships, the
// state seed swaps from mocks to the server response without touching callers.

const STORAGE_KEY = 'guavagram.store_fans.v1'

interface PersistedState {
  sentCoupons: SentCoupon[]
  autoRules: FansAutoRule[]
}

const fans = ref<AnonymousFan[]>([])
const sentCoupons = ref<SentCoupon[]>([])
const autoRules = ref<FansAutoRule[]>([])
let hydrated = false

const hydrate = () => {
  if (hydrated) return
  hydrated = true
  // Seed from mocks first so SSR and first-paint have data.
  fans.value = STORE_FANS
  sentCoupons.value = STORE_SENT_COUPONS
  autoRules.value = STORE_AUTO_RULES

  if (typeof window === 'undefined') return
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedState>
      if (parsed.sentCoupons) sentCoupons.value = parsed.sentCoupons
      if (parsed.autoRules)   autoRules.value   = parsed.autoRules
    }
  } catch { /* ignore */ }
}

if (typeof window !== 'undefined') {
  watch([sentCoupons, autoRules], () => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ sentCoupons: sentCoupons.value, autoRules: autoRules.value }),
      )
    } catch { /* quota / private mode */ }
  }, { deep: true })
}

export function useStoreFans() {
  hydrate()

  // ─── Derived state ──────────────────────────────────────────────────
  const totalFans = computed(() => fans.value.length)

  const newThisWeek = computed(() => {
    const now = Date.now()
    const week = 7 * 24 * 60 * 60 * 1000
    return fans.value.filter(f => now - new Date(f.likedAt).getTime() < week).length
  })

  const couponsSentTotal = computed(() => sentCoupons.value.reduce((acc, c) => acc + c.recipients.length, 0))

  const couponsRedeemedTotal = computed(() =>
    sentCoupons.value.reduce(
      (acc, c) => acc + c.recipients.filter(r => r.status === 'redeemed').length,
      0,
    ),
  )

  const conversionRate = computed(() => {
    const sent = couponsSentTotal.value
    if (sent === 0) return 0
    return Math.round((couponsRedeemedTotal.value / sent) * 100)
  })

  const fanById = (id: string) => fans.value.find(f => f.id === id) ?? null

  // ─── Per-fan coupon status helpers ──────────────────────────────────
  // Aggregates everything we know about a fan's coupon journey: best
  // outcome across all sent coupons (redeemed > opened > delivered > none).
  const STATUS_RANK: Record<FanCouponStatus, number> = {
    pending: 0,
    delivered: 1,
    opened: 2,
    redeemed: 3,
  }

  function getFanCouponStatus(fanId: string): FanCouponStatus {
    let best: FanCouponStatus = 'pending'
    for (const c of sentCoupons.value) {
      const r = c.recipients.find(rr => rr.fanId === fanId)
      if (!r) continue
      const s: FanCouponStatus = r.status === 'expired' ? 'delivered' : (r.status as FanCouponStatus)
      if (STATUS_RANK[s] > STATUS_RANK[best]) best = s
    }
    return best
  }

  function getFanLatestCoupon(fanId: string): { coupon: SentCoupon; recipient: SentCouponRecipient } | null {
    let latest: { coupon: SentCoupon; recipient: SentCouponRecipient } | null = null
    for (const c of sentCoupons.value) {
      const r = c.recipients.find(rr => rr.fanId === fanId)
      if (!r) continue
      if (!latest || new Date(c.sentAt).getTime() > new Date(latest.coupon.sentAt).getTime()) {
        latest = { coupon: c, recipient: r }
      }
    }
    return latest
  }

  const couponsByFan = computed(() => {
    const map = new Map<string, { coupon: SentCoupon; recipient: SentCouponRecipient }[]>()
    for (const c of sentCoupons.value) {
      for (const r of c.recipients) {
        const arr = map.get(r.fanId) ?? []
        arr.push({ coupon: c, recipient: r })
        map.set(r.fanId, arr)
      }
    }
    return map
  })

  // ─── Actions ────────────────────────────────────────────────────────
  function sendCoupon(input: {
    templateId: string
    fanIds: string[]
    conditions?: CouponConditions
    schedule?: CouponSchedule
  }): SentCoupon | null {
    const template = COUPON_TEMPLATES.find(t => t.id === input.templateId)
    if (!template || !input.fanIds.length) return null
    const now = new Date().toISOString()
    const sent: SentCoupon = {
      id: `sent-${Date.now()}`,
      templateId: template.id,
      template,
      sentAt: now,
      origin: 'manual',
      conditions: input.conditions,
      schedule: input.schedule,
      recipients: input.fanIds.map(fid => ({
        fanId: fid,
        status: 'delivered',
        deliveredAt: now,
      } satisfies SentCouponRecipient)),
    }
    sentCoupons.value = [sent, ...sentCoupons.value]
    return sent
  }

  function upsertAutoRule(rule: Partial<FansAutoRule> & { templateId: string; trigger: FansAutoRule['trigger']; name: string }): FansAutoRule {
    const id = rule.id ?? `rule-${Date.now()}`
    const next: FansAutoRule = {
      id,
      enabled: rule.enabled ?? true,
      sentCount: rule.sentCount ?? 0,
      createdAt: rule.createdAt ?? new Date().toISOString(),
      conditions: rule.conditions,
      schedule: rule.schedule,
      triggerN: rule.triggerN,
      ...rule,
    }
    const idx = autoRules.value.findIndex(r => r.id === id)
    if (idx >= 0) {
      autoRules.value = autoRules.value.map((r, i) => i === idx ? next : r)
    } else {
      autoRules.value = [next, ...autoRules.value]
    }
    return next
  }

  function toggleAutoRule(id: string, enabled?: boolean) {
    autoRules.value = autoRules.value.map(r =>
      r.id === id ? { ...r, enabled: enabled ?? !r.enabled } : r,
    )
  }

  function deleteAutoRule(id: string) {
    autoRules.value = autoRules.value.filter(r => r.id !== id)
  }

  // Sends a manual reminder to a fan about a previously-delivered coupon.
  // Stored on the recipient itself so the SentCoupon view can show
  // "reminded N days ago" without a separate log.
  function sendReminder(fanId: string, sentCouponId: string, message?: string): boolean {
    const idx = sentCoupons.value.findIndex(c => c.id === sentCouponId)
    if (idx < 0) return false
    const coupon = sentCoupons.value[idx]!
    const ridx = coupon.recipients.findIndex(r => r.fanId === fanId)
    if (ridx < 0) return false
    const now = new Date().toISOString()
    const updatedCoupon: SentCoupon = {
      ...coupon,
      recipients: coupon.recipients.map((r, i) =>
        i === ridx
          ? { ...r, reminders: [...(r.reminders ?? []), { sentAt: now, message }] }
          : r,
      ),
    }
    sentCoupons.value = sentCoupons.value.map((c, i) => i === idx ? updatedCoupon : c)
    return true
  }

  // ─── Filters helper for the list view ──────────────────────────────
  function filterFans(opts: {
    onlyVisited?: boolean
    sinceDays?: number
    couponStatus?: FanCouponStatus | 'all'
  }) {
    return fans.value.filter(f => {
      if (opts.onlyVisited && !f.hasVisitedBefore) return false
      if (opts.sinceDays !== undefined) {
        const cut = Date.now() - opts.sinceDays * 24 * 60 * 60 * 1000
        if (new Date(f.likedAt).getTime() < cut) return false
      }
      if (opts.couponStatus && opts.couponStatus !== 'all') {
        if (getFanCouponStatus(f.id) !== opts.couponStatus) return false
      }
      return true
    })
  }

  // Counts per status for the segment chips.
  const statusCounts = computed(() => {
    const counts = { all: 0, pending: 0, delivered: 0, opened: 0, redeemed: 0 }
    for (const f of fans.value) {
      counts.all++
      counts[getFanCouponStatus(f.id)]++
    }
    return counts
  })

  return {
    // state
    fans,
    sentCoupons,
    autoRules,
    templates: COUPON_TEMPLATES as readonly CouponTemplate[],
    // derived
    totalFans,
    newThisWeek,
    couponsSentTotal,
    couponsRedeemedTotal,
    conversionRate,
    statusCounts,
    couponsByFan,
    // helpers
    fanById,
    filterFans,
    getFanCouponStatus,
    getFanLatestCoupon,
    // actions
    sendCoupon,
    sendReminder,
    upsertAutoRule,
    toggleAutoRule,
    deleteAutoRule,
  }
}
