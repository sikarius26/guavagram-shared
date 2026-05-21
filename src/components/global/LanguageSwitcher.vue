<script setup lang="ts">
const { locale, setLocale } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const props = withDefaults(defineProps<{
    compact?: boolean
    align?: 'left' | 'right'
    variant?: 'light' | 'dark'
    dropdownDirection?: 'down' | 'up'
}>(), {
    compact: false,
    align: 'right',
    variant: 'light',
    dropdownDirection: 'down',
})

// flag is the ISO 3166-1 alpha-2 country code that flag-icons recognises.
// English maps to GB; the rest match their language codes.
const availableLanguages = [
    { code: 'en', name: 'English',    flag: 'gb' },
    { code: 'es', name: 'Español',    flag: 'es' },
    { code: 'ca', name: 'Català',     flag: 'es-ct' },
    { code: 'it', name: 'Italiano',   flag: 'it' },
    { code: 'fr', name: 'Français',   flag: 'fr' },
    { code: 'pt', name: 'Português',  flag: 'pt' },
] as const

const currentLanguage = computed(() => availableLanguages.find(l => l.code === locale.value) ?? availableLanguages[0])

const switching = ref(false)
const open = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
// Floating dropdown position when teleported to <body> (escapes parent
// overflow-hidden so the menu is never clipped by the sidebar).
const dropdownStyle = ref<Record<string, string>>({})
const updateDropdownPos = () => {
    const el = triggerRef.value
    if (!el) return
    const rect = el.getBoundingClientRect()
    const top = rect.top + window.scrollY
    const bottom = rect.bottom + window.scrollY
    const right = window.innerWidth - rect.right
    const left = rect.left
    const style: Record<string, string> = { position: 'absolute', zIndex: '70' }
    if (props.dropdownDirection === 'up') style.bottom = `${window.innerHeight - top + 6}px`
    else style.top = `${bottom + 6}px`
    if (props.align === 'right') style.right = `${right}px`
    else style.left = `${left}px`
    dropdownStyle.value = style
}

async function pickLanguage(code: string) {
    if (switching.value || code === locale.value) {
        open.value = false
        return
    }
    switching.value = true
    open.value = false
    try {
        // Navigate to the localized variant of the current route so the URL
        // prefix matches the active locale (otherwise nuxt-i18n will resolve
        // the URL prefix as the source of truth on the next navigation).
        const target = switchLocalePath(code as any)
        if (target) {
            await navigateTo(target)
        } else {
            await setLocale(code as any)
        }
    } finally {
        switching.value = false
    }
}

const onTriggerClick = () => {
    open.value = !open.value
    if (open.value) nextTick(updateDropdownPos)
}
const onClickOutside = (e: Event) => {
    if (!(e.target as HTMLElement).closest('[data-lang-switcher]')) open.value = false
}
const onReposition = () => { if (open.value) updateDropdownPos() }
onMounted(() => {
    document.addEventListener('click', onClickOutside)
    window.addEventListener('resize', onReposition)
    window.addEventListener('scroll', onReposition, true)
})
onBeforeUnmount(() => {
    document.removeEventListener('click', onClickOutside)
    window.removeEventListener('resize', onReposition)
    window.removeEventListener('scroll', onReposition, true)
})
</script>

<template>
    <div class="relative" data-lang-switcher>
        <button
            ref="triggerRef"
            type="button"
            :aria-label="`Change language. Current: ${currentLanguage?.name}`"
            :aria-expanded="open"
            @click.stop="onTriggerClick"
            :class="[
                'flex items-center gap-2 text-sm font-medium transition-colors px-3 py-2 rounded-xl',
                variant === 'dark'
                    ? 'text-white/85 hover:text-white hover:bg-white/10'
                    : 'text-gray-700 hover:text-primary hover:bg-gray-50',
            ]"
        >
            <span class="fi flag-icon" :class="`fi-${currentLanguage?.flag}`" aria-hidden="true"></span>
            <span v-if="!compact" class="hidden sm:inline">{{ currentLanguage?.name }}</span>
            <span v-if="!compact" class="mdi mdi-chevron-down text-xs transition-transform" :class="open ? 'rotate-180' : ''" aria-hidden="true"></span>
        </button>

        <!--
            ClientOnly around Teleport so SSR doesn't serialize the dropdown
            portal at the wrong DOM location and trip a hydration mismatch
            ("rendered on server: <div ...> / expected on client:
            Symbol(v-cmt)"). The dropdown only opens on user click anyway,
            so client-only rendering loses nothing.
        -->
        <ClientOnly>
        <Teleport to="body">
            <div
                v-show="open"
                data-lang-switcher
                :style="dropdownStyle"
                class="w-44 bg-white rounded-xl shadow-xl border border-gray-100 p-2"
            >
                <button
                    v-for="lang in availableLanguages"
                    :key="lang.code"
                    type="button"
                    :disabled="switching"
                    @click="pickLanguage(lang.code)"
                    class="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors rounded-xl disabled:opacity-60 disabled:cursor-wait text-left"
                    :class="{ 'bg-primary/5': lang.code === locale }"
                >
                    <span class="fi flag-icon" :class="`fi-${lang.flag}`" aria-hidden="true"></span>
                    <span class="text-sm font-medium text-gray-900">{{ lang.name }}</span>
                    <span v-if="lang.code === locale" class="mdi mdi-check text-primary ml-auto"></span>
                </button>
            </div>
        </Teleport>
        </ClientOnly>
    </div>
</template>

<style scoped>
/* Slight cosmetic tweak: rounded corners + size, on top of the global flag-icons package */
.flag-icon {
    width: 1.4em;
    height: 1em;
    border-radius: 3px;
    flex-shrink: 0;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
}
</style>
