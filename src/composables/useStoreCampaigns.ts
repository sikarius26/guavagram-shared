import { computed, ref } from 'vue'
import type { CampaignSchedule } from './useCampaignSchedule'
import { emptySchedule, isScheduleActiveNow, parseSchedule } from './useCampaignSchedule'
import { marketingApiClient } from '~/services/apis/api.client.marketing'
import { CampaignStatusEnum } from '~/services/apis/models/campaign-status-enum'

// Single source of truth for a restaurant's campaigns.
// A StoreCampaign covers both the bio promo card (Menú del día, Happy Hour…)
// and the optional creator-collab tracking (status, metrics). The same entity
// is consumed by GuavagramPanel (bio editor) and MarketingPanel > MyCampaigns.

export type StoreCampaignCollab = {
  status: CampaignStatusEnum
  creatorHandle?: string
  creatorName?: string
  creatorImageUrl?: string
  pickTitle?: string
  brief?: string
  startDate?: string | Date
  endDate?: string | Date
  totalCostEur?: number
  metrics?: { bookings?: number; clicks?: number; redemptions?: number; roiPct?: number }
}

export type StoreCampaign = {
  id: string
  // Bio promo card
  title: string
  subtitle: string
  price: string
  badge: string
  schedule: CampaignSchedule
  cta: string
  colorIdx: number
  layout: string
  icon: string
  linkedItemId?: string
  bioVisible: boolean
  // Free plan: only the "menú del día" campaign can be active on the bio.
  // The flag is semantic so renaming the title doesn't lose the free tier.
  isMenuDelDia?: boolean
  // Optional creator collab attached to the same campaign
  collab?: StoreCampaignCollab
}

const ACTIVE_COLLAB_STATUSES: CampaignStatusEnum[] = [
  CampaignStatusEnum.REQUESTED,
  CampaignStatusEnum.ACCEPTED,
  CampaignStatusEnum.IN_PROGRESS,
  CampaignStatusEnum.DELIVERED,
]

const PAST_COLLAB_STATUSES: CampaignStatusEnum[] = [
  CampaignStatusEnum.COMPLETED,
  CampaignStatusEnum.REJECTED,
  CampaignStatusEnum.CANCELED,
]

export const nextCampaignId = (): string =>
  `cmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const makeSeed = (): StoreCampaign[] => [
  {
    id: nextCampaignId(),
    title: 'MENÚ DEL DÍA', subtitle: 'Primer plato + segundo + bebida', price: '14,90€', badge: 'HOY',
    schedule: parseSchedule('Lun-Vie'), cta: 'Ver menú', colorIdx: 0, layout: 'split', icon: 'mdi-silverware-fork-knife',
    linkedItemId: undefined, bioVisible: true, isMenuDelDia: true,
  },
  {
    id: nextCampaignId(),
    title: '-10%', subtitle: 'En tu primera reserva.\nSin condiciones.', price: '', badge: 'Nuevo',
    schedule: emptySchedule(), cta: 'Activar descuento', colorIdx: 5, layout: 'bold', icon: 'mdi-tag-outline',
    linkedItemId: undefined, bioVisible: true,
  },
  {
    id: nextCampaignId(),
    title: 'HAPPY HOUR', subtitle: '2x1 en cocktails y tapas.', price: '', badge: '',
    schedule: parseSchedule('18:00 - 20:00'), cta: 'Ver ofertas', colorIdx: 2, layout: 'ambient', icon: 'mdi-glass-cocktail',
    linkedItemId: undefined, bioVisible: true,
  },
]

// Module-scoped so every call to useStoreCampaigns() returns the same ref.
const campaigns = ref<StoreCampaign[]>(makeSeed())
const collabsLoaded = ref(false)
const loading = ref(false)

export function useStoreCampaigns() {
  const bioCampaigns = computed(() => campaigns.value.filter(c => c.bioVisible))
  const activeCollabs = computed(() =>
    campaigns.value.filter(c => c.collab && ACTIVE_COLLAB_STATUSES.includes(c.collab.status)))
  const pastCollabs = computed(() =>
    campaigns.value.filter(c => c.collab && PAST_COLLAB_STATUSES.includes(c.collab.status)))
  const bioCampaignsActiveNow = computed(() =>
    bioCampaigns.value.filter(c => isScheduleActiveNow(c.schedule)))

  const loadCollabs = async (force = false): Promise<void> => {
    if (collabsLoaded.value && !force) return
    loading.value = true
    try {
      const api = await marketingApiClient.marketingCampaigns()
      for (const raw of api) {
        const collab: StoreCampaignCollab = {
          status: raw.status,
          creatorHandle: raw.creatorHandle,
          creatorName: raw.creatorName,
          creatorImageUrl: raw.creatorImageUrl,
          pickTitle: raw.pickTitle ?? raw.brief,
          brief: raw.brief,
          startDate: raw.startDate ?? raw.createdAt,
          endDate: raw.endDate ?? raw.deliveryAt,
          totalCostEur: raw.totalCostEur ?? raw.priceEur,
          metrics: raw.metrics,
        }
        const existing = campaigns.value.find(c => c.id === raw.id)
        if (existing) {
          existing.collab = collab
        } else {
          campaigns.value.push({
            id: raw.id || nextCampaignId(),
            title: raw.storeName || raw.creatorName || raw.creatorHandle || 'Campaña',
            subtitle: raw.brief || '',
            price: '',
            badge: '',
            schedule: emptySchedule(),
            cta: '',
            colorIdx: 0,
            layout: 'split',
            icon: 'mdi-bullhorn-outline',
            bioVisible: false,
            collab,
          })
        }
      }
      collabsLoaded.value = true
    } finally {
      loading.value = false
    }
  }

  const addCampaign = (patch: Partial<StoreCampaign> = {}): StoreCampaign => {
    const c: StoreCampaign = {
      id: nextCampaignId(),
      title: 'NUEVA CAMPAÑA',
      subtitle: 'Descripción breve',
      price: '',
      badge: 'Nuevo',
      schedule: emptySchedule(),
      cta: 'Ver más',
      colorIdx: 0,
      layout: 'split',
      icon: 'mdi-tag-outline',
      bioVisible: true,
      isMenuDelDia: false,
      ...patch,
    }
    campaigns.value.push(c)
    return c
  }

  const removeCampaign = (id: string): void => {
    const idx = campaigns.value.findIndex(c => c.id === id)
    if (idx >= 0) campaigns.value.splice(idx, 1)
  }

  const updateCampaign = (id: string, patch: Partial<StoreCampaign>): void => {
    const c = campaigns.value.find(x => x.id === id)
    if (c) Object.assign(c, patch)
  }

  return {
    campaigns,
    bioCampaigns,
    bioCampaignsActiveNow,
    activeCollabs,
    pastCollabs,
    loading,
    loadCollabs,
    addCampaign,
    removeCampaign,
    updateCampaign,
  }
}
