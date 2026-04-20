/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        surface: 'var(--surface)',
        primary: 'var(--primary)',
      },
      fontFamily: {
        jakarta: 'var(--font-jakarta)',
        inter: 'var(--font-inter)',
      },
      animation: {
        'wheel-spin': 'wheel-spin 1s linear infinite',
        'smoke-drift': 'smoke-drift 1.5s ease-out infinite',
        'car-drive': 'car-drive 20s linear infinite',
        'tire-mark': 'tire-mark 0.6s ease-out forwards',
        'scroll': 'scroll 40s linear infinite',
      },
      keyframes: {
        'wheel-spin': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'smoke-drift': {
          '0%': {
            opacity: '0.6',
            transform: 'translateX(0) scale(0.5)',
          },
          '50%': {
            opacity: '0.3',
          },
          '100%': {
            opacity: '0',
            transform: 'translateX(-30px) scale(1.5)',
          },
        },
        'car-drive': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(100vw)' },
        },
        'tire-mark': {
          '0%': {
            opacity: '0',
            transform: 'scaleX(0)',
          },
          '50%': {
            opacity: '0.3',
          },
          '100%': {
            opacity: '0',
            transform: 'scaleX(1)',
          },
        },
        'scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'media',
}