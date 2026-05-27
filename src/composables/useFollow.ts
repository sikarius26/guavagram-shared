import { computed, ref, watch } from 'vue'
import { userApiClient } from '../services/apis/api.client.user'
import { publicUserApiClient } from '../services/apis/api.client.publicuser'

type FollowSnapshot = { isFollowing: boolean; followersCount: number }

// Resolved handle → userId so toggle() can call `userFollow(userId)` directly
// without re-hitting `publicUserGet` on every click.
const handleToUserId = new Map<string, string>()

const cache = ref<Record<string, FollowSnapshot>>({})
const inflight = new Map<string, Promise<FollowSnapshot>>()

// One-shot fetch of the auth-user's following list, kept in a Set for fast
// isFollowing(handle) lookup. Lazy + idempotent.
let followingIdsLoaded: Promise<Set<string>> | null = null
const followingIds = ref<Set<string>>(new Set())

function loadFollowingIds(): Promise<Set<string>> {
  if (followingIdsLoaded) return followingIdsLoaded
  followingIdsLoaded = userApiClient.userFollowing()
    .then(list => {
      const ids = new Set<string>()
      for (const u of list || []) if (u?.userId) ids.add(u.userId)
      followingIds.value = ids
      return ids
    })
    .catch(() => {
      // 401/network → assume nothing followed yet; let the user retry by toggling.
      followingIdsLoaded = null
      return new Set<string>()
    })
  return followingIdsLoaded
}

async function resolveUserId(handle: string): Promise<string | null> {
  const cached = handleToUserId.get(handle)
  if (cached) return cached
  try {
    const profile: any = await publicUserApiClient.publicUserGet(handle)
    const uid = profile?.userId ?? profile?.id
    if (uid) handleToUserId.set(handle, uid)
    return uid ?? null
  } catch { return null }
}

async function fetchState(handle: string): Promise<FollowSnapshot> {
  if (inflight.has(handle)) return inflight.get(handle)!
  const p = (async () => {
    const [uid, ids] = await Promise.all([resolveUserId(handle), loadFollowingIds()])
    const snap: FollowSnapshot = {
      isFollowing: !!(uid && ids.has(uid)),
      // Backend gap: UserProfileStatsViewModel does not expose followersCount.
      // formatFollowersBucket(<100) returns null so the UI hides the metric
      // for now (see memoria feedback_follow_visibility).
      followersCount: 0,
    }
    cache.value = { ...cache.value, [handle]: snap }
    return snap
  })()
  inflight.set(handle, p)
  try { return await p }
  finally { inflight.delete(handle) }
}

async function toggleState(handle: string): Promise<FollowSnapshot> {
  const prev = cache.value[handle] ?? { isFollowing: false, followersCount: 0 }
  const uid = await resolveUserId(handle)
  if (!uid) {
    // Optimistic local flip — keeps the UI usable when the lookup fails.
    const next: FollowSnapshot = prev.isFollowing
      ? { isFollowing: false, followersCount: Math.max(0, prev.followersCount - 1) }
      : { isFollowing: true, followersCount: prev.followersCount + 1 }
    cache.value = { ...cache.value, [handle]: next }
    return next
  }
  // Optimistic update first so the button reflects intent immediately.
  const optimistic: FollowSnapshot = {
    isFollowing: !prev.isFollowing,
    followersCount: prev.followersCount + (prev.isFollowing ? -1 : 1),
  }
  cache.value = { ...cache.value, [handle]: optimistic }
  const ids = new Set(followingIds.value)
  if (optimistic.isFollowing) ids.add(uid); else ids.delete(uid)
  followingIds.value = ids
  // POST /user/follow is currently treated as a toggle by the backend; if a
  // dedicated DELETE shows up later, branch on `prev.isFollowing` here.
  await userApiClient.userFollow(uid).catch(() => {
    // Rollback on failure.
    cache.value = { ...cache.value, [handle]: prev }
    const rb = new Set(followingIds.value)
    if (prev.isFollowing) rb.add(uid); else rb.delete(uid)
    followingIds.value = rb
  })
  return cache.value[handle] ?? optimistic
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
// only on their own /wallet "Siguiendo" tab. This stays in localStorage as a
// display-side cache (handles + avatars + city) because the backend only
// returns minimal PublicUserViewModel without those denormalized fields.

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
