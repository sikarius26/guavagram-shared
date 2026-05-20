<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Modal from '~/components/global/Modal.vue'
import { useCreatorBio } from '~/composables/useCreatorBio'
import { userApiClient } from '~/services/apis/api.client.user'
import type { UserStoreViewModel } from '~/services/apis/models/user-store-view-model'
import { useRestaurantFavoritesWallet, type FavoriteStore } from '~/composables/useRestaurantFavoritesWallet'
import { useCityContext } from '~/composables/useCityContext'
import { notifier } from '~/services/notification'

const { t } = useI18n()
const bio = useCreatorBio()
const { featuredStore, setFeaturedStore } = bio
const { currentCityName } = useCityContext()
const headlinePlaceholder = computed(() => `Mi rincon favorito de ${currentCityName.value}`)

const favorites = useRestaurantFavoritesWallet()

type PickerTab = 'mine' | 'favorites'
const pickerTab = ref<PickerTab>('mine')

const showStorePicker = ref(false)
const availableStores = ref<UserStoreViewModel[]>([])
const loadingStores = ref(false)

const loadStores = async () => {
  loadingStores.value = true
  try {
    availableStores.value = await userApiClient.userStoresGet()
  } catch (e) {
    notifier.notifyError(t('couldNotLoadRestaurants'), e as Error)
  } finally {
    loadingStores.value = false
  }
}

onMounted(() => {
  // Lazy-load on first open instead — keeps initial panel fast.
})

const openStorePicker = async () => {
  showStorePicker.value = true
  if (availableStores.value.length === 0) await loadStores()
}

const pickStore = (s: UserStoreViewModel) => {
  const current = featuredStore.value
  setFeaturedStore({
    userProfileStoreId: s.userProfileStoreId,
    storeId: s.storeId,
    slugName: s.slugName,
    name: s.name,
    logoUrl: s.logoUrl,
    coverUrl: (s as any).coverUrl,
    headline: current?.headline,
    personalNotes: current?.personalNotes,
    discountCode: current?.discountCode,
    discountPercent: current?.discountPercent,
    discountLabel: current?.discountLabel,
  } as any)
  showStorePicker.value = false
}

const pickFavorite = (f: FavoriteStore) => {
  const current = featuredStore.value
  setFeaturedStore({
    userProfileStoreId: undefined,
    storeId: f.storeId,
    slugName: f.storeSlug,
    name: f.storeName,
    logoUrl: f.storeLogoUrl,
    coverUrl: f.storeCoverUrl,
    city: f.storeCity,
    headline: current?.headline,
    personalNotes: current?.personalNotes,
    discountCode: current?.discountCode,
    discountPercent: current?.discountPercent,
    discountLabel: current?.discountLabel,
  } as any)
  showStorePicker.value = false
}

const updateField = (field: 'headline' | 'personalNotes', value: string) => {
  if (!featuredStore.value) return
  const fs: any = { ...featuredStore.value }
  fs[field] = value
  setFeaturedStore(fs)
}

const removeFeatured = () => {
  setFeaturedStore(null)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Empty state -->
    <div v-if="!featuredStore" class="rounded-2xl border-2 border-dashed border-[#ddd] bg-[#fafafa] p-8 text-center">
      <span class="mdi mdi-silverware-fork-knife text-4xl text-[#ccc]"></span>
      <p class="mt-2 text-[13px] font-semibold text-[#888]">Aun no has elegido tu restaurante principal</p>
      <button type="button" @click="openStorePicker"
        class="mt-4 inline-flex items-center gap-2 h-11 px-5 rounded-xl text-[13px] font-bold text-white bg-gradient-primary hover:bg-gradient-primary-hover shadow-pill-primary transition-all">
        <span class="mdi mdi-plus"></span> Elegir restaurante
      </button>
    </div>

    <template v-else>
      <!-- Store card -->
      <div class="rounded-2xl border border-[#e5e5e5] bg-white p-4 flex items-center gap-4 shadow-sm">
        <div v-if="featuredStore.logoUrl" class="w-14 h-14 rounded-xl bg-center bg-cover shrink-0 border border-[#eee]"
          :style="{ backgroundImage: `url('${featuredStore.logoUrl}')` }"></div>
        <div v-else class="w-14 h-14 rounded-xl bg-[#f5f5f5] flex items-center justify-center shrink-0">
          <span class="mdi mdi-silverware-fork-knife text-[#bbb] text-xl"></span>
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="font-extrabold text-[15px] text-[#1a1c1b] truncate">{{ featuredStore.name }}</h4>
          <p class="text-[12px] text-[#888]">{{ (featuredStore as any).city || featuredStore.slugName || '' }}</p>
        </div>
        <button type="button" @click="openStorePicker"
          class="h-9 px-3 rounded-lg text-[11px] font-bold text-[#666] border border-[#ddd] hover:bg-[#f5f5f5] transition-colors">
          <span class="mdi mdi-swap-horizontal text-xs mr-1"></span>
          Cambiar
        </button>
        <button type="button" @click="removeFeatured"
          class="w-9 h-9 rounded-lg text-[#999] hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors" title="Quitar">
          <span class="mdi mdi-delete-outline text-sm"></span>
        </button>
      </div>

      <!-- Headline -->
      <div class="flex flex-col gap-1.5">
        <label class="text-[11px] font-bold uppercase tracking-wider text-[#666]">Titular</label>
        <input :value="featuredStore.headline ?? ''" @input="updateField('headline', ($event.target as HTMLInputElement).value)"
          type="text" :placeholder="headlinePlaceholder"
          class="rounded-xl border border-[#ddd] bg-[#fafafa] px-4 h-11 text-[14px] outline-none focus:border-primary" />
      </div>

      <!-- Personal notes -->
      <div class="flex flex-col gap-1.5">
        <label class="text-[11px] font-bold uppercase tracking-wider text-[#666]">Notas personales</label>
        <textarea :value="featuredStore.personalNotes ?? ''"
          @input="updateField('personalNotes', ($event.target as HTMLTextAreaElement).value)"
          rows="3" placeholder="Por que lo recomiendas, favoritos del menu..."
          class="rounded-xl border border-[#ddd] bg-[#fafafa] px-4 py-3 text-[14px] outline-none focus:border-primary resize-none"></textarea>
      </div>

      <!-- Discount block — read-only: lo asigna el restaurante, no el creador -->
      <div class="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-4 space-y-3">
        <div>
          <p class="text-[13px] font-bold text-[#1a1c1b] flex items-center gap-1.5">
            <span class="mdi mdi-ticket-percent text-emerald-600"></span>
            Codigo de descuento
          </p>
          <p class="text-[11px] text-[#888] mt-0.5">Lo asigna el restaurante para tus seguidores</p>
        </div>

        <div v-if="featuredStore.discountCode" class="flex items-center gap-2 text-[12px] bg-white rounded-xl border border-[#eee] px-3 py-2">
          <span class="mdi mdi-tag-outline text-primary"></span>
          <span class="font-mono font-bold">{{ featuredStore.discountCode }}</span>
          <span v-if="featuredStore.discountPercent" class="text-emerald-700 font-bold">{{ featuredStore.discountPercent }}% OFF</span>
          <span v-if="featuredStore.discountLabel" class="text-[#888]">· {{ featuredStore.discountLabel }}</span>
        </div>
        <div v-else class="flex items-center gap-2 text-[12px] text-[#888] bg-white rounded-xl border border-dashed border-[#ddd] px-3 py-2.5">
          <span class="mdi mdi-clock-outline text-[14px]"></span>
          <span>El restaurante aun no te ha asignado un codigo</span>
        </div>
      </div>
    </template>

    <!-- Store picker modal -->
    <Modal v-model="showStorePicker" title="Elegir restaurante principal" max-width="max-w-lg">
      <div class="p-5">
        <!-- Tabs -->
        <div class="flex gap-1 mb-4 p-1 rounded-xl bg-[#f5f5f5]">
          <button type="button" @click="pickerTab = 'mine'"
            class="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-lg text-[12px] font-bold transition-all"
            :class="pickerTab === 'mine' ? 'bg-white text-[#1a1c1b] shadow-sm' : 'text-[#888] hover:text-[#1a1c1b]'">
            <span class="mdi mdi-store text-[14px]"></span>
            Mis restaurantes
            <span v-if="availableStores.length" class="text-[10px] opacity-70">{{ availableStores.length }}</span>
          </button>
          <button type="button" @click="pickerTab = 'favorites'"
            class="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-lg text-[12px] font-bold transition-all"
            :class="pickerTab === 'favorites' ? 'bg-white text-[#1a1c1b] shadow-sm' : 'text-[#888] hover:text-[#1a1c1b]'">
            <span class="mdi mdi-heart text-[14px] text-[#ff2d23]"></span>
            Favoritos
            <span v-if="favorites.count.value" class="text-[10px] opacity-70">{{ favorites.count.value }}</span>
          </button>
        </div>

        <!-- Mis restaurantes -->
        <template v-if="pickerTab === 'mine'">
          <div v-if="loadingStores" class="py-10 text-center text-[#888]">
            <span class="mdi mdi-loading animate-spin text-2xl"></span>
          </div>
          <div v-else-if="availableStores.length === 0" class="py-10 text-center">
            <span class="mdi mdi-silverware-off text-3xl text-[#ccc]"></span>
            <p class="mt-2 text-[13px] text-[#888] font-semibold">No tienes restaurantes disponibles</p>
          </div>
          <div v-else class="flex flex-col gap-2 max-h-[50vh] overflow-y-auto">
            <button v-for="s in availableStores" :key="s.userProfileStoreId ?? s.storeId ?? s.slugName"
              type="button" @click="pickStore(s)"
              class="flex items-center gap-3 p-3 rounded-xl border border-[#eee] bg-white hover:border-primary hover:bg-primary/5 transition-all text-left"
              :class="featuredStore?.storeId === s.storeId ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : ''">
              <div v-if="s.logoUrl" class="w-12 h-12 rounded-lg bg-center bg-cover shrink-0"
                :style="{ backgroundImage: `url('${s.logoUrl}')` }"></div>
              <div v-else class="w-12 h-12 rounded-lg bg-[#f5f5f5] flex items-center justify-center shrink-0">
                <span class="mdi mdi-silverware-fork-knife text-[#bbb]"></span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-bold text-[14px] text-[#1a1c1b] truncate">{{ s.name }}</p>
                <p class="text-[11px] text-[#888] truncate">{{ s.slugName }}</p>
              </div>
              <span v-if="featuredStore?.storeId === s.storeId" class="mdi mdi-check-circle text-primary text-xl"></span>
            </button>
          </div>
        </template>

        <!-- Favoritos -->
        <template v-else>
          <div v-if="favorites.count.value === 0" class="py-10 text-center">
            <span class="mdi mdi-heart-outline text-3xl text-[#ccc]"></span>
            <p class="mt-2 text-[13px] text-[#888] font-semibold">Aún no tienes restaurantes guardados</p>
            <p class="mt-1 text-[11px] text-[#aaa]">Pulsa "Guardar" en la página de cualquier restaurante para añadirlo aquí.</p>
          </div>
          <div v-else class="flex flex-col gap-2 max-h-[50vh] overflow-y-auto">
            <button v-for="f in favorites.list.value" :key="f.id"
              type="button" @click="pickFavorite(f)"
              class="flex items-center gap-3 p-3 rounded-xl border border-[#eee] bg-white hover:border-primary hover:bg-primary/5 transition-all text-left"
              :class="featuredStore?.slugName === f.storeSlug ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : ''">
              <div v-if="f.storeLogoUrl" class="w-12 h-12 rounded-lg bg-center bg-cover shrink-0"
                :style="{ backgroundImage: `url('${f.storeLogoUrl}')` }"></div>
              <div v-else class="w-12 h-12 rounded-lg bg-[#f5f5f5] flex items-center justify-center shrink-0">
                <span class="mdi mdi-silverware-fork-knife text-[#bbb]"></span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-bold text-[14px] text-[#1a1c1b] truncate">{{ f.storeName }}</p>
                <p class="text-[11px] text-[#888] truncate">{{ f.storeCity || f.storeSlug }}</p>
              </div>
              <span v-if="featuredStore?.slugName === f.storeSlug" class="mdi mdi-check-circle text-primary text-xl"></span>
            </button>
          </div>
        </template>
      </div>
    </Modal>
  </div>
</template>
