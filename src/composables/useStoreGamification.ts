import { ref, computed } from 'vue'

export interface StoreRank {
  name: string
  icon: string
  minPoints: number
  color: string
  gradient: string
  tagline: string
}

export interface StoreAchievement {
  id: string
  title: string
  description: string
  icon: string
  color: string
  points: number
  unlockedAt?: string
}

const STORE_RANKS: StoreRank[] = [
  { name: 'Recien abierto',   icon: 'mdi-door-open',            minPoints: 0,      color: '#94a3b8', gradient: 'from-slate-400 to-slate-500',                  tagline: 'Acabas de abrir las puertas' },
  { name: 'En el mapa',       icon: 'mdi-map-marker-check',     minPoints: 100,    color: '#06b6d4', gradient: 'from-cyan-400 to-sky-500',                     tagline: 'Los curiosos empiezan a encontrarte' },
  { name: 'Boca a boca',      icon: 'mdi-account-voice',        minPoints: 300,    color: '#3b82f6', gradient: 'from-blue-400 to-indigo-500',                  tagline: 'La gente habla de ti' },
  { name: 'Mesa reservada',   icon: 'mdi-bookmark-check',       minPoints: 900,    color: '#ec4899', gradient: 'from-pink-400 to-rose-500',                    tagline: 'Tus clientes vuelven y reservan' },
  { name: 'Favorito del barrio', icon: 'mdi-heart',             minPoints: 2500,   color: '#a855f7', gradient: 'from-purple-400 to-fuchsia-500',               tagline: 'Eres imprescindible en tu zona' },
  { name: 'Imperdible',       icon: 'mdi-silverware-fork-knife', minPoints: 7500,  color: '#f97316', gradient: 'from-orange-400 to-red-500',                   tagline: 'Referente de la ciudad' },
  { name: 'Estrella local',   icon: 'mdi-fire',                 minPoints: 20000,  color: '#f59e0b', gradient: 'from-amber-400 to-orange-500',                 tagline: 'Entre los mejores de la zona' },
  { name: 'Icono gastronomico', icon: 'mdi-crown',              minPoints: 60000,  color: '#ef4444', gradient: 'from-red-500 via-rose-500 to-pink-600',        tagline: 'Marcas tendencia en la gastronomia' },
  { name: 'Leyenda',          icon: 'mdi-diamond-stone',        minPoints: 180000, color: '#8b5cf6', gradient: 'from-violet-500 via-purple-600 to-indigo-700',  tagline: 'Una leyenda viva de la gastronomia' },
]

const availablePoints = ref(0)
const totalEarned = ref(0)
const weeklyStreak = ref(0)

const achievements = ref<StoreAchievement[]>([
  { id: 'first-order',      title: 'Primer pedido recibido', description: 'Un cliente hizo su primer pedido en tu local', icon: 'mdi-cart-check',          color: '#22c55e', points: 100 },
  { id: 'coupon-10',        title: '10 cupones canjeados',   description: 'Tus clientes usaron tus vouchers 10 veces',    icon: 'mdi-ticket-percent',      color: '#f59e0b', points: 150 },
  { id: 'first-5star',      title: 'Primera reseña 5★',      description: 'Recibiste tu primera opinión de 5 estrellas',  icon: 'mdi-star',                color: '#f59e0b', points: 50 },
  { id: 'first-referral',   title: 'Primer referral',        description: 'Un cliente trajo a un amigo vía referral',     icon: 'mdi-account-multiple-plus', color: '#6366f1', points: 200 },
  { id: 'menu-photos',      title: 'Menú con fotos',         description: 'Completaste todos los platos con foto o vídeo', icon: 'mdi-image-multiple',     color: '#a855f7', points: 50 },
  { id: 'bio-complete',     title: 'Bio 100%',               description: 'Tu bio está completa con toda la info',        icon: 'mdi-account-check',       color: '#0ea5e9', points: 30 },
  { id: 'reviews-10',       title: '10 reseñas acumuladas',  description: 'Llegaste a 10 opiniones verificadas',          icon: 'mdi-star-box-multiple',   color: '#f59e0b', points: 100 },
  { id: 'first-booking',    title: 'Primera reserva',        description: 'Un cliente reservó mesa en tu local',          icon: 'mdi-calendar-check',      color: '#22c55e', points: 40 },
  { id: 'profile-views-50', title: '50 visitas al perfil',   description: '50 personas vieron tu perfil en GuavaGram',    icon: 'mdi-eye-outline',         color: '#6366f1', points: 75 },
  { id: 'post-first-job',   title: 'Primera oferta publicada', description: 'Publicaste tu primera oferta en Guavagram Professional', icon: 'mdi-briefcase-plus',     color: '#0ea5e9', points: 30 },
  { id: 'first-verification', title: 'Primera verificación laboral', description: 'Confirmaste el historial de un ex-empleado', icon: 'mdi-check-decagram',    color: '#22c55e', points: 50 },
  { id: 'first-hire-pro',   title: 'Primera contratación PRO', description: 'Cerraste tu primer contrato vía Guavagram Professional', icon: 'mdi-account-tie',       color: '#0ea5e9', points: 200 },
])

export function useStoreGamification() {
  const currentRank = computed(() => {
    let r = STORE_RANKS[0]!
    for (const rank of STORE_RANKS) {
      if (totalEarned.value >= rank.minPoints) r = rank
    }
    return r
  })

  const nextRank = computed(() => {
    const idx = STORE_RANKS.findIndex(r => r.name === currentRank.value.name)
    return idx >= 0 && idx < STORE_RANKS.length - 1 ? STORE_RANKS[idx + 1] : null
  })

  const progressToNextRank = computed(() => {
    if (!nextRank.value) return 100
    const span = nextRank.value.minPoints - currentRank.value.minPoints
    const gained = totalEarned.value - currentRank.value.minPoints
    return Math.max(0, Math.min(100, (gained / span) * 100))
  })

  const unlockedAchievements = computed(() => achievements.value.filter(a => a.unlockedAt))
  const lockedAchievements = computed(() => achievements.value.filter(a => !a.unlockedAt))
  const latestAchievement = computed(() => {
    const unlocked = unlockedAchievements.value
    if (!unlocked.length) return null
    return [...unlocked].sort((a, b) => (b.unlockedAt || '').localeCompare(a.unlockedAt || ''))[0]
  })

  return {
    ranks: STORE_RANKS,
    availablePoints,
    totalEarned,
    weeklyStreak,
    achievements,
    currentRank,
    nextRank,
    progressToNextRank,
    unlockedAchievements,
    lockedAchievements,
    latestAchievement,
  }
}
