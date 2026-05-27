<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import CreatorPhoneFrame from '~/components/creator/shared/CreatorPhoneFrame.vue'

const { t } = useI18n()
import CreatorBioPreview, { type BioSection } from './CreatorBioPreview.vue'
import CreatorFeaturedStoreEditor from './CreatorFeaturedStoreEditor.vue'
import CreatorRecommendedEditor from './CreatorRecommendedEditor.vue'
import CreatorWishlistEditor from './CreatorWishlistEditor.vue'
import CreatorReviewsEditor from './CreatorReviewsEditor.vue'
import CreatorSocialLinksEditor from './CreatorSocialLinksEditor.vue'
import CreatorBioStyleEditor from './CreatorBioStyleEditor.vue'
import CreatorBioTagsEditor from './CreatorBioTagsEditor.vue'
import CreatorVerificationModal from './CreatorVerificationModal.vue'
import { useCreatorBio } from '~/composables/useCreatorBio'
import { useCurrentCreator } from '~/composables/useCurrentCreator'
import { useCreatorBioStyle, type CreatorBioVisibility } from '~/composables/useCreatorBioStyle'
import { useCreatorVerification } from '~/composables/useCreatorVerification'
import { useCityContext } from '~/composables/useCityContext'
import { notifier } from '~/services/notification'

const bio = useCreatorBio()
const { profile, load: loadCreator, save: saveCreator } = useCurrentCreator()
const { visibility, toggleVisibility } = useCreatorBioStyle()
const { currentCityName } = useCityContext()
const verification = useCreatorVerification()
const showVerifyModal = ref(false)

const selectedSection = ref<BioSection | null>(null)
const editorRef = ref<HTMLElement | null>(null)
const selectSection = (key: BioSection) => {
  selectedSection.value = selectedSection.value === key ? null : key
}
const clearSelection = () => { selectedSection.value = null }

// Map editor section keys → CreatorBioVisibility keys. Most are 1:1; the
// hero subsections (cover/avatar/identity/tags) match by name.
const visibilityKeyFor = (k: BioSection): keyof CreatorBioVisibility | null => {
  switch (k) {
    case 'cover': return 'cover'
    case 'avatar': return 'avatar'
    case 'identity': return 'identity'
    case 'tags': return 'tags'
    case 'featured': return 'featured'
    case 'recommended': return 'recommended'
    case 'reviews': return 'reviews'
    case 'wishlist': return 'wishlist'
    case 'engage': return 'engage'
    case 'social': return 'social'
    default: return null
  }
}
const currentVisibilityKey = computed(() =>
  selectedSection.value ? visibilityKeyFor(selectedSection.value) : null,
)
const currentVisible = computed(() => {
  const k = currentVisibilityKey.value
  return k ? visibility.value[k] !== false : true
})
const toggleCurrentVisibility = () => {
  const k = currentVisibilityKey.value
  if (k) toggleVisibility(k)
}

// Bloquea scroll del body mientras el editor sheet está abierto — solo en mobile.
// En desktop (lg ≥1080px) el editor es un panel docked y no necesita lock.
const isLgViewport = () =>
  typeof window !== 'undefined' && window.matchMedia('(min-width: 1080px)').matches
watch(selectedSection, (v) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = v && !isLgViewport() ? 'hidden' : ''
})

const profileImageInput = ref<HTMLInputElement | null>(null)
const coverImageInput = ref<HTMLInputElement | null>(null)
const coverDragOver = ref(false)

// Cover image edit modal (crop / zoom / rotate)
const showCoverEditor = ref(false)
const coverZoom = ref(100)
const coverRotation = ref(0)
const coverOffsetX = ref(50)
const coverOffsetY = ref(50)
const coverPreviewStyle = computed(() => ({
  transform: `rotate(${coverRotation.value}deg) scale(${coverZoom.value / 100})`,
  transformOrigin: `${coverOffsetX.value}% ${coverOffsetY.value}%`,
  objectPosition: `${coverOffsetX.value}% ${coverOffsetY.value}%`,
}))
const rotateCw = () => { coverRotation.value = (coverRotation.value + 90) % 360 }
const rotateCcw = () => { coverRotation.value = (coverRotation.value - 90 + 360) % 360 }
const resetCoverTransform = () => {
  coverZoom.value = 100; coverRotation.value = 0; coverOffsetX.value = 50; coverOffsetY.value = 50
}
const openCoverEditor = () => { if (coverImageUrl.value) showCoverEditor.value = true }

const mkField = <K extends string>(key: K) => computed<string>({
  get: () => (profile.value as any)?.[key] ?? '',
  set: (v) => {
    if (!profile.value) return
    profile.value = { ...(profile.value as any), [key]: v }
  },
})

const displayName = mkField('displayName')
const bioText = mkField('bio')
const city = mkField('city')
const profileImageUrl = mkField('profileImageUrl')
const coverImageUrl = mkField('coverImageUrl')
const handle = computed(() => (profile.value as any)?.handle ?? '')

const readAsDataUrl = (file: File) => new Promise<string>((res) => {
  const r = new FileReader()
  r.onload = () => res(r.result as string)
  r.readAsDataURL(file)
})

const onProfileImageChange = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  profileImageUrl.value = await readAsDataUrl(file)
}

const onCoverImageChange = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  coverImageUrl.value = await readAsDataUrl(file)
  resetCoverTransform()
  showCoverEditor.value = true
}

const onCoverDrop = async (e: DragEvent) => {
  coverDragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    notifier.notifyWarning(t('onlyImages'))
    return
  }
  coverImageUrl.value = await readAsDataUrl(file)
  resetCoverTransform()
  showCoverEditor.value = true
}

const isSaving = ref(false)
const handleSave = async () => {
  isSaving.value = true
  try {
    // Two saves in parallel:
    //  - bio.save(): featured/recommended/wishlist/reviews (uses creator API)
    //  - saveCreator(): profile basics + cover + brandingSettings JSON via
    //    /api/_mock/creator/[handle]/bio-config (file-backed mock-store
    //    bridge — survives the :3004→:3003 process boundary)
    await Promise.all([bio.save(), saveCreator()])
    notifier.notifySuccess(t('bioSaved'))
  } catch (e) {
    notifier.notifyError(t('couldNotSave'), e as Error)
  } finally {
    isSaving.value = false
  }
}

const sectionMeta: Record<BioSection, { title: string; desc: string; icon: string; bg: string; color: string }> = {
  cover: { title: 'Portada', desc: 'Imagen de cabecera de tu bio', icon: 'mdi-image-outline', bg: 'bg-[#ff2d23]/10', color: 'text-[#ff2d23]' },
  avatar: { title: 'Foto de perfil', desc: 'Tu avatar circular', icon: 'mdi-account-circle-outline', bg: 'bg-[#ff2d23]/10', color: 'text-[#ff2d23]' },
  identity: { title: 'Identidad', desc: 'Nombre, handle, bio y ciudad', icon: 'mdi-card-account-details-outline', bg: 'bg-[#ff2d23]/10', color: 'text-[#ff2d23]' },
  tags: { title: 'Etiquetas', desc: 'Tus intereses gastronómicos', icon: 'mdi-tag-multiple-outline', bg: 'bg-[#ff2d23]/10', color: 'text-[#ff2d23]' },
  style: { title: 'Estilo', desc: 'Colores, composición, tipografía, textura', icon: 'mdi-palette-swatch-outline', bg: 'bg-indigo-100', color: 'text-indigo-600' },
  featured: { title: 'Restaurante principal', desc: 'El que aparece mas grande', icon: 'mdi-star-outline', bg: 'bg-amber-100', color: 'text-amber-600' },
  recommended: { title: 'Recomendados', desc: 'Tu lista de favoritos', icon: 'mdi-playlist-star', bg: 'bg-blue-100', color: 'text-blue-600' },
  wishlist: { title: 'Lugares a los que me gustaría ir', desc: 'Tu lista de pendientes', icon: 'mdi-heart-outline', bg: 'bg-pink-100', color: 'text-pink-600' },
  reviews: { title: 'Reseñas', desc: 'Tus reseñas verificadas en vídeo o foto', icon: 'mdi-video-outline', bg: 'bg-purple-100', color: 'text-purple-600' },
  engage: { title: 'Recomendar y reseñas', desc: 'Banners de acción para tus visitantes', icon: 'mdi-gift-outline', bg: 'bg-rose-100', color: 'text-rose-600' },
  social: { title: 'Links sociales', desc: 'Instagram, TikTok, YouTube, Web, X', icon: 'mdi-link-variant', bg: 'bg-emerald-100', color: 'text-emerald-600' },
}

const defaultMeta = { title: 'Estilo general', desc: 'Colores, composición, tipografía, textura', icon: 'mdi-palette-swatch-outline', bg: 'bg-indigo-100', color: 'text-indigo-600' }
const currentMeta = computed(() => selectedSection.value ? sectionMeta[selectedSection.value] : defaultMeta)

onMounted(async () => {
  await Promise.all([
    loadCreator().catch(() => null),
    bio.load().catch((e: any) => notifier.notifyError(t('errorLoadingBio'), e as Error)),
  ])
})

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})
</script>

<template>
  <div class="flex flex-col lg:flex-row h-[calc(100dvh-56px)] overflow-hidden bg-gradient-to-br from-[#fff4ee] via-[#fefaf7] to-[#f0fdf4]">

    <!-- ============ CLICKABLE PHONE PREVIEW (mobile-first, centered on desktop) ============ -->
    <div class="flex-1 min-w-0 flex flex-col overflow-hidden w-full max-w-[440px] mx-auto lg:mx-0 lg:max-w-none lg:items-stretch">
      <!-- Header -->
      <div class="flex flex-col gap-2.5 px-5 py-4 border-b border-[#e5e5e5]/60 bg-white/60 backdrop-blur-sm">
        <div class="flex items-center justify-between gap-4">
          <div class="min-w-0">
            <h2 class="text-[20px] font-bold tracking-[-0.03em] text-[#1a1c1b] truncate">{{ $t('editPublicBio') }}</h2>
            <p class="text-[11px] text-[#666]">Toca cualquier sección para editarla.</p>
          </div>
          <button type="button" @click="handleSave" :disabled="isSaving || bio.isLoading.value"
            class="h-10 px-4 rounded-xl text-[12px] font-bold text-white active:scale-[0.98] transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
            style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow: 0 4px 12px rgba(16,185,129,0.25);">
            <span class="mdi" :class="isSaving ? 'mdi-loading animate-spin' : 'mdi-content-save-outline'"></span>
            Guardar
          </button>
        </div>

        <!-- Verification status row -->
        <div class="flex items-center">
          <!-- Fully verified -->
          <span v-if="verification.isFullyVerified.value"
            class="inline-flex items-center gap-1.5 h-7 pl-2 pr-3 rounded-full text-[11px] font-bold text-white"
            style="background: linear-gradient(135deg, #22c55e, #16a34a); box-shadow: 0 2px 8px rgba(34,197,94,0.25);">
            <span class="mdi mdi-check-decagram text-[14px]"></span>
            Cuenta verificada
          </span>

          <!-- Contact gate met, card not verified -->
          <button v-else-if="verification.isContactGateMet.value"
            type="button" @click="showVerifyModal = true"
            class="inline-flex items-center gap-1.5 h-7 pl-2 pr-3 rounded-full text-[11px] font-bold text-white hover:-translate-y-0.5 transition-transform"
            style="background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 2px 8px rgba(16,185,129,0.3);">
            <span class="mdi mdi-shield-check-outline text-[14px]"></span>
            Verifícate (gratis)
          </button>

          <!-- Contact gate not met yet -->
          <div v-else
            class="inline-flex items-center gap-2 h-7 pl-2 pr-3 rounded-full text-[11px] font-bold bg-[#f5f5f5] text-[#888]"
            :title="`Verificación: ${verification.contactsBrought.value}/${verification.threshold} contactos`">
            <span class="mdi mdi-lock-outline text-[14px] text-[#aaa]"></span>
            <span>Verificación</span>
            <span class="tabular-nums text-[#666]">{{ verification.contactsBrought.value }}/{{ verification.threshold }}</span>
          </div>
        </div>
      </div>

      <!-- Phone preview container -->
      <div class="flex-1 min-h-0 py-3 px-4 flex flex-col items-center gap-2">
        <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-[#888] text-center shrink-0">
          <span class="mdi mdi-cursor-default-click-outline text-base mr-1"></span>
          Toca para editar
        </p>
        <div class="w-full max-w-[390px] flex-1 min-h-0">
          <CreatorPhoneFrame class="h-full">
            <CreatorBioPreview
              interactive
              :selected="selectedSection"
              @select="selectSection" />
          </CreatorPhoneFrame>
        </div>
      </div>
    </div>

    <!-- ============ BACKDROP (mobile sheet only — hidden on desktop sidebar) ============ -->
    <div v-if="selectedSection" @click="clearSelection"
      class="fixed inset-0 z-40 bg-black/50 lg:hidden"></div>

    <!-- ============ CONTEXTUAL EDITOR (mobile: fullscreen sheet · desktop: docked right sidebar) ============ -->
    <aside ref="editorRef"
      class="shrink-0 flex-col bg-white border-[#e5e5e5]/60 scroll-mt-4"
      :class="selectedSection
        ? 'flex fixed inset-x-0 top-0 bottom-0 mx-auto z-50 w-full max-w-[440px] h-[100dvh] shadow-2xl lg:static lg:inset-auto lg:z-auto lg:mx-0 lg:max-w-none lg:w-[460px] lg:h-full lg:shadow-none lg:border-l'
        : 'hidden'">
      <!-- Editor header -->
      <div class="flex items-center gap-3 px-5 h-16 border-b border-[#f0f0f0] shrink-0">
        <button v-if="selectedSection" type="button" @click="clearSelection"
          class="w-9 h-9 rounded-lg hover:bg-[#f5f5f5] items-center justify-center shrink-0 flex lg:hidden"
          title="Volver">
          <span class="mdi mdi-arrow-left text-[#666]"></span>
        </button>
        <span class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" :class="currentMeta.bg">
          <span class="mdi text-lg" :class="[currentMeta.icon, currentMeta.color]"></span>
        </span>
        <div class="min-w-0 flex-1">
          <h3 class="text-[14px] font-bold text-[#1a1c1b] truncate">{{ currentMeta.title }}</h3>
          <p class="text-[11px] text-[#888] truncate">{{ currentMeta.desc }}</p>
        </div>
        <!-- Per-section show/hide toggle. Applies live to the preview and
             persists with the next Save (brandingSettings.visibility). -->
        <button v-if="currentVisibilityKey" type="button" @click="toggleCurrentVisibility"
          class="h-9 px-3 rounded-lg flex items-center gap-1.5 text-[11px] font-bold shrink-0 transition-colors"
          :class="currentVisible
            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            : 'bg-[#f5f5f5] text-[#888] hover:bg-[#ececec]'"
          :title="currentVisible ? 'Visible en tu bio pública' : 'Oculto en tu bio pública'">
          <span class="mdi text-[14px]" :class="currentVisible ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"></span>
          {{ currentVisible ? 'Visible' : 'Oculto' }}
        </button>
        <button v-if="selectedSection" type="button" @click="clearSelection"
          class="w-9 h-9 rounded-lg hover:bg-[#f5f5f5] flex items-center justify-center shrink-0"
          title="Cerrar">
          <span class="mdi mdi-close text-[#666]"></span>
        </button>
      </div>

      <!-- Editor body -->
      <div class="flex-1 min-h-0 overflow-y-auto px-5 py-5 scrollbar-none" style="scrollbar-width: none; -ms-overflow-style: none;">

        <!-- COVER -->
        <div v-if="selectedSection === 'cover'" class="space-y-4">
          <div class="flex flex-col gap-1.5">
            <div class="flex items-center justify-between">
              <label class="text-[11px] font-bold uppercase tracking-wider text-[#666]">Portada</label>
              <button v-if="coverImageUrl" type="button" @click="openCoverEditor"
                class="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                <span class="mdi mdi-crop text-[12px]"></span> Ajustar
              </button>
            </div>
            <div
              @dragover.prevent="coverDragOver = true"
              @dragleave.prevent="coverDragOver = false"
              @drop.prevent="onCoverDrop"
              class="relative w-full aspect-[3/1] rounded-2xl overflow-hidden border-2 border-dashed cursor-pointer transition-all group"
              :class="coverDragOver ? 'border-primary bg-primary/5' : 'border-[#ddd] bg-[#fafafa]'">
              <img v-if="coverImageUrl" :src="coverImageUrl" class="absolute inset-0 w-full h-full object-cover" :style="coverPreviewStyle" alt="" />
              <div v-else @click="coverImageInput?.click()" class="absolute inset-0 flex flex-col items-center justify-center gap-1">
                <span class="mdi mdi-image-plus-outline text-2xl text-[#bbb]"></span>
                <span class="text-[11px] font-semibold text-[#888]">Arrastra o click</span>
              </div>
              <div v-if="coverImageUrl" class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button type="button" @click.stop="openCoverEditor"
                  class="px-3 py-1.5 rounded-lg bg-white text-[#1a1c1b] text-[11px] font-bold flex items-center gap-1 hover:bg-white/90">
                  <span class="mdi mdi-crop"></span> Ajustar
                </button>
                <button type="button" @click.stop="coverImageInput?.click()"
                  class="px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm text-white text-[11px] font-bold border border-white/40 flex items-center gap-1 hover:bg-white/30">
                  <span class="mdi mdi-camera"></span> Cambiar
                </button>
              </div>
              <input ref="coverImageInput" type="file" accept="image/*" class="hidden" @change="onCoverImageChange" />
            </div>
          </div>
        </div>

        <!-- AVATAR -->
        <div v-else-if="selectedSection === 'avatar'" class="space-y-4">
          <div class="flex items-center gap-3">
            <button type="button" @click="profileImageInput?.click()"
              class="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-[#f5f5f5] shrink-0 relative group">
              <img v-if="profileImageUrl" :src="profileImageUrl" class="w-full h-full object-cover" alt="" />
              <div v-else class="w-full h-full flex items-center justify-center">
                <span class="mdi mdi-account text-3xl text-[#ccc]"></span>
              </div>
              <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <span class="mdi mdi-camera text-white opacity-0 group-hover:opacity-100 transition-opacity"></span>
              </div>
              <input ref="profileImageInput" type="file" accept="image/*" class="hidden" @change="onProfileImageChange" />
            </button>
            <div class="text-[11px] text-[#888]">
              <p class="font-bold text-[#1a1c1b]">Foto de perfil</p>
              <p>Click para cambiar</p>
            </div>
          </div>
        </div>

        <!-- IDENTITY (nombre / handle / bio / ciudad) -->
        <div v-else-if="selectedSection === 'identity'" class="space-y-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-[11px] font-bold uppercase tracking-wider text-[#666]">Nombre</label>
            <input v-model="displayName" type="text"
              class="rounded-xl border border-[#ddd] bg-[#fafafa] px-4 h-11 text-[14px] outline-none focus:border-primary" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-[11px] font-bold uppercase tracking-wider text-[#666]">Handle</label>
            <div class="rounded-xl border border-[#ddd] bg-[#f0f0f0] px-4 h-11 flex items-center text-[14px] text-[#888] font-semibold">
              @{{ handle }}
            </div>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-[11px] font-bold uppercase tracking-wider text-[#666]">Bio</label>
            <textarea v-model="bioText" rows="3"
              placeholder="Cuéntale al mundo tu pasión por la gastronomía..."
              class="rounded-xl border border-[#ddd] bg-[#fafafa] px-4 py-3 text-[14px] outline-none focus:border-primary resize-none"></textarea>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-[11px] font-bold uppercase tracking-wider text-[#666]">Ciudad</label>
            <input v-model="city" type="text" :placeholder="currentCityName"
              class="rounded-xl border border-[#ddd] bg-[#fafafa] px-4 h-11 text-[14px] outline-none focus:border-primary" />
          </div>
        </div>

        <!-- TAGS -->
        <div v-else-if="selectedSection === 'tags'" class="space-y-4">
          <CreatorBioTagsEditor />
        </div>

        <!-- STYLE -->
        <CreatorBioStyleEditor v-else-if="selectedSection === 'style'" />

        <!-- FEATURED -->
        <CreatorFeaturedStoreEditor v-else-if="selectedSection === 'featured'" />

        <!-- RECOMMENDED -->
        <CreatorRecommendedEditor v-else-if="selectedSection === 'recommended'" />

        <!-- WISHLIST -->
        <CreatorWishlistEditor v-else-if="selectedSection === 'wishlist'" />

        <!-- STORIES -->
        <CreatorReviewsEditor v-else-if="selectedSection === 'reviews'" />

        <!-- ENGAGE (banners) -->
        <div v-else-if="selectedSection === 'engage'" class="space-y-4">
          <div class="rounded-2xl border border-[#eee] bg-[#fafafa] p-4 text-[12px] text-[#666] leading-relaxed">
            <p class="font-bold text-[#1a1c1b] mb-1">
              <span class="mdi mdi-information-outline mr-1"></span>Banners de acción
            </p>
            Estos dos bloques aparecen en tu bio pública para invitar a tus visitantes a recomendar restaurantes y dejar reseñas verificadas. El color se adapta a tu paleta.
          </div>
          <button type="button" @click="clearSelection"
            class="w-full h-10 rounded-xl border border-[#e5e5e5] bg-white text-[12px] font-bold text-[#666] hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/40 transition-colors flex items-center justify-center gap-1.5">
            <span class="mdi mdi-palette-swatch-outline"></span>
            Cambiar color de acento
          </button>
        </div>

        <!-- SOCIAL -->
        <CreatorSocialLinksEditor v-else-if="selectedSection === 'social'" />

        <!-- DEFAULT: estilo general (sin elemento seleccionado) -->
        <div v-else class="space-y-4">
          <div class="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-white p-3 text-[11px] text-[#666] leading-relaxed flex items-start gap-2">
            <span class="mdi mdi-cursor-default-click-outline text-indigo-500 text-base shrink-0 mt-0.5"></span>
            <span>Estos ajustes afectan a toda tu bio. Haz click en cualquier elemento del preview para editarlo individualmente.</span>
          </div>
          <CreatorBioStyleEditor />
        </div>
      </div>
    </aside>

    <!-- ============ CREATOR VERIFICATION MODAL (card 0€) ============ -->
    <CreatorVerificationModal v-model="showVerifyModal" />

    <!-- ============ COVER EDITOR MODAL (crop / zoom / rotate) ============ -->
    <Teleport to="body">
      <div v-if="showCoverEditor" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60" @click="showCoverEditor = false"></div>
        <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-[560px] overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0]">
            <div class="flex items-center gap-2">
              <span class="mdi mdi-crop text-indigo-600 text-lg"></span>
              <h3 class="text-[15px] font-black text-[#1a1c1b]">Ajustar portada</h3>
            </div>
            <button type="button" @click="showCoverEditor = false"
              class="w-8 h-8 rounded-lg hover:bg-[#f5f5f5] flex items-center justify-center">
              <span class="mdi mdi-close text-[#666]"></span>
            </button>
          </div>

          <!-- Preview (2:1 crop window) -->
          <div class="p-5 bg-[#fafafa]">
            <div class="relative w-full aspect-[3/1] rounded-xl overflow-hidden bg-black/5 ring-1 ring-black/10">
              <img v-if="coverImageUrl" :src="coverImageUrl" class="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                :style="coverPreviewStyle" alt="" />
            </div>
            <p class="text-[10px] text-[#888] text-center mt-2">Vista previa del recorte 3:1</p>
          </div>

          <!-- Controls -->
          <div class="px-5 py-4 flex flex-col gap-3.5">
            <!-- Zoom -->
            <div class="flex items-center gap-3">
              <span class="mdi mdi-magnify-plus-outline text-[#666] text-[18px] w-5 text-center"></span>
              <div class="flex-1">
                <div class="flex items-center justify-between mb-0.5">
                  <span class="text-[10px] font-bold text-[#555] uppercase tracking-wider">Zoom</span>
                  <span class="text-[11px] font-bold text-[#1a1c1b] tabular-nums">{{ coverZoom }}%</span>
                </div>
                <input v-model.number="coverZoom" type="range" min="50" max="250" step="5"
                  class="w-full accent-indigo-600" />
              </div>
            </div>

            <!-- Position X -->
            <div class="flex items-center gap-3">
              <span class="mdi mdi-arrow-left-right text-[#666] text-[18px] w-5 text-center"></span>
              <div class="flex-1">
                <div class="flex items-center justify-between mb-0.5">
                  <span class="text-[10px] font-bold text-[#555] uppercase tracking-wider">Horizontal</span>
                  <span class="text-[11px] font-bold text-[#1a1c1b] tabular-nums">{{ coverOffsetX }}%</span>
                </div>
                <input v-model.number="coverOffsetX" type="range" min="0" max="100" step="1"
                  class="w-full accent-indigo-600" />
              </div>
            </div>

            <!-- Position Y -->
            <div class="flex items-center gap-3">
              <span class="mdi mdi-arrow-up-down text-[#666] text-[18px] w-5 text-center"></span>
              <div class="flex-1">
                <div class="flex items-center justify-between mb-0.5">
                  <span class="text-[10px] font-bold text-[#555] uppercase tracking-wider">Vertical</span>
                  <span class="text-[11px] font-bold text-[#1a1c1b] tabular-nums">{{ coverOffsetY }}%</span>
                </div>
                <input v-model.number="coverOffsetY" type="range" min="0" max="100" step="1"
                  class="w-full accent-indigo-600" />
              </div>
            </div>

            <!-- Rotation buttons -->
            <div class="flex items-center gap-3">
              <span class="mdi mdi-rotate-right text-[#666] text-[18px] w-5 text-center"></span>
              <div class="flex-1 flex items-center gap-2">
                <button type="button" @click="rotateCcw"
                  class="flex-1 h-9 rounded-lg border border-[#e5e5e5] bg-white hover:border-indigo-300 hover:bg-indigo-50/40 text-[11px] font-bold text-[#1a1c1b] flex items-center justify-center gap-1">
                  <span class="mdi mdi-rotate-left"></span> -90°
                </button>
                <div class="px-3 h-9 rounded-lg bg-[#fafafa] border border-[#e5e5e5] flex items-center text-[11px] font-bold text-[#1a1c1b] tabular-nums">
                  {{ coverRotation }}°
                </div>
                <button type="button" @click="rotateCw"
                  class="flex-1 h-9 rounded-lg border border-[#e5e5e5] bg-white hover:border-indigo-300 hover:bg-indigo-50/40 text-[11px] font-bold text-[#1a1c1b] flex items-center justify-center gap-1">
                  <span class="mdi mdi-rotate-right"></span> +90°
                </button>
              </div>
            </div>
          </div>

          <!-- Footer actions -->
          <div class="flex items-center gap-2 px-5 py-4 border-t border-[#f0f0f0] bg-[#fafafa]">
            <button type="button" @click="resetCoverTransform"
              class="h-10 px-3 rounded-xl border border-[#e5e5e5] bg-white text-[11px] font-bold text-[#666] hover:text-[#1a1c1b] hover:border-[#1a1c1b] transition-colors flex items-center gap-1.5">
              <span class="mdi mdi-restore"></span> Reset
            </button>
            <div class="flex-1"></div>
            <button type="button" @click="showCoverEditor = false"
              class="h-10 px-4 rounded-xl border border-[#e5e5e5] bg-white text-[12px] font-bold text-[#666] hover:bg-[#f5f5f5]">
              Cancelar
            </button>
            <button type="button" @click="showCoverEditor = false"
              class="h-10 px-5 rounded-xl bg-indigo-600 text-white text-[12px] font-bold hover:bg-indigo-700 shadow-[0_4px_14px_rgba(79,70,229,0.3)] transition-all flex items-center gap-1.5">
              <span class="mdi mdi-check"></span> Aplicar
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>
