import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const NOINDEX = 'noindex, nofollow';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdmin = pathname.startsWith('/admin');
  const isMember = pathname.startsWith('/member');
  const isChoisir = pathname === '/choisir-espace';

  if (!isAdmin && !isMember && !isChoisir) return NextResponse.next();

  const hasSession = !!req.cookies.get('salam_access')?.value;
  const role = req.cookies.get('salam_role')?.value;

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

  if (isAdmin && role !== 'admin') {
    const redirect = NextResponse.redirect(new URL('/', req.url));
    redirect.headers.set('X-Robots-Tag', NOINDEX);
    return redirect;
  }

  if (isChoisir) {
    const space = req.cookies.get('salam_space')?.value;
    if (space) {
      const target = space === 'admin' ? '/admin/dashboard' : '/member/dashboard';
      const redirect = NextResponse.redirect(new URL(target, req.url));
      redirect.headers.set('X-Robots-Tag', NOINDEX);
      return redirect;
    }
  }

  const res = NextResponse.next();
  res.headers.set('X-Robots-Tag', NOINDEX);
  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/member/:path*', '/choisir-espace'],
};
