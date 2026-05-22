'use client';

import { Banknote, HeartHandshake, Package, TrendingUp } from 'lucide-react';
import { DemoPortalShell } from '../../_components/DemoShell';
import { demoTreasuryOverview } from '@/data/demo/demo-extra';

const fmt = (n: number) => `${new Intl.NumberFormat('fr-FR').format(n)} F.CFA`;

export default function DemoMemberTreasuryPage() {
  const { kpis, sources } = demoTreasuryOverview;
  const cards: Array<{ label: string; value: string; icon: React.ElementType; tone: string }> = [
    { label: 'Solde', value: fmt(kpis.balance), icon: Banknote, tone: 'bg-emerald-50 text-emerald-700' },
    { label: 'Dons', value: fmt(kpis.donations), icon: HeartHandshake, tone: 'bg-amber-50 text-amber-700' },
    { label: 'Patrimoine', value: fmt(kpis.assetsValue), icon: Package, tone: 'bg-blue-50 text-blue-700' },
  ];
  return (
    <DemoPortalShell type="member" title="Tresorerie">
      <div className="mx-auto max-w-5xl space-y-5">
        <div><h1 className="text-2xl font-black text-neutral-900">Tresorerie</h1><p className="text-sm text-neutral-500">Reporting transparent partage aux membres en mode demo.</p></div>
        <div className="grid gap-3 sm:grid-cols-3">
          {cards.map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><Icon size={17} /></div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">{label}</p>
              <p className="mt-1 text-xl font-black text-neutral-900">{value}</p>
            </div>
          ))}
        </div>
        <section className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
          <h2 className="font-black text-neutral-900">Sources financieres</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {sources.map(source => (
              <div key={source.source} className="rounded-xl border border-neutral-100 p-4">
                <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ background: source.color }} /><p className="text-sm font-black">{source.source}</p></div>
                <p className="mt-2 text-lg font-black text-neutral-900">{fmt(source.amount)}</p>
              </div>
            ))}
          </div>
        </section>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <div className="flex items-center gap-2 text-emerald-800"><TrendingUp size={16} /><p className="font-black">Taux de recouvrement : {kpis.recoveryRate}%</p></div>
          <p className="mt-1 text-sm text-emerald-700">Les frais d'adhesion encaisses alimentent automatiquement ce reporting dans la vraie plateforme.</p>
        </div>
      </div>
    </DemoPortalShell>
  );
}
