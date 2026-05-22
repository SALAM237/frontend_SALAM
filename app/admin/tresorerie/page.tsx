'use client';

import { useRef, useState } from 'react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  AlertTriangle, ArrowDownRight, ArrowUpRight, Banknote, Boxes, CheckCircle2,
  Clock, Download, FileUp, Package, Plus, RefreshCw, Settings2, WalletCards,
  Trash2, WifiOff, X, XCircle,
} from 'lucide-react';
import {
  formatFcfa,
  useCreateMembershipFeeProposal,
  useCreateTreasuryAsset,
  useCreateTreasuryTransaction,
  useDeleteTreasuryAsset,
  useDeleteTreasuryTransaction,
  useMembershipFeeProposals,
  useTreasuryAssets,
  useTreasuryOverview,
  useTreasuryTransactions,
  useUploadTreasuryDocument,
  type TreasuryAsset,
  type TreasuryKind,
  type TreasurySource,
  type TreasuryTransaction,
} from '@/lib/api/treasury';
import { AnimatedTabBar } from '@/components/ui/AnimatedTabBar';

type TabValue = 'overview' | 'income' | 'expense' | 'don' | 'assets';
type FormMode = 'income' | 'expense' | 'don' | 'asset' | null;

const tabs: { value: TabValue; label: string }[] = [
  { value: 'overview', label: "Vue d'ensemble" },
  { value: 'income', label: 'Encaissements' },
  { value: 'expense', label: 'Decaissements' },
  { value: 'don', label: 'Dons' },
  { value: 'assets', label: 'Patrimoine' },
];

const sourceOptions: { value: TreasurySource; label: string }[] = [
  { value: 'adhesion', label: "Frais d'adhesion" },
  { value: 'don', label: 'Dons' },
  { value: 'crowdfunding', label: 'Crowdfunding' },
  { value: 'activity', label: 'Activites' },
  { value: 'subvention', label: 'Subventions' },
  { value: 'partner', label: 'Partenaires' },
  { value: 'other', label: 'Autres' },
];

const sourceLabels = Object.fromEntries(sourceOptions.map(s => [s.value, s.label])) as Record<TreasurySource, string>;
const sourceColors = ['#059669', '#2563eb', '#f59e0b', '#7c3aed', '#dc2626', '#0f766e', '#64748b'];
const conditionLabels: Record<string, string> = { good: 'Bon', used: 'Use', damaged: 'Abime', sold: 'Vendu', discarded: 'Jete', lost: 'Perdu' };

const emptyTx = {
  kind: 'income',
  source: 'adhesion',
  label: '',
  amount: '',
  occurredAt: new Date().toISOString().slice(0, 10),
  counterparty: '',
  reference: '',
  description: '',
};

const emptyAsset = {
  name: '',
  category: '',
  condition: 'good',
  estimatedValue: '',
  location: '',
  responsible: '',
  notes: '',
};

export default function AdminTresoreriePage() {
  const [tab, setTab] = useState<TabValue>('overview');
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tx, setTx] = useState(emptyTx);
  const [asset, setAsset] = useState(emptyAsset);
  const [feeAmount, setFeeAmount] = useState('');
  const [feeReason, setFeeReason] = useState('');
  const importRef = useRef<HTMLInputElement>(null);

  const overview = useTreasuryOverview(true);
  const income = useTreasuryTransactions('income', true);
  const expense = useTreasuryTransactions('expense', true);
  const donations = useTreasuryTransactions('income', true, 'don');
  const transactions = useTreasuryTransactions(undefined, true);
  const assets = useTreasuryAssets(true);
  const feeProposals = useMembershipFeeProposals(true);
  const createTx = useCreateTreasuryTransaction();
  const createAsset = useCreateTreasuryAsset();
  const deleteTx = useDeleteTreasuryTransaction();
  const deleteAsset = useDeleteTreasuryAsset();
  const createFeeProposal = useCreateMembershipFeeProposal();
  const uploadDoc = useUploadTreasuryDocument();

  const data = overview.data?.data;
  const incomeItems = income.data?.data?.items ?? [];
  const expenseItems = expense.data?.data?.items ?? [];
  const donationItems = donations.data?.data?.items ?? [];
  const assetItems = assets.data?.data?.items ?? [];
  const sourceData = data?.sources ?? [];
  const balanceTone = (data?.kpis.balance ?? 0) >= 0 ? 'emerald' : 'red';

  const visibleItems = tab === 'income'
    ? incomeItems
    : tab === 'expense'
      ? expenseItems
      : tab === 'don'
        ? donationItems
        : transactions.data?.data?.items ?? [];

  const selectTab = (value: TabValue) => {
    setTab(value);
  };

  const openForm = (mode: FormMode) => {
    setFormMode(mode);
    if (mode === 'income') setTx(prev => ({ ...prev, kind: 'income', source: 'adhesion' }));
    if (mode === 'expense') setTx(prev => ({ ...prev, kind: 'expense', source: 'other' }));
    if (mode === 'don') setTx(prev => ({ ...prev, kind: 'income', source: 'don' }));
  };

  const handleTx = () => {
    createTx.mutate({
      ...tx,
      kind: tx.kind as TreasuryKind,
      source: tx.source as TreasurySource,
      amount: Number(tx.amount),
      visibility: 'members',
    }, {
      onSuccess: () => {
        setTx(emptyTx);
        setFormMode(null);
      },
    });
  };

  const handleAsset = () => {
    createAsset.mutate({
      ...asset,
      estimatedValue: Number(asset.estimatedValue || 0),
      condition: asset.condition as TreasuryAsset['condition'],
    }, {
      onSuccess: () => {
        setAsset(emptyAsset);
        setFormMode(null);
      },
    });
  };

  const handleFeeProposal = () => {
    createFeeProposal.mutate({ amount: Number(feeAmount), reason: feeReason }, {
      onSuccess: () => {
        setFeeAmount('');
        setFeeReason('');
        setSettingsOpen(false);
      },
    });
  };

  const handleImport = (file?: File) => {
    if (file) uploadDoc.mutate(file);
  };

  const handleDeleteTx = (id: string) => {
    if (window.confirm('Supprimer cette operation de tresorerie ?')) deleteTx.mutate(id);
  };

  const handleDeleteAsset = (id: string) => {
    if (window.confirm('Supprimer cet element de patrimoine ?')) deleteAsset.mutate(id);
  };

  const exportCsv = () => {
    const rows = tab === 'assets'
      ? assetItems.map(item => ({
          type: 'patrimoine',
          nom: item.name,
          categorie: item.category ?? '',
          etat: item.condition,
          valeur: item.estimatedValue ?? 0,
          localisation: item.location ?? '',
          responsable: item.responsible ?? '',
        }))
      : visibleItems.map(item => ({
          type: item.kind,
          source: item.source,
          libelle: item.label,
          montant: item.amount,
          date: new Date(item.occurredAt).toLocaleDateString('fr-FR'),
          tiers: item.counterparty ?? '',
          reference: item.reference ?? '',
        }));

    const header = Object.keys(rows[0] ?? { export: 'Aucune donnee' });
    const csv = [header.join(';'), ...rows.map(row => header.map(key => String((row as any)[key] ?? '').replace(/;/g, ',')).join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salam-tresorerie-${tab}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
          <p className="mt-1 text-sm text-neutral-500">Pilotage des encaissements, decaissements, dons, justificatifs et patrimoine.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => openForm(tab === 'expense' ? 'expense' : tab === 'don' ? 'don' : tab === 'assets' ? 'asset' : 'income')} className="inline-flex h-9 items-center gap-2 rounded-xl bg-emerald-600 px-3 text-xs font-black text-white shadow-sm transition hover:bg-emerald-700">
            <Plus size={14} /> {tab === 'expense' ? 'Ajouter depense' : tab === 'don' ? 'Ajouter don' : tab === 'assets' ? 'Ajouter patrimoine' : 'Ajouter encaissement'}
          </button>
          <button onClick={() => importRef.current?.click()} className="inline-flex h-9 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-black text-neutral-600 transition hover:border-emerald-200 hover:text-emerald-700">
            <FileUp size={14} /> Importer
          </button>
          <button onClick={exportCsv} className="inline-flex h-9 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-black text-neutral-600 transition hover:border-emerald-200 hover:text-emerald-700">
            <Download size={14} /> Exporter
          </button>
          <button onClick={() => setSettingsOpen(true)} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 transition hover:border-emerald-200 hover:text-emerald-700" title="Parametres tresorerie">
            <Settings2 size={15} />
          </button>
          <input ref={importRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.csv,.xlsx" className="hidden" onChange={e => handleImport(e.target.files?.[0])} />
        </div>
      </div>

      <AnimatedTabBar items={tabs} value={tab} onChange={selectTab} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
        <Kpi label="Solde disponible" value={formatFcfa(data?.kpis.balance ?? 0)} icon={WalletCards} tone={balanceTone} />
        <Kpi label="Encaissements" value={formatFcfa(data?.kpis.income ?? 0)} icon={ArrowUpRight} tone="emerald" />
        <Kpi label="Decaissements" value={formatFcfa(data?.kpis.expense ?? 0)} icon={ArrowDownRight} tone="red" />
        <Kpi label="Adhesions en attente" value={formatFcfa(data?.kpis.pendingAdhesions ?? 0)} icon={Clock} tone="amber" sub={`${data?.kpis.activeMembers ?? 0} membres actifs`} />
        <Kpi label="Frais d'adhesion" value={formatFcfa(data?.kpis.membershipFee ?? 5000)} icon={Banknote} tone="blue" />
        <Kpi label="Patrimoine" value={formatFcfa(data?.kpis.assetsValue ?? 0)} icon={Package} tone="violet" sub={`${data?.kpis.assetsCount ?? 0} element(s)`} />
      </div>

      {settingsOpen && (
        <FormPanel title="Parametres tresorerie" onClose={() => setSettingsOpen(false)}>
          <div className="grid gap-4 lg:grid-cols-[1fr_420px] lg:items-end">
            <div>
              <p className="text-sm font-black text-neutral-900">Frais d'adhesion</p>
              <p className="mt-1 text-xs leading-5 text-neutral-500">
                Montant courant : <b>{formatFcfa(data?.kpis.membershipFee ?? 5000)}</b>. Toute modification doit etre validee par le President, le Commissaire aux comptes et le Tresorier.
              </p>
              {(feeProposals.data?.data?.items ?? []).filter(p => p.status === 'pending').map(p => (
                <p key={p._id} className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                  Validation en attente : {formatFcfa(p.oldAmount)} vers {formatFcfa(p.newAmount)} - {p.approvals.length}/3 validation(s)
                </p>
              ))}
            </div>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <input value={feeAmount} onChange={e => setFeeAmount(e.target.value)} type="number" min="1" placeholder="5000" className="h-10 rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10" />
              <button onClick={handleFeeProposal} disabled={createFeeProposal.isPending || !feeAmount} className="h-10 rounded-xl bg-emerald-600 px-4 text-xs font-black text-white disabled:opacity-50">Proposer</button>
              <input value={feeReason} onChange={e => setFeeReason(e.target.value)} placeholder="Motif du changement" className="h-10 rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 sm:col-span-2" />
            </div>
          </div>
        </FormPanel>
      )}

      {formMode && (
        <FormPanel title={formMode === 'expense' ? 'Nouvelle depense' : formMode === 'don' ? 'Nouveau don' : formMode === 'asset' ? 'Nouveau patrimoine' : 'Nouvel encaissement'} onClose={() => setFormMode(null)}>
          {formMode === 'asset' ? (
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Nom du materiel" value={asset.name} onChange={v => setAsset(p => ({ ...p, name: v }))} />
              <Field label="Categorie" value={asset.category} onChange={v => setAsset(p => ({ ...p, category: v }))} />
              <Select label="Etat" value={asset.condition} onChange={v => setAsset(p => ({ ...p, condition: v }))} options={[['good', 'Bon'], ['used', 'Use'], ['damaged', 'Abime'], ['sold', 'Vendu'], ['discarded', 'Jete'], ['lost', 'Perdu']]} />
              <Field label="Valeur estimee F.CFA" value={asset.estimatedValue} onChange={v => setAsset(p => ({ ...p, estimatedValue: v }))} type="number" />
              <Field label="Localisation" value={asset.location} onChange={v => setAsset(p => ({ ...p, location: v }))} />
              <Field label="Responsable" value={asset.responsible} onChange={v => setAsset(p => ({ ...p, responsible: v }))} />
              <Field label="Notes" value={asset.notes} onChange={v => setAsset(p => ({ ...p, notes: v }))} className="md:col-span-2" />
              <button onClick={handleAsset} disabled={createAsset.isPending || !asset.name} className="h-10 rounded-xl bg-emerald-600 text-sm font-black text-white disabled:opacity-50 md:col-span-2">Enregistrer le patrimoine</button>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              <Select label="Type" value={tx.kind} onChange={v => setTx(p => ({ ...p, kind: v }))} options={[['income', 'Encaissement'], ['expense', 'Decaissement']]} disabled={formMode === 'don' || formMode === 'expense'} />
              <Select label="Source" value={tx.source} onChange={v => setTx(p => ({ ...p, source: v }))} options={sourceOptions.map(s => [s.value, s.label])} disabled={formMode === 'don'} />
              <Field label="Libelle" value={tx.label} onChange={v => setTx(p => ({ ...p, label: v }))} />
              <Field label="Montant F.CFA" value={tx.amount} onChange={v => setTx(p => ({ ...p, amount: v }))} type="number" />
              <Field label="Date" value={tx.occurredAt} onChange={v => setTx(p => ({ ...p, occurredAt: v }))} type="date" />
              <Field label="Origine / beneficiaire" value={tx.counterparty} onChange={v => setTx(p => ({ ...p, counterparty: v }))} />
              <Field label="Reference" value={tx.reference} onChange={v => setTx(p => ({ ...p, reference: v }))} />
              <Field label="Description" value={tx.description} onChange={v => setTx(p => ({ ...p, description: v }))} />
              <button onClick={handleTx} disabled={createTx.isPending || !tx.label || !tx.amount} className="h-10 rounded-xl bg-emerald-600 text-sm font-black text-white disabled:opacity-50 md:col-span-2">Enregistrer l'ecriture</button>
            </div>
          )}
        </FormPanel>
      )}

      {tab === 'overview' && (
        <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardTitle title="Evolution encaissements & depenses" />
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.chart ?? []}>
                    <defs>
                      <linearGradient id="adminIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#059669" stopOpacity={0.28} />
                        <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="adminExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#dc2626" stopOpacity={0.16} />
                        <stop offset="100%" stopColor="#dc2626" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${Math.round(Number(v) / 1000)}k`} />
                    <Tooltip formatter={v => formatFcfa(Number(v ?? 0))} />
                    <Area type="monotone" dataKey="income" stroke="#059669" fill="url(#adminIncome)" strokeWidth={2} name="Encaissements" />
                    <Area type="monotone" dataKey="expense" stroke="#dc2626" fill="url(#adminExpense)" strokeWidth={2} name="Depenses" />
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
                    { period: '30j', prudent: data?.kpis.paidAdhesions ?? 0, realiste: data?.kpis.expectedAdhesions ?? 0, optimiste: (data?.kpis.expectedAdhesions ?? 0) + (data?.kpis.membershipFee ?? 0) },
                    { period: '60j', prudent: data?.kpis.paidAdhesions ?? 0, realiste: (data?.kpis.expectedAdhesions ?? 0) + (data?.kpis.pendingAdhesions ?? 0) * 0.25, optimiste: (data?.kpis.expectedAdhesions ?? 0) + (data?.kpis.pendingAdhesions ?? 0) * 0.5 },
                    { period: '90j', prudent: data?.kpis.expectedAdhesions ?? 0, realiste: (data?.kpis.expectedAdhesions ?? 0) + (data?.kpis.pendingAdhesions ?? 0) * 0.5, optimiste: (data?.kpis.expectedAdhesions ?? 0) + (data?.kpis.pendingAdhesions ?? 0) },
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

      {tab === 'income' && <TransactionList title="Encaissements" items={incomeItems} loading={income.isLoading} onDelete={handleDeleteTx} deletingId={deleteTx.variables} />}
      {tab === 'expense' && <TransactionList title="Decaissements" items={expenseItems} loading={expense.isLoading} onDelete={handleDeleteTx} deletingId={deleteTx.variables} />}
      {tab === 'don' && <TransactionList title="Dons recus" items={donationItems} loading={donations.isLoading} onDelete={handleDeleteTx} deletingId={deleteTx.variables} />}
      {tab === 'assets' && <AssetList title="Patrimoine" items={assetItems} loading={assets.isLoading} onDelete={handleDeleteAsset} deletingId={deleteAsset.variables} />}
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

function FormPanel({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <section className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 size={16} className="text-emerald-700" />
          <p className="text-sm font-black text-neutral-900">{title}</p>
        </div>
        <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100"><X size={15} /></button>
      </div>
      {children}
    </section>
  );
}

function Field({ label, value, onChange, type = 'text', className = '' }: { label: string; value: string; onChange: (v: string) => void; type?: string; className?: string }) {
  return (
    <label className={`space-y-1.5 ${className}`}>
      <span className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">{label}</span>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} className="h-10 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10" />
    </label>
  );
}

function Select({ label, value, onChange, options, disabled = false }: { label: string; value: string; onChange: (v: string) => void; options: string[][]; disabled?: boolean }) {
  return (
    <label className="space-y-1.5">
      <span className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">{label}</span>
      <select disabled={disabled} value={value} onChange={e => onChange(e.target.value)} className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 disabled:bg-neutral-50 disabled:text-neutral-400">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}

function TransactionList({ title, items, kind, loading, onDelete, deletingId }: { title: string; items: TreasuryTransaction[]; kind?: TreasuryKind; loading?: boolean; onDelete?: (id: string) => void; deletingId?: string }) {
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
              <p className="truncate text-xs text-neutral-400">{sourceLabels[item.source] ?? item.category ?? 'Operation'} - {new Date(item.occurredAt).toLocaleDateString('fr-FR')}</p>
            </div>
            <p className={`shrink-0 text-sm font-black ${item.kind === 'expense' ? 'text-red-600' : 'text-emerald-700'}`}>{formatFcfa(item.amount)}</p>
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(item._id)}
                disabled={deletingId === item._id}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
                title="Supprimer"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function AssetList({ title, items, loading, onDelete, deletingId }: { title: string; items: TreasuryAsset[]; loading?: boolean; onDelete?: (id: string) => void; deletingId?: string }) {
  return (
    <Card>
      <CardTitle title={title} subtitle={`${items.length} element(s)`} />
      <div className="grid gap-3 sm:grid-cols-2">
        {loading && <p className="py-6 text-sm text-neutral-400">Chargement...</p>}
        {!loading && items.length === 0 && <p className="py-6 text-sm font-semibold text-neutral-400">Aucun element de patrimoine renseigne.</p>}
        {items.map(item => (
          <div key={item._id} className="rounded-2xl border border-neutral-100 bg-neutral-50/70 p-3">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-700"><Boxes size={16} /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-neutral-900">{item.name}</p>
                <p className="text-xs text-neutral-400">{item.category || 'Materiel'} - {conditionLabels[item.condition] ?? item.condition}</p>
                <p className="mt-1 text-xs font-semibold text-neutral-500">{formatFcfa(item.estimatedValue ?? 0)}</p>
              </div>
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(item._id)}
                  disabled={deletingId === item._id}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-white text-red-500 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
                  title="Supprimer"
                >
                  <Trash2 size={13} />
                </button>
              )}
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
