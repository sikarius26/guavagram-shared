// Mock list of Guavagram-onboarded stores used by the professional
// "request work verification" modal autocomplete. Replaces the inline
// list in `components/professional/bio/WorkVerificationRequestModal.vue`.
//
// Future API contract: GET /api/professional/onboarded-stores

export interface MockOnboardedStore {
  id: string
  name: string
  city: string
}

const STORES: MockOnboardedStore[] = [
  { id: 'store-1',           name: 'Pau Artiso · Demo Store', city: 'Madrid'    },
  { id: 'store-casapaco',    name: 'Casa Paco',               city: 'Madrid'    },
  { id: 'store-tascaverde',  name: 'Tasca Verde',             city: 'Madrid'    },
  { id: 'store-mercatsp',    name: 'Mercat Sant Pau',         city: 'Barcelona' },
  { id: 'store-hotelcolon',  name: 'Hotel Colón',             city: 'Barcelona' },
  { id: 'store-skybar',      name: 'Sky Bar Madrid',          city: 'Madrid'    },
  { id: 'store-rinconcillo', name: 'El Rinconcillo',          city: 'Sevilla'   },
  { id: 'store-arrozfuego',  name: 'Arroz y Fuego',           city: 'Valencia'  },
]

export function getMockOnboardedStores(): MockOnboardedStore[] {
  return STORES
}
