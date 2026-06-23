'use client';

import { useState } from 'react';
import { CreditCard, Download, Share2, CheckCircle2, Smartphone, Info, Loader2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { MemberCard, memberCardVerifyUrl, type MemberCardData } from '@/components/portal/MemberCard';
import { useAuthStore } from '@/store/auth.store';
import { formatFullName } from '@/lib/format-name';
import { displayMemberNumber } from '@/lib/member-number';
import { generateMemberCardBlob } from '@/lib/member-card-export';

/* Page */

export default function MembreCartePage() {
  const [downloading, setDownloading] = useState(false);
  const [downloaded,  setDownloaded]  = useState(false);
  const [sharing,     setSharing]     = useState(false);
  const user = useAuthStore(s => s.user);

  const year     = new Date().getFullYear();
  const memberId = displayMemberNumber(user);

  const memberData: MemberCardData = {
    id:        memberId,
    cardVerifyToken: user?.cardVerifyToken,
    firstName: user?.firstName ?? '-',
    lastName:  user?.lastName  ?? '-',
    gender:    user?.gender,
    role:      'Membre actif',
    year,
  };

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const blob = await generateMemberCardBlob(memberData);
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href     = url;
      a.download = `carte-salam-${memberId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloaded(true);
      toast.success('Carte téléchargée en PNG');
      setTimeout(() => setDownloaded(false), 2500);
    } catch {
      toast.error('Erreur lors du téléchargement');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    const url  = memberCardVerifyUrl(memberData);
    const text = `Ma carte de membre SALAM - ${memberId}`;
    setSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Carte de membre SALAM', text, url });
        toast.success('Carte partagée');
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Lien copié dans le presse-papiers');
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(url);
          toast.success('Lien copié dans le presse-papiers');
        } catch {
          toast.error('Impossible de partager');
        }
      }
    } finally {
      setSharing(false);
    }
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
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-emerald-800">Carte active et valide</p>
          <p className="text-xs text-emerald-600">Valable jusqu&apos;au 31 décembre {year}</p>
        </div>
        <span className="hidden shrink-0 font-mono text-xs font-bold text-emerald-700 sm:block">{memberId}</span>
      </div>

      {/* Card display */}
      <div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm sm:p-8">
        <div className="mx-auto w-full max-w-[400px]">
          <MemberCard member={memberData} />
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading || downloaded}
            className={`inline-flex h-10 items-center gap-2 rounded-full px-6 text-sm font-black transition-all disabled:opacity-70 ${
              downloaded
                ? 'bg-neutral-100 text-neutral-500'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20'
            }`}
          >
            {downloading
              ? <><Loader2 size={14} className="animate-spin" /> Génération⬦</>
              : downloaded
                ? <><CheckCircle2 size={14} /> Téléchargée !</>
                : <><Download size={14} /> Télécharger (PNG)</>}
          </button>

          <button
            onClick={handleShare}
            disabled={sharing}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-200 px-6 text-sm font-semibold text-neutral-600 transition-all hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-50"
          >
            {sharing
              ? <><Loader2 size={14} className="animate-spin" /> Partage⬦</>
              : <><Share2 size={14} /> Partager</>}
          </button>

          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(memberId);
                toast.success('N° de membre copié');
              } catch {
                toast.error('Impossible de copier');
              }
            }}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-200 px-4 text-sm font-semibold text-neutral-600 transition-all hover:border-neutral-300"
          >
            <Copy size={14} /> Copier N°
          </button>
        </div>
      </div>

      {/* Info cards */}
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
              'Téléchargez-la en PNG pour y accéder hors connexion',
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
              { label: 'Nom complet', value: user ? formatFullName(user.firstName, user.lastName) : '-' },
              { label: 'N° membre',   value: memberId },
              { label: 'Rôle',        value: 'Membre actif' },
              { label: 'Validité',    value: `Année ${year}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-2">
                <p className="text-xs font-black uppercase tracking-[0.1em] text-neutral-400">{label}</p>
                <p className="text-right text-xs font-semibold text-neutral-800">{value}</p>
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
            Votre carte est valable pour l&apos;année {year}. Le renouvellement s&apos;effectue en début d&apos;année
            via la page d&apos;adhésion ou en contactant l&apos;administration.
          </p>
        </div>
      </div>
    </div>
  );
}
