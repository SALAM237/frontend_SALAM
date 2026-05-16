'use client';

import { useState } from 'react';
import { CreditCard, Download, Share2, CheckCircle2, Smartphone, Info } from 'lucide-react';
import { MemberCard, type MemberCardData } from '@/components/portal/MemberCard';

const MEMBER: MemberCardData = {
  id: 'SALAM-2024-0042',
  firstName: 'Jean',
  lastName: 'Kamga',
  role: 'Membre actif',
  antenne: 'Paris',
  year: new Date().getFullYear(),
};

export default function MembreCartePage() {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Ma carte de membre</h1>
        <p className="mt-0.5 text-sm text-neutral-500">Votre carte officielle SALAM avec QR code de vérification</p>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
        <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
        <div className="flex-1">
          <p className="text-sm font-black text-emerald-800">Carte active et valide</p>
          <p className="text-xs text-emerald-600">Valable jusqu'au 31 décembre {MEMBER.year}</p>
        </div>
        <span className="text-xs font-mono font-bold text-emerald-700">{MEMBER.id}</span>
      </div>

      {/* Card display */}
      <div className="rounded-2xl border border-neutral-100 bg-white p-8 shadow-sm">
        <div className="flex justify-center overflow-x-auto">
          <MemberCard member={MEMBER} />
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={handleDownload}
            className={`inline-flex h-10 items-center gap-2 rounded-full px-6 text-sm font-black transition-all ${downloaded ? 'bg-neutral-100 text-neutral-500 cursor-default' : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20'}`}
          >
            {downloaded ? <><CheckCircle2 size={14} /> Téléchargée !</> : <><Download size={14} /> Télécharger (PNG)</>}
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-200 px-6 text-sm font-semibold text-neutral-600 hover:border-neutral-300 transition-all">
            <Share2 size={14} /> Partager
          </button>
        </div>
      </div>

      {/* QR Info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Smartphone size={15} className="text-emerald-600" />
            <p className="text-sm font-black text-neutral-900">Comment utiliser votre carte</p>
          </div>
          <ul className="space-y-2.5">
            {[
              'Présentez votre carte (physique ou écran) lors des événements SALAM',
              'Le QR code permet de vérifier votre adhésion instantanément',
              'Valable pour tous les événements de l\'année en cours',
              'Téléchargez-la pour y accéder hors connexion',
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
              { label: 'Nom complet',    value: `${MEMBER.firstName} ${MEMBER.lastName}` },
              { label: 'N° membre',      value: MEMBER.id             },
              { label: 'Rôle',           value: MEMBER.role           },
              { label: 'Antenne',        value: `Antenne ${MEMBER.antenne}` },
              { label: 'Validité',       value: `Année ${MEMBER.year}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-2">
                <p className="text-xs font-black uppercase tracking-[0.1em] text-neutral-400">{label}</p>
                <p className="text-xs font-semibold text-neutral-800 text-right">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Renewal notice */}
      <div className="flex items-start gap-3 rounded-xl border border-yellow-100 bg-yellow-50 p-4">
        <CreditCard size={15} className="mt-0.5 shrink-0 text-yellow-600" />
        <div>
          <p className="text-sm font-black text-yellow-800">Renouvellement annuel</p>
          <p className="mt-0.5 text-xs text-yellow-700">
            Votre carte est valable pour l&apos;année {MEMBER.year}. Le renouvellement s&apos;effectue en début d&apos;année
            via la page d&apos;adhésion ou en contactant l&apos;administration.
          </p>
        </div>
      </div>
    </div>
  );
}
