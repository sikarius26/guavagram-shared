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

export {}
