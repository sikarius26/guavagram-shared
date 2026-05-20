import { ref, computed, watch, type Ref } from 'vue'

// User-submitted tips and Q&A questions, persisted to localStorage per slug.
// Mock-only — backend will replace this with /tips and /questions endpoints.
//
// Workflow:
// - Tip: user submits → status 'pending' → restaurant moderates (approve/reject).
//        Public list shows only approved + own pending (with badge).
// - Question: user submits → no moderation needed, but restaurant can reply.
// Each user is capped to 1 tip + 1 question per slug (client-side; backend
// must enforce per user_id/IP when it ships).

export type TipStatus = 'pending' | 'approved' | 'rejected'

export interface OwnerReply {
  text: string
  repliedAt: number
}

export interface UserContribution {
  id: string
  text: string
  createdAt: number
  status?: TipStatus            // tips only — questions ignore this
  reply?: OwnerReply            // restaurant's reply (both tips and questions)
}

interface ContribStore {
  tips: Record<string, UserContribution[]>
  questions: Record<string, UserContribution[]>
}

const LS_KEY = 'guava.user_contributions.v1'

const store = ref<ContribStore>({ tips: {}, questions: {} })

function loadFromStorage() {
  if (!import.meta.client) return
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw) as ContribStore
    store.value = {
      tips: parsed.tips ?? {},
      questions: parsed.questions ?? {},
    }
  } catch { /* ignore */ }
}

function saveToStorage() {
  if (!import.meta.client) return
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(store.value))
  } catch { /* swallow quota errors */ }
}

if (import.meta.client) {
  loadFromStorage()
  watch(store, saveToStorage, { deep: true })
}

const MAX_TEXT_LEN = 500

export function useUserContributions(slugRef: Ref<string>) {
  // All tips of this slug (any status). Public page filters as needed.
  const tips = computed<UserContribution[]>(() => {
    const s = slugRef.value
    if (!s) return []
    return [...(store.value.tips[s] ?? [])].sort((a, b) => b.createdAt - a.createdAt)
  })

  const questions = computed<UserContribution[]>(() => {
    const s = slugRef.value
    if (!s) return []
    return [...(store.value.questions[s] ?? [])].sort((a, b) => b.createdAt - a.createdAt)
  })

  const hasOwnTip = computed(() => tips.value.length > 0)
  const hasOwnQuestion = computed(() => questions.value.length > 0)

  const addTip = (text: string): UserContribution | null => {
    if (hasOwnTip.value) return null         // cap: 1 tip per user per slug
    const clean = text.trim().slice(0, MAX_TEXT_LEN)
    if (!clean) return null
    const s = slugRef.value
    const entry: UserContribution = {
      id: `tip-${Date.now()}`,
      text: clean,
      createdAt: Date.now(),
      status: 'pending',
    }
    const next: ContribStore = {
      tips: { ...store.value.tips, [s]: [entry, ...(store.value.tips[s] ?? [])] },
      questions: store.value.questions,
    }
    store.value = next
    return entry
  }

  const addQuestion = (text: string): UserContribution | null => {
    if (hasOwnQuestion.value) return null    // cap: 1 question per user per slug
    const clean = text.trim().slice(0, MAX_TEXT_LEN)
    if (!clean) return null
    const s = slugRef.value
    const entry: UserContribution = { id: `q-${Date.now()}`, text: clean, createdAt: Date.now() }
    const next: ContribStore = {
      tips: store.value.tips,
      questions: { ...store.value.questions, [s]: [entry, ...(store.value.questions[s] ?? [])] },
    }
    store.value = next
    return entry
  }

  // --- Moderation helpers (used by the dashboard ReviewsPanel) ---

  const setTipStatus = (id: string, status: TipStatus) => {
    const s = slugRef.value
    const list = store.value.tips[s] ?? []
    const next: ContribStore = {
      tips: { ...store.value.tips, [s]: list.map(x => x.id === id ? { ...x, status } : x) },
      questions: store.value.questions,
    }
    store.value = next
  }

  const replyToTip = (id: string, text: string) => {
    const clean = text.trim().slice(0, MAX_TEXT_LEN)
    if (!clean) return
    const s = slugRef.value
    const list = store.value.tips[s] ?? []
    const next: ContribStore = {
      tips: { ...store.value.tips, [s]: list.map(x => x.id === id ? { ...x, reply: { text: clean, repliedAt: Date.now() } } : x) },
      questions: store.value.questions,
    }
    store.value = next
  }

  const replyToQuestion = (id: string, text: string) => {
    const clean = text.trim().slice(0, MAX_TEXT_LEN)
    if (!clean) return
    const s = slugRef.value
    const list = store.value.questions[s] ?? []
    const next: ContribStore = {
      tips: store.value.tips,
      questions: { ...store.value.questions, [s]: list.map(x => x.id === id ? { ...x, reply: { text: clean, repliedAt: Date.now() } } : x) },
    }
    store.value = next
  }

  return {
    tips, questions,
    hasOwnTip, hasOwnQuestion,
    addTip, addQuestion,
    setTipStatus, replyToTip, replyToQuestion,
    MAX_TEXT_LEN,
  }
}
