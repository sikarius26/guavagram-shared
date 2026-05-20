export const environment = {
  production: false,
  baseUrl: 'https://test-api.guavapp.com/web',
  baseApp: 'http://localhost:3003',
  googleAuthClientId: process.env.VITE_GOOGLE_AUTH_CLIENT_ID || '462392153796-ilj2ipeuejcmqskec29bvi5gj2tm152f.apps.googleusercontent.com',
  cloudflareTurnstileSiteKey: process.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY || '0x4AAAAAACH8EAFyByrx4NRS',
  platformBaseUrl: process.env.VITE_PLATFORM_BASE_URL || 'http://localhost:3000',
}