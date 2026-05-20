<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { creatorApiClient } from '~/services/apis/api.client.creator'
import { CreatorPickCategoryEnum } from '~/services/apis/models/creator-pick-category-enum'
import { getPickDisplayPrice, getPickCoverUrl } from '~/services/apis/models/creator-pick-view-model'
import { notifier } from '~/services/notification'
import CreatorPickEditModal from './CreatorPickEditModal.vue'

const { t } = useI18n()

const emit = defineEmits<{ change: [] }>()

const picks = ref<any[]>([])
const loading = ref(false)

// Modal state
const modalOpen = ref(false)
const editingPick = ref<any | null>(null)

const categoryLabels: Record<number, { label: string; color: string; icon: string }> = {
  [CreatorPickCategoryEnum.BIO_SLOT]: { label: 'Slot en bio', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: 'mdi-link-variant' },
  [CreatorPickCategoryEnum.PRINCIPAL_FEATURED]: { label: 'Principal destacado', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'mdi-star' },
  [CreatorPickCategoryEnum.STORY]: { label: 'Story', color: 'bg-pink-50 text-pink-700 border-pink-200', icon: 'mdi-movie-open-outline' },
  [CreatorPickCategoryEnum.VIDEO_REVIEW]: { label: 'Video review', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: 'mdi-video-outline' },
  [CreatorPickCategoryEnum.CAMPAIGN]: { label: 'Campana', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'mdi-bullhorn-outline' },
}

const load = async () => {
  loading.value = true
  try {
    const data = await creatorApiClient.creatorPicksGet()
    picks.value = data ?? []
  } catch (e) {
    notifier.notifyError(t('couldNotLoadPicks'), e as Error)
  } finally {
    loading.value = false
  }
}

onMounted(load)

const openCreate = () => {
  editingPick.value = null
  modalOpen.value = true
}

const openEdit = (pick: any) => {
  editingPick.value = { ...pick, deliverables: [...(pick.deliverables ?? [])] }
  modalOpen.value = true
}

const onSave = async (pick: any) => {
  try {
    if (pick.id) {
      await creatorApiClient.creatorPicksPut(pick)
      const i = picks.value.findIndex(p => p.id === pick.id)
      if (i >= 0) picks.value[i] = pick
      notifier.notifySuccess(t('pickUpdated'))
    } else {
      const created = await creatorApiClient.creatorPicksPost(pick)
      picks.value.push(created)
      notifier.notifySuccess(t('pickCreated'))
    }
    modalOpen.value = false
    emit('change')
  } catch (e) {
    notifier.notifyError(t('couldNotSavePick'), e as Error)
  }
}

const onDelete = async (pick: any) => {
  if (!pick.id) return
  const ok = typeof window !== 'undefined' ? window.confirm(t('deletePickConfirm', { title: pick.title })) : true
  if (!ok) return
  try {
    await creatorApiClient.creatorPicksDelete(pick.id)
    picks.value = picks.value.filter(p => p.id !== pick.id)
    notifier.notifySuccess(t('pickDeleted'))
    emit('change')
  } catch (e) {
    notifier.notifyError(t('couldNotDeletePick'), e as Error)
  }
}

const toggleActive = async (pick: any) => {
  const updated = { ...pick, active: !pick.active }
  try {
    await creatorApiClient.creatorPicksPut(updated)
    const i = picks.value.findIndex(p => p.id === pick.id)
    if (i >= 0) picks.value[i] = updated
    notifier.notifySuccess(updated.active ? t('pickActivated') : t('pickPaused'))
    emit('change')
  } catch (e) {
    notifier.notifyError(t('couldNotUpdatePick'), e as Error)
  }
}

const hasPicks = computed(() => picks.value.length > 0)
</script>

<template>
  <div class="flex flex-col gap-5">

    <!-- Header -->
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div>
        <h3 class="text-[18px] font-bold tracking-[-0.02em] text-[#1a1c1b]">Tus picks</h3>
        <p class="text-[12px] text-[#666] mt-0.5">Paquetes que los negocios pueden contratar.</p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-primary text-white text-[12px] font-bold shadow-pill-primary hover:bg-gradient-primary-hover transition-all"
        @click="openCreate"
      >
        <span class="mdi mdi-plus text-[16px]"></span>
        {{ $t('createNewPick') }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading && !hasPicks" class="rounded-2xl border border-dashed border-[#ddd] p-10 text-center text-[#888] text-[13px]">
      {{ $t('picksLoading') }}
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!hasPicks"
      class="rounded-2xl border border-dashed border-[#ddd] bg-white p-10 text-center"
    >
      <div class="mx-auto w-14 h-14 rounded-2xl bg-[#f7f7f7] flex items-center justify-center mb-3">
        <span class="mdi mdi-package-variant-closed text-[#bbb] text-[28px]"></span>
      </div>
      <p class="text-[15px] font-bold text-[#1a1c1b]">{{ $t('noPicksYet') }}</p>
      <p class="text-[12px] text-[#888] mt-1 max-w-xs mx-auto">
        {{ $t('noPicksDesc') }}
      </p>
      <button
        type="button"
        class="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-primary text-white text-[12px] font-bold shadow-pill-primary hover:bg-gradient-primary-hover"
        @click="openCreate"
      >
        <span class="mdi mdi-plus"></span>
        {{ $t('createFirstPick') }}
      </button>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <article
        v-for="pick in picks"
        :key="pick.id"
        class="rounded-2xl bg-white border border-[#e5e5e5] shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col transition-shadow hover:shadow-[0_6px_18px_rgba(0,0,0,0.08)]"
        :class="{ 'opacity-60': !pick.active }"
      >
        <!-- Thumbnail -->
        <div class="relative aspect-[16/9] bg-[#f3f3f3] overflow-hidden">
          <img
            v-if="getPickCoverUrl(pick)"
            :src="getPickCoverUrl(pick)"
            :alt="pick.title"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-[#ccc]">
            <span class="mdi mdi-image-outline text-[48px]"></span>
          </div>
          <!-- Category badge -->
          <span
            v-if="categoryLabels[pick.category]"
            class="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border"
            :class="categoryLabels[pick.category].color"
          >
            <span class="mdi" :class="categoryLabels[pick.category].icon"></span>
            {{ categoryLabels[pick.category].label }}
          </span>
          <!-- Active pill -->
          <span
            class="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur"
            :class="pick.active ? 'text-emerald-600' : 'text-[#888]'"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="pick.active ? 'bg-emerald-500 animate-pulse' : 'bg-[#bbb]'"></span>
            {{ pick.active ? $t('picksActiveStatus') : $t('picksPausedStatus') }}
          </span>
        </div>

        <!-- Body -->
        <div class="p-4 flex flex-col gap-3 flex-1">
          <div>
            <h4 class="text-[16px] font-bold tracking-[-0.02em] text-[#1a1c1b] line-clamp-1">{{ pick.title }}</h4>
            <p class="text-[12px] text-[#666] line-clamp-2 mt-1">{{ pick.shortPitch || pick.description }}</p>
          </div>

          <!-- Packages summary -->
          <div v-if="pick.packages && pick.packages.length" class="flex items-center gap-1.5 flex-wrap">
            <span
              v-for="p in pick.packages"
              :key="p.tier"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border"
              :class="p.tier === 'BASIC' ? 'bg-[#f3f3f3] text-[#666] border-[#e5e5e5]'
                : p.tier === 'STANDARD' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'"
            >
              {{ p.tier === 'BASIC' ? 'Básico' : p.tier === 'STANDARD' ? 'Recomendado' : 'Premium' }}
              <span class="tabular-nums font-black">{{ p.priceEur }}€</span>
            </span>
          </div>

          <!-- Price + duration -->
          <div class="flex items-end justify-between mt-auto pt-2 border-t border-[#f0f0f0]">
            <div>
              <p class="text-[10px] font-bold text-[#888] uppercase tracking-[0.12em]">{{ pick.packages && pick.packages.length > 1 ? 'Desde' : 'Precio' }}</p>
              <p class="text-[22px] font-black tracking-[-0.03em] text-[#1a1c1b] tabular-nums leading-none mt-0.5">
                {{ getPickDisplayPrice(pick) }}<span class="text-[14px] font-bold text-[#888]">€</span>
              </p>
            </div>
            <div class="text-right">
              <p class="text-[10px] font-bold text-[#888] uppercase tracking-[0.12em]">{{ pick.packages && pick.packages.length > 1 ? 'Paquetes' : 'Días entrega' }}</p>
              <p class="text-[14px] font-bold text-[#1a1c1b] tabular-nums mt-0.5">
                <template v-if="pick.packages && pick.packages.length > 1">
                  {{ pick.packages.length }} <span class="text-[#888] font-normal">tiers</span>
                </template>
                <template v-else>
                  {{ pick.durationDays || (pick.packages && pick.packages[0]?.deliveryDays) || 0 }} <span class="text-[#888] font-normal">días</span>
                </template>
              </p>
            </div>
          </div>

          <!-- Stats -->
          <div class="flex items-center gap-3 text-[11px] text-[#666]">
            <span class="inline-flex items-center gap-1">
              <span class="mdi mdi-cart-outline text-[13px]"></span>
              <span class="font-bold text-[#1a1c1b] tabular-nums">{{ pick.salesCount ?? 0 }}</span> {{ $t('salesLabel') }}
            </span>
            <span class="inline-flex items-center gap-1">
              <span class="mdi mdi-star text-amber-500 text-[13px]"></span>
              <span class="font-bold text-[#1a1c1b] tabular-nums">{{ (pick.rating ?? 0).toFixed(1) }}</span>
            </span>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 pt-2 border-t border-[#f0f0f0]">
            <button
              type="button"
              class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full border border-[#e5e5e5] text-[11px] font-bold text-[#1a1c1b] hover:bg-[#f7f7f7] transition-colors"
              @click="openEdit(pick)"
            >
              <span class="mdi mdi-pencil-outline text-[13px]"></span>
              {{ $t('editButton') }}
            </button>
            <button
              type="button"
              class="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full border text-[11px] font-bold transition-colors"
              :class="pick.active
                ? 'border-[#e5e5e5] text-[#666] hover:bg-[#f7f7f7]'
                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'"
              @click="toggleActive(pick)"
            >
              <span class="mdi" :class="pick.active ? 'mdi-pause' : 'mdi-play'"></span>
              {{ pick.active ? $t('pauseButton') : $t('activateButton') }}
            </button>
            <button
              type="button"
              class="inline-flex items-center justify-center w-9 h-9 rounded-full border border-red-100 text-red-500 hover:bg-red-50 transition-colors"
              :aria-label="$t('delete')"
              @click="onDelete(pick)"
            >
              <span class="mdi mdi-trash-can-outline text-[15px]"></span>
            </button>
          </div>
        </div>
      </article>
    </div>

    <!-- Modal -->
    <CreatorPickEditModal
      v-model="modalOpen"
      :pick="editingPick"
      @save="onSave"
    />
  </div>
</template>
