// @guava/guavagram-shared
//
// Re-export wall for the cross-app shared package. Both `guavagram/`
// (public-facing) and `guavagram-admin/` (backoffices) consume this package
// via a `file:` link + Vite alias. Nuxt auto-import picks up composables and
// components from `src/composables/` and `src/components/` directly through
// `imports.dirs` / `components.dirs` in each app's nuxt.config.ts, so most
// call sites can keep using the bare composable / component name.
//
// Direct named imports (`import { useAuth } from '@guava/guavagram-shared'`)
// also work for code that prefers explicit imports — re-exports are added
// below as composables and services are migrated in Phase 1.

// Server-side seed used by /api/_mock/store/[slug]/bio-config GET handlers
// so the demo restaurants (cata-gourmet, brunch-co, …) start with a non-empty
// bio in both the public page and the dashboard editor.
export { getMockBioConfigSeed } from './services/apis/mocks/storeBio.mock'
