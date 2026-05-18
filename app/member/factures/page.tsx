'use client';

import { useState, useMemo } from 'react';
import { FileText, Eye, X, CheckCircle2, Clock, XCircle, Euro, Loader2 } from 'lucide-react';
import { useMemberInvoices, type MemberInvoiceDoc } from '@/lib/api/invoices';

/* ─── Helpers ─────────────────────────────────────────── */
type RecipientStatus = 'pending' | 'sent' | 'paid' | 'cancelled';

const STATUS_CONFIG: Record<RecipientStatus, { badge: string; label: string; icon: React.ReactNode }> = {
  pending:   { badge: 'bg-amber-50 text-amber-700 border-amber-200',       label: 'En attente',  icon: <Clock size={10} />       },
  sent:      { badge: 'bg-amber-50 text-amber-700 border-amber-200',       label: 'En attente',  icon: <Clock size={10} />       },
  paid:      { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Payée',       icon: <CheckCircle2 size={10} /> },
  cancelled: { badge: 'bg-neutral-50 text-neutral-500 border-neutral-200', label: 'Annulée',     icon: <XCircle size={10} />     },
};

function fmt(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isPending(status: RecipientStatus) {
  return status === 'pending' || status === 'sent';
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
            <div className="h-2 w-32 rounded bg-neutral-50" />
          </div>
          <div className="h-8 w-8 rounded-lg bg-neutral-100" />
        </div>
      ))}
    </div>
  );
}

/* ─── Invoice detail modal ──────────────────────────────── */
function InvoiceModal({ invoice, onClose }: { invoice: MemberInvoiceDoc; onClose: () => void }) {
  const recipientStatus = invoice.myRecipient?.status ?? 'pending';
  const cfg = STATUS_CONFIG[recipientStatus as RecipientStatus];
  const pending = isPending(recipientStatus as RecipientStatus);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200">
        <div className="relative px-6 py-5" style={{ background: 'linear-gradient(135deg, #065f46 0%, #064e3b 60%, #022c22 100%)' }}>
          <div className="absolute top-0 left-0 h-[3px] w-full" style={{ background: 'linear-gradient(90deg, #0B8F3A 33%, #C8102E 33%, #C8102E 66%, #F7C600 66%)' }} />
          <button onClick={onClose} className="absolute right-4 top-4 text-white/40 hover:text-white/80"><X size={16} /></button>
          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-emerald-400/70">Association SALAM · Facture</p>
          <p className="mt-1 text-lg font-black text-white">{invoice.title}</p>
          <p className="text-[11px] text-white/50 font-mono mt-0.5">{invoice.myRecipient?.invoiceNumber ?? invoice.invoiceNumber}</p>
        </div>

        {/* Status stamp */}
        <div className="flex justify-center py-4 border-b border-neutral-100">
          <div className={`flex items-center gap-2 rounded-full border-2 px-5 py-1.5 ${
            recipientStatus === 'paid' ? 'border-emerald-500' : pending ? 'border-amber-400' : 'border-neutral-300'
          }`}>
            {recipientStatus === 'paid'
              ? <CheckCircle2 size={14} className="text-emerald-600" />
              : pending
                ? <Clock size={14} className="text-amber-500" />
                : <XCircle size={14} className="text-neutral-400" />
            }
            <span className={`text-sm font-black tracking-[0.18em] ${
              recipientStatus === 'paid' ? 'text-emerald-700' : pending ? 'text-amber-700' : 'text-neutral-500'
            }`}>
              {cfg.label.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="px-6 py-4 space-y-3">
          {invoice.description && (
            <p className="text-xs text-neutral-500 leading-relaxed">{invoice.description}</p>
          )}
          {[
            { label: 'Montant',          value: `${invoice.amount.toFixed(2)} €` },
            { label: 'Date d\'émission', value: fmt(invoice.issuedAt) },
            { label: 'Échéance',         value: fmt(invoice.dueDate) },
            ...(invoice.myRecipient?.paidAt
              ? [{ label: 'Date de paiement', value: fmt(invoice.myRecipient.paidAt) }]
              : []),
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between border-b border-neutral-50 pb-2.5 last:border-0">
              <span className="text-xs font-semibold text-neutral-400">{row.label}</span>
              <span className="text-xs font-black text-neutral-900">{row.value}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-neutral-100 px-6 py-4 space-y-3">
          {pending && invoice.paymentLink && (
            <a href={invoice.paymentLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98]">
              <Euro size={14} /> Payer maintenant
            </a>
          )}
          <button onClick={onClose}
            className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 text-sm font-semibold text-neutral-600 transition hover:border-neutral-300">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Invoice row ─────────────────────────────────────── */
function InvoiceRow({ invoice, onView }: { invoice: MemberInvoiceDoc; onView: () => void }) {
  const recipientStatus = (invoice.myRecipient?.status ?? 'pending') as RecipientStatus;
  const cfg = STATUS_CONFIG[recipientStatus];
  const pending = isPending(recipientStatus);
  return (
    <div className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-neutral-50/60">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 border border-violet-100">
        <FileText size={16} className="text-violet-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-black text-sm text-neutral-900">{invoice.title}</p>
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black ${cfg.badge}`}>
            {cfg.icon} {cfg.label}
          </span>
        </div>
        <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
          {invoice.myRecipient?.invoiceNumber ?? invoice.invoiceNumber}
        </p>
        <p className="text-[11px] text-neutral-400 mt-0.5">
          {!pending ? `Payée le ${fmt(invoice.myRecipient?.paidAt)}` : `Échéance : ${fmt(invoice.dueDate)}`}
        </p>
      </div>
      <div className="shrink-0 text-right hidden sm:block">
        <p className="text-sm font-black text-neutral-900">{invoice.amount.toFixed(2)} €</p>
      </div>
      <button onClick={onView}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-400 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600"
        title="Voir la facture">
        <Eye size={13} />
      </button>
    </div>
  );
}

/* ─── Page principale ─────────────────────────────────── */
/* ─── Demo data ─────────────────────────────────────────── */
const DEMO_MEMBER_INVOICES: MemberInvoiceDoc[] = [
  {
    _id: 'demo-inv1', invoiceNumber: 'SALAM-FACT-2026-0001', type: 'event',
    title: 'Soirée Gala 2026', description: "Dîner de gala annuel de l'association SALAM",
    amount: 50, currency: 'EUR', issuedAt: '2026-04-01T00:00:00.000Z', dueDate: '2026-05-15T00:00:00.000Z',
    paymentLink: 'https://salam-cameroun.com/paiement', status: 'sent', recipients: [],
    myRecipient: { userId: 'me', invoiceNumber: 'SALAM-FACT-2026-0001-A', status: 'pending', sentAt: '2026-04-01' },
  },
  {
    _id: 'demo-inv2', invoiceNumber: 'SALAM-FACT-2026-0002', type: 'event',
    title: "Sortie Musée d'Orsay", description: "Visite culturelle — Musée d'Orsay, Paris",
    amount: 15, currency: 'EUR', issuedAt: '2026-03-01T00:00:00.000Z', dueDate: '2026-03-20T00:00:00.000Z',
    status: 'closed', recipients: [],
    myRecipient: { userId: 'me', invoiceNumber: 'SALAM-FACT-2026-0002-A', status: 'paid', sentAt: '2026-03-01', paidAt: '2026-03-10' },
  },
];

export default function MemberFacturesPage() {
  const [selected, setSelected] = useState<MemberInvoiceDoc | null>(null);

  const { data, isLoading, isError } = useMemberInvoices();
  const rawInvoices = data?.data ?? [];
  const invoices = !isLoading && rawInvoices.length === 0 ? DEMO_MEMBER_INVOICES : rawInvoices;

  const pending = useMemo(() =>
    invoices.filter(i => isPending((i.myRecipient?.status ?? 'pending') as RecipientStatus)),
  [invoices]);

  const paid = useMemo(() =>
    invoices.filter(i => i.myRecipient?.status === 'paid'),
  [invoices]);

  const total        = invoices.reduce((s, i) => s + (i.myRecipient?.status !== 'cancelled' ? i.amount : 0), 0);
  const paidTotal    = paid.reduce((s, i) => s + i.amount, 0);
  const pendingTotal = pending.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="mx-auto max-w-3xl space-y-6">

      <div>
        <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Mes factures</h1>
        <p className="mt-1 text-sm text-neutral-500">Factures émises par l&apos;association pour les événements.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total facturé', value: isLoading ? '…' : `${total.toFixed(2)} €`,        color: 'text-neutral-900', bg: 'bg-neutral-50  border-neutral-100' },
          { label: 'Payé',          value: isLoading ? '…' : `${paidTotal.toFixed(2)} €`,    color: 'text-emerald-700', bg: 'bg-emerald-50  border-emerald-100' },
          { label: 'En attente',    value: isLoading ? '…' : `${pendingTotal.toFixed(2)} €`, color: 'text-amber-700',   bg: 'bg-amber-50    border-amber-100'   },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.bg}`}>
            <p className={`text-xl font-black leading-none ${s.color}`}>{s.value}</p>
            <p className="mt-1.5 text-xs font-semibold text-neutral-500">{s.label}</p>
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
          <Skeleton />
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center text-sm text-red-600">
          Erreur de chargement. Vérifiez votre connexion.
        </div>
      )}

      {!isLoading && !isError && invoices.length === 0 && (
        <div className="rounded-2xl border border-neutral-100 bg-white px-5 py-12 text-center shadow-sm">
          <FileText size={32} className="mx-auto mb-3 text-neutral-200" />
          <p className="text-sm font-semibold text-neutral-400">Aucune facture pour le moment.</p>
        </div>
      )}

      {!isLoading && !isError && pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-[0.16em] text-amber-600">
            En attente de paiement — {pending.length}
          </h2>
          <div className="overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm">
            <div className="divide-y divide-neutral-50">
              {pending.map(inv => (
                <InvoiceRow key={inv._id} invoice={inv} onView={() => setSelected(inv)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {!isLoading && !isError && paid.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-[0.16em] text-neutral-500">
            Payées — {paid.length}
          </h2>
          <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
            <div className="divide-y divide-neutral-50">
              {paid.map(inv => (
                <InvoiceRow key={inv._id} invoice={inv} onView={() => setSelected(inv)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {selected && <InvoiceModal invoice={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
