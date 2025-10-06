export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // ✅ Custom route for debugging environment
    if (url.pathname === "/debug-env") {
      return new Response(
        JSON.stringify(
          {
            env: Object.keys(env), // just list keys, to avoid leaking secrets
          },
          null,
          2
        ),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // ✅ Example: custom /api/* logic
    if (url.pathname.startsWith("/api/")) {
      return new Response("Hello from /api!", {
        headers: { "Content-Type": "text/plain" },
      });
    }

    // ✅ Fallback — serve static Astro assets
    return env.ASSETS.fetch(request);
  },
};