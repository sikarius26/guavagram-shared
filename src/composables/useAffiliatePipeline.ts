import { ref } from 'vue'

// Pipeline de restaurantes que el usuario (como creator) ha traído a Guava.
// Mock local hasta que el backend exista. INTEGRATION: sustituir mock por
// GET /api/creator/affiliates.

export type AffiliateStatus =
  | 'invitation_sent'    // Invitación enviada via GBP
  | 'restaurant_accepted' // Dueño aceptó y está onboarding
  | 'verifying'          // Verificando comisión / documentación
  | 'paying'             // En Guava y pagando — comisión activa
  | 'review_verified'    // Reseña verificada por el creator, comisión reclamable
  | 'inactive'           // Se dio de baja

export interface AffiliateRecord {
  id: string
  storeSlug: string
  storeName: string
  storeCity?: string
  storeLogoUrl?: string
  cuisine?: string
  status: AffiliateStatus
  enteredStatusAt: string  // ISO date cuando entró al estado actual
  submittedAt: string      // ISO date de cuando el creator lo añadió
  monthlyCommission?: number // €, sólo si está pagando o review_verified
  claimableCommission?: number // € reclamables (solo en review_verified)
}

export const AFFILIATE_STATUS_META: Record<AffiliateStatus, {
  label: string
  shortLabel: string
  icon: string
  color: string
  bg: string
  fg: string
  description: string
}> = {
  invitation_sent: {
    label: 'Invitación enviada',
    shortLabel: 'Invitado',
    icon: 'mdi-email-outline',
    color: '#64748b',
    bg: 'bg-slate-100 dark:bg-slate-900/40',
    fg: 'text-slate-700 dark:text-slate-300',
    description: 'Esperando a que el restaurante abra tu invitación.',
  },
  restaurant_accepted: {
    label: 'Aceptada por el restaurante',
    shortLabel: 'Aceptada',
    icon: 'mdi-check-circle-outline',
    color: '#3b82f6',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    fg: 'text-blue-700 dark:text-blue-300',
    description: 'El dueño aceptó. Guava está preparando el onboarding.',
  },
  verifying: {
    label: 'Verificando',
    shortLabel: 'Verificando',
    icon: 'mdi-clock-outline',
    color: '#f59e0b',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    fg: 'text-amber-700 dark:text-amber-300',
    description: 'Guava está verificando la documentación y el alta.',
  },
  paying: {
    label: 'Pagando',
    shortLabel: 'Pagando',
    icon: 'mdi-credit-card-check-outline',
    color: '#10b981',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    fg: 'text-emerald-700 dark:text-emerald-300',
    description: 'En Guava. Comisión activa pero aún no reclamable.',
  },
  review_verified: {
    label: 'Reseña verificada',
    shortLabel: 'Reclamable',
    icon: 'mdi-cash-multiple',
    color: '#10b981',
    bg: 'bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-950/40',
    fg: 'text-emerald-800 dark:text-emerald-200',
    description: 'Tu reseña está verificada. Puedes reclamar tu comisión mensual.',
  },
  inactive: {
    label: 'Inactivo',
    shortLabel: 'Inactivo',
    icon: 'mdi-close-circle-outline',
    color: '#94a3b8',
    bg: 'bg-gray-100 dark:bg-white/5',
    fg: 'text-gray-500 dark:text-white/50',
    description: 'El restaurante se dio de baja. Ya no genera comisión.',
  },
}

export const AFFILIATE_STATUS_ORDER: AffiliateStatus[] = [
  'invitation_sent',
  'restaurant_accepted',
  'verifying',
  'paying',
  'review_verified',
  'inactive',
]

// Mock inicial: ejemplos en cada estado para ver el kanban poblado.
const MOCK_AFFILIATES: AffiliateRecord[] = [
  {
    id: 'aff-1',
    storeSlug: 'casa-lolita',
    storeName: 'Casa Lolita',
    storeCity: 'Madrid',
    cuisine: 'Tapas',
    storeLogoUrl: 'https://picsum.photos/seed/casa-lolita/200/200',
    status: 'invitation_sent',
    enteredStatusAt: new Date(Date.now() - 2 * 86400_000).toISOString(),
    submittedAt: new Date(Date.now() - 2 * 86400_000).toISOString(),
  },
  {
    id: 'aff-2',
    storeSlug: 'brunch-co',
    storeName: 'Brunch & Co',
    storeCity: 'Madrid',
    cuisine: 'Brunch',
    storeLogoUrl: 'https://picsum.photos/seed/brunch-co/200/200',
    status: 'restaurant_accepted',
    enteredStatusAt: new Date(Date.now() - 5 * 86400_000).toISOString(),
    submittedAt: new Date(Date.now() - 12 * 86400_000).toISOString(),
  },
  {
    id: 'aff-3',
    storeSlug: 'la-pasta-nera',
    storeName: 'La Pasta Nera',
    storeCity: 'Barcelona',
    cuisine: 'Italiana',
    storeLogoUrl: 'https://picsum.photos/seed/la-pasta-nera/200/200',
    status: 'verifying',
    enteredStatusAt: new Date(Date.now() - 3 * 86400_000).toISOString(),
    submittedAt: new Date(Date.now() - 20 * 86400_000).toISOString(),
  },
  {
    id: 'aff-4',
    storeSlug: 'bodega-nova',
    storeName: 'Bodega Nova',
    storeCity: 'Barcelona',
    cuisine: 'Mediterránea',
    storeLogoUrl: 'https://picsum.photos/seed/bodega-nova/200/200',
    status: 'paying',
    enteredStatusAt: new Date(Date.now() - 18 * 86400_000).toISOString(),
    submittedAt: new Date(Date.now() - 45 * 86400_000).toISOString(),
    monthlyCommission: 18.50,
  },
  {
    id: 'aff-5',
    storeSlug: 'cata-gourmet',
    storeName: 'Cata Gourmet',
    storeCity: 'Barcelona',
    cuisine: 'Gourmet',
    storeLogoUrl: 'https://picsum.photos/seed/cata-gourmet/200/200',
    status: 'review_verified',
    enteredStatusAt: new Date(Date.now() - 6 * 86400_000).toISOString(),
    submittedAt: new Date(Date.now() - 60 * 86400_000).toISOString(),
    monthlyCommission: 27.00,
    claimableCommission: 54.00,
  },
  {
    id: 'aff-6',
    storeSlug: 'pepe-tapas',
    storeName: 'Pepe Tapas',
    storeCity: 'Sevilla',
    cuisine: 'Tapas',
    storeLogoUrl: 'https://picsum.photos/seed/pepe-tapas/200/200',
    status: 'inactive',
    enteredStatusAt: new Date(Date.now() - 40 * 86400_000).toISOString(),
    submittedAt: new Date(Date.now() - 120 * 86400_000).toISOString(),
  },
]

const affiliates = ref<AffiliateRecord[]>(MOCK_AFFILIATES)

export function useAffiliatePipeline() {
  return {
    list: affiliates,
    byStatus: (s: AffiliateStatus) => affiliates.value.filter(a => a.status === s),
    totalClaimable: () => affiliates.value.reduce((sum, a) => sum + (a.claimableCommission ?? 0), 0),
    totalMonthly: () => affiliates.value
      .filter(a => a.status === 'paying' || a.status === 'review_verified')
      .reduce((sum, a) => sum + (a.monthlyCommission ?? 0), 0),
  }
}
