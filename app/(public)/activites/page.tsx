'use client';

import { useState, useMemo } from 'react';
import { Calendar, MapPin, Users, ArrowRight, Search, Loader2, Clock } from 'lucide-react';
import Link from 'next/link';
import { PageHero } from '@/components/public/PageHero';
import { usePublicActivities, ACTIVITY_CATEGORIES } from '@/lib/api/activities';
import { RichText } from '@/components/ui/RichText';

const CATS = [
  { id: 'all', label: 'Toutes' },
  ...ACTIVITY_CATEGORIES.map(c => ({ id: c.value, label: c.label })),
];

const CAT_COLORS: Record<string, string> = {
  sport: 'bg-blue-100 text-blue-700', culture: 'bg-purple-100 text-purple-700',
  etude: 'bg-yellow-100 text-yellow-700', benevolat: 'bg-red-100 text-red-700',
  reseau: 'bg-emerald-100 text-emerald-700', conference: 'bg-orange-100 text-orange-700',
  atelier: 'bg-pink-100 text-pink-700', entraide: 'bg-teal-100 text-teal-700',
  orientation: 'bg-indigo-100 text-indigo-700', insertion: 'bg-cyan-100 text-cyan-700',
  assemblee_generale: 'bg-violet-100 text-violet-700', divers: 'bg-neutral-100 text-neutral-600',
};

const COVERS = [
  'from-emerald-400 to-teal-600', 'from-blue-400 to-indigo-600',
  'from-purple-400 to-pink-600',  'from-amber-400 to-orange-500',
];

export default function ActivitesPage() {
  const [cat, setCat]       = useState('all');
  const [search, setSearch] = useState('');

  const { data, isLoading } = usePublicActivities();
  const activities = data?.data?.activities ?? [];

  const filtered = useMemo(() =>
    activities.filter(a =>
      (cat === 'all' || a.category === cat) &&
      (a.title.toLowerCase().includes(search.toLowerCase()) ||
       (a.description ?? '').toLowerCase().includes(search.toLowerCase()))
    ),
  [activities, cat, search]);

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
        </div>
      </PageHero>

      <section className="bg-[#fffdf8] px-5 py-[clamp(3rem,6vw,5rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-4">
            <div className="relative max-w-md">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher une activité..."
                className="h-11 w-full rounded-full border border-neutral-200 bg-white pl-11 pr-5 text-sm shadow-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/12" />
            </div>
            <div className="flex flex-wrap gap-2">
              {CATS.map(c => (
                <button key={c.id} onClick={() => setCat(c.id)}
                  className={`h-9 rounded-full px-4 text-xs font-bold transition-all ${cat === c.id ? 'bg-emerald-600 text-white shadow-sm' : 'border border-neutral-200 bg-white text-neutral-600 hover:border-emerald-300 hover:text-emerald-700'}`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading && (
            <div className="flex flex-col items-center py-20 gap-4">
              <Loader2 size={32} className="animate-spin text-emerald-600" />
              <p className="text-sm text-neutral-500">Chargement des activités…</p>
            </div>
          )}

          {!isLoading && filtered.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((a, i) => (
                <Link key={a._id} href={`/activites/${a.slug}`} className="group flex flex-col gap-4 rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md">
                  <div className={`aspect-[16/9] rounded-xl bg-gradient-to-br ${COVERS[i % COVERS.length]}`} />
                  <div className="flex flex-col gap-2">
                    <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-bold ${CAT_COLORS[a.category] ?? 'bg-neutral-100 text-neutral-600'}`}>
                      {ACTIVITY_CATEGORIES.find(c => c.value === a.category)?.label ?? a.category}
                    </span>
                    <h3 className="font-black text-neutral-900 group-hover:text-emerald-700 transition-colors"><RichText value={a.title} /></h3>
                    {a.description && <p className="text-xs text-neutral-500 line-clamp-2"><RichText value={a.description} /></p>}
                    <div className="flex flex-wrap gap-3 text-xs text-neutral-400">
                      {a.startDate && <span className="flex items-center gap-1"><Calendar size={12} />{new Date(a.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>}
                      {a.location  && <span className="flex items-center gap-1"><MapPin size={12} />{a.location}</span>}
                      {a.capacity  && <span className="flex items-center gap-1"><Users size={12} />{a.capacity} places</span>}
                    </div>
                    <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:gap-2 transition-all">
                      Voir le détail <ArrowRight size={11} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="flex flex-col items-center gap-6 rounded-[2rem] border border-dashed border-neutral-300 bg-white py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
                <Calendar size={28} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-neutral-900">
                  {search || cat !== 'all' ? 'Aucune activité trouvée' : 'Aucune activité publiée pour l\'instant'}
                </h3>
                <p className="mt-2 max-w-sm text-sm text-neutral-500">
                  {search || cat !== 'all' ? 'Essayez d\'autres filtres.' : 'Les prochaines activités SALAM seront annoncées ici.'}
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {(search || cat !== 'all') ? (
                  <button onClick={() => { setSearch(''); setCat('all'); }}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-700 hover:border-emerald-400 hover:text-emerald-700 transition-all">
                    Réinitialiser les filtres
                  </button>
                ) : (
                  <Link href="/adhesion" className="inline-flex h-10 items-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-black text-white transition-all hover:bg-emerald-700">
                    Devenir membre <ArrowRight size={13} />
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
