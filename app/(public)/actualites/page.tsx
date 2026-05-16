'use client';

import { useState } from 'react';
import { Newspaper, ArrowRight, Search, Tag } from 'lucide-react';
import Link from 'next/link';
import { PageHero } from '@/components/public/PageHero';

const CATS = [
  { id: 'all', label: 'Toutes' },
  { id: 'evenement', label: 'Événements' },
  { id: 'annonce', label: 'Annonces' },
  { id: 'partenariat', label: 'Partenariats' },
  { id: 'communaute', label: 'Communauté' },
];

const NEWS: { id: string; slug: string; title: string; category: string; date: string; excerpt: string }[] = [];

export default function ActualitesPage() {
  const [cat, setCat] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = NEWS.filter(n =>
    (cat === 'all' || n.category === cat) &&
    n.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main>
      <PageHero
        badge="Actualités SALAM"
        title="Actualités"
        accentWord="Nos"
        accentPosition="start"
        subtitle="Retrouvez les dernières nouvelles, annonces et événements de l'association SALAM Cameroun."
        breadcrumbs={[{ label: 'Actualités' }]}
      />

      <section className="bg-[#fffdf8] px-5 py-[clamp(3rem,6vw,5rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">

          <div className="mb-8 flex flex-col gap-4">
            <div className="relative max-w-md">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher une actualité..."
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

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-6 rounded-[2rem] border border-dashed border-neutral-300 bg-white py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
                <Newspaper size={28} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-neutral-900">
                  {search || cat !== 'all' ? 'Aucun article trouvé' : 'Aucune actualité publiée pour l\'instant'}
                </h3>
                <p className="mt-2 max-w-sm text-sm text-neutral-500">
                  {search || cat !== 'all'
                    ? 'Essayez d\'autres termes de recherche ou catégories.'
                    : 'Les prochaines actualités SALAM seront publiées ici. Restez connectés !'
                  }
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {(search || cat !== 'all') ? (
                  <button onClick={() => { setSearch(''); setCat('all'); }} className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-700 hover:border-emerald-400 hover:text-emerald-700 transition-all">
                    Réinitialiser
                  </button>
                ) : (
                  <>
                    <Link href="/contact" className="inline-flex h-10 items-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-black text-white transition-all hover:bg-emerald-700">
                      Nous contacter
                    </Link>
                    <Link href="/demo" className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-300 px-5 text-sm font-semibold text-neutral-700 hover:border-emerald-400 hover:text-emerald-700 transition-all">
                      Voir la démo <ArrowRight size={13} />
                    </Link>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(n => (
                <Link key={n.id} href={`/actualites/${n.slug}`} className="group flex flex-col gap-3 rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                  <div className="aspect-[16/9] rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50" />
                  <span className="inline-flex w-fit items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                    <Tag size={10} />{n.category}
                  </span>
                  <h3 className="font-black text-neutral-900 group-hover:text-emerald-700 transition-colors line-clamp-2">{n.title}</h3>
                  <p className="text-xs text-neutral-500 line-clamp-2">{n.excerpt}</p>
                  <span className="text-xs text-neutral-400">{n.date}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
