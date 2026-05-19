import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/admin', '/member', '/choisir-espace'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const isAuth  = req.cookies.get('salam_auth')?.value === '1';
  if (!isAuth) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/auth/login';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If a space is already active, /choisir-espace is no longer reachable
  const activeSpace = req.cookies.get('salam_space')?.value;
  if (pathname === '/choisir-espace' && activeSpace) {
    const target = activeSpace === 'admin' ? '/admin/dashboard' : '/member/dashboard';
    return NextResponse.redirect(new URL(target, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/member/:path*',
    '/choisir-espace',
  ],
};
