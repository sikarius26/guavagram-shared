<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import CreatorReviewsPanel from '~/components/creator/reviews/CreatorReviewsPanel.vue'
import CreatorCampaignsPanel from '~/components/creator/campaigns/CreatorCampaignsPanel.vue'
import CreatorMarketplacePanel from '~/components/creator/marketplace/CreatorMarketplacePanel.vue'
import { useCreatorVerification } from '~/composables/useCreatorVerification'

const props = defineProps<{ handle?: string }>()

type HubTab = 'reviews' | 'campaigns' | 'offers'
const activeTab = ref<HubTab>('campaigns')

const { contactsBrought, threshold, isVerified, remaining, progressPct, isTabLocked } = useCreatorVerification()

const route = useRoute()
onMounted(() => {
  const sub = route.query.sub as string | undefined
  if (sub && ['reviews', 'campaigns', 'offers'].includes(sub)) {
    activeTab.value = sub as HubTab
  }
})

const tabs: Array<{ id: HubTab; label: string; icon: string; dot: string; desc: string }> = [
  { id: 'campaigns', label: 'Campañas', icon: 'mdi-trophy-outline', dot: '#22c55e', desc: 'Trae gente a restaurantes — el paso 1' },
  { id: 'reviews', label: 'Reseñas pagadas', icon: 'mdi-star-outline', dot: '#f59e0b', desc: 'Restaurantes te pagan por reseñar su local' },
  { id: 'offers', label: 'Trabajos pagados', icon: 'mdi-tag-heart-outline', dot: '#ef4444', desc: 'Restaurantes te contactan para campañas' },
]

const activeTabLocked = computed(() => isTabLocked(activeTab.value))
const activeTabLabel = computed(() => tabs.find(t => t.id === activeTab.value)?.label ?? '')
</script>

<template>
  <div class="flex flex-col min-h-full bg-gradient-to-br from-[#fff8f6] via-white to-[#f0f4ff]">

    <!-- ============ STICKY TABS HEADER ============ -->
    <header class="sticky top-14 lg:top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#eee]">
      <div class="px-6 lg:px-8 py-4">
        <div class="hidden lg:flex items-center gap-3 mb-3">
          <div class="size-10 rounded-2xl bg-gradient-to-br from-[#ff2d23] to-[#ff6b4a] flex items-center justify-center shadow-[0_4px_14px_rgba(255,45,35,0.3)]">
            <span class="mdi mdi-briefcase-variant text-white text-lg"></span>
          </div>
          <div>
            <h1 class="text-[20px] lg:text-[24px] font-black tracking-[-0.03em] text-[#1a1c1b] leading-tight">
              Creator hub
            </h1>
            <p class="text-[12px] text-[#666]">Gana dinero trayendo gente a restaurantes.</p>
          </div>
        </div>

        <!-- Tab pills -->
        <nav class="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1">
          <button v-for="t in tabs" :key="t.id" type="button" @click="activeTab = t.id"
            class="group inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[12px] font-bold transition-all whitespace-nowrap border"
            :class="activeTab === t.id
              ? 'bg-[#1a1c1b] text-white border-[#1a1c1b] shadow-[0_4px_14px_rgba(0,0,0,0.18)]'
              : 'bg-[#f5f5f5] text-[#666] border-[#e5e5e5] hover:bg-[#eee] hover:text-[#1a1c1b]'">
            <span class="size-1.5 rounded-full transition-all"
              :class="activeTab === t.id ? 'bg-white' : ''"
              :style="activeTab === t.id ? {} : { backgroundColor: t.dot }"></span>
            <span class="mdi" :class="t.icon"></span>
            <span>{{ t.label }}</span>
            <span v-if="isTabLocked(t.id)"
              class="mdi mdi-lock text-[11px] -ml-0.5"
              :class="activeTab === t.id ? 'text-white/70' : 'text-[#999]'"
              title="Bloqueado hasta verificación"></span>
          </button>
        </nav>
        <p class="text-[11px] text-[#888] mt-2">
          {{ tabs.find(t => t.id === activeTab)?.desc }}
        </p>
      </div>
    </header>

    <!-- ============ TAB CONTENT ============ -->
    <div class="flex-1 min-h-0">
      <!-- Verification gate: blocks Reseñas pagadas + Trabajos pagados until threshold reached -->
      <div v-if="activeTabLocked" class="px-6 lg:px-8 py-10">
        <div class="max-w-xl mx-auto rounded-3xl bg-white border border-[#e5e5e5] shadow-[0_12px_40px_-16px_rgba(0,0,0,0.12)] overflow-hidden">
          <!-- Lock hero -->
          <div class="relative bg-gradient-to-br from-[#fff4f2] via-white to-[#fff8f6] p-8 text-center overflow-hidden">
            <div class="pointer-events-none absolute inset-0 opacity-60"
              style="background-image: radial-gradient(circle at 30% 20%, rgba(255,45,35,0.12), transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,107,74,0.1), transparent 50%);"></div>
            <div class="relative">
              <div class="inline-flex size-16 rounded-2xl bg-gradient-to-br from-[#ff2d23] to-[#ff6b4a] items-center justify-center shadow-[0_8px_24px_rgba(255,45,35,0.35)] mb-4">
                <span class="mdi mdi-lock text-white text-2xl"></span>
              </div>
              <h2 class="text-[22px] font-black tracking-[-0.02em] text-[#1a1c1b] leading-tight">
                Lleva <span class="text-[#ff2d23]">{{ threshold }} personas</span> a restaurantes
                <br>y abres <span class="whitespace-nowrap">“{{ activeTabLabel }}”</span>
              </h2>
              <p class="text-[13px] text-[#666] mt-3 leading-relaxed max-w-sm mx-auto">
                Cada vez que alguien reserva o usa tu código en un restaurante, suma <span class="font-black text-[#1a1c1b]">1</span>.
              </p>
            </div>
          </div>

          <!-- Progress -->
          <div class="px-8 py-6 border-t border-[#f0f0f0]">
            <div class="flex items-baseline justify-between mb-2">
              <span class="text-[12px] font-bold text-[#1a1c1b]">Vas por aquí</span>
              <span class="text-[14px] font-black text-[#1a1c1b] tabular-nums">
                {{ contactsBrought }} <span class="text-[#888] font-bold">de {{ threshold }}</span>
              </span>
            </div>
            <div class="h-3 rounded-full bg-[#f0f0f0] overflow-hidden">
              <div class="h-full rounded-full bg-gradient-to-r from-[#ff2d23] to-[#ff6b4a] transition-all duration-500"
                :style="{ width: progressPct + '%' }"></div>
            </div>
            <p class="text-[12px] text-[#666] mt-2">
              Te faltan <span class="font-black text-[#1a1c1b]">{{ remaining }}</span>.
            </p>
          </div>

          <!-- How to bring contacts -->
          <div class="px-8 pb-8">
            <p class="text-[13px] font-black text-[#1a1c1b] mb-3">Tres maneras fáciles:</p>
            <ul class="space-y-3">
              <li class="flex items-start gap-3">
                <span class="inline-flex size-7 rounded-full bg-[#fff4f2] text-[#ff2d23] items-center justify-center shrink-0 mt-0.5">
                  <span class="mdi mdi-silverware-fork-knife text-[14px]"></span>
                </span>
                <span class="text-[13px] text-[#1a1c1b] leading-snug">
                  Pon tus restaurantes favoritos en tu bio. <span class="text-[#666]">Cuando alguien reserve = suma 1.</span>
                </span>
              </li>
              <li class="flex items-start gap-3">
                <span class="inline-flex size-7 rounded-full bg-[#fff4f2] text-[#ff2d23] items-center justify-center shrink-0 mt-0.5">
                  <span class="mdi mdi-share-variant text-[14px]"></span>
                </span>
                <span class="text-[13px] text-[#1a1c1b] leading-snug">
                  Comparte tu perfil con amigos y seguidores.
                </span>
              </li>
              <li class="flex items-start gap-3">
                <span class="inline-flex size-7 rounded-full bg-[#fff4f2] text-[#ff2d23] items-center justify-center shrink-0 mt-0.5">
                  <span class="mdi mdi-ticket-percent text-[14px]"></span>
                </span>
                <span class="text-[13px] text-[#1a1c1b] leading-snug">
                  Publica códigos de descuento. <span class="text-[#666]">Cada uso = suma 1.</span>
                </span>
              </li>
            </ul>

            <NuxtLink to="/creator-dashboard/bio"
              class="mt-6 flex items-center justify-center gap-1.5 w-full py-3.5 rounded-xl bg-[#1a1c1b] text-white text-[13px] font-black hover:bg-[#2a2a2a] transition-colors">
              Empezar: añadir restaurantes a mi bio
              <span class="mdi mdi-arrow-right text-[14px]"></span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <template v-else>
        <CreatorReviewsPanel v-if="activeTab === 'reviews'" />
        <CreatorCampaignsPanel v-else-if="activeTab === 'campaigns'" :handle="props.handle ?? ''" />
        <CreatorMarketplacePanel v-else-if="activeTab === 'offers'" />
      </template>
    </div>
  </div>
</template>
