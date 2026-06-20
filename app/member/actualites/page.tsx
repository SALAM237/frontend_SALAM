'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Newspaper, Search, Loader2, Tag, Eye, X, Plus, PlusCircle, Trash2, ImagePlus } from 'lucide-react';
import { articleHref, usePublicArticles, ARTICLE_CATEGORIES, useSubmitMemberArticle, useUploadMemberArticleImage } from '@/lib/api/content';
import { DesignEditorField, type DesignStyle } from '@/components/admin/DesignEditorField';
import { articleImage } from '@/lib/article-image';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { RichText } from '@/components/ui/RichText';
import { trackEvent } from '@/lib/analytics';
import { useMarkMemberDashboardItemRead } from '@/lib/api/member-dashboard';

type ExtraBlock = { id: string; label: string; title: string; description: string };

export default function MemberActualitesPage() {
  const [search, setSearch] = useState('');
  const [cat, setCat]       = useState('all');
  const [selected, setSelected] = useState<any | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const markItemRead = useMarkMemberDashboardItemRead();

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
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-50 border border-blue-100 mt-0.5">
                  {articleImage(n) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={articleImage(n)} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Newspaper size={16} className="text-blue-600" />
                  )}
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
                  href={articleHref(n).replace('/actualites/', '/member/actualites/')}
                  onClick={() => {
                    trackEvent('news_click', {
                      article_id: n._id,
                      article_slug: n.slug,
                      article_title: n.title,
                      category: n.data?.category,
                      source: 'member_list',
                      action: 'view_button_click',
                    });
                    markItemRead.mutate({ type: 'news', id: n._id });
                  }}
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
                <h2 className="mt-3 text-lg font-black tracking-[-0.02em] text-neutral-900"><RichText value={selected.title} /></h2>
                <p className="mt-1 text-xs text-neutral-400">
                  {new Date(selected.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100">
                <X size={15} />
              </button>
            </div>
            <div className="max-h-[68vh] overflow-y-auto p-5">
              {articleImage(selected) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={articleImage(selected)} alt="" className="mb-4 max-h-72 w-full rounded-2xl object-cover" />
              )}
              <div className="whitespace-pre-wrap text-sm leading-7 text-neutral-700">
                <RichText value={selected.data?.content || selected.data?.excerpt || 'Contenu indisponible.'} />
              </div>
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
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'general',
    imageUrl: '',
    thumbnailUrl: '',
    mediumUrl: '',
    largeUrl: '',
    visibility: 'public' as 'public' | 'members',
  });
  const uploadImage = useUploadMemberArticleImage();
  const [activeDesign, setActiveDesign] = useState<string | null>(null);
  const [styles, setStyles] = useState<Record<string, DesignStyle>>({});
  const [extraBlocks, setExtraBlocks] = useState<ExtraBlock[]>([]);
  const canSubmit = form.title.trim() && form.content.trim();

  const send = () => {
    if (!canSubmit || submit.isPending) return;
    const extraContent = extraBlocks
      .filter(block => block.title.trim() || block.description.trim())
      .map(block => [block.label, block.title, block.description].filter(Boolean).join('\n'))
      .join('\n\n');
    submit.mutate({
      ...form,
      content: [form.content, extraContent].filter(Boolean).join('\n\n'),
    }, { onSuccess: onClose });
  };

  const handleImageFile = (file?: File | null) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setForm(prev => ({ ...prev, imageUrl: preview }));
    uploadImage.mutate(file, {
      onSuccess: res => {
        const img = res.data;
        setForm(prev => ({
          ...prev,
          imageUrl: img.mediumUrl || img.imageUrl,
          thumbnailUrl: img.thumbnailUrl || '',
          mediumUrl: img.mediumUrl || '',
          largeUrl: img.largeUrl || '',
        }));
        URL.revokeObjectURL(preview);
      },
      onError: () => URL.revokeObjectURL(preview),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <div className="flex items-center justify-between border-b border-neutral-100 p-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">Soumission membre</p>
            <h2 className="text-lg font-black text-neutral-900">Proposer une actualité</h2>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100">
            <X size={15} />
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5" onClick={() => setActiveDesign(null)}>
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Titre <span className="text-red-500">*</span></label>
            <DesignEditorField id="member-title" label="Titre" styles={styles} setStyles={setStyles} active={activeDesign} setActive={setActiveDesign}>
              {style => (
                <RichTextEditor
                  value={form.title}
                  onChange={value => setForm(prev => ({ ...prev, title: value }))}
                  placeholder="Titre"
                  className="h-10 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10"
                  style={style}
                  multiline={false}
                />
              )}
            </DesignEditorField>
          </div>
          <div className="grid gap-3 sm:grid-cols-[112px_1fr]">
            <div className="flex h-24 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
              {form.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.imageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <ImagePlus size={24} className="text-neutral-300" />
              )}
            </div>
            <div className="space-y-2">
              <input value={form.imageUrl} onChange={e => setForm(prev => ({ ...prev, imageUrl: e.target.value }))} placeholder="URL de l'image ou import ci-dessous" className="h-10 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-emerald-400" />
              <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-neutral-200 px-3 text-xs font-black text-neutral-600 transition hover:border-emerald-300 hover:text-emerald-700">
                {uploadImage.isPending ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />} Importer une image
                <input type="file" accept="image/*" className="hidden" onChange={e => handleImageFile(e.target.files?.[0])} />
              </label>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Catégorie</label>
            <select
              value={form.category}
              onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
              className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10"
            >
              {ARTICLE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Résumé</label>
            <DesignEditorField id="member-excerpt" label="Résumé" styles={styles} setStyles={setStyles} active={activeDesign} setActive={setActiveDesign}>
              {style => (
                <RichTextEditor
                  value={form.excerpt}
                  onChange={value => setForm(prev => ({ ...prev, excerpt: value }))}
                  placeholder="Résumé court"
                  className="min-h-[76px] w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10"
                  style={style}
                />
              )}
            </DesignEditorField>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Contenu <span className="text-red-500">*</span></label>
            <DesignEditorField id="member-content" label="Contenu" styles={styles} setStyles={setStyles} active={activeDesign} setActive={setActiveDesign}>
              {style => (
                <RichTextEditor
                  value={form.content}
                  onChange={value => setForm(prev => ({ ...prev, content: value }))}
                  placeholder="Contenu de l'actualité"
                  className="min-h-[160px] w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10"
                  style={style}
                />
              )}
            </DesignEditorField>
          </div>
          <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-700">Blocs libres</p>
                <p className="text-[11px] text-neutral-500">Ajoutez un bloc avec libellé, titre et description.</p>
              </div>
              <button type="button" onClick={() => setExtraBlocks(prev => [...prev, { id: `member-extra-${Date.now()}`, label: `Bloc ${prev.length + 1}`, title: '', description: '' }])}
                className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-emerald-600 px-3 text-xs font-black text-white">
                <PlusCircle size={13} /> Ajouter
              </button>
            </div>
            <div className="space-y-3">
              {extraBlocks.map(block => (
                <DesignEditorField key={block.id} id={block.id} label={block.label} styles={styles} setStyles={setStyles} active={activeDesign} setActive={setActiveDesign}>
                  {style => (
                    <div className="rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <input
                          value={block.label}
                          onChange={e => setExtraBlocks(prev => prev.map(b => b.id === block.id ? { ...b, label: e.target.value } : b))}
                          placeholder="Libellé du bloc"
                          className="h-8 flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-xs font-black uppercase tracking-[0.1em] text-neutral-500 outline-none focus:border-emerald-400"
                        />
                        <button type="button" onClick={() => setExtraBlocks(prev => prev.filter(b => b.id !== block.id))} className="flex h-8 w-8 items-center justify-center rounded-xl border border-red-100 text-red-400 hover:border-red-300 hover:text-red-600">
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">{block.label || 'Titre du bloc'}</label>
                        <RichTextEditor value={block.title} onChange={value => setExtraBlocks(prev => prev.map(b => b.id === block.id ? { ...b, title: value } : b))} placeholder="Titre" className="h-10 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-emerald-400" style={style} multiline={false} />
                      </div>
                      <div className="mt-3 space-y-1.5">
                        <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Description</label>
                        <RichTextEditor value={block.description} onChange={value => setExtraBlocks(prev => prev.map(b => b.id === block.id ? { ...b, description: value } : b))} placeholder="Description détaillée" className="min-h-[112px] w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-emerald-400" style={style} />
                      </div>
                    </div>
                  )}
                </DesignEditorField>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Visibilité demandée</label>
            <div className="flex gap-3">
              {([{ v: 'public', l: 'Public' }, { v: 'members', l: 'Membres' }] as const).map(({ v, l }) => (
                <button key={v} type="button" onClick={() => setForm(prev => ({ ...prev, visibility: v }))}
                  className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-black transition ${form.visibility === v ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
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
