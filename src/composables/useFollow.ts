import { computed, ref, watch } from 'vue'

type FollowSnapshot = { isFollowing: boolean; followersCount: number }

const cache = ref<Record<string, FollowSnapshot>>({})
const inflight = new Map<string, Promise<FollowSnapshot>>()

async function fetchState(handle: string): Promise<FollowSnapshot> {
  if (inflight.has(handle)) return inflight.get(handle)!
  const p = $fetch<FollowSnapshot>(`/api/stubs/follow/${encodeURIComponent(handle)}`).catch(
    () => ({ isFollowing: false, followersCount: 0 }) as FollowSnapshot
  )
  inflight.set(handle, p)
  const snap = await p
  inflight.delete(handle)
  cache.value = { ...cache.value, [handle]: snap }
  return snap
}

async function toggleState(handle: string): Promise<FollowSnapshot> {
  const snap = await $fetch<FollowSnapshot>(`/api/stubs/follow/${encodeURIComponent(handle)}`, {
    method: 'POST',
  }).catch(() => null)
  if (snap) {
    cache.value = { ...cache.value, [handle]: snap }
    return snap
  }
  // Fallback: optimistic local flip if server unreachable
  const prev = cache.value[handle] ?? { isFollowing: false, followersCount: 0 }
  const next: FollowSnapshot = prev.isFollowing
    ? { isFollowing: false, followersCount: Math.max(0, prev.followersCount - 1) }
    : { isFollowing: true, followersCount: prev.followersCount + 1 }
  cache.value = { ...cache.value, [handle]: next }
  return next
}

// Bucketed display for public follower counts. Cold-start policy:
// avoids exposing tiny raw numbers (e.g. "12 seguidores") that hurt the
// creator's pitch while still surfacing real numbers once they have
// meaningful traction.
//   <100        → null     (caller hides the metric / shows "Nuevo creator")
//   100-999     → "100+"
//   1k-9.9k     → "1.2k"   (precise)
//   10k-999k    → "10k+"
//   ≥1M         → "1M+"
export function formatFollowersBucket(n: number): string | null {
  if (!Number.isFinite(n) || n < 100) return null
  if (n < 1_000) return '100+'
  if (n < 10_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k'
  if (n < 1_000_000) return '10k+'
  return '1M+'
}

// Raw formatter (1.2k / 1.2M) — kept for non-public surfaces
// (creator's own dashboard, admin tools) where the exact number matters.
export function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(n)
}

// ===== User's private "Siguiendo" list =====
// Per the privacy policy: a consumer's follow list is never exposed publicly,
// only on their own /wallet "Siguiendo" tab.

export type FollowedCreator = {
  handle: string
  displayName: string
  avatarUrl?: string
  city?: string
  followedAt: string
}

const FOLLOWING_KEY = 'guavagram.following.v1'
const followingList = ref<FollowedCreator[]>([])
let followingLoaded = false

function loadFollowingList() {
  if (followingLoaded || typeof window === 'undefined') return
  followingLoaded = true
  try {
    const raw = window.localStorage.getItem(FOLLOWING_KEY)
    if (raw) followingList.value = JSON.parse(raw)
  } catch {}
}

function persistFollowingList() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(FOLLOWING_KEY, JSON.stringify(followingList.value))
  } catch {}
}

function addToFollowing(meta: Omit<FollowedCreator, 'followedAt'>) {
  loadFollowingList()
  if (followingList.value.some(f => f.handle === meta.handle)) return
  followingList.value = [{ ...meta, followedAt: new Date().toISOString() }, ...followingList.value]
  persistFollowingList()
}

function removeFromFollowing(handle: string) {
  loadFollowingList()
  if (!followingList.value.some(f => f.handle === handle)) return
  followingList.value = followingList.value.filter(f => f.handle !== handle)
  persistFollowingList()
}

export function useFollowingList() {
  loadFollowingList()
  const list = computed(() => followingList.value)
  const count = computed(() => followingList.value.length)
  const has = (handle: string) => followingList.value.some(f => f.handle === handle)
  return { list, count, has, add: addToFollowing, remove: removeFromFollowing }
}

export function useFollow(
  handle: () => string,
  baseCount: () => number,
  getMeta?: () => Omit<FollowedCreator, 'followedAt'> | null,
) {
  const entry = computed<FollowSnapshot>(
    () => cache.value[handle()] ?? { isFollowing: false, followersCount: 0 }
  )

  const loaded = ref<Record<string, boolean>>({})
  watch(
    handle,
    (h) => {
      if (!h || loaded.value[h] || typeof window === 'undefined') return
      loaded.value = { ...loaded.value, [h]: true }
      fetchState(h)
    },
    { immediate: true }
  )

  const isFollowing = computed(() => entry.value.isFollowing)
  const followersCount = computed(() => (baseCount() || 0) + entry.value.followersCount)
  const followersLabel = computed(() => formatFollowersBucket(followersCount.value))

  async function toggle() {
    const h = handle()
    if (!h) return
    const snap = await toggleState(h)
    if (!getMeta) return
    const meta = getMeta()
    if (!meta) return
    if (snap.isFollowing) addToFollowing(meta)
    else removeFromFollowing(h)
  }

  return { isFollowing, followersCount, followersLabel, toggle, formatCount }
}
