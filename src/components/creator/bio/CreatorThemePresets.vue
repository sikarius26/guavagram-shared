<script setup lang="ts">
import { computed } from 'vue'
import { CREATOR_BIO_THEMES, type CreatorBioTheme } from '~/composables/useCreatorBioThemes'

// Reusable bio theme grid — works for both the creator bio and the restaurant bio.
// The parent provides current style fields + an apply callback. The component
// highlights the preset whose fields match and fires the callback on click.
//
// Locked premium themes are PREVIEWABLE on click (apply temporarily so the live
// preview reflects them). The lock chrome remains visible and a "Desbloquear"
// CTA in the corner emits `upgrade` so the parent can route to pricing.

const props = withDefaults(defineProps<{
  skinId?: string
  accentColor?: string
  bgColor?: string
  textColor?: string
  skinTypography?: string
  skinRadius?: string
  isPro?: boolean
}>(), { isPro: false })

const emit = defineEmits<{
  (e: 'apply', theme: CreatorBioTheme): void
  (e: 'reset'): void
  (e: 'upgrade', theme: CreatorBioTheme): void
}>()

const activeThemeId = computed(() => {
  return CREATOR_BIO_THEMES.find(t =>
    t.style.skinId === props.skinId &&
    t.style.bgColor === props.bgColor &&
    t.style.textColor === props.textColor &&
    t.style.accentColor === props.accentColor &&
    t.style.skinTypography === props.skinTypography &&
    t.style.skinRadius === props.skinRadius
  )?.id
})

const isLocked = (t: CreatorBioTheme) => t.tier === 'premium' && !props.isPro
const isPreviewing = (t: CreatorBioTheme) => isLocked(t) && activeThemeId.value === t.id

const onClickTheme = (t: CreatorBioTheme) => {
  if (activeThemeId.value === t.id) { emit('reset'); return }
  emit('apply', t)
}

const onClickUnlock = (e: MouseEvent, t: CreatorBioTheme) => {
  e.stopPropagation()
  emit('upgrade', t)
}

const cardSurface = (t: CreatorBioTheme): string => {
  return t.style.mode === 'dark' ? '#1f1f1f' : '#ffffff'
}
const cardBorder = (t: CreatorBioTheme): string => {
  return t.style.mode === 'dark' ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)'
}
</script>

<template>
  <div class="grid grid-cols-2 gap-2">
    <button v-for="t in CREATOR_BIO_THEMES" :key="t.id"
      type="button"
      @click="onClickTheme(t)"
      class="group relative aspect-[3/5] rounded-2xl overflow-hidden ring-1 transition-all active:scale-[0.97]"
      :class="[
        activeThemeId === t.id
          ? (isLocked(t)
              ? 'ring-2 ring-sky-500 ring-offset-2 ring-offset-white shadow-[0_8px_20px_-8px_rgba(14,165,233,0.45)]'
              : 'ring-2 ring-[#1a1c1b] ring-offset-2 ring-offset-white shadow-[0_8px_20px_-8px_rgba(0,0,0,0.25)]')
          : 'ring-black/5 hover:ring-black/20 hover:shadow-[0_6px_16px_-8px_rgba(0,0,0,0.15)]'
      ]"
      :style="{ background: t.thumb.bgCss }"
      :title="isLocked(t)
        ? (isPreviewing(t) ? `${t.label} — previsualizando · Desbloquea con Pro` : `${t.label} — toca para previsualizar · Desbloquea con Pro`)
        : (activeThemeId === t.id ? `Click para volver al tema por defecto` : t.label)">

      <!-- Thumbnail content (mimics Linktree preview cards) -->
      <div class="absolute inset-0 flex flex-col items-center px-3 pt-4 pb-3">
        <div class="w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0"
          :style="{
            backgroundColor: t.thumb.buttonBg === 'transparent' ? t.thumb.textColor + '20' : t.thumb.buttonBg,
            borderColor: t.thumb.textColor + '33',
          }">
          <span class="mdi mdi-account text-[14px]" :style="{ color: t.thumb.textColor, opacity: 0.5 }"></span>
        </div>

        <p class="text-[9px] font-black tracking-tight mt-1.5 leading-tight text-center truncate max-w-full"
          :style="{ color: t.thumb.textColor }">{{ t.label }}</p>
        <p class="text-[6.5px] font-medium mt-0.5 leading-tight text-center truncate max-w-full"
          :style="{ color: t.thumb.textColor, opacity: 0.6 }">@creator</p>

        <div class="flex items-center gap-0.5 mt-1.5">
          <span v-for="n in 3" :key="n" class="w-1.5 h-1.5 rounded-full"
            :style="{ backgroundColor: t.thumb.textColor, opacity: 0.5 }"></span>
        </div>

        <div class="w-full h-3 mt-2.5"
          :style="{
            backgroundColor: t.thumb.buttonBg,
            borderRadius: t.style.skinRadius === 'pill' ? '9999px' : t.style.skinRadius === 'squared' ? '2px' : '6px',
            border: t.thumb.buttonBorder ? `1px solid ${t.thumb.buttonBorder}` : 'none',
          }"></div>

        <div class="w-full flex flex-col gap-1 mt-1">
          <div v-for="n in 2" :key="n" class="w-full h-3"
            :style="{
              backgroundColor: cardSurface(t),
              borderRadius: t.style.skinRadius === 'pill' ? '9999px' : t.style.skinRadius === 'squared' ? '2px' : '6px',
              border: `1px solid ${cardBorder(t)}`,
            }"></div>
        </div>
      </div>

      <!-- Locked: subtle wash so user can SEE the design through the lock chrome -->
      <div v-if="isLocked(t) && !isPreviewing(t)"
        class="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/0 via-black/5 to-black/35"></div>

      <!-- Selected checkmark (free themes only) -->
      <div v-if="activeThemeId === t.id && !isLocked(t)"
        class="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#1a1c1b] flex items-center justify-center shadow-sm">
        <span class="mdi mdi-check text-white text-[12px]"></span>
      </div>

      <!-- PRO badge (premium themes — visible whether locked or unlocked) -->
      <div v-else-if="t.tier === 'premium'"
        class="absolute top-1.5 right-1.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-white text-[8px] font-black tracking-wider shadow-[0_2px_6px_rgba(0,0,0,0.25)]"
        style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);">
        <span class="mdi mdi-crown text-[9px]"></span> PRO
      </div>

      <!-- Small lock chip (locked premium, not currently previewing) -->
      <div v-if="isLocked(t) && !isPreviewing(t)"
        class="pointer-events-none absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-black/55 backdrop-blur-sm flex items-center justify-center shadow-sm">
        <span class="mdi mdi-lock text-white text-[11px]"></span>
      </div>

      <!-- "Previsualizando" pill (locked premium AND it is the active style) -->
      <div v-if="isPreviewing(t)"
        class="pointer-events-none absolute top-1.5 left-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-sky-500 text-white text-[8px] font-black tracking-wider shadow-[0_2px_6px_rgba(14,165,233,0.5)]">
        <span class="mdi mdi-eye-outline text-[10px]"></span> Preview
      </div>

      <!-- Bottom area: Desbloquear pill on locked, label chip on free -->
      <div class="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-center">
        <button v-if="isLocked(t)"
          type="button"
          @click="onClickUnlock($event, t)"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-[9px] font-black tracking-wider shadow-[0_4px_10px_-2px_rgba(14,165,233,0.55)] active:scale-[0.95] transition-all hover:brightness-110"
          style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);">
          <span class="mdi mdi-lock-open-variant-outline text-[11px]"></span>
          Desbloquear
        </button>
        <span v-else class="text-[9px] font-bold px-1.5 py-0.5 rounded-full backdrop-blur-sm"
          :style="{
            backgroundColor: t.thumb.textColor + '22',
            color: t.thumb.textColor,
          }">{{ t.label }}</span>
      </div>
    </button>
  </div>
</template>
