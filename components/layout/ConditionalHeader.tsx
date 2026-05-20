'use client';
import { usePathname } from 'next/navigation';
import { FloatingNavbar } from './FloatingNavbar';

export function ConditionalHeader() {
  const pathname = usePathname();
  if (pathname === '/') return null;

  const hiddenRoutes = [
    '/admin',
    '/member',
    '/auth',
    '/bureau-executif',
    '/api',
  ];

  if (hiddenRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))) return null;
  return <FloatingNavbar />;
}
