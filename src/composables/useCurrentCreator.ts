import { ref } from 'vue'
import { creatorApiClient } from '~/services/apis/api.client.creator'
import { userApiClient } from '~/services/apis/api.client.user'
import type { CreatorLevelViewModel } from '~/services/apis/models/creator-level-view-model'
import { currentCreatorMock, getMockLevel } from '~/services/apis/mocks/creatorMarketplace.mock'
import { UpdateUserProfileRequest } from '~/services/apis/models/update-user-profile-request'
import { useCreatorBioStyle } from '~/composables/useCreatorBioStyle'

// Cross-component cache — kept module-scoped so the profile stays hydrated
// across navigations (mirrors useCurrentStore's pattern).
const profile = ref<any | null>(null) // TODO: type with UserViewModel / CreatorProfileViewModel from Agent 1A
const level = ref<CreatorLevelViewModel | null>(null)
const isLoading = ref(false)
const isSaving = ref(false)

// Per-app Nitro endpoint backed by `.mock-store.json` (same pattern as
// useBioConfig for restaurants). When the real backend gains coverImageUrl +
// brandingSettings on the user profile, swap this for userProfileGet/Put.
const CREATOR_BIO_PREFIX = '/api/_mock/creator'

async function fetchCreatorBioOverrides(handle: string): Promise<any | null> {
  if (typeof fetch === 'undefined' || !handle) return null
  try {
    const res = await fetch(`${CREATOR_BIO_PREFIX}/${encodeURIComponent(handle)}/bio-config`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

async function putCreatorBioOverrides(handle: string, body: any): Promise<void> {
  if (typeof fetch === 'undefined' || !handle) return
  try {
    await fetch(`${CREATOR_BIO_PREFIX}/${encodeURIComponent(handle)}/bio-config`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch { /* swallow — caller already toasted */ }
}

export function useCurrentCreator() {
  const load = async (force = false) => {
    if (profile.value && level.value && !force) return { profile: profile.value, level: level.value }
    isLoading.value = true
    try {
      if (import.meta.dev) {
        // Mock seed → then merge any persisted overrides from the local
        // mock-store bridge so the editor reopens with the last saved cover,
        // profile image, brandingSettings, etc.
        const base = { ...currentCreatorMock }
        const handle = base.handle
        const overrides = handle ? await fetchCreatorBioOverrides(handle) : null
        profile.value = overrides ? { ...base, ...overrides } : base
        level.value = getMockLevel()
        applyBrandingToStyle(profile.value)
        return { profile: profile.value, level: level.value }
      }
      const [prof, lvl] = await Promise.all([
        userApiClient.userProfileGet().catch(() => null),
        creatorApiClient.creatorLevel().catch(() => null),
      ])
      // Also merge overrides from the local bridge in prod for any field the
      // backend doesn't persist yet (cover, brandingSettings).
      const handle = (prof as any)?.handle ?? (prof as any)?.username
      const overrides = handle ? await fetchCreatorBioOverrides(handle) : null
      profile.value = overrides && prof ? { ...prof, ...overrides } : prof
      level.value = lvl
      applyBrandingToStyle(profile.value)
      return { profile: profile.value, level: level.value }
    } finally {
      isLoading.value = false
    }
  }

  const refresh = () => load(true)

  // Persist profile basics + cover + brandingSettings JSON. Hits the local
  // bridge (so the public /u/[handle] page picks up the same data without
  // depending on backend) and also calls userProfilePut so when the real
  // backend supports these fields, no further wiring is needed.
  const save = async () => {
    if (!profile.value) return
    isSaving.value = true
    try {
      const p = profile.value as any
      const handle = p.handle as string | undefined
      if (!handle) return
      const { serializeBranding } = useCreatorBioStyle()
      const brandingSettings = serializeBranding()
      const payload = {
        handle,
        displayName: p.displayName ?? p.name ?? '',
        bio: p.bio ?? '',
        city: p.city ?? '',
        profileImageUrl: p.profileImageUrl ?? '',
        coverImageUrl: p.coverImageUrl ?? '',
        externalLinks: p.externalLinks ?? [],
        tags: p.tags ?? [],
        brandingSettings,
      }
      // Local bridge — used by both apps' Nitro to share via `.mock-store.json`.
      await putCreatorBioOverrides(handle, payload)
      // Real backend — best-effort. Unknown fields will be ignored by the
      // current /web/user/profile contract; once they're added server-side
      // this becomes the authoritative write.
      if (!import.meta.dev) {
        try {
          const req = new UpdateUserProfileRequest()
          Object.assign(req, {
            handle,
            bio: payload.bio,
            city: payload.city,
            profileImageUrl: payload.profileImageUrl,
            coverImageUrl: payload.coverImageUrl,
            brandingSettings,
          })
          await userApiClient.userProfilePut(req)
        } catch (e) {
          console.warn('[useCurrentCreator] userProfilePut failed (mock bridge already wrote)', e)
        }
      }
    } finally {
      isSaving.value = false
    }
  }

  return { profile, level, isLoading, isSaving, load, refresh, save }
}

// Push the persisted brandingSettings JSON into the shared style composable
// so the live preview (editor) and the public bio render with the same theme.
function applyBrandingToStyle(prof: any | null) {
  if (!prof) return
  const raw = prof.brandingSettings
  if (!raw) return
  const { hydrateFromBranding } = useCreatorBioStyle()
  hydrateFromBranding(raw)
}
