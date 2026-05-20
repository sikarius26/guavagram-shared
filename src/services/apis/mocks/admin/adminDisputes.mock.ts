import { mulberry32, pick, randomInt, daysAgoISO, HANDLES, RESTAURANT_NAMES } from './_seed'
import type { AdminDispute, DisputeStatus, DisputeKind, AdminReviewClaim, DisputeMessage } from '~/services/admin/types/admin-dispute'

const rand = mulberry32(88)

// ---------- Review-claim disputes (restaurant ↔ creator over a review) ----------

const REVIEW_TEXTS = [
  'Experiencia decepcionante. El servicio tardó 45 minutos y el plato llegó frío. No volvería.',
  'Me cobraron dos veces el mismo plato y nadie supo explicarlo. Mala gestión.',
  'La carta dice una cosa y traen otra distinta. Además el baño estaba sucio.',
  'Cocina muy lenta, camareros cortantes. Por ese precio hay muchísimas mejores opciones.',
  'Pedimos menú del día y traían sobras de la noche anterior. Inaceptable.',
  'Pésima atención, el encargado nos gritó cuando nos quejamos. Denunciaré a sanidad.',
]

const CLAIM_REASON_BUCKETS = [
  ['never_visited', 'fake_photo'],
  ['extortion'],
  ['competitor', 'fake_photo'],
  ['personal_attack'],
  ['wrong_business'],
  ['never_visited', 'extortion'],
]

const RESTAURANT_CLAIM_TEXTS = [
  'Esta persona nunca ha entrado en nuestro local. Revisamos el día que dice haber venido y no hay ningún ticket con esa hora. El ticket adjunto no tiene nuestro formato (logo del pie distinto).',
  'Hemos recibido amenazas por mensaje directo de este usuario exigiendo cena gratis a cambio de retirar la reseña. Adjuntamos capturas.',
  'La foto adjunta no es nuestro local — es de la competencia a dos calles (mirad la decoración de las sillas y la madera del techo). Sospechamos reseña pagada.',
  'La reseña usa lenguaje insultante hacia nuestro personal con nombres propios. Pedimos retirada por ataque personal.',
  'El ticket adjunto es de otra sucursal que no es nuestra, este local pertenece a otro grupo. Se ha etiquetado mal.',
  'Nunca hemos atendido a este cliente. Tenemos cámaras y no hay ninguna grabación del día/hora indicados. Pedimos verificación.',
]

const CREATOR_DEFENSES: (string | null)[] = [
  'Adjunto ticket original con fecha y hora, y captura del pago con tarjeta de ese día. La foto es del lugar, mirad la pared del fondo con la hiedra.',
  null,
  'Es mi reseña honesta. No conozco a ningún competidor. Adjunto segunda foto de esa noche.',
  null,
  'Reconozco que pude equivocarme de sucursal, retiro la reseña yo mismo.',
  'Jamás he pedido nada a cambio, esas capturas las pueden haber manipulado. Aquí mi historial público.',
]

function buildReviewClaim(i: number): AdminReviewClaim {
  const reasons = CLAIM_REASON_BUCKETS[i % CLAIM_REASON_BUCKETS.length]!
  const defense = CREATOR_DEFENSES[i % CREATOR_DEFENSES.length]
  return {
    reviewId: `rev_${String(200 + i).padStart(4, '0')}`,
    reviewRating: pick(rand, [1, 1, 1, 2, 2, 3]),
    reviewText: REVIEW_TEXTS[i % REVIEW_TEXTS.length]!,
    reviewReceiptUrl: `https://picsum.photos/seed/rec-dispute-${i}/400/600`,
    reviewPlacePhotoUrl: `https://picsum.photos/seed/place-dispute-${i}/800/500`,
    reviewAuthorId: `usr_${String(randomInt(rand, 0, 119)).padStart(3, '0')}`,
    reviewAuthorHandle: pick(rand, HANDLES) + String(i),
    reviewPublishedAt: daysAgoISO(randomInt(rand, 15, 90)),
    restaurantClaim: {
      reasons,
      text: RESTAURANT_CLAIM_TEXTS[i % RESTAURANT_CLAIM_TEXTS.length]!,
      evidenceUrls: [
        `https://picsum.photos/seed/evidence-r-${i}-a/600/400`,
        `https://picsum.photos/seed/evidence-r-${i}-b/600/400`,
      ],
      submittedAt: daysAgoISO(randomInt(rand, 1, 14)),
    },
    creatorDefense: defense ? {
      text: defense,
      evidenceUrls: defense.toLowerCase().includes('adjunto') || defense.toLowerCase().includes('aquí')
        ? [`https://picsum.photos/seed/evidence-c-${i}/600/400`]
        : [],
      submittedAt: daysAgoISO(randomInt(rand, 0, 7)),
    } : undefined,
  }
}

function buildReviewClaimDispute(i: number): AdminDispute {
  const claim = buildReviewClaim(i)
  const restaurantLabel = pick(rand, RESTAURANT_NAMES)
  const status: DisputeStatus = pick(rand, [
    'open', 'open', 'awaiting_creator', 'in_review', 'resolved_for_restaurant', 'resolved_for_creator',
  ]) as DisputeStatus

  const messages: DisputeMessage[] = [
    {
      at: claim.restaurantClaim.submittedAt,
      from: 'restaurant',
      authorLabel: restaurantLabel,
      text: claim.restaurantClaim.text,
    },
  ]
  if (claim.creatorDefense) {
    messages.push({
      at: claim.creatorDefense.submittedAt,
      from: 'creator',
      authorLabel: '@' + claim.reviewAuthorHandle,
      text: claim.creatorDefense.text,
    })
  }
  if (status === 'in_review' || status.startsWith('resolved')) {
    messages.push({
      at: daysAgoISO(randomInt(rand, 0, 5)),
      from: 'support',
      authorLabel: 'Soporte Guavagram',
      text: status === 'resolved_for_restaurant'
        ? 'Retiramos la reseña tras revisar pruebas aportadas por ambas partes. El ticket no coincide con el formato del local.'
        : status === 'resolved_for_creator'
        ? 'Mantenemos la reseña. Las pruebas aportadas por el creator coinciden con el servicio prestado.'
        : 'Estamos revisando las pruebas. Os actualizamos en 48h.',
    })
  }

  return {
    id: `dsp_rv_${String(i).padStart(3, '0')}`,
    status,
    kind: 'review_claim',
    openedAt: claim.restaurantClaim.submittedAt,
    resolvedAt: status.startsWith('resolved') ? daysAgoISO(randomInt(rand, 0, 5)) : undefined,
    actorUserId: `sto_${randomInt(rand, 0, 19)}`,
    actorLabel: restaurantLabel,
    counterpartyUserId: claim.reviewAuthorId,
    counterpartyLabel: '@' + claim.reviewAuthorHandle,
    amountEur: 0,
    summary: `Reclamación sobre reseña de ${claim.reviewRating}⭐ publicada por @${claim.reviewAuthorHandle}`,
    messages,
    reviewClaim: claim,
  }
}

// ---------- Generic financial disputes ----------

function buildGenericDispute(i: number): AdminDispute {
  const kind = pick(rand, ['missing_commission', 'missing_commission', 'chargeback', 'fraud', 'bug']) as DisputeKind
  const status = pick(rand, ['open', 'in_review', 'resolved_for_creator', 'rejected']) as DisputeStatus
  const amount = randomInt(rand, 12, 480)
  const handle = pick(rand, HANDLES)
  const restaurantLabel = pick(rand, RESTAURANT_NAMES)
  return {
    id: `dsp_${String(i).padStart(3, '0')}`,
    status,
    kind,
    openedAt: daysAgoISO(randomInt(rand, 1, 45)),
    resolvedAt: status.startsWith('resolved') || status === 'rejected' ? daysAgoISO(randomInt(rand, 0, 20)) : undefined,
    actorUserId: `cre_${String(randomInt(rand, 0, 59)).padStart(3, '0')}`,
    actorLabel: '@' + handle,
    counterpartyUserId: `sto_${randomInt(rand, 0, 19)}`,
    counterpartyLabel: restaurantLabel,
    amountEur: amount,
    summary: pick(rand, [
      'Comisión no aparece tras reserva confirmada',
      'Cliente reclama reembolso después del pago',
      'Posible duplicado de transacción',
      'Importe distinto al esperado',
      'Orden rechazada sin notificación al creator',
    ]),
    messages: [
      { at: daysAgoISO(randomInt(rand, 0, 20)), from: 'creator', authorLabel: '@' + handle, text: 'He adjuntado captura de la reserva confirmada.' },
      { at: daysAgoISO(randomInt(rand, 0, 19)), from: 'support', authorLabel: 'Soporte Guavagram', text: 'Revisamos con el restaurante, te actualizamos hoy.' },
    ],
  }
}

const DISPUTES: AdminDispute[] = [
  ...Array.from({ length: 8 }, (_, i) => buildReviewClaimDispute(i)),
  ...Array.from({ length: 10 }, (_, i) => buildGenericDispute(i)),
].sort((a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime())

export function getDisputes(): AdminDispute[] { return DISPUTES }
export function getDisputeById(id: string): AdminDispute | null { return DISPUTES.find(d => d.id === id) ?? null }
