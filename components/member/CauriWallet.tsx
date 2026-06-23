'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { Coins, Eye, Loader2, QrCode, X, UserCheck, CalendarDays, RefreshCw } from 'lucide-react';
import { useMemberActivities } from '@/lib/api/activities';
import { useCancelCauriRedemption, useCauriWallet, useCreateCauriRedemption } from '@/lib/api/cauris';

// ── Clé localStorage pour les QR codes générés ─────────────────────────────
const QR_STORAGE_KEY = 'salam_cauri_qr_v1';

function getStoredQRs(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(QR_STORAGE_KEY) ?? '{}'); } catch { return {}; }
}
function saveQR(id: string, dataUrl: string) {
  const stored = getStoredQRs();
  stored[id] = dataUrl;
  try { localStorage.setItem(QR_STORAGE_KEY, JSON.stringify(stored)); } catch {}
}
function removeQR(id: string) {
  const stored = getStoredQRs();
  delete stored[id];
  try { localStorage.setItem(QR_STORAGE_KEY, JSON.stringify(stored)); } catch {}
}

// ── Badge cauris ────────────────────────────────────────────────────────────
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
        <Image src="/images/cauris/cauri.png" width={compact ? 16 : 20} height={compact ? 16 : 20} alt="" className="object-contain" />
        <span className={compact ? 'hidden sm:inline' : ''}>{isLoading ? '...' : balance} cauris</span>
      </button>

      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] grid min-h-[100dvh] place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="cauri-dialog-title"
            className="relative grid max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-2xl ring-1 ring-black/5 sm:grid-cols-[190px_1fr]"
            onClick={event => event.stopPropagation()}>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fermer"
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-neutral-600 shadow-sm transition hover:bg-neutral-100">
              <X size={16} />
            </button>
            <div className="flex min-h-44 items-center justify-center bg-amber-50 p-6">
              <Image src="/images/cauris/cauri.png" width={170} height={170} alt="Cauris SALAM" className="h-auto w-full max-w-[170px] object-contain" />
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

// ── Popup QR — création OU re-visualisation ─────────────────────────────────
function QrPopup({ src, title, amount, onClose }: { src: string; title: string; amount: number; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div role="dialog" aria-modal="true"
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <button type="button" onClick={onClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600">
          <X size={16} />
        </button>
        <Coins size={28} className="mx-auto text-amber-600" />
        <h3 className="mt-3 text-lg font-black text-neutral-900">{amount} cauris</h3>
        <p className="mt-1 text-sm font-semibold text-neutral-500">{title}</p>
        <img src={src} alt="QR code de validation des cauris" className="mx-auto mt-4 aspect-square w-full max-w-[260px]" />
        <p className="mt-3 text-xs text-neutral-500">
          A presenter a un administrateur lors de l'evenement.
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
  if (reason?.startsWith('profile'))           return <CalendarDays size={14} className="text-violet-500" />;
  return <Coins size={14} className="text-neutral-400" />;
}

// ── Panel principal ─────────────────────────────────────────────────────────
export function CauriWalletPanel() {
  const { data, isLoading } = useCauriWallet();
  const { data: activitiesData } = useMemberActivities();
  const createRedemption = useCreateCauriRedemption();
  const cancelRedemption = useCancelCauriRedemption();

  const [activityId, setActivityId] = useState('');
  const [amount, setAmount] = useState(5);
  const [qrPopup, setQrPopup] = useState<{ src: string; title: string; amount: number } | null>(null);
  const [storedQRs, setStoredQRs] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStoredQRs(getStoredQRs());
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center rounded-lg border border-neutral-100 bg-white p-8">
        <Loader2 className="animate-spin text-emerald-600" size={22} />
      </div>
    );
  }

  const wallet = data?.data;
  const activities = (activitiesData?.data.activities ?? []).filter(activity => {
    const relevantDate = activity.endDate ?? activity.startDate;
    return !relevantDate || new Date(relevantDate).getTime() >= Date.now() - 86_400_000;
  });

  // Limite = solde disponible, sans cap arbitraire de 500
  const max = wallet?.redemption.maximum != null && wallet.redemption.maximum > 0
    ? Math.min(wallet.balance ?? 0, wallet.redemption.maximum)
    : (wallet?.balance ?? 0);

  const generate = async () => {
    const response = await createRedemption.mutateAsync({ activityId, amount });
    const newId     = response.data.redemption._id;
    const newQrSrc  = response.data.qrDataUrl;
    // Persistance locale pour permettre de revoir le QR après fermeture
    saveQR(newId, newQrSrc);
    setStoredQRs(getStoredQRs());
    setQrPopup({ src: newQrSrc, title: response.data.redemption.activityTitle, amount: response.data.redemption.amount });
  };

  const handleCancel = (id: string) => {
    cancelRedemption.mutate(id);
    removeQR(id);
    setStoredQRs(getStoredQRs());
  };

  const viewExistingQR = (id: string, title: string, amt: number) => {
    const src = storedQRs[id];
    if (src) setQrPopup({ src, title, amount: amt });
  };

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

        {/* Saisie du montant — pas de max arbitraire, limité uniquement par le solde */}
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
            const hasQR = mounted && Boolean(storedQRs[r._id]);
            return (
              <div key={r._id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2.5">
                <div>
                  <p className="text-xs font-bold text-amber-900">{r.amount} cauris — {r.activityTitle}</p>
                  <p className="text-[10px] text-amber-700">
                    {hasQR ? "Cliquez sur l'icone pour revoir le QR" : 'Valable jusqu a utilisation'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {hasQR && (
                    <button
                      type="button"
                      title="Voir le QR code"
                      onClick={() => viewExistingQR(r._id, r.activityTitle, r.amount)}
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

      {/* Historique des mouvements enrichi */}
      {wallet?.transactions.length ? (
        <div className="mt-6 border-t border-neutral-100 pt-4">
          <p className="mb-3 text-xs font-black uppercase text-neutral-500">Historique</p>
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

      {/* Popup QR (nouvelle génération ou re-visualisation) */}
      {qrPopup && (
        <QrPopup
          src={qrPopup.src}
          title={qrPopup.title}
          amount={qrPopup.amount}
          onClose={() => setQrPopup(null)}
        />
      )}
    </section>
  );
}
