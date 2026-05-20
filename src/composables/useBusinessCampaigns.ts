import { ref } from 'vue'
import { marketingApiClient } from '~/services/apis/api.client.marketing'
import { CampaignStatusEnum } from '~/services/apis/models/campaign-status-enum'

// Cross-agent note: CampaignViewModel, CampaignRequest, MarketingStatsViewModel
// are authored by Agent 1A. Using `any` until they land.
// TODO: swap for concrete types from campaign-*.ts / marketing-*.ts.

const active = ref<any[]>([])
const past = ref<any[]>([])
const stats = ref<any | null>(null)
const loading = ref(false)

const ACTIVE_STATUSES: CampaignStatusEnum[] = [
  CampaignStatusEnum.REQUESTED,
  CampaignStatusEnum.ACCEPTED,
  CampaignStatusEnum.IN_PROGRESS,
  CampaignStatusEnum.DELIVERED,
]

const PAST_STATUSES: CampaignStatusEnum[] = [
  CampaignStatusEnum.COMPLETED,
  CampaignStatusEnum.REJECTED,
  CampaignStatusEnum.CANCELED,
]

export function useBusinessCampaigns() {
  const loadAll = async () => {
    loading.value = true
    try {
      const all = await marketingApiClient.marketingCampaigns()
      active.value = all.filter((c: any) => ACTIVE_STATUSES.includes(c.status))
      past.value = all.filter((c: any) => PAST_STATUSES.includes(c.status))
    } finally {
      loading.value = false
    }
  }

  const createCampaign = async (req: any): Promise<any> => {
    loading.value = true
    try {
      const created = await marketingApiClient.marketingCampaignCreate(req)
      if (created) active.value = [created, ...active.value]
      return created
    } finally {
      loading.value = false
    }
  }

  const cancelCampaign = async (id: string): Promise<void> => {
    // Cancel is modelled as a status update → in dev we mutate locally; in
    // prod we'd call a dedicated endpoint once available.
    const found = active.value.find(c => c.id === id)
    if (found) {
      found.status = CampaignStatusEnum.CANCELED
      active.value = active.value.filter(c => c.id !== id)
      past.value = [found, ...past.value]
    }
    if (!import.meta.dev) {
      // TODO: call marketingApiClient.marketingCampaignCancel(id) when endpoint exists
      // eslint-disable-next-line no-console
      console.warn('[useBusinessCampaigns] cancelCampaign prod endpoint not yet implemented')
    }
  }

  const loadStats = async (storeId: string) => {
    loading.value = true
    try {
      stats.value = await marketingApiClient.marketingStats(storeId)
    } finally {
      loading.value = false
    }
  }

  return {
    active,
    past,
    stats,
    loading,
    loadAll,
    createCampaign,
    cancelCampaign,
    loadStats,
  }
}
