'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { UserPlus, Search, Eye, CheckCircle2, Clock, XCircle, Download } from 'lucide-react';
import { DemoPortalShell } from '../../_components/DemoShell';
import { demoMembers } from '@/data/demo/demo-members';
import { formatFullName, formatInitials } from '@/lib/format-name';

type MemberStatus = 'active' | 'pending' | 'suspended';

const statusConfig: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  active: { label: 'Actif', cls: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: CheckCircle2 },
  pending: { label: 'En attente', cls: 'bg-yellow-50  text-yellow-700  border-yellow-100', icon: Clock },
  suspended: { label: 'Suspendu', cls: 'bg-red-50     text-red-700     border-red-100', icon: XCircle },
  rejected: { label: 'Refuse', cls: 'bg-neutral-50 text-neutral-500 border-neutral-200', icon: XCircle },
};

const cotisationConfig: Record<string, { label: string; cls: string }> = {
  paid: { label: 'Payee', cls: 'bg-emerald-50 text-emerald-700' },
  unpaid: { label: 'Impayee', cls: 'bg-red-50 text-red-600' },
  exempt: { label: 'Exempte', cls: 'bg-neutral-50 text-neutral-400' },
};

const FILTER_OPTIONS: { label: string; value: MemberStatus | 'all' }[] = [
  { label: 'Tous', value: 'all' },
  { label: 'Actifs', value: 'active' },
  { label: 'En attente', value: 'pending' },
  { label: 'Suspendus', value: 'suspended' },
];

function fmt(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function DemoAdminMembersPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<MemberStatus | 'all'>('all');

  const displayed = useMemo(() =>
    demoMembers.filter(member => {
      const matchStatus = filter === 'all' || member.memberStatus === filter;
      const matchSearch = `${member.firstName} ${member.lastName} ${member.email} ${member.memberId}`
        .toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    }),
  [filter, search]);

  return (
    <DemoPortalShell type="admin" title="Adherents">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Adherents</h1>
            <p className="mt-0.5 text-sm text-neutral-500">{demoMembers.length} membres au total</p>
          </div>
          <Link href="/demo/admin/adherents/nouveau" className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-black text-white transition-all hover:bg-emerald-700">
            <UserPlus size={14} /> Nouveau membre
          </Link>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative w-full sm:min-w-[200px] sm:flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Rechercher un membre..."
              value={search}
              onChange={event => setSearch(event.target.value)}
              className="h-9 w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
            />
          </div>

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

        <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/60">
                  <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Membre</th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">No ID</th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Email</th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Statut</th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Cotisation</th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Inscription</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {displayed.map((member) => {
                  const s = statusConfig[member.memberStatus] ?? statusConfig.pending;
                  const SI = s.icon;
                  const c = cotisationConfig[member.cotisationStatus] ?? cotisationConfig.unpaid;
                  return (
                    <tr key={member._id} className="group transition-colors hover:bg-neutral-50/40">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-[11px] font-black text-white">
                            {formatInitials(member.firstName, member.lastName)}
                          </div>
                          <p className="font-semibold text-neutral-900">{formatFullName(member.firstName, member.lastName)}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><span className="font-mono text-xs text-neutral-500">{member.memberId}</span></td>
                      <td className="px-5 py-3.5 text-xs text-neutral-500">{member.email}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black ${s.cls}`}>
                          <SI size={10} /> {s.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black ${c.cls}`}>
                          {c.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-neutral-400">{fmt(member.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        <Link href={`/demo/admin/adherents/${member._id}`} className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 opacity-0 transition-all group-hover:opacity-100 hover:border-emerald-300 hover:text-emerald-700">
                          <Eye size={13} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-neutral-50 md:hidden">
            {displayed.map((member) => {
              const s = statusConfig[member.memberStatus] ?? statusConfig.pending;
              return (
                <Link key={member._id} href={`/demo/admin/adherents/${member._id}`} className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-neutral-50">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-sm font-black text-white">
                    {formatInitials(member.firstName, member.lastName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-neutral-900">{formatFullName(member.firstName, member.lastName)}</p>
                    <p className="text-xs text-neutral-400">{member.memberId} - {member.email}</p>
                  </div>
                  <span className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[10px] font-black leading-none ${s.cls}`}>{s.label}</span>
                </Link>
              );
            })}
          </div>

          {displayed.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm font-semibold text-neutral-400">Aucun membre trouve</p>
            </div>
          )}
        </div>
      </div>
    </DemoPortalShell>
  );
}
