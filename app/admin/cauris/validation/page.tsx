'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle2, Hash, Loader2, ShieldCheck, UserRound, XCircle } from 'lucide-react';
import { useInspectCauriRedemption, useRedeemCauris } from '@/lib/api/cauris';

const SHORT_CODE_RE = /^\d{2}[A-Za-z]{2}\d{2}$/;

function ShortCodeInput({ onSubmit }: { onSubmit: (code: string) => void }) {
  const [raw, setRaw] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const normalized = raw.toUpperCase();
  const valid = SHORT_CODE_RE.test(normalized);

  return (
    <div className="rounded-lg border border-neutral-200 bg-white shadow-sm overflow-hidden">
      <div className="bg-emerald-950 p-6 text-white">
        <Hash size={28} className="text-emerald-300" />
        <h1 className="mt-3 text-xl font-black">Saisie manuelle</h1>
        <p className="mt-1 text-sm text-white/60">Entrez le code a 6 caracteres imprime sous le QR code.</p>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase text-neutral-500 mb-2">
            Code court (ex : 47BK23)
          </label>
          <input
            ref={inputRef}
            type="text"
            inputMode="text"
            maxLength={6}
            placeholder="ex : 47BK23"
            value={normalized}
            onChange={e => setRaw(e.target.value.toUpperCase())}
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-center text-2xl font-black tracking-[0.35em] uppercase focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <p className="mt-2 text-xs text-neutral-400 text-center">
            Majuscules et minuscules acceptees — insensible a la casse.
          </p>
        </div>
        <button
          type="button"
          disabled={!valid}
          onClick={() => valid && onSubmit(normalized)}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 text-sm font-black text-white disabled:opacity-40"
        >
          <ShieldCheck size={16} /> Verifier ce code
        </button>
      </div>
    </div>
  );
}

function ValidationContent() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') ?? '');
  const [ready, setReady] = useState(false);
  const [manualMode, setManualMode] = useState(false);

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const fragmentToken = fragment.get('token');
    if (fragmentToken) setToken(fragmentToken);
    setReady(true);
  }, []);

  const inspection = useInspectCauriRedemption(token);
  const redeem = useRedeemCauris();
  const redemption = inspection.data?.data;
  const member = redemption?.userId;
  const activity = redemption?.activityId;

  if (!ready) {
    return <div className='py-20 text-center text-sm text-neutral-500'>Lecture du QR code...</div>;
  }

  // Aucun token dans l'URL : proposer la saisie manuelle
  if (!token || manualMode) {
    return (
      <div className="space-y-4">
        {manualMode && (
          <button
            type="button"
            onClick={() => { setManualMode(false); setToken(''); }}
            className="text-sm text-emerald-700 font-bold hover:underline"
          >
            ← Retour
          </button>
        )}
        <ShortCodeInput onSubmit={code => { setToken(code); setManualMode(false); }} />
      </div>
    );
  }

  if (inspection.isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-20 text-sm text-neutral-500">
        <Loader2 size={20} className="animate-spin text-emerald-600" /> Verification...
      </div>
    );
  }

  if (inspection.isError || !redemption) {
    return (
      <div className="space-y-4">
        <div role="alert" className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
          <XCircle size={20} /> QR code inconnu, expire ou inaccessible.
        </div>
        <button
          type="button"
          onClick={() => { setToken(''); setManualMode(true); }}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-emerald-700 text-sm font-bold text-emerald-700"
        >
          <Hash size={15} /> Saisir le code manuellement
        </button>
      </div>
    );
  }

  const usable = redemption.status === 'reserved' && new Date(redemption.expiresAt).getTime() > Date.now();

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="bg-emerald-950 p-6 text-white">
        <ShieldCheck size={28} className="text-emerald-300" />
        <h1 className="mt-3 text-xl font-black">Validation des cauris</h1>
        <p className="mt-1 text-sm text-white/60">Controle administratif avant consommation.</p>
      </div>
      <div className="space-y-5 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100">
            <UserRound size={20} className="text-neutral-600" />
          </div>
          <div>
            <p className="font-black text-neutral-900">{member?.firstName} {member?.lastName}</p>
            <p className="text-xs text-neutral-500">{member?.memberNumber ?? 'Membre SALAM'}</p>
          </div>
        </div>

        <div className="rounded-lg bg-amber-50 p-5 text-center">
          <Image src="/images/cauris/cauri.png" width={36} height={36} alt="cauris" className="mx-auto object-contain" />
          <p className="mt-2 text-3xl font-black text-amber-900">{redemption.amount}</p>
          <p className="text-xs font-bold uppercase text-amber-700">cauris a utiliser</p>
          {(redemption as any).shortCode && (
            <p className="mt-2 text-xs font-mono font-bold tracking-widest text-amber-600">
              # {(redemption as any).shortCode}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-neutral-100 p-4">
          <p className="text-xs font-bold uppercase text-neutral-400">Evenement</p>
          <p className="mt-1 font-black text-neutral-900">{activity?.title ?? redemption.activityTitle}</p>
          {activity?.location && <p className="mt-1 text-sm text-neutral-500">{activity.location}</p>}
        </div>

        {redeem.isSuccess ? (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-50 p-4 font-bold text-emerald-700">
            <CheckCircle2 size={20} /> cauris valides
          </div>
        ) : (
          <button
            type="button"
            disabled={!usable || redeem.isPending}
            onClick={() => redeem.mutate(token)}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 text-sm font-black text-white disabled:opacity-40"
          >
            {redeem.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            Valider l utilisation
          </button>
        )}
        {!usable && !redeem.isSuccess && (
          <p role="alert" className="text-center text-xs font-semibold text-red-600">
            Ce QR code a deja ete traite ou a expire.
          </p>
        )}
        <button
          type="button"
          onClick={() => setManualMode(true)}
          className="inline-flex h-9 w-full items-center justify-center gap-2 text-xs font-semibold text-neutral-500 hover:text-emerald-700"
        >
          <Hash size={13} /> Saisir un autre code manuellement
        </button>
      </div>
    </div>
  );
}

export default function CauriValidationPage() {
  return (
    <div className="mx-auto max-w-lg py-6">
      <Suspense fallback={<div className="py-20 text-center text-sm text-neutral-500">Chargement...</div>}>
        <ValidationContent />
      </Suspense>
    </div>
  );
}
