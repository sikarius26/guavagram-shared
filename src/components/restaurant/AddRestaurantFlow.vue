<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { notifier } from '~/services/notification'

const { t } = useI18n()
import { useCelebrate } from '~/composables/useCelebrate'

type Step = 'search' | 'confirm' | 'success'

interface PlaceSuggestion {
  placeId: string
  name: string
  address: string
  lat?: number
  lng?: number
  phone?: string
  hours?: string
  category?: string
}

const emit = defineEmits<{
  (e: 'created', payload: { restaurantId: string; slug: string }): void
  (e: 'cancelled'): void
}>()

const step = ref<Step>('search')

// ═══ Search state ═══
const query = ref('')
const suggestions = ref<PlaceSuggestion[]>([])
const searching = ref(false)
const searchError = ref('')
let searchDebounce: ReturnType<typeof setTimeout> | null = null

watch(query, (q) => {
  if (searchDebounce) clearTimeout(searchDebounce)
  if (q.trim().length < 3) {
    suggestions.value = []
    return
  }
  searching.value = true
  searchError.value = ''
  searchDebounce = setTimeout(() => runSearch(q.trim()), 300)
})

const runSearch = async (q: string) => {
  try {
    // TODO: swap to `${config.public.apiBase}/places/autocomplete` when backend implements the proxy.
    // Must return: { suggestions: PlaceSuggestion[] }
    // Response should exclude places already in Guavagram OR flag them so UI redirects instead of creating duplicate.
    const res = await $fetch<{ suggestions: PlaceSuggestion[] }>(
      `/api/mock/places/autocomplete`,
      { params: { q } }
    ).catch(() => null)

    if (res?.suggestions) {
      suggestions.value = res.suggestions
    } else {
      // Mock fallback so UI is usable without backend
      suggestions.value = [
        { placeId: 'mock-1', name: `${q} · Restaurante`, address: 'Calle Mayor 12, Madrid', phone: '+34 91 123 4567', hours: '13:00–16:00 / 20:00–23:30', category: 'Cocina mediterránea' },
        { placeId: 'mock-2', name: `${q} Asador`, address: 'Gran Vía 45, Madrid', phone: '+34 91 234 5678', hours: '12:30–16:30 / 20:30–00:00', category: 'Asador' },
        { placeId: 'mock-3', name: `Casa ${q}`, address: 'Plaza Mayor 3, Madrid', phone: '+34 91 345 6789', hours: '13:30–17:00 / 20:00–23:00', category: 'Tapas' },
      ]
    }
  } catch {
    searchError.value = 'No pudimos buscar. Inténtalo de nuevo.'
    suggestions.value = []
  } finally {
    searching.value = false
  }
}

// ═══ Confirm state ═══
const selectedPlace = ref<PlaceSuggestion | null>(null)
const rating = ref(0)
const reviewText = ref('')
const reviewTitle = ref('')

const receiptFile = ref<File | null>(null)
const receiptPreview = ref<string | null>(null)
const placeFile = ref<File | null>(null)
const placePreview = ref<string | null>(null)

const receiptInput = ref<HTMLInputElement | null>(null)
const placePhotoInput = ref<HTMLInputElement | null>(null)

const submitting = ref(false)
const submitError = ref('')

const selectPlace = (p: PlaceSuggestion) => {
  selectedPlace.value = p
  step.value = 'confirm'
}

const backToSearch = () => {
  step.value = 'search'
  // Keep current selection so user can jump back quickly
}

const handleFile = (kind: 'receipt' | 'place', ev: Event) => {
  const target = ev.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    submitError.value = 'Solo se aceptan imágenes.'
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    submitError.value = 'Máximo 10MB por imagen.'
    return
  }
  submitError.value = ''
  const url = URL.createObjectURL(file)
  if (kind === 'receipt') {
    receiptFile.value = file
    receiptPreview.value = url
  } else {
    placeFile.value = file
    placePreview.value = url
  }
}

const clearFile = (kind: 'receipt' | 'place') => {
  if (kind === 'receipt') {
    if (receiptPreview.value) URL.revokeObjectURL(receiptPreview.value)
    receiptFile.value = null; receiptPreview.value = null
    if (receiptInput.value) receiptInput.value.value = ''
  } else {
    if (placePreview.value) URL.revokeObjectURL(placePreview.value)
    placeFile.value = null; placePreview.value = null
    if (placePhotoInput.value) placePhotoInput.value.value = ''
  }
}

const canSubmit = computed(() =>
  selectedPlace.value &&
  rating.value > 0 &&
  reviewText.value.trim().length >= 10 &&
  receiptFile.value &&
  placeFile.value &&
  !submitting.value
)

const createdRestaurant = ref<{ id: string; slug: string; name: string } | null>(null)

const submit = async () => {
  if (!canSubmit.value || !selectedPlace.value) return
  submitting.value = true
  submitError.value = ''
  try {
    const form = new FormData()
    form.append('googlePlaceId', selectedPlace.value.placeId)
    form.append('name', selectedPlace.value.name)
    form.append('address', selectedPlace.value.address)
    if (selectedPlace.value.lat) form.append('lat', String(selectedPlace.value.lat))
    if (selectedPlace.value.lng) form.append('lng', String(selectedPlace.value.lng))
    if (selectedPlace.value.phone) form.append('phone', selectedPlace.value.phone)
    if (selectedPlace.value.hours) form.append('hours', selectedPlace.value.hours)
    if (selectedPlace.value.category) form.append('category', selectedPlace.value.category)
    form.append('reviewRating', String(rating.value))
    form.append('reviewTitle', reviewTitle.value.trim())
    form.append('reviewText', reviewText.value.trim())
    form.append('receipt', receiptFile.value!)
    form.append('placePhoto', placeFile.value!)

    // TODO: swap to `${config.public.apiBase}/restaurants/create-with-review` when backend is ready.
    // Expected: creates restaurant in 'unclaimed' state, creates review tied to user,
    // marks review 'verified', sets user as founding affiliate.
    // Returns { restaurantId, slug, reviewId }
    const res = await $fetch<{ restaurantId: string; slug: string; reviewId: string }>(
      `/api/mock/restaurants/create-with-review`,
      { method: 'POST', body: form }
    ).catch(() => null)

    if (!res) {
      // Mock fallback
      createdRestaurant.value = {
        id: `mock-${Date.now()}`,
        slug: selectedPlace.value.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40),
        name: selectedPlace.value.name,
      }
    } else {
      createdRestaurant.value = { id: res.restaurantId, slug: res.slug, name: selectedPlace.value.name }
      emit('created', { restaurantId: res.restaurantId, slug: res.slug })
    }
    step.value = 'success'
    useCelebrate().confetti(56, 2400)
    notifier.notifySuccess(t('restaurantAddedFoundingAffiliate'))
  } catch {
    submitError.value = 'Hubo un problema al crear el restaurante. Inténtalo de nuevo.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-[640px] mx-auto font-display">

    <!-- ═══ STEP 1: Search ═══ -->
    <div v-if="step === 'search'">
      <div class="rounded-3xl border border-[#e5e5e5] bg-white p-6 shadow-[0_4px_14px_rgba(0,0,0,0.05)]">
        <h2 class="text-[20px] font-black text-[#1a1c1b]">Añade un restaurante a Guavagram</h2>
        <p class="text-[13px] text-[#666] mt-1.5">
          Solo puedes añadir restaurantes reales dejando una reseña verificada.
          Busca el sitio — usamos Google Business para traer los datos correctos.
        </p>

        <div class="relative mt-5">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 mdi mdi-magnify text-[#999] text-lg"></span>
          <input v-model="query" type="text" placeholder="Busca por nombre y ciudad, ej: Casa Pepe Madrid"
            class="w-full rounded-xl border border-[#ddd] bg-white pl-11 pr-4 h-13 py-3.5 text-[14px] outline-none focus:border-[#ff2d23]" />
          <span v-if="searching" class="absolute right-4 top-1/2 -translate-y-1/2 mdi mdi-loading animate-spin text-[#999]"></span>
        </div>

        <div class="mt-4">
          <p v-if="query.length < 3" class="text-[12px] text-[#888] flex items-center gap-1.5">
            <span class="mdi mdi-information-outline"></span>
            Escribe al menos 3 caracteres
          </p>

          <div v-else-if="searching && !suggestions.length" class="py-6 flex items-center justify-center gap-2 text-[#888]">
            <span class="mdi mdi-loading animate-spin"></span>
            <span class="text-[13px]">Buscando en Google Business…</span>
          </div>

          <div v-else-if="suggestions.length">
            <p class="text-[11px] font-bold text-[#888] uppercase tracking-wider mb-2">Resultados Google Business</p>
            <div class="flex flex-col gap-2">
              <button v-for="p in suggestions" :key="p.placeId" type="button" @click="selectPlace(p)"
                class="text-left group flex items-start gap-3 p-3.5 rounded-xl border border-[#e5e5e5] hover:border-[#ff2d23] hover:bg-[#fff5f2] transition-all">
                <div class="w-10 h-10 rounded-xl bg-[#f5f5f5] group-hover:bg-white flex items-center justify-center shrink-0 transition-colors">
                  <span class="mdi mdi-silverware-fork-knife text-[#ff2d23] text-lg"></span>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-[14px] font-bold text-[#1a1c1b] truncate">{{ p.name }}</p>
                  <p class="text-[12px] text-[#666] truncate">{{ p.address }}</p>
                  <p v-if="p.category" class="text-[11px] text-[#888] mt-0.5">{{ p.category }}</p>
                </div>
                <span class="mdi mdi-chevron-right text-[#999] text-xl"></span>
              </button>
            </div>
          </div>

          <div v-else-if="query.length >= 3 && !searching" class="py-6 text-center">
            <p class="text-[13px] text-[#666]">No encontramos resultados.</p>
            <p class="text-[11px] text-[#888] mt-1">Revisa el nombre o contáctanos si crees que es un error.</p>
          </div>

          <p v-if="searchError" class="mt-3 text-[12px] text-[#b91c1c] flex items-center gap-1.5">
            <span class="mdi mdi-alert-circle-outline"></span> {{ searchError }}
          </p>
        </div>
      </div>

      <button type="button" @click="emit('cancelled')" class="mt-4 text-[12px] text-[#888] font-semibold hover:text-[#1a1c1b]">
        ← Cancelar
      </button>
    </div>

    <!-- ═══ STEP 2: Confirm + review + verify ═══ -->
    <div v-else-if="step === 'confirm' && selectedPlace">
      <button type="button" @click="backToSearch" class="flex items-center gap-1.5 text-[12px] text-[#888] font-semibold hover:text-[#1a1c1b] mb-3">
        <span class="mdi mdi-arrow-left"></span> Cambiar restaurante
      </button>

      <!-- Pre-filled Google data -->
      <div class="rounded-3xl border border-[#e5e5e5] bg-white p-6 shadow-[0_4px_14px_rgba(0,0,0,0.05)]">
        <div class="flex items-start gap-3 mb-4 pb-4 border-b border-[#eee]">
          <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-[#ff2d23] to-[#ff6b4a] flex items-center justify-center shrink-0">
            <span class="mdi mdi-silverware-fork-knife text-white text-xl"></span>
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="text-[18px] font-black text-[#1a1c1b] leading-tight">{{ selectedPlace.name }}</h3>
            <p class="text-[12px] text-[#666] mt-1 flex items-center gap-1.5">
              <span class="mdi mdi-map-marker-outline"></span>{{ selectedPlace.address }}
            </p>
            <div class="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[11px] text-[#888]">
              <span v-if="selectedPlace.phone" class="flex items-center gap-1"><span class="mdi mdi-phone-outline"></span>{{ selectedPlace.phone }}</span>
              <span v-if="selectedPlace.hours" class="flex items-center gap-1"><span class="mdi mdi-clock-outline"></span>{{ selectedPlace.hours }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-start gap-2 p-3 rounded-xl bg-[#fff5f2] border border-[#ffd7d3] text-[11.5px] text-[#92400e] mb-5">
          <span class="mdi mdi-information-outline text-base shrink-0 text-[#ff2d23]"></span>
          <span>Este restaurante aún no está en Guavagram. Al publicar tu reseña verificada se creará con estado <b>no reclamado</b>. Tú serás <b>founding affiliate</b>.</span>
        </div>

        <!-- Review form -->
        <label class="block text-[13px] font-bold text-[#1a1c1b] mb-2">Tu valoración</label>
        <div class="flex gap-1.5 mb-4">
          <button v-for="s in 5" :key="s" type="button" @click="rating = s" class="transition-transform hover:scale-110">
            <span class="mdi text-[30px]" :class="s <= rating ? 'mdi-star text-[#f59e0b]' : 'mdi-star-outline text-[#ddd]'"></span>
          </button>
        </div>

        <input v-model="reviewTitle" type="text" placeholder="Título de tu opinión (opcional)"
          class="w-full rounded-xl border border-[#ddd] bg-[#fafafa] px-4 h-12 text-[14px] outline-none focus:border-[#ff2d23] mb-3" />
        <textarea v-model="reviewText" rows="4" placeholder="Cuenta tu experiencia… (mínimo 10 caracteres)"
          class="w-full rounded-xl border border-[#ddd] bg-[#fafafa] px-4 py-3 text-[14px] outline-none focus:border-[#ff2d23] resize-none mb-5"></textarea>

        <!-- Verification uploads (mandatory for creation) -->
        <div class="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-4 mb-4">
          <div class="flex items-center gap-2 mb-1">
            <span class="mdi mdi-shield-check text-[#16a34a] text-lg"></span>
            <p class="text-[13px] font-bold text-[#1a1c1b]">Verificación obligatoria</p>
          </div>
          <p class="text-[11px] text-[#666] mb-3">Para crear un restaurante necesitamos prueba de que estuviste allí.</p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label class="block">
              <input ref="receiptInput" type="file" accept="image/*" class="sr-only" @change="handleFile('receipt', $event)" />
              <div class="relative rounded-xl border-2 border-dashed transition-all cursor-pointer min-h-[130px] flex items-center justify-center p-3 bg-white"
                :class="receiptPreview ? 'border-[#16a34a]' : 'border-[#ddd] hover:border-[#ff2d23]'">
                <template v-if="receiptPreview">
                  <img :src="receiptPreview" alt="Recibo" class="max-h-[110px] rounded-md object-contain" />
                  <button type="button" @click.prevent.stop="clearFile('receipt')"
                    class="absolute top-2 right-2 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center hover:bg-[#fee2e2]">
                    <span class="mdi mdi-close text-[#666] text-sm"></span>
                  </button>
                </template>
                <template v-else>
                  <div class="text-center">
                    <span class="mdi mdi-receipt-text-outline text-[#ff2d23] text-[28px]"></span>
                    <p class="text-[12px] font-bold text-[#1a1c1b] mt-0.5">Recibo</p>
                  </div>
                </template>
              </div>
            </label>

            <label class="block">
              <input ref="placePhotoInput" type="file" accept="image/*" capture="environment" class="sr-only" @change="handleFile('place', $event)" />
              <div class="relative rounded-xl border-2 border-dashed transition-all cursor-pointer min-h-[130px] flex items-center justify-center p-3 bg-white"
                :class="placePreview ? 'border-[#16a34a]' : 'border-[#ddd] hover:border-[#ff2d23]'">
                <template v-if="placePreview">
                  <img :src="placePreview" alt="Foto local" class="max-h-[110px] rounded-md object-contain" />
                  <button type="button" @click.prevent.stop="clearFile('place')"
                    class="absolute top-2 right-2 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center hover:bg-[#fee2e2]">
                    <span class="mdi mdi-close text-[#666] text-sm"></span>
                  </button>
                </template>
                <template v-else>
                  <div class="text-center">
                    <span class="mdi mdi-camera-outline text-[#ff2d23] text-[28px]"></span>
                    <p class="text-[12px] font-bold text-[#1a1c1b] mt-0.5">Foto del lugar</p>
                  </div>
                </template>
              </div>
            </label>
          </div>
        </div>

        <div v-if="submitError" class="mb-3 flex items-start gap-2 p-3 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-[12px] text-[#b91c1c]">
          <span class="mdi mdi-alert-circle-outline text-base shrink-0"></span>
          <span>{{ submitError }}</span>
        </div>

        <button type="button" @click="submit" :disabled="!canSubmit"
          class="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-gradient-to-br from-[#ff2d23] to-[#ff6b4a] text-white font-bold text-[13px] shadow-[0_6px_16px_rgba(255,45,35,0.25)] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_8px_20px_rgba(255,45,35,0.35)] transition-all">
          <span v-if="submitting" class="mdi mdi-loading animate-spin text-base"></span>
          <span v-else class="mdi mdi-shield-check text-base"></span>
          {{ submitting ? 'Creando restaurante…' : 'Publicar reseña y crear restaurante' }}
        </button>
      </div>
    </div>

    <!-- ═══ STEP 3: Success ═══ -->
    <div v-else-if="step === 'success' && createdRestaurant" class="rounded-3xl border border-[#e5e5e5] bg-white p-10 shadow-[0_4px_14px_rgba(0,0,0,0.05)] text-center">
      <div class="w-20 h-20 mx-auto mb-5 rounded-full bg-[#dcfce7] flex items-center justify-center">
        <span class="mdi mdi-check-decagram text-[#16a34a] text-[44px]"></span>
      </div>
      <h2 class="text-[22px] font-black text-[#1a1c1b]">¡Restaurante añadido!</h2>
      <p class="text-[13px] text-[#666] mt-2">
        <b>{{ createdRestaurant.name }}</b> ya está en Guavagram con tu reseña verificada.
      </p>
      <div class="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#fff5f2] border border-[#ffd7d3]">
        <span class="mdi mdi-crown-outline text-[#ff2d23]"></span>
        <span class="text-[12px] font-bold text-[#1a1c1b]">Eres founding affiliate</span>
      </div>
      <p class="text-[11px] text-[#888] mt-3">Cuando alguien descubra el restaurante por tu link, ganas GP y comisión.</p>
      <div class="mt-6 flex items-center justify-center gap-3">
        <NuxtLink :to="`/r/${createdRestaurant.slug}`"
          class="px-5 py-2.5 bg-gradient-emerald text-white rounded-xl font-bold text-[12px] shadow-pill-emerald">
          Ver perfil
        </NuxtLink>
        <button type="button" @click="emit('cancelled')"
          class="px-5 py-2.5 border border-[#ddd] text-[#555] rounded-xl font-semibold text-[12px] hover:bg-[#f5f5f5]">
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>
