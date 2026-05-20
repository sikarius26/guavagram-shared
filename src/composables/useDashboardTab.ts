import { computed, type WritableComputedRef } from 'vue'

/**
 * Shared active-tab state for dashboards, backed by the URL query param `?tab=`.
 * - Reads from `route.query.tab` so a refresh / shared link preserves the tab.
 * - Writing `.value = '...'` calls `router.replace` to sync the URL.
 * - When the value equals `defaultTab`, the param is dropped to keep the URL clean.
 *
 * The `persona` argument is unused at runtime but kept for call-site clarity
 * (it documents which dashboard the tab belongs to).
 */
export function useDashboardTab<T extends string = string>(
  _persona: string,
  defaultTab: T,
): WritableComputedRef<T> {
  const route = useRoute()
  const router = useRouter()

  return computed<T>({
    get: () => {
      const raw = route.query.tab
      const value = Array.isArray(raw) ? raw[0] : raw
      return ((value || defaultTab) as T)
    },
    set: (value: T) => {
      const current = route.query.tab
      const currentStr = Array.isArray(current) ? current[0] : current
      if (value === defaultTab && !currentStr) return
      if (value === currentStr) return
      const nextQuery = { ...route.query }
      if (value === defaultTab) {
        delete nextQuery.tab
      } else {
        nextQuery.tab = value
      }
      router.replace({ query: nextQuery })
    },
  })
}
