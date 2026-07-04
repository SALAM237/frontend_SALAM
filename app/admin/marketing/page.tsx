'use client';

import { useMemo, useRef, useState } from 'react';
import { Gift, X, Search, Image as ImageIcon, Loader2, Send, Users, CheckSquare, Square, Calendar, Package, BarChart3, Eye, MousePointerClick, Smartphone, Tablet, Monitor, HelpCircle } from 'lucide-react';
import { useAdminCampaigns, useCreateCampaign, useUploadCampaignImage, useCampaignInsights, type CampaignDoc } from '@/lib/api/marketing';
import { useAdminMembers, type MemberListItem } from '@/lib/api/members';
import { formatFullName } from '@/lib/format-name';
import { useAuthStore } from '@/store/auth.store';

const INSIGHTS_ALLOWED_EMAIL = 'salamcameroun237@gmail.com';

const DEVICE_ICON: Record<string, React.ElementType> = {
  mobile: Smartphone, tablet: Tablet, desktop: Monitor, unknown: HelpCircle,
};

function fmtDateTime(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function normalizeName(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ─── Éditeur de campagne "Cadeau SALAM" ────────────────────
   Objet + cadeau + nombre de colis + date limite + image optionnelle +
   sélection des destinataires (recherche + case à cocher + tout sélectionner,
   même logique que le sélecteur de destinataires en facturation). */
function CampaignEditorModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('🎁 Offre spéciale SALAM — Cadeau exclusif');
  const [giftName, setGiftName] = useState('15 000 Cauris');
  const [packageCount, setPackageCount] = useState(0);
  const [cauriAmount, setCauriAmount] = useState(15000);
  const [deadline, setDeadline] = useState('2026-07-20');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [memberSearch, setMemberSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: membersData, isLoading: membersLoading } = useAdminMembers({ limit: 500 });
  const members: MemberListItem[] = membersData?.data?.data ?? [];
  const uploadImage = useUploadCampaignImage();
  const createCampaign = useCreateCampaign();

  const filteredMembers = useMemo(() => {
    const q = normalizeName(memberSearch.trim());
    if (!q) return members;
    return members.filter(m => normalizeName(`${m.firstName} ${m.lastName} ${m.email ?? ''}`).includes(q));
  }, [members, memberSearch]);

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
    createCampaign.mutate(
      {
        title: title.trim(),
        giftName: giftName.trim(),
        packageCount: Math.max(0, Number(packageCount ?? 0)),
        cauriAmount: Math.max(1, Number(cauriAmount ?? 0)),
        deadline: new Date(deadline).toISOString(),
        imageUrl,
        recipientIds: selected,
      },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200">
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600"><Gift size={17} /></span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-rose-600">Campagne marketing</p>
              <h3 className="text-lg font-black text-neutral-900">Cadeau SALAM</h3>
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
            {errors.recipients && <p className="mb-2 text-xs font-semibold text-red-600">{errors.recipients}</p>}
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
          <button onClick={handleSend} disabled={createCampaign.isPending}
            className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-rose-700 active:scale-[0.98] disabled:opacity-60">
            {createCampaign.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Envoyer la campagne
          </button>
        </div>
      </div>
    </div>
  );
}

function CampaignHistoryRow({ campaign }: { campaign: CampaignDoc }) {
  const creditedNow = (campaign.recipients ?? []).filter(r => r.giftCreditedImmediately).length;
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 border border-rose-100">
        <Gift size={16} className="text-rose-600" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-black text-neutral-900">{campaign.title}</p>
        <p className="mt-0.5 text-[11px] text-neutral-400">
          {campaign.giftName} ({(campaign.cauriAmount ?? 0).toLocaleString('fr-FR')} cauris) · Échéance {fmt(campaign.deadline)} · {(campaign.recipients ?? []).length} destinataire{(campaign.recipients ?? []).length > 1 ? 's' : ''}
        </p>
        {creditedNow > 0 && (
          <p className="mt-0.5 text-[11px] font-semibold text-emerald-600">{creditedNow} déjà crédité{creditedNow > 1 ? 's' : ''} immédiatement</p>
        )}
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-black text-emerald-700">{campaign.sentCount} envoyé{campaign.sentCount > 1 ? 's' : ''}</p>
        {campaign.failedCount > 0 && <p className="text-[11px] font-semibold text-red-600">{campaign.failedCount} échec{campaign.failedCount > 1 ? 's' : ''}</p>}
      </div>
    </div>
  );
}

/* ─── Insights de campagne (accès strictement réservé) ──────
   Backend refait la même vérification d'email — cette restriction frontend
   n'est qu'une commodité d'affichage, jamais la seule protection. */
function CampaignInsightsView({ campaigns }: { campaigns: CampaignDoc[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(campaigns[0]?._id ?? null);
  const { data, isLoading, isError } = useCampaignInsights(selectedId);
  const insights = data?.data;

  if (campaigns.length === 0) {
    return <p className="rounded-2xl border border-neutral-100 bg-white px-5 py-8 text-center text-sm text-neutral-400">Aucune campagne à analyser.</p>;
  }

  return (
    <div className="space-y-4">
      <select value={selectedId ?? ''} onChange={e => setSelectedId(e.target.value)}
        className="h-10 w-full rounded-xl border border-neutral-200 px-3 text-sm font-semibold outline-none focus:border-rose-400 sm:w-auto">
        {campaigns.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
      </select>

      {isLoading && <p className="py-8 text-center text-sm text-neutral-400">Chargement…</p>}
      {isError && <p className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-center text-sm text-red-600">Accès refusé ou erreur de chargement.</p>}

      {insights && (
        <div className="overflow-x-auto rounded-2xl border border-neutral-100 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/60 text-left text-[11px] font-black uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-3">Membre</th>
                <th className="px-4 py-3">Ouvertures</th>
                <th className="px-4 py-3">Clic (date/heure)</th>
                <th className="px-4 py-3">Appareil</th>
                <th className="px-4 py-3">Cadeau</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {insights.recipients.map(r => {
                const DeviceIcon = DEVICE_ICON[r.lastClickDevice ?? 'unknown'] ?? HelpCircle;
                return (
                  <tr key={r.userId}>
                    <td className="px-4 py-3">
                      <p className="font-black text-neutral-900">{formatFullName(r.firstName, r.lastName)}</p>
                      <p className="text-[11px] text-neutral-400">{r.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      {r.openCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700"><Eye size={13} /> {r.openCount}× — {fmtDateTime(r.lastOpenAt)}</span>
                      ) : <span className="text-neutral-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {r.clickCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-violet-700"><MousePointerClick size={13} /> {r.clickCount}× — {fmtDateTime(r.lastClickAt)}</span>
                      ) : <span className="text-neutral-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {r.lastClickDevice ? (
                        <span className="inline-flex items-center gap-1 text-neutral-600"><DeviceIcon size={13} /> {r.lastClickDevice}</span>
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
    </div>
  );
}

export default function AdminMarketingPage() {
  const [showEditor, setShowEditor] = useState(false);
  const [tab, setTab] = useState<'campagnes' | 'insights'>('campagnes');
  const { data, isLoading } = useAdminCampaigns();
  const campaigns = data?.data ?? [];
  const user = useAuthStore(s => s.user);
  const canSeeInsights = user?.email === INSIGHTS_ALLOWED_EMAIL;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
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
        </div>
      )}

      {tab === 'insights' && canSeeInsights ? (
        <CampaignInsightsView campaigns={campaigns} />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <button onClick={() => setShowEditor(true)}
              className="flex flex-col items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-left transition hover:bg-rose-100">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white"><Gift size={18} /></span>
              <span className="text-sm font-black text-rose-700">Campagne Cadeau SALAM</span>
              <span className="text-xs font-semibold text-rose-600/80">Invitez les membres à finaliser leur profil pour bénéficier d&apos;un cadeau exclusif.</span>
            </button>
          </div>

          <div>
            <h2 className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-neutral-500">Historique des campagnes</h2>
            <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
              {isLoading && <p className="px-5 py-8 text-center text-sm text-neutral-400">Chargement…</p>}
              {!isLoading && campaigns.length === 0 && (
                <p className="px-5 py-8 text-center text-sm text-neutral-400">Aucune campagne envoyée pour le moment.</p>
              )}
              <div className="divide-y divide-neutral-50">
                {campaigns.map(c => <CampaignHistoryRow key={c._id} campaign={c} />)}
              </div>
            </div>
          </div>
        </>
      )}

      {showEditor && <CampaignEditorModal onClose={() => setShowEditor(false)} />}
    </div>
  );
}
