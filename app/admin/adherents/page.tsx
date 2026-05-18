'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { UserPlus, Search, Eye, CheckCircle2, Clock, XCircle, Download, Loader2 } from 'lucide-react';
import { useAdminMembers, type MemberListItem } from '@/lib/api/members';

type MemberStatus = 'active' | 'pending' | 'suspended';

const statusConfig: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  active:    { label: 'Actif',      cls: 'bg-emerald-50 text-emerald-700 border-emerald-100',   icon: CheckCircle2 },
  pending:   { label: 'En attente', cls: 'bg-yellow-50  text-yellow-700  border-yellow-100',    icon: Clock        },
  suspended: { label: 'Suspendu',   cls: 'bg-red-50     text-red-700     border-red-100',        icon: XCircle      },
  rejected:  { label: 'Refusé',     cls: 'bg-neutral-50 text-neutral-500 border-neutral-200',   icon: XCircle      },
};

const cotisationConfig: Record<string, { label: string; cls: string }> = {
  paid:   { label: 'Payée',    cls: 'bg-emerald-50 text-emerald-700' },
  unpaid: { label: 'Impayée',  cls: 'bg-red-50 text-red-600'        },
  exempt: { label: 'Exempté',  cls: 'bg-neutral-50 text-neutral-400' },
};

const FILTER_OPTIONS: { label: string; value: MemberStatus | 'all' }[] = [
  { label: 'Tous',      value: 'all'       },
  { label: 'Actifs',    value: 'active'    },
  { label: 'En attente',value: 'pending'   },
  { label: 'Suspendus', value: 'suspended' },
];

const DEMO_MEMBERS: MemberListItem[] = [
  { _id: 'd1', firstName: 'Armelle',    lastName: 'Fotso',      email: 'a.fotso@example.com',      memberStatus: 'active',    createdAt: '2025-05-14', memberId: 'SALAM-2025-A3F2', cotisationStatus: 'paid'   },
  { _id: 'd2', firstName: 'Pierre',     lastName: 'Nguemo',     email: 'p.nguemo@example.com',     memberStatus: 'active',    createdAt: '2025-05-11', memberId: 'SALAM-2025-B7C1', cotisationStatus: 'paid'   },
  { _id: 'd3', firstName: 'Sophie',     lastName: 'Nkolo',      email: 's.nkolo@example.com',      memberStatus: 'pending',   createdAt: '2025-05-09', memberId: 'SALAM-2025-D4E9', cotisationStatus: 'unpaid' },
  { _id: 'd4', firstName: 'Eric',       lastName: 'Balla',      email: 'e.balla@example.com',      memberStatus: 'active',    createdAt: '2025-05-07', memberId: 'SALAM-2025-F2G8', cotisationStatus: 'paid'   },
  { _id: 'd5', firstName: 'Marie',      lastName: 'Tchakounte', email: 'm.tchakounte@example.com', memberStatus: 'pending',   createdAt: '2025-05-05', memberId: 'SALAM-2025-H6I3', cotisationStatus: 'unpaid' },
  { _id: 'd6', firstName: 'François',   lastName: 'Atangana',   email: 'f.atangana@example.com',   memberStatus: 'active',    createdAt: '2025-05-02', memberId: 'SALAM-2025-J9K4', cotisationStatus: 'paid'   },
  { _id: 'd7', firstName: 'Christelle', lastName: 'Mbarga',     email: 'c.mbarga@example.com',     memberStatus: 'suspended', createdAt: '2025-04-28', memberId: 'SALAM-2025-L1M5', cotisationStatus: 'unpaid' },
  { _id: 'd8', firstName: 'Rodrigue',   lastName: 'Essama',     email: 'r.essama@example.com',     memberStatus: 'active',    createdAt: '2025-04-25', memberId: 'SALAM-2025-N0P6', cotisationStatus: 'exempt' },
];

function fmt(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminAdherentsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<MemberStatus | 'all'>('all');

  const { data, isLoading } = useAdminMembers({ status: filter, search, limit: 100 });

  const members = useMemo<MemberListItem[]>(() => {
    const raw = data?.data?.data ?? [];
    return !isLoading && raw.length === 0 ? DEMO_MEMBERS : raw;
  }, [data, isLoading]);

  const displayed = useMemo(() =>
    members.filter(m => {
      const matchStatus = filter === 'all' || m.memberStatus === filter;
      const matchSearch = `${m.firstName} ${m.lastName} ${m.email} ${m.memberId}`
        .toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    }),
  [members, filter, search]);

  return (
    <div className="mx-auto max-w-6xl space-y-5">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Adhérents</h1>
          <p className="mt-0.5 text-sm text-neutral-500">
            {isLoading ? 'Chargement…' : `${data?.data?.total ?? members.length} membres au total`}
          </p>
        </div>
        <Link href="/admin/adherents/nouveau" className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-black text-white transition-all hover:bg-emerald-700">
          <UserPlus size={14} /> Nouveau membre
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
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

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="animate-spin text-emerald-600" />
          </div>
        )}

        {!isLoading && (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50/60">
                    <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Membre</th>
                    <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">N° ID</th>
                    <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Email</th>
                    <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Statut</th>
                    <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Cotisation</th>
                    <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Inscription</th>
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {displayed.map((m) => {
                    const s = statusConfig[m.memberStatus] ?? statusConfig.pending;
                    const SI = s.icon;
                    const c = cotisationConfig[m.cotisationStatus] ?? cotisationConfig.unpaid;
                    return (
                      <tr key={m._id} className="group transition-colors hover:bg-neutral-50/40">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-[11px] font-black text-white">
                              {m.firstName[0]}{m.lastName[0]}
                            </div>
                            <p className="font-semibold text-neutral-900">{m.firstName} {m.lastName}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5"><span className="font-mono text-xs text-neutral-500">{m.memberId}</span></td>
                        <td className="px-5 py-3.5 text-xs text-neutral-500">{m.email}</td>
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
                        <td className="px-5 py-3.5 text-xs text-neutral-400">{fmt(m.createdAt)}</td>
                        <td className="px-5 py-3.5">
                          <Link
                            href={`/admin/adherents/${m._id}`}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 opacity-0 transition-all group-hover:opacity-100 hover:border-emerald-300 hover:text-emerald-700"
                          >
                            <Eye size={13} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-neutral-50 md:hidden">
              {displayed.map((m) => {
                const s = statusConfig[m.memberStatus] ?? statusConfig.pending;
                return (
                  <Link key={m._id} href={`/admin/adherents/${m._id}`} className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-neutral-50">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-sm font-black text-white">
                      {m.firstName[0]}{m.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-neutral-900">{m.firstName} {m.lastName}</p>
                      <p className="text-xs text-neutral-400">{m.memberId} · {m.email}</p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-black ${s.cls}`}>{s.label}</span>
                  </Link>
                );
              })}
            </div>

            {displayed.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm font-semibold text-neutral-400">Aucun membre trouvé</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
