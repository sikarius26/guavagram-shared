<script setup lang="ts">
import { ref, computed } from 'vue'
import StepShell from './StepShell.vue'
import type { OnboardingV2Flow } from '~/composables/useOnboardingV2'

const props = defineProps<{ flow: OnboardingV2Flow }>()
const emit = defineEmits<{ finished: [] }>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const error = ref('')

const MAX_BYTES = 5 * 1024 * 1024 // 5 MB per photo

const photos = computed(() => props.flow.galleryPhotos.value)
const remaining = computed(() => props.flow.GALLERY_MAX - photos.value.length)
const canProceed = computed(() => true)              // gallery is optional — always proceedable

const validate = (file: File): string | null => {
  if (!file.type.startsWith('image/')) return 'Solo se permiten imágenes (JPG, PNG, WebP).'
  if (file.size > MAX_BYTES) return 'La foto es demasiado grande (máx. 5 MB).'
  return null
}

const onFiles = async (files: FileList | File[]) => {
  error.value = ''
  const arr = Array.from(files)
  for (const f of arr) {
    if (props.flow.galleryFull.value) { error.value = 'Has alcanzado el máximo de fotos.'; break }
    const err = validate(f)
    if (err) { error.value = err; continue }
    const ok = await props.flow.addGalleryPhoto(f)
    if (!ok) error.value = 'No se pudo subir alguna foto.'
  }
}

const onPickClick = () => fileInput.value?.click()
const onPicked = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files?.length) onFiles(target.files)
  target.value = ''
}
const onDrop = (e: DragEvent) => {
  isDragging.value = false
  if (e.dataTransfer?.files?.length) onFiles(e.dataTransfer.files)
}

const onSkip = () => emit('finished')
const onFinish = () => emit('finished')
</script>

<template>
  <StepShell
    title="Sube fotos a tu galería"
    subtitle="Hasta 8 fotos. Aparecerán en la portada de tu perfil. (Opcional — puedes saltar y añadirlas después.)"
    :step="4"
    :total-steps="4"
    :can-go-back="!flow.isLoading.value"
    :can-proceed="canProceed"
    :is-loading="flow.isLoading.value"
    next-label="Finalizar alta"
    @back="flow.back()"
    @next="onFinish">

    <!-- Drop zone -->
    <div v-if="!flow.galleryFull.value"
      @click="onPickClick"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
      class="rounded-xl border-2 border-dashed cursor-pointer p-6 flex flex-col items-center justify-center gap-2 transition-all"
      :class="isDragging
        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10'
        : 'border-gray-300 dark:border-white/15 hover:border-emerald-400 bg-gray-50 dark:bg-white/5'">
      <span class="mdi mdi-image-plus text-4xl text-emerald-600"></span>
      <p class="text-sm font-semibold text-text-main">Arrastra fotos aquí o haz click</p>
      <p class="text-[11px] text-text-secondary">JPG / PNG · máx. 5 MB · {{ remaining }} {{ remaining === 1 ? 'restante' : 'restantes' }}</p>
      <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="onPicked" />
    </div>
    <div v-else class="rounded-xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-700/30 p-3 flex items-center gap-2 justify-center">
      <span class="mdi mdi-check-circle text-emerald-600 text-lg"></span>
      <p class="text-[12px] font-semibold text-emerald-700 dark:text-emerald-400">
        Galería completa — has subido las {{ flow.GALLERY_MAX }} fotos máximas.
      </p>
    </div>

    <!-- Grid of uploaded photos -->
    <div v-if="photos.length" class="grid grid-cols-3 sm:grid-cols-4 gap-2">
      <div v-for="p in photos" :key="p.id"
        class="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-white/5 group">
        <img v-if="p.mediaUrl" :src="p.mediaUrl" :alt="p.name || ''"
          class="w-full h-full object-cover" />
        <button v-if="p.id" type="button" @click="flow.removeGalleryPhoto(p.id)"
          aria-label="Eliminar foto"
          class="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100">
          <span class="mdi mdi-close text-base"></span>
        </button>
      </div>
    </div>

    <p v-if="error" class="text-xs text-red-500 text-center">{{ error }}</p>

    <!-- Explicit skip option (in addition to "Finalizar alta" with empty gallery) -->
    <button v-if="photos.length === 0" type="button" @click="onSkip"
      class="text-xs text-text-secondary hover:text-gray-900 underline self-center">
      Saltar este paso — añadiré fotos más tarde
    </button>
  </StepShell>
</template>
