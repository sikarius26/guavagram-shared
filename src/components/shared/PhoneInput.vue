<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { getCountries, getCountryCallingCode, AsYouType, parsePhoneNumberFromString } from 'libphonenumber-js'

const EXCLUDED = ['VA', 'IC', 'CA', 'GG', 'IM', 'JE', 'GP', 'MF']

const countries = getCountries()
    .filter(c => !EXCLUDED.includes(c))
    .map(c => {
        const name = typeof Intl !== 'undefined'
            ? (new Intl.DisplayNames(['en'], { type: 'region' }).of(c) ?? c)
            : c
        return { code: c.toLowerCase(), dialCode: `+${getCountryCallingCode(c)}`, name }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

const props = defineProps({
    phone: { type: String, required: true },
    phoneDialCode: { type: String, required: true },
    disabled: { type: Boolean, default: false }
})

const emits = defineEmits<{
    'update:phone': [string]
    'update:phoneDialCode': [string]
    'update:isValid': [boolean]
}>()

const isOpen = ref(false)
const search = ref('')
const triggerRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const searchRef = ref<HTMLInputElement | null>(null)
const dropdownStyle = ref<Record<string, string>>({})

const selected = computed(() =>
    countries.find(c => c.dialCode === props.phoneDialCode) ?? countries[0]
)

const filtered = computed(() => {
    if (!search.value) return countries
    const q = search.value.toLowerCase()
    return countries.filter(c => c.name.toLowerCase().includes(q) || c.dialCode.includes(q))
})

const formattedPhone = computed(() =>
    new AsYouType(selected.value?.code.toUpperCase() as any).input(props.phone ?? '')
)

const updatePosition = () => {
    if (!triggerRef.value) return
    const rect = triggerRef.value.getBoundingClientRect()
    dropdownStyle.value = {
        position: 'fixed',
        top: `${rect.bottom + 4}px`,
        left: `${rect.left}px`,
        width: '260px',
        zIndex: '9999'
    }
}

const open = () => {
    isOpen.value = true
    search.value = ''
    nextTick(() => {
        updatePosition()
        searchRef.value?.focus({ preventScroll: true })
    })
}

const close = () => { isOpen.value = false }

const toggle = () => { if (!props.disabled) isOpen.value ? close() : open() }

const select = (c: typeof countries[0]) => {
    emits('update:phoneDialCode', c.dialCode)
    close()
}

const onPhoneInput = (e: Event) => {
    const val = (e.target as HTMLInputElement).value
    
    if (val.startsWith('+')) {
        const parsed = parsePhoneNumberFromString(val)
        if (parsed) {
            const detectedDialCode = `+${parsed.countryCallingCode}`
            const detectedCountry = countries.find(c => c.dialCode === detectedDialCode)
            
            if (detectedCountry && detectedDialCode !== props.phoneDialCode) {
                emits('update:phoneDialCode', detectedDialCode)
            }
            
            emits('update:phone', parsed.nationalNumber)
            emits('update:isValid', parsed.isValid())
            return
        }
    }
    
    const num = parsePhoneNumberFromString(`${props.phoneDialCode}${val}`)
    if (num?.countryCallingCode) {
        const detectedDialCode = `+${num.countryCallingCode}`
        if (detectedDialCode !== props.phoneDialCode) {
            emits('update:phoneDialCode', detectedDialCode)
        }
    }
    emits('update:phone', val)
    emits('update:isValid', num?.isValid() ?? false)
}

const onOutside = (e: MouseEvent) => {
    if (!triggerRef.value?.contains(e.target as Node) && !dropdownRef.value?.contains(e.target as Node))
        close()
}

const onScroll = (e: Event) => {
    if (dropdownRef.value?.contains(e.target as Node)) return
    close()
}

onMounted(() => {
    document.addEventListener('mousedown', onOutside)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', close)
})

onUnmounted(() => {
    document.removeEventListener('mousedown', onOutside)
    window.removeEventListener('scroll', onScroll, true)
    window.removeEventListener('resize', close)
})
</script>

<template>
    <div
        class="flex items-center w-full border border-[rgba(30,32,33,0.2)] rounded-lg transition-colors"
        :class="disabled ? 'bg-[#EDEEF166] opacity-60 pointer-events-none select-none' : 'bg-white focus-within:border-[#00AF66]'"
    >
        <!-- Dial Code Trigger -->
        <button
            ref="triggerRef"
            type="button"
            @click="toggle"
            class="flex items-center gap-1.5 px-3 h-[45px] border-r border-[rgba(30,32,33,0.2)] select-none shrink-0 rounded-l-lg transition-colors"
            :class="disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'"
        >
            <span v-if="selected" class="fi rounded text-xs" :class="'fi-' + selected.code"></span>
            <span class="text-[15px] font-medium text-[#1E2021]">{{ selected?.dialCode }}</span>
            <svg
                class="w-3 h-3 text-[rgba(30,32,33,0.4)] transition-transform duration-150"
                :class="{ 'rotate-180': isOpen }"
                viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>

        <!-- Phone Number Input -->
        <input
            class="flex-1 min-w-0 outline-none border-none h-[45px] px-3 text-[15px] rounded-r-lg bg-transparent"
            :class="disabled ? 'text-[#1E202180] cursor-not-allowed' : 'text-[#1E2021] placeholder:text-[rgba(30,32,33,0.5)]'"
            @input="onPhoneInput"
            :value="formattedPhone"
            :readonly="disabled"
            type="tel"
            :placeholder="$t('phoneNumberPlaceholder')"
        />

        <!-- Dropdown (Teleported to body) -->
        <Teleport to="body">
            <div
                v-if="isOpen"
                ref="dropdownRef"
                :style="dropdownStyle"
                class="bg-white rounded-xl border border-[rgba(30,32,33,0.12)] shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden"
            >
                <!-- Search -->
                <div class="p-2 border-b border-[rgba(30,32,33,0.08)]">
                    <input
                        ref="searchRef"
                        v-model="search"
                        type="text"
                        :placeholder="$t('searchCountry')"
                        class="w-full font-['Urbanist'] font-semibold text-base leading-none tracking-[-0.01em] px-3 py-2 border border-[rgba(30,32,33,0.15)] rounded-lg outline-none focus:border-[#00AF66] bg-[#FAFAFA] placeholder:text-[rgba(30,32,33,0.4)] placeholder:font-normal"
                    />
                </div>
                <!-- Options -->
                <ul class="overflow-y-auto max-h-[220px]">
                    <li
                        v-for="c in filtered"
                        :key="c.code"
                        @mousedown.prevent="select(c)"
                        class="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer text-[#1E2021] hover:bg-[#F5F5F5] transition-colors"
                        :class="{ 'bg-[#F0F0F0]': c.dialCode === phoneDialCode }"
                    >
                        <span class="fi rounded text-xs shrink-0" :class="'fi-' + c.code"></span>
                        <span class="font-['Urbanist'] font-semibold text-base leading-none tracking-[-0.01em] flex-1 truncate">{{ c.name }}</span>
                        <span class="font-['Urbanist'] font-semibold text-base leading-none tracking-[-0.01em] text-[rgba(30,32,33,0.5)] shrink-0">{{ c.dialCode }}</span>
                    </li>
                    <li v-if="filtered.length === 0" class="px-3 py-4 text-sm text-center text-[rgba(30,32,33,0.4)]">
                        {{ $t('noResults') }}
                    </li>
                </ul>
            </div>
        </Teleport>
    </div>
</template>
