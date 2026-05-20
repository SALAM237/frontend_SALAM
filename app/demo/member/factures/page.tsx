'use client';

import { Download, FileText } from 'lucide-react';
import { DemoCard, DemoPortalShell, DemoStatus } from '../../_components/DemoShell';
import { demoInvoices } from '@/data/demo/demo-portal';

export default function DemoMemberInvoicesPage() {
  return (
    <DemoPortalShell type="member" title="Mes factures">
      <DemoCard className="overflow-hidden">
        <div className="border-b border-neutral-100 px-5 py-4"><p className="text-sm font-black">Factures disponibles</p></div>
        {demoInvoices.filter(i => i.member === 'Amina Diallo').map(invoice => (
          <div key={invoice.id} className="grid gap-3 border-b border-neutral-50 px-5 py-4 md:grid-cols-[1fr_110px_90px_120px] md:items-center">
            <div className="flex items-center gap-3"><FileText size={17} className="text-emerald-600" /><div><p className="text-sm font-black">{invoice.label}</p><p className="text-xs text-neutral-400">{invoice.id} - {invoice.issuedAt}</p></div></div>
            <p className="font-black">{invoice.amount} MAD</p>
            <DemoStatus tone="green">Payee</DemoStatus>
            <button className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-bold"><Download size={13} /> PDF</button>
          </div>
        ))}
      </DemoCard>
    </DemoPortalShell>
  );
}
