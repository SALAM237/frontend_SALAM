import { type NextRequest, NextResponse } from 'next/server';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

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
      headers: {
        'user-agent': req.headers.get('user-agent') ?? '',
        'x-forwarded-for': req.headers.get('x-forwarded-for') ?? '',
        'x-real-ip': req.headers.get('x-real-ip') ?? '',
        'cf-connecting-ip': req.headers.get('cf-connecting-ip') ?? '',
      },
      redirect: 'manual',
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    // tracking best-effort; never block recipient navigation
  }
  return NextResponse.redirect(target, 302);
}
