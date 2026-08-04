'use client';

import { useState } from 'react';
import {
  Bar, BarChart, CartesianGrid,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  AlertTriangle, ArrowDownRight, ArrowUpRight, Banknote, CheckCircle2, Clock,
  Download, Filter, Package, RefreshCw, Search, WalletCards, WifiOff, X, XCircle,
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
import { TreasuryEvolutionSection } from '@/components/shared/TreasuryEvolutionChart';
import { RecoveryRateBlock } from '@/components/shared/RecoveryRateBlock';
import { downloadCsv } from '@/lib/csv-export';
import { ListToolbar } from '@/components/shared/ListToolbar';

type TabValue = 'overview' | 'income' | 'expense' | 'don' | 'assets';

const tabs: { value: TabValue; label: string }[] = [
  { value: 'overview', label: "Vue d'ensemble" },
  { value: 'income', label: 'Encaissements' },
  { value: 'expense', label: 'Decaissements' },
  { value: 'don', label: 'Dons' },
  { value: 'assets', label: 'Patrimoine' },
];

const sourceLabels: Record<TreasurySource, string> = {
  adhesion:            "Frais d'adhesion",
  cotisation_annuelle: 'Cotisation annuelle',
  don:                 'Dons',
  crowdfunding:        'Crowdfunding',
  activity:            'Activites',
  subvention:          'Subventions',
  partner:             'Partenaires',
  other:               'Autres',
};

const sourceColors = ['#059669', '#2563eb', '#f59e0b', '#7c3aed', '#dc2626', '#0f766e', '#64748b'];
const conditionLabels: Record<string, string> = { good: 'Bon', used: 'Use', damaged: 'Abime', sold: 'Vendu', discarded: 'Jete', lost: 'Perdu' };

export default function TresoreriePage() {
  const [tab, setTab] = useState<TabValue>('overview');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState('');
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
  const assetItems = assets.data?.data?.items ?? [];
  const pendingProposal = (feeProposals.data?.data?.items ?? []).find(p => p.status === 'pending');
  const approvalRole = feeProposals.data?.data?.approvalRole;
  const alreadyApproved = !!pendingProposal && !!approvalRole && pendingProposal.approvals.some(a => a.role === approvalRole);

  const loading = overview.isLoading;
  const refreshing = overview.isFetching || income.isFetching || expense.isFetching || donations.isFetching || assets.isFetching;
  const sourceData = data?.sources ?? [];
  const balanceTone = (data?.kpis.balance ?? 0) >= 0 ? 'emerald' : 'red';

  const q = search.trim().toLowerCase();
  const matchesTx = (item: TreasuryTransaction) => !q || [item.label, item.counterparty, item.reference, item.description, sourceLabels[item.source]].some(f => f?.toLowerCase().includes(q));
  const filteredIncome = incomeItems.filter(matchesTx);
  const filteredExpense = expenseItems.filter(matchesTx);
  const filteredDonations = donationItems.filter(matchesTx);
  const filteredAssets = assetItems.filter(a => !q || [a.name, a.category, a.location, a.responsible].some(f => f?.toLowerCase().includes(q)));

  const handleRefresh = () => {
    overview.refetch();
    income.refetch();
    expense.refetch();
    donations.refetch();
    assets.refetch();
    feeProposals.refetch();
  };

  const exportCsv = () => {
    const rows = tab === 'assets'
      ? filteredAssets.map(item => ({
          type: 'patrimoine',
          nom: item.name,
          categorie: item.category ?? '',
          etat: item.condition,
          valeur: item.estimatedValue ?? 0,
          localisation: item.location ?? '',
          responsable: item.responsible ?? '',
        }))
      : (tab === 'income' ? filteredIncome : tab === 'expense' ? filteredExpense : tab === 'don' ? filteredDonations : [...filteredIncome, ...filteredExpense]).map(item => ({
          type: item.kind,
          source: item.source,
          libelle: item.label,
          montant: item.amount,
          date: new Date(item.occurredAt).toLocaleDateString('fr-FR'),
          tiers: item.counterparty ?? '',
          reference: item.reference ?? '',
          description: item.description ?? '',
        }));

    downloadCsv(`salam-tresorerie-${tab}.csv`, rows);
  };

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
          <button
            onClick={() => setFiltersOpen(o => !o)}
            disabled={tab === 'overview'}
            className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-40 ${filtersOpen ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-neutral-200 bg-white text-neutral-600 hover:border-emerald-200 hover:text-emerald-700'}`}
          >
            <Filter size={14} /> Filtres
          </button>
          <button
            onClick={exportCsv}
            disabled={tab === 'overview'}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-black text-neutral-600 transition hover:border-emerald-200 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download size={14} /> Exporter
          </button>
          <button onClick={handleRefresh} disabled={refreshing} className="inline-flex h-9 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-black text-neutral-600 transition hover:border-emerald-200 hover:text-emerald-700 disabled:opacity-50">
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Actualiser
          </button>
        </div>
      </div>

      {filtersOpen && tab !== 'overview' && (
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={tab === 'assets' ? 'Rechercher un element de patrimoine...' : 'Rechercher une operation...'}
            className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-9 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              title="Effacer la recherche"
              className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
            >
              <X size={13} />
            </button>
          )}
        </div>
      )}

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

          <TreasuryEvolutionSection
            admin={false}
            defaultChart={data?.chart ?? []}
            defaultSources={sourceData}
            loading={overview.isLoading}
            gradientId="memberTreasury"
            sourceLabels={sourceLabels}
            sourceColors={sourceColors}
          />

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
              <CardTitle title="Taux de recouvrement" />
              <div className="grid grid-cols-3 gap-3">
                <RecoveryRateBlock label="Frais adhesion" rate={data?.kpis.recoveryRate ?? 0} pending={data?.kpis.pendingAdhesions ?? 0} />
                <RecoveryRateBlock label="Cotisation annuelle" rate={data?.kpis.recoveryRateAnnuelle ?? 0} pending={data?.kpis.pendingAnnuelles ?? 0} />
                <RecoveryRateBlock label="Autres" rate={data?.kpis.recoveryRateOther ?? 0} />
              </div>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="border-red-100 bg-red-50/80">
              <CardTitle title="Alertes" />
              <InfoRow icon={AlertTriangle} tone="red" title="Adhesions en attente" text={`${formatFcfa(data?.kpis.pendingAdhesions ?? 0)} restent a recouvrer.`} compact />
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

      {tab === 'income' && <TransactionList title="Encaissements" items={incomeItems} totalCount={incomeItems.length} kind="income" loading={income.isLoading} />}
      {tab === 'expense' && <TransactionList title="Decaissements" items={expenseItems} totalCount={expenseItems.length} kind="expense" loading={expense.isLoading} />}
      {tab === 'don' && <TransactionList title="Dons recus" items={donationItems} totalCount={donationItems.length} loading={donations.isLoading} />}
      {tab === 'assets' && <AssetList title="Patrimoine de l'association" items={assetItems} totalCount={assetItems.length} loading={assets.isLoading} />}
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
    <div className="min-h-[100px] overflow-hidden rounded-xl border border-neutral-200/70 bg-white p-3 shadow-sm sm:min-h-[118px] sm:p-4">
      <div className="flex items-center justify-between gap-1.5">
        <span className="min-w-0 flex-1 text-[9px] font-bold uppercase tracking-[0.08em] text-neutral-500 sm:text-[10px] sm:tracking-[0.12em]">{label}</span>
        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full sm:h-7 sm:w-7 ${cls}`}><Icon size={13} /></span>
      </div>
      <p className="mt-2 flex flex-wrap items-baseline gap-x-1 tracking-[-0.04em] sm:mt-3">
        <span className="break-words text-base font-black text-neutral-900 sm:text-2xl">{amount}</span>
        {currency !== undefined && <span className="text-[10px] font-medium tracking-normal text-neutral-500 sm:text-[11px]">F.CFA</span>}
      </p>
      {sub && <p className="mt-1 text-[9px] font-semibold text-neutral-400 sm:text-[10px]">{sub}</p>}
    </div>
  );
}

function TransactionList({ title, items, totalCount, kind, loading }: { title: string; items: TreasuryTransaction[]; totalCount?: number; kind?: TreasuryKind; loading?: boolean }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const filtered = kind ? items.filter(i => i.kind === kind) : items;
  const q = search.trim().toLowerCase();
  const searched = q
    ? filtered.filter(item => [item.label, item.counterparty, item.reference, item.description, sourceLabels[item.source]].some(f => f?.toLowerCase().includes(q)))
    : filtered;
  const visible = searched.slice(0, pageSize);
  const isFiltered = totalCount !== undefined && totalCount !== searched.length;
  return (
    <Card>
      <CardTitle title={title} subtitle={`${searched.length} operation(s)${isFiltered ? ` sur ${totalCount}` : ''}`} />
      <ListToolbar search={search} onSearchChange={setSearch} pageSize={pageSize} onPageSizeChange={setPageSize} />
      <div className="divide-y divide-neutral-50">
        {loading && <p className="py-6 text-sm text-neutral-400">Chargement...</p>}
        {!loading && searched.length === 0 && (
          <p className="py-6 text-sm font-semibold text-neutral-400">
            {q ? 'Aucun resultat pour cette recherche.' : 'Aucune donnee pour le moment.'}
          </p>
        )}
        {visible.map(item => {
          const expanded = expandedId === item._id;
          const textCls = expanded ? 'whitespace-normal break-words' : 'truncate';
          return (
            <div key={item._id} className="flex cursor-pointer items-center gap-3 py-3" onClick={() => setExpandedId(expanded ? null : item._id)}>
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${item.kind === 'expense' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
                {item.kind === 'expense' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-black text-neutral-900 sm:text-sm ${textCls}`}>{item.label || 'Operation'}</p>
                <p className={`text-[11px] text-neutral-400 sm:text-xs ${textCls}`}>{sourceLabels[item.source] ?? item.category ?? 'Operation'} · {new Date(item.occurredAt).toLocaleDateString('fr-FR')}</p>
              </div>
              <p className={`shrink-0 text-xs font-black sm:text-sm ${item.kind === 'expense' ? 'text-red-600' : 'text-emerald-700'}`}>{formatFcfa(item.amount)}</p>
            </div>
          );
        })}
      </div>
      {searched.length > pageSize && (
        <button type="button" onClick={() => setPageSize(v => Math.min(v + 20, searched.length))} className="mt-3 w-full text-center text-xs font-semibold text-emerald-700 hover:underline">
          {pageSize} sur {searched.length} affichees - afficher 20 lignes supplementaires.
        </button>
      )}
    </Card>
  );
}
function AssetList({ title, items, totalCount, loading }: { title: string; items: TreasuryAsset[]; totalCount?: number; loading?: boolean }) {
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const q = search.trim().toLowerCase();
  const searched = q
    ? items.filter(item => [item.name, item.category, item.location, item.responsible].some(f => f?.toLowerCase().includes(q)))
    : items;
  const visible = searched.slice(0, pageSize);
  const isFiltered = totalCount !== undefined && totalCount !== searched.length;
  return (
    <Card>
      <CardTitle title={title} subtitle={`${searched.length} element(s)${isFiltered ? ` sur ${totalCount}` : ''}`} />
      <ListToolbar search={search} onSearchChange={setSearch} pageSize={pageSize} onPageSizeChange={setPageSize} />
      <div className="grid gap-3 sm:grid-cols-2">
        {loading && <p className="py-6 text-sm text-neutral-400">Chargement...</p>}
        {!loading && searched.length === 0 && (
          <p className="py-6 text-sm font-semibold text-neutral-400">
            {q ? 'Aucun resultat pour cette recherche.' : 'Aucun element de patrimoine renseigne.'}
          </p>
        )}
        {visible.map(item => (
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
      {searched.length > pageSize && (
        <button type="button" onClick={() => setPageSize(v => Math.min(v + 20, searched.length))} className="mt-3 w-full text-center text-xs font-semibold text-emerald-700 hover:underline">
          {pageSize} sur {searched.length} affiches - afficher 20 lignes supplementaires.
        </button>
      )}
    </Card>
  );
}
function InfoRow({ icon: Icon, title, text, tone, compact = false }: { icon: React.ElementType; title: string; text: string; tone: 'amber' | 'emerald' | 'blue' | 'red'; compact?: boolean }) {
  const cls = {
    amber: 'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-blue-50 text-blue-700',
    red: 'bg-red-100 text-red-700',
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