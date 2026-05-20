<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useCreatorBio } from '~/composables/useCreatorBio'
import { CreatorReviewViewModel } from '~/services/apis/models/creator-review-view-model'
import { userApiClient } from '~/services/apis/api.client.user'
import type { UserStoreViewModel } from '~/services/apis/models/user-store-view-model'
import { notifier } from '~/services/notification'

const bio = useCreatorBio()
const { reviews, addReview, removeReview } = bio

const availableStores = ref<UserStoreViewModel[]>([])
const newReviewInput = ref<HTMLInputElement | null>(null)

const genId = () => `review-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

onMounted(async () => {
  try {
    availableStores.value = await userApiClient.userStoresGet()
  } catch {
    // Silently — dropdown will just be empty, user can still create reviews
  }
})

const storeOptions = computed(() => availableStores.value)

const readFile = (file: File): Promise<{ url: string; type: 'image' | 'video' }> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve({
      url: reader.result as string,
      type: file.type.startsWith('video/') ? 'video' : 'image',
    })
    reader.readAsDataURL(file)
  })
}

const onNewReviewFile = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const { url, type } = await readFile(file)
  const vm = CreatorReviewViewModel.fromJS({
    id: genId(),
    mediaUrl: url,
    mediaType: type,
    caption: '',
    storeId: undefined,
    storeName: undefined,
    publishedAt: new Date(),
    views: 0,
    likes: 0,
    orderIdx: reviews.value.length,
  })
  await addReview(vm)
  if (e.target) (e.target as HTMLInputElement).value = ''
}

const openNewReview = () => newReviewInput.value?.click()

const updateField = (id: string | undefined, field: 'caption' | 'storeId', value: string) => {
  if (!id) return
  const idx = reviews.value.findIndex(s => s.id === id)
  if (idx < 0) return
  const arr = [...reviews.value]
  const updated: any = { ...arr[idx] }
  if (field === 'storeId') {
    const store = storeOptions.value.find(s => s.storeId === value)
    updated.storeId = value || undefined
    updated.storeName = store?.name ?? undefined
  } else {
    updated[field] = value
  }
  arr[idx] = updated
  reviews.value = arr
}

const setRating = (id: string | undefined, value: number) => {
  if (!id) return
  const idx = reviews.value.findIndex(s => s.id === id)
  if (idx < 0) return
  const arr = [...reviews.value]
  const updated: any = { ...arr[idx] }
  // Click on the same star clears it (toggle off)
  updated.rating = updated.rating === value ? undefined : value
  arr[idx] = updated
  reviews.value = arr
}

const moveUp = (idx: number) => {
  if (idx <= 0) return
  const arr = [...reviews.value]
  const [picked] = arr.splice(idx, 1)
  if (!picked) return
  arr.splice(idx - 1, 0, picked)
  arr.forEach((s, i) => { s.orderIdx = i })
  reviews.value = arr
}

const moveDown = (idx: number) => {
  if (idx >= reviews.value.length - 1) return
  const arr = [...reviews.value]
  const [picked] = arr.splice(idx, 1)
  if (!picked) return
  arr.splice(idx + 1, 0, picked)
  arr.forEach((s, i) => { s.orderIdx = i })
  reviews.value = arr
}

const openDropdownId = ref<string | null>(null)
const toggleDropdown = (id?: string) => {
  if (!id) return
  openDropdownId.value = openDropdownId.value === id ? null : id
}
const selectStore = (reviewId: string | undefined, storeId: string) => {
  if (!reviewId) return
  updateField(reviewId, 'storeId', storeId)
  openDropdownId.value = null
}
const selectedStore = (reviewStoreId?: string) =>
  storeOptions.value.find(s => s.storeId === reviewStoreId)

const onDocumentClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest?.('[data-store-dropdown]')) openDropdownId.value = null
}
onMounted(() => document.addEventListener('mousedown', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocumentClick))
</script>

<template>
  <div class="space-y-4">
    <div v-if="reviews.length === 0" class="rounded-2xl border-2 border-dashed border-[#ddd] bg-[#fafafa] p-8 text-center">
      <span class="mdi mdi-video-outline text-4xl text-[#ccc]"></span>
      <p class="mt-2 text-[13px] font-semibold text-[#888]">Aún no has publicado reseñas</p>
      <p class="mt-1 text-[11px] text-[#aaa]">Sube un vídeo (o foto) con ticket + local</p>
      <button type="button" @click="openNewReview"
        class="mt-4 inline-flex items-center gap-2 h-11 px-5 rounded-xl text-[13px] font-bold text-white bg-gradient-primary hover:bg-gradient-primary-hover shadow-pill-primary transition-all">
        <span class="mdi mdi-plus"></span> Nueva reseña
      </button>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div v-for="(s, idx) in reviews" :key="s.id ?? idx"
          class="rounded-2xl border border-[#e5e5e5] bg-white overflow-hidden shadow-sm flex flex-col">

          <!-- Media preview -->
          <div class="relative w-full aspect-[3/4] bg-[#1a1c1b]">
            <video v-if="s.mediaType === 'video' && s.mediaUrl" :src="s.mediaUrl" class="w-full h-full object-cover" muted autoplay loop playsinline></video>
            <img v-else-if="s.mediaUrl" :src="s.mediaUrl" class="w-full h-full object-cover" alt="" />
            <div v-else class="w-full h-full flex items-center justify-center">
              <span class="mdi mdi-image-off-outline text-white/40 text-3xl"></span>
            </div>

            <!-- Reorder chevrons -->
            <div class="absolute top-2 left-2 flex flex-col bg-black/50 backdrop-blur rounded-lg overflow-hidden">
              <button type="button" @click="moveUp(idx)" :disabled="idx === 0"
                class="w-7 h-7 text-white hover:bg-white/20 flex items-center justify-center disabled:opacity-25">
                <span class="mdi mdi-chevron-up text-sm"></span>
              </button>
              <button type="button" @click="moveDown(idx)" :disabled="idx === reviews.length - 1"
                class="w-7 h-7 text-white hover:bg-white/20 flex items-center justify-center disabled:opacity-25">
                <span class="mdi mdi-chevron-down text-sm"></span>
              </button>
            </div>

            <button type="button" @click="removeReview(s.id!)"
              class="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 backdrop-blur text-white hover:bg-red-500 flex items-center justify-center transition-colors" :title="$t('delete')">
              <span class="mdi mdi-delete-outline text-sm"></span>
            </button>

            <!-- Metrics -->
            <div class="absolute bottom-2 left-2 flex items-center gap-2 text-[10px] text-white font-bold">
              <span class="inline-flex items-center gap-1 bg-black/50 backdrop-blur rounded-full px-2 py-0.5">
                <span class="mdi mdi-eye-outline text-[11px]"></span>
                {{ s.views ?? 0 }}
              </span>
              <span class="inline-flex items-center gap-1 bg-black/50 backdrop-blur rounded-full px-2 py-0.5">
                <span class="mdi mdi-heart-outline text-[11px]"></span>
                {{ s.likes ?? 0 }}
              </span>
            </div>
          </div>

          <!-- Inputs -->
          <div class="p-3 space-y-2.5">
            <!-- Rating -->
            <div class="flex items-center justify-between gap-2 px-1">
              <span class="text-[11px] font-bold uppercase tracking-wider text-[#888]">Calificación</span>
              <div class="flex items-center gap-0.5">
                <button v-for="star in 5" :key="star" type="button"
                  @click="setRating(s.id, star)"
                  :aria-label="`Calificar ${star} estrella${star > 1 ? 's' : ''}`"
                  class="w-6 h-6 flex items-center justify-center transition-transform hover:scale-110">
                  <span class="mdi text-[18px] transition-colors"
                    :class="star <= Math.round(Number((s as any).rating ?? 0))
                      ? 'mdi-star text-amber-500'
                      : 'mdi-star-outline text-[#ddd]'"></span>
                </button>
              </div>
            </div>

            <!-- Caption -->
            <div class="relative">
              <span class="mdi mdi-format-quote-open absolute left-3 top-1/2 -translate-y-1/2 text-[#bbb] text-[16px] pointer-events-none"></span>
              <input :value="s.caption ?? ''"
                @input="updateField(s.id, 'caption', ($event.target as HTMLInputElement).value)"
                type="text" placeholder="Añade un caption..."
                class="w-full rounded-xl border border-[#e5e5e5] bg-white pl-9 pr-3 h-10 text-[13px] font-medium text-[#1a1c1b] placeholder:text-[#bbb] outline-none transition-colors focus:border-emerald-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(16,185,129,0.12)]" />
            </div>

            <!-- Store picker (custom dropdown) -->
            <div class="relative" data-store-dropdown>
              <button type="button" @click="toggleDropdown(s.id)"
                class="w-full flex items-center gap-2.5 rounded-xl border border-[#e5e5e5] bg-white px-2.5 h-10 transition-all hover:border-[#d0d0d0]"
                :class="openDropdownId === s.id ? 'border-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.12)]' : ''">
                <template v-if="selectedStore(s.storeId)">
                  <div class="w-6 h-6 rounded-full bg-cover bg-center bg-gray-100 shrink-0"
                    :style="selectedStore(s.storeId)?.logoUrl ? { backgroundImage: `url('${selectedStore(s.storeId)?.logoUrl}')` } : {}">
                    <span v-if="!selectedStore(s.storeId)?.logoUrl" class="w-full h-full flex items-center justify-center">
                      <span class="mdi mdi-storefront-outline text-[#bbb] text-[14px]"></span>
                    </span>
                  </div>
                  <span class="flex-1 text-left text-[13px] font-semibold text-[#1a1c1b] truncate">
                    {{ selectedStore(s.storeId)?.name }}
                  </span>
                </template>
                <template v-else>
                  <span class="w-6 h-6 rounded-full bg-[#f5f5f5] flex items-center justify-center shrink-0">
                    <span class="mdi mdi-storefront-outline text-[#bbb] text-[14px]"></span>
                  </span>
                  <span class="flex-1 text-left text-[13px] font-medium text-[#999]">Sin restaurante</span>
                </template>
                <span class="mdi text-[#888] text-[18px] transition-transform"
                  :class="openDropdownId === s.id ? 'mdi-chevron-up' : 'mdi-chevron-down'"></span>
              </button>

              <div v-if="openDropdownId === s.id"
                class="absolute left-0 right-0 top-full mt-1.5 z-20 rounded-xl border border-[#e5e5e5] bg-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.2)] overflow-hidden max-h-64 overflow-y-auto">
                <button type="button" @click="selectStore(s.id, '')"
                  class="w-full flex items-center gap-2.5 px-2.5 h-10 hover:bg-[#fafafa] text-left transition-colors"
                  :class="!s.storeId ? 'bg-emerald-50/60' : ''">
                  <span class="w-6 h-6 rounded-full bg-[#f5f5f5] flex items-center justify-center shrink-0">
                    <span class="mdi mdi-close text-[#999] text-[13px]"></span>
                  </span>
                  <span class="flex-1 text-[13px] font-medium text-[#666]">Sin restaurante</span>
                  <span v-if="!s.storeId" class="mdi mdi-check text-emerald-600 text-[16px]"></span>
                </button>
                <div v-if="storeOptions.length" class="border-t border-[#f0f0f0]"></div>
                <button v-for="opt in storeOptions" :key="opt.storeId"
                  type="button" @click="selectStore(s.id, opt.storeId ?? '')"
                  class="w-full flex items-center gap-2.5 px-2.5 h-10 hover:bg-[#fafafa] text-left transition-colors"
                  :class="s.storeId === opt.storeId ? 'bg-emerald-50/60' : ''">
                  <div class="w-6 h-6 rounded-full bg-cover bg-center bg-gray-100 shrink-0"
                    :style="opt.logoUrl ? { backgroundImage: `url('${opt.logoUrl}')` } : {}">
                    <span v-if="!opt.logoUrl" class="w-full h-full flex items-center justify-center">
                      <span class="mdi mdi-storefront-outline text-[#bbb] text-[13px]"></span>
                    </span>
                  </div>
                  <span class="flex-1 text-[13px] font-semibold text-[#1a1c1b] truncate">{{ opt.name }}</span>
                  <span v-if="s.storeId === opt.storeId" class="mdi mdi-check text-emerald-600 text-[16px]"></span>
                </button>
                <div v-if="!storeOptions.length" class="px-3 py-3 text-center text-[12px] text-[#999]">
                  Aun no tienes restaurantes guardados
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button type="button" @click="openNewReview"
        class="w-full h-12 rounded-xl border-2 border-dashed border-[#ddd] text-[13px] font-bold text-[#888] hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50/40 transition-all">
        <span class="mdi mdi-plus mr-1"></span> Nueva reseña
      </button>
    </template>

    <input ref="newReviewInput" type="file" accept="image/*,video/*" class="hidden" @change="onNewReviewFile" />
  </div>
</template>
