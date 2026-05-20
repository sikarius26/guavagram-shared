<script setup lang="ts">
import type { StoreInfoViewModel } from '~/services/apis/models/store-info-view-model'


const props = defineProps({
    store: {
        type: Object as PropType<StoreInfoViewModel>,
        required: true
    }
})

const formattedAddress = computed(() => {
    if (!props.store?.address) return ''
    const addr = props.store.address
    const parts: string[] = []
    if (addr.addressLine1) parts.push(addr.addressLine1)
    if (addr.city) parts.push(addr.city)
    return parts.join(' ')
})

const isRestaurantOpen = computed(() => {
    if (!props.store?.orderChannelStatus) return false
    const now = new Date()
    const dayOfWeek = now.getDay().toString()
    const schedule = props.store.weeklySchedule?.[dayOfWeek]

    if (!schedule) return false

    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTime = currentHour * 60 + currentMinute

    const startTime = (schedule.startingHour || 0) * 60 + (schedule.startingMinute || 0)
    const endTime = (schedule.endingHour || 0) * 60 + (schedule.endingMinute || 0)

    return currentTime >= startTime && currentTime <= endTime
})

</script>
<template>
    <div @click="$router.push(`/r/${store?.slugName}/bio`)"
        class="bg-white cursor-pointer dark:bg-white/10 rounded-xl shadow-default dark:shadow-[0_8px_30px_-4px_rgba(255,255,255,0.1)] p-4">
        <div class="flex items-start gap-3 mb-4">
            <!-- Logo -->
            <div v-if="store?.logoUrl"
                class="w-16 h-16 rounded-full overflow-hidden shrink-0 bg-gray-200 dark:bg-white/10">
                <img :src="store.logoUrl" :alt="store.name || 'Restaurant'" class="w-full h-full object-cover" />
            </div>
            <div v-else
                class="w-16 h-16 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center shrink-0">
                <span class="mdi mdi-store text-2xl text-gray-400"></span>
            </div>

            <!-- Restaurant Info -->
            <div class="flex-1 min-w-0">
                <h2 class="font-bold text-lg text-gray-900 dark:text-white mb-1">
                    {{ store?.name }}
                </h2>
                <div class="flex items-center gap-1 mb-1">
                    <span class="mdi mdi-star text-yellow-400 text-sm"></span>
                    <span class="text-sm text-gray-600 dark:text-white/80">4.8 Reviews</span>
                </div>
                <p v-if="formattedAddress" class="text-xs text-gray-500 dark:text-white/60">
                    {{ formattedAddress }}
                </p>
            </div>

            <!-- Status -->
            <div class="flex flex-col items-end gap-1">
                <span :class="isRestaurantOpen ? 'text-green-500' : 'text-gray-400'" class="text-sm font-medium">
                    {{ isRestaurantOpen ? $t('open') : $t('closed') }}
                </span>
            </div>
        </div>

    </div>
</template>