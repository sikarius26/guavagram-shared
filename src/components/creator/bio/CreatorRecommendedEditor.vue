<script setup lang="ts">
import { ref, computed, watchEffect, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import Modal from '~/components/global/Modal.vue'
import { useCreatorBio } from '~/composables/useCreatorBio'
import { getMockPublicStoreCoupon } from '~/services/apis/mocks/creatorMarketplace.mock'
import { notifier } from '~/services/notification'

const { t } = useI18n()

interface GuavagramResult {
  storeId: string
  slugName: string
  googlePlaceId?: string
  name: string
  city: string
  address: string
  category?: string
  rating?: number
  reviewCount?: number
  logoUrl?: string
  coverUrl?: string
}

interface GoogleResult {
  placeId: string
  name: string
  address: string
  city?: string
  category?: string
  photoUrl?: string
}

type CouponSource = 'match' | 'public'
interface ResolvedCoupon {
  source: CouponSource
  code: string
  percentOff?: number
  flatOffCents?: number
  description?: string
}

const bio = useCreatorBio()
const { recommended, discountCodes, addRecommended, removeRecommended, reorderRecommended } = bio

// Single source of truth: the coupon is owned by the restaurant — either as a
// match-only code (B2B offer the restaurant sent to this creator) or as a
// public coupon the restaurant has exposed on Guavagram. The creator cannot
// invent codes here.
const resolveCoupon = (storeId: string | undefined): ResolvedCoupon | null => {
  if (!storeId) return null
  const match = discountCodes.value.get(storeId)
  if (match?.code) {
    return {
      source: 'match',
      code: match.code,
      percentOff: match.percentOff,
      flatOffCents: match.flatOffCents,
      description: match.description,
    }
  }
  if (import.meta.dev) {
    const pub = getMockPublicStoreCoupon(storeId)
    if (pub) {
      return {
        source: 'public',
        code: pub.code,
        percentOff: pub.percentOff,
        flatOffCents: pub.flatOffCents,
        description: pub.description,
      }
    }
  }
  return null
}

// Keep mirrored discount fields on each recommended record in sync with the
// authoritative coupon source. Public renderer reads these flat fields.
watchEffect(() => {
  let changed = false
  const next = recommended.value.map(r => {
    const resolved = resolveCoupon(r.storeId)
    const code = resolved?.code
    const percent = resolved?.percentOff
    const label = resolved?.description ?? (resolved?.percentOff ? `${resolved.percentOff}% OFF` : undefined)
    if (
      r.discountCode !== code ||
      r.discountPercent !== percent ||
      r.discountLabel !== label
    ) {
      changed = true
      return { ...r, discountCode: code, discountPercent: percent, discountLabel: label } as any
    }
    return r
  })
  if (changed) recommended.value = next as any
})

// Picker (Guavagram + Google search, mirrors WishlistStorePicker)
const showPicker = ref(false)
const query = ref('')
const guavagramResults = ref<GuavagramResult[]>([])
const googleResults = ref<GoogleResult[]>([])
const isLoading = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

const filteredGoogleResults = computed(() => {
  const guavaIds = new Set(guavagramResults.value.map(g => g.googlePlaceId).filter(Boolean) as string[])
  const guavaKeys = new Set(guavagramResults.value.map(g => normalize(g.name + g.city)))
  return googleResults.value.filter(gp =>
    !guavaIds.has(gp.placeId) &&
    !guavaKeys.has(normalize(gp.name + (gp.city ?? '')))
  )
})

const hasAnyResult = computed(() =>
  guavagramResults.value.length > 0 || filteredGoogleResults.value.length > 0
)

const existingStoreIds = computed(() =>
  new Set(recommended.value.map(r => r.storeId).filter(Boolean) as string[]),
)
const existingPlaceIds = computed(() =>
  new Set(
    recommended.value
      .map(r => (r as any).googlePlaceId)
      .filter(Boolean) as string[],
  ),
)

const runSearch = async (q: string) => {
  if (q.trim().length < 2) {
    guavagramResults.value = []
    googleResults.value = []
    return
  }
  isLoading.value = true
  try {
    const [guava, google] = await Promise.all([
      fetch('/api/mock/store/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      }).then(r => r.ok ? r.json() : { items: [] }).catch(() => ({ items: [] })),
      fetch(`/api/mock/places/autocomplete?q=${encodeURIComponent(q)}`)
        .then(r => r.ok ? r.json() : { suggestions: [] }).catch(() => ({ suggestions: [] })),
    ])
    guavagramResults.value = (guava.items ?? []) as GuavagramResult[]
    googleResults.value = (google.suggestions ?? []) as GoogleResult[]
  } finally {
    isLoading.value = false
  }
}

const onQueryInput = (val: string) => {
  query.value = val
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => runSearch(val), 280)
}

onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})

const openPicker = () => {
  showPicker.value = true
  query.value = ''
  guavagramResults.value = []
  googleResults.value = []
}

const pickGuavagram = (r: GuavagramResult) => {
  if (r.storeId && existingStoreIds.value.has(r.storeId)) {
    notifier.notifyWarning(t('alreadyInRecommended'))
    return
  }
  const resolved = resolveCoupon(r.storeId)
  addRecommended({
    userProfileStoreId: undefined,
    storeId: r.storeId,
    slugName: r.slugName,
    name: r.name,
    logoUrl: r.logoUrl,
    coverUrl: r.coverUrl,
    weight: recommended.value.length,
    personalPick: false,
    personalNotes: undefined,
    category: r.category,
    badges: undefined,
    discountCode: resolved?.code,
    discountPercent: resolved?.percentOff,
    discountLabel: resolved?.description ?? (resolved?.percentOff ? `${resolved.percentOff}% OFF` : undefined),
    personalQuote: undefined,
  } as any)
  showPicker.value = false
}

const pickGoogle = (g: GoogleResult) => {
  if (g.placeId && existingPlaceIds.value.has(g.placeId)) {
    notifier.notifyWarning(t('alreadyInRecommended'))
    return
  }
  // Restaurant is on Google but not in Guavagram → no coupon possible.
  addRecommended({
    userProfileStoreId: undefined,
    storeId: undefined,
    googlePlaceId: g.placeId,
    slugName: undefined,
    name: g.name,
    logoUrl: g.photoUrl,
    coverUrl: g.photoUrl,
    weight: recommended.value.length,
    personalPick: false,
    personalNotes: undefined,
    category: g.category,
    badges: undefined,
    discountCode: undefined,
    discountPercent: undefined,
    discountLabel: undefined,
    personalQuote: undefined,
  } as any)
  showPicker.value = false
}

const updateQuote = (storeId: string | undefined, value: string) => {
  if (!storeId) return
  const idx = recommended.value.findIndex(r => r.storeId === storeId)
  if (idx < 0) return
  const updated: any = { ...recommended.value[idx], personalQuote: value }
  const arr = [...recommended.value]
  arr[idx] = updated
  recommended.value = arr
}

const removeItem = (r: any) => {
  if (r.storeId) removeRecommended(r.storeId)
  else recommended.value = recommended.value.filter(x => x !== r) as any
}

const couponInfo = (storeId: string | undefined) => resolveCoupon(storeId)

const moveUp = (idx: number) => reorderRecommended(idx, idx - 1)
const moveDown = (idx: number) => reorderRecommended(idx, idx + 1)
</script>

<template>
  <div class="space-y-4">
    <!-- Empty -->
    <div v-if="recommended.length === 0" class="rounded-2xl border-2 border-dashed border-[#ddd] bg-[#fafafa] p-8 text-center">
      <span class="mdi mdi-playlist-star text-4xl text-[#ccc]"></span>
      <p class="mt-2 text-[13px] font-semibold text-[#888]">Añade tus restaurantes favoritos</p>
      <button type="button" @click="openPicker"
        class="mt-4 inline-flex items-center gap-2 h-11 px-5 rounded-xl text-[13px] font-bold text-white bg-gradient-primary hover:bg-gradient-primary-hover shadow-pill-primary transition-all">
        <span class="mdi mdi-plus"></span> Añadir restaurante
      </button>
    </div>

    <template v-else>
      <div class="space-y-3">
        <div v-for="(r, idx) in recommended" :key="(r.storeId ?? r.slugName ?? idx) + ''"
          class="rounded-2xl border border-[#e5e5e5] bg-white p-3 shadow-sm">

          <div class="flex gap-2.5 items-start">
            <!-- Reorder column -->
            <div class="flex flex-col items-center bg-[#fafafa] rounded-lg overflow-hidden shrink-0">
              <button type="button" @click="moveUp(idx)" :disabled="idx === 0"
                class="w-7 h-7 text-[#888] hover:text-[#1a1c1b] hover:bg-[#eee] flex items-center justify-center transition-colors disabled:opacity-25 disabled:cursor-not-allowed">
                <span class="mdi mdi-chevron-up text-base"></span>
              </button>
              <div class="w-full h-[1px] bg-[#e0e0e0]"></div>
              <button type="button" @click="moveDown(idx)" :disabled="idx === recommended.length - 1"
                class="w-7 h-7 text-[#888] hover:text-[#1a1c1b] hover:bg-[#eee] flex items-center justify-center transition-colors disabled:opacity-25 disabled:cursor-not-allowed">
                <span class="mdi mdi-chevron-down text-base"></span>
              </button>
            </div>

            <!-- Logo -->
            <div v-if="r.logoUrl" class="w-11 h-11 rounded-xl bg-center bg-cover shrink-0 border border-[#eee]"
              :style="{ backgroundImage: `url('${r.logoUrl}')` }"></div>
            <div v-else class="w-11 h-11 rounded-xl bg-[#f5f5f5] flex items-center justify-center shrink-0">
              <span class="mdi mdi-silverware-fork-knife text-[#bbb]"></span>
            </div>

            <!-- Name + actions -->
            <div class="flex-1 min-w-0 flex items-center gap-1.5">
              <h4 class="font-bold text-[14px] text-[#1a1c1b] truncate flex-1">{{ r.name }}</h4>
              <button type="button" @click="removeItem(r)"
                class="shrink-0 w-8 h-8 rounded-lg text-[#999] hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors" title="Quitar">
                <span class="mdi mdi-delete-outline text-sm"></span>
              </button>
            </div>
          </div>

          <!-- Coupon status (read-only, derived from restaurant) -->
          <div class="mt-2.5">
            <div v-if="couponInfo(r.storeId)" class="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
              <span class="mdi mdi-ticket-percent text-emerald-600 text-[16px] shrink-0"></span>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="font-mono font-bold text-[12px] text-emerald-800 truncate">{{ couponInfo(r.storeId)!.code }}</span>
                  <span v-if="couponInfo(r.storeId)!.percentOff" class="text-[11px] font-bold text-emerald-700">-{{ couponInfo(r.storeId)!.percentOff }}%</span>
                  <span v-else-if="couponInfo(r.storeId)!.flatOffCents" class="text-[11px] font-bold text-emerald-700">-{{ ((couponInfo(r.storeId)!.flatOffCents ?? 0) / 100).toFixed(0) }}€</span>
                </div>
                <p class="text-[10px] text-emerald-700/80 mt-0.5">
                  <span v-if="couponInfo(r.storeId)!.source === 'match'">Te lo envió el restaurante</span>
                  <span v-else>Cupón público en Guavagram</span>
                </p>
              </div>
            </div>
            <div v-else class="flex items-center gap-2 rounded-xl border border-[#eee] bg-[#fafafa] px-3 py-2">
              <span class="mdi mdi-ticket-outline text-[#aaa] text-[16px] shrink-0"></span>
              <p class="text-[11px] text-[#888] leading-tight">
                <span class="font-semibold text-[#666]">Sin cupón.</span>
                <span v-if="(r as any).googlePlaceId && !r.storeId">Este lugar aún no está en Guavagram.</span>
                <span v-else>El restaurante puede activar uno desde su panel o enviarte un código de match.</span>
              </p>
            </div>
          </div>

          <!-- Quote input -->
          <input :value="r.personalQuote ?? ''"
            @input="updateQuote(r.storeId, ($event.target as HTMLInputElement).value)"
            type="text" placeholder="Tu frase o recomendación personal"
            class="mt-2.5 w-full rounded-xl border border-[#ddd] bg-[#fafafa] px-3 h-10 text-[13px] outline-none focus:border-primary" />
        </div>
      </div>

      <!-- Add more CTA -->
      <button type="button" @click="openPicker"
        class="w-full h-12 rounded-xl border-2 border-dashed border-[#ddd] text-[13px] font-bold text-[#888] hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50/40 transition-all">
        <span class="mdi mdi-plus mr-1"></span> Añadir otro restaurante
      </button>
    </template>

    <!-- Picker modal: Guavagram + Google search -->
    <Modal v-model="showPicker" title="Añadir a recomendados" max-width="max-w-lg">
      <div class="p-4">
        <div class="relative mb-3">
          <input
            :value="query"
            @input="onQueryInput(($event.target as HTMLInputElement).value)"
            type="text"
            placeholder="Busca un restaurante por nombre o ciudad..."
            autofocus
            class="w-full rounded-xl border border-[#ddd] bg-white pl-10 pr-3 h-11 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
          <span class="mdi mdi-magnify absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa] text-[16px]"></span>
          <span v-if="isLoading" class="mdi mdi-loading animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-[#888] text-[14px]"></span>
        </div>

        <div class="max-h-[55vh] overflow-y-auto -mx-1">
          <!-- Empty / hint -->
          <div v-if="!query.trim()" class="p-6 text-center">
            <span class="mdi mdi-silverware-fork-knife text-[#ddd] text-[36px]"></span>
            <p class="text-[12px] text-[#888] mt-2">Empieza a escribir para buscar</p>
            <p class="text-[11px] text-[#aaa] mt-1">Primero los que están en Guavagram, luego Google</p>
          </div>

          <div v-else-if="query.trim().length < 2" class="p-6 text-center">
            <p class="text-[12px] text-[#888]">Escribe al menos 2 letras…</p>
          </div>

          <div v-else-if="!isLoading && !hasAnyResult" class="p-6 text-center">
            <span class="mdi mdi-map-marker-question-outline text-[#ddd] text-[36px]"></span>
            <p class="text-[12px] text-[#888] mt-2">Sin resultados para "{{ query }}"</p>
          </div>

          <!-- Guavagram section -->
          <div v-if="guavagramResults.length" class="rounded-xl overflow-hidden border border-emerald-100 bg-emerald-50/30 mb-2">
            <div class="px-3 py-2 bg-emerald-50/60 flex items-center gap-2">
              <span class="size-4 rounded-full bg-emerald-500 flex items-center justify-center">
                <span class="mdi mdi-check text-white text-[10px]"></span>
              </span>
              <p class="text-[10px] font-black text-emerald-700 uppercase tracking-[0.15em]">En Guavagram</p>
              <span class="text-[10px] text-emerald-600 ml-auto">{{ guavagramResults.length }} {{ guavagramResults.length === 1 ? 'resultado' : 'resultados' }}</span>
            </div>
            <button v-for="r in guavagramResults" :key="r.storeId"
              type="button" @click="pickGuavagram(r)"
              :disabled="!!(r.storeId && existingStoreIds.has(r.storeId))"
              class="w-full flex items-center gap-3 p-3 hover:bg-emerald-50/60 border-t border-emerald-100/60 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed">
              <div class="size-12 rounded-xl bg-center bg-cover bg-[#f5f5f5] shrink-0 ring-1 ring-emerald-200"
                :style="r.logoUrl ? { backgroundImage: `url('${r.logoUrl}')` } : {}"></div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1.5 mb-0.5">
                  <p class="text-[13px] font-black text-[#1a1c1b] truncate">{{ r.name }}</p>
                  <span v-if="r.rating" class="shrink-0 inline-flex items-center gap-0.5 text-[10px] font-black text-amber-600">
                    <span class="mdi mdi-star text-[11px]"></span>{{ r.rating.toFixed(1) }}
                  </span>
                </div>
                <p class="text-[11px] text-[#888] truncate">
                  <span class="mdi mdi-map-marker text-[11px]"></span>
                  {{ r.city }}<span v-if="r.category"> · {{ r.category }}</span>
                </p>
              </div>
              <span v-if="r.storeId && existingStoreIds.has(r.storeId)" class="text-[10px] font-bold text-emerald-700 uppercase shrink-0">Añadido</span>
              <span v-else class="mdi mdi-plus-circle text-emerald-600 text-[18px] shrink-0"></span>
            </button>
          </div>

          <!-- Google section -->
          <div v-if="filteredGoogleResults.length" class="rounded-xl overflow-hidden border border-[#eee] bg-white">
            <div class="px-3 py-2 bg-[#fafafa] flex items-center gap-2">
              <span class="size-4 rounded-full bg-[#4285F4] flex items-center justify-center">
                <span class="mdi mdi-google text-white text-[9px]"></span>
              </span>
              <p class="text-[10px] font-black text-[#666] uppercase tracking-[0.15em]">En Google Business</p>
              <span class="text-[10px] text-[#888] ml-auto">Aún no en Guavagram · sin cupón</span>
            </div>
            <button v-for="g in filteredGoogleResults" :key="g.placeId"
              type="button" @click="pickGoogle(g)"
              :disabled="!!(g.placeId && existingPlaceIds.has(g.placeId))"
              class="w-full flex items-center gap-3 p-3 hover:bg-[#fafafa] border-t border-[#f5f5f5] transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed">
              <div class="size-12 rounded-xl bg-center bg-cover bg-[#f5f5f5] shrink-0 ring-1 ring-[#eee]"
                :style="g.photoUrl ? { backgroundImage: `url('${g.photoUrl}')` } : {}"></div>
              <div class="flex-1 min-w-0">
                <p class="text-[13px] font-black text-[#1a1c1b] truncate">{{ g.name }}</p>
                <p class="text-[11px] text-[#888] truncate">
                  <span class="mdi mdi-map-marker text-[11px]"></span>
                  {{ g.address }}
                </p>
              </div>
              <span v-if="g.placeId && existingPlaceIds.has(g.placeId)" class="text-[10px] font-bold text-[#666] uppercase shrink-0">Añadido</span>
              <span v-else class="mdi mdi-plus-circle-outline text-[#888] text-[18px] shrink-0"></span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>
