import { mulberry32, pick, randomInt, daysAgoISO, HANDLES, RESTAURANT_NAMES } from './_seed'
import type { AdminReviewItem, AdminUgcItem, AdminReportItem } from '~/services/admin/types/admin-moderation-item'

const rand = mulberry32(111)

const REVIEWS: AdminReviewItem[] = Array.from({ length: 23 }, (_, i) => ({
  id: `rev_${String(i).padStart(3, '0')}`,
  status: 'pending',
  userId: `usr_${String(randomInt(rand, 0, 119)).padStart(3, '0')}`,
  userLabel: '@' + pick(rand, HANDLES),
  storeId: `sto_${randomInt(rand, 0, 19)}`,
  storeLabel: pick(rand, RESTAURANT_NAMES),
  rating: randomInt(rand, 3, 5),
  text: pick(rand, [
    'Comida brutal y atención increíble. 100% volveremos.',
    'Buen ambiente pero la cocina tardó demasiado.',
    'Platos creativos, precio correcto. Recomendado.',
    'Trato espectacular del equipo, experiencia completa.',
    'Pedimos el menú degustación, cada plato una sorpresa.',
  ]),
  receiptUrl: `https://picsum.photos/seed/receipt${i}/400/600`,
  placePhotoUrl: `https://picsum.photos/seed/place${i}/800/500`,
  submittedAt: daysAgoISO(randomInt(rand, 0, 14)),
}))

const UGC: AdminUgcItem[] = Array.from({ length: 18 }, (_, i) => ({
  id: `ugc_${String(i).padStart(3, '0')}`,
  status: 'pending',
  kind: pick(rand, ['feed_post', 'story', 'pick']) as any,
  authorHandle: pick(rand, HANDLES),
  mediaUrl: `https://picsum.photos/seed/ugc${i}/600/600`,
  caption: pick(rand, [
    'Brunch domingo sin prisa',
    '¿La mejor hamburguesa de Madrid?',
    'Descubriendo sitios escondidos',
    'Comida italiana con vistas',
    undefined as any,
  ]),
  reportsCount: randomInt(rand, 0, 4),
  submittedAt: daysAgoISO(randomInt(rand, 0, 20)),
}))

const REPORTS: AdminReportItem[] = Array.from({ length: 4 }, (_, i) => ({
  id: `rpt_${String(i).padStart(3, '0')}`,
  status: 'open',
  kind: pick(rand, ['user', 'store', 'review']) as any,
  targetId: `usr_${String(randomInt(rand, 0, 119)).padStart(3, '0')}`,
  targetLabel: pick(rand, [...RESTAURANT_NAMES, ...HANDLES.map(h => `@${h}`)]),
  reporterUserId: `usr_${String(randomInt(rand, 0, 119)).padStart(3, '0')}`,
  reason: pick(rand, ['Contenido inapropiado', 'Spam', 'Suplantación', 'Imagen sin permiso']),
  submittedAt: daysAgoISO(randomInt(rand, 0, 10)),
}))

export function getReviewQueue(): AdminReviewItem[] { return REVIEWS }
export function getUgcQueue(): AdminUgcItem[] { return UGC }
export function getReports(): AdminReportItem[] { return REPORTS }
