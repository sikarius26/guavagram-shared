import { computed } from 'vue'
import type { DiscoveryEntity, DiscoveryFilterValues } from './useDiscoveryData'

type FilterKey = 'city' | 'cuisine' | 'expertise' | 'search'

const QUERY_KEY: Record<FilterKey, string> = {
  city: 'city',
  cuisine: 'cuisine',
  expertise: 'expertise',
  search: 'q',
}

export function useDiscoveryFilters(options: { defaultEntity?: DiscoveryEntity } = {}) {
  const route = useRoute()
  const router = useRouter()
  const defaultEntity: DiscoveryEntity = options.defaultEntity ?? 'creators'

  const entity = computed<DiscoveryEntity>(() => {
    const k = route.query.kind
    if (k === 'restaurants') return 'restaurants'
    if (k === 'creators') return 'creators'
    return defaultEntity
  })

  const filters = computed<DiscoveryFilterValues>(() => ({
    city:      typeof route.query.city      === 'string' && route.query.city      ? route.query.city      : undefined,
    cuisine:   typeof route.query.cuisine   === 'string' && route.query.cuisine   ? route.query.cuisine   : undefined,
    expertise: typeof route.query.expertise === 'string' && route.query.expertise ? route.query.expertise : undefined,
    search:    typeof route.query.q         === 'string' && route.query.q         ? route.query.q         : undefined,
  }))

  const activeCount = computed(() => {
    const f = filters.value
    return [f.city, f.cuisine, f.expertise].filter(Boolean).length
  })

  function updateQuery(patch: Record<string, string | undefined>) {
    const next: Record<string, any> = { ...route.query, ...patch }
    for (const k of Object.keys(next)) {
      if (next[k] === undefined || next[k] === null || next[k] === '') delete next[k]
    }
    router.replace({ query: next })
  }

  function setEntity(value: DiscoveryEntity) {
    updateQuery({ kind: value === defaultEntity ? undefined : value })
  }

  function setFilter(key: FilterKey, value: string | undefined) {
    updateQuery({ [QUERY_KEY[key]]: value || undefined })
  }

  function clearFilter(key: FilterKey) {
    setFilter(key, undefined)
  }

  function clearAll() {
    updateQuery({
      [QUERY_KEY.city]: undefined,
      [QUERY_KEY.cuisine]: undefined,
      [QUERY_KEY.expertise]: undefined,
      [QUERY_KEY.search]: undefined,
    })
  }

  return { entity, filters, activeCount, setEntity, setFilter, clearFilter, clearAll }
}
