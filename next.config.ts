import type { NextConfig } from 'next';
import path from 'path';

const NOINDEX = [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }];

const nextConfig: NextConfig = {
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
  experimental: { staleTimes: { dynamic: 30, static: 180 } },
  turbopack: { root: path.resolve(__dirname) },
  async headers() {
    return [
      { source: '/member/:path*',               headers: NOINDEX },
      { source: '/admin/:path*',                headers: NOINDEX },
      { source: '/choisir-espace',              headers: NOINDEX },
      { source: '/auth/:path*',                 headers: NOINDEX },
      { source: '/bureau-executif/connexion',   headers: NOINDEX },
      { source: '/demo/admin/:path*',           headers: NOINDEX },
    ];
  },
};
export default nextConfig;
