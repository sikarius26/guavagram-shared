import { ref, computed } from 'vue'
import { dashboardApiClient } from '~/services/apis/api.client.dashboard'
import { DashboardStoreInfo } from '~/services/apis/models/dashboard-store-info'

// Dev-only demo stores. Lets the developer browse /menu, /bio, /reviews and
// the dashboard end-to-end without a backend. The slugs match the dev mock
// in `publicMenu.mock.ts` / `storeBio.mock.ts` so deep-links keep working.
const DEV_STORES: { storeId: string; slugName: string; displayName: string; logoUrl?: string }[] = [
  { storeId: 'pau-artiso-demo', slugName: 'pau-artiso-demo', displayName: 'Demo Store', logoUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=200&fit=crop&q=80&auto=format' },
  { storeId: 'pau-artiso-bcn',  slugName: 'pau-artiso-bcn',  displayName: 'Barcelona Centro', logoUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=200&h=200&fit=crop&q=80&auto=format' },
  { storeId: 'pau-artiso-mad',  slugName: 'pau-artiso-mad',  displayName: 'Madrid Sol', logoUrl: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=200&h=200&fit=crop&q=80&auto=format' },
]

export interface StoreGroup {
  groupId: string
  name: string
  slug: string
  storeIds: string[]
  logoUrl?: string
}

const stores = ref<DashboardStoreInfo[]>([])
const groups = ref<StoreGroup[]>([])
const currentStore = ref<DashboardStoreInfo | null>(null)
const isGroupView = ref(false)
const currentGroupId = ref<string | null>(null)
const isLoading = ref(false)

// Optional override — set by admin (`guavagram-admin/app/plugins/v4-auth.client`)
// to route the stores list through /platform `userCurrent().mappedStores`
// instead of /web `dashboardStores`. The /platform client lives in admin-only,
// hence the injection. Returns DashboardStoreInfo[] or null on failure (we
// then fall back to /web).
type StoresResolver = () => Promise<DashboardStoreInfo[] | null>
let customStoresResolver: StoresResolver | null = null
export function setStoresResolver(resolver: StoresResolver | null) {
  customStoresResolver = resolver
}

// Optional live-search resolver — admin wires this to /platform
// `storeAutocomplete(query)`, which talks to the same role-gated endpoint
// GuavaPlatform's own selector uses (so an admin user can find any store in
// the tenant, not just the prefetched ones). Falls back to local filter when
// not registered (consumer app / no admin clients available).
type StoresSearchResolver = (query: string) => Promise<DashboardStoreInfo[]>
let customStoresSearchResolver: StoresSearchResolver | null = null
export function setStoresSearchResolver(resolver: StoresSearchResolver | null) {
  customStoresSearchResolver = resolver
}

// Rich persisted-store payload. Keeps everything we need to rehydrate the
// switcher BEFORE the stores list comes back from /platform, so a reload
// (or a slow/failed fetch) doesn't drop the user back to "sin restaurante".
interface PersistedStore {
  storeId: string
  displayName?: string
  slugName?: string
  logoUrl?: string
}
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year — survives browser close

export function useCurrentStore() {
  // Rich cookie (current). Persistent (1y) so it survives browser restarts.
  const persistedStore = useCookie<PersistedStore | null>('current_store', {
    default: () => null,
    maxAge: COOKIE_MAX_AGE,
  })
  // Legacy cookie — older sessions only saved the id. Read on first boot so
  // returning users don't lose their selection on the cookie upgrade.
  const legacyStoreId = useCookie<string | null>('current_store_id', {
    default: () => null,
    maxAge: COOKIE_MAX_AGE,
  })

  // Immediate rehydration: if the in-memory `currentStore` is still null
  // (first call after a reload), reconstruct it from the cookie so the
  // switcher renders the right store on the very first paint, without
  // waiting for /platform. `load()` later replaces this with the fresh
  // fetched object once the list arrives.
  if (!currentStore.value && persistedStore.value?.storeId) {
    const info = new DashboardStoreInfo()
    info.storeId = persistedStore.value.storeId
    info.displayName = persistedStore.value.displayName || ''
    info.slugName = persistedStore.value.slugName
    info.logoUrl = persistedStore.value.logoUrl
    currentStore.value = info
  }

  // Write everything we know about the active store back to the cookie.
  const persist = (s: DashboardStoreInfo | null) => {
    if (!s?.storeId) return
    persistedStore.value = {
      storeId: s.storeId,
      displayName: s.displayName,
      slugName: s.slugName,
      logoUrl: s.logoUrl,
    }
    legacyStoreId.value = s.storeId
  }

  const load = async (force = false) => {
    if (stores.value.length && !force) return currentStore.value
    isLoading.value = true
    try {
      // Race /web dashboardStores against a 1.5 s timeout so a slow/401'd
      // API doesn't freeze the dashboard. dashboardStores already respects
      // user permissions — admins get every store they manage, regular users
      // get only theirs — so Guavagram inherits the access model without
      // re-implementing role checks. /platform's userCurrent.mappedStores
      // could give us the same thing without the legacy bearer dance, but
      // its NSwag client lives in admin-only (not shared), so admin code
      // that wants to bypass /web can register a resolver via `setStoresResolver`.
      const timeout = new Promise<DashboardStoreInfo[] | null>((resolve) => setTimeout(() => resolve(null), 1500))
      let fetched: DashboardStoreInfo[] | null = null
      if (customStoresResolver) {
        try {
          fetched = await Promise.race([customStoresResolver(), timeout])
        } catch (err: any) {
          console.warn('[useCurrentStore] custom resolver failed', err?.status ?? err?.response?.status)
        }
      }
      if (!fetched || fetched.length === 0) {
        fetched = await Promise.race([
          dashboardApiClient.dashboardStores().catch((err: any) => {
            console.warn('[useCurrentStore] dashboardStores failed', err?.status ?? err?.response?.status)
            return null
          }),
          timeout,
        ])
      }
      if ((!fetched || fetched.length === 0) && import.meta.env?.VITE_USE_MOCK === 'true') {
        // Demo stores ONLY when mocks are explicitly enabled (VITE_USE_MOCK).
        // In normal dev we deliberately do NOT inject these — showing fake
        // stores silently masked real failures (e.g. an admin whose stores
        // weren't being fetched). An empty switcher is the honest state.
        console.log('[useCurrentStore] backend empty + VITE_USE_MOCK → using DEV_STORES')
        fetched = DEV_STORES.map(s => Object.assign(new DashboardStoreInfo(), s)) as DashboardStoreInfo[]
      }
      stores.value = fetched ?? []
      // Group inference is still best-effort: stores belonging to the same brand
      // get bucketed under a single virtual group keyed by the leading prefix
      // before " · " (matches the real Pau Artiso pattern). Replace once the
      // backend exposes a proper StoreGroup table.
      groups.value = inferGroups(stores.value)
      // Resolve the active store, in order of preference:
      //  1) cookie-persisted store id (rich cookie, then legacy id fallback)
      //     matched against the fresh fetched list — preferred path on reload.
      //  2) the cookie-hydrated `currentStore` itself, kept as-is if the
      //     fetched list didn't contain it (auth race, store removed from
      //     the user's grants, partial page from autocomplete, etc.). This
      //     is what stops the switcher from collapsing to "sin restaurante"
      //     after a reload when the API roundtrip is slow or empty.
      //  3) first store in the fetched list, only if we have NOTHING else.
      const lookupId = persistedStore.value?.storeId || legacyStoreId.value
      const preferred = lookupId ? stores.value.find(s => s.storeId === lookupId) : undefined
      if (preferred) {
        currentStore.value = preferred
      } else if (!currentStore.value && stores.value[0]) {
        currentStore.value = stores.value[0]
      }
      persist(currentStore.value)
      return currentStore.value
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Best-effort grouping of stores by the leading "Brand · Location" prefix.
   * Single-store owners get no group. Replace with a real Stores→Group join
   * when the backend ships StoreGroup support.
   */
  const inferGroups = (list: DashboardStoreInfo[]): StoreGroup[] => {
    const buckets = new Map<string, DashboardStoreInfo[]>()
    for (const s of list) {
      const name = s.displayName ?? ''
      const prefix = name.includes(' · ') ? name.split(' · ')[0]!.trim() : name
      if (!buckets.has(prefix)) buckets.set(prefix, [])
      buckets.get(prefix)!.push(s)
    }
    return Array.from(buckets.entries())
      .filter(([, stores]) => stores.length > 1)
      .map(([prefix, stores], i) => ({
        groupId: `grp-${i}`,
        name: prefix,
        slug: prefix.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        storeIds: stores.map(s => s.storeId!),
      }))
  }

  const switchStore = (storeId: string) => {
    // Prefer the prefetched stores list, fall back to search results so the
    // user can switch to a store that wasn't in the initial fetch (admins
    // with hundreds of stores get paginated/top-N from autocomplete).
    const target =
      stores.value.find(s => s.storeId === storeId) ||
      searchResults.value.find(s => s.storeId === storeId)
    if (!target) return
    // Make sure it sticks around in `stores` so reads from currentStore
    // (used by other panels) don't lose it.
    if (!stores.value.find(s => s.storeId === storeId)) {
      stores.value = [target, ...stores.value]
    }
    currentStore.value = target
    persist(target)
    isGroupView.value = false
    currentGroupId.value = null
  }

  // Live store search — admin's autocomplete returns role-gated matches from
  // the backend (handles tenants with thousands of stores where prefetching
  // all of them is impractical). No-op fallback: local substring filter over
  // the already-loaded `stores`.
  const searchResults = ref<DashboardStoreInfo[]>([])
  const isSearching = ref(false)
  const searchStores = async (query: string): Promise<DashboardStoreInfo[]> => {
    const q = (query || '').trim()
    if (customStoresSearchResolver) {
      try {
        isSearching.value = true
        const r = await customStoresSearchResolver(q)
        searchResults.value = r
        return r
      } catch (err: any) {
        console.warn('[useCurrentStore] searchStores failed', err?.status ?? err?.response?.status)
        searchResults.value = []
        return []
      } finally {
        isSearching.value = false
      }
    }
    // Local fallback: filter prefetched list.
    const lower = q.toLowerCase()
    const filtered = lower
      ? stores.value.filter(s => (s.displayName || '').toLowerCase().includes(lower))
      : stores.value
    searchResults.value = filtered
    return filtered
  }

  const switchToGroup = (groupId: string) => {
    const grp = groups.value.find(g => g.groupId === groupId)
    if (!grp) return
    isGroupView.value = true
    currentGroupId.value = groupId
  }

  const currentGroup = computed(() => {
    if (!currentStore.value) return null
    return groups.value.find(g => g.storeIds.includes(currentStore.value!.storeId!)) || null
  })

  const groupStores = computed(() => {
    if (!currentGroup.value) return []
    return stores.value.filter(s => currentGroup.value!.storeIds.includes(s.storeId!))
  })

  const activeGroup = computed(() => currentGroupId.value ? groups.value.find(g => g.groupId === currentGroupId.value) || null : null)
  const activeGroupStores = computed(() => {
    if (!activeGroup.value) return []
    return stores.value.filter(s => activeGroup.value!.storeIds.includes(s.storeId!))
  })

  return {
    stores, groups, currentStore, currentGroup, groupStores,
    isGroupView, currentGroupId, activeGroup, activeGroupStores,
    isLoading, load, switchStore, switchToGroup,
    searchStores, searchResults, isSearching,
  }
}
