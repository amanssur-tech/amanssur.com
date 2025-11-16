import type { AstroCookies } from "astro";
import type { Lang } from "./i18n";

const COOKIE_NAME = "lang";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

type CookieReader = Pick<AstroCookies, "get">;
type CookieWriter = Pick<AstroCookies, "set">;

const normalizeLang = (value?: string | null): Lang | null => {
  if (!value) return null;
  const lower = value.toLowerCase();
  if (lower.startsWith("de")) return "de";
  if (lower.startsWith("en")) return "en";
  return null;
};

export const getLangCookie = (cookies?: CookieReader): Lang | null => {
  if (cookies) {
    return normalizeLang(cookies.get(COOKIE_NAME)?.value ?? undefined);
  }

  if (typeof document !== "undefined") {
    const cookie = document.cookie
      .split("; ")
      .map((row) => row.trim())
      .find((row) => row.startsWith(`${COOKIE_NAME}=`));
    if (cookie) {
      const [, value] = cookie.split("=");
      return normalizeLang(value);
    }
  }

  return null;
};

export const setLangCookie = (lang: Lang, cookies?: CookieWriter) => {
  if (cookies) {
    cookies.set(COOKIE_NAME, lang, {
      path: "/",
      maxAge: COOKIE_MAX_AGE,
      sameSite: "lax",
    });
    return;
  }

  if (typeof document !== "undefined") {
    document.cookie = `${COOKIE_NAME}=${lang}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=lax`;
  }
};

export const detectLangFromHeader = (header?: string | null): Lang | null => {
  if (!header) return null;
  const primary = header.split(",")[0]?.trim();
  return normalizeLang(primary);
};

export const detectLangFromNavigator = (): Lang => {
  if (typeof navigator !== "undefined" && navigator.language) {
    return normalizeLang(navigator.language) ?? "en";
  }
  return "en";
};

export const resolveLang = ({
  cookies,
  acceptLanguage,
}: {
  cookies?: AstroCookies;
  acceptLanguage?: string | null;
}): Lang => {
  const cookieLang = cookies ? getLangCookie(cookies) : null;
  if (cookieLang) return cookieLang;

  const headerLang = detectLangFromHeader(acceptLanguage);
  const resolved: Lang = headerLang ?? "en";

  if (cookies) setLangCookie(resolved, cookies);

  return resolved;
};
