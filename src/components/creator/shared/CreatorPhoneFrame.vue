<script setup lang="ts">
withDefaults(defineProps<{
  bgColor?: string
}>(), {
  bgColor: '#f9f9f7',
})
</script>

<template>
  <div
    class="w-full max-w-[390px] mx-auto relative rounded-[40px] border-[6px] border-[#1a1c1b] shadow-phone overflow-hidden flex flex-col"
    :style="{ backgroundColor: bgColor }"
  >
    <!-- Notch -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 z-40 w-[120px] h-[22px] bg-[#1a1c1b] rounded-b-2xl"></div>

    <!-- Content slot (scrollable like a real phone) -->
    <div class="relative z-10 flex-1 min-h-0 overflow-y-auto no-scrollbar" style="scrollbar-width: none; -ms-overflow-style: none;">
      <slot />
    </div>
  </div>
</template>
