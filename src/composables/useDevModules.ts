// Dev/owner preview overrides for the store's optional modules. Lets the
// floating OwnerToolbar force-enable Reservas / Pedidos / Empleados / Marketing
// so the owner can preview how the public bio renders with each module on,
// independent of the store's real backend config.
//
// State lives in useState (shared + reactive across every component on the page,
// so flipping a toggle in the OwnerToolbar updates the bio/sidebar live) and is
// seeded from — and persisted back to — a cookie. The cookie is read on the
// server during the useState initializer, so SSR and the first client render
// agree (same rationale as the `guava.dev.plan_mode` cookie). Pure useState
// would reset on reload; pure useCookie wouldn't propagate reactively between
// the toolbar and the page (Nuxt returns an independent ref per call).
//
// Defaults: ALL modules ON. The dev "Pro" plan already defaults to active
// (see `guava.dev.plan_mode` cookie default in bio.vue/menu.vue), and the
// owner viewing the preview expects "Pro + all modules contracted" as the
// happy-path baseline — having to toggle each module ON before reservations
// or pedidos work made the empty state look like a bug. Toggle OFF in the
// OwnerToolbar to simulate downgraded states (no Reservas module, etc.).
// The cookie still wins on subsequent loads, so once a user toggles a module
// off it stays off.

export type DevModuleKey = 'reservas' | 'pedidos' | 'empleados' | 'marketing'
export type DevModules = Record<DevModuleKey, boolean>

// Versioned key (v2) — bumped when the default state changed from
// "all false" to "all on". Reusing the original key would let stale v1
// cookies (all-false from prior sessions) keep overriding the new default,
// so the only way for an existing user to see the happy-path baseline would
// be to manually clear cookies. The version bump makes the migration
// automatic: v1 cookies are simply ignored, v2 starts fresh with all-on.
const COOKIE_KEY = 'guava.dev.modules.v2'
const KEYS: DevModuleKey[] = ['reservas', 'pedidos', 'empleados', 'marketing']

// Default-all-on shape, used when no cookie exists yet. `normalize` is only
// applied to user-supplied input (cookie payload), where missing keys still
// fall through to the explicit-false branch so partial cookies don't suddenly
// re-enable a module the user turned off in a prior session.
const DEFAULT_ALL_ON: DevModules = {
  reservas: true,
  pedidos: true,
  empleados: true,
  marketing: true,
}

const normalize = (v: Partial<DevModules> | null | undefined): DevModules => ({
  reservas: !!v?.reservas,
  pedidos: !!v?.pedidos,
  empleados: !!v?.empleados,
  marketing: !!v?.marketing,
})

export function useDevModules() {
  // `cookie.value === null/undefined` => first visit, no cookie yet => seed with
  // all-on so the public bio preview shows the full feature set out of the box.
  // Once the cookie exists (even partially), trust it verbatim via `normalize`.
  const cookie = useCookie<DevModules>(COOKIE_KEY, { default: () => ({ ...DEFAULT_ALL_ON }) })
  const seeded = cookie.value && typeof cookie.value === 'object'
    ? normalize(cookie.value)
    : { ...DEFAULT_ALL_ON }
  const modules = useState<DevModules>(COOKIE_KEY, () => seeded)

  const persist = () => { cookie.value = { ...modules.value } }
  const toggle = (k: DevModuleKey) => {
    modules.value = { ...modules.value, [k]: !modules.value[k] }
    persist()
  }
  const set = (k: DevModuleKey, v: boolean) => {
    modules.value = { ...modules.value, [k]: v }
    persist()
  }

  return { modules, keys: KEYS, toggle, set }
}
