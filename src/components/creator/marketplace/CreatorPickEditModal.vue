<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Modal from '~/components/global/Modal.vue'
import { CreatorPickCategoryEnum } from '~/services/apis/models/creator-pick-category-enum'
import {
  CreatorPickPackageViewModel,
  emptyPickPackage,
  TIER_LABELS,
} from '~/services/apis/models/creator-pick-package-view-model'
import {
  syncLegacyPickFields,
  type CreatorPickFaqItem,
  type CreatorPickGallery,
} from '~/services/apis/models/creator-pick-view-model'
import PickPackageEditor from './PickPackageEditor.vue'
import PickFaqEditor from './PickFaqEditor.vue'
import PickRequirementsEditor from './PickRequirementsEditor.vue'

const props = defineProps<{
  modelValue: boolean
  pick?: any | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [pick: any]
}>()

interface PickForm {
  id?: string
  title: string
  shortPitch: string
  category: CreatorPickCategoryEnum
  tags: string[]
  gallery: CreatorPickGallery
  packages: CreatorPickPackageViewModel[]
  longDescription: string
  faq: CreatorPickFaqItem[]
  buyerRequirements: string[]
  active: boolean
}

const emptyForm = (): PickForm => ({
  id: undefined,
  title: '',
  shortPitch: '',
  category: CreatorPickCategoryEnum.CAMPAIGN,
  tags: [],
  gallery: { coverUrl: '', images: [], videoUrl: '' },
  packages: [emptyPickPackage('BASIC')],
  longDescription: '',
  faq: [],
  buyerRequirements: [],
  active: true,
})

const form = ref<PickForm>(emptyForm())
const step = ref(1)
const errors = ref<{ title?: string; packages?: string; cover?: string }>({})

const categoryOptions = [
  { value: CreatorPickCategoryEnum.BIO_SLOT,           label: 'Slot en bio',          icon: 'mdi-link-variant' },
  { value: CreatorPickCategoryEnum.PRINCIPAL_FEATURED, label: 'Destacado',            icon: 'mdi-star' },
  { value: CreatorPickCategoryEnum.STORY,              label: 'Story',                icon: 'mdi-movie-open-outline' },
  { value: CreatorPickCategoryEnum.VIDEO_REVIEW,       label: 'Video review',         icon: 'mdi-video-outline' },
  { value: CreatorPickCategoryEnum.CAMPAIGN,           label: 'Campaña completa',     icon: 'mdi-bullhorn-outline' },
]

const STEPS = [
  { n: 1, title: 'Esencial',           icon: 'mdi-pencil-outline' },
  { n: 2, title: 'Paquetes',           icon: 'mdi-package-variant' },
  { n: 3, title: 'Galería',            icon: 'mdi-image-multiple-outline' },
  { n: 4, title: 'Descripción y FAQ',  icon: 'mdi-text-box-outline' },
  { n: 5, title: 'Requisitos',         icon: 'mdi-clipboard-check-outline' },
]

watch(() => props.modelValue, (open) => {
  if (!open) return
  errors.value = {}
  step.value = 1
  if (props.pick) {
    // Hydrate from existing pick — migrate legacy data if packages missing.
    const legacyPackage = (): CreatorPickPackageViewModel => {
      const p = emptyPickPackage('BASIC')
      p.name = 'Pack único'
      p.priceEur = Number(props.pick?.priceEur ?? 0)
      p.deliveryDays = Number(props.pick?.durationDays ?? 30)
      p.description = props.pick?.description ?? ''
      const legacyList: string[] = props.pick?.deliverables ?? []
      if (legacyList.length > 0) {
        // Map legacy free-text deliverables into an "extra" bucket by marking stories included
        p.deliverables = p.deliverables.map(d => ({ ...d, included: d.key === 'stories' }))
      }
      return p
    }

    const hydratedPackages: CreatorPickPackageViewModel[] = Array.isArray(props.pick.packages) && props.pick.packages.length > 0
      ? props.pick.packages.map((pkg: any) => {
          const p = emptyPickPackage(pkg.tier || 'BASIC')
          Object.assign(p, pkg)
          // Ensure deliverables shape is complete (legacy mocks might have fewer entries)
          const existingByKey = new Map((pkg.deliverables || []).map((d: any) => [d.key, d]))
          p.deliverables = p.deliverables.map(d => {
            const found = existingByKey.get(d.key) as any
            return found ? { ...d, ...found } : d
          })
          return p
        })
      : [legacyPackage()]

    form.value = {
      id: props.pick.id,
      title: props.pick.title ?? '',
      shortPitch: props.pick.shortPitch ?? '',
      category: props.pick.category ?? CreatorPickCategoryEnum.CAMPAIGN,
      tags: [...(props.pick.tags ?? [])],
      gallery: {
        coverUrl: props.pick?.gallery?.coverUrl ?? props.pick?.thumbnailUrl ?? '',
        images: [...(props.pick?.gallery?.images ?? [])],
        videoUrl: props.pick?.gallery?.videoUrl ?? '',
      },
      packages: hydratedPackages,
      longDescription: props.pick.longDescription ?? props.pick.description ?? '',
      faq: (props.pick.faq ?? []).map((f: any) => ({ q: f.q ?? '', a: f.a ?? '' })),
      buyerRequirements: [...(props.pick.buyerRequirements ?? [])],
      active: props.pick.active ?? true,
    }
  } else {
    form.value = emptyForm()
  }
})

const modalTitle = computed(() => (form.value.id ? t('editPick') : t('newPickCreate')))

// ---- tags (hashtag pills) ----
const tagInput = ref('')
const addTag = () => {
  const raw = tagInput.value.trim().replace(/^#+/, '')
  if (!raw) return
  const tag = `#${raw}`
  if (!form.value.tags.includes(tag)) form.value.tags.push(tag)
  tagInput.value = ''
}
const removeTag = (t: string) => {
  form.value.tags = form.value.tags.filter(x => x !== t)
}

// ---- gallery images (max 3) ----
const newImageUrl = ref('')
const addImage = () => {
  const url = newImageUrl.value.trim()
  if (!url || (form.value.gallery.images?.length ?? 0) >= 3) return
  form.value.gallery.images = [...(form.value.gallery.images ?? []), url]
  newImageUrl.value = ''
}
const removeImage = (i: number) => {
  form.value.gallery.images = (form.value.gallery.images ?? []).filter((_, idx) => idx !== i)
}

// ---- step validation ----
const validateStep = (n: number): boolean => {
  errors.value = {}
  if (n === 1) {
    if (!form.value.title.trim()) errors.value.title = 'El título es obligatorio'
  }
  if (n === 2) {
    if (form.value.packages.length === 0) errors.value.packages = 'Activa al menos un paquete'
    else if (form.value.packages.some(p => !p.priceEur || p.priceEur <= 0)) errors.value.packages = 'Cada paquete necesita un precio mayor que 0'
  }
  if (n === 3) {
    if (!form.value.gallery.coverUrl?.trim()) errors.value.cover = 'Necesitas al menos una portada'
  }
  return Object.keys(errors.value).length === 0
}

const goNext = () => {
  if (!validateStep(step.value)) return
  if (step.value < STEPS.length) step.value++
}
const goPrev = () => { if (step.value > 1) step.value-- }
const goStep = (n: number) => {
  // Allow jumping back freely, forward only if previous steps are valid.
  if (n <= step.value) { step.value = n; return }
  for (let i = step.value; i < n; i++) if (!validateStep(i)) { step.value = i; return }
  step.value = n
}

// ---- submit ----
const onSubmit = () => {
  // Full validation across all required steps
  for (let i = 1; i <= 3; i++) if (!validateStep(i)) { step.value = i; return }
  const payload: any = {
    ...form.value,
    tags: [...form.value.tags],
    gallery: { ...form.value.gallery, images: [...(form.value.gallery.images ?? [])] },
    packages: form.value.packages.map(p => ({
      tier: p.tier,
      name: p.name,
      description: p.description,
      priceEur: Number(p.priceEur) || 0,
      deliveryDays: Number(p.deliveryDays) || 0,
      revisions: Number(p.revisions) || 0,
      deliverables: p.deliverables.map(d => ({ ...d })),
    })),
    faq: form.value.faq.filter(f => f.q.trim() || f.a.trim()),
    buyerRequirements: form.value.buyerRequirements.map(r => r.trim()).filter(Boolean),
    salesCount: props.pick?.salesCount ?? 0,
    rating: props.pick?.rating ?? 0,
  }
  syncLegacyPickFields(payload)
  emit('save', payload)
}

const onClose = () => emit('update:modelValue', false)
</script>

<template>
  <Modal
    :model-value="modelValue"
    :title="modalTitle"
    max-width="max-w-3xl"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <!-- Stepper header -->
    <div class="px-5 pt-4 pb-2 border-b border-[#f0f0f0] bg-[#fafafa]">
      <div class="flex items-center gap-1.5">
        <template v-for="(s, idx) in STEPS" :key="s.n">
          <button
            type="button"
            class="flex items-center gap-2 px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-colors"
            :class="step === s.n
              ? 'bg-[#1a1c1b] text-white'
              : step > s.n
                ? 'text-emerald-700 hover:bg-emerald-50'
                : 'text-[#888] hover:bg-white'"
            @click="goStep(s.n)"
          >
            <span
              class="w-5 h-5 inline-flex items-center justify-center rounded-full text-[10px]"
              :class="step === s.n ? 'bg-white text-[#1a1c1b]' : step > s.n ? 'bg-emerald-100 text-emerald-700' : 'bg-[#e5e5e5] text-[#888]'"
            >
              <span v-if="step > s.n" class="mdi mdi-check text-[12px]"></span>
              <span v-else>{{ s.n }}</span>
            </span>
            <span class="hidden sm:inline">{{ s.title }}</span>
          </button>
          <span v-if="idx < STEPS.length - 1" class="w-3 h-px bg-[#ddd]"></span>
        </template>
      </div>
    </div>

    <form class="p-5 flex flex-col gap-4" @submit.prevent="onSubmit">

      <!-- STEP 1: Esencial -->
      <section v-if="step === 1" class="space-y-4">
        <div>
          <label class="block text-[11px] font-bold text-[#666] uppercase tracking-[0.12em] mb-1.5">Título *</label>
          <input
            v-model="form.title"
            type="text"
            maxlength="70"
            placeholder="Ej: Reseña completa + 3 stories en destacados"
            class="w-full px-3 py-2.5 rounded-xl border text-[14px] font-bold focus:outline-none transition-colors"
            :class="errors.title ? 'border-red-300 focus:border-red-500' : 'border-[#e5e5e5] focus:border-[#1a1c1b]'"
          />
          <div class="flex items-center justify-between mt-1">
            <p class="text-[11px] text-red-600">{{ errors.title }}</p>
            <p class="text-[10px] text-[#aaa] tabular-nums">{{ form.title.length }}/70</p>
          </div>
        </div>

        <div>
          <label class="block text-[11px] font-bold text-[#666] uppercase tracking-[0.12em] mb-1.5">Pitch corto</label>
          <input
            v-model="form.shortPitch"
            type="text"
            maxlength="140"
            placeholder="Una línea que convenza al restaurante de click."
            class="w-full px-3 py-2 rounded-xl border border-[#e5e5e5] text-[13px] focus:outline-none focus:border-[#1a1c1b]"
          />
          <p class="text-[10px] text-[#aaa] tabular-nums text-right mt-1">{{ form.shortPitch.length }}/140</p>
        </div>

        <div>
          <label class="block text-[11px] font-bold text-[#666] uppercase tracking-[0.12em] mb-1.5">Tipo de servicio</label>
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <button
              v-for="opt in categoryOptions"
              :key="opt.value"
              type="button"
              class="flex flex-col items-center justify-center gap-1 px-2 py-3 rounded-xl border text-[11px] font-bold transition-colors"
              :class="form.category === opt.value
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-[#e5e5e5] bg-white text-[#555] hover:bg-[#fafafa]'"
              @click="form.category = opt.value"
            >
              <span class="mdi text-[18px]" :class="opt.icon"></span>
              <span class="text-center leading-tight">{{ opt.label }}</span>
            </button>
          </div>
        </div>

        <div>
          <label class="block text-[11px] font-bold text-[#666] uppercase tracking-[0.12em] mb-1.5">Tags de búsqueda</label>
          <div class="flex items-center gap-2 flex-wrap mb-2">
            <span
              v-for="t in form.tags"
              :key="t"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold"
            >
              {{ t }}
              <button type="button" class="mdi mdi-close text-[12px]" @click="removeTag(t)"></button>
            </span>
          </div>
          <div class="flex items-center gap-2">
            <input
              v-model="tagInput"
              type="text"
              placeholder="foodie, madrid, brunch..."
              class="flex-1 px-3 py-2 rounded-xl border border-[#e5e5e5] text-[13px] focus:outline-none focus:border-[#1a1c1b]"
              @keydown.enter.prevent="addTag"
            />
            <button
              type="button"
              class="px-3 py-2 rounded-xl text-[12px] font-bold text-emerald-700 hover:bg-emerald-50 transition-colors"
              @click="addTag"
            >
              Añadir
            </button>
          </div>
          <p class="text-[11px] text-[#888] mt-1">3–5 tags ayudan a que los restaurantes te encuentren.</p>
        </div>
      </section>

      <!-- STEP 2: Paquetes -->
      <section v-if="step === 2" class="space-y-3">
        <div class="rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-[12px] text-emerald-800">
          <span class="mdi mdi-lightbulb-on-outline mr-1"></span>
          Activa al menos un paquete. Si activas los tres, el negocio puede comparar <strong>Básico</strong> / <strong>Recomendado</strong> / <strong>Premium</strong> y pagar más por más entregables.
        </div>
        <PickPackageEditor v-model="form.packages" />
        <p v-if="errors.packages" class="text-[11px] text-red-600">{{ errors.packages }}</p>
      </section>

      <!-- STEP 3: Galería -->
      <section v-if="step === 3" class="space-y-4">
        <div>
          <label class="block text-[11px] font-bold text-[#666] uppercase tracking-[0.12em] mb-1.5">Portada *</label>
          <div class="flex items-center gap-3">
            <div class="w-28 h-20 rounded-xl bg-[#f3f3f3] overflow-hidden shrink-0 flex items-center justify-center border" :class="errors.cover ? 'border-red-300' : 'border-[#e5e5e5]'">
              <img v-if="form.gallery.coverUrl" :src="form.gallery.coverUrl" class="w-full h-full object-cover" alt="" />
              <span v-else class="mdi mdi-image-outline text-[#ccc] text-[28px]"></span>
            </div>
            <input
              v-model="form.gallery.coverUrl"
              type="url"
              placeholder="https://..."
              class="flex-1 px-3 py-2 rounded-xl border text-[13px] focus:outline-none transition-colors"
              :class="errors.cover ? 'border-red-300 focus:border-red-500' : 'border-[#e5e5e5] focus:border-[#1a1c1b]'"
            />
          </div>
          <p v-if="errors.cover" class="text-[11px] text-red-600 mt-1">{{ errors.cover }}</p>
        </div>

        <div>
          <label class="block text-[11px] font-bold text-[#666] uppercase tracking-[0.12em] mb-1.5">Imágenes adicionales (máx 3)</label>
          <div v-if="(form.gallery.images?.length ?? 0) > 0" class="grid grid-cols-3 gap-2 mb-2">
            <div
              v-for="(img, i) in form.gallery.images"
              :key="i"
              class="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#e5e5e5] bg-[#f3f3f3]"
            >
              <img :src="img" class="w-full h-full object-cover" alt="" />
              <button
                type="button"
                class="absolute top-1.5 right-1.5 w-6 h-6 inline-flex items-center justify-center rounded-full bg-white/90 backdrop-blur text-[#555] hover:text-red-500 shadow"
                :aria-label="$t('delete')"
                @click="removeImage(i)"
              >
                <span class="mdi mdi-close text-[12px]"></span>
              </button>
            </div>
          </div>
          <div v-if="(form.gallery.images?.length ?? 0) < 3" class="flex items-center gap-2">
            <input
              v-model="newImageUrl"
              type="url"
              placeholder="https://..."
              class="flex-1 px-3 py-2 rounded-xl border border-[#e5e5e5] text-[13px] focus:outline-none focus:border-[#1a1c1b]"
              @keydown.enter.prevent="addImage"
            />
            <button
              type="button"
              class="px-3 py-2 rounded-xl text-[12px] font-bold text-emerald-700 hover:bg-emerald-50 transition-colors"
              @click="addImage"
            >
              Añadir
            </button>
          </div>
        </div>

        <div>
          <label class="block text-[11px] font-bold text-[#666] uppercase tracking-[0.12em] mb-1.5">Vídeo demo (opcional)</label>
          <input
            v-model="form.gallery.videoUrl"
            type="url"
            placeholder="URL del reel o vídeo de ejemplo"
            class="w-full px-3 py-2 rounded-xl border border-[#e5e5e5] text-[13px] focus:outline-none focus:border-[#1a1c1b]"
          />
        </div>
      </section>

      <!-- STEP 4: Descripción y FAQ -->
      <section v-if="step === 4" class="space-y-4">
        <div>
          <label class="block text-[11px] font-bold text-[#666] uppercase tracking-[0.12em] mb-1.5">Descripción completa</label>
          <textarea
            v-model="form.longDescription"
            rows="6"
            placeholder="Explica qué ofreces, tu estilo, para qué tipo de negocios funciona mejor y qué cosas NO haces."
            class="w-full px-3 py-2 rounded-xl border border-[#e5e5e5] text-[13px] focus:outline-none focus:border-[#1a1c1b] resize-none"
          ></textarea>
        </div>

        <div>
          <label class="block text-[11px] font-bold text-[#666] uppercase tracking-[0.12em] mb-2">Preguntas frecuentes</label>
          <PickFaqEditor v-model="form.faq" />
        </div>
      </section>

      <!-- STEP 5: Requisitos + publicación -->
      <section v-if="step === 5" class="space-y-4">
        <div>
          <label class="block text-[11px] font-bold text-[#666] uppercase tracking-[0.12em] mb-2">Qué necesitas del negocio</label>
          <PickRequirementsEditor v-model="form.buyerRequirements" />
        </div>

        <label class="flex items-center justify-between px-3 py-2.5 rounded-xl border border-[#e5e5e5] cursor-pointer hover:bg-[#fafafa] transition-colors">
          <div>
            <p class="text-[13px] font-bold text-[#1a1c1b]">Pick activo</p>
            <p class="text-[11px] text-[#888]">Los negocios pueden verlo y contratarlo. Desactivalo para dejarlo en borrador.</p>
          </div>
          <input v-model="form.active" type="checkbox" class="sr-only peer" />
          <div class="relative w-11 h-6 bg-[#e5e5e5] peer-checked:bg-emerald-500 rounded-full transition-colors">
            <div
              class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
              :class="form.active ? 'translate-x-5' : ''"
            ></div>
          </div>
        </label>

        <!-- Preview summary -->
        <div class="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-4">
          <p class="text-[11px] font-bold text-[#666] uppercase tracking-[0.12em] mb-2">Resumen</p>
          <p class="text-[14px] font-bold text-[#1a1c1b]">{{ form.title || 'Sin título' }}</p>
          <p v-if="form.shortPitch" class="text-[12px] text-[#666] mt-1">{{ form.shortPitch }}</p>
          <div class="flex items-center gap-3 mt-3 text-[11px] text-[#666]">
            <span><span class="mdi mdi-package-variant text-[13px]"></span> {{ form.packages.length }} paquete{{ form.packages.length === 1 ? '' : 's' }}</span>
            <span><span class="mdi mdi-help-circle-outline text-[13px]"></span> {{ form.faq.length }} FAQ</span>
            <span><span class="mdi mdi-clipboard-check-outline text-[13px]"></span> {{ form.buyerRequirements.length }} requisitos</span>
          </div>
        </div>
      </section>

    </form>

    <template #footer>
      <div class="flex items-center justify-between gap-2 p-4">
        <button
          type="button"
          class="px-4 py-2 rounded-full text-[12px] font-bold text-[#666] hover:bg-[#f0f0f0] transition-colors"
          @click="onClose"
        >
          Cancelar
        </button>
        <div class="flex items-center gap-2">
          <button
            v-if="step > 1"
            type="button"
            class="px-4 py-2 rounded-full text-[12px] font-bold text-[#1a1c1b] hover:bg-[#f0f0f0] transition-colors"
            @click="goPrev"
          >
            <span class="mdi mdi-arrow-left mr-1"></span>Atrás
          </button>
          <button
            v-if="step < STEPS.length"
            type="button"
            class="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-primary text-white text-[12px] font-bold shadow-pill-primary hover:bg-gradient-primary-hover transition-all"
            @click="goNext"
          >
            Siguiente <span class="mdi mdi-arrow-right"></span>
          </button>
          <button
            v-else
            type="button"
            class="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-white text-[12px] font-bold transition-all hover:-translate-y-0.5"
            style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow: 0 4px 12px rgba(16,185,129,0.25);"
            @click="onSubmit"
          >
            <span class="mdi mdi-content-save-outline text-[14px]"></span>
            Guardar pick
          </button>
        </div>
      </div>
    </template>
  </Modal>
</template>
