import type { JobPosting } from '~/services/apis/models/job-posting-view-model'
import type { ProfessionalProfile } from '~/services/apis/models/professional-profile-view-model'

export type MatchBucket = 'strong' | 'good' | 'partial' | 'weak'

export interface MatchCriterion {
  id: 'role' | 'shifts' | 'experience' | 'certificates' | 'languages'
  label: string
  ok: boolean
  detail: string
}

export interface MatchResult {
  score: number             // 0-100, integer
  bucket: MatchBucket
  bucketLabel: string
  criteria: MatchCriterion[]
}

const ratio = (have: string[], required: string[]) => {
  if (!required.length) return 1
  const hits = required.filter(r => have.includes(r)).length
  return hits / required.length
}

export function computeMatchScore(job: JobPosting, profile: ProfessionalProfile): MatchResult {
  const roleOk = profile.seekingRoles.includes(job.role)
  const shiftOk = profile.shiftPreferences.some(s => job.shifts.includes(s))
  const expOk = profile.experienceYears >= job.requiredExperienceYears
  const certsR = ratio(profile.certificates, job.requiredCertificates)
  const langsR = ratio(profile.languages, job.languagesRequired)

  let score = 0
  if (roleOk) score += 30
  if (shiftOk) score += 25
  if (expOk) score += 20
  score += 15 * certsR
  score += 10 * langsR
  score = Math.round(score)

  const bucket: MatchBucket =
    score >= 80 ? 'strong' :
    score >= 60 ? 'good' :
    score >= 40 ? 'partial' : 'weak'

  const bucketLabel =
    bucket === 'strong' ? 'Encajas mucho' :
    bucket === 'good'   ? 'Buen encaje' :
    bucket === 'partial' ? 'Encaje parcial' : 'Bajo encaje'

  const certsHits = job.requiredCertificates.filter(c => profile.certificates.includes(c)).length
  const langsHits = job.languagesRequired.filter(l => profile.languages.includes(l)).length

  const criteria: MatchCriterion[] = [
    {
      id: 'role',
      label: 'Puesto',
      ok: roleOk,
      detail: roleOk ? 'Buscas este puesto' : 'No está en tus puestos buscados',
    },
    {
      id: 'shifts',
      label: 'Turnos',
      ok: shiftOk,
      detail: shiftOk ? 'Tienes algún turno compatible' : 'Sin solapamiento de turnos',
    },
    {
      id: 'experience',
      label: 'Experiencia',
      ok: expOk,
      detail: expOk
        ? `Tienes ${profile.experienceYears} años (piden ${job.requiredExperienceYears})`
        : `Piden ${job.requiredExperienceYears} años, tienes ${profile.experienceYears}`,
    },
    {
      id: 'certificates',
      label: 'Certificados',
      ok: certsR === 1,
      detail: !job.requiredCertificates.length
        ? 'No requeridos'
        : `${certsHits} de ${job.requiredCertificates.length} certificados`,
    },
    {
      id: 'languages',
      label: 'Idiomas',
      ok: langsR === 1,
      detail: !job.languagesRequired.length
        ? 'No requeridos'
        : `${langsHits} de ${job.languagesRequired.length} idiomas`,
    },
  ]

  return { score, bucket, bucketLabel, criteria }
}

export const MATCH_BUCKET_CLASSES: Record<MatchBucket, { chipBg: string; chipText: string; chipRing: string; chipBorder: string; dotBg: string }> = {
  strong:  { chipBg: 'bg-emerald-50', chipText: 'text-emerald-700', chipRing: 'ring-emerald-200/70', chipBorder: 'border-emerald-200', dotBg: 'bg-emerald-500' },
  good:    { chipBg: 'bg-sky-50',     chipText: 'text-sky-700',     chipRing: 'ring-sky-200/70',     chipBorder: 'border-sky-200',     dotBg: 'bg-sky-500'     },
  partial: { chipBg: 'bg-slate-100',  chipText: 'text-slate-700',   chipRing: 'ring-slate-200/70',   chipBorder: 'border-slate-200',   dotBg: 'bg-slate-400'   },
  weak:    { chipBg: 'bg-slate-50',   chipText: 'text-slate-500',   chipRing: 'ring-slate-200/50',   chipBorder: 'border-slate-200',   dotBg: 'bg-slate-300'   },
}
