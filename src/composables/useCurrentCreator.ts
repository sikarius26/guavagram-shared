import { ref } from 'vue'
import { creatorApiClient } from '~/services/apis/api.client.creator'
import { userApiClient } from '~/services/apis/api.client.user'
import type { CreatorLevelViewModel } from '~/services/apis/models/creator-level-view-model'
import { currentCreatorMock, getMockLevel } from '~/services/apis/mocks/creatorMarketplace.mock'

// Cross-component cache — kept module-scoped so the profile stays hydrated
// across navigations (mirrors useCurrentStore's pattern).
const profile = ref<any | null>(null) // TODO: type with UserViewModel / CreatorProfileViewModel from Agent 1A
const level = ref<CreatorLevelViewModel | null>(null)
const isLoading = ref(false)

export function useCurrentCreator() {
  const load = async (force = false) => {
    if (profile.value && level.value && !force) return { profile: profile.value, level: level.value }
    isLoading.value = true
    try {
      if (import.meta.dev) {
        profile.value = { ...currentCreatorMock }
        level.value = getMockLevel()
        return { profile: profile.value, level: level.value }
      }
      const [prof, lvl] = await Promise.all([
        userApiClient.userProfileGet().catch(() => null),
        creatorApiClient.creatorLevel().catch(() => null),
      ])
      profile.value = prof
      level.value = lvl
      return { profile: profile.value, level: level.value }
    } finally {
      isLoading.value = false
    }
  }

  const refresh = () => load(true)

  return { profile, level, isLoading, load, refresh }
}
