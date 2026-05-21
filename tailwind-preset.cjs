// Shared Tailwind preset consumed by both guavagram/ (public) and
// guavagram-admin/ (backoffices). Each app's tailwind.config.js just
// declares its own content paths and references this preset, so theme
// tokens (colors, fonts, radii, gradients, shadows, plugins) stay in a
// single source of truth instead of being copy-pasted between apps.
//
// Apps:
//   presets: [require('@guava/guavagram-shared/tailwind-preset.cjs')]
//   content: ['./app/**/*.{vue,js,ts}', '../guavagram-shared/src/**/*.{vue,js,ts}', ...]
module.exports = {
  darkMode: 'class',
  theme: {
    themeVariants: ['light'],
    customForms: (theme) => ({
      default: {
        'input, textarea': {
          '&::placeholder': {
            color: theme('colors.gray.400')
          }
        }
      }
    }),
    colors: {
      transparent: 'transparent',
      "surface-light": "#f8f6f6",
      "surface-dark": "#221010",
      white: '#ffffff',
      black: '#000000',
      primary: '#FF2D23',
      gray: {
        50: '#F5F5F5',
        100: '#f4f5f7',
        200: '#e5e5e5',
        300: '#E3E3E3',
        400: '#b0b2b9',
        500: '#8B8B8B',
        600: '#4b5563',
        700: '#515151',
        800: '#252f3f',
        900: '#161e2e',
        label: '#262626',
        pnp1: '#9d9391',
        pnp2: '#6f6f6f',
        pnp3: '#aaaaaa',
        pnp4: '#a09090',
        pnp5: '#afafaf',
        pnp6: '#676767',
        material: 'rgb(30,32,33)'
      },
      cyan: {
        50: '#ecfeff',
        100: '#cffafe',
        200: '#a5f3fc',
        300: '#67e8f9',
        400: '#22d3ee',
        500: '#06b6d4',
        600: '#0891b2',
        700: '#0e7490',
        800: '#155e75',
        900: '#164e63'
      },
      'cool-gray': {
        50: '#fbfdfe',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cfd8e3',
        400: '#97a6ba',
        500: '#64748b',
        600: '#475569',
        700: '#364152',
        800: '#27303f',
        900: '#1a202e'
      },
      red: {
        50: '#fdf2f2',
        100: '#fde8e8',
        200: '#fbd5d5',
        300: '#f8b4b4',
        400: '#f98080',
        500: '#f05252',
        600: '#e02424',
        700: '#c81e1e',
        800: '#9b1c1c',
        900: '#771d1d',
        pnp: '#E94B4E'
      },
      orange: {
        50: '#fff8f1',
        100: '#feecdc',
        200: '#fcd9bd',
        300: '#fdba8c',
        400: '#ff8a4c',
        500: '#ff5a1f',
        600: '#d03801',
        700: '#b43403',
        800: '#8a2c0d',
        900: '#771d1d'
      },
      yellow: {
        50: '#fdfdea',
        100: '#fdf6b2',
        200: '#fce96a',
        300: '#faca15',
        400: '#e3a008',
        500: '#c27803',
        600: '#9f580a',
        700: '#8e4b10',
        800: '#723b13',
        900: '#633112',
        gold: '#ffb900'
      },
      green: {
        50: '#f3faf7',
        100: '#def7ec',
        200: '#bcf0da',
        300: '#84e1bc',
        400: '#31c48d',
        500: '#0e9f6e',
        600: '#057a55',
        700: '#046c4e',
        800: '#03543f',
        900: '#014737',
        success: '#17c083'
      },
      teal: {
        50: '#edfafa',
        100: '#d5f5f6',
        200: '#afecef',
        300: '#7edce2',
        400: '#16bdca',
        500: '#0694a2',
        600: '#047481',
        700: '#036672',
        800: '#05505c',
        900: '#014451'
      },
      blue: {
        50: '#ebf5ff',
        100: '#e1effe',
        200: '#c3ddfd',
        300: '#a4cafe',
        400: '#76a9fa',
        500: '#3f83f8',
        600: '#1c64f2',
        700: '#1a56db',
        800: '#1e429f',
        900: '#233876'
      },
      indigo: {
        50: '#f0f5ff',
        100: '#e5edff',
        200: '#cddbfe',
        300: '#b4c6fc',
        400: '#8da2fb',
        500: '#6875f5',
        600: '#5850ec',
        700: '#5145cd',
        800: '#42389d',
        900: '#362f78'
      },
      purple: {
        50: '#f6f5ff',
        100: '#edebfe',
        200: '#dcd7fe',
        300: '#cabffd',
        400: '#ac94fa',
        500: '#9061f9',
        600: '#7e3af2',
        700: '#6c2bd9',
        800: '#5521b5',
        900: '#4a1d96'
      },
      pink: {
        50: '#fdf2f8',
        100: '#fce8f3',
        200: '#fad1e8',
        300: '#f8b4d9',
        400: '#f17eb8',
        500: '#e74694',
        600: '#d61f69',
        700: '#bf125d',
        800: '#99154b',
        900: '#751a3d'
      }
    },
    extend: {
      minWidth: {
        7: '1.75rem'
      },
      colors: {
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        ranking: {
          gold: '#d4a42a',
          goldLight: '#f4c744',
          silver: '#9ca3af',
          silverLight: '#e5e7eb',
          bronze: '#c68b50',
          bronzeLight: '#e5a96d',
        },
        semantic: {
          trending: '#3b82f6',
          place: '#0d9488',
          placeDark: '#115e59',
          trust: '#2b7fff',
        },
        surface: {
          cream: '#fef9f5',
          creamWarm: '#fff4ee',
          creamBorder: '#f4e8dd',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(180deg, #FF5A52 0%, #FF2D23 50%, #E0261E 100%)',
        'gradient-primary-hover': 'linear-gradient(180deg, #FF6A62 0%, #FF3D35 50%, #E83028 100%)',
        'gradient-emerald': 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
        'gradient-emerald-hover': 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)',
        'gradient-ranking-gold': 'linear-gradient(135deg, #f4c744 0%, #d4a42a 100%)',
        'gradient-ranking-silver': 'linear-gradient(135deg, #e5e7eb 0%, #9ca3af 100%)',
        'gradient-ranking-bronze': 'linear-gradient(135deg, #e5a96d 0%, #c68b50 100%)',
        'gradient-cta-charcoal': 'linear-gradient(135deg, #1f1410 0%, #2a1f1a 50%, #3d2817 100%)',
        'gradient-hero-warm': 'linear-gradient(135deg, #FF2D23 0%, #f59e0b 100%)',
        'shimmer-overlay': 'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)',
      },
      screens: {
        lg: '1080px'
      },
      zIndex: {
        '-1': '-1',
        70: '70'
      },
      borderWidth: {
        3: '3px'
      },
      boxShadow: {
        default: '0px 8px 20px rgba(0, 0, 0, 0.1)',
        'soft': '0 4px 14px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px -5px rgba(236, 19, 19, 0.3)',
        'pill-primary': '0 4px 14px -2px rgba(255, 45, 35, 0.25), 0 2px 8px -2px rgba(255, 45, 35, 0.15)',
        'pill-emerald': '0 4px 14px -2px rgba(16, 185, 129, 0.35), 0 2px 8px -2px rgba(16, 185, 129, 0.2)',
        'phone': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      borderRadius: {
        default: '7px'
      },
      maxHeight: {
        0: '0',
        xl: '36rem'
      },
      fontFamily: {
        display: ['Inter Tight', 'Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(10px, -5px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(16, 185, 129, 0.3)' },
          '50%': { boxShadow: '0 0 24px rgba(16, 185, 129, 0.6)' },
        },
        shine: {
          '0%': { left: '-100%' },
          '100%': { left: '200%' },
        },
        progressStripe: {
          '0%': { backgroundPosition: '1rem 0' },
          '100%': { backgroundPosition: '0 0' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.4s ease-out both',
        drift: 'drift 20s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        shine: 'shine 2s ease-in-out infinite',
        'progress-stripe': 'progressStripe 1s linear infinite',
        'gradient-shift': 'gradientShift 6s ease-in-out infinite',
      }
    }
  },
  variants: {
    backgroundColor: [
      'hover',
      'focus',
      'active',
      'odd',
      'dark',
      'dark:hover',
      'dark:focus',
      'dark:active',
      'dark:odd',
      'disabled'
    ],
    display: ['responsive', 'dark'],
    textColor: [
      'focus-within',
      'hover',
      'active',
      'dark',
      'dark:focus-within',
      'dark:hover',
      'dark:active',
      'disabled'
    ],
    placeholderColor: ['focus', 'dark', 'dark:focus'],
    borderColor: ['focus', 'hover', 'dark', 'dark:focus', 'dark:hover', 'disabled'],
    divideColor: ['dark'],
    boxShadow: ['focus', 'dark:focus', 'disabled']
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.no-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        },
        '.no-scrollbar::-webkit-scrollbar': {
          display: 'none',
        },
        '.scroll-snap-x': {
          'scroll-snap-type': 'x mandatory',
          'scroll-padding-left': '1.5rem',
        },
        '.snap-card': {
          'scroll-snap-align': 'start',
        },
      })
    },
  ]
}
