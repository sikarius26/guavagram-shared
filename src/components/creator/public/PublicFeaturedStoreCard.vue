<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import PublicDiscountCodePill from './PublicDiscountCodePill.vue'
import { useCouponWallet } from '~/composables/useCouponWallet'
import { notifier } from '~/services/notification'

const { t } = useI18n()

const props = defineProps<{
  store: any
  creatorHandle?: string
  creatorName?: string
}>()

const name = computed(() => props.store?.name ?? '')
const coverUrl = computed(() => props.store?.coverUrl ?? props.store?.logoUrl ?? '')
const logoUrl = computed(() => props.store?.logoUrl ?? '')
const slugName = computed(() => props.store?.slugName ?? '')
const city = computed(() => props.store?.city ?? '')
const headline = computed(() => props.store?.headline ?? '')
const personalNotes = computed(() => props.store?.personalNotes ?? '')
const discountCode = computed(() => props.store?.discountCode ?? '')
const discountPercent = computed(() => props.store?.discountPercent ?? undefined)
const discountFlatCents = computed(() => props.store?.discountFlatCents ?? undefined)
const discountLabel = computed(() => props.store?.discountLabel ?? '')

const wallet = useCouponWallet()
const saved = computed(() => !!discountCode.value && wallet.isSaved(discountCode.value, slugName.value))

const saveToWallet = () => {
  if (!discountCode.value) return
  const added = wallet.toggle({
    code: discountCode.value,
    storeName: name.value,
    storeSlug: slugName.value,
    storeCity: city.value || undefined,
    storeLogoUrl: logoUrl.value || undefined,
    storeCoverUrl: coverUrl.value || undefined,
    discountPercent: discountPercent.value,
    discountFlatCents: discountFlatCents.value,
    discountLabel: discountLabel.value || undefined,
    creatorHandle: props.creatorHandle,
    creatorName: props.creatorName,
  })
  if (added) notifier.notifySuccess(t('couponSavedToWallet'))
  else notifier.notifyWarning(t('couponRemovedFromWallet'))
}
</script>

<template>
  <article class="rounded-3xl overflow-hidden shadow-[0_12px_40px_-10px_rgba(0,0,0,0.12)] border"
    style="background-color: var(--bio-surface, white); border-color: var(--bio-border, #f0f0f0);">
    <!-- Cover with overlaid info -->
    <div class="relative w-full aspect-[16/9] bg-center bg-cover"
      :style="coverUrl ? { backgroundImage: `url('${coverUrl}')` } : { background: 'var(--bio-surface-soft, #eee)' }">
      <!-- PRINCIPAL badge top-left -->
      <div class="absolute top-4 left-4">
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] bg-black/85 backdrop-blur-md text-white shadow-lg">
          <span class="mdi mdi-star text-amber-400 text-sm"></span>
          PRINCIPAL
        </span>
      </div>
      <!-- Darken gradient for text readability -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
      <!-- Name overlay bottom of cover -->
      <div class="absolute bottom-0 left-0 right-0 p-4 flex items-end gap-3">
        <div v-if="logoUrl" class="w-14 h-14 rounded-2xl bg-center bg-cover ring-3 ring-white shadow-lg shrink-0"
          :style="{ backgroundImage: `url('${logoUrl}')` }"></div>
        <div v-else class="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-lg">
          <span class="mdi mdi-silverware-fork-knife text-2xl text-gray-400"></span>
        </div>
        <div class="min-w-0 flex-1 pb-0.5">
          <h3 class="text-[22px] font-black text-white leading-tight tracking-tight drop-shadow-md break-words">{{ name }}</h3>
          <p v-if="city" class="flex items-center gap-1 text-xs text-white/90 mt-0.5 drop-shadow">
            <span class="mdi mdi-map-marker text-sm shrink-0"></span>
            <span>{{ city }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Info below -->
    <div class="p-5">
      <!-- Headline if exists -->
      <p v-if="headline" class="text-[14px] font-semibold mb-4 leading-relaxed"
        style="color: var(--bio-text, #1a1c1b);">{{ headline }}</p>

      <!-- Discount code pill (full variant) -->
      <div v-if="discountCode" class="mb-4">
        <PublicDiscountCodePill
          :code="discountCode"
          :percent-off="discountPercent"
          :flat-off-cents="discountFlatCents"
          :description="discountLabel"
          variant="full" />
      </div>

      <!-- Personal notes quote -->
      <blockquote v-if="personalNotes"
        class="border-l-[3px] pl-4 py-1 mb-5 text-[13px] italic leading-relaxed"
        style="border-color: var(--bio-accent, #22c55e); color: var(--bio-text-muted, #555);">
        "{{ personalNotes }}"
      </blockquote>

      <!-- CTAs: uniform size -->
      <div class="grid grid-cols-2 gap-2.5">
        <button
          v-if="discountCode"
          type="button"
          @click.prevent="saveToWallet"
          class="h-11 flex items-center justify-center gap-1.5 rounded-xl font-bold text-[13px] transition-all active:scale-[0.98]"
          :style="saved
            ? { backgroundColor: 'var(--bio-surface)', color: '#111827', border: '2px solid #111827' }
            : { background: 'linear-gradient(135deg, #1f2937, #111827)', color: '#fff', boxShadow: '0 4px 14px -2px rgba(0,0,0,0.15)' }">
          <span class="mdi text-[16px]" :class="saved ? 'mdi-check-circle' : 'mdi-wallet-outline'"></span>
          {{ saved ? t('inYourWallet') : t('save') }}
        </button>
        <NuxtLink
          v-else
          :to="`/r/${slugName}`"
          class="h-11 flex items-center justify-center gap-1.5 rounded-xl font-bold text-[13px] active:scale-[0.98] transition-all"
          :style="{ backgroundColor: 'var(--bio-accent)', color: 'var(--bio-on-accent)', boxShadow: '0 4px 14px -2px rgba(0,0,0,0.15)' }">
          <span class="mdi mdi-storefront-outline text-[16px]"></span>
          Ver ficha
        </NuxtLink>
        <NuxtLink
          :to="`/r/${slugName}/menu`"
          class="h-11 flex items-center justify-center gap-1.5 rounded-xl font-bold text-[13px] border active:scale-[0.98] transition-all"
          style="background-color: var(--bio-surface-soft, transparent); color: var(--bio-text); border-color: var(--bio-border);">
          <span class="mdi mdi-book-open-variant text-[16px]"></span>
          Ver menú
        </NuxtLink>
      </div>
    </div>
  </article>
</template>
