// functions/debug-env.ts
// A simple debug endpoint to inspect the environment variables and bindings.
// This can be useful to verify that the expected bindings are present.

// Note: This file is intended to be deployed as a separate Worker route,
// e.g., /debug-env, to avoid exposing sensitive information in production.
// Ensure that this endpoint is protected or removed in production environments.

// We do not import any other modules here to avoid pulling in unnecessary dependencies.
// This keeps the Worker lightweight and avoids potential security issues.

// The environment variables and bindings are accessible via the `env` parameter
// passed to the event handler. We will list all keys in the `env` object.

// Define the expected shape of the environment object.
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