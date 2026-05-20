<script setup lang="ts">
import { computed } from 'vue'
import type { SkinDefinition } from '@guava/guavagram-renderer'
import PublicCreatorHero, { type HeroSubsection } from '~/components/creator/public/PublicCreatorHero.vue'
import PublicFeaturedStoreCard from '~/components/creator/public/PublicFeaturedStoreCard.vue'
import PublicRecommendedGrid from '~/components/creator/public/PublicRecommendedGrid.vue'
import PublicWishlistGrid from '~/components/creator/public/PublicWishlistGrid.vue'
import PublicReviewsCarousel from '~/components/creator/public/PublicReviewsCarousel.vue'
import PublicSocialFooter from '~/components/creator/public/PublicSocialFooter.vue'
import PublicCreatorEngageBanner from '~/components/creator/public/PublicCreatorEngageBanner.vue'

export type BioSection =
  | 'cover' | 'avatar' | 'identity' | 'tags'
  | 'featured' | 'recommended' | 'wishlist' | 'reviews' | 'social' | 'engage' | 'style'

const PROFILE_SUBSECTIONS: readonly HeroSubsection[] = ['cover', 'avatar', 'identity', 'tags']

const props = withDefaults(defineProps<{
  profile: any
  featuredStore?: any | null
  recommended?: any[]
  wishlist?: any[]
  reviews?: any[]
  externalLinks?: Array<{ externalLinkTypeId: number; value: string }>
  creatorHandle?: string
  creatorName?: string
  skin?: SkinDefinition
  previewRootStyle?: Record<string, string>
  showcaseItems?: Array<{ imageUrl: string; label?: string; storeName?: string }>
  interactive?: boolean
  selected?: BioSection | null
  isFollowing?: boolean
  showEngage?: boolean
  showEmptyFeaturedPlaceholder?: boolean
}>(), {
  featuredStore: null,
  recommended: () => [],
  wishlist: () => [],
  reviews: () => [],
  externalLinks: () => [],
  showcaseItems: () => [],
  interactive: false,
  selected: null,
  isFollowing: false,
  showEngage: true,
  showEmptyFeaturedPlaceholder: false,
})

const emit = defineEmits<{
  (e: 'select', key: BioSection): void
  (e: 'toggle-follow'): void
}>()

const selectedHeroSubsection = computed<HeroSubsection | null>(() => {
  const s = props.selected
  return s && (PROFILE_SUBSECTIONS as readonly string[]).includes(s)
    ? (s as HeroSubsection)
    : null
})

const ringClass = (key: BioSection) => {
  if (!props.interactive) return ''
  const base = 'cursor-pointer transition-all'
  const active = props.selected === key
    ? 'ring-2 ring-[#ff2d23] ring-inset bg-[#ff2d23]/[0.03]'
    : 'hover:ring-2 hover:ring-[#ff2d23]/30 hover:ring-inset'
  return `${base} ${active}`
}

const onSelect = (key: BioSection) => {
  if (!props.interactive) return
  emit('select', key)
}

const onHeroSubsection = (key: HeroSubsection) => emit('select', key)

const reviewsMapped = computed(() =>
  (props.reviews ?? []).map((s: any) => ({ ...s, imageUrl: s.imageUrl ?? s.mediaUrl }))
)
</script>

<template>
  <div class="preview-root transition-colors" :style="previewRootStyle">
    <!-- Hero -->
    <PublicCreatorHero
      :profile="profile"
      :skin="skin"
      :is-following="isFollowing"
      :showcase-items="showcaseItems"
      :editable="interactive"
      :selected-subsection="selectedHeroSubsection"
      @toggle-follow="emit('toggle-follow')"
      @select-subsection="onHeroSubsection" />

    <!-- Slot: extras under the hero (e.g. public Stats row) -->
    <slot name="after-hero" />

    <!-- Featured -->
    <section v-if="featuredStore" class="px-5 mt-8">
      <h2 class="text-[11px] font-black uppercase tracking-[0.2em] mb-3"
        style="color: var(--bio-accent, #16a34a);">Principal</h2>
      <div @click.stop="onSelect('featured')" :class="['rounded-2xl', ringClass('featured')]">
        <PublicFeaturedStoreCard :store="featuredStore" :creator-handle="creatorHandle" :creator-name="creatorName" />
      </div>
    </section>
    <section v-else-if="interactive && showEmptyFeaturedPlaceholder" class="px-5 mt-8">
      <div @click.stop="onSelect('featured')"
        :class="['rounded-2xl border-2 border-dashed p-6 text-center', ringClass('featured'),
                 selected === 'featured' ? 'border-[#ff2d23]' : '']"
        :style="{ borderColor: selected === 'featured' ? '#ff2d23' : 'var(--bio-border, #e5e5e5)' }">
        <span class="mdi mdi-star-plus-outline text-2xl" style="color: var(--bio-text-muted, #999);"></span>
        <p class="text-[11px] font-semibold mt-1" style="color: var(--bio-text-muted, #999);">Añade tu restaurante principal</p>
      </div>
    </section>

    <!-- Recommended -->
    <section v-if="recommended.length || interactive" class="px-5 mt-8">
      <h2 class="text-[11px] font-black uppercase tracking-[0.2em] mb-3"
        style="color: var(--bio-text, #1a1c1b);">Recomendados</h2>
      <div @click.stop="onSelect('recommended')" :class="['rounded-2xl p-1 -m-1', ringClass('recommended')]">
        <PublicRecommendedGrid
          :stores="recommended"
          :creator-handle="creatorHandle"
          :creator-name="creatorName"
          :interactive="interactive"
          @add="onSelect('recommended')" />
      </div>
    </section>

    <!-- Reseñas -->
    <section v-if="reviewsMapped.length || interactive" class="px-5 mt-8">
      <h2 class="text-[11px] font-black uppercase tracking-[0.2em] mb-3"
        style="color: var(--bio-text, #1a1c1b);">Reseñas</h2>
      <div @click.stop="onSelect('reviews')" :class="['rounded-2xl p-1 -m-1', ringClass('reviews')]">
        <PublicReviewsCarousel :reviews="reviewsMapped" />
      </div>
    </section>

    <!-- Wishlist -->
    <section v-if="wishlist.length || interactive" class="px-5 mt-8">
      <h2 class="text-[11px] font-black uppercase tracking-[0.2em] mb-3"
        style="color: var(--bio-text, #1a1c1b);">Lugares a los que me gustaría ir</h2>
      <div @click.stop="onSelect('wishlist')" :class="['rounded-2xl p-1 -m-1', ringClass('wishlist')]">
        <PublicWishlistGrid :items="wishlist" :creator-handle="creatorHandle" />
      </div>
    </section>

    <!-- Slot: extras before the engage banner (e.g. public Campañas) -->
    <slot name="before-engage" />

    <!-- Engage -->
    <section v-if="showEngage" class="px-5 mt-8">
      <div @click.stop="onSelect('engage')" :class="['rounded-2xl p-1 -m-1', ringClass('engage')]">
        <PublicCreatorEngageBanner :creator-name="profile?.name" />
      </div>
    </section>

    <!-- Social -->
    <section v-if="externalLinks.length || interactive" class="px-5 mt-8">
      <div @click.stop="onSelect('social')" :class="['rounded-2xl p-2 -m-2', ringClass('social')]">
        <PublicSocialFooter :links="externalLinks" />
      </div>
    </section>
  </div>
</template>

<!--
  Shared layout used by the creator bio editor (CreatorBioPreview) and the
  public profile page (/u/[slug]). Keeping both on this component guarantees
  that what the creator sees while editing matches what visitors see.

  - Pass `interactive` + `selected` only from the editor.
  - Use `after-hero` / `before-engage` slots for view-only extras
    (public Stats row, Campañas activas, etc.) that don't belong in the editor.
  - `--radius-base` is available on preview-root but intentionally NOT applied
    globally — only the hero composition follows the skin, the rest keeps its
    native rounding (same pattern as the restaurant bio).
-->
