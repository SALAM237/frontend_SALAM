'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Mail, Phone, MapPin, Calendar, Edit, CheckCircle2, Clock } from 'lucide-react';
import { MemberCard, type MemberCardData } from '@/components/portal/MemberCard';

const MOCK: Record<string, MemberCardData & { email: string; phone: string; city: string; country: string; date: string; status: string; motivation: string }> = {
  'SALAM-2024-0128': { id: 'SALAM-2024-0128', firstName: 'Armelle',  lastName: 'Fotso',  role: 'Membre actif', antenne: 'Paris',      year: 2024, email: 'armelle@email.com', phone: '+33 6 12 34 56 78', city: 'Paris',      country: 'Cameroun', date: '14 mai 2025', status: 'active',  motivation: 'Alumni de l\'Université Hassan II de Casablanca, engagée dans la solidarité étudiante.' },
  'SALAM-2024-0127': { id: 'SALAM-2024-0127', firstName: 'Pierre',   lastName: 'Nguemo', role: 'Alumni',       antenne: 'Casablanca', year: 2024, email: 'pierre@email.com',  phone: '+212 6 00 11 22 33',city: 'Casablanca', country: 'Cameroun', date: '11 mai 2025', status: 'active',  motivation: 'Souhaite contribuer au réseau alumni et mentorat.' },
};

export default function AdherentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const member = MOCK[id];

  if (!member) return (
    <div className="mx-auto max-w-lg py-12 text-center">
      <p className="text-sm font-semibold text-neutral-500">Membre introuvable</p>
      <Link href="/admin/adherents" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:underline">
        <ArrowLeft size={13} /> Retour à la liste
      </Link>
    </div>
  );

  const cardData: MemberCardData = { id: member.id, firstName: member.firstName, lastName: member.lastName, role: member.role, antenne: member.antenne, year: member.year };

  return (
    <div className="mx-auto max-w-5xl space-y-5">

      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/adherents" className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:border-neutral-300">
          <ArrowLeft size={15} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">{member.firstName} {member.lastName}</h1>
          <p className="text-sm text-neutral-500 font-mono">{member.id}</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex h-9 items-center gap-2 rounded-full border border-neutral-200 px-4 text-sm font-semibold text-neutral-600 hover:border-neutral-300">
            <Edit size={13} /> Modifier
          </button>
          <span className={`inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-black ${member.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-yellow-50 text-yellow-700'}`}>
            {member.status === 'active' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
            {member.status === 'active' ? 'Actif' : 'En attente'}
          </span>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">

        {/* Info */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
            <p className="mb-4 text-sm font-black text-neutral-900">Informations personnelles</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: Mail,     label: 'Email',     value: member.email    },
                { icon: Phone,    label: 'Téléphone', value: member.phone    },
                { icon: MapPin,   label: 'Ville',     value: member.city     },
                { icon: MapPin,   label: 'Pays',      value: member.country  },
                { icon: Calendar, label: 'Adhésion',  value: member.date     },
                { icon: MapPin,   label: 'Antenne',   value: member.antenne  },
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

          {member.motivation && (
            <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
              <p className="mb-2 text-sm font-black text-neutral-900">Notes / Motivation</p>
              <p className="text-sm leading-relaxed text-neutral-600">{member.motivation}</p>
            </div>
          )}

          {/* Historique placeholder */}
          <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
            <p className="mb-4 text-sm font-black text-neutral-900">Historique d&apos;activité</p>
            <ul className="space-y-3">
              {[
                { text: 'Carte de membre émise',   date: '14 mai 2025' },
                { text: 'Fiche créée par Admin',   date: '14 mai 2025' },
                { text: 'Demande d\'adhésion reçue', date: '13 mai 2025' },
              ].map(({ text, date }, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <span className="flex-1 text-neutral-700">{text}</span>
                  <span className="text-xs text-neutral-400">{date}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Carte membre */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-black text-neutral-900">Carte de membre</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">
                <CheckCircle2 size={10} /> Émise
              </span>
            </div>
            <div className="flex justify-center overflow-x-auto">
              <MemberCard member={cardData} />
            </div>
            <p className="mt-3 text-center text-[10px] text-neutral-400">
              QR → association-salam.org/verify/{member.id}
            </p>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600 hover:border-neutral-300">
                <CreditCard size={13} /> Télécharger
              </button>
              <button className="flex-1 inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-xs font-black text-white hover:bg-emerald-700">
                Envoyer par email
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
