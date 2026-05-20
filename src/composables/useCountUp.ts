import { ref, computed, watch, onMounted, type Ref } from 'vue'

export function useCountUp(targetValue: Ref<number>, options?: { duration?: number; delay?: number; decimals?: number }) {
  const displayValue = ref(targetValue.value)
  const decimals = options?.decimals ?? 2

  const animate = () => {
    if (typeof window === 'undefined') {
      displayValue.value = targetValue.value
      return
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      displayValue.value = targetValue.value
      return
    }

    import('gsap').then(({ gsap }) => {
      const obj = { val: 0 }
      gsap.to(obj, {
        val: targetValue.value,
        duration: options?.duration ?? 1.5,
        delay: options?.delay ?? 0,
        ease: 'power2.out',
        onUpdate: () => { displayValue.value = obj.val },
      })
    }).catch(() => {
      displayValue.value = targetValue.value
    })
  }

  watch(targetValue, (newVal) => {
    if (typeof window === 'undefined') {
      displayValue.value = newVal
      return
    }

    import('gsap').then(({ gsap }) => {
      const obj = { val: displayValue.value }
      gsap.to(obj, {
        val: newVal,
        duration: 0.8,
        ease: 'power2.out',
        onUpdate: () => { displayValue.value = obj.val },
      })
    }).catch(() => {
      displayValue.value = newVal
    })
  })

  const formatted = computed(() => {
    return displayValue.value.toLocaleString('es-ES', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  })

  return { displayValue, formatted, animate }
}
