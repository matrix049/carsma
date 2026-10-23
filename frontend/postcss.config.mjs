import { fileURLToPath } from 'node:url';

// Fallbacks for older iPhones / Android (svh units, aspect-ratio). Absolute
// path: Turbopack resolves plugin names from outside this folder.
const legacyFallbacks = fileURLToPath(new URL('./postcss-legacy-fallbacks.cjs', import.meta.url));

const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    [legacyFallbacks]: {},
  },
};

export default config;
