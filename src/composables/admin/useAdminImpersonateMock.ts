// Dev-only mock of the impersonation flow. In production the backend issues
// a short-lived JWT for the target user. Here we fake a JWT whose payload
// decodes correctly via the existing `decodeJwtPayload` helper in
// useAccountType.ts (no signature verification client-side anyway).

import type { ImpersonationMeta } from '~/composables/useImpersonation'
import { IMPERSONATION_META_COOKIE } from '~/composables/useImpersonation'
import { appendAudit as storeAppendAudit } from '~/services/apis/mocks/admin/_store'
import type { AuditEventType } from '~/services/admin/types/admin-audit-event'

type Target = {
  userId: string
  label: string
  accountType: 'restaurant' | 'creator' | 'professional'
}

function b64url(obj: Record<string, unknown>): string {
  const json = JSON.stringify(obj)
  const b64 = typeof btoa === 'function' ? btoa(json) : Buffer.from(json).toString('base64')
  return b64.replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function mintFakeJwt(payload: Record<string, unknown>): string {
  const header = b64url({ alg: 'HS256', typ: 'JWT' })
  const body = b64url(payload)
  const sig = 'dev_only_no_signature'
  return `${header}.${body}.${sig}`
}

function setCookie(name: string, value: string, maxAgeSec: number) {
  if (typeof document === 'undefined') return
  const encoded = encodeURIComponent(value)
  document.cookie = `${name}=${encoded}; Max-Age=${maxAgeSec}; path=/; SameSite=Lax`
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`${name}=([^;]+)`))
  return match ? decodeURIComponent(match[1]!) : null
}

const DURATION_MS = 30 * 60 * 1000

export function startImpersonation(target: Target, admin: { email: string; id: string }) {
  if (!import.meta.dev) {
    throw new Error('[admin.impersonate] dev-only mock invoked in production build')
  }
  const now = Date.now()
  const expiresAt = now + DURATION_MS
  const sessionId = `imp_${Math.random().toString(36).slice(2, 10)}`

  const originalToken = readCookie('pu_token') || ''
  setCookie('pu_staff_token', originalToken, Math.ceil(DURATION_MS / 1000))

  const targetJwt = mintFakeJwt({
    sub: target.userId,
    account_type: target.accountType,
    is_staff: false,
    impersonated_by: admin.id,
    impersonated_expires_at: expiresAt,
    iat: Math.floor(now / 1000),
    exp: Math.floor(expiresAt / 1000),
  })
  setCookie('pu_token', targetJwt, Math.ceil(DURATION_MS / 1000))

  const meta: ImpersonationMeta = {
    targetUserId: target.userId,
    targetLabel: target.label,
    targetAccountType: target.accountType,
    originalAdminEmail: admin.email,
    originalAdminId: admin.id,
    startedAt: now,
    expiresAt,
    sessionId,
  }
  setCookie(IMPERSONATION_META_COOKIE, JSON.stringify(meta), Math.ceil(DURATION_MS / 1000))

  logImpersonateStart(meta)
  return meta
}

export function logImpersonateStart(meta: ImpersonationMeta) {
  storeAppendAudit({
    type: 'impersonate.start',
    actorId: meta.originalAdminId,
    actorEmail: meta.originalAdminEmail,
    actorRole: 'admin',
    targetId: meta.targetUserId,
    targetLabel: meta.targetLabel,
    impersonationSessionId: meta.sessionId,
    payload: { accountType: meta.targetAccountType, durationMin: DURATION_MS / 60000 },
  })
}

export function logImpersonateExit(sessionId?: string) {
  storeAppendAudit({
    type: 'impersonate.exit',
    actorRole: 'admin',
    impersonationSessionId: sessionId,
  })
}

// Kept for backwards-compat with any old callers still importing this.
export function logAdminAction(entry: {
  type: string
  actorEmail?: string
  actorId?: string
  actorRole?: string
  targetId?: string
  targetLabel?: string
  payload?: Record<string, unknown>
}) {
  storeAppendAudit({ ...entry, type: entry.type as AuditEventType })
}

// Deprecated — still exported so old callers compile; returns empty.
export function readMockAuditLog(): Record<string, unknown>[] {
  return []
}
