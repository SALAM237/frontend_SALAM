'use client';

import { useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowDownRight, ArrowUpRight, Banknote, Boxes, CheckCircle2, Download, PackageCheck, WalletCards, XCircle } from 'lucide-react';
import { formatFcfa, useMembershipFeeProposals, useReviewMembershipFeeProposal, useTreasuryAssets, useTreasuryOverview, useTreasuryTransactions, type TreasuryKind, type TreasurySource } from '@/lib/api/treasury';

const tabs = [
  { value: 'overview', label: "Vue d'ensemble" },
  { value: 'income', label: 'Encaissements' },
  { value: 'expense', label: 'Decaissements' },
  { value: 'don', label: 'Dons' },
  { value: 'assets', label: 'Patrimoine' },
] as const;

const sourceLabels: Record<TreasurySource, string> = {
  adhesion: "Frais d'adhesion",
  don: 'Dons',
  crowdfunding: 'Crowdfunding',
  activity: 'Activites',
  subvention: 'Subventions',
  partner: 'Partenaires',
  other: 'Autres',
};

const colors = ['#059669', '#f59e0b', '#2563eb', '#dc2626', '#7c3aed', '#0f766e', '#64748b'];
const conditionLabels: Record<string, string> = { good: 'Bon', used: 'Use', damaged: 'Abime', sold: 'Vendu', discarded: 'Jete', lost: 'Perdu' };

export default function TresoreriePage() {
  const [tab, setTab] = useState<(typeof tabs)[number]['value']>('overview');
  const overview = useTreasuryOverview(false);
  const income = useTreasuryTransactions('income', false);
  const expense = useTreasuryTransactions('expense', false);
  const assets = useTreasuryAssets(false);
  const feeProposals = useMembershipFeeProposals(false);
  const reviewFee = useReviewMembershipFeeProposal(false);

  const data = overview.data?.data;
  const donations = useMemo(() => income.data?.data?.items.filter(t => t.source === 'don') ?? [], [income.data]);
  const pendingProposal = (feeProposals.data?.data?.items ?? []).find(p => p.status === 'pending');
  const approvalRole = feeProposals.data?.data?.approvalRole;
  const alreadyApproved = !!pendingProposal && !!approvalRole && pendingProposal.approvals.some(a => a.role === approvalRole);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Tresorerie</h1>
          <p className="mt-0.5 text-sm text-neutral-500">Transparence financiere SALAM : encaissements, depenses, dons et patrimoine de l'association.</p>
        </div>
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-xs font-black text-neutral-600 transition hover:border-emerald-200 hover:text-emerald-700">
          <Download size={14} /> Exporter
        </button>
      </div>

      {pendingProposal && approvalRole && (
        <section className="rounded-3xl border border-amber-100 bg-amber-50/60 p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-neutral-900">Validation en attente</p>
              <p className="mt-1 text-xs leading-5 text-neutral-600">
                Changement des frais d'adhesion : <b>{formatFcfa(pendingProposal.oldAmount)}</b> vers <b>{formatFcfa(pendingProposal.newAmount)}</b>. Validation actuelle : {pendingProposal.approvals.length}/3.
              </p>
            </div>
            <div className="flex gap-2">
              <button disabled={reviewFee.isPending || alreadyApproved} onClick={() => reviewFee.mutate({ id: pendingProposal._id, action: 'reject' })} className="inline-flex h-9 items-center gap-2 rounded-xl border border-red-100 bg-white px-3 text-xs font-black text-red-600 disabled:opacity-40"><XCircle size={14} /> Refuser</button>
              <button disabled={reviewFee.isPending || alreadyApproved} onClick={() => reviewFee.mutate({ id: pendingProposal._id, action: 'approve' })} className="inline-flex h-9 items-center gap-2 rounded-xl bg-emerald-600 px-3 text-xs font-black text-white disabled:opacity-40"><CheckCircle2 size={14} /> {alreadyApproved ? 'Deja valide' : 'Valider'}</button>
            </div>
          </div>
        </section>
      )}

      <div className="overflow-x-auto rounded-2xl border border-neutral-100 bg-white p-1 shadow-sm">
        <div className="flex min-w-max gap-1">
          {tabs.map(t => (
            <button key={t.value} onClick={() => setTab(t.value)} className={`h-10 rounded-xl px-4 text-xs font-black transition ${tab === t.value ? 'bg-emerald-600 text-white shadow-sm' : 'text-neutral-500 hover:bg-neutral-50'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'overview' && (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi icon={WalletCards} label="Solde disponible" value={formatFcfa(data?.kpis.balance ?? 0)} tone="emerald" />
            <Kpi icon={ArrowUpRight} label="Encaissements" value={formatFcfa(data?.kpis.income ?? 0)} tone="blue" />
            <Kpi icon={ArrowDownRight} label="Depenses" value={formatFcfa(data?.kpis.expense ?? 0)} tone="red" />
            <Kpi icon={Banknote} label="Adhesions en attente" value={formatFcfa(data?.kpis.pendingAdhesions ?? 0)} sub={`${data?.kpis.activeMembers ?? 0} membres actifs`} tone="amber" />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <section className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-neutral-900">Evolution encaissements & depenses</p>
                  <p className="text-xs text-neutral-400">Lecture sur les six derniers mois</p>
                </div>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.chart ?? []}>
                    <defs>
                      <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#059669" stopOpacity={0.28} /><stop offset="100%" stopColor="#059669" stopOpacity={0} /></linearGradient>
                      <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#dc2626" stopOpacity={0.16} /><stop offset="100%" stopColor="#dc2626" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${Math.round(Number(v) / 1000)}k`} />
                    <Tooltip formatter={v => formatFcfa(Number(v ?? 0))} />
                    <Area type="monotone" dataKey="income" stroke="#059669" fill="url(#gIncome)" strokeWidth={2} name="Encaissements" />
                    <Area type="monotone" dataKey="expense" stroke="#dc2626" fill="url(#gExpense)" strokeWidth={2} name="Depenses" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm">
              <p className="text-sm font-black text-neutral-900">Sources financieres</p>
              <p className="mt-0.5 text-xs text-neutral-400">Repartition des entrees</p>
              <div className="mt-4 h-[190px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data?.sources ?? []} dataKey="amount" nameKey="source" innerRadius={52} outerRadius={78} paddingAngle={4}>
                      {(data?.sources ?? []).map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => formatFcfa(Number(v ?? 0))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {(data?.sources ?? []).map((s, i) => (
                  <div key={s.source} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-semibold text-neutral-500"><i className="h-2.5 w-2.5 rounded-full" style={{ background: colors[i % colors.length] }} />{sourceLabels[s.source]}</span>
                    <b className="text-neutral-900">{formatFcfa(s.amount)}</b>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <List title="Dernieres operations" items={data?.recentTransactions ?? []} />
            <AssetList title="Patrimoine suivi" items={data?.assets ?? []} />
          </div>
        </div>
      )}

      {tab === 'income' && <List title="Encaissements" items={income.data?.data?.items ?? []} kind="income" loading={income.isLoading} />}
      {tab === 'expense' && <List title="Decaissements" items={expense.data?.data?.items ?? []} kind="expense" loading={expense.isLoading} />}
      {tab === 'don' && <List title="Dons recus" items={donations} loading={income.isLoading} />}
      {tab === 'assets' && <AssetList title="Patrimoine de l'association" items={assets.data?.data?.items ?? []} loading={assets.isLoading} />}
    </div>
  );
}

function Kpi({ icon: Icon, label, value, sub, tone }: { icon: React.ElementType; label: string; value: string; sub?: string; tone: 'emerald' | 'blue' | 'red' | 'amber' }) {
  const cls = {
    emerald: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-blue-50 text-blue-700',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-700',
  }[tone];
  return (
    <div className="rounded-3xl border border-neutral-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">{label}</span>
        <span className={`flex h-9 w-9 items-center justify-center rounded-2xl ${cls}`}><Icon size={17} /></span>
      </div>
      <p className="mt-3 text-xl font-black tracking-[-0.03em] text-neutral-900">{value}</p>
      {sub && <p className="mt-1 text-xs font-semibold text-neutral-400">{sub}</p>}
    </div>
  );
}

function List({ title, items, kind, loading }: { title: string; items: any[]; kind?: TreasuryKind; loading?: boolean }) {
  const filtered = kind ? items.filter(i => i.kind === kind) : items;
  return (
    <section className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm">
      <p className="text-sm font-black text-neutral-900">{title}</p>
      <div className="mt-4 divide-y divide-neutral-50">
        {loading && <p className="py-6 text-sm text-neutral-400">Chargement...</p>}
        {!loading && filtered.length === 0 && <p className="py-6 text-sm font-semibold text-neutral-400">Aucune donnee pour le moment.</p>}
        {filtered.map(item => (
          <div key={item._id} className="flex items-center gap-3 py-3">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${item.kind === 'expense' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
              {item.kind === 'expense' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-neutral-900">{item.label}</p>
              <p className="truncate text-xs text-neutral-400">{sourceLabels[item.source as TreasurySource] ?? item.category ?? 'Operation'} · {new Date(item.occurredAt).toLocaleDateString('fr-FR')}</p>
            </div>
            <p className={`shrink-0 text-sm font-black ${item.kind === 'expense' ? 'text-red-600' : 'text-emerald-700'}`}>{formatFcfa(item.amount)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AssetList({ title, items, loading }: { title: string; items: any[]; loading?: boolean }) {
  return (
    <section className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm">
      <p className="text-sm font-black text-neutral-900">{title}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {loading && <p className="py-6 text-sm text-neutral-400">Chargement...</p>}
        {!loading && items.length === 0 && <p className="py-6 text-sm font-semibold text-neutral-400">Aucun element de patrimoine renseigne.</p>}
        {items.map(item => (
          <div key={item._id} className="rounded-2xl border border-neutral-100 bg-neutral-50/70 p-3">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-700"><PackageCheck size={16} /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-neutral-900">{item.name}</p>
                <p className="text-xs text-neutral-400">{item.category || 'Materiel'} · {conditionLabels[item.condition] ?? item.condition}</p>
                <p className="mt-1 text-xs font-semibold text-neutral-500">{formatFcfa(item.estimatedValue ?? 0)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
