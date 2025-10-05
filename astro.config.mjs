import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import svelte from '@astrojs/svelte';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  adapter: cloudflare(),
  integrations: [svelte(), mdx()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@/lib': path.resolve(__dirname, './src/lib'),
      },
    },
    server: {
      host: true,
      allowedHosts: ['theola-unmappable-yousef.ngrok-free.dev'],
    },
  },
});