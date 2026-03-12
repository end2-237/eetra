/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Bricolage Grotesque', 'sans-serif'],
        serif: ['Libre Caslon Text', 'serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        accent: {
          DEFAULT: '#1B4FD8',
          hover: '#1540B0',
          light: 'rgba(27,79,216,0.08)',
          light2: 'rgba(27,79,216,0.15)',
          dark: '#3B7FFF',
        },
      },
    },
  },
  plugins: [],
}
