// Shared cart accessor for the public restaurant pages (/menu, /bio /info,
// /reviews /opiniones). All three live under /r/[slug]/* and share the same
// fixed Sidebar with its inline cart + booking widget. The cart itself lives
// on the backend (orderApiClient.order()) — the composable just exposes a
// uniform reactive view so each page can pipe the same `orderCount` /
// `orderTotal` / `orderItems` props to <Sidebar>.
//
// Why useState + onMounted refetch: the cache survives navigation so the
// sidebar doesn't flash empty when moving from /menu → /info, while the
// onMounted refresh keeps it consistent with the backend.

import { computed, onMounted } from 'vue'
import { orderApiClient } from '~/services/apis/api.client.order'
import type { OrderViewModel } from '~/services/apis/models/order-view-model'

export interface CartLine {
  id: string
  name: string
  count: number
  price: number
  attrs?: string
  notes?: string
}

export function useCurrentOrder(_slugRef: { value: string }) {
  const order = useState<OrderViewModel | undefined>('current-order', () => undefined)

  // Configure the client's baseUrl here so callers don't have to remember
  // to do it before triggering a refresh. /menu sets it in its <script setup>;
  // /bio and /reviews don't, but they call refresh() through this composable.
  const runtimeConfig = useRuntimeConfig()
  ;(orderApiClient as any).baseUrl = runtimeConfig.public.apiBase

  async function refresh() {
    try {
      order.value = await orderApiClient.order()
    } catch {
      order.value = undefined
    }
  }

  function set(next?: OrderViewModel) {
    order.value = next
  }

  const count = computed(() => {
    const o = order.value
    if (!o) return 0
    const items = o.items?.filter((i) => !i.bundleId).reduce((sum, i) => sum + (i.count ?? 1), 0) ?? 0
    const bundles = o.bundles?.length ?? 0
    return items + bundles
  })

  const total = computed(() => order.value?.total ?? 0)

  const lineItems = computed<CartLine[]>(() => {
    const o = order.value
    if (!o) return []
    const lines: CartLine[] = []
    o.items?.filter((i) => !i.bundleId).forEach((i) => {
      if (!i.id) return
      lines.push({
        id: i.id,
        name: i.name ?? '',
        count: i.count ?? 1,
        price: (i.price ?? 0) * (i.count ?? 1),
        attrs: i.attributes?.map((a: any) => a.name).filter(Boolean).join(' · ') || undefined,
        notes: i.notes || undefined,
      })
    })
    o.bundles?.forEach((b: any) => {
      if (!b.id) return
      lines.push({
        id: b.id,
        name: b.name ?? '',
        count: b.count ?? 1,
        price: (b.price ?? 0) * (b.count ?? 1),
        notes: b.notes || undefined,
      })
    })
    return lines
  })

  onMounted(refresh)

  return { order, count, total, lineItems, refresh, set }
}
