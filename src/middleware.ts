import { defineMiddleware } from 'astro:middleware';

type Lang = 'en' | 'de';
const DEV = process.env.NODE_ENV !== 'production';

function log(...args: any[]) {
  if (DEV) console.log('[mw]', ...args);
}

function redirect(to: string, status: 302 = 302) {
  const headers = new Headers({ Location: to });
  return new Response(null, { status, headers });
}

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const { pathname, searchParams, search } = url;

  // Ignore static assets
if (
  pathname.startsWith('/_astro') ||
  pathname.startsWith('/docs') ||
  pathname.startsWith('/fonts') ||
  pathname.startsWith('/icons') ||
  pathname.startsWith('/images') ||
  pathname.startsWith('/favicons') ||
  pathname === '/AM-Logo.ico' ||
  pathname === '/manifest.webmanifest' ||
  pathname === '/robots.txt' ||
  pathname === '/sitemap.xml'
) {
  return next();
}

  const cookie = context.cookies.get('lang')?.value as Lang | undefined;
  const setlang = searchParams.get('setlang') as Lang | null;
  log('path=', pathname, 'cookie=', cookie, 'setlang=', setlang);

  // 1) Explicit user switch via query: set cookie and normalize path
  if (setlang === 'de' || setlang === 'en') {
    context.cookies.set('lang', setlang, { path: '/', maxAge: 60 * 60 * 24 * 365 });

    let newPath = pathname;
    if (setlang === 'de') {
      if (!newPath.startsWith('/de')) newPath = newPath === '/' ? '/de' : `/de${newPath}`;
    } else {
      if (newPath === '/de') newPath = '/';
      else if (newPath.startsWith('/de/')) newPath = newPath.replace(/^\/de/, '') || '/';
    }

    searchParams.delete('setlang');
    const qs = searchParams.toString();
    const target = url.origin + newPath + (qs ? `?${qs}` : '');
    log('switch → redirect', target);
    return redirect(target, 302);
  }

  // 2) Explicit DE route: enforce cookie; for first-time visitors, respect Accept-Language
  if (pathname === '/de' || pathname.startsWith('/de/')) {
    // If user already prefers EN, enforce it
    if (cookie === 'en') {
      const stripped = pathname === '/de' ? '/' : pathname.replace(/^\/de/, '') || '/';
      const target = url.origin + stripped + (search || '');
      log('cookie=en → enforce EN, redirect', target);
      return redirect(target, 302);
    }

    // No cookie: decide by Accept-Language
    if (!cookie) {
      const accept = context.request.headers.get('accept-language')?.toLowerCase() || '';
      if (accept.startsWith('de')) {
        context.cookies.set('lang', 'de', { path: '/', maxAge: 60 * 60 * 24 * 365 });
        log('no cookie + accept=de → set de, continue');
        return next();
      } else {
        // Non-German browser: default to EN and redirect out of /de
        context.cookies.set('lang', 'en', { path: '/', maxAge: 60 * 60 * 24 * 365 });
        const stripped = pathname === '/de' ? '/' : pathname.replace(/^\/de/, '') || '/';
        const target = url.origin + stripped + (search || '');
        log('no cookie + accept!=de → set en, redirect', target);
        return redirect(target, 302);
      }
    }

    // cookie is de → continue
    return next();
  }

  // 3) Root route '/': honor cookie; otherwise infer once
  if (pathname === '/') {
    if (cookie === 'de') {
      const target = url.origin + '/de' + (search || '');
      log('cookie=de → redirect', target);
      return redirect(target, 302);
    }
    if (cookie === 'en') {
      log('cookie=en → continue');
      return next();
    }

    const accept = context.request.headers.get('accept-language')?.toLowerCase() || '';
    const inferred: Lang = accept.startsWith('de') ? 'de' : 'en';
    context.cookies.set('lang', inferred, { path: '/', maxAge: 60 * 60 * 24 * 365 });
    if (inferred === 'de') {
      const target = url.origin + '/de' + (search || '');
      log('infer de → redirect', target);
      return redirect(target, 302);
    }
    log('infer en → continue');
    return next();
  }

  // 4) Other routes: continue
  return next();
});