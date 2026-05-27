<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const props = withDefaults(defineProps<{
  apiKey: string
  placeholder?: string
  types?: string[]
}>(), {
  placeholder: 'Buscar…',
  types: () => ['establishment']
})
const emit = defineEmits<{
  select: [placeId: string, label: string, address: string]
  error: [message: string]
}>()

interface Suggestion {
  placeId: string
  mainText: string
  secondaryText: string
}

const query = ref('')
const suggestions = ref<Suggestion[]>([])
const isOpen = ref(false)
const isLoaded = ref(false)
const selectedLabel = ref('')
// User-facing failure message (referrer-blocked key, API not enabled, offline…).
// Surfaced inline so the search never dies silently; parents also get @error.
const loadError = ref('')

let debounceTimer: ReturnType<typeof setTimeout> | null = null

const loadGoogleMaps = async () => {
  if ((window as any).google?.maps?.places?.AutocompleteSuggestion) {
    isLoaded.value = true
    return
  }
  if ((window as any).google?.maps) {
    await (window as any).google.maps.importLibrary('places')
    isLoaded.value = true
    return
  }
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${props.apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = async () => {
      try {
        await (window as any).google.maps.importLibrary('places')
        isLoaded.value = true
        resolve()
      } catch (e) {
        reject(e)
      }
    }
    script.onerror = () => reject(new Error('Failed to load Google Maps'))
    document.head.appendChild(script)
  })
}

const fetchSuggestions = async (input: string) => {
  if (!input.trim()) {
    suggestions.value = []
    return
  }
  loadError.value = ''
  try {
    if (!isLoaded.value) await loadGoogleMaps()
    const { AutocompleteSuggestion } = await (window as any).google.maps.importLibrary('places')
    const response = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
      input,
      includedPrimaryTypes: props.types
    })
    suggestions.value = (response.suggestions ?? [])
      .filter((s: any) => s.placePrediction !== null)
      .map((s: any) => ({
        placeId: s.placePrediction.placeId,
        mainText: s.placePrediction.mainText?.text ?? '',
        secondaryText: s.placePrediction.secondaryText?.text ?? ''
      }))
    isOpen.value = suggestions.value.length > 0
  } catch (e) {
    console.error('Places autocomplete failed', e)
    suggestions.value = []
    isOpen.value = false
    // A referrer-restricted API key returns 403 "Requests from referer … are
    // blocked" — not actionable from the UI, so steer the user to manual entry.
    const raw = (e as any)?.message ?? String(e)
    const blocked = /blocked|referer|referrer|forbidden|403|api(?:targetblocked|notactivated)/i.test(raw)
    loadError.value = blocked
      ? 'La búsqueda de Google Maps no está disponible ahora mismo. Introduce tu restaurante manualmente.'
      : 'No se pudo cargar la búsqueda. Inténtalo de nuevo o introduce los datos manualmente.'
    emit('error', loadError.value)
  }
}

watch(query, (val) => {
  selectedLabel.value = ''
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchSuggestions(val), 350)
})

const onSelect = (s: Suggestion) => {
  selectedLabel.value = `${s.mainText} — ${s.secondaryText}`
  query.value = selectedLabel.value
  isOpen.value = false
  emit('select', s.placeId, s.mainText, s.secondaryText)
}

// setTimeout no está expuesto en el contexto del template — usarlo inline
// (@blur="setTimeout(...)") explota con "_ctx.setTimeout is not a function".
// Delay para que el click en la sugerencia se procese antes de cerrar.
const onBlur = () => {
  setTimeout(() => { isOpen.value = false }, 200)
}

onMounted(() => { loadGoogleMaps().catch(() => {}) })
</script>

<template>
  <div class="relative w-full">
    <div class="relative group">
      <input v-model="query" type="text"
        :placeholder="placeholder"
        @focus="isOpen = suggestions.length > 0"
        @blur="onBlur"
        class="form-input w-full rounded-xl border border-gray-200 bg-gray-50 dark:bg-white/5 dark:border-white/10 px-4 h-12 text-base outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-gray-400 text-text-main" />
      <span class="mdi mdi-magnify absolute right-3 top-3 text-gray-400 group-focus-within:text-emerald-600 transition-colors"></span>
    </div>
    <p v-if="loadError" class="mt-2 flex items-start gap-1.5 text-[12px] text-amber-700 dark:text-amber-400">
      <span class="mdi mdi-alert-outline text-sm shrink-0 mt-px"></span>
      <span>{{ loadError }}</span>
    </p>
    <div v-if="isOpen && suggestions.length"
      class="absolute z-20 mt-2 w-full bg-white dark:bg-[#2a2a2a] rounded-xl border border-gray-200 dark:border-white/10 shadow-lg max-h-72 overflow-auto">
      <button v-for="s in suggestions" :key="s.placeId" type="button"
        @mousedown.prevent="onSelect(s)"
        class="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-100 dark:border-white/5 last:border-0">
        <div class="font-medium text-sm text-text-main">{{ s.mainText }}</div>
        <div class="text-xs text-text-secondary">{{ s.secondaryText }}</div>
      </button>
    </div>
  </div>
</template>
