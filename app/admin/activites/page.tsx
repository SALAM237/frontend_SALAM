'use client';

import { useState } from 'react';
import { CalendarDays, Plus, Eye, Trash2, Users, MapPin, Clock } from 'lucide-react';

type Status = 'published' | 'draft' | 'past';

const ACTIVITES = [
  { id: 1, title: 'Soirée Networking SALAM Paris 2025', date: '22 mai 2025',  heure: '19h – 22h', lieu: 'Paris',      inscrits: 34, max: 80,  status: 'published' as Status },
  { id: 2, title: 'Atelier Leadership Jeunesse',         date: '7 juin 2025',  heure: '18h – 20h', lieu: 'En ligne',   inscrits: 18, max: 50,  status: 'published' as Status },
  { id: 3, title: 'Assemblée Générale Annuelle 2025',    date: '28 juin 2025', heure: '10h – 17h', lieu: 'Paris',      inscrits: 56, max: 200, status: 'draft'     as Status },
  { id: 4, title: 'Cérémonie remise diplômes',           date: '15 mars 2025', heure: '15h – 18h', lieu: 'Paris',      inscrits: 90, max: 100, status: 'past'      as Status },
  { id: 5, title: 'Hackathon Innovation Cameroun',       date: '1 mars 2025',  heure: '09h – 20h', lieu: 'Casablanca', inscrits: 45, max: 60,  status: 'past'      as Status },
];

const sCfg: Record<Status, { label: string; cls: string }> = {
  published: { label: 'Publié',    cls: 'bg-emerald-50 text-emerald-700' },
  draft:     { label: 'Brouillon', cls: 'bg-yellow-50 text-yellow-700'  },
  past:      { label: 'Passée',   cls: 'bg-neutral-50 text-neutral-500' },
};

export default function AdminActivitesPage() {
  const [filter, setFilter] = useState<Status | 'all'>('all');
  const filtered = ACTIVITES.filter(a => filter === 'all' || a.status === filter);

  return (
    <div className="mx-auto max-w-5xl space-y-5">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black tracking-[-0.03em] text-neutral-900 sm:text-2xl">Activités</h1>
          <p className="mt-0.5 text-sm text-neutral-500">{ACTIVITES.length} activités au total</p>
        </div>
        <button className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-4 text-sm font-black text-white hover:bg-emerald-700">
          <Plus size={14} /> <span className="hidden sm:inline">Nouvelle activité</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Publiées',   value: ACTIVITES.filter(a => a.status === 'published').length, color: 'text-emerald-700' },
          { label: 'Brouillons', value: ACTIVITES.filter(a => a.status === 'draft').length,     color: 'text-yellow-700'  },
          { label: 'Passées',    value: ACTIVITES.filter(a => a.status === 'past').length,      color: 'text-neutral-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm text-center sm:p-4">
            <p className={`text-2xl font-black leading-none tracking-[-0.04em] sm:text-3xl ${color}`}>{value}</p>
            <p className="mt-1 text-[10px] font-semibold text-neutral-500 sm:text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
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

      {/* Table — desktop only (lg+, sidebar visible) */}
      <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm">
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/60">
                {['Activité', 'Date', 'Lieu', 'Inscrits', 'Statut', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {filtered.map(a => {
                const s = sCfg[a.status];
                const pct = Math.round((a.inscrits / a.max) * 100);
                return (
                  <tr key={a.id} className="group transition-colors hover:bg-neutral-50/40">
                    <td className="px-4 py-3.5 max-w-[240px]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                          <CalendarDays size={14} className="text-emerald-600" />
                        </div>
                        <p className="truncate font-semibold text-neutral-900">{a.title}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="text-sm text-neutral-700">{a.date}</p>
                      <p className="flex items-center gap-1 text-xs text-neutral-400"><Clock size={10} /> {a.heure}</p>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="flex items-center gap-1 text-xs text-neutral-600"><MapPin size={11} />{a.lieu}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="flex items-center gap-1 text-xs font-semibold text-neutral-700"><Users size={11} />{a.inscrits}/{a.max}</span>
                      <div className="mt-1 h-1 w-16 rounded-full bg-neutral-100">
                        <div className="h-1 rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${s.cls}`}>{s.label}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:border-emerald-300 hover:text-emerald-700"><Eye size={13} /></button>
                        <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:border-red-300 hover:text-red-600"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Cards — mobile + tablet (< lg) */}
        <div className="divide-y divide-neutral-50 lg:hidden">
          {filtered.map(a => {
            const s = sCfg[a.status];
            const pct = Math.round((a.inscrits / a.max) * 100);
            return (
              <div key={a.id} className="flex items-start gap-3 px-4 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                  <CalendarDays size={16} className="text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-semibold text-neutral-900 text-sm">{a.title}</p>
                  <p className="mt-0.5 text-xs text-neutral-400">
                    <span className="inline-flex items-center gap-1"><Clock size={9} /> {a.date} · {a.heure}</span>
                  </p>
                  <p className="text-xs text-neutral-400">
                    <span className="inline-flex items-center gap-1"><MapPin size={9} /> {a.lieu}</span>
                    <span className="mx-1">·</span>
                    <span className="inline-flex items-center gap-1"><Users size={9} /> {a.inscrits}/{a.max}</span>
                  </p>
                  <div className="mt-1.5 h-1 w-20 rounded-full bg-neutral-100">
                    <div className="h-1 rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${s.cls}`}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
