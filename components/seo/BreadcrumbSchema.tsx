'use client';

import { usePathname } from 'next/navigation';
import { SEO_ROUTE_LABELS, SITE_URL } from '@/lib/seo';
import JsonLd from './JsonLd';

const HIDDEN_PREFIXES = ['/admin', '/member', '/auth', '/api', '/demo'];

function labelFor(segment: string) {
  return SEO_ROUTE_LABELS[segment] ?? decodeURIComponent(segment)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

export default function BreadcrumbSchema() {
  const pathname = usePathname();
  if (HIDDEN_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`))) return null;

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  const items = [{
    '@type': 'ListItem',
    position: 1,
    name: 'Accueil',
    item: SITE_URL,
  }];

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    items.push({
      '@type': 'ListItem',
      position: index + 2,
      name: labelFor(segment),
      item: `${SITE_URL}${currentPath}`,
    });
  });

  return (
    <JsonLd
      id="breadcrumb-schema"
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items,
      }}
    />
  );
}
