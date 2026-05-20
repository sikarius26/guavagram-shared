<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { gamificationApiClient } from '~/services/apis/api.client.gamification'
import type { BadgeViewModel } from '~/services/apis/models/badge-view-model'

type Category = 'all' | 'reviewer' | 'social' | 'explorer' | 'loyalty'

const activeCategory = ref<Category>('all')
const badges = ref<BadgeViewModel[]>([])
const isLoading = ref(false)
const selectedBadge = ref<BadgeViewModel | null>(null)
const showModal = ref(false)

const categories: { key: Category; label: string; icon: string }[] = [
  { key: 'all', label: 'Todos', icon: 'mdi-view-grid' },
  { key: 'reviewer', label: 'Reviewer', icon: 'mdi-star-circle' },
  { key: 'social', label: 'Social', icon: 'mdi-account-group' },
  { key: 'explorer', label: 'Explorador', icon: 'mdi-compass' },
  { key: 'loyalty', label: 'Fidelidad', icon: 'mdi-fire' },
]

const MOCK_BADGES: BadgeViewModel[] = [
  // Reviewer
  { id: 'b1', name: 'Primera Reseña', description: 'Escribe tu primera reseña y comparte tu experiencia con la comunidad.', iconName: 'mdi-pencil-plus', category: 'reviewer', earnedAt: new Date('2026-03-10'), isEarned: true, requirement: 'Escribe 1 reseña' } as any,
  { id: 'b2', name: 'Crítico Experto', description: 'Tu opinión cuenta. Has compartido experiencias detalladas en múltiples restaurantes.', iconName: 'mdi-star-shooting', category: 'reviewer', earnedAt: undefined, isEarned: false, requirement: 'Escribe 10 reseñas' } as any,
  { id: 'b3', name: 'Reviewer de Confianza', description: 'Tus reseñas son las más útiles de la comunidad. La gente confía en tu criterio.', iconName: 'mdi-shield-check', category: 'reviewer', earnedAt: undefined, isEarned: false, requirement: '50 votos útiles en tus reseñas' } as any,
  // Social
  { id: 'b4', name: 'Conector', description: 'Estás construyendo una comunidad foodie invitando a tus amigos.', iconName: 'mdi-link-variant', category: 'social', earnedAt: new Date('2026-02-15'), isEarned: true, requirement: 'Invita a 5 amigos' } as any,
  { id: 'b5', name: 'Embajador', description: 'Eres un verdadero embajador de GuavaGram. Tu red de amigos sigue creciendo.', iconName: 'mdi-bullhorn', category: 'social', earnedAt: undefined, isEarned: false, requirement: 'Invita a 20 amigos' } as any,
  { id: 'b6', name: 'Leyenda', description: 'Una leyenda de la comunidad. Tu influencia es inigualable.', iconName: 'mdi-trophy-award', category: 'social', earnedAt: undefined, isEarned: false, requirement: 'Invita a 50 amigos' } as any,
  // Explorer
  { id: 'b7', name: 'Explorador', description: 'Te encanta descubrir nuevos lugares. Sigue explorando la ciudad.', iconName: 'mdi-compass-outline', category: 'explorer', earnedAt: new Date('2026-04-01'), isEarned: true, requirement: 'Visita 10 restaurantes' } as any,
  { id: 'b8', name: 'Trotamundos', description: 'Conoces la escena gastronómica como la palma de tu mano.', iconName: 'mdi-map-marker-radius', category: 'explorer', earnedAt: undefined, isEarned: false, requirement: 'Visita 25 restaurantes' } as any,
  { id: 'b9', name: 'Gourmet', description: 'Un verdadero gourmet. Has probado de todo y sabes lo que es bueno.', iconName: 'mdi-silverware-fork-knife', category: 'explorer', earnedAt: undefined, isEarned: false, requirement: 'Visita 50 restaurantes' } as any,
  // Loyalty
  { id: 'b10', name: 'Racha Semanal', description: 'La constancia es tu superpoder. Una semana completa sin fallar.', iconName: 'mdi-calendar-check', category: 'loyalty', earnedAt: new Date('2026-04-08'), isEarned: true, requirement: 'Racha de 7 días' } as any,
  { id: 'b11', name: 'Racha Mensual', description: 'Un mes completo de actividad. Tu dedicación es impresionante.', iconName: 'mdi-calendar-star', category: 'loyalty', earnedAt: undefined, isEarned: false, requirement: 'Racha de 30 días' } as any,
  { id: 'b12', name: 'Imparable', description: 'Nada te detiene. 100 días consecutivos de pura pasión foodie.', iconName: 'mdi-rocket-launch', category: 'loyalty', earnedAt: undefined, isEarned: false, requirement: 'Racha de 100 días' } as any,
]

const filteredBadges = computed(() => {
  if (activeCategory.value === 'all') return badges.value
  return badges.value.filter(b => b.category === activeCategory.value)
})

const earnedCount = computed(() => badges.value.filter(b => b.isEarned).length)
const totalCount = computed(() => badges.value.length)

function formatDate(date: Date | undefined) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

function openBadgeDetail(badge: BadgeViewModel) {
  selectedBadge.value = badge
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  setTimeout(() => { selectedBadge.value = null }, 300)
}

function categoryColor(cat: string) {
  switch (cat) {
    case 'reviewer': return 'from-amber-400 to-orange-500'
    case 'social': return 'from-blue-400 to-indigo-500'
    case 'explorer': return 'from-emerald-400 to-teal-600'
    case 'loyalty': return 'from-red-400 to-rose-600'
    default: return 'from-[#1A3C34] to-[#2a5c4a]'
  }
}

async function loadBadges() {
  isLoading.value = true
  try {
    const result = await gamificationApiClient.gamificationBadges()
    badges.value = result && result.length > 0 ? result : MOCK_BADGES
  } catch {
    badges.value = MOCK_BADGES
  } finally {
    isLoading.value = false
  }
}

onMounted(() => loadBadges())
</script>

<template>
  <div class="w-full">
    <!-- Header with progress -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <span class="mdi mdi-medal text-[#1A3C34] text-xl"></span>
        <span class="text-sm text-gray-400">
          <span class="text-white font-bold">{{ earnedCount }}</span> / {{ totalCount }} desbloqueados
        </span>
      </div>
      <div class="h-1.5 flex-1 max-w-[120px] ml-3 bg-white/10 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-[#1A3C34] to-emerald-400 rounded-full transition-all duration-1000"
          :style="{ width: totalCount > 0 ? (earnedCount / totalCount * 100) + '%' : '0%' }"
        ></div>
      </div>
    </div>

    <!-- Category tabs -->
    <div class="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
      <button
        v-for="cat in categories"
        :key="cat.key"
        class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-300 flex-shrink-0"
        :class="activeCategory === cat.key
          ? 'bg-gradient-to-r from-[#1A3C34] to-[#2a5c4a] text-white shadow-lg shadow-[#1A3C34]/30'
          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'"
        @click="activeCategory = cat.key"
      >
        <span :class="['mdi', cat.icon, 'text-sm']"></span>
        {{ cat.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-16">
      <div class="w-10 h-10 border-3 border-[#1A3C34] border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Badge grid -->
    <div v-else class="grid grid-cols-3 gap-3">
      <button
        v-for="badge in filteredBadges"
        :key="badge.id"
        class="group relative flex flex-col items-center p-4 rounded-2xl transition-all duration-500 border"
        :class="badge.isEarned
          ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-[#1A3C34]/10 hover:-translate-y-1'
          : 'bg-black/20 border-white/5 hover:bg-black/30'"
        @click="openBadgeDetail(badge)"
      >
        <!-- Badge icon -->
        <div
          class="relative w-14 h-14 rounded-full flex items-center justify-center mb-2 transition-all duration-500"
          :class="badge.isEarned
            ? 'bg-gradient-to-br ' + categoryColor(badge.category) + ' shadow-lg'
            : 'bg-white/5'"
        >
          <span
            :class="['mdi', badge.iconName, 'text-2xl transition-all duration-500']"
            :style="badge.isEarned ? 'color: white' : 'color: rgba(255,255,255,0.2)'"
          ></span>
          <!-- Lock overlay for unearned -->
          <div
            v-if="!badge.isEarned"
            class="absolute inset-0 flex items-center justify-center rounded-full bg-black/40"
          >
            <span class="mdi mdi-lock text-white/40 text-lg"></span>
          </div>
          <!-- Sparkle for earned -->
          <div
            v-if="badge.isEarned"
            class="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md"
          >
            <span class="mdi mdi-check-bold text-[10px]" :class="'text-emerald-600'"></span>
          </div>
        </div>

        <!-- Badge name -->
        <p
          class="text-xs font-semibold text-center leading-tight transition-colors"
          :class="badge.isEarned ? 'text-white' : 'text-gray-500'"
        >
          {{ badge.name }}
        </p>

        <!-- Earned date -->
        <p v-if="badge.isEarned && badge.earnedAt" class="text-[10px] text-gray-500 mt-0.5">
          {{ formatDate(badge.earnedAt) }}
        </p>

        <!-- Requirement tooltip on hover for unearned -->
        <div
          v-if="!badge.isEarned && badge.requirement"
          class="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10"
        >
          <div class="bg-gray-900 text-gray-300 text-[10px] px-2 py-1 rounded-lg shadow-xl whitespace-nowrap border border-white/10">
            {{ badge.requirement }}
          </div>
        </div>
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="!isLoading && filteredBadges.length === 0" class="text-center py-12 text-gray-500">
      <span class="mdi mdi-medal-outline text-4xl mb-2 block"></span>
      <p class="text-sm">No hay insignias en esta categoría</p>
    </div>

    <!-- Badge Detail Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showModal && selectedBadge"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="closeModal"
        >
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/75"></div>

          <!-- Modal content -->
          <div class="relative w-full max-w-sm bg-gray-900/95 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            <!-- Close button -->
            <button
              class="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition-all z-10"
              @click="closeModal"
            >
              <span class="mdi mdi-close text-lg"></span>
            </button>

            <!-- Top gradient area -->
            <div
              class="pt-10 pb-6 flex flex-col items-center"
              :class="selectedBadge.isEarned
                ? 'bg-gradient-to-b ' + categoryColor(selectedBadge.category).replace('from-', 'from-').replace('to-', 'to-') + '/20 to-transparent'
                : 'bg-white/5'"
            >
              <!-- Large icon -->
              <div
                class="w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-all duration-700"
                :class="selectedBadge.isEarned
                  ? 'bg-gradient-to-br ' + categoryColor(selectedBadge.category) + ' shadow-2xl animate-pulse'
                  : 'bg-white/10'"
                :style="selectedBadge.isEarned ? 'animation-duration: 3s' : ''"
              >
                <span
                  :class="['mdi', selectedBadge.iconName, 'text-5xl']"
                  :style="selectedBadge.isEarned ? 'color: white' : 'color: rgba(255,255,255,0.2)'"
                ></span>
              </div>

              <!-- Badge name -->
              <h3 class="text-xl font-bold text-white mb-1">{{ selectedBadge.name }}</h3>

              <!-- Status -->
              <div
                class="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                :class="selectedBadge.isEarned
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-white/10 text-gray-400'"
              >
                <span :class="selectedBadge.isEarned ? 'mdi mdi-check-circle' : 'mdi mdi-lock'"></span>
                {{ selectedBadge.isEarned ? 'Desbloqueado' : 'Bloqueado' }}
              </div>
            </div>

            <!-- Details -->
            <div class="px-6 pb-6 space-y-4">
              <!-- Description -->
              <p v-if="selectedBadge.description" class="text-sm text-gray-300 text-center leading-relaxed">
                {{ selectedBadge.description }}
              </p>

              <!-- Info rows -->
              <div class="space-y-3">
                <!-- Earned date -->
                <div v-if="selectedBadge.isEarned && selectedBadge.earnedAt" class="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                  <span class="mdi mdi-calendar-check text-[#1A3C34] text-lg"></span>
                  <div>
                    <p class="text-[10px] text-gray-500 uppercase tracking-wider">Conseguido el</p>
                    <p class="text-sm text-white font-medium">{{ formatDate(selectedBadge.earnedAt) }}</p>
                  </div>
                </div>

                <!-- Requirement -->
                <div v-if="selectedBadge.requirement" class="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                  <span class="mdi mdi-target text-[#1A3C34] text-lg"></span>
                  <div>
                    <p class="text-[10px] text-gray-500 uppercase tracking-wider">Requisito</p>
                    <p class="text-sm text-white font-medium">{{ selectedBadge.requirement }}</p>
                  </div>
                </div>

                <!-- Category -->
                <div class="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                  <span class="mdi mdi-tag text-[#1A3C34] text-lg"></span>
                  <div>
                    <p class="text-[10px] text-gray-500 uppercase tracking-wider">Categoría</p>
                    <p class="text-sm text-white font-medium capitalize">{{ selectedBadge.category }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: all 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.9) translateY(20px);
}
</style>
