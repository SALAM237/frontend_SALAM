'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Users, ArrowLeft, FlaskConical } from 'lucide-react';
import { demoActivities } from '@/data/demo/demo-activities';

const CATS = [
  { id: 'all', label: 'Toutes' },
  { id: 'sport', label: 'Sport' },
  { id: 'culture', label: 'Culture' },
  { id: 'etude', label: 'Étude' },
  { id: 'benevolat', label: 'Bénévolat' },
];

const CAT_COLORS: Record<string, string> = {
  sport:     'bg-blue-100 text-blue-700',
  culture:   'bg-purple-100 text-purple-700',
  etude:     'bg-yellow-100 text-yellow-700',
  benevolat: 'bg-red-100 text-red-700',
  divers:    'bg-neutral-100 text-neutral-600',
};

const BG_GRADIENTS: Record<string, string> = {
  sport:     'from-blue-100 to-blue-200',
  culture:   'from-purple-100 to-purple-200',
  etude:     'from-yellow-100 to-yellow-200',
  benevolat: 'from-red-100 to-red-200',
  divers:    'from-neutral-100 to-neutral-200',
};

export default function DemoActivitesPage() {
  const [cat, setCat] = useState('all');
  const list = cat === 'all' ? demoActivities : demoActivities.filter(a => a.category === cat);

  return (
    <main className="min-h-screen bg-[#fffdf8]">

      {/* Demo banner */}
      <div className="sticky top-16 z-20 flex items-center justify-between gap-3 border-b border-yellow-200 bg-yellow-50 px-5 py-2.5 md:px-8">
        <div className="flex items-center gap-2 text-xs font-bold text-yellow-800">
          <FlaskConical size={13} />
          Mode démo — données fictives
        </div>
        <Link href="/activites" className="text-xs font-semibold text-yellow-700 hover:text-yellow-900 transition-colors">
          ← Version production
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-5 py-8 md:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <Link href="/demo" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-400 hover:text-neutral-700 transition-colors">
            <ArrowLeft size={14} /> Démo
          </Link>
          <h1 className="text-[clamp(1.8rem,4vw,2.8rem)] font-black leading-[0.92] tracking-[-0.04em] text-neutral-900">
            Activités <span className="text-emerald-600">SALAM</span>
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            {demoActivities.length} activités disponibles
          </p>
        </div>
      </div>

      <section className="px-5 py-10 md:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">

          {/* Filters */}
          <div className="mb-8 flex flex-wrap gap-2">
            {CATS.map(c => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={`h-9 rounded-full px-4 text-xs font-bold transition-all ${
                  cat === c.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'border border-neutral-200 bg-white text-neutral-600 hover:border-emerald-300 hover:text-emerald-700'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map(a => (
              <Link
                key={a.id}
                href={`/demo/activites/${a.slug}`}
                className="group flex flex-col rounded-[1.5rem] border border-neutral-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md overflow-hidden"
              >
                <div className={`aspect-[16/9] bg-gradient-to-br ${BG_GRADIENTS[a.category] ?? 'from-neutral-100 to-neutral-200'} flex items-center justify-center`}>
                  <span className="text-4xl font-black text-white/30">{a.title.charAt(0)}</span>
                </div>
                <div className="flex flex-col gap-3 p-5">
                  <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-bold ${CAT_COLORS[a.category] ?? 'bg-neutral-100 text-neutral-600'}`}>
                    {a.category}
                  </span>
                  <h2 className="font-black text-neutral-900 group-hover:text-emerald-700 transition-colors leading-snug">
                    {a.title}
                  </h2>
                  <p className="text-xs leading-relaxed text-neutral-500 line-clamp-2">{a.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-neutral-400">
                    <span className="flex items-center gap-1"><Calendar size={11} />{a.date}</span>
                    <span className="flex items-center gap-1"><MapPin size={11} />{a.location}</span>
                    <span className="flex items-center gap-1"><Users size={11} />{a.participants} participants</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
