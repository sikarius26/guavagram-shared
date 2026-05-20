<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  items: any[]
  creatorHandle?: string
}>()

const list = computed(() => props.items ?? [])

type Variant = 'guavagram' | 'google' | 'manual'

const variantOf = (w: any): Variant => {
  if (w.source === 'guavagram' || w.storeId) return 'guavagram'
  if (w.source === 'google' || w.googlePlaceId) return 'google'
  return 'manual'
}

const hrefFor = (w: any): string | null => {
  const v = variantOf(w)
  if (v === 'guavagram' && w.slugName) return `/r/${w.slugName}`
  return null
}

const inviteHref = (w: any): string => {
  const params = new URLSearchParams()
  if (w.googlePlaceId) params.set('place', w.googlePlaceId)
  if (w.name) params.set('name', w.name)
  if (props.creatorHandle) params.set('ref', props.creatorHandle)
  return `/invitar?${params.toString()}`
}
</script>

<template>
  <div v-if="list.length === 0"
    class="rounded-2xl border border-dashed p-6 text-center"
    style="border-color: var(--bio-border, #e5e5e5);">
    <span class="mdi mdi-heart-outline text-2xl" style="color: var(--bio-text-muted, #999);"></span>
    <p class="mt-2 text-xs font-medium" style="color: var(--bio-text-muted, #666);">
      Aun no hay lugares en el radar.
    </p>
  </div>

  <div v-else class="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory" style="-ms-overflow-style:none;scrollbar-width:none;">
    <article v-for="(w, i) in list" :key="w.id ?? i"
      class="flex-none w-[190px] snap-start group">

      <component
        :is="hrefFor(w) ? 'NuxtLink' : 'div'"
        :to="hrefFor(w) ?? undefined"
        class="block relative w-full aspect-[5/7] rounded-3xl overflow-hidden bg-gray-900 ring-1 ring-black/10 dark:ring-white/10 shadow-[0_10px_24px_-14px_rgba(0,0,0,0.45)] group-hover:shadow-[0_20px_36px_-12px_rgba(0,0,0,0.25)] group-hover:-translate-y-1 transition-all duration-300"
        :style="{ '--hover-ring': 'var(--bio-accent, #ff2d23)' }">

        <!-- Image background -->
        <div class="absolute inset-0 bg-center bg-cover bg-gradient-to-br from-gray-700 to-gray-900 group-hover:scale-[1.04] transition-transform duration-500"
          :style="w.imageUrl ? { backgroundImage: `url('${w.imageUrl}')` } : {}"></div>

        <!-- Legibility gradient (stronger at bottom) -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10"></div>

        <!-- Top row: rating (left) + source icon (right) -->
        <div class="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between">
          <span v-if="variantOf(w) === 'guavagram' && w.rating"
            class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-white/95 backdrop-blur text-[#1a1c1b] shadow-sm">
            <span class="mdi mdi-star text-amber-500 text-[11px]"></span>
            {{ Number(w.rating).toFixed(1) }}
          </span>
          <span v-else class="inline-block"></span>

          <span v-if="variantOf(w) === 'guavagram'"
            class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white shadow-sm ring-2 ring-white/30"
            title="En Guavagram">
            <span class="mdi mdi-check text-[13px] leading-none"></span>
          </span>
          <span v-else-if="variantOf(w) === 'google'"
            class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/95 text-[#666] shadow-sm"
            title="Desde Google">
            <span class="mdi mdi-google text-[11px] leading-none"></span>
          </span>
          <span v-else
            class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/95 text-amber-500 shadow-sm"
            title="Wishlist">
            <span class="mdi mdi-star-four-points text-[11px] leading-none"></span>
          </span>
        </div>

        <!-- Bottom stack: quote -> name -> city + pill -->
        <div class="absolute inset-x-0 bottom-0 p-3">
          <div v-if="w.reason" class="relative pl-4 mb-2">
            <span class="absolute -top-2 left-0 text-[28px] leading-none font-black select-none drop-shadow" aria-hidden="true"
              style="color: var(--bio-accent, #ff2d23);">&ldquo;</span>
            <p class="text-[11px] text-white/95 italic leading-snug line-clamp-2 drop-shadow">{{ w.reason }}</p>
          </div>

          <p class="text-[15px] font-black text-white leading-tight line-clamp-2 drop-shadow-md">{{ w.name }}</p>

          <div class="mt-1.5 flex items-center justify-between gap-2">
            <p v-if="w.city || w.address" class="flex items-center gap-0.5 text-[10px] text-white/80 min-w-0">
              <span class="mdi mdi-map-marker text-[11px] shrink-0"></span>
              <span class="truncate">{{ w.city || w.address }}</span>
            </p>
            <span v-else class="inline-block"></span>

            <span v-if="variantOf(w) === 'guavagram'"
              class="inline-flex items-center gap-1 pl-2.5 pr-2 py-1 rounded-full bg-white/95 text-[#1a1c1b] text-[10px] font-black shrink-0 shadow-sm transition-colors"
              style="--bio-ver-hover: var(--bio-accent, #ff2d23);">
              Ver
              <span class="mdi mdi-arrow-right text-[12px] group-hover:translate-x-0.5 transition-transform"></span>
            </span>
          </div>
        </div>
      </component>

      <!-- Google invite CTA (card not clickable for this variant) -->
      <NuxtLink v-if="variantOf(w) === 'google'"
        :to="inviteHref(w)"
        class="mt-2 flex items-center justify-center gap-1 w-full py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[10px] font-black hover:from-emerald-600 hover:to-emerald-700 transition-colors">
        <span class="mdi mdi-email-fast-outline text-[11px]"></span>
        Invítales a Guavagram
      </NuxtLink>
    </article>
  </div>
</template>
