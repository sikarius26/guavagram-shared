// Resolve the legacy /web API base. Both public (:3003) and admin (:3004) call
// test-api directly; backend CORS must allowlist both origins.
// Note: this var is intentionally distinct from VITE_PLATFORM_API_BASE which
// is used by the v4 /platform stack (bio editor, menu editor).
const _viteEnv: any = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {}
const _envBase = (_viteEnv.VITE_WEB_API_BASE as string | undefined)
              || (_viteEnv.VITE_API_BASE_URL as string | undefined)
const _platformApiBase = (_viteEnv.VITE_PLATFORM_API_BASE as string | undefined)

export const environment = {
  production: !_viteEnv.DEV,
  baseUrl: _envBase || 'https://test-api.guavapp.com/web',
  // /platform API stack (storeprofile, menu, store status). Consumed by the
  // NSwag clients copied from GuavaPlatform. Distinct from `baseUrl` because
  // the same backend exposes /web and /platform with different routing.
  platformApiBaseUrl: _platformApiBase || 'https://test-api.guavapp.com/platform',
  baseApp: 'http://localhost:3003',
  googleAuthClientId: process.env.VITE_GOOGLE_AUTH_CLIENT_ID || '462392153796-ilj2ipeuejcmqskec29bvi5gj2tm152f.apps.googleusercontent.com',
  // Loaded by the Places autocomplete in the onboarding step + DiscoveryMatch.
  // Host apps (guavagram, guavagram-admin) also expose it on runtimeConfig.public.
  googleMapsApiKey: (_viteEnv.VITE_GOOGLE_MAPS_API_KEY as string) ?? process.env.VITE_GOOGLE_MAPS_API_KEY ?? '',
  cloudflareTurnstileSiteKey: process.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY || '0x4AAAAAACH8EAFyByrx4NRS',
  platformBaseUrl: process.env.VITE_PLATFORM_BASE_URL || 'http://localhost:3000',
}