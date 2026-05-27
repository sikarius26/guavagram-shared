<script setup lang="ts">
import { computed } from 'vue'
import { getTagStyle } from '~/composables/useCreatorBioStyle'
import { formatFollowersBucket } from '~/composables/useFollow'
import type { SkinDefinition } from '@guava/guavagram-renderer'

// Fallback preserves the legacy hero (cover + left avatar + center text, no serif)
// so callers that don't pass `skin` (e.g. the public /u/[slug] page) keep working.
const FALLBACK_SKIN: SkinDefinition = {
  id: 'classic',
  label: 'Clásico',
  cover: { show: true, height: 'md', overlayName: false, overlap: true },
  avatar: { show: true, size: 'lg', align: 'left' },
  header: { align: 'left', serif: false },
  ctas: { stack: false, menuFirst: false },
  showcase: { enabled: false },
  reactionsVisible: true,
}

export type HeroSubsection = 'cover' | 'avatar' | 'identity' | 'tags'

// Per-subsection visibility. Missing keys default to visible. On the public
// bio, a `false` value removes the subsection. In the editor (editable=true)
// it stays mounted but is rendered at 40% opacity so the creator can still
// click it to edit / re-enable.
type HeroVisibility = Partial<Record<HeroSubsection, boolean>>

const props = defineProps<{
  profile: any
  isFollowing?: boolean
  skin?: SkinDefinition
  showcaseItems?: Array<{ imageUrl: string; label?: string; storeName?: string }>
  editable?: boolean
  selectedSubsection?: HeroSubsection | null
  visibility?: HeroVisibility | null
}>()

const isSubVisible = (key: HeroSubsection): boolean => {
  const v = props.visibility
  if (!v) return true
  return v[key] !== false
}

const emit = defineEmits<{
  (e: 'toggle-follow'): void
  (e: 'select-subsection', key: HeroSubsection): void
}>()

const subsectionClass = (key: HeroSubsection) => {
  if (!props.editable) return ''
  const base = 'cursor-pointer transition-all'
  const selected = props.selectedSubsection === key
    ? 'ring-2 ring-[#ff2d23] ring-inset bg-[#ff2d23]/[0.03]'
    : 'hover:ring-2 hover:ring-[#ff2d23]/30 hover:ring-inset'
  return `${base} ${selected}`
}
const onSubsectionClick = (key: HeroSubsection) => {
  if (!props.editable) return
  emit('select-subsection', key)
}

const name = computed(() => props.profile?.name ?? '')
const handle = computed(() => props.profile?.handle ?? '')
const bio = computed(() => props.profile?.bio ?? '')
const city = computed(() => props.profile?.city ?? '')
const profileImageUrl = computed(() => props.profile?.profileImageUrl ?? '')
const coverImageUrl = computed(() => props.profile?.coverImageUrl ?? '')
const verified = computed(() => !!props.profile?.verified)
const badges = computed(() => (props.profile?.badges ?? []) as Array<{ label: string; icon?: string }>)
const tags = computed(() => (props.profile?.tags ?? []) as string[])
const accentColor = computed(() => props.profile?.accentColor ?? '#ff2d23')
const textColor = computed(() => props.profile?.textColor ?? null)

const followersCount = computed<number | null>(() => {
  const raw = props.profile?.followersCount ?? props.profile?.stats?.followersCount
  return typeof raw === 'number' ? raw : null
})
const circleFollowersCount = computed<number>(() => {
  const raw = props.profile?.circleFollowersCount ?? props.profile?.stats?.circleFollowersCount
  return typeof raw === 'number' && raw > 0 ? raw : 0
})
const followersLabel = computed(() =>
  followersCount.value === null ? null : formatFollowersBucket(followersCount.value)
)

const skin = computed<SkinDefinition>(() => props.skin ?? FALLBACK_SKIN)

const coverAspectClass = computed(() => {
  switch (skin.value.cover.height) {
    case 'sm': return 'aspect-[4/1]'
    case 'lg': return 'aspect-[3/2]'
    default:   return 'aspect-[2/1]'
  }
})

const avatarSizeClass = computed(() => {
  switch (skin.value.avatar.size) {
    case 'sm': return 'w-20 h-20'
    case 'md': return 'w-24 h-24'
    default:   return 'w-32 h-32'
  }
})

const avatarMarginClass = computed(() => {
  switch (skin.value.avatar.size) {
    case 'sm': return '-mt-10'
    case 'md': return '-mt-12'
    default:   return '-mt-16'
  }
})

const headerAlignClass = computed(() => skin.value.header.align === 'left' ? 'text-left' : 'text-center')
const headerSerifStyle = computed(() => skin.value.header.serif
  ? { fontFamily: "Georgia, 'Times New Roman', 'Noto Serif', serif" }
  : undefined)

const showCover = computed(() => skin.value.cover.show && (props.editable || isSubVisible('cover')))
const showAvatar = computed(() => skin.value.avatar.show && (props.editable || isSubVisible('avatar')))
const overlayName = computed(() => skin.value.cover.overlayName && showCover.value)
const showIdentity = computed(() => props.editable || isSubVisible('identity'))
const showTags = computed(() => props.editable || isSubVisible('tags'))
const showcaseGrid = computed(() => skin.value.showcase.enabled && (props.showcaseItems ?? []).length > 0)
const showcaseTiles = computed(() => (props.showcaseItems ?? []).slice(0, 4))
</script>

<template>
  <section class="relative w-full overflow-hidden">
    <!-- Ambient accent glow — single soft glow so the accent doesn't flood the page -->
    <div class="pointer-events-none absolute inset-0 -z-0">
      <div class="absolute -top-24 -left-20 w-[420px] h-[420px] rounded-full blur-[120px] opacity-[0.08]"
        :style="{ backgroundColor: accentColor }"></div>
    </div>

    <!-- Cover -->
    <div v-if="showCover"
      @click.stop="onSubsectionClick('cover')"
      class="relative w-full bg-center bg-cover bg-gray-200 dark:bg-white/5"
      :class="[coverAspectClass, subsectionClass('cover'), { 'opacity-40': editable && !isSubVisible('cover') }]"
      :style="coverImageUrl ? { backgroundImage: `url('${coverImageUrl}')` } : { background: `linear-gradient(135deg, ${accentColor}, ${accentColor}80)` }">
      <!-- Layered gradients for depth -->
      <div class="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/70"></div>
      <div class="absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style="background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0); background-size: 16px 16px;"></div>
      <!-- Accent edge glow at bottom -->
      <div class="absolute inset-x-0 bottom-0 h-px"
        :style="{ background: `linear-gradient(to right, transparent, ${accentColor}, transparent)` }"></div>

      <!-- Editorial: name overlaid on cover -->
      <div v-if="overlayName" class="absolute inset-x-0 bottom-0 px-5 pb-8">
        <h1 class="text-white text-[36px] font-black tracking-tight leading-tight drop-shadow-lg"
          :class="headerAlignClass"
          :style="headerSerifStyle">
          {{ name }}
        </h1>
        <p v-if="handle" class="text-white/90 text-[14px] font-semibold mt-1.5 drop-shadow"
          :class="headerAlignClass">@{{ handle }}</p>
      </div>
    </div>

    <!-- Avatar + info -->
    <div class="px-5 relative z-10"
      :class="[showCover ? (showAvatar ? avatarMarginClass : 'pt-5') : 'pt-5', headerAlignClass]">
      <div class="flex items-end gap-3"
        :class="[
          skin.header.align === 'center' ? 'justify-center' : 'justify-start',
        ]">
        <div v-if="showAvatar"
          @click.stop="onSubsectionClick('avatar')"
          class="flex items-end gap-3 rounded-full"
          :class="[subsectionClass('avatar'), { 'opacity-40': editable && !isSubVisible('avatar') }]">
          <div class="relative shrink-0 group/avatar">
            <!-- Subtle neutral glow behind avatar -->
            <div class="absolute inset-0 rounded-full blur-xl opacity-25 scale-110 bg-black"></div>
            <!-- Neutral avatar frame (white ring) — the accent stays reserved for the @handle + Follow CTA -->
            <div class="relative rounded-full p-[3px] shadow-[0_18px_40px_-12px_rgba(0,0,0,0.35)] bg-white dark:bg-white/10">
              <div class="rounded-full bg-center bg-cover bg-gray-300 dark:bg-white/10 border-[3px] border-white dark:border-[#151515] transition-transform duration-300 group-hover/avatar:scale-[1.02]"
                :class="avatarSizeClass"
                :style="profileImageUrl ? { backgroundImage: `url('${profileImageUrl}')` } : {}"></div>
            </div>
            <!-- Verified badge — emerald (universal trust/verification color, not brand accent) -->
            <div v-if="verified" class="absolute -bottom-1 -right-1 w-9 h-9 rounded-full flex items-center justify-center ring-[3px] ring-white dark:ring-[#151515] shadow-lg"
              style="background: linear-gradient(135deg, #22c55e, #16a34a);"
              title="Verificado">
              <span class="mdi mdi-check text-white text-[18px] font-black"></span>
            </div>
          </div>
        </div>
      </div>

      <div class="pt-4" :class="headerAlignClass">
        <div
          v-if="showIdentity"
          @click.stop="onSubsectionClick('identity')"
          class="rounded-xl -mx-1 px-1 py-1"
          :class="[subsectionClass('identity'), { 'opacity-40': editable && !isSubVisible('identity') }]">
          <div v-if="!overlayName" class="flex items-center gap-2 flex-wrap"
            :class="skin.header.align === 'center' ? 'justify-center' : ''">
            <h1 class="text-[36px] font-black tracking-[-0.02em] leading-[0.95]"
              :class="textColor ? '' : 'text-gray-900 dark:text-white'"
              :style="{ ...(textColor ? { color: textColor } : {}), ...(headerSerifStyle || {}) }">
              {{ name }}
            </h1>
          </div>
          <p v-if="handle && !overlayName" class="text-[14px] font-bold mt-1 inline-block"
            :style="{
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}80)`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
            }">@{{ handle }}</p>
          <p v-if="bio" class="text-[15px] mt-3 leading-relaxed line-clamp-3"
            :class="textColor ? '' : 'text-gray-700 dark:text-white/85'"
            :style="textColor ? { color: textColor, opacity: 0.88 } : undefined">{{ bio }}</p>

          <div v-if="city" class="flex items-center gap-1.5 mt-3 text-[13px] font-semibold"
            :class="[
              textColor ? '' : 'text-gray-500 dark:text-white/60',
              skin.header.align === 'center' ? 'justify-center' : '',
            ]"
            :style="textColor ? { color: textColor, opacity: 0.65 } : undefined">
            <span class="mdi mdi-map-marker text-base opacity-60"></span>
            <span>{{ city }}</span>
          </div>
        </div>

        <!-- Premium stats row -->
        <div v-if="followersLabel !== null"
          class="flex items-center gap-4 mt-4 text-[13px]"
          :class="skin.header.align === 'center' ? 'justify-center' : ''">
          <div class="flex items-baseline gap-1.5">
            <span class="text-[22px] font-black tabular-nums tracking-[-0.02em]"
              :class="textColor ? '' : 'text-gray-900 dark:text-white'"
              :style="textColor ? { color: textColor } : undefined">{{ followersLabel }}</span>
            <span class="text-[11px] font-bold uppercase tracking-[0.12em]"
              :class="textColor ? '' : 'text-gray-500 dark:text-white/55'"
              :style="textColor ? { color: textColor, opacity: 0.55 } : undefined">seguidores</span>
          </div>
          <div class="h-6 w-px bg-gray-200 dark:bg-white/10"></div>
          <div class="flex items-baseline gap-1.5">
            <span class="inline-flex items-baseline gap-1">
              <span class="mdi mdi-account-heart-outline text-[18px] translate-y-0.5 opacity-60"
                :class="textColor ? '' : 'text-gray-500 dark:text-white/55'"
                :style="textColor ? { color: textColor } : undefined"></span>
              <span class="text-[22px] font-black tabular-nums tracking-[-0.02em]"
                :class="textColor ? '' : 'text-gray-900 dark:text-white'"
                :style="textColor ? { color: textColor } : undefined">{{ circleFollowersCount }}</span>
            </span>
            <span class="text-[11px] font-bold uppercase tracking-[0.12em]"
              :class="textColor ? '' : 'text-gray-500 dark:text-white/55'"
              :style="textColor ? { color: textColor, opacity: 0.55 } : undefined">círculo</span>
          </div>
        </div>

        <!-- Action row: Follow + Share (chat removed — no DM feature backing it) -->
        <div class="mt-5 flex items-center gap-2"
          :class="skin.header.align === 'center' ? 'justify-center' : 'justify-start'">
          <button
            type="button"
            @click="emit('toggle-follow')"
            class="inline-flex items-center gap-1.5 pl-4 pr-5 h-11 rounded-full text-[13px] font-black tracking-tight transition-all active:scale-[0.97]"
            :class="isFollowing
              ? 'bg-white dark:bg-white/5 text-gray-700 dark:text-white/80 ring-1 ring-gray-300 dark:ring-white/15 hover:ring-gray-400'
              : 'text-white shadow-[0_10px_28px_-8px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-8px_rgba(0,0,0,0.3)]'"
            :style="isFollowing ? undefined : { background: 'linear-gradient(135deg, #1f2937, #111827)' }">
            <span class="mdi text-[16px]" :class="isFollowing ? 'mdi-check' : 'mdi-plus'"></span>
            {{ isFollowing ? 'Siguiendo' : 'Seguir' }}
          </button>
          <button type="button"
            class="w-11 h-11 rounded-full flex items-center justify-center bg-white dark:bg-white/5 ring-1 ring-gray-300 dark:ring-white/15 text-gray-700 dark:text-white/80 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
            title="Compartir perfil" aria-label="Compartir">
            <span class="mdi mdi-share-variant-outline text-[18px]"></span>
          </button>
        </div>

        <!-- Tags -->
        <div v-if="(tags.length || editable) && showTags"
          @click.stop="onSubsectionClick('tags')"
          class="flex items-center gap-1.5 mt-4 flex-wrap rounded-xl -mx-1 px-1 py-1"
          :class="[
            skin.header.align === 'center' ? 'justify-center' : '',
            subsectionClass('tags'),
            { 'opacity-40': editable && !isSubVisible('tags') },
          ]">
          <span v-for="t in tags" :key="t"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold border transition-transform hover:scale-[1.04] active:scale-95"
            :style="{
              backgroundColor: getTagStyle(t).bg,
              color: getTagStyle(t).text,
              borderColor: getTagStyle(t).border,
            }">
            <span class="mdi text-[14px]" :class="getTagStyle(t).icon"></span>
            {{ t }}
          </span>
          <span v-if="editable && !tags.length" class="text-[11px] font-semibold text-gray-400 italic">
            + añadir etiquetas
          </span>
        </div>

        <!-- Badges — premium dark chip (neutral charcoal) so honorific badges don't
             pile onto the brand accent already used by @handle and the Follow CTA -->
        <div v-if="badges.length" class="flex items-center gap-2 mt-4 flex-wrap"
          :class="skin.header.align === 'center' ? 'justify-center' : ''">
          <span v-for="(b, i) in badges" :key="i"
            class="inline-flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.1em] text-white shadow-[0_4px_14px_-4px_rgba(0,0,0,0.25)]"
            style="background: linear-gradient(135deg, #1f1f1f, #0a0a0a);">
            <span v-if="b.icon" class="mdi text-[13px]" :style="{ color: accentColor }" :class="b.icon"></span>
            <span>{{ b.label }}</span>
          </span>
        </div>

        <!-- Showcase grid: visual portfolio 2x2 (only when skin.showcase.enabled) -->
        <div v-if="showcaseGrid" class="mt-5 grid grid-cols-2 gap-2.5">
          <div v-for="(item, i) in showcaseTiles" :key="i"
            class="group/tile relative aspect-square rounded-2xl overflow-hidden bg-gray-200 dark:bg-white/10 shadow-[0_8px_24px_-10px_rgba(0,0,0,0.2)] ring-1 ring-black/5">
            <div class="absolute inset-0 bg-center bg-cover transition-transform duration-700 group-hover/tile:scale-110"
              :style="item.imageUrl ? { backgroundImage: `url('${item.imageUrl}')` } : { background: `linear-gradient(135deg, ${accentColor}33, ${accentColor}11)` }"></div>
            <div class="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <p v-if="item.label || item.storeName"
              class="absolute inset-x-0 bottom-0 p-3 text-white text-[12px] font-black tracking-tight leading-tight line-clamp-2 drop-shadow">
              {{ item.label || item.storeName }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
