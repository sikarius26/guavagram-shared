// Client-side delivery-zone validation against store.deliveryAreas.
//
// Guava Platform serializes the configured zones on StoreFullViewModel (admin)
// and — now also — StoreInfoViewModel (public). There is no dedicated
// "validateAddress" endpoint, so we run haversine for circular zones and a
// ray-cast point-in-polygon for arbitrary shapes here. The backend remains the
// source of truth on confirm (orderOrderInfo can still reject), but checking
// locally lets us show fee/ETA/min-order before the user hits "Confirmar".
//
// Lives in guavagram-shared so the public app's `~/composables/*` alias resolves
// (see [[feedback_composables_live_in_shared]]).

import { computed, type Ref } from 'vue'
import { haversineKm } from './useDiscoveryDeckFilters'
import type { StoreDeliveryAreaViewModel } from '../services/apis/models/store-delivery-area-view-model'
import type { PositionViewModel } from '../services/apis/models/position-view-model'

export interface LatLng {
  lat: number
  lng: number
}

export type DeliveryValidationStatus =
  | 'idle'            // no address entered yet
  | 'missing-store'   // store has no lat/lon — cannot validate locally
  | 'missing-zones'   // store hasn't configured any delivery area
  | 'in-zone'         // matched an area; deliveryFees/ETA derived
  | 'out-of-zone'     // address entered but no area covers it

export interface DeliveryValidationResult {
  status: DeliveryValidationStatus
  area: StoreDeliveryAreaViewModel | null
  distanceKm: number | null
  deliveryFees: number | null
  estimatedMinutes: number | null
  minOrderAmount: number | null
  minOrderForFreeDelivery: number | null
}

// Standard ray-cast. Coords are { lat, lng }; we treat lng as x and lat as y.
// Good enough at city scale; the back can re-validate on the geodesic.
function pointInPolygon(point: LatLng, polygon: PositionViewModel[]): boolean {
  let inside = false
  const n = polygon.length
  if (n < 3) return false
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].lng, yi = polygon[i].lat
    const xj = polygon[j].lng, yj = polygon[j].lat
    const intersect =
      (yi > point.lat) !== (yj > point.lat) &&
      point.lng < ((xj - xi) * (point.lat - yi)) / ((yj - yi) || Number.EPSILON) + xi
    if (intersect) inside = !inside
  }
  return inside
}

function emptyResult(status: DeliveryValidationStatus): DeliveryValidationResult {
  return {
    status,
    area: null,
    distanceKm: null,
    deliveryFees: null,
    estimatedMinutes: null,
    minOrderAmount: null,
    minOrderForFreeDelivery: null,
  }
}

export function evaluateDeliveryZone(
  storeCenter: LatLng | null | undefined,
  userPoint: LatLng | null | undefined,
  areas: StoreDeliveryAreaViewModel[] | undefined | null,
): DeliveryValidationResult {
  if (!userPoint) return emptyResult('idle')
  if (!storeCenter) return emptyResult('missing-store')
  if (!Array.isArray(areas) || areas.length === 0) return emptyResult('missing-zones')

  // Pick the FIRST matching area (admin orders them by priority). Ties broken
  // by lowest fee so the customer never gets quoted a worse zone than they
  // qualify for.
  const matches = areas
    .map(area => {
      const distance = haversineKm(storeCenter, userPoint)
      if (area.isCircleArea) {
        if (distance <= (area.circleRadius ?? 0)) return { area, distance }
        return null
      }
      const coords = area.jsonCoordinates
      if (!Array.isArray(coords) || coords.length < 3) return null
      if (pointInPolygon(userPoint, coords)) return { area, distance }
      return null
    })
    .filter((m): m is { area: StoreDeliveryAreaViewModel; distance: number } => m !== null)

  if (matches.length === 0) {
    return {
      ...emptyResult('out-of-zone'),
      distanceKm: haversineKm(storeCenter, userPoint),
    }
  }

  matches.sort((a, b) => (a.area.deliveryFees ?? 0) - (b.area.deliveryFees ?? 0))
  const winner = matches[0]
  return {
    status: 'in-zone',
    area: winner.area,
    distanceKm: winner.distance,
    deliveryFees: winner.area.deliveryFees ?? 0,
    estimatedMinutes: winner.area.estimatedMinutes ?? null,
    minOrderAmount: winner.area.minOrderAmount ?? 0,
    minOrderForFreeDelivery: winner.area.minOrderForFreeDelivery ?? null,
  }
}

export function useDeliveryZoneValidation(
  storeCenter: Ref<LatLng | null | undefined>,
  userPoint: Ref<LatLng | null | undefined>,
  areas: Ref<StoreDeliveryAreaViewModel[] | undefined | null>,
) {
  const result = computed(() => evaluateDeliveryZone(storeCenter.value, userPoint.value, areas.value))

  const isInZone = computed(() => result.value.status === 'in-zone')
  const canPlaceOrder = computed(() => result.value.status === 'in-zone')

  return {
    result,
    isInZone,
    canPlaceOrder,
    evaluate: evaluateDeliveryZone,
  }
}
