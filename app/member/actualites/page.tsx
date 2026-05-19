'use client';

import { useState, useMemo } from 'react';
import { Newspaper, Search, Loader2, Tag } from 'lucide-react';
import { usePublicArticles, ARTICLE_CATEGORIES } from '@/lib/api/content';

export default function MemberActualitesPage() {
  const [search, setSearch] = useState('');
  const [cat, setCat]       = useState('all');

  const { data, isLoading } = usePublicArticles();
  const articles = data?.data ?? [];

  const filtered = useMemo(() =>
    articles.filter((n: any) =>
      (cat === 'all' || n.data?.category === cat) &&
      n.title.toLowerCase().includes(search.toLowerCase())
    ),
  [articles, cat, search]);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Actualités</h1>
        <p className="mt-0.5 text-sm text-neutral-500">
          {isLoading ? '…' : `${articles.length} article${articles.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher…"
            className="h-10 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-9 pr-4 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[{ value: 'all', label: 'Tous' }, ...ARTICLE_CATEGORIES].map(c => (
            <button key={c.value} onClick={() => setCat(c.value)}
              className={`h-7 rounded-full px-3 text-[11px] font-bold transition-all ${cat === c.value ? 'bg-emerald-600 text-white' : 'border border-neutral-200 text-neutral-600 hover:border-emerald-300'}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
        {isLoading && (
          <div className="flex flex-col items-center py-14">
            <Loader2 size={24} className="animate-spin text-neutral-300 mb-3" />
            <p className="text-sm text-neutral-400">Chargement…</p>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center px-5 py-14 text-center">
            <Newspaper size={36} className="mb-3 text-neutral-200" />
            <p className="text-sm font-semibold text-neutral-400">
              {search || cat !== 'all' ? 'Aucun article correspondant.' : 'Aucune actualité publiée pour le moment.'}
            </p>
            {(search || cat !== 'all') && (
              <button onClick={() => { setSearch(''); setCat('all'); }}
                className="mt-3 text-xs font-semibold text-emerald-600 hover:underline">
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="divide-y divide-neutral-50">
            {filtered.map((n: any) => (
              <div key={n._id} className="flex items-start gap-4 px-5 py-4 hover:bg-neutral-50/60 transition-colors">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 mt-0.5">
                  <Newspaper size={16} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-black text-sm text-neutral-900">{n.title}</p>
                    <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-black text-emerald-700">
                      <Tag size={8} />
                      {ARTICLE_CATEGORIES.find(c => c.value === n.data?.category)?.label ?? 'Général'}
                    </span>
                  </div>
                  {n.data?.excerpt && <p className="mt-0.5 text-xs text-neutral-500 line-clamp-2">{n.data.excerpt}</p>}
                  <p className="mt-0.5 text-[11px] text-neutral-300">
                    {new Date(n.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
