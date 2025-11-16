// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import svelte from "@astrojs/svelte";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";
import viteConfig from "./vite.config.mjs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
    imageService: "cloudflare",
  }),
  integrations: [svelte(), mdx()],
  vite: {
    ...viteConfig,
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@/lib": path.resolve(__dirname, "./src/lib"),
        "zod/locales": path.resolve(
          __dirname,
          "./node_modules/zod/lib/locales/index.js",
        ),
      },
    },
    optimizeDeps: {
      exclude: ["zod"],
    },
    ssr: {
      noExternal: ["zod"],
      external: ["zod/locales"],
    },
    server: {
      host: true,
      allowedHosts: ["theola-unmappable-yousef.ngrok-free.dev"],
    },
  },
});
