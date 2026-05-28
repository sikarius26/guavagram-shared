import { type Ref } from 'vue'
import { http } from '~/services/apis/api.client.shared'
import { StoreProfileViewModel } from '~/services/apis/models/store-profile-view-model'

// Persists bio/booking config to the Guava /platform store-profile endpoint
// FROM THE PUBLIC APP (:3003), so an owner editing reservas from /r/[slug]
// actually round-trips to the same place admin's GuavagramPanel saves to
// (`storeprofile/{storeId}/profile`). Plugs into `useBioConfig`'s sync slot
// (fetchProfile + putProfile) — see useBioConfig.BioConfigSync.
//
// Why not import admin's storeProfileApiClient: it's an admin-local NSwag
// client (1100+ lines, aliased only inside guavagram-admin). Reusing the
// shared `http` instance (which auto-attaches the owner's JWT via its request
// interceptor) keeps the public app free of admin internals.
//
// Dev vs prod base:
//  · dev  → same-origin `/platform/...` so Nitro's devProxy forwards it to
//    test-api WITHOUT a CORS preflight (cross-origin writes are 408-blocked,
//    same trap admin hit — see feedback_admin_cors_dev_proxy). Requires the
//    `nitro.devProxy['/platform']` entry in guavagram/nuxt.config.ts.
//  · prod → runtimeConfig.public.platformApiBase directly.
//
// `canManage` gates reads: a non-owner visitor has no business hitting
// /platform (it would 401), so fetchProfile returns null for them and
// useBioConfig falls through to its public `publicStoreProfile` read. Writes
// only ever fire on owner edits, so putProfile needs no extra guard.

export interface PlatformProfileShape {
  description?: string
  logoUrl?: string
  accentColor?: string
  useDarkMode?: boolean
  phoneNumber?: string
  brandingSettings?: any
}

export function useStoreProfilePlatformSync(
  storeId: Ref<string | null | undefined>,
  canManage: Ref<boolean>,
) {
  const base = import.meta.dev
    ? '/platform'
    : ((useRuntimeConfig().public.platformApiBase as string) || '/platform')

  const profileUrl = (id: string) => `${base}/storeprofile/${encodeURIComponent(id)}/profile`

  // Cached last-known profile so writes can merge into the existing
  // brandingSettings bag instead of clobbering keys this editor doesn't touch
  // (campaigns, bookingPromos, future fields). Mirrors admin's cachedStoreProfile.
  let cached: any = null

  const fetchProfile = async (id: string): Promise<PlatformProfileShape | null> => {
    if (!canManage.value) return null
    const res = await http.get(profileUrl(id))
    cached = res?.data ?? null
    return cached
  }

  const putProfile = async (id: string, profile: PlatformProfileShape): Promise<void> => {
    if (!cached) {
      try { cached = (await http.get(profileUrl(id)))?.data ?? {} }
      catch { cached = {} }
    }
    const brandingSettings = {
      ...((cached?.brandingSettings) || {}),
      ...((profile?.brandingSettings) || {}),
    }
    const payload = (StoreProfileViewModel as any).fromJS({
      ...(cached || {}),
      ...(profile || {}),
      brandingSettings,
    })
    await http.post(profileUrl(id), payload)
    cached = payload
  }

  // `storeId` is handed back as the reactive Ref — useBioConfig.resolveStoreId
  // unwraps it at call time, so the (async) store fetch can resolve the id
  // after this sync object is registered.
  return { storeId, fetchProfile, putProfile }
}
