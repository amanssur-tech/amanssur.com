// vite.config.mjs
import { defineConfig, mergeConfig } from "vite";

export default defineConfig(() => {
  return mergeConfig(
    {},
    {
      ssr: {
        external: ["zod/locales"],
      },
      optimizeDeps: {
        exclude: ["zod/locales"],
      },
    },
  );
});
