'use client';

import { useEffect, useState } from 'react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  AlertTriangle, ArrowDownRight, ArrowUpRight, Banknote, CheckCircle2, Clock,
  Download, FileUp, Filter, Package, Plus, RefreshCw, Settings2, Trash2, WalletCards,
} from 'lucide-react';
import { AnimatedTabBar } from '@/components/ui/AnimatedTabBar';
import { demoTreasuryOverview } from '@/data/demo/demo-extra';

type TabValue = 'overview' | 'income' | 'expense' | 'don' | 'assets';
type Mode = 'admin' | 'member';

const tabs: { value: TabValue; label: string }[] = [
  { value: 'overview', label: "Vue d'ensemble" },
  { value: 'income', label: 'Encaissements' },
  { value: 'expense', label: 'Decaissements' },
  { value: 'don', label: 'Dons' },
  { value: 'assets', label: 'Patrimoine' },
];

const sourceColors = ['#059669', '#2563eb', '#f59e0b', '#7c3aed', '#dc2626', '#0f766e', '#64748b'];

function formatFcfa(value: number) {
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value)} F.CFA`;
}

const assets = [
  { _id: 'asset-1', name: 'Ordinateur bureau tresorerie', category: 'Informatique', condition: 'Bon', estimatedValue: 450000 },
  { _id: 'asset-2', name: 'Sono evenementielle', category: 'Materiel evenement', condition: 'Utilise', estimatedValue: 620000 },
  { _id: 'asset-3', name: 'Kakemonos SALAM', category: 'Communication', condition: 'Bon', estimatedValue: 180000 },
];

function transactions() {
  return demoTreasuryOverview.transactions.map((item, index) => ({
    _id: item.id,
    kind: item.kind.toLowerCase().includes('decaissement') ? 'expense' : 'income',
    source: index === 0 ? 'don' : index === 1 ? 'activity' : 'partner',
    label: item.label,
    amount: item.amount,
    occurredAt: item.date,
  }));
}

export function DemoTreasuryDashboard({ mode }: { mode: Mode }) {
  const [tab, setTab] = useState<TabValue>('overview');
  const [deleted, setDeleted] = useState<string[]>([]);
  const [chartsReady, setChartsReady] = useState(false);
  const data = demoTreasuryOverview;
  const txItems = transactions().filter(item => !deleted.includes(item._id));
  const incomeItems = txItems.filter(item => item.kind === 'income');
  const expenseItems = txItems.filter(item => item.kind === 'expense');
  const donationItems = txItems.filter(item => item.source === 'don');
  const visibleItems = tab === 'income' ? incomeItems : tab === 'expense' ? expenseItems : tab === 'don' ? donationItems : txItems;
  const sourceData = data.sources;
  const balanceTone = data.kpis.balance >= 0 ? 'emerald' : 'red';

  const sourceRank = sourceData.map((source, index) => ({ label: source.source, value: source.amount, color: sourceColors[index % sourceColors.length] }));

  useEffect(() => {
    setChartsReady(true);
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Tresorerie</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {mode === 'admin'
              ? 'Pilotage demo des encaissements, decaissements, dons, justificatifs et patrimoine.'
              : 'Vue demo transparente des ressources, depenses, dons et patrimoine de SALAM.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {mode === 'admin' ? (
            <>
              <button className="inline-flex h-9 items-center gap-2 rounded-xl bg-emerald-600 px-3 text-xs font-black text-white shadow-sm transition hover:bg-emerald-700">
                <Plus size={14} /> Ajouter demo
              </button>
              <button className="inline-flex h-9 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-black text-neutral-600 transition hover:border-emerald-200 hover:text-emerald-700">
                <FileUp size={14} /> Importer
              </button>
              <button className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 transition hover:border-emerald-200 hover:text-emerald-700">
                <Settings2 size={15} />
              </button>
            </>
          ) : (
            <button className="inline-flex h-9 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-black text-neutral-600 transition hover:border-emerald-200 hover:text-emerald-700">
              <Filter size={14} /> Filtres
            </button>
          )}
          <button className="inline-flex h-9 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-black text-neutral-600 transition hover:border-emerald-200 hover:text-emerald-700">
            <Download size={14} /> Exporter
          </button>
          <button className="inline-flex h-9 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-black text-neutral-600 transition hover:border-emerald-200 hover:text-emerald-700">
            <RefreshCw size={14} /> Actualiser
          </button>
        </div>
      </div>

      {mode === 'member' && (
        <section className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-neutral-900">Validation demo en attente</p>
              <p className="mt-1 text-xs leading-5 text-neutral-600">
                Frais d'adhesion : <b>{formatFcfa(5000)}</b> vers <b>{formatFcfa(data.kpis.membershipFee)}</b>. Validation actuelle : 2/3.
              </p>
            </div>
            <div className="flex gap-2">
              <button className="inline-flex h-9 items-center gap-2 rounded-xl border border-red-100 bg-white px-3 text-xs font-black text-red-600">Refuser</button>
              <button className="inline-flex h-9 items-center gap-2 rounded-xl bg-emerald-600 px-3 text-xs font-black text-white"><CheckCircle2 size={14} /> Valider</button>
            </div>
          </div>
        </section>
      )}

      <AnimatedTabBar items={tabs} value={tab} onChange={setTab} />

      {tab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
            <Kpi label="Solde disponible" value={formatFcfa(data.kpis.balance)} icon={WalletCards} tone={balanceTone} />
            <Kpi label="Encaissements" value={formatFcfa(data.kpis.income)} icon={ArrowUpRight} tone="emerald" />
            <Kpi label="Decaissements" value={formatFcfa(data.kpis.expense)} icon={ArrowDownRight} tone="red" />
            <Kpi label={mode === 'admin' ? "Adhesions en attente" : 'En attente'} value={formatFcfa(data.kpis.pendingAdhesions)} icon={Clock} tone="amber" sub={`${data.kpis.activeMembers} membres actifs`} />
            <Kpi label="Frais adhesion" value={formatFcfa(data.kpis.membershipFee)} icon={Banknote} tone="blue" />
            <Kpi label="Patrimoine" value={formatFcfa(data.kpis.assetsValue)} icon={Package} tone="violet" sub={`${data.kpis.assetsCount} element(s)`} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardTitle title="Evolution encaissements & depenses" />
              <div className="h-[300px]">
                {chartsReady ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.monthly.map(item => ({ label: item.month, income: item.income, expense: item.expense }))}>
                      <defs>
                        <linearGradient id={`demoIncome-${mode}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#059669" stopOpacity={0.28} /><stop offset="100%" stopColor="#059669" stopOpacity={0} /></linearGradient>
                        <linearGradient id={`demoExpense-${mode}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#dc2626" stopOpacity={0.16} /><stop offset="100%" stopColor="#dc2626" stopOpacity={0} /></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${Math.round(Number(v) / 1000)}k`} />
                      <Tooltip formatter={v => formatFcfa(Number(v ?? 0))} />
                      <Area type="monotone" dataKey="income" stroke="#059669" fill={`url(#demoIncome-${mode})`} strokeWidth={2} name="Encaissements" />
                      <Area type="monotone" dataKey="expense" stroke="#dc2626" fill={`url(#demoExpense-${mode})`} strokeWidth={2} name="Depenses" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <ChartPlaceholder />}
              </div>
            </Card>

            <Card>
              <CardTitle title="Sources financieres" />
              <div className="h-[210px]">
                {chartsReady ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={sourceData} dataKey="amount" nameKey="source" innerRadius={56} outerRadius={84} paddingAngle={4}>
                        {sourceData.map((_, i) => <Cell key={i} fill={sourceColors[i % sourceColors.length]} />)}
                      </Pie>
                      <Tooltip formatter={v => formatFcfa(Number(v ?? 0))} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <ChartPlaceholder />}
              </div>
              <div className="mt-1 space-y-2">
                {sourceData.map((source, i) => (
                  <div key={source.source} className="flex items-center justify-between gap-3 text-xs">
                    <span className="flex min-w-0 items-center gap-2 font-semibold text-neutral-500">
                      <i className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: sourceColors[i % sourceColors.length] }} />
                      <span className="truncate">{source.source}</span>
                    </span>
                    <b className="shrink-0 text-neutral-900">{formatFcfa(source.amount)}</b>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardTitle title="Tresorerie previsionnelle" />
              <div className="h-[220px]">
                {chartsReady ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { period: '30j', prudent: data.kpis.paidAdhesions, realiste: data.kpis.expectedAdhesions, optimiste: data.kpis.expectedAdhesions + data.kpis.membershipFee },
                      { period: '60j', prudent: data.kpis.paidAdhesions, realiste: data.kpis.expectedAdhesions + data.kpis.pendingAdhesions * 0.25, optimiste: data.kpis.expectedAdhesions + data.kpis.pendingAdhesions * 0.5 },
                      { period: '90j', prudent: data.kpis.expectedAdhesions, realiste: data.kpis.expectedAdhesions + data.kpis.pendingAdhesions * 0.5, optimiste: data.kpis.expectedAdhesions + data.kpis.pendingAdhesions },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${Math.round(Number(v) / 1000)}k`} />
                      <Tooltip formatter={v => formatFcfa(Number(v ?? 0))} />
                      <Bar dataKey="prudent" fill="#f4b6b6" radius={[5, 5, 0, 0]} name="Prudent" />
                      <Bar dataKey="realiste" fill="#8b7cf6" radius={[5, 5, 0, 0]} name="Realiste" />
                      <Bar dataKey="optimiste" fill="#6fc29b" radius={[5, 5, 0, 0]} name="Optimiste" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <ChartPlaceholder />}
              </div>
            </Card>
            <Card>
              <CardTitle title="Taux de recouvrement adhesions" />
              <div className="flex h-[220px] flex-col items-center justify-center text-center">
                <div className="text-5xl font-black tracking-[-0.05em] text-emerald-700">{data.kpis.recoveryRate}<span className="text-2xl">%</span></div>
                <p className="mt-3 text-sm font-semibold text-neutral-500">des frais d'adhesion encaisses</p>
                <p className="mt-1 text-xs text-neutral-400">{formatFcfa(data.kpis.pendingAdhesions)} encore en attente</p>
              </div>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card><CardTitle title="Alertes" /><InfoRow icon={AlertTriangle} tone="amber" title="Adhesions en attente" text={`${formatFcfa(data.kpis.pendingAdhesions)} restent a recouvrer.`} compact /></Card>
            <Card><CardTitle title="Recommandations" /><InfoRow icon={Clock} tone="blue" title="Relance douce" text="Prioriser les membres actifs dont la cotisation annuelle reste impayee." compact /><InfoRow icon={CheckCircle2} tone="emerald" title="Justificatifs" text="Associer les documents aux ecritures importantes." compact /></Card>
            <Card><CardTitle title="Top sources" /><RankList items={sourceRank} /></Card>
            <Card><CardTitle title="Patrimoine" /><RankList items={assets.map(item => ({ label: item.name, value: item.estimatedValue }))} /></Card>
          </div>
        </div>
      )}

      {tab !== 'overview' && tab !== 'assets' && (
        <TransactionList
          title={tab === 'income' ? 'Encaissements' : tab === 'expense' ? 'Decaissements' : 'Dons recus'}
          items={visibleItems}
          canDelete={mode === 'admin'}
          onDelete={id => setDeleted(prev => [...prev, id])}
        />
      )}
      {tab === 'assets' && <AssetList items={assets} canDelete={mode === 'admin'} />}
    </div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-neutral-200/70 bg-white p-5 shadow-sm ${className}`}>{children}</section>;
}

function CardTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return <div className="mb-4"><p className="text-sm font-black text-neutral-900">{title}</p>{subtitle && <p className="mt-0.5 text-xs text-neutral-400">{subtitle}</p>}</div>;
}

function ChartPlaceholder() {
  return <div className="h-full w-full rounded-2xl bg-neutral-50" />;
}

function Kpi({ icon: Icon, label, value, sub, tone }: { icon: React.ElementType; label: string; value: string; sub?: string; tone: 'emerald' | 'blue' | 'red' | 'amber' | 'violet' }) {
  const cls = { emerald: 'bg-emerald-50 text-emerald-700', blue: 'bg-blue-50 text-blue-700', red: 'bg-red-50 text-red-600', amber: 'bg-amber-50 text-amber-700', violet: 'bg-violet-50 text-violet-700' }[tone];
  const [amount, currency] = value.split(' F.CFA');
  return (
    <div className="min-h-[118px] rounded-xl border border-neutral-200/70 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2"><span className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">{label}</span><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${cls}`}><Icon size={14} /></span></div>
      <p className="mt-3 tracking-[-0.04em]"><span className="text-2xl font-black text-neutral-900">{amount}</span>{currency !== undefined && <span className="ml-1 text-[11px] font-medium tracking-normal text-neutral-500">F.CFA</span>}</p>
      {sub && <p className="mt-1 text-[10px] font-semibold text-neutral-400">{sub}</p>}
    </div>
  );
}

function TransactionList({ title, items, canDelete, onDelete }: { title: string; items: ReturnType<typeof transactions>; canDelete?: boolean; onDelete?: (id: string) => void }) {
  return (
    <Card>
      <CardTitle title={title} subtitle={`${items.length} operation(s)`} />
      <div className="divide-y divide-neutral-50">
        {items.length === 0 && <p className="py-6 text-sm font-semibold text-neutral-400">Aucune donnee pour le moment.</p>}
        {items.map(item => (
          <div key={item._id} className="flex items-center gap-3 py-3">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${item.kind === 'expense' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>{item.kind === 'expense' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}</span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-black text-neutral-900">{item.label}</p><p className="truncate text-xs text-neutral-400">{item.source} - {new Date(item.occurredAt).toLocaleDateString('fr-FR')}</p></div>
            <p className={`shrink-0 text-sm font-black ${item.kind === 'expense' ? 'text-red-600' : 'text-emerald-700'}`}>{formatFcfa(item.amount)}</p>
            {canDelete && <button onClick={() => onDelete?.(item._id)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-500 hover:text-white" title="Supprimer"><Trash2 size={13} /></button>}
          </div>
        ))}
      </div>
    </Card>
  );
}

function AssetList({ items, canDelete }: { items: typeof assets; canDelete?: boolean }) {
  const [deleted, setDeleted] = useState<string[]>([]);
  const visible = items.filter(item => !deleted.includes(item._id));
  return (
    <Card>
      <CardTitle title="Patrimoine" subtitle={`${visible.length} element(s)`} />
      <div className="grid gap-3 sm:grid-cols-2">
        {visible.map(item => (
          <div key={item._id} className="rounded-2xl border border-neutral-100 bg-neutral-50/70 p-3">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-700"><Package size={16} /></span>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-black text-neutral-900">{item.name}</p><p className="text-xs text-neutral-400">{item.category} - {item.condition}</p><p className="mt-1 text-xs font-semibold text-neutral-500">{formatFcfa(item.estimatedValue)}</p></div>
              {canDelete && <button onClick={() => setDeleted(prev => [...prev, item._id])} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-white text-red-500 transition hover:bg-red-500 hover:text-white" title="Supprimer"><Trash2 size={13} /></button>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function InfoRow({ icon: Icon, title, text, tone, compact = false }: { icon: React.ElementType; title: string; text: string; tone: 'amber' | 'emerald' | 'blue'; compact?: boolean }) {
  const cls = { amber: 'bg-amber-50 text-amber-700', emerald: 'bg-emerald-50 text-emerald-700', blue: 'bg-blue-50 text-blue-700' }[tone];
  return <div className={`flex gap-3 ${compact ? 'py-2' : 'rounded-2xl border border-neutral-100 bg-neutral-50/70 p-3'}`}><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${cls}`}><Icon size={14} /></span><div><p className="text-xs font-black text-neutral-900">{title}</p><p className="mt-0.5 text-xs leading-5 text-neutral-500">{text}</p></div></div>;
}

function RankList({ items }: { items: { label: string; value: number; color?: string }[] }) {
  const max = Math.max(...items.map(item => item.value), 1);
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className="space-y-1">
          <div className="flex items-center justify-between gap-3 text-xs"><span className="truncate font-black text-neutral-800">{item.label}</span><span className="shrink-0 font-semibold text-neutral-500">{formatFcfa(item.value)}</span></div>
          <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100"><div className="h-full rounded-full" style={{ width: `${Math.max(8, (item.value / max) * 100)}%`, background: item.color ?? '#059669' }} /></div>
        </div>
      ))}
    </div>
  );
}
