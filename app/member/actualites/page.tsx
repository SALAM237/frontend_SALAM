'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Newspaper, Search, Loader2, Tag, Eye, X, Plus } from 'lucide-react';
import { usePublicArticles, ARTICLE_CATEGORIES, useSubmitMemberArticle } from '@/lib/api/content';

export default function MemberActualitesPage() {
  const [search, setSearch] = useState('');
  const [cat, setCat]       = useState('all');
  const [selected, setSelected] = useState<any | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
        <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Actualités</h1>
        <p className="mt-0.5 text-sm text-neutral-500">
          {isLoading ? '…' : `${articles.length} article${articles.length !== 1 ? 's' : ''}`}
        </p>
        </div>
        <button
          type="button"
          onClick={() => setSubmitOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-emerald-600 px-4 text-xs font-black text-white transition-all hover:bg-emerald-700 active:scale-95"
        >
          <Plus size={14} /> Soumettre une actualite
        </button>
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
                <div className="min-w-0 flex-1">
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
                <Link
                  href={`/member/actualites/${n._id}`}
                  aria-label={`Voir ${n.title}`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-neutral-400 transition-all hover:bg-emerald-50 hover:text-emerald-700 active:scale-95"
                >
                  <Eye size={15} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
            <div className="flex items-start justify-between gap-4 border-b border-neutral-100 p-5">
              <div>
                <p className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700 ring-1 ring-emerald-100">
                  <Tag size={10} />
                  {ARTICLE_CATEGORIES.find(c => c.value === selected.data?.category)?.label ?? 'General'}
                </p>
                <h2 className="mt-3 text-lg font-black tracking-[-0.02em] text-neutral-900">{selected.title}</h2>
                <p className="mt-1 text-xs text-neutral-400">
                  {new Date(selected.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100">
                <X size={15} />
              </button>
            </div>
            <div className="max-h-[68vh] overflow-y-auto p-5">
              <p className="whitespace-pre-line text-sm leading-7 text-neutral-700">
                {selected.data?.content || selected.data?.excerpt || 'Contenu indisponible.'}
              </p>
            </div>
          </div>
        </div>
      )}
      {submitOpen && <SubmitArticleModal onClose={() => setSubmitOpen(false)} />}
    </div>
  );
}

function SubmitArticleModal({ onClose }: { onClose: () => void }) {
  const submit = useSubmitMemberArticle();
  const [form, setForm] = useState({ title: '', excerpt: '', content: '', category: 'general' });
  const canSubmit = form.title.trim() && form.content.trim();

  const send = () => {
    if (!canSubmit || submit.isPending) return;
    submit.mutate(form, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <div className="flex items-center justify-between border-b border-neutral-100 p-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">Soumission membre</p>
            <h2 className="text-lg font-black text-neutral-900">Proposer une actualite</h2>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100">
            <X size={15} />
          </button>
        </div>
        <div className="space-y-3 p-5">
          <input
            value={form.title}
            onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Titre"
            className="h-10 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10"
          />
          <select
            value={form.category}
            onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
            className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10"
          >
            {ARTICLE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <textarea
            value={form.excerpt}
            onChange={e => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
            rows={2}
            placeholder="Resume court"
            className="w-full resize-none rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10"
          />
          <textarea
            value={form.content}
            onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
            rows={6}
            placeholder="Contenu de l'actualite"
            className="w-full resize-none rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10"
          />
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
            Votre proposition sera en attente. Un administrateur devra la valider avant publication.
          </p>
        </div>
        <div className="flex gap-3 border-t border-neutral-100 p-5">
          <button onClick={onClose} className="h-10 flex-1 rounded-xl border border-neutral-200 text-sm font-bold text-neutral-600 hover:border-neutral-300">Annuler</button>
          <button
            onClick={send}
            disabled={!canSubmit || submit.isPending}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-black text-white transition-all hover:bg-emerald-700 disabled:opacity-50"
          >
            {submit.isPending && <Loader2 size={14} className="animate-spin" />}
            Soumettre
          </button>
        </div>
      </div>
    </div>
  );
}
