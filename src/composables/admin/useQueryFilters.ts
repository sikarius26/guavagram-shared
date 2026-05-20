import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Two-way sync between reactive filters/search and URL query string.
// Lets KPI cards link to e.g. `/admin/earnings?status=pending` and have the
// list panel auto-apply the filter. Mutations from the UI also rewrite the URL
// so deep-links are shareable.

export function useQueryFilters(opts: {
  filterKeys: string[]
  searchKey?: string
}) {
  const route = useRoute()
  const router = useRouter()
  const searchKey = opts.searchKey ?? 'q'

  const search = ref<string>(typeof route.query[searchKey] === 'string' ? String(route.query[searchKey]) : '')
  const initial: Record<string, string> = {}
  for (const k of opts.filterKeys) {
    const v = route.query[k]
    initial[k] = typeof v === 'string' ? v : ''
  }
  const filters = ref<Record<string, string>>(initial)

  let writing = false
  // UI → URL
  watch([search, filters], () => {
    if (writing) return
    writing = true
    const next: Record<string, string | undefined> = { ...route.query } as any
    next[searchKey] = search.value || undefined
    for (const k of opts.filterKeys) next[k] = filters.value[k] || undefined
    router.replace({ query: next }).finally(() => { writing = false })
  }, { deep: true })

  // URL → UI (browser back/forward)
  watch(() => route.query, (q) => {
    if (writing) return
    writing = true
    search.value = typeof q[searchKey] === 'string' ? String(q[searchKey]) : ''
    for (const k of opts.filterKeys) {
      filters.value[k] = typeof q[k] === 'string' ? String(q[k]) : ''
    }
    writing = false
  })

  return { search, filters }
}
