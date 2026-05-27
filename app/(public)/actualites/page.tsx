'use client';

import { useState, useMemo } from 'react';
import { Newspaper, ArrowRight, Search, Tag, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { PageHero } from '@/components/public/PageHero';
import { usePublicArticles, ARTICLE_CATEGORIES } from '@/lib/api/content';
import { RichText } from '@/components/ui/RichText';
import { articleImage } from '@/lib/article-image';

const CATS = [
  { id: 'all', label: 'Toutes' },
  ...ARTICLE_CATEGORIES.map(c => ({ id: c.value, label: c.label })),
];

export default function ActualitesPage() {
  const [cat, setCat]       = useState('all');
  const [search, setSearch] = useState('');

  const { data, isLoading } = usePublicArticles();
  const articles = data?.data ?? [];

  const filtered = useMemo(() =>
    articles.filter((n: any) =>
      (cat === 'all' || n.data?.category === cat) &&
      n.title.toLowerCase().includes(search.toLowerCase())
    ),
  [articles, cat, search]);

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
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher une actualité..."
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
              <p className="text-sm text-neutral-500">Chargement des actualités…</p>
            </div>
          )}

          {!isLoading && filtered.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((n: any) => {
                const image = articleImage(n);
                return (
                <Link key={n._id} href={`/actualites/${n._id}`} className="group flex flex-col gap-3 rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md">
                  <div className="aspect-[16/9] overflow-hidden rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50">
                    {image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image} alt={n.title} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <span className="inline-flex w-fit items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                    <Tag size={10} />{ARTICLE_CATEGORIES.find(c => c.value === n.data?.category)?.label ?? n.data?.category ?? 'Général'}
                  </span>
                  <h3 className="font-black text-neutral-900 line-clamp-2 group-hover:text-emerald-700 transition-colors"><RichText value={n.title} /></h3>
                  {n.data?.excerpt && <p className="text-xs text-neutral-500 line-clamp-2"><RichText value={n.data.excerpt} /></p>}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-400">
                      {new Date(n.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:gap-2 transition-all">
                      Lire <ArrowRight size={11} />
                    </span>
                  </div>
                </Link>
              );})}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="flex flex-col items-center gap-6 rounded-[2rem] border border-dashed border-neutral-300 bg-white py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
                <Newspaper size={28} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-neutral-900">
                  {search || cat !== 'all' ? 'Aucun article trouvé' : 'Aucune actualité publiée pour l\'instant'}
                </h3>
                <p className="mt-2 max-w-sm text-sm text-neutral-500">
                  {search || cat !== 'all' ? 'Essayez d\'autres termes de recherche.' : 'Les prochaines actualités SALAM seront publiées ici.'}
                </p>
              </div>
              {(search || cat !== 'all') && (
                <button onClick={() => { setSearch(''); setCat('all'); }}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-700 hover:border-emerald-400 hover:text-emerald-700 transition-all">
                  Réinitialiser
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
