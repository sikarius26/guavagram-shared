<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// TODO: replace with real import from Agent 1B (CreatorLevelEnum)
type LevelKey = 'NEW' | 'LEVEL_1' | 'LEVEL_2' | 'TOP_RATED' | 'GUAVAGRAM_RECOMMENDED'

const props = withDefaults(defineProps<{
  level: number
  size?: 'sm' | 'md' | 'lg'
}>(), {
  size: 'md',
})

const keyByLevel: Record<number, LevelKey> = {
  0: 'NEW',
  1: 'LEVEL_1',
  2: 'LEVEL_2',
  3: 'TOP_RATED',
  4: 'GUAVAGRAM_RECOMMENDED',
}

interface LevelMeta {
  icon: string
  label: string
  // Either use solid bg + text colors OR gradient class + extra
  bgClass?: string
  textClass?: string
  extraClass?: string
}

const metaByKey = computed<Record<LevelKey, LevelMeta | null>>(() => ({
  NEW: null, // no badge for new creators
  LEVEL_1: {
    icon: 'mdi-shield-star-outline',
    label: t('creatorLevel1'),
    bgClass: 'bg-[#e5e7eb]',
    textClass: 'text-[#6b7280]',
  },
  LEVEL_2: {
    icon: 'mdi-shield-star',
    label: t('creatorLevel2'),
    bgClass: 'bg-[#dbeafe]',
    textClass: 'text-[#2563eb]',
  },
  TOP_RATED: {
    icon: 'mdi-crown',
    label: t('creatorLevelTopRated'),
    bgClass: 'bg-gradient-to-r from-[#f59e0b] to-[#eab308]',
    textClass: 'text-white',
  },
  GUAVAGRAM_RECOMMENDED: {
    icon: 'mdi-shield-check',
    label: t('creatorLevelRecommended'),
    bgClass: 'bg-gradient-primary',
    textClass: 'text-white',
    extraClass: 'shadow-pill-primary',
  },
}))

const meta = computed<LevelMeta | null>(() => {
  const key = keyByLevel[props.level]
  if (!key) return null
  return metaByKey.value[key]
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'text-[9px] px-1.5 py-0.5'
    case 'lg': return 'text-[12px] px-3 py-1.5'
    default: return 'text-[10px] px-2 py-1'
  }
})

const iconSizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'text-[10px]'
    case 'lg': return 'text-[14px]'
    default: return 'text-[12px]'
  }
})
</script>

<template>
  <span
    v-if="meta"
    class="inline-flex items-center gap-1 rounded-full font-bold tracking-tight whitespace-nowrap"
    :class="[meta.bgClass, meta.textClass, meta.extraClass, sizeClasses]"
  >
    <span class="mdi leading-none" :class="[meta.icon, iconSizeClass]"></span>
    <span class="leading-none">{{ meta.label }}</span>
  </span>
</template>
