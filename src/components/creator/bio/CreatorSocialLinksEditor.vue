<script setup lang="ts">
import { computed } from 'vue'
import { useCurrentCreator } from '~/composables/useCurrentCreator'

type ExternalLink = { externalLinkTypeId: number; value: string }

const { profile } = useCurrentCreator()

const LINK_TYPES: { id: number; label: string; icon: string; placeholder: string }[] = [
  { id: 1, label: 'Instagram', icon: 'mdi-instagram', placeholder: '@tuhandle' },
  { id: 2, label: 'TikTok', icon: 'mdi-music-note', placeholder: '@tuhandle' },
  { id: 3, label: 'YouTube', icon: 'mdi-youtube', placeholder: 'https://youtube.com/@canal' },
  { id: 4, label: 'Web', icon: 'mdi-earth', placeholder: 'https://tu-sitio.com' },
  { id: 5, label: 'X (Twitter)', icon: 'mdi-twitter', placeholder: '@tuhandle' },
]

const links = computed<ExternalLink[]>({
  get: () => (profile.value?.externalLinks ?? []) as ExternalLink[],
  set: (v) => {
    if (!profile.value) return
    profile.value = { ...profile.value, externalLinks: v }
  },
})

const addLink = () => {
  const current = links.value
  // pick first type not already used, fallback to Instagram
  const usedIds = new Set(current.map(l => l.externalLinkTypeId))
  const next = LINK_TYPES.find(t => !usedIds.has(t.id)) ?? LINK_TYPES[0]
  links.value = [...current, { externalLinkTypeId: next!.id, value: '' }]
}

const removeLink = (idx: number) => {
  links.value = links.value.filter((_, i) => i !== idx)
}

const updateType = (idx: number, typeId: number) => {
  const arr = [...links.value]
  const existing = arr[idx]
  if (!existing) return
  arr[idx] = { externalLinkTypeId: typeId, value: existing.value }
  links.value = arr
}

const updateValue = (idx: number, value: string) => {
  const arr = [...links.value]
  const existing = arr[idx]
  if (!existing) return
  arr[idx] = { externalLinkTypeId: existing.externalLinkTypeId, value }
  links.value = arr
}

const iconFor = (id: number) => LINK_TYPES.find(t => t.id === id)?.icon ?? 'mdi-link-variant'
const placeholderFor = (id: number) => LINK_TYPES.find(t => t.id === id)?.placeholder ?? ''
</script>

<template>
  <div class="space-y-3">
    <div v-if="links.length === 0" class="rounded-2xl border-2 border-dashed border-[#ddd] bg-[#fafafa] p-8 text-center">
      <span class="mdi mdi-link-variant text-4xl text-[#ccc]"></span>
      <p class="mt-2 text-[13px] font-semibold text-[#888]">Añade tus redes y web</p>
      <button type="button" @click="addLink"
        class="mt-4 inline-flex items-center gap-2 h-11 px-5 rounded-xl text-[13px] font-bold text-white bg-gradient-primary hover:bg-gradient-primary-hover shadow-pill-primary transition-all">
        <span class="mdi mdi-plus"></span> Añadir enlace
      </button>
    </div>

    <template v-else>
      <div class="space-y-2">
        <div v-for="(l, idx) in links" :key="idx"
          class="flex items-center gap-2 p-2 rounded-xl border border-[#e5e5e5] bg-white">
          <span class="mdi text-xl text-[#666] w-8 text-center" :class="iconFor(l.externalLinkTypeId)"></span>
          <select :value="l.externalLinkTypeId"
            @change="updateType(idx, +(($event.target as HTMLSelectElement).value))"
            class="w-36 rounded-lg border border-[#ddd] bg-[#fafafa] px-2 h-10 text-[13px] outline-none focus:border-primary">
            <option v-for="t in LINK_TYPES" :key="t.id" :value="t.id">{{ t.label }}</option>
          </select>
          <input :value="l.value" @input="updateValue(idx, ($event.target as HTMLInputElement).value)"
            type="text" :placeholder="placeholderFor(l.externalLinkTypeId)"
            class="flex-1 rounded-lg border border-[#ddd] bg-[#fafafa] px-3 h-10 text-[13px] outline-none focus:border-primary" />
          <button type="button" @click="removeLink(idx)"
            class="w-9 h-9 rounded-lg text-[#999] hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors" title="Quitar">
            <span class="mdi mdi-delete-outline text-sm"></span>
          </button>
        </div>
      </div>
      <button type="button" @click="addLink"
        class="w-full h-11 rounded-xl border-2 border-dashed border-[#ddd] text-[13px] font-bold text-[#888] hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50/40 transition-all">
        <span class="mdi mdi-plus mr-1"></span> Añadir enlace
      </button>
    </template>
  </div>
</template>
