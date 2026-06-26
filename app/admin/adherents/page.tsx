'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  UserPlus, CreditCard, Search, Eye, CheckCircle2, Clock, XCircle,
  Download, Loader2, Trash2, Mail, ChevronDown, PencilLine,
  Plus, Minus, SlidersHorizontal, X, Bell, Banknote,
  Send, CalendarDays, AlertTriangle, Users, ChevronLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useAdminMembers, useHardDeleteMember, useResendInvitation,
  useRemindIncompleteProfiles, type MemberListItem,
} from '@/lib/api/members';
import {
  useAdminCotisations, useUpdateCotisationStatus, useSendReminders,
  useSendUnpaidInvoiceRelance, type AdminCotisationRow, type CotisationStatus,
} from '@/lib/api/cotisations';
import { useActivities, useActivityInvitations, useRemindActivityInvitations, type ActivityDoc } from '@/lib/api/activities';
import { useAdjustMemberCauris } from '@/lib/api/cauris';
import { useAuthStore } from '@/store/auth.store';
import { formatFullName, formatInitials } from '@/lib/format-name';
import { memberAvatarBorderClass, memberInitialsClass, memberPhotoUrl } from '@/lib/avatar';
import { ControlledAvatarDialog } from '@/components/portal/AvatarLightbox';
import { CauriImg } from '@/components/member/CauriWallet';
import { MemberCard, type MemberCardData } from '@/components/portal/MemberCard';
import { downloadElementAsPng, memberCardMailto } from '@/lib/member-card-export';

/* ── Types ─────────────────────────────────────────────── */
type ActiveTab  = 'relance' | 'frais' | 'cauris' | 'cartes' | null;
type RelanceSub = 'cotisation' | 'inscription' | 'profil' | 'presence' | 'facture' | null;

/* ── Constants ──────────────────────────────────────────── */
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
  complete:   { label: 'Complet',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  incomplete: { label: 'Incomplet', cls: 'bg-red-50 text-red-700 border-red-100' },
};
const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const YEARS_LIST = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
const RELANCE_OPTIONS: { id: RelanceSub; label: string }[] = [
  { id: 'cotisation',  label: 'Cotisation impayée'      },
  { id: 'inscription', label: 'Inscription en attente'  },
  { id: 'profil',      label: 'Profil incomplet'        },
  { id: 'presence',    label: 'Présence activité'       },
  { id: 'facture',     label: 'Facture'                 },
];
const REMINDER_OPTIONS = [
  { value: 'off', label: 'Désactivé'      },
  { value: '30',  label: '30 jours avant' },
  { value: '15',  label: '15 jours avant' },
  { value: '7',   label: '7 jours avant'  },
];
type ActiveFilters = { statut: string[]; cotisation: string[]; profil: string[]; mois: number[] };
const EMPTY_FILTERS: ActiveFilters = { statut: [], cotisation: [], profil: [], mois: [] };

const TAB_LABELS: Record<string, string> = {
  relance: 'Relance',
  frais:   "Frais d'adhésion",
  cauris:  'Gestion cauris',
  cartes:  'Cartes membres',
};

/* ── Utilities ───────────────────────────────────────────── */
const fmt     = (d: string)  => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtDate = (d?: string) => !d ? 'Jamais' : new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
function csvEscape(v: string | number | undefined | null): string {
  const s = v == null ? '' : String(v);
  if (s.includes('"') || s.includes(',') || s.includes('\n')) return `"${s.replace(/"/g,'""')}"`;
  return s;
}
function toCardData(m: MemberListItem): MemberCardData {
  return { id: m.memberId, cardVerifyToken: m.cardVerifyToken, firstName: m.firstName, lastName: m.lastName, gender: m.gender, role: 'Membre actif', year: new Date().getFullYear(), photo: memberPhotoUrl(m) };
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function AdminAdherentsPage() {
  /* ── Tab state ─────────────────────────────────────────── */
  const [activeTab,      setActiveTab]      = useState<ActiveTab>(null);
  const [showKpis,       setShowKpis]       = useState(true);
  const [relanceSub,     setRelanceSub]     = useState<RelanceSub>(null);
  const [selectedAct,    setSelectedAct]    = useState<ActivityDoc | null>(null);
  const [showActPicker,  setShowActPicker]  = useState(false);
  const [cotisYear,      setCotisYear]      = useState(new Date().getFullYear());
  const [showFraisParams, setShowFraisParams] = useState(false);
  const [deadline,       setDeadline]       = useState('');
  const [caurisOp,       setCaurisOp]       = useState<'add' | 'remove'>('add');
  const [caurisAmt,      setCaurisAmt]      = useState('');
  const [caurisReason,   setCaurisReason]   = useState('');
  const [cardSelected,   setCardSelected]   = useState<MemberListItem | null>(null);
  const [checkedIds,     setCheckedIds]     = useState<Set<string>>(new Set());
  const [confirmModal,   setConfirmModal]   = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  /* ── Existing state ──────────────────────────────────────── */
  const [search,          setSearch]          = useState('');
  const [filters,         setFilters]         = useState<ActiveFilters>(EMPTY_FILTERS);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [expandedId,      setExpandedId]      = useState<string | null>(null);
  const [photoPreview,    setPhotoPreview]    = useState<{ src: string; name: string } | null>(null);

  const filterRef      = useRef<HTMLDivElement>(null);
  const desktopCardRef = useRef<HTMLDivElement>(null);
  const mobileCardRef  = useRef<HTMLDivElement>(null);

  const user         = useAuthStore(s => s.user);
  const isSuperAdmin = user?.effectivePermissions?.includes('*') ?? false;

  /* ── Data hooks ─────────────────────────────────────────── */
  const { data, isLoading }      = useAdminMembers({ search: '', limit: 200 });
  const { data: cotisData }      = useAdminCotisations(cotisYear);
  const { data: activitiesData } = useActivities({ status: 'published' });
  /* Fetch invitations only when presence relance is active + activity chosen */
  const { data: presenceInvitData } = useActivityInvitations(
    activeTab === 'relance' && relanceSub === 'presence' && selectedAct ? selectedAct._id : undefined,
  );

  const members: MemberListItem[]       = useMemo(() => data?.data?.data ?? [], [data]);
  const cotisRows: AdminCotisationRow[] = useMemo(() => cotisData?.data ?? [], [cotisData]);
  const activities: ActivityDoc[]       = useMemo(() => activitiesData?.data?.activities ?? [], [activitiesData]);

  const cotisStatusMap = useMemo(() => {
    const map = new Map<string, CotisationStatus>();
    cotisRows.forEach(r => map.set(String(r.user._id), r.cotisation.status));
    return map;
  }, [cotisRows]);

  /* IDs des membres avec invitation pending/unsure pour l'activité choisie */
  const pendingInviteeIds = useMemo(() => {
    const invitations = presenceInvitData?.data?.invitations ?? [];
    const ids = new Set<string>();
    for (const inv of invitations) {
      if (inv.rsvpStatus !== 'pending' && inv.rsvpStatus !== 'unsure') continue;
      const mId = typeof inv.memberId === 'string'
        ? inv.memberId
        : (inv.memberId as { _id?: string })?._id;
      if (mId) ids.add(mId);
    }
    return ids;
  }, [presenceInvitData]);

  /* ── Mutations ─────────────────────────────────────────── */
  const hardDelete       = useHardDeleteMember();
  const resendInvitation = useResendInvitation();
  const remindCotisation = useSendReminders();
  const remindInvoice    = useSendUnpaidInvoiceRelance();
  const remindProfil     = useRemindIncompleteProfiles();
  const remindPresence   = useRemindActivityInvitations();
  const updateCotisation = useUpdateCotisationStatus();
  const adjustCauris     = useAdjustMemberCauris();

  /* ── Close filter panel on outside click ───────────────── */
  useEffect(() => {
    if (!showFilterPanel) return;
    const h = (e: MouseEvent) => { if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilterPanel(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [showFilterPanel]);

  /* ── Auto-select first card when cartes tab opens ──────── */
  useEffect(() => {
    if (activeTab === 'cartes') setCardSelected(prev => prev ?? members[0] ?? null);
  }, [activeTab, members]);

  /* ── Auto-sélection des invités en attente quand une activité est choisie ── */
  useEffect(() => {
    if (activeTab === 'relance' && relanceSub === 'presence' && selectedAct) {
      /* Sélectionne automatiquement tous les membres avec invitation pending/unsure */
      setCheckedIds(new Set(pendingInviteeIds));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingInviteeIds, selectedAct?._id]);

  /* ── KPIs ───────────────────────────────────────────────── */
  const kpis = useMemo(() => ({
    total:   data?.data?.total ?? members.length,
    active:  members.filter(m => m.memberStatus === 'active').length,
    pending: members.filter(m => m.memberStatus === 'pending').length,
    paid:    members.filter(m => m.cotisationStatus === 'paid').length,
    unpaid:  members.filter(m => m.cotisationStatus === 'unpaid').length,
    exempt:  members.filter(m => m.cotisationStatus === 'exempt').length,
  }), [members, data?.data?.total]);

  /* ── Displayed list (search + filters + tab auto-filter) ── */
  const displayed = useMemo(() => {
    let list = members.filter(m => {
      const matchSearch     = `${m.firstName} ${m.lastName} ${m.email} ${m.memberId}`.toLowerCase().includes(search.toLowerCase());
      const matchStatut     = filters.statut.length     === 0 || filters.statut.includes(m.memberStatus);
      const matchCotisation = filters.cotisation.length === 0 || filters.cotisation.includes(m.cotisationStatus);
      const matchProfil     = filters.profil.length     === 0 ||
        (filters.profil.includes('complete') && m.profileComplete) ||
        (filters.profil.includes('incomplete') && !m.profileComplete);
      const matchMois = filters.mois.length === 0 || filters.mois.includes(new Date(m.createdAt).getMonth());
      return matchSearch && matchStatut && matchCotisation && matchProfil && matchMois;
    });
    if (activeTab === 'relance') {
      if (relanceSub === 'cotisation')  list = list.filter(m => m.cotisationStatus === 'unpaid');
      if (relanceSub === 'inscription') list = list.filter(m => m.memberStatus === 'pending');
      if (relanceSub === 'profil')      list = list.filter(m => !m.profileComplete);
      /* Présence : restreint aux seuls membres réellement invités (pending/unsure) à l'activité */
      if (relanceSub === 'presence' && selectedAct) {
        if (pendingInviteeIds.size > 0) {
          list = list.filter(m => pendingInviteeIds.has(m._id));
        } else {
          list = []; /* activité chargée mais 0 invité en attente */
        }
      }
    }
    return list;
  }, [members, search, filters, activeTab, relanceSub, selectedAct, pendingInviteeIds]);

  const activeFilterCount = filters.statut.length + filters.cotisation.length + filters.profil.length + filters.mois.length;

  /* ── Helpers ────────────────────────────────────────────── */
  const toggleFilter = <K extends keyof ActiveFilters>(key: K, value: ActiveFilters[K][number]) => {
    setFilters(prev => {
      const arr  = prev[key] as (typeof value)[];
      const next = arr.includes(value as never) ? arr.filter(v => v !== value) : [...arr, value];
      return { ...prev, [key]: next };
    });
  };

  const allChecked = displayed.length > 0 && displayed.every(m => checkedIds.has(m._id));
  const toggleAll  = () => setCheckedIds(prev => {
    const next = new Set(prev);
    allChecked ? displayed.forEach(m => next.delete(m._id)) : displayed.forEach(m => next.add(m._id));
    return next;
  });
  const toggleOne = (id: string) => setCheckedIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  /* ── Tab switching ─────────────────────────────────────── */
  const handleTabClick = (tab: ActiveTab) => {
    if (activeTab === tab) { setActiveTab(null); setShowKpis(true);  setCheckedIds(new Set()); return; }
    setActiveTab(tab); setShowKpis(false); setCheckedIds(new Set());
    if (tab !== 'relance') setRelanceSub(null);
    if (tab !== 'frais')   setShowFraisParams(false);
  };

  /* ── Action handlers ────────────────────────────────────── */
  const handleDelete      = (id: string) => { if (confirmDeleteId !== id) { setConfirmDeleteId(id); return; } hardDelete.mutate(id, { onSettled: () => setConfirmDeleteId(null) }); };
  const handleResend      = (e: React.MouseEvent, id: string) => { e.preventDefault(); e.stopPropagation(); resendInvitation.mutate(id); };
  const handleDeleteClick = (e: React.MouseEvent, id: string) => { e.preventDefault(); e.stopPropagation(); handleDelete(id); };

  const handleCotisChange = (userId: string, status: CotisationStatus) => {
    setConfirmModal({ title: 'Modifier le statut de cotisation', message: 'Confirmer le changement de statut de cotisation pour ce membre ?', onConfirm: () => updateCotisation.mutate({ userId, year: cotisYear, status }) });
  };

  const handleSendRelance = () => {
    const ids = [...checkedIds];
    if (!ids.length) { toast.error('Sélectionnez au moins un membre.'); return; }
    const typeLabels: Record<string, string> = { cotisation: 'de relance cotisation impayée', inscription: "d'invitation inscription", profil: 'de relance profil incomplet', facture: 'de relance facture', presence: 'de présence activité' };
    const label = relanceSub ? (typeLabels[relanceSub] ?? 'de relance') : 'de relance';
    setConfirmModal({
      title: "Confirmation d'envoi",
      message: `Vous êtes sur le point d'envoyer ${ids.length} email${ids.length > 1 ? 's' : ''} ${label} à ${ids.length} membre${ids.length > 1 ? 's' : ''}. Confirmer ?`,
      onConfirm: async () => {
        try {
          if      (relanceSub === 'cotisation')               await remindCotisation.mutateAsync({ year: new Date().getFullYear(), userIds: ids });
          else if (relanceSub === 'facture')                  await remindInvoice.mutateAsync({ userIds: ids });
          else if (relanceSub === 'profil')                   await remindProfil.mutateAsync({ userIds: ids });
          else if (relanceSub === 'presence' && selectedAct)  await remindPresence.mutateAsync({ activityId: selectedAct._id, userIds: ids });
          setCheckedIds(new Set());
        } catch { /* toast handled in hook */ }
      },
    });
  };

  const handleCaurisApply = () => {
    const amt   = parseInt(caurisAmt);
    const count = checkedIds.size;
    if (!amt || amt < 1 || count === 0) { toast.error('Sélectionnez des membres et saisissez un montant.'); return; }
    setConfirmModal({
      title: "Confirmer l'opération cauris",
      message: `${caurisOp === 'add' ? 'Ajouter' : 'Retirer'} ${amt} cauris à ${count} membre${count > 1 ? 's' : ''} ?`,
      onConfirm: async () => {
        try {
          await adjustCauris.mutateAsync({ memberIds: [...checkedIds], amount: amt, operation: caurisOp, reason: caurisReason.trim() || undefined });
          setCaurisAmt(''); setCaurisReason(''); setCheckedIds(new Set());
        } catch { /* handled */ }
      },
    });
  };

  const handleCardDownload = async () => {
    if (!cardSelected) return;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    const el = isMobile ? mobileCardRef.current : desktopCardRef.current;
    if (!el) return;
    try { await downloadElementAsPng(el, `carte-salam-${cardSelected.memberId}.png`, toCardData(cardSelected)); toast.success('Carte téléchargée'); }
    catch { toast.error('Impossible de télécharger la carte.'); }
  };

  const exportToCSV = () => {
    const headers = ['N° ID','Prénom','Nom','Email','Téléphone','Genre','Année promotionnaire','Statut','Cotisation','Dernière connexion','Date inscription'];
    const rows = displayed.map(m => [csvEscape(m.memberId),csvEscape(m.firstName),csvEscape(m.lastName),csvEscape(m.email),csvEscape(m.phone??''),csvEscape(m.gender==='femme'?'Madame':m.gender==='homme'?'Monsieur':''),csvEscape(m.promotionYear),csvEscape(statusConfig[m.memberStatus]?.label??m.memberStatus),csvEscape(cotisationConfig[m.cotisationStatus]?.label??m.cotisationStatus),csvEscape(fmtDate(m.lastLoginAt)),csvEscape(fmt(m.createdAt))].join(','));
    const csv  = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['﻿'+csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href=url; a.download=`adherents_${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  /* ── Tab button class (3 states) ────────────────────────── */
  const tabBtnCls = (tab: ActiveTab): string => {
    const THEME: Record<string, { active: string; inactive: string; icon: string }> = {
      relance: { active: 'border-orange-500 bg-orange-600 text-white',  inactive: 'border-orange-300 bg-orange-50 text-orange-600',  icon: 'text-orange-600' },
      frais:   { active: 'border-blue-500 bg-blue-600 text-white',      inactive: 'border-blue-300 bg-blue-50 text-blue-600',         icon: 'text-blue-600'   },
      cauris:  { active: 'border-amber-500 bg-amber-500 text-white',    inactive: 'border-amber-300 bg-amber-50 text-amber-600',      icon: 'text-amber-600'  },
      cartes:  { active: 'border-yellow-400 bg-yellow-400 text-neutral-900', inactive: 'border-yellow-300 bg-yellow-50 text-yellow-700', icon: 'text-yellow-600' },
    };
    const t = THEME[tab as string];
    if (!t) return '';
    if (activeTab === tab)   return `border ${t.active}`;
    if (activeTab !== null)  return `border ${t.inactive}`;
    return `border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50`;
  };

  /* Icon color when button is NOT active (inherits white when active from parent text-white) */
  const tabIconCls = (tab: ActiveTab): string => {
    const ICON_CLR: Record<string, string> = { relance: 'text-orange-500', frais: 'text-blue-500', cauris: 'text-amber-500', cartes: 'text-yellow-500' };
    if (activeTab === tab) return ''; /* inherits text-white from button */
    return ICON_CLR[tab as string] ?? '';
  };

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  return (
    <>
    <div className="mx-auto max-w-6xl space-y-4">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div>
        <div className="flex flex-wrap items-baseline gap-2">
          <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Adhérents</h1>
          {activeTab && <span className="text-sm font-semibold text-neutral-400">&gt; {TAB_LABELS[activeTab]}</span>}
        </div>
        <p className="mt-0.5 text-sm text-neutral-500">
          {isLoading ? 'Chargement…' : `${data?.data?.total ?? members.length} membres au total`}
        </p>

        {/* Tab buttons row */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {/* Arrow to show/hide KPIs — visible only when a tab is active */}
          <div className={`overflow-hidden transition-[max-width,opacity] duration-200 ${activeTab ? 'max-w-[36px] opacity-100' : 'max-w-0 opacity-0 pointer-events-none'}`}>
            <button type="button" onClick={() => setShowKpis(v => !v)} title={showKpis ? 'Masquer les statistiques' : 'Afficher les statistiques'}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 shadow-sm transition hover:border-emerald-300 hover:text-emerald-600">
              <ChevronDown size={14} className={`transition-transform duration-200 ${showKpis ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Relance */}
          <button type="button" onClick={() => handleTabClick('relance')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold shadow-sm transition-all duration-200 sm:px-4 ${tabBtnCls('relance')}`}>
            <Bell size={14} className={tabIconCls('relance')} />
            <span className={`overflow-hidden whitespace-nowrap transition-[max-width,margin] duration-200 sm:max-w-none sm:ml-0 ${activeTab === 'relance' ? 'max-w-[90px] ml-0.5' : 'max-w-0'}`}>
              Relance
            </span>
          </button>

          {/* Frais d'adhésion */}
          <button type="button" onClick={() => handleTabClick('frais')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold shadow-sm transition-all duration-200 sm:px-4 ${tabBtnCls('frais')}`}>
            <Banknote size={14} className={tabIconCls('frais')} />
            <span className={`overflow-hidden whitespace-nowrap transition-[max-width,margin] duration-200 sm:max-w-none sm:ml-0 ${activeTab === 'frais' ? 'max-w-[140px] ml-0.5' : 'max-w-0'}`}>
              Frais d&apos;adhésion
            </span>
          </button>

          {/* Gestion cauris */}
          <button type="button" onClick={() => handleTabClick('cauris')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold shadow-sm transition-all duration-200 sm:px-4 ${tabBtnCls('cauris')}`}>
            <span className={activeTab === 'cauris' ? '' : tabIconCls('cauris')}>
              <CauriImg size={15} />
            </span>
            <span className={`overflow-hidden whitespace-nowrap transition-[max-width,margin] duration-200 sm:max-w-none sm:ml-0 ${activeTab === 'cauris' ? 'max-w-[130px] ml-0.5' : 'max-w-0'}`}>
              Gestion cauris
            </span>
          </button>

          {/* Cartes membres */}
          <button type="button" onClick={() => handleTabClick('cartes')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold shadow-sm transition-all duration-200 sm:px-4 ${tabBtnCls('cartes')}`}>
            <CreditCard size={14} className={tabIconCls('cartes')} />
            <span className={`overflow-hidden whitespace-nowrap transition-[max-width,margin] duration-200 sm:max-w-none sm:ml-0 ${activeTab === 'cartes' ? 'max-w-[130px] ml-0.5' : 'max-w-0'}`}>
              Cartes membres
            </span>
          </button>

          {/* Nouveau membre */}
          <Link href="/admin/adherents/nouveau"
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-2 text-sm font-black text-white shadow-sm transition-all hover:bg-emerald-700 sm:px-5">
            <UserPlus size={14} />
            <span className="hidden sm:inline">Nouveau membre</span>
          </Link>
        </div>
      </div>

      {/* ── TAB CONTROL ROWS (smooth transition via max-height) ─ */}
      {/* Relance row */}
      <div className={`overflow-hidden transition-[max-height,opacity] duration-200 ease-out ${activeTab === 'relance' ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
        <div className="rounded-2xl border border-orange-100 bg-orange-50/60 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="shrink-0 text-sm font-black text-orange-800">Relance</span>
            <div className="relative">
              <select value={relanceSub ?? ''} onChange={e => {
                  const v = e.target.value as RelanceSub;
                  setRelanceSub(v);
                  if (v === 'presence') { setShowActPicker(true); setSelectedAct(null); }
                  else setSelectedAct(null);
                }}
                className="h-8 appearance-none rounded-xl border border-orange-200 bg-white pl-3 pr-8 text-sm font-semibold text-neutral-700 focus:border-orange-400 focus:outline-none">
                <option value="">— Type de relance —</option>
                {RELANCE_OPTIONS.map(o => <option key={o.id as string} value={o.id as string}>{o.label}</option>)}
              </select>
              <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            </div>
            {relanceSub === 'presence' && (
              selectedAct ? (
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-orange-200 bg-white px-2.5 py-1 text-xs font-bold text-orange-700">
                  📍 {selectedAct.title}
                  {pendingInviteeIds.size > 0 && (
                    <span className="rounded-full bg-orange-100 px-1.5 py-0.5 text-[9px] font-black text-orange-600">
                      {pendingInviteeIds.size} en attente
                    </span>
                  )}
                  <button type="button" onClick={() => { setSelectedAct(null); setCheckedIds(new Set()); setShowActPicker(true); }} className="text-orange-400 hover:text-orange-600"><X size={11} /></button>
                </span>
              ) : (
                <button type="button" onClick={() => setShowActPicker(true)} className="rounded-xl border border-orange-200 bg-white px-2.5 py-1 text-xs font-bold text-orange-700 hover:bg-orange-50">
                  Choisir une activité…
                </button>
              )
            )}
            {relanceSub && checkedIds.size > 0 && (relanceSub !== 'presence' || selectedAct) && (
              <button type="button" onClick={handleSendRelance}
                className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-3 py-1.5 text-xs font-black text-white transition hover:bg-orange-700">
                <Send size={12} /> Envoyer ({checkedIds.size})
              </button>
            )}
          </div>
          {relanceSub === 'presence' && selectedAct && pendingInviteeIds.size === 0 && presenceInvitData && (
            <p className="mt-2 text-[11px] font-medium text-neutral-400">Aucun invité en attente pour cette activité.</p>
          )}
          {relanceSub === 'presence' && selectedAct && checkedIds.size > 0 && (
            <p className="mt-2 text-[11px] font-medium text-orange-600">
              {checkedIds.size} membre{checkedIds.size > 1 ? 's' : ''} sélectionné{checkedIds.size > 1 ? 's' : ''} — le mail sera envoyé uniquement à ces {checkedIds.size} personne{checkedIds.size > 1 ? 's' : ''}.
            </p>
          )}
          {relanceSub !== 'presence' && checkedIds.size > 0 && (
            <p className="mt-2 text-[11px] font-medium text-orange-600">{checkedIds.size} membre{checkedIds.size > 1 ? 's' : ''} sélectionné{checkedIds.size > 1 ? 's' : ''}</p>
          )}
        </div>
      </div>

      {/* Frais d'adhésion row */}
      <div className={`overflow-hidden transition-[max-height,opacity] duration-200 ease-out ${activeTab === 'frais' ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
        <div className="space-y-3 rounded-2xl border border-blue-100 bg-blue-50/40 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="shrink-0 text-sm font-black text-blue-800">Frais d&apos;adhésion</span>
            <div className="relative">
              <select value={cotisYear} onChange={e => setCotisYear(Number(e.target.value))}
                className="h-8 appearance-none rounded-xl border border-blue-200 bg-white pl-3 pr-8 text-sm font-semibold text-neutral-700 focus:border-blue-400 focus:outline-none">
                {YEARS_LIST.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            </div>
            {checkedIds.size > 0 && (
              <button type="button"
                onClick={() => setConfirmModal({ title: 'Relance cotisation', message: `Envoyer un email de relance cotisation à ${checkedIds.size} membre${checkedIds.size > 1 ? 's' : ''} ?`, onConfirm: () => remindCotisation.mutate({ year: cotisYear, userIds: [...checkedIds] }) })}
                className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-black text-orange-700 transition hover:bg-orange-100">
                <Send size={12} /> Relancer sélection ({checkedIds.size})
              </button>
            )}
          </div>
          {/* Paramètres en accordéon */}
          <div className="overflow-hidden rounded-xl border border-blue-100 bg-white">
            <button type="button" onClick={() => setShowFraisParams(v => !v)}
              className="flex w-full items-center justify-between px-4 py-3 transition hover:bg-neutral-50/60">
              <span className="text-sm font-black text-blue-800">Paramètres des cotisations {cotisYear}</span>
              <ChevronDown size={14} className={`text-neutral-400 transition-transform duration-200 ${showFraisParams ? 'rotate-180' : ''}`} />
            </button>
            <div className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-out ${showFraisParams ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
                <div className="space-y-3 border-t border-blue-50 px-4 pb-4 pt-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Date limite de paiement</label>
                      <div className="relative">
                        <CalendarDays size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
                          className="w-full rounded-xl border border-neutral-200 bg-white py-2 pl-8 pr-3 text-sm focus:border-blue-400 focus:outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Relances auto</label>
                      <div className="relative">
                        <Bell size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <select className="w-full appearance-none rounded-xl border border-neutral-200 bg-white py-2 pl-8 pr-8 text-sm focus:border-blue-400 focus:outline-none">
                          {REMINDER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                      </div>
                    </div>
                  </div>
                  <button type="button"
                    onClick={() => setConfirmModal({ title: 'Relancer tous', message: `Envoyer un email de relance cotisation à TOUS les membres non payés pour ${cotisYear} ?`, onConfirm: () => remindCotisation.mutate({ year: cotisYear, dueDate: deadline || undefined }) })}
                    disabled={remindCotisation.isPending}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-black text-orange-700 transition hover:bg-orange-100 disabled:opacity-50">
                    {remindCotisation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                    Relancer tous maintenant
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gestion cauris row */}
      <div className={`overflow-hidden transition-[max-height,opacity] duration-200 ease-out ${activeTab === 'cauris' ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/40 px-4 py-3">
          <div className="mb-1 flex items-baseline gap-2">
            <span className="text-sm font-black text-amber-800">Gestion cauris</span>
            <span className="text-[10px] text-amber-600">Ajoutez ou retirez des cauris aux membres.</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1.5">
              <button type="button" onClick={() => setCaurisOp('add')}
                className={`inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-black transition ${caurisOp === 'add' ? 'border-emerald-500 bg-emerald-600 text-white' : 'border-neutral-200 bg-white text-neutral-600 hover:border-emerald-300'}`}>
                <Plus size={12} /> Ajouter
              </button>
              <button type="button" onClick={() => setCaurisOp('remove')}
                className={`inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-black transition ${caurisOp === 'remove' ? 'border-red-500 bg-red-600 text-white' : 'border-neutral-200 bg-white text-neutral-600 hover:border-red-300'}`}>
                <Minus size={12} /> Retirer
              </button>
            </div>
            <input type="number" min="1" value={caurisAmt} onChange={e => setCaurisAmt(e.target.value)} placeholder="Montant (cauris)"
              className="h-8 w-36 min-w-0 rounded-xl border border-neutral-200 bg-white px-3 text-sm focus:border-amber-400 focus:outline-none" />
            <input type="text" value={caurisReason} onChange={e => setCaurisReason(e.target.value)} placeholder="Motif (optionnel)"
              className="h-8 min-w-[100px] flex-1 rounded-xl border border-neutral-200 bg-white px-3 text-sm focus:border-amber-400 focus:outline-none" />
          </div>
          {/* Appliquer — always visible on its own line on mobile */}
          <div className="mt-2 flex items-center gap-2">
            <button type="button" onClick={handleCaurisApply}
              disabled={checkedIds.size === 0 || !caurisAmt || parseInt(caurisAmt) < 1 || adjustCauris.isPending}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black text-white transition disabled:opacity-40 ${caurisOp === 'add' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
              {adjustCauris.isPending ? <Loader2 size={12} className="animate-spin" /> : caurisOp === 'add' ? <Plus size={12} /> : <Minus size={12} />}
              Appliquer{checkedIds.size > 0 ? ` (${checkedIds.size})` : ''}
            </button>
            {checkedIds.size === 0 && <span className="text-[11px] text-amber-600">Sélectionnez des membres dans le tableau ci-dessous.</span>}
          </div>
        </div>
      </div>

      {/* ── KPI CARDS (toggle via arrow) ─────────────────────── */}
      <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${showKpis ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="grid grid-cols-3 gap-2 pb-1 sm:grid-cols-6">
            {[
              { label: 'Total membres',         value: kpis.total,   cls: 'text-neutral-800', bg: 'bg-white border-neutral-100',          Icon: Users         },
              { label: 'Cotis. impayée',         value: kpis.unpaid,  cls: 'text-red-700',     bg: 'bg-red-50 border-red-100',             Icon: AlertTriangle },
              { label: 'Cotis. payée',           value: kpis.paid,    cls: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100',     Icon: CheckCircle2  },
              { label: 'En attente Inscription', value: kpis.pending, cls: 'text-yellow-700',  bg: 'bg-yellow-50 border-yellow-100',       Icon: Clock         },
              { label: 'Actifs',                 value: kpis.active,  cls: 'text-emerald-700', bg: 'bg-emerald-50/60 border-emerald-100',  Icon: CheckCircle2  },
              { label: 'Exempté',                value: kpis.exempt,  cls: 'text-neutral-500', bg: 'bg-neutral-50 border-neutral-200',     Icon: XCircle       },
            ].map(({ label, value, cls, bg, Icon }) => (
              <div key={label} className={`rounded-2xl border p-3 shadow-sm ${bg}`}>
                {isLoading ? <div className="h-7 w-8 animate-pulse rounded-lg bg-neutral-200" /> : <p className={`text-2xl font-black leading-none tracking-[-0.04em] ${cls}`}>{value}</p>}
                <p className="mt-1 text-[10px] font-semibold leading-tight text-neutral-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SEARCH + FILTERS + EXPORT ────────────────────────── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative w-full sm:flex-1 sm:min-w-[200px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input type="text" placeholder="Rechercher un membre…" value={search} onChange={e => setSearch(e.target.value)}
            className="h-9 w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-8 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10" />
          {search && (
            <button type="button" onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Filtre panel */}
          <div ref={filterRef} className="relative">
            <button type="button" onClick={() => setShowFilterPanel(v => !v)}
              className={`relative flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-bold transition-all sm:px-4 ${activeFilterCount > 0 ? 'border-emerald-500 bg-emerald-600 text-white' : 'border-neutral-200 bg-white text-neutral-600 hover:border-emerald-300 hover:text-emerald-700'}`}>
              <SlidersHorizontal size={13} /> Filtrer
              {activeFilterCount > 0 && <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-black text-emerald-700">{activeFilterCount}</span>}
            </button>
            {showFilterPanel && (
              <div className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-2xl ring-1 ring-black/5 sm:left-auto sm:right-0">
                <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
                  <span className="text-sm font-black text-neutral-900">Filtres</span>
                  <div className="flex items-center gap-2">
                    {activeFilterCount > 0 && <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className="text-[11px] font-bold text-emerald-700 hover:underline">Réinitialiser</button>}
                    <button type="button" onClick={() => setShowFilterPanel(false)} className="flex h-6 w-6 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100"><X size={13} /></button>
                  </div>
                </div>
                <div className="max-h-[70vh] divide-y divide-neutral-50 overflow-y-auto">
                  {/* Statut */}
                  <div className="px-4 py-3">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Statut</p>
                    <div className="space-y-1.5">
                      {([['active','Actif'],['pending','En attente'],['suspended','Suspendu']] as const).map(([val,lbl]) => {
                        const checked = filters.statut.includes(val); const cfg = statusConfig[val];
                        return (
                          <label key={val} className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 transition ${checked ? 'border-emerald-200 bg-emerald-50' : 'border-transparent hover:bg-neutral-50'}`}>
                            <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${checked ? 'border-emerald-600 bg-emerald-600' : 'border-neutral-300 bg-white'}`}>{checked && <CheckCircle2 size={10} className="text-white" />}</span>
                            <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleFilter('statut', val)} />
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black ${cfg.cls}`}><cfg.icon size={9} /> {lbl}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  {/* Cotisation */}
                  <div className="px-4 py-3">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Cotisation</p>
                    <div className="space-y-1.5">
                      {([['paid','Payée'],['unpaid','Impayée'],['exempt','Exempté']] as const).map(([val,lbl]) => {
                        const checked = filters.cotisation.includes(val); const cfg = cotisationConfig[val];
                        return (
                          <label key={val} className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 transition ${checked ? 'border-emerald-200 bg-emerald-50' : 'border-transparent hover:bg-neutral-50'}`}>
                            <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${checked ? 'border-emerald-600 bg-emerald-600' : 'border-neutral-300 bg-white'}`}>{checked && <CheckCircle2 size={10} className="text-white" />}</span>
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
                      {([['complete','Complet',profileConfig.complete.cls],['incomplete','Incomplet',profileConfig.incomplete.cls]] as const).map(([val,lbl,cls]) => {
                        const checked = filters.profil.includes(val);
                        return (
                          <label key={val} className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 transition ${checked ? 'border-emerald-200 bg-emerald-50' : 'border-transparent hover:bg-neutral-50'}`}>
                            <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${checked ? 'border-emerald-600 bg-emerald-600' : 'border-neutral-300 bg-white'}`}>{checked && <CheckCircle2 size={10} className="text-white" />}</span>
                            <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleFilter('profil', val)} />
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${cls}`}>{lbl}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  {/* Mois */}
                  <div className="px-4 py-3">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Inscription (mois)</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {MONTHS_FR.map((mois, idx) => {
                        const checked = filters.mois.includes(idx);
                        return (
                          <label key={idx} className={`flex cursor-pointer items-center justify-center rounded-lg border px-1 py-1.5 text-[11px] font-bold transition ${checked ? 'border-emerald-500 bg-emerald-600 text-white' : 'border-neutral-200 bg-white text-neutral-600 hover:border-emerald-300 hover:text-emerald-700'}`}>
                            <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleFilter('mois', idx)} />
                            {mois.slice(0,3)}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="border-t border-neutral-100 px-4 py-3">
                  <p className="text-xs text-neutral-500"><span className="font-black text-neutral-900">{displayed.length}</span> membre{displayed.length!==1?'s':''} correspondent{activeFilterCount>0&&<span> à {activeFilterCount} filtre{activeFilterCount>1?'s':''}</span>}</p>
                </div>
              </div>
            )}
          </div>

          {/* Filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-1">
              {filters.statut.map(v => <button key={v} type="button" onClick={() => toggleFilter('statut',v)} className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700 hover:bg-emerald-100">{statusConfig[v]?.label} <X size={9} /></button>)}
              {filters.cotisation.map(v => <button key={v} type="button" onClick={() => toggleFilter('cotisation',v)} className="flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-black text-blue-700 hover:bg-blue-100">{cotisationConfig[v]?.label} <X size={9} /></button>)}
              {filters.profil.map(v => <button key={v} type="button" onClick={() => toggleFilter('profil',v)} className="flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2 py-1 text-[10px] font-black text-violet-700 hover:bg-violet-100">Profil {v==='complete'?'complet':'incomplet'} <X size={9} /></button>)}
              {filters.mois.map(idx => <button key={idx} type="button" onClick={() => toggleFilter('mois',idx)} className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-black text-amber-700 hover:bg-amber-100">{MONTHS_FR[idx]} <X size={9} /></button>)}
            </div>
          )}

          {/* Export */}
          <button onClick={exportToCSV} disabled={displayed.length===0}
            className="flex h-9 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-bold text-neutral-600 transition-all hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4">
            <Download size={13} /> Exporter ({displayed.length})
          </button>
        </div>
      </div>

      {/* ── TABLE SECTION ────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
        {isLoading && <div className="flex items-center justify-center py-16"><Loader2 size={20} className="animate-spin text-emerald-600" /></div>}

        {!isLoading && (
          <div className={activeTab === 'cartes' ? 'lg:flex' : ''}>

            {/* Member list */}
            <div className={activeTab === 'cartes' ? 'min-w-0 flex-1 overflow-x-auto' : ''}>

              {/* ── Desktop table ──────────────────────────────── */}
              <div className="hidden lg:block">
                <table className="w-full table-fixed text-[11px]">
                  <colgroup>
                    <col className="w-[4%]" /><col className="w-[15%]" /><col className="w-[7%]" />
                    <col className="w-[14%]" /><col className="w-[8%]" /><col className="w-[7%]" />
                    <col className="w-[7%]" /><col className="w-[7%]" /><col className="w-[8%]" />
                    <col className="w-[9%]" /><col className="w-[9%]" />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-neutral-100 bg-neutral-50/60">
                      <th className="px-2 py-3">
                        <input type="checkbox" checked={allChecked} onChange={toggleAll} title={checkedIds.size > 0 ? `${checkedIds.size} sélectionné(s)` : 'Tout sélectionner'} className="h-3.5 w-3.5 rounded border-neutral-300 accent-orange-500" />
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
                    {displayed.map(m => {
                      const s  = statusConfig[m.memberStatus] ?? statusConfig.pending;
                      const SI = s.icon;
                      const cotisSts = activeTab === 'frais' ? (cotisStatusMap.get(m._id) ?? m.cotisationStatus) : m.cotisationStatus;
                      const c        = cotisationConfig[cotisSts] ?? cotisationConfig.unpaid;
                      const isConfirming = confirmDeleteId === m._id;
                      const photoUrl     = memberPhotoUrl(m);
                      const isChecked    = checkedIds.has(m._id);
                      const isCardActive = activeTab === 'cartes' && cardSelected?._id === m._id;
                      return (
                        <tr key={m._id}
                          className={`group transition-colors ${isCardActive ? 'bg-emerald-50' : isChecked ? 'bg-orange-50/40' : 'hover:bg-neutral-50/55'}`}
                          onClick={activeTab === 'cartes' ? () => setCardSelected(m) : undefined}
                          style={activeTab === 'cartes' ? { cursor: 'pointer' } : undefined}
                        >
                          <td className="px-2 py-3"><input type="checkbox" checked={isChecked} onChange={e => { e.stopPropagation(); toggleOne(m._id); }} onClick={e => e.stopPropagation()} className="h-3.5 w-3.5 rounded border-neutral-300 accent-orange-500" /></td>
                          <td className="px-3 py-3">
                            <div className="flex min-w-0 items-center gap-2">
                              <button type="button" onClick={e => { e.stopPropagation(); photoUrl && setPhotoPreview({ src: photoUrl, name: formatFullName(m.firstName, m.lastName) }); }} className="shrink-0">
                                {photoUrl
                                  // eslint-disable-next-line @next/next/no-img-element
                                  ? <img src={photoUrl} alt={formatFullName(m.firstName, m.lastName)} className={`h-7 w-7 rounded-full border-2 object-cover ${memberAvatarBorderClass(m.gender)}`} />
                                  : <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black text-white ${memberInitialsClass(m.gender)}`}>{formatInitials(m.firstName, m.lastName)}</div>
                                }
                              </button>
                              <Link href={`/admin/adherents/${m._id}`} onClick={e => e.stopPropagation()} className="min-w-0 truncate text-[11px] font-semibold text-neutral-900 transition hover:text-emerald-700">
                                {formatFullName(m.firstName, m.lastName)}
                              </Link>
                            </div>
                          </td>
                          <td className="px-2 py-3"><span className="font-mono text-[10px] text-neutral-500">{m.memberId}</span></td>
                          <td className="truncate px-2 py-3 text-[10px] text-neutral-500">{m.email}</td>
                          <td className="truncate px-2 py-3 text-[10px] text-neutral-500">{m.phone ?? <span className="text-neutral-300">—</span>}</td>
                          <td className="px-2 py-3">
                            <span className={`inline-flex max-w-full items-center gap-0.5 whitespace-nowrap rounded-full border px-1.5 py-0.5 text-[8px] font-black leading-none ${s.cls}`}>
                              <SI size={8} /><span className="truncate">{s.label}</span>
                            </span>
                          </td>
                          <td className="px-2 py-3">
                            {activeTab === 'frais' ? (
                              <select value={cotisSts} onChange={e => handleCotisChange(m._id, e.target.value as CotisationStatus)} onClick={e => e.stopPropagation()}
                                className={`cursor-pointer appearance-none rounded-lg px-1.5 py-0.5 text-[8px] font-black focus:outline-none ${c.cls}`}>
                                <option value="unpaid">Impayée</option>
                                <option value="paid">Payée</option>
                                <option value="exempt">Exempté</option>
                              </select>
                            ) : (
                              <span className={`inline-flex max-w-full items-center whitespace-nowrap rounded-full px-1.5 py-0.5 text-[8px] font-black leading-none ${c.cls}`}>{c.label}</span>
                            )}
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
                              {m.memberStatus === 'pending' && (
                                <button onClick={e => handleResend(e, m._id)} disabled={resendInvitation.isPending} title="Renvoyer l'invitation"
                                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-500 transition-all hover:bg-blue-500 hover:text-white disabled:opacity-40">
                                  {resendInvitation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Mail size={12} />}
                                </button>
                              )}
                              <Link href={`/admin/adherents/${m._id}`} onClick={e => e.stopPropagation()} className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-50 text-neutral-500 transition-all hover:bg-emerald-600 hover:text-white"><Eye size={13} /></Link>
                              <Link href={`/admin/adherents/nouveau?edit=${encodeURIComponent(m._id)}`} title="Modifier" onClick={e => e.stopPropagation()} className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-50 text-neutral-500 transition-all hover:bg-yellow-400 hover:text-neutral-950"><PencilLine size={13} /></Link>
                              {isSuperAdmin && (
                                isConfirming
                                  ? <button onClick={e => handleDeleteClick(e, m._id)} disabled={hardDelete.isPending} className="flex h-7 items-center gap-1 rounded-lg bg-red-500 px-2 text-[10px] font-black text-white hover:bg-red-600 disabled:opacity-50">{hardDelete.isPending ? <Loader2 size={11} className="animate-spin" /> : 'Confirmer'}</button>
                                  : <button onClick={e => handleDeleteClick(e, m._id)} title="Supprimer définitivement" className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-400 transition-all hover:bg-red-500 hover:text-white"><Trash2 size={12} /></button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ── Mobile header + cards ──────────────────────── */}
              <div className="lg:hidden">
                {/* Select-all header on mobile */}
                <div className="flex items-center gap-2 border-b border-neutral-100 bg-neutral-50/60 px-3 py-2">
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} title={`${checkedIds.size > 0 ? checkedIds.size + ' sélectionné(s)' : 'Tout sélectionner'}`}
                    className="h-3.5 w-3.5 rounded border-neutral-300 accent-orange-500" />
                  <span className="text-[9px] font-black uppercase tracking-[0.1em] text-neutral-400">
                    {checkedIds.size > 0 ? `${checkedIds.size} sélectionné${checkedIds.size > 1 ? 's' : ''}` : `${displayed.length} membre${displayed.length !== 1 ? 's' : ''}`}
                  </span>
                </div>
                <div className="divide-y divide-neutral-50">
                  {displayed.map(m => {
                    const s  = statusConfig[m.memberStatus] ?? statusConfig.pending;
                    const SI = s.icon;
                    const c  = cotisationConfig[m.cotisationStatus] ?? cotisationConfig.unpaid;
                    const isConfirming = confirmDeleteId === m._id;
                    const isExpanded   = expandedId === m._id;
                    const photoUrl     = memberPhotoUrl(m);
                    const isChecked    = checkedIds.has(m._id);
                    return (
                      <div key={m._id} className={`px-3 py-2.5 transition-colors hover:bg-neutral-50/60 sm:px-4 ${isChecked ? 'bg-orange-50/40' : ''}`}>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked={isChecked} onChange={() => toggleOne(m._id)} className="h-3.5 w-3.5 shrink-0 rounded border-neutral-300 accent-orange-500" />
                          <button type="button"
                            onClick={event => {
                              if ((event.target as HTMLElement).closest('[data-profile-photo]') && photoUrl) { setPhotoPreview({ src: photoUrl, name: formatFullName(m.firstName, m.lastName) }); return; }
                              if (activeTab === 'cartes') { setCardSelected(m); }
                              setExpandedId(isExpanded ? null : m._id);
                            }}
                            className="flex min-w-0 flex-1 items-center gap-2 text-left transition active:scale-[0.995]"
                          >
                            {photoUrl
                              // eslint-disable-next-line @next/next/no-img-element
                              ? <img data-profile-photo src={photoUrl} alt={formatFullName(m.firstName, m.lastName)} className={`h-8 w-8 shrink-0 rounded-2xl border-2 object-cover shadow-sm ${memberAvatarBorderClass(m.gender)}`} />
                              : <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl text-[9px] font-black text-white shadow-sm ${memberInitialsClass(m.gender)}`}>{formatInitials(m.firstName, m.lastName)}</div>
                            }
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[11px] font-black leading-tight text-neutral-900">{formatFullName(m.firstName, m.lastName)}</p>
                              <p className="truncate font-mono text-[9px] text-neutral-400">{m.memberId}</p>
                              <p className="truncate text-[9px] text-neutral-400">{m.email}</p>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-1">
                              <span className={`inline-flex items-center gap-0.5 whitespace-nowrap rounded-full border px-1.5 py-0.5 text-[7px] font-black leading-none ${s.cls}`}><SI size={7} /> {s.label}</span>
                              <span className={`inline-flex whitespace-nowrap rounded-full px-1.5 py-0.5 text-[7px] font-black leading-none ${c.cls}`}>{c.label}</span>
                              <span className={`inline-flex whitespace-nowrap rounded-full border px-1.5 py-0.5 text-[7px] font-black leading-none ${m.profileComplete ? profileConfig.complete.cls : profileConfig.incomplete.cls}`}>{m.profileComplete ? 'Complet' : 'Incomplet'}</span>
                            </div>
                            <ChevronDown size={13} className={`shrink-0 text-neutral-300 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-emerald-600' : ''}`} />
                          </button>
                        </div>
                        {/* Accordion */}
                        <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                          <div className="overflow-hidden">
                            <div className="mt-2 rounded-2xl border border-neutral-100 bg-neutral-50/80 p-2.5">
                              {activeTab === 'cartes' && cardSelected?._id === m._id && (
                                <div className="mb-3">
                                  <p className="mb-2 text-[9px] font-black uppercase tracking-[0.08em] text-emerald-800">Aperçu carte</p>
                                  <div ref={mobileCardRef} className="mx-auto w-full max-w-[300px]"><MemberCard member={toCardData(m)} /></div>
                                  <div className="mt-2 flex gap-2">
                                    <button type="button" onClick={handleCardDownload} className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-white text-[10px] font-bold text-emerald-700 transition hover:bg-emerald-50"><CreditCard size={11} /> Télécharger</button>
                                    <a href={memberCardMailto(m.email, formatFullName(m.firstName, m.lastName), m.memberId, m.cardVerifyToken)} className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-[10px] font-black text-white transition hover:bg-emerald-700">Envoyer email</a>
                                  </div>
                                </div>
                              )}
                              <div className="grid grid-cols-2 gap-2 text-[9px] text-neutral-500">
                                <div><p className="font-black uppercase tracking-[0.1em] text-neutral-300">Téléphone</p><p className="mt-0.5 truncate font-semibold text-neutral-700">{m.phone ?? 'Non renseigné'}</p></div>
                                <div><p className="font-black uppercase tracking-[0.1em] text-neutral-300">Connexion</p><p className="mt-0.5 truncate font-semibold text-neutral-700">{fmtDate(m.lastLoginAt)}</p></div>
                                <div><p className="font-black uppercase tracking-[0.1em] text-neutral-300">Inscription</p><p className="mt-0.5 truncate font-semibold text-neutral-700">{fmt(m.createdAt)}</p></div>
                                <div>
                                  <p className="font-black uppercase tracking-[0.1em] text-neutral-300">Actions</p>
                                  <div className="mt-1 flex items-center gap-1">
                                    {m.memberStatus === 'pending' && <button onClick={e => handleResend(e, m._id)} disabled={resendInvitation.isPending} className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-blue-500 transition hover:bg-blue-500 hover:text-white"><Mail size={10} /></button>}
                                    <Link href={`/admin/adherents/${m._id}`} className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition hover:bg-emerald-600 hover:text-white"><Eye size={10} /></Link>
                                    <Link href={`/admin/adherents/nouveau?edit=${encodeURIComponent(m._id)}`} className="flex h-6 w-6 items-center justify-center rounded-lg bg-yellow-50 text-yellow-700 transition hover:bg-yellow-400"><PencilLine size={10} /></Link>
                                    {isSuperAdmin && (isConfirming
                                      ? <button onClick={e => handleDeleteClick(e, m._id)} disabled={hardDelete.isPending} className="flex h-6 items-center gap-1 rounded-lg bg-red-500 px-1.5 text-[8px] font-black text-white">{hardDelete.isPending ? <Loader2 size={10} className="animate-spin" /> : 'OK?'}</button>
                                      : <button onClick={e => handleDeleteClick(e, m._id)} className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-50 text-red-400 transition hover:bg-red-500 hover:text-white"><Trash2 size={10} /></button>
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
              </div>

              {displayed.length === 0 && <div className="py-12 text-center"><p className="text-sm font-semibold text-neutral-400">Aucun membre trouvé</p></div>}
            </div>

            {/* ── Card aside — desktop cartes tab ───────────── */}
            {activeTab === 'cartes' && (
              <div className="hidden shrink-0 border-l border-neutral-100 lg:block lg:w-[380px]">
                <div className="sticky top-20 h-fit p-5">
                  {cardSelected ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-black text-neutral-900">Aperçu carte</p>
                        <span className="font-mono text-xs text-neutral-400">{cardSelected.memberId}</span>
                      </div>
                      <div ref={desktopCardRef} className="mx-auto w-full max-w-[340px]"><MemberCard member={toCardData(cardSelected)} /></div>
                      <div className="flex gap-2 pt-1">
                        <button type="button" onClick={handleCardDownload} className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600 transition hover:border-neutral-300 hover:bg-neutral-50"><CreditCard size={13} /> Télécharger</button>
                        <a href={memberCardMailto(cardSelected.email, formatFullName(cardSelected.firstName, cardSelected.lastName), cardSelected.memberId, cardSelected.cardVerifyToken)} className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-xs font-black text-white transition hover:bg-emerald-700">Envoyer email</a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 text-center">
                      <CreditCard size={36} className="text-neutral-200" />
                      <div><p className="text-sm font-semibold text-neutral-400">Sélectionnez un membre</p><p className="mt-0.5 text-xs text-neutral-300">pour prévisualiser sa carte</p></div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>

    {/* ── OVERLAYS ─────────────────────────────────────────── */}
    {photoPreview && <ControlledAvatarDialog src={photoPreview.src} alt={photoPreview.name} onClose={() => setPhotoPreview(null)} />}
    {confirmModal && (
      <ConfirmSendModal title={confirmModal.title} message={confirmModal.message}
        onConfirm={() => { confirmModal.onConfirm(); setConfirmModal(null); }}
        onClose={() => setConfirmModal(null)} />
    )}
    {showActPicker && (
      <ActivityPickerModal activities={activities}
        onSelect={a => { setSelectedAct(a); setShowActPicker(false); }}
        onClose={() => { setShowActPicker(false); if (!selectedAct) setRelanceSub(null); }} />
    )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════
   CONFIRM SEND MODAL
══════════════════════════════════════════════════════════ */
function ConfirmSendModal({ title, message, onConfirm, onClose }: { title: string; message: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <div className="border-b border-neutral-100 px-5 py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">Confirmation</p>
          <h2 className="mt-0.5 text-base font-black text-neutral-900">{title}</h2>
        </div>
        <div className="px-5 py-4"><p className="text-sm leading-relaxed text-neutral-600">{message}</p></div>
        <div className="flex gap-2 border-t border-neutral-100 px-5 py-4">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-bold text-neutral-600 transition hover:bg-neutral-50">Non, annuler</button>
          <button type="button" onClick={onConfirm} className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-black text-white transition hover:bg-emerald-700">Oui, confirmer</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ACTIVITY PICKER MODAL
══════════════════════════════════════════════════════════ */
function ActivityPickerModal({ activities, onSelect, onClose }: { activities: ActivityDoc[]; onSelect: (a: ActivityDoc) => void; onClose: () => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const withInvitees = activities.filter(a => (a.invitationSummary?.total ?? 0) > 0);
  const pickedActivity = withInvitees.find(a => a._id === picked) ?? null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">Relance présence</p>
            <h2 className="text-base font-black text-neutral-900">Choisir une activité</h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100"><X size={15} /></button>
        </div>
        <div className="max-h-[55vh] divide-y divide-neutral-50 overflow-y-auto">
          {withInvitees.length === 0 && <p className="py-10 text-center text-sm text-neutral-400">Aucune activité avec invités disponible.</p>}
          {withInvitees.map(a => {
            const isChecked = picked === a._id;
            return (
              <button key={a._id} type="button" onClick={() => setPicked(isChecked ? null : a._id)}
                className={`flex w-full items-center gap-3 px-5 py-3.5 text-left transition ${isChecked ? 'bg-orange-50' : 'hover:bg-neutral-50'}`}>
                {/* Radio-style checkbox */}
                <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition ${isChecked ? 'border-orange-500 bg-orange-500' : 'border-neutral-300 bg-white'}`}>
                  {isChecked && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-neutral-900">{a.title}</p>
                  {a.startDate && <p className="text-[11px] text-neutral-400">{new Date(a.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })}</p>}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[11px] font-semibold text-orange-600">{a.invitationSummary?.total ?? 0} invités</p>
                  <p className="text-[10px] text-neutral-300">{a.invitationSummary?.pending ?? 0} en attente</p>
                </div>
              </button>
            );
          })}
        </div>
        <div className="flex gap-2 border-t border-neutral-100 px-5 py-4">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-bold text-neutral-600 transition hover:bg-neutral-50">Annuler</button>
          <button type="button" onClick={() => pickedActivity && onSelect(pickedActivity)} disabled={!picked}
            className="flex-1 rounded-xl bg-orange-600 py-2.5 text-sm font-black text-white transition hover:bg-orange-700 disabled:opacity-40">
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}
