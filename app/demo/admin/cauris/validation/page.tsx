'use client';

import { useState } from 'react';
import { CheckCircle2, Hash, ShieldCheck, UserRound, XCircle } from 'lucide-react';
import { DemoPortalShell } from '../../../_components/DemoShell';

const SHORT_CODE_RE = /^\d{2}[A-Za-z]{2}\d{2}$/;

const DEMO_REDEMPTIONS: Record<string, { member: { firstName: string; lastName: string; memberNumber: string }; amount: number; activityTitle: string; location: string; shortCode: string; status: 'reserved' | 'used' }> = {
  '47BK23': {
    member: { firstName: 'Amina', lastName: 'Diallo', memberNumber: 'SALAM-2026-014' },
    amount: 50,
    activityTitle: 'Tournoi de la fraternite SALAM',
    location: 'Stade annexe, Yaounde',
    shortCode: '47BK23',
    status: 'reserved',
  },
  '88WF12': {
    member: { firstName: 'Boris', lastName: 'Tamko', memberNumber: 'SALAM-2026-021' },
    amount: 20,
    activityTitle: 'Soiree culturelle Cameroun-Maroc',
    location: 'Salle des fetes, Yaounde',
    shortCode: '88WF12',
    status: 'used',
  },
};

export default function DemoCauriValidationPage() {
  const [raw, setRaw] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [validated, setValidated] = useState(false);

  const code = raw.toUpperCase();
  const valid = SHORT_CODE_RE.test(code);
  const redemption = submitted ? DEMO_REDEMPTIONS[code] : null;
  const usable = redemption?.status === 'reserved';

  const handleSubmit = () => {
    if (!valid) return;
    setSubmitted(true);
    setValidated(false);
  };

  const handleReset = () => {
    setRaw('');
    setSubmitted(false);
    setValidated(false);
  };

  return (
    <DemoPortalShell type="admin" title="Validation Cauris">
      <div className="mx-auto max-w-lg py-6">

        {/* Formulaire saisie */}
        {!submitted && (
          <div className="rounded-lg border border-neutral-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-emerald-950 p-6 text-white">
              <Hash size={28} className="text-emerald-300" />
              <h1 className="mt-3 text-xl font-black">Saisie manuelle</h1>
              <p className="mt-1 text-sm text-white/60">Entrez le code à 6 caractères imprimé sous le QR code.</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-2">
                  Code court (ex : 47BK23)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="ex : 47BK23"
                  value={code}
                  onChange={e => setRaw(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-center text-2xl font-black tracking-[0.35em] uppercase focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
                <p className="mt-2 text-xs text-neutral-400 text-center">
                  Essayez <span className="font-mono font-bold">47BK23</span> (valide) ou <span className="font-mono font-bold">88WF12</span> (utilisé)
                </p>
              </div>
              <button
                type="button"
                disabled={!valid}
                onClick={handleSubmit}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 text-sm font-black text-white disabled:opacity-40"
              >
                <ShieldCheck size={16} /> Vérifier ce code
              </button>
            </div>
          </div>
        )}

        {/* Résultat — code inconnu */}
        {submitted && !redemption && (
          <div className="space-y-4">
            <div role="alert" className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
              <XCircle size={20} /> QR code inconnu, expiré ou inaccessible.
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-emerald-700 text-sm font-bold text-emerald-700"
            >
              <Hash size={15} /> Saisir un autre code
            </button>
          </div>
        )}

        {/* Résultat — code trouvé */}
        {submitted && redemption && (
          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
            <div className="bg-emerald-950 p-6 text-white">
              <ShieldCheck size={28} className="text-emerald-300" />
              <h1 className="mt-3 text-xl font-black">Validation des cauris</h1>
              <p className="mt-1 text-sm text-white/60">Contrôle administratif avant consommation.</p>
            </div>
            <div className="space-y-5 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100">
                  <UserRound size={20} className="text-neutral-600" />
                </div>
                <div>
                  <p className="font-black text-neutral-900">{redemption.member.firstName} {redemption.member.lastName}</p>
                  <p className="text-xs text-neutral-500">{redemption.member.memberNumber}</p>
                </div>
              </div>

              <div className="rounded-lg bg-amber-50 p-5 text-center">
                <p className="mt-2 text-3xl font-black text-amber-900">{redemption.amount}</p>
                <p className="text-xs font-bold uppercase text-amber-700">cauris à utiliser</p>
                <p className="mt-2 text-xs font-mono font-bold tracking-widest text-amber-600">
                  # {redemption.shortCode}
                </p>
              </div>

              <div className="rounded-lg border border-neutral-100 p-4">
                <p className="text-xs font-bold uppercase text-neutral-400">Événement</p>
                <p className="mt-1 font-black text-neutral-900">{redemption.activityTitle}</p>
                <p className="mt-1 text-sm text-neutral-500">{redemption.location}</p>
              </div>

              {validated ? (
                <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-50 p-4 font-bold text-emerald-700">
                  <CheckCircle2 size={20} /> Cauris validés (démo)
                </div>
              ) : usable ? (
                <button
                  type="button"
                  onClick={() => setValidated(true)}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 text-sm font-black text-white"
                >
                  <CheckCircle2 size={16} /> Valider l'utilisation
                </button>
              ) : (
                <>
                  <button type="button" disabled className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 text-sm font-black text-white opacity-40">
                    <CheckCircle2 size={16} /> Valider l'utilisation
                  </button>
                  <p role="alert" className="text-center text-xs font-semibold text-red-600">
                    Ce QR code a déjà été traité ou a expiré.
                  </p>
                </>
              )}

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex h-9 w-full items-center justify-center gap-2 text-xs font-semibold text-neutral-500 hover:text-emerald-700"
              >
                <Hash size={13} /> Saisir un autre code manuellement
              </button>
            </div>
          </div>
        )}

        <p className="mt-4 text-center text-[10px] text-neutral-400">
          Demo — aucune action réelle. Codes de test : 47BK23 / 88WF12
        </p>
      </div>
    </DemoPortalShell>
  );
}
