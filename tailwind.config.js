/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      xs: '320px',
      sm: '480px',
      md: '640px',
      lg: '768px',
      xl: '1024px',
      '2xl': '1280px',
      '3xl': '1536px',
    },
    extend: {
      fontFamily: {
        sans: ['Bricolage Grotesque', 'sans-serif'],
        serif: ['Libre Caslon Text', 'serif'],
        mono: ['DM Mono', 'monospace'],
      },
      fontSize: {
        // Responsive typography with clamp
        xs: 'clamp(0.75rem, 1vw, 0.875rem)',
        sm: 'clamp(0.875rem, 1.2vw, 1rem)',
        base: 'clamp(1rem, 1.5vw, 1.125rem)',
        lg: 'clamp(1.125rem, 2vw, 1.25rem)',
        xl: 'clamp(1.25rem, 2.5vw, 1.5rem)',
        '2xl': 'clamp(1.5rem, 3vw, 1.875rem)',
        '3xl': 'clamp(1.875rem, 4vw, 2.25rem)',
      },
      spacing: {
        safe: 'env(safe-area-inset-top)',
        'safe-b': 'env(safe-area-inset-bottom)',
        'safe-l': 'env(safe-area-inset-left)',
        'safe-r': 'env(safe-area-inset-right)',
      },
      minHeight: {
        touch: '44px', // Minimum touch target size
      },
      minWidth: {
        touch: '44px', // Minimum touch target size
      },
    },
  },
  plugins: [
    // Custom plugin for touch-friendly targets and responsive utilities
    ({ addComponents, addUtilities, matchUtilities, theme }) => {
      // Touch-friendly button component
      addComponents({
        '.btn-touch': {
          '@apply min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg transition-all': {},
        },
      })
      
      // Responsive utilities for common breakpoints
      addUtilities({
        '.xs-only': {
          '@apply block md:hidden': {},
        },
        '.md-only': {
          '@apply hidden md:block lg:hidden': {},
        },
        '.lg-only': {
          '@apply hidden lg:block': {},
        },
      })
    },
  ],
}
