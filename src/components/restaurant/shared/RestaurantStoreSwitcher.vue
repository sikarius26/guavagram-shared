<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useCurrentStore } from '~/composables/useCurrentStore'

const {
  stores, currentStore, currentGroup, activeGroup, activeGroupStores,
  isGroupView, isLoading, switchStore, switchToGroup,
  searchStores, searchResults, isSearching,
} = useCurrentStore()

// "Está cargando" para el chip principal: si la cookie aún no rehidrató (o
// trae un objeto a medio rellenar sin displayName) y `load()` sigue en curso,
// mostramos un skeleton en vez del placeholder "Tu restaurante" — éste sugería
// que el usuario no tenía tienda seleccionada cuando en realidad solo estaba
// esperando a que volviera la lista de /platform.
const isHydrating = computed(() =>
  isLoading.value && !isGroupView.value && !(currentStore.value?.displayName || '').trim(),
)

const switcherOpen = ref(false)
const switcherRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)
const searchQuery = ref('')

const toggle = () => {
  switcherOpen.value = !switcherOpen.value
  if (switcherOpen.value) {
    // Auto-focus search and prime results with whatever's prefetched.
    nextTick(() => searchInputRef.value?.focus())
    if (!searchResults.value.length) searchStores('')
  }
}
const pickStore = (storeId: string) => {
  switchStore(storeId)
  switcherOpen.value = false
  searchQuery.value = ''
}
const pickGroup = (groupId: string) => { switchToGroup(groupId); switcherOpen.value = false }

// Debounced live search against the backend autocomplete. 250 ms is enough
// to skip every keystroke while still feeling responsive.
let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(searchQuery, (q) => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => searchStores(q), 250)
})

// Display list: backend search results if we've ever searched, else the
// prefetched stores list. Keeps the dropdown populated on first open.
const visibleStores = computed(() => {
  if (searchQuery.value.trim()) return searchResults.value
  return searchResults.value.length ? searchResults.value : stores.value
})

const handleOutside = (e: MouseEvent) => {
  if (!switcherRef.value) return
  if (!switcherRef.value.contains(e.target as Node)) switcherOpen.value = false
}

onMounted(() => {
  if (typeof window !== 'undefined') window.addEventListener('click', handleOutside)
})
onBeforeUnmount(() => {
  if (typeof window !== 'undefined') window.removeEventListener('click', handleOutside)
})
</script>

<template>
  <div ref="switcherRef" class="relative w-full">
    <button
      type="button"
      @click="toggle"
      class="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg bg-[#f7f7f7] hover:bg-[#f0f0f0] transition-all group"
    >
      <div
        class="h-7 w-7 rounded-md overflow-hidden flex items-center justify-center shrink-0 shadow-sm"
        :class="isGroupView ? 'bg-gradient-to-br from-primary to-[#ff6b4a]' : 'bg-white'"
      >
        <span v-if="isGroupView" class="mdi mdi-source-branch text-white text-sm"></span>
        <img v-else-if="currentStore?.logoUrl" :src="currentStore.logoUrl" class="h-full w-full object-cover" alt="" />
        <span v-else class="mdi mdi-storefront-outline text-[#666] text-sm"></span>
      </div>
      <div class="flex-1 min-w-0 text-left">
        <p v-if="isHydrating" class="h-3 w-24 rounded bg-[#e5e5e5] animate-pulse"></p>
        <p v-else class="text-[12px] font-semibold text-[#1a1c1b] truncate">
          {{ isGroupView ? (activeGroup?.name || 'Grupo') : ((currentStore?.displayName || '').trim() || $t('yourStore')) }}
        </p>
        <p v-if="isGroupView" class="text-[9px] text-[#888] truncate">
          Vista de grupo · {{ activeGroupStores.length }} locales
        </p>
      </div>
      <span class="mdi mdi-chevron-down text-[#666] text-sm"></span>
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="switcherOpen"
        class="absolute left-0 right-0 mt-1 max-h-80 flex flex-col rounded-xl bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.04] z-30 p-1.5"
      >
        <!-- In-dropdown search. Live-queries Platform's autocomplete so admin
             users with hundreds of stores can find any of them. -->
        <div class="px-1.5 pt-1 pb-2 shrink-0">
          <div class="relative">
            <span class="mdi mdi-magnify absolute left-2.5 top-1/2 -translate-y-1/2 text-[#999] text-sm"></span>
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              placeholder="Buscar tienda…"
              class="w-full pl-8 pr-3 py-1.5 text-[11px] bg-[#f7f7f7] border border-transparent rounded-lg focus:outline-none focus:border-[#ddd] placeholder:text-[#aaa]"
              @click.stop
            />
          </div>
        </div>

        <div class="flex-1 overflow-y-auto">
        <template v-if="currentGroup">
          <p class="px-2.5 pt-1 pb-1.5 text-[9px] font-bold text-[#aaa] uppercase tracking-[0.15em]">Grupo</p>
          <button
            type="button"
            @click="pickGroup(currentGroup.groupId)"
            class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors hover:bg-[#f7f7f7]"
            :class="isGroupView ? 'bg-[#f0fdf4]' : ''"
          >
            <div class="h-6 w-6 rounded-md bg-gradient-to-br from-primary to-[#ff6b4a] flex items-center justify-center shrink-0">
              <span class="mdi mdi-source-branch text-white text-[10px]"></span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[11px] font-bold text-[#1a1c1b] truncate">{{ currentGroup.name }}</p>
              <p class="text-[9px] text-[#888]">{{ currentGroup.storeIds.length }} locales</p>
            </div>
            <span v-if="isGroupView" class="mdi mdi-check text-primary text-xs"></span>
          </button>
          <p class="px-2.5 pt-2 pb-1.5 text-[9px] font-bold text-[#aaa] uppercase tracking-[0.15em]">Locales</p>
        </template>

        <button
          v-for="s in visibleStores"
          :key="s.storeId"
          type="button"
          @click="pickStore(s.storeId)"
          class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors hover:bg-[#f7f7f7]"
          :class="!isGroupView && s.storeId === currentStore?.storeId ? 'bg-[#f5f5f5]' : ''"
        >
          <div class="h-6 w-6 rounded-md bg-[#f5f5f5] overflow-hidden flex items-center justify-center shrink-0">
            <img v-if="s.logoUrl" :src="s.logoUrl" class="h-full w-full object-cover" alt="" />
            <span v-else class="mdi mdi-storefront-outline text-[#666] text-[10px]"></span>
          </div>
          <p class="text-[11px] font-medium text-[#555] truncate flex-1">{{ s.displayName }}</p>
          <span
            v-if="!isGroupView && s.storeId === currentStore?.storeId"
            class="mdi mdi-check text-primary text-xs"
          ></span>
        </button>

        <!-- Empty / loading states for live search. -->
        <p v-if="isSearching" class="px-2.5 py-2 text-[10px] text-[#999]">Buscando…</p>
        <p v-else-if="searchQuery.trim() && !visibleStores.length" class="px-2.5 py-2 text-[10px] text-[#999]">
          Sin resultados para "{{ searchQuery }}"
        </p>

        <div class="mt-1 pt-1 border-t border-[#eee]">
          <button
            type="button"
            class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors hover:bg-[#f7f7f7]"
          >
            <span class="mdi mdi-plus-circle-outline text-[#666] text-base"></span>
            <p class="text-[11px] font-semibold text-[#555]">Añadir local</p>
          </button>
        </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
