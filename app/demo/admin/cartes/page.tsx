'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CreditCard, Search } from 'lucide-react';
import { MemberCard, type MemberCardData } from '@/components/portal/MemberCard';
import { DemoPortalShell } from '../../_components/DemoShell';
import { demoMembers } from '@/data/demo/demo-members';

export default function DemoAdminCardsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'emises' | 'non-emises'>('all');
  const [selected, setSelected] = useState<MemberCardData | null>(null);

  const members: (MemberCardData & { email: string; carteEmise: boolean })[] = demoMembers.map((member, index) => ({
    id: member.memberId,
    firstName: member.firstName,
    lastName: member.lastName,
    role: member.memberStatus === 'active' ? 'Membre actif' : 'En attente',
    antenne: member.city,
    year: new Date().getFullYear(),
    email: member.email,
    carteEmise: index !== 2,
  }));

  const filtered = members.filter(member => {
    const matchSearch = `${member.firstName} ${member.lastName} ${member.id}`.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || (filter === 'emises' && member.carteEmise) || (filter === 'non-emises' && !member.carteEmise);
    return matchSearch && matchFilter;
  });

  return (
    <DemoPortalShell type="admin" title="Cartes membres">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Cartes membres</h1>
            <p className="mt-0.5 text-sm text-neutral-500">Generation et envoi des cartes avec QR code</p>
          </div>
          <Link href="/demo/admin/adherents/nouveau" className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-black text-white hover:bg-emerald-700">
            <CreditCard size={14} /> Nouveau membre
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            { label: 'Cartes emises', value: members.filter(m => m.carteEmise).length, color: 'text-emerald-700', bg: 'bg-emerald-50' },
            { label: 'Non emises', value: members.filter(m => !m.carteEmise).length, color: 'text-yellow-700', bg: 'bg-yellow-50' },
            { label: 'Total adherents', value: members.length, color: 'text-neutral-700', bg: 'bg-neutral-50' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`rounded-2xl border border-neutral-100 ${bg} p-4`}>
              <p className={`text-3xl font-black leading-none tracking-[-0.05em] ${color}`}>{value}</p>
              <p className="mt-1 text-xs font-semibold text-neutral-500">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <div className="relative min-w-[160px] flex-1">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  className="h-9 w-full rounded-xl border border-neutral-200 bg-white pl-8 pr-3 text-sm placeholder:text-neutral-400 focus:border-emerald-400 focus:outline-none"
                />
              </div>
              {(['all', 'emises', 'non-emises'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`h-9 rounded-xl border px-3 text-xs font-bold transition-all ${filter === f ? 'border-emerald-500 bg-emerald-600 text-white' : 'border-neutral-200 bg-white text-neutral-600 hover:border-emerald-300'}`}>
                  {f === 'all' ? 'Tous' : f === 'emises' ? 'Emises' : 'Non emises'}
                </button>
              ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
              {filtered.map(member => (
                <button key={member.id} onClick={() => setSelected(member)} className="flex w-full items-center gap-3 border-b border-neutral-50 px-4 py-3 text-left transition-colors hover:bg-neutral-50">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-sm font-black text-white">
                    {member.firstName[0]}{member.lastName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-neutral-900">{member.firstName} {member.lastName}</p>
                    <p className="text-xs text-neutral-400">{member.id} - {member.email}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black leading-none ${member.carteEmise ? 'bg-emerald-50 text-emerald-700' : 'bg-yellow-50 text-yellow-700'}`}>
                    {member.carteEmise ? 'Emise' : 'A emettre'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
            {selected ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black text-neutral-900">Apercu carte</p>
                  <span className="font-mono text-xs text-neutral-400">{selected.id}</span>
                </div>
                <div className="mx-auto w-full max-w-[400px]">
                  <MemberCard member={selected} />
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 text-center">
                <CreditCard size={40} className="text-neutral-200" />
                <p className="text-sm font-semibold text-neutral-400">Selectionnez un membre<br />pour voir sa carte</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DemoPortalShell>
  );
}
