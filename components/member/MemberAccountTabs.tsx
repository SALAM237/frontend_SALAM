'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Banknote, CreditCard, FileText, FolderOpen, User } from 'lucide-react';

const accountTabs = [
  { label: 'Mon profil', href: '/member/profil', icon: User },
  { label: 'Ma carte', href: '/member/carte', icon: CreditCard },
  { label: 'Cotisations', href: '/member/cotisations', icon: Banknote },
  { label: 'Mes factures', href: '/member/factures', icon: FileText },
  { label: 'Mes documents', href: '/member/documents', icon: FolderOpen },
];

export function isMemberAccountPath(pathname: string) {
  return accountTabs.some(tab => pathname.startsWith(tab.href));
}

export default function MemberAccountTabs() {
  const pathname = usePathname();

  return (
    <div className="mb-5 overflow-x-auto rounded-2xl border border-neutral-100 bg-white p-1 shadow-sm scroll-smooth">
      <div className="flex min-w-max gap-1">
        {accountTabs.map(({ label, href, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-black transition ${
                active ? 'bg-emerald-600 text-white shadow-sm' : 'text-neutral-500 hover:bg-neutral-50'
              }`}
            >
              <Icon size={14} />
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
