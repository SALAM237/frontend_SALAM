'use client';

import { usePathname } from 'next/navigation';
import { Banknote, CreditCard, FileText, FolderOpen, User } from 'lucide-react';
import { AnimatedTabBar } from '@/components/ui/AnimatedTabBar';

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
  const active = accountTabs.find(tab => pathname.startsWith(tab.href))?.href ?? accountTabs[0].href;

  return (
    <AnimatedTabBar
      className="mb-5"
      value={active}
      items={accountTabs.map(tab => ({ value: tab.href, label: tab.label, href: tab.href, icon: tab.icon }))}
    />
  );
}
