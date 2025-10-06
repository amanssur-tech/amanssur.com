import { defineConfig } from 'vite';

export default defineConfig({
  ssr: {
    external: [
      'zod/locales', // <-- this silences the bogus missing specifier
    ],
  },
  optimizeDeps: {
    exclude: ['zod/locales'],
  },
});