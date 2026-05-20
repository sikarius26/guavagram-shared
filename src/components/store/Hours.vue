<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="close"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/55" @click="close"></div>

        <!-- Modal -->
        <div
          class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto z-10"
          @click.stop
        >
          <!-- Close Button -->
          <button
            @click="close"
            class="absolute top-4 right-4 z-20 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <span class="mdi mdi-close text-gray-600"></span>
          </button>

          <!-- Content -->
          <div class="p-6">
            <!-- Title -->
            <h2 class="text-xl font-bold text-gray-900 mb-6 pr-8">
              {{ $t('workingHours') }}
            </h2>

            <!-- Take Away Section -->
            <div class="mb-8">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                {{ $t('takeAway') }}
              </h3>
              <div class="space-y-3">
                <div
                  v-for="day in daysOfWeek"
                  :key="day.key"
                  class="flex items-center justify-between"
                >
                  <span class="text-gray-700">{{ $t(day.key) }}</span>
                  <span class="text-gray-900 font-medium">
                    {{ formatScheduleHours(weeklySchedule?.[day.key]) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Delivery Section -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                {{ $t('delivery') }}
              </h3>
              <div class="space-y-3">
                <div
                  v-for="day in daysOfWeek"
                  :key="day.key"
                  class="flex items-center justify-between"
                >
                  <span class="text-gray-700">{{ $t(day.key) }}</span>
                  <span class="text-gray-900 font-medium">
                    {{ formatScheduleHours(weeklySchedule?.[day.key]) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ScheduleViewModel } from '~/services/apis/models/schedule-view-model'
import type { StoreOrderChannelViewModel } from '~/services/apis/models/store-order-channel-view-model'
import { OrderTypeEnum } from '~/services/apis/models/order-type-enum'

const props = defineProps<{
  modelValue: boolean
  weeklySchedule?: { [key: string]: ScheduleViewModel } | undefined
  orderChannelStatus?: { [key in keyof typeof OrderTypeEnum]?: StoreOrderChannelViewModel } | undefined
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const close = () => {
  emit('update:modelValue', false)
}

const daysOfWeek = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
]

const formatScheduleHours = (schedule: ScheduleViewModel | undefined): string => {
  if (!schedule) {
    return 'Closed'
  }

  const startHour = schedule.startingHour ?? 0
  const startMinute = schedule.startingMinute ?? 0
  const endHour = schedule.endingHour ?? 0
  const endMinute = schedule.endingMinute ?? 0

  if (startHour === undefined || endHour === undefined) {
    return 'Closed'
  }

  const startTime = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`
  const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`

  return `${startTime} - ${endTime}`
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.95);
  opacity: 0;
}
</style>
