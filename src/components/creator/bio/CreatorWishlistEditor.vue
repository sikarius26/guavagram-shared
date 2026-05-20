<script setup lang="ts">
import { ref } from 'vue'
import { useCreatorBio } from '~/composables/useCreatorBio'
import { CreatorWishlistItemViewModel } from '~/services/apis/models/creator-wishlist-item-view-model'
import WishlistStorePicker from './WishlistStorePicker.vue'

interface WishlistPickerSelection {
  source: 'guavagram' | 'google' | 'manual'
  storeId?: string
  googlePlaceId?: string
  slugName?: string
  name: string
  city?: string
  address?: string
  category?: string
  rating?: number
  imageUrl?: string
}

const bio = useCreatorBio()
const { wishlist, addWishlistItem, removeWishlistItem } = bio

const fileInputs = ref<Record<string, HTMLInputElement | null>>({})
const pickerOpen = ref(false)

const genId = () => `wish-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const onPickerSelect = async (sel: WishlistPickerSelection) => {
  const vm = CreatorWishlistItemViewModel.fromJS({
    id: genId(),
    storeId: sel.storeId,
    googlePlaceId: sel.googlePlaceId,
    source: sel.source,
    slugName: sel.slugName,
    name: sel.name,
    city: sel.city ?? '',
    address: sel.address,
    category: sel.category,
    rating: sel.rating,
    imageUrl: sel.imageUrl ?? '',
    reason: '',
    addedAt: new Date(),
    priority: wishlist.value.length,
  })
  await addWishlistItem(vm)
  pickerOpen.value = false
}

const updateField = (id: string | undefined, field: 'reason' | 'imageUrl', value: string) => {
  if (!id) return
  const idx = wishlist.value.findIndex(w => w.id === id)
  if (idx < 0) return
  const arr = [...wishlist.value]
  const updated: any = { ...arr[idx] }
  updated[field] = value
  arr[idx] = updated
  wishlist.value = arr
}

const uploadImage = (id: string | undefined, e: Event) => {
  if (!id) return
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => updateField(id, 'imageUrl', reader.result as string)
  reader.readAsDataURL(file)
}

const triggerUpload = (id: string | undefined) => {
  if (!id) return
  fileInputs.value[id]?.click()
}

const moveUp = (idx: number) => {
  if (idx <= 0) return
  const arr = [...wishlist.value]
  const [picked] = arr.splice(idx, 1)
  if (!picked) return
  arr.splice(idx - 1, 0, picked)
  arr.forEach((w, i) => { w.priority = i })
  wishlist.value = arr
}

const moveDown = (idx: number) => {
  if (idx >= wishlist.value.length - 1) return
  const arr = [...wishlist.value]
  const [picked] = arr.splice(idx, 1)
  if (!picked) return
  arr.splice(idx + 1, 0, picked)
  arr.forEach((w, i) => { w.priority = i })
  wishlist.value = arr
}

const sourceMeta = (w: any) => {
  if (w.source === 'guavagram' || w.storeId) {
    return { label: 'En Guavagram', color: 'bg-emerald-100 text-emerald-700', icon: 'mdi-check-decagram' }
  }
  if (w.source === 'google' || w.googlePlaceId) {
    return { label: 'Google Business', color: 'bg-blue-100 text-blue-700', icon: 'mdi-google' }
  }
  return { label: 'Manual', color: 'bg-[#f0f0f0] text-[#666]', icon: 'mdi-pencil' }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Picker (shown when adding) -->
    <WishlistStorePicker
      v-if="pickerOpen"
      @select="onPickerSelect"
      @cancel="pickerOpen = false"
    />

    <!-- Empty state -->
    <div v-if="wishlist.length === 0 && !pickerOpen"
      class="rounded-2xl border-2 border-dashed border-[#ddd] bg-[#fafafa] p-8 text-center">
      <span class="mdi mdi-heart-outline text-4xl text-[#ccc]"></span>
      <p class="mt-2 text-[13px] font-semibold text-[#888]">Añade tus próximos lugares en el radar</p>
      <button type="button" @click="pickerOpen = true"
        class="mt-4 inline-flex items-center gap-2 h-11 px-5 rounded-xl text-[13px] font-bold text-white bg-gradient-primary hover:bg-gradient-primary-hover shadow-pill-primary transition-all">
        <span class="mdi mdi-magnify"></span> Buscar restaurante
      </button>
    </div>

    <!-- List -->
    <template v-if="wishlist.length > 0">
      <div class="space-y-3">
        <div v-for="(w, idx) in wishlist" :key="w.id ?? idx"
          class="rounded-2xl border border-[#e5e5e5] bg-white p-3 flex gap-3 items-start shadow-sm">

          <!-- Reorder -->
          <div class="flex flex-col items-center bg-[#fafafa] rounded-xl overflow-hidden shrink-0">
            <button type="button" @click="moveUp(idx)" :disabled="idx === 0"
              class="w-8 h-8 text-[#888] hover:text-[#1a1c1b] hover:bg-[#eee] flex items-center justify-center transition-colors disabled:opacity-25 disabled:cursor-not-allowed">
              <span class="mdi mdi-chevron-up text-lg"></span>
            </button>
            <div class="w-full h-[1px] bg-[#e0e0e0]"></div>
            <button type="button" @click="moveDown(idx)" :disabled="idx === wishlist.length - 1"
              class="w-8 h-8 text-[#888] hover:text-[#1a1c1b] hover:bg-[#eee] flex items-center justify-center transition-colors disabled:opacity-25 disabled:cursor-not-allowed">
              <span class="mdi mdi-chevron-down text-lg"></span>
            </button>
          </div>

          <!-- Image -->
          <button type="button" @click="triggerUpload(w.id)"
            class="w-20 h-20 rounded-xl bg-center bg-cover bg-[#f5f5f5] shrink-0 relative overflow-hidden hover:ring-2 hover:ring-primary transition-all"
            :style="w.imageUrl ? { backgroundImage: `url('${w.imageUrl}')` } : {}">
            <div v-if="!w.imageUrl" class="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
              <span class="mdi mdi-image-plus-outline text-[#bbb] text-xl"></span>
              <span class="text-[9px] font-bold text-[#aaa]">Foto</span>
            </div>
            <div v-else class="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center">
              <span class="mdi mdi-camera text-white text-xl opacity-0 hover:opacity-100 transition-opacity"></span>
            </div>
            <input :ref="el => (fileInputs[w.id ?? ''] = el as HTMLInputElement | null)" type="file" accept="image/*" class="hidden" @change="uploadImage(w.id, $event)" />
          </button>

          <!-- Info + fields -->
          <div class="flex-1 min-w-0 space-y-1.5">
            <div class="flex items-center gap-2 flex-wrap">
              <p class="text-[14px] font-black text-[#1a1c1b] truncate">{{ w.name }}</p>
              <span class="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black"
                :class="sourceMeta(w).color">
                <span class="mdi text-[10px]" :class="sourceMeta(w).icon"></span>
                {{ sourceMeta(w).label }}
              </span>
            </div>
            <p v-if="w.city || (w as any).address" class="text-[11px] text-[#888]">
              <span class="mdi mdi-map-marker text-[11px]"></span>
              {{ (w as any).address || w.city }}
              <span v-if="(w as any).category" class="ml-1">· {{ (w as any).category }}</span>
            </p>
            <input :value="w.reason ?? ''" @input="updateField(w.id, 'reason', ($event.target as HTMLInputElement).value)"
              type="text" placeholder="Por qué quieres ir (opcional)"
              class="w-full rounded-xl border border-[#ddd] bg-[#fafafa] px-3 h-9 text-[12px] outline-none focus:border-primary" />
          </div>

          <!-- Delete -->
          <button type="button" @click="removeWishlistItem(w.id!)"
            class="w-9 h-9 rounded-lg text-[#999] hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors shrink-0" :title="$t('delete')">
            <span class="mdi mdi-delete-outline text-sm"></span>
          </button>
        </div>
      </div>

      <button v-if="!pickerOpen" type="button" @click="pickerOpen = true"
        class="w-full h-12 rounded-xl border-2 border-dashed border-[#ddd] text-[13px] font-bold text-[#888] hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50/40 transition-all">
        <span class="mdi mdi-magnify mr-1"></span> Buscar otro restaurante
      </button>
    </template>
  </div>
</template>
