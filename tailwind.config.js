/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"], // Modifié pour supporter shadcn
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{ts,tsx}', // Ajout crucial pour les composants shadcn
  ],
  theme: {
    // On garde tes screens personnalisés
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
      // --- CONFIGURATION SHADCN (NÉCESSAIRE) ---
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // --- TES RÉGLAGES PERSOS (CONSERVÉS) ---
      fontFamily: {
        sans: ['Bricolage Grotesque', 'sans-serif'],
        serif: ['Libre Caslon Text', 'serif'],
        mono: ['DM Mono', 'monospace'],
      },
      fontSize: {
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
      minHeight: { touch: '44px' },
      minWidth: { touch: '44px' },
    },
  },
  plugins: [
    require("tailwindcss-animate"), // Obligatoire pour shadcn
    ({ addComponents, addUtilities }) => {
      // Tes plugins persos restent ici...
      addComponents({
        '.btn-touch': {
          '@apply min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg transition-all': {},
        },
      })
      addUtilities({
        '.xs-only': { '@apply block md:hidden': {} },
        '.md-only': { '@apply hidden md:block lg:hidden': {} },
        '.lg-only': { '@apply hidden lg:block': {} },
      })
    },
  ],
}