// Following list accessor for the wallet "Siguiendo" tab. Wraps the
// mock so the component never carries inline pravatar URLs nor literal
// city strings. Future swap: `apiClient.me.getFollowing()`.

import { computed, type ComputedRef } from 'vue'
import {
  getMockFollowingCreators,
  type MockFollowingCreator,
} from '~/services/apis/mocks/walletFollowing.mock'

export interface UseWalletFollowingDataReturn {
  creators: ComputedRef<MockFollowingCreator[]>
}

export function useWalletFollowingData(): UseWalletFollowingDataReturn {
  const creators = computed(() => getMockFollowingCreators())
  return { creators }
}
