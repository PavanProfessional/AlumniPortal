/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', '"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Each step reads an "r g b" triplet from a CSS custom property (set in
        // index.css, overridden at runtime in AppStateContext from the tenant's
        // chosen brand color) via the <alpha-value> pattern, so /opacity modifiers
        // (bg-brand-600/10, etc.) keep working and the entire product can be
        // re-themed from one admin-picked color.
        brand: {
          50: 'rgb(var(--color-brand-50) / <alpha-value>)',
          100: 'rgb(var(--color-brand-100) / <alpha-value>)',
          200: 'rgb(var(--color-brand-200) / <alpha-value>)',
          300: 'rgb(var(--color-brand-300) / <alpha-value>)',
          400: 'rgb(var(--color-brand-400) / <alpha-value>)',
          500: 'rgb(var(--color-brand-500) / <alpha-value>)',
          600: 'rgb(var(--color-brand-600) / <alpha-value>)',
          700: 'rgb(var(--color-brand-700) / <alpha-value>)',
          800: 'rgb(var(--color-brand-800) / <alpha-value>)',
          900: 'rgb(var(--color-brand-900) / <alpha-value>)',
          950: 'rgb(var(--color-brand-950) / <alpha-value>)',
        },
        accent: {
          50: '#effcf6',
          100: '#d7f7e8',
          200: '#b1eed3',
          300: '#7fdfb9',
          400: '#48c99a',
          500: '#23ae80',
          600: '#178d68',
          700: '#147155',
          800: '#145a45',
          900: '#124a3a',
        },
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5d9e2',
          300: '#b1b8c8',
          400: '#8690a8',
          500: '#66708c',
          600: '#515974',
          700: '#42485e',
          800: '#2c303f',
          900: '#1a1c26',
          950: '#101119',
        },
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgba(16, 17, 25, 0.04), 0 1px 3px 0 rgba(16, 17, 25, 0.06)',
        card: '0 1px 2px 0 rgba(16, 17, 25, 0.04), 0 8px 24px -8px rgba(16, 17, 25, 0.10)',
        popover: '0 12px 36px -8px rgba(16, 17, 25, 0.22), 0 4px 10px -4px rgba(16, 17, 25, 0.12)',
      },
      borderRadius: {
        xl2: '1.1rem',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: 0, transform: 'translateY(4px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        'scale-in': { '0%': { opacity: 0, transform: 'scale(.97)' }, '100%': { opacity: 1, transform: 'scale(1)' } },
      },
      animation: {
        'fade-in': 'fade-in .25s ease-out',
        'scale-in': 'scale-in .15s ease-out',
      },
    },
  },
  plugins: [],
}
