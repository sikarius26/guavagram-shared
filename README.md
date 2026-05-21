# @guava/guavagram-shared

Cross-app shared package consumed by `guavagram/` (public customer-facing app) and `guavagram-admin/` (backoffices). **Not** a Nuxt app — a plain TypeScript/Vue source package linked via `file:../guavagram-shared` from each consuming app's `package.json`.

## Contents

```
src/
├── composables/        82 composables auto-imported by both apps:
│   ├── (root)            useAuth, useCurrentStore, useStoreSession,
│   │                     useBilling, useVerification, useNumberFormatter,
│   │                     useCelebrate, useImpersonation, …
│   ├── admin/            4 admin-specific (useAdminSidebarCounters, etc.)
│   └── data/             8 data-fetching helpers
├── services/
│   ├── apis/            187 API models + 20 API clients (NSwag-generated) +
│   │                     mocks/ used by storeBio.mock & friends
│   ├── admin/            roles.ts + types/ (ROLE_MATRIX + StaffRole)
│   └── notification.ts   notifier.notifySuccess / notifyError wrapper
├── components/         12 component dirs that BOTH apps render:
│   │                     auth/, global/, layout/, shared/, common/, user/
│   │                     + creator/, onboarding/, onboarding-professional/,
│   │                     store/, gamification/, restaurant/
├── locales/            es/en/ca/it/fr/pt JSON bundles for vue-i18n
├── environment.ts      Runtime env-var fallbacks
└── index.ts            Re-export wall (mostly stubbed — auto-import
                        does the real heavy lifting)
tailwind-preset.cjs    Shared Tailwind theme (colors, gradients, shadows,
                       plugins). Each app's tailwind.config.js does
                       `presets: [require('@guava/guavagram-shared/tailwind-preset')]`
```

## How apps consume it

Each Nuxt sibling has these pieces in its `nuxt.config.ts`:

```ts
build: { transpile: ['@guava/guavagram-shared'] },
imports: {
  dirs: [
    resolve(__dirname, '../guavagram-shared/src/composables'),
    resolve(__dirname, '../guavagram-shared/src/composables/admin'),
    resolve(__dirname, '../guavagram-shared/src/composables/data'),
  ],
},
components: {
  dirs: [
    /* per-app app/components */,
    { path: resolve(__dirname, '../guavagram-shared/src/components/auth'),  pathPrefix: false },
    { path: resolve(__dirname, '../guavagram-shared/src/components/global'), pathPrefix: false },
    /* … and the other 10 shared dirs */
  ],
},
i18n: { langDir: resolve(__dirname, '../guavagram-shared/src/locales'), … },
vite: {
  resolve: {
    alias: [
      { find: '@guava/guavagram-shared',     replacement: resolve(__dirname, '../guavagram-shared/src') },
      { find: /^~\/services\/apis\/(.*)$/,    replacement: resolve(__dirname, '../guavagram-shared/src/services/apis') + '/$1' },
      { find: /^~\/services\/admin\/(.*)$/,   replacement: resolve(__dirname, '../guavagram-shared/src/services/admin') + '/$1' },
      { find: /^~\/services\/notification$/,  replacement: resolve(__dirname, '../guavagram-shared/src/services/notification.ts') },
      { find: /^~\/composables\/(.*)$/,       replacement: resolve(__dirname, '../guavagram-shared/src/composables') + '/$1' },
      { find: /^~\/components\/(auth|global|layout|shared|common|user|creator|onboarding|onboarding-professional|store|gamification|restaurant)\/(.*)$/,
                                              replacement: resolve(__dirname, '../guavagram-shared/src/components') + '/$1/$2' },
    ],
    dedupe: ['vue-i18n', '@intlify/shared', '@intlify/core-base', '@intlify/message-compiler', '@intlify/runtime', '@intlify/vue-i18n-extensions'],
  },
  ssr: {
    noExternal: ['@guava/guavagram-shared', 'vue-i18n', '@intlify/shared', /* … */]
  },
},
```

## Working in this repo

Edits to any file here are picked up by both apps via HMR (`file:` link + `build.transpile`). Run `npm run dev` from the workspace root and changes are reflected live on both `:3003` (public) and `:3004` (admin).

There's no build step under normal use — the package exports `.ts`/`.vue` source directly. The `npm run build` script (Vite library mode) is only there if you ever need a precompiled `.d.ts` + `.mjs` bundle (e.g., publishing to a registry).

## Pitfalls

See [../guavagram/WORKSPACE.md](../guavagram/WORKSPACE.md) — section "Pitfalls confirmados durante el split". The ones most relevant when editing here:

1. Don't pin Vue / vue-i18n versions in this package's `node_modules`. They're `peerDependencies` — the host apps provide them. A nested copy creates a second i18n instance and `$t()` returns raw keys.
2. The `tailwind-preset.cjs` is `.cjs` (CommonJS) because Tailwind config loaders don't grok ESM cleanly.
3. Don't import from `~/composables/...` etc. inside this package — relative paths only (`./other-composable`). The `~` aliases are host-side.
