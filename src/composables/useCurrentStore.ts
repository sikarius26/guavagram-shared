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

export function useCurrentStore() {
  const selectedStoreId = useCookie<string | null>('current_store_id', { default: () => null })

  const load = async (force = false) => {
    if (stores.value.length && !force) return currentStore.value
    isLoading.value = true
    try {
      // In dev we skip the backend entirely (no API server running) and use
      // the demo stores. In prod, race the fetch against a 1.5 s timeout so a
      // hanging endpoint never freezes the whole dashboard (Promise.race +
      // catch is the proven pattern from GuavagramPanel.load()).
      let fetched: DashboardStoreInfo[] | null = null
      if (import.meta.dev) {
        // Build instances without calling `.fromJS` to avoid any risk of the
        // dynamic helper barfing during SSR. Plain object cast is enough —
        // downstream code only reads the four fields we set here.
        fetched = DEV_STORES.map(s => Object.assign(new DashboardStoreInfo(), s)) as DashboardStoreInfo[]
      } else {
        const timeout = new Promise<DashboardStoreInfo[] | null>((resolve) => setTimeout(() => resolve(null), 1500))
        fetched = await Promise.race([
          dashboardApiClient.dashboardStores().catch(() => null),
          timeout,
        ])
      }
      stores.value = fetched ?? []
      // Group inference is still best-effort: stores belonging to the same brand
      // get bucketed under a single virtual group keyed by the leading prefix
      // before " · " (matches the real Pau Artiso pattern). Replace once the
      // backend exposes a proper StoreGroup table.
      groups.value = inferGroups(stores.value)
      const preferred = stores.value.find(s => s.storeId === selectedStoreId.value)
      currentStore.value = preferred ?? stores.value[0] ?? null
      if (currentStore.value) selectedStoreId.value = currentStore.value.storeId ?? null
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
    const target = stores.value.find(s => s.storeId === storeId)
    if (!target) return
    currentStore.value = target
    selectedStoreId.value = storeId
    isGroupView.value = false
    currentGroupId.value = null
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
    isLoading, load, switchStore, switchToGroup
  }
}
