import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/admin', '/member', '/choisir-espace'];

const NOINDEX = 'noindex, nofollow';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const isAuth = req.cookies.get('salam_auth')?.value === '1';
  if (!isAuth) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/auth/login';
    loginUrl.searchParams.set('redirect', pathname);
    const redirect = NextResponse.redirect(loginUrl);
    redirect.headers.set('X-Robots-Tag', NOINDEX);
    return redirect;
  }

  // If a space is already active, /choisir-espace is no longer reachable
  const activeSpace = req.cookies.get('salam_space')?.value;
  if (pathname === '/choisir-espace' && activeSpace) {
    const target = activeSpace === 'admin' ? '/admin/dashboard' : '/member/dashboard';
    const redirect = NextResponse.redirect(new URL(target, req.url));
    redirect.headers.set('X-Robots-Tag', NOINDEX);
    return redirect;
  }

  // Authenticated — still noindex private pages
  const res = NextResponse.next();
  res.headers.set('X-Robots-Tag', NOINDEX);
  return res;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/member/:path*',
    '/choisir-espace',
  ],
};
