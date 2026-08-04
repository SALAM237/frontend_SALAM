'use client';

import { useEffect, useRef, useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  Bar, BarChart, CartesianGrid,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  AlertTriangle, ArrowDownRight, ArrowUpRight, Boxes, CheckCircle2,
  Clock, Download, FileSpreadsheet, Loader2 as ImportLoader, Package, Plus, RefreshCw, Settings2, Upload, WalletCards,
  Trash2, WifiOff, X, XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
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
import { TreasuryEvolutionSection } from '@/components/shared/TreasuryEvolutionChart';
import { RecoveryRateBlock } from '@/components/shared/RecoveryRateBlock';
import { ListToolbar } from '@/components/shared/ListToolbar';
import { downloadCsv } from '@/lib/csv-export';

type TabValue = 'overview' | 'income' | 'expense' | 'don' | 'assets';
type FormMode = 'income' | 'expense' | 'don' | 'asset' | null;

interface ImportRow {
  kind: TreasuryKind;
  source: TreasurySource;
  label: string;
  amount: number;
  occurredAt: string;
  counterparty?: string;
  reference?: string;
  description?: string;
  error?: string;
}

const tabs: { value: TabValue; label: string }[] = [
  { value: 'overview', label: "Vue d'ensemble" },
  { value: 'income', label: 'Encaissements' },
  { value: 'expense', label: 'Decaissements' },
  { value: 'don', label: 'Dons' },
  { value: 'assets', label: 'Patrimoine' },
];

const sourceOptions: { value: TreasurySource; label: string }[] = [
  { value: 'adhesion',           label: "Frais d'adhesion" },
  { value: 'cotisation_annuelle', label: 'Cotisation annuelle' },
  { value: 'don',                label: 'Dons' },
  { value: 'crowdfunding',       label: 'Crowdfunding' },
  { value: 'activity',           label: 'Activites' },
  { value: 'subvention',         label: 'Subventions' },
  { value: 'partner',            label: 'Partenaires' },
  { value: 'other',              label: 'Autres' },
];

const sourceLabels = Object.fromEntries(sourceOptions.map(s => [s.value, s.label])) as Record<TreasurySource, string>;
/* Frais d'adhesion et cotisation annuelle sont alimentes automatiquement depuis
   Facturation (recus/factures) — jamais saisis manuellement en tresorerie. */
const manualIncomeSourceOptions = sourceOptions.filter(s => s.value !== 'adhesion' && s.value !== 'cotisation_annuelle');
const isFacturationManaged = (source: TreasurySource) => source === 'adhesion' || source === 'cotisation_annuelle';
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
  const importRef    = useRef<HTMLInputElement>(null);
  const csvImportRef = useRef<HTMLInputElement>(null);
  const settingsRef  = useRef<HTMLDivElement>(null);
  const formRef      = useRef<HTMLDivElement>(null);
  const [importRows, setImportRows] = useState<ImportRow[] | null>(null);

  useEffect(() => {
    if (settingsOpen) settingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [settingsOpen]);

  useEffect(() => {
    if (formMode) formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [formMode]);

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
    if (mode === 'income') setTx(prev => ({ ...prev, kind: 'income', source: 'don' }));
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
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (ext === 'csv' || ext === 'xlsx' || ext === 'xls') {
      parseCsvXlsx(file);
    } else {
      uploadDoc.mutate(file);
    }
  };

  const parseCsvXlsx = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (ext === 'csv') {
      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        complete: result => setImportRows(normalizeRows(result.data)),
        error: () => alert('Erreur lors de la lecture du fichier CSV.'),
      });
    } else {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const wb = XLSX.read(e.target?.result, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' });
          setImportRows(normalizeRows(rows));
        } catch {
          alert('Erreur lors de la lecture du fichier XLSX.');
        }
      };
      reader.readAsArrayBuffer(file);
    }
    if (csvImportRef.current) csvImportRef.current.value = '';
  };

  const VALID_KINDS: TreasuryKind[] = ['income', 'expense'];
  const VALID_SOURCES: TreasurySource[] = ['adhesion', 'don', 'crowdfunding', 'activity', 'subvention', 'partner', 'other'];
  const KIND_ALIASES: Record<string, TreasuryKind> = {
    income: 'income', encaissement: 'income', entree: 'income', entrée: 'income', recette: 'income',
    credit: 'income', crédit: 'income', versement: 'income', perception: 'income', gain: 'income',
    expense: 'expense', decaissement: 'expense', décaissement: 'expense',
    sortie: 'expense', depense: 'expense', dépense: 'expense', debit: 'expense', débit: 'expense',
    charge: 'expense', paiement: 'expense', retrait: 'expense', achat: 'expense',
  };
  const SOURCE_ALIASES: Record<string, TreasurySource> = {
    adhesion: 'adhesion', adhésion: 'adhesion', cotisation: 'adhesion',
    'cotisation annuelle': 'cotisation_annuelle', cotisationannuelle: 'cotisation_annuelle', cotisation_annuelle: 'cotisation_annuelle',
    don: 'don', donation: 'don', dons: 'don',
    crowdfunding: 'crowdfunding',
    activity: 'activity', activite: 'activity', activité: 'activity', evenement: 'activity', événement: 'activity',
    subvention: 'subvention', subventions: 'subvention', grant: 'subvention',
    partner: 'partner', partenaire: 'partner', partenariat: 'partner',
    other: 'other', autre: 'other', autres: 'other', divers: 'other', virement: 'other', inconnu: 'other',
    "frais d'adhesion": 'adhesion', "frais d'adhésion": 'adhesion',
  };

  const normalizeDate = (raw: string): string => {
    if (!raw) return '';
    const trimmed = raw.trim();
    const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) return trimmed;
    const fr = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (fr) return `${fr[3]}-${fr[2].padStart(2, '0')}-${fr[1].padStart(2, '0')}`;
    const dot = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (dot) return `${dot[3]}-${dot[2].padStart(2, '0')}-${dot[1].padStart(2, '0')}`;
    return '';
  };

  const normalizeRows = (raw: Record<string, string>[]): ImportRow[] => {
    return raw.filter(r => Object.values(r).some(v => String(v ?? '').trim())).map(r => {
      const col = (names: string[]) => {
        for (const n of names) {
          const key = Object.keys(r).find(k => k.trim().toLowerCase().replace(/[_\s-]/g, '') === n.toLowerCase().replace(/[_\s-]/g, ''));
          if (key !== undefined) return String(r[key] ?? '').trim();
        }
        return '';
      };
      /* Chercher toutes les colonnes texte non mappées pour le libellé */
      const mappedCols = new Set(['type', 'kind', 'type_operation', 'source', 'montant', 'amount', 'valeur', 'date', 'occurred_at', 'occurredat', 'date_operation', 'tiers', 'counterparty', 'contrepartie', 'reference', 'référence', 'ref', 'description', 'notes', 'note', 'commentaire', 'remarque', 'detail', 'détail']);
      const autoLabel = () => Object.entries(r).find(([k, v]) => !mappedCols.has(k.trim().toLowerCase()) && String(v ?? '').trim())?.[1]?.trim() ?? '';

      const rawKind        = col(['type', 'kind', 'type_operation', 'nature', 'operation', 'opération', 'sens']);
      const rawSource      = col(['source', 'categorie', 'catégorie', 'category', 'origine', 'provenance', 'objet']);
      const rawLabel       = col(['libelle', 'libellé', 'label', 'designation', 'désignation', 'motif', 'intitule', 'intitulé', 'objet']);
      const rawAmount      = col(['montant', 'amount', 'valeur', 'somme', 'total']);
      const rawDate        = col(['date', 'occurred_at', 'occurredAt', 'date_operation', 'date_transaction', 'datevaleur', 'date_valeur']);
      const rawTiers       = col(['tiers', 'counterparty', 'contrepartie', 'beneficiaire', 'bénéficiaire', 'emetteur', 'émetteur', 'donateur', 'payeur']);
      const rawRef         = col(['reference', 'référence', 'ref', 'numero', 'numéro', 'no']);
      const rawDescription = col(['description', 'notes', 'note', 'commentaire', 'remarque', 'detail', 'détail']);

      const kind   = KIND_ALIASES[(rawKind || '').toLowerCase()] as TreasuryKind | undefined;
      const source = SOURCE_ALIASES[(rawSource || '').toLowerCase()] as TreasurySource | undefined;
      const rawAmountClean = rawAmount.replace(/[^\d,.-]/g, '').replace(',', '.');
      const amount = parseFloat(rawAmountClean);
      const date   = normalizeDate(rawDate);

      /* label : colonne explicite → colonne texte libre → auto */
      const label = rawLabel || autoLabel() || `Opération du ${date || rawDate || 'date inconnue'}`;

      const errors: string[] = [];
      if (isNaN(amount) || amount <= 0) errors.push('Montant invalide');
      if (!date)                        errors.push('Date invalide');

      return {
        kind:         kind   ?? 'income',
        source:       source ?? 'other',
        label,
        amount:       isNaN(amount) ? 0 : amount,
        occurredAt:   date || new Date().toISOString().slice(0, 10),
        counterparty: rawTiers       || undefined,
        reference:    rawRef         || undefined,
        description:  rawDescription || undefined,
        error:        errors.length ? errors.join(', ') : undefined,
      };
    });
  };

  const handleDeleteTx = (id: string) => {
    if (window.confirm('Supprimer cette operation de tresorerie ??')) deleteTx.mutate(id);
  };

  const handleDeleteAsset = (id: string) => {
    if (window.confirm('Supprimer cet element de patrimoine ??')) deleteAsset.mutate(id);
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
        <div className="min-w-0">
          <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Tresorerie</h1>
          <p className="mt-1 text-sm text-neutral-500 sm:overflow-hidden sm:text-ellipsis sm:whitespace-nowrap sm:text-[clamp(0.625rem,1.1vw,0.875rem)]">Pilotage des encaissements, decaissements, dons, justificatifs et patrimoine.</p>
        </div>
        <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-1.5 lg:flex-nowrap">
          {tab !== 'overview' && (
            <button onClick={() => openForm(tab === 'expense' ? 'expense' : tab === 'don' ? 'don' : tab === 'assets' ? 'asset' : 'income')} className="inline-flex h-8 w-full items-center justify-center gap-1 whitespace-nowrap rounded-lg bg-emerald-600 px-2 text-[10px] font-black text-white shadow-sm transition hover:bg-emerald-700 sm:w-auto sm:text-[11px]">
              <Plus className="h-3 w-3 shrink-0" /> <span className="truncate">{tab === 'expense' ? 'Ajouter depense' : tab === 'don' ? 'Ajouter don' : tab === 'assets' ? 'Ajouter patrimoine' : 'Ajouter encaissement'}</span>
            </button>
          )}
          <div className="flex flex-nowrap gap-1.5 sm:contents">
            <button onClick={() => csvImportRef.current?.click()} className="inline-flex h-8 min-w-0 flex-1 items-center justify-center gap-0.5 rounded-lg border border-emerald-200 bg-emerald-50 px-1 text-[9px] font-black text-emerald-700 transition hover:bg-emerald-100 active:scale-95 active:bg-emerald-200 sm:h-8 sm:flex-none sm:gap-1 sm:rounded-lg sm:px-2 sm:text-[11px] sm:whitespace-nowrap">
              <Upload className="h-3 w-3 shrink-0" />
              <span className="truncate sm:hidden">CSV/XLSX</span>
              <span className="hidden sm:inline">Importer CSV/XLSX</span>
            </button>
            <button onClick={() => importRef.current?.click()} className="inline-flex h-8 min-w-0 flex-1 items-center justify-center gap-0.5 rounded-lg border border-blue-200 bg-blue-50 px-1 text-[9px] font-black text-blue-700 transition hover:bg-blue-100 active:scale-95 active:bg-blue-200 sm:h-8 sm:flex-none sm:gap-1 sm:rounded-lg sm:px-2 sm:text-[11px] sm:whitespace-nowrap">
              <Upload className="h-3 w-3 shrink-0" />
              <span className="truncate sm:hidden">PDF</span>
              <span className="hidden sm:inline">Import document PDF</span>
            </button>
            <button onClick={exportCsv} className="inline-flex h-8 min-w-0 flex-1 items-center justify-center gap-0.5 rounded-lg border border-violet-200 bg-violet-50 px-1 text-[9px] font-black text-violet-700 transition hover:bg-violet-100 active:scale-95 active:bg-violet-200 sm:h-8 sm:flex-none sm:gap-1 sm:rounded-lg sm:px-2 sm:text-[11px] sm:whitespace-nowrap">
              <Download className="h-3 w-3 shrink-0" />
              <span className="truncate sm:hidden">Export</span>
              <span className="hidden sm:inline">Exporter</span>
            </button>
            <button onClick={() => setSettingsOpen(true)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700 transition hover:bg-amber-100 active:scale-95 active:bg-amber-200 sm:text-[11px]" title="Parametres tresorerie">
              <Settings2 className="h-3 w-3 shrink-0" />
            </button>
          </div>
          <input ref={importRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.heic,.doc,.docx,.xls,.xlsx,.txt" className="hidden" onChange={e => handleImport(e.target.files?.[0])} />
          <input ref={csvImportRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={e => handleImport(e.target.files?.[0])} />
        </div>
      </div>

      <AnimatedTabBar items={tabs} value={tab} onChange={selectTab} />

      {tab === 'overview' && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
          <Kpi label="Solde disponible" value={formatFcfa(data?.kpis.balance ?? 0)} icon={WalletCards} tone={balanceTone} />
          <Kpi label="Encaissements" value={formatFcfa(data?.kpis.income ?? 0)} icon={ArrowUpRight} tone="emerald" />
          <Kpi label="Decaissements" value={formatFcfa(data?.kpis.expense ?? 0)} icon={ArrowDownRight} tone="red" />
          <Kpi label="Adhesions en attente" value={formatFcfa(data?.kpis.pendingAdhesions ?? 0)} icon={Clock} tone="amber" sub={`${data?.kpis.activeMembers ?? 0} membres actifs`} />
          <Kpi label="Cotisation en attente" value={formatFcfa(data?.kpis.pendingAnnuelles ?? 0)} icon={Clock} tone="amber" sub={`${data?.kpis.activeMembers ?? 0} membres actifs`} />
          <Kpi label="Patrimoine" value={formatFcfa(data?.kpis.assetsValue ?? 0)} icon={Package} tone="violet" sub={`${data?.kpis.assetsCount ?? 0} element(s)`} />
        </div>
      )}

      {settingsOpen && (
        <div ref={settingsRef} className="scroll-mt-20">
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
        </div>
      )}

      {formMode && (
        <div ref={formRef} className="scroll-mt-20">
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
              <Select label="Source" value={tx.source} onChange={v => setTx(p => ({ ...p, source: v }))} options={(formMode === 'income' ? manualIncomeSourceOptions : sourceOptions).map(s => [s.value, s.label])} disabled={formMode === 'don'} />
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
        </div>
      )}

      {tab === 'overview' && (
        <div className="space-y-5">
          <TreasuryEvolutionSection
            admin
            defaultChart={data?.chart ?? []}
            defaultSources={sourceData}
            loading={overview.isLoading}
            gradientId="adminTreasury"
            sourceLabels={sourceLabels}
            sourceColors={sourceColors}
          />

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

      {tab === 'income' && <TransactionList title="Encaissements" items={incomeItems} loading={income.isLoading} onDelete={handleDeleteTx} deletingId={deleteTx.variables} />}
      {tab === 'expense' && <TransactionList title="Decaissements" items={expenseItems} loading={expense.isLoading} onDelete={handleDeleteTx} deletingId={deleteTx.variables} />}
      {tab === 'don' && <TransactionList title="Dons recus" items={donationItems} loading={donations.isLoading} onDelete={handleDeleteTx} deletingId={deleteTx.variables} />}
      {tab === 'assets' && <AssetList title="Patrimoine" items={assetItems} loading={assets.isLoading} onDelete={handleDeleteAsset} deletingId={deleteAsset.variables} />}

      {importRows && (
        <CsvImportModal
          rows={importRows}
          onConfirm={async validRows => {
            for (const row of validRows) {
              await createTx.mutateAsync({
                kind: row.kind,
                source: row.source,
                label: row.label,
                amount: row.amount,
                occurredAt: row.occurredAt,
                counterparty: row.counterparty,
                reference: row.reference,
                description: row.description,
                visibility: 'members',
              } as Partial<TreasuryTransaction>);
            }
            setImportRows(null);
          }}
          onClose={() => setImportRows(null)}
        />
      )}
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

function FormPanel({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
      <div className="flex items-center justify-between bg-emerald-50 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <Settings2 size={16} className="text-emerald-700" />
          <p className="text-sm font-black text-emerald-900">{title}</p>
        </div>
        <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-700/60 transition hover:bg-emerald-100 hover:text-emerald-700"><X size={15} /></button>
      </div>
      <div className="p-5">{children}</div>
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

function deletionCountdown(deadline?: string | null, now = Date.now()) {
  if (!deadline) return null;
  const end = new Date(deadline).getTime();
  if (!Number.isFinite(end)) return null;
  const remaining = Math.max(0, end - now);
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function TransactionList({ title, items, kind, loading, onDelete, deletingId }: { title: string; items: TreasuryTransaction[]; kind?: TreasuryKind; loading?: boolean; onDelete?: (id: string) => void; deletingId?: string }) {
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const hasPendingDeletion = items.some(item => item.pendingDeletionAt && new Date(item.pendingDeletionAt).getTime() > Date.now());
    if (!hasPendingDeletion) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [items]);

  const filtered = kind ? items.filter(i => i.kind === kind) : items;
  const q = search.trim().toLowerCase();
  const searched = q
    ? filtered.filter(item => [
        item.label, item.counterparty, item.reference, item.description, sourceLabels[item.source],
      ].some(field => field?.toLowerCase().includes(q)))
    : filtered;
  const visible = searched.slice(0, pageSize);

  return (
    <Card>
      <CardTitle title={title} subtitle={`${searched.length} operation(s)${q ? ` sur ${filtered.length}` : ''}`} />
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
          const countdown = deletionCountdown(item.pendingDeletionAt, now);
          return (
            <div key={item._id} className={`flex cursor-pointer items-center gap-3 py-3 ${countdown ? 'rounded-xl bg-amber-50/70 px-2 sm:px-3' : ''}`} onClick={() => setExpandedId(expanded ? null : item._id)}>
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${item.kind === 'expense' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
                {item.kind === 'expense' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-1.5">
                  <p className={`text-xs font-black text-neutral-900 sm:text-sm ${textCls}`}>{item.label || 'Operation'}</p>
                </div>
                <p className={`text-[11px] text-neutral-400 sm:text-xs ${textCls}`}>{sourceLabels[item.source] ?? item.category ?? 'Operation'} - {new Date(item.occurredAt).toLocaleDateString('fr-FR')}</p>
                {item.description && <p className={`mt-0.5 text-[11px] italic text-neutral-400 sm:text-xs ${textCls}`}>{item.description}</p>}
                {countdown && (
                  <p className="mt-1 rounded-lg border border-amber-200 bg-white/80 px-2 py-1 text-[10px] font-black leading-snug text-amber-700 sm:inline-flex sm:text-[11px]">
                    Suppression en cours : cette ligne disparaitra dans {countdown}.
                  </p>
                )}
              </div>
              <p className={`shrink-0 text-xs font-black sm:text-sm ${item.kind === 'expense' ? 'text-red-600' : 'text-emerald-700'}`}>{formatFcfa(item.amount)}</p>
              {onDelete && (
                isFacturationManaged(item.source) ? (
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      toast.info('Suppression indisponible ici', {
                        description: `"${item.label || 'Cette operation'}" est gere depuis Facturation. Pour la supprimer, rendez-vous dans l'onglet Facturation -> Recus de paiement et supprimez le recu correspondant a ce membre.`,
                        duration: 8000,
                        closeButton: true,
                      });
                    }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-neutral-100 bg-neutral-50 text-neutral-300 transition hover:border-neutral-200 hover:text-neutral-400"
                    title="Suppression via Facturation"
                  >
                    <Trash2 size={13} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); onDelete(item._id); }}
                    disabled={deletingId === item._id}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
                    title="Supprimer"
                  >
                    <Trash2 size={13} />
                  </button>
                )
              )}
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
function AssetList({ title, items, loading, onDelete, deletingId }: { title: string; items: TreasuryAsset[]; loading?: boolean; onDelete?: (id: string) => void; deletingId?: string }) {
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);

  const q = search.trim().toLowerCase();
  const searched = q
    ? items.filter(item => [item.name, item.category, item.location, item.responsible].some(field => field?.toLowerCase().includes(q)))
    : items;
  const visible = searched.slice(0, pageSize);

  return (
    <Card>
      <CardTitle title={title} subtitle={`${searched.length} element(s)${q ? ` sur ${items.length}` : ''}`} />
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

function CsvImportModal({
  rows,
  onConfirm,
  onClose,
}: {
  rows: ImportRow[];
  onConfirm: (validRows: ImportRow[]) => Promise<void>;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const valid   = rows.filter(r => !r.error);
  const invalid = rows.filter(r => r.error);

  const handle = async () => {
    if (valid.length === 0) return;
    setLoading(true);
    try {
      await onConfirm(valid);
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/55 p-3 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <FileSpreadsheet size={18} />
            </div>
            <div>
              <p className="font-black text-neutral-900">Import CSV / XLSX</p>
              <p className="text-[11px] text-neutral-500">{rows.length} ligne{rows.length > 1 ? 's' : ''} détectée{rows.length > 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={onClose} disabled={loading} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100">
            <X size={16} />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-4 px-6 py-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={28} />
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-neutral-900">{valid.length} opération{valid.length > 1 ? 's' : ''} importée{valid.length > 1 ? 's' : ''}</p>
              <p className="mt-1 text-sm text-neutral-500">Les données sont disponibles dans les onglets Encaissements / Décaissements.</p>
            </div>
            <button onClick={onClose} className="h-10 rounded-xl bg-emerald-600 px-6 text-sm font-black text-white">Fermer</button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-px bg-neutral-100">
              <div className="bg-white px-5 py-3 text-center">
                <p className="text-xl font-black text-neutral-900">{rows.length}</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">Total</p>
              </div>
              <div className="bg-white px-5 py-3 text-center">
                <p className="text-xl font-black text-emerald-700">{valid.length}</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-500">Valides</p>
              </div>
              <div className="bg-white px-5 py-3 text-center">
                <p className="text-xl font-black text-red-600">{invalid.length}</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-red-400">Erreurs</p>
              </div>
            </div>

            {/* Format hint */}
            <div className="border-b border-neutral-100 bg-blue-50 px-5 py-2.5">
              <p className="text-[11px] text-blue-700">
                <span className="font-black">Colonnes attendues :</span>{' '}
                <span className="font-mono">type</span> (income/expense) ·{' '}
                <span className="font-mono">source</span> (adhesion/don/…) ·{' '}
                <span className="font-mono">libelle</span> ·{' '}
                <span className="font-mono">montant</span> ·{' '}
                <span className="font-mono">date</span> (JJ/MM/AAAA) ·{' '}
                <span className="font-mono">tiers</span> ·{' '}
                <span className="font-mono">reference</span> ·{' '}
                <span className="font-mono">description</span> (texte libre)
              </p>
            </div>

            {/* Preview table */}
            <div className="max-h-[45vh] overflow-auto">
              <table className="w-full min-w-[640px] border-collapse text-xs">
                <thead>
                  <tr className="sticky top-0 bg-neutral-50">
                    {['Type', 'Source', 'Libellé', 'Montant', 'Date', 'Tiers', 'Description', 'Statut'].map(h => (
                      <th key={h} className="border-b border-neutral-100 px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.1em] text-neutral-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className={row.error ? 'bg-red-50' : 'hover:bg-neutral-50'}>
                      <td className="border-b border-neutral-50 px-3 py-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${row.kind === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                          {row.kind === 'income' ? 'Encaissement' : 'Décaissement'}
                        </span>
                      </td>
                      <td className="border-b border-neutral-50 px-3 py-2 text-neutral-600">{sourceLabels[row.source] ?? row.source}</td>
                      <td className="border-b border-neutral-50 px-3 py-2 font-semibold text-neutral-900 max-w-[140px] truncate">{row.label}</td>
                      <td className={`border-b border-neutral-50 px-3 py-2 font-black ${row.kind === 'income' ? 'text-emerald-700' : 'text-red-600'}`}>
                        {formatFcfa(row.amount)}
                      </td>
                      <td className="border-b border-neutral-50 px-3 py-2 text-neutral-500">{row.occurredAt}</td>
                      <td className="border-b border-neutral-50 px-3 py-2 text-neutral-400">{row.counterparty ?? '—'}</td>
                      <td className="border-b border-neutral-50 px-3 py-2 text-neutral-400 max-w-[120px] truncate" title={row.description ?? ''}>{row.description ?? '—'}</td>
                      <td className="border-b border-neutral-50 px-3 py-2">
                        {row.error ? (
                          <span className="flex items-center gap-1 text-red-600"><XCircle size={11} /> {row.error}</span>
                        ) : (
                          <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 size={11} /> OK</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 border-t border-neutral-100 px-6 py-4">
              {invalid.length > 0 && (
                <p className="text-[11px] text-amber-600">
                  <span className="font-black">{invalid.length} ligne{invalid.length > 1 ? 's' : ''}</span> ignorée{invalid.length > 1 ? 's' : ''} (erreurs)
                </p>
              )}
              <div className="ml-auto flex gap-2">
                <button onClick={onClose} disabled={loading} className="h-10 rounded-xl border border-neutral-200 px-4 text-sm font-bold text-neutral-600 hover:bg-neutral-50 disabled:opacity-50">
                  Annuler
                </button>
                <button onClick={handle} disabled={loading || valid.length === 0}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50">
                  {loading ? <><ImportLoader size={14} className="animate-spin" /> Import en cours…</> : `Importer ${valid.length} ligne${valid.length > 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          </>
        )}
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