import { ref, computed } from 'vue'

export type DateRangePreset = '7d' | '30d' | '90d' | 'month' | 'quarter' | 'year' | 'custom'

export interface DateRange { start: Date; end: Date }

const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x }
const endOfDay   = (d: Date) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x }
const addDays    = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }

const daysBetween = (a: Date, b: Date) =>
  Math.max(1, Math.round((b.getTime() - a.getTime()) / 86400000))

const rangeFromPreset = (preset: DateRangePreset): DateRange => {
  const now = new Date()
  const end = endOfDay(now)
  switch (preset) {
    case '7d':      return { start: startOfDay(addDays(now, -6)),  end }
    case '30d':     return { start: startOfDay(addDays(now, -29)), end }
    case '90d':     return { start: startOfDay(addDays(now, -89)), end }
    case 'month':   return { start: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)), end }
    case 'quarter': {
      const q = Math.floor(now.getMonth() / 3)
      return { start: startOfDay(new Date(now.getFullYear(), q * 3, 1)), end }
    }
    case 'year':    return { start: startOfDay(new Date(now.getFullYear(), 0, 1)), end }
    default:        return { start: startOfDay(addDays(now, -29)), end }
  }
}

export function useDateRange(defaultPreset: DateRangePreset = '30d') {
  const preset = ref<DateRangePreset>(defaultPreset)
  const customRange = ref<DateRange | null>(null)

  const range = computed<DateRange>(() =>
    preset.value === 'custom' && customRange.value ? customRange.value : rangeFromPreset(preset.value)
  )

  const days = computed(() => daysBetween(range.value.start, range.value.end) + 1)

  const previousRange = computed<DateRange>(() => {
    const n = days.value
    return {
      start: startOfDay(addDays(range.value.start, -n)),
      end:   endOfDay(addDays(range.value.end,   -n)),
    }
  })

  const setPreset = (p: DateRangePreset) => { preset.value = p }
  const setCustom = (start: Date, end: Date) => {
    customRange.value = { start: startOfDay(start), end: endOfDay(end) }
    preset.value = 'custom'
  }

  return { preset, range, previousRange, days, customRange, setPreset, setCustom }
}
