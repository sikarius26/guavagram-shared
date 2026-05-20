<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCreatorCampaigns, type CampaignKind } from '~/composables/useCreatorCampaigns'
import { useCreatorVerification } from '~/composables/useCreatorVerification'
import { notifier } from '~/services/notification'

const { t } = useI18n()

const { contactsBrought, threshold, isVerified, remaining, progressPct } = useCreatorVerification()

const props = withDefaults(defineProps<{ handle?: string }>(), { handle: 'maria_foodie' })

const handleRef = computed(() => props.handle || 'maria_foodie')
const { campaigns, loading, load, create, remove, draw } = useCreatorCampaigns(() => handleRef.value)

onMounted(load)

const showForm = ref(false)
const saving = ref(false)
const showCountExplainer = ref(false)

const form = reactive<{
  kind: CampaignKind
  title: string
  description: string
  rewardLabel: string
  sponsorStore: string
  code: string
  startsAt: string
  endsAt: string
  capacity: number | null
  requirements: string
}>({
  kind: 'challenge',
  title: '',
  description: '',
  rewardLabel: '',
  sponsorStore: '',
  code: '',
  startsAt: '',
  endsAt: '',
  capacity: null,
  requirements: '',
})

function resetForm() {
  form.kind = 'challenge'
  form.title = ''
  form.description = ''
  form.rewardLabel = ''
  form.sponsorStore = ''
  form.code = ''
  form.startsAt = ''
  form.endsAt = ''
  form.capacity = null
  form.requirements = ''
}

async function submit() {
  if (!form.title.trim()) return
  saving.value = true
  try {
    await create({
      kind: form.kind,
      title: form.title.trim(),
      description: form.description.trim(),
      rewardLabel: form.rewardLabel.trim(),
      sponsorStore: form.sponsorStore.trim() || undefined,
      code: form.code.trim() || undefined,
      startsAt: form.startsAt || undefined,
      endsAt: form.endsAt || undefined,
      capacity: form.capacity ? Number(form.capacity) : undefined,
      requirements: form.requirements.trim() || undefined,
    })
    notifier.notifySuccess(t('campaignCreated'))
    resetForm()
    showForm.value = false
  } catch (e: any) {
    notifier.notifyError(e?.message || t('couldNotCreateCampaign'))
  } finally {
    saving.value = false
  }
}

async function confirmRemove(id: string) {
  if (!window.confirm(t('deleteCampaignConfirm'))) return
  await remove(id)
  notifier.notifySuccess(t('campaignDeleted'))
}

async function doDraw(id: string) {
  const res = await draw(id)
  notifier.notifySuccess(t('rafflePerformed', { count: res.winnersCount }))
}

const kindMeta = computed<Record<CampaignKind, { label: string; icon: string; color: string; tint: string }>>(() => ({
  challenge: { label: t('campaignKindLabelChallenge'), icon: 'mdi-trophy-outline', color: '#ef4444', tint: 'bg-red-50 text-red-700 border-red-200' },
  giveaway: { label: t('campaignKindLabelGiveaway'), icon: 'mdi-gift-outline', color: '#8b5cf6', tint: 'bg-violet-50 text-violet-700 border-violet-200' },
  'voucher-drop': { label: t('campaignKindLabelVoucherDrop'), icon: 'mdi-ticket-percent-outline', color: '#10b981', tint: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
}))

const statusMeta = computed<Record<'upcoming' | 'active' | 'ended', string>>(() => ({
  upcoming: t('campaignStatusUpcoming'),
  active: t('campaignStatusActive'),
  ended: t('campaignStatusEnded'),
}))

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
  } catch {
    return iso
  }
}
</script>

<template>
  <div class="p-4 sm:p-8 pb-28 lg:pb-8 max-w-[1000px] mx-auto">
    <header class="flex items-start justify-between mb-4 gap-4">
      <div class="min-w-0">
        <h1 class="text-[26px] font-black text-[#1a1c1b] tracking-tight">Campañas</h1>
        <p class="text-[13px] text-[#555] mt-1 leading-relaxed max-w-xl">
          Trae <strong class="text-[#1a1c1b]">personas a restaurantes</strong> con picks en tu bio, códigos o retos.
          A partir de <strong class="text-[#1a1c1b]">100 personas</strong> los restaurantes empiezan a pagarte —
          por <strong class="text-[#1a1c1b]">reseñar</strong> sus locales y por hacerles <strong class="text-[#1a1c1b]">campañas</strong>.
        </p>
      </div>
      <button @click="showForm = !showForm"
        class="flex items-center gap-2 px-4 py-2.5 text-white rounded-xl font-bold text-[13px] shrink-0 transition-all hover:-translate-y-0.5"
        style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow: 0 4px 12px rgba(16,185,129,0.25);">
        <span class="mdi" :class="showForm ? 'mdi-close' : 'mdi-plus'"></span>
        {{ showForm ? $t('cancel') : $t('newCampaign') }}
      </button>
    </header>

    <!-- Progression strip: makes the creator's journey visible in every visit.
         Progress toward verification is a gain signal → emerald, not brand red. -->
    <div v-if="!isVerified" class="mb-7 rounded-2xl bg-white border border-[#e5e5e5] p-4 flex items-center gap-4">
      <div class="size-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
        <span class="mdi mdi-rocket-launch-outline text-emerald-600 text-lg"></span>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1.5 flex-wrap">
          <p class="text-[12px] font-black text-[#1a1c1b]">
            <span class="tabular-nums">{{ contactsBrought }}</span> personas traídas a restaurantes
          </p>
          <button type="button" @click="showCountExplainer = !showCountExplainer"
            class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-800 underline underline-offset-2 decoration-dotted">
            ¿qué cuenta?
          </button>
          <span class="ml-auto text-[10px] font-bold text-emerald-700">Faltan {{ remaining }} para cobrar</span>
        </div>
        <div class="h-1.5 rounded-full bg-[#f0f0f0] overflow-hidden">
          <div class="h-full rounded-full transition-all"
            :style="{ width: progressPct + '%', background: 'linear-gradient(90deg, #10b981, #059669)' }"></div>
        </div>
        <p v-if="!showCountExplainer" class="text-[11px] text-[#666] mt-2 leading-snug">
          Al llegar a <strong class="text-[#1a1c1b]">{{ threshold }}</strong> se abren
          <strong class="text-[#1a1c1b]">Reseñas pagadas</strong> y
          <strong class="text-[#1a1c1b]">Trabajos pagados</strong> — los restaurantes empiezan a pagarte.
        </p>
        <ul v-else class="mt-2 space-y-1 text-[11px] text-[#555] leading-snug">
          <li class="flex items-start gap-1.5">
            <span class="mdi mdi-check text-emerald-600 text-[13px] leading-none mt-0.5"></span>
            Alguien <strong class="text-[#1a1c1b]">reserva</strong> en un restaurante que tienes en tu bio.
          </li>
          <li class="flex items-start gap-1.5">
            <span class="mdi mdi-check text-emerald-600 text-[13px] leading-none mt-0.5"></span>
            Alguien <strong class="text-[#1a1c1b]">canjea</strong> un código de descuento tuyo en tienda.
          </li>
          <li class="flex items-start gap-1.5">
            <span class="mdi mdi-check text-emerald-600 text-[13px] leading-none mt-0.5"></span>
            Alguien <strong class="text-[#1a1c1b]">cumple</strong> un reto que has lanzado.
          </li>
        </ul>
      </div>
    </div>
    <div v-else class="mb-7 rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 p-4 flex items-center gap-3">
      <span class="mdi mdi-check-decagram text-[22px] text-emerald-600"></span>
      <div>
        <p class="text-[13px] font-black text-emerald-800">Creator verificado · puedes aceptar campañas pagadas</p>
        <p class="text-[11px] text-emerald-700">Sigue lanzando campañas para mantener tráfico y subir en el ranking.</p>
      </div>
    </div>

    <section v-if="showForm" class="mb-8 bg-white rounded-2xl border border-[#e5e5e5] p-6">
      <div class="grid grid-cols-3 gap-3 mb-5">
        <button v-for="(m, k) in kindMeta" :key="k" type="button"
          @click="form.kind = k as CampaignKind"
          class="flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left"
          :class="form.kind === k ? 'border-[#1a1c1b] bg-[#fafafa]' : 'border-[#e5e5e5] hover:border-[#bbb]'">
          <span class="mdi text-2xl shrink-0" :class="m.icon" :style="{ color: m.color }"></span>
          <div>
            <p class="text-[13px] font-bold text-[#1a1c1b]">{{ m.label }}</p>
            <p class="text-[11px] text-[#888] mt-0.5 leading-tight">
              <template v-if="k === 'challenge'">Completa una acción para ganar GP.</template>
              <template v-else-if="k === 'giveaway'">Sorteo entre seguidores participantes.</template>
              <template v-else>Código limitado por orden de llegada.</template>
            </p>
          </div>
        </button>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <label class="col-span-2">
          <span class="block text-[11px] font-bold text-[#555] uppercase tracking-wider mb-1">Título</span>
          <input v-model="form.title" type="text" placeholder="Ej: Visita 3 de mis top picks este mes"
            class="w-full rounded-xl border border-[#ddd] bg-[#fafafa] px-4 h-11 text-[14px] outline-none focus:border-[#1a1c1b]" />
        </label>
        <label class="col-span-2">
          <span class="block text-[11px] font-bold text-[#555] uppercase tracking-wider mb-1">Descripción</span>
          <textarea v-model="form.description" rows="2" placeholder="Explica la campaña a tus seguidores…"
            class="w-full rounded-xl border border-[#ddd] bg-[#fafafa] px-4 py-2.5 text-[14px] outline-none focus:border-[#1a1c1b] resize-none"></textarea>
        </label>
        <label>
          <span class="block text-[11px] font-bold text-[#555] uppercase tracking-wider mb-1">Recompensa</span>
          <input v-model="form.rewardLabel" type="text" placeholder="Ej: 200 GP + cena para 2"
            class="w-full rounded-xl border border-[#ddd] bg-[#fafafa] px-4 h-11 text-[14px] outline-none focus:border-[#1a1c1b]" />
        </label>
        <label>
          <span class="block text-[11px] font-bold text-[#555] uppercase tracking-wider mb-1">Patrocinador (slug restaurante)</span>
          <input v-model="form.sponsorStore" type="text" placeholder="Ej: la-mundana"
            class="w-full rounded-xl border border-[#ddd] bg-[#fafafa] px-4 h-11 text-[14px] outline-none focus:border-[#1a1c1b]" />
        </label>
        <label v-if="form.kind === 'voucher-drop'">
          <span class="block text-[11px] font-bold text-[#555] uppercase tracking-wider mb-1">Código</span>
          <input v-model="form.code" type="text" placeholder="Ej: MARIA10"
            class="w-full rounded-xl border border-[#ddd] bg-[#fafafa] px-4 h-11 text-[14px] outline-none focus:border-[#1a1c1b] uppercase" />
        </label>
        <label v-if="form.kind !== 'challenge'">
          <span class="block text-[11px] font-bold text-[#555] uppercase tracking-wider mb-1">Capacidad</span>
          <input v-model.number="form.capacity" type="number" min="1" placeholder="Nº de ganadores o vouchers"
            class="w-full rounded-xl border border-[#ddd] bg-[#fafafa] px-4 h-11 text-[14px] outline-none focus:border-[#1a1c1b]" />
        </label>
        <label v-if="form.kind === 'challenge'" class="col-span-2">
          <span class="block text-[11px] font-bold text-[#555] uppercase tracking-wider mb-1">Requisitos</span>
          <input v-model="form.requirements" type="text" placeholder="Ej: Reseña verificada de 3 top picks"
            class="w-full rounded-xl border border-[#ddd] bg-[#fafafa] px-4 h-11 text-[14px] outline-none focus:border-[#1a1c1b]" />
        </label>
        <label>
          <span class="block text-[11px] font-bold text-[#555] uppercase tracking-wider mb-1">Desde</span>
          <input v-model="form.startsAt" type="datetime-local"
            class="w-full rounded-xl border border-[#ddd] bg-[#fafafa] px-4 h-11 text-[14px] outline-none focus:border-[#1a1c1b]" />
        </label>
        <label>
          <span class="block text-[11px] font-bold text-[#555] uppercase tracking-wider mb-1">Hasta</span>
          <input v-model="form.endsAt" type="datetime-local"
            class="w-full rounded-xl border border-[#ddd] bg-[#fafafa] px-4 h-11 text-[14px] outline-none focus:border-[#1a1c1b]" />
        </label>
      </div>

      <div class="flex justify-end gap-2 mt-5">
        <button @click="showForm = false" class="px-4 py-2.5 text-[#888] font-semibold text-[12px] rounded-xl hover:bg-[#f5f5f5]">
          {{ $t('cancel') }}
        </button>
        <button @click="submit" :disabled="!form.title.trim() || saving"
          class="px-6 py-2.5 bg-[#1a1c1b] text-white rounded-xl font-bold text-[12px] disabled:opacity-50">
          {{ saving ? $t('creating') : $t('createCampaign') }}
        </button>
      </div>
    </section>

    <section>
      <div v-if="loading" class="text-center py-16 text-[#888] text-[13px]">{{ $t('loading') }}</div>
      <div v-else-if="!campaigns.length"
        class="rounded-3xl border border-[#e5e5e5] bg-gradient-to-br from-[#fff8f6] via-white to-[#f0fdf4] p-8 lg:p-10 overflow-hidden relative">

        <!-- Ambient glows (per CreatorOnboardingHero style) -->
        <div class="pointer-events-none absolute inset-0 opacity-70"
          style="background-image: radial-gradient(circle at 12% 18%, rgba(245,158,11,0.10), transparent 45%), radial-gradient(circle at 88% 82%, rgba(16,185,129,0.12), transparent 50%);"></div>

        <!-- ============ HERO: money hook first ============ -->
        <div class="relative max-w-2xl mx-auto text-center mb-7">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 mb-4">
            <span class="size-1.5 rounded-full bg-amber-500"></span>
            <span class="text-[10px] font-black uppercase tracking-[0.15em] text-amber-700">Empieza aquí · gratis</span>
          </div>
          <h3 class="text-[24px] lg:text-[28px] font-extrabold text-[#1a1c1b] tracking-tight leading-tight">
            Gana dinero llevando
            <span class="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">gente a restaurantes</span>
          </h3>
          <p class="text-[13px] lg:text-[14px] text-[#555] mt-3 leading-relaxed max-w-lg mx-auto">
            Trae <strong class="text-[#1a1c1b]">100 personas</strong> a restaurantes con tus picks o códigos
            y los restaurantes empiezan a pagarte por
            <strong class="text-[#1a1c1b]">reseñar</strong> y por hacerles <strong class="text-[#1a1c1b]">campañas</strong>.
          </p>
        </div>

        <!-- ============ 2 unlock cards — the MOTIVE, visible up front ============ -->
        <div class="relative grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto mb-8">
          <div class="rounded-2xl bg-white border border-emerald-100 p-4 pl-5"
            style="border-left: 3px solid #10b981;">
            <div class="flex items-center gap-2 mb-1.5">
              <span class="inline-flex size-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 items-center justify-center shadow-[0_4px_12px_rgba(16,185,129,0.25)]">
                <span class="mdi mdi-cash-multiple text-white text-[15px]"></span>
              </span>
              <p class="text-[13px] font-black text-[#1a1c1b]">Reseñas pagadas</p>
            </div>
            <p class="text-[12px] text-[#555] leading-snug">
              Restaurantes te pagan por escribir <strong class="text-[#1a1c1b]">reseñas verificadas</strong> de su local.
            </p>
          </div>

          <div class="rounded-2xl bg-white border border-indigo-100 p-4 pl-5"
            style="border-left: 3px solid #6366f1;">
            <div class="flex items-center gap-2 mb-1.5">
              <span class="inline-flex size-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 items-center justify-center shadow-[0_4px_12px_rgba(99,102,241,0.25)]">
                <span class="mdi mdi-handshake-outline text-white text-[15px]"></span>
              </span>
              <p class="text-[13px] font-black text-[#1a1c1b]">Trabajos pagados</p>
            </div>
            <p class="text-[12px] text-[#555] leading-snug">
              Restaurantes te contactan para <strong class="text-[#1a1c1b]">campañas</strong> y colaboraciones remuneradas.
            </p>
          </div>
        </div>

        <!-- ============ 3 ways to bring people (mechanics come AFTER motive) ============ -->
        <div class="relative max-w-3xl mx-auto">
          <p class="text-center text-[11px] font-black uppercase tracking-[0.15em] text-[#64748b] mb-3">
            3 formas de sumar personas
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-7">
            <div class="rounded-2xl border border-[#e5e5e5] bg-white p-4 flex flex-col">
              <div class="flex items-center gap-2 mb-2">
                <span class="inline-flex size-9 rounded-xl bg-slate-50 text-slate-700 items-center justify-center ring-1 ring-slate-200">
                  <span class="mdi mdi-trophy-outline text-[18px]"></span>
                </span>
                <p class="text-[13px] font-black text-[#1a1c1b]">Reto</p>
              </div>
              <p class="text-[12px] text-[#555] leading-snug mb-3 flex-1">
                Pides una acción concreta (visitar 3 sitios, reseñar uno…).
              </p>
              <p class="text-[10px] text-emerald-700 font-bold uppercase tracking-wide">
                <span class="mdi mdi-plus-circle text-[11px]"></span> +1 persona por cumplidor
              </p>
            </div>

            <div class="rounded-2xl border border-[#e5e5e5] bg-white p-4 flex flex-col">
              <div class="flex items-center gap-2 mb-2">
                <span class="inline-flex size-9 rounded-xl bg-slate-50 text-slate-700 items-center justify-center ring-1 ring-slate-200">
                  <span class="mdi mdi-gift-outline text-[18px]"></span>
                </span>
                <p class="text-[13px] font-black text-[#1a1c1b]">Sorteo</p>
              </div>
              <p class="text-[12px] text-[#555] leading-snug mb-3 flex-1">
                Quien quiera se apunta — el premio es una experiencia en el restaurante patrocinador.
              </p>
              <p class="text-[10px] text-emerald-700 font-bold uppercase tracking-wide">
                <span class="mdi mdi-plus-circle text-[11px]"></span> +1 persona por participante
              </p>
            </div>

            <div class="rounded-2xl border border-[#e5e5e5] bg-white p-4 flex flex-col">
              <div class="flex items-center gap-2 mb-2">
                <span class="inline-flex size-9 rounded-xl bg-slate-50 text-slate-700 items-center justify-center ring-1 ring-slate-200">
                  <span class="mdi mdi-ticket-percent-outline text-[18px]"></span>
                </span>
                <p class="text-[13px] font-black text-[#1a1c1b]">Código descuento</p>
              </div>
              <p class="text-[12px] text-[#555] leading-snug mb-3 flex-1">
                Repartes un código con usos limitados que se canjea en tienda.
              </p>
              <p class="text-[10px] text-emerald-700 font-bold uppercase tracking-wide">
                <span class="mdi mdi-plus-circle text-[11px]"></span> +1 persona por canje
              </p>
            </div>
          </div>
        </div>

        <div class="relative flex justify-center">
          <button @click="showForm = true"
            class="flex items-center gap-2 px-6 py-3 text-white rounded-xl font-black text-[13px] transition-all hover:-translate-y-0.5"
            style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow: 0 8px 20px rgba(16,185,129,0.28);">
            <span class="mdi mdi-plus text-[16px]"></span>
            Lanzar mi primera campaña
          </button>
        </div>
      </div>
      <div v-else class="flex flex-col gap-3">
        <article v-for="c in campaigns" :key="c.id"
          class="bg-white rounded-2xl border border-[#e5e5e5] p-5">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              :style="{ backgroundColor: kindMeta[c.kind].color + '15' }">
              <span class="mdi text-2xl" :class="kindMeta[c.kind].icon" :style="{ color: kindMeta[c.kind].color }"></span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <h3 class="text-[15px] font-bold text-[#1a1c1b]">{{ c.title }}</h3>
                <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold border" :class="kindMeta[c.kind].tint">
                  {{ kindMeta[c.kind].label }}
                </span>
                <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold"
                  :class="c.status === 'active' ? 'bg-emerald-100 text-emerald-700' : c.status === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'">
                  {{ statusMeta[c.status] }}
                </span>
              </div>
              <p v-if="c.description" class="text-[13px] text-[#555] leading-snug mb-2">{{ c.description }}</p>
              <div class="flex items-center gap-3 flex-wrap text-[11px] text-[#888]">
                <span v-if="c.rewardLabel" class="flex items-center gap-1 font-semibold text-emerald-700">
                  <span class="mdi mdi-gift-outline"></span>{{ c.rewardLabel }}
                </span>
                <span v-if="c.sponsorStore" class="flex items-center gap-1">
                  <span class="mdi mdi-storefront-outline"></span>@{{ c.sponsorStore }}
                </span>
                <span v-if="c.code" class="font-mono bg-[#f5f5f5] px-1.5 py-0.5 rounded">{{ c.code }}</span>
                <span><span class="mdi mdi-calendar-outline"></span> {{ fmtDate(c.startsAt) }} → {{ fmtDate(c.endsAt) }}</span>
                <span class="flex items-center gap-1">
                  <span class="mdi mdi-account-multiple-outline"></span>
                  {{ c.participantCount }}<template v-if="c.capacity">/{{ c.capacity }}</template>
                </span>
                <span v-if="c.winnersCount > 0" class="font-bold text-violet-700">
                  <span class="mdi mdi-party-popper"></span> {{ c.winnersCount }} ganador(es)
                </span>
              </div>
            </div>
            <div class="flex flex-col gap-1.5 shrink-0">
              <button v-if="c.kind === 'giveaway' && c.participantCount > 0 && c.winnersCount === 0"
                @click="doDraw(c.id)"
                class="px-3 py-1.5 rounded-lg bg-violet-600 text-white text-[11px] font-bold">
                <span class="mdi mdi-dice-5-outline"></span> {{ $t('drawButton') }}
              </button>
              <button @click="confirmRemove(c.id)"
                class="px-3 py-1.5 rounded-lg text-[#888] hover:text-red-600 hover:bg-red-50 text-[11px] font-semibold">
                <span class="mdi mdi-trash-can-outline"></span> {{ $t('deleteButton') }}
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>
