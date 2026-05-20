<script setup lang="ts">
import { useCreateActionSheet } from '~/composables/useCreateActionSheet'

const { isOpen, close } = useCreateActionSheet()
const router = useRouter()

type Action = {
  key: 'storie' | 'review' | 'recomendado'
  title: string
  subtitle: string
  icon: string
  to: string
  gradient: string
  shadow: string
}

const actions: Action[] = [
  {
    key: 'storie',
    title: 'Crear storie',
    subtitle: 'Foto o vídeo vinculado a un restaurante',
    icon: 'mdi-camera-plus-outline',
    to: '/u/create/storie',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    shadow: '0 8px 24px -8px rgba(16,185,129,0.45)',
  },
  {
    key: 'review',
    title: 'Escribir reseña',
    subtitle: 'Verifica tu visita y suma Guava Points',
    icon: 'mdi-star-plus-outline',
    to: '/u/create/review',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    shadow: '0 8px 24px -8px rgba(245,158,11,0.45)',
  },
  {
    key: 'recomendado',
    title: 'Añadir recomendado',
    subtitle: 'Marca un sitio para volver o compartir',
    icon: 'mdi-bookmark-plus-outline',
    to: '/u/create/recomendado',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    shadow: '0 8px 24px -8px rgba(59,130,246,0.45)',
  },
]

function pick(action: Action) {
  close()
  router.push(action.to)
}
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition name="sheet-fade">
        <div
          v-if="isOpen"
          class="fixed inset-0 z-[9999] flex items-end justify-center lg:items-center"
          @click.self="close">
          <div
            class="absolute inset-0 bg-black/50"
            @click="close"></div>
          <div class="relative w-full max-w-lg bg-white dark:bg-[#1a1a1a] rounded-t-3xl lg:rounded-3xl shadow-2xl max-h-[85vh] lg:max-h-[75vh] flex flex-col lg:mx-4">
            <div class="flex items-center justify-between px-6 pt-5 pb-3 border-b border-black/5 dark:border-white/10">
              <h3 class="text-lg font-extrabold text-gray-900 dark:text-white">Crear</h3>
              <button type="button" @click="close"
                class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="Cerrar">
                <span class="mdi mdi-close text-xl text-gray-900 dark:text-white"></span>
              </button>
            </div>
            <div class="overflow-y-auto px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] flex flex-col gap-2">
              <button
                v-for="action in actions"
                :key="action.key"
                type="button"
                @click="pick(action)"
                class="group flex items-center gap-4 p-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-left transition-all active:scale-[0.98] hover:-translate-y-0.5">
                <span
                  class="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0"
                  :style="`background: ${action.gradient}; box-shadow: ${action.shadow};`">
                  <span class="mdi text-2xl" :class="action.icon"></span>
                </span>
                <span class="flex-1 min-w-0">
                  <span class="block text-[15px] font-bold text-gray-900 dark:text-white truncate">{{ action.title }}</span>
                  <span class="block text-[12px] text-gray-500 dark:text-white/60 mt-0.5">{{ action.subtitle }}</span>
                </span>
                <span class="mdi mdi-chevron-right text-xl text-gray-400 dark:text-white/40 group-hover:translate-x-0.5 transition-transform shrink-0"></span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>

<style scoped>
.sheet-fade-enter-active, .sheet-fade-leave-active {
  transition: opacity 200ms ease;
}
.sheet-fade-enter-active > div:last-child,
.sheet-fade-leave-active > div:last-child {
  transition: transform 250ms cubic-bezier(0.22, 1, 0.36, 1);
}
.sheet-fade-enter-from, .sheet-fade-leave-to { opacity: 0; }
.sheet-fade-enter-from > div:last-child,
.sheet-fade-leave-to > div:last-child { transform: translateY(100%); }
</style>
