<script setup lang="ts">
import { computed } from 'vue'
import type { StoreInfoViewModel } from '~/services/apis/models/store-info-view-model'
import type { ScheduleViewModel } from '~/services/apis/models/schedule-view-model'

const props = defineProps<{
    store?: StoreInfoViewModel
}>()

const emit = defineEmits<{
    openInfo: []
}>()

const formatScheduleHours = (schedule: ScheduleViewModel | null): string => {
    if (!schedule) return 'Closed'
    const startHour = schedule.startingHour ?? 0
    const startMinute = schedule.startingMinute ?? 0
    const endHour = schedule.endingHour ?? 0
    const endMinute = schedule.endingMinute ?? 0
    if (startHour === undefined || endHour === undefined) return 'Closed'
    const startTime = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`
    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`
    return `${startTime} - ${endTime}`
}

const currentDaySchedule = computed((): ScheduleViewModel | null => {
    if (!props.store?.weeklySchedule) return null
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayIndex = new Date().getDay()
    const today = days[dayIndex]
    if (!today) return null
    return props.store.weeklySchedule[today] || null
})

const currentDayName = computed(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[new Date().getDay()]
})

const isOrderAvailable = computed(() => {
    if (!props.store?.orderChannelStatus) return false
    return Object.values(props.store.orderChannelStatus).some((channel: any) => channel.isOpen)
})

const isBookingAvailable = computed(() => {
    return props.store?.hasBookings && (props.store.bookingShifts?.length ?? 0) > 0
})
</script>

<template>
    <div class="px-4 py-6 space-y-4">

        <!-- Info Rows -->
        <div class="flex flex-col divide-y divide-gray-200 dark:divide-white/20">
            <!-- Restaurant Info -->
            <div @click="emit('openInfo')"
                class="w-full flex items-center justify-between py-3 hover:bg-gray-50 dark:hover:bg-white/10 rounded-lg transition-colors">
                <div class="flex items-center gap-3">
                    <span class="mdi mdi-information text-gray-600 dark:text-white/60"></span>
                    <span class="text-gray-900 dark:text-white">Restaurant info</span>
                </div>
                <span class="mdi mdi-chevron-right text-gray-400 dark:text-white/60"></span>
            </div>

            <!-- Rating -->
            <div class="flex items-center justify-between py-3">
                <div class="flex items-center gap-3">
                    <span class="mdi mdi-star text-yellow-400 fill-yellow-400"></span>
                    <span class="text-gray-900 dark:text-white">4.8 (46 reviews)</span>
                </div>
            </div>

            <!-- Schedule -->
            <div class="flex items-center justify-between py-3">
                <div class="flex items-center gap-3">
                    <span class="mdi mdi-calendar text-green-500"></span>
                    <span class="text-gray-900 dark:text-white">
                        {{ currentDayName }}: {{ formatScheduleHours(currentDaySchedule) }}
                        <span v-if="!currentDaySchedule" class="text-gray-400 dark:text-white/60">Closed</span>
                    </span>
                </div>
            </div>

            <!-- Booking Availability -->
            <div class="flex items-center justify-between py-3">
                <div class="flex items-center gap-3">
                    <span
                        :class="isBookingAvailable ? 'mdi mdi-check-circle text-green-500' : 'mdi mdi-close-circle text-red-500'"></span>
                    <span class="text-gray-900 dark:text-white">
                        {{ isBookingAvailable ? 'Available for booking' : 'Not available for booking' }}
                    </span>
                </div>
            </div>

            <!-- Order Availability -->
            <div class="flex items-center justify-between py-3">
                <div class="flex items-center gap-3">
                    <span
                        :class="isOrderAvailable ? 'mdi mdi-check-circle text-green-500' : 'mdi mdi-close-circle text-red-500'"></span>
                    <span class="text-gray-900 dark:text-white">
                        {{ isOrderAvailable ? 'Available for order' : 'Not available for order' }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>
