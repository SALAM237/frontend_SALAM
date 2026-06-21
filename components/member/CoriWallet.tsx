'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Coins, Loader2, QrCode, X } from 'lucide-react';
import { useMemberActivities } from '@/lib/api/activities';
import { useCancelCoriRedemption, useCoriWallet, useCreateCoriRedemption } from '@/lib/api/coris';

export function CauriBadge({ compact = false, space = 'member' }: { compact?: boolean; space?: 'member' | 'admin' }) {
  const { data, isLoading } = useCoriWallet(space);
  const [open, setOpen] = useState(false);
  const balance = data?.data.balance ?? 0;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog"
        className={'inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 font-bold text-amber-900 transition hover:border-amber-400 hover:bg-amber-100 ' + (compact ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-xs')}>
        <Image src="/images/cauris/cauri.png" width={compact ? 16 : 20} height={compact ? 16 : 20} alt="" className="object-contain" />
        {isLoading ? '...' : balance} caurris
      </button>

      {open && (
        <div className="fixed inset-0 z-[190] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="cauri-dialog-title"
            className="relative grid w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl sm:grid-cols-[190px_1fr]"
            onClick={event => event.stopPropagation()}>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fermer"
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-neutral-600 shadow-sm transition hover:bg-neutral-100">
              <X size={16} />
            </button>
            <div className="flex min-h-44 items-center justify-center bg-amber-50 p-6">
              <Image src="/images/cauris/cauri.png" width={170} height={170} alt="Caurris SALAM" className="h-auto w-full max-w-[170px] object-contain" />
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-8">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-700">Programme de fidelite SALAM</p>
              <h2 id="cauri-dialog-title" className="mt-2 text-2xl font-black text-neutral-950">Gagnez et utilisez vos caurris</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600">
                Les caurris recompensent les contributions validees, la participation a la communaute et un profil complet. Ils peuvent ensuite etre reserves pour les evenements SALAM au moyen d un QR code securise.
              </p>
              <Link href="/conditions-cauris" onClick={() => setOpen(false)}
                className="mt-5 inline-flex h-10 w-fit items-center rounded-lg bg-emerald-700 px-4 text-sm font-black text-white transition hover:bg-emerald-800">
                En savoir plus
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export function CauriWalletPanel() {
  const { data, isLoading } = useCoriWallet();
  const { data: activitiesData } = useMemberActivities();
  const createRedemption = useCreateCoriRedemption();
  const cancelRedemption = useCancelCoriRedemption();
  const [activityId, setActivityId] = useState('');
  const [amount, setAmount] = useState(5);
  const [qr, setQr] = useState<{ src: string; expiresAt: string; title: string; amount: number } | null>(null);

  if (isLoading) {
    return <div className="flex justify-center rounded-lg border border-neutral-100 bg-white p-8"><Loader2 className="animate-spin text-emerald-600" size={22} /></div>;
  }

  const wallet = data?.data;
  const activities = (activitiesData?.data.activities ?? []).filter(activity => {
    const relevantDate = activity.endDate ?? activity.startDate;
    return !relevantDate || new Date(relevantDate).getTime() >= Date.now() - 86_400_000;
  });
  const max = Math.min(wallet?.balance ?? 0, wallet?.redemption.maximum ?? 500);

  const generate = async () => {
    const response = await createRedemption.mutateAsync({ activityId, amount });
    setQr({
      src: response.data.qrDataUrl,
      expiresAt: response.data.redemption.expiresAt,
      title: response.data.redemption.activityTitle,
      amount: response.data.redemption.amount,
    });
  };

  return (
    <section className="rounded-lg border border-neutral-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-neutral-900">Mes caurris</p>
          <p className="mt-1 text-xs leading-5 text-neutral-500">Gagnez des caurris en contribuant, puis utilisez-les lors des evenements SALAM.</p>
        </div>
        <CauriBadge />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_130px_auto]">
        <select value={activityId} onChange={event => setActivityId(event.target.value)} className="h-10 min-w-0 rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-emerald-500">
          <option value="">Choisir un evenement</option>
          {activities.map(activity => <option key={activity._id} value={activity._id}>{activity.title}</option>)}
        </select>
        <input type="number" min={wallet?.redemption.minimum ?? 5} max={max} value={amount} onChange={event => setAmount(Number(event.target.value))} className="h-10 rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-emerald-500" aria-label="Nombre de caurris" />
        <button type="button" disabled={!activityId || amount < (wallet?.redemption.minimum ?? 5) || amount > max || createRedemption.isPending} onClick={generate} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40">
          {createRedemption.isPending ? <Loader2 size={15} className="animate-spin" /> : <QrCode size={15} />} Generer
        </button>
      </div>
      <p className="mt-2 text-[11px] text-neutral-400">Minimum {wallet?.redemption.minimum ?? 5} caurris. Le QR expire apres {wallet?.redemption.expiresInMinutes ?? 30} minutes et les caurris sont alors restitues.</p>

      {wallet?.redemptions.length ? (
        <div className="mt-5 space-y-2">
          <p className="text-xs font-black uppercase text-neutral-500">Reservations actives</p>
          {wallet.redemptions.map(redemption => (
            <div key={redemption._id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2">
              <div><p className="text-xs font-bold text-amber-900">{redemption.amount} caurris - {redemption.activityTitle}</p><p className="text-[10px] text-amber-700">Expire a {new Date(redemption.expiresAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p></div>
              <button type="button" disabled={cancelRedemption.isPending} onClick={() => cancelRedemption.mutate(redemption._id)} className="h-8 rounded-lg border border-amber-200 bg-white px-3 text-[11px] font-bold text-amber-800 disabled:opacity-50">Annuler</button>
            </div>
          ))}
        </div>
      ) : null}
      {wallet?.transactions.length ? (
        <div className="mt-6 border-t border-neutral-100 pt-4">
          <p className="mb-3 text-xs font-black uppercase text-neutral-500">Derniers mouvements</p>
          <div className="max-h-56 space-y-2 overflow-y-auto">
            {wallet.transactions.slice(0, 10).map(transaction => (
              <div key={transaction._id} className="flex items-center justify-between gap-3 rounded-lg bg-neutral-50 px-3 py-2">
                <div className="min-w-0"><p className="truncate text-xs font-semibold text-neutral-700">{transaction.label}</p><p className="text-[10px] text-neutral-400">{new Date(transaction.createdAt).toLocaleDateString('fr-FR')}</p></div>
                <span className={'shrink-0 text-sm font-black ' + (transaction.amount > 0 ? 'text-emerald-700' : 'text-red-600')}>{transaction.amount > 0 ? '+' : ''}{transaction.amount}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {qr && (
        <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setQr(null)}>
          <div role="dialog" aria-modal="true" className="relative w-full max-w-sm rounded-lg bg-white p-6 text-center shadow-2xl" onClick={event => event.stopPropagation()}>
            <button type="button" onClick={() => setQr(null)} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600" aria-label="Fermer"><X size={16} /></button>
            <Coins size={28} className="mx-auto text-amber-600" />
            <h3 className="mt-3 text-lg font-black text-neutral-900">{qr.amount} caurris</h3>
            <p className="mt-1 text-sm text-neutral-500">{qr.title}</p>
            <img src={qr.src} alt="QR code de validation des caurris" className="mx-auto mt-4 aspect-square w-full max-w-[260px]" />
            <p className="mt-3 text-xs text-neutral-500">A presenter a un administrateur avant {new Date(qr.expiresAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.</p>
          </div>
        </div>
      )}
    </section>
  );
}