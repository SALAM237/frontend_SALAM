'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { Eye, Loader2, QrCode, X, UserCheck, RefreshCw, Hash } from 'lucide-react';
import { useMemberActivities } from '@/lib/api/activities';
import { useCancelCauriRedemption, useCauriWallet, useCreateCauriRedemption } from '@/lib/api/cauris';

// ── Image cauri réutilisable ────────────────────────────────────────────────
function CauriImg({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <Image
      src="/images/cauris/cauri.png"
      width={size} height={size}
      alt="cauris"
      className={`object-contain ${className}`}
    />
  );
}

// ── localStorage QR persistence ─────────────────────────────────────────────
const QR_KEY = 'salam_cauri_qr_v1';
const SC_KEY = 'salam_cauri_sc_v1'; // shortCodes

function getStored(key: string): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(key) ?? '{}'); } catch { return {}; }
}
function storeSet(key: string, id: string, val: string) {
  const m = getStored(key); m[id] = val;
  try { localStorage.setItem(key, JSON.stringify(m)); } catch {}
}
function storeDel(key: string, id: string) {
  const m = getStored(key); delete m[id];
  try { localStorage.setItem(key, JSON.stringify(m)); } catch {}
}

// ── Badge cauris (inchangé) ─────────────────────────────────────────────────
export function CauriBadge({ compact = false, space = 'member' }: { compact?: boolean; space?: 'member' | 'admin' }) {
  const { data, isLoading } = useCauriWallet(space);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const balance = data?.data.balance ?? 0;

  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog"
        className={'inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 font-bold text-amber-900 transition hover:border-amber-400 hover:bg-amber-100 ' + (compact ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-xs')}>
        <CauriImg size={compact ? 16 : 20} />
        <span className={compact ? 'hidden sm:inline' : ''}>{isLoading ? '...' : balance} cauris</span>
      </button>

      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] grid min-h-[100dvh] place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="cauri-dialog-title"
            className="relative grid max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-2xl ring-1 ring-black/5 sm:grid-cols-[190px_1fr]"
            onClick={e => e.stopPropagation()}>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fermer"
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-neutral-600 shadow-sm transition hover:bg-neutral-100">
              <X size={16} />
            </button>
            <div className="flex min-h-44 items-center justify-center bg-amber-50 p-6">
              <CauriImg size={170} className="h-auto w-full max-w-[170px]" />
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-8">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-700">Programme de fidelite SALAM</p>
              <h2 id="cauri-dialog-title" className="mt-2 text-2xl font-black text-neutral-950">Gagnez et utilisez vos cauris</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600">
                Les cauris recompensent les contributions validees, la participation a la communaute et un profil complet. Ils peuvent ensuite etre reserves pour les evenements SALAM au moyen d un QR code securise.
              </p>
              <Link href="/conditions-cauris" onClick={() => setOpen(false)}
                className="mt-5 inline-flex h-10 w-fit items-center rounded-lg bg-emerald-700 px-4 text-sm font-black text-white transition hover:bg-emerald-800">
                En savoir plus
              </Link>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

// ── Popup QR avec numéro lisible ────────────────────────────────────────────
function QrPopup({ src, title, amount, shortCode, onClose }: {
  src: string; title: string; amount: number; shortCode?: string; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div role="dialog" aria-modal="true"
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <button type="button" onClick={onClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600">
          <X size={16} />
        </button>
        <div className="flex justify-center">
          <CauriImg size={36} />
        </div>
        <h3 className="mt-2 text-xl font-black text-neutral-900">{amount} cauris</h3>
        <p className="mt-0.5 text-sm font-semibold text-neutral-500">{title}</p>
        <img src={src} alt="QR code de validation des cauris" className="mx-auto mt-4 aspect-square w-full max-w-[260px] rounded-lg" />
        {shortCode && (
          <div className="mt-3 flex items-center justify-center gap-1.5">
            <Hash size={12} className="text-neutral-400" />
            <p className="font-mono text-sm font-black tracking-[0.2em] text-neutral-700">{shortCode}</p>
          </div>
        )}
        <p className="mt-2 text-[11px] text-neutral-400">
          Presentez ce QR a un admin. Si inaccessible, donnez le code <strong className="text-neutral-600">{shortCode}</strong>.
        </p>
      </div>
    </div>
  );
}

// ── Icône selon la raison de la transaction ─────────────────────────────────
function TxIcon({ reason }: { reason: string }) {
  if (reason === 'event_redeemed')             return <UserCheck   size={14} className="text-emerald-600" />;
  if (reason === 'event_redemption_reserved')  return <QrCode      size={14} className="text-amber-500"   />;
  if (reason === 'redemption_cancelled')       return <RefreshCw   size={14} className="text-blue-500"    />;
  return <CauriImg size={14} />;
}

// ── Panel principal ─────────────────────────────────────────────────────────
export function CauriWalletPanel() {
  const { data, isLoading } = useCauriWallet();
  const { data: activitiesData } = useMemberActivities();
  const createRedemption = useCreateCauriRedemption();
  const cancelRedemption = useCancelCauriRedemption();

  const [activityId, setActivityId] = useState('');
  const [amount, setAmount] = useState(5);
  const [qrPopup, setQrPopup] = useState<{ src: string; title: string; amount: number; shortCode?: string } | null>(null);
  const [storedQRs, setStoredQRs] = useState<Record<string, string>>({});
  const [storedSCs, setStoredSCs] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStoredQRs(getStored(QR_KEY));
    setStoredSCs(getStored(SC_KEY));
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center rounded-lg border border-neutral-100 bg-white p-8">
        <Loader2 className="animate-spin text-emerald-600" size={22} />
      </div>
    );
  }

  const wallet = data?.data;
  const activities = (activitiesData?.data.activities ?? []).filter(a => {
    const d = a.endDate ?? a.startDate;
    return !d || new Date(d).getTime() >= Date.now() - 86_400_000;
  });

  // Max sans cap arbitraire — limité uniquement par le solde et la config backend
  const max = wallet?.redemption.maximum != null && wallet.redemption.maximum > 0
    ? Math.min(wallet.balance ?? 0, wallet.redemption.maximum)
    : (wallet?.balance ?? 0);

  const generate = async () => {
    const res = await createRedemption.mutateAsync({ activityId, amount });
    const id  = res.data.redemption._id;
    const sc  = res.data.redemption.shortCode ?? '';
    storeSet(QR_KEY, id, res.data.qrDataUrl);
    storeSet(SC_KEY, id, sc);
    setStoredQRs(getStored(QR_KEY));
    setStoredSCs(getStored(SC_KEY));
    setQrPopup({ src: res.data.qrDataUrl, title: res.data.redemption.activityTitle, amount: res.data.redemption.amount, shortCode: sc });
  };

  const handleCancel = (id: string) => {
    cancelRedemption.mutate(id);
    storeDel(QR_KEY, id); storeDel(SC_KEY, id);
    setStoredQRs(getStored(QR_KEY));
    setStoredSCs(getStored(SC_KEY));
  };

  const recentRedeemed = wallet?.recentRedeemed ?? [];

  return (
    <section className="rounded-lg border border-neutral-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-neutral-900">Mes cauris</p>
          <p className="mt-1 text-xs leading-5 text-neutral-500">
            Gagnez des cauris en contribuant, puis utilisez-les lors des evenements SALAM.
          </p>
        </div>
        <CauriBadge />
      </div>

      {/* Formulaire génération QR */}
      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_130px_auto]">
        <select
          value={activityId}
          onChange={e => setActivityId(e.target.value)}
          className="h-10 min-w-0 rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-emerald-500"
        >
          <option value="">Choisir un evenement</option>
          {activities.map(a => <option key={a._id} value={a._id}>{a.title}</option>)}
        </select>

        <input
          type="number"
          min={wallet?.redemption.minimum ?? 5}
          max={max > 0 ? max : undefined}
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          className="h-10 rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-emerald-500"
          aria-label="Nombre de cauris"
        />

        <button
          type="button"
          disabled={!activityId || amount < (wallet?.redemption.minimum ?? 5) || amount > max || createRedemption.isPending}
          onClick={generate}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {createRedemption.isPending ? <Loader2 size={15} className="animate-spin" /> : <QrCode size={15} />}
          Generer
        </button>
      </div>

      <p className="mt-2 text-[11px] text-neutral-400">
        Minimum {wallet?.redemption.minimum ?? 5} cauris · Solde disponible : {wallet?.balance ?? 0} cauris.
        {wallet?.redemption.expiresInMinutes
          ? ` QR valable ${wallet.redemption.expiresInMinutes} min.`
          : ' QR valable jusqu a utilisation ou annulation.'}
      </p>

      {/* Réservations actives avec icône œil */}
      {wallet?.redemptions.length ? (
        <div className="mt-5 space-y-2">
          <p className="text-xs font-black uppercase text-neutral-500">Reservations actives</p>
          {wallet.redemptions.map(r => {
            const hasSrc = mounted && Boolean(storedQRs[r._id]);
            const sc     = r.shortCode ?? storedSCs[r._id];
            return (
              <div key={r._id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2.5">
                <div>
                  <p className="text-xs font-bold text-amber-900">{r.amount} cauris — {r.activityTitle}</p>
                  {sc && (
                    <p className="mt-0.5 flex items-center gap-1 font-mono text-[10px] font-black text-amber-700">
                      <Hash size={9} /> {sc}
                    </p>
                  )}
                  {!sc && <p className="text-[10px] text-amber-700">Valable jusqu a utilisation</p>}
                </div>
                <div className="flex items-center gap-2">
                  {hasSrc && (
                    <button
                      type="button"
                      title="Voir le QR code"
                      onClick={() => setQrPopup({ src: storedQRs[r._id], title: r.activityTitle, amount: r.amount, shortCode: sc })}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-white text-amber-700 transition hover:border-amber-400 hover:bg-amber-100"
                    >
                      <Eye size={14} />
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={cancelRedemption.isPending}
                    onClick={() => handleCancel(r._id)}
                    className="h-8 rounded-lg border border-amber-200 bg-white px-3 text-[11px] font-bold text-amber-800 disabled:opacity-50"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Historique des scans (QR validés / expirés / annulés) */}
      {recentRedeemed.length > 0 && (
        <div className="mt-5 space-y-2">
          <p className="text-xs font-black uppercase text-neutral-500">Historique des QR</p>
          {recentRedeemed.map(r => {
            const statusCls = r.status === 'redeemed'
              ? 'border-emerald-100 bg-emerald-50'
              : r.status === 'expired' ? 'border-neutral-100 bg-neutral-50'
              : 'border-neutral-100 bg-neutral-50';
            const statusLabel = r.status === 'redeemed' ? 'Validé' : r.status === 'expired' ? 'Expiré' : 'Annulé';
            const statusColor = r.status === 'redeemed' ? 'text-emerald-700' : 'text-neutral-500';
            const scanner    = r.redeemedBy ? `${r.redeemedBy.firstName} ${r.redeemedBy.lastName}` : null;
            return (
              <div key={r._id} className={`rounded-lg border px-3 py-2.5 ${statusCls}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-neutral-800">{r.activityTitle}</p>
                    <p className="flex items-center gap-1 text-[10px] text-neutral-500">
                      <CauriImg size={10} /> {r.amount} cauris
                      {scanner && <> · scanné par <strong>{scanner}</strong></>}
                    </p>
                    {r.redeemedAt && (
                      <p className="text-[10px] text-neutral-400">
                        {new Date(r.redeemedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                  <span className={`shrink-0 text-[10px] font-black uppercase ${statusColor}`}>{statusLabel}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Historique des transactions */}
      {wallet?.transactions.length ? (
        <div className="mt-6 border-t border-neutral-100 pt-4">
          <p className="mb-3 text-xs font-black uppercase text-neutral-500">Mouvements de cauris</p>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {wallet.transactions.slice(0, 20).map(tx => (
              <div key={tx._id} className="flex items-start gap-3 rounded-lg bg-neutral-50 px-3 py-2.5">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                  <TxIcon reason={tx.reason} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="break-words text-xs font-semibold text-neutral-700">{tx.label}</p>
                  <p className="mt-0.5 text-[10px] text-neutral-400">
                    {new Date(tx.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'short', year: '2-digit',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
                {tx.amount !== 0 && (
                  <span className={'mt-1 shrink-0 text-sm font-black ' + (tx.amount > 0 ? 'text-emerald-700' : 'text-red-600')}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {qrPopup && (
        <QrPopup
          src={qrPopup.src}
          title={qrPopup.title}
          amount={qrPopup.amount}
          shortCode={qrPopup.shortCode}
          onClose={() => setQrPopup(null)}
        />
      )}
    </section>
  );
}
