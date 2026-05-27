<script setup lang="ts">
const props = withDefaults(defineProps<{
  icon: string
  activeIcon?: string
  label: string
  active: boolean
  badge?: string | number
  dot?: string
  to?: string
  target?: '_blank'
  disabled?: boolean
  lockReason?: string
  accentColor?: string
}>(), {
  activeIcon: '',
  badge: '',
  dot: '',
  to: '',
  target: undefined,
  disabled: false,
  lockReason: '',
  accentColor: '#ff2d23',
})

defineEmits<{
  (e: 'click'): void
}>()

const resolvedIcon = (() => props.active && props.activeIcon ? props.activeIcon : props.icon)
</script>

<template>
  <component
    :is="to && !disabled ? 'NuxtLink' : 'button'"
    :to="to && !disabled ? to : undefined"
    :target="target"
    :type="to ? undefined : 'button'"
    @click="!disabled && $emit('click')"
    class="flex items-center gap-2.5 py-[7px] px-2.5 rounded-lg transition-all duration-150 text-left w-full group"
    :class="[
      active
        ? 'font-semibold border-l-[3px]'
        : 'text-[#888] hover:text-[#1a1c1b] hover:bg-[#f7f7f7]',
      disabled ? 'cursor-pointer opacity-80' : '',
      lockReason ? 'opacity-50 hover:opacity-80' : '',
    ]"
    :style="active ? `background-color: ${accentColor}14; color: ${accentColor}; border-left-color: ${accentColor};` : ''"
    :aria-current="active ? 'page' : undefined"
    :title="lockReason || undefined"
  >
    <span class="mdi text-[18px] leading-none" :class="resolvedIcon"></span>
    <span class="text-[12px] flex-1 truncate">{{ label }}</span>
    <span
      v-if="lockReason"
      class="mdi mdi-lock-outline text-[12px] text-[#aaa] group-hover:text-[#666]"
      aria-hidden="true"
    ></span>
    <span
      v-else-if="badge"
      class="text-[8px] font-bold px-1.5 py-0.5 rounded"
      :style="`background-color: ${accentColor}1a; color: ${accentColor};`"
    >{{ badge }}</span>
    <span
      v-else-if="target === '_blank'"
      class="mdi mdi-open-in-new text-[12px] text-[#bbb]"
      aria-hidden="true"
    ></span>
    <div
      v-else-if="dot && !active"
      class="w-2 h-2 rounded-full"
      :style="{ backgroundColor: dot }"
    ></div>
  </component>
</template>
