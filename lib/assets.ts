const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/+$/, '');

export function assetUrl(url?: string | null) {
  if (!url) return '';
  const clean = url.trim();
  if (!clean) return '';

  if (clean.startsWith('/uploads/')) return `${API_ORIGIN}${clean}`;

  try {
    const parsed = new URL(clean);
    if (parsed.pathname.startsWith('/uploads/')) {
      return `${API_ORIGIN}${parsed.pathname}`;
    }
  } catch {
    return clean;
  }

  return clean;
}
