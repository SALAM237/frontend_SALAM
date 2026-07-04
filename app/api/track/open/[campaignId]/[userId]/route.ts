import { type NextRequest, NextResponse } from 'next/server';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

/* 1x1 PNG transparent — utilisé si le backend est injoignable, pour ne
   jamais casser l'affichage du mail côté destinataire. */
const TRANSPARENT_PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);

/**
 * GET /api/track/open/:campaignId/:userId
 * Relais côté FRONTEND pour le pixel de suivi d'ouverture des campagnes
 * marketing. Le pixel embarqué dans le mail pointe sur ce domaine (FRONTEND_URL,
 * fiable et déjà utilisé par tout le site) plutôt que directement sur le
 * backend (BACKEND_URL, qui s'est déjà retrouvé mal configuré en production
 * et cassait le tracking silencieusement). Ce handler relaie l'appel au
 * backend Express via NEXT_PUBLIC_API_URL — la même variable dont dépend
 * déjà tout le reste du site.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ campaignId: string; userId: string }> }) {
  const { campaignId, userId } = await params;

  try {
    const backendRes = await fetch(`${API}/api/v1/t/o/${campaignId}/${userId}`, {
      headers: { 'user-agent': req.headers.get('user-agent') ?? '' },
      cache: 'no-store',
      signal: AbortSignal.timeout(4000),
    });
    const buffer = Buffer.from(await backendRes.arrayBuffer());
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': backendRes.headers.get('content-type') ?? 'image/png',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch {
    return new NextResponse(TRANSPARENT_PIXEL, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  }
}
