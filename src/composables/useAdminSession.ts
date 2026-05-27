import { computed } from 'vue'
import { ROLE_MATRIX } from '~/services/admin/roles'
import type { Permission, StaffRole } from '~/services/admin/types/admin-staff-role'

// Reads staff claims from the `pu_token` JWT (same cookie used across the app).
// Dev-only fallback via localStorage.dev_staff_role — mirrors the pattern in
// useAccountType.ts so designers/devs can swap roles without a real backend.

function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payloadPart = parts[1]
    if (!payloadPart) return null
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '==='.slice((base64.length + 3) % 4)
    const json = typeof atob === 'function' ? atob(padded) : Buffer.from(padded, 'base64').toString('utf-8')
    return JSON.parse(json)
  } catch {
    return null
  }
}

const VALID_ROLES: StaffRole[] = ['super_admin', 'ops', 'finance', 'content_mod', 'support']

function normalizeRole(value: unknown): StaffRole | null {
  return typeof value === 'string' && (VALID_ROLES as string[]).includes(value)
    ? (value as StaffRole)
    : null
}

export function useAdminSession() {
  const cookie = useCookie<string | null>('pu_token')

  const claims = computed(() => {
    const token = cookie.value
    const payload = token ? decodeJwtPayload(token) : null

    let isStaff = !!(payload?.is_staff ?? payload?.isStaff)
    let role: StaffRole | null = normalizeRole(payload?.staff_role ?? payload?.staffRole)

    if (import.meta.dev && typeof localStorage !== 'undefined') {
      // In dev, default to super_admin so the admin is usable out of the box.
      // Persist to localStorage so toggling via the dev switcher is sticky.
      let devRole = normalizeRole(localStorage.getItem('dev_staff_role'))
      if (!devRole) {
        devRole = 'super_admin'
        try { localStorage.setItem('dev_staff_role', devRole) } catch {}
      }
      isStaff = true
      role = devRole
    }

    return { isStaff, role }
  })

  const isStaff = computed(() => claims.value.isStaff)
  const staffRole = computed<StaffRole | null>(() => claims.value.role)

  // True ONLY when there's a real JWT in the cookie that decodes successfully.
  // The dev fallback above forces super_admin without a cookie, which is fine
  // for the admin app but leaks owner/admin UI to anonymous visitors on the
  // public bio (/r/[slug]/*) in incognito. Pages that render publicly should
  // gate dev/owner controls on `hasRealStaffToken`, not on `isStaff`.
  const hasRealStaffToken = computed(() => {
    const token = cookie.value
    if (!token) return false
    const payload = decodeJwtPayload(token)
    if (!payload) return false
    return !!(payload.is_staff ?? payload.isStaff)
  })

  const can = (permission: Permission): boolean => {
    if (!isStaff.value) return false
    const role = staffRole.value
    if (!role) return false
    if (role === 'super_admin') return true
    return ROLE_MATRIX[role]?.includes(permission) ?? false
  }

  const setDevRole = (role: StaffRole | null) => {
    if (!import.meta.dev || typeof localStorage === 'undefined') return
    if (role) localStorage.setItem('dev_staff_role', role)
    else localStorage.removeItem('dev_staff_role')
    // force reactivity refresh by touching the cookie ref
    cookie.value = cookie.value
  }

  return { isStaff, staffRole, hasRealStaffToken, can, setDevRole }
}
