'use client';

import { useState, useMemo } from 'react';
import { Banknote, FileText, Eye, X, CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';
import { useMemberInvoices, type MemberInvoiceDoc } from '@/lib/api/invoices';

/* â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
type RecipientStatus = 'pending' | 'sent' | 'paid' | 'cancelled';

const STATUS_CONFIG: Record<RecipientStatus, { badge: string; label: string; icon: React.ReactNode }> = {
  pending:   { badge: 'bg-amber-50 text-amber-700 border-amber-200',       label: 'En attente',  icon: <Clock size={10} />       },
  sent:      { badge: 'bg-amber-50 text-amber-700 border-amber-200',       label: 'En attente',  icon: <Clock size={10} />       },
  paid:      { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'PayÃ©e',       icon: <CheckCircle2 size={10} /> },
  cancelled: { badge: 'bg-neutral-50 text-neutral-500 border-neutral-200', label: 'AnnulÃ©e',     icon: <XCircle size={10} />     },
};

function fmt(d?: string | null) {
  if (!d) return 'â€”';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isPending(status: RecipientStatus) {
  return status === 'pending' || status === 'sent';
}

function fmtCfa(amount: number) {
  return `${Number(amount || 0).toLocaleString('fr-FR')} F.CFA`;
}

/* â”€â”€â”€ Skeleton â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

/* â”€â”€â”€ Invoice detail modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function InvoiceModal({ invoice, onClose }: { invoice: MemberInvoiceDoc; onClose: () => void }) {
  const recipientStatus = invoice.myRecipient?.status ?? 'pending';
  const cfg = STATUS_CONFIG[recipientStatus as RecipientStatus];
  const pending = isPending(recipientStatus as RecipientStatus);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/55 p-3 backdrop-blur-sm sm:p-6">
      <div className="mx-auto flex max-w-[860px] flex-col gap-3">
        <div className="flex justify-end">
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-500 shadow-lg hover:text-neutral-900">
            <X size={16} />
          </button>
        </div>
        <div className="overflow-auto rounded-2xl bg-neutral-100 p-3 shadow-2xl">
          <div className="mx-auto w-[794px] origin-top scale-[0.43] rounded-2xl bg-white text-slate-950 shadow-xl sm:scale-100" style={{ height: 1123 }}>
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-700 via-red-600 to-amber-400" />
            <header className="h-[130px] bg-gradient-to-br from-[#087348] via-[#075f41] to-[#043d2d] px-8 py-6 text-white">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-yellow-200">Association SALAM</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">Facture</h2>
              <p className="mt-1 font-mono text-xs text-white/75">{invoice.myRecipient?.invoiceNumber ?? invoice.invoiceNumber}</p>
            </header>
            <main className="space-y-6 px-8 py-8">
              <div className="grid grid-cols-2 gap-6">
                <section className="rounded-2xl border border-neutral-200 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-400">Émetteur</p>
                  <p className="mt-2 text-lg font-black text-neutral-900">SALAM Cameroun · Maroc</p>
                  <p className="mt-2 text-sm text-neutral-500">contact@salam-cameroun.com</p>
                  <p className="text-sm text-neutral-500">Association SALAM</p>
                </section>
                <section className="rounded-2xl border border-neutral-200 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-400">Facturé à</p>
                  <p className="mt-2 text-lg font-black text-neutral-900">Membre SALAM</p>
                  <p className="mt-2 text-sm text-neutral-500">Espace membre</p>
                  <p className="text-sm text-neutral-500">Document personnel</p>
                </section>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl bg-neutral-50 p-4"><span className="text-neutral-400">Émission</span><b className="mt-1 block">{fmt(invoice.issuedAt)}</b></div>
                <div className="rounded-xl bg-neutral-50 p-4"><span className="text-neutral-400">Échéance</span><b className="mt-1 block">{fmt(invoice.dueDate)}</b></div>
                <div className="rounded-xl bg-neutral-50 p-4"><span className="text-neutral-400">Statut</span><b className="mt-1 block">{cfg.label}</b></div>
              </div>
              <section className="overflow-hidden rounded-2xl border border-neutral-200">
                <div className="grid grid-cols-[1fr_140px] bg-slate-950 px-5 py-3 text-xs font-black uppercase tracking-wider text-white">
                  <span>Désignation</span><span className="text-right">Montant</span>
                </div>
                <div className="grid grid-cols-[1fr_140px] px-5 py-5 text-sm">
                  <div>
                    <p className="font-black">{invoice.title}</p>
                    {invoice.description && <p className="mt-1 leading-relaxed text-neutral-500">{invoice.description}</p>}
                  </div>
                  <b className="text-right">{fmtCfa(invoice.amount)}</b>
                </div>
              </section>
              <div className="ml-auto w-[320px] rounded-2xl bg-neutral-50 p-5">
                <div className="flex justify-between text-sm"><span>Total HT</span><b>{fmtCfa(invoice.amount)}</b></div>
                <div className="mt-2 flex justify-between text-sm"><span>TVA</span><b>0 F.CFA</b></div>
                <div className="mt-4 flex justify-between rounded-xl bg-emerald-700 px-4 py-3 text-white"><span className="font-bold">Total TTC</span><b>{fmtCfa(invoice.amount)}</b></div>
              </div>
              <div className={`mx-auto flex w-fit items-center gap-2 rounded-full border-2 px-6 py-2 ${recipientStatus === 'paid' ? 'border-emerald-500 text-emerald-700' : pending ? 'border-amber-400 text-amber-700' : 'border-neutral-300 text-neutral-500'}`}>
                {recipientStatus === 'paid' ? <CheckCircle2 size={16} /> : pending ? <Clock size={16} /> : <XCircle size={16} />}
                <span className="text-sm font-black uppercase tracking-[0.18em]">{cfg.label}</span>
              </div>
            </main>
            <footer className="border-t bg-slate-50 px-8 py-4 text-center text-xs text-slate-500">Page 1/1</footer>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-xl">
          {pending && invoice.paymentLink && (
            <a href={invoice.paymentLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98]">
              <Banknote size={14} /> Payer maintenant
            </a>
          )}
          <button onClick={onClose} className="mt-3 w-full rounded-xl border border-neutral-200 bg-white py-2.5 text-sm font-semibold text-neutral-600 transition hover:border-neutral-300">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Invoice row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
          {!pending ? `PayÃ©e le ${fmt(invoice.myRecipient?.paidAt)}` : `Ã‰chÃ©ance : ${fmt(invoice.dueDate)}`}
        </p>
      </div>
      <div className="shrink-0 text-right hidden sm:block">
        <p className="text-sm font-black text-neutral-900">{fmtCfa(invoice.amount)}</p>
      </div>
      <button onClick={onView}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-400 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600"
        title="Voir la facture">
        <Eye size={13} />
      </button>
    </div>
  );
}

/* â”€â”€â”€ Page principale â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export default function MemberFacturesPage() {
  const [selected, setSelected] = useState<MemberInvoiceDoc | null>(null);

  const { data, isLoading, isError } = useMemberInvoices();
  const invoices = data?.data ?? [];

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
        <p className="mt-1 text-sm text-neutral-500">Factures Ã©mises par l&apos;association pour les Ã©vÃ©nements.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total facturÃ©', value: isLoading ? 'â€¦' : fmtCfa(total),        color: 'text-neutral-900', bg: 'bg-neutral-50  border-neutral-100' },
          { label: 'PayÃ©',          value: isLoading ? 'â€¦' : fmtCfa(paidTotal),    color: 'text-emerald-700', bg: 'bg-emerald-50  border-emerald-100' },
          { label: 'En attente',    value: isLoading ? 'â€¦' : fmtCfa(pendingTotal), color: 'text-amber-700',   bg: 'bg-amber-50    border-amber-100'   },
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
          Erreur de chargement. VÃ©rifiez votre connexion.
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
            En attente de paiement â€” {pending.length}
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
            PayÃ©es â€” {paid.length}
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
