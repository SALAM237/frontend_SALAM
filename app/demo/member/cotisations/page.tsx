'use client';

import { Banknote } from 'lucide-react';
import { DemoCard, DemoPortalShell, DemoStatus } from '../../_components/DemoShell';
import { demoCotisations } from '@/data/demo/demo-portal';

export default function DemoMemberCotisationsPage() {
  const mine = demoCotisations.filter(item => item.member === 'Amina Diallo');
  return (
    <DemoPortalShell type="member" title="Cotisations">
      <DemoCard className="overflow-hidden">
        <div className="border-b border-neutral-100 px-5 py-4"><p className="text-sm font-black">Mes cotisations demo</p></div>
        {mine.map(item => (
          <div key={item.id} className="flex items-center gap-3 border-b border-neutral-50 px-5 py-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><Banknote size={17} /></div>
            <div className="min-w-0 flex-1"><p className="text-sm font-black">{item.label}</p><p className="text-xs text-neutral-400">Echeance {item.dueDate}</p></div>
            <p className="font-black">{item.amount} MAD</p>
            <DemoStatus tone="green">Payee</DemoStatus>
          </div>
        ))}
      </DemoCard>
    </DemoPortalShell>
  );
}
