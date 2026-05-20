<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppSidebarItem from './AppSidebarItem.vue'
import { useSidebarDrawer } from '~/composables/useSidebarDrawer'
import type { NavItem, NavSection } from '~/types/nav'

const { t, te } = useI18n()
// Resolve a label/title that may be either an i18n key or a literal string.
// If the key exists in the loaded locale messages, translate it; otherwise
// pass through (lets non-i18n nav configs keep working).
const resolveLabel = (s: string | undefined): string => {
  if (!s) return ''
  return te(s) ? t(s) : s
}

const props = withDefaults(defineProps<{
  sections: NavSection[]
  activeKey: string
  searchable?: boolean
  brandSrc?: string
  brandAlt?: string
  brandTo?: string
  accentColor?: string
  filterFn?: (item: NavItem) => boolean
}>(), {
  searchable: false,
  brandSrc: '/images/logo-guavagram-color.png',
  brandAlt: 'Guavagram',
  brandTo: '/',
  accentColor: '#ff2d23',
  filterFn: undefined,
})

const emit = defineEmits<{
  (e: 'select', key: string): void
  (e: 'lockedClick', item: NavItem): void
}>()

const { isOpen } = useSidebarDrawer()

const sectionsOpen = ref<Record<string, boolean>>(
  Object.fromEntries(props.sections.map(s => [s.key, s.defaultOpen ?? true]))
)
const toggleSection = (key: string) => {
  sectionsOpen.value[key] = !sectionsOpen.value[key]
}

const searchQuery = ref('')

const visibleSections = computed(() => {
  const filter = props.filterFn
  return props.sections.map(s => ({
    ...s,
    items: filter ? s.items.filter(filter) : s.items,
  })).filter(s => s.items.length > 0)
})

const flatItems = computed(() => visibleSections.value.flatMap(s => s.items))

const filteredItems = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return null
  return flatItems.value.filter(i => resolveLabel(i.label).toLowerCase().includes(q))
})

function onItemClick(item: NavItem) {
  if (item.lockReason) {
    emit('lockedClick', item)
    return
  }
  emit('select', item.key)
  searchQuery.value = ''
}
</script>

<template>
  <nav
    class="h-[100dvh] w-[280px] lg:w-[250px] fixed left-0 top-0 bg-white border-r border-[#ddd] flex flex-col z-50 transform transition-transform duration-300 ease-out lg:!translate-x-0 overflow-hidden"
    style="overscroll-behavior: contain;"
    :class="isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'"
    aria-label="Navegación principal"
    @wheel.stop
    @touchmove.stop
  >
    <!-- Brand -->
    <NuxtLink
      :to="brandTo"
      class="flex items-center h-[72px] px-5 border-b border-[#e0e0e0] shrink-0"
    >
      <NuxtImg :src="brandSrc" :alt="brandAlt" width="130" class="h-auto" />
    </NuxtLink>

    <!-- Header slot (profile card, store switcher...) -->
    <div v-if="$slots.header" class="px-3 pt-3 pb-2 shrink-0">
      <slot name="header" />
    </div>

    <!-- Search -->
    <div v-if="searchable" class="px-3 mb-2 shrink-0">
      <div class="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-[#f7f7f7] border border-[#e0e0e0]">
        <span class="mdi mdi-magnify text-[#666] text-sm"></span>
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="$t('navSearchPlaceholder')"
          class="bg-transparent text-[11px] text-[#1a1c1b] placeholder-[#ccc] outline-none w-full"
        />
      </div>
    </div>

    <!-- Items: sizes to content. Nav has overflow-hidden so any excess is silently clipped. No scroll when items fit. -->
    <div class="shrink-0">
      <!-- Filtered search results -->
      <div v-if="filteredItems" class="px-3 mb-2">
        <AppSidebarItem
          v-for="item in filteredItems"
          :key="item.key"
          :icon="item.icon"
          :active-icon="item.activeIcon"
          :label="resolveLabel(item.label)"
          :active="activeKey === item.key"
          :badge="item.badge"
          :dot="item.dot"
          :to="item.to"
          :target="item.target"
          :lock-reason="item.lockReason"
          :accent-color="accentColor"
          @click="onItemClick(item)"
        />
      </div>

      <!-- Sections -->
      <template v-else>
        <div
          v-for="section in visibleSections"
          :key="section.key"
          class="mb-2"
        >
          <div v-if="section.title" class="px-3 mb-1">
            <button
              v-if="section.collapsible !== false"
              type="button"
              @click="toggleSection(section.key)"
              class="flex items-center gap-1.5 w-full px-2.5 py-1.5 text-left"
            >
              <span
                class="mdi text-[10px] text-[#666] transition-transform"
                :class="sectionsOpen[section.key] ? 'mdi-chevron-down' : 'mdi-chevron-right'"
              ></span>
              <span class="text-[11px] font-bold text-[#777] uppercase tracking-[0.15em]">{{ resolveLabel(section.title) }}</span>
            </button>
            <div v-else class="px-2.5 py-1.5">
              <span class="text-[11px] font-bold text-[#777] uppercase tracking-[0.15em]">{{ resolveLabel(section.title) }}</span>
            </div>
          </div>
          <div v-if="sectionsOpen[section.key] !== false" class="flex flex-col px-3">
            <AppSidebarItem
              v-for="item in section.items"
              :key="item.key"
              :icon="item.icon"
              :active-icon="item.activeIcon"
              :label="resolveLabel(item.label)"
              :active="activeKey === item.key"
              :badge="item.badge"
              :dot="item.dot"
              :to="item.to"
              :target="item.target"
              :lock-reason="item.lockReason"
              :accent-color="accentColor"
              @click="onItemClick(item)"
            />
          </div>
        </div>
      </template>
    </div>

    <!-- Footer slot (boost CTA, persona switcher, logout…) — pinned to viewport bottom via mt-auto so the sidebar bg covers the full 100dvh without leaving a gap below -->
    <div v-if="$slots.footer" class="mt-auto px-3 pb-4 shrink-0">
      <slot name="footer" />
    </div>
  </nav>
</template>
