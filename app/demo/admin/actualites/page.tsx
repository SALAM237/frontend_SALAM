'use client';

import { useState } from 'react';
import { Edit3, Eye, ImagePlus, Newspaper, Plus, Trash2 } from 'lucide-react';
import { DemoPortalShell } from '../../_components/DemoShell';
import { demoNews } from '@/data/demo/demo-news';
import { DemoContentEditorModal, type DemoEditorPayload } from '@/components/demo/DemoContentEditorModal';
import { RichText } from '@/components/ui/RichText';

type DemoArticle = {
  _id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  status: 'draft' | 'published';
  visibility: 'public' | 'members';
  createdAt: string;
};

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'communique', label: 'Communique' },
  { value: 'evenement', label: 'Evenement' },
  { value: 'vie_asso', label: 'Vie associative' },
];

function toArticle(item: typeof demoNews[number], index: number): DemoArticle {
  return {
    _id: item.id,
    slug: item.slug,
    title: item.title,
    category: item.category,
    excerpt: item.excerpt,
    content: `<strong>${item.title}</strong><br><br>${item.excerpt}<br><br><span style="color:#047857">Cette actualite demo utilise le nouvel editeur enrichi SALAM.</span>`,
    imageUrl: index === 0 ? '/images/gallery/image_parallax_SALAM.png' : '/images/gallery/image_parallax_SALAM_1200.webp',
    status: 'published',
    visibility: 'public',
    createdAt: '2026-05-18T12:00:00.000Z',
  };
}

function articleFromPayload(payload: DemoEditorPayload, base?: DemoArticle): DemoArticle {
  const title = payload.title || 'Article demo';
  return {
    _id: base?._id ?? `demo-news-${Date.now()}`,
    slug: base?.slug ?? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    title,
    category: payload.category ?? 'general',
    excerpt: payload.excerpt ?? '',
    content: payload.content ?? '',
    imageUrl: payload.imageUrl || '/images/gallery/image_parallax_SALAM.png',
    status: payload.status === 'published' ? 'published' : 'draft',
    visibility: payload.visibility === 'members' ? 'members' : 'public',
    createdAt: base?.createdAt ?? new Date().toISOString(),
  };
}

export default function DemoAdminNewsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<DemoArticle | null>(null);
  const [preview, setPreview] = useState<DemoArticle | null>(null);
  const [articles, setArticles] = useState<DemoArticle[]>(() => demoNews.map(toArticle));

  const upsert = (payload: DemoEditorPayload, base?: DemoArticle) => {
    const next = articleFromPayload(payload, base);
    setArticles(prev => prev.some(item => item._id === next._id) ? prev.map(item => item._id === next._id ? next : item) : [next, ...prev]);
  };

  return (
    <DemoPortalShell type="admin" title="Actualites">
      <div className="w-full space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-black tracking-[-0.03em] text-neutral-900 sm:text-2xl">Actualites</h1>
            <p className="mt-0.5 text-sm text-neutral-500">Edition demo enrichie, image, visibilite et publication fictive.</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-4 text-sm font-black text-white shadow-sm transition-colors hover:bg-emerald-700">
            <Plus size={14} /><span className="hidden sm:inline">Nouvel article</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-neutral-100 bg-white p-4 text-center shadow-sm"><p className="text-3xl font-black leading-none text-emerald-700">{articles.filter(a => a.status === 'published').length}</p><p className="mt-1 text-xs font-semibold text-neutral-500">Publies</p></div>
          <div className="rounded-2xl border border-neutral-100 bg-white p-4 text-center shadow-sm"><p className="text-3xl font-black leading-none text-yellow-700">{articles.filter(a => a.status === 'draft').length}</p><p className="mt-1 text-xs font-semibold text-neutral-500">Brouillons</p></div>
          <div className="rounded-2xl border border-neutral-100 bg-white p-4 text-center shadow-sm"><p className="text-3xl font-black leading-none text-blue-700">{articles.filter(a => a.visibility === 'public').length}</p><p className="mt-1 text-xs font-semibold text-neutral-500">Publics</p></div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {articles.map(article => (
            <article key={article._id} className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
              <div className="grid gap-0 sm:grid-cols-[150px_1fr]">
                <div className="relative min-h-36 bg-neutral-100">
                  {article.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={article.imageUrl} alt="" className="h-full min-h-36 w-full object-cover" />
                  ) : (
                    <div className="grid h-full min-h-36 place-items-center text-neutral-300"><ImagePlus size={26} /></div>
                  )}
                </div>
                <div className="flex min-w-0 flex-col p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${article.status === 'published' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-yellow-200 bg-yellow-50 text-yellow-700'}`}>{article.status === 'published' ? 'Publie' : 'Brouillon'}</span>
                    <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-bold text-neutral-600">{article.visibility === 'public' ? 'Public' : 'Membres'}</span>
                  </div>
                  <h2 className="line-clamp-2 text-sm font-black text-neutral-900"><RichText value={article.title} /></h2>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-500"><RichText value={article.excerpt} /></p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button onClick={() => setPreview(article)} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-neutral-200 px-3 text-xs font-bold text-neutral-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"><Eye size={12} /> Voir</button>
                    <button onClick={() => setEditTarget(article)} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-neutral-200 px-3 text-xs font-bold text-neutral-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"><Edit3 size={12} /> Modifier</button>
                    <button onClick={() => setArticles(prev => prev.filter(item => item._id !== article._id))} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-100 px-3 text-xs font-bold text-red-500 hover:border-red-300"><Trash2 size={12} /> Supprimer</button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {showCreate && (
          <DemoContentEditorModal
            title="Nouvel article"
            categories={CATEGORIES}
            onClose={() => setShowCreate(false)}
            onSubmit={payload => upsert(payload)}
            submitLabel="Creer l'article demo"
          />
        )}
        {editTarget && (
          <DemoContentEditorModal
            title="Modifier l'article"
            initial={{ title: editTarget.title, category: editTarget.category, excerpt: editTarget.excerpt, content: editTarget.content, imageUrl: editTarget.imageUrl, status: editTarget.status, visibility: editTarget.visibility }}
            categories={CATEGORIES}
            onClose={() => setEditTarget(null)}
            onSubmit={payload => upsert(payload, editTarget)}
            submitLabel="Mettre a jour"
          />
        )}
        {preview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
              {preview.imageUrl && <img src={preview.imageUrl} alt="" className="h-52 w-full object-cover" />}
              <div className="p-6">
                <h3 className="text-xl font-black text-neutral-900"><RichText value={preview.title} /></h3>
                <p className="mt-3 text-sm font-semibold text-neutral-600"><RichText value={preview.excerpt} /></p>
                <div className="mt-5 rounded-2xl border border-neutral-100 bg-neutral-50 p-5 text-sm leading-relaxed text-neutral-700"><RichText value={preview.content} /></div>
                <button onClick={() => setPreview(null)} className="mt-5 h-10 rounded-xl bg-neutral-900 px-5 text-sm font-black text-white">Fermer</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DemoPortalShell>
  );
}
