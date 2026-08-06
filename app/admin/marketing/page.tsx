'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Gift, X, Search, Image as ImageIcon, Loader2, Send, Users, CheckSquare, Square, Calendar, Package, BarChart3, Eye, MousePointerClick, Smartphone, Tablet, Monitor, HelpCircle, ChevronDown, Plus, Pencil, Trash2, AlertTriangle, Mail, MapPin } from 'lucide-react';
import { useAdminCampaigns, useCreateCampaign, useUpdateCampaign, useDeleteCampaign, useUploadCampaignImage, useCampaignInsights, useCampaignGiftRewardedMembers, useMarketingEmailInsights, type CampaignDoc, type MarketingEmailEvent, type MarketingEmailInsightRow } from '@/lib/api/marketing';
import { useAdminMembers, type MemberListItem } from '@/lib/api/members';
import { MemberFilterPanel, EMPTY_MEMBER_FILTERS, memberMatchesFilters, type MemberFilters } from '@/components/admin/MemberFilterPanel';
import { formatFullName } from '@/lib/format-name';
import { useAuthStore } from '@/store/auth.store';

const INSIGHTS_ALLOWED_EMAIL = 'salamcameroun237@gmail.com';

const DEVICE_ICON: Record<string, React.ElementType> = {
  mobile: Smartphone, tablet: Tablet, desktop: Monitor, unknown: HelpCircle,
};

function fmtDateTime(d?: string | null) {
  if (!d) return '—';
  // Format jj/mm/aaaa hh:mm (gardez l'heure pour l'historique)
  return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function normalizeName(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ─── Section accordéon (mobile/tablette) ───────────────────
   Même pattern que les sections de filtres pliables d'Adhérents : bouton
   header (contenu libre) + chevron qui pivote + contenu en grid-rows
   0fr/1fr pour l'animation d'ouverture/fermeture. */
function SectionAccordion({ header, children, defaultOpen = false }: {
  header: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-neutral-50/60 sm:px-5">
        <div className="min-w-0 flex-1">{header}</div>
        <ChevronDown size={14} className={`shrink-0 text-neutral-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

/* ─── Éditeur de campagne "Cadeau SALAM" ────────────────────
   Objet + cadeau + nombre de colis + date limite + image optionnelle +
   sélection des destinataires (recherche + case à cocher + tout sélectionner,
   même logique que le sélecteur de destinataires en facturation). */
function CampaignEditorModal({ onClose, campaign }: { onClose: () => void; campaign?: CampaignDoc | null }) {
  const isEditing = Boolean(campaign);
  const [title, setTitle] = useState(campaign?.title ?? '🎁 Offre spéciale SALAM — Cadeau exclusif');
  const [giftName, setGiftName] = useState(campaign?.giftName ?? '15 000 Cauris');
  const [packageCount, setPackageCount] = useState(campaign?.packageCount ?? 0);
  const [cauriAmount, setCauriAmount] = useState(campaign?.cauriAmount ?? 15000);
  const [deadline, setDeadline] = useState(campaign?.deadline ? campaign.deadline.slice(0, 10) : '2026-07-20');
  const [imageUrl, setImageUrl] = useState<string | undefined>(campaign?.imageUrl);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberFilters, setMemberFilters] = useState<MemberFilters>(EMPTY_MEMBER_FILTERS);
  const [selected, setSelected] = useState<string[]>((campaign?.recipients ?? []).map(r => r.userId));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: membersData, isLoading: membersLoading } = useAdminMembers({ limit: 500 });
  const members: MemberListItem[] = membersData?.data?.data ?? [];
  const uploadImage = useUploadCampaignImage();
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();

  const { data: rewardedData } = useCampaignGiftRewardedMembers();
  /* Un membre déjà crédité pour "Cadeau SALAM" (toutes campagnes de ce type
     confondues, voir hasReceivedCampaignGift côté backend) ne doit plus
     jamais pouvoir être resélectionné comme destinataire. */
  const rewardedIds = useMemo(() => new Set((rewardedData?.data ?? []).map(r => r.userId)), [rewardedData]);
  const selectableMembers = useMemo(() => members.filter(m => !rewardedIds.has(m._id) || selected.includes(m._id)), [members, rewardedIds, selected]);
  const excludedCount = members.filter(m => rewardedIds.has(m._id) && !selected.includes(m._id)).length;

  const filteredMembers = useMemo(() => {
    const q = normalizeName(memberSearch.trim());
    return selectableMembers.filter(m =>
      (!q || normalizeName(`${m.firstName} ${m.lastName} ${m.email ?? ''}`).includes(q))
      && memberMatchesFilters(m, memberFilters));
  }, [selectableMembers, memberSearch, memberFilters]);

  const allFilteredSelected = filteredMembers.length > 0 && filteredMembers.every(m => selected.includes(m._id));

  const toggleMember = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelected(prev => prev.filter(id => !filteredMembers.some(m => m._id === id)));
      return;
    }
    setSelected(prev => [...new Set([...prev, ...filteredMembers.map(m => m._id)])]);
  };

  const handleImagePick = (file?: File | null) => {
    if (!file) return;
    uploadImage.mutate(file, {
      onSuccess: res => setImageUrl(res.data.imageUrl),
    });
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = "L'objet du mail est requis";
    if (!giftName.trim()) next.giftName = 'Le cadeau est requis';
    if (!deadline) next.deadline = 'Date limite requise';
    if (selected.length === 0) next.recipients = 'Sélectionnez au moins un destinataire';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSend = () => {
    if (!validate()) return;
    const body = {
      title: title.trim(),
      giftName: giftName.trim(),
      packageCount: Math.max(0, Number(packageCount ?? 0)),
      cauriAmount: Math.max(1, Number(cauriAmount ?? 0)),
      deadline: new Date(deadline).toISOString(),
      imageUrl,
      recipientIds: selected,
    };
    if (isEditing && campaign) {
      updateCampaign.mutate({ id: campaign._id, body }, { onSuccess: () => onClose() });
      return;
    }
    createCampaign.mutate(body, { onSuccess: () => onClose() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200">
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600"><Gift size={17} /></span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-rose-600">Campagne marketing</p>
              <h3 className="text-lg font-black text-neutral-900">{isEditing ? 'Modifier la campagne' : 'Cadeau SALAM'}</h3>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100"><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.1em] text-neutral-500">Objet du mail</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              className={`h-11 w-full rounded-xl border px-3.5 text-sm outline-none focus:ring-2 focus:ring-rose-500/20 ${errors.title ? 'border-red-300' : 'border-neutral-200 focus:border-rose-400'}`} />
            {errors.title && <p className="mt-1 text-xs font-semibold text-red-600">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.1em] text-neutral-500">Cadeau</label>
              <input value={giftName} onChange={e => setGiftName(e.target.value)} placeholder="ex. 15 000 Cauris"
                className={`h-11 w-full rounded-xl border px-3.5 text-sm outline-none focus:ring-2 focus:ring-rose-500/20 ${errors.giftName ? 'border-red-300' : 'border-neutral-200 focus:border-rose-400'}`} />
              {errors.giftName && <p className="mt-1 text-xs font-semibold text-red-600">{errors.giftName}</p>}
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.1em] text-neutral-500"><Package size={12} /> Nombre de colis</label>
              <input type="number" min={0} value={packageCount} onChange={e => setPackageCount(Number(e.target.value))}
                className="h-11 w-full rounded-xl border border-neutral-200 px-3.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.1em] text-neutral-500">Cauris à créditer automatiquement</label>
            <input type="number" min={1} value={cauriAmount} onChange={e => setCauriAmount(Number(e.target.value))}
              className="h-11 w-full rounded-xl border border-neutral-200 px-3.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20" />
            <p className="mt-1 text-[11px] text-neutral-400">
              Crédité automatiquement dès qu&apos;un destinataire est inscrit ET a un profil complet à 100%, avant la date limite. Historique cauris : «&nbsp;Cadeau promotion &quot;Inscription et profil complet&quot;&nbsp;».
            </p>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.1em] text-neutral-500"><Calendar size={12} /> Date limite de la campagne</label>
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
              className={`h-11 w-full rounded-xl border px-3.5 text-sm outline-none focus:ring-2 focus:ring-rose-500/20 ${errors.deadline ? 'border-red-300' : 'border-neutral-200 focus:border-rose-400'}`} />
            {errors.deadline && <p className="mt-1 text-xs font-semibold text-red-600">{errors.deadline}</p>}
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.1em] text-neutral-500"><ImageIcon size={12} /> Image (optionnel)</label>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleImagePick(e.target.files?.[0])} />
            {imageUrl ? (
              <div className="flex items-center gap-3 rounded-xl border border-neutral-200 p-2">
                <img src={imageUrl} alt="Aperçu" className="h-16 w-16 rounded-lg object-cover" />
                <button type="button" onClick={() => setImageUrl(undefined)} className="text-xs font-black text-red-600 hover:underline">Retirer</button>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadImage.isPending}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 text-sm font-semibold text-neutral-500 hover:border-rose-300 hover:text-rose-600">
                {uploadImage.isPending ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                {uploadImage.isPending ? 'Téléversement…' : 'Ajouter une image'}
              </button>
            )}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.1em] text-neutral-500"><Users size={12} /> Destinataires — {selected.length} sélectionné{selected.length > 1 ? 's' : ''}</label>
              <button type="button" onClick={toggleSelectAll} className="flex items-center gap-1 text-xs font-black text-rose-600 hover:underline">
                {allFilteredSelected ? <CheckSquare size={13} /> : <Square size={13} />} Tout {allFilteredSelected ? 'désélectionner' : 'sélectionner'}
              </button>
            </div>
            <div className="relative mb-2">
              <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input value={memberSearch} onChange={e => setMemberSearch(e.target.value)} placeholder="Rechercher un membre…"
                className="h-9 w-full rounded-lg border border-neutral-200 pl-8 pr-3 text-sm outline-none focus:border-rose-400" />
            </div>
            <div className="mb-2">
              <MemberFilterPanel filters={memberFilters} onChange={setMemberFilters} />
            </div>
            {errors.recipients && <p className="mb-2 text-xs font-semibold text-red-600">{errors.recipients}</p>}
            {excludedCount > 0 && (
              <p className="mb-2 text-[11px] font-semibold text-emerald-700">{excludedCount} membre{excludedCount > 1 ? 's' : ''} déjà récompensé{excludedCount > 1 ? 's' : ''} — exclu{excludedCount > 1 ? 's' : ''} automatiquement de cette liste.</p>
            )}
            <div className="max-h-56 overflow-y-auto rounded-xl border border-neutral-200">
              {membersLoading && <p className="p-4 text-center text-sm text-neutral-400">Chargement…</p>}
              {!membersLoading && filteredMembers.length === 0 && <p className="p-4 text-center text-sm text-neutral-400">Aucun membre trouvé.</p>}
              {filteredMembers.map(m => {
                const checked = selected.includes(m._id);
                return (
                  <label key={m._id} className={`flex cursor-pointer items-center gap-2.5 border-b border-neutral-50 px-3 py-2 last:border-0 ${checked ? 'bg-rose-50/60' : 'hover:bg-neutral-50'}`}>
                    <input type="checkbox" checked={checked} onChange={() => toggleMember(m._id)} className="h-4 w-4 accent-rose-600" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-neutral-900">{formatFullName(m.firstName, m.lastName)}</p>
                      <p className="truncate text-[11px] text-neutral-400">{m.email}{m.memberStatus === 'pending' ? ' · Inscription non finalisée' : ''}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-neutral-100 px-6 py-4">
          <button onClick={onClose} className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-600 hover:border-neutral-300">Annuler</button>
          <button onClick={handleSend} disabled={createCampaign.isPending || updateCampaign.isPending}
            className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-rose-700 active:scale-[0.98] disabled:opacity-60">
            {(createCampaign.isPending || updateCampaign.isPending) ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {isEditing ? 'Enregistrer' : 'Envoyer la campagne'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Historique des bénéficiaires "Cadeau SALAM" ───────────
   Affiché à droite du bloc de lancement de campagne : liste des membres
   ayant déjà validé et reçu le cadeau, toutes campagnes de ce type
   confondues. Ces membres sont aussi exclus du sélecteur de destinataires
   (voir CampaignEditorModal) pour qu'ils ne puissent plus être renvoyés. */
function RewardedMembersList() {
  const { data, isLoading } = useCampaignGiftRewardedMembers();
  const rewarded = data?.data ?? [];

  return (
    <div className="max-h-48 overflow-y-auto">
      {isLoading && <p className="py-3 text-center text-xs text-emerald-700/60">Chargement…</p>}
      {!isLoading && rewarded.length === 0 && (
        <p className="py-3 text-center text-xs text-emerald-700/60">Aucun bénéficiaire pour le moment.</p>
      )}
      <div className="divide-y divide-emerald-100/70">
        {rewarded.map(r => (
          <div key={r.userId} className="flex items-center justify-between gap-2 py-1.5">
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-emerald-900">{formatFullName(r.firstName, r.lastName)}</p>
              <p className="truncate text-[10px] text-emerald-700/70">{fmtDateTime(r.creditedAt)}</p>
            </div>
            <span className="shrink-0 text-[11px] font-black text-emerald-700">{r.amount.toLocaleString('fr-FR')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RewardedMembersPanel() {
  const { data } = useCampaignGiftRewardedMembers();
  const rewarded = data?.data ?? [];

  return (
    <div>
      <h2 className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-neutral-500">Historique des bénéficiaires</h2>
      <div className="flex flex-col gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white"><Gift size={18} /></span>
          <div>
            <p className="text-sm font-black text-emerald-800">Déjà récompensés</p>
            <p className="text-xs font-semibold text-emerald-600/80">{rewarded.length} membre{rewarded.length > 1 ? 's' : ''} — ne peuvent plus être sélectionnés</p>
          </div>
        </div>
        <div className="mt-1"><RewardedMembersList /></div>
      </div>
    </div>
  );
}

/* Header de l'accordéon mobile/tablette — mêmes 3 lignes que le panneau
   desktop (label de section, titre, compteur), toujours visibles ; la liste
   elle-même va dans la partie déroulante (RewardedMembersList). */
function RewardedAccordionHeader() {
  const { data } = useCampaignGiftRewardedMembers();
  const rewarded = data?.data ?? [];
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white"><Gift size={15} /></span>
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-neutral-400">Historique des bénéficiaires</p>
        <p className="text-sm font-black text-emerald-800">Déjà récompensés</p>
        <p className="truncate text-xs font-semibold text-emerald-600/80">{rewarded.length} membre{rewarded.length > 1 ? 's' : ''} — ne peuvent plus être sélectionnés</p>
      </div>
    </div>
  );
}

function CampaignHistoryRow({ campaign, onView, onEdit, onDelete, deleting = false }: {
  campaign: CampaignDoc;
  onView: (campaign: CampaignDoc) => void;
  onEdit: (campaign: CampaignDoc) => void;
  onDelete: (campaign: CampaignDoc) => void;
  deleting?: boolean;
}) {
  const creditedNow = (campaign.recipients ?? []).filter(r => r.giftCreditedImmediately).length;
  return (
    <div className="flex items-center gap-3 px-4 py-4 sm:px-5">
      <button type="button" onClick={() => onView(campaign)}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left transition hover:bg-neutral-50 sm:gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 border border-rose-100">
          <Gift size={16} className="text-rose-600" />
        </span>
        <span className="min-w-0 flex-1 py-1">
          <span className="block truncate text-sm font-black text-neutral-900">{campaign.title}</span>
          <span className="mt-0.5 block text-[11px] text-neutral-400">
            {campaign.giftName} · Échéance {fmt(campaign.deadline)} · {(campaign.recipients ?? []).length} destinataire{(campaign.recipients ?? []).length > 1 ? 's' : ''}
          </span>
          {creditedNow > 0 && (
            <span className="mt-0.5 block text-[11px] font-semibold text-emerald-600">{creditedNow} déjà crédité{creditedNow > 1 ? 's' : ''} immédiatement</span>
          )}
        </span>
        <span className="hidden shrink-0 text-right sm:block">
          <span className="block text-sm font-black text-emerald-700">{campaign.sentCount} envoyé{campaign.sentCount > 1 ? 's' : ''}</span>
          {campaign.failedCount > 0 && <span className="block text-[11px] font-semibold text-red-600">{campaign.failedCount} échec{campaign.failedCount > 1 ? 's' : ''}</span>}
        </span>
      </button>
      <div className="flex shrink-0 items-center gap-1">
        <button type="button" onClick={() => onView(campaign)} title="Voir" className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"><Eye size={13} /></button>
        <button type="button" onClick={() => onEdit(campaign)} title="Modifier" className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"><Pencil size={13} /></button>
        <button type="button" onClick={() => onDelete(campaign)} disabled={deleting} title="Supprimer" className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-500 transition hover:border-red-300 hover:bg-red-50 disabled:opacity-50">{deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}</button>
      </div>
    </div>
  );
}

function CampaignViewModal({ campaign, onClose }: { campaign: CampaignDoc; onClose: () => void }) {
  const creditedNow = (campaign.recipients ?? []).filter(r => r.giftCreditedImmediately).length;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200">
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600"><Eye size={17} /></span>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-rose-600">Visualisation campagne</p>
              <h3 className="truncate text-lg font-black text-neutral-900">{campaign.title}</h3>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100"><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <div className="space-y-4">
              {campaign.imageUrl && <img src={campaign.imageUrl} alt="Campagne" className="max-h-64 w-full rounded-2xl border border-neutral-100 object-cover" />}
              <div className="rounded-2xl border border-neutral-100 bg-neutral-50/70 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-neutral-400">Détails</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <p className="text-sm font-semibold text-neutral-700"><span className="block text-[10px] font-black uppercase text-neutral-400">Cadeau</span>{campaign.giftName}</p>
                  <p className="text-sm font-semibold text-neutral-700"><span className="block text-[10px] font-black uppercase text-neutral-400">Cauris</span>{campaign.cauriAmount.toLocaleString('fr-FR')}</p>
                  <p className="text-sm font-semibold text-neutral-700"><span className="block text-[10px] font-black uppercase text-neutral-400">Colis</span>{campaign.packageCount.toLocaleString('fr-FR')}</p>
                  <p className="text-sm font-semibold text-neutral-700"><span className="block text-[10px] font-black uppercase text-neutral-400">Échéance</span>{fmt(campaign.deadline)}</p>
                  <p className="text-sm font-semibold text-emerald-700"><span className="block text-[10px] font-black uppercase text-neutral-400">Envoyés</span>{campaign.sentCount.toLocaleString('fr-FR')}</p>
                  <p className="text-sm font-semibold text-red-600"><span className="block text-[10px] font-black uppercase text-neutral-400">Échecs</span>{campaign.failedCount.toLocaleString('fr-FR')}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-neutral-400">Historique des bénéficiaires</p>
                <p className="mt-1 text-sm font-black text-emerald-800">{creditedNow} bénéficiaire{creditedNow > 1 ? 's' : ''} crédité{creditedNow > 1 ? 's' : ''} sur cette campagne</p>
                <div className="mt-3"><RewardedMembersList /></div>
              </div>
            </div>
            <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm">
              <div className="border-b border-neutral-100 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-neutral-400">Historique des campagnes</p>
                <p className="text-sm font-black text-neutral-900">Destinataires de cette campagne</p>
              </div>
              <div className="max-h-[420px] divide-y divide-neutral-50 overflow-y-auto">
                {(campaign.recipients ?? []).length === 0 && <p className="px-4 py-8 text-center text-sm text-neutral-400">Aucun destinataire.</p>}
                {(campaign.recipients ?? []).map(r => (
                  <div key={r.userId} className="px-4 py-3">
                    <p className="truncate text-xs font-black text-neutral-900">{r.email}</p>
                    <p className={`mt-0.5 text-[11px] font-semibold ${r.status === 'sent' ? 'text-emerald-600' : 'text-red-600'}`}>{r.status === 'sent' ? 'Envoyé' : r.reason ?? 'Échec'}</p>
                    {r.giftCreditedImmediately && <p className="mt-0.5 text-[11px] font-semibold text-emerald-700">Crédité immédiatement</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
/* ─── Insights de campagne (accès strictement réservé) ──────
   Backend refait la même vérification d'email — cette restriction frontend
   n'est qu'une commodité d'affichage, jamais la seule protection. */

function TextSearchBox({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <div className="relative w-full sm:max-w-sm">
      <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-8 pr-9 text-xs font-semibold text-neutral-700 outline-none transition placeholder:text-neutral-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/15 sm:text-sm" />
      {value && (
        <button type="button" onClick={() => onChange('')} className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700">
          <X size={12} />
        </button>
      )}
    </div>
  );
}

function matchesMemberFilters(userId: string | null | undefined, memberMap: Map<string, MemberListItem>, filters: MemberFilters) {
  const hasFilters = Object.values(filters).some(values => values.length > 0);
  if (!hasFilters) return true;
  if (!userId) return false;
  const member = memberMap.get(userId);
  return member ? memberMatchesFilters(member, filters) : false;
}

function CampaignInsightsView({ campaigns }: { campaigns: CampaignDoc[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(campaigns[0]?._id ?? null);
  const [search, setSearch] = useState('');
  const [memberFilters, setMemberFilters] = useState<MemberFilters>(EMPTY_MEMBER_FILTERS);
  const { data, isLoading, isError } = useCampaignInsights(selectedId);
  const { data: membersData } = useAdminMembers({ limit: 500 });
  const members = membersData?.data?.data ?? [];
  const memberMap = useMemo(() => new Map(members.map(m => [m._id, m])), [members]);
  const insights = data?.data;
  const filteredInsightRecipients = useMemo(() => {
    const q = normalizeName(search.trim());
    const source = insights?.recipients ?? [];
    return source.filter(r => {
      const haystack = normalizeName([r.firstName, r.lastName, r.email].join(' '));
      return (!q || haystack.includes(q)) && matchesMemberFilters(r.userId, memberMap, memberFilters);
    });
  }, [insights, search, memberMap, memberFilters]);

  useEffect(() => {
    if (campaigns.length > 0 && (!selectedId || !campaigns.some(c => c._id === selectedId))) {
      setSelectedId(campaigns[0]._id);
    }
  }, [campaigns, selectedId]);

  if (campaigns.length === 0) {
    return <p className="rounded-2xl border border-neutral-100 bg-white px-5 py-8 text-center text-sm text-neutral-400">Aucune campagne à analyser.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm lg:flex-row lg:items-start lg:justify-between">
        <select value={selectedId ?? ''} onChange={e => setSelectedId(e.target.value)}
          className="h-10 w-full rounded-xl border border-neutral-200 px-3 text-sm font-semibold outline-none focus:border-rose-400 lg:w-[340px]">
          {campaigns.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
        </select>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <TextSearchBox value={search} onChange={setSearch} placeholder="Rechercher un membre..." />
          <MemberFilterPanel filters={memberFilters} onChange={setMemberFilters} />
        </div>
      </div>

      {isLoading && <p className="py-8 text-center text-sm text-neutral-400">Chargement…</p>}
      {isError && <p className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-center text-sm text-red-600">Accès refusé ou erreur de chargement.</p>}

      {insights && (
        <div className="hidden rounded-2xl border border-neutral-100 bg-white shadow-sm lg:block">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/60 text-left text-[11px] font-black uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-3">Membre</th>
                <th className="px-4 py-3">Ouvertures</th>
                <th className="px-4 py-3">Clic (date/heure)</th>
                <th className="px-4 py-3 text-center">Appareil</th>
                <th className="px-4 py-3">Cadeau</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {filteredInsightRecipients.map(r => {
                /* Historique complet de chaque ouverture/clic, avec sa propre date/heure —
                   jamais un simple agrégat "dernier événement" qui ferait disparaître les
                   précédents. Pareil pour l'appareil : chaque événement (ouverture OU clic)
                   garde son propre type d'appareil détecté, un nouveau n'écrase jamais un
                   autre déjà détecté. */
                const deviceEvents = [...r.opens, ...r.clicks].sort(
                  (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
                );
                return (
                  <tr key={r.userId}>
                    <td className="px-4 py-3">
                      <p className="font-black text-neutral-900">{formatFullName(r.firstName, r.lastName)}</p>
                      <p className="text-[11px] text-neutral-400">{r.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      {r.opens.length > 0 ? (
                        <div className="space-y-1.5">
                          {r.opens.map((o, i) => (
                            <p key={i} className="flex items-center gap-1 whitespace-nowrap">
                              <Eye size={12} className="shrink-0 text-emerald-600" />
                              <span className="text-[11px] text-neutral-400">{fmtDateTime(o.occurredAt)}</span>
                            </p>
                          ))}
                        </div>
                      ) : <span className="text-neutral-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {r.clicks.length > 0 ? (
                        <div className="space-y-1.5">
                          {r.clicks.map((c, i) => (
                            <p key={i} className="flex items-center gap-1 whitespace-nowrap">
                              <MousePointerClick size={12} className="shrink-0 text-violet-600" />
                              <span className="text-[11px] text-neutral-400">{fmtDateTime(c.occurredAt)}</span>
                            </p>
                          ))}
                        </div>
                      ) : <span className="text-neutral-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {deviceEvents.length > 0 ? (
                        <div className="flex flex-col items-center gap-1.5">
                          {deviceEvents.map((e, i) => {
                            const DeviceIcon = DEVICE_ICON[e.deviceType ?? 'unknown'] ?? HelpCircle;
                            return (
                              <p key={i} className="flex items-center justify-center gap-1 whitespace-nowrap text-[11px] text-neutral-400">
                                <DeviceIcon size={12} className="shrink-0" /> {e.deviceType}
                              </p>
                            );
                          })}
                        </div>
                      ) : <span className="text-neutral-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {r.giftCreditedImmediately
                        ? <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-black text-emerald-700">Crédité immédiatement</span>
                        : <span className="text-neutral-300 text-[11px]">En attente</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Mobile/tablette : un accordéon par destinataire ──────
          Header = colonne Membre (mêmes tailles que le nom/email des cartes
          Adhérents) ; le reste (ouvertures/clic/appareil/cadeau) va dans la
          partie déroulante, avec les mêmes tailles de police que le corps
          des accordéons Adhérents (label text-[9px] uppercase + valeur
          font-semibold text-neutral-700). */}
      {insights && (
        <div className="space-y-2 lg:hidden">
          {filteredInsightRecipients.map(r => {
            const deviceEvents = [...r.opens, ...r.clicks].sort(
              (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
            );
            return (
              <SectionAccordion key={r.userId}
                header={
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-black leading-tight text-neutral-900">{formatFullName(r.firstName, r.lastName)}</p>
                      <p className="truncate text-[9px] text-neutral-400">{r.email}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end">
                      <p className="text-[9px] font-black uppercase tracking-[0.08em] text-neutral-300">Cadeau</p>
                      <p className="truncate text-[9px] text-neutral-400">{r.giftCreditedImmediately ? 'Crédité immédiatement' : 'En attente'}</p>
                    </div>
                  </div>
                }
              >
                <div className="mx-3 mb-3 rounded-2xl border border-neutral-100 bg-neutral-50/80 p-2.5 text-neutral-500 sm:mx-4 sm:mb-4 grid grid-cols-3 gap-2.5 text-[7px]">
                  <div>
                    <p className="mb-1 font-black uppercase tracking-[0.06em] text-neutral-300">Ouvertures</p>
                    {r.opens.length > 0 ? r.opens.map((o, i) => (
                      <p key={i} className="mt-0.5 flex items-center gap-1 font-semibold text-neutral-700 whitespace-nowrap text-[9px]"><Eye size={12} className="shrink-0 text-emerald-600" /> {fmtDateTime(o.occurredAt)}</p>
                    )) : <p className="mt-0.5 text-neutral-300 text-[9px]">—</p>}
                  </div>
                  <div>
                    <p className="mb-1 font-black uppercase tracking-[0.06em] text-neutral-300">Clic</p>
                    {r.clicks.length > 0 ? r.clicks.map((c, i) => (
                      <p key={i} className="mt-0.5 flex items-center gap-1 font-semibold text-neutral-700 whitespace-nowrap text-[9px]"><MousePointerClick size={12} className="shrink-0 text-violet-600" /> {fmtDateTime(c.occurredAt)}</p>
                    )) : <p className="mt-0.5 text-neutral-300 text-[9px]">—</p>}
                  </div>
                  <div>
                    <p className="mb-1 font-black uppercase tracking-[0.06em] text-neutral-300">Appareil</p>
                    {deviceEvents.length > 0 ? deviceEvents.map((e, i) => {
                      const DeviceIcon = DEVICE_ICON[e.deviceType ?? 'unknown'] ?? HelpCircle;
                      return <p key={i} className="mt-0.5 flex items-center gap-1 font-semibold text-neutral-700 whitespace-nowrap text-[9px]"><DeviceIcon size={12} className="shrink-0" /> {e.deviceType}</p>;
                    }) : <p className="mt-0.5 text-neutral-300 text-[9px]">—</p>}
                  </div>
                </div>
              </SectionAccordion>
            );
          })}
        </div>
      )}
    </div>
  );
}

function eventLocation(event: MarketingEmailEvent) {
  return event.location || event.countryCode || event.ip || null;
}

function EmailEventList({ events, type }: { events: MarketingEmailEvent[]; type: 'open' | 'click' }) {
  const Icon = type === 'open' ? Eye : MousePointerClick;
  const color = type === 'open' ? 'text-emerald-600' : 'text-violet-600';
  if (!events.length) return <span className="text-neutral-300">---</span>;
  return (
    <div className="space-y-1.5">
      {events.map((event, i) => (
        <p key={i} className="flex items-center gap-1 whitespace-nowrap text-[11px] text-neutral-500">
          <Icon size={12} className={`shrink-0 ${color}`} />
          <span>{fmtDateTime(event.occurredAt)}</span>
        </p>
      ))}
    </div>
  );
}

function EmailDeviceList({ events }: { events: MarketingEmailEvent[] }) {
  if (!events.length) return <span className="text-neutral-300">---</span>;
  return (
    <div className="space-y-1.5">
      {events.map((event, i) => {
        const DeviceIcon = DEVICE_ICON[event.deviceType ?? 'unknown'] ?? HelpCircle;
        return (
          <div key={i} className="min-w-0">
            <p className="flex items-center gap-1 whitespace-nowrap text-[11px] font-semibold text-neutral-700">
              <DeviceIcon size={12} className="shrink-0 text-neutral-400" />
              <span className="truncate">{event.device || event.deviceType || 'unknown'}</span>
            </p>
            {event.ip && <p className="truncate pl-4 text-[10px] text-neutral-300">IP : {event.ip}</p>}
          </div>
        );
      })}
    </div>
  );
}

function EmailLocationList({ events }: { events: MarketingEmailEvent[] }) {
  const located = events.filter(eventLocation);
  if (!located.length) return <span className="text-neutral-300">---</span>;
  return (
    <div className="space-y-1.5">
      {located.map((event, i) => (
        <p key={i} className="flex max-w-[240px] items-center gap-1 text-[11px] font-semibold text-neutral-600">
          <MapPin size={12} className="shrink-0 text-rose-500" />
          <span className="truncate">{eventLocation(event)}</span>
        </p>
      ))}
    </div>
  );
}

function MarketingEmailsView() {
  const [selectedType, setSelectedType] = useState('');
  const [search, setSearch] = useState('');
  const [memberFilters, setMemberFilters] = useState<MemberFilters>(EMPTY_MEMBER_FILTERS);
  const { data, isLoading, isError } = useMarketingEmailInsights(selectedType || undefined);
  const { data: membersData } = useAdminMembers({ limit: 500 });
  const members = membersData?.data?.data ?? [];
  const memberMap = useMemo(() => new Map(members.map(m => [m._id, m])), [members]);
  const rows = data?.data?.rows ?? [];
  const types = data?.data?.types ?? [];
  const filteredRows = useMemo(() => {
    const q = normalizeName(search.trim());
    return rows.filter(row => {
      const haystack = normalizeName([row.firstName, row.lastName, row.email, row.memberNumber ?? '', row.campaignTitle, row.type ?? ''].join(' '));
      return (!q || haystack.includes(q)) && matchesMemberFilters(row.userId, memberMap, memberFilters);
    });
  }, [rows, search, memberMap, memberFilters]);
  const totalTypes = types.reduce((sum, item) => sum + item.count, 0);

  const mergedEvents = (row: MarketingEmailInsightRow) => [...row.opens, ...row.clicks].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-rose-100 bg-rose-50/60 px-4 py-3 sm:px-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white"><Mail size={16} /></span>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-rose-600">Emails</p>
            <h2 className="text-sm font-black text-neutral-900 sm:text-base">Suivi des mails envoyes aux membres</h2>
            <p className="mt-1 text-xs font-semibold leading-5 text-rose-700/80">Ouvertures, clics, appareil et position approximative via IP pour tous les mails sortants traces.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-neutral-400">Filtrer par intitule</p>
          <p className="mt-0.5 text-xs font-semibold text-neutral-500">{filteredRows.length} mail{filteredRows.length > 1 ? 's' : ''} affiche{filteredRows.length > 1 ? 's' : ''}</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-start">
          <TextSearchBox value={search} onChange={setSearch} placeholder="Rechercher membre, mail, intitule..." />
          <MemberFilterPanel filters={memberFilters} onChange={setMemberFilters} />
          <select value={selectedType} onChange={e => setSelectedType(e.target.value)}
            className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-xs font-black text-neutral-700 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-500/15 sm:w-[260px] sm:text-sm">
            <option value="">Tous les emails ({totalTypes})</option>
            {types.map(item => <option key={item.type} value={item.type}>{item.type} ({item.count})</option>)}
          </select>
        </div>
      </div>

      {isLoading && <p className="py-8 text-center text-sm text-neutral-400">Chargement...</p>}
      {isError && <p className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-center text-sm text-red-600">Acces refuse ou erreur de chargement.</p>}
      {!isLoading && !isError && filteredRows.length === 0 && <p className="rounded-2xl border border-neutral-100 bg-white px-5 py-8 text-center text-sm text-neutral-400">Aucun email trace pour le moment.</p>}

      {filteredRows.length > 0 && (
        <div className="hidden rounded-2xl border border-neutral-100 bg-white shadow-sm lg:block">
          <table className="w-full table-fixed text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/60 text-left text-[11px] font-black uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-3">Membre</th>
                <th className="px-4 py-3">Mail</th>
                <th className="px-4 py-3">Ouvertures</th>
                <th className="px-4 py-3">Clic (date/heure)</th>
                <th className="px-4 py-3">Appareil</th>
                <th className="px-4 py-3">Position</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {filteredRows.map(row => {
                const events = mergedEvents(row);
                return (
                  <tr key={row.id} className="align-top">
                    <td className="px-4 py-3">
                      <p className="font-black text-neutral-900">{formatFullName(row.firstName, row.lastName)}</p>
                      <p className="text-[11px] text-neutral-400">{row.email}</p>
                      {row.memberNumber && <p className="mt-0.5 font-mono text-[10px] text-neutral-300">{row.memberNumber}</p>}
                    </td>
                    <td className="max-w-[260px] px-4 py-3">
                      <p className="truncate font-semibold text-neutral-800">{row.campaignTitle}</p>
                      <p className="text-[11px] text-neutral-400">Envoye : {fmtDateTime(row.sentAt)}</p>
                      {row.emailStatus === 'failed' && <p className="mt-1 text-[11px] font-semibold text-red-600">Echec : {row.reason || 'raison inconnue'}</p>}
                    </td>
                    <td className="px-4 py-3"><EmailEventList events={row.opens} type="open" /></td>
                    <td className="px-4 py-3"><EmailEventList events={row.clicks} type="click" /></td>
                    <td className="px-4 py-3"><EmailDeviceList events={events} /></td>
                    <td className="px-4 py-3"><EmailLocationList events={events} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filteredRows.length > 0 && (
        <div className="space-y-2 lg:hidden">
          {filteredRows.map(row => {
            const events = mergedEvents(row);
            return (
              <SectionAccordion key={row.id}
                header={
                  <div className="flex min-w-0 items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-black leading-tight text-neutral-900">{formatFullName(row.firstName, row.lastName)}</p>
                      <p className="truncate text-[9px] text-neutral-400">{row.email}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[9px] font-black uppercase tracking-[0.08em] text-neutral-300">Actions</p>
                      <p className="text-[9px] font-black text-rose-600">{row.openCount} / {row.clickCount}</p>
                    </div>
                  </div>
                }
              >
                <div className="mx-3 mb-3 space-y-2 rounded-2xl border border-neutral-100 bg-neutral-50/80 p-2.5 text-neutral-500 sm:mx-4 sm:mb-4">
                  <div className="min-w-0">
                    <p className="mb-1 text-[9px] font-black uppercase tracking-[0.06em] text-neutral-300">Mail</p>
                    <p className="truncate text-[10px] font-semibold text-neutral-800">{row.campaignTitle}</p>
                    <p className="text-[9px] text-neutral-400">{fmtDateTime(row.sentAt)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[9px] sm:grid-cols-4">
                    <div className="min-w-0"><p className="mb-1 font-black uppercase tracking-[0.06em] text-neutral-300">Ouvertures</p><EmailEventList events={row.opens} type="open" /></div>
                    <div className="min-w-0"><p className="mb-1 font-black uppercase tracking-[0.06em] text-neutral-300">Clic</p><EmailEventList events={row.clicks} type="click" /></div>
                    <div className="min-w-0"><p className="mb-1 font-black uppercase tracking-[0.06em] text-neutral-300">Appareil</p><EmailDeviceList events={events} /></div>
                    <div className="min-w-0"><p className="mb-1 font-black uppercase tracking-[0.06em] text-neutral-300">Position</p><EmailLocationList events={events} /></div>
                  </div>
                </div>
              </SectionAccordion>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminMarketingPage() {
  const [showEditor, setShowEditor] = useState(false);
  const [viewCampaign, setViewCampaign] = useState<CampaignDoc | null>(null);
  const [editCampaign, setEditCampaign] = useState<CampaignDoc | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CampaignDoc | null>(null);
  const [tab, setTab] = useState<'campagnes' | 'insights' | 'emails'>('campagnes');
  const [campaignSearch, setCampaignSearch] = useState('');
  const [campaignStatus, setCampaignStatus] = useState<'all' | 'sent' | 'failed'>('all');
  const { data, isLoading } = useAdminCampaigns();
  const campaigns = data?.data ?? [];
  const filteredCampaigns = useMemo(() => {
    const q = normalizeName(campaignSearch.trim());
    return campaigns.filter(c => {
      const haystack = normalizeName([c.title, c.giftName].join(' '));
      const statusOk = campaignStatus === 'all' || (campaignStatus === 'failed' ? c.failedCount > 0 : c.sentCount > 0 && c.failedCount === 0);
      return (!q || haystack.includes(q)) && statusOk;
    });
  }, [campaigns, campaignSearch, campaignStatus]);
  const user = useAuthStore(s => s.user);
  const deleteCampaign = useDeleteCampaign();
  const canSeeInsights = user?.email === INSIGHTS_ALLOWED_EMAIL;

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteCampaign.mutate(deleteTarget._id, { onSuccess: () => setDeleteTarget(null) });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Marketing</h1>
        <p className="mt-1 text-sm text-neutral-500">Campagnes promotionnelles envoyées par email aux membres.</p>
      </div>

      {canSeeInsights && (
        <div className="flex gap-1.5 rounded-2xl border border-neutral-100 bg-neutral-50/70 p-1.5">
          <button onClick={() => setTab('campagnes')}
            className={`flex-1 rounded-xl px-3 py-2 text-xs font-black transition sm:text-sm ${tab === 'campagnes' ? 'bg-white text-rose-700 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}>
            Campagnes
          </button>
          <button onClick={() => setTab('insights')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black transition sm:text-sm ${tab === 'insights' ? 'bg-white text-rose-700 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}>
            <BarChart3 size={13} /> Insights
          </button>
          <button onClick={() => setTab('emails')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black transition sm:text-sm ${tab === 'emails' ? 'bg-white text-rose-700 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}>
            <Mail size={13} /> Emails
          </button>
        </div>
      )}

      {tab === 'insights' && canSeeInsights ? (
        <CampaignInsightsView campaigns={campaigns} />
      ) : tab === 'emails' && canSeeInsights ? (
        <MarketingEmailsView />
      ) : (
        <>
          <div className="flex flex-col gap-2 rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <TextSearchBox value={campaignSearch} onChange={setCampaignSearch} placeholder="Rechercher une campagne..." />
            <select value={campaignStatus} onChange={e => setCampaignStatus(e.target.value as 'all' | 'sent' | 'failed')}
              className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-xs font-black text-neutral-700 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-500/15 sm:w-[220px] sm:text-sm">
              <option value="all">Toutes les campagnes</option>
              <option value="sent">Envoyees sans echec</option>
              <option value="failed">Avec echecs</option>
            </select>
          </div>

          <button onClick={() => setShowEditor(true)}
            className="flex w-full flex-col items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-left transition hover:bg-rose-100 sm:w-1/2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white"><Plus size={18} /></span>
            <span className="text-sm font-black text-rose-700">Créer campagne</span>
            <span className="text-xs font-semibold text-rose-600/80">Invitez les membres à finaliser leur profil pour bénéficier d&apos;un cadeau exclusif.</span>
          </button>

          {/* ── Desktop : les 2 blocs côte à côte, jamais pliés ──── */}
          <div className="hidden items-start gap-3 lg:grid lg:grid-cols-[1.7fr_1fr]">
            <div>
              <h2 className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-neutral-500">Historique des campagnes</h2>
              <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
                {isLoading && <p className="px-5 py-8 text-center text-sm text-neutral-400">Chargement…</p>}
                {!isLoading && filteredCampaigns.length === 0 && (
                  <p className="px-5 py-8 text-center text-sm text-neutral-400">Aucune campagne envoyée pour le moment.</p>
                )}
                <div className="divide-y divide-neutral-50">
                  {filteredCampaigns.map(c => <CampaignHistoryRow key={c._id} campaign={c} onView={setViewCampaign} onEdit={setEditCampaign} onDelete={setDeleteTarget} deleting={deleteCampaign.isPending && deleteCampaign.variables === c._id} />)}
                </div>
              </div>
            </div>
            <RewardedMembersPanel />
          </div>

          {/* ── Mobile/tablette : 2 accordéons empilés, bénéficiaires
              en premier — mêmes headers/contenus, juste pliables. ──── */}
          <div className="space-y-3 lg:hidden">
            <SectionAccordion header={<RewardedAccordionHeader />}>
              <div className="mx-4 mb-4"><RewardedMembersList /></div>
            </SectionAccordion>

            <SectionAccordion header={<p className="text-xs font-black uppercase tracking-[0.16em] text-neutral-500">Historique des campagnes</p>}>
              {isLoading && <p className="px-5 py-8 text-center text-sm text-neutral-400">Chargement…</p>}
              {!isLoading && filteredCampaigns.length === 0 && (
                <p className="px-5 py-8 text-center text-sm text-neutral-400">Aucune campagne envoyée pour le moment.</p>
              )}
              <div className="divide-y divide-neutral-50 border-t border-neutral-100">
                {filteredCampaigns.map(c => <CampaignHistoryRow key={c._id} campaign={c} onView={setViewCampaign} onEdit={setEditCampaign} onDelete={setDeleteTarget} deleting={deleteCampaign.isPending && deleteCampaign.variables === c._id} />)}
              </div>
            </SectionAccordion>
          </div>
        </>
      )}

      {showEditor && <CampaignEditorModal onClose={() => setShowEditor(false)} />}
      {editCampaign && <CampaignEditorModal key={editCampaign._id} campaign={editCampaign} onClose={() => setEditCampaign(null)} />}
      {viewCampaign && <CampaignViewModal campaign={viewCampaign} onClose={() => setViewCampaign(null)} />}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-neutral-200">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600"><AlertTriangle size={18} /></span>
              <div className="min-w-0">
                <h3 className="text-lg font-black text-neutral-900">Supprimer la campagne</h3>
                <p className="mt-1 text-sm text-neutral-500">Cette action supprimera aussi les événements de suivi liés à <span className="font-semibold text-neutral-800">{deleteTarget.title}</span>.</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-600 hover:border-neutral-300">Annuler</button>
              <button type="button" onClick={confirmDelete} disabled={deleteCampaign.isPending} className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white hover:bg-red-700 disabled:opacity-60">{deleteCampaign.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
