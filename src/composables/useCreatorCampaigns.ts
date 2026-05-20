import { ref } from 'vue'

export type CampaignKind = 'challenge' | 'giveaway' | 'voucher-drop'

export interface PublicCampaign {
  id: string
  handle: string
  kind: CampaignKind
  title: string
  description: string
  rewardLabel: string
  sponsorStore?: string
  code?: string
  startsAt: string
  endsAt: string
  capacity?: number
  requirements?: string
  createdAt: string
  participantCount: number
  hasJoined: boolean
  isWinner: boolean
  winnersCount: number
  status: 'upcoming' | 'active' | 'ended'
}

export interface CreateCampaignInput {
  kind: CampaignKind
  title: string
  description?: string
  rewardLabel?: string
  sponsorStore?: string
  code?: string
  startsAt?: string
  endsAt?: string
  capacity?: number
  requirements?: string
}

export function useCreatorCampaigns(handle: () => string) {
  const campaigns = ref<PublicCampaign[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function load() {
    const h = handle()
    if (!h) return
    loading.value = true
    error.value = null
    try {
      const res = await $fetch<PublicCampaign[]>(`/api/stubs/creators/${encodeURIComponent(h)}/campaigns`)
      campaigns.value = res || []
    } catch (e: any) {
      error.value = e?.message || 'Error cargando campañas'
    } finally {
      loading.value = false
    }
  }

  async function create(input: CreateCampaignInput) {
    const h = handle()
    if (!h) return
    await $fetch(`/api/stubs/creators/${encodeURIComponent(h)}/campaigns`, {
      method: 'POST',
      body: input,
    })
    await load()
  }

  async function remove(id: string) {
    await $fetch(`/api/stubs/campaigns/${encodeURIComponent(id)}`, { method: 'DELETE' })
    await load()
  }

  async function join(id: string) {
    const res = await $fetch<{ id: string; hasJoined: boolean; participantCount: number; code?: string }>(
      `/api/stubs/campaigns/${encodeURIComponent(id)}/join`,
      { method: 'POST' }
    )
    await load()
    return res
  }

  async function draw(id: string, winnersCount?: number) {
    const res = await $fetch<{ id: string; winners: string[]; winnersCount: number }>(
      `/api/stubs/campaigns/${encodeURIComponent(id)}/draw`,
      { method: 'POST', body: { winnersCount } }
    )
    await load()
    return res
  }

  return { campaigns, loading, error, load, create, remove, join, draw }
}
