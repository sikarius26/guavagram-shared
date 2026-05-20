<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { notifier } from '~/services/notification'

const { t } = useI18n()

const props = defineProps<{
  code: string
  percentOff?: number
  flatOffCents?: number
  description?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'full' | 'compact'  // compact = solo % off en pill, con code como label afuera
}>()

const discountLabel = computed(() => {
  if (props.percentOff && props.percentOff > 0) return `-${props.percentOff}%`
  if (props.flatOffCents && props.flatOffCents > 0) {
    const euros = props.flatOffCents / 100
    return `-${euros.toFixed(euros % 1 === 0 ? 0 : 2)}€`
  }
  return ''
})

const copyCode = async () => {
  if (!props.code) return
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(props.code)
    } else {
      const ta = document.createElement('textarea')
      ta.value = props.code
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    notifier.notifySuccess(t('codeCopied', { code: props.code }))
  } catch (e) {
    notifier.notifyError(t('couldNotCopy'))
  }
}
</script>

<template>
  <!-- COMPACT: pill estrecho solo con el codigo + copy (el %OFF ya se muestra en el badge de la cover) -->
  <button
    v-if="variant === 'compact'"
    type="button"
    @click.stop.prevent="copyCode"
    class="w-full inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl bg-gradient-emerald text-white shadow-pill-emerald hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(16,185,129,0.35)] active:scale-[0.98] transition-all min-w-0"
    :title="description || 'Copiar codigo'"
  >
    <span class="mdi mdi-ticket-percent text-[13px] shrink-0"></span>
    <span class="text-[11px] font-black tabular-nums tracking-wide truncate">{{ code }}</span>
    <span class="mdi mdi-content-copy text-[11px] opacity-70 shrink-0"></span>
  </button>

  <!-- FULL: pill grande tipo voucher completo (default) -->
  <button
    v-else
    type="button"
    @click.stop.prevent="copyCode"
    class="group/pill w-full inline-flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-emerald text-white shadow-pill-emerald hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(16,185,129,0.4)] active:scale-[0.98] transition-all"
    :title="description || 'Copiar codigo'"
  >
    <div class="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
      <span class="mdi mdi-ticket-percent text-[18px]"></span>
    </div>
    <div class="flex-1 flex items-baseline gap-2 min-w-0 text-left">
      <div class="min-w-0">
        <p class="text-[9px] font-bold uppercase tracking-widest opacity-80 leading-none mb-0.5">Codigo exclusivo</p>
        <p class="text-[15px] font-black tabular-nums leading-none whitespace-nowrap">{{ code }}</p>
      </div>
      <span v-if="discountLabel" class="ml-auto text-[18px] font-black leading-none tabular-nums shrink-0">{{ discountLabel }}</span>
    </div>
    <span class="mdi mdi-content-copy text-[16px] opacity-80 shrink-0 group-hover/pill:opacity-100 transition-opacity"></span>
  </button>
</template>
