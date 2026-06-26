'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  UserPlus, CreditCard, Search, Eye, CheckCircle2, Clock, XCircle,
  Download, Loader2, Trash2, Mail, ChevronDown, PencilLine,
  Plus, Minus, SlidersHorizontal, X, Bell, Banknote,
  MessageSquare, Send,
} from 'lucide-react';
import {
  useAdminMembers,
  useHardDeleteMember,
  useResendInvitation,
  useRemindIncompleteProfiles,
  type MemberListItem,
} from '@/lib/api/members';
import { useAdminCotisations, useUpdateCotisationStatus, useSendReminders, useSendUnpaidInvoiceRelance, type AdminCotisationRow } from '@/lib/api/cotisations';
import { useActivities, useRemindActivityInvitations, type ActivityDoc } from '@/lib/api/activities';
import { useAdjustMemberCauris } from '@/lib/api/cauris';
import { useAuthStore } from '@/store/auth.store';
import { formatFullName, formatInitials } from '@/lib/format-name';
import { memberAvatarBorderClass, memberInitialsClass, memberPhotoUrl } from '@/lib/avatar';
import { ControlledAvatarDialog } from '@/components/portal/AvatarLightbox';
import { CauriImg } from '@/components/member/CauriWallet';

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

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

type ActiveFilters = {
  statut:     string[];
  cotisation: string[];
  profil:     string[];
  mois:       number[];
};

const EMPTY_FILTERS: ActiveFilters = { statut: [], cotisation: [], profil: [], mois: [] };

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
  const [filters, setFilters] = useState<ActiveFilters>(EMPTY_FILTERS);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<{ src: string; name: string } | null>(null);
  const [showCaurisManager, setShowCaurisManager] = useState(false);
  const [showFraisAdhesion, setShowFraisAdhesion] = useState(false);
  const [showRelance, setShowRelance] = useState(false);
  const [relanceSelected, setRelanceSelected] = useState<Set<string>>(new Set());

  const user        = useAuthStore(s => s.user);
  const isSuperAdmin = user?.effectivePermissions?.includes('*') ?? false;

  const { data, isLoading }  = useAdminMembers({ search, limit: 200 });

  /* ferme le panneau filtre en cliquant à l'extérieur */
  useEffect(() => {
    if (!showFilterPanel) return;
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilterPanel(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showFilterPanel]);
  const hardDelete           = useHardDeleteMember();
  const resendInvitation     = useResendInvitation();

  const members = useMemo<MemberListItem[]>(() => data?.data?.data ?? [], [data]);

  const activeFilterCount = filters.statut.length + filters.cotisation.length + filters.profil.length + filters.mois.length;

  const displayed = useMemo(() =>
    members.filter(m => {
      const matchSearch = `${m.firstName} ${m.lastName} ${m.email} ${m.memberId}`
        .toLowerCase().includes(search.toLowerCase());
      const matchStatut     = filters.statut.length     === 0 || filters.statut.includes(m.memberStatus);
      const matchCotisation = filters.cotisation.length === 0 || filters.cotisation.includes(m.cotisationStatus);
      const matchProfil     = filters.profil.length     === 0 ||
        (filters.profil.includes('complete') && m.profileComplete) ||
        (filters.profil.includes('incomplete') && !m.profileComplete);
      const memberMonth     = new Date(m.createdAt).getMonth();
      const matchMois       = filters.mois.length === 0 || filters.mois.includes(memberMonth);
      return matchSearch && matchStatut && matchCotisation && matchProfil && matchMois;
    }),
  [members, search, filters]);

  const toggleFilter = <K extends keyof ActiveFilters>(key: K, value: ActiveFilters[K][number]) => {
    setFilters(prev => {
      const arr = prev[key] as (typeof value)[];
      const next = arr.includes(value as never)
        ? arr.filter(v => v !== value)
        : [...arr, value];
      return { ...prev, [key]: next };
    });
  };

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
        <div className="flex flex-wrap items-center gap-2">
          {/* Relance */}
          <button
            type="button"
            onClick={() => setShowRelance(true)}
            className="relative inline-flex h-9 items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 text-sm font-semibold text-orange-700 transition-all hover:bg-orange-100 sm:px-4"
          >
            <Bell size={14} />
            <span className="hidden sm:inline">Relance</span>
            {relanceSelected.size > 0 && (
              <span className="absolute -right-1.5 -top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-orange-600 px-1.5 text-[10px] font-black text-white ring-2 ring-white">
                {relanceSelected.size}
              </span>
            )}
          </button>
          {/* Frais d'adhésion */}
          <button
            type="button"
            onClick={() => setShowFraisAdhesion(true)}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 text-sm font-semibold text-blue-700 transition-all hover:bg-blue-100 sm:px-4"
          >
            <Banknote size={14} />
            <span className="hidden sm:inline">Frais d&apos;adhésion</span>
          </button>
          {/* Gestion cauris */}
          <button
            type="button"
            onClick={() => setShowCaurisManager(true)}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 text-sm font-semibold text-amber-800 transition-all hover:bg-amber-100 sm:px-4"
          >
            <CauriImg size={16} />
            <span className="hidden sm:inline">Gestion cauris</span>
          </button>
          {/* Cartes membres */}
          <Link href="/admin/cartes" className="inline-flex h-9 items-center gap-2 rounded-full border border-yellow-300 bg-yellow-200 px-3 text-sm font-semibold text-yellow-800 transition-all hover:bg-yellow-300 sm:px-4">
            <CreditCard size={14} />
            <span className="hidden sm:inline">Cartes membres</span>
          </Link>
          {/* Nouveau membre */}
          <Link href="/admin/adherents/nouveau" className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-3 text-sm font-black text-white transition-all hover:bg-emerald-700 sm:px-5">
            <UserPlus size={14} />
            <span className="hidden sm:inline">Nouveau membre</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {/* Barre de recherche */}
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

        <div className="flex flex-wrap items-center gap-1.5">
          {/* Bouton Filtrer avec panneau checkbox */}
          <div ref={filterRef} className="relative">
            <button
              type="button"
              onClick={() => setShowFilterPanel(v => !v)}
              className={`relative flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-bold transition-all sm:px-4 ${
                activeFilterCount > 0
                  ? 'border-emerald-500 bg-emerald-600 text-white'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-emerald-300 hover:text-emerald-700'
              }`}
            >
              <SlidersHorizontal size={13} />
              Filtrer
              {activeFilterCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-black text-emerald-700">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {showFilterPanel && (
              <div className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-2xl ring-1 ring-black/5 sm:left-auto sm:right-0">
                {/* En-tête panneau */}
                <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
                  <span className="text-sm font-black text-neutral-900">Filtres</span>
                  <div className="flex items-center gap-2">
                    {activeFilterCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setFilters(EMPTY_FILTERS)}
                        className="text-[11px] font-bold text-emerald-700 hover:underline"
                      >
                        Réinitialiser
                      </button>
                    )}
                    <button type="button" onClick={() => setShowFilterPanel(false)} className="flex h-6 w-6 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100">
                      <X size={13} />
                    </button>
                  </div>
                </div>

                <div className="max-h-[70vh] divide-y divide-neutral-50 overflow-y-auto">
                  {/* Statut */}
                  <div className="px-4 py-3">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Statut</p>
                    <div className="space-y-1.5">
                      {([['active', 'Actif'], ['pending', 'En attente'], ['suspended', 'Suspendu']] as const).map(([val, lbl]) => {
                        const checked = filters.statut.includes(val);
                        const cfg = statusConfig[val];
                        return (
                          <label key={val} className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 transition ${checked ? 'border-emerald-200 bg-emerald-50' : 'border-transparent hover:bg-neutral-50'}`}>
                            <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${checked ? 'border-emerald-600 bg-emerald-600' : 'border-neutral-300 bg-white'}`}>
                              {checked && <CheckCircle2 size={10} className="text-white" />}
                            </span>
                            <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleFilter('statut', val)} />
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black ${cfg.cls}`}>
                              <cfg.icon size={9} /> {lbl}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cotisation */}
                  <div className="px-4 py-3">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Cotisation</p>
                    <div className="space-y-1.5">
                      {([['paid', 'Payée'], ['unpaid', 'Impayée'], ['exempt', 'Exempté']] as const).map(([val, lbl]) => {
                        const checked = filters.cotisation.includes(val);
                        const cfg = cotisationConfig[val];
                        return (
                          <label key={val} className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 transition ${checked ? 'border-emerald-200 bg-emerald-50' : 'border-transparent hover:bg-neutral-50'}`}>
                            <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${checked ? 'border-emerald-600 bg-emerald-600' : 'border-neutral-300 bg-white'}`}>
                              {checked && <CheckCircle2 size={10} className="text-white" />}
                            </span>
                            <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleFilter('cotisation', val)} />
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${cfg.cls}`}>{lbl}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Profil */}
                  <div className="px-4 py-3">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Profil</p>
                    <div className="space-y-1.5">
                      {([['complete', 'Complet', profileConfig.complete.cls], ['incomplete', 'Incomplet', profileConfig.incomplete.cls]] as const).map(([val, lbl, cls]) => {
                        const checked = filters.profil.includes(val);
                        return (
                          <label key={val} className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 transition ${checked ? 'border-emerald-200 bg-emerald-50' : 'border-transparent hover:bg-neutral-50'}`}>
                            <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${checked ? 'border-emerald-600 bg-emerald-600' : 'border-neutral-300 bg-white'}`}>
                              {checked && <CheckCircle2 size={10} className="text-white" />}
                            </span>
                            <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleFilter('profil', val)} />
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${cls}`}>{lbl}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mois d'inscription */}
                  <div className="px-4 py-3">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Inscription (mois)</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {MONTHS_FR.map((mois, idx) => {
                        const checked = filters.mois.includes(idx);
                        return (
                          <label key={idx} className={`flex cursor-pointer items-center justify-center rounded-lg border px-1 py-1.5 text-[11px] font-bold transition ${checked ? 'border-emerald-500 bg-emerald-600 text-white' : 'border-neutral-200 bg-white text-neutral-600 hover:border-emerald-300 hover:text-emerald-700'}`}>
                            <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleFilter('mois', idx)} />
                            {mois.slice(0, 3)}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer résumé */}
                <div className="border-t border-neutral-100 px-4 py-3">
                  <p className="text-xs text-neutral-500">
                    <span className="font-black text-neutral-900">{displayed.length}</span> membre{displayed.length > 1 ? 's' : ''} correspondent
                    {activeFilterCount > 0 && <span> à {activeFilterCount} filtre{activeFilterCount > 1 ? 's' : ''}</span>}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Chips des filtres actifs */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-1">
              {filters.statut.map(v => (
                <button key={v} type="button" onClick={() => toggleFilter('statut', v)}
                  className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700 hover:bg-emerald-100">
                  {statusConfig[v]?.label} <X size={9} />
                </button>
              ))}
              {filters.cotisation.map(v => (
                <button key={v} type="button" onClick={() => toggleFilter('cotisation', v)}
                  className="flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-black text-blue-700 hover:bg-blue-100">
                  {cotisationConfig[v]?.label} <X size={9} />
                </button>
              ))}
              {filters.profil.map(v => (
                <button key={v} type="button" onClick={() => toggleFilter('profil', v)}
                  className="flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2 py-1 text-[10px] font-black text-violet-700 hover:bg-violet-100">
                  Profil {v === 'complete' ? 'complet' : 'incomplet'} <X size={9} />
                </button>
              ))}
              {filters.mois.map(idx => (
                <button key={idx} type="button" onClick={() => toggleFilter('mois', idx)}
                  className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-black text-amber-700 hover:bg-amber-100">
                  {MONTHS_FR[idx]} <X size={9} />
                </button>
              ))}
            </div>
          )}

          {/* Export */}
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
                  <col className="w-[4%]" />
                  <col className="w-[15%]" />
                  <col className="w-[7%]" />
                  <col className="w-[15%]" />
                  <col className="w-[8%]" />
                  <col className="w-[7%]" />
                  <col className="w-[7%]" />
                  <col className="w-[7%]" />
                  <col className="w-[8%]" />
                  <col className="w-[9%]" />
                  <col className="w-[9%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50/60">
                    <th className="px-2 py-3">
                      <input
                        type="checkbox"
                        title="Tout sélectionner pour relance"
                        checked={displayed.length > 0 && displayed.every(m => relanceSelected.has(m._id))}
                        onChange={() => {
                          const allSelected = displayed.every(m => relanceSelected.has(m._id));
                          setRelanceSelected(prev => {
                            const next = new Set(prev);
                            if (allSelected) { displayed.forEach(m => next.delete(m._id)); }
                            else { displayed.forEach(m => next.add(m._id)); }
                            return next;
                          });
                        }}
                        className="h-3.5 w-3.5 rounded border-neutral-300 accent-orange-500"
                      />
                    </th>
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
                      <tr key={m._id} className={`group transition-colors hover:bg-neutral-50/55 ${relanceSelected.has(m._id) ? 'bg-orange-50/40' : ''}`}>
                        <td className="px-2 py-3">
                          <input
                            type="checkbox"
                            checked={relanceSelected.has(m._id)}
                            onChange={() => setRelanceSelected(prev => {
                              const next = new Set(prev);
                              next.has(m._id) ? next.delete(m._id) : next.add(m._id);
                              return next;
                            })}
                            className="h-3.5 w-3.5 rounded border-neutral-300 accent-orange-500"
                          />
                        </td>
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
                  <div key={m._id} className={`px-3 py-3 transition-colors hover:bg-neutral-50/60 sm:px-4 ${relanceSelected.has(m._id) ? 'bg-orange-50/40' : ''}`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={relanceSelected.has(m._id)}
                        onChange={() => setRelanceSelected(prev => {
                          const next = new Set(prev);
                          next.has(m._id) ? next.delete(m._id) : next.add(m._id);
                          return next;
                        })}
                        className="h-4 w-4 shrink-0 rounded border-neutral-300 accent-orange-500"
                      />
                    <button
                      type="button"
                      onClick={event => {
                        if ((event.target as HTMLElement).closest('[data-profile-photo]') && photoUrl) {
                          setPhotoPreview({ src: photoUrl, name: formatFullName(m.firstName, m.lastName) });
                          return;
                        }
                        setExpandedId(isExpanded ? null : m._id);
                      }}
                      className="flex flex-1 items-center gap-3 rounded-2xl text-left transition active:scale-[0.995]"
                    >
                      {photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img data-profile-photo src={photoUrl} alt={formatFullName(m.firstName, m.lastName)} className={`h-10 w-10 shrink-0 rounded-2xl border-2 object-cover shadow-sm ${memberAvatarBorderClass(m.gender)}`} />
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
                    </div>

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
      {photoPreview && <ControlledAvatarDialog src={photoPreview.src} alt={photoPreview.name} onClose={() => setPhotoPreview(null)} />}
      {showCaurisManager && <CaurisManagementModal members={members} onClose={() => setShowCaurisManager(false)} />}
      {showFraisAdhesion && <FraisAdhesionModal onClose={() => setShowFraisAdhesion(false)} />}
      {showRelance && (
        <RelanceModal
          members={members}
          preSelected={relanceSelected}
          onClose={() => setShowRelance(false)}
        />
      )}
    </>
  );
}


function CaurisManagementModal({ members, onClose }: { members: MemberListItem[]; onClose: () => void }) {
  const [operation, setOperation] = useState<'add' | 'remove'>('add');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [balances, setBalances] = useState<Record<string, number>>({});
  const adjust = useAdjustMemberCauris();

  const activeMembers = useMemo(() =>
    members.filter(m => m.memberStatus === 'active'),
  [members]);

  const filtered = useMemo(() =>
    activeMembers.filter(m =>
      `${m.firstName} ${m.lastName} ${m.email} ${m.memberId}`
        .toLowerCase().includes(search.toLowerCase())
    ),
  [activeMembers, search]);

  const allFilteredSelected = filtered.length > 0 && filtered.every(m => selected.has(m._id));

  const toggleAll = () => {
    setSelected(prev => {
      const next = new Set(prev);
      if (allFilteredSelected) { filtered.forEach(m => next.delete(m._id)); }
      else { filtered.forEach(m => next.add(m._id)); }
      return next;
    });
  };

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    const amt = parseInt(amount);
    if (!amt || amt < 1 || selected.size === 0) return;
    const result = await adjust.mutateAsync({
      memberIds: [...selected],
      amount: amt,
      operation,
      reason: reason.trim() || undefined,
    });
    if (result.data) {
      const updates: Record<string, number> = {};
      for (const r of result.data) {
        if (r.ok && r.newBalance != null) updates[r.memberId] = r.newBalance;
      }
      setBalances(prev => ({ ...prev, ...updates }));
    }
    setSelected(new Set());
    setAmount('');
    setReason('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <CauriImg size={22} />
            <h2 className="text-base font-black text-neutral-900">Gestion des cauris</h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100">
            <XCircle size={16} />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto">
          {/* Opération + Montant */}
          <div className="space-y-3 border-b border-neutral-100 px-5 py-4">
            <div className="flex gap-2">
              <button type="button" onClick={() => setOperation('add')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-black transition ${operation === 'add' ? 'border-emerald-500 bg-emerald-600 text-white' : 'border-neutral-200 bg-white text-neutral-600 hover:border-emerald-300'}`}>
                <Plus size={14} /> Ajouter
              </button>
              <button type="button" onClick={() => setOperation('remove')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-black transition ${operation === 'remove' ? 'border-red-500 bg-red-600 text-white' : 'border-neutral-200 bg-white text-neutral-600 hover:border-red-300'}`}>
                <Minus size={14} /> Retirer
              </button>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="mb-1 block text-[10px] font-black uppercase tracking-wide text-neutral-400">Montant (cauris)</label>
                <input
                  type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)}
                  placeholder="ex : 50"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-bold focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-[10px] font-black uppercase tracking-wide text-neutral-400">Motif (optionnel)</label>
                <input
                  type="text" value={reason} onChange={e => setReason(e.target.value)}
                  placeholder="Bonus événement…"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>
          </div>

          {/* Recherche + sélection */}
          <div className="space-y-2 px-5 py-3">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text" placeholder="Rechercher un membre…" value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-9 w-full rounded-lg border border-neutral-200 bg-white pl-8 pr-3 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            {/* Tout sélectionner */}
            <label className="flex cursor-pointer items-center gap-2 rounded-lg px-1 py-1 hover:bg-neutral-50">
              <input type="checkbox" checked={allFilteredSelected} onChange={toggleAll}
                className="h-4 w-4 rounded border-neutral-300 accent-emerald-600" />
              <span className="text-xs font-bold text-neutral-600">
                Tout sélectionner ({filtered.length} membres actifs)
              </span>
              {selected.size > 0 && (
                <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700">
                  {selected.size} sélectionné{selected.size > 1 ? 's' : ''}
                </span>
              )}
            </label>
          </div>

          {/* Liste membres */}
          <div className="divide-y divide-neutral-50 px-5 pb-3">
            {filtered.length === 0 && (
              <p className="py-6 text-center text-sm text-neutral-400">Aucun membre actif trouvé</p>
            )}
            {filtered.map(m => {
              const isSelected = selected.has(m._id);
              const newBal = balances[m._id];
              const photoUrl = memberPhotoUrl(m);
              return (
                <label key={m._id} className={`flex cursor-pointer items-center gap-3 py-2.5 transition ${isSelected ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}>
                  <input type="checkbox" checked={isSelected} onChange={() => toggle(m._id)}
                    className="h-4 w-4 shrink-0 rounded border-neutral-300 accent-emerald-600" />
                  {photoUrl
                    ? <img src={photoUrl} alt="" className={`h-8 w-8 shrink-0 rounded-full border-2 object-cover ${memberAvatarBorderClass(m.gender)}`} />
                    : <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white ${memberInitialsClass(m.gender)}`}>
                        {formatInitials(m.firstName, m.lastName)}
                      </div>
                  }
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-neutral-900">{formatFullName(m.firstName, m.lastName)}</p>
                    <p className="font-mono text-[10px] text-neutral-400">{m.memberId}</p>
                  </div>
                  {newBal != null && (
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700">
                      {newBal} C
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-neutral-100 px-5 py-3">
          <button type="button" onClick={onClose} className="text-sm font-semibold text-neutral-500 hover:text-neutral-700">
            Fermer
          </button>
          <button
            type="button"
            disabled={selected.size === 0 || !amount || parseInt(amount) < 1 || adjust.isPending}
            onClick={handleSubmit}
            className={`inline-flex h-9 items-center gap-2 rounded-xl px-5 text-sm font-black text-white transition disabled:opacity-40 ${operation === 'add' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {adjust.isPending ? <Loader2 size={14} className="animate-spin" /> : operation === 'add' ? <Plus size={14} /> : <Minus size={14} />}
            {operation === 'add' ? 'Ajouter' : 'Retirer'} {amount ? `${amount} C` : ''} — {selected.size} membre{selected.size > 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   FRAIS D'ADHÉSION MODAL
══════════════════════════════════════════════════════════ */
const YEARS_LIST = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
const COTI_STATUS_CFG = {
  paid:   { label: 'Payé',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  unpaid: { label: 'Non payé', cls: 'bg-red-50 text-red-700 border-red-200' },
  exempt: { label: 'Exempté',  cls: 'bg-neutral-50 text-neutral-500 border-neutral-200' },
} as const;

function FraisAdhesionModal({ onClose }: { onClose: () => void }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [search, setSearch] = useState('');
  const { data, isLoading } = useAdminCotisations(year);
  const updateStatus = useUpdateCotisationStatus();
  const sendReminders = useSendReminders();
  const sendInvoiceRelance = useSendUnpaidInvoiceRelance();

  const rows: AdminCotisationRow[] = data?.data ?? [];

  const filtered = useMemo(() =>
    rows.filter(r => `${r.user.firstName} ${r.user.lastName} ${r.user.email}`
      .toLowerCase().includes(search.toLowerCase())),
  [rows, search]);

  const unpaidIds = filtered.filter(r => r.cotisation.status === 'unpaid').map(r => r.user._id);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
      <div className="flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5" style={{ maxHeight: '92vh' }}>
        {/* Header */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <Banknote size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">Adhérents</p>
              <h2 className="text-lg font-black text-neutral-900">Frais d&apos;adhésion {year}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="h-9 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-bold text-neutral-700 focus:border-emerald-400 focus:outline-none"
            >
              {YEARS_LIST.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100">
              <XCircle size={16} />
            </button>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-neutral-100 bg-neutral-50/60 px-5 py-3">
          <div className="relative flex-1 min-w-[160px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Rechercher…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-8 w-full rounded-lg border border-neutral-200 bg-white pl-8 pr-3 text-sm focus:border-blue-400 focus:outline-none"
            />
          </div>
          <button
            type="button"
            disabled={unpaidIds.length === 0 || sendReminders.isPending}
            onClick={() => sendReminders.mutate({ year, userIds: unpaidIds })}
            className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-3 text-xs font-black text-orange-700 transition hover:bg-orange-100 disabled:opacity-40"
          >
            {sendReminders.isPending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
            Relancer non payés ({unpaidIds.length})
          </button>
          <button
            type="button"
            disabled={filtered.length === 0 || sendInvoiceRelance.isPending}
            onClick={() => sendInvoiceRelance.mutate({ userIds: filtered.map(r => r.user._id) })}
            className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 text-xs font-black text-blue-700 transition hover:bg-blue-100 disabled:opacity-40"
          >
            {sendInvoiceRelance.isPending ? <Loader2 size={12} className="animate-spin" /> : <MessageSquare size={12} />}
            Relancer factures
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex justify-center py-12"><Loader2 size={22} className="animate-spin text-blue-500" /></div>
          )}
          {!isLoading && (
            <div className="divide-y divide-neutral-50">
              {filtered.length === 0 && (
                <p className="py-10 text-center text-sm text-neutral-400">Aucun résultat</p>
              )}
              {filtered.map(row => {
                const u = row.user;
                const coti = row.cotisation;
                const cfg = COTI_STATUS_CFG[coti.status] ?? COTI_STATUS_CFG.unpaid;
                const photoUrl = u.avatar
                  ? (u.avatar.startsWith('http') ? u.avatar : `${process.env.NEXT_PUBLIC_BACKEND_URL ?? ''}${u.avatar}`)
                  : null;
                return (
                  <div key={u._id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 hover:bg-neutral-50/60">
                    <div className="flex min-w-0 items-center gap-3">
                      {photoUrl
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={photoUrl} alt="" className="h-8 w-8 shrink-0 rounded-full border-2 object-cover border-neutral-200" />
                        : <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white ${memberInitialsClass(u.gender)}`}>{formatInitials(u.firstName, u.lastName)}</div>
                      }
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-neutral-900">{formatFullName(u.firstName, u.lastName)}</p>
                        <p className="truncate text-[11px] text-neutral-400">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-black ${cfg.cls}`}>{cfg.label}</span>
                      {coti.status !== 'paid' && (
                        <button
                          type="button"
                          disabled={updateStatus.isPending}
                          onClick={() => updateStatus.mutate({ userId: u._id, year, status: 'paid' })}
                          className="inline-flex h-7 items-center gap-1 rounded-lg bg-emerald-600 px-2.5 text-[11px] font-black text-white transition hover:bg-emerald-700 disabled:opacity-50"
                        >
                          <CheckCircle2 size={11} /> Marquer payé
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-neutral-100 px-5 py-3">
          <p className="text-xs text-neutral-400">{filtered.length} membre{filtered.length > 1 ? 's' : ''}</p>
          <button type="button" onClick={onClose} className="text-sm font-semibold text-neutral-500 hover:text-neutral-700">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   RELANCE MODAL — 3 étapes
══════════════════════════════════════════════════════════ */
type RelanceType = 'cotisation' | 'facture' | 'profil' | 'presence';
type RelanceChannel = 'email' | 'whatsapp' | 'message';

const RELANCE_TYPES: { id: RelanceType; emoji: string; label: string; desc: string; color: string }[] = [
  { id: 'cotisation', emoji: '💰', label: 'Cotisation impayée', desc: 'Rappel de règlement annuel', color: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100' },
  { id: 'facture',    emoji: '🧾', label: 'Facture',            desc: 'Facture en attente',         color: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' },
  { id: 'profil',     emoji: '👤', label: 'Profil incomplet',   desc: 'Complétion de profil',       color: 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100' },
  { id: 'presence',   emoji: '📍', label: 'Présence activité',  desc: 'Confirmation de présence',   color: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
];

const CHANNELS: { id: RelanceChannel; emoji: string; label: string; desc: string }[] = [
  { id: 'email',    emoji: '📧', label: 'Email',            desc: 'Envoi via Resend (recommandé)' },
  { id: 'whatsapp', emoji: '💬', label: 'WhatsApp',         desc: 'Lien pré-rempli à envoyer' },
  { id: 'message',  emoji: '✉️',  label: 'Message interne', desc: 'Messagerie du portail' },
];

function RelanceModal({
  members,
  preSelected,
  onClose,
}: {
  members: MemberListItem[];
  preSelected: Set<string>;
  onClose: () => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [type, setType] = useState<RelanceType | null>(null);
  const [channel, setChannel] = useState<RelanceChannel | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(preSelected));
  const [activityId, setActivityId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isSending, setIsSending] = useState(false);

  const { data: activitiesData } = useActivities({ status: 'published' });
  const activities: ActivityDoc[] = activitiesData?.data?.activities ?? [];

  const remindCotisation  = useSendReminders();
  const remindInvoice     = useSendUnpaidInvoiceRelance();
  const remindProfil      = useRemindIncompleteProfiles();
  const remindPresence    = useRemindActivityInvitations();

  const filtered = useMemo(() =>
    members.filter(m => `${m.firstName} ${m.lastName} ${m.email}`
      .toLowerCase().includes(search.toLowerCase())),
  [members, search]);

  const allSelected = filtered.length > 0 && filtered.every(m => selectedIds.has(m._id));

  const toggleAll = () => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allSelected) { filtered.forEach(m => next.delete(m._id)); }
      else { filtered.forEach(m => next.add(m._id)); }
      return next;
    });
  };

  const toggleOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSend = async () => {
    if (!type || !channel) return;
    setIsSending(true);
    try {
      const ids = [...selectedIds];

      if (channel === 'email') {
        if (type === 'cotisation') {
          await remindCotisation.mutateAsync({ year: new Date().getFullYear(), userIds: ids });
        } else if (type === 'facture') {
          await remindInvoice.mutateAsync({ userIds: ids });
        } else if (type === 'profil') {
          await remindProfil.mutateAsync({ userIds: ids });
        } else if (type === 'presence' && activityId) {
          await remindPresence.mutateAsync(activityId);
        }
      } else if (channel === 'whatsapp') {
        const msgs = {
          cotisation: 'Bonjour, nous vous rappelons que votre cotisation annuelle SALAM est toujours en attente de règlement. Merci de régulariser votre situation.',
          facture:    'Bonjour, vous avez une facture en attente de règlement dans votre espace membre SALAM. Merci de la régulariser.',
          profil:     'Bonjour, votre profil membre SALAM est incomplet. Merci de le compléter sur votre espace membre.',
          presence:   'Bonjour, merci de confirmer votre présence à l\'activité SALAM en vous connectant à votre espace membre.',
        };
        const msg = encodeURIComponent(msgs[type]);
        const selected = members.filter(m => selectedIds.has(m._id) && m.phone);
        for (const m of selected) {
          const phone = m.phone!.replace(/\D/g, '');
          window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
        }
        const noPhone = members.filter(m => selectedIds.has(m._id) && !m.phone).length;
        if (noPhone > 0) {
          alert(`${noPhone} membre(s) sans numéro de téléphone — ignoré(s).`);
        }
      } else if (channel === 'message') {
        const subjects = {
          cotisation: 'Rappel — Cotisation annuelle',
          facture:    'Rappel — Facture en attente',
          profil:     'Rappel — Profil incomplet',
          presence:   'Rappel — Confirmation de présence',
        };
        const contents = {
          cotisation: 'Bonjour, votre cotisation annuelle SALAM est toujours en attente. Merci de régulariser votre situation depuis votre espace membre.',
          facture:    'Bonjour, vous avez une facture en attente dans votre espace membre. Merci de la régler.',
          profil:     'Bonjour, votre profil est incomplet. Merci de le compléter depuis votre espace membre.',
          presence:   'Bonjour, merci de confirmer votre présence à l\'activité depuis votre espace membre.',
        };
        for (const id of ids) {
          await fetch('/api/v1/admin/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${document.cookie.match(/token=([^;]+)/)?.[1] ?? ''}` },
            body: JSON.stringify({ recipientId: id, subject: subjects[type], content: contents[type] }),
          }).catch(() => {});
        }
      }
      onClose();
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
      <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5" style={{ maxHeight: '92vh' }}>
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-neutral-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50">
              <Bell size={16} className="text-orange-600" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">Adhérents</p>
              <h2 className="text-base font-black text-neutral-900">
                {step === 1 ? 'Choisir le type de relance' : step === 2 ? (type === 'presence' ? 'Choisir l\'activité' : 'Choisir les destinataires') : 'Canal d\'envoi'}
              </h2>
            </div>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100">
            <XCircle size={16} />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex shrink-0 items-center gap-1 border-b border-neutral-100 bg-neutral-50/60 px-5 py-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${s <= step ? 'bg-orange-500' : 'bg-neutral-200'}`} />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* STEP 1 — Type */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-3">
              {RELANCE_TYPES.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => { setType(t.id); setStep(2); }}
                  className={`flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition ${t.color}`}
                >
                  <span className="text-2xl">{t.emoji}</span>
                  <div>
                    <p className="text-sm font-black">{t.label}</p>
                    <p className="mt-0.5 text-[11px] opacity-70">{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* STEP 2 — Activité (presence) ou Membres */}
          {step === 2 && type === 'presence' && (
            <div className="space-y-2">
              <p className="mb-3 text-xs font-semibold text-neutral-500">Sélectionnez l&apos;activité pour laquelle envoyer la relance de présence :</p>
              {activities.length === 0 && <p className="text-sm text-neutral-400">Aucune activité publiée.</p>}
              {activities.map(a => (
                <button
                  key={a._id}
                  type="button"
                  onClick={() => { setActivityId(a._id); setStep(3); }}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${activityId === a._id ? 'border-emerald-400 bg-emerald-50' : 'border-neutral-200 bg-white hover:border-emerald-300'}`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-neutral-900">{a.title}</p>
                    {a.startDate && (
                      <p className="text-[11px] text-neutral-400">
                        {new Date(a.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-[11px] font-semibold text-neutral-400">
                    {a.invitationSummary?.total ?? 0} invités
                  </span>
                </button>
              ))}
            </div>
          )}

          {step === 2 && type !== 'presence' && (
            <div className="space-y-3">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Rechercher un membre…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="h-9 w-full rounded-lg border border-neutral-200 bg-white pl-8 pr-3 text-sm focus:border-orange-400 focus:outline-none"
                />
              </div>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg px-1 py-1 hover:bg-neutral-50">
                <input type="checkbox" checked={allSelected} onChange={toggleAll}
                  className="h-4 w-4 rounded border-neutral-300 accent-orange-500" />
                <span className="text-xs font-bold text-neutral-600">
                  Tout sélectionner ({filtered.length})
                </span>
                {selectedIds.size > 0 && (
                  <span className="ml-auto rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-black text-orange-700">
                    {selectedIds.size} sélectionné{selectedIds.size > 1 ? 's' : ''}
                  </span>
                )}
              </label>
              <div className="divide-y divide-neutral-50">
                {filtered.map(m => {
                  const photoUrl = memberPhotoUrl(m);
                  const isChecked = selectedIds.has(m._id);
                  return (
                    <label key={m._id} className={`flex cursor-pointer items-center gap-3 py-2.5 transition ${isChecked ? 'opacity-100' : 'opacity-75 hover:opacity-100'}`}>
                      <input type="checkbox" checked={isChecked} onChange={() => toggleOne(m._id)}
                        className="h-4 w-4 shrink-0 rounded border-neutral-300 accent-orange-500" />
                      {photoUrl
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={photoUrl} alt="" className={`h-8 w-8 shrink-0 rounded-full border-2 object-cover ${memberAvatarBorderClass(m.gender)}`} />
                        : <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white ${memberInitialsClass(m.gender)}`}>
                            {formatInitials(m.firstName, m.lastName)}
                          </div>
                      }
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-neutral-900">{formatFullName(m.firstName, m.lastName)}</p>
                        <p className="truncate text-[11px] text-neutral-400">{m.email}</p>
                      </div>
                      {type === 'whatsapp' as string && !m.phone && (
                        <span className="shrink-0 text-[10px] text-neutral-300">Pas de tél.</span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3 — Canal */}
          {step === 3 && (
            <div className="space-y-3">
              <p className="mb-1 text-xs font-semibold text-neutral-500">
                {type === 'presence'
                  ? `Envoyer la relance de présence via :`
                  : `Envoyer la relance à ${selectedIds.size} membre${selectedIds.size > 1 ? 's' : ''} via :`}
              </p>
              {CHANNELS.map(ch => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setChannel(ch.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${channel === ch.id ? 'border-orange-400 bg-orange-50' : 'border-neutral-200 bg-white hover:border-orange-200 hover:bg-orange-50/40'}`}
                >
                  <span className="text-xl">{ch.emoji}</span>
                  <div>
                    <p className="text-sm font-black text-neutral-900">{ch.label}</p>
                    <p className="text-[11px] text-neutral-400">{ch.desc}</p>
                  </div>
                  <div className={`ml-auto h-4 w-4 shrink-0 rounded-full border-2 transition ${channel === ch.id ? 'border-orange-500 bg-orange-500' : 'border-neutral-300'}`} />
                </button>
              ))}
              {channel === 'whatsapp' && type !== 'presence' && (
                <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  <strong>Note :</strong> Un onglet WhatsApp s&apos;ouvrira pour chaque membre sélectionné avec un numéro de téléphone. Les membres sans numéro seront ignorés.
                </div>
              )}
              {channel === 'message' && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                  Un message sera créé dans la messagerie interne pour chaque destinataire.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-neutral-100 px-5 py-3">
          <button
            type="button"
            onClick={() => {
              if (step === 1) { onClose(); return; }
              setStep(s => (s - 1) as 1 | 2 | 3);
              if (step === 2) { setType(null); setActivityId(null); }
              if (step === 3) { setChannel(null); }
            }}
            className="text-sm font-semibold text-neutral-500 hover:text-neutral-700"
          >
            {step === 1 ? 'Annuler' : '← Retour'}
          </button>

          {step === 2 && type !== 'presence' && (
            <button
              type="button"
              disabled={selectedIds.size === 0}
              onClick={() => setStep(3)}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-black text-white transition hover:bg-orange-600 disabled:opacity-40"
            >
              Suivant →
            </button>
          )}

          {step === 3 && (
            <button
              type="button"
              disabled={!channel || isSending}
              onClick={handleSend}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-black text-white transition hover:bg-orange-600 disabled:opacity-40"
            >
              {isSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Envoyer la relance
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

