<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCreatorCampaigns, type CampaignKind } from '~/composables/useCreatorCampaigns'
import { notifier } from '~/services/notification'

const { t } = useI18n()
const props = defineProps<{ handle: string }>()
const { campaigns, load, join } = useCreatorCampaigns(() => props.handle)

onMounted(load)

const active = computed(() => campaigns.value.filter((c) => c.status !== 'ended'))

const kindMeta = computed<Record<CampaignKind, { label: string; icon: string; color: string; bg: string }>>(() => ({
  challenge: { label: t('campaignKindChallenge'), icon: 'mdi-trophy-outline', color: '#ef4444', bg: 'from-red-500 to-orange-500' },
  giveaway: { label: t('campaignKindGiveaway'), icon: 'mdi-gift-outline', color: '#8b5cf6', bg: 'from-violet-500 to-purple-600' },
  'voucher-drop': { label: t('campaignKindVoucher'), icon: 'mdi-ticket-percent-outline', color: '#10b981', bg: 'from-emerald-500 to-teal-500' },
}))

async function doJoin(id: string, kind: CampaignKind) {
  try {
    const res = await join(id)
    if (kind === 'voucher-drop' && res?.code) {
      notifier.notifySuccess(t('voucherCodeObtained', { code: res.code }))
    } else if (kind === 'giveaway') {
      notifier.notifySuccess(t('joinedGiveaway'))
    } else {
      notifier.notifySuccess(t('joinedChallenge'))
    }
  } catch (e: any) {
    notifier.notifyError(e?.data?.statusMessage || e?.message || t('couldNotJoin'))
  }
}

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) }
  catch { return iso }
}
</script>

<template>
  <div v-if="active.length" class="flex flex-col gap-3 px-5">
    <article v-for="c in active" :key="c.id"
      class="relative rounded-2xl overflow-hidden bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-[0_4px_14px_-6px_rgba(0,0,0,0.1)]">
      <div class="h-1.5 bg-gradient-to-r" :class="kindMeta[c.kind].bg"></div>
      <div class="p-4">
        <div class="flex items-start gap-3">
          <div class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            :style="{ backgroundColor: kindMeta[c.kind].color + '20' }">
            <span class="mdi text-xl" :class="kindMeta[c.kind].icon" :style="{ color: kindMeta[c.kind].color }"></span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-0.5">
              <span class="text-[10px] font-bold uppercase tracking-wider" :style="{ color: kindMeta[c.kind].color }">
                {{ kindMeta[c.kind].label }}
              </span>
              <span v-if="c.status === 'upcoming'" class="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{{ $t('upcomingLabel') }}</span>
            </div>
            <h3 class="text-[15px] font-black text-gray-900 dark:text-white leading-tight">{{ c.title }}</h3>
            <p v-if="c.description" class="text-[12px] text-gray-600 dark:text-white/70 mt-1 leading-snug line-clamp-2">
              {{ c.description }}
            </p>
            <div class="flex items-center gap-3 flex-wrap mt-2 text-[11px] text-gray-500 dark:text-white/50">
              <span v-if="c.rewardLabel" class="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                <span class="mdi mdi-gift-outline"></span>{{ c.rewardLabel }}
              </span>
              <span v-if="c.sponsorStore" class="flex items-center gap-1">
                <span class="mdi mdi-storefront-outline"></span>@{{ c.sponsorStore }}
              </span>
              <span class="flex items-center gap-1">
                <span class="mdi mdi-clock-outline"></span>hasta {{ fmtDate(c.endsAt) }}
              </span>
              <span class="flex items-center gap-1">
                <span class="mdi mdi-account-multiple-outline"></span>
                {{ c.participantCount }}<template v-if="c.capacity">/{{ c.capacity }}</template>
              </span>
            </div>
          </div>
        </div>

        <div v-if="c.hasJoined" class="mt-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 flex items-center gap-2 text-[12px] font-bold">
          <span class="mdi mdi-check-circle"></span>
          <template v-if="c.kind === 'voucher-drop' && c.code">{{ $t('codeObtained') }}: <span class="font-mono bg-white/60 dark:bg-black/20 px-2 py-0.5 rounded">{{ c.code }}</span></template>
          <template v-else-if="c.kind === 'giveaway'">{{ $t('participatingGiveaway') }}</template>
          <template v-else>{{ $t('participatingChallenge') }}</template>
        </div>
        <button v-else @click="doJoin(c.id, c.kind)"
          :disabled="c.status === 'upcoming'"
          class="mt-3 w-full py-2.5 rounded-xl text-white text-[13px] font-bold bg-gradient-to-r shadow-md active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          :class="kindMeta[c.kind].bg">
          <template v-if="c.status === 'upcoming'">{{ $t('campaignUpcoming', { date: fmtDate(c.startsAt) }) }}</template>
          <template v-else-if="c.kind === 'voucher-drop'">{{ $t('getVoucher') }}</template>
          <template v-else-if="c.kind === 'giveaway'">{{ $t('joinGiveaway') }}</template>
          <template v-else>{{ $t('joinChallenge') }}</template>
        </button>

        <div v-if="c.isWinner" class="mt-2 p-2.5 rounded-xl bg-violet-100 text-violet-800 text-center text-[12px] font-black">
          <span class="mdi mdi-party-popper"></span> {{ $t('youWon') }}
        </div>
      </div>
    </article>
  </div>
</template>
