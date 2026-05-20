<script setup lang="ts">
import { computed } from 'vue'

// TODO: replace with real import from Agent 1B (CreatorBadge type)
interface CreatorBadgeLike {
  type: string
  label: string
  iconMdi: string
  colorHex: string
}

const props = defineProps<{
  badge: CreatorBadgeLike | any
}>()

// Using inline styles for dynamic colorHex because Tailwind cannot
// compile arbitrary runtime color values via bg-[colorHex]/10 at build time.
const chipStyle = computed(() => {
  const hex = props.badge?.colorHex || '#888888'
  return {
    backgroundColor: `${hex}1A`, // ~10% alpha
    color: hex,
  }
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold whitespace-nowrap"
    :style="chipStyle"
  >
    <span class="mdi text-[11px] leading-none" :class="badge.iconMdi"></span>
    <span class="leading-none">{{ badge.label }}</span>
  </span>
</template>
