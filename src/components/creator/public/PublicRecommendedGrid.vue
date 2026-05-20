<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import PublicDiscountCodePill from './PublicDiscountCodePill.vue'
import { useCouponWallet } from '~/composables/useCouponWallet'
import { notifier } from '~/services/notification'

const { t } = useI18n()

const props = defineProps<{
  stores: any[]
  creatorHandle?: string
  creatorName?: string
  interactive?: boolean
}>()

const emit = defineEmits<{ (e: 'add'): void }>()

const items = computed(() => props.stores ?? [])

const wallet = useCouponWallet()
const isSaved = (s: any) => !!s.discountCode && wallet.isSaved(s.discountCode, s.slugName)

const saveCoupon = (s: any) => {
  if (!s.discountCode) return
  const added = wallet.toggle({
    code: s.discountCode,
    storeName: s.name,
    storeSlug: s.slugName,
    storeCity: s.city,
    storeLogoUrl: s.logoUrl,
    storeCoverUrl: s.coverUrl,
    discountPercent: s.discountPercent,
    discountFlatCents: s.discountFlatCents,
    discountLabel: s.discountLabel,
    creatorHandle: props.creatorHandle,
    creatorName: props.creatorName,
  })
  if (added) notifier.notifySuccess(t('couponSavedToWallet'))
  else notifier.notifyWarning(t('couponRemovedFromWallet'))
}
</script>

<template>
  <div v-if="items.length === 0 && !interactive"
    class="rounded-2xl border border-dashed p-8 text-center"
    style="border-color: var(--bio-border, #e5e5e5);">
    <span class="mdi mdi-silverware-variant text-3xl" style="color: var(--bio-text-muted, #999);"></span>
    <p class="mt-2 text-sm font-medium" style="color: var(--bio-text-muted, #666);">
      {{ $t('noRecommendationsYet') }}
    </p>
  </div>

  <!-- 2-col grid, unlimited items; interactive mode appends an "Add" tile -->
  <div v-else class="grid grid-cols-2 gap-3">
    <article v-for="s in items" :key="s.userProfileStoreId ?? s.storeId ?? s.slugName"
      class="rounded-2xl overflow-hidden border shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all flex flex-col"
      style="background-color: var(--bio-surface, white); border-color: var(--bio-border, #f0f0f0);">

      <!-- Cover image -->
      <NuxtLink :to="`/r/${s.slugName}`" class="block relative">
        <div class="relative w-full aspect-[4/3] bg-center bg-cover flex items-center justify-center"
          :style="(s.coverUrl || s.logoUrl)
            ? { backgroundImage: `url('${s.coverUrl || s.logoUrl}')` }
            : { background: 'var(--bio-surface-soft, #eee)' }">
          <span v-if="!s.coverUrl && !s.logoUrl" class="mdi mdi-silverware-variant text-3xl"
            style="color: var(--bio-text-muted, #999);"></span>
          <!-- Gradient overlay for logo legibility -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
          <!-- Logo badge overlay -->
          <div v-if="s.logoUrl" class="absolute bottom-2.5 left-2.5 w-10 h-10 rounded-xl bg-center bg-cover ring-2 ring-white shadow-md"
            :style="{ backgroundImage: `url('${s.logoUrl}')` }"></div>
          <!-- Discount badge top-right if exists. FIXED emerald (savings = green),
               never follows --bio-accent (a red bio would signal danger, not discount). -->
          <div v-if="s.discountCode && (s.discountPercent || s.discountFlatCents)"
            class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-black text-white"
            style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow: 0 2px 8px -2px rgba(16,185,129,0.5);">
            <span v-if="s.discountPercent">-{{ s.discountPercent }}%</span>
            <span v-else-if="s.discountFlatCents">-{{ (s.discountFlatCents / 100).toFixed(0) }}€</span>
          </div>
        </div>
      </NuxtLink>

      <div class="p-3 flex flex-col gap-2 flex-1">
        <!-- Name + city -->
        <div>
          <h4 class="text-[14px] font-black leading-tight tracking-tight break-words"
            style="color: var(--bio-text, #1a1c1b);">{{ s.name }}</h4>
          <p v-if="s.city" class="flex items-center gap-1 text-[10px] mt-0.5"
            style="color: var(--bio-text-muted, #888);">
            <span class="mdi mdi-map-marker text-[11px] shrink-0"></span>
            <span>{{ s.city }}</span>
          </p>
        </div>

        <!-- Discount code pill (compact variant) -->
        <PublicDiscountCodePill
          v-if="s.discountCode"
          :code="s.discountCode"
          :percent-off="s.discountPercent"
          :flat-off-cents="s.discountFlatCents"
          variant="compact" />

        <!-- Personal notes quote -->
        <p v-if="s.personalNotes"
          class="text-[11px] italic leading-relaxed break-words"
          style="color: var(--bio-text-muted, #666);">
          "{{ s.personalNotes }}"
        </p>

        <!-- Footer CTA — single Save action (the whole card is already clickable to the store).
             Neutral design: outlined when not saved, emerald filled when saved (confirmation). -->
        <div class="mt-auto">
          <button v-if="s.discountCode" type="button" @click.prevent="saveCoupon(s)"
            class="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-xl text-[11px] font-bold tracking-wide transition-all active:scale-[0.98]"
            :style="isSaved(s)
              ? { backgroundColor: '#10b981', color: '#ffffff', boxShadow: '0 4px 12px -4px rgba(16,185,129,0.4)' }
              : { backgroundColor: 'transparent', color: 'var(--bio-text, #1a1c1b)', border: '1.5px solid var(--bio-border, #d4d4d4)' }">
            <span class="mdi text-[13px]" :class="isSaved(s) ? 'mdi-check-circle' : 'mdi-wallet-plus-outline'"></span>
            {{ isSaved(s) ? t('inYourWallet') : t('saveCoupon') }}
          </button>
        </div>
      </div>
    </article>

    <!-- Add tile (interactive only): same footprint as a card so the grid stays balanced -->
    <button v-if="interactive" type="button" @click.stop="emit('add')"
      class="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 p-4 min-h-[220px] transition-all hover:-translate-y-0.5"
      :style="{
        borderColor: 'var(--bio-border, #d4d4d4)',
        backgroundColor: 'var(--bio-surface-soft, #fafafa)',
        color: 'var(--bio-text-muted, #888)',
      }">
      <span class="mdi mdi-plus-circle-outline text-3xl"></span>
      <span class="text-[12px] font-bold tracking-tight text-center leading-tight">Añadir restaurante</span>
    </button>
  </div>
</template>
