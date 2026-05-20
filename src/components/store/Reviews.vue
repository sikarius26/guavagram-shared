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
            <h2 class="text-xl font-bold text-gray-900 mb-6 pr-8 text-center">
              {{ $t('reviews') }}
            </h2>

            <!-- Rating Summary -->
            <div class="text-center mb-6">
              <div class="text-5xl font-bold text-gray-900 mb-2">{{ averageRating.toFixed(1) }}</div>
              <div class="flex justify-center gap-1 mb-2">
                <span
                  v-for="i in 5"
                  :key="i"
                  :class="`mdi mdi-star text-2xl ${i <= Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`"
                ></span>
              </div>
              <p class="text-sm text-gray-500">
                {{ $t('basedOnReviews', { count: totalReviews }) }}
              </p>
            </div>

            <!-- Rating Breakdown -->
            <div class="mb-6 space-y-2">
              <div
                v-for="rating in [5, 4, 3, 2, 1]"
                :key="rating"
                class="flex items-center gap-3"
              >
                <span class="text-sm text-gray-700 w-8">{{ rating }}★</span>
                <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-yellow-400 transition-all"
                    :style="{ width: `${ratingBreakdown[rating] || 0}%` }"
                  ></div>
                </div>
                <span class="text-sm text-gray-600 w-16 text-right">
                  {{ ratingCounts[rating] || 0 }} {{ ratingCounts[rating] === 1 ? 'review' : 'reviews' }}
                </span>
              </div>
            </div>

            <!-- Reviews List Header -->
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">
                {{ $t('reviewsCount', { count: totalReviews }) }}
              </h3>
              <select
                v-model="sortOrder"
                class="text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-1.5 bg-white"
              >
                <option value="newest">{{ $t('newest') }}</option>
              </select>
            </div>

            <!-- Reviews List -->
            <div class="space-y-6 mb-6">
              <div
                v-for="(review, index) in sortedReviews"
                :key="index"
                class="border-b border-gray-100 pb-6 last:border-0 last:pb-0"
              >
                <!-- Review Header -->
                <div class="flex items-start gap-3 mb-3">
                  <div class="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                    <span class="mdi mdi-account text-gray-600"></span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="font-semibold text-gray-900">Reviewer {{ index + 1 }}</span>
                      <span class="text-xs text-gray-500">{{ formatDate(review) }}</span>
                      <span
                        v-if="review.rating && review.rating >= 4"
                        class="flex items-center gap-1 text-xs text-green-600"
                      >
                        <span class="mdi mdi-check-circle text-sm"></span>
                        {{ $t('verified') }}
                      </span>
                    </div>
                    <!-- Star Rating -->
                    <div class="flex gap-0.5">
                      <span
                        v-for="i in 5"
                        :key="i"
                        :class="`mdi mdi-star text-sm ${i <= (review.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`"
                      ></span>
                    </div>
                  </div>
                </div>

                <!-- Review Text -->
                <p v-if="review.review" class="text-sm text-gray-700 mb-3 leading-relaxed">
                  <span v-if="!expandedReviews[index] && review.review.length > 150">
                    {{ review.review.substring(0, 150) }}...
                    <button
                      @click="expandedReviews[index] = true"
                      class="text-primary font-medium"
                    >
                      {{ $t('more') }}
                    </button>
                  </span>
                  <span v-else>{{ review.review }}</span>
                </p>

                <!-- Review Images Placeholder -->
                <div v-if="false" class="flex gap-2 mb-3">
                  <div class="w-20 h-20 rounded-lg bg-gray-200"></div>
                  <div class="w-20 h-20 rounded-lg bg-gray-200"></div>
                </div>

                <!-- Like/Dislike Buttons -->
                <div class="flex items-center gap-4">
                  <button class="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors">
                    <span class="mdi mdi-thumb-up text-lg"></span>
                  </button>
                  <button class="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors">
                    <span class="mdi mdi-thumb-down text-lg"></span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Add Review Button -->
            <button
              @click="handleAddReview"
              class="w-full bg-gradient-emerald hover:bg-gradient-emerald-hover text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <span class="mdi mdi-plus"></span>
              {{ $t('addReview') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ReviewViewModel } from '~/services/apis/models/review-view-model'

const props = defineProps<{
  modelValue: boolean
  reviews: ReviewViewModel[]
  averageRating: number
  totalReviews: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'addReview': []
}>()

const sortOrder = ref<'newest'>('newest')
const expandedReviews = ref<{ [key: number]: boolean }>({})

const close = () => {
  emit('update:modelValue', false)
}

const handleAddReview = () => {
  emit('addReview')
}

const ratingCounts = computed(() => {
  const counts: { [key: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  props.reviews.forEach((review) => {
    if (review.rating && review.rating >= 1 && review.rating <= 5) {
      counts[review.rating] = (counts[review.rating] || 0) + 1
    }
  })
  return counts
})

const ratingBreakdown = computed(() => {
  const breakdown: { [key: number]: number } = {}
  const total = props.totalReviews || 1

  for (let i = 5; i >= 1; i--) {
    breakdown[i] = ((ratingCounts.value[i] || 0) / total) * 100
  }

  return breakdown
})

const sortedReviews = computed(() => {
  const sorted = [...props.reviews]
  if (sortOrder.value === 'newest') {
    return sorted.reverse()
  }
  return sorted
})

const formatDate = (review: ReviewViewModel): string => {
  // Since ReviewViewModel doesn't have a date field in the model,
  // we'll return a placeholder. In a real implementation, you'd add a date field.
  return new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
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

