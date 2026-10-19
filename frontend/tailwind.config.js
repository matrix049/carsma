/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        surface: 'var(--surface)',
        primary: 'var(--primary)',
        // Night-drive palette — asphalt, carbon, chalk, redline.
        asphalt: '#0A0A0B',
        carbon: { DEFAULT: '#131316', 2: '#1B1B20', 3: '#26262D' },
        chalk: '#F4F4F0',
        smoke: '#8B8B94',
        redline: { DEFAULT: '#E5200C', hot: '#FF4A33', deep: '#9E1406' },
        // F1 timing-screen colours: purple = fastest, green = personal best.
        timing: { purple: '#B04BFF', green: '#2BD96B', yellow: '#FFD60A' },
        volt: '#D4FF3A',
      },
      fontFamily: {
        jakarta: 'var(--font-jakarta)',
        inter: 'var(--font-inter)',
        // "display" = Anybody, a variable face with a 50–150 width axis.
        display: ['var(--font-anybody)', 'Impact', 'Arial Narrow', 'sans-serif'],
        // Arabic / Darija copy.
        ar: ['var(--font-changa)', 'Tahoma', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      animation: {
        'wheel-spin': 'wheel-spin 1s linear infinite',
        'smoke-drift': 'smoke-drift 1.5s ease-out infinite',
        'car-drive': 'car-drive 20s linear infinite',
        'tire-mark': 'tire-mark 0.6s ease-out forwards',
        'scroll': 'scroll 40s linear infinite',
        'marquee': 'marquee var(--marquee-duration, 30s) linear infinite',
        'marquee-reverse': 'marquee var(--marquee-duration, 30s) linear infinite reverse',
        'pulse-led': 'pulse-led 1.2s ease-in-out infinite',
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
        'marquee': {
          '0%': { transform: 'translate3d(0,0,0)' },
          '100%': { transform: 'translate3d(-50%,0,0)' },
        },
        'pulse-led': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
