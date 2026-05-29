'use client';

import { useMemo, useState } from 'react';
import { Plus, X, Send, Eye, Search, CalendarDays, Banknote, FileText, CheckCircle2, Clock, Link as LinkIcon } from 'lucide-react';
import { DemoPortalShell } from '../../_components/DemoShell';
import { demoInvoices } from '@/data/demo/demo-portal';
import { demoMembers } from '@/data/demo/demo-members';
import { formatFullName } from '@/lib/format-name';
import { DemoFinancialDocumentModal, type DemoFinancialDocument } from '@/components/demo/DemoFinancialDocument';
import { DemoInvoiceEditorModal } from '@/components/demo/DemoInvoiceEditorModal';

type DemoInvoice = typeof demoInvoices[number] & { _id: string; title: string; invoiceNumber: string; status: 'draft' | 'sent' | 'closed'; dueDate: string; recipients: { status: 'paid' | 'pending' }[]; description?: string; paymentLink?: string };

const STATUS_CONFIG = {
  draft: { badge: 'bg-neutral-50 text-neutral-600 border-neutral-200', label: 'Brouillon', icon: <FileText size={10} /> },
  sent: { badge: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Envoyee', icon: <Clock size={10} /> },
  closed: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Cloturee', icon: <CheckCircle2 size={10} /> },
};

function invoices(): DemoInvoice[] {
  return demoInvoices.map((invoice, index) => ({
    ...invoice,
    _id: invoice.id,
    title: invoice.label,
    invoiceNumber: invoice.id,
    status: invoice.status === 'paid' ? 'closed' : invoice.status === 'sent' ? 'sent' : 'draft',
    dueDate: '2026-06-30',
    recipients: demoMembers.slice(0, index + 1).map((_, i) => ({ status: i === 0 ? 'paid' : 'pending' })),
    description: 'Facture fictive generee dans la demo SALAM.',
    paymentLink: 'https://demo.salam/pay',
  }));
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function invoiceDocuments(invoice: DemoInvoice): DemoFinancialDocument[] {
  const recipients = demoMembers.slice(0, Math.max(1, invoice.recipients.length));
  return recipients.map((member, index) => ({
    id: `${invoice.invoiceNumber}-${String(index + 1).padStart(2, '0')}`,
    type: 'invoice',
    title: invoice.title,
    number: recipients.length > 1 ? `${invoice.invoiceNumber}-${String(index + 1).padStart(2, '0')}` : invoice.invoiceNumber,
    issuedAt: invoice.issuedAt,
    dueDate: invoice.dueDate,
    recipient: {
      name: formatFullName(member.firstName, member.lastName),
      email: member.email,
      phone: (member as { phone?: string }).phone,
      address: `${(member as { residenceCity?: string }).residenceCity ?? member.city ?? 'Rabat'}, ${member.country ?? 'Maroc'}`,
      memberId: member.memberId,
    },
    lines: [{ designation: invoice.title, qty: 1, unitPrice: invoice.amount }],
    statusLabel: invoice.status === 'closed' ? 'Clôturée' : invoice.status === 'sent' ? 'Envoyée' : 'Brouillon',
    note: 'Document A4 individualisé par destinataire, comme dans la facturation réelle.',
  }));
}

function CreateInvoiceModal({ onClose }: { onClose: () => void }) {
  const [recipientMode, setRecipientMode] = useState<'all' | 'select'>('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const filteredMembers = demoMembers.filter(m => `${m.firstName} ${m.lastName}`.toLowerCase().includes(memberSearch.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200">
        <div className="flex shrink-0 items-center justify-between border-b border-neutral-100 px-6 py-4">
          <div><h3 className="font-black text-neutral-900">Nouvelle facture</h3><p className="mt-0.5 text-xs text-neutral-500">Generer une facture pour un evenement</p></div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100"><X size={16} /></button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <div className="space-y-1.5"><label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Titre <span className="text-red-500">*</span></label><input defaultValue="Participation Gala SALAM" className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" /></div>
          <div className="space-y-1.5"><label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Description</label><textarea rows={2} defaultValue="Participation a l'evenement annuel." className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Montant (F.CFA) *</label><div className="relative"><Banknote size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" /><input type="number" defaultValue="5000" className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-9 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" /></div></div>
            <div className="space-y-1.5"><label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Echeance *</label><div className="relative"><CalendarDays size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" /><input type="date" defaultValue="2026-06-30" className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-9 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" /></div></div>
          </div>
          <div className="space-y-1.5"><label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Lien de paiement</label><div className="relative"><LinkIcon size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" /><input defaultValue="https://demo.salam/pay" className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-9 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" /></div></div>
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Destinataires</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setRecipientMode('all')} className={`rounded-xl border px-4 py-2 text-xs font-black transition ${recipientMode === 'all' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300'}`}>Tous les actifs</button>
              <button type="button" onClick={() => setRecipientMode('select')} className={`rounded-xl border px-4 py-2 text-xs font-black transition ${recipientMode === 'select' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300'}`}>Selection manuelle</button>
            </div>
            {recipientMode === 'select' && (
              <div className="overflow-hidden rounded-xl border border-neutral-200">
                <div className="relative border-b border-neutral-100"><Search size={13} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" /><input value={memberSearch} onChange={e => setMemberSearch(e.target.value)} placeholder="Rechercher par nom ou prenom..." className="h-9 w-full bg-neutral-50 pl-9 pr-4 text-sm outline-none placeholder:text-neutral-300 focus:bg-white" /></div>
                <div className="max-h-44 divide-y divide-neutral-50 overflow-y-auto">
                  {filteredMembers.map(m => <label key={m.id} className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-neutral-50"><input type="checkbox" checked={selected.includes(m.id)} onChange={() => setSelected(prev => prev.includes(m.id) ? prev.filter(id => id !== m.id) : [...prev, m.id])} className="h-4 w-4 rounded border-neutral-300 accent-emerald-600" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-black text-neutral-900">{formatFullName(m.firstName, m.lastName)}</p><p className="truncate font-mono text-[10px] text-neutral-400">{m.memberId}</p></div></label>)}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex shrink-0 gap-3 border-t border-neutral-100 px-6 py-4">
          <button onClick={onClose} className="flex-1 rounded-xl border border-neutral-200 bg-white py-2.5 text-sm font-semibold text-neutral-600 transition hover:border-neutral-300">Annuler</button>
          <button onClick={onClose} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700">Creer la facture</button>
        </div>
      </div>
    </div>
  );
}

function InvoiceDetailModal({ invoice, onClose, onOpenPdf }: { invoice: DemoInvoice; onClose: () => void; onOpenPdf: () => void }) {
  const cfg = STATUS_CONFIG[invoice.status];
  const paidCount = invoice.recipients.filter(r => r.status === 'paid').length;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200">
        <div className="relative px-6 py-5" style={{ background: 'linear-gradient(135deg, #065f46 0%, #064e3b 60%, #022c22 100%)' }}>
          <div className="absolute left-0 top-0 h-[3px] w-full" style={{ background: 'linear-gradient(90deg, #0B8F3A 33%, #C8102E 33%, #C8102E 66%, #F7C600 66%)' }} />
          <button onClick={onClose} className="absolute right-4 top-4 text-white/40 hover:text-white/80"><X size={16} /></button>
          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-emerald-400/70">Association SALAM</p>
          <p className="mt-1 text-lg font-black text-white">{invoice.title}</p>
          <p className="mt-0.5 font-mono text-[11px] text-white/50">{invoice.invoiceNumber}</p>
        </div>
        <div className="space-y-3 px-6 py-5">
          {[['Montant', `${Number(invoice.amount).toLocaleString('fr-FR')} F.CFA`], ['Date emission', fmt(invoice.issuedAt)], ['Echeance', fmt(invoice.dueDate)], ['Destinataires', `${invoice.recipients.length} membres`], ['Paiements recus', `${paidCount} / ${invoice.recipients.length}`]].map(([label, value]) => <div key={label} className="flex items-center justify-between border-b border-neutral-50 pb-2 last:border-0"><span className="text-xs font-semibold text-neutral-400">{label}</span><span className="text-xs font-black text-neutral-900">{value}</span></div>)}
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black leading-none ${cfg.badge}`}>{cfg.icon} {cfg.label}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-neutral-100 px-6 py-4">
          <button onClick={onOpenPdf} className="rounded-xl bg-emerald-600 py-2.5 text-sm font-black text-white transition hover:bg-emerald-700">Voir le PDF A4</button>
          <button onClick={onClose} className="rounded-xl bg-neutral-900 py-2.5 text-sm font-black text-white transition hover:bg-neutral-800">Fermer</button>
        </div>
      </div>
    </div>
  );
}

export default function DemoAdminFacturationPage() {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<DemoInvoice | null>(null);
  const [pdfDocs, setPdfDocs] = useState<DemoFinancialDocument[] | null>(null);
  const [created, setCreated] = useState(false);
  const list = invoices();
  const filtered = useMemo(() => list.filter(inv => `${inv.title} ${inv.invoiceNumber}`.toLowerCase().includes(search.toLowerCase())), [search]);
  const stats = { total: list.length, sent: list.filter(i => i.status === 'sent').length, closed: list.filter(i => i.status === 'closed').length, draft: list.filter(i => i.status === 'draft').length };

  return (
    <DemoPortalShell type="admin" title="Facturation">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Facturation</h1><p className="mt-1 text-sm text-neutral-500">Generer et envoyer des factures pour les evenements de l'association.</p></div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98]"><Plus size={15} /> Nouvelle facture</button>
        </div>
        {created && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            Facture demo preparee localement. Aucune donnee reelle n'a ete modifiee.
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[['Total', stats.total, 'text-neutral-900', 'bg-neutral-50 border-neutral-100'], ['Envoyees', stats.sent, 'text-blue-700', 'bg-blue-50 border-blue-100'], ['Cloturees', stats.closed, 'text-emerald-700', 'bg-emerald-50 border-emerald-100'], ['Brouillons', stats.draft, 'text-neutral-600', 'bg-neutral-50 border-neutral-200']].map(([label, value, color, bg]) => <div key={label as string} className={`rounded-2xl border p-4 ${bg}`}><p className={`text-2xl font-black leading-none ${color}`}>{value}</p><p className="mt-1.5 text-xs font-semibold text-neutral-500">{label}</p></div>)}
        </div>
        <div className="relative"><Search size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une facture..." className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-4 text-sm outline-none placeholder:text-neutral-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" /></div>
        <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
          <div className="border-b border-neutral-100 px-5 py-3.5"><p className="text-xs font-black uppercase tracking-[0.14em] text-neutral-500">{filtered.length} factures</p></div>
          <div className="divide-y divide-neutral-50">
            {filtered.map(inv => {
              const cfg = STATUS_CONFIG[inv.status];
              const paidCount = inv.recipients.filter(r => r.status === 'paid').length;
              const progress = Math.round((paidCount / inv.recipients.length) * 100);
              return (
                <div key={inv._id} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-neutral-50/60">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-100 bg-violet-50"><FileText size={16} className="text-violet-600" /></div>
                  <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-black text-neutral-900">{inv.title}</p><span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black leading-none ${cfg.badge}`}>{cfg.icon} {cfg.label}</span></div><p className="mt-0.5 font-mono text-[11px] text-neutral-400">{inv.invoiceNumber}</p>{inv.status !== 'draft' && <div className="mt-1.5 flex items-center gap-2"><div className="h-1 max-w-32 flex-1 overflow-hidden rounded-full bg-neutral-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress}%` }} /></div><span className="text-[10px] text-neutral-400">{paidCount}/{inv.recipients.length} payes</span></div>}</div>
                  <div className="hidden shrink-0 text-right sm:block"><p className="text-xs font-black text-neutral-700">{Number(inv.amount).toLocaleString('fr-FR')} F.CFA</p><p className="text-[10px] text-neutral-400">Echeance {fmt(inv.dueDate)}</p></div>
                  <div className="flex shrink-0 items-center gap-2"><button onClick={() => setPdfDocs(invoiceDocuments(inv))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-400 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600"><Eye size={13} /></button>{inv.status === 'draft' && <button className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700 transition hover:bg-blue-100"><Send size={11} /> Envoyer</button>}</div>
                </div>
              );
            })}
          </div>
        </div>
        {showCreate && <DemoInvoiceEditorModal onClose={() => setShowCreate(false)} onCreated={() => setCreated(true)} />}
        {viewInvoice && <InvoiceDetailModal invoice={viewInvoice} onClose={() => setViewInvoice(null)} onOpenPdf={() => setPdfDocs(invoiceDocuments(viewInvoice))} />}
        {pdfDocs && <DemoFinancialDocumentModal documents={pdfDocs} onClose={() => setPdfDocs(null)} />}
      </div>
    </DemoPortalShell>
  );
}
