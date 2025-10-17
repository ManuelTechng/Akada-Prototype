/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5', // Primary brand color (indigo)
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        secondary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // Secondary (green)
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Figma-specific status card colors
        status: {
          // Light mode status cards
          'profile-light': '#E8E5FF',
          'deadline-light': '#2D5A6B',
          'matches-light': '#E6E3FF',
          'budget-light': '#8B6F47',
          // Dark mode status cards
          'profile-dark': '#1A4D3E',
          'deadline-dark': '#1E3A5F',
          'matches-dark': '#4A3A7F',
          'budget-dark': '#6B4A37',
        },
        success: {
          500: '#10b981',
          600: '#059669',
        },
        danger: {
          500: '#ef4444',
          600: '#dc2626',
        },
        warning: {
          500: '#f59e0b',
          600: '#d97706',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // Dark mode backgrounds (Figma dark navy)
        'dark-bg': {
          primary: '#0A0E1A',
          secondary: '#0B1020',
          tertiary: '#151B2E',
          card: '#121D3F',
        },
        'dark-text': {
          primary: '#F9FAFB',
          secondary: '#D1D5DB',
          tertiary: '#9CA3AF',
        },
        'dark-border': {
          primary: '#ffffff14', // white/10
          secondary: '#ffffff1f', // white/15
        },
        // Chart colors
        'chart-dark': {
          primary: '#60a5fa',
          secondary: '#a78bfa',
          tertiary: '#34d399',
          quaternary: '#fbbf24',
          quinary: '#f87171',
          senary: '#22d3ee',
        },
        indigo: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-heading)', 'var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'hover': '0 10px 30px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}