import type { NextConfig } from 'next';
import path from 'path';

const NOINDEX = [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }];

const SECURITY_HEADERS = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https: https://www.google-analytics.com",
      "font-src 'self' data:",
      "connect-src 'self' https://salam-cameroun.com https://backendsalam-production.up.railway.app https://backend.salam-cameroun.com https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false, // ne pas exposer "X-Powered-By: Next.js"

  compress: true, // gzip/brotli compression (actif par défaut, explicite ici)

  images: {
    formats: ['image/avif', 'image/webp'], // AVIF en priorité (meilleure compression)
    remotePatterns: [
      // Backend local (dev)
      { protocol: 'http', hostname: 'localhost' },
      // Backend Railway (prod + dev)
      { protocol: 'https', hostname: 'backendsalam-production.up.railway.app' },
      { protocol: 'https', hostname: 'backend.salam-cameroun.com' },
      { protocol: 'https', hostname: 'media.salam-cameroun.com' },
      // QR code generator (carte membre)
      { protocol: 'https', hostname: 'api.qrserver.com' },
      // Avatars ou assets CDN futurs
      { protocol: 'https', hostname: '*.cloudinary.com' },
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
    ],
    // Tailles de device pour srcSet optimal mobile Afrique
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes:  [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 31536000,
  },

  experimental: {
    staleTimes: { dynamic: 30, static: 180 },
    optimizePackageImports: ['lucide-react'], // framer-motion exclus — effets de bord incompatibles
  },

  turbopack: { root: path.resolve(__dirname) },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: SECURITY_HEADERS,
      },
      {
        source: '/member/:path*',
        headers: [...SECURITY_HEADERS, ...NOINDEX],
      },
      {
        source: '/admin/:path*',
        headers: [...SECURITY_HEADERS, ...NOINDEX],
      },
      {
        source: '/choisir-espace',
        headers: [...SECURITY_HEADERS, ...NOINDEX],
      },
      {
        source: '/auth/:path*',
        headers: [...SECURITY_HEADERS, ...NOINDEX],
      },
      {
        source: '/bureau-executif/connexion',
        headers: [...SECURITY_HEADERS, ...NOINDEX],
      },
      {
        source: '/demo/admin/:path*',
        headers: [...SECURITY_HEADERS, ...NOINDEX],
      },
      // Cache long sur les assets publics versionnes.
      {
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/videos/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

export default nextConfig;
