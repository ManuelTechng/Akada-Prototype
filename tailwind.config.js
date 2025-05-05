/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f0ff',
          100: '#b3d1ff',
          200: '#80b3ff',
          300: '#4d94ff',
          400: '#1a75ff',
          500: '#0066ff', // Primary brand color
          600: '#0052cc',
          700: '#003d99',
          800: '#002966',
          900: '#001433',
        },
        secondary: {
          50: '#fff0e6',
          100: '#ffd1b3',
          200: '#ffb380',
          300: '#ff944d',
          400: '#ff751a',
          500: '#ff6600', // Secondary brand color
          600: '#cc5200',
          700: '#993d00',
          800: '#662900',
          900: '#331400',
        },
        success: {
          500: '#10b981', // Success states
        },
        danger: {
          500: '#ef4444', // Error states, urgent deadlines
        },
        warning: {
          500: '#f59e0b', // Warning states
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6', // Page background
          200: '#e5e7eb',
          300: '#d1d5db', // Borders
          400: '#9ca3af',
          500: '#6b7280', // Secondary text
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937', // Primary text
          900: '#111827',
        },
        indigo: {
          50: '#eef2ff',
          100: '#e0e7ff', // Light backgrounds
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5', // Primary buttons, links
          700: '#4338ca', // Hover states
          800: '#3730a3',
          900: '#312e81',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Montserrat', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'system-ui', 'sans-serif'],
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