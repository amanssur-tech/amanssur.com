import type { MiddlewareHandler } from "astro";
import { resolveLang } from "./lib/lang";

export const onRequest: MiddlewareHandler = async (context, next) => {
  const acceptLanguage = context.request.headers.get("accept-language");
  const lang = resolveLang({ cookies: context.cookies, acceptLanguage });

  (context.locals as Record<string, unknown>).lang = lang;

  return next();
};
