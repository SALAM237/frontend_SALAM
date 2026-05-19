'use client';

import Link from 'next/link';
import { CreditCard, Calendar, MessageSquare, CheckCircle2 } from 'lucide-react';

const MEMBER = {
  firstName: 'Amina',
  lastName:  'DIALLO',
  email:      'amina.diallo@email.com',
  memberSince:'15/03/2022',
  cardNumber: 'MC-2022-0012',
  antenne:    'Paris – Île-de-France',
};

const ACTIVITIES = [
  { title: 'Atelier CV & Orientation professionnelle', date: '22/05/2024', location: 'Paris 15e',   spots: 8  },
  { title: 'Soirée networking diaspora',               date: '01/06/2024', location: 'Paris 9e',    spots: 3  },
  { title: 'Tournoi de football SALAM',                date: '15/06/2024', location: 'Boulogne',    spots: 12 },
];

const MESSAGES = [
  { from: 'Administration SALAM', preview: 'Votre renouvellement de cotisation a bien été reçu.', time: 'Il y a 2h', unread: true  },
  { from: 'Bureau SALAM',         preview: "Invitation à l'assemblée générale du 28 mai.",        time: 'Hier',      unread: false },
];

export default function DemoMemberDashboard() {
  return (
    <div className="min-h-[calc(100vh-40px)] bg-[#f4f6f5]">
      {/* Header */}
      <header className="border-b border-neutral-200/80 bg-white/95 px-5 py-4">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-sm font-black text-white">AD</div>
            <div>
              <p className="font-black text-neutral-900">{MEMBER.firstName} {MEMBER.lastName}</p>
              <p className="text-xs text-neutral-400">Membre actif · {MEMBER.antenne}</p>
            </div>
          </div>
          <Link href="/demo/member/messages"
            className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:border-emerald-300 hover:text-emerald-700 transition">
            <MessageSquare size={14} />
            <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-red-500" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-4 p-5">

        {/* Carte membre */}
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#07140d] to-[#0d2a1a] p-5 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Carte Membre</p>
              <p className="mt-1 text-xl font-black">{MEMBER.firstName} {MEMBER.lastName}</p>
              <p className="text-[10px] text-white/40 mt-0.5">{MEMBER.email}</p>
            </div>
            <CreditCard size={28} className="text-emerald-400/60" />
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-wide">N° Adhérent</p>
              <p className="font-mono text-sm font-bold text-emerald-400">{MEMBER.cardNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-white/40 uppercase tracking-wide">Membre depuis</p>
              <p className="text-sm font-semibold text-white/80">{MEMBER.memberSince}</p>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={15} className="text-emerald-600" />
              <p className="text-[10px] font-black uppercase tracking-wide text-emerald-800">Cotisation 2024</p>
            </div>
            <p className="text-lg font-black text-emerald-700">À jour</p>
            <p className="text-[10px] text-emerald-600/70 mt-0.5">Valable jusqu&apos;au 31/12/2024</p>
          </div>
          <div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={15} className="text-blue-600" />
              <p className="text-[10px] font-black uppercase tracking-wide text-neutral-600">Activités</p>
            </div>
            <p className="text-lg font-black text-neutral-900">3</p>
            <p className="text-[10px] text-neutral-400 mt-0.5">À venir ce mois</p>
          </div>
          <div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={15} className="text-emerald-600" />
              <p className="text-[10px] font-black uppercase tracking-wide text-neutral-600">Messages</p>
            </div>
            <p className="text-lg font-black text-neutral-900">1</p>
            <p className="text-[10px] text-neutral-400 mt-0.5">Non lu</p>
          </div>
        </div>

        {/* Upcoming activities */}
        <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
          <div className="border-b border-neutral-100 px-5 py-3.5">
            <p className="text-sm font-black text-neutral-900">Prochaines activités</p>
          </div>
          <div className="divide-y divide-neutral-50">
            {ACTIVITIES.map(a => (
              <div key={a.title} className="flex items-start gap-3 px-5 py-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                  <Calendar size={14} className="text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 truncate">{a.title}</p>
                  <p className="text-xs text-neutral-400">{a.date} · {a.location}</p>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  {a.spots} places
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Messages preview */}
        <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3.5">
            <p className="text-sm font-black text-neutral-900">Messages récents</p>
            <Link href="/demo/member/messages" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">Voir tout</Link>
          </div>
          <div className="divide-y divide-neutral-50">
            {MESSAGES.map(m => (
              <div key={m.from} className={`flex items-start gap-3 px-5 py-3.5 ${m.unread ? 'bg-emerald-50/50' : ''}`}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-xs font-black text-white">SA</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${m.unread ? 'font-black' : 'font-semibold'} text-neutral-900`}>{m.from}</p>
                  <p className="text-xs text-neutral-500 truncate">{m.preview}</p>
                </div>
                <span className="shrink-0 text-[10px] text-neutral-400 whitespace-nowrap">{m.time}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
