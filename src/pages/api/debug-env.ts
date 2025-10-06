export async function onRequestGet(context: { env?: Record<string, unknown> }) {
  const envVars = Object.fromEntries(
    Object.entries(context.env || {}).slice(0, 10) // show a few only
  );

  return new Response(JSON.stringify(envVars, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
}