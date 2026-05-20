<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCurrentCreator } from '~/composables/useCurrentCreator'
import { CREATOR_TAG_SUGGESTIONS, getTagStyle } from '~/composables/useCreatorBioStyle'

const { profile } = useCurrentCreator()

const MAX_TAGS = 6
const input = ref('')

const tags = computed<string[]>({
  get: () => ((profile.value as any)?.tags ?? []) as string[],
  set: (v) => {
    if (!profile.value) return
    profile.value = { ...(profile.value as any), tags: v }
  },
})

const normalize = (s: string) => s.trim().replace(/\s+/g, ' ')

const addTag = (raw: string) => {
  const v = normalize(raw)
  if (!v) return
  if (tags.value.length >= MAX_TAGS) return
  const lower = v.toLowerCase()
  if (tags.value.some(t => t.toLowerCase() === lower)) return
  tags.value = [...tags.value, v.slice(0, 22)]
  input.value = ''
}

const removeTag = (t: string) => {
  tags.value = tags.value.filter(x => x !== t)
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    addTag(input.value)
  } else if (e.key === 'Backspace' && !input.value && tags.value.length) {
    tags.value = tags.value.slice(0, -1)
  }
}

const availableSuggestions = computed(() => {
  const current = new Set(tags.value.map(t => t.toLowerCase()))
  return CREATOR_TAG_SUGGESTIONS.filter(s => !current.has(s.toLowerCase())).slice(0, 12)
})

const canAddMore = computed(() => tags.value.length < MAX_TAGS)
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center justify-between">
      <label class="text-[11px] font-bold uppercase tracking-wider text-[#666]">Etiquetas</label>
      <span class="text-[10px] font-mono text-[#bbb]">{{ tags.length }}/{{ MAX_TAGS }}</span>
    </div>

    <!-- Input + selected chips -->
    <div class="flex flex-wrap gap-1.5 rounded-xl border border-[#ddd] bg-[#fafafa] px-2.5 py-2 min-h-[44px] focus-within:border-primary transition-colors">
      <span v-for="t in tags" :key="t"
        class="inline-flex items-center gap-1 h-7 pl-2 pr-1 rounded-full text-[12px] font-semibold border"
        :style="{ backgroundColor: getTagStyle(t).bg, color: getTagStyle(t).text, borderColor: getTagStyle(t).border }">
        <span class="mdi text-[13px]" :class="getTagStyle(t).icon"></span>
        {{ t }}
        <button type="button" @click="removeTag(t)"
          class="w-5 h-5 rounded-full hover:bg-black/10 flex items-center justify-center transition-colors">
          <span class="mdi mdi-close text-[11px]"></span>
        </button>
      </span>
      <input v-if="canAddMore"
        v-model="input"
        type="text"
        placeholder="Pasta lover, Wine addict..."
        maxlength="22"
        @keydown="onKeydown"
        @blur="addTag(input)"
        class="flex-1 min-w-[120px] bg-transparent text-[13px] outline-none placeholder:text-[#bbb]" />
    </div>

    <!-- Suggestions -->
    <div v-if="canAddMore && availableSuggestions.length" class="flex flex-wrap gap-1.5 pt-1">
      <button v-for="s in availableSuggestions" :key="s" type="button" @click="addTag(s)"
        class="inline-flex items-center gap-1 h-7 px-2.5 rounded-full border bg-white text-[11px] font-semibold transition-all hover:-translate-y-0.5"
        :style="{ color: getTagStyle(s).text, borderColor: getTagStyle(s).border }">
        <span class="mdi text-[12px]" :class="getTagStyle(s).icon"></span>
        {{ s }}
      </button>
    </div>

    <p class="text-[10px] text-[#999] leading-snug">
      Describe tu estilo gastronómico. Máximo {{ MAX_TAGS }} etiquetas. Enter o coma para añadir.
    </p>
  </div>
</template>
