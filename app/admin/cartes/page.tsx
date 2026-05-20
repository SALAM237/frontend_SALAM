'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Search, Loader2, Users } from 'lucide-react';
import { MemberCard, type MemberCardData } from '@/components/portal/MemberCard';
import { useAdminMembers, type MemberListItem } from '@/lib/api/members';
import { formatFullName, formatInitials } from '@/lib/format-name';

function toCardData(m: MemberListItem): MemberCardData {
  return {
    id:        m.memberId,
    firstName: m.firstName,
    lastName:  m.lastName,
    role:      'Membre actif',
    year:      new Date().getFullYear(),
    photo:     m.avatar,
  };
}

export default function CartesPage() {
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState<'all' | 'active' | 'pending'>('all');
  const [selected, setSelected] = useState<MemberListItem | null>(null);

  const { data, isLoading } = useAdminMembers({ limit: 200 });
  const members = useMemo<MemberListItem[]>(() => data?.data?.data ?? [], [data]);

  const filtered = useMemo(() =>
    members.filter(m => {
      const matchSearch = `${m.firstName} ${m.lastName} ${m.memberId} ${m.email}`
        .toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === 'all' || m.memberStatus === filter;
      return matchSearch && matchFilter;
    }),
  [members, search, filter]);

  const total   = members.length;
  const actifs  = members.filter(m => m.memberStatus === 'active').length;
  const pending = members.filter(m => m.memberStatus === 'pending').length;

  return (
    <div className="mx-auto max-w-6xl space-y-5">

      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin/adherents"
          className="group flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 shadow-sm transition-all hover:border-emerald-300 hover:text-emerald-700"
        >
          <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Cartes membres</h1>
          <p className="mt-0.5 text-sm text-neutral-500">
            {isLoading ? 'Chargement…' : `${total} membre${total !== 1 ? 's' : ''} au total`}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total adhérents', value: total,   color: 'text-neutral-700',  bg: 'bg-white',        border: 'border-neutral-100' },
          { label: 'Actifs',          value: actifs,  color: 'text-emerald-700',  bg: 'bg-emerald-50',   border: 'border-emerald-100' },
          { label: 'En attente',      value: pending, color: 'text-yellow-700',   bg: 'bg-yellow-50',    border: 'border-yellow-100'  },
        ].map(({ label, value, color, bg, border }) => (
          <div key={label} className={`rounded-2xl border ${border} ${bg} p-4 shadow-sm`}>
            {isLoading
              ? <div className="h-8 w-10 animate-pulse rounded-lg bg-neutral-200" />
              : <p className={`text-3xl font-black leading-none tracking-[-0.05em] ${color}`}>{value}</p>
            }
            <p className="mt-1.5 text-xs font-semibold text-neutral-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_420px]">

        {/* List */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <div className="relative min-w-[160px] flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Rechercher un membre…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-9 w-full rounded-xl border border-neutral-200 bg-white pl-8 pr-3 text-sm placeholder:text-neutral-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
              />
            </div>
            {([
              { value: 'all',     label: 'Tous'        },
              { value: 'active',  label: 'Actifs'      },
              { value: 'pending', label: 'En attente'  },
            ] as const).map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`h-9 rounded-xl border px-3 text-xs font-bold transition-all ${filter === f.value ? 'border-emerald-500 bg-emerald-600 text-white' : 'border-neutral-200 bg-white text-neutral-600 hover:border-emerald-300 hover:text-emerald-700'}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={20} className="animate-spin text-emerald-600" />
              </div>
            )}

            {!isLoading && filtered.length === 0 && (
              <div className="flex flex-col items-center px-5 py-14 text-center">
                <Users size={32} className="mb-3 text-neutral-200" />
                <p className="text-sm font-semibold text-neutral-400">
                  {search || filter !== 'all' ? 'Aucun membre correspondant.' : 'Aucun membre enregistré.'}
                </p>
              </div>
            )}

            {!isLoading && filtered.length > 0 && (
              <ul className="divide-y divide-neutral-50">
                {filtered.map(m => {
                  const isSelected = selected?._id === m._id;
                  const isActive   = m.memberStatus === 'active';
                  return (
                    <li key={m._id}>
                      <button
                        onClick={() => setSelected(isSelected ? null : m)}
                        className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors ${isSelected ? 'bg-emerald-50/60' : 'hover:bg-neutral-50/60'}`}
                      >
                        {/* Avatar */}
                        {m.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.avatar} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-[11px] font-black text-white">
                            {formatInitials(m.firstName, m.lastName)}
                          </div>
                        )}

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-sm text-neutral-900">{formatFullName(m.firstName, m.lastName)}</p>
                          <p className="font-mono text-[11px] text-neutral-400">{m.memberId}</p>
                        </div>

                        {/* Status */}
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-yellow-50 text-yellow-700'}`}>
                          {isActive ? 'Actif' : 'En attente'}
                        </span>

                        {/* CreditCard icon */}
                        <CreditCard size={14} className={`shrink-0 ${isSelected ? 'text-emerald-600' : 'text-neutral-300'}`} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Preview panel */}
        <div className="sticky top-20 h-fit rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
          {selected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black text-neutral-900">Aperçu carte</p>
                <span className="font-mono text-xs text-neutral-400">{selected.memberId}</span>
              </div>
              <div className="mx-auto w-full max-w-[380px]">
                <MemberCard member={toCardData(selected)} />
              </div>
              <div className="flex gap-2 pt-2">
                <button className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600 hover:border-neutral-300">
                  <CreditCard size={13} /> Télécharger
                </button>
                <button className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-xs font-black text-white hover:bg-emerald-700">
                  Envoyer par email
                </button>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-center">
              <CreditCard size={40} className="text-neutral-200" />
              <div>
                <p className="text-sm font-semibold text-neutral-400">Sélectionnez un membre</p>
                <p className="mt-0.5 text-xs text-neutral-300">pour prévisualiser sa carte</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
