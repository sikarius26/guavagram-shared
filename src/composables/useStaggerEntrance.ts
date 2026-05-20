import { onMounted, type Ref } from 'vue'

export function useStaggerEntrance(
  containerRef: Ref<HTMLElement | undefined>,
  selector: string,
  options?: { delay?: number; stagger?: number; y?: number }
) {
  onMounted(() => {
    if (typeof window === 'undefined' || !containerRef.value) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const els = containerRef.value.querySelectorAll(selector)
    if (!els.length) return

    // Use CSS animations instead of GSAP to avoid visibility issues
    els.forEach((el, i) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.opacity = '0'
      htmlEl.style.transform = `translateY(${options?.y ?? 16}px)`
      setTimeout(() => {
        htmlEl.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out'
        htmlEl.style.opacity = '1'
        htmlEl.style.transform = 'translateY(0)'
      }, (options?.delay ?? 100) + i * (options?.stagger ?? 80))
    })
  })
}
