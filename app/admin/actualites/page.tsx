'use client';

import { useRef, useState } from 'react';
import {
  ImagePlus, Newspaper, Plus, X, Loader2, Trash2, Edit3,
  Palette, GripVertical, Bold, Italic, PlusCircle,
} from 'lucide-react';
import {
  useArticles, useCreateArticle, useUpdateArticle, useDeleteArticle,
  ARTICLE_CATEGORIES, type ArticleDoc,
} from '@/lib/api/content';
import { applyInlineTextStyle, captureTextSelection, type StoredTextSelection } from '@/lib/rich-text';
import { articleImage } from '@/lib/article-image';

type DesignStyle = {
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  color: string;
  bg: string;
  border: string;
  radius: number;
};

type ExtraBlock = { id: string; label: string; title: string; description: string };

const defaultDesign: DesignStyle = {
  x: 0,
  y: 0,
  fontSize: 14,
  fontFamily: 'Inter, system-ui, sans-serif',
  bold: false,
  italic: false,
  color: '#111827',
  bg: '#ffffff',
  border: '#e5e7eb',
  radius: 12,
};

function DesignPalette({ label, style, onChange, onInlineStyle, onClose }: {
  label: string;
  style: DesignStyle;
  onChange: (patch: Partial<DesignStyle>) => void;
  onInlineStyle: (patch: Partial<DesignStyle>) => boolean;
  onClose: () => void;
}) {
  const apply = (patch: Partial<DesignStyle>) => {
    if (!onInlineStyle(patch)) onChange(patch);
  };
  return (
    <div className="absolute right-0 top-10 z-40 w-[260px] rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xl" onClick={e => e.stopPropagation()}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Palette size={15} /></span>
          <div>
            <p className="text-sm font-black text-neutral-900">Design</p>
            <p className="text-[11px] font-semibold text-neutral-400">{label}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100"><X size={14} /></button>
      </div>
      <div className="space-y-3">
        <label className="block">
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-neutral-400">Police</span>
          <select value={style.fontFamily} onChange={e => apply({ fontFamily: e.target.value })} className="mt-1 h-9 w-full rounded-lg border border-neutral-200 px-2 text-xs outline-none">
            <option value="Inter, system-ui, sans-serif">Inter</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="'Times New Roman', serif">Times</option>
            <option value="'Courier New', monospace">Mono</option>
          </select>
        </label>
        <label className="block">
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-neutral-400">Taille : {style.fontSize}px</span>
          <input type="range" min="11" max="32" value={style.fontSize} onChange={e => apply({ fontSize: Number(e.target.value) })} className="mt-2 w-full accent-emerald-700" />
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button type="button" onClick={() => apply({ bold: !style.bold })} className={`h-9 rounded-lg border ${style.bold ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-neutral-200 text-neutral-500'}`}><Bold size={14} className="mx-auto" /></button>
          <button type="button" onClick={() => apply({ italic: !style.italic })} className={`h-9 rounded-lg border ${style.italic ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-neutral-200 text-neutral-500'}`}><Italic size={14} className="mx-auto" /></button>
          <div className="h-9 rounded-lg border border-neutral-200 p-1"><input aria-label="Couleur du texte" type="color" value={style.color} onChange={e => apply({ color: e.target.value })} className="h-full w-full" /></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="block"><span className="text-[10px] font-black uppercase text-neutral-400">Fond</span><input type="color" value={style.bg} onChange={e => onChange({ bg: e.target.value })} className="mt-1 h-8 w-full rounded-lg" /></label>
          <label className="block"><span className="text-[10px] font-black uppercase text-neutral-400">Bordure</span><input type="color" value={style.border} onChange={e => onChange({ border: e.target.value })} className="mt-1 h-8 w-full rounded-lg" /></label>
        </div>
        <label className="block">
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-neutral-400">Arrondi : {style.radius}px</span>
          <input type="range" min="0" max="30" value={style.radius} onChange={e => onChange({ radius: Number(e.target.value) })} className="mt-2 w-full accent-emerald-700" />
        </label>
      </div>
    </div>
  );
}

function DesignField({ id, label, styles, setStyles, active, setActive, children }: {
  id: string;
  label: string;
  styles: Record<string, DesignStyle>;
  setStyles: React.Dispatch<React.SetStateAction<Record<string, DesignStyle>>>;
  active: string | null;
  setActive: (id: string | null) => void;
  children: (style: React.CSSProperties) => React.ReactNode;
}) {
  const style = styles[id] ?? defaultDesign;
  const [drag, setDrag] = useState<{ x: number; y: number; sx: number; sy: number } | null>(null);
  const selectionRef = useRef<StoredTextSelection | null>(null);
  const update = (patch: Partial<DesignStyle>) => setStyles(prev => ({ ...prev, [id]: { ...(prev[id] ?? defaultDesign), ...patch } }));
  const rememberSelection = (target: EventTarget | null) => {
    const selection = captureTextSelection(target);
    if (selection) selectionRef.current = selection;
  };
  const inlineStyle = (patch: Partial<DesignStyle>) => applyInlineTextStyle(selectionRef.current, {
    bold: patch.bold,
    italic: patch.italic,
    color: patch.color,
    fontSize: patch.fontSize,
    fontFamily: patch.fontFamily,
  });
  const fieldStyle: React.CSSProperties = {
    fontSize: style.fontSize,
    fontFamily: style.fontFamily,
    fontWeight: style.bold ? 800 : 400,
    fontStyle: style.italic ? 'italic' : 'normal',
    color: style.color,
    background: style.bg,
    borderColor: style.border,
    borderRadius: style.radius,
  };

  return (
    <div
      className={`group relative ${active === id ? 'z-30' : ''}`}
      style={{ transform: `translate(${style.x}px, ${style.y}px)` }}
      onClick={e => { e.stopPropagation(); setActive(id); }}
      onPointerMove={event => {
        if (!drag) return;
        update({ x: drag.x + event.clientX - drag.sx, y: drag.y + event.clientY - drag.sy });
      }}
      onPointerUp={() => setDrag(null)}
      onPointerLeave={() => setDrag(null)}
      onMouseUpCapture={e => rememberSelection(e.target)}
      onKeyUpCapture={e => rememberSelection(e.target)}
      onSelectCapture={e => rememberSelection(e.target)}
    >
      <div className="absolute -top-8 left-2 z-40 hidden items-center gap-1 rounded-xl border border-neutral-200 bg-white/95 px-1.5 py-1 shadow-lg group-hover:flex">
        <button type="button" onPointerDown={e => { e.preventDefault(); e.stopPropagation(); setDrag({ x: style.x, y: style.y, sx: e.clientX, sy: e.clientY }); }} className="flex h-6 w-6 cursor-grab items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100" title="Déplacer"><GripVertical size={13} /></button>
        <button type="button" onClick={e => { e.stopPropagation(); setActive(active === id ? null : id); }} className="flex h-6 w-6 items-center justify-center rounded-lg text-emerald-700 hover:bg-emerald-50" title="Design"><Palette size={13} /></button>
        <span className="px-1 text-[9px] font-black uppercase tracking-[0.08em] text-neutral-400">{label}</span>
      </div>
      {children(fieldStyle)}
      {active === id && <DesignPalette label={label} style={style} onChange={update} onInlineStyle={inlineStyle} onClose={() => setActive(null)} />}
    </div>
  );
}

/* ─── Article Form (shared create/edit) ──────────────────── */
function ArticleForm({
  initial, onSubmit, onClose, isPending, title,
}: {
  initial?: ArticleDoc;
  onSubmit: (data: any) => void;
  onClose: () => void;
  isPending: boolean;
  title: string;
}) {
  const [f, setF] = useState({
    title:    initial?.title          ?? '',
    excerpt:  initial?.data?.excerpt  ?? '',
    content:  initial?.data?.content  ?? '',
    category: initial?.data?.category ?? 'general',
    imageUrl: articleImage(initial) || '',
    visibility: (initial?.visibility ?? initial?.data?.visibility ?? 'public') as 'public' | 'members',
    status:   initial?.status         ?? 'draft',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeDesign, setActiveDesign] = useState<string | null>(null);
  const [styles, setStyles] = useState<Record<string, DesignStyle>>({});
  const [extraBlocks, setExtraBlocks] = useState<ExtraBlock[]>([]);

  const upd = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF(p => ({ ...p, [k]: e.target.value }));

  const handleImageFile = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setF(p => ({ ...p, imageUrl: String(reader.result ?? '') }));
    reader.readAsDataURL(file);
  };

  const inp = (err?: string) =>
    `w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition focus:ring-2 placeholder:text-neutral-300 ${err ? 'border-red-300 focus:ring-red-500/15' : 'border-neutral-200 focus:border-emerald-500 focus:ring-emerald-500/15'}`;

  const handleSubmit = () => {
    if (!f.title.trim()) { setErrors({ title: 'Titre requis' }); return; }
    setErrors({});
    const extraContent = extraBlocks
      .filter(block => block.title.trim() || block.description.trim())
      .map(block => [block.label, block.title, block.description].filter(Boolean).join('\n'))
      .join('\n\n');
    onSubmit({
      title: f.title,
      visibility: f.visibility,
      status: f.status,
      data: {
        excerpt: f.excerpt || undefined,
        content: [f.content, extraContent].filter(Boolean).join('\n\n') || undefined,
        category: f.category,
        imageUrl: f.imageUrl || undefined,
        visibility: f.visibility,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200">
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 shrink-0">
          <h3 className="font-black text-neutral-900">{title}</h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100"><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4" onClick={() => setActiveDesign(null)}>
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Titre <span className="text-red-500">*</span></label>
            <DesignField id="title" label="Titre" styles={styles} setStyles={setStyles} active={activeDesign} setActive={setActiveDesign}>
              {style => <input value={f.title} onChange={upd('title')} className={inp(errors.title)} style={style} />}
            </DesignField>
            {errors.title && <p className="text-[11px] text-red-500">{errors.title}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Catégorie</label>
            <select value={f.category} onChange={e => setF(p => ({ ...p, category: e.target.value }))} className={inp()}>
              {ARTICLE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Résumé</label>
            <div className="mb-4 grid gap-3 sm:grid-cols-[112px_1fr]">
              <div className="flex h-24 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
                {f.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ImagePlus size={24} className="text-neutral-300" />
                )}
              </div>
              <div className="space-y-2">
                <input value={f.imageUrl} onChange={upd('imageUrl')} placeholder="URL de l'image ou import ci-dessous" className={inp()} />
                <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-neutral-200 px-3 text-xs font-black text-neutral-600 transition hover:border-emerald-300 hover:text-emerald-700">
                  <ImagePlus size={13} /> Importer une image
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleImageFile(e.target.files?.[0])} />
                </label>
              </div>
            </div>
            <DesignField id="excerpt" label="Résumé" styles={styles} setStyles={setStyles} active={activeDesign} setActive={setActiveDesign}>
              {style => (
                <textarea value={f.excerpt} onChange={upd('excerpt')} rows={2} placeholder="Courte description..."
                  className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none placeholder:text-neutral-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" style={style} />
              )}
            </DesignField>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Contenu</label>
            <DesignField id="content" label="Contenu" styles={styles} setStyles={setStyles} active={activeDesign} setActive={setActiveDesign}>
              {style => (
                <textarea value={f.content} onChange={upd('content')} rows={6} placeholder="Corps de l'article..."
                  className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none placeholder:text-neutral-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" style={style} />
              )}
            </DesignField>
          </div>
          <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-700">Blocs libres</p>
                <p className="text-[11px] text-neutral-500">Ajoutez des titres, paragraphes ou messages à déplacer et styliser.</p>
              </div>
              <button type="button" onClick={() => setExtraBlocks(prev => [...prev, { id: `extra-${Date.now()}`, label: `Bloc ${prev.length + 1}`, title: '', description: '' }])}
                className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-emerald-600 px-3 text-xs font-black text-white">
                <PlusCircle size={13} /> Ajouter
              </button>
            </div>
            <div className="space-y-3">
              {extraBlocks.map(block => (
                <DesignField key={block.id} id={block.id} label={block.label} styles={styles} setStyles={setStyles} active={activeDesign} setActive={setActiveDesign}>
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
                        <input value={block.title} onChange={e => setExtraBlocks(prev => prev.map(b => b.id === block.id ? { ...b, title: e.target.value } : b))} placeholder="Titre" className={inp()} style={style} />
                      </div>
                      <div className="mt-3 space-y-1.5">
                        <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Description</label>
                        <textarea value={block.description} onChange={e => setExtraBlocks(prev => prev.map(b => b.id === block.id ? { ...b, description: e.target.value } : b))} rows={4} placeholder="Description détaillée" className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" style={style} />
                      </div>
                    </div>
                  )}
                </DesignField>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Statut</label>
            <div className="flex gap-3">
              {([{ v: 'draft', l: 'Brouillon' }, { v: 'published', l: 'Publier' }] as const).map(({ v, l }) => (
                <button key={v} type="button" onClick={() => setF(p => ({ ...p, status: v }))}
                  className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-black transition ${f.status === v ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Visibilité</label>
            <div className="flex gap-3">
              {([{ v: 'public', l: 'Public' }, { v: 'members', l: 'Membres' }] as const).map(({ v, l }) => (
                <button key={v} type="button" onClick={() => setF(p => ({ ...p, visibility: v }))}
                  className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-black transition ${f.visibility === v ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 border-t border-neutral-100 px-6 py-4 shrink-0">
          <button onClick={onClose} className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-600 hover:border-neutral-300 transition">Annuler</button>
          <button onClick={handleSubmit} disabled={isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-60 transition">
            {isPending ? <Loader2 size={14} className="animate-spin" /> : <Newspaper size={14} />}
            {initial ? 'Mettre à jour' : 'Créer l\'article'}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditArticleModal({ article, onClose }: { article: ArticleDoc; onClose: () => void }) {
  const update = useUpdateArticle(article._id);
  return (
    <ArticleForm
      title="Modifier l'article"
      initial={article}
      isPending={update.isPending}
      onClose={onClose}
      onSubmit={data => update.mutate(data, { onSuccess: onClose })}
    />
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function AdminActualitesPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<ArticleDoc | null>(null);

  const { data, isLoading } = useArticles();
  const createArticle = useCreateArticle();
  const deleteArticle = useDeleteArticle();

  const articles  = data?.data ?? [];
  const published = articles.filter((a: ArticleDoc) => a.status === 'published').length;
  const drafts    = articles.filter((a: ArticleDoc) => a.status === 'draft').length;

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Supprimer "${title}" ??`)) return;
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
          <Plus size={14} /><span className="hidden sm:inline">Nouvel article</span>
        </button>
      </div>

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
          </div>
        )}
        {!isLoading && articles.length > 0 && (
          <div className="divide-y divide-neutral-50">
            {articles.map((a: ArticleDoc) => {
              const catLabel = ARTICLE_CATEGORIES.find(c => c.value === a.data?.category)?.label ?? 'Général';
              return (
                <div key={a._id} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-neutral-50/60">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-50 border border-blue-100">
                    {articleImage(a) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={articleImage(a)} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Newspaper size={16} className="text-blue-600" />
                    )}
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
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button title="Modifier" onClick={() => setEditTarget(a)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 transition hover:border-emerald-300 hover:text-emerald-700">
                      <Edit3 size={12} />
                    </button>
                    <button title="Supprimer" onClick={() => handleDelete(a._id, a.title)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-100 text-red-300 transition hover:border-red-300 hover:text-red-600">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showCreate && (
        <ArticleForm
          title="Nouvel article"
          isPending={createArticle.isPending}
          onClose={() => setShowCreate(false)}
          onSubmit={data => createArticle.mutate(data, { onSuccess: () => setShowCreate(false) })}
        />
      )}
      {editTarget && <EditArticleModal article={editTarget} onClose={() => setEditTarget(null)} />}
    </div>
  );
}
