'use client';

import { useSearchParams } from 'next/navigation';
import { FileText, Settings, Shield, UserRound } from 'lucide-react';
import { AnimatedTabBar } from '@/components/ui/AnimatedTabBar';

const tabs = [
  { label: 'Profil admin',  value: 'profil',      icon: UserRound },
  { label: 'Securite',      value: 'securite',     icon: Shield    },
  { label: 'Documents',     value: 'documents',    icon: FileText  },
  { label: 'Preferences',   value: 'preferences',  icon: Settings  },
];

export default function AdminAccountTabs() {
  const params = useSearchParams();
  const activeTab = params.get('tab') ?? 'profil';

  return (
    <AnimatedTabBar
      className="mb-5"
      value={activeTab}
      items={tabs.map(tab => ({ value: tab.value, label: tab.label, href: `/admin/parametres?tab=${encodeURIComponent(tab.value)}`, icon: tab.icon }))}
    />
  );
}
