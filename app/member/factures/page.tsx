'use client';

import { useState, useMemo } from 'react';
import { Banknote, FileText, Eye, X, CheckCircle2, Clock, XCircle, Loader2, Download } from 'lucide-react';
import { useMemberInvoices, type MemberInvoiceDoc } from '@/lib/api/invoices';
import { printMemberInvoice } from '@/lib/invoice-pdf';

/* ─── Helpers ─────────────────────────────────────────── */
type RecipientStatus = 'pending' | 'sent' | 'partiel' | 'paid' | 'cancelled' | 'exempt';

const STATUS_CONFIG: Record<RecipientStatus, { badge: string; label: string; icon: React.ReactNode }> = {
  pending:   { badge: 'bg-amber-50 text-amber-700 border-amber-200',       label: 'En attente',  icon: <Clock size={10} />       },
  sent:      { badge: 'bg-amber-50 text-amber-700 border-amber-200',       label: 'En attente',  icon: <Clock size={10} />       },
  partiel:   { badge: 'bg-yellow-50 text-yellow-700 border-yellow-100',   label: 'Partiel',     icon: <Clock size={10} />       },
  paid:      { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Payée',       icon: <CheckCircle2 size={10} /> },
  cancelled: { badge: 'bg-neutral-50 text-neutral-500 border-neutral-200', label: 'Annulée',     icon: <XCircle size={10} />     },
  exempt:    { badge: 'bg-neutral-50 text-neutral-400 border-neutral-200', label: 'Exemptée',    icon: <XCircle size={10} />     },
};

function fmt(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isPending(status: RecipientStatus) {
  return status === 'pending' || status === 'sent' || status === 'partiel';
}

function fmtCfaNum(amount: number) {
  return Number(amount || 0).toLocaleString('fr-FR');
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
/* Résumé rapide (pas une réplique de la facture — l'admin lui-même n'en a pas
   sur cet écran) : la SEULE source de vérité pour l'apparence de la facture est
   le PDF partagé (lib/invoice-pdf.ts), identique pour l'admin et le membre. */
function InvoiceModal({ invoice, onClose }: { invoice: MemberInvoiceDoc; onClose: () => void }) {
  const recipientStatus = invoice.myRecipient?.status ?? 'pending';
  const cfg = STATUS_CONFIG[recipientStatus as RecipientStatus];
  const pending = isPending(recipientStatus as RecipientStatus);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200">
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-600">Facture</p>
            <h3 className="text-lg font-black text-neutral-900">{invoice.title}</h3>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100"><X size={16} /></button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <p className="font-mono text-xs text-neutral-400">{invoice.myRecipient?.invoiceNumber ?? invoice.invoiceNumber}</p>
          <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-black ${cfg.badge}`}>
            {cfg.icon} {cfg.label}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-neutral-50 p-3"><span className="text-[11px] text-neutral-400">Émission</span><b className="mt-0.5 block">{fmt(invoice.issuedAt)}</b></div>
            <div className="rounded-xl bg-neutral-50 p-3"><span className="text-[11px] text-neutral-400">Échéance</span><b className="mt-0.5 block">{fmt(invoice.dueDate)}</b></div>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
            <span className="text-sm font-semibold text-neutral-600">Montant TTC</span>
            <span className="text-xl font-black text-emerald-700">{fmtCfaNum(invoice.amount)} F.CFA</span>
          </div>
        </div>
        <div className="space-y-2 border-t border-neutral-100 px-6 py-4">
          {pending && invoice.paymentLink && (
            <a href={invoice.paymentLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98]">
              <Banknote size={14} /> Payer maintenant
            </a>
          )}
          <button onClick={() => printMemberInvoice(invoice)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 py-2.5 text-sm font-black text-violet-700 transition hover:bg-violet-100">
            <Download size={14} /> Télécharger la facture PDF
          </button>
          <button onClick={onClose} className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 text-sm font-semibold text-neutral-600 transition hover:border-neutral-300">
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
        <p className="text-sm font-black text-neutral-900">{`${fmtCfaNum(invoice.amount)} F.CFA`}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button onClick={() => printMemberInvoice(invoice)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100"
          title="Telecharger la facture PDF">
          <Download size={13} />
        </button>
        <button onClick={onView}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-400 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600"
          title="Voir la facture">
          <Eye size={13} />
        </button>
      </div>
    </div>
  );
}

/* ─── Page principale ─────────────────────────────────── */

export default function MemberFacturesPage() {
  const [selected, setSelected] = useState<MemberInvoiceDoc | null>(null);

  const { data, isLoading, isError } = useMemberInvoices();
  const invoices = data?.data ?? [];

  const pending = useMemo(() =>
    invoices.filter(i => isPending((i.myRecipient?.status ?? 'pending') as RecipientStatus)),
  [invoices]);

  const paid = useMemo(() =>
    invoices.filter(i => i.myRecipient?.status === 'paid' || i.myRecipient?.status === 'exempt'),
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
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {[
          { label: 'Total facturé', num: total,        color: 'text-neutral-900', bg: 'bg-neutral-50  border-neutral-100' },
          { label: 'Payé',          num: paidTotal,    color: 'text-emerald-700', bg: 'bg-emerald-50  border-emerald-100' },
          { label: 'En attente',    num: pendingTotal, color: 'text-amber-700',   bg: 'bg-amber-50    border-amber-100'   },
        ].map(s => (
          <div key={s.label} className={`rounded-xl sm:rounded-2xl border p-2 sm:p-4 ${s.bg}`}>
            {isLoading ? (
              <p className={`text-base sm:text-xl font-black leading-none ${s.color}`}>…</p>
            ) : (
              <p className={`font-black leading-none ${s.color}`}>
                <span className="text-base sm:text-xl">{fmtCfaNum(s.num)}</span>
                <span className="ml-0.5 text-[9px] sm:text-[11px] font-semibold opacity-70"> F.CFA</span>
              </p>
            )}
            <p className="mt-1 sm:mt-1.5 text-[9px] sm:text-xs font-semibold text-neutral-500">{s.label}</p>
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
          <Skeleton />
        </div>
      )}

      {isError && (
        <div role="alert" className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center text-sm text-red-600">
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
