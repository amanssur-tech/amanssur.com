interface Env {
  [key: string]: unknown;
}

interface Context {
  env: Env;
}

export async function onRequestGet(context: Context): Promise<Response> {
  return new Response(JSON.stringify({
    env: Object.keys(context.env),
  }, null, 2), {
    headers: { "content-type": "application/json" },
  });
}