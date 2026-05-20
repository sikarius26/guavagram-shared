import { ref, watch } from 'vue'

// Creator-initiated lead emission. Fires when a creator swipes right on a
// restaurant in Discover Match. Persisted to localStorage as a dev mock until
// the real endpoint is wired.
// INTEGRATION: swap `emitLead` to POST /api/stores/{slug}/leads.

const STORAGE_KEY = 'guavagram.store_leads.v1'

export interface EmittedLead {
  id: string
  storeSlug: string
  storeId?: string
  creatorHandle: string
  createdAt: string
}

const leads = ref<EmittedLead[]>([])
let hydrated = false

const hydrate = () => {
  if (hydrated || typeof window === 'undefined') return
  hydrated = true
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) leads.value = JSON.parse(raw) as EmittedLead[]
  } catch {
    leads.value = []
  }
}

if (typeof window !== 'undefined') {
  watch(leads, (v) => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(v)) } catch {}
  }, { deep: true })
}

export function useStoreCreatorLeads() {
  hydrate()

  const emit = (input: { storeSlug: string; storeId?: string; creatorHandle: string }) => {
    if (!input.storeSlug || !input.creatorHandle) return
    const id = `${input.storeSlug}:${input.creatorHandle}`
    if (leads.value.some(l => l.id === id)) return
    leads.value = [
      ...leads.value,
      {
        id,
        storeSlug: input.storeSlug,
        storeId: input.storeId,
        creatorHandle: input.creatorHandle,
        createdAt: new Date().toISOString(),
      },
    ]
    // INTEGRATION: POST /api/stores/{slug}/leads with same payload here.
  }

  const remove = (storeSlug: string, creatorHandle: string) => {
    const id = `${storeSlug}:${creatorHandle}`
    leads.value = leads.value.filter(l => l.id !== id)
    // INTEGRATION: DELETE /api/stores/{slug}/leads/{leadId} here.
  }

  return { list: leads, emit, remove }
}
