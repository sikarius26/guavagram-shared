import { ref, computed, watch } from 'vue'
import type { DiscoveryItem } from '~/composables/useDiscoveryData'
import { useMatchWallet } from '~/composables/useMatchWallet'

// Tracks which restaurants the current viewer has swiped-left ("paso") on
// recently, so they don't reappear in the deck for a TTL window.

const STORAGE_KEY = 'guavagram.match_deck.v1'
const DISMISS_TTL_HOURS = 24

interface DismissedEntry { slug: string; at: string }

const dismissed = ref<DismissedEntry[]>([])
let hydrated = false

const hydrate = () => {
  if (hydrated || typeof window === 'undefined') return
  hydrated = true
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) dismissed.value = JSON.parse(raw) as DismissedEntry[]
  } catch {
    dismissed.value = []
  }
  prune()
}

const prune = () => {
  const cutoff = Date.now() - DISMISS_TTL_HOURS * 60 * 60 * 1000
  dismissed.value = dismissed.value.filter(e => new Date(e.at).getTime() > cutoff)
}

if (typeof window !== 'undefined') {
  watch(dismissed, (v) => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(v)) } catch {}
  }, { deep: true })
}

export function useMatchDeck(sourceList: () => DiscoveryItem[]) {
  hydrate()

  const matchWallet = useMatchWallet()

  const dismissedSet = computed(() => new Set(dismissed.value.map(e => e.slug)))

  // The deck shows restaurants the viewer hasn't already swiped either way.
  const queue = computed<DiscoveryItem[]>(() => {
    return sourceList().filter(item => {
      if (item.kind !== 'restaurants') return false
      if (dismissedSet.value.has(item.slug)) return false
      if (matchWallet.isPending(item.slug)) return false
      return true
    })
  })

  const hasMore = computed(() => queue.value.length > 0)

  const dismiss = (slug: string) => {
    if (!slug) return
    if (dismissed.value.some(e => e.slug === slug)) return
    dismissed.value = [...dismissed.value, { slug, at: new Date().toISOString() }]
  }

  const reset = () => {
    dismissed.value = []
  }

  return { queue, hasMore, dismiss, reset }
}
