'use client';

import { useState } from 'react';
import { Download, Eye, FileText } from 'lucide-react';
import { DemoCard, DemoPortalShell, DemoStatus } from '../../_components/DemoShell';
import { demoInvoices, demoMemberProfile } from '@/data/demo/demo-portal';
import { DemoFinancialDocumentModal, type DemoFinancialDocument } from '@/components/demo/DemoFinancialDocument';

function invoiceDocument(invoice: typeof demoInvoices[number]): DemoFinancialDocument {
  return {
    id: invoice.id,
    type: 'invoice',
    title: invoice.label,
    number: invoice.id,
    issuedAt: invoice.issuedAt,
    dueDate: invoice.dueDate,
    recipient: {
      name: invoice.member,
      email: demoMemberProfile.email,
      phone: demoMemberProfile.phone,
      address: `${demoMemberProfile.city}, Maroc`,
      memberId: demoMemberProfile.id,
    },
    lines: [{ designation: invoice.label, qty: 1, unitPrice: invoice.amount }],
    statusLabel: invoice.status === 'paid' ? 'Payée' : invoice.status === 'sent' ? 'Envoyée' : 'Brouillon',
    note: "Facture de démonstration générée avec le même rendu A4 que l'espace réel.",
  };
}

export default function DemoMemberInvoicesPage() {
  const [doc, setDoc] = useState<DemoFinancialDocument | null>(null);
  const mine = demoInvoices.filter(i => i.member === 'Amina Diallo');

  return (
    <DemoPortalShell type="member" title="Mes factures">
      <DemoCard className="overflow-hidden">
        <div className="border-b border-neutral-100 px-5 py-4"><p className="text-sm font-black">Factures disponibles</p></div>
        {mine.map(invoice => (
          <div key={invoice.id} className="grid gap-3 border-b border-neutral-50 px-5 py-4 md:grid-cols-[1fr_130px_90px_190px] md:items-center">
            <div className="flex items-center gap-3"><FileText size={17} className="text-emerald-600" /><div><p className="text-sm font-black">{invoice.label}</p><p className="text-xs text-neutral-400">{invoice.id} - {invoice.issuedAt}</p></div></div>
            <p className="font-black">{invoice.amount.toLocaleString('fr-FR')} F.CFA</p>
            <DemoStatus tone="green">Payee</DemoStatus>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setDoc(invoiceDocument(invoice))} className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-bold transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"><Eye size={13} /> Voir</button>
              <button onClick={() => setDoc(invoiceDocument(invoice))} className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-bold transition hover:border-neutral-300"><Download size={13} /> PDF</button>
            </div>
          </div>
        ))}
      </DemoCard>
      {doc && <DemoFinancialDocumentModal documents={[doc]} onClose={() => setDoc(null)} />}
    </DemoPortalShell>
  );
}
