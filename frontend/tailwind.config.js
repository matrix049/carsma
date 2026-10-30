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
        // Showroom palette — graphite, platinum, and a xenon-LED accent used sparingly.
        asphalt: '#0A0A0B',
        carbon: { DEFAULT: '#121316', 2: '#1A1B1F', 3: '#25272C' },
        chalk: '#F2F3F5',
        smoke: '#8E929A',
        silver: { DEFAULT: '#C3C8CF', light: '#E4E7EB', dark: '#80868F' },
        xenon: { DEFAULT: '#8FCBFF', deep: '#4DA3FF' },
      },
      fontFamily: {
        jakarta: 'var(--font-jakarta)',
        inter: 'var(--font-inter)',
        // "display" = Anybody, a variable face with a 50–150 width axis.
        display: ['var(--font-anybody)', 'Arial', 'sans-serif'],
        // Arabic / Darija copy.
        ar: ['var(--font-changa)', 'Tahoma', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      animation: {
        'scroll': 'scroll 40s linear infinite',
        'pulse-led': 'pulse-led 1.2s ease-in-out infinite',
        'shimmer': 'shimmer 1.6s ease-in-out infinite',
      },
      keyframes: {
        'scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'pulse-led': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
