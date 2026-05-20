<script setup lang="ts">
import { computed, reactive } from 'vue'
import {
  TEXTURES,
  TexturePreview,
  SkinThumbnail,
  getTypographyFamily,
  getRadiusValue,
  type SkinId,
  type SkinTypography,
  type SkinRadius,
  type PageBackgroundMode,
} from '@guava/guavagram-renderer'
import { useCreatorBioStyle } from '~/composables/useCreatorBioStyle'
import CreatorThemePresets from './CreatorThemePresets.vue'
import { type CreatorBioTheme } from '~/composables/useCreatorBioThemes'

const router = useRouter()
const { style, update, reset } = useCreatorBioStyle()

// Creator Pro flag — bio customization is a Pro-only feature.
// Preview is always available; activation in the public bio requires Pro.
const isPro = false

const applyTheme = (theme: CreatorBioTheme) => {
  ;(Object.keys(theme.style) as Array<keyof typeof theme.style>).forEach(key => {
    update(key as any, (theme.style as any)[key])
  })
}

const goToPricing = () => router.push('/pricing')

type Section = 'themes' | 'layout' | 'texture' | 'colors'
const open = reactive<Record<Section, boolean>>({ themes: true, layout: false, texture: false, colors: false })
const toggle = (s: Section) => { open[s] = !open[s] }

const skinList: Array<{ id: SkinId; label: string }> = [
  { id: 'classic', label: 'Clásico' },
  { id: 'portada', label: 'Portada' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'showcase', label: 'Showcase' },
]
const typographyOptions: Array<{ id: SkinTypography; label: string }> = [
  { id: 'sans', label: 'Sans' },
  { id: 'serif', label: 'Serif' },
  { id: 'rounded', label: 'Round' },
  { id: 'mono', label: 'Mono' },
]
const radiusOptions: Array<{ id: SkinRadius; label: string }> = [
  { id: 'squared', label: 'Cuadr' },
  { id: 'rounded', label: 'Redon' },
  { id: 'pill', label: 'Píld' },
]

const presetAccents = ['#ff2d23', '#1a1c1b', '#0a3d62', '#3c6255', '#6c3483', '#c0392b', '#d4a373', '#ffffff']
const presetBgs = ['#ffffff', '#fafafa', '#faf5f0', '#f0f4f8', '#fdf2f2', '#f5f0ff', '#1a1c1b']
const presetTextColors = ['#1a1c1b', '#ffffff', '#6b7280', '#422006', '#1e3a8a', '#6c3483']
const tintPresets = ['#ff6b4a', '#ff2d23', '#1A3C34', '#0a3d62', '#6c3483', '#d4a373', '#1a1c1b', '#f9f9f7']

const setSkin = (id: SkinId) => update('skinId', id)
const setTypography = (id: SkinTypography) => update('skinTypography', id)
const setRadius = (id: SkinRadius) => update('skinRadius', id)
const setBgMode = (m: PageBackgroundMode) => update('pageBgMode', m)
const setTexture = (id: string) => update('pageTextureId', id)

const accentColor = computed({ get: () => style.value.accentColor, set: (v: string) => update('accentColor', v) })
const bgColor = computed({ get: () => style.value.bgColor, set: (v: string) => update('bgColor', v) })
const textColor = computed({ get: () => style.value.textColor, set: (v: string) => update('textColor', v) })
const pageTextureTint = computed({ get: () => style.value.pageTextureTint, set: (v: string) => update('pageTextureTint', v) })
</script>

<template>
  <div class="flex flex-col gap-2">

    <!-- ===== Pro banner (persistente — toda la personalización es Pro) ===== -->
    <div v-if="!isPro"
      class="relative overflow-hidden rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-sky-50/40 p-3">
      <div class="flex items-start gap-2.5">
        <span class="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg text-white shadow-sm"
          style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);">
          <span class="mdi mdi-crown text-[15px]"></span>
        </span>
        <div class="min-w-0 flex-1">
          <p class="text-[11px] font-bold text-sky-900 leading-tight flex items-center gap-1.5">
            Personalización avanzada
            <span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-white text-[8px] font-black tracking-wider"
              style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);">PRO</span>
          </p>
          <p class="text-[10px] text-sky-800/80 leading-snug mt-0.5">
            Vista previa libre. Para activar estos cambios en tu bio pública necesitas Pro.
          </p>
          <button type="button" @click="goToPricing"
            class="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-white text-[10px] font-black tracking-wider shadow-[0_4px_10px_-2px_rgba(14,165,233,0.45)] active:scale-[0.97] transition-all hover:brightness-110"
            style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);">
            <span class="mdi mdi-lock-open-variant-outline text-[12px]"></span>
            Activar Pro
          </button>
        </div>
      </div>
    </div>

    <!-- ===== TEMAS (presets estilo Linktree) ===== -->
    <section class="rounded-xl border border-[#e5e5e5] bg-white overflow-hidden">
      <button type="button" @click="toggle('themes')"
        class="w-full flex items-center justify-between gap-2 px-3 h-9 hover:bg-[#fafafa] transition-colors">
        <span class="text-[10px] font-bold text-[#555] uppercase tracking-wider flex items-center gap-1.5">
          <span class="mdi mdi-palette-swatch text-[13px] text-[#888]"></span> Temas
        </span>
        <span class="mdi text-[12px] text-[#888] transition-transform"
          :class="open.themes ? 'mdi-chevron-up' : 'mdi-chevron-down'"></span>
      </button>
      <div v-if="open.themes" class="px-3 pb-3 pt-1 flex flex-col gap-2">
        <p class="text-[10px] text-[#888] leading-snug">
          Elige un tema para aplicar fondo, tipografía y colores de una vez. Puedes afinar los detalles luego.
        </p>
        <CreatorThemePresets
          :skin-id="style.skinId"
          :accent-color="style.accentColor"
          :bg-color="style.bgColor"
          :text-color="style.textColor"
          :skin-typography="style.skinTypography"
          :skin-radius="style.skinRadius"
          :is-pro="isPro"
          @apply="applyTheme"
          @reset="reset"
          @upgrade="goToPricing" />
      </div>
    </section>

    <!-- ===== COMPOSICIÓN + TIPO + BORDES ===== -->
    <section class="rounded-xl border border-[#e5e5e5] bg-white overflow-hidden">
      <button type="button" @click="toggle('layout')"
        class="w-full flex items-center justify-between gap-2 px-3 h-9 hover:bg-[#fafafa] transition-colors">
        <span class="text-[10px] font-bold text-[#555] uppercase tracking-wider flex items-center gap-1.5">
          <span class="mdi mdi-view-grid-outline text-[13px] text-[#888]"></span> Composición
          <span v-if="!isPro" class="inline-flex items-center px-1.5 py-px rounded-full text-white text-[7px] font-black tracking-wider"
            style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);">PRO</span>
        </span>
        <span class="mdi text-[12px] text-[#888] transition-transform"
          :class="open.layout ? 'mdi-chevron-up' : 'mdi-chevron-down'"></span>
      </button>
      <div v-if="open.layout" class="px-3 pb-3 pt-1 flex flex-col gap-2.5">
        <!-- Skin thumbnails -->
        <div class="grid grid-cols-4 gap-2">
          <button v-for="s in skinList" :key="s.id" type="button" @click="setSkin(s.id)"
            class="flex flex-col items-center gap-1.5 group transition-transform active:scale-[0.97]">
            <SkinThumbnail :skin-id="s.id" :accent-color="style.accentColor" :selected="style.skinId === s.id" />
            <p class="text-[9px] leading-tight text-center transition-colors"
              :class="style.skinId === s.id ? 'text-[#1a1c1b] font-bold' : 'text-[#888]'">{{ s.label }}</p>
          </button>
        </div>

        <!-- Tipografía -->
        <div class="grid grid-cols-4 gap-1">
          <button v-for="t in typographyOptions" :key="t.id" type="button" @click="setTypography(t.id)"
            class="flex items-center justify-center gap-1 py-1.5 rounded-lg transition-all border"
            :class="style.skinTypography === t.id
              ? 'bg-[#1a1c1b] border-[#1a1c1b]'
              : 'bg-white border-[#e5e5e5] hover:border-[#bbb]'">
            <span class="text-[13px] font-bold leading-none"
              :class="style.skinTypography === t.id ? 'text-white' : 'text-[#1a1c1b]'"
              :style="{ fontFamily: getTypographyFamily(t.id) }">Aa</span>
            <span class="text-[9px] font-semibold leading-none"
              :class="style.skinTypography === t.id ? 'text-white/80' : 'text-[#888]'">{{ t.label }}</span>
          </button>
        </div>

        <!-- Bordes -->
        <div class="grid grid-cols-3 gap-1">
          <button v-for="r in radiusOptions" :key="r.id" type="button" @click="setRadius(r.id)"
            class="flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all border"
            :class="style.skinRadius === r.id
              ? 'bg-[#1a1c1b] border-[#1a1c1b]'
              : 'bg-white border-[#e5e5e5] hover:border-[#bbb]'">
            <div class="w-4 h-4 border-[1.5px] transition-colors"
              :style="{
                borderRadius: getRadiusValue(r.id),
                borderColor: style.skinRadius === r.id ? '#ffffff' : '#bbbbbb'
              }"></div>
            <span class="text-[9px] font-semibold leading-none"
              :class="style.skinRadius === r.id ? 'text-white/80' : 'text-[#888]'">{{ r.label }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- ===== FONDO (color/textura) ===== -->
    <section class="rounded-xl border border-[#e5e5e5] bg-white overflow-hidden">
      <button type="button" @click="toggle('texture')"
        class="w-full flex items-center justify-between gap-2 px-3 h-9 hover:bg-[#fafafa] transition-colors">
        <span class="text-[10px] font-bold text-[#555] uppercase tracking-wider flex items-center gap-1.5">
          <span class="mdi mdi-texture-box text-[13px] text-[#888]"></span> Fondo
          <span v-if="!isPro" class="inline-flex items-center px-1.5 py-px rounded-full text-white text-[7px] font-black tracking-wider"
            style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);">PRO</span>
        </span>
        <span class="mdi text-[12px] text-[#888] transition-transform"
          :class="open.texture ? 'mdi-chevron-up' : 'mdi-chevron-down'"></span>
      </button>
      <div v-if="open.texture" class="px-3 pb-3 pt-1 flex flex-col gap-2">
        <div class="flex gap-1 p-1 rounded-xl bg-[#f0f0f0]">
          <button type="button" @click="setBgMode('solid')"
            class="flex-1 h-7 rounded-lg text-[10px] font-semibold transition-all"
            :class="style.pageBgMode === 'solid' ? 'bg-white text-[#1a1c1b] shadow-sm' : 'text-[#888]'">Color</button>
          <button type="button" @click="setBgMode('texture')"
            class="flex-1 h-7 rounded-lg text-[10px] font-semibold transition-all"
            :class="style.pageBgMode === 'texture' ? 'bg-white text-[#1a1c1b] shadow-sm' : 'text-[#888]'">Textura</button>
        </div>

        <!-- Solid color -->
        <div v-if="style.pageBgMode === 'solid'" class="flex flex-col gap-1.5">
          <div class="flex items-center gap-2">
            <div class="relative shrink-0">
              <input v-model="bgColor" type="color" class="h-7 w-7 rounded-lg cursor-pointer opacity-0 absolute inset-0 z-10" />
              <div class="h-7 w-7 rounded-lg shadow-sm ring-1 ring-[#e5e5e5]" :style="{ backgroundColor: bgColor }"></div>
            </div>
            <input v-model="bgColor" type="text"
              class="flex-1 rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-2.5 h-7 text-[11px] font-mono outline-none focus:border-[#1a1c1b]" />
          </div>
          <div class="flex gap-1 flex-wrap">
            <button v-for="c in presetBgs" :key="c" type="button" @click="bgColor = c"
              class="w-5 h-5 rounded-md transition-all hover:scale-110 border"
              :class="bgColor === c ? 'ring-2 ring-offset-1 ring-[#1a1c1b]' : ''"
              :style="{ backgroundColor: c, borderColor: c === '#ffffff' ? '#e5e5e5' : 'transparent' }"></button>
          </div>
        </div>

        <!-- Texture -->
        <div v-else class="flex flex-col gap-2">
          <div class="grid grid-cols-4 gap-1.5">
            <button v-for="tx in TEXTURES" :key="tx.id" type="button" @click="setTexture(tx.id)"
              class="flex flex-col items-center gap-0.5">
              <TexturePreview :texture-id="tx.id" :tint="pageTextureTint" :selected="style.pageTextureId === tx.id" />
              <p class="text-[8px] leading-tight truncate w-full text-center"
                :class="style.pageTextureId === tx.id ? 'text-[#1a1c1b] font-bold' : 'text-[#888]'">{{ tx.label }}</p>
            </button>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[9px] font-bold text-[#888] uppercase tracking-wider">Tinte</span>
            <div class="flex gap-0.5 flex-wrap flex-1">
              <button v-for="c in tintPresets" :key="c" type="button" @click="pageTextureTint = c"
                class="w-4 h-4 rounded-[3px] transition-all hover:scale-125 border"
                :class="pageTextureTint === c ? 'ring-1 ring-offset-1 ring-[#1a1c1b]' : ''"
                :style="{ backgroundColor: c, borderColor: c === '#ffffff' || c === '#f9f9f7' ? '#e5e5e5' : 'transparent' }"></button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== COLORES (acento + texto) ===== -->
    <section class="rounded-xl border border-[#e5e5e5] bg-white overflow-hidden">
      <button type="button" @click="toggle('colors')"
        class="w-full flex items-center justify-between gap-2 px-3 h-9 hover:bg-[#fafafa] transition-colors">
        <span class="text-[10px] font-bold text-[#555] uppercase tracking-wider flex items-center gap-1.5">
          <span class="mdi mdi-palette-outline text-[13px] text-[#888]"></span> Colores
          <span v-if="!isPro" class="inline-flex items-center px-1.5 py-px rounded-full text-white text-[7px] font-black tracking-wider"
            style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);">PRO</span>
        </span>
        <div class="flex items-center gap-1">
          <span class="w-3.5 h-3.5 rounded-full ring-1 ring-black/10" :style="{ backgroundColor: accentColor }"></span>
          <span class="w-3.5 h-3.5 rounded-full ring-1 ring-black/10" :style="{ backgroundColor: textColor }"></span>
          <span class="mdi text-[12px] text-[#888] transition-transform ml-1"
            :class="open.colors ? 'mdi-chevron-up' : 'mdi-chevron-down'"></span>
        </div>
      </button>
      <div v-if="open.colors" class="px-3 pb-3 pt-1 flex flex-col gap-2.5">

        <!-- Acento -->
        <div class="flex flex-col gap-1">
          <span class="text-[9px] font-bold text-[#888] uppercase tracking-wider">Acento</span>
          <div class="flex items-center gap-2">
            <div class="relative shrink-0">
              <input v-model="accentColor" type="color" class="h-7 w-7 rounded-lg cursor-pointer opacity-0 absolute inset-0 z-10" />
              <div class="h-7 w-7 rounded-lg shadow-sm ring-1 ring-black/10" :style="{ backgroundColor: accentColor }"></div>
            </div>
            <div class="flex gap-0.5 flex-wrap flex-1">
              <button v-for="c in presetAccents" :key="c" type="button" @click="accentColor = c"
                class="w-5 h-5 rounded-md transition-all hover:scale-110 border"
                :class="accentColor === c ? 'ring-2 ring-offset-1 ring-[#1a1c1b]' : ''"
                :style="{ backgroundColor: c, borderColor: c === '#ffffff' ? '#e5e5e5' : 'transparent' }"></button>
            </div>
          </div>
        </div>

        <!-- Texto -->
        <div class="flex flex-col gap-1">
          <span class="text-[9px] font-bold text-[#888] uppercase tracking-wider">Texto</span>
          <div class="flex items-center gap-2">
            <div class="relative shrink-0">
              <input v-model="textColor" type="color" class="h-7 w-7 rounded-lg cursor-pointer opacity-0 absolute inset-0 z-10" />
              <div class="h-7 w-7 rounded-lg shadow-sm ring-1 ring-[#e5e5e5] flex items-center justify-center" :style="{ backgroundColor: textColor }">
                <span class="mdi mdi-format-color-text text-[11px]"
                  :style="{ color: textColor === '#ffffff' ? '#1a1c1b' : 'white' }"></span>
              </div>
            </div>
            <div class="flex gap-0.5 flex-wrap flex-1">
              <button v-for="c in presetTextColors" :key="c" type="button" @click="textColor = c"
                class="w-5 h-5 rounded-md transition-all hover:scale-110 border"
                :class="textColor === c ? 'ring-2 ring-offset-1 ring-[#1a1c1b]' : ''"
                :style="{ backgroundColor: c, borderColor: c === '#ffffff' ? '#e5e5e5' : 'transparent' }"></button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Reset -->
    <button type="button" @click="reset"
      class="w-full h-8 rounded-xl border border-[#e5e5e5] bg-white text-[10px] font-bold text-[#888] hover:text-[#1a1c1b] hover:border-[#1a1c1b] transition-colors flex items-center justify-center gap-1">
      <span class="mdi mdi-restore text-[12px]"></span>
      Restablecer
    </button>
  </div>
</template>

<style scoped>
.scrollbar-none::-webkit-scrollbar { display: none; }
</style>
