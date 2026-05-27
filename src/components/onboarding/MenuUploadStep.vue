<script setup lang="ts">
import { ref, computed } from 'vue'
import StepShell from './StepShell.vue'
import type { OnboardingV2Flow } from '~/composables/useOnboardingV2'

const props = defineProps<{ flow: OnboardingV2Flow }>()

const fileName = ref(props.flow.pendingMenuFile.value?.name || '')
const fileSize = ref(props.flow.pendingMenuFile.value?.size || 0)

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

const onFileSelected = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  props.flow.setMenuFile(file)
  fileName.value = file.name
  fileSize.value = file.size
}

const clear = () => {
  props.flow.setMenuFile(null)
  fileName.value = ''
  fileSize.value = 0
}

const skip = () => {
  clear()
  props.flow.next()
}

const onNext = async () => {
  // Best-effort upload — owners can retry from the dashboard if it fails.
  if (props.flow.pendingMenuFile.value) await props.flow.submitMenu()
  props.flow.next()
}

const hasFile = computed(() => !!props.flow.pendingMenuFile.value)
</script>

<template>
  <StepShell
    title="Sube tu carta"
    subtitle="Foto, PDF o Excel. La leeremos por ti tras el alta."
    :step="2" :total-steps="4" :can-go-back="true"
    :can-proceed="hasFile"
    :is-loading="flow.isLoading.value"
    next-label="Continuar"
    @back="flow.back()" @next="onNext">

    <template v-if="!hasFile">
      <div class="flex flex-col gap-2.5">
        <label class="flex items-center gap-3 p-5 rounded-xl border-2 border-gray-200 dark:border-white/10 hover:border-emerald-500 focus-within:border-emerald-500 focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.12)] hover:shadow-md transition-all cursor-pointer group">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
            <span class="mdi mdi-camera text-xl text-emerald-600"></span>
          </div>
          <div class="flex-1">
            <p class="font-semibold text-text-main text-sm">Hacer foto</p>
            <p class="text-xs text-text-secondary">Captura tu carta con la cámara</p>
          </div>
          <span class="mdi mdi-arrow-right text-gray-300 group-hover:text-emerald-600 transition-colors"></span>
          <input type="file" accept="image/*" capture="environment" class="hidden" @change="onFileSelected" />
        </label>

        <label class="flex items-center gap-3 p-5 rounded-xl border-2 border-gray-200 dark:border-white/10 hover:border-emerald-500 focus-within:border-emerald-500 focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.12)] hover:shadow-md transition-all cursor-pointer group">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">
            <span class="mdi mdi-upload text-xl text-gray-500"></span>
          </div>
          <div class="flex-1">
            <p class="font-semibold text-text-main text-sm">Subir archivo</p>
            <p class="text-xs text-text-secondary">.jpg, .png, .pdf, .xlsx</p>
          </div>
          <span class="mdi mdi-arrow-right text-gray-300 group-hover:text-emerald-600 transition-colors"></span>
          <input type="file" accept="image/*,.pdf,.xlsx,.csv" class="hidden" @change="onFileSelected" />
        </label>
      </div>
      <button type="button" @click="skip" class="text-xs text-text-secondary hover:text-text-main self-center">
        La subo más tarde desde el dashboard
      </button>
    </template>

    <template v-else>
      <div class="flex items-center gap-3 p-4 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10">
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30">
          <span class="mdi mdi-file-check-outline text-xl text-emerald-600"></span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-text-main text-sm truncate">{{ fileName }}</p>
          <p class="text-xs text-text-secondary">{{ formatSize(fileSize) }} · lista para procesar</p>
        </div>
        <button type="button" @click="clear" aria-label="Quitar archivo"
          class="h-9 w-9 shrink-0 rounded-full hover:bg-white/60 dark:hover:bg-white/10 flex items-center justify-center text-gray-500">
          <span class="mdi mdi-close text-lg"></span>
        </button>
      </div>
    </template>
  </StepShell>
</template>
