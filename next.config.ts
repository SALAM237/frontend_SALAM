import type { NextConfig } from 'next';
import path from 'node:path';

const NOINDEX = [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }];

// Politique caméra séparée pour pouvoir l'override sur /admin/scanner
const DENY_CAMERA  = { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' };
const ALLOW_CAMERA = { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=()' };

const BASE_SECURITY_HEADERS = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://*.googletagmanager.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https: https://www.google-analytics.com https://www.googletagmanager.com",
      "font-src 'self' data:",
      "media-src 'self' blob: https:",
      "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://media.salam-cameroun.com https://backendsalam-production.up.railway.app https://backend.salam-cameroun.com",
      "connect-src 'self' https://salam-cameroun.com https://backendsalam-production.up.railway.app https://backend.salam-cameroun.com https://www.google-analytics.com https://region1.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://stats.g.doubleclick.net",
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

  async redirects() {
    return [{
      source: '/admin/coris/validation',
      destination: '/admin/cauris/validation',
      permanent: false,
    }];
  },
  async headers() {
    const SEC      = [...BASE_SECURITY_HEADERS, DENY_CAMERA];
    const SEC_NI   = [...BASE_SECURITY_HEADERS, DENY_CAMERA, ...NOINDEX];
    // Scanner : autoriser la caméra (camera=(self) au lieu de camera=())
    const SCANNER  = [...BASE_SECURITY_HEADERS, ALLOW_CAMERA, ...NOINDEX];

    return [
      {
        source: '/:path*',
        headers: SEC,
      },
      {
        source: '/member/:path*',
        headers: SEC_NI,
      },
      {
        source: '/admin/:path*',
        headers: SEC_NI,
      },
      // Override pour la page scanner — doit venir APRÈS /admin/:path*
      // pour que sa Permissions-Policy écrase la précédente (last-wins Next.js)
      {
        source: '/admin/scanner',
        headers: SCANNER,
      },
      {
        source: '/choisir-espace',
        headers: SEC_NI,
      },
      {
        source: '/auth/:path*',
        headers: SEC_NI,
      },
      {
        source: '/bureau-executif/connexion',
        headers: SEC_NI,
      },
      {
        source: '/demo/admin/:path*',
        headers: SEC_NI,
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
