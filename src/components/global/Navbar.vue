<script setup lang="ts">
const localePath = useLocalePath()
const route = useRoute()
const { locale } = useI18n()

const props = withDefaults(defineProps<{
    minimal?: boolean
    mode?: 'restaurant' | 'creator'
}>(), {
    minimal: false,
    mode: 'restaurant',
})

const ctaHref = computed(() => props.mode === 'creator' ? '/register/creator' : '/register/restaurant')

interface NavbarMenuItem {
    label: string
    href: string
    children?: NavbarMenuItem[]
    description?: string
    isHighlighted?: boolean
}

interface NavbarContent {
    path: string
    logoAlt: string
    loginText: string
    bookDemoText: string
    menuItems: NavbarMenuItem[]
}

const { data: navbarContent } = await useAsyncData(`global-${locale.value}-navbar`, async () => {
    const content = await queryCollection(`global_${locale.value}`).path('navbar').first()
    return content?.meta as any as NavbarContent
})

const isActiveRoute = (href: string): boolean => {
    const currentPath = route.path
    const linkPath = localePath(href)

    const normalizePath = (path: string) => {
        return path === '/' ? path : path.replace(/\/$/, '')
    }

    const normalizedCurrent = normalizePath(currentPath)
    const normalizedLink = normalizePath(linkPath)

    if (normalizedCurrent === normalizedLink) {
        return true
    }

    if (href !== '/' && normalizedCurrent.startsWith(normalizedLink + '/')) {
        return true
    }

    return false
}
</script>
<template>
    <nav
        class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md bg-white/70 border-b border-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="relative flex justify-between items-center h-20">
                <NuxtLink :to="localePath('/')" class="flex items-center gap-3 cursor-pointer">
                    <img src="/images/logo-guavagram-color.png" alt="Guavagram" width="150" class="h-8 w-auto" />
                </NuxtLink>
                <nav v-if="!props.minimal" class="hidden md:flex items-center space-x-8 absolute left-1/2 -translate-x-1/2 pointer-events-none">
                    <template v-for="link in navbarContent?.menuItems" :key="link.label">
                        <NuxtLink v-if="!link.children"
                            :to="localePath(link.href)"
                            :class="[
                                'text-sm font-medium transition-colors pointer-events-auto',
                                isActiveRoute(link.href)
                                    ? 'text-gray-900 font-semibold'
                                    : 'text-text-main hover:opacity-80'
                            ]">
                            {{ link.label }}
                        </NuxtLink>
                    </template>
                </nav>
                <div class="hidden md:flex items-center gap-4">
                    <LanguageSwitcher align="right" />
                    <NuxtLink :to="localePath('/login')" class="text-sm font-bold text-gray-900 hover:text-primary transition-colors">{{ navbarContent?.loginText || 'Iniciar sesión' }}</NuxtLink>
                    <NuxtLink v-if="!props.minimal" :to="localePath(ctaHref)"
                        class="bg-gradient-emerald hover:bg-gradient-emerald-hover text-white text-sm font-bold py-2.5 px-6 rounded-full transition-all shadow-lg shadow-[0_4px_14px_rgba(16,185,129,0.35)]">
                        {{ navbarContent?.bookDemoText || 'Empezar' }}
                    </NuxtLink>
                </div>
                <div class="md:hidden flex items-center gap-2">
                    <NuxtLink v-if="props.minimal" :to="localePath('/login')" class="text-sm font-bold text-gray-900 hover:text-primary transition-colors px-2">{{ navbarContent?.loginText || 'Iniciar sesión' }}</NuxtLink>
                    <LanguageSwitcher compact align="right" />
                </div>
            </div>
        </div>
    </nav>
</template>
