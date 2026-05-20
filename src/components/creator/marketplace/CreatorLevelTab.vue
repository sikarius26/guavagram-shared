<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { creatorApiClient } from '~/services/apis/api.client.creator'
import { CreatorLevelEnum } from '~/services/apis/models/creator-level-enum'
import { notifier } from '~/services/notification'
import CreatorLevelBadge from '~/components/creator/shared/CreatorLevelBadge.vue'
import LevelProgress from '~/components/creator/shared/LevelProgress.vue'

const { t } = useI18n()
const level = ref<any | null>(null)
const loading = ref(false)

const load = async () => {
  loading.value = true
  try {
    const data = await creatorApiClient.creatorLevel()
    level.value = data
  } catch (e) {
    notifier.notifyError(t('couldNotLoadLevel'), e as Error)
  } finally {
    loading.value = false
  }
}

onMounted(load)

// Catalog of level-by-level benefits so we can show "next level" locked perks
const benefitsCatalog: Record<number, { icon: string; label: string }[]> = {
  [CreatorLevelEnum.NEW]: [
    { icon: 'mdi-check', label: 'Publicar hasta 3 picks' },
    { icon: 'mdi-check', label: 'Recibir propuestas' },
    { icon: 'mdi-check', label: 'Perfil público' },
    { icon: 'mdi-check', label: 'Soporte básico' },
  ],
  [CreatorLevelEnum.LEVEL_1]: [
    { icon: 'mdi-check', label: 'Publicar hasta 5 picks' },
    { icon: 'mdi-check', label: 'Estadísticas básicas' },
    { icon: 'mdi-check', label: 'Badge Level 1 visible' },
    { icon: 'mdi-check', label: 'Aparecer en búsquedas' },
  ],
  [CreatorLevelEnum.LEVEL_2]: [
    { icon: 'mdi-check', label: 'Publicar hasta 10 picks' },
    { icon: 'mdi-check', label: 'Analytics avanzado' },
    { icon: 'mdi-check', label: 'Prioridad en soporte' },
    { icon: 'mdi-check', label: 'Boost 10% descuento' },
  ],
  [CreatorLevelEnum.TOP_RATED]: [
    { icon: 'mdi-crown', label: 'Picks ilimitados' },
    { icon: 'mdi-crown', label: 'Insignia Top Rated' },
    { icon: 'mdi-crown', label: 'Destaque en marketplace' },
    { icon: 'mdi-crown', label: 'Boost 20% descuento' },
  ],
  [CreatorLevelEnum.GUAVAGRAM_RECOMMENDED]: [
    { icon: 'mdi-shield-check', label: 'Recomendado GuavaGram' },
    { icon: 'mdi-shield-check', label: 'Account manager dedicado' },
    { icon: 'mdi-shield-check', label: 'Invitaciones a eventos' },
    { icon: 'mdi-shield-check', label: 'Revenue share premium' },
  ],
}

const levelLabel: Record<number, string> = {
  [CreatorLevelEnum.NEW]: 'Nuevo',
  [CreatorLevelEnum.LEVEL_1]: 'Level 1',
  [CreatorLevelEnum.LEVEL_2]: 'Level 2',
  [CreatorLevelEnum.TOP_RATED]: 'Top Rated',
  [CreatorLevelEnum.GUAVAGRAM_RECOMMENDED]: 'Recomendado GuavaGram',
}

const currentLevel = computed<number>(() => Number(level.value?.level ?? CreatorLevelEnum.NEW))

const currentBenefits = computed(() => {
  const fromApi = Array.isArray(level.value?.benefits) ? level.value.benefits : null
  return fromApi?.length ? fromApi : (benefitsCatalog[currentLevel.value] ?? [])
})

const nextLevelKey = computed<number | null>(() => {
  const next = currentLevel.value + 1
  return next <= CreatorLevelEnum.GUAVAGRAM_RECOMMENDED ? next : null
})

const nextBenefits = computed(() =>
  nextLevelKey.value !== null ? (benefitsCatalog[nextLevelKey.value] ?? []) : []
)

const nextLevelName = computed(() => {
  if (level.value?.nextLevelName) return level.value.nextLevelName
  return nextLevelKey.value !== null ? (levelLabel[nextLevelKey.value] ?? '') : ''
})

// Mock history — uses real fields when present
interface LevelEvent {
  level: number
  reachedAt: string
  note: string
}

const history = computed<LevelEvent[]>(() => {
  // If API ever returns level.history, use it; otherwise synthesize a basic one.
  if (Array.isArray(level.value?.history)) return level.value.history
  const items: LevelEvent[] = []
  items.push({ level: CreatorLevelEnum.NEW, reachedAt: 'Inicio', note: 'Creaste tu perfil de creator' })
  for (let lvl = 1; lvl <= currentLevel.value; lvl++) {
    items.push({ level: lvl, reachedAt: '', note: `Alcanzaste ${levelLabel[lvl] ?? ''}` })
  }
  return items
})
</script>

<template>
  <div class="flex flex-col gap-5">
    <div>
      <h3 class="text-[18px] font-bold tracking-[-0.02em] text-[#1a1c1b]">Mi nivel</h3>
      <p class="text-[12px] text-[#666] mt-0.5">Sube de nivel completando campañas con alta satisfacción.</p>
    </div>

    <!-- Loading -->
    <div v-if="loading && !level" class="rounded-2xl border border-dashed border-[#ddd] p-10 text-center text-[#888] text-[13px]">
      {{ $t('loadingLevel') }}
    </div>

    <div v-else class="flex flex-col gap-5">

      <!-- Hero -->
      <div class="rounded-2xl bg-white border border-[#e5e5e5] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-center">
        <p class="text-[10px] font-bold text-[#888] uppercase tracking-[0.15em]">Tu nivel actual</p>
        <div class="mt-3 flex flex-col items-center gap-2">
          <CreatorLevelBadge :level="currentLevel" size="lg" />
          <p v-if="currentLevel === 0" class="text-[14px] font-bold text-[#1a1c1b]">
            {{ levelLabel[currentLevel] }}
          </p>
        </div>
        <div class="mt-4 grid grid-cols-2 gap-3 max-w-md mx-auto">
          <div class="rounded-xl bg-[#fafafa] border border-[#f0f0f0] p-3">
            <p class="text-[10px] font-bold text-[#888] uppercase tracking-[0.12em]">Campañas</p>
            <p class="text-[18px] font-black tabular-nums text-[#1a1c1b] mt-0.5">{{ level?.completedCampaigns ?? 0 }}</p>
          </div>
          <div class="rounded-xl bg-[#fafafa] border border-[#f0f0f0] p-3">
            <p class="text-[10px] font-bold text-[#888] uppercase tracking-[0.12em]">Rating</p>
            <p class="text-[18px] font-black tabular-nums text-[#1a1c1b] mt-0.5 inline-flex items-center gap-1">
              <span class="mdi mdi-star text-amber-500 text-[16px]"></span>
              {{ Number(level?.avgRating ?? 0).toFixed(1) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Progress -->
      <LevelProgress
        v-if="nextLevelKey !== null"
        :current-level="currentLevel"
        :progress-pct="Number(level?.nextLevelProgress ?? 0)"
        :next-level-name="nextLevelName"
      />

      <!-- Current benefits -->
      <div class="rounded-2xl bg-white border border-[#e5e5e5] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-[14px] font-bold text-[#1a1c1b] tracking-[-0.01em]">Beneficios actuales</h4>
          <span class="text-[10px] font-bold text-[#ff2d23] bg-[#fff5f4] border border-[#ff2d23]/20 px-2 py-0.5 rounded-full">
            Desbloqueado
          </span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div
            v-for="(b, i) in currentBenefits"
            :key="'cur-' + i"
            class="flex items-start gap-2 rounded-xl bg-[#fff5f4]/50 border border-[#ff2d23]/15 px-3 py-2"
          >
            <span class="mdi text-[#ff2d23] text-[16px] leading-none mt-0.5 shrink-0" :class="b.icon || 'mdi-check'"></span>
            <span class="text-[12px] text-[#1a1c1b] leading-snug">{{ b.label }}</span>
          </div>
        </div>
      </div>

      <!-- Next level benefits (locked) -->
      <div v-if="nextLevelKey !== null && nextBenefits.length" class="rounded-2xl bg-white border border-[#e5e5e5] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative overflow-hidden">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h4 class="text-[14px] font-bold text-[#1a1c1b] tracking-[-0.01em]">
              Beneficios en <span class="text-primary">{{ nextLevelName }}</span>
            </h4>
            <p class="text-[11px] text-[#888] mt-0.5">Desbloqueas al subir de nivel</p>
          </div>
          <span class="inline-flex items-center gap-1 text-[10px] font-bold text-[#888] bg-[#f4f4f4] border border-[#e5e5e5] px-2 py-0.5 rounded-full">
            <span class="mdi mdi-lock-outline text-[11px]"></span>
            Bloqueado
          </span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div
            v-for="(b, i) in nextBenefits"
            :key="'nxt-' + i"
            class="flex items-start gap-2 rounded-xl bg-[#fafafa] border border-[#f0f0f0] px-3 py-2 opacity-75"
          >
            <span class="mdi text-[#bbb] text-[16px] leading-none mt-0.5 shrink-0" :class="b.icon || 'mdi-lock-outline'"></span>
            <span class="text-[12px] text-[#666] leading-snug">{{ b.label }}</span>
          </div>
        </div>
      </div>

      <!-- History timeline -->
      <div class="rounded-2xl bg-white border border-[#e5e5e5] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <h4 class="text-[14px] font-bold text-[#1a1c1b] tracking-[-0.01em] mb-3">Historial de nivel</h4>
        <ol class="relative border-l border-[#eee] ml-2">
          <li
            v-for="(h, i) in history"
            :key="i"
            class="pl-5 pb-4 last:pb-0 relative"
          >
            <span
              class="absolute -left-[7px] top-0 w-3.5 h-3.5 rounded-full border-2 border-white bg-[#ff2d23] shadow-sm"
            ></span>
            <p class="text-[12px] font-bold text-[#1a1c1b] leading-snug">{{ h.note }}</p>
            <p v-if="h.reachedAt" class="text-[10px] text-[#888] mt-0.5">{{ h.reachedAt }}</p>
          </li>
        </ol>
      </div>

    </div>
  </div>
</template>
