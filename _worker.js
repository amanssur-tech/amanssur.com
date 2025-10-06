import worker from './_astro_worker.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Custom API routes — you handle those first
    if (url.pathname.startsWith('/api/debug-env')) {
      return new Response(
        JSON.stringify({ env: Object.keys(env) }, null, 2),
        { headers: { 'content-type': 'application/json' } }
      );
    }

    // Let Astro handle everything else
    return worker.fetch(request, env, ctx);
  },
};