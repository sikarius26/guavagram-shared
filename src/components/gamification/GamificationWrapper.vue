<script setup lang="ts">
import { CampaignRedeemMechanicTypeEnum } from '~/services/apis/models/campaign-redeem-mechanic-type-enum'
import type { VoucherViewModel } from '~/services/apis/models/voucher-view-model'

const props = defineProps<{
  type: number
  voucher: VoucherViewModel
}>()

const emit = defineEmits<{ revealed: [] }>()

const gameCompleted = ref(false)

const onRevealed = () => {
  gameCompleted.value = true
  setTimeout(() => emit('revealed'), 400)
}
</script>

<template>
  <div class="flex flex-col items-center py-6">
    <ClientOnly>
      <Transition name="fade" mode="out-in">
        <div v-if="!gameCompleted" key="game" class="w-full flex flex-col items-center">
          <ScratchCard
            v-if="type === CampaignRedeemMechanicTypeEnum.Scratch"
            @revealed="onRevealed"
          />
          <RouletteWheel
            v-else-if="type === CampaignRedeemMechanicTypeEnum.Roulette"
            @revealed="onRevealed"
          />
          <ThreeCards
            v-else-if="type === CampaignRedeemMechanicTypeEnum.ThreeCards"
            @revealed="onRevealed"
          />
          <GiftBox
            v-else-if="type === CampaignRedeemMechanicTypeEnum.GiftBox"
            @revealed="onRevealed"
          />
        </div>
      </Transition>
    </ClientOnly>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
