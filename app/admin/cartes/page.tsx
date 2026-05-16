'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CreditCard, Search, CheckCircle2, XCircle, Send, Download } from 'lucide-react';
import { MemberCard, type MemberCardData } from '@/components/portal/MemberCard';

const MEMBERS_WITH_CARDS: (MemberCardData & { email: string; carteEmise: boolean })[] = [
  { id: 'SALAM-2024-0128', firstName: 'Armelle',  lastName: 'Fotso',  role: 'Membre actif', antenne: 'Paris',      year: 2024, email: 'armelle@email.com', carteEmise: true  },
  { id: 'SALAM-2024-0127', firstName: 'Pierre',   lastName: 'Nguemo', role: 'Alumni',       antenne: 'Casablanca', year: 2024, email: 'pierre@email.com',  carteEmise: true  },
  { id: 'SALAM-2024-0126', firstName: 'Sophie',   lastName: 'Nkolo',  role: 'Étudiant',     antenne: 'Paris',      year: 2025, email: 'sophie@email.com',  carteEmise: false },
  { id: 'SALAM-2024-0125', firstName: 'Eric',     lastName: 'Balla',  role: 'Membre actif', antenne: 'Lyon',       year: 2024, email: 'eric@email.com',    carteEmise: true  },
  { id: 'SALAM-2024-0124', firstName: 'Marie',    lastName: 'Tchakounte', role: 'Étudiant', antenne: 'Rabat',      year: 2025, email: 'marie@email.com',   carteEmise: false },
];

export default function CartesPage() {
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState<MemberCardData | null>(null);
  const [filter, setFilter]     = useState<'all' | 'emises' | 'non-emises'>('all');
  const [sent, setSent]         = useState<Record<string, boolean>>({});

  const filtered = MEMBERS_WITH_CARDS.filter(m => {
    const matchSearch = `${m.firstName} ${m.lastName} ${m.id}`.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || (filter === 'emises' && m.carteEmise) || (filter === 'non-emises' && !m.carteEmise);
    return matchSearch && matchFilter;
  });

  const handleSend = (id: string) => setSent(prev => ({ ...prev, [id]: true }));

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
          { label: 'Cartes émises',     value: MEMBERS_WITH_CARDS.filter(m => m.carteEmise).length,  color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Non émises',        value: MEMBERS_WITH_CARDS.filter(m => !m.carteEmise).length, color: 'text-yellow-700',  bg: 'bg-yellow-50'  },
          { label: 'Total adhérents',   value: MEMBERS_WITH_CARDS.length,                             color: 'text-neutral-700', bg: 'bg-neutral-50' },
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
          {/* Filters */}
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

          {/* Cards list */}
          <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm">
            <div className="divide-y divide-neutral-50">
              {filtered.map(m => (
                <div
                  key={m.id}
                  onClick={() => setSelected(selected?.id === m.id ? null : m)}
                  className={`flex cursor-pointer items-center gap-3 px-5 py-4 transition-all hover:bg-neutral-50 ${selected?.id === m.id ? 'bg-emerald-50/50 border-l-4 border-l-emerald-500' : ''}`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-sm font-black text-white">
                    {m.firstName[0]}{m.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-900">{m.firstName} {m.lastName}</p>
                    <p className="text-xs font-mono text-neutral-400">{m.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {m.carteEmise
                      ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700"><CheckCircle2 size={9} /> Émise</span>
                      : <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-[10px] font-black text-yellow-700"><XCircle size={9} /> Non émise</span>
                    }
                  </div>
                </div>
              ))}
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
              <div className="flex justify-center overflow-x-auto">
                <MemberCard member={selected} />
              </div>
              <p className="text-center text-[10px] text-neutral-400">
                Scan → association-salam.org/verify/{selected.id}
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleSend(selected.id)}
                  disabled={sent[selected.id]}
                  className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-black transition-all ${sent[selected.id] ? 'bg-neutral-100 text-neutral-400 cursor-default' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                >
                  {sent[selected.id] ? <><CheckCircle2 size={14} /> Envoyée !</> : <><Send size={14} /> Envoyer par email</>}
                </button>
                <button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-600 hover:border-neutral-300">
                  <Download size={14} /> Télécharger en PNG
                </button>
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
