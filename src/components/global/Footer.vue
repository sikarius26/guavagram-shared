<script setup lang="ts">
const { locale } = useI18n()
const localePath = useLocalePath()

interface FooterLink {
    text: string
    href: string
}

interface FooterContent {
    path: string
    copyright: string
    links: FooterLink[]
}

const { data: footerContent } = await useAsyncData(`global-${locale.value}-footer`, async () => {
    const content = await queryCollection(`global_${locale.value}`).path('footer').first()
    return content?.meta as any as FooterContent
})
</script>

<template>
    <footer class="border-t border-gray-200 bg-background-light py-12 dark:border-gray-800 dark:bg-background-dark">
        <div class="mx-auto max-w-7xl px-6 lg:px-8">
            <div class="flex flex-col md:flex-row justify-between items-center gap-6">
                <div class="flex items-center gap-2">
                    <span class="mdi mdi-pizza text-gray-400 text-xl"></span>
                    <p class="text-sm text-gray-500 dark:text-gray-400" v-html="footerContent?.copyright"></p>
                </div>
                <div class="flex gap-6">
                    <NuxtLink v-for="link in footerContent?.links" :key="link.text"
                        :to="localePath({ path: link.href })"
                        class="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        {{ link.text }}
                    </NuxtLink>
                </div>
            </div>
        </div>
    </footer>
</template>