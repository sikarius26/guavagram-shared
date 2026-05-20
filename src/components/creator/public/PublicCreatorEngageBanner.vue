<script setup lang="ts">
withDefaults(defineProps<{
  recommend?: boolean
  review?: boolean
  creatorName?: string
}>(), {
  recommend: true,
  review: true,
  creatorName: '',
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Recomienda un restaurante -->
    <div v-if="recommend" class="rounded-2xl overflow-hidden relative bg-[#1A3C34]">
      <div class="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full"></div>
      <div class="absolute -bottom-6 -left-6 w-16 h-16 bg-white/[0.06] rounded-full"></div>
      <div class="relative z-10 p-5">
        <div class="flex items-center gap-2.5 mb-3">
          <div class="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <span class="mdi mdi-store-plus text-white text-lg"></span>
          </div>
          <div>
            <h3 class="font-bold text-[14px] text-white leading-tight">Recomienda un restaurante</h3>
            <p class="text-white/60 text-[10px]">y gana recompensas</p>
          </div>
        </div>
        <p class="text-white/70 text-[11px] leading-relaxed mb-4">
          ¿Conoces un sitio que debería estar en GuavaGram? Recomiéndalo y gana puntos cuando se registre.
        </p>
        <button type="button"
          class="w-full py-3 bg-white rounded-xl font-bold text-[12px] text-[#1A3C34] transition-colors hover:bg-white/90">
          <span class="mdi mdi-gift-outline mr-1"></span> Recomendar y ganar
        </button>
      </div>
    </div>

    <!-- Deja tu opinión — FIXED design. This banner is shared across creator bios AND
         restaurant pages, so it must not follow `var(--bio-*)` (the creator's theme).
         Guavagram brand neutral card + amber star (rating semantic) + charcoal CTA. -->
    <div v-if="review" class="rounded-2xl border border-[#e5e5e5] bg-white p-5">
      <div class="flex items-center gap-2.5 mb-3">
        <div class="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center ring-1 ring-amber-100">
          <span class="mdi mdi-star text-amber-500 text-lg"></span>
        </div>
        <div>
          <h3 class="font-bold text-[14px] leading-tight text-[#1a1c1b]">Deja tu opinión</h3>
          <p class="text-[10px] text-[#888]">sobre los sitios de {{ creatorName || 'este creator' }}</p>
        </div>
      </div>
      <p class="text-[11px] leading-relaxed mb-4 text-[#666]">
        Tu reseña verificada ayuda a otros foodies a descubrir buenos restaurantes.
      </p>
      <div class="flex gap-1 mb-4">
        <span v-for="n in 5" :key="n"
          class="mdi mdi-star-outline hover:text-amber-500 cursor-pointer transition-colors text-[24px] text-[#d4d4d4]"></span>
      </div>
      <button type="button"
        class="w-full py-3 rounded-xl font-bold text-[12px] text-white transition-colors bg-[#1a1c1b] hover:bg-black">
        <span class="mdi mdi-pencil-outline mr-1"></span> Escribir reseña
      </button>
    </div>
  </div>
</template>
