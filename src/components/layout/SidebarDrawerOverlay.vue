<script setup lang="ts">
import { useSidebarDrawer } from '~/composables/useSidebarDrawer'

const { isOpen, close } = useSidebarDrawer()
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="lg:hidden fixed inset-0 z-40 bg-black/50"
      @click="close"
      aria-hidden="true"
    ></div>
  </Transition>
</template>
