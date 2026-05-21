'use client';

import { useState, useMemo, useRef } from 'react';
import {
  Plus, X, Send, Eye, ChevronDown, Search,
  CalendarDays, Banknote, FileText, CheckCircle2, Clock,
  Link as LinkIcon, Loader2, Trash2,
} from 'lucide-react';
import {
  useAdminInvoices, useCreateInvoice, useSendInvoice, useDeleteInvoice,
  type InvoiceDoc,
} from '@/lib/api/invoices';
import { useAdminMembers, type MemberListItem } from '@/lib/api/members';
import { formatFullName } from '@/lib/format-name';

/* ─── Helpers ─────────────────────────────────────────── */
type InvoiceStatus = 'draft' | 'sent' | 'closed';

const STATUS_CONFIG: Record<InvoiceStatus, { badge: string; label: string; icon: React.ReactNode }> = {
  draft:  { badge: 'bg-neutral-50 text-neutral-600 border-neutral-200',  label: 'Brouillon', icon: <FileText size={10} />    },
  sent:   { badge: 'bg-blue-50 text-blue-700 border-blue-200',           label: 'Envoyée',   icon: <Clock size={10} />       },
  closed: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',  label: 'Clôturée',  icon: <CheckCircle2 size={10} /> },
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtCfa(amount: number) {
  return `${Number(amount || 0).toLocaleString('fr-FR')} F.CFA`;
}

/* ─── Skeleton ────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="divide-y divide-neutral-50">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="h-10 w-10 rounded-xl bg-neutral-100 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-40 rounded bg-neutral-100" />
            <div className="h-2 w-28 rounded bg-neutral-50" />
          </div>
          <div className="h-8 w-24 rounded-lg bg-neutral-100" />
        </div>
      ))}
    </div>
  );
}

/* ─── Invoice detail modal ────────────────────────────── */
function InvoiceDetailModal({ invoice, onClose }: { invoice: InvoiceDoc; onClose: () => void }) {
  const cfg = STATUS_CONFIG[invoice.status];
  const paidCount = invoice.recipients.filter(r => r.status === 'paid').length;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200">
        <div className="relative px-6 py-5" style={{ background: 'linear-gradient(135deg, #065f46 0%, #064e3b 60%, #022c22 100%)' }}>
          <div className="absolute top-0 left-0 h-[3px] w-full" style={{ background: 'linear-gradient(90deg, #0B8F3A 33%, #C8102E 33%, #C8102E 66%, #F7C600 66%)' }} />
          <button onClick={onClose} className="absolute right-4 top-4 text-white/40 hover:text-white/80"><X size={16} /></button>
          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-emerald-400/70">Association SALAM</p>
          <p className="mt-1 text-lg font-black text-white">{invoice.title}</p>
          <p className="text-[11px] text-white/50 font-mono mt-0.5">{invoice.invoiceNumber}</p>
        </div>
        <div className="px-6 py-5 space-y-3">
          {invoice.description && (
            <p className="text-xs text-neutral-500 leading-relaxed">{invoice.description}</p>
          )}
          {[
            { label: 'Montant',          value: fmtCfa(invoice.amount) },
            { label: 'Date d\'émission', value: fmt(invoice.issuedAt) },
            { label: 'Échéance',         value: fmt(invoice.dueDate) },
            { label: 'Destinataires',    value: `${invoice.recipients.length} membres` },
            { label: 'Paiements reçus',  value: `${paidCount} / ${invoice.recipients.length}` },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between border-b border-neutral-50 pb-2 last:border-0">
              <span className="text-xs font-semibold text-neutral-400">{row.label}</span>
              <span className="text-xs font-black text-neutral-900">{row.value}</span>
            </div>
          ))}
          {invoice.paymentLink && (
            <div className="flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-100 px-3 py-2">
              <LinkIcon size={12} className="text-blue-500 shrink-0" />
              <span className="truncate text-xs font-semibold text-blue-700">{invoice.paymentLink}</span>
            </div>
          )}
          <div className="pt-1">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black ${cfg.badge}`}>
              {cfg.icon} {cfg.label}
            </span>
          </div>
        </div>
        <div className="border-t border-neutral-100 px-6 py-4">
          <button onClick={onClose} className="w-full rounded-xl bg-neutral-900 py-2.5 text-sm font-black text-white transition hover:bg-neutral-800">Fermer</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Create invoice modal ────────────────────────────── */

const COTIS_LABEL: Record<MemberListItem['cotisationStatus'], string> = {
  paid: 'À jour', unpaid: 'Impayé', exempt: 'Exempté',
};
const COTIS_BADGE: Record<MemberListItem['cotisationStatus'], string> = {
  paid:   'bg-emerald-50 text-emerald-700',
  unpaid: 'bg-red-50 text-red-700',
  exempt: 'bg-neutral-100 text-neutral-600',
};

function CreateInvoiceModal({ onClose }: { onClose: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const [title,         setTitle]         = useState('');
  const [description,   setDescription]   = useState('');
  const [amount,        setAmount]        = useState('');
  const [dueDate,       setDueDate]       = useState('');
  const [paymentLink,   setPaymentLink]   = useState('');
  const [recipientMode, setRecipientMode] = useState<'all' | 'select'>('all');
  const [selected,      setSelected]      = useState<string[]>([]);
  const [memberSearch,  setMemberSearch]  = useState('');
  const [cotisFilter,   setCotisFilter]   = useState<'all' | MemberListItem['cotisationStatus']>('all');
  const [errors,        setErrors]        = useState<Record<string, string>>({});
  const recipientRef = useRef<HTMLDivElement>(null);

  const createInvoice = useCreateInvoice();
  const { data: membersData } = useAdminMembers({ limit: 200, status: 'active' });
  const allMembers: MemberListItem[] = membersData?.data?.data ?? [];

  const filteredMembers = useMemo(() =>
    allMembers.filter(m => {
      const q = memberSearch.trim().toLowerCase();
      const matchSearch = !q || `${m.firstName} ${m.lastName}`.toLowerCase().includes(q);
      const matchCotis  = cotisFilter === 'all' || m.cotisationStatus === cotisFilter;
      return matchSearch && matchCotis;
    }),
  [allMembers, memberSearch, cotisFilter]);

  const allFilteredSelected  = filteredMembers.length > 0 && filteredMembers.every(m => selected.includes(m._id));
  const someFilteredSelected = filteredMembers.some(m => selected.includes(m._id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelected(prev => prev.filter(id => !filteredMembers.some(m => m._id === id)));
    } else {
      setSelected(prev => {
        const toAdd = filteredMembers.map(m => m._id).filter(id => !prev.includes(id));
        return [...prev, ...toAdd];
      });
    }
  };

  const toggleMember = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim())                                          e.title      = 'Titre requis';
    if (!amount || Number(amount) <= 0)                         e.amount     = 'Montant invalide';
    if (!dueDate)                                               e.dueDate    = 'Échéance requise';
    if (recipientMode === 'select' && selected.length === 0)    e.recipients = 'Sélectionnez au moins un destinataire';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = () => {
    if (!validate()) return;
    createInvoice.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        amount: Number(amount),
        dueDate,
        paymentLink: paymentLink.trim() || undefined,
        recipientIds: recipientMode === 'select' ? selected : undefined,
      },
      { onSuccess: () => onClose() },
    );
  };

  const inputCls = (err?: string) =>
    `w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition-all focus:ring-2 placeholder:text-neutral-300 ${err ? 'border-red-300 focus:ring-red-500/15' : 'border-neutral-200 focus:border-emerald-500 focus:ring-emerald-500/15'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 shrink-0">
          <div>
            <h3 className="font-black text-neutral-900">Nouvelle facture</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Générer une facture pour un événement</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100"><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Titre <span className="text-red-500">*</span></label>
            <input value={title} onChange={e => { setTitle(e.target.value); setErrors(p => ({...p, title: ''})); }}
              placeholder="Ex: Soirée Gala 2025" className={inputCls(errors.title)} />
            {errors.title && <p className="text-[11px] text-red-500">{errors.title}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Description <span className="text-neutral-300 font-normal normal-case">(optionnel)</span></label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Description de l'événement…" rows={2}
              className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-neutral-300 transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Montant (F.CFA) <span className="text-red-500">*</span></label>
              <div className="relative">
                <Banknote size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input type="number" min="0" step="1" value={amount}
                  onChange={e => { setAmount(e.target.value); setErrors(p => ({...p, amount: ''})); }}
                  placeholder="5000" className={`${inputCls(errors.amount)} pl-9`} />
              </div>
              {errors.amount && <p className="text-[11px] text-red-500">{errors.amount}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Échéance <span className="text-red-500">*</span></label>
              <div className="relative">
                <CalendarDays size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input type="date" value={dueDate} min={today}
                  onChange={e => { setDueDate(e.target.value); setErrors(p => ({...p, dueDate: ''})); }}
                  className={`${inputCls(errors.dueDate)} pl-9`} />
              </div>
              {errors.dueDate && <p className="text-[11px] text-red-500">{errors.dueDate}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Lien de paiement <span className="text-neutral-300 font-normal normal-case">(optionnel)</span></label>
            <div className="relative">
              <LinkIcon size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input value={paymentLink} onChange={e => setPaymentLink(e.target.value)}
                placeholder="https://…" className={`${inputCls()} pl-9`} />
            </div>
          </div>

          {/* Destinataires */}
          <div className="space-y-3" ref={recipientRef}>
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Destinataires</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setRecipientMode('all')}
                className={`rounded-xl border px-4 py-2 text-xs font-black transition ${recipientMode === 'all' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300'}`}>
                Tous les actifs
              </button>
              <button type="button" onClick={() => {
                  setRecipientMode('select');
                  setTimeout(() => recipientRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
                }}
                className={`rounded-xl border px-4 py-2 text-xs font-black transition ${recipientMode === 'select' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300'}`}>
                Sélection manuelle
              </button>
            </div>

            {recipientMode === 'select' && (
              <div className="overflow-hidden rounded-xl border border-neutral-200">
                {/* Search */}
                <div className="relative border-b border-neutral-100">
                  <Search size={13} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input value={memberSearch} onChange={e => setMemberSearch(e.target.value)}
                    placeholder="Rechercher par nom ou prénom…"
                    className="h-9 w-full bg-neutral-50 pl-9 pr-4 text-sm outline-none placeholder:text-neutral-300 focus:bg-white" />
                </div>

                {/* Cotisation filter chips */}
                <div className="flex flex-wrap gap-1.5 border-b border-neutral-100 px-3 py-2">
                  {(['all', 'unpaid', 'paid', 'exempt'] as const).map(f => (
                    <button key={f} type="button" onClick={() => setCotisFilter(f)}
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black transition ${cotisFilter === f ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300'}`}>
                      {f === 'all' ? 'Tous' : f === 'unpaid' ? 'Impayé' : f === 'paid' ? 'À jour' : 'Exempté'}
                    </button>
                  ))}
                </div>

                {/* Select all row */}
                <div className="flex items-center gap-3 border-b border-neutral-100 bg-neutral-50 px-3 py-2">
                  <input type="checkbox" id="select-all"
                    checked={allFilteredSelected}
                    ref={el => { if (el) el.indeterminate = !allFilteredSelected && someFilteredSelected; }}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 cursor-pointer rounded border-neutral-300 accent-emerald-600" />
                  <label htmlFor="select-all" className="flex-1 cursor-pointer text-xs font-black text-neutral-600">
                    Sélectionner tout ({filteredMembers.length})
                  </label>
                  {selected.length > 0 && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700">
                      {selected.length} sélectionné{selected.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Member list */}
                <div className="max-h-44 divide-y divide-neutral-50 overflow-y-auto">
                  {filteredMembers.length === 0 && (
                    <p className="py-6 text-center text-xs text-neutral-400">Aucun membre trouvé</p>
                  )}
                  {filteredMembers.map(m => (
                    <label key={m._id} htmlFor={`m-${m._id}`}
                      className="flex cursor-pointer items-center gap-3 px-3 py-2.5 transition hover:bg-neutral-50">
                      <input type="checkbox" id={`m-${m._id}`}
                        checked={selected.includes(m._id)}
                        onChange={() => toggleMember(m._id)}
                        className="h-4 w-4 cursor-pointer rounded border-neutral-300 accent-emerald-600" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-black text-neutral-900">{formatFullName(m.firstName, m.lastName)}</p>
                        <p className="truncate font-mono text-[10px] text-neutral-400">{m.memberId}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black ${COTIS_BADGE[m.cotisationStatus]}`}>
                        {COTIS_LABEL[m.cotisationStatus]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            {errors.recipients && <p className="text-[11px] text-red-500">{errors.recipients}</p>}
          </div>
        </div>

        <div className="flex gap-3 border-t border-neutral-100 px-6 py-4 shrink-0">
          <button onClick={onClose} className="flex-1 rounded-xl border border-neutral-200 bg-white py-2.5 text-sm font-semibold text-neutral-600 transition hover:border-neutral-300">Annuler</button>
          <button onClick={handleCreate} disabled={createInvoice.isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-60">
            {createInvoice.isPending && <Loader2 size={14} className="animate-spin" />}
            Créer la facture
          </button>
        </div>
      </div>
    </div>
  );
}


/* ─── Page principale ─────────────────────────────────── */
export default function FacturationAdminPage() {
  const [search,      setSearch]      = useState('');
  const [showCreate,  setShowCreate]  = useState(false);
  const [viewInvoice, setViewInvoice] = useState<InvoiceDoc | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { data, isLoading, isError } = useAdminInvoices();
  const sendInvoice = useSendInvoice();
  const deleteInvoice = useDeleteInvoice();

  const invoices = data?.data ?? [];

  const filtered = useMemo(() =>
    invoices.filter(inv =>
      `${inv.title} ${inv.invoiceNumber}`.toLowerCase().includes(search.toLowerCase())
    ),
  [invoices, search]);

  const stats = useMemo(() => ({
    total:  invoices.length,
    sent:   invoices.filter(i => i.status === 'sent').length,
    closed: invoices.filter(i => i.status === 'closed').length,
    draft:  invoices.filter(i => i.status === 'draft').length,
  }), [invoices]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Facturation</h1>
          <p className="mt-1 text-sm text-neutral-500">Générer et envoyer des factures pour les événements de l&apos;association.</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98]">
          <Plus size={15} /> Nouvelle facture
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total',      value: stats.total,  color: 'text-neutral-900', bg: 'bg-neutral-50 border-neutral-100'  },
          { label: 'Envoyées',   value: stats.sent,   color: 'text-blue-700',    bg: 'bg-blue-50    border-blue-100'     },
          { label: 'Clôturées',  value: stats.closed, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100'  },
          { label: 'Brouillons', value: stats.draft,  color: 'text-neutral-600', bg: 'bg-neutral-50 border-neutral-200'  },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.bg}`}>
            <p className={`text-2xl font-black leading-none ${s.color}`}>{isLoading ? '…' : s.value}</p>
            <p className="mt-1.5 text-xs font-semibold text-neutral-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher une facture…"
          className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-4 text-sm outline-none placeholder:text-neutral-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
        />
      </div>

      {/* Invoice list */}
      <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
        <div className="border-b border-neutral-100 px-5 py-3.5">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-neutral-500">
            {isLoading ? 'Chargement…' : `${filtered.length} facture${filtered.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="divide-y divide-neutral-50">
          {isLoading && <Skeleton />}
          {isError && <div className="px-5 py-10 text-center text-sm text-red-500">Erreur de chargement.</div>}
          {!isLoading && !isError && filtered.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-neutral-400">Aucune facture trouvée.</div>
          )}
          {!isLoading && !isError && filtered.map(inv => {
            const cfg      = STATUS_CONFIG[inv.status];
            const paidCount = inv.recipients.filter(r => r.status === 'paid').length;
            const progress  = inv.recipients.length > 0
              ? Math.round((paidCount / inv.recipients.length) * 100)
              : 0;
            const isDeleting = confirmDeleteId === inv._id;
            return (
              <div key={inv._id} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-neutral-50/60">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 border border-violet-100">
                  <FileText size={16} className="text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-black text-sm text-neutral-900">{inv.title}</p>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black ${cfg.badge}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-mono mt-0.5">{inv.invoiceNumber}</p>
                  {inv.status !== 'draft' && inv.recipients.length > 0 && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1 flex-1 max-w-32 overflow-hidden rounded-full bg-neutral-100">
                        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-[10px] text-neutral-400">{paidCount}/{inv.recipients.length} payés</span>
                    </div>
                  )}
                </div>
                <div className="hidden text-right sm:block shrink-0">
                  <p className="text-xs font-black text-neutral-700">{fmtCfa(inv.amount)}</p>
                  <p className="text-[10px] text-neutral-400">Échéance {fmt(inv.dueDate)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setViewInvoice(inv)} title="Voir la facture"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-400 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600">
                    <Eye size={13} />
                  </button>
                  {inv.status === 'draft' && (
                    <button onClick={() => sendInvoice.mutate(inv._id)}
                      disabled={sendInvoice.isPending}
                      className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700 transition hover:bg-blue-100 disabled:opacity-60">
                      {sendInvoice.isPending ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
                      Envoyer
                    </button>
                  )}
                  {isDeleting ? (
                    <button
                      onClick={() => deleteInvoice.mutate(inv._id, { onSuccess: () => setConfirmDeleteId(null) })}
                      disabled={deleteInvoice.isPending}
                      className="flex h-8 items-center justify-center rounded-lg bg-red-500 px-2.5 text-[10px] font-black text-white transition hover:bg-red-600 disabled:opacity-50"
                    >
                      {deleteInvoice.isPending ? <Loader2 size={11} className="animate-spin" /> : 'Confirmer'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(inv._id)}
                      title="Supprimer la facture"
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-400 transition hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showCreate && <CreateInvoiceModal onClose={() => setShowCreate(false)} />}
      {viewInvoice && <InvoiceDetailModal invoice={viewInvoice} onClose={() => setViewInvoice(null)} />}
    </div>
  );
}
