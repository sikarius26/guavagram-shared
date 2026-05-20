import { ref, computed } from 'vue'
import {
  storeCreatorLeadsGet,
  storeCreatorLeadsStatsGet,
  storeCreatorLeadSendOffer,
  storeCreatorLeadsBulkSendOffer,
  type StoreCreatorLeadsStats,
} from '~/services/apis/api.client.store.leads'
import type { StoreCreatorLeadViewModel } from '~/services/apis/models/store-creator-lead-view-model'
import type { SendCreatorOfferRequest } from '~/services/apis/models/send-creator-offer-request'
import type { BulkOfferTemplate, BulkSendOfferResponse } from '~/services/apis/models/bulk-offer-template'
import { StoreCreatorLeadStatusEnum } from '~/services/apis/models/store-creator-lead-status-enum'

const leads = ref<StoreCreatorLeadViewModel[]>([])
const stats = ref<StoreCreatorLeadsStats>({ new: 0, offerSent: 0, accepted: 0 })
const loading = ref(false)
const currentStoreId = ref<string | null>(null)

export function useCreatorsWantingYou() {
  const newLeadsCount = computed(() =>
    leads.value.filter(l => l.status === StoreCreatorLeadStatusEnum.NEW).length
  )

  const newLeads = computed(() =>
    leads.value.filter(l => l.status === StoreCreatorLeadStatusEnum.NEW)
  )

  const loadLeads = async (storeId: string) => {
    currentStoreId.value = storeId
    loading.value = true
    try {
      const [list, s] = await Promise.all([
        storeCreatorLeadsGet(storeId),
        storeCreatorLeadsStatsGet(storeId),
      ])
      leads.value = list
      stats.value = s
    } finally {
      loading.value = false
    }
  }

  const sendOffer = async (request: SendCreatorOfferRequest) => {
    if (!currentStoreId.value) throw new Error('No store loaded')
    loading.value = true
    try {
      const res = await storeCreatorLeadSendOffer(currentStoreId.value, request)
      // Refresh so the lead shows its new OFFER_SENT status + badge counts update.
      await loadLeads(currentStoreId.value)
      return res
    } finally {
      loading.value = false
    }
  }

  const sendBulkOffer = async (leadIds: string[], template: BulkOfferTemplate): Promise<BulkSendOfferResponse> => {
    if (!currentStoreId.value) throw new Error('No store loaded')
    if (!leadIds.length) return { success: true, created: [], failed: [] }
    loading.value = true
    try {
      const res = await storeCreatorLeadsBulkSendOffer(currentStoreId.value, { leadIds, template })
      await loadLeads(currentStoreId.value)
      return res
    } finally {
      loading.value = false
    }
  }

  return {
    leads,
    stats,
    loading,
    newLeadsCount,
    newLeads,
    loadLeads,
    sendOffer,
    sendBulkOffer,
  }
}
