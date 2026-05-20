// One-stop accessor for the public creator profile fixture data.
// Pages call this composable; when the API ships, the body switches
// from local mock to a real client call (publicUserApiClient.publicUserGet)
// without touching any consumer.
//
// Convention: every file under `composables/data/` returns reactive refs
// that mirror the future API contract — so swapping the body is the only
// change needed to go from "mock" to "live".

import { computed, type ComputedRef, type Ref } from 'vue'
import { useCityContext } from '../useCityContext'
import {
  getMockPublicCreatorProfile,
  getMockCreatorStores,
  type MockPublicCreatorProfile,
  type MockCreatorStore,
} from '~/services/apis/mocks/publicCreator.mock'

export interface UseCreatorPublicDataReturn {
  mockProfile: ComputedRef<MockPublicCreatorProfile>
  mockStores: ComputedRef<MockCreatorStore[]>
}

export function useCreatorPublicData(handle: Ref<string> | (() => string)): UseCreatorPublicDataReturn {
  const { currentCityName } = useCityContext()
  const handleRef = typeof handle === 'function' ? computed(handle) : handle

  const mockProfile = computed<MockPublicCreatorProfile>(() =>
    getMockPublicCreatorProfile(handleRef.value, { cityName: currentCityName.value })
  )

  const mockStores = computed<MockCreatorStore[]>(() =>
    getMockCreatorStores(handleRef.value, { cityName: currentCityName.value })
  )

  return { mockProfile, mockStores }
}
