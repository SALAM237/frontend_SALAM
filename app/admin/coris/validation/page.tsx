'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Coins, Loader2, ShieldCheck, UserRound, XCircle } from 'lucide-react';
import { useInspectCoriRedemption, useRedeemCoris } from '@/lib/api/coris';

function ValidationContent() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') ?? '');
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const fragmentToken = fragment.get('token');
    if (fragmentToken) setToken(fragmentToken);
    setReady(true);
  }, []);
  const inspection = useInspectCoriRedemption(token);
  const redeem = useRedeemCoris();
  const redemption = inspection.data?.data;
  const member = redemption?.userId;
  const activity = redemption?.activityId;

  if (!ready) {
    return <div className='py-20 text-center text-sm text-neutral-500'>Lecture du QR code...</div>;
  }

  if (!token) {
    return <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">QR code incomplet ou invalide.</div>;
  }

  if (inspection.isLoading) {
    return <div className="flex items-center justify-center gap-3 py-20 text-sm text-neutral-500"><Loader2 size={20} className="animate-spin text-emerald-600" /> Verification du QR code...</div>;
  }

  if (inspection.isError || !redemption) {
    return <div role="alert" className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700"><XCircle size={20} /> QR code inconnu, expire ou inaccessible.</div>;
  }

  const usable = redemption.status === 'reserved' && new Date(redemption.expiresAt).getTime() > Date.now();

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="bg-emerald-950 p-6 text-white">
        <ShieldCheck size={28} className="text-emerald-300" />
        <h1 className="mt-3 text-xl font-black">Validation des Coris</h1>
        <p className="mt-1 text-sm text-white/60">Controle administratif avant consommation.</p>
      </div>
      <div className="space-y-5 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100"><UserRound size={20} className="text-neutral-600" /></div>
          <div><p className="font-black text-neutral-900">{member?.firstName} {member?.lastName}</p><p className="text-xs text-neutral-500">{member?.memberNumber ?? 'Membre SALAM'}</p></div>
        </div>
        <div className="rounded-lg bg-amber-50 p-5 text-center">
          <Coins size={24} className="mx-auto text-amber-600" />
          <p className="mt-2 text-3xl font-black text-amber-900">{redemption.amount}</p>
          <p className="text-xs font-bold uppercase text-amber-700">Coris a utiliser</p>
        </div>
        <div className="rounded-lg border border-neutral-100 p-4">
          <p className="text-xs font-bold uppercase text-neutral-400">Evenement</p>
          <p className="mt-1 font-black text-neutral-900">{activity?.title ?? redemption.activityTitle}</p>
          {activity?.location && <p className="mt-1 text-sm text-neutral-500">{activity.location}</p>}
        </div>
        {redeem.isSuccess ? (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-50 p-4 font-bold text-emerald-700"><CheckCircle2 size={20} /> Coris valides</div>
        ) : (
          <button type="button" disabled={!usable || redeem.isPending} onClick={() => redeem.mutate(token)} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 text-sm font-black text-white disabled:opacity-40">
            {redeem.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Valider l utilisation
          </button>
        )}
        {!usable && !redeem.isSuccess && <p role="alert" className="text-center text-xs font-semibold text-red-600">Ce QR code a deja ete traite ou a expire.</p>}
      </div>
    </div>
  );
}

export default function CoriValidationPage() {
  return (
    <div className="mx-auto max-w-lg py-6">
      <Suspense fallback={<div className="py-20 text-center text-sm text-neutral-500">Chargement...</div>}>
        <ValidationContent />
      </Suspense>
    </div>
  );
}