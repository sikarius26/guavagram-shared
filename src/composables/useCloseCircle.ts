import { ref, computed, watch } from 'vue'

export type CircleStatus = 'pending_outgoing' | 'pending_incoming' | 'accepted'

export interface CircleMember {
  handle: string
  displayName?: string
  avatarUrl?: string
  status: CircleStatus
  // ISO timestamp for the most recent state change (request sent, request received, accepted)
  updatedAt: string
}

const STORAGE_KEY = 'guavagram.close_circle.v2'
const LEGACY_KEY = 'guavagram.close_circle.v1'

const members = ref<CircleMember[]>([])
let hydrated = false

const normalize = (handle: string) => handle.replace(/^@/, '').toLowerCase()

const findIndex = (handle: string) => {
  const h = normalize(handle)
  return members.value.findIndex(m => m.handle === h)
}

const upsert = (member: CircleMember) => {
  const idx = findIndex(member.handle)
  if (idx >= 0) {
    const next = [...members.value]
    next[idx] = { ...next[idx], ...member }
    members.value = next
  } else {
    members.value = [...members.value, member]
  }
}

const removeBy = (handle: string) => {
  const h = normalize(handle)
  members.value = members.value.filter(m => m.handle !== h)
}

const hydrate = () => {
  if (hydrated || typeof window === 'undefined') return
  hydrated = true
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      members.value = JSON.parse(raw) as CircleMember[]
      return
    }
    // Migrate from v1 (every entry was implicitly accepted)
    const legacy = window.localStorage.getItem(LEGACY_KEY)
    if (legacy) {
      const old = JSON.parse(legacy) as Array<{ handle: string; displayName?: string; avatarUrl?: string; addedAt: string }>
      members.value = old.map(m => ({
        handle: normalize(m.handle),
        displayName: m.displayName,
        avatarUrl: m.avatarUrl,
        status: 'accepted',
        updatedAt: m.addedAt ?? new Date().toISOString(),
      }))
    }
  } catch {
    members.value = []
  }
}

if (typeof window !== 'undefined') {
  watch(members, (v) => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(v)) } catch {}
  }, { deep: true })
}

export interface CircleInput {
  handle: string
  displayName?: string
  avatarUrl?: string
}

export function useCloseCircle() {
  hydrate()

  const all = computed(() =>
    [...members.value].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  )
  const accepted = computed(() => all.value.filter(m => m.status === 'accepted'))
  const incoming = computed(() => all.value.filter(m => m.status === 'pending_incoming'))
  const outgoing = computed(() => all.value.filter(m => m.status === 'pending_outgoing'))

  // `list` keeps the v1 contract: callers that just want the visible roster (accepted only).
  const list = accepted
  const count = computed(() => accepted.value.length)
  const incomingCount = computed(() => incoming.value.length)

  const statusFor = (handle: string): CircleStatus | 'none' => {
    const m = members.value[findIndex(handle)]
    return m ? m.status : 'none'
  }

  const isInCircle = (handle: string) => statusFor(handle) === 'accepted'
  const hasOutgoing = (handle: string) => statusFor(handle) === 'pending_outgoing'
  const hasIncoming = (handle: string) => statusFor(handle) === 'pending_incoming'

  // Send a request to add someone to your circle. If they already sent you one
  // first (incoming pending), this auto-accepts (mutual).
  const request = (input: CircleInput): CircleStatus => {
    const handle = normalize(input.handle)
    if (!handle) return 'pending_outgoing'
    const existing = members.value[findIndex(handle)]
    const now = new Date().toISOString()
    if (existing?.status === 'accepted') return 'accepted'
    if (existing?.status === 'pending_incoming') {
      upsert({ ...existing, ...input, handle, status: 'accepted', updatedAt: now })
      return 'accepted'
    }
    if (existing?.status === 'pending_outgoing') return 'pending_outgoing'
    upsert({ handle, displayName: input.displayName, avatarUrl: input.avatarUrl, status: 'pending_outgoing', updatedAt: now })
    return 'pending_outgoing'
  }

  // Cancel a request you sent (outgoing) or leave the circle (accepted) or
  // ignore an incoming request you don't want to accept.
  const cancel = (handle: string) => removeBy(handle)
  const remove = cancel

  // Accept an incoming request — promotes pending_incoming to accepted.
  const accept = (handle: string): boolean => {
    const idx = findIndex(handle)
    const m = members.value[idx]
    if (!m || m.status !== 'pending_incoming') return false
    const next = [...members.value]
    next[idx] = { ...m, status: 'accepted', updatedAt: new Date().toISOString() }
    members.value = next
    return true
  }

  const decline = (handle: string): boolean => {
    const idx = findIndex(handle)
    const m = members.value[idx]
    if (!m || m.status !== 'pending_incoming') return false
    removeBy(handle)
    return true
  }

  // Used by the demo seed (and, eventually, by a realtime listener) to register
  // that someone wants to add YOU to their circle. If you'd already sent them a
  // request, this auto-accepts (mutual).
  const receiveIncoming = (input: CircleInput): CircleStatus => {
    const handle = normalize(input.handle)
    if (!handle) return 'pending_incoming'
    const existing = members.value[findIndex(handle)]
    const now = new Date().toISOString()
    if (existing?.status === 'accepted') return 'accepted'
    if (existing?.status === 'pending_outgoing') {
      upsert({ ...existing, ...input, handle, status: 'accepted', updatedAt: now })
      return 'accepted'
    }
    if (existing?.status === 'pending_incoming') return 'pending_incoming'
    upsert({ handle, displayName: input.displayName, avatarUrl: input.avatarUrl, status: 'pending_incoming', updatedAt: now })
    return 'pending_incoming'
  }

  // Back-compat helpers for callers still using the v1 instant-add API.
  // `add` now sends a request (so the receiver still has to accept).
  const add = (input: CircleInput) => { request(input) }
  // `toggle` returns the next state instead of a boolean: callers can branch on it.
  const toggle = (input: CircleInput): CircleStatus | 'removed' => {
    const status = statusFor(input.handle)
    if (status === 'accepted' || status === 'pending_outgoing') {
      cancel(input.handle)
      return 'removed'
    }
    if (status === 'pending_incoming') {
      accept(input.handle)
      return 'accepted'
    }
    return request(input)
  }

  return {
    list, accepted, incoming, outgoing, all,
    count, incomingCount,
    statusFor, isInCircle, hasOutgoing, hasIncoming,
    request, cancel, remove, accept, decline, receiveIncoming,
    add, toggle,
  }
}
