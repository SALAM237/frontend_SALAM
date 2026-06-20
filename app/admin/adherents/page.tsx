'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  UserPlus, CreditCard, Search, Eye, CheckCircle2, Clock, XCircle,
  Download, Loader2, Trash2, Mail, ChevronDown, PencilLine,
  ShieldCheck,
} from 'lucide-react';
import {
  useAdminMembers,
  useHardDeleteMember,
  useMemberCardChangeRequests,
  useResendInvitation,
  useReviewMemberCardChangeRequest,
  type MemberCardChangeRequest,
  type MemberListItem,
} from '@/lib/api/members';
import { useAuthStore } from '@/store/auth.store';
import { formatFullName, formatInitials } from '@/lib/format-name';
import { memberAvatarBorderClass, memberInitialsClass, memberPhotoUrl } from '@/lib/avatar';

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

const profileConfig = {
  complete: { label: 'Complet', cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  incomplete: { label: 'Incomplet', cls: 'bg-red-50 text-red-700 border-red-100' },
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
  const [photoPreview, setPhotoPreview] = useState<{ src: string; name: string } | null>(null);
  const [showCardRequests, setShowCardRequests] = useState(false);

  const user        = useAuthStore(s => s.user);
  const isSuperAdmin = user?.effectivePermissions?.includes('*') ?? false;

  const { data, isLoading }  = useAdminMembers({ status: filter, search, limit: 100 });
  const { data: cardRequestsData } = useMemberCardChangeRequests('pending');
  const hardDelete           = useHardDeleteMember();
  const resendInvitation     = useResendInvitation();
  const pendingCardRequests = cardRequestsData?.data?.pending ?? 0;

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
    <>
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
          <button
            type="button"
            onClick={() => setShowCardRequests(true)}
            className="relative inline-flex h-9 items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 text-sm font-semibold text-emerald-700 transition-all hover:border-emerald-400 hover:bg-emerald-50"
          >
            <ShieldCheck size={14} /> Modifications carte
            <span className="absolute -right-1.5 -top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-black text-white ring-2 ring-white">
              {pendingCardRequests}
            </span>
          </button>
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
                  <col className="w-[17%]" />
                  <col className="w-[8%]" />
                  <col className="w-[16%]" />
                  <col className="w-[9%]" />
                  <col className="w-[7%]" />
                  <col className="w-[7%]" />
                  <col className="w-[8%]" />
                  <col className="w-[8%]" />
                  <col className="w-[9%]" />
                  <col className="w-[11%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50/60">
                    <th className="px-3 py-3 text-left text-[9px] font-black uppercase tracking-[0.1em] text-neutral-400">Membre</th>
                    <th className="px-2 py-3 text-left text-[9px] font-black uppercase tracking-[0.1em] text-neutral-400">N° ID</th>
                    <th className="px-2 py-3 text-left text-[9px] font-black uppercase tracking-[0.1em] text-neutral-400">Email</th>
                    <th className="px-2 py-3 text-left text-[9px] font-black uppercase tracking-[0.1em] text-neutral-400">Tél.</th>
                    <th className="px-2 py-3 text-left text-[9px] font-black uppercase tracking-[0.1em] text-neutral-400">Statut</th>
                    <th className="px-2 py-3 text-left text-[9px] font-black uppercase tracking-[0.1em] text-neutral-400">Cotis.</th>
                    <th className="px-2 py-3 text-left text-[9px] font-black uppercase tracking-[0.1em] text-neutral-400">Profil</th>
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
                    const photoUrl = memberPhotoUrl(m);
                    return (
                      <tr key={m._id} className="group transition-colors hover:bg-neutral-50/55">
                        <td className="px-3 py-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <button
                              type="button"
                              onClick={() => photoUrl && setPhotoPreview({ src: photoUrl, name: formatFullName(m.firstName, m.lastName) })}
                              className="shrink-0"
                              title={photoUrl ? 'Voir la photo' : 'Photo non disponible'}
                            >
                              {photoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={photoUrl} alt={formatFullName(m.firstName, m.lastName)} className={`h-7 w-7 rounded-full border-2 object-cover ${memberAvatarBorderClass(m.gender)}`} />
                              ) : (
                                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black text-white ${memberInitialsClass(m.gender)}`}>
                                  {formatInitials(m.firstName, m.lastName)}
                                </div>
                              )}
                            </button>
                            <Link href={`/admin/adherents/${m._id}`} className="min-w-0 truncate text-[11px] font-semibold text-neutral-900 transition hover:text-emerald-700">{formatFullName(m.firstName, m.lastName)}</Link>
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
                        <td className="px-2 py-3">
                          <span className={`inline-flex max-w-full items-center whitespace-nowrap rounded-full border px-1.5 py-0.5 text-[8px] font-black leading-none ${m.profileComplete ? profileConfig.complete.cls : profileConfig.incomplete.cls}`}>
                            {m.profileComplete ? profileConfig.complete.label : profileConfig.incomplete.label}
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
                              href={`/admin/adherents/nouveau?edit=${encodeURIComponent(m._id)}`}
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
                const photoUrl = memberPhotoUrl(m);
                return (
                  <div key={m._id} className="px-3 py-3 transition-colors hover:bg-neutral-50/60 sm:px-4">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : m._id)}
                      className="flex w-full items-center gap-3 rounded-2xl text-left transition active:scale-[0.995]"
                    >
                      {photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photoUrl} alt={formatFullName(m.firstName, m.lastName)} className={`h-10 w-10 shrink-0 rounded-2xl border-2 object-cover shadow-sm ${memberAvatarBorderClass(m.gender)}`} />
                      ) : (
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-black text-white shadow-sm ${memberInitialsClass(m.gender)}`}>
                          {formatInitials(m.firstName, m.lastName)}
                        </div>
                      )}
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
                        <span className={`inline-flex whitespace-nowrap rounded-full border px-1.5 py-0.5 text-[8px] font-black leading-none ${m.profileComplete ? profileConfig.complete.cls : profileConfig.incomplete.cls}`}>
                          {m.profileComplete ? 'Profil complet' : 'Profil incomplet'}
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
                                  href={`/admin/adherents/nouveau?edit=${encodeURIComponent(m._id)}`}
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
                                      {hardDelete.isPending ? <Loader2 size={11} className="animate-spin" /> : 'OK ??'}
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
      {photoPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm" onClick={() => setPhotoPreview(null)}>
          <div className="relative max-w-lg overflow-hidden rounded-3xl bg-white p-3 shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPhotoPreview(null)} className="absolute right-4 top-4 z-10 rounded-full bg-black/45 p-2 text-white hover:bg-black/70">
              <XCircle size={18} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoPreview.src} alt={photoPreview.name} className="max-h-[75vh] w-full rounded-2xl object-contain" />
            <p className="px-2 py-3 text-center text-sm font-black text-neutral-800">{photoPreview.name}</p>
          </div>
        </div>
      )}
      {showCardRequests && <CardChangeRequestsModal onClose={() => setShowCardRequests(false)} />}
    </>
  );
}

function CardChangeRequestsModal({ onClose }: { onClose: () => void }) {
  const { data, isLoading } = useMemberCardChangeRequests('pending');
  const review = useReviewMemberCardChangeRequest();
  const requests = data?.data?.data ?? [];

  const submit = (request: MemberCardChangeRequest, action: 'approve' | 'reject') => {
    review.mutate({ id: request._id, action });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">Validation admin</p>
            <h2 className="text-lg font-black text-neutral-900">Modifications de carte membre</h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100">
            <XCircle size={16} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5">
          {isLoading && (
            <div className="flex justify-center py-12">
              <Loader2 size={22} className="animate-spin text-emerald-600" />
            </div>
          )}
          {!isLoading && requests.length === 0 && (
            <div className="py-12 text-center">
              <ShieldCheck size={32} className="mx-auto mb-3 text-neutral-200" />
              <p className="text-sm font-semibold text-neutral-400">Aucune modification en attente.</p>
            </div>
          )}
          {!isLoading && requests.length > 0 && (
            <div className="space-y-3">
              {requests.map(request => {
                const member = request.userId;
                return (
                  <div key={request._id} className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-neutral-900">{formatFullName(member.firstName, member.lastName)}</p>
                        <p className="font-mono text-[11px] text-neutral-400">{member.memberNumber ?? '-'}</p>
                        <p className="mt-0.5 text-xs text-neutral-500">{member.email}</p>
                      </div>
                      <p className="text-[11px] font-semibold text-neutral-400">
                        {new Date(request.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <ChangeBox label="Civilité" before={request.currentGender === 'femme' ? 'Madame' : 'Monsieur'} after={request.requestedGender === 'femme' ? 'Madame' : 'Monsieur'} />
                      <ChangeBox label="Promotionnaire" before={String(request.currentPromotionYear ?? '-')} after={String(request.requestedPromotionYear ?? '-')} />
                    </div>

                    <div className="mt-4 flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => submit(request, 'reject')}
                        disabled={review.isPending}
                        className="inline-flex h-9 items-center justify-center rounded-xl border border-red-200 px-4 text-xs font-black text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                      >
                        Refuser
                      </button>
                      <button
                        type="button"
                        onClick={() => submit(request, 'approve')}
                        disabled={review.isPending}
                        className="inline-flex h-9 items-center justify-center rounded-xl bg-emerald-600 px-4 text-xs font-black text-white transition hover:bg-emerald-700 disabled:opacity-60"
                      >
                        Valider et mettre à jour la carte
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChangeBox({ label, before, after }: { label: string; before: string; after: string }) {
  const changed = before !== after;
  return (
    <div className={`rounded-xl border p-3 ${changed ? 'border-amber-100 bg-amber-50/60' : 'border-neutral-100 bg-neutral-50'}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">{label}</p>
      <div className="mt-2 flex items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-neutral-500">{before}</span>
        <ChevronDown size={13} className="-rotate-90 text-neutral-300" />
        <span className="font-black text-neutral-900">{after}</span>
      </div>
    </div>
  );
}
