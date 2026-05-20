import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'guavagram.recent_searches.v1'
const MAX_ITEMS = 8

const items = ref<string[]>([])
let hydrated = false

const hydrate = () => {
  if (hydrated || typeof window === 'undefined') return
  hydrated = true
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) items.value = JSON.parse(raw) as string[]
  } catch {
    items.value = []
  }
}

if (typeof window !== 'undefined') {
  watch(items, (v) => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(v)) } catch {}
  }, { deep: true })
}

export function useRecentSearches() {
  hydrate()

  const list = computed(() => items.value.slice(0, MAX_ITEMS))

  function add(query: string) {
    const q = query.trim()
    if (!q) return
    const filtered = items.value.filter(i => i.toLowerCase() !== q.toLowerCase())
    items.value = [q, ...filtered].slice(0, MAX_ITEMS)
  }

  function remove(query: string) {
    items.value = items.value.filter(i => i.toLowerCase() !== query.toLowerCase())
  }

  function clear() {
    items.value = []
  }

  return { list, add, remove, clear }
}
