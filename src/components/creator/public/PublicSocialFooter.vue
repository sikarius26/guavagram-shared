<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  links: { externalLinkTypeId: number; value: string }[]
}>()

const TYPE_META: Record<number, { icon: string; label: string; prefix?: string }> = {
  1: { icon: 'mdi-instagram', label: 'Instagram', prefix: 'https://instagram.com/' },
  2: { icon: 'mdi-music-note', label: 'TikTok', prefix: 'https://tiktok.com/@' },
  3: { icon: 'mdi-youtube', label: 'YouTube' },
  4: { icon: 'mdi-earth', label: 'Web' },
  5: { icon: 'mdi-twitter', label: 'X' }
}

const resolvedLinks = computed(() => {
  return (props.links ?? [])
    .filter(l => l?.value?.trim())
    .map(l => {
      const meta = TYPE_META[l.externalLinkTypeId] ?? { icon: 'mdi-link-variant', label: 'Link' }
      let href = l.value.trim()
      if (!/^https?:\/\//i.test(href) && meta.prefix) {
        href = `${meta.prefix}${href.replace(/^@/, '')}`
      } else if (!/^https?:\/\//i.test(href)) {
        href = `https://${href}`
      }
      return { ...meta, href, raw: l.value }
    })
})
</script>

<template>
  <div v-if="resolvedLinks.length" class="flex items-center justify-center gap-3 flex-wrap">
    <a v-for="(l, i) in resolvedLinks" :key="i"
      :href="l.href"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="l.label"
      :title="l.label"
      class="w-11 h-11 rounded-full flex items-center justify-center border hover:shadow-md active:scale-95 transition-all"
      style="background-color: var(--bio-surface, white); border-color: var(--bio-border, #eee); color: var(--bio-text, #555);">
      <span class="mdi text-xl" :class="l.icon"></span>
    </a>
  </div>
</template>
