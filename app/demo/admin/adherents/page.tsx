'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Users, Search, ArrowLeft } from 'lucide-react';

const MEMBERS = [
  { id: '1', name: 'Amina Diallo',     email: 'amina.d@email.com',    status: 'active',  cotis: 'paid',    antenne: 'Paris',     date: '12/03/2024' },
  { id: '2', name: 'Boris Tamko',      email: 'b.tamko@email.com',    status: 'pending', cotis: 'pending', antenne: 'Lyon',      date: '08/05/2024' },
  { id: '3', name: 'Youssef Mansouri', email: 'y.m@email.com',        status: 'active',  cotis: 'paid',    antenne: 'Paris',     date: '02/01/2024' },
  { id: '4', name: 'Sophie Nkolo',     email: 's.nkolo@email.com',    status: 'active',  cotis: 'exempt',  antenne: 'Bordeaux',  date: '28/11/2023' },
  { id: '5', name: 'Pierre Nguemo',    email: 'p.n@email.com',        status: 'pending', cotis: 'unpaid',  antenne: 'Paris',     date: '25/04/2024' },
  { id: '6', name: 'Fatoumata Bah',    email: 'f.bah@email.com',      status: 'active',  cotis: 'paid',    antenne: 'Marseille', date: '14/02/2024' },
  { id: '7', name: 'Karim Ouédraogo',  email: 'k.o@email.com',        status: 'active',  cotis: 'paid',    antenne: 'Lyon',      date: '07/06/2023' },
  { id: '8', name: 'Nadia El Fassi',   email: 'n.el@email.com',       status: 'active',  cotis: 'unpaid',  antenne: 'Paris',     date: '03/03/2024' },
];

const STATUS_STYLE: Record<string, string> = {
  active:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50   text-amber-700   border-amber-200',
};
const STATUS_LABEL: Record<string, string> = { active: 'Actif', pending: 'En attente' };
const COTIS_STYLE: Record<string, string>  = {
  paid:    'bg-emerald-50 text-emerald-700',
  unpaid:  'bg-red-50 text-red-600',
  exempt:  'bg-blue-50 text-blue-700',
  pending: 'bg-neutral-100 text-neutral-500',
};
const COTIS_LABEL: Record<string, string>  = { paid: 'À jour', unpaid: 'Impayé', exempt: 'Exempté', pending: '—' };

export default function DemoAdminAdherents() {
  const [search, setSearch] = useState('');

  const filtered = MEMBERS.filter(m =>
    `${m.name} ${m.email} ${m.antenne}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-40px)] bg-[#f4f6f5]">
      <header className="border-b border-neutral-200/80 bg-white/95 px-5 py-4">
        <div className="mx-auto max-w-5xl flex items-center gap-4">
          <Link href="/demo/admin" className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-700 transition">
            <ArrowLeft size={13} /> Dashboard
          </Link>
          <div className="h-4 w-px bg-neutral-200" />
          <div className="flex items-center gap-2">
            <Users size={16} className="text-emerald-600" />
            <h1 className="text-sm font-black text-neutral-900">
              Adhérents <span className="font-normal text-neutral-400">({filtered.length})</span>
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-4 p-5">
        <div className="relative max-w-xs">
          <Search size={13} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un adhérent…"
            className="h-9 w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-4 text-sm focus:border-emerald-400 focus:outline-none"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50 text-left">
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-neutral-500">Membre</th>
                  <th className="hidden px-4 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-neutral-500 md:table-cell">Antenne</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-neutral-500">Statut</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-neutral-500">Cotisation</th>
                  <th className="hidden px-4 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-neutral-500 sm:table-cell">Inscription</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {filtered.map(m => (
                  <tr key={m.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-black text-emerald-700">
                          {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-900">{m.name}</p>
                          <p className="text-xs text-neutral-400">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-neutral-500 md:table-cell">{m.antenne}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${STATUS_STYLE[m.status]}`}>
                        {STATUS_LABEL[m.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${COTIS_STYLE[m.cotis]}`}>
                        {COTIS_LABEL[m.cotis]}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-neutral-400 sm:table-cell">{m.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-neutral-400">Aucun résultat</div>
          )}
        </div>
      </main>
    </div>
  );
}
