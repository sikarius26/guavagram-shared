export type CampaignSchedule = {
  days: number[]    // 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb. Vacío = todos los días
  allDay: boolean
  from: string      // "HH:MM" 24h
  to: string        // "HH:MM" 24h
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
  return (s.days?.length ?? 0) === 0 && s.allDay !== false
}

/** Parse legacy string or pass-through structured schedule. */
export const parseSchedule = (raw: any): CampaignSchedule => {
  if (!raw) return emptySchedule()
  if (typeof raw === 'object' && Array.isArray(raw.days)) {
    return {
      days: [...raw.days],
      allDay: raw.allDay !== false,
      from: raw.from || '09:00',
      to: raw.to || '21:00',
    }
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
  return `${s.from}-${s.to}`
}

export const formatSchedule = (s?: CampaignSchedule | null): string => {
  if (isEmpty(s)) return ''
  const d = formatDays(s!.days)
  const h = formatHours(s!)
  const daysPart = d === 'Todos' ? '' : d
  if (daysPart && h) return `${daysPart} · ${h}`
  return daysPart || h
}

const minutesFromTime = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

/** Returns true when "now" falls within the schedule window. */
export const isScheduleActiveNow = (s?: CampaignSchedule | null, now: Date = new Date()): boolean => {
  if (isEmpty(s)) return true
  const sched = s!

  const nowDay = now.getDay()
  const dayOk = sched.days.length === 0 || sched.days.includes(nowDay)
  if (!dayOk) return false

  if (sched.allDay) return true

  const nowMin = now.getHours() * 60 + now.getMinutes()
  const fromMin = minutesFromTime(sched.from)
  const toMin = minutesFromTime(sched.to)
  if (fromMin <= toMin) return nowMin >= fromMin && nowMin <= toMin
  // Overnight window (e.g. 22:00 - 02:00)
  return nowMin >= fromMin || nowMin <= toMin
}
