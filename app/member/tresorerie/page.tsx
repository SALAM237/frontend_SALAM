'use client';

import { useState } from 'react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  AlertTriangle, ArrowDownRight, ArrowUpRight, Banknote, CheckCircle2, Clock,
  Download, Filter, Package, RefreshCw, Users, WalletCards, WifiOff, XCircle,
} from 'lucide-react';
import {
  formatFcfa,
  useMembershipFeeProposals,
  useReviewMembershipFeeProposal,
  useTreasuryAssets,
  useTreasuryOverview,
  useTreasuryTransactions,
  type TreasuryKind,
  type TreasurySource,
  type TreasuryTransaction,
  type TreasuryAsset,
} from '@/lib/api/treasury';
import { AnimatedTabBar } from '@/components/ui/AnimatedTabBar';

type TabValue = 'overview' | 'income' | 'expense' | 'don' | 'assets';

const tabs: { value: TabValue; label: string }[] = [
  { value: 'overview', label: "Vue d'ensemble" },
  { value: 'income', label: 'Encaissements' },
  { value: 'expense', label: 'Decaissements' },
  { value: 'don', label: 'Dons' },
  { value: 'assets', label: 'Patrimoine' },
];

const sourceLabels: Record<TreasurySource, string> = {
  adhesion: "Frais d'adhesion",
  don: 'Dons',
  crowdfunding: 'Crowdfunding',
  activity: 'Activites',
  subvention: 'Subventions',
  partner: 'Partenaires',
  other: 'Autres',
};

const sourceColors = ['#059669', '#2563eb', '#f59e0b', '#7c3aed', '#dc2626', '#0f766e', '#64748b'];
const conditionLabels: Record<string, string> = { good: 'Bon', used: 'Use', damaged: 'Abime', sold: 'Vendu', discarded: 'Jete', lost: 'Perdu' };

export default function TresoreriePage() {
  const [tab, setTab] = useState<TabValue>('overview');
  const overview = useTreasuryOverview(false);
  const income = useTreasuryTransactions('income', false);
  const expense = useTreasuryTransactions('expense', false);
  const donations = useTreasuryTransactions('income', false, 'don');
  const assets = useTreasuryAssets(false);
  const feeProposals = useMembershipFeeProposals(false);
  const reviewFee = useReviewMembershipFeeProposal(false);

  const data = overview.data?.data;
  const incomeItems = income.data?.data?.items ?? [];
  const expenseItems = expense.data?.data?.items ?? [];
  const donationItems = donations.data?.data?.items ?? [];
  const pendingProposal = (feeProposals.data?.data?.items ?? []).find(p => p.status === 'pending');
  const approvalRole = feeProposals.data?.data?.approvalRole;
  const alreadyApproved = !!pendingProposal && !!approvalRole && pendingProposal.approvals.some(a => a.role === approvalRole);

  const loading = overview.isLoading;
  const sourceData = data?.sources ?? [];
  const balanceTone = (data?.kpis.balance ?? 0) >= 0 ? 'emerald' : 'red';

  if (overview.isError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <WifiOff size={30} />
        </div>
        <div>
          <p className="font-black text-neutral-900">Impossible de charger la tresorerie</p>
          <p className="mt-1 text-sm text-neutral-500">Verifiez la connexion au serveur puis reessayez.</p>
        </div>
        <button onClick={() => overview.refetch()} className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-black text-neutral-700">
          <RefreshCw size={14} /> Reessayer
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Tresorerie</h1>
          <p className="mt-1 text-sm text-neutral-500">Vue transparente des ressources, depenses, dons et patrimoine de SALAM.</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex h-9 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-black text-neutral-600 transition hover:border-emerald-200 hover:text-emerald-700">
            <Filter size={14} /> Filtres
          </button>
          <button className="inline-flex h-9 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-black text-neutral-600 transition hover:border-emerald-200 hover:text-emerald-700">
            <Download size={14} /> Exporter
          </button>
          <button onClick={() => overview.refetch()} disabled={loading} className="inline-flex h-9 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-black text-neutral-600 transition hover:border-emerald-200 hover:text-emerald-700 disabled:opacity-50">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Actualiser
          </button>
        </div>
      </div>

      {pendingProposal && approvalRole && (
        <section className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-neutral-900">Validation en attente</p>
              <p className="mt-1 text-xs leading-5 text-neutral-600">
                Frais d'adhesion : <b>{formatFcfa(pendingProposal.oldAmount)}</b> vers <b>{formatFcfa(pendingProposal.newAmount)}</b>.
                Validation actuelle : {pendingProposal.approvals.length}/3.
              </p>
            </div>
            <div className="flex gap-2">
              <button disabled={reviewFee.isPending || alreadyApproved} onClick={() => reviewFee.mutate({ id: pendingProposal._id, action: 'reject' })} className="inline-flex h-9 items-center gap-2 rounded-xl border border-red-100 bg-white px-3 text-xs font-black text-red-600 disabled:opacity-40">
                <XCircle size={14} /> Refuser
              </button>
              <button disabled={reviewFee.isPending || alreadyApproved} onClick={() => reviewFee.mutate({ id: pendingProposal._id, action: 'approve' })} className="inline-flex h-9 items-center gap-2 rounded-xl bg-emerald-600 px-3 text-xs font-black text-white disabled:opacity-40">
                <CheckCircle2 size={14} /> {alreadyApproved ? 'Deja valide' : 'Valider'}
              </button>
            </div>
          </div>
        </section>
      )}

      <AnimatedTabBar items={tabs} value={tab} onChange={setTab} />

      {tab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
            <Kpi label="Solde disponible" value={formatFcfa(data?.kpis.balance ?? 0)} icon={WalletCards} tone={balanceTone} />
            <Kpi label="Encaissements" value={formatFcfa(data?.kpis.income ?? 0)} icon={ArrowUpRight} tone="emerald" />
            <Kpi label="Decaissements" value={formatFcfa(data?.kpis.expense ?? 0)} icon={ArrowDownRight} tone="red" />
            <Kpi label="En attente" value={formatFcfa(data?.kpis.pendingAdhesions ?? 0)} icon={Clock} tone="amber" sub={`${data?.kpis.activeMembers ?? 0} membres actifs`} />
            <Kpi label="Frais adhesion" value={formatFcfa(data?.kpis.membershipFee ?? 5000)} icon={Banknote} tone="blue" />
            <Kpi label="Patrimoine" value={formatFcfa(data?.kpis.assetsValue ?? 0)} icon={Package} tone="violet" sub={`${data?.kpis.assetsCount ?? 0} element(s)`} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardTitle title="Evolution encaissements & depenses" />
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.chart ?? []}>
                    <defs>
                      <linearGradient id="memberIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#059669" stopOpacity={0.28} />
                        <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="memberExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#dc2626" stopOpacity={0.16} />
                        <stop offset="100%" stopColor="#dc2626" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${Math.round(Number(v) / 1000)}k`} />
                    <Tooltip formatter={v => formatFcfa(Number(v ?? 0))} />
                    <Area type="monotone" dataKey="income" stroke="#059669" fill="url(#memberIncome)" strokeWidth={2} name="Encaissements" />
                    <Area type="monotone" dataKey="expense" stroke="#dc2626" fill="url(#memberExpense)" strokeWidth={2} name="Depenses" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <CardTitle title="Sources financieres" />
              <div className="h-[210px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sourceData} dataKey="amount" nameKey="source" innerRadius={56} outerRadius={84} paddingAngle={4}>
                      {sourceData.map((_, i) => <Cell key={i} fill={sourceColors[i % sourceColors.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => formatFcfa(Number(v ?? 0))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-1 space-y-2">
                {sourceData.length === 0 && <p className="text-xs font-semibold text-neutral-400">Aucune source renseignee.</p>}
                {sourceData.map((source, i) => (
                  <div key={source.source} className="flex items-center justify-between gap-3 text-xs">
                    <span className="flex min-w-0 items-center gap-2 font-semibold text-neutral-500">
                      <i className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: sourceColors[i % sourceColors.length] }} />
                      <span className="truncate">{sourceLabels[source.source]}</span>
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
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { period: '30j', pessimistic: data?.kpis.paidAdhesions ?? 0, realistic: data?.kpis.expectedAdhesions ?? 0, optimistic: (data?.kpis.expectedAdhesions ?? 0) + (data?.kpis.membershipFee ?? 0) },
                    { period: '60j', pessimistic: data?.kpis.paidAdhesions ?? 0, realistic: (data?.kpis.expectedAdhesions ?? 0) + (data?.kpis.pendingAdhesions ?? 0) * 0.25, optimistic: (data?.kpis.expectedAdhesions ?? 0) + (data?.kpis.pendingAdhesions ?? 0) * 0.5 },
                    { period: '90j', pessimistic: data?.kpis.expectedAdhesions ?? 0, realistic: (data?.kpis.expectedAdhesions ?? 0) + (data?.kpis.pendingAdhesions ?? 0) * 0.5, optimistic: (data?.kpis.expectedAdhesions ?? 0) + (data?.kpis.pendingAdhesions ?? 0) },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${Math.round(Number(v) / 1000)}k`} />
                    <Tooltip formatter={v => formatFcfa(Number(v ?? 0))} />
                    <Bar dataKey="pessimistic" fill="#f4b6b6" radius={[5, 5, 0, 0]} name="Prudent" />
                    <Bar dataKey="realistic" fill="#8b7cf6" radius={[5, 5, 0, 0]} name="Realiste" />
                    <Bar dataKey="optimistic" fill="#6fc29b" radius={[5, 5, 0, 0]} name="Optimiste" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <CardTitle title="Taux de recouvrement adhesions" />
              <div className="flex h-[220px] flex-col items-center justify-center text-center">
                <div className="text-5xl font-black tracking-[-0.05em] text-emerald-700">
                  {data?.kpis.recoveryRate ?? 0}
                  <span className="text-2xl">%</span>
                </div>
                <p className="mt-3 text-sm font-semibold text-neutral-500">des frais d'adhesion encaisses</p>
                <p className="mt-1 text-xs text-neutral-400">{formatFcfa(data?.kpis.pendingAdhesions ?? 0)} encore en attente</p>
              </div>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardTitle title="Alertes" />
              <InfoRow icon={AlertTriangle} tone="amber" title="Adhesions en attente" text={`${formatFcfa(data?.kpis.pendingAdhesions ?? 0)} restent a recouvrer.`} compact />
            </Card>
            <Card>
              <CardTitle title="Recommandations" />
              <InfoRow icon={Clock} tone="blue" title="Relance douce" text="Prioriser les membres actifs dont la cotisation annuelle reste impayee." compact />
              <InfoRow icon={CheckCircle2} tone="emerald" title="Justificatifs" text="Associer les documents aux ecritures importantes." compact />
            </Card>
            <Card>
              <CardTitle title="Top sources" />
              <RankList items={sourceData.map((s, i) => ({
                label: sourceLabels[s.source],
                value: s.amount,
                color: sourceColors[i % sourceColors.length],
              }))} />
            </Card>
            <Card>
              <CardTitle title="Patrimoine" />
              <RankList items={(data?.assets ?? []).slice(0, 5).map(a => ({ label: a.name, value: a.estimatedValue ?? 0 }))} />
            </Card>
          </div>
        </div>
      )}

      {tab === 'income' && <TransactionList title="Encaissements" items={incomeItems} kind="income" loading={income.isLoading} />}
      {tab === 'expense' && <TransactionList title="Decaissements" items={expenseItems} kind="expense" loading={expense.isLoading} />}
      {tab === 'don' && <TransactionList title="Dons recus" items={donationItems} loading={income.isLoading} />}
      {tab === 'assets' && <AssetList title="Patrimoine de l'association" items={assets.data?.data?.items ?? []} loading={assets.isLoading} />}
    </div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-neutral-200/70 bg-white p-5 shadow-sm ${className}`}>{children}</section>;
}

function CardTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <p className="text-sm font-black text-neutral-900">{title}</p>
      {subtitle && <p className="mt-0.5 text-xs text-neutral-400">{subtitle}</p>}
    </div>
  );
}

function Kpi({ icon: Icon, label, value, sub, tone }: { icon: React.ElementType; label: string; value: string; sub?: string; tone: 'emerald' | 'blue' | 'red' | 'amber' | 'violet' }) {
  const cls = {
    emerald: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-blue-50 text-blue-700',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-700',
    violet: 'bg-violet-50 text-violet-700',
  }[tone];
  const [amount, currency] = value.split(' F.CFA');

  return (
    <div className="min-h-[118px] rounded-xl border border-neutral-200/70 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">{label}</span>
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${cls}`}><Icon size={14} /></span>
      </div>
      <p className="mt-3 tracking-[-0.04em]">
        <span className="text-2xl font-black text-neutral-900">{amount}</span>
        {currency !== undefined && <span className="ml-1 text-[11px] font-medium tracking-normal text-neutral-500">F.CFA</span>}
      </p>
      {sub && <p className="mt-1 text-[10px] font-semibold text-neutral-400">{sub}</p>}
    </div>
  );
}

function TransactionList({ title, items, kind, loading }: { title: string; items: TreasuryTransaction[]; kind?: TreasuryKind; loading?: boolean }) {
  const filtered = kind ? items.filter(i => i.kind === kind) : items;
  return (
    <Card>
      <CardTitle title={title} subtitle={`${filtered.length} operation(s)`} />
      <div className="divide-y divide-neutral-50">
        {loading && <p className="py-6 text-sm text-neutral-400">Chargement...</p>}
        {!loading && filtered.length === 0 && <p className="py-6 text-sm font-semibold text-neutral-400">Aucune donnee pour le moment.</p>}
        {filtered.map(item => (
          <div key={item._id} className="flex items-center gap-3 py-3">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${item.kind === 'expense' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
              {item.kind === 'expense' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-neutral-900">{item.label || 'Operation'}</p>
              <p className="truncate text-xs text-neutral-400">{sourceLabels[item.source] ?? item.category ?? 'Operation'} · {new Date(item.occurredAt).toLocaleDateString('fr-FR')}</p>
            </div>
            <p className={`shrink-0 text-sm font-black ${item.kind === 'expense' ? 'text-red-600' : 'text-emerald-700'}`}>{formatFcfa(item.amount)}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AssetList({ title, items, loading }: { title: string; items: TreasuryAsset[]; loading?: boolean }) {
  return (
    <Card>
      <CardTitle title={title} subtitle={`${items.length} element(s)`} />
      <div className="grid gap-3 sm:grid-cols-2">
        {loading && <p className="py-6 text-sm text-neutral-400">Chargement...</p>}
        {!loading && items.length === 0 && <p className="py-6 text-sm font-semibold text-neutral-400">Aucun element de patrimoine renseigne.</p>}
        {items.map(item => (
          <div key={item._id} className="rounded-2xl border border-neutral-100 bg-neutral-50/70 p-3">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-700"><Package size={16} /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-neutral-900">{item.name}</p>
                <p className="text-xs text-neutral-400">{item.category || 'Materiel'} · {conditionLabels[item.condition] ?? item.condition}</p>
                <p className="mt-1 text-xs font-semibold text-neutral-500">{formatFcfa(item.estimatedValue ?? 0)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function InfoRow({ icon: Icon, title, text, tone, compact = false }: { icon: React.ElementType; title: string; text: string; tone: 'amber' | 'emerald' | 'blue'; compact?: boolean }) {
  const cls = {
    amber: 'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-blue-50 text-blue-700',
  }[tone];

  return (
    <div className={`flex gap-3 ${compact ? 'py-2' : 'rounded-2xl border border-neutral-100 bg-neutral-50/70 p-3'}`}>
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${cls}`}><Icon size={14} /></span>
      <div>
        <p className="text-xs font-black text-neutral-900">{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-neutral-500">{text}</p>
      </div>
    </div>
  );
}

function RankList({ items }: { items: { label: string; value: number; color?: string }[] }) {
  const max = Math.max(...items.map(i => i.value), 1);
  if (items.length === 0) return <p className="py-4 text-xs font-semibold text-neutral-400">Aucune donnee.</p>;
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className="space-y-1">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="truncate font-black text-neutral-800">{item.label}</span>
            <span className="shrink-0 font-semibold text-neutral-500">{formatFcfa(item.value)}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(8, (item.value / max) * 100)}%`,
                background: item.color ?? '#059669',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
