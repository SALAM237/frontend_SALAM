'use client';

import { useMemo, useState } from 'react';
import { Download, FileText, ReceiptText, Send, X } from 'lucide-react';

export type DemoRecipient = {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  memberId?: string;
};

export type DemoDocumentLine = {
  designation: string;
  qty?: number;
  unitPrice: number;
};

export type DemoFinancialDocument = {
  id: string;
  type: 'invoice' | 'receipt';
  title: string;
  number: string;
  issuedAt: string;
  dueDate?: string;
  paidAt?: string;
  recipient: DemoRecipient;
  lines: DemoDocumentLine[];
  note?: string;
  statusLabel?: string;
  reference?: string;
};

const association = {
  name: 'ASSOCIATION SALAM',
  title: 'SALAM Cameroun · Maroc',
  address: 'Yaounde, Cameroun · Rabat, Maroc',
  registration: "N° d'immatriculation : SALAM-CMR-2026",
  email: 'contact@salam-cameroun.com',
  phone: '+237 077 100 47 48',
};

function formatDate(value?: string) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatFcfa(value: number) {
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value)} F.CFA`;
}

function total(lines: DemoDocumentLine[]) {
  return lines.reduce((sum, line) => sum + (line.qty ?? 1) * line.unitPrice, 0);
}

function DocumentPage({ doc }: { doc: DemoFinancialDocument }) {
  const amount = total(doc.lines);
  const isReceipt = doc.type === 'receipt';

  return (
    <div className="mx-auto aspect-[794/1123] w-[794px] max-w-none origin-top overflow-hidden bg-white text-slate-950 shadow-2xl ring-1 ring-slate-200">
      <div className="h-[7px] bg-[linear-gradient(90deg,#0B8F3A_0_33%,#C8102E_33%_66%,#F7C600_66%)]" />
      <div className="bg-[linear-gradient(135deg,#087348,#075f41_62%,#043d2d)] px-10 pb-7 pt-9 text-white">
        <div className="flex items-start justify-between gap-8">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-yellow-200">{association.name}</p>
            <p className="mt-1 text-[12px] font-semibold tracking-[0.12em] text-white/75">
              Solidaire Associative des Lauréats du Maroc
            </p>
            <h1 className="mt-5 text-[38px] font-black leading-none tracking-[-0.04em]">
              {isReceipt ? 'Reçu de paiement' : doc.title}
            </h1>
            <p className="mt-2 font-mono text-[13px] text-white/70">{doc.number}</p>
          </div>
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/12 text-[13px] font-black ring-1 ring-white/15">
            SALAM
          </div>
        </div>
      </div>

      <div className="space-y-7 px-10 py-8">
        <div className="grid grid-cols-2 gap-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Emetteur</p>
            <p className="mt-3 text-[15px] font-black text-slate-900">{association.title}</p>
            <p className="mt-2 text-[12px] leading-relaxed text-slate-500">{association.address}</p>
            <p className="mt-1 text-[12px] text-slate-500">{association.registration}</p>
            <p className="mt-1 text-[12px] text-slate-500">{association.email} · {association.phone}</p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
              {isReceipt ? 'Payé par' : 'Facturé à'}
            </p>
            <p className="mt-3 text-[15px] font-black text-slate-900">{doc.recipient.name}</p>
            {doc.recipient.email && <p className="mt-2 text-[12px] text-slate-500">{doc.recipient.email}</p>}
            {doc.recipient.phone && <p className="mt-1 text-[12px] text-slate-500">{doc.recipient.phone}</p>}
            {doc.recipient.address && <p className="mt-1 text-[12px] text-slate-500">{doc.recipient.address}</p>}
            {doc.recipient.memberId && <p className="mt-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">{doc.recipient.memberId}</p>}
          </section>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Emission</p>
            <p className="mt-1 text-[13px] font-black">{formatDate(doc.issuedAt)}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{isReceipt ? 'Paiement' : 'Echéance'}</p>
            <p className="mt-1 text-[13px] font-black">{formatDate(isReceipt ? doc.paidAt : doc.dueDate)}</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700/60">Statut</p>
            <p className="mt-1 text-[13px] font-black text-emerald-800">{doc.statusLabel ?? (isReceipt ? 'Payé' : 'Emise')}</p>
          </div>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="grid grid-cols-[1fr_80px_130px_140px] bg-slate-950 px-5 py-3 text-[11px] font-black uppercase tracking-wider text-white">
            <span>Désignation</span>
            <span className="text-right">Qté</span>
            <span className="text-right">Prix unit.</span>
            <span className="text-right">Total</span>
          </div>
          {doc.lines.map((line, index) => {
            const qty = line.qty ?? 1;
            return (
              <div key={`${line.designation}-${index}`} className="grid grid-cols-[1fr_80px_130px_140px] border-b border-slate-100 px-5 py-4 text-[13px] last:border-0">
                <span className="font-semibold text-slate-800">{line.designation}</span>
                <span className="text-right text-slate-500">{qty}</span>
                <span className="text-right text-slate-500">{formatFcfa(line.unitPrice)}</span>
                <span className="text-right font-black text-slate-900">{formatFcfa(qty * line.unitPrice)}</span>
              </div>
            );
          })}
        </section>

        <div className="grid grid-cols-[1fr_300px] gap-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-[12px] font-black text-slate-900">{isReceipt ? 'Remerciement' : 'Observations'}</p>
            <p className="mt-2 text-[12px] leading-relaxed text-slate-500">
              {doc.note ?? (isReceipt
                ? "SALAM vous remercie pour votre contribution et votre engagement au service du réseau."
                : "Merci pour votre engagement au sein de SALAM. Cette facture est générée dans la démonstration.")}
            </p>
            {doc.reference && <p className="mt-3 text-[11px] font-semibold text-slate-400">Référence : {doc.reference}</p>}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex justify-between text-[13px]">
              <span className="text-slate-500">Total HT</span>
              <b>{formatFcfa(amount)}</b>
            </div>
            <div className="mt-3 flex justify-between text-[13px]">
              <span className="text-slate-500">TVA</span>
              <b>{formatFcfa(0)}</b>
            </div>
            <div className="mt-5 flex justify-between rounded-xl bg-emerald-700 px-4 py-3 text-white">
              <span className="font-black">Total TTC</span>
              <b>{formatFcfa(amount)}</b>
            </div>
          </section>
        </div>
      </div>

      <div className="absolute-bottom border-t bg-slate-50 px-10 py-4 text-center text-[11px] text-slate-400">
        {association.title} · {association.email} · {association.phone} · {association.registration}
      </div>
    </div>
  );
}

export function DemoFinancialDocumentModal({
  documents,
  onClose,
}: {
  documents: DemoFinancialDocument[];
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [sent, setSent] = useState(false);
  const doc = documents[index];
  const label = doc.type === 'receipt' ? 'Reçu' : 'Facture';
  const scaleClass = 'scale-[0.43] sm:scale-[0.58] lg:scale-[0.76] xl:scale-[0.86]';

  const pageHeight = useMemo(() => {
    if (typeof window === 'undefined') return 720;
    if (window.innerWidth < 640) return 530;
    if (window.innerWidth < 1024) return 690;
    return 930;
  }, []);

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-sm sm:p-5">
      <div className="sticky top-3 z-10 mx-auto mb-4 flex max-w-5xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white shadow-2xl">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
            {doc.type === 'receipt' ? <ReceiptText size={17} /> : <FileText size={17} />}
          </span>
          <div>
            <p className="text-sm font-black">{label} demo A4</p>
            <p className="font-mono text-[11px] text-white/45">{doc.number}</p>
          </div>
        </div>
        {documents.length > 1 && (
          <div className="flex flex-wrap gap-1">
            {documents.map((item, i) => (
              <button
                key={item.id}
                onClick={() => setIndex(i)}
                className={`rounded-full px-3 py-1 text-[11px] font-black transition ${i === index ? 'bg-emerald-500 text-white' : 'bg-white/8 text-white/55 hover:bg-white/12'}`}
              >
                Doc {i + 1}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <button onClick={() => setSent(true)} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-black text-white hover:bg-white/15">
            <Send size={13} /> {sent ? 'Envoye demo' : 'Renvoyer'}
          </button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white hover:bg-emerald-700">
            <Download size={13} /> PDF
          </button>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/8 text-white/60 hover:bg-white/12 hover:text-white">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-slate-100 p-2 sm:p-5">
        <div className="overflow-auto rounded-2xl border border-slate-200 bg-slate-200/80">
          <div className="mx-auto flex justify-center" style={{ height: pageHeight }}>
            <div className={`origin-top ${scaleClass}`}>
              <DocumentPage doc={doc} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
