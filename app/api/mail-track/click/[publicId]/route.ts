import { type NextRequest, NextResponse } from 'next/server';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

function forwardedTrackingHeaders(req: NextRequest): HeadersInit {
  const names = [
    'user-agent',
    'x-forwarded-for',
    'x-real-ip',
    'x-client-ip',
    'cf-connecting-ip',
    'true-client-ip',
    'cf-ipcountry',
    'cf-ipcity',
    'cf-city',
    'cf-region',
    'cf-region-code',
    'cf-latitude',
    'cf-longitude',
    'cf-iplatitude',
    'cf-iplongitude',
  ];
  const headers: Record<string, string> = {};
  for (const name of names) {
    const value = req.headers.get(name);
    if (value) headers[name] = value;
  }
  return headers;
}


function safeTarget(req: NextRequest, raw: string): string {
  const frontend = process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin;
  const backend = API;
  try {
    const target = new URL(raw, req.nextUrl.origin);
    const frontendOrigin = new URL(frontend).origin;
    const backendOrigin = new URL(backend).origin;
    if ((target.protocol === 'http:' || target.protocol === 'https:') && (target.origin === frontendOrigin || target.origin === backendOrigin || target.origin === req.nextUrl.origin)) {
      return target.toString();
    }
  } catch {
    // invalid target
  }
  return req.nextUrl.origin;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  const target = safeTarget(req, req.nextUrl.searchParams.get('to') ?? '/');
  try {
    await fetch(`${API}/api/v1/t/m/c/${encodeURIComponent(publicId)}?to=${encodeURIComponent(target)}`, {
      headers: forwardedTrackingHeaders(req),
      redirect: 'manual',
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    // tracking best-effort; never block recipient navigation
  }
  return NextResponse.redirect(target, 302);
}
