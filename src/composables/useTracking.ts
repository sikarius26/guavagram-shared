// Client-side tracking helper. Fires fire-and-forget POSTs to the local
// Nitro tracking endpoints (./server/api/track/[slug]/*). The owner's
// dashboard reads the aggregated counts back from the SAME file.
//
// All calls are guarded with onMounted equivalents (client-only) and a
// catch swallow so a tracking failure NEVER blocks the user flow.

import { onMounted } from 'vue'

type CtaType =
  | 'call' | 'whatsapp' | 'menu' | 'booking' | 'order'
  | 'share' | 'recommend' | 'directions' | 'instagram' | 'review' | 'loyalty'
  | string

// ─── Visitor identity ──────────────────────────────────────────────────
// `vid` is a stable per-browser id (localStorage). Survives tab close,
// identifies the device. Owners use this for "unique visitors" counts.
//
// `sid` is per-tab/session (sessionStorage) WITH a 30-minute idle timeout
// stored alongside — same convention Google Analytics uses. Two tabs of
// the same browser get two sids; reloading the same tab keeps the sid;
// 30+ minutes idle rolls a fresh one. Owners use this for "visits".
//
// Both are random 12-char base36 strings — opaque, no PII. localStorage
// failures (private mode, quota) fall back to a session-only random so
// dedup still works for that single page-view.

const VID_KEY = 'guavagram.visitor_id.v1'
const SID_KEY = 'guavagram.session_id.v1'
const SID_TS_KEY = 'guavagram.session_ts.v1'
const SESSION_IDLE_MS = 30 * 60 * 1000 // 30 minutes

const randId = (): string => {
  // 12 chars of base36 ≈ 62 bits of entropy. Plenty for visitor/session ids
  // (collisions only matter within one store's events, which is bounded).
  return Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 8)
}

const getVid = (): string => {
  if (typeof window === 'undefined') return ''
  try {
    const existing = window.localStorage.getItem(VID_KEY)
    if (existing) return existing
    const fresh = randId()
    window.localStorage.setItem(VID_KEY, fresh)
    return fresh
  } catch { return randId() }
}

const getSid = (): string => {
  if (typeof window === 'undefined') return ''
  try {
    const now = Date.now()
    const lastTs = Number(window.sessionStorage.getItem(SID_TS_KEY) || '0')
    let sid = window.sessionStorage.getItem(SID_KEY)
    // Roll the sid when the tab has been idle past the 30-min threshold —
    // matches the GA-style "visit" semantics. The ts gets bumped on every
    // tracked event below.
    if (!sid || (lastTs && now - lastTs > SESSION_IDLE_MS)) {
      sid = randId()
      window.sessionStorage.setItem(SID_KEY, sid)
    }
    window.sessionStorage.setItem(SID_TS_KEY, String(now))
    return sid
  } catch { return randId() }
}

const safeFetch = (url: string, extra: Record<string, any>): void => {
  if (typeof window === 'undefined') return
  try {
    const body = { ...extra, vid: getVid(), sid: getSid() }
    // Fire-and-forget. We don't await — a slow tracker should never delay
    // the visitor's tap. `keepalive` keeps the request alive across nav.
    fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => { /* swallow */ })
  } catch { /* swallow */ }
}

/** POST a page-view event. Call from onMounted of the public bio/menu/reviews. */
export function trackPageView(slug: string | undefined, source: string = 'direct'): void {
  if (!slug) return
  safeFetch(`/api/track/${encodeURIComponent(slug)}/page-view`, { source })
}

/** POST a CTA-click event. Call right when the user taps the CTA. */
export function trackCtaClick(slug: string | undefined, type: CtaType): void {
  if (!slug) return
  safeFetch(`/api/track/${encodeURIComponent(slug)}/cta-click`, { type })
}

/** Convenience: wire page-view firing to onMounted in one line. */
export function usePageViewTracker(slug: string | undefined | (() => string | undefined), source: string = 'direct') {
  onMounted(() => {
    const resolved = typeof slug === 'function' ? slug() : slug
    trackPageView(resolved, source)
  })
}
