<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { useCelebrate } from '~/composables/useCelebrate'
import { onMatchPromoted } from '~/composables/useMatchWallet'
import { useMatchWallet } from '~/composables/useMatchWallet'

const celebrate = useCelebrate()
const matchWallet = useMatchWallet()

let unsubscribe: (() => void) | null = null

onMounted(() => {
  unsubscribe = onMatchPromoted(({ storeSlug, storeName, code }) => {
    const entry = matchWallet.list.value.find(m => m.storeSlug === storeSlug)
    celebrate.match({
      storeName,
      storeSlug,
      code,
      storeLogoUrl: entry?.storeLogoUrl,
      storeCoverUrl: entry?.storeCoverUrl,
    })
  })
})

onBeforeUnmount(() => { unsubscribe?.() })

const goToCoupon = () => {
  if (typeof window === 'undefined') return
  const slug = celebrate.matchPayload.value?.storeSlug
  celebrate.dismissMatch()
  window.location.href = slug ? `/wallet?tab=cupones&focus=${slug}` : '/wallet?tab=cupones'
}
</script>

<template>
  <!-- Confetti overlay (global) -->
  <Teleport to="body">
    <div
      v-if="celebrate.confettiActive.value"
      aria-hidden="true"
      class="pointer-events-none fixed inset-0 z-[100]"
    >
      <div class="absolute" style="left: 50%; top: 30%;">
        <span
          v-for="p in celebrate.confettiParticles.value"
          :key="p.id"
          class="absolute block rounded-sm"
          :style="{
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            left: '0',
            top: '0',
            transform: `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg)`,
            transition: `all 1.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${p.delay}s`,
            opacity: 0.92,
          }"
        ></span>
      </div>
    </div>
  </Teleport>

  <!-- "It's a match!" overlay -->
  <Teleport to="body">
    <Transition name="match-overlay">
      <div
        v-if="celebrate.matchPayload.value"
        class="fixed inset-0 z-[110] flex items-center justify-center px-5"
        @click.self="celebrate.dismissMatch()"
      >
        <div
          aria-hidden="true"
          class="absolute inset-0 bg-gradient-to-br from-[#ff2d23]/95 via-[#ff6b4a]/90 to-[#10b981]/95 backdrop-blur-sm"
        ></div>

        <!-- decorative blurred halos -->
        <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
          <div class="absolute -top-32 -left-24 w-80 h-80 rounded-full bg-white/30 blur-3xl"></div>
          <div class="absolute -bottom-32 -right-20 w-96 h-96 rounded-full bg-white/25 blur-3xl"></div>
        </div>

        <div
          class="relative w-full max-w-sm rounded-3xl bg-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.45)] overflow-hidden"
          @click.stop
        >
          <!-- close -->
          <button
            type="button"
            @click="celebrate.dismissMatch()"
            aria-label="Cerrar"
            class="absolute top-3 right-3 z-10 inline-flex items-center justify-center w-8 h-8 rounded-full bg-black/20 backdrop-blur text-white hover:bg-black/40 transition-colors"
          >
            <span class="mdi mdi-close text-base"></span>
          </button>

          <!-- hero -->
          <div class="relative h-36 overflow-hidden">
            <div
              v-if="celebrate.matchPayload.value.storeCoverUrl"
              class="absolute inset-0 bg-center bg-cover"
              :style="{ backgroundImage: `url('${celebrate.matchPayload.value.storeCoverUrl}')` }"
            ></div>
            <div
              v-else
              class="absolute inset-0 bg-gradient-to-br from-[#ff2d23] via-[#ff6b4a] to-[#f59e0b]"
            ></div>
            <div class="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent"></div>

            <!-- Logo emerging -->
            <div class="absolute inset-x-0 -bottom-8 flex justify-center">
              <div
                v-if="celebrate.matchPayload.value.storeLogoUrl"
                class="w-20 h-20 rounded-2xl bg-center bg-cover ring-4 ring-white shadow-[0_12px_30px_-8px_rgba(0,0,0,0.3)]"
                :style="{ backgroundImage: `url('${celebrate.matchPayload.value.storeLogoUrl}')` }"
              ></div>
              <div
                v-else
                class="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#ff2d23] to-[#ff6b4a] ring-4 ring-white shadow-[0_12px_30px_-8px_rgba(0,0,0,0.3)] flex items-center justify-center"
              >
                <span class="mdi mdi-silverware-fork-knife text-3xl text-white"></span>
              </div>
            </div>
          </div>

          <div class="pt-12 pb-6 px-6 text-center">
            <p class="text-[11px] font-black uppercase tracking-[0.18em] text-[#ff2d23]">¡It's a match!</p>
            <h3 class="mt-1 text-[22px] font-black text-slate-900 leading-tight">
              {{ celebrate.matchPayload.value.storeName }}
              <br />
              te ha enviado un cupón
            </h3>
            <p v-if="celebrate.matchPayload.value.message" class="mt-2 text-[13px] text-slate-600 leading-snug">
              {{ celebrate.matchPayload.value.message }}
            </p>

            <div
              v-if="celebrate.matchPayload.value.code"
              class="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border-2 border-dashed border-emerald-300"
            >
              <span class="mdi mdi-ticket-percent text-emerald-600 text-base"></span>
              <span class="font-mono font-black text-[14px] tracking-wider text-emerald-800">
                {{ celebrate.matchPayload.value.code }}
              </span>
            </div>

            <button
              type="button"
              @click="goToCoupon"
              class="mt-5 inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl font-extrabold text-sm text-white shadow-[0_10px_28px_-8px_rgba(16,185,129,0.55)] hover:scale-[1.02] active:scale-95 transition-all"
              style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);"
            >
              <span class="mdi mdi-wallet-outline"></span>
              Ver cupón en mi wallet
            </button>
            <button
              type="button"
              @click="celebrate.dismissMatch()"
              class="mt-2 text-[12px] font-semibold text-slate-500 hover:text-slate-800"
            >
              Seguir explorando
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.match-overlay-enter-active,
.match-overlay-leave-active {
  transition: opacity 0.25s ease;
}
.match-overlay-enter-active > div:last-child,
.match-overlay-leave-active > div:last-child {
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease;
}
.match-overlay-enter-from,
.match-overlay-leave-to {
  opacity: 0;
}
.match-overlay-enter-from > div:last-child,
.match-overlay-leave-to > div:last-child {
  transform: scale(0.85);
  opacity: 0;
}
</style>
