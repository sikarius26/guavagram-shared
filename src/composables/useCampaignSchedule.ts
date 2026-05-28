export type CampaignDayHours = { from: string; to: string } // "HH:MM" 24h each

export type CampaignSchedule = {
  days: number[]    // 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb. Vacío = todos los días
  allDay: boolean
  from: string      // "HH:MM" 24h — rango global usado si no hay perDayHours
  to: string        // "HH:MM" 24h
  // Optional campaign run window. Empty/undefined = sin límite por ese lado.
  startDate?: string // "YYYY-MM-DD" inclusive
  endDate?: string   // "YYYY-MM-DD" inclusive (vence al final del día)
  // Optional per-day hours. Si está definido para un día concreto, manda sobre
  // el rango global. Días sin entrada caen al global from/to (o allDay).
  perDayHours?: Record<number, CampaignDayHours>
}

const DAY_LABELS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const ALL_WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] as const

export const emptySchedule = (): CampaignSchedule => ({
  days: [],
  allDay: true,
  from: '09:00',
  to: '21:00',
})

const isEmpty = (s?: CampaignSchedule | null): boolean => {
  if (!s) return true
  return (
    (s.days?.length ?? 0) === 0
    && s.allDay !== false
    && !s.startDate
    && !s.endDate
    && !s.perDayHours
  )
}

/** Parse legacy string or pass-through structured schedule. */
export const parseSchedule = (raw: any): CampaignSchedule => {
  if (!raw) return emptySchedule()
  if (typeof raw === 'object' && Array.isArray(raw.days)) {
    const out: CampaignSchedule = {
      days: [...raw.days],
      allDay: raw.allDay !== false,
      from: raw.from || '09:00',
      to: raw.to || '21:00',
    }
    if (typeof raw.startDate === 'string' && raw.startDate) out.startDate = raw.startDate
    if (typeof raw.endDate === 'string' && raw.endDate) out.endDate = raw.endDate
    if (raw.perDayHours && typeof raw.perDayHours === 'object') {
      const clean: Record<number, CampaignDayHours> = {}
      for (const key of Object.keys(raw.perDayHours)) {
        const d = Number(key)
        const v = raw.perDayHours[key]
        if (!Number.isInteger(d) || d < 0 || d > 6) continue
        if (!v || typeof v.from !== 'string' || typeof v.to !== 'string') continue
        clean[d] = { from: v.from, to: v.to }
      }
      if (Object.keys(clean).length) out.perDayHours = clean
    }
    return out
  }
  if (typeof raw !== 'string') return emptySchedule()
  const s = emptySchedule()
  const lower = raw.toLowerCase()

  // Day ranges / aliases
  if (/lun[-\s]*vie/.test(lower)) s.days = [1, 2, 3, 4, 5]
  else if (/sab[-\s]*dom|finde/.test(lower)) s.days = [6, 0]
  else if (/diari|todos los dias|cada dia/.test(lower)) s.days = []
  else {
    const picks: number[] = []
    const map: Record<string, number> = { dom: 0, lun: 1, mar: 2, mie: 3, mié: 3, jue: 4, vie: 5, sab: 6, sáb: 6 }
    for (const token of lower.split(/[,\s]+/)) {
      const key = token.slice(0, 3)
      if (map[key] !== undefined && !picks.includes(map[key])) picks.push(map[key])
    }
    if (picks.length) s.days = picks
  }

  // Time range "HH:MM - HH:MM" or "HH - HH"
  const timeMatch = raw.match(/(\d{1,2})(?::(\d{2}))?\s*[-–]\s*(\d{1,2})(?::(\d{2}))?/)
  if (timeMatch) {
    s.allDay = false
    s.from = `${timeMatch[1]!.padStart(2, '0')}:${(timeMatch[2] || '00')}`
    s.to = `${timeMatch[3]!.padStart(2, '0')}:${(timeMatch[4] || '00')}`
  }

  return s
}

const formatDays = (days: number[]): string => {
  if (!days.length) return 'Todos'
  const set = new Set(days)
  if (set.size === 7) return 'Todos'
  // Weekdays only
  if (set.size === 5 && [1, 2, 3, 4, 5].every(d => set.has(d))) return 'Lun-Vie'
  if (set.size === 2 && set.has(6) && set.has(0)) return 'Sáb-Dom'
  return ALL_WEEK_ORDER.filter(d => set.has(d)).map(d => DAY_LABELS_SHORT[d]).join(', ')
}

const formatHours = (s: CampaignSchedule): string => {
  if (s.allDay) return ''
  if (s.perDayHours && Object.keys(s.perDayHours).length) return 'Horario por día'
  return `${s.from}-${s.to}`
}

const formatDateShort = (yyyyMmDd: string): string => {
  // "2026-05-28" → "28/05"
  const parts = yyyyMmDd.split('-')
  if (parts.length !== 3) return yyyyMmDd
  return `${parts[2]}/${parts[1]}`
}

const formatDateRange = (s: CampaignSchedule): string => {
  if (!s.startDate && !s.endDate) return ''
  if (s.startDate && s.endDate) return `${formatDateShort(s.startDate)} – ${formatDateShort(s.endDate)}`
  if (s.endDate) return `Hasta ${formatDateShort(s.endDate)}`
  return `Desde ${formatDateShort(s.startDate!)}`
}

export const formatSchedule = (s?: CampaignSchedule | null): string => {
  if (isEmpty(s)) return ''
  const parts: string[] = []
  const dateRange = formatDateRange(s!)
  if (dateRange) parts.push(dateRange)
  const d = formatDays(s!.days)
  if (d !== 'Todos') parts.push(d)
  const h = formatHours(s!)
  if (h) parts.push(h)
  return parts.join(' · ')
}

const minutesFromTime = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

const dateOnlyMs = (d: Date): number => {
  const c = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  return c.getTime()
}

const parseYmdAsLocalMs = (ymd: string): number | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd)
  if (!m) return null
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime()
}

/** Returns true when "now" falls within the schedule window. */
export const isScheduleActiveNow = (s?: CampaignSchedule | null, now: Date = new Date()): boolean => {
  if (isEmpty(s)) return true
  const sched = s!

  // Date window (inclusive on both ends; endDate runs until 23:59:59).
  const today = dateOnlyMs(now)
  if (sched.startDate) {
    const start = parseYmdAsLocalMs(sched.startDate)
    if (start !== null && today < start) return false
  }
  if (sched.endDate) {
    const end = parseYmdAsLocalMs(sched.endDate)
    if (end !== null && today > end) return false
  }

  const nowDay = now.getDay()
  const dayOk = sched.days.length === 0 || sched.days.includes(nowDay)
  if (!dayOk) return false

  if (sched.allDay) return true

  // Per-day hours override the global from/to for that specific day.
  const dayHours = sched.perDayHours?.[nowDay]
  const fromStr = dayHours?.from || sched.from
  const toStr = dayHours?.to || sched.to

  const nowMin = now.getHours() * 60 + now.getMinutes()
  const fromMin = minutesFromTime(fromStr)
  const toMin = minutesFromTime(toStr)
  if (fromMin <= toMin) return nowMin >= fromMin && nowMin <= toMin
  // Overnight window (e.g. 22:00 - 02:00)
  return nowMin >= fromMin || nowMin <= toMin
}
