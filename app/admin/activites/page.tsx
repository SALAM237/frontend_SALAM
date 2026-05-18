'use client';

import { useState } from 'react';
import { CalendarDays, Plus } from 'lucide-react';

type Status = 'published' | 'draft' | 'past';

const sCfg: Record<Status, { label: string; cls: string }> = {
  published: { label: 'Publié',    cls: 'bg-emerald-50 text-emerald-700' },
  draft:     { label: 'Brouillon', cls: 'bg-yellow-50 text-yellow-700'  },
  past:      { label: 'Passée',    cls: 'bg-neutral-50 text-neutral-500' },
};

export default function AdminActivitesPage() {
  const [filter, setFilter] = useState<Status | 'all'>('all');

  return (
    <div className="w-full space-y-5">

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black tracking-[-0.03em] text-neutral-900 sm:text-2xl">Activités</h1>
          <p className="mt-0.5 text-sm text-neutral-500">0 activité</p>
        </div>
        <button className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-4 text-sm font-black text-white hover:bg-emerald-700">
          <Plus size={14} />
          <span className="hidden sm:inline">Nouvelle activité</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Publiées',   value: 0, color: 'text-emerald-700' },
          { label: 'Brouillons', value: 0, color: 'text-yellow-700'  },
          { label: 'Passées',    value: 0, color: 'text-neutral-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl border border-neutral-100 bg-white p-3 text-center shadow-sm sm:p-4">
            <p className={`text-2xl font-black leading-none tracking-[-0.04em] sm:text-3xl ${color}`}>{value}</p>
            <p className="mt-1 text-[10px] font-semibold text-neutral-500 sm:text-xs">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'published', 'draft', 'past'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`h-8 rounded-full border px-3 text-xs font-bold transition-all sm:px-4 ${
              filter === f
                ? 'border-emerald-500 bg-emerald-600 text-white'
                : 'border-neutral-200 bg-white text-neutral-600 hover:border-emerald-300'
            }`}
          >
            {f === 'all' ? 'Toutes' : sCfg[f as Status].label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
        <div className="flex flex-col items-center px-5 py-14 text-center">
          <CalendarDays size={32} className="mb-3 text-neutral-200" />
          <p className="text-sm font-semibold text-neutral-400">Aucune activité pour le moment.</p>
          <p className="mt-1 text-xs text-neutral-300">Les activités créées apparaîtront ici.</p>
        </div>
      </div>
    </div>
  );
}
