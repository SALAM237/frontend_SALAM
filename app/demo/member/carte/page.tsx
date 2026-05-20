'use client';

import { useState } from 'react';
import { CreditCard, Download, Share2, CheckCircle2, Smartphone, Info, Loader2, Copy } from 'lucide-react';
import { MemberCard, type MemberCardData } from '@/components/portal/MemberCard';
import { DemoPortalShell } from '../../_components/DemoShell';
import { demoMemberProfile } from '@/data/demo/demo-portal';

export default function DemoMemberCardPage() {
  const [downloaded, setDownloaded] = useState(false);
  const [sharing, setSharing] = useState(false);
  const year = new Date().getFullYear();
  const memberId = demoMemberProfile.id;

  const memberData: MemberCardData = {
    id: memberId,
    firstName: demoMemberProfile.firstName,
    lastName: demoMemberProfile.lastName,
    gender: 'femme',
    role: 'Membre actif',
    antenne: demoMemberProfile.antenne,
    year,
  };

  return (
    <DemoPortalShell type="member" title="Ma carte">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Ma carte de membre</h1>
          <p className="mt-0.5 text-sm text-neutral-500">Votre carte officielle SALAM avec QR code de verification</p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
          <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-emerald-800">Carte active et valide</p>
            <p className="text-xs text-emerald-600">Valable jusqu'au 31 decembre {year}</p>
          </div>
          <span className="hidden shrink-0 font-mono text-xs font-bold text-emerald-700 sm:block">{memberId}</span>
        </div>

        <div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm sm:p-8">
          <div className="mx-auto w-full max-w-[400px]">
            <MemberCard member={memberData} />
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                setDownloaded(true);
                window.setTimeout(() => setDownloaded(false), 2200);
              }}
              disabled={downloaded}
              className={`inline-flex h-10 items-center gap-2 rounded-full px-6 text-sm font-black transition-all disabled:opacity-70 ${
                downloaded ? 'bg-neutral-100 text-neutral-500' : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20'
              }`}
            >
              {downloaded ? <><CheckCircle2 size={14} /> Telechargee !</> : <><Download size={14} /> Telecharger (PNG)</>}
            </button>

            <button
              onClick={() => {
                setSharing(true);
                window.setTimeout(() => setSharing(false), 1000);
              }}
              disabled={sharing}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-200 px-6 text-sm font-semibold text-neutral-600 transition-all hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-50"
            >
              {sharing ? <><Loader2 size={14} className="animate-spin" /> Partage...</> : <><Share2 size={14} /> Partager</>}
            </button>

            <button className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-200 px-4 text-sm font-semibold text-neutral-600 transition-all hover:border-neutral-300">
              <Copy size={14} /> Copier No
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Smartphone size={15} className="text-emerald-600" />
              <p className="text-sm font-black text-neutral-900">Comment utiliser votre carte</p>
            </div>
            <ul className="space-y-2.5">
              {[
                'Presentez votre carte lors des evenements SALAM',
                'Le QR code permet de verifier votre adhesion',
                "Valable pour tous les evenements de l'annee",
                'Telechargez-la pour y acceder hors connexion',
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-neutral-600">
                  <div className="mt-1 h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Info size={15} className="text-emerald-600" />
              <p className="text-sm font-black text-neutral-900">Informations membre</p>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Nom complet', value: `${demoMemberProfile.firstName} ${demoMemberProfile.lastName}` },
                { label: 'No membre', value: memberId },
                { label: 'Role', value: 'Membre actif' },
                { label: 'Validite', value: `Annee ${year}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-2">
                  <p className="text-xs font-black uppercase tracking-[0.1em] text-neutral-400">{label}</p>
                  <p className="text-right text-xs font-semibold text-neutral-800">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-yellow-100 bg-yellow-50 p-4">
          <CreditCard size={15} className="mt-0.5 shrink-0 text-yellow-600" />
          <div>
            <p className="text-sm font-black text-yellow-800">Renouvellement annuel</p>
            <p className="mt-0.5 text-xs text-yellow-700">
              Cette demo simule la carte {year}. Aucune donnee n'est stockee ni envoyee en base.
            </p>
          </div>
        </div>
      </div>
    </DemoPortalShell>
  );
}
