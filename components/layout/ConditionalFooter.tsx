'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './Footer';

export function ConditionalFooter() {
  const pathname = usePathname();
  const hiddenRoutes = [
    '/admin',
    '/auth',
    '/bureau-executif/connexion',
    '/demo/admin',
    '/demo/member',
    '/member',
    '/api',
  ];

  if (hiddenRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))) return null;
  return <Footer />;
}
