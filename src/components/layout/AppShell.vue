<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import AppTopBar from './AppTopBar.vue'
import SidebarDrawerOverlay from './SidebarDrawerOverlay.vue'

withDefaults(defineProps<{
  title?: string
  showMobileLogo?: boolean
  backgroundStyle?: string
  noSidebar?: boolean
  hasRail?: boolean
  hasBottomTabs?: boolean
  topBarVariant?: 'light' | 'dark'
}>(), {
  title: '',
  showMobileLogo: false,
  backgroundStyle: '',
  noSidebar: false,
  hasRail: false,
  hasBottomTabs: false,
  topBarVariant: 'light',
})

// Hide the native browser scrollbar globally while this shell is mounted (kept functional, just invisible)
onMounted(() => {
  if (typeof document !== 'undefined') document.documentElement.classList.add('app-no-scrollbar')
})
onBeforeUnmount(() => {
  if (typeof document !== 'undefined') document.documentElement.classList.remove('app-no-scrollbar')
})
</script>

<template>
  <div
    class="min-h-[100dvh] flex bg-[#f4f5f7]"
    :class="hasRail ? 'flex-col lg:flex-row' : ''"
    :style="backgroundStyle ? { background: backgroundStyle } : undefined"
  >
    <!-- Rail (consumer desktop) -->
    <template v-if="hasRail">
      <slot name="rail" />
    </template>

    <!-- Sidebar drawer (dashboards) -->
    <template v-if="!noSidebar && !hasRail">
      <slot name="sidebar" />
      <SidebarDrawerOverlay />
    </template>

    <!-- Main column -->
    <div
      class="flex-1 flex flex-col min-w-0"
      :class="[
        !noSidebar && !hasRail ? 'lg:ml-[250px]' : '',
        hasBottomTabs ? 'pb-20 lg:pb-0' : '',
      ]"
    >
      <!-- Mobile topbar (hidden on desktop unless alwaysVisible) -->
      <AppTopBar
        :title="title"
        :show-logo="showMobileLogo"
        :no-menu="noSidebar || hasRail || hasBottomTabs"
        :always-visible="noSidebar && !hasRail"
        :variant="topBarVariant"
      >
        <template v-if="$slots['topbar-left']" #left>
          <slot name="topbar-left" />
        </template>
        <template #right>
          <slot name="topbar-right" />
        </template>
      </AppTopBar>

      <!-- Optional desktop top bar -->
      <div v-if="$slots['desktop-topbar']" class="hidden lg:block">
        <slot name="desktop-topbar" />
      </div>

      <main class="flex-1 min-h-0 flex flex-col">
        <slot />
      </main>
    </div>

    <!-- Bottom tabs (mobile only) -->
    <slot v-if="hasBottomTabs" name="bottom-tabs" />
  </div>
</template>

<style>
/* Global (non-scoped) — hide browser scrollbar while AppShell is mounted.
   Scroll remains functional via wheel/keyboard, only the visual bar is hidden. */
html.app-no-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
html.app-no-scrollbar::-webkit-scrollbar { display: none; }
html.app-no-scrollbar body::-webkit-scrollbar { display: none; }
</style>
