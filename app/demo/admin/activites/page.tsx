'use client';

import Link from 'next/link';
import { Calendar, ArrowLeft, MapPin } from 'lucide-react';

const EVENTS = [
  { title: 'Atelier CV & Orientation professionnelle', date: '22/05/2024', location: 'Paris 15e',  type: 'Formation',     registered: 12, capacity: 20,  status: 'open' },
  { title: 'Soirée networking diaspora',               date: '01/06/2024', location: 'Paris 9e',   type: 'Networking',    registered: 27, capacity: 30,  status: 'open' },
  { title: 'Tournoi de football SALAM',                date: '15/06/2024', location: 'Boulogne',   type: 'Sport',         registered: 38, capacity: 40,  status: 'open' },
  { title: 'Forum des opportunités 2024',              date: '29/06/2024', location: 'La Défense', type: 'Forum',         registered: 85, capacity: 100, status: 'open' },
  { title: 'Assemblée générale annuelle',              date: '12/04/2024', location: 'Paris 12e',  type: 'Institutionnel',registered: 52, capacity: 60,  status: 'past' },
  { title: 'Afterwork solidarité',                     date: '02/03/2024', location: 'Paris 18e',  type: 'Solidarité',    registered: 18, capacity: 25,  status: 'past' },
];

const TYPE_COLOR: Record<string, string> = {
  Formation:     'bg-blue-50 text-blue-700',
  Networking:    'bg-purple-50 text-purple-700',
  Sport:         'bg-emerald-50 text-emerald-700',
  Forum:         'bg-amber-50 text-amber-700',
  Institutionnel:'bg-neutral-100 text-neutral-600',
  Solidarité:    'bg-red-50 text-red-600',
};

export default function DemoAdminActivites() {
  return (
    <div className="min-h-[calc(100vh-40px)] bg-[#f4f6f5]">
      <header className="border-b border-neutral-200/80 bg-white/95 px-5 py-4">
        <div className="mx-auto max-w-5xl flex items-center gap-4">
          <Link href="/demo/admin" className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-700 transition">
            <ArrowLeft size={13} /> Dashboard
          </Link>
          <div className="h-4 w-px bg-neutral-200" />
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-emerald-600" />
            <h1 className="text-sm font-black text-neutral-900">
              Activités <span className="font-normal text-neutral-400">({EVENTS.length})</span>
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-5">
        <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50 text-left">
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-neutral-500">Activité</th>
                  <th className="hidden px-4 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-neutral-500 md:table-cell">Lieu</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-neutral-500">Inscriptions</th>
                  <th className="hidden px-4 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-neutral-500 sm:table-cell">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {EVENTS.map(e => (
                  <tr key={e.title} className={`transition-colors hover:bg-neutral-50 ${e.status === 'past' ? 'opacity-55' : ''}`}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-neutral-900">{e.title}</p>
                      <p className="text-xs text-neutral-400">{e.date}</p>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                        <MapPin size={11} className="shrink-0" /> {e.location}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-neutral-100">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${(e.registered / e.capacity) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-neutral-500">
                          <span className="font-semibold text-neutral-700">{e.registered}</span>/{e.capacity}
                        </span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${TYPE_COLOR[e.type]}`}>{e.type}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
