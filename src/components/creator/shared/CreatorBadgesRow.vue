<script setup lang="ts">
import { computed } from 'vue'
import CreatorBadgeChip from './CreatorBadgeChip.vue'

const props = withDefaults(defineProps<{
  badges: any[]
  maxVisible?: number
}>(), {
  maxVisible: 3,
})

const visible = computed(() => (props.badges || []).slice(0, props.maxVisible))
const overflow = computed(() => Math.max(0, (props.badges?.length || 0) - props.maxVisible))
</script>

<template>
  <div v-if="badges && badges.length" class="flex flex-wrap items-center gap-1.5">
    <CreatorBadgeChip v-for="(b, i) in visible" :key="b.type || i" :badge="b" />
    <span
      v-if="overflow > 0"
      class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold bg-[#f5f5f5] text-[#666]"
    >+{{ overflow }}</span>
  </div>
</template>
