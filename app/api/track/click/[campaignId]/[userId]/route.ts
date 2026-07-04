import { type NextRequest, NextResponse } from 'next/server';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

/**
 * GET /api/track/click/:campaignId/:userId?to=...
 * Relais côté FRONTEND pour le clic sur le bouton CTA des campagnes marketing.
 * Même logique que la route d'ouverture : le lien embarqué dans le mail
 * pointe sur FRONTEND_URL (fiable) au lieu de BACKEND_URL (qui s'est déjà
 * révélé mal configuré 2 fois en production, cassant le lien pour le membre).
 * La redirection vers le membre ne dépend JAMAIS du backend : le calcul de
 * la destination est fait localement, et un échec/timeout du backend ne
 * bloque jamais la redirection. L'appel de journalisation est cependant
 * ATTENDU (pas fire-and-forget) : sur un hébergement serverless, la fonction
 * peut être coupée dès la réponse envoyée, ce qui tuait silencieusement un
 * fetch non attendu avant qu'il n'atteigne le backend — c'est ce qui faisait
 * que le clic n'était jamais journalisé malgré un clic réel.
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

  try {
    await fetch(`${API}/api/v1/t/c/${campaignId}/${userId}?to=${encodeURIComponent(safeTarget)}`, {
      headers: { 'user-agent': req.headers.get('user-agent') ?? '' },
      redirect: 'manual',
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    // Journalisation best-effort — un backend lent/indisponible ne doit jamais empêcher la redirection.
  }

  return NextResponse.redirect(safeTarget, 302);
}
