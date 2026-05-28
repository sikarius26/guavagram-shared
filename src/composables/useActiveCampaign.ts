import { ref, computed, watch, type Ref } from 'vue'

// Click-to-activate campaigns: the visitor must tap a campaign card on the
// public bio (or menu) before its discount/highlight shows on the affected
// products. Avoids painting "-10%" chips on every dish by default and turns
// the campaign card into the call-to-action.
//
// Scope:
//  - Per-slug so two restaurant tabs don't share state.
//  - Single active campaign at a time. Tapping a second one replaces the first,
//    keeping the banner unambiguous (one discount → one explainer).
//  - sessionStorage by design: closing the tab clears it, refreshing keeps it.
//    Matches the user's expectation ("solo la sesión actual").
//
// SSR-safe: reads from sessionStorage only inside onMounted / actions on the
// client. SSR / first paint always has `null` so hydration is deterministic.

const PREFIX = 'guavagram.active_campaign.v1'

// Module-scoped map so multiple components viewing the same slug share state.
const cache: Record<string, Ref<string | null>> = {}

function readStorage(slug: string): string | null {
  if (typeof window === 'undefined') return null
  try { return window.sessionStorage.getItem(`${PREFIX}:${slug}`) }
  catch { return null }
}

function writeStorage(slug: string, value: string | null) {
  if (typeof window === 'undefined') return
  try {
    if (value) window.sessionStorage.setItem(`${PREFIX}:${slug}`, value)
    else window.sessionStorage.removeItem(`${PREFIX}:${slug}`)
  } catch { /* private mode / quota — fall back to in-memory ref */ }
}

export function useActiveCampaign(slug: Ref<string> | (() => string) | string) {
  const slugRef = typeof slug === 'string'
    ? ref(slug)
    : typeof slug === 'function'
      ? computed(slug)
      : slug

  // One reactive ref per slug, lazily created on first call. Subsequent calls
  // for the same slug return the SAME ref so components stay in sync.
  function refFor(s: string): Ref<string | null> {
    if (!cache[s]) cache[s] = ref<string | null>(null)
    return cache[s]
  }

  const active = computed<string | null>({
    get: () => refFor(slugRef.value).value,
    set: (v) => { refFor(slugRef.value).value = v },
  })

  // Hydrate from sessionStorage on first client read so a refresh inside the
  // same tab keeps the discount visible.
  if (typeof window !== 'undefined' && active.value === null) {
    const stored = readStorage(slugRef.value)
    if (stored) refFor(slugRef.value).value = stored
  }

  // Keep storage in sync with state changes (any caller setting active.value
  // propagates immediately — no manual flush needed).
  watch(active, (v) => writeStorage(slugRef.value, v))

  function activate(campaignId: string | undefined | null) {
    if (!campaignId) return
    active.value = campaignId
  }

  function deactivate() {
    active.value = null
  }

  function isActive(campaignId: string | undefined | null): boolean {
    if (!campaignId) return false
    return active.value === campaignId
  }

  return { active, activate, deactivate, isActive }
}
