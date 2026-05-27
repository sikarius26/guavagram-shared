import { ref, computed } from 'vue'
import { useCurrentStore } from './useCurrentStore'
import { useAdminSession } from './useAdminSession'

// Real ownership check for the public bio (/r/[slug]/*). Answers: "is the
// logged-in visitor the owner of THIS restaurant?" — so owner-only banners
// (verify, activate orders, configure bio) show ONLY to the owner, and every
// other visitor sees the clean public view.
//
// How: the `pu_token` cookie is shared between the public app (:3003) and the
// admin (:3004). `useCurrentStore().load()` calls `dashboardStores()`, which
// the backend already scopes to the user's permissions (owners get their
// stores, admins get all, consumers get none). We just check whether the
// current slug is among them. No new backend claim needed.
//
// `autoApplied` is module-level so we only auto-flip the view once: after that
// the owner's manual toggle (dev switcher / owner toolbar) wins and we never
// override their choice on subsequent navigations.
let autoApplied = false

export function useStoreOwnership() {
  const isOwner = ref(false)
  const resolved = ref(false)

  // ── Capture all Nuxt-context composables HERE, synchronously, during setup.
  // Calling useCookie/useState/useCurrentStore AFTER an `await` runs without an
  // active Nuxt instance, which threw inside the resolve promise and cascaded
  // into "Cannot read properties of null (reading 'parentNode')" render errors
  // that broke navigation. Keep them out of the async body.
  const { hasRealStaffToken } = useAdminSession()
  const token = useCookie<string | null>('pu_token')
  const previewAsPublic = useState<boolean>('preview-as-public', () => true)
  const { load: loadStores, stores } = useCurrentStore()

  // Who may see the owner toolbar / dev switcher / return pills:
  // the real owner of THIS store, OR a logged-in Guava staff member.
  const canManage = computed(() => isOwner.value || hasRealStaffToken.value)

  // Call from onMounted (client-only): loads the user's managed stores and —
  // if they own this slug — switches the page to owner view. Anonymous/other
  // visitors stay on the public view.
  const resolveOwnership = async (slug: string) => {
    resolved.value = false
    if (typeof window === 'undefined' || !slug) return false

    // No session cookie → definitely not the owner. Skip the request entirely.
    if (!token.value) {
      isOwner.value = false
      resolved.value = true
      return false
    }

    try {
      await loadStores()
      isOwner.value = (stores.value ?? []).some(
        (s: any) => s?.slugName === slug || s?.storeId === slug,
      )
    } catch {
      isOwner.value = false
    }

    // Owner of this store → default to owner view (banners visible). Done once;
    // the manual switcher takes over afterwards.
    if (isOwner.value && !autoApplied) {
      previewAsPublic.value = false
      autoApplied = true
    }

    resolved.value = true
    return isOwner.value
  }

  return { isOwner, canManage, resolved, resolveOwnership }
}
