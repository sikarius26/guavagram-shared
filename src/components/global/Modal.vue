<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" :class="[
        'fixed inset-0 z-50 flex justify-center',
        fullscreen ? 'p-0 items-stretch' : 'p-4',
        !fullscreen && mobilePosition === 'bottom' ? 'items-end sm:items-center' : '',
        !fullscreen && mobilePosition !== 'bottom' ? 'items-center' : ''
      ]" @click.self="close">
        <!-- Backdrop -->
        <div class="modal-backdrop absolute inset-0 bg-black/55" @click="close"></div>

        <!-- Modal -->
        <div :class="[
          'modal-content relative bg-white dark:bg-[#1a1a1a] shadow-2xl w-full overflow-hidden z-10 flex flex-col font-[\'Urbanist\']',
          fullscreen ? 'h-full max-h-full rounded-none' : [
            noScroll ? '' : maxHeight,
            maxWidth,
            rounded === 'top' ? 'rounded-t-3xl sm:rounded-2xl' : 'rounded-2xl'
          ]
        ]" @click.stop>
          <!-- Header -->
          <div v-if="title || showCloseButton" class="relative flex items-center p-4 px-5 border-b border-gray-100 dark:border-white/20 shrink-0" :class="titleCentered ? 'justify-center' : 'justify-between'">
            <h2 v-if="title" class="text-xl font-bold text-[#1E2021] dark:text-white" :class="titleCentered ? '' : 'pr-8'">
              {{ title }}
            </h2>
            <div v-else></div>
            <button v-if="showCloseButton" @click="close"
              class="h-6 w-6 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors shrink-0" :class="titleCentered ? 'absolute right-4' : ''">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.07842 6.00002L0 0.921597L0.921598 0L6.00001 5.07836L11.0784 0L12 0.921597L6.9216 6.00002L12 11.0783L11.0784 12L6.00001 6.92161L0.921598 12L0 11.0783L5.07842 6.00002Z" fill="#1E2021" fill-opacity="0.5"/>
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div :class="noScroll ? '' : 'flex-1 overflow-y-auto'">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="border-t border-gray-200 dark:border-white/20 bg-white dark:bg-[#1a1a1a] shrink-0">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  showCloseButton?: boolean
  maxWidth?: string
  mobilePosition?: 'bottom' | 'center'
  rounded?: 'default' | 'top'
  titleCentered?: boolean
  noScroll?: boolean
  maxHeight?: string
  fullscreen?: boolean
}>(), {
  showCloseButton: true,
  maxWidth: 'max-w-md',
  mobilePosition: 'center',
  rounded: 'default',
  titleCentered: false,
  noScroll: false,
  maxHeight: 'max-h-[90vh] xl:max-h-[80vh]',
  fullscreen: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const close = () => {
  emit('update:modelValue', false)
}
</script>

<style>
.modal-enter-active .modal-backdrop,
.modal-leave-active .modal-backdrop {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from .modal-backdrop,
.modal-leave-to .modal-backdrop {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95);
  opacity: 0;
}

.modal-enter-active .modal-content[class*="rounded-t-3xl"],
.modal-leave-active .modal-content[class*="rounded-t-3xl"] {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-leave-active .modal-content[class*="rounded-t-3xl"] {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from .modal-content[class*="rounded-t-3xl"],
.modal-leave-to .modal-content[class*="rounded-t-3xl"] {
  transform: translateY(100%);
  opacity: 0;
}

.modal-enter-to .modal-content[class*="rounded-t-3xl"],
.modal-leave-from .modal-content[class*="rounded-t-3xl"] {
  transform: translateY(0);
  opacity: 1;
}

@keyframes slideUpBounce {
  0% {
    transform: translateY(100%);
    opacity: 0;
  }
  60% {
    transform: translateY(-3%);
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-enter-active .modal-content[class*="rounded-t-3xl"] {
  animation: slideUpBounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@media (min-width: 640px) {
  .modal-enter-from .modal-content[class*="rounded-t-3xl"],
  .modal-leave-to .modal-content[class*="rounded-t-3xl"] {
    transform: translateY(100%) scale(0.95);
  }

  .modal-enter-active .modal-content[class*="rounded-t-3xl"] {
    animation: slideUpBounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}
</style>
