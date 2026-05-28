// Single source of truth for the checkout flow: which "modo" the customer is
// in (takeaway / delivery / reservation) and, when a reservation is being
// placed, the in-flight reservation draft so the cart panel and the booking
// widget can stay in sync across routes.
//
// The booking widget owns the mode tabs; OrderBar/order page read the mode to
// decide where the "Confirmar pedido" CTA leads. Persisting via useState keeps
// the choice across navigation between /bio, /menu and /reviews — the user
// shouldn't have to re-pick after switching tabs in the sidebar.
//
// Reservation + pre-order linkage: when the user enables "Añadir tu pedido" on
// a reservation, the booking is placed first; once the backend returns a
// bookingId we stash it here so the subsequent order place (OrderTypeEnum.
// TableBooking = 6) can carry it through.

export type CheckoutMode = 'takeaway' | 'delivery' | 'reservation'

export interface ReservationDraft {
  date?: Date
  shiftId?: string
  seats?: number
  salaId?: string
}

export function useCheckoutMode() {
  // Default 'reservation' so the bio's BookingWidget mounts on the calendar
  // (matches the pre-composable behavior). Carts switch the mode explicitly
  // when the user picks "Para llevar"/"A domicilio" or toggles
  // "Añadir tu pedido a la reserva" — never auto-switched here.
  const mode = useState<CheckoutMode>('checkout-mode', () => 'reservation')
  const reservationDraft = useState<ReservationDraft>('checkout-reservation-draft', () => ({}))
  // True when the user explicitly toggles "Añadir tu pedido a la reserva" on
  // top of a booking. Gated on bookingPreOrder.enabled (config) + orderCount>0;
  // when false a reservation submits as a standalone booking.
  const preOrderOnReservation = useState<boolean>('checkout-preorder-on-reservation', () => false)
  // Set after bookingApiClient.bookingPut succeeds in the linked-order flow.
  // The order place call reads this to attach the orderId to the booking.
  const linkedBookingId = useState<string | undefined>('checkout-linked-booking-id', () => undefined)

  function setMode(next: CheckoutMode) {
    mode.value = next
    if (next !== 'reservation') {
      preOrderOnReservation.value = false
    }
  }

  function resetReservation() {
    reservationDraft.value = {}
    preOrderOnReservation.value = false
    linkedBookingId.value = undefined
  }

  return {
    mode,
    reservationDraft,
    preOrderOnReservation,
    linkedBookingId,
    setMode,
    resetReservation,
  }
}
