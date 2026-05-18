import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/admin', '/member'];
const LOGIN_URL = '/auth/login';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const isAuth = req.cookies.get('salam_auth')?.value === '1';
  if (isAuth) return NextResponse.next();

  // TODO: réactiver quand l'auth est opérationnelle en production
  // const loginUrl = req.nextUrl.clone();
  // loginUrl.pathname = LOGIN_URL;
  // loginUrl.searchParams.set('redirect', pathname);
  // return NextResponse.redirect(loginUrl);
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/member/:path*'],
};
