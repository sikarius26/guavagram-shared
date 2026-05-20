import { ref, computed } from 'vue'
import { gamificationApiClient } from '~/services/apis/api.client.gamification'
import { GamificationActionTypeEnum } from '~/services/apis/models/gamification-action-type-enum'
import { GamificationRankEnum } from '~/services/apis/models/gamification-rank-enum'
import { GamificationProfileViewModel } from '~/services/apis/models/gamification-profile-view-model'
import type { GamificationActionViewModel } from '~/services/apis/models/gamification-action-view-model'
import { GamificationRewardViewModel } from '~/services/apis/models/gamification-reward-view-model'
import { VoucherRewardTypeEnum } from '~/services/apis/models/voucher-reward-type-enum'
import { notifier } from '~/services/notification'

// ===== Local fallback (used when /gamification/* endpoints are unavailable) =====
// Lets the GP UX work end-to-end without a backend: balance, toast, rank-up.
// When the real API comes online, server responses take precedence and this
// localStorage layer just shadows them.
const LOCAL_GP_KEY = 'guavagram.gp.local.v1'
type LocalGpState = {
  totalPoints: number
  availablePoints: number
  reviewCount: number
  referralCount: number
  currentStreak: number
  longestStreak: number
}
const defaultLocalState = (): LocalGpState => ({
  totalPoints: 0,
  availablePoints: 0,
  reviewCount: 0,
  referralCount: 0,
  currentStreak: 0,
  longestStreak: 0,
})
const loadLocalState = (): LocalGpState => {
  if (typeof window === 'undefined') return defaultLocalState()
  try {
    const raw = window.localStorage.getItem(LOCAL_GP_KEY)
    if (!raw) return defaultLocalState()
    return { ...defaultLocalState(), ...JSON.parse(raw) }
  } catch { return defaultLocalState() }
}
const persistLocalState = (s: LocalGpState) => {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(LOCAL_GP_KEY, JSON.stringify(s)) } catch {}
}
const rankForPoints = (totalPoints: number): GamificationRankEnum => {
  if (totalPoints >= 15000) return GamificationRankEnum.Leyenda
  if (totalPoints >= 5000) return GamificationRankEnum.Embajador
  if (totalPoints >= 2000) return GamificationRankEnum.Gourmet
  if (totalPoints >= 750) return GamificationRankEnum.Critico
  if (totalPoints >= 250) return GamificationRankEnum.Foodie
  return GamificationRankEnum.Comensal
}
const profileFromLocal = (s: LocalGpState): GamificationProfileViewModel => {
  const rank = rankForPoints(s.totalPoints)
  const nextThresholds: Record<GamificationRankEnum, number> = {
    [GamificationRankEnum.Comensal]: 250,
    [GamificationRankEnum.Foodie]: 750,
    [GamificationRankEnum.Critico]: 2000,
    [GamificationRankEnum.Gourmet]: 5000,
    [GamificationRankEnum.Embajador]: 15000,
    [GamificationRankEnum.Leyenda]: 15000,
  }
  return GamificationProfileViewModel.fromJS({
    totalPoints: s.totalPoints,
    availablePoints: s.availablePoints,
    rank,
    currentStreak: s.currentStreak,
    longestStreak: s.longestStreak,
    reviewCount: s.reviewCount,
    referralCount: s.referralCount,
    nextRankPoints: nextThresholds[rank],
    badgeIds: [],
  })
}

// ===== Mock GP catalog =====
// Demo coupons so the "Canjear por descuentos" surface renders end-to-end while
// the catalog endpoint is being built. Each entry is buyable with the local GP
// balance and lands in the existing coupon wallet on redeem.
type MockReward = {
  id: string
  name: string
  description: string
  costPoints: number
  rewardType: VoucherRewardTypeEnum
  discountValue?: number
  iconName: string
}
const MOCK_REWARDS_DATA: MockReward[] = [
  { id: 'mock-coffee', name: 'Café o infusión gratis', description: 'En cualquier restaurante de la red Guava', costPoints: 200, rewardType: VoucherRewardTypeEnum.FreeItems, iconName: 'mdi-coffee-outline' },
  { id: 'mock-disc-10', name: '-10% en tu próxima visita', description: 'Hasta 30€ de descuento total', costPoints: 500, rewardType: VoucherRewardTypeEnum.DiscountPercentage, discountValue: 10, iconName: 'mdi-ticket-percent-outline' },
  { id: 'mock-dessert', name: 'Postre de la casa gratis', description: 'Termina la cena con un dulce', costPoints: 800, rewardType: VoucherRewardTypeEnum.FreeItems, iconName: 'mdi-cupcake' },
  { id: 'mock-flat-5', name: '-5€ en tu pedido', description: 'Mínimo 25€ de gasto', costPoints: 1000, rewardType: VoucherRewardTypeEnum.DiscountAmount, discountValue: 5, iconName: 'mdi-cash-multiple' },
  { id: 'mock-starter', name: 'Entrante gratis', description: 'Elige uno del menú del día', costPoints: 1200, rewardType: VoucherRewardTypeEnum.FreeItems, iconName: 'mdi-food-fork-drink' },
  { id: 'mock-cocktails', name: '2x1 en cócteles', description: 'Hasta 2 cócteles por mesa', costPoints: 1500, rewardType: VoucherRewardTypeEnum.Bundle, iconName: 'mdi-glass-cocktail' },
  { id: 'mock-tasting', name: '-15% en menú degustación', description: 'En restaurantes seleccionados', costPoints: 2500, rewardType: VoucherRewardTypeEnum.DiscountPercentage, discountValue: 15, iconName: 'mdi-silverware-variant' },
  { id: 'mock-group', name: '-25% para grupos de 4+', description: 'Aplicable en mesa completa', costPoints: 3000, rewardType: VoucherRewardTypeEnum.DiscountPercentage, discountValue: 25, iconName: 'mdi-account-group-outline' },
  { id: 'mock-bday', name: '-50% en tu cumpleaños', description: 'El día de tu cumple, sólo para ti', costPoints: 4000, rewardType: VoucherRewardTypeEnum.DiscountPercentage, discountValue: 50, iconName: 'mdi-cake-variant' },
  { id: 'mock-dinner-2', name: 'Cena gratis para 2', description: 'Menú degustación con bebida incluida', costPoints: 8000, rewardType: VoucherRewardTypeEnum.FreeMeal, iconName: 'mdi-silverware-fork-knife' },
]
const buildMockRewards = (): GamificationRewardViewModel[] =>
  MOCK_REWARDS_DATA.map(d => GamificationRewardViewModel.fromJS({
    id: d.id,
    name: d.name,
    description: d.description,
    costPoints: d.costPoints,
    rewardType: d.rewardType,
    discountValue: d.discountValue,
    iconName: d.iconName,
    isAvailable: true,
  }))

// Shared state across components
const profile = ref<GamificationProfileViewModel | null>(null)
const recentActions = ref<GamificationActionViewModel[]>([])
const rewards = ref<GamificationRewardViewModel[]>([])
const isLoading = ref(false)
const pendingToast = ref<{ points: number; description: string } | null>(null)

// Achievement banner system
export type AchievementType = 'points' | 'rank-up' | 'badge' | 'challenge'
export interface AchievementBanner {
  type: AchievementType
  title: string
  subtitle: string
  icon: string
  gradient: string
  color: string
  points?: number
  rankName?: string
  badgeName?: string
}
const pendingBanner = ref<AchievementBanner | null>(null)
const bannerQueue = ref<AchievementBanner[]>([])

// Rank configuration
const RANKS = [
  { rank: GamificationRankEnum.Comensal, name: 'Comensal', icon: 'mdi-silverware-fork-knife', minPoints: 0, color: '#9ca3af', gradient: 'from-gray-400 to-gray-500', tagline: 'Tu aventura empieza aquí' },
  { rank: GamificationRankEnum.Foodie, name: 'Foodie', icon: 'mdi-fire', minPoints: 250, color: '#f97316', gradient: 'from-orange-400 to-orange-600', tagline: 'Tienes buen paladar' },
  { rank: GamificationRankEnum.Critico, name: 'Crítico', icon: 'mdi-star-shooting', minPoints: 750, color: '#8b5cf6', gradient: 'from-violet-500 to-purple-600', tagline: 'Tu opinión importa' },
  { rank: GamificationRankEnum.Gourmet, name: 'Gourmet', icon: 'mdi-diamond-stone', minPoints: 2000, color: '#0ea5e9', gradient: 'from-sky-400 to-blue-600', tagline: 'Paladar refinado' },
  { rank: GamificationRankEnum.Embajador, name: 'Embajador', icon: 'mdi-shield-crown', minPoints: 5000, color: '#f59e0b', gradient: 'from-amber-400 to-yellow-600', tagline: 'Referente gastronómico' },
  { rank: GamificationRankEnum.Leyenda, name: 'Leyenda', icon: 'mdi-crown', minPoints: 15000, color: '#ef4444', gradient: 'from-red-500 via-rose-500 to-pink-600', tagline: 'Inmortal del sabor' },
] as const

// Action point values (for UI display before server response)
const ACTION_POINTS: Record<GamificationActionTypeEnum, number> = {
  // Transaccionales
  [GamificationActionTypeEnum.PlaceOrder]: 50,            // + 1 GP por € (calculado en backend)
  [GamificationActionTypeEnum.PlaceBooking]: 30,
  [GamificationActionTypeEnum.AttendBooking]: 50,          // bonus por asistir
  [GamificationActionTypeEnum.PremiumTicket]: 100,         // menu degustacion / ticket alto

  // Reputacion
  [GamificationActionTypeEnum.Review]: 50,
  [GamificationActionTypeEnum.ReviewWithPhoto]: 100,
  [GamificationActionTypeEnum.ReviewWithVideo]: 150,
  [GamificationActionTypeEnum.FirstReviewOnStore]: 150,
  [GamificationActionTypeEnum.HighRatingReview]: 25,
  [GamificationActionTypeEnum.HelpfulReviewVote]: 10,

  // Referral / red
  [GamificationActionTypeEnum.ShareStore]: 15,
  [GamificationActionTypeEnum.AddFriend]: 15,
  [GamificationActionTypeEnum.InviteFriendRegistered]: 30,
  [GamificationActionTypeEnum.InviteFriendFirstOrder]: 100,
  [GamificationActionTypeEnum.UseCreatorCode]: 25,

  // Contenido generado
  [GamificationActionTypeEnum.UploadDishPhoto]: 30,
  [GamificationActionTypeEnum.TagStoreExternalSocial]: 75,
  [GamificationActionTypeEnum.FeaturedPhoto]: 50,

  // Engagement pasivo
  [GamificationActionTypeEnum.FollowStore]: 10,
  [GamificationActionTypeEnum.EnableNotifications]: 5,
  [GamificationActionTypeEnum.FavoriteStore]: 5,
  [GamificationActionTypeEnum.ProfileVisit]: 2,
  [GamificationActionTypeEnum.CompleteProfile]: 75,

  // Fidelidad / streaks
  [GamificationActionTypeEnum.SecondVisit]: 50,
  [GamificationActionTypeEnum.FifthVisit]: 150,
  [GamificationActionTypeEnum.TenthVisit]: 500,
  [GamificationActionTypeEnum.BirthdayVisit]: 100,
  [GamificationActionTypeEnum.DailyCheckIn]: 5,
  [GamificationActionTypeEnum.WeekStreak]: 50,
  [GamificationActionTypeEnum.MonthStreak]: 300,

  // Eventos / challenges
  [GamificationActionTypeEnum.CompleteSponsoredChallenge]: 100, // base, el restaurante define extra
  [GamificationActionTypeEnum.AttendSpecialEvent]: 200,
  [GamificationActionTypeEnum.FirstTimeAtStore]: 100,
}

const ACTION_LABELS: Record<GamificationActionTypeEnum, string> = {
  // Transaccionales
  [GamificationActionTypeEnum.PlaceOrder]: 'Pedido realizado',
  [GamificationActionTypeEnum.PlaceBooking]: 'Reserva hecha',
  [GamificationActionTypeEnum.AttendBooking]: 'Reserva cumplida',
  [GamificationActionTypeEnum.PremiumTicket]: 'Menu degustacion / ticket alto',

  // Reputacion
  [GamificationActionTypeEnum.Review]: 'Resena verificada',
  [GamificationActionTypeEnum.ReviewWithPhoto]: 'Resena verificada con foto',
  [GamificationActionTypeEnum.ReviewWithVideo]: 'Resena verificada con video',
  [GamificationActionTypeEnum.FirstReviewOnStore]: 'Primera resena del restaurante',
  [GamificationActionTypeEnum.HighRatingReview]: 'Resena 4-5 estrellas',
  [GamificationActionTypeEnum.HelpfulReviewVote]: 'Resena marcada util',

  // Referral
  [GamificationActionTypeEnum.ShareStore]: 'Compartir perfil',
  [GamificationActionTypeEnum.AddFriend]: 'Anadir amigo',
  [GamificationActionTypeEnum.InviteFriendRegistered]: 'Amigo invitado se registra',
  [GamificationActionTypeEnum.InviteFriendFirstOrder]: 'Amigo referido hace 1er pedido',
  [GamificationActionTypeEnum.UseCreatorCode]: 'Usar codigo de creator',

  // Contenido
  [GamificationActionTypeEnum.UploadDishPhoto]: 'Subir foto de plato',
  [GamificationActionTypeEnum.TagStoreExternalSocial]: 'Tag en story/reel externa',
  [GamificationActionTypeEnum.FeaturedPhoto]: 'Foto destacada por el restaurante',

  // Engagement
  [GamificationActionTypeEnum.FollowStore]: 'Seguir restaurante',
  [GamificationActionTypeEnum.EnableNotifications]: 'Activar notificaciones',
  [GamificationActionTypeEnum.FavoriteStore]: 'Anadir a favoritos',
  [GamificationActionTypeEnum.ProfileVisit]: 'Visitar perfil (1a del mes)',
  [GamificationActionTypeEnum.CompleteProfile]: 'Completar perfil',

  // Fidelidad
  [GamificationActionTypeEnum.SecondVisit]: '2a visita al local',
  [GamificationActionTypeEnum.FifthVisit]: '5a visita al local',
  [GamificationActionTypeEnum.TenthVisit]: '10a visita al local',
  [GamificationActionTypeEnum.BirthdayVisit]: 'Cumpleanos con el restaurante',
  [GamificationActionTypeEnum.DailyCheckIn]: 'Check-in diario',
  [GamificationActionTypeEnum.WeekStreak]: 'Racha semanal',
  [GamificationActionTypeEnum.MonthStreak]: 'Racha mensual',

  // Eventos / challenges
  [GamificationActionTypeEnum.CompleteSponsoredChallenge]: 'Completar challenge patrocinado',
  [GamificationActionTypeEnum.AttendSpecialEvent]: 'Asistir a evento especial',
  [GamificationActionTypeEnum.FirstTimeAtStore]: 'Primera visita al local',
}

export function useGamification() {

  const currentRank = computed(() => {
    if (!profile.value) return RANKS[0]
    return RANKS.find(r => r.rank === profile.value!.rank) || RANKS[0]
  })

  const nextRank = computed(() => {
    const idx = RANKS.findIndex(r => r.rank === currentRank.value.rank)
    return idx < RANKS.length - 1 ? RANKS[idx + 1] : null
  })

  const progressToNextRank = computed(() => {
    if (!profile.value || !nextRank.value) return 100
    const current = currentRank.value.minPoints
    const next = nextRank.value.minPoints
    const points = profile.value.totalPoints
    return Math.min(100, Math.round(((points - current) / (next - current)) * 100))
  })

  const streakMultiplier = computed(() => {
    if (!profile.value) return 1
    const streak = profile.value.currentStreak
    if (streak >= 30) return 3
    if (streak >= 14) return 2
    if (streak >= 7) return 1.5
    return 1
  })

  const loadProfile = async () => {
    isLoading.value = true
    try {
      const remote = await gamificationApiClient.gamificationProfile()
      // Treat empty/missing payload as backend unavailable.
      if (!remote || typeof remote.totalPoints !== 'number') {
        profile.value = profileFromLocal(loadLocalState())
      } else {
        profile.value = remote
      }
    } catch (err) {
      console.warn('Gamification profile load failed, using local fallback', err)
      profile.value = profileFromLocal(loadLocalState())
    } finally {
      isLoading.value = false
    }
  }

  const loadActions = async (skip = 0, take = 20) => {
    try {
      recentActions.value = await gamificationApiClient.gamificationActions(skip, take)
    } catch (err) {
      console.warn('Gamification actions load failed', err)
    }
  }

  const loadRewards = async () => {
    try {
      const remote = await gamificationApiClient.gamificationRewards()
      if (!remote || remote.length === 0) {
        rewards.value = buildMockRewards()
      } else {
        rewards.value = remote
      }
    } catch (err) {
      console.warn('Gamification rewards load failed, using local catalog', err)
      rewards.value = buildMockRewards()
    }
  }

  const showBanner = (banner: AchievementBanner) => {
    bannerQueue.value.push(banner)
    if (!pendingBanner.value) {
      pendingBanner.value = bannerQueue.value.shift() || null
    }
  }

  const consumeBanner = () => {
    const banner = pendingBanner.value
    pendingBanner.value = bannerQueue.value.shift() || null
    return banner
  }

  const trackAction = async (actionType: GamificationActionTypeEnum, storeId?: string) => {
    const oldRank = profile.value?.rank ?? rankForPoints(loadLocalState().totalPoints)
    let result: GamificationActionViewModel | null = null
    try {
      result = await gamificationApiClient.gamificationTrackAction(actionType, storeId)
    } catch (err) {
      console.warn('Gamification track failed, using local fallback', err)
    }

    // Treat any non-numeric/zero/missing totalPoints from the server as
    // "backend not awarding" and apply the local fallback so the user still
    // sees the GP toast and balance update.
    const serverAwarded = !!(result && typeof result.totalPoints === 'number' && result.totalPoints > 0)

    if (!serverAwarded) {
      const points = ACTION_POINTS[actionType] ?? 0
      if (points > 0) {
        const state = loadLocalState()
        state.totalPoints += points
        state.availablePoints += points
        if (
          actionType === GamificationActionTypeEnum.Review ||
          actionType === GamificationActionTypeEnum.ReviewWithPhoto ||
          actionType === GamificationActionTypeEnum.ReviewWithVideo ||
          actionType === GamificationActionTypeEnum.FirstReviewOnStore
        ) {
          state.reviewCount += 1
        }
        persistLocalState(state)
        pendingToast.value = {
          points,
          description: ACTION_LABELS[actionType] || 'Puntos ganados'
        }
      }
    } else {
      pendingToast.value = {
        points: result!.totalPoints,
        description: ACTION_LABELS[actionType] || 'Puntos ganados'
      }
    }

    await loadProfile()

    if (profile.value && oldRank !== undefined && profile.value.rank !== oldRank) {
      const newRankConfig = RANKS.find(r => r.rank === profile.value!.rank)
      if (newRankConfig) {
        showBanner({
          type: 'rank-up',
          title: '¡Has subido de rango!',
          subtitle: newRankConfig.tagline,
          icon: newRankConfig.icon,
          gradient: newRankConfig.gradient,
          color: newRankConfig.color,
          rankName: newRankConfig.name,
        })
      }
    }

    return result
  }

  const triggerBadgeBanner = (badgeName: string, badgeIcon: string) => {
    showBanner({
      type: 'badge',
      title: '¡Insignia desbloqueada!',
      subtitle: badgeName,
      icon: badgeIcon,
      gradient: 'from-violet-500 to-purple-600',
      color: '#8b5cf6',
      badgeName,
    })
  }

  const triggerChallengeBanner = (challengeTitle: string, points: number) => {
    showBanner({
      type: 'challenge',
      title: '¡Reto completado!',
      subtitle: challengeTitle,
      icon: 'mdi-flag-checkered',
      gradient: 'from-emerald-500 to-teal-600',
      color: '#10b981',
      points,
    })
  }

  const checkIn = async () => {
    try {
      const result = await gamificationApiClient.gamificationCheckIn()
      if (result && result.totalPoints > 0) {
        pendingToast.value = {
          points: result.totalPoints,
          description: 'Check-in diario'
        }
      }
      await loadProfile()
      return result
    } catch (err) {
      // Already checked in today or error - silent
      return null
    }
  }

  const redeemReward = async (rewardId: string, storeId?: string) => {
    const reward = rewards.value.find(r => r.id === rewardId)
    const isMock = rewardId.startsWith('mock-')

    // Gate: 3 lifetime prerequisites (verified restaurant brought, verified
    // review submitted, referred signup). Once unlocked, stays unlocked.
    // Applies to BOTH the real API path and the mock path.
    const { useGpRedemptionGates } = await import('./useGpRedemptionGates')
    const gates = useGpRedemptionGates()
    if (!gates.canRedeem.value) {
      gates.openModal()
      return
    }

    if (!isMock) {
      try {
        const { GamificationRedeemRequest } = await import('~/services/apis/models/gamification-redeem-request')
        const request = GamificationRedeemRequest.fromJS({ rewardId, storeId })
        await gamificationApiClient.gamificationRedeem(request)
        notifier.notifySuccess('Recompensa canjeada')
        await loadProfile()
        await loadRewards()
        return
      } catch (err) {
        notifier.notifyError('Error al canjear', err as Error)
        return
      }
    }

    // Mock flow: deduct from local GP balance and drop a synthetic coupon into
    // the wallet so the modal's promise ("disponible en la pestaña Cupones")
    // is honored without a backend.
    if (!reward) return
    const state = loadLocalState()
    if (state.availablePoints < reward.costPoints) {
      notifier.notifyWarning(`Te faltan ${reward.costPoints - state.availablePoints} GP`)
      return
    }
    state.availablePoints -= reward.costPoints
    persistLocalState(state)

    try {
      const { useCouponWallet } = await import('./useCouponWallet')
      const wallet = useCouponWallet()
      const code = `GP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
      const isPercent = reward.rewardType === VoucherRewardTypeEnum.DiscountPercentage
      const isAmount = reward.rewardType === VoucherRewardTypeEnum.DiscountAmount
      wallet.save({
        code,
        storeName: 'Red Guava',
        storeSlug: `gp-${reward.id}`,
        discountLabel: reward.name,
        discountPercent: isPercent ? reward.discountValue : undefined,
        discountFlatCents: isAmount && reward.discountValue ? reward.discountValue * 100 : undefined,
      })
    } catch (err) {
      console.warn('Failed to save GP coupon to wallet', err)
    }

    notifier.notifySuccess('¡Cupón canjeado! Disponible en tu wallet.')
    await loadProfile()
  }

  const consumeToast = () => {
    const toast = pendingToast.value
    pendingToast.value = null
    return toast
  }

  return {
    // State
    profile,
    recentActions,
    rewards,
    isLoading,
    pendingToast,
    pendingBanner,
    bannerQueue,
    // Computed
    currentRank,
    nextRank,
    progressToNextRank,
    streakMultiplier,
    // Constants
    RANKS,
    ACTION_POINTS,
    ACTION_LABELS,
    // Methods
    loadProfile,
    loadActions,
    loadRewards,
    trackAction,
    checkIn,
    redeemReward,
    consumeToast,
    showBanner,
    consumeBanner,
    triggerBadgeBanner,
    triggerChallengeBanner,
  }
}
