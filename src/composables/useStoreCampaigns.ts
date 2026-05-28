import { computed, ref } from 'vue'
import type { CampaignSchedule } from './useCampaignSchedule'
import { emptySchedule, isScheduleActiveNow } from './useCampaignSchedule'
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
  // What the card does when tapped on the public bio:
  //   'menu'     → opens the menu (optionally a linked dish via linkedItemId)
  //   'combo'    → opens the linked bundle/combo (linkedBundleId)
  //   'discount' → opens the menu with the linked real promotion (promotionId)
  //                surfaced — claim voucher (QR/Apple/Google Wallet) + the
  //                order-level discount. Falls back to 'menu' when unset.
  kind?: 'menu' | 'combo' | 'discount'
  // For kind='menu' the campaign card must point somewhere actionable on the
  // public bio. `linkTarget` makes the three valid destinations explicit so
  // the editor can't save an unbound "free text" card that would render a
  // dead CTA. Defaults to 'menu' (whole carta) when unset for back-compat
  // with campaigns saved before this field existed.
  //   'menu'    → opens /r/{slug}/menu
  //   'booking' → opens the booking flow (/booking)
  //   'item'    → opens /menu?item=<linkedItemId> (item picker required)
  linkTarget?: 'menu' | 'booking' | 'item'
  // Multi-item link: when `linkedItemIds` has 2+ entries the card opens the
  // menu (the renderer can't surface multiple dishes in one card slot). With
  // exactly one entry it behaves like the legacy single-item link. The
  // single `linkedItemId` field is kept mirrored to `linkedItemIds[0]` so
  // older readers (renderer / public menu) keep working without changes.
  linkedItemIds?: string[]
  linkedItemId?: string
  linkedBundleId?: string
  // Real GuavaPlatform promotion id (from /public/store/{slug}/promotions).
  // Binds a discount card to the actual voucher/discount engine instead of
  // being a purely decorative "-10%" label.
  promotionId?: string
  // Cupón code that the visitor types in the cart to activate the discount
  // (kind='discount' only). When linked to a real promotion (`promotionId`),
  // this mirrors the backend's PromotionViewModel.code so the public bio +
  // cart can validate without an extra round trip. When NOT linked, the code
  // lives only here in brandingSettings — a stopgap until GuavaPlatform
  // exposes promotion CRUD endpoints. Case-insensitive match (uppercase by
  // convention) is the rule in the cart resolver.
  couponCode?: string
  // Per-product discount (kind='discount'). `discountItemIds` scopes which
  // dishes show the struck price in the bio + menu; empty/undefined = whole
  // menu. Consumed by useCampaignDiscounts on the public side.
  discountPct?: number
  discountItemIds?: string[]
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

// Empty seed by convention: campaigns must come from the selected store's
// brandingSettings.campaigns (persisted via storeProfileApiClient). Hardcoded
// starter campaigns would leak mock data into restaurants that never created
// them — admin and public would diverge.
const makeSeed = (): StoreCampaign[] => []

// Module-scoped so every call to useStoreCampaigns() returns the same ref.
// Persistence is wired up from the admin side (see GuavagramPanel) which
// attaches a deep watcher and pushes through storeProfileApiClient. Shared
// can't reach admin-only modules so we just expose a hook.
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
