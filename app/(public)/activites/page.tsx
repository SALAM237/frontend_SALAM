'use client';

import { useState, useMemo } from 'react';
import { Calendar, MapPin, Users, ArrowRight, Search, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { PageHero } from '@/components/public/PageHero';

const CATS = [
  { id: 'all', label: 'Toutes' },
  { id: 'sport', label: 'Sport' },
  { id: 'culture', label: 'Culture' },
  { id: 'etude', label: 'Étude' },
  { id: 'benevolat', label: 'Bénévolat' },
  { id: 'reseau', label: 'Réseau pro' },
  { id: 'conference', label: 'Conférence' },
  { id: 'atelier', label: 'Atelier' },
  { id: 'entraide', label: 'Entraide' },
  { id: 'orientation', label: 'Orientation' },
];

const CAT_COLORS: Record<string, string> = {
  sport: 'bg-blue-100 text-blue-700',
  culture: 'bg-purple-100 text-purple-700',
  etude: 'bg-yellow-100 text-yellow-700',
  benevolat: 'bg-red-100 text-red-700',
  reseau: 'bg-emerald-100 text-emerald-700',
  conference: 'bg-orange-100 text-orange-700',
  atelier: 'bg-pink-100 text-pink-700',
  entraide: 'bg-teal-100 text-teal-700',
  orientation: 'bg-indigo-100 text-indigo-700',
};

// Production: no activities yet (data will come from API)
const ACTIVITIES: {
  id: string; slug: string; title: string; category: string;
  date: string; location: string; participants: number; description: string;
}[] = [];

export default function ActivitesPage() {
  const [cat, setCat] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() =>
    ACTIVITIES.filter(a =>
      (cat === 'all' || a.category === cat) &&
      (a.title.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase()))
    ),
  [cat, search]);

  return (
    <main>
      <PageHero
        badge="Agenda SALAM"
        title="activités"
        accentWord="Nos"
        accentPosition="start"
        subtitle="Événements sportifs, culturels, ateliers, conférences et actions solidaires de l'association SALAM."
        breadcrumbs={[{ label: 'Activités' }]}
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/adhesion" className="inline-flex h-10 items-center gap-2 rounded-full bg-emerald-500 px-5 text-sm font-black text-white transition-all hover:bg-emerald-400">
            Devenir membre
          </Link>
          <Link href="/demo/activites" className="inline-flex h-10 items-center gap-2 rounded-full border border-white/20 px-5 text-sm font-semibold text-white/70 transition-all hover:border-white/40 hover:text-white">
            Voir la démo <ArrowRight size={13} />
          </Link>
        </div>
      </PageHero>

      <section className="bg-[#fffdf8] px-5 py-[clamp(3rem,6vw,5rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">

          {/* Filters */}
          <div className="mb-8 flex flex-col gap-4">
            <div className="relative max-w-md">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher une activité..."
                className="h-11 w-full rounded-full border border-neutral-200 bg-white pl-11 pr-5 text-sm shadow-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/12"
              />
            </div>

            <div className="flex flex-wrap gap-2">
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
          </div>

          {/* Grid or empty */}
          {filtered.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(a => (
                <Link key={a.id} href={`/activites/${a.slug}`} className="group flex flex-col gap-4 rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                  <div className="aspect-[16/9] rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200" />
                  <div className="flex flex-col gap-2">
                    <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-bold ${CAT_COLORS[a.category] ?? 'bg-neutral-100 text-neutral-600'}`}>
                      {a.category}
                    </span>
                    <h3 className="font-black text-neutral-900 group-hover:text-emerald-700 transition-colors">{a.title}</h3>
                    <p className="text-xs text-neutral-500 line-clamp-2">{a.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-neutral-400">
                      <span className="flex items-center gap-1"><Calendar size={12} />{a.date}</span>
                      <span className="flex items-center gap-1"><MapPin size={12} />{a.location}</span>
                      <span className="flex items-center gap-1"><Users size={12} />{a.participants} participants</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 rounded-[2rem] border border-dashed border-neutral-300 bg-white py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
                <Calendar size={28} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-neutral-900">
                  {search || cat !== 'all' ? 'Aucune activité trouvée' : 'Aucune activité publiée pour l\'instant'}
                </h3>
                <p className="mt-2 max-w-sm text-sm text-neutral-500">
                  {search || cat !== 'all'
                    ? 'Essayez d\'autres filtres ou termes de recherche.'
                    : 'Les prochaines activités SALAM seront annoncées ici. Rejoignez-nous pour ne rien manquer.'
                  }
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {(search || cat !== 'all') ? (
                  <button
                    onClick={() => { setSearch(''); setCat('all'); }}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-700 hover:border-emerald-400 hover:text-emerald-700 transition-all"
                  >
                    Réinitialiser les filtres
                  </button>
                ) : (
                  <>
                    <Link href="/adhesion" className="inline-flex h-10 items-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-black text-white transition-all hover:bg-emerald-700">
                      Devenir membre
                    </Link>
                    <Link href="/demo/activites" className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-300 px-5 text-sm font-semibold text-neutral-700 transition-all hover:border-emerald-400 hover:text-emerald-700">
                      Voir la démo <ArrowRight size={13} />
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
