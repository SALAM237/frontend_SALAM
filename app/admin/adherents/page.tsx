'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserPlus, Search, Filter, CreditCard, Eye, CheckCircle2, Clock, XCircle, Download } from 'lucide-react';

type Status = 'active' | 'pending' | 'inactive';

const MEMBERS = [
  { id: 'SALAM-2024-0128', firstName: 'Armelle',    lastName: 'Fotso',       role: 'Membre actif', antenne: 'Paris',        status: 'active'   as Status, carte: true,  date: '14 mai 2025' },
  { id: 'SALAM-2024-0127', firstName: 'Pierre',     lastName: 'Nguemo',      role: 'Alumni',       antenne: 'Casablanca',   status: 'active'   as Status, carte: true,  date: '11 mai 2025' },
  { id: 'SALAM-2024-0126', firstName: 'Sophie',     lastName: 'Nkolo',       role: 'Étudiant',     antenne: 'Paris',        status: 'pending'  as Status, carte: false, date: '9 mai 2025'  },
  { id: 'SALAM-2024-0125', firstName: 'Eric',       lastName: 'Balla',       role: 'Membre actif', antenne: 'Lyon',         status: 'active'   as Status, carte: true,  date: '7 mai 2025'  },
  { id: 'SALAM-2024-0124', firstName: 'Marie',      lastName: 'Tchakounte',  role: 'Étudiant',     antenne: 'Rabat',        status: 'pending'  as Status, carte: false, date: '5 mai 2025'  },
  { id: 'SALAM-2024-0123', firstName: 'François',   lastName: 'Atangana',    role: 'Bureau',       antenne: 'Paris',        status: 'active'   as Status, carte: true,  date: '2 mai 2025'  },
  { id: 'SALAM-2024-0122', firstName: 'Christelle', lastName: 'Mbarga',      role: 'Alumni',       antenne: 'Bordeaux',     status: 'inactive' as Status, carte: false, date: '28 avr 2025' },
  { id: 'SALAM-2024-0121', firstName: 'Rodrigue',   lastName: 'Essama',      role: 'Membre actif', antenne: 'Casablanca',   status: 'active'   as Status, carte: true,  date: '25 avr 2025' },
];

const statusConfig: Record<Status, { label: string; cls: string; icon: React.ElementType }> = {
  active:   { label: 'Actif',      cls: 'bg-emerald-50 text-emerald-700 border-emerald-100',   icon: CheckCircle2 },
  pending:  { label: 'En attente', cls: 'bg-yellow-50 text-yellow-700 border-yellow-100',     icon: Clock        },
  inactive: { label: 'Inactif',    cls: 'bg-red-50 text-red-700 border-red-100',               icon: XCircle      },
};

const FILTER_OPTIONS: { label: string; value: Status | 'all' }[] = [
  { label: 'Tous',       value: 'all'      },
  { label: 'Actifs',     value: 'active'   },
  { label: 'En attente', value: 'pending'  },
  { label: 'Inactifs',   value: 'inactive' },
];

export default function AdminAdherentsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Status | 'all'>('all');

  const filtered = MEMBERS.filter(m => {
    const matchSearch = `${m.firstName} ${m.lastName} ${m.id} ${m.role} ${m.antenne}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filter === 'all' || m.status === filter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-5">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Adhérents</h1>
          <p className="mt-0.5 text-sm text-neutral-500">{MEMBERS.length} membres au total</p>
        </div>
        <Link href="/admin/adherents/nouveau" className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-black text-white transition-all hover:bg-emerald-700">
          <UserPlus size={14} /> Nouveau membre
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {/* Search */}
        <div className="relative w-full sm:flex-1 sm:min-w-[200px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher un membre…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-9 w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
          />
        </div>

        {/* Status filters + Download */}
        <div className="flex flex-wrap gap-1.5">
          {FILTER_OPTIONS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`h-9 rounded-xl border px-3 text-xs font-bold transition-all sm:px-4 ${
                filter === value
                  ? 'border-emerald-500 bg-emerald-600 text-white'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-emerald-300 hover:text-emerald-700'
              }`}
            >
              {label}
            </button>
          ))}
          <button className="flex h-9 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-bold text-neutral-600 hover:border-neutral-300 sm:px-4">
            <Download size={13} /> Exporter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm">
        {/* Desktop */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/60">
                <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Membre</th>
                <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">N° ID</th>
                <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Antenne</th>
                <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Statut</th>
                <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Carte</th>
                <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Inscription</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {filtered.map((m) => {
                const s = statusConfig[m.status];
                const SI = s.icon;
                return (
                  <tr key={m.id} className="group transition-colors hover:bg-neutral-50/40">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-[11px] font-black text-white">
                          {m.firstName[0]}{m.lastName[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-900">{m.firstName} {m.lastName}</p>
                          <p className="text-xs text-neutral-400">{m.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5"><span className="font-mono text-xs text-neutral-500">{m.id}</span></td>
                    <td className="px-5 py-3.5 text-xs text-neutral-600">{m.antenne}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black ${s.cls}`}>
                        <SI size={10} /> {s.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {m.carte
                        ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700"><CheckCircle2 size={10} /> Émise</span>
                        : <span className="inline-flex items-center gap-1 rounded-full bg-neutral-50 px-2.5 py-1 text-[10px] font-bold text-neutral-400"><XCircle size={10} /> Non émise</span>
                      }
                    </td>
                    <td className="px-5 py-3.5 text-xs text-neutral-400">{m.date}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <Link href={`/admin/adherents/${m.id}`} className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition-colors hover:border-emerald-300 hover:text-emerald-700">
                          <Eye size={13} />
                        </Link>
                        <Link href={`/admin/adherents/${m.id}`} className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition-colors hover:border-emerald-300 hover:text-emerald-700">
                          <CreditCard size={13} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="divide-y divide-neutral-50 md:hidden">
          {filtered.map((m) => {
            const s = statusConfig[m.status];
            return (
              <Link key={m.id} href={`/admin/adherents/${m.id}`} className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-neutral-50">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-sm font-black text-white">
                  {m.firstName[0]}{m.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-neutral-900">{m.firstName} {m.lastName}</p>
                  <p className="text-xs text-neutral-400">{m.id} · {m.antenne}</p>
                </div>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-black ${s.cls}`}>{s.label}</span>
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm font-semibold text-neutral-400">Aucun membre trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}
