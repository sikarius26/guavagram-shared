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

export type DevModuleKey = 'reservas' | 'pedidos' | 'empleados' | 'marketing'
export type DevModules = Record<DevModuleKey, boolean>

const COOKIE_KEY = 'guava.dev.modules'
const KEYS: DevModuleKey[] = ['reservas', 'pedidos', 'empleados', 'marketing']

const normalize = (v: Partial<DevModules> | null | undefined): DevModules => ({
  reservas: !!v?.reservas,
  pedidos: !!v?.pedidos,
  empleados: !!v?.empleados,
  marketing: !!v?.marketing,
})

export function useDevModules() {
  const cookie = useCookie<DevModules>(COOKIE_KEY, { default: () => normalize(null) })
  const modules = useState<DevModules>(COOKIE_KEY, () => normalize(cookie.value))

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
