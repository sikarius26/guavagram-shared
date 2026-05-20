<script setup lang="ts">
import { computed } from 'vue'
import {
  CreatorPickPackageViewModel,
  CREATOR_PICK_TIERS,
  TIER_LABELS,
  PICK_DELIVERABLE_CATALOG,
  emptyPickPackage,
  type CreatorPickTier,
} from '~/services/apis/models/creator-pick-package-view-model'

const props = defineProps<{
  modelValue: CreatorPickPackageViewModel[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: CreatorPickPackageViewModel[]]
}>()

// Work with a local reactive copy keyed by tier so the UI is stable even when
// a tier is enabled/disabled.
const byTier = computed<Record<CreatorPickTier, CreatorPickPackageViewModel | undefined>>(() => {
  const map: any = {}
  for (const t of CREATOR_PICK_TIERS) {
    map[t] = props.modelValue.find(p => p.tier === t)
  }
  return map
})

const isEnabled = (tier: CreatorPickTier): boolean => !!byTier.value[tier]

const toggleTier = (tier: CreatorPickTier) => {
  const existing = byTier.value[tier]
  const next = props.modelValue.filter(p => p.tier !== tier)
  if (!existing) {
    // Seed new tier from BASIC if present (inherit and upsell), else from defaults.
    const base = props.modelValue.find(p => p.tier === 'BASIC')
    const pkg = base ? clonePackage(base, tier) : emptyPickPackage(tier)
    next.push(pkg)
  }
  // Sort by tier order
  next.sort((a, b) => CREATOR_PICK_TIERS.indexOf(a.tier) - CREATOR_PICK_TIERS.indexOf(b.tier))
  emit('update:modelValue', next)
}

const clonePackage = (src: CreatorPickPackageViewModel, newTier: CreatorPickTier): CreatorPickPackageViewModel => {
  const p = emptyPickPackage(newTier)
  p.description = src.description
  p.priceEur = Math.round((src.priceEur || 0) * (newTier === 'STANDARD' ? 2 : 3))
  p.deliveryDays = src.deliveryDays
  p.revisions = (src.revisions || 0) + (newTier === 'STANDARD' ? 1 : 2)
  p.deliverables = src.deliverables.map(d => ({ ...d }))
  return p
}

const updatePackage = (tier: CreatorPickTier, patch: Partial<CreatorPickPackageViewModel>) => {
  const next = props.modelValue.map(p => p.tier === tier ? Object.assign(Object.create(Object.getPrototypeOf(p)), p, patch) : p)
  emit('update:modelValue', next)
}

const updateDeliverable = (tier: CreatorPickTier, key: string, patch: { quantity?: number; included?: boolean }) => {
  const pkg = byTier.value[tier]
  if (!pkg) return
  const deliverables = pkg.deliverables.map(d => d.key === key ? { ...d, ...patch } : d)
  updatePackage(tier, { deliverables })
}

const catalog = PICK_DELIVERABLE_CATALOG
</script>

<template>
  <div class="space-y-4">
    <!-- Tier toggles -->
    <div class="grid grid-cols-3 gap-2">
      <button
        v-for="tier in CREATOR_PICK_TIERS"
        :key="tier"
        type="button"
        class="px-3 py-2 rounded-xl text-[12px] font-bold border transition-colors"
        :class="isEnabled(tier)
          ? 'border-[#ff2d23] bg-[#fff5f4] text-[#ff2d23]'
          : 'border-[#e5e5e5] bg-white text-[#888] hover:bg-[#fafafa]'"
        @click="toggleTier(tier)"
      >
        <span class="mdi" :class="isEnabled(tier) ? 'mdi-check-circle' : 'mdi-plus-circle-outline'"></span>
        {{ TIER_LABELS[tier] }}
      </button>
    </div>

    <!-- Empty hint -->
    <div v-if="modelValue.length === 0" class="rounded-xl border border-dashed border-[#ddd] p-6 text-center text-[12px] text-[#888]">
      Activa al menos un paquete para continuar. Si activas varios, los negocios podrán comparar y elegir.
    </div>

    <!-- Packages table -->
    <div v-else class="overflow-x-auto -mx-5 px-5">
      <div class="grid gap-3 min-w-[640px]" :style="{ gridTemplateColumns: `repeat(${modelValue.length}, minmax(0, 1fr))` }">
        <article
          v-for="pkg in modelValue"
          :key="pkg.tier"
          class="rounded-2xl border border-[#e5e5e5] bg-white p-4 flex flex-col gap-3"
          :class="pkg.tier === 'STANDARD' ? 'ring-2 ring-[#ff2d23]/60' : ''"
        >
          <!-- Tier header -->
          <div class="flex items-center justify-between">
            <span
              class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.1em]"
              :class="pkg.tier === 'BASIC' ? 'bg-[#f3f3f3] text-[#666]'
                : pkg.tier === 'STANDARD' ? 'bg-[#fff5f4] text-[#ff2d23]'
                : 'bg-amber-100 text-amber-700'"
            >
              {{ TIER_LABELS[pkg.tier] }}
            </span>
            <button
              type="button"
              class="text-[11px] text-red-500 hover:underline"
              @click="toggleTier(pkg.tier)"
            >
              Quitar
            </button>
          </div>

          <!-- Name -->
          <input
            :value="pkg.name"
            type="text"
            placeholder="Nombre del paquete"
            class="px-3 py-2 rounded-xl border border-[#e5e5e5] text-[13px] font-bold focus:outline-none focus:border-[#1a1c1b]"
            @input="updatePackage(pkg.tier, { name: ($event.target as HTMLInputElement).value })"
          />

          <!-- Description -->
          <textarea
            :value="pkg.description"
            rows="2"
            placeholder="Qué incluye en una línea"
            class="px-3 py-2 rounded-xl border border-[#e5e5e5] text-[12px] focus:outline-none focus:border-[#1a1c1b] resize-none"
            @input="updatePackage(pkg.tier, { description: ($event.target as HTMLTextAreaElement).value })"
          ></textarea>

          <!-- Price / days / revisions grid -->
          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="block text-[10px] font-bold text-[#888] uppercase tracking-[0.1em] mb-1">Precio €</label>
              <input
                :value="pkg.priceEur"
                type="number" min="0" step="1"
                class="w-full px-2 py-1.5 rounded-lg border border-[#e5e5e5] text-[13px] tabular-nums focus:outline-none focus:border-[#1a1c1b]"
                @input="updatePackage(pkg.tier, { priceEur: Number(($event.target as HTMLInputElement).value) })"
              />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-[#888] uppercase tracking-[0.1em] mb-1">Días</label>
              <input
                :value="pkg.deliveryDays"
                type="number" min="1" step="1"
                class="w-full px-2 py-1.5 rounded-lg border border-[#e5e5e5] text-[13px] tabular-nums focus:outline-none focus:border-[#1a1c1b]"
                @input="updatePackage(pkg.tier, { deliveryDays: Number(($event.target as HTMLInputElement).value) })"
              />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-[#888] uppercase tracking-[0.1em] mb-1">Revis.</label>
              <input
                :value="pkg.revisions"
                type="number" min="0" step="1"
                class="w-full px-2 py-1.5 rounded-lg border border-[#e5e5e5] text-[13px] tabular-nums focus:outline-none focus:border-[#1a1c1b]"
                @input="updatePackage(pkg.tier, { revisions: Number(($event.target as HTMLInputElement).value) })"
              />
            </div>
          </div>

          <!-- Deliverables checklist -->
          <div class="border-t border-[#f0f0f0] pt-3">
            <p class="text-[10px] font-bold text-[#666] uppercase tracking-[0.1em] mb-2">Entregables</p>
            <ul class="space-y-1.5">
              <li
                v-for="item in catalog"
                :key="item.key"
                class="flex items-center gap-2 text-[12px]"
              >
                <input
                  type="checkbox"
                  :checked="pkg.deliverables.find(d => d.key === item.key)?.included ?? false"
                  class="w-4 h-4 rounded border-[#ccc] text-[#ff2d23] focus:ring-[#ff2d23]"
                  @change="updateDeliverable(pkg.tier, item.key, { included: ($event.target as HTMLInputElement).checked })"
                />
                <span
                  class="flex-1"
                  :class="pkg.deliverables.find(d => d.key === item.key)?.included ? 'text-[#1a1c1b]' : 'text-[#aaa]'"
                >{{ item.label }}</span>
                <input
                  v-if="item.hasQuantity && pkg.deliverables.find(d => d.key === item.key)?.included"
                  :value="pkg.deliverables.find(d => d.key === item.key)?.quantity ?? 0"
                  type="number" min="0" step="1"
                  class="w-14 px-1.5 py-0.5 rounded-md border border-[#e5e5e5] text-[11px] tabular-nums text-center focus:outline-none focus:border-[#1a1c1b]"
                  @input="updateDeliverable(pkg.tier, item.key, { quantity: Number(($event.target as HTMLInputElement).value) })"
                />
                <span v-if="item.hasQuantity && pkg.deliverables.find(d => d.key === item.key)?.included" class="text-[10px] text-[#888] w-8">{{ item.quantityUnit }}</span>
              </li>
            </ul>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>
