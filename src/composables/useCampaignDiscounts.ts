// Per-product discount resolution shared by the public bio (Platos estrella)
// and the menu (ItemCard). A campaign expresses a product discount either
// explicitly (`discountPct` + optional `discountItemIds`) or implicitly — a
// campaign whose title/badge is just a percentage (e.g. "-10%") is treated as
// a menu-wide discount so backend-authored promos light up without an admin
// re-edit. Combo campaigns (linkedBundleId) are NOT discounts.
//
// Scope rule for a discount campaign:
//   - `discountItemIds` set  → only those items
//   - else `linkedItemId`    → just that dish
//   - else                   → all menu items

export interface CampaignLike {
  id?: string
  kind?: 'menu' | 'combo' | 'discount' | string
  discountPct?: number
  discountItemIds?: string[]
  linkedItemId?: string
  linkedBundleId?: string
  title?: string
  badge?: string
  price?: string
  // Booking-promo calendar shape (GuavagramPanel bookingPromos): a
  // `type:'discount_pct'` entry carries its percentage in `value`. Other promo
  // types (free_item/happy_hour/special/discount_fixed) don't yield a % here.
  type?: string
  value?: string | number
}

// Filter a campaign list down to the entries the visitor has activated by
// tapping the card on the public bio/menu. A campaign without an id is treated
// as opt-in by default (e.g. legacy bookingPromos that have no id) so existing
// promo flows keep working without the explicit click. Use this BEFORE calling
// buildDiscountMap to enforce click-to-activate behavior:
//
//   const visible = filterActiveCampaigns(rawCampaigns, activeCampaignId.value)
//   const discounts = buildDiscountMap(visible, itemIds)
export function filterActiveCampaigns(
  campaigns: CampaignLike[] | null | undefined,
  activeCampaignId: string | null | undefined,
): CampaignLike[] {
  if (!Array.isArray(campaigns)) return []
  return campaigns.filter(c => {
    if (!c.id) return true   // legacy entries: keep behaviour
    return c.id === activeCampaignId
  })
}

// Matches a standalone percentage ("-10%", "10 %") — used to infer a discount
// only when the whole label IS the percentage, so "Menú -10% socios" doesn't
// silently discount the entire carte.
const STANDALONE_PCT = /^-?\s*(\d{1,3})\s*%$/
const ANY_PCT = /-?\s*(\d{1,3})\s*%/

const clampPct = (n: number): number => (n >= 1 && n <= 99 ? Math.round(n) : 0)

/** The discount percentage a campaign grants (0 when it isn't a discount). */
export function campaignDiscountPct(c: CampaignLike | null | undefined): number {
  if (!c || c.linkedBundleId) return 0
  if (typeof c.discountPct === 'number' && c.discountPct > 0) return clampPct(c.discountPct)
  // Booking-promo % discount: only `discount_pct` yields a percentage (a
  // `discount_fixed`/free_item/happy_hour/special never discounts per-item here).
  if (c.type === 'discount_pct' && c.value != null) {
    const n = typeof c.value === 'number' ? c.value : parseFloat(String(c.value))
    return Number.isFinite(n) ? clampPct(n) : 0
  }
  if (c.type && c.type !== 'discount') return 0
  // Explicit discount kind → read a percentage from anywhere in the labels.
  if (c.kind === 'discount') {
    for (const s of [c.title, c.badge, c.price]) {
      const m = s && ANY_PCT.exec(s)
      if (m) return clampPct(parseInt(m[1]!, 10))
    }
    return 0
  }
  // Untyped campaign whose title/badge is purely a percentage → infer.
  for (const s of [c.title, c.badge]) {
    const m = s && STANDALONE_PCT.exec(s.trim())
    if (m) return clampPct(parseInt(m[1]!, 10))
  }
  return 0
}

function affectsItem(c: CampaignLike, itemId: string): boolean {
  if (Array.isArray(c.discountItemIds) && c.discountItemIds.length) return c.discountItemIds.includes(itemId)
  if (c.linkedItemId) return c.linkedItemId === itemId
  return true // no target → whole menu
}

/** Best discount percentage applying to `itemId` across all campaigns (0 = none). */
export function discountPctForItem(campaigns: CampaignLike[] | null | undefined, itemId: string | undefined): number {
  if (!itemId || !Array.isArray(campaigns)) return 0
  let best = 0
  for (const c of campaigns) {
    const pct = campaignDiscountPct(c)
    if (pct > 0 && affectsItem(c, itemId)) best = Math.max(best, pct)
  }
  return best
}

/** Price after applying `pct`, rounded to cents. */
export function discountedPrice(price: number, pct: number): number {
  if (!pct) return price
  return Math.round(price * (1 - pct / 100) * 100) / 100
}

/** Map of itemId → discount pct for a set of items (used to feed the renderer). */
export function buildDiscountMap(campaigns: CampaignLike[] | null | undefined, itemIds: Array<string | undefined>): Record<string, number> {
  const map: Record<string, number> = {}
  for (const id of itemIds) {
    if (!id) continue
    const pct = discountPctForItem(campaigns, id)
    if (pct > 0) map[id] = pct
  }
  return map
}
