'use client';

import { useMemo, useRef, useState } from 'react';
import {
  ArrowDownRight, ArrowUpRight, Boxes, Download, FileUp, Plus, Settings2,
  WalletCards, X,
} from 'lucide-react';
import {
  formatFcfa,
  useCreateMembershipFeeProposal,
  useCreateTreasuryAsset,
  useCreateTreasuryTransaction,
  useMembershipFeeProposals,
  useTreasuryAssets,
  useTreasuryOverview,
  useTreasuryTransactions,
  useUploadTreasuryDocument,
  type TreasuryAsset,
  type TreasurySource,
  type TreasuryTransaction,
} from '@/lib/api/treasury';

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
  { value: 'don', label: 'Don' },
  { value: 'crowdfunding', label: 'Crowdfunding' },
  { value: 'activity', label: 'Activite' },
  { value: 'subvention', label: 'Subvention' },
  { value: 'partner', label: 'Partenaire' },
  { value: 'other', label: 'Autre' },
];

const sourceLabels = Object.fromEntries(sourceOptions.map(s => [s.value, s.label])) as Record<TreasurySource, string>;
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
  const [tx, setTx] = useState(emptyTx);
  const [asset, setAsset] = useState(emptyAsset);
  const [feeAmount, setFeeAmount] = useState('');
  const [feeReason, setFeeReason] = useState('');
  const importRef = useRef<HTMLInputElement>(null);

  const overview = useTreasuryOverview(true);
  const income = useTreasuryTransactions('income', true);
  const expense = useTreasuryTransactions('expense', true);
  const transactions = useTreasuryTransactions(undefined, true);
  const assets = useTreasuryAssets(true);
  const feeProposals = useMembershipFeeProposals(true);
  const createTx = useCreateTreasuryTransaction();
  const createAsset = useCreateTreasuryAsset();
  const createFeeProposal = useCreateMembershipFeeProposal();
  const uploadDoc = useUploadTreasuryDocument();

  const data = overview.data?.data;
  const incomeItems = income.data?.data?.items ?? [];
  const expenseItems = expense.data?.data?.items ?? [];
  const donationItems = useMemo(() => incomeItems.filter(item => item.source === 'don'), [incomeItems]);
  const assetItems = assets.data?.data?.items ?? [];

  const visibleItems = tab === 'income'
    ? incomeItems
    : tab === 'expense'
      ? expenseItems
      : tab === 'don'
        ? donationItems
        : transactions.data?.data?.items ?? [];

  const openForm = (mode: FormMode) => {
    setFormMode(mode);
    if (mode === 'income') setTx(prev => ({ ...prev, kind: 'income', source: 'adhesion' }));
    if (mode === 'expense') setTx(prev => ({ ...prev, kind: 'expense', source: 'other' }));
    if (mode === 'don') setTx(prev => ({ ...prev, kind: 'income', source: 'don' }));
  };

  const handleTx = () => {
    createTx.mutate({
      ...tx,
      kind: tx.kind as 'income' | 'expense',
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
      },
    });
  };

  const handleImport = (file?: File) => {
    if (file) uploadDoc.mutate(file);
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

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Tresorerie</h1>
          <p className="mt-1 text-sm text-neutral-500">Gestion des encaissements, decaissements, dons, justificatifs et patrimoine.</p>
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
          <input ref={importRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.csv,.xlsx" className="hidden" onChange={e => handleImport(e.target.files?.[0])} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Solde" value={formatFcfa(data?.kpis.balance ?? 0)} />
        <Kpi label="Encaissements" value={formatFcfa(data?.kpis.income ?? 0)} />
        <Kpi label="Depenses" value={formatFcfa(data?.kpis.expense ?? 0)} />
        <Kpi label="Adhesions attendues" value={formatFcfa(data?.kpis.pendingAdhesions ?? 0)} />
      </div>

      <section className="rounded-xl border border-amber-100 bg-amber-50/50 p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <p className="text-sm font-black text-neutral-900">Parametrage des frais d'adhesion</p>
            <p className="mt-1 text-xs leading-5 text-neutral-500">
              Montant courant : <b>{formatFcfa(data?.kpis.membershipFee ?? 5000)}</b>. Toute modification doit etre validee par le President, le Commissaire aux comptes et le Tresorier.
            </p>
            {(feeProposals.data?.data?.items ?? []).filter(p => p.status === 'pending').map(p => (
              <p key={p._id} className="mt-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-amber-700">
                Validation en attente : {formatFcfa(p.oldAmount)} vers {formatFcfa(p.newAmount)} · {p.approvals.length}/3 validation(s)
              </p>
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <input value={feeAmount} onChange={e => setFeeAmount(e.target.value)} type="number" min="1" placeholder="5000" className="h-10 rounded-xl border border-amber-200 bg-white px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10" />
            <button onClick={handleFeeProposal} disabled={createFeeProposal.isPending || !feeAmount} className="h-10 rounded-xl bg-emerald-600 px-4 text-xs font-black text-white disabled:opacity-50">Proposer</button>
            <input value={feeReason} onChange={e => setFeeReason(e.target.value)} placeholder="Motif du changement" className="h-10 rounded-xl border border-amber-200 bg-white px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 sm:col-span-2" />
          </div>
        </div>
      </section>

      <div className="overflow-x-auto rounded-2xl border border-neutral-100 bg-white p-1 shadow-sm">
        <div className="flex min-w-max gap-1">
          {tabs.map(item => (
            <button key={item.value} onClick={() => setTab(item.value)} className={`h-10 rounded-xl px-4 text-xs font-black transition ${tab === item.value ? 'bg-emerald-600 text-white shadow-sm' : 'text-neutral-500 hover:bg-neutral-50'}`}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

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
        <div className="grid gap-4 xl:grid-cols-2">
          <TransactionList title="Dernieres ecritures" items={(transactions.data?.data?.items ?? []).slice(0, 12)} />
          <AssetList title="Patrimoine recent" items={assetItems.slice(0, 12)} />
        </div>
      )}
      {tab === 'income' && <TransactionList title="Encaissements" items={incomeItems} />}
      {tab === 'expense' && <TransactionList title="Decaissements" items={expenseItems} />}
      {tab === 'don' && <TransactionList title="Dons" items={donationItems} />}
      {tab === 'assets' && <AssetList title="Patrimoine" items={assetItems} />}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-100 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">{label}</p>
      <p className="mt-2 text-lg font-black text-neutral-900">{value}</p>
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

function TransactionList({ title, items }: { title: string; items: TreasuryTransaction[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
      <div className="border-b border-neutral-100 px-5 py-3.5">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-neutral-500">{title} - {items.length}</p>
      </div>
      <div className="divide-y divide-neutral-50">
        {items.length === 0 && <p className="px-5 py-8 text-sm font-semibold text-neutral-400">Aucune donnee pour le moment.</p>}
        {items.map(item => (
          <div key={item._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-neutral-50/70">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${item.kind === 'expense' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
              {item.kind === 'expense' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-neutral-900">{item.label}</p>
              <p className="truncate text-xs text-neutral-400">{sourceLabels[item.source] ?? item.category ?? 'Operation'} · {new Date(item.occurredAt).toLocaleDateString('fr-FR')}</p>
            </div>
            <p className={`shrink-0 text-sm font-black ${item.kind === 'expense' ? 'text-red-600' : 'text-emerald-700'}`}>{formatFcfa(item.amount)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AssetList({ title, items }: { title: string; items: TreasuryAsset[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
      <div className="border-b border-neutral-100 px-5 py-3.5">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-neutral-500">{title} - {items.length}</p>
      </div>
      <div className="grid gap-3 p-5 md:grid-cols-2">
        {items.length === 0 && <p className="text-sm font-semibold text-neutral-400">Aucun element de patrimoine.</p>}
        {items.map(item => (
          <div key={item._id} className="rounded-2xl border border-neutral-100 bg-neutral-50/70 p-3">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-700"><Boxes size={16} /></span>
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
