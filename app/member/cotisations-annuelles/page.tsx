'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, ShieldOff, Clock, Download, Eye, X } from 'lucide-react';
import { useMemberCotisationsAnnuelles, type CotisationAnnuelleDoc, type CotisationAnnuelleStatus } from '@/lib/api/cotisations-annuelles';
import { useMemberReceipts, type ReceiptDoc } from '@/lib/api/receipts';
import { useAuthStore } from '@/store/auth.store';
import { formatFullName } from '@/lib/format-name';
import { downloadReceiptPdf } from '@/lib/receipt-pdf';

/* ─── Status config ──────────────────────────────────────── */
const STATUS_CFG: Record<CotisationAnnuelleStatus, { badge: string; label: string; icon: React.ReactNode; dot: string }> = {
  paid:    { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',        label: 'Payé',      icon: <CheckCircle2 size={12} />, dot: 'bg-emerald-500' },
  partiel: { badge: 'bg-yellow-50 text-yellow-700 border-yellow-100',          label: 'Partiel',   icon: <Clock size={12} />,        dot: 'bg-yellow-500'  },
  unpaid:  { badge: 'bg-red-50 text-red-700 border-red-200',                    label: 'Non payé',  icon: <XCircle size={12} />,      dot: 'bg-red-500'     },
  exempt:  { badge: 'bg-emerald-950/10 text-emerald-900 border-emerald-900/25', label: 'Exempté',   icon: <ShieldOff size={12} />,    dot: 'bg-emerald-900' },
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
  cot: CotisationAnnuelleDoc;
  user: { firstName: string; lastName: string; memberNumber?: string | null };
  onClose: () => void;
}) {
  const memberId = user.memberNumber ?? '-';
  const { data, isLoading } = useMemberReceipts({ type: 'cotisation_annuelle', year: cot.year });
  /* Uniquement les tranches réellement réglées (montant > 0) — jamais celles à 0 */
  const receipts = (data?.data ?? []).filter(r => r.amount > 0);
  const activeTotal = receipts.filter(r => r.status !== 'cancelled').reduce((acc, r) => acc + r.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <p className="text-sm font-black text-neutral-900">Reçus cotisation annuelle {cot.year}</p>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700">
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          <div className="rounded-xl overflow-hidden mb-6" style={{ background: 'linear-gradient(135deg,#07140d,#0b8f3a)' }}>
            <div className="h-[3px]" style={{ background: 'linear-gradient(90deg,#0B8F3A 33%,#C8102E 33%,#C8102E 66%,#F7C600 66%)' }} />
            <div className="px-6 py-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">Association</p>
                <p className="text-lg font-black tracking-[0.12em] text-white">SALAM CAMEROUN</p>
                <p className="text-[11px] text-white/40 mt-0.5">salam-cameroun.com</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/30">Adhérent</p>
                <p className="text-sm font-bold text-emerald-300">{formatFullName(user.firstName, user.lastName)}</p>
                <p className="font-mono text-[10px] text-white/40">{memberId}</p>
              </div>
            </div>
          </div>

          <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-neutral-500">
            {receipts.length > 1 ? `Versements (${receipts.length})` : 'Versement'}
          </p>

          {isLoading && <p className="py-6 text-center text-sm text-neutral-400">Chargement…</p>}

          <div className="space-y-2 mb-5">
            {!isLoading && receipts.length === 0 && (
              <p className="py-4 text-center text-sm text-neutral-400">Aucun versement enregistré.</p>
            )}
            {!isLoading && receipts.map(r => {
              const isCancelled = r.status === 'cancelled';
              const label = r.trancheIndex != null ? `Tranche ${r.trancheIndex + 1}` : 'Paiement intégral';
              return (
                <div key={r._id} className={`relative overflow-hidden rounded-xl border px-4 py-3 ${isCancelled ? 'border-red-100 bg-red-50/40' : 'border-neutral-100'}`}>
                  {isCancelled && (
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 -rotate-12 rounded border-2 border-red-400 px-2 py-0.5 text-[10px] font-black text-red-500 opacity-70">
                      ANNULÉ
                    </span>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-black text-neutral-900">{label}</p>
                      <p className="mt-0.5 font-mono text-[10px] text-neutral-400">{r.receiptNumber}</p>
                      <p className="text-[11px] text-neutral-500">{fmt(r.paidAt)}</p>
                      {r.modifiedAt && (
                        <p className="mt-0.5 text-[10px] font-semibold text-amber-600">Modifié le {fmt(r.modifiedAt)}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className={`text-sm font-black ${isCancelled ? 'text-neutral-400 line-through' : 'text-emerald-700'}`}>{formatCfa(r.amount)}</span>
                      <button onClick={() => downloadReceiptPdf(r, user)} title="Télécharger ce reçu"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition hover:border-emerald-300 hover:text-emerald-700">
                        <Download size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-100 px-5 py-4">
            <span className="text-sm font-semibold text-neutral-600">Montant total réglé</span>
            <span className="text-2xl font-black text-emerald-700">{formatCfa(activeTotal)}</span>
          </div>

          <p className="mt-4 text-center text-[10px] leading-relaxed text-neutral-400">
            Ces reçus sont des justificatifs officiels de votre cotisation annuelle à l&apos;Association SALAM Cameroun.<br />
            Fondée le 20/02/2010 · contact@salam-cameroun.com
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Page principale ─────────────────────────────────────── */

export function MemberCotisationsAnnuelleContent() {
  const [openReceipt, setOpenReceipt] = useState<CotisationAnnuelleDoc | null>(null);
  const [filter,      setFilter]      = useState<CotisationAnnuelleStatus | 'all'>('all');

  const { data, isLoading, isError } = useMemberCotisationsAnnuelles();
  const user = useAuthStore(s => s.user);

  const cotisations = data?.data ?? [];
  const filtered = cotisations.filter(c => filter === 'all' || c.status === filter);

  return (
    <div className="mx-auto max-w-2xl space-y-6">

      <div>
        <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Cotisation annuelle</h1>
        <p className="mt-1 text-sm text-neutral-500">Historique de vos cotisations annuelles.</p>
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 flex-wrap">
        {([
          { value: 'all',     label: 'Toutes'     },
          { value: 'paid',    label: 'Payées'     },
          { value: 'partiel', label: 'Partielles' },
          { value: 'unpaid',  label: 'Non payées' },
          { value: 'exempt',  label: 'Exemptées'  },
        ] as { value: CotisationAnnuelleStatus | 'all'; label: string }[]).map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-black transition sm:px-4 sm:py-1.5 sm:text-xs ${
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
          <div role="alert" className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center text-sm text-red-600">
            Erreur de chargement. Vérifiez votre connexion.
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="rounded-2xl border border-neutral-100 bg-white p-10 text-center text-sm text-neutral-400">
            {data?.data?.length === 0
              ? 'Aucune cotisation annuelle enregistrée.'
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
                <p className="font-black text-sm text-neutral-900">Cotisation annuelle {cot.year}</p>
                {cot.status === 'paid' && cot.paidAt && (
                  <p className="text-xs text-neutral-500 mt-0.5">Payé le {fmt(cot.paidAt)}</p>
                )}
                {cot.status === 'partiel' && (
                  <p className="text-xs text-orange-600 mt-0.5 font-semibold">
                    {(cot.totalPaid ?? 0).toLocaleString('fr-FR')} F.CFA versés sur {cot.amount.toLocaleString('fr-FR')} F.CFA
                  </p>
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
                <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-black sm:gap-1.5 sm:px-3 sm:py-1 sm:text-[11px] ${cfg.badge}`}>
                  {cfg.icon}{cfg.label}
                </span>
                {/* Les reçus sont créés à CHAQUE tranche payée (pas seulement au solde total) :
                    le bouton "Voir les reçus" doit rester accessible dès qu'un versement partiel
                    existe, sinon un membre qui a payé 2 tranches sur 4 ne peut jamais consulter
                    ses reçus déjà émis tant que le solde n'est pas total. */}
                {(cot.status === 'paid' || cot.status === 'partiel') && user && (
                  <>
                    <button onClick={() => setOpenReceipt(cot)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition hover:border-emerald-300 hover:text-emerald-700"
                      title="Voir les reçus">
                      <Eye size={13} />
                    </button>
                    {cot.status === 'paid' && (
                      <button onClick={() => setOpenReceipt(cot)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition hover:border-emerald-300 hover:text-emerald-700"
                        title="Télécharger le reçu">
                        <Download size={13} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
        <p className="text-sm font-black text-emerald-800 mb-1.5">Besoin d&apos;aide ?</p>
        <p className="text-xs leading-relaxed text-emerald-700">
          Pour toute question concernant votre cotisation annuelle, contactez l&apos;administration à{' '}
          <a href="mailto:contact@salam-cameroun.com" className="font-bold underline underline-offset-2">
            contact@salam-cameroun.com
          </a>
        </p>
      </div>

      {openReceipt && user && (
        <ReceiptModal
          cot={openReceipt}
          user={{ firstName: user.firstName, lastName: user.lastName, memberNumber: user.memberNumber }}
          onClose={() => setOpenReceipt(null)}
        />
      )}
    </div>
  );
}

export default function MemberCotisationsAnnuellesPage() {
  return <MemberCotisationsAnnuelleContent />;
}
