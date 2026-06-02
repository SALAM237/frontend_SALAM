'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BriefcaseBusiness, CalendarClock, Loader2, MapPin, Search } from 'lucide-react';
import { PageHero } from '@/components/public/PageHero';
import { OPPORTUNITY_TYPES, opportunityHref, usePublicOpportunities } from '@/lib/api/opportunities';
import { RichText } from '@/components/ui/RichText';
import { trackEvent } from '@/lib/analytics';

const TYPES = [
  { value: 'all', label: 'Toutes' },
  ...OPPORTUNITY_TYPES,
];

const TYPE_COLORS: Record<string, string> = {
  emploi: 'bg-emerald-100 text-emerald-700',
  stage: 'bg-blue-100 text-blue-700',
  partenariat: 'bg-purple-100 text-purple-700',
  associe: 'bg-amber-100 text-amber-700',
  appel_projet: 'bg-cyan-100 text-cyan-700',
  business: 'bg-orange-100 text-orange-700',
  benevolat: 'bg-red-100 text-red-700',
  autre: 'bg-neutral-100 text-neutral-600',
};

const typeLabel = Object.fromEntries(OPPORTUNITY_TYPES.map(t => [t.value, t.label]));

export default function OpportunitesPage() {
  const [type, setType] = useState('all');
  const [search, setSearch] = useState('');
  const { data, isLoading } = usePublicOpportunities();
  const items = data?.data?.items ?? [];

  const filtered = useMemo(() =>
    items.filter(item =>
      (type === 'all' || item.type === type) &&
      `${item.title} ${item.description} ${item.organization ?? ''} ${item.location ?? ''}`
        .toLowerCase()
        .includes(search.toLowerCase())
    ),
  [items, search, type]);

  useEffect(() => {
    const term = search.trim();
    if (term.length < 2) return;
    const timeout = window.setTimeout(() => {
      trackEvent('search', {
        search_term: term,
        content_type: 'opportunity',
        opportunity_type: type,
      });
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [search, type]);

  return (
    <main>
      <PageHero
        badge="Reseau SALAM"
        title="opportunites"
        accentWord="Nos"
        accentPosition="start"
        subtitle="Offres d'emploi, stages, appels a projets, partenariats et opportunites partagees par la communaute SALAM."
        breadcrumbs={[{ label: 'Opportunites' }]}
      >
        <Link href="/member/opportunites" className="inline-flex h-10 items-center gap-2 rounded-full bg-emerald-500 px-5 text-sm font-black text-white transition-all hover:bg-emerald-400">
          Proposer une opportunite
        </Link>
      </PageHero>

      <section className="bg-[#fffdf8] px-5 py-[clamp(3rem,6vw,5rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-4">
            <div className="relative max-w-md">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Rechercher une opportunite..."
                className="h-11 w-full rounded-full border border-neutral-200 bg-white pl-11 pr-5 text-sm shadow-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/12"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {TYPES.map(item => (
                <button
                  key={item.value}
                  onClick={() => setType(item.value)}
                  className={`h-9 rounded-full px-4 text-xs font-bold transition-all ${type === item.value ? 'bg-emerald-600 text-white shadow-sm' : 'border border-neutral-200 bg-white text-neutral-600 hover:border-emerald-300 hover:text-emerald-700'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading && (
            <div className="flex flex-col items-center gap-4 py-20">
              <Loader2 size={32} className="animate-spin text-emerald-600" />
              <p className="text-sm text-neutral-500">Chargement des opportunites...</p>
            </div>
          )}

          {!isLoading && filtered.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(item => (
                <Link
                  key={item._id}
                  href={opportunityHref(item)}
                  onClick={() => trackEvent('opportunity_click', {
                    opportunity_id: item._id,
                    opportunity_slug: item.slug,
                    opportunity_title: item.title,
                    opportunity_type: item.type,
                    organization: item.organization,
                    source: 'public_list',
                    action: 'card_click',
                  })}
                  className="group flex flex-col rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                      <BriefcaseBusiness size={19} />
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${TYPE_COLORS[item.type] ?? TYPE_COLORS.autre}`}>
                      {typeLabel[item.type] ?? item.type}
                    </span>
                  </div>
                  <h3 className="line-clamp-2 font-black text-neutral-900 transition-colors group-hover:text-emerald-700">
                    <RichText value={item.title} />
                  </h3>
                  <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-neutral-500">
                    <RichText value={item.description} />
                  </p>
                  <div className="mt-5 space-y-2 text-xs font-semibold text-neutral-500">
                    {item.organization && <p>{item.organization}</p>}
                    <p className="flex items-center gap-2"><MapPin size={13} className="text-red-500" />{item.remote ? 'Remote possible' : item.location || 'Lieu a confirmer'}</p>
                    {item.deadline && <p className="flex items-center gap-2"><CalendarClock size={13} className="text-amber-500" />Avant le {new Date(item.deadline).toLocaleDateString('fr-FR')}</p>}
                  </div>
                  <span className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 transition-all group-hover:gap-2">
                    Voir le detail <ArrowRight size={11} />
                  </span>
                </Link>
              ))}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="flex flex-col items-center gap-6 rounded-[2rem] border border-dashed border-neutral-300 bg-white py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
                <BriefcaseBusiness size={28} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-neutral-900">
                  {search || type !== 'all' ? 'Aucune opportunite trouvee' : 'Aucune opportunite publique pour le moment'}
                </h3>
                <p className="mt-2 max-w-sm text-sm text-neutral-500">
                  {search || type !== 'all' ? "Essayez d'autres filtres." : 'Les prochaines opportunites publiques SALAM seront affichees ici.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
