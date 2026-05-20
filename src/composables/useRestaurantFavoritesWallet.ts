import { ref, computed, watch } from 'vue'
import { CreatorWishlistItemViewModel } from '~/services/apis/models/creator-wishlist-item-view-model'
import { GamificationActionTypeEnum } from '~/services/apis/models/gamification-action-type-enum'
import { useCreatorBio } from './useCreatorBio'
import { useGamification } from './useGamification'
import { useCelebrate } from './useCelebrate'

export interface FavoriteStore {
  id: string
  storeId?: string
  storeSlug: string
  storeName: string
  storeCity?: string
  storeLogoUrl?: string
  storeCoverUrl?: string
  storeDescription?: string
  savedAt: string
}

const STORAGE_KEY = 'guavagram.favorite_stores.v1'

const stores = ref<FavoriteStore[]>([])
let hydrated = false

// Stable id used to mirror the favorite into the creator-bio wishlist (radar).
// Slug-based so it dedupes against the same restaurant being hearted twice.
const wishlistIdFromSlug = (slug: string) => `wl-fav-${slug.toLowerCase()}`

const hydrate = () => {
  if (hydrated || typeof window === 'undefined') return
  hydrated = true
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) stores.value = JSON.parse(raw) as FavoriteStore[]
  } catch {
    stores.value = []
  }
}

if (typeof window !== 'undefined') {
  watch(stores, (v) => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(v)) } catch {}
  }, { deep: true })
}

const makeId = (slug: string) => slug.toLowerCase()

export function useRestaurantFavoritesWallet() {
  hydrate()

  const list = computed(() => [...stores.value].sort((a, b) => b.savedAt.localeCompare(a.savedAt)))
  const count = computed(() => stores.value.length)

  const isSaved = (storeSlug: string) =>
    stores.value.some(s => s.id === makeId(storeSlug))

  const save = (input: Omit<FavoriteStore, 'id' | 'savedAt'>) => {
    if (!input.storeSlug) return
    const id = makeId(input.storeSlug)
    if (stores.value.some(s => s.id === id)) return
    stores.value = [...stores.value, { ...input, id, savedAt: new Date().toISOString() }]

    // Mirror to creator-bio wishlist so the favorite shows up in the bio "radar".
    // Same intent (interest signal); the heart is just a faster surface than /u/create/recomendado.
    const bio = useCreatorBio()
    const wlId = wishlistIdFromSlug(input.storeSlug)
    const alreadyInWishlist = bio.wishlist.value.some(
      w => w.id === wlId || (input.storeId && w.storeId === input.storeId) || (w.slugName && w.slugName === input.storeSlug),
    )
    if (!alreadyInWishlist) {
      bio.addWishlistItem(CreatorWishlistItemViewModel.fromJS({
        id: wlId,
        storeId: input.storeId,
        source: 'guavagram',
        slugName: input.storeSlug,
        name: input.storeName,
        city: input.storeCity,
        imageUrl: input.storeLogoUrl ?? input.storeCoverUrl,
        addedAt: new Date(),
        priority: bio.wishlist.value.length,
      }))
    }

    // Reward + visual feedback (matches /u/create/recomendado path).
    useGamification().trackAction(GamificationActionTypeEnum.FavoriteStore, input.storeId)
    useCelebrate().confetti()
  }

  const remove = (id: string) => {
    const fav = stores.value.find(s => s.id === id)
    stores.value = stores.value.filter(s => s.id !== id)

    if (fav) {
      // Mirror removal — find the wishlist twin via either deterministic id, storeId or slug.
      const bio = useCreatorBio()
      const twin = bio.wishlist.value.find(
        w => w.id === wishlistIdFromSlug(fav.storeSlug)
          || (fav.storeId && w.storeId === fav.storeId)
          || (w.slugName && w.slugName === fav.storeSlug),
      )
      if (twin?.id) bio.removeWishlistItem(twin.id)
    }
  }

  const toggle = (input: Omit<FavoriteStore, 'id' | 'savedAt'>) => {
    const id = makeId(input.storeSlug)
    if (stores.value.some(s => s.id === id)) {
      remove(id)
      return false
    }
    save(input)
    return true
  }

  return { list, count, isSaved, save, remove, toggle }
}
