'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  UserPlus, CreditCard, Search, Eye, CheckCircle2, Clock, XCircle,
  Download, Loader2, Trash2, Mail,
} from 'lucide-react';
import { useAdminMembers, useHardDeleteMember, useResendInvitation, type MemberListItem } from '@/lib/api/members';
import { useAuthStore } from '@/store/auth.store';
import { formatFullName, formatInitials } from '@/lib/format-name';

type MemberStatus = 'active' | 'pending' | 'suspended';

const statusConfig: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  active:    { label: 'Actif',      cls: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: CheckCircle2 },
  pending:   { label: 'En attente', cls: 'bg-yellow-50  text-yellow-700  border-yellow-100',  icon: Clock        },
  suspended: { label: 'Suspendu',   cls: 'bg-red-50     text-red-700     border-red-100',      icon: XCircle      },
  rejected:  { label: 'Refusé',     cls: 'bg-neutral-50 text-neutral-500 border-neutral-200', icon: XCircle      },
};

const cotisationConfig: Record<string, { label: string; cls: string }> = {
  paid:   { label: 'Payée',   cls: 'bg-emerald-50 text-emerald-700' },
  unpaid: { label: 'Impayée', cls: 'bg-red-50 text-red-600'        },
  exempt: { label: 'Exempté', cls: 'bg-neutral-50 text-neutral-400' },
};

const FILTER_OPTIONS: { label: string; value: MemberStatus | 'all' }[] = [
  { label: 'Tous',       value: 'all'       },
  { label: 'Actifs',     value: 'active'    },
  { label: 'En attente', value: 'pending'   },
  { label: 'Suspendus',  value: 'suspended' },
];

function fmt(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminAdherentsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<MemberStatus | 'all'>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const user        = useAuthStore(s => s.user);
  const isSuperAdmin = user?.effectivePermissions?.includes('*') ?? false;

  const { data, isLoading }  = useAdminMembers({ status: filter, search, limit: 100 });
  const hardDelete           = useHardDeleteMember();
  const resendInvitation     = useResendInvitation();

  const members = useMemo<MemberListItem[]>(() => data?.data?.data ?? [], [data]);

  const displayed = useMemo(() =>
    members.filter(m => {
      const matchStatus = filter === 'all' || m.memberStatus === filter;
      const matchSearch = `${m.firstName} ${m.lastName} ${m.email} ${m.memberId}`
        .toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    }),
  [members, filter, search]);

  const handleDelete = (id: string) => {
    if (confirmDeleteId !== id) { setConfirmDeleteId(id); return; }
    hardDelete.mutate(id, { onSettled: () => setConfirmDeleteId(null) });
  };

  const handleResend = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    resendInvitation.mutate(id);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    handleDelete(id);
  };

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
        <div className="flex items-center gap-2">
          <Link href="/admin/cartes" className="inline-flex h-9 items-center gap-2 rounded-full border border-yellow-300 bg-yellow-200 px-4 text-sm font-semibold text-yellow-800 transition-all hover:bg-yellow-300">
            <CreditCard size={14} /> Cartes membres
          </Link>
          <Link href="/admin/adherents/nouveau" className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-black text-white transition-all hover:bg-emerald-700">
            <UserPlus size={14} /> Nouveau membre
          </Link>
        </div>
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
            {/* ── Desktop ───────────────────────────────────── */}
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
                    const s  = statusConfig[m.memberStatus] ?? statusConfig.pending;
                    const SI = s.icon;
                    const c  = cotisationConfig[m.cotisationStatus] ?? cotisationConfig.unpaid;
                    const isConfirming = confirmDeleteId === m._id;
                    return (
                      <tr key={m._id} className="group transition-colors hover:bg-neutral-50/40">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-[11px] font-black text-white">
                              {formatInitials(m.firstName, m.lastName)}
                            </div>
                            <p className="font-semibold text-neutral-900">{formatFullName(m.firstName, m.lastName)}</p>
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
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Resend invitation — pending only */}
                            {m.memberStatus === 'pending' && (
                              <button
                                onClick={e => handleResend(e, m._id)}
                                disabled={resendInvitation.isPending}
                                title="Renvoyer l'invitation"
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-blue-200 text-blue-500 transition-all hover:border-blue-500 hover:bg-blue-500 hover:text-white disabled:opacity-40"
                              >
                                {resendInvitation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Mail size={12} />}
                              </button>
                            )}

                            {/* View detail */}
                            <Link
                              href={`/admin/adherents/${m._id}`}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 transition-all hover:border-emerald-600 hover:bg-emerald-600 hover:text-white"
                            >
                              <Eye size={13} />
                            </Link>

                            {/* Hard delete — super_admin only */}
                            {isSuperAdmin && (
                              isConfirming ? (
                                <button
                                  onClick={e => handleDeleteClick(e, m._id)}
                                  disabled={hardDelete.isPending}
                                  className="flex h-7 items-center gap-1 rounded-lg border border-red-500 bg-red-500 px-2 text-[10px] font-black text-white hover:bg-red-600 disabled:opacity-50"
                                >
                                  {hardDelete.isPending ? <Loader2 size={11} className="animate-spin" /> : 'Confirmer'}
                                </button>
                              ) : (
                                <button
                                  onClick={e => handleDeleteClick(e, m._id)}
                                  title="Supprimer définitivement"
                                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 text-red-400 transition-all hover:border-red-500 hover:bg-red-500 hover:text-white"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Mobile cards ──────────────────────────────── */}
            <div className="divide-y divide-neutral-50 md:hidden">
              {displayed.map((m) => {
                const s = statusConfig[m.memberStatus] ?? statusConfig.pending;
                const isConfirming = confirmDeleteId === m._id;
                return (
                  <div key={m._id} className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-neutral-50">
                    {/* Avatar + info — clickable */}
                    <Link href={`/admin/adherents/${m._id}`} className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-sm font-black text-white">
                        {formatInitials(m.firstName, m.lastName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-neutral-900">{formatFullName(m.firstName, m.lastName)}</p>
                        <p className="truncate text-xs text-neutral-400">{m.memberId} · {m.email}</p>
                      </div>
                    </Link>

                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-black ${s.cls}`}>{s.label}</span>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-1.5">
                      {m.memberStatus === 'pending' && (
                        <button
                          onClick={e => handleResend(e, m._id)}
                          disabled={resendInvitation.isPending}
                          title="Renvoyer l'invitation"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 text-blue-500 hover:bg-blue-50 disabled:opacity-40"
                        >
                          <Mail size={14} />
                        </button>
                      )}

                      {isSuperAdmin && (
                        isConfirming ? (
                          <button
                            onClick={e => handleDeleteClick(e, m._id)}
                            disabled={hardDelete.isPending}
                            className="flex h-8 items-center gap-1 rounded-lg border border-red-400 bg-red-500 px-2 text-[10px] font-black text-white"
                          >
                            {hardDelete.isPending ? <Loader2 size={12} className="animate-spin" /> : 'OK ?'}
                          </button>
                        ) : (
                          <button
                            onClick={e => handleDeleteClick(e, m._id)}
                            title="Supprimer définitivement"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-400 hover:border-red-300 hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                          </button>
                        )
                      )}
                    </div>
                  </div>
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
