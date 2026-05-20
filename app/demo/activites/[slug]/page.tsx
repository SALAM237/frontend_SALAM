'use client';

import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Users, CheckCircle2, FlaskConical } from 'lucide-react';
import { demoActivities } from '@/data/demo/demo-activities';
import { useState } from 'react';

const CAT_COLORS: Record<string, string> = {
  sport:     'bg-blue-100 text-blue-700',
  culture:   'bg-purple-100 text-purple-700',
  etude:     'bg-yellow-100 text-yellow-700',
  benevolat: 'bg-red-100 text-red-700',
  divers:    'bg-neutral-100 text-neutral-600',
};

const BG_GRADIENTS: Record<string, string> = {
  sport:     'from-blue-600 to-blue-400',
  culture:   'from-purple-600 to-purple-400',
  etude:     'from-yellow-500 to-yellow-300',
  benevolat: 'from-red-500 to-red-400',
  divers:    'from-neutral-500 to-neutral-400',
};

export default function DemoActiviteDetailPage({ params }: { params: { slug: string } }) {
  const activity = demoActivities.find(a => a.slug === params.slug);
  const [joined, setJoined] = useState(false);

  if (!activity) {
    return (
      <main className="min-h-screen bg-[#fffdf8] px-5 py-16 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-2xl font-black text-neutral-900">Activité introuvable</h1>
          <Link href="/demo/activites" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-600">
            <ArrowLeft size={14} /> Toutes les activités
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffdf8]">

      {/* Demo banner */}
      <div className="sticky top-16 z-20 flex items-center justify-between gap-3 border-b border-yellow-200 bg-yellow-50 px-5 py-2.5 md:px-8">
        <div className="flex items-center gap-2 text-xs font-bold text-yellow-800">
          <FlaskConical size={13} />
          Mode démo — données fictives
        </div>
        <Link href="/demo/activites" className="text-xs font-semibold text-yellow-700 hover:text-yellow-900">
          ← Version production
        </Link>
      </div>

      {/* Hero */}
      <div className={`bg-gradient-to-br ${BG_GRADIENTS[activity.category] ?? 'from-emerald-600 to-emerald-400'} px-5 py-16 md:px-8 lg:px-12`}>
        <div className="mx-auto max-w-4xl">
          <Link href="/demo/activites" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white/70 hover:text-white transition-colors">
            <ArrowLeft size={14} /> Toutes les activités
          </Link>
          <span className="mb-4 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-black text-white">
            {activity.category}
          </span>
          <h1 className="text-[clamp(1.8rem,4vw,3rem)] font-black leading-[0.92] tracking-[-0.04em] text-white">
            {activity.title}
          </h1>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/80">
            <span className="flex items-center gap-1.5"><Calendar size={14} />{activity.date}</span>
            <span className="flex items-center gap-1.5"><MapPin size={14} />{activity.location}</span>
            <span className="flex items-center gap-1.5"><Users size={14} />{activity.participants} participants</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-10 md:px-8 lg:px-12">
        <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[1fr_280px]">

          {/* Main */}
          <div className="flex flex-col gap-6">
            <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-sm font-black uppercase tracking-[0.15em] text-emerald-700">Description</h2>
              <p className="leading-[1.85] text-neutral-700">{activity.description}</p>
              <p className="mt-4 leading-[1.85] text-neutral-600">
                Cette activité s'inscrit dans le cadre des engagements de l'association SALAM pour renforcer les liens entre les membres et promouvoir les valeurs de solidarité, d'accompagnement et d'action collective.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-black uppercase tracking-[0.15em] text-emerald-700">Programme</h2>
              <ul className="space-y-3">
                {['Accueil et présentation', 'Activité principale', 'Temps d\'échange et networking', 'Clôture'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                    <span className="text-sm text-neutral-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${CAT_COLORS[activity.category]}`}>
                  <Users size={18} />
                </div>
                <div>
                  <p className="text-xs text-neutral-400">Inscrits</p>
                  <p className="text-2xl font-black text-neutral-900">{activity.participants + (joined ? 1 : 0)}</p>
                </div>
              </div>

              {joined ? (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
                  <CheckCircle2 size={15} />
                  Inscription confirmée !
                </div>
              ) : (
                <button
                  onClick={() => setJoined(true)}
                  className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-black text-white transition-all hover:bg-emerald-700 active:scale-[0.98]"
                >
                  S'inscrire (démo)
                </button>
              )}
            </div>

            <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-xs font-black uppercase tracking-[0.15em] text-neutral-400">Informations</h3>
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-center gap-2 text-neutral-600"><Calendar size={13} className="text-neutral-400" />{activity.date}</li>
                <li className="flex items-center gap-2 text-neutral-600"><MapPin size={13} className="text-neutral-400" />{activity.location}</li>
                <li className="flex items-center gap-2 text-neutral-600"><Users size={13} className="text-neutral-400" />{activity.participants} inscrits</li>
              </ul>
            </div>

            <Link
              href="/demo/member"
              className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5 text-center transition-all hover:bg-emerald-100"
            >
              <p className="text-xs font-black uppercase tracking-[0.15em] text-emerald-700">Rejoindre SALAM</p>
              <p className="mt-1 text-xs text-emerald-600">Accédez à toutes les activités en devenant membre.</p>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
