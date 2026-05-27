import { computed, type WritableComputedRef } from 'vue'

/**
 * Shared active-tab state for dashboards, backed by the URL **path** (one route
 * per tab) instead of a `?tab=` query param. The default tab maps to the bare
 * `basePath` (e.g. `/dashboard`) and every other tab is `{basePath}/{key}`.
 *
 * - `get`  reads the current tab from `route.path` (locale prefix stripped).
 * - Writing `.value = '...'` does `router.push(localePath(target))` so the
 *   browser back button navigates between tabs as the user expects with real
 *   pages — and so middleware / page transitions actually fire.
 *
 * Example wiring in a layout:
 *   const activeTab = useDashboardTab<RestaurantTabKey>('/dashboard', 'home')
 */
export function useDashboardTab<T extends string = string>(
  basePath: string,
  defaultTab: T,
): WritableComputedRef<T> {
  const route = useRoute()
  const router = useRouter()
  const localePath = useLocalePath()

  // With i18n strategy `prefix_except_default`, the default locale has no
  // prefix while other locales prepend `/<code>`. Strip a leading 2-letter
  // segment so the path comparison is locale-agnostic.
  const stripLocale = (path: string): string => {
    const m = path.match(/^\/[a-z]{2}(?=\/|$)/)
    return m ? path.slice(m[0].length) : path
  }

  const currentTab = (): T => {
    const stripped = stripLocale(route.path) || '/'
    if (stripped !== basePath && !stripped.startsWith(`${basePath}/`)) return defaultTab
    const rest = stripped.slice(basePath.length).replace(/^\/+/, '').replace(/\/+$/, '')
    if (!rest) return defaultTab
    return rest.split('/')[0] as T
  }

  return computed<T>({
    get: currentTab,
    set: (value: T) => {
      if (value === currentTab()) return
      const target = value === defaultTab ? basePath : `${basePath}/${value}`
      router.push(localePath(target))
    },
  })
}
