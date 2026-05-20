<template>
  <Modal v-model="isOpen" :title="$t('restaurantInfo')">
    <div class="p-6">
      <!-- Restaurant Info -->
      <div class="flex gap-4">
        <!-- Thumbnail -->
        <div v-if="storeInfo?.menuImageUrl || storeInfo?.logoUrl"
          class="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-200 dark:bg-white/10">
          <img :src="storeInfo?.menuImageUrl || storeInfo?.logoUrl" :alt="storeInfo?.name || 'Restaurant'"
            class="w-full h-full object-cover" />
        </div>

        <!-- Details -->
        <div class="flex-1 min-w-0">
          <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-1">
            {{ storeInfo?.name }}
          </h3>
          <p v-if="formattedAddress" class="text-sm text-gray-600 dark:text-white/80 mb-2">
            {{ formattedAddress }}
          </p>
          <p v-if="storeInfo?.description" class="text-sm text-gray-700 dark:text-white/70 leading-relaxed"
            v-html="storeInfo.description">
          </p>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Modal from '~/components/global/Modal.vue'
import type { StoreInfoViewModel } from '~/services/apis/models/store-info-view-model'

const props = defineProps<{
  modelValue: boolean
  storeInfo?: StoreInfoViewModel
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const formattedAddress = computed(() => {
  if (!props.storeInfo?.address) return null

  const addr = props.storeInfo.address
  const parts: string[] = []

  if (addr.addressLine1) parts.push(addr.addressLine1)
  if (addr.city) parts.push(addr.city)
  if (addr.postalCode) parts.push(addr.postalCode)

  return parts.length > 0 ? parts.join(', ') : null
})
</script>

