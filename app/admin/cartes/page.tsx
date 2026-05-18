'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CreditCard, Search } from 'lucide-react';
import { MemberCard, type MemberCardData } from '@/components/portal/MemberCard';

export default function CartesPage() {
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState<MemberCardData | null>(null);
  const [filter, setFilter]     = useState<'all' | 'emises' | 'non-emises'>('all');

  const members: (MemberCardData & { email: string; carteEmise: boolean })[] = [];

  const filtered = members.filter(m => {
    const matchSearch = `${m.firstName} ${m.lastName} ${m.id}`.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || (filter === 'emises' && m.carteEmise) || (filter === 'non-emises' && !m.carteEmise);
    return matchSearch && matchFilter;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-5">

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Cartes membres</h1>
          <p className="mt-0.5 text-sm text-neutral-500">Génération et envoi des cartes avec QR code</p>
        </div>
        <Link href="/admin/adherents/nouveau" className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-black text-white hover:bg-emerald-700">
          <CreditCard size={14} /> Nouveau membre
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: 'Cartes émises',   value: 0, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Non émises',      value: 0, color: 'text-yellow-700',  bg: 'bg-yellow-50'  },
          { label: 'Total adhérents', value: 0, color: 'text-neutral-700', bg: 'bg-neutral-50' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-2xl border border-neutral-100 ${bg} p-4`}>
            <p className={`text-3xl font-black leading-none tracking-[-0.05em] ${color}`}>{value}</p>
            <p className="mt-1 text-xs font-semibold text-neutral-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_420px]">

        {/* List */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[160px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Rechercher…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-9 w-full rounded-xl border border-neutral-200 bg-white pl-8 pr-3 text-sm placeholder:text-neutral-400 focus:border-emerald-400 focus:outline-none"
              />
            </div>
            {(['all', 'emises', 'non-emises'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`h-9 rounded-xl border px-3 text-xs font-bold transition-all ${filter === f ? 'border-emerald-500 bg-emerald-600 text-white' : 'border-neutral-200 bg-white text-neutral-600 hover:border-emerald-300'}`}>
                {f === 'all' ? 'Tous' : f === 'emises' ? 'Émises' : 'Non émises'}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm">
            <div className="flex flex-col items-center px-5 py-14 text-center">
              <CreditCard size={32} className="mb-3 text-neutral-200" />
              <p className="text-sm font-semibold text-neutral-400">Aucun membre enregistré.</p>
              <p className="mt-1 text-xs text-neutral-300">Les cartes membres apparaîtront ici.</p>
            </div>
          </div>
        </div>

        {/* Preview panel */}
        <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
          {selected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black text-neutral-900">Aperçu carte</p>
                <span className="text-xs font-mono text-neutral-400">{selected.id}</span>
              </div>
              <div className="mx-auto w-full max-w-[400px]">
                <MemberCard member={selected} />
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 text-center">
              <CreditCard size={40} className="text-neutral-200" />
              <p className="text-sm font-semibold text-neutral-400">Sélectionnez un membre<br />pour voir sa carte</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
