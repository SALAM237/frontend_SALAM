'use client';

import { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Boxes, Plus, WalletCards } from 'lucide-react';
import { formatFcfa, useCreateMembershipFeeProposal, useCreateTreasuryAsset, useCreateTreasuryTransaction, useMembershipFeeProposals, useTreasuryAssets, useTreasuryOverview, useTreasuryTransactions, useUploadTreasuryDocument, type TreasurySource } from '@/lib/api/treasury';

const sourceOptions: { value: TreasurySource; label: string }[] = [
  { value: 'adhesion', label: "Frais d'adhesion" },
  { value: 'don', label: 'Don' },
  { value: 'crowdfunding', label: 'Crowdfunding' },
  { value: 'activity', label: 'Activite' },
  { value: 'subvention', label: 'Subvention' },
  { value: 'partner', label: 'Partenaire' },
  { value: 'other', label: 'Autre' },
];

export default function AdminTresoreriePage() {
  const [mode, setMode] = useState<'transaction' | 'asset'>('transaction');
  const [tx, setTx] = useState({ kind: 'income', source: 'adhesion', label: '', amount: '', occurredAt: new Date().toISOString().slice(0, 10), counterparty: '', reference: '' });
  const [asset, setAsset] = useState({ name: '', category: '', condition: 'good', estimatedValue: '', location: '', responsible: '' });
  const [feeAmount, setFeeAmount] = useState('');
  const [feeReason, setFeeReason] = useState('');
  const overview = useTreasuryOverview(true);
  const feeProposals = useMembershipFeeProposals(true);
  const transactions = useTreasuryTransactions(undefined, true);
  const assets = useTreasuryAssets(true);
  const createTx = useCreateTreasuryTransaction();
  const createAsset = useCreateTreasuryAsset();
  const createFeeProposal = useCreateMembershipFeeProposal();
  const uploadDoc = useUploadTreasuryDocument();

  const handleTx = () => {
    createTx.mutate({ ...tx, amount: Number(tx.amount), kind: tx.kind as any, source: tx.source as any }, {
      onSuccess: () => setTx(prev => ({ ...prev, label: '', amount: '', counterparty: '', reference: '' })),
    });
  };

  const handleAsset = () => {
    createAsset.mutate({ ...asset, estimatedValue: Number(asset.estimatedValue || 0), condition: asset.condition as any }, {
      onSuccess: () => setAsset(prev => ({ ...prev, name: '', estimatedValue: '', location: '', responsible: '' })),
    });
  };

  const handleFeeProposal = () => {
    createFeeProposal.mutate({ amount: Number(feeAmount), reason: feeReason }, {
      onSuccess: () => { setFeeAmount(''); setFeeReason(''); },
    });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Tresorerie</h1>
        <p className="mt-0.5 text-sm text-neutral-500">Gestion des ecritures, dons, justificatifs et patrimoine de SALAM.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Kpi label="Solde" value={formatFcfa(overview.data?.data?.kpis.balance ?? 0)} />
        <Kpi label="Encaissements" value={formatFcfa(overview.data?.data?.kpis.income ?? 0)} />
        <Kpi label="Depenses" value={formatFcfa(overview.data?.data?.kpis.expense ?? 0)} />
        <Kpi label="Adhesions attendues" value={formatFcfa(overview.data?.data?.kpis.pendingAdhesions ?? 0)} />
      </div>

      <section className="rounded-3xl border border-amber-100 bg-amber-50/40 p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_380px] lg:items-end">
          <div>
            <p className="text-sm font-black text-neutral-900">Parametrage des frais d'adhesion</p>
            <p className="mt-1 text-xs leading-5 text-neutral-500">
              Montant courant : <b>{formatFcfa(overview.data?.data?.kpis.membershipFee ?? 5000)}</b>. Toute modification part en validation et ne s'applique qu'apres accord du President, du Commissaire aux comptes et du Tresorier.
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

      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <section className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex rounded-2xl bg-neutral-50 p-1">
            <button onClick={() => setMode('transaction')} className={`h-9 flex-1 rounded-xl text-xs font-black ${mode === 'transaction' ? 'bg-white text-emerald-700 shadow-sm' : 'text-neutral-500'}`}>Ecriture</button>
            <button onClick={() => setMode('asset')} className={`h-9 flex-1 rounded-xl text-xs font-black ${mode === 'asset' ? 'bg-white text-emerald-700 shadow-sm' : 'text-neutral-500'}`}>Patrimoine</button>
          </div>

          {mode === 'transaction' ? (
            <div className="space-y-3">
              <Select label="Type" value={tx.kind} onChange={v => setTx(p => ({ ...p, kind: v }))} options={[['income', 'Encaissement'], ['expense', 'Decaissement']]} />
              <Select label="Source" value={tx.source} onChange={v => setTx(p => ({ ...p, source: v }))} options={sourceOptions.map(s => [s.value, s.label])} />
              <Field label="Libelle" value={tx.label} onChange={v => setTx(p => ({ ...p, label: v }))} />
              <Field label="Montant F.CFA" value={tx.amount} onChange={v => setTx(p => ({ ...p, amount: v }))} type="number" />
              <Field label="Date" value={tx.occurredAt} onChange={v => setTx(p => ({ ...p, occurredAt: v }))} type="date" />
              <Field label="Origine / beneficiaire" value={tx.counterparty} onChange={v => setTx(p => ({ ...p, counterparty: v }))} />
              <Field label="Reference" value={tx.reference} onChange={v => setTx(p => ({ ...p, reference: v }))} />
              <label className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">Importer un justificatif</span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={e => { const file = e.target.files?.[0]; if (file) uploadDoc.mutate(file); }}
                  className="block w-full rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-500 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-3 file:py-1.5 file:text-xs file:font-black file:text-white"
                />
              </label>
              <button onClick={handleTx} disabled={createTx.isPending} className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-black text-white disabled:opacity-50"><Plus size={15} /> Ajouter</button>
            </div>
          ) : (
            <div className="space-y-3">
              <Field label="Nom du materiel" value={asset.name} onChange={v => setAsset(p => ({ ...p, name: v }))} />
              <Field label="Categorie" value={asset.category} onChange={v => setAsset(p => ({ ...p, category: v }))} />
              <Select label="Etat" value={asset.condition} onChange={v => setAsset(p => ({ ...p, condition: v }))} options={[['good', 'Bon'], ['used', 'Use'], ['damaged', 'Abime'], ['sold', 'Vendu'], ['discarded', 'Jete'], ['lost', 'Perdu']]} />
              <Field label="Valeur estimee F.CFA" value={asset.estimatedValue} onChange={v => setAsset(p => ({ ...p, estimatedValue: v }))} type="number" />
              <Field label="Localisation" value={asset.location} onChange={v => setAsset(p => ({ ...p, location: v }))} />
              <Field label="Responsable" value={asset.responsible} onChange={v => setAsset(p => ({ ...p, responsible: v }))} />
              <button onClick={handleAsset} disabled={createAsset.isPending} className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-black text-white disabled:opacity-50"><Plus size={15} /> Ajouter</button>
            </div>
          )}
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <Panel title="Dernieres ecritures" icon={WalletCards}>
            {(transactions.data?.data?.items ?? []).slice(0, 12).map(item => (
              <div key={item._id} className="flex items-center gap-3 border-b border-neutral-50 py-3 last:border-0">
                <span className={`flex h-9 w-9 items-center justify-center rounded-2xl ${item.kind === 'expense' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
                  {item.kind === 'expense' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-neutral-900">{item.label}</p>
                  <p className="text-xs text-neutral-400">{new Date(item.occurredAt).toLocaleDateString('fr-FR')}</p>
                </div>
                <p className="shrink-0 text-sm font-black text-neutral-900">{formatFcfa(item.amount)}</p>
              </div>
            ))}
          </Panel>
          <Panel title="Patrimoine" icon={Boxes}>
            {(assets.data?.data?.items ?? []).slice(0, 12).map(item => (
              <div key={item._id} className="flex items-center gap-3 border-b border-neutral-50 py-3 last:border-0">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><Boxes size={16} /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-neutral-900">{item.name}</p>
                  <p className="text-xs text-neutral-400">{item.category || 'Materiel'} · {item.condition}</p>
                </div>
                <p className="shrink-0 text-sm font-black text-neutral-900">{formatFcfa(item.estimatedValue ?? 0)}</p>
              </div>
            ))}
          </Panel>
        </section>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return <div className="rounded-3xl border border-neutral-100 bg-white p-4 shadow-sm"><p className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">{label}</p><p className="mt-2 text-lg font-black text-neutral-900">{value}</p></div>;
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return <label className="space-y-1.5"><span className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">{label}</span><input type={type} value={value} onChange={e => onChange(e.target.value)} className="h-10 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10" /></label>;
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[][] }) {
  return <label className="space-y-1.5"><span className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">{label}</span><select value={value} onChange={e => onChange(e.target.value)} className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10">{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>;
}

function Panel({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return <div className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm"><div className="mb-3 flex items-center gap-2"><Icon size={17} className="text-emerald-700" /><p className="text-sm font-black text-neutral-900">{title}</p></div>{children}</div>;
}
