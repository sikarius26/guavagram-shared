import { ref, computed } from 'vue'
import { publicLoyaltyApiClient } from '~/services/apis/api.client.publicloyalty'
import { dashboardApiClient } from '~/services/apis/api.client.dashboard'
import { LoyaltyCardScanRequest } from '~/services/apis/models/loyalty-card-scan-request'
import { LoyaltyCardRedeemRequest } from '~/services/apis/models/loyalty-card-redeem-request'
import type { LoyaltyCardViewModel } from '~/services/apis/models/loyalty-card-view-model'

/**
 * Loyalty card composable — covers both consumer-facing flows
 * (`join`, `card`, `walletApple`, `walletGoogle`) and the dashboard
 * scan/redeem flow used by restaurant operators. Backend lives in
 * webapi/Services/LoyaltyCardService.cs; QR contents are HMAC-signed
 * tokens, not raw customer ids.
 */
export function useLoyalty() {
  const card = ref<LoyaltyCardViewModel | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isComplete = computed(() => !!card.value?.isComplete)
  const stamps = computed(() => card.value?.stamps ?? 0)
  const stampsRequired = computed(() => card.value?.stampsRequired ?? 10)

  const join = async (slug: string) => {
    loading.value = true
    error.value = null
    try {
      card.value = await publicLoyaltyApiClient.publicStoreLoyaltyJoin(slug)
      return card.value
    } catch (e: any) {
      error.value = e?.message || 'No se pudo unir al programa'
      throw e
    } finally {
      loading.value = false
    }
  }

  const fetchCard = async (slug: string) => {
    loading.value = true
    error.value = null
    try {
      card.value = await publicLoyaltyApiClient.publicStoreLoyaltyCard(slug)
      return card.value
    } catch (e: any) {
      // 404 = not joined yet — clear card silently
      if (e?.status === 404) { card.value = null; return null }
      error.value = e?.message || 'No se pudo cargar la tarjeta'
      throw e
    } finally {
      loading.value = false
    }
  }

  const downloadAppleWalletPass = async (slug: string) => {
    const file = await publicLoyaltyApiClient.publicStoreLoyaltyWalletApple(slug)
    const url = URL.createObjectURL(file.data)
    const a = document.createElement('a')
    a.href = url
    a.download = file.fileName || `guavagram-${slug}.pkpass`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const openGoogleWalletSaveUrl = async (slug: string) => {
    const url = await publicLoyaltyApiClient.publicStoreLoyaltyWalletGoogle(slug)
    window.location.href = url
  }

  // Dashboard side ─────────────────────────────────────────────────────────

  const scan = async (storeId: string, token: string) => {
    const req = new LoyaltyCardScanRequest()
    req.token = token
    return dashboardApiClient.dashboardLoyaltyScan(storeId, req)
  }

  const redeem = async (storeId: string, token: string) => {
    const req = new LoyaltyCardRedeemRequest()
    req.token = token
    return dashboardApiClient.dashboardLoyaltyRedeem(storeId, req)
  }

  return {
    card, loading, error, isComplete, stamps, stampsRequired,
    join, fetchCard, downloadAppleWalletPass, openGoogleWalletSaveUrl,
    scan, redeem,
  }
}
