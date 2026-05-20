<script setup lang="ts">
import { computed } from 'vue'
import CreatorBioLayout, { type BioSection } from '~/components/creator/public/CreatorBioLayout.vue'
import { useCreatorBio } from '~/composables/useCreatorBio'
import { useCurrentCreator } from '~/composables/useCurrentCreator'
import { useCreatorBioStyle } from '~/composables/useCreatorBioStyle'
import { useCreatorVerification } from '~/composables/useCreatorVerification'
import { getSkin } from '@guava/guavagram-renderer'

export type { BioSection }

const props = withDefaults(defineProps<{
  selected?: BioSection | null
  interactive?: boolean
}>(), { selected: null, interactive: false })

const emit = defineEmits<{ (e: 'select', key: BioSection): void }>()

const { profile } = useCurrentCreator()
const { featuredStore, recommended, wishlist, reviews } = useCreatorBio()
const { style, previewRootStyle } = useCreatorBioStyle()
const { isFullyVerified } = useCreatorVerification()

const skin = computed(() => getSkin(style.value.skinId))

const heroProfile = computed(() => ({
  name: profile.value?.displayName ?? profile.value?.name ?? 'Tu nombre',
  handle: profile.value?.handle ?? 'tu-handle',
  bio: profile.value?.bio ?? '',
  city: profile.value?.city ?? '',
  profileImageUrl: profile.value?.profileImageUrl ?? profile.value?.avatarUrl ?? '',
  coverImageUrl: profile.value?.coverImageUrl ?? profile.value?.coverUrl ?? '',
  verified: isFullyVerified.value,
  badges: profile.value?.badges ?? [],
  tags: ((profile.value as any)?.tags ?? []) as string[],
  followersCount: (profile.value as any)?.stats?.followersCount ?? 1240,
  circleFollowersCount: (profile.value as any)?.stats?.circleFollowersCount ?? 3,
  accentColor: style.value.accentColor,
  textColor: style.value.textColor,
}))

const externalLinks = computed(() => (profile.value?.externalLinks ?? []) as { externalLinkTypeId: number; value: string }[])

const reviewsMapped = computed(() => (reviews.value ?? []).map(s => ({
  ...s,
  imageUrl: s.mediaUrl,
})))

const showcaseItems = computed(() => {
  const rv = reviewsMapped.value
  if (rv.length) return rv.map((s: any) => ({ imageUrl: s.imageUrl, label: s.storeName ?? s.caption }))
  return (wishlist.value ?? []).map((w: any) => ({ imageUrl: w.imageUrl ?? w.coverUrl ?? w.logoUrl, label: w.name }))
})
</script>

<template>
  <CreatorBioLayout
    :profile="heroProfile"
    :featured-store="featuredStore"
    :recommended="recommended"
    :wishlist="wishlist"
    :reviews="reviewsMapped"
    :external-links="externalLinks"
    :creator-handle="heroProfile.handle"
    :creator-name="heroProfile.name"
    :skin="skin"
    :preview-root-style="previewRootStyle"
    :showcase-items="showcaseItems"
    :interactive="interactive"
    :selected="selected"
    :show-empty-featured-placeholder="true"
    @select="(k: BioSection) => emit('select', k)" />
</template>
