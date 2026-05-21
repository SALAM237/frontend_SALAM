'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, ShieldOff, Download, X, Loader2 } from 'lucide-react';
import { useMemberCotisations, type CotisationDoc, type CotisationStatus } from '@/lib/api/cotisations';
import { useAuthStore } from '@/store/auth.store';
import { formatFullName } from '@/lib/format-name';

/* ─── Status config ──────────────────────────────────────── */
const STATUS_CFG: Record<CotisationStatus, { badge: string; label: string; icon: React.ReactNode; dot: string }> = {
  paid:   { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',        label: 'Payé',     icon: <CheckCircle2 size={12} />, dot: 'bg-emerald-500' },
  unpaid: { badge: 'bg-red-50 text-red-700 border-red-200',                    label: 'Non payé', icon: <XCircle size={12} />,      dot: 'bg-red-500'     },
  exempt: { badge: 'bg-emerald-950/10 text-emerald-900 border-emerald-900/25', label: 'Exempté',  icon: <ShieldOff size={12} />,    dot: 'bg-emerald-900' },
};

function fmt(dateStr?: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatCfa(amount?: number) {
  return `${Number(amount ?? 0).toLocaleString('fr-FR')} F.CFA`;
}

/* ─── Skeleton ───────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center gap-4 rounded-2xl border border-neutral-100 bg-white p-5">
          <div className="h-14 w-14 rounded-xl bg-neutral-100 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-36 rounded bg-neutral-100" />
            <div className="h-2 w-24 rounded bg-neutral-50" />
          </div>
          <div className="h-8 w-20 rounded-full bg-neutral-100" />
        </div>
      ))}
    </div>
  );
}

/* ─── Receipt Modal ──────────────────────────────────────── */
function ReceiptModal({ cot, user, onClose }: {
  cot: CotisationDoc;
  user: { firstName: string; lastName: string; _id: string };
  onClose: () => void;
}) {
  const receiptNum = `SALAM-RECU-${cot.year}-${cot._id.slice(-6).toUpperCase()}`;
  const memberId   = `SALAM-${cot.year}-${cot.userId.slice(-4).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <p className="text-sm font-black text-neutral-900">Reçu de paiement</p>
          <div className="flex items-center gap-2">
            <button className="flex h-8 items-center gap-1.5 rounded-lg border border-neutral-200 px-3 text-xs font-semibold text-neutral-600 transition hover:border-emerald-300 hover:text-emerald-700">
              <Download size={12} /> Télécharger
            </button>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="rounded-xl overflow-hidden mb-6" style={{ background: 'linear-gradient(135deg,#07140d,#0b8f3a)' }}>
            <div className="h-[3px]" style={{ background: 'linear-gradient(90deg,#0B8F3A 33%,#C8102E 33%,#C8102E 66%,#F7C600 66%)' }} />
            <div className="px-6 py-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">Association</p>
                <p className="text-lg font-black tracking-[0.12em] text-white">SALAM CAMEROUN</p>
                <p className="text-[11px] text-white/40 mt-0.5">www.salam-cameroun.com</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/30">Reçu N°</p>
                <p className="font-mono text-sm font-bold text-emerald-300">{receiptNum}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-neutral-500">Reçu de paiement</p>
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-emerald-600 px-4 py-1 text-xs font-black text-emerald-700">
              <CheckCircle2 size={13} /> PAYÉ
            </span>
          </div>

          <div className="space-y-0 rounded-xl border border-neutral-100 overflow-hidden mb-5">
            {[
              { label: 'Adhérent',         value: formatFullName(user.firstName, user.lastName) },
              { label: 'N° Membre',        value: memberId, mono: true },
              { label: 'Produit',          value: `Frais d'adhésion — ${cot.year}` },
              { label: 'Date de paiement', value: fmt(cot.paidAt) },
              ...(cot.reference ? [{ label: 'Référence', value: cot.reference, mono: true }] : []),
              ...(cot.notes ? [{ label: 'Commentaire', value: cot.notes }] : []),
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between border-b border-neutral-50 last:border-0 px-4 py-3">
                <span className="text-xs font-semibold text-neutral-500">{row.label}</span>
                <span className={`text-sm font-black text-neutral-900 ${'mono' in row && row.mono ? 'font-mono text-xs' : ''}`}>{row.value}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-100 px-5 py-4">
            <span className="text-sm font-semibold text-neutral-600">Montant total</span>
            <span className="text-2xl font-black text-emerald-700">{formatCfa(cot.amount)}</span>
          </div>

          <p className="mt-4 text-center text-[10px] leading-relaxed text-neutral-400">
            Ce reçu est un justificatif officiel de votre adhésion à l&apos;Association SALAM Cameroun.<br />
            Fondée le 20/02/2010 · contact@salam-cameroun.com
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Page principale ─────────────────────────────────────── */

export default function MemberCotisationsPage() {
  const [openReceipt, setOpenReceipt] = useState<CotisationDoc | null>(null);
  const [filter,      setFilter]      = useState<CotisationStatus | 'all'>('all');

  const { data, isLoading, isError } = useMemberCotisations();
  const user = useAuthStore(s => s.user);

  const cotisations = data?.data ?? [];
  const filtered = cotisations.filter(c => filter === 'all' || c.status === filter);

  return (
    <div className="mx-auto max-w-2xl space-y-6">

      <div>
        <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Mes cotisations</h1>
        <p className="mt-1 text-sm text-neutral-500">Historique de vos frais d&apos;adhésion annuels.</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {([
          { value: 'all',    label: 'Toutes'     },
          { value: 'paid',   label: 'Payées'     },
          { value: 'unpaid', label: 'Non payées' },
          { value: 'exempt', label: 'Exemptées'  },
        ] as { value: CotisationStatus | 'all'; label: string }[]).map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`rounded-full px-4 py-1.5 text-xs font-black transition ${
              filter === f.value
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading && <Skeleton />}

        {isError && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center text-sm text-red-600">
            Erreur de chargement. Vérifiez votre connexion.
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="rounded-2xl border border-neutral-100 bg-white p-10 text-center text-sm text-neutral-400">
            {data?.data?.length === 0
              ? 'Aucune cotisation enregistrée.'
              : 'Aucune cotisation pour ce filtre.'}
          </div>
        )}

        {!isLoading && !isError && filtered.map(cot => {
          const cfg = STATUS_CFG[cot.status];
          return (
            <div key={cot._id} className="flex items-center gap-4 rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm transition-all hover:border-neutral-200 hover:shadow-md">
              <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-neutral-50 border border-neutral-100">
                <p className="text-[10px] font-semibold text-neutral-400">ANNÉE</p>
                <p className="text-lg font-black leading-none text-neutral-900">{cot.year}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm text-neutral-900">Frais d&apos;adhésion {cot.year}</p>
                {cot.status === 'paid' && cot.paidAt && (
                  <p className="text-xs text-neutral-500 mt-0.5">Payé le {fmt(cot.paidAt)}</p>
                )}
                {cot.status === 'unpaid' && (
                  <p className="text-xs text-red-500 mt-0.5 font-semibold">En attente de paiement</p>
                )}
                {cot.status === 'exempt' && (
                  <p className="text-xs text-emerald-700 mt-0.5 font-semibold">Exemption accordée</p>
                )}
              </div>
              <div className="shrink-0 text-right hidden sm:block">
                <p className="text-lg font-black text-neutral-900">
                  {cot.status === 'exempt' ? '—' : formatCfa(cot.amount)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black ${cfg.badge}`}>
                  {cfg.icon}{cfg.label}
                </span>
                {cot.status === 'paid' && (
                  <button onClick={() => setOpenReceipt(cot)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition hover:border-emerald-300 hover:text-emerald-700"
                    title="Voir le reçu">
                    <Download size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
        <p className="text-sm font-black text-emerald-800 mb-1.5">Besoin d&apos;aide ?</p>
        <p className="text-xs leading-relaxed text-emerald-700">
          Pour toute question concernant vos cotisations, contactez l&apos;administration à{' '}
          <a href="mailto:contact@salam-cameroun.com" className="font-bold underline underline-offset-2">
            contact@salam-cameroun.com
          </a>
        </p>
      </div>

      {openReceipt && user && (
        <ReceiptModal
          cot={openReceipt}
          user={{ firstName: user.firstName, lastName: user.lastName, _id: user._id }}
          onClose={() => setOpenReceipt(null)}
        />
      )}
    </div>
  );
}
