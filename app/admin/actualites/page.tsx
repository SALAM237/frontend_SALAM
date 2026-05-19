'use client';

import { useState } from 'react';
import { Newspaper, Plus, X, Loader2, Trash2 } from 'lucide-react';
import { useArticles, useCreateArticle, useDeleteArticle, ARTICLE_CATEGORIES, type ArticleDoc } from '@/lib/api/content';

/* ─── Create modal ────────────────────────────────────────── */
function CreateArticleModal({ onClose }: { onClose: () => void }) {
  const [title,    setTitle]    = useState('');
  const [excerpt,  setExcerpt]  = useState('');
  const [content,  setContent]  = useState('');
  const [category, setCategory] = useState('general');
  const [status,   setStatus]   = useState('draft');
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const create = useCreateArticle();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Titre requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    create.mutate(
      { title, excerpt: excerpt || undefined, content: content || undefined, category, status },
      { onSuccess: () => onClose() },
    );
  };

  const inp = (err?: string) =>
    `w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition focus:ring-2 placeholder:text-neutral-300 ${err ? 'border-red-300 focus:ring-red-500/15' : 'border-neutral-200 focus:border-emerald-500 focus:ring-emerald-500/15'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200">
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 shrink-0">
          <div>
            <h3 className="font-black text-neutral-900">Nouvel article</h3>
            <p className="text-xs text-neutral-400 mt-0.5">Rédiger une actualité SALAM</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100"><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Titre <span className="text-red-500">*</span></label>
            <input value={title} onChange={e => { setTitle(e.target.value); setErrors(p => ({...p, title: ''})); }}
              placeholder="Ex: Forum des opportunités 2025" className={inp(errors.title)} />
            {errors.title && <p className="text-[11px] text-red-500">{errors.title}</p>}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Catégorie</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className={inp()}>
              {ARTICLE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          {/* Excerpt */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
              Résumé <span className="font-normal normal-case text-neutral-300">(optionnel)</span>
            </label>
            <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)}
              rows={2} placeholder="Courte description…"
              className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none placeholder:text-neutral-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" />
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
              Contenu <span className="font-normal normal-case text-neutral-300">(optionnel)</span>
            </label>
            <textarea value={content} onChange={e => setContent(e.target.value)}
              rows={6} placeholder="Corps de l'article…"
              className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none placeholder:text-neutral-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" />
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Statut</label>
            <div className="flex gap-3">
              {[{ v: 'draft', l: 'Brouillon' }, { v: 'published', l: 'Publier maintenant' }].map(({ v, l }) => (
                <button key={v} type="button" onClick={() => setStatus(v)}
                  className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-black transition ${status === v ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t border-neutral-100 px-6 py-4 shrink-0">
          <button onClick={onClose} className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-600 transition hover:border-neutral-300">Annuler</button>
          <button onClick={handleSubmit} disabled={create.isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-60">
            {create.isPending ? <Loader2 size={14} className="animate-spin" /> : <Newspaper size={14} />}
            Créer l&apos;article
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function AdminActualitesPage() {
  const [showCreate, setShowCreate] = useState(false);
  const { data, isLoading } = useArticles();
  const deleteArticle = useDeleteArticle();

  const articles = data?.data ?? [];
  const published = articles.filter((a: ArticleDoc) => a.status === 'published').length;
  const drafts    = articles.filter((a: ArticleDoc) => a.status === 'draft').length;

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Supprimer "${title}" ?`)) return;
    deleteArticle.mutate(id);
  };

  return (
    <div className="w-full space-y-5">

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black tracking-[-0.03em] text-neutral-900 sm:text-2xl">Actualités</h1>
          <p className="mt-0.5 text-sm text-neutral-500">{isLoading ? '…' : `${articles.length} article${articles.length > 1 ? 's' : ''}`}</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-4 text-sm font-black text-white hover:bg-emerald-700 transition-colors shadow-sm">
          <Plus size={14} />
          <span className="hidden sm:inline">Nouvel article</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-neutral-100 bg-white p-4 text-center shadow-sm">
          <p className="text-3xl font-black leading-none text-emerald-700">{isLoading ? '…' : published}</p>
          <p className="mt-1 text-xs font-semibold text-neutral-500">Publiés</p>
        </div>
        <div className="rounded-2xl border border-neutral-100 bg-white p-4 text-center shadow-sm">
          <p className="text-3xl font-black leading-none text-yellow-700">{isLoading ? '…' : drafts}</p>
          <p className="mt-1 text-xs font-semibold text-neutral-500">Brouillons</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
        {isLoading && (
          <div className="flex flex-col items-center py-14 text-center">
            <Loader2 size={24} className="animate-spin text-neutral-300 mb-3" />
            <p className="text-sm text-neutral-400">Chargement…</p>
          </div>
        )}

        {!isLoading && articles.length === 0 && (
          <div className="flex flex-col items-center px-5 py-14 text-center">
            <Newspaper size={32} className="mb-3 text-neutral-200" />
            <p className="text-sm font-semibold text-neutral-400">Aucun article pour le moment.</p>
            <p className="mt-1 text-xs text-neutral-300">Cliquez sur &quot;Nouvel article&quot; pour commencer.</p>
          </div>
        )}

        {!isLoading && articles.length > 0 && (
          <div className="divide-y divide-neutral-50">
            {articles.map((a: ArticleDoc) => {
              const catLabel = ARTICLE_CATEGORIES.find(c => c.value === a.data?.category)?.label ?? 'Général';
              return (
                <div key={a._id} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-neutral-50/60">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 border border-blue-100">
                    <Newspaper size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-black text-sm text-neutral-900 truncate">{a.title}</p>
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-black ${a.status === 'published' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-yellow-200 bg-yellow-50 text-yellow-700'}`}>
                        {a.status === 'published' ? 'Publié' : 'Brouillon'}
                      </span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 font-semibold text-neutral-600">{catLabel}</span>
                      {a.data?.excerpt && <span className="truncate max-w-xs">{a.data.excerpt}</span>}
                    </div>
                    <p className="mt-0.5 text-[11px] text-neutral-300">
                      {new Date(a.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <button title="Supprimer" onClick={() => handleDelete(a._id, a.title)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-100 text-red-300 transition hover:border-red-300 hover:text-red-600">
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showCreate && <CreateArticleModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
