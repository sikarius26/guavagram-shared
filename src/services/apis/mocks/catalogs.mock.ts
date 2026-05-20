// Catalog mocks (cuisines, expertise, price levels, languages).
// The actual data lives in `app/constants/catalogs.ts` since these
// are stable enums used by validators and form pickers. This file
// wraps the constants under getter functions so the rest of the app
// goes through the same `useCatalogsData()` accessor pattern as
// every other domain — when an API endpoint serves these catalogs
// (so we can localize / extend them per locale), only this file
// needs to change.
//
// Future API contract: GET /api/catalogs/{kind}

import {
  CUISINE_CATALOG,
  EXPERTISE_CATALOG,
  PRICE_LEVEL_CATALOG,
  LANGUAGE_CATALOG,
  labelFor as constantsLabelFor,
  type CatalogOption,
  type PriceLevelOption,
} from '~/constants/catalogs'

export type { CatalogOption, PriceLevelOption }

export function getMockCuisineCatalog(): CatalogOption[] {
  return CUISINE_CATALOG
}

export function getMockExpertiseCatalog(): CatalogOption[] {
  return EXPERTISE_CATALOG
}

export function getMockPriceLevelCatalog(): PriceLevelOption[] {
  return PRICE_LEVEL_CATALOG
}

export function getMockLanguageCatalog(): CatalogOption[] {
  return LANGUAGE_CATALOG
}

export const labelFor = constantsLabelFor
