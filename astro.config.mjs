import { defineConfig } from 'astro/config'
import cloudflare from '@astrojs/cloudflare';
import svelte from '@astrojs/svelte'
import mdx from '@astrojs/mdx'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  adapter: cloudflare(),
  integrations: [svelte(), mdx()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve('./src'),
        '@/lib': path.resolve('./src/lib'),
      },
    },
    server: {
      host: true,
      allowedHosts: ['theola-unmappable-yousef.ngrok-free.dev']
    }
  },
})