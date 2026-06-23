'use client';

import { use, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ArrowLeft, CreditCard, Mail, Phone, MapPin, Calendar,
  Edit, CheckCircle2, Clock, Loader2, Trash2,
} from 'lucide-react';
import { MemberCard, type MemberCardData } from '@/components/portal/MemberCard';
import { useAdminMember, useHardDeleteMember } from '@/lib/api/members';
import { useAuthStore } from '@/store/auth.store';
import { formatFullName } from '@/lib/format-name';
import { downloadElementAsPng, memberCardMailto } from '@/lib/member-card-export';

export default function AdherentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }       = use(params);
  const router       = useRouter();
  const { data, isLoading, isError } = useAdminMember(id);
  const member       = data?.data;

  const user         = useAuthStore(s => s.user);
  const isSuperAdmin = user?.effectivePermissions?.includes('*') ?? false;

  const hardDelete   = useHardDeleteMember();
  const [confirming, setConfirming] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);


  const handleDownloadCard = async () => {
    if (!member || !cardRef.current) return;
    try {
      await downloadElementAsPng(cardRef.current, `carte-salam-${member.memberId}.png`);
      toast.success('Carte telechargee');
    } catch {
      toast.error('Impossible de telecharger la carte. Reessayez sans photo distante si besoin.');
    }
  };
  const handleDelete = () => {
    if (!confirming) { setConfirming(true); return; }
    hardDelete.mutate(id, {
      onSuccess: () => router.push('/admin/adherents'),
    });
  };

  if (isLoading) return (
    <div className="flex min-h-[300px] items-center justify-center">
      <Loader2 size={24} className="animate-spin text-emerald-600" />
    </div>
  );

  if (isError || !member) return (
    <div className="mx-auto max-w-lg py-12 text-center">
      <p className="text-sm font-semibold text-neutral-500">Membre introuvable</p>
      <Link href="/admin/adherents" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:underline">
        <ArrowLeft size={13} /> Retour à la liste
      </Link>
    </div>
  );

  const year     = new Date().getFullYear();
  const isActive = member.memberStatus === 'active';

  const cardData: MemberCardData = {
    id:        member.memberId,
    firstName: member.firstName,
    lastName:  member.lastName,
    gender:    member.gender,
    role:      'Membre actif',
    year,
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">

      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/adherents" className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:border-neutral-300">
          <ArrowLeft size={15} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">{formatFullName(member.firstName, member.lastName)}</h1>
          <p className="font-mono text-sm text-neutral-500">{member.memberId}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-black ${isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-yellow-50 text-yellow-700'}`}>
            {isActive ? <CheckCircle2 size={12} /> : <Clock size={12} />}
            {isActive ? 'Actif' : 'En attente'}
          </span>
          <Link
            href={`/admin/adherents/nouveau?edit=${encodeURIComponent(id)}`}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-neutral-100 px-4 text-sm font-semibold text-neutral-700 transition hover:bg-yellow-300 hover:text-neutral-950"
          >
            <Edit size={13} /> Modifier
          </Link>

          {/* Supprimer — super_admin uniquement */}
          {isSuperAdmin && (
            confirming ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-red-600">Supprimer définitivement ?</span>
                <button
                  onClick={handleDelete}
                  disabled={hardDelete.isPending}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-red-500 px-4 text-xs font-black text-white hover:bg-red-600 disabled:opacity-60"
                >
                  {hardDelete.isPending ? <Loader2 size={13} className="animate-spin" /> : 'Confirmer'}
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="inline-flex h-9 items-center rounded-full border border-neutral-200 px-3 text-xs font-semibold text-neutral-600 hover:border-neutral-300"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <button
                onClick={handleDelete}
                title="Supprimer définitivement"
                className="inline-flex h-9 items-center gap-2 rounded-full border border-red-200 px-4 text-xs font-semibold text-red-500 hover:border-red-400 hover:bg-red-50"
              >
                <Trash2 size={13} /> Supprimer
              </button>
            )
          )}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">

        {/* Info */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
            <p className="mb-4 text-sm font-black text-neutral-900">Informations personnelles</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: Mail,     label: 'Email',     value: member.email },
                { icon: Phone,    label: 'Téléphone', value: member.phone ?? '—' },
                { icon: MapPin,   label: 'Ville',     value: '—' },
                { icon: MapPin,   label: 'Pays',      value: '—' },
                { icon: Calendar, label: 'Adhésion',  value: new Date(member.createdAt).toLocaleDateString('fr-FR') },
                { icon: MapPin,   label: 'Antenne',   value: '—' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-50">
                    <Icon size={13} className="text-neutral-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.1em] text-neutral-400">{label}</p>
                    <p className="text-sm font-semibold text-neutral-800">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
            <p className="mb-4 text-sm font-black text-neutral-900">Historique d&apos;activité</p>
            <div className="flex flex-col items-center py-6 text-center">
              <Clock size={24} className="mb-2 text-neutral-200" />
              <p className="text-sm text-neutral-400">Aucun historique disponible.</p>
            </div>
          </div>
        </div>

        {/* Carte membre */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-black text-neutral-900">Carte de membre</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">
                <CheckCircle2 size={10} /> Active
              </span>
            </div>
            <div ref={cardRef} className="flex justify-center overflow-x-auto">
              <MemberCard member={cardData} />
            </div>
            <p className="mt-3 text-center text-[10px] text-neutral-400">
              QR vers salam-cameroun.com/verify/{member.memberId}
            </p>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={handleDownloadCard} className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600 hover:border-neutral-300">
                <CreditCard size={13} /> Télécharger
              </button>
              <a href={memberCardMailto(member.email, formatFullName(member.firstName, member.lastName), member.memberId)} className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-xs font-black text-white hover:bg-emerald-700">
                Envoyer par email
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
