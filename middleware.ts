import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/admin', '/member', '/bureau-executif', '/choisir-espace'];
const PUBLIC_PATHS = ['/bureau-executif/connexion'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Pages publiques dans un espace protégé — toujours autorisées
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const isAuth = req.cookies.get('salam_auth')?.value === '1';
  if (isAuth) return NextResponse.next();

  // Redirection vers la bonne page de connexion selon l'espace
  const loginUrl = req.nextUrl.clone();
  if (pathname.startsWith('/bureau-executif')) {
    loginUrl.pathname = '/bureau-executif/connexion';
  } else {
    loginUrl.pathname = '/auth/login';
    loginUrl.searchParams.set('redirect', pathname);
  }
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/member/:path*',
    '/bureau-executif',
    '/bureau-executif/:path*',
    '/choisir-espace',
  ],
};
