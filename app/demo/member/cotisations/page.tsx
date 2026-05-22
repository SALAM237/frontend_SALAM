'use client';

import { useState } from 'react';
import { Banknote, Eye, FileText, ReceiptText } from 'lucide-react';
import { DemoCard, DemoPortalShell, DemoStatus } from '../../_components/DemoShell';
import { demoCotisations, demoMemberProfile } from '@/data/demo/demo-portal';
import { DemoFinancialDocumentModal, type DemoFinancialDocument } from '@/components/demo/DemoFinancialDocument';

function cotisationInvoice(item: typeof demoCotisations[number]): DemoFinancialDocument {
  return {
    id: item.invoiceId ?? item.id,
    type: 'invoice',
    title: item.label,
    number: item.invoiceId ?? `SALAM-FACT-${item.id}`,
    issuedAt: item.dueDate,
    dueDate: item.dueDate,
    recipient: {
      name: item.member,
      email: demoMemberProfile.email,
      phone: demoMemberProfile.phone,
      address: `${demoMemberProfile.city}, Maroc`,
      memberId: demoMemberProfile.id,
    },
    lines: [{ designation: item.label, qty: 1, unitPrice: item.amount }],
    statusLabel: item.status === 'paid' ? 'Payée' : 'En attente',
    note: "Facture de frais d'adhésion disponible dans l'espace membre de démonstration.",
  };
}

function cotisationReceipt(item: typeof demoCotisations[number]): DemoFinancialDocument {
  return {
    id: item.receiptId ?? `RECU-${item.id}`,
    type: 'receipt',
    title: 'Reçu de paiement',
    number: item.receiptId ?? `SALAM-RECU-${item.id}`,
    issuedAt: item.paidAt ?? item.dueDate,
    paidAt: item.paidAt ?? item.dueDate,
    recipient: {
      name: item.member,
      email: demoMemberProfile.email,
      phone: demoMemberProfile.phone,
      address: `${demoMemberProfile.city}, Maroc`,
      memberId: demoMemberProfile.id,
    },
    lines: [{ designation: item.label, qty: 1, unitPrice: item.amount }],
    statusLabel: 'Payé',
    reference: `DEMO-${item.id}`,
    note: "SALAM vous remercie pour le règlement de vos frais d'adhésion.",
  };
}

export default function DemoMemberCotisationsPage() {
  const [doc, setDoc] = useState<DemoFinancialDocument | null>(null);
  const mine = demoCotisations.filter(item => item.member === 'Amina Diallo');
  return (
    <DemoPortalShell type="member" title="Cotisations">
      <DemoCard className="overflow-hidden">
        <div className="border-b border-neutral-100 px-5 py-4"><p className="text-sm font-black">Mes cotisations demo</p></div>
        {mine.map(item => (
          <div key={item.id} className="flex flex-wrap items-center gap-3 border-b border-neutral-50 px-5 py-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><Banknote size={17} /></div>
            <div className="min-w-0 flex-1"><p className="text-sm font-black">{item.label}</p><p className="text-xs text-neutral-400">Echeance {item.dueDate}</p></div>
            <p className="font-black">{item.amount.toLocaleString('fr-FR')} F.CFA</p>
            <DemoStatus tone="green">Payee</DemoStatus>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setDoc(cotisationInvoice(item))} className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-bold transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700">
                <FileText size={13} /> Facture
              </button>
              {item.status === 'paid' && (
                <button onClick={() => setDoc(cotisationReceipt(item))} className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-bold transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700">
                  <ReceiptText size={13} /> Reçu
                </button>
              )}
              <button onClick={() => setDoc(item.status === 'paid' ? cotisationReceipt(item) : cotisationInvoice(item))} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition hover:bg-neutral-50" title="Visualiser">
                <Eye size={13} />
              </button>
            </div>
          </div>
        ))}
      </DemoCard>
      {doc && <DemoFinancialDocumentModal documents={[doc]} onClose={() => setDoc(null)} />}
    </DemoPortalShell>
  );
}
