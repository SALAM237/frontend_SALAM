'use client';

import { Banknote, CheckCircle2 } from 'lucide-react';
import { DemoCard, DemoPortalShell, DemoStatus } from '../../_components/DemoShell';
import { demoCotisations } from '@/data/demo/demo-portal';

export default function DemoAdminCotisationsPage() {
  const total = demoCotisations.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0);
  return (
    <DemoPortalShell type="admin" title="Frais d'adhesion">
      <div className="mx-auto max-w-5xl space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <DemoCard className="p-4"><Banknote className="mb-2 text-emerald-600" size={18} /><p className="text-2xl font-black">{total} MAD</p><p className="text-xs text-neutral-400">Encaisse demo</p></DemoCard>
          <DemoCard className="p-4"><CheckCircle2 className="mb-2 text-blue-600" size={18} /><p className="text-2xl font-black">2</p><p className="text-xs text-neutral-400">Cotisations reglees</p></DemoCard>
          <DemoCard className="p-4"><Banknote className="mb-2 text-amber-600" size={18} /><p className="text-2xl font-black">2</p><p className="text-xs text-neutral-400">A relancer</p></DemoCard>
        </div>
        <DemoCard className="overflow-hidden">
          <div className="border-b border-neutral-100 px-5 py-4"><p className="text-sm font-black">Suivi des cotisations</p></div>
          <div className="divide-y divide-neutral-50">
            {demoCotisations.map(item => (
              <div key={item.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_120px_130px_110px] md:items-center">
                <div><p className="text-sm font-semibold text-neutral-900">{item.member}</p><p className="text-xs text-neutral-400">{item.label} - echeance {item.dueDate}</p></div>
                <p className="text-sm font-black">{item.amount} MAD</p>
                <DemoStatus tone={item.status === 'paid' ? 'green' : item.status === 'late' ? 'red' : 'amber'}>{item.status === 'paid' ? 'Payee' : item.status === 'late' ? 'En retard' : 'En attente'}</DemoStatus>
                <button className="flex h-8 items-center justify-center rounded-lg border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-600 transition hover:border-emerald-300 hover:text-emerald-700">Relancer</button>
              </div>
            ))}
          </div>
        </DemoCard>
      </div>
    </DemoPortalShell>
  );
}
