<script setup lang="ts">
import { ref, watch, computed, onBeforeUnmount } from 'vue'

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

interface WishlistPickerSelection {
  source: 'guavagram' | 'google' | 'manual'
  storeId?: string
  googlePlaceId?: string
  slugName?: string
  name: string
  city?: string
  address?: string
  category?: string
  rating?: number
  imageUrl?: string
}

const emit = defineEmits<{
  (e: 'select', item: WishlistPickerSelection): void
  (e: 'cancel'): void
}>()

const query = ref('')
const guavagramResults = ref<GuavagramResult[]>([])
const googleResults = ref<GoogleResult[]>([])
const isLoading = ref(false)
const manualOpen = ref(false)
const manualName = ref('')
const manualCity = ref('')

let debounceTimer: ReturnType<typeof setTimeout> | null = null

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

// Dedup: if a Google place has the same googlePlaceId as an already-matched
// Guavagram store, hide it from the Google section. Also dedup by normalized
// name+city as a fallback (Google returns placeholders).
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

watch(query, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => runSearch(val), 280)
})

onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})

const selectGuavagram = (r: GuavagramResult) => {
  emit('select', {
    source: 'guavagram',
    storeId: r.storeId,
    googlePlaceId: r.googlePlaceId,
    slugName: r.slugName,
    name: r.name,
    city: r.city,
    address: r.address,
    category: r.category,
    rating: r.rating,
    imageUrl: r.coverUrl || r.logoUrl,
  })
}

const selectGoogle = (g: GoogleResult) => {
  emit('select', {
    source: 'google',
    googlePlaceId: g.placeId,
    name: g.name,
    city: g.city,
    address: g.address,
    category: g.category,
    imageUrl: g.photoUrl,
  })
}

const selectManual = () => {
  const name = manualName.value.trim()
  if (!name) return
  emit('select', {
    source: 'manual',
    name,
    city: manualCity.value.trim() || undefined,
  })
}
</script>

<template>
  <div class="rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
    <!-- Header + search -->
    <div class="p-4 border-b border-[#f0f0f0] bg-[#fafafa]">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <span class="mdi mdi-magnify text-[#888] text-[16px]"></span>
          <p class="text-[13px] font-black text-[#1a1c1b]">Añadir a tu wishlist</p>
        </div>
        <button type="button" @click="emit('cancel')"
          class="size-7 rounded-lg hover:bg-white flex items-center justify-center transition-colors">
          <span class="mdi mdi-close text-[#888] text-[14px]"></span>
        </button>
      </div>
      <div class="relative">
        <input
          v-model="query"
          type="text"
          placeholder="Busca un restaurante por nombre o ciudad..."
          autofocus
          class="w-full rounded-xl border border-[#ddd] bg-white pl-10 pr-3 h-11 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
        <span class="mdi mdi-magnify absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa] text-[16px]"></span>
        <span v-if="isLoading" class="mdi mdi-loading animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-[#888] text-[14px]"></span>
      </div>
    </div>

    <!-- Results -->
    <div class="max-h-[420px] overflow-y-auto">
      <!-- Empty state -->
      <div v-if="!query.trim()" class="p-8 text-center">
        <span class="mdi mdi-silverware-fork-knife text-[#ddd] text-[42px]"></span>
        <p class="text-[12px] text-[#888] mt-2">Empieza a escribir para buscar</p>
        <p class="text-[11px] text-[#aaa] mt-1">Primero mostramos lo que está en Guavagram, luego Google</p>
      </div>

      <div v-else-if="query.trim().length < 2" class="p-6 text-center">
        <p class="text-[12px] text-[#888]">Escribe al menos 2 letras…</p>
      </div>

      <div v-else-if="!isLoading && !hasAnyResult && !manualOpen" class="p-6 text-center">
        <span class="mdi mdi-map-marker-question-outline text-[#ddd] text-[36px]"></span>
        <p class="text-[12px] text-[#888] mt-2">Sin resultados para "{{ query }}"</p>
        <button type="button" @click="manualOpen = true; manualName = query"
          class="mt-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1a1c1b] text-white text-[11px] font-black hover:bg-[#2a2a2a] transition-colors">
          <span class="mdi mdi-pencil text-[13px]"></span>
          Añadir manualmente
        </button>
      </div>

      <!-- Guavagram section -->
      <div v-if="guavagramResults.length" class="border-b border-[#f0f0f0]">
        <div class="px-4 py-2 bg-emerald-50/50 flex items-center gap-2">
          <span class="size-4 rounded-full bg-emerald-500 flex items-center justify-center">
            <span class="mdi mdi-check text-white text-[10px]"></span>
          </span>
          <p class="text-[10px] font-black text-emerald-700 uppercase tracking-[0.15em]">En Guavagram</p>
          <span class="text-[10px] text-emerald-600 ml-auto">{{ guavagramResults.length }} {{ guavagramResults.length === 1 ? 'resultado' : 'resultados' }}</span>
        </div>
        <button
          v-for="r in guavagramResults"
          :key="r.storeId"
          type="button"
          @click="selectGuavagram(r)"
          class="w-full flex items-center gap-3 p-3 hover:bg-emerald-50/30 border-b border-[#f5f5f5] last:border-b-0 transition-colors text-left">
          <div
            class="size-12 rounded-xl bg-center bg-cover bg-[#f5f5f5] shrink-0 ring-1 ring-emerald-200"
            :style="r.logoUrl ? { backgroundImage: `url('${r.logoUrl}')` } : {}">
          </div>
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
          <span class="mdi mdi-plus-circle text-emerald-600 text-[18px] shrink-0"></span>
        </button>
      </div>

      <!-- Google section -->
      <div v-if="filteredGoogleResults.length">
        <div class="px-4 py-2 bg-[#fafafa] flex items-center gap-2">
          <span class="size-4 rounded-full bg-[#4285F4] flex items-center justify-center">
            <span class="mdi mdi-google text-white text-[9px]"></span>
          </span>
          <p class="text-[10px] font-black text-[#666] uppercase tracking-[0.15em]">En Google Business</p>
          <span class="text-[10px] text-[#888] ml-auto">Aún no en Guavagram</span>
        </div>
        <button
          v-for="g in filteredGoogleResults"
          :key="g.placeId"
          type="button"
          @click="selectGoogle(g)"
          class="w-full flex items-center gap-3 p-3 hover:bg-[#fafafa] border-b border-[#f5f5f5] last:border-b-0 transition-colors text-left">
          <div
            class="size-12 rounded-xl bg-center bg-cover bg-[#f5f5f5] shrink-0 ring-1 ring-[#eee]"
            :style="g.photoUrl ? { backgroundImage: `url('${g.photoUrl}')` } : {}">
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-[13px] font-black text-[#1a1c1b] truncate">{{ g.name }}</p>
            <p class="text-[11px] text-[#888] truncate">
              <span class="mdi mdi-map-marker text-[11px]"></span>
              {{ g.address }}
            </p>
          </div>
          <span class="mdi mdi-plus-circle-outline text-[#888] text-[18px] shrink-0"></span>
        </button>
      </div>

      <!-- Manual fallback inline -->
      <div v-if="manualOpen" class="p-4 border-t border-[#f0f0f0] bg-[#fafafa]">
        <p class="text-[11px] font-black text-[#666] uppercase tracking-wider mb-2">Añadir manualmente</p>
        <div class="grid grid-cols-2 gap-2 mb-2">
          <input v-model="manualName" type="text" placeholder="Nombre del lugar"
            class="rounded-xl border border-[#ddd] bg-white px-3 h-10 text-[13px] outline-none focus:border-primary" />
          <input v-model="manualCity" type="text" placeholder="Ciudad"
            class="rounded-xl border border-[#ddd] bg-white px-3 h-10 text-[13px] outline-none focus:border-primary" />
        </div>
        <button type="button" @click="selectManual" :disabled="!manualName.trim()"
          class="w-full py-2.5 rounded-xl bg-[#1a1c1b] text-white text-[12px] font-black hover:bg-[#2a2a2a] transition-colors disabled:bg-[#ccc] disabled:cursor-not-allowed">
          Añadir a wishlist
        </button>
      </div>

      <!-- Hint to open manual entry when results exist but nothing fits -->
      <div v-if="hasAnyResult && !manualOpen" class="p-3 border-t border-[#f0f0f0] bg-[#fafafa] text-center">
        <button type="button" @click="manualOpen = true"
          class="text-[11px] text-[#666] hover:text-[#1a1c1b] font-semibold transition-colors">
          ¿No está aquí? <span class="underline">Añádelo manualmente</span>
        </button>
      </div>
    </div>
  </div>
</template>
