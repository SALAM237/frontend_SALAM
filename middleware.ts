import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const NOINDEX = 'noindex, nofollow';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdmin   = pathname.startsWith('/admin');
  const isMember  = pathname.startsWith('/member');
  const isChoisir = pathname === '/choisir-espace';

  if (!isAdmin && !isMember && !isChoisir) return NextResponse.next();

  // salam_access est un cookie httpOnly posé côté serveur → infalsifiable via JS
  const hasSession = !!req.cookies.get('salam_access')?.value;
  const role       = req.cookies.get('salam_role')?.value;

  // Aucune session → redirect vers la page de connexion appropriée
  if (!hasSession) {
    const dest = new URL(
      isAdmin ? '/bureau-executif/connexion' : '/auth/login',
      req.url,
    );
    if (!isAdmin) dest.searchParams.set('redirect', pathname);
    const redirect = NextResponse.redirect(dest);
    redirect.headers.set('X-Robots-Tag', NOINDEX);
    return redirect;
  }

  // Route admin mais rôle ≠ admin → homepage (accès interdit silencieux)
  if (isAdmin && role !== 'admin') {
    const redirect = NextResponse.redirect(new URL('/', req.url));
    redirect.headers.set('X-Robots-Tag', NOINDEX);
    return redirect;
  }

  // Espace déjà sélectionné → court-circuiter /choisir-espace
  if (isChoisir) {
    const space = req.cookies.get('salam_space')?.value;
    if (space) {
      const target = space === 'admin' ? '/admin/dashboard' : '/member/dashboard';
      const redirect = NextResponse.redirect(new URL(target, req.url));
      redirect.headers.set('X-Robots-Tag', NOINDEX);
      return redirect;
    }
  }

  // Authentifié et autorisé — noindex sur toutes les pages privées
  const res = NextResponse.next();
  res.headers.set('X-Robots-Tag', NOINDEX);
  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/member/:path*', '/choisir-espace'],
};
