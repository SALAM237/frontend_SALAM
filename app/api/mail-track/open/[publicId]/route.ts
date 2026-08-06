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

const TRANSPARENT_PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);

export async function GET(req: NextRequest, { params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  try {
    const backendRes = await fetch(`${API}/api/v1/t/m/o/${encodeURIComponent(publicId)}`, {
      headers: forwardedTrackingHeaders(req),
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
      headers: { 'Content-Type': 'image/png', 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  }
}
