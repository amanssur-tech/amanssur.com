/// <reference types="astro/client" />

declare module "astro:middleware" {
  import type {
    APIContext,
    MiddlewareNext,
    MiddlewareResponseHandler,
  } from "astro";
  export function defineMiddleware(
    handler: MiddlewareResponseHandler,
  ): MiddlewareResponseHandler;
  export type { APIContext, MiddlewareNext, MiddlewareResponseHandler };
}
