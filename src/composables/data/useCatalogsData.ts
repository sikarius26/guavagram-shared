// Catalog accessor (cuisines, expertise, price levels, languages).
// Today re-exports the static constants; future swap is to fetch
// localized catalogs from `apiClient.catalogs.list()` when they
// need to vary per locale or be edited from the admin panel.
//
// Existing imports of `~/constants/catalogs` keep working — new
// callsites should use this composable to centralize the swap point.

import { computed, type ComputedRef } from 'vue'
import {
  getMockCuisineCatalog,
  getMockExpertiseCatalog,
  getMockPriceLevelCatalog,
  getMockLanguageCatalog,
  labelFor,
  type CatalogOption,
  type PriceLevelOption,
} from '~/services/apis/mocks/catalogs.mock'

export type { CatalogOption, PriceLevelOption }

export interface UseCatalogsDataReturn {
  cuisines: ComputedRef<CatalogOption[]>
  expertise: ComputedRef<CatalogOption[]>
  priceLevels: ComputedRef<PriceLevelOption[]>
  languages: ComputedRef<CatalogOption[]>
  labelFor: typeof labelFor
}

export function useCatalogsData(): UseCatalogsDataReturn {
  const cuisines = computed(() => getMockCuisineCatalog())
  const expertise = computed(() => getMockExpertiseCatalog())
  const priceLevels = computed(() => getMockPriceLevelCatalog())
  const languages = computed(() => getMockLanguageCatalog())

  return { cuisines, expertise, priceLevels, languages, labelFor }
}
