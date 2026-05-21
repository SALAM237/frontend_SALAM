'use client';
import { usePathname } from 'next/navigation';
import { FloatingNavbar } from './FloatingNavbar';
import { Header } from './Header';

export function ConditionalHeader() {
  const pathname = usePathname();
  if (pathname === '/') return null;

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
  if (pathname === '/missions') return <Header />;
  return <FloatingNavbar />;
}
