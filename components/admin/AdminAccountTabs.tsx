'use client';

import { Settings, Shield, UserRound } from 'lucide-react';

const tabs = [
  { label: 'Profil admin', icon: UserRound },
  { label: 'Securite', icon: Shield },
  { label: 'Preferences', icon: Settings },
];

export default function AdminAccountTabs() {
  return (
    <div className="mb-5 overflow-x-auto rounded-2xl border border-neutral-100 bg-white p-1 shadow-sm">
      <div className="flex min-w-max gap-1">
        {tabs.map(({ label, icon: Icon }, index) => (
          <button
            key={label}
            className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-black transition ${
              index === 0 ? 'bg-emerald-600 text-white shadow-sm' : 'text-neutral-500 hover:bg-neutral-50'
            }`}
            type="button"
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
