'use client';

import { useState } from 'react';
import { Download, Eye, FolderOpen } from 'lucide-react';
import { DemoCard, DemoPortalShell } from '../../_components/DemoShell';
import { demoDocuments, demoMemberProfile } from '@/data/demo/demo-portal';
import { DemoFinancialDocumentModal, type DemoFinancialDocument } from '@/components/demo/DemoFinancialDocument';

function financialDocument(id: string): DemoFinancialDocument | null {
  if (id.startsWith('SALAM-FACT')) {
    return {
      id,
      type: 'invoice',
      title: 'Cotisation annuelle 2026',
      number: id,
      issuedAt: '2026-01-10',
      dueDate: '2026-01-31',
      recipient: {
        name: `${demoMemberProfile.firstName} ${demoMemberProfile.lastName}`,
        email: demoMemberProfile.email,
        phone: demoMemberProfile.phone,
        address: `${demoMemberProfile.city}, Maroc`,
        memberId: demoMemberProfile.id,
      },
      lines: [{ designation: 'Frais d’adhésion annuelle 2026', qty: 1, unitPrice: 5000 }],
      statusLabel: 'Payée',
    };
  }
  if (id.startsWith('SALAM-RECU')) {
    return {
      id,
      type: 'receipt',
      title: 'Reçu de paiement',
      number: id,
      issuedAt: '2026-01-12',
      paidAt: '2026-01-12',
      recipient: {
        name: `${demoMemberProfile.firstName} ${demoMemberProfile.lastName}`,
        email: demoMemberProfile.email,
        phone: demoMemberProfile.phone,
        address: `${demoMemberProfile.city}, Maroc`,
        memberId: demoMemberProfile.id,
      },
      lines: [{ designation: 'Frais d’adhésion annuelle 2026', qty: 1, unitPrice: 5000 }],
      statusLabel: 'Payé',
      reference: 'DEMO-COT-2026-001',
    };
  }
  return null;
}

export default function DemoMemberDocumentsPage() {
  const [doc, setDoc] = useState<DemoFinancialDocument | null>(null);

  return (
    <DemoPortalShell type="member" title="Mes documents">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {demoDocuments.map(item => {
          const financial = financialDocument(item.id);
          return (
          <DemoCard key={item.id} className="p-5">
            <FolderOpen className="mb-4 text-emerald-600" size={24} />
            <p className="text-sm font-black">{item.title}</p>
            <p className="mt-1 text-xs text-neutral-400">{item.type} - {item.size} - {item.updatedAt}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {financial && (
                <button onClick={() => setDoc(financial)} className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                  <Eye size={13} /> Voir
                </button>
              )}
              <button onClick={() => financial && setDoc(financial)} className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 text-xs font-bold"><Download size={13} /> Telecharger</button>
            </div>
          </DemoCard>
        );})}
      </div>
      {doc && <DemoFinancialDocumentModal documents={[doc]} onClose={() => setDoc(null)} />}
    </DemoPortalShell>
  );
}
