import { ref, computed } from 'vue'
import { marketplaceApiClient } from '~/services/apis/api.client.marketplace'
import type { CreatorMarketplaceFilter } from '~/services/apis/models/creator-marketplace-filter'

// Cross-agent note: `CreatorMarketplaceItem` and `CreatorDetailViewModel` are
// authored by Agent 1A. Using `any` until they land.
// TODO: replace `any` with concrete types from creator-*.ts once published.

const creators = ref<any[]>([])
const filters = ref<CreatorMarketplaceFilter>({})
const loading = ref(false)
const page = ref(1)
const totalPages = ref(1)
const selectedCreator = ref<any | null>(null)

let applyFiltersTimer: ReturnType<typeof setTimeout> | null = null

export function useCreatorMarketplace() {
  const loadMarketplace = async () => {
    loading.value = true
    try {
      const response = await marketplaceApiClient.marketplaceList(filters.value, page.value)
      creators.value = response?.items ?? []
      totalPages.value = response?.totalPages ?? 1
    } finally {
      loading.value = false
    }
  }

  const applyFilters = (next: CreatorMarketplaceFilter) => {
    filters.value = { ...next }
    page.value = 1
    if (applyFiltersTimer) clearTimeout(applyFiltersTimer)
    applyFiltersTimer = setTimeout(() => {
      void loadMarketplace()
    }, 250)
  }

  const loadCreatorDetail = async (handle: string) => {
    loading.value = true
    try {
      selectedCreator.value = await marketplaceApiClient.marketplaceDetail(handle)
      return selectedCreator.value
    } finally {
      loading.value = false
    }
  }

  const nextPage = async () => {
    if (page.value >= totalPages.value) return
    page.value++
    await loadMarketplace()
  }

  const prevPage = async () => {
    if (page.value <= 1) return
    page.value--
    await loadMarketplace()
  }

  const sortedCreators = computed(() => {
    const now = Date.now()
    return [...creators.value].sort((a, b) => {
      const aBoost = a?.boostedUntil && new Date(a.boostedUntil).getTime() > now ? 1 : 0
      const bBoost = b?.boostedUntil && new Date(b.boostedUntil).getTime() > now ? 1 : 0
      if (aBoost !== bBoost) return bBoost - aBoost
      const aLvl = a?.level?.level ?? 0
      const bLvl = b?.level?.level ?? 0
      if (aLvl !== bLvl) return bLvl - aLvl
      const aRating = a?.rating ?? 0
      const bRating = b?.rating ?? 0
      if (aRating !== bRating) return bRating - aRating
      return (b?.completedCampaigns ?? 0) - (a?.completedCampaigns ?? 0)
    })
  })

  return {
    creators,
    filters,
    loading,
    page,
    totalPages,
    selectedCreator,
    sortedCreators,
    loadMarketplace,
    applyFilters,
    loadCreatorDetail,
    nextPage,
    prevPage,
  }
}
