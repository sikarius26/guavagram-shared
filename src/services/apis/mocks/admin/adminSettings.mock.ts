import type { AdminCommissionRule, AdminGpRule } from '~/services/admin/types/admin-commission-rule'
import type { AdminPlan } from '~/services/admin/types/admin-plan'
import type { AdminChallenge } from '~/services/admin/types/admin-challenge'
import type { AdminFeatureFlag } from '~/services/admin/types/admin-feature-flag'
import type { AdminJobCategory } from '~/services/admin/types/admin-job-taxonomy'
import type { AdminTeamMember } from '~/services/admin/types/admin-team'
import { daysAgoISO } from './_seed'

export const DEFAULT_COMMISSIONS: AdminCommissionRule = {
  peak: { l1: 15, l2: 10, l3: 5 },
  horizons: {
    year1:     { l1: 7.5,  l2: 5,    l3: 2.5  },
    year2:     { l1: 15,   l2: 10,   l3: 5    },
    year3plus: { l1: 3.75, l2: 2.5,  l3: 1.25 },
  },
  maxLevels: 3,
  payoutCondition: 'El creator cobra solo si ha hecho al menos una reseña verificada (ticket + foto) en ese restaurante. La comisión se paga mientras el restaurante siga pagando a Guava. Si se va, se corta.',
  updatedAt: daysAgoISO(7),
}

export const DEFAULT_GP_RULES: AdminGpRule = {
  gpToEurRate: 1000, // 1000 GP = 1 EUR
  perActionGp: [
    { action: 'Review verificada', gp: 200 },
    { action: 'Referido verificado', gp: 500 },
    { action: 'Widget instalado', gp: 1000 },
    { action: 'Primer pedido', gp: 100 },
    { action: 'Check-in en tienda', gp: 50 },
    { action: 'Completar perfil', gp: 150 },
  ],
  ranks: [
    { rank: 'Guava Seed', gpThreshold: 0, perks: ['Acceso básico'] },
    { rank: 'Guava Sprout', gpThreshold: 2_000, perks: ['Ofertas exclusivas'] },
    { rank: 'Guava Fruit', gpThreshold: 8_000, perks: ['Descuentos premium', 'Invitaciones a eventos'] },
    { rank: 'Guava Tree', gpThreshold: 25_000, perks: ['Cashback 2%', 'Acceso anticipado'] },
    { rank: 'Guava Grove', gpThreshold: 60_000, perks: ['Cashback 4%', 'Gestor dedicado'] },
    { rank: 'Guava Legend', gpThreshold: 150_000, perks: ['Estatus VIP vitalicio'] },
  ],
  updatedAt: daysAgoISO(14),
}

export const DEFAULT_PLANS: AdminPlan[] = [
  { tier: 'free', label: 'Free', priceMonthlyEur: 0, priceYearlyEur: 0,
    features: ['Perfil público', 'Menú digital básico'], active: true },
  { tier: 'pro', label: 'Pro', priceMonthlyEur: 49, priceYearlyEur: 490,
    features: ['Widget reseñas', 'Hiring básico', 'Analytics', 'Campañas creator'], active: true },
  { tier: 'guava', label: 'Guava', priceMonthlyEur: 89, priceYearlyEur: 890,
    features: ['Todo Pro +', 'Creators ilimitados', 'Google Business sync', 'Programa fidelización'], active: true },
  { tier: 'guava_plus', label: 'Guava+', priceMonthlyEur: 149, priceYearlyEur: 1490,
    features: ['Todo Guava +', 'API privada', 'Account manager', 'Integraciones POS'], active: true },
]

export const DEFAULT_CHALLENGES: AdminChallenge[] = [
  { id: 'ch_01', name: '3 reseñas en 7 días', description: 'Publica 3 reseñas verificadas en una semana', status: 'active', rewardGp: 600, startAt: daysAgoISO(30), requirements: 'count(reviews)>=3 AND days<=7', completedCount: 312 },
  { id: 'ch_02', name: 'Lleva 5 amigos', description: 'Invita 5 amigos que se registren y verifiquen', status: 'active', rewardGp: 2500, startAt: daysAgoISO(60), requirements: 'count(referrals_verified)>=5', completedCount: 87 },
  { id: 'ch_03', name: 'Completa tu perfil', description: 'Rellena todos los campos obligatorios', status: 'active', rewardGp: 150, startAt: daysAgoISO(100), requirements: 'profile.completeness==100', completedCount: 1824 },
  { id: 'ch_04', name: 'Instala el widget', description: 'Configura el widget en tu web', status: 'paused', rewardGp: 1000, startAt: daysAgoISO(40), requirements: 'widget.verified==true', completedCount: 42 },
]

export const DEFAULT_FEATURE_FLAGS: AdminFeatureFlag[] = [
  { key: 'flag.new_creator_onboarding', label: 'Nuevo onboarding de creators', description: 'Nuevo flujo paso a paso para alta de creators', enabled: true, rolloutPct: 100, updatedAt: daysAgoISO(5) },
  { key: 'flag.gamification_v2', label: 'Gamification v2', description: 'Nuevos rangos y multiplicadores', enabled: false, rolloutPct: 0, updatedAt: daysAgoISO(12) },
  { key: 'flag.stories_in_feed', label: 'Stories en feed', description: 'Stories de creators en el feed consumer', enabled: true, rolloutPct: 50, updatedAt: daysAgoISO(3) },
  { key: 'flag.wallet_apple_pay', label: 'Apple Pay wallet', description: 'Añadir vouchers a Apple Wallet', enabled: true, rolloutPct: 100, updatedAt: daysAgoISO(20) },
  { key: 'flag.maintenance_mode', label: 'Modo mantenimiento', description: 'Desactiva registro y checkout', enabled: false, rolloutPct: 0, updatedAt: daysAgoISO(90) },
]

export const DEFAULT_JOBS_TAXONOMY: AdminJobCategory[] = [
  { id: 'job_sala', label: 'Sala y atención', closeCommissionPct: 8, active: true, openOffersCount: 12 },
  { id: 'job_cocina', label: 'Cocina', closeCommissionPct: 10, active: true, openOffersCount: 9 },
  { id: 'job_barra', label: 'Barra y coctelería', closeCommissionPct: 10, active: true, openOffersCount: 4 },
  { id: 'job_pasteleria', label: 'Pastelería', closeCommissionPct: 12, active: true, openOffersCount: 2 },
  { id: 'job_gestion', label: 'Gestión y encargados', closeCommissionPct: 14, active: true, openOffersCount: 3 },
  { id: 'job_delivery', label: 'Delivery', closeCommissionPct: 6, active: false, openOffersCount: 0 },
]

export const DEFAULT_TEAM: AdminTeamMember[] = [
  { userId: 'adm_01', email: 'pau.artiso@guavapp.com', name: 'Pau Artiso', role: 'super_admin', lastActiveAt: daysAgoISO(0), createdAt: daysAgoISO(400), active: true },
  { userId: 'adm_02', email: 'ops@guavapp.com', name: 'Equipo Operaciones', role: 'ops', lastActiveAt: daysAgoISO(0), createdAt: daysAgoISO(200), active: true },
  { userId: 'adm_03', email: 'finance@guavapp.com', name: 'Finanzas', role: 'finance', lastActiveAt: daysAgoISO(1), createdAt: daysAgoISO(180), active: true },
  { userId: 'adm_04', email: 'moderation@guavapp.com', name: 'Moderación', role: 'content_mod', lastActiveAt: daysAgoISO(0), createdAt: daysAgoISO(120), active: true },
  { userId: 'adm_05', email: 'support@guavapp.com', name: 'Soporte L1', role: 'support', lastActiveAt: daysAgoISO(0), createdAt: daysAgoISO(90), active: true },
]

export const DEFAULT_REFERRAL_CONFIG = {
  referralBonus: 500,
  isActive: true,
  updatedAt: daysAgoISO(21),
}
