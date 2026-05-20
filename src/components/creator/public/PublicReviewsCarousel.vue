<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
  reviews: any[]
}>()

const list = computed(() => props.reviews ?? [])

const isVideo = (s: any) => s?.mediaType === 'video' && !!(s?.mediaUrl ?? s?.imageUrl)
const mediaSrc = (s: any) => s?.mediaUrl ?? s?.imageUrl ?? ''

// Append a tiny seek hint so browsers render the first frame as a poster
// even before autoplay kicks in (Chrome/Firefox/Safari respect #t=).
const videoSrc = (s: any) => {
  const url = mediaSrc(s)
  if (!url) return ''
  return url.includes('#') ? url : `${url}#t=0.1`
}

// Force the first frame to paint on browsers that won't show it from preload alone
const seekToFirstFrame = (e: Event) => {
  const v = e.target as HTMLVideoElement
  if (v && v.currentTime === 0) {
    try { v.currentTime = 0.1 } catch { /* ignore */ }
  }
}

const initialFor = (s: any): string => {
  const src = (s?.storeName ?? s?.caption ?? '').trim()
  return src ? src.charAt(0).toUpperCase() : '★'
}

// Deterministic warm food-leaning gradient per review so the fallback never looks blank
const FALLBACK_GRADIENTS = [
  'linear-gradient(135deg, #fbbf77 0%, #ef4444 100%)',
  'linear-gradient(135deg, #fb923c 0%, #db2777 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
  'linear-gradient(135deg, #f472b6 0%, #9333ea 100%)',
  'linear-gradient(135deg, #84cc16 0%, #047857 100%)',
  'linear-gradient(135deg, #06b6d4 0%, #1d4ed8 100%)',
  'linear-gradient(135deg, #ff6b4a 0%, #ff2d23 100%)',
  'linear-gradient(135deg, #facc15 0%, #c2410c 100%)',
]
const gradientFor = (s: any): string => {
  const seed = String(s?.id ?? s?.storeName ?? s?.caption ?? 'r')
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash + seed.charCodeAt(i)) >>> 0
  return FALLBACK_GRADIENTS[hash % FALLBACK_GRADIENTS.length]!
}

const showsImage = (s: any) => !isVideo(s) && !!mediaSrc(s)

// Scroll tracking for dot indicators
const scrollRef = ref<HTMLElement | null>(null)
const activeIdx = ref(0)

const onScroll = () => {
  if (!scrollRef.value) return
  const el = scrollRef.value
  const card = el.querySelector('[data-review-card]') as HTMLElement | null
  const cardWidth = card ? card.offsetWidth + 12 : 180
  const idx = Math.round(el.scrollLeft / cardWidth)
  activeIdx.value = Math.min(Math.max(idx, 0), list.value.length - 1)
}

const scrollToIdx = (i: number) => {
  if (!scrollRef.value) return
  const el = scrollRef.value
  const card = el.querySelector('[data-review-card]') as HTMLElement | null
  const cardWidth = card ? card.offsetWidth + 12 : 180
  el.scrollTo({ left: i * cardWidth, behavior: 'smooth' })
}

onMounted(() => {
  scrollRef.value?.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => {
  scrollRef.value?.removeEventListener('scroll', onScroll)
})

// Lightbox
const lightboxIndex = ref<number | null>(null)
const isOpen = computed(() => lightboxIndex.value !== null)
const current = computed(() => lightboxIndex.value !== null ? list.value[lightboxIndex.value] : null)

const open = (i: number) => { lightboxIndex.value = i }
const close = () => { lightboxIndex.value = null }
const next = () => {
  if (lightboxIndex.value === null) return
  lightboxIndex.value = (lightboxIndex.value + 1) % list.value.length
}
const prev = () => {
  if (lightboxIndex.value === null) return
  lightboxIndex.value = (lightboxIndex.value - 1 + list.value.length) % list.value.length
}
</script>

<template>
  <div v-if="list.length === 0"
    class="rounded-2xl border border-dashed p-6 text-center"
    style="border-color: var(--bio-border, #e5e5e5);">
    <span class="mdi mdi-video-outline text-2xl" style="color: var(--bio-text-muted, #999);"></span>
    <p class="mt-2 text-xs font-medium" style="color: var(--bio-text-muted, #666);">
      Todavía no hay reseñas publicadas.
    </p>
  </div>

  <div v-else>
    <!-- Scrollable reviews row (hidden scrollbar) -->
    <div
      ref="scrollRef"
      class="flex gap-3 overflow-x-auto snap-x snap-mandatory reviews-scroll"
      style="scrollbar-width: none; -ms-overflow-style: none;">
      <button
        v-for="(s, i) in list"
        :key="s.id ?? i"
        type="button"
        @click="open(i)"
        data-review-card
        :aria-label="`Ver reseña${s.storeName ? ' en ' + s.storeName : ''}`"
        class="flex-none w-[170px] snap-start text-left group">
        <div class="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_8px_24px_-8px_rgba(0,0,0,0.18)] group-hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.25)] group-hover:-translate-y-0.5 transition-all"
          :style="{ backgroundColor: '#ff6b4a', backgroundImage: gradientFor(s) }">
          <!-- Initial-letter fallback (covered by image/video when they load) -->
          <div v-if="!showsImage(s)"
            class="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span class="text-white/85 font-black text-[64px] leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)] tracking-tight">
              {{ initialFor(s) }}
            </span>
          </div>
          <div v-if="showsImage(s)"
            class="absolute inset-0 bg-center bg-cover"
            :style="{ backgroundImage: `url('${mediaSrc(s)}')` }"></div>
          <video v-if="isVideo(s)" :src="videoSrc(s)"
            class="absolute inset-0 w-full h-full object-cover"
            muted autoplay loop playsinline preload="metadata"
            @loadedmetadata="seekToFirstFrame"></video>
          <!-- Caption-readability scrim: only the bottom darkens, top keeps the cover color -->
          <div class="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
            style="background: linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.45) 35%, transparent 100%);"></div>

          <!-- Top row: rating (left) + store tag / video badge (right) -->
          <div class="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-2">
            <span v-if="typeof s.rating === 'number' && s.rating > 0"
              class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-white/95 backdrop-blur text-[#1a1c1b] shadow-sm tabular-nums">
              <span class="mdi mdi-star text-amber-500 text-[11px]"></span>{{ Number(s.rating).toFixed(1) }}
            </span>
            <span v-else class="inline-block"></span>

            <div class="flex items-center gap-1.5 shrink-0 max-w-[70%]">
              <span v-if="s.storeName"
                class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-white/95 backdrop-blur text-[#1a1c1b] shadow-sm truncate">
                <span class="truncate">{{ s.storeName }}</span>
              </span>
              <span v-if="isVideo(s)"
                class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/95 text-[#1a1c1b] shadow-sm shrink-0"
                title="Video">
                <span class="mdi mdi-play text-[12px] leading-none"></span>
              </span>
            </div>
          </div>

          <!-- Caption bottom -->
          <div class="absolute bottom-0 left-0 right-0 p-3">
            <p v-if="s.caption" class="text-white text-[13px] font-black leading-tight line-clamp-3 drop-shadow-md">
              {{ s.caption }}
            </p>
          </div>
        </div>
      </button>
    </div>

    <!-- Dots indicator -->
    <div v-if="list.length > 1" class="flex justify-center items-center gap-1.5 mt-4">
      <button
        v-for="(_, i) in list"
        :key="`dot-${i}`"
        type="button"
        @click="scrollToIdx(i)"
        class="rounded-full transition-all duration-200"
        :class="activeIdx === i ? 'w-6 h-1.5' : 'w-1.5 h-1.5'"
        :style="activeIdx === i
          ? { backgroundColor: 'var(--bio-text, #1a1c1b)' }
          : { backgroundColor: 'var(--bio-divider, #ddd)' }"
        :aria-label="`Ir a la reseña ${i + 1}`"></button>
    </div>
  </div>

  <!-- Lightbox -->
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
      @click.self="close">
      <button type="button" @click="close"
        class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">
        <span class="mdi mdi-close text-xl"></span>
      </button>

      <button v-if="list.length > 1" type="button" @click="prev"
        class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">
        <span class="mdi mdi-chevron-left text-2xl"></span>
      </button>

      <div v-if="current" class="relative max-w-md w-full aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl"
        :style="{ backgroundColor: '#ff6b4a', backgroundImage: gradientFor(current) }">
        <div v-if="!showsImage(current)"
          class="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span class="text-white/85 font-black text-[140px] leading-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.3)] tracking-tight">
            {{ initialFor(current) }}
          </span>
        </div>
        <div v-if="showsImage(current)"
          class="absolute inset-0 bg-center bg-cover"
          :style="{ backgroundImage: `url('${mediaSrc(current)}')` }"></div>
        <video v-if="isVideo(current)" :src="videoSrc(current)"
          class="absolute inset-0 w-full h-full object-cover"
          autoplay loop playsinline controls preload="auto"
          @loadedmetadata="seekToFirstFrame"></video>
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
        <div class="absolute bottom-5 left-5 right-5 pointer-events-none">
          <div class="flex items-center gap-1.5 mb-2 flex-wrap">
            <span v-if="typeof current.rating === 'number' && current.rating > 0"
              class="inline-flex items-center gap-0.5 px-2 py-1 rounded-full text-[11px] font-black bg-white/95 backdrop-blur text-[#1a1c1b] shadow-sm tabular-nums">
              <span class="mdi mdi-star text-amber-500 text-xs"></span>{{ Number(current.rating).toFixed(1) }}
            </span>
            <span v-if="current.storeName"
              class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-black bg-white/95 backdrop-blur text-[#1a1c1b] shadow-sm">
              {{ current.storeName }}
            </span>
          </div>
          <p v-if="current.caption" class="text-white text-lg font-extrabold leading-tight">{{ current.caption }}</p>
        </div>
      </div>

      <button v-if="list.length > 1" type="button" @click="next"
        class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">
        <span class="mdi mdi-chevron-right text-2xl"></span>
      </button>
    </div>
  </Teleport>
</template>

<style scoped>
.reviews-scroll::-webkit-scrollbar { display: none; }
</style>
