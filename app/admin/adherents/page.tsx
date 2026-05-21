'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  UserPlus, CreditCard, Search, Eye, CheckCircle2, Clock, XCircle,
  Download, Loader2, Trash2, Mail, ChevronDown, PencilLine,
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

function fmtDate(d?: string) {
  if (!d) return 'Jamais';
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function csvEscape(v: string | number | undefined | null): string {
  const s = v === undefined || v === null ? '' : String(v);
  if (s.includes('"') || s.includes(',') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export default function AdminAdherentsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<MemberStatus | 'all'>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  const exportToCSV = () => {
    const headers = [
      'N° ID', 'Prénom', 'Nom', 'Email', 'Téléphone', 'Genre',
      'Année promotionnaire', 'Statut', 'Cotisation', 'Dernière connexion', 'Date inscription',
    ];
    const rows = displayed.map(m => [
      csvEscape(m.memberId),
      csvEscape(m.firstName),
      csvEscape(m.lastName),
      csvEscape(m.email),
      csvEscape(m.phone ?? 'Non renseigné'),
      csvEscape(m.gender === 'femme' ? 'Madame' : m.gender === 'homme' ? 'Monsieur' : 'Non renseigné'),
      csvEscape(m.promotionYear),
      csvEscape(statusConfig[m.memberStatus]?.label ?? m.memberStatus),
      csvEscape(cotisationConfig[m.cotisationStatus]?.label ?? m.cotisationStatus),
      csvEscape(fmtDate(m.lastLoginAt)),
      csvEscape(fmt(m.createdAt)),
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `adherents_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
          <button
            onClick={exportToCSV}
            disabled={displayed.length === 0}
            className="flex h-9 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-bold text-neutral-600 transition-all hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
          >
            <Download size={13} /> Exporter ({displayed.length})
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
            <div className="hidden lg:block">
              <table className="w-full table-fixed text-[11px]">
                <colgroup>
                  <col className="w-[19%]" />
                  <col className="w-[9%]" />
                  <col className="w-[18%]" />
                  <col className="w-[10%]" />
                  <col className="w-[7%]" />
                  <col className="w-[7%]" />
                  <col className="w-[8%]" />
                  <col className="w-[9%]" />
                  <col className="w-[13%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50/60">
                    <th className="px-3 py-3 text-left text-[9px] font-black uppercase tracking-[0.1em] text-neutral-400">Membre</th>
                    <th className="px-2 py-3 text-left text-[9px] font-black uppercase tracking-[0.1em] text-neutral-400">N° ID</th>
                    <th className="px-2 py-3 text-left text-[9px] font-black uppercase tracking-[0.1em] text-neutral-400">Email</th>
                    <th className="px-2 py-3 text-left text-[9px] font-black uppercase tracking-[0.1em] text-neutral-400">Tél.</th>
                    <th className="px-2 py-3 text-left text-[9px] font-black uppercase tracking-[0.1em] text-neutral-400">Statut</th>
                    <th className="px-2 py-3 text-left text-[9px] font-black uppercase tracking-[0.1em] text-neutral-400">Cotis.</th>
                    <th className="px-2 py-3 text-left text-[9px] font-black uppercase tracking-[0.1em] text-neutral-400">Conn.</th>
                    <th className="px-2 py-3 text-left text-[9px] font-black uppercase tracking-[0.1em] text-neutral-400">Inscr.</th>
                    <th className="px-3 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {displayed.map((m) => {
                    const s  = statusConfig[m.memberStatus] ?? statusConfig.pending;
                    const SI = s.icon;
                    const c  = cotisationConfig[m.cotisationStatus] ?? cotisationConfig.unpaid;
                    const isConfirming = confirmDeleteId === m._id;
                    return (
                      <tr key={m._id} className="group transition-colors hover:bg-neutral-50/55">
                        <td className="px-3 py-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-[10px] font-black text-white">
                              {formatInitials(m.firstName, m.lastName)}
                            </div>
                            <p className="min-w-0 truncate text-[11px] font-semibold text-neutral-900">{formatFullName(m.firstName, m.lastName)}</p>
                          </div>
                        </td>
                        <td className="truncate px-2 py-3"><span className="font-mono text-[10px] text-neutral-500">{m.memberId}</span></td>
                        <td className="truncate px-2 py-3 text-[10px] text-neutral-500">{m.email}</td>
                        <td className="truncate px-2 py-3 text-[10px] text-neutral-500">{m.phone ?? <span className="text-neutral-300">—</span>}</td>
                        <td className="px-2 py-3">
                          <span className={`inline-flex max-w-full items-center gap-0.5 whitespace-nowrap rounded-full border px-1.5 py-0.5 text-[8px] font-black leading-none ${s.cls}`}>
                            <SI size={8} /> <span className="truncate">{s.label}</span>
                          </span>
                        </td>
                        <td className="px-2 py-3">
                          <span className={`inline-flex max-w-full items-center whitespace-nowrap rounded-full px-1.5 py-0.5 text-[8px] font-black leading-none ${c.cls}`}>
                            {c.label}
                          </span>
                        </td>
                        <td className="truncate px-2 py-3 text-[10px] text-neutral-400">{fmtDate(m.lastLoginAt)}</td>
                        <td className="truncate px-2 py-3 text-[10px] text-neutral-400">{fmt(m.createdAt)}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Resend invitation — pending only */}
                            {m.memberStatus === 'pending' && (
                              <button
                                onClick={e => handleResend(e, m._id)}
                                disabled={resendInvitation.isPending}
                                title="Renvoyer l'invitation"
                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-500 transition-all hover:bg-blue-500 hover:text-white disabled:opacity-40"
                              >
                                {resendInvitation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Mail size={12} />}
                              </button>
                            )}

                            {/* View detail */}
                            <Link
                              href={`/admin/adherents/${m._id}`}
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-50 text-neutral-500 transition-all hover:bg-emerald-600 hover:text-white"
                            >
                              <Eye size={13} />
                            </Link>

                            <Link
                              href={`/admin/adherents/nouveau?edit=${m._id}`}
                              title="Modifier"
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-50 text-neutral-500 transition-all hover:bg-yellow-400 hover:text-neutral-950"
                            >
                              <PencilLine size={13} />
                            </Link>

                            {/* Hard delete — super_admin only */}
                            {isSuperAdmin && (
                              isConfirming ? (
                                <button
                                  onClick={e => handleDeleteClick(e, m._id)}
                                  disabled={hardDelete.isPending}
                                  className="flex h-7 items-center gap-1 rounded-lg bg-red-500 px-2 text-[10px] font-black text-white hover:bg-red-600 disabled:opacity-50"
                                >
                                  {hardDelete.isPending ? <Loader2 size={11} className="animate-spin" /> : 'Confirmer'}
                                </button>
                              ) : (
                                <button
                                  onClick={e => handleDeleteClick(e, m._id)}
                                  title="Supprimer définitivement"
                                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-400 transition-all hover:bg-red-500 hover:text-white"
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
            <div className="divide-y divide-neutral-50 lg:hidden">
              {displayed.map((m) => {
                const s = statusConfig[m.memberStatus] ?? statusConfig.pending;
                const SI = s.icon;
                const c = cotisationConfig[m.cotisationStatus] ?? cotisationConfig.unpaid;
                const isConfirming = confirmDeleteId === m._id;
                const isExpanded = expandedId === m._id;
                return (
                  <div key={m._id} className="px-3 py-3 transition-colors hover:bg-neutral-50/60 sm:px-4">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : m._id)}
                      className="flex w-full items-center gap-3 rounded-2xl text-left transition active:scale-[0.995]"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-xs font-black text-white shadow-sm shadow-emerald-900/10">
                        {formatInitials(m.firstName, m.lastName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-black leading-tight text-neutral-900">{formatFullName(m.firstName, m.lastName)}</p>
                        <p className="mt-0.5 truncate font-mono text-[10px] text-neutral-400">{m.memberId}</p>
                        <p className="truncate text-[10px] text-neutral-400">{m.email}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className={`inline-flex items-center gap-0.5 whitespace-nowrap rounded-full border px-1.5 py-0.5 text-[8px] font-black leading-none ${s.cls}`}>
                          <SI size={8} /> {s.label}
                        </span>
                        <span className={`inline-flex whitespace-nowrap rounded-full px-1.5 py-0.5 text-[8px] font-black leading-none ${c.cls}`}>
                          {c.label}
                        </span>
                      </div>
                      <ChevronDown size={15} className={`shrink-0 text-neutral-300 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-emerald-600' : ''}`} />
                    </button>

                    <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden">
                        <div className="mt-3 rounded-2xl border border-neutral-100 bg-neutral-50/80 p-3">
                          <div className="grid grid-cols-2 gap-2 text-[10px] text-neutral-500">
                            <div>
                              <p className="font-black uppercase tracking-[0.12em] text-neutral-300">Téléphone</p>
                              <p className="mt-0.5 truncate font-semibold text-neutral-700">{m.phone ?? 'Non renseigné'}</p>
                            </div>
                            <div>
                              <p className="font-black uppercase tracking-[0.12em] text-neutral-300">Connexion</p>
                              <p className="mt-0.5 truncate font-semibold text-neutral-700">{fmtDate(m.lastLoginAt)}</p>
                            </div>
                            <div>
                              <p className="font-black uppercase tracking-[0.12em] text-neutral-300">Inscription</p>
                              <p className="mt-0.5 truncate font-semibold text-neutral-700">{fmt(m.createdAt)}</p>
                            </div>
                            <div>
                              <p className="font-black uppercase tracking-[0.12em] text-neutral-300">Actions</p>
                              <div className="mt-1 flex items-center gap-1.5">
                                {m.memberStatus === 'pending' && (
                                  <button
                                    onClick={e => handleResend(e, m._id)}
                                    disabled={resendInvitation.isPending}
                                    title="Renvoyer l'invitation"
                                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-500 transition hover:bg-blue-500 hover:text-white disabled:opacity-40"
                                  >
                                    <Mail size={12} />
                                  </button>
                                )}
                                <Link
                                  href={`/admin/adherents/${m._id}`}
                                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition hover:bg-emerald-600 hover:text-white"
                                >
                                  <Eye size={12} />
                                </Link>
                                <Link
                                  href={`/admin/adherents/nouveau?edit=${m._id}`}
                                  title="Modifier"
                                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-yellow-50 text-yellow-700 transition hover:bg-yellow-400 hover:text-neutral-950"
                                >
                                  <PencilLine size={12} />
                                </Link>
                                {isSuperAdmin && (
                                  isConfirming ? (
                                    <button
                                      onClick={e => handleDeleteClick(e, m._id)}
                                      disabled={hardDelete.isPending}
                                      className="flex h-7 items-center gap-1 rounded-lg bg-red-500 px-2 text-[9px] font-black text-white transition hover:bg-red-600 disabled:opacity-50"
                                    >
                                      {hardDelete.isPending ? <Loader2 size={11} className="animate-spin" /> : 'OK ?'}
                                    </button>
                                  ) : (
                                    <button
                                      onClick={e => handleDeleteClick(e, m._id)}
                                      title="Supprimer définitivement"
                                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-400 transition hover:bg-red-500 hover:text-white"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
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
