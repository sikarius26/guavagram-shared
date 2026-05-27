<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAppDownloadOptin } from '~/composables/useAppDownloadOptin'

// qrcode v1.5 ships pure CJS. Because THIS file lives in guavagram-shared/
// (outside the consuming app's root), Vite serves it via the `@fs/` handler
// which bypasses `optimizeDeps` pre-bundling entirely — so a static
// `import { toDataURL } from 'qrcode'` throws SyntaxError on module load
// and crashes the whole client bundle (hydration dies on /menu and /bio).
// Dynamic import dodges this: Vite emits a separate chunk and runs the
// full CJS→ESM wrapper on it, so both named and default access work.
async function loadQRCode() {
  const mod: any = await import('qrcode')
  return (mod.toDataURL ?? mod.default?.toDataURL) as typeof import('qrcode').toDataURL
}

const { isOpen, close } = useAppDownloadOptin()

const APP_URL = 'https://guavagram.com/?utm_source=app_optin&utm_medium=qr'
const DEEPLINK = 'https://guavagram.com/?utm_source=app_optin&utm_medium=cta'

const qrDataUrl = ref<string>('')

watch(isOpen, async (v) => {
  if (!v || qrDataUrl.value) return
  try {
    const toDataURL = await loadQRCode()
    qrDataUrl.value = await toDataURL(APP_URL, {
      width: 220,
      margin: 1,
      color: { dark: '#1f1310', light: '#ffffff' },
    })
  } catch {}
})

const bullets = [
  { icon: 'mdi-tag-multiple-outline', text: 'Descuentos exclusivos en la app' },
  { icon: 'mdi-trophy-variant-outline', text: 'Gana Guava Points y sube de rango' },
  { icon: 'mdi-heart-outline', text: 'Guarda y reserva tus favoritos' },
]
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition name="optin-fade">
        <div
          v-if="isOpen"
          class="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="app-optin-title"
        >
          <div class="absolute inset-0 bg-black/55" @click="close"></div>

          <div
            class="relative w-full max-w-[920px] rounded-3xl shadow-2xl overflow-hidden text-white"
            style="background: linear-gradient(135deg, #ff2d23 0%, #c41a12 55%, #8b1208 100%);"
          >
            <span
              aria-hidden="true"
              class="pointer-events-none absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full opacity-50 blur-2xl"
              style="background: radial-gradient(circle at 30% 30%, #ff8a6e 0%, transparent 60%);"
            ></span>
            <span
              aria-hidden="true"
              class="pointer-events-none absolute bottom-[-60px] right-[-40px] w-[260px] h-[260px] rounded-[44%] opacity-40"
              style="background: radial-gradient(circle, #ffb199 0%, transparent 70%);"
            ></span>

            <button
              type="button"
              @click="close"
              aria-label="Cerrar"
              class="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition-colors"
            >
              <span class="mdi mdi-close text-xl text-white"></span>
            </button>

            <div class="relative grid md:grid-cols-[1fr_auto] gap-0 md:gap-6">
              <div class="p-6 sm:p-8 md:p-10 max-w-xl">
                <div class="flex items-center gap-3 mb-5">
                  <span
                    class="w-10 h-10 rounded-xl flex items-center justify-center bg-white/15 ring-1 ring-white/20"
                  >
                    <img
                      src="/images/logo-guavagram-white.png"
                      alt="Guavagram"
                      class="w-6 h-6 object-contain"
                    />
                  </span>
                  <div class="leading-tight">
                    <div class="flex items-center gap-0.5 text-amber-300">
                      <span class="mdi mdi-star text-base"></span>
                      <span class="mdi mdi-star text-base"></span>
                      <span class="mdi mdi-star text-base"></span>
                      <span class="mdi mdi-star text-base"></span>
                      <span class="mdi mdi-star text-base"></span>
                    </div>
                    <p class="text-[12px] text-white/80 mt-0.5">
                      Recomendado por creadores en tu ciudad
                    </p>
                  </div>
                </div>

                <h2
                  id="app-optin-title"
                  class="text-[26px] sm:text-3xl md:text-[34px] font-extrabold tracking-tight leading-[1.1] mb-5"
                >
                  Desbloquea descuentos y Guava Points en la app
                </h2>

                <ul class="flex flex-col gap-3 mb-6">
                  <li
                    v-for="b in bullets"
                    :key="b.icon"
                    class="flex items-center gap-3 text-[15px] text-white"
                  >
                    <span
                      class="w-9 h-9 rounded-full flex items-center justify-center bg-white/15 ring-1 ring-white/20 shrink-0"
                    >
                      <span class="mdi text-lg" :class="b.icon"></span>
                    </span>
                    <span>{{ b.text }}</span>
                  </li>
                </ul>

                <div class="hidden md:flex items-center gap-4">
                  <div class="bg-white rounded-2xl p-3 shrink-0">
                    <div class="w-[120px] h-[120px] flex items-center justify-center">
                      <img
                        v-if="qrDataUrl"
                        :src="qrDataUrl"
                        alt="QR para descargar Guavagram"
                        class="w-full h-full"
                      />
                      <span v-else class="mdi mdi-qrcode text-5xl text-[#1f1310]/40"></span>
                    </div>
                  </div>
                  <div>
                    <p class="text-[16px] font-extrabold text-white leading-tight">
                      Escanea para descargar
                    </p>
                    <p class="text-[12px] text-white/80 mt-1">
                      Disponible en iOS y Android
                    </p>
                  </div>
                </div>

                <div class="md:hidden flex flex-col gap-2">
                  <a
                    :href="DEEPLINK"
                    class="block w-full rounded-2xl px-5 py-3.5 text-center text-[15px] font-extrabold transition-transform active:scale-[0.98]"
                    style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); color: #ffffff; box-shadow: 0 10px 24px -10px rgba(0,0,0,0.5);"
                  >
                    <span class="mdi mdi-cellphone-arrow-down mr-1.5"></span>
                    Abrir en la app
                  </a>
                  <button
                    type="button"
                    @click="close"
                    class="w-full text-center text-[13px] text-white/80 underline-offset-2 hover:underline py-2"
                  >
                    Quizá más tarde
                  </button>
                </div>
              </div>

              <div
                aria-hidden="true"
                class="hidden md:flex items-end justify-end pr-8 pb-6 pt-10 relative"
              >
                <div
                  class="relative w-[230px] h-[470px] rounded-[36px] bg-[#0e0807] ring-[3px] ring-white/15 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)] overflow-hidden"
                >
                  <span
                    class="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 rounded-full bg-black z-10"
                  ></span>
                  <div class="absolute inset-[10px] rounded-[28px] bg-gradient-to-br from-[#fff8f6] via-white to-[#ffe9e1] flex flex-col">
                    <div class="px-4 pt-7 pb-2">
                      <div class="flex items-center justify-between mb-3">
                        <span class="mdi mdi-map-marker text-[#ff2d23] text-base"></span>
                        <span class="mdi mdi-magnify text-gray-400 text-base"></span>
                      </div>
                      <div class="h-9 rounded-xl bg-gray-100"></div>
                    </div>
                    <div class="flex gap-2 px-4 pb-2 overflow-hidden">
                      <span class="w-12 h-12 rounded-xl bg-white shadow-sm shrink-0 flex items-center justify-center text-base">🍣</span>
                      <span class="w-12 h-12 rounded-xl bg-white shadow-sm shrink-0 flex items-center justify-center text-base">🍕</span>
                      <span class="w-12 h-12 rounded-xl bg-white shadow-sm shrink-0 flex items-center justify-center text-base">🍔</span>
                      <span class="w-12 h-12 rounded-xl bg-white shadow-sm shrink-0 flex items-center justify-center text-base">🥗</span>
                    </div>
                    <div class="flex flex-col gap-2 px-4 pb-4 mt-1 flex-1">
                      <div class="rounded-xl bg-white shadow-sm p-2.5 flex gap-2">
                        <span class="w-12 h-12 rounded-lg bg-gradient-to-br from-[#ffb199] to-[#ff6b4a] shrink-0"></span>
                        <span class="flex-1 min-w-0 flex flex-col justify-center gap-1">
                          <span class="block h-2 w-3/4 rounded bg-gray-200"></span>
                          <span class="block h-2 w-1/2 rounded bg-gray-100"></span>
                          <span class="inline-flex items-center gap-1 self-start mt-0.5 px-1.5 py-0.5 rounded text-[8px] font-extrabold text-white" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">-15%</span>
                        </span>
                      </div>
                      <div class="rounded-xl bg-white shadow-sm p-2.5 flex gap-2">
                        <span class="w-12 h-12 rounded-lg bg-gradient-to-br from-[#a7f3d0] to-[#10b981] shrink-0"></span>
                        <span class="flex-1 min-w-0 flex flex-col justify-center gap-1">
                          <span class="block h-2 w-2/3 rounded bg-gray-200"></span>
                          <span class="block h-2 w-1/2 rounded bg-gray-100"></span>
                          <span class="inline-flex items-center gap-1 self-start mt-0.5 px-1.5 py-0.5 rounded text-[8px] font-extrabold text-white" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">-5€</span>
                        </span>
                      </div>
                      <div class="rounded-xl bg-white shadow-sm p-2.5 flex gap-2">
                        <span class="w-12 h-12 rounded-lg bg-gradient-to-br from-[#fde68a] to-[#f59e0b] shrink-0"></span>
                        <span class="flex-1 min-w-0 flex flex-col justify-center gap-1">
                          <span class="block h-2 w-3/5 rounded bg-gray-200"></span>
                          <span class="block h-2 w-2/5 rounded bg-gray-100"></span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>

<style scoped>
.optin-fade-enter-active, .optin-fade-leave-active {
  transition: opacity 220ms ease;
}
.optin-fade-enter-active > div:last-child,
.optin-fade-leave-active > div:last-child {
  transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease;
}
.optin-fade-enter-from, .optin-fade-leave-to { opacity: 0; }
.optin-fade-enter-from > div:last-child,
.optin-fade-leave-to > div:last-child {
  transform: translateY(12px) scale(0.97);
  opacity: 0;
}
</style>
