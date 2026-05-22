'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Settings, Shield, UserRound } from 'lucide-react';

const tabs = [
  { label: 'Profil admin', value: 'profil', icon: UserRound },
  { label: 'Securite', value: 'securite', icon: Shield },
  { label: 'Preferences', value: 'preferences', icon: Settings },
];

export default function AdminAccountTabs() {
  const params = useSearchParams();
  const activeTab = params.get('tab') ?? 'profil';

  return (
    <div className="mb-5 overflow-x-auto rounded-2xl border border-neutral-100 bg-white p-1 shadow-sm">
      <div className="flex min-w-max gap-1">
        {tabs.map(({ label, value, icon: Icon }) => (
          <Link
            key={label}
            href={`/admin/parametres?tab=${value}`}
            className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-black transition ${
              activeTab === value ? 'bg-emerald-600 text-white shadow-sm' : 'text-neutral-500 hover:bg-neutral-50'
            }`}
          >
            <Icon size={14} />
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
