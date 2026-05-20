import { type NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const SEVEN_DAYS = 7 * 24 * 60 * 60;

function cookieOpts(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

/**
 * POST /api/auth/session
 * Reçoit { accessToken }, vérifie auprès du backend, pose salam_access + salam_role
 * en cookies httpOnly (non lisibles par JavaScript → infalsifiables).
 */
export async function POST(req: NextRequest) {
  let accessToken: string | undefined;
  try {
    const body = await req.json();
    accessToken = body?.accessToken;
  } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 });
  }

  if (!accessToken || typeof accessToken !== 'string') {
    return NextResponse.json({ error: 'Token manquant' }, { status: 400 });
  }

  // Vérification du token côté backend avant de poser les cookies
  let meData: { roles?: { slug: string }[] };
  try {
    const meRes = await fetch(`${BACKEND}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!meRes.ok) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }
    const json = await meRes.json();
    meData = json?.data ?? {};
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la vérification' }, { status: 500 });
  }

  const isAdmin = meData.roles?.some(r => ['admin', 'super_admin'].includes(r.slug)) ?? false;
  const role    = isAdmin ? 'admin' : 'member';

  const res = NextResponse.json({ ok: true, role });
  res.cookies.set('salam_access', accessToken, cookieOpts(SEVEN_DAYS));
  res.cookies.set('salam_role',   role,        cookieOpts(SEVEN_DAYS));
  // Supprimer l'ancien cookie JS falsifiable si présent
  res.cookies.delete('salam_auth');
  return res;
}

/**
 * DELETE /api/auth/session
 * Efface tous les cookies de session (appelé au logout).
 */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete('salam_access');
  res.cookies.delete('salam_role');
  res.cookies.delete('salam_auth');
  return res;
}
