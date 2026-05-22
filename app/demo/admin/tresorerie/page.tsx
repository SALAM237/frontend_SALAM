'use client';

import { Banknote, CircleDollarSign, Package, TrendingDown, TrendingUp } from 'lucide-react';
import { DemoPortalShell } from '../../_components/DemoShell';
import { demoTreasuryOverview } from '@/data/demo/demo-extra';

const fmt = (n: number) => `${new Intl.NumberFormat('fr-FR').format(n)} F.CFA`;

function Kpi({ label, value, icon: Icon, tone }: { label: string; value: string; icon: React.ElementType; tone: string }) {
  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}><Icon size={16} /></div>
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-neutral-400">{label}</p>
      <p className="mt-1 text-xl font-black tracking-[-0.04em] text-neutral-900">{value}</p>
    </div>
  );
}

export default function DemoAdminTreasuryPage() {
  const { kpis, monthly, sources, transactions } = demoTreasuryOverview;
  const max = Math.max(...monthly.map(row => Math.max(row.income, row.expense)));

  return (
    <DemoPortalShell type="admin" title="Tresorerie">
      <div className="mx-auto max-w-6xl space-y-5">
        <div>
          <h1 className="text-2xl font-black tracking-[-0.04em] text-neutral-900">Tresorerie</h1>
          <p className="text-sm text-neutral-500">Vue demo des flux financiers, dons, frais d'adhesion et patrimoine.</p>
        </div>
        <div className="flex gap-2 overflow-x-auto rounded-2xl border border-neutral-100 bg-white p-1 shadow-sm">
          {['Vue d’ensemble', 'Encaissements', 'Decaissements', 'Dons', 'Patrimoine'].map((tab, index) => (
            <button key={tab} className={`shrink-0 rounded-xl px-4 py-2 text-xs font-black ${index === 0 ? 'bg-emerald-600 text-white' : 'text-neutral-500 hover:bg-neutral-50'}`}>{tab}</button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi label="Solde disponible" value={fmt(kpis.balance)} icon={Banknote} tone="bg-emerald-50 text-emerald-700" />
          <Kpi label="Encaissements" value={fmt(kpis.income)} icon={TrendingUp} tone="bg-blue-50 text-blue-700" />
          <Kpi label="Decaissements" value={fmt(kpis.expense)} icon={TrendingDown} tone="bg-red-50 text-red-600" />
          <Kpi label="Patrimoine" value={fmt(kpis.assetsValue)} icon={Package} tone="bg-amber-50 text-amber-700" />
        </div>
        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <section className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
            <h2 className="font-black text-neutral-900">Flux mensuels</h2>
            <div className="mt-5 flex h-64 items-end gap-4">
              {monthly.map(row => (
                <div key={row.month} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-48 w-full items-end justify-center gap-1">
                    <div className="w-5 rounded-t bg-emerald-500" style={{ height: `${(row.income / max) * 100}%` }} />
                    <div className="w-5 rounded-t bg-red-400" style={{ height: `${(row.expense / max) * 100}%` }} />
                  </div>
                  <span className="text-xs font-bold text-neutral-400">{row.month}</span>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
            <h2 className="font-black text-neutral-900">Sources financieres</h2>
            <div className="mt-4 space-y-3">
              {sources.map(source => (
                <div key={source.source}>
                  <div className="mb-1 flex justify-between text-xs font-bold"><span>{source.source}</span><span>{fmt(source.amount)}</span></div>
                  <div className="h-2 rounded-full bg-neutral-100"><div className="h-full rounded-full" style={{ width: `${(source.amount / kpis.income) * 100}%`, background: source.color }} /></div>
                </div>
              ))}
            </div>
          </section>
        </div>
        <section className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
          <h2 className="font-black text-neutral-900">Dernieres operations</h2>
          <div className="mt-4 divide-y divide-neutral-50">
            {transactions.map(item => (
              <div key={item.id} className="flex items-center gap-3 py-3">
                <CircleDollarSign size={16} className="text-emerald-600" />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-black text-neutral-900">{item.label}</p><p className="text-xs text-neutral-400">{item.kind} - {item.date}</p></div>
                <p className="text-sm font-black text-neutral-900">{fmt(item.amount)}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DemoPortalShell>
  );
}
