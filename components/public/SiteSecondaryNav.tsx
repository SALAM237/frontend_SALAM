'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { label: 'Missions',       href: '/missions' },
  { label: 'À propos',       href: '/a-propos' },
  { label: 'Actualités',     href: '/actualites' },
  { label: 'Activités',      href: '/activites' },
  { label: 'Bureau',         href: '/bureau-executif' },
  { label: 'Commissions',    href: '/commissions' },
  { label: 'Antennes',       href: '/antennes' },
  { label: 'Galerie',        href: '/galerie' },
  { label: 'Opportunités',   href: '/opportunites' },
  { label: 'Don',            href: '/don' },
  { label: 'Adhésion',       href: '/adhesion' },
  { label: 'Contact',        href: '/contact' },
];

export function SiteSecondaryNav() {
  const pathname = usePathname();

  return (
    <div className="sticky top-16 z-30 border-b border-neutral-200 bg-white/95 shadow-sm backdrop-blur-sm">
      <div
        className="mx-auto max-w-5xl overflow-x-auto px-4 md:px-8 lg:px-0"
        style={{ scrollbarWidth: 'none' }}
      >
        <div className="flex min-w-max gap-1 py-2">
          {NAV.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center rounded-full px-4 py-2 text-xs font-black transition-all duration-200 ${
                  active
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
