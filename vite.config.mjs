// vite.config.mjs
export default {
  ssr: {
    external: ["zod/locales"],
  },
  optimizeDeps: {
    exclude: ["zod/locales"],
  },
};
