import { watch } from 'vue'

export function useCreateActionSheet() {
  const isOpen = useState<boolean>('create-action-sheet-open', () => false)
  const route = useRoute()

  function open()   { isOpen.value = true }
  function close()  { isOpen.value = false }
  function toggle() { isOpen.value = !isOpen.value }

  if (import.meta.client) {
    watch(() => route.fullPath, () => { isOpen.value = false })

    watch(isOpen, (v) => {
      const body = document.body
      if (!body) return
      if (v) body.style.overflow = 'hidden'
      else body.style.overflow = ''
    })

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen.value) isOpen.value = false
    }
    if (!(window as any).__createActionSheetEscBound) {
      window.addEventListener('keydown', onKey)
      ;(window as any).__createActionSheetEscBound = true
    }
  }

  return { isOpen, open, close, toggle }
}
