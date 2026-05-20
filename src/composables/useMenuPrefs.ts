import { ref, watch, type Ref } from 'vue'

type MenuPrefs = {
  showImages: boolean
  showVideos: boolean
  popularItemIds: string[]
}

const LS_KEY = 'guava:menu-prefs'

// Photos and videos are mutually exclusive in the UI ("Solo fotos / Solo
// videos / Sin imágenes"). Default to photos so the menu opens with the most
// familiar shape.
const defaults = (): MenuPrefs => ({
  showImages: true,
  showVideos: false,
  popularItemIds: [],
})

function loadAll(): Record<string, MenuPrefs> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveAll(all: Record<string, MenuPrefs>) {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(LS_KEY, JSON.stringify(all)) } catch {}
}

const store = ref<Record<string, MenuPrefs>>(loadAll())

function prefsFor(slug: string): MenuPrefs {
  const saved = store.value[slug]
  if (!saved) return defaults()
  // Migration: older versions allowed both flags to be `true` simultaneously,
  // which is no longer valid (the UI is now a 3-way exclusive selector).
  // Resolve the ambiguity in favor of photos.
  if (saved.showImages && saved.showVideos) {
    return { ...saved, showVideos: false }
  }
  return saved
}

function update(slug: string, patch: Partial<MenuPrefs>) {
  const current = prefsFor(slug)
  store.value = { ...store.value, [slug]: { ...current, ...patch } }
  saveAll(store.value)
}

export function useMenuPrefs(slugRef: Ref<string | null | undefined> | string) {
  const getSlug = (): string => {
    const v = typeof slugRef === 'string' ? slugRef : slugRef.value
    return v || '__default__'
  }

  const showImages = ref(prefsFor(getSlug()).showImages)
  const showVideos = ref(prefsFor(getSlug()).showVideos)
  const popularIds = ref<Set<string>>(new Set(prefsFor(getSlug()).popularItemIds))

  // Reload when slug changes
  if (typeof slugRef !== 'string') {
    watch(slugRef, () => {
      const p = prefsFor(getSlug())
      showImages.value = p.showImages
      showVideos.value = p.showVideos
      popularIds.value = new Set(p.popularItemIds)
    })
  }

  watch(showImages, v => update(getSlug(), { showImages: v }))
  watch(showVideos, v => update(getSlug(), { showVideos: v }))

  const isPopular = (id?: string | null): boolean => !!id && popularIds.value.has(id)

  const togglePopular = (id?: string | null) => {
    if (!id) return
    const next = new Set(popularIds.value)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    popularIds.value = next
    update(getSlug(), { popularItemIds: Array.from(next) })
  }

  return { showImages, showVideos, popularIds, isPopular, togglePopular }
}
