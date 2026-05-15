import type { NextConfig } from 'next';
import path from 'path';
const nextConfig: NextConfig = {
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
  experimental: { staleTimes: { dynamic: 30, static: 180 } },
  turbopack: { root: path.resolve(__dirname) },
};
export default nextConfig;
