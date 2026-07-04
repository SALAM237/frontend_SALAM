import { type NextRequest, NextResponse } from 'next/server';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

/**
 * GET /api/track/click/:campaignId/:userId?to=...
 * Relais côté FRONTEND pour le clic sur le bouton CTA des campagnes marketing.
 * Même logique que la route d'ouverture : le lien embarqué dans le mail
 * pointe sur FRONTEND_URL (fiable) au lieu de BACKEND_URL (qui s'est déjà
 * révélé mal configuré 2 fois en production, cassant le lien pour le membre).
 * La redirection vers le membre ne dépend JAMAIS du backend : elle est
 * calculée ici, et l'appel au backend pour journaliser le clic est fait en
 * best-effort sans jamais bloquer ni faire échouer la redirection.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ campaignId: string; userId: string }> }) {
  const { campaignId, userId } = await params;
  const to = req.nextUrl.searchParams.get('to') ?? '/';

  /* Anti-open-redirect : seule une destination dont l'origine correspond à
     CE site est autorisée — jamais une redirection externe arbitraire depuis
     ce endpoint public non authentifié. */
  let safeTarget = req.nextUrl.origin;
  try {
    const target = new URL(to, req.nextUrl.origin);
    if (target.origin === req.nextUrl.origin) safeTarget = target.toString();
  } catch {
    // to invalide — on retombe sur l'origine du site
  }

  fetch(`${API}/api/v1/t/c/${campaignId}/${userId}?to=${encodeURIComponent(safeTarget)}`, {
    headers: { 'user-agent': req.headers.get('user-agent') ?? '' },
    redirect: 'manual',
    signal: AbortSignal.timeout(4000),
  }).catch(() => {});

  return NextResponse.redirect(safeTarget, 302);
}
