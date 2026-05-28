// Active table session — set when the visitor lands via a table-QR URL printed
// from Guava Platform (Tables.vue → tableShortFormatUrl/tableFormatUrl =
// /r/{slug}/table/{tableNumber|tableId}). Persisted in a cookie scoped to '/'
// (cookies without path get scoped to the directory of the document → switching
// /menu ↔ /order would lose it; see feedback_usecookie_explicit_path).
//
// Consumers:
//   - /r/[slug]/menu shows "Avisar al camarero" only when a table session is
//     active (the FAB next to the cart).
//   - Future: /order can attach the table number to the place call when the
//     backend session honours table-bound orders.

export interface TableSession {
  slug: string
  table: string
}

export function useTableSession() {
  const cookie = useCookie<TableSession | null>('guavagram-table-session', {
    path: '/',
    sameSite: 'lax',
    // 6 hours — covers a typical meal; long enough that a reload inside the
    // restaurant keeps the QR context, short enough that the next visitor on
    // the same device doesn't inherit a stale table.
    maxAge: 60 * 60 * 6,
    default: () => null,
  })

  function setTableSession(slug: string, table: string) {
    cookie.value = { slug, table }
  }

  function clearTableSession() {
    cookie.value = null
  }

  function hasSessionForSlug(slug: string): boolean {
    return !!cookie.value && cookie.value.slug === slug
  }

  return {
    tableSession: cookie,
    setTableSession,
    clearTableSession,
    hasSessionForSlug,
  }
}
