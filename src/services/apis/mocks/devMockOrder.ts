// Dev-only in-memory cart. Used when the slug is a known dev mock (no backend
// to POST /order/item to). Holds the current order at module-level so the same
// instance is shared across the page lifetime.

import { ref } from 'vue'
import { OrderViewModel } from '../models/order-view-model'
import { OrderItemViewModel } from '../models/order-item-view-model'
import type { MenuItemPurchaseRequest } from '../models/menu-item-purchase-request'

interface MockOrderState {
  items: any[]
  bundles: any[]
  total: number
}

const state = ref<MockOrderState>({ items: [], bundles: [], total: 0 })
let nextOrderItemId = 1

function recomputeTotal() {
  state.value.total = state.value.items.reduce(
    (sum, it) => sum + (it.price ?? 0) * (it.count ?? 1),
    0,
  )
}

function buildOrderViewModel(): OrderViewModel {
  // Reuse the same identity so refs that watch items maintain reactivity
  return OrderViewModel.fromJS({
    id: 'mock-order',
    items: state.value.items,
    bundles: state.value.bundles,
    total: state.value.total,
    isPending: true,
  })
}

export function addMockOrderItem(
  request: MenuItemPurchaseRequest,
  menuItemsMap: Record<string, any>,
  attributesMap: Record<string, any>,
): OrderViewModel {
  const incoming = request.orderItem
  if (!incoming) return buildOrderViewModel()

  const item = menuItemsMap[incoming.menuItemId!]
  let basePrice = item?.price ?? 0
  let attributesTotal = 0

  if (incoming.attributes && incoming.attributes.length > 0) {
    incoming.attributes.forEach((a) => {
      const attr = attributesMap[a.menuItemAttributeId!]
      if (!attr) return
      // If it belongs to the item's variant group, it REPLACES the base price.
      if (
        item?.variantAttributeGroupId &&
        a.menuItemAttributeGroupId === item.variantAttributeGroupId
      ) {
        basePrice = attr.price
      } else {
        attributesTotal += (attr.price ?? 0) * (a.count ?? 1)
      }
    })
  }

  const unitPrice = basePrice + attributesTotal

  state.value.items.push({
    id: `mock-oi-${nextOrderItemId++}`,
    menuItemId: incoming.menuItemId,
    name: item?.name,
    price: unitPrice,
    count: incoming.count ?? 1,
    notes: incoming.notes,
    categoryId: incoming.categoryId,
    orderCourseId: incoming.orderCourseId,
    attributes: incoming.attributes,
    isRefunded: false,
  })

  recomputeTotal()
  return buildOrderViewModel()
}

export function getMockOrder(): OrderViewModel {
  return buildOrderViewModel()
}

export function removeMockOrderItem(orderItemId: string): OrderViewModel {
  state.value.items = state.value.items.filter((i) => i.id !== orderItemId)
  recomputeTotal()
  return buildOrderViewModel()
}

export function updateMockOrderItemCount(orderItemId: string, count: number): OrderViewModel {
  const item = state.value.items.find((i) => i.id === orderItemId)
  if (item) item.count = Math.max(1, count)
  recomputeTotal()
  return buildOrderViewModel()
}

export function removeAllMockItemsOf(menuItemId: string): OrderViewModel {
  state.value.items = state.value.items.filter((i) => i.menuItemId !== menuItemId)
  recomputeTotal()
  return buildOrderViewModel()
}

export function clearMockOrder(): void {
  state.value.items = []
  state.value.bundles = []
  state.value.total = 0
  nextOrderItemId = 1
}

// Re-export for convenience so the page can detect dev slugs
export { isDevSlug } from './publicMenu.mock'
