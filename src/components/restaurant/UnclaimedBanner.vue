<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ClaimRestaurantModal from './ClaimRestaurantModal.vue'

const { t } = useI18n()

const props = defineProps<{
  restaurantId: string
  restaurantName: string
  /** Whether this restaurant is in 'unclaimed' state. Banner hides otherwise. */
  unclaimed: boolean
  hasSubscription?: boolean
  phoneFromGoogle?: string
  addressFromGoogle?: string
}>()

const modalOpen = ref(false)
const openClaim = () => { modalOpen.value = true }
const closeClaim = () => { modalOpen.value = false }
</script>

<template>
  <div v-if="unclaimed" class="rounded-2xl border border-[#ffd7d3] bg-gradient-to-r from-[#fff5f2] via-white to-[#fef3c7] p-4 flex items-center gap-4 font-display">
    <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-[#ff2d23] to-[#ff6b4a] flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(255,45,35,0.2)]">
      <span class="mdi mdi-crown-outline text-white text-xl"></span>
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-[13px] font-black text-[#1a1c1b]">{{ $t('unclaimedRestaurant') }}</p>
      <p class="text-[11.5px] text-[#666] mt-0.5">{{ $t('ifYouAreOwnerOf', { name: restaurantName }) }}</p>
    </div>
    <button type="button" @click="openClaim"
      class="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1a1c1b] text-white text-[12px] font-bold hover:bg-[#2a2a2a] transition-colors">
      <span class="mdi mdi-shield-check"></span> {{ $t('iAmTheOwner') }}
    </button>

    <ClaimRestaurantModal
      :open="modalOpen"
      :restaurant-id="restaurantId"
      :restaurant-name="restaurantName"
      :has-subscription="hasSubscription ?? false"
      :phone-from-google="phoneFromGoogle"
      :address-from-google="addressFromGoogle"
      @close="closeClaim"
      @claimed="closeClaim" />
  </div>
</template>
