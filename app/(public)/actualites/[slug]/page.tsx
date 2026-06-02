'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Newspaper, ChevronRight, Calendar, Tag, Loader2 } from 'lucide-react';
import { usePublicArticle, ARTICLE_CATEGORIES } from '@/lib/api/content';
import { RichText } from '@/components/ui/RichText';
import { articleImage } from '@/lib/article-image';
import ArticleSchema from '@/components/seo/ArticleSchema';

const CAT_COLORS: Record<string, string> = {
  general:     'bg-neutral-100 text-neutral-600',
  evenement:   'bg-blue-100 text-blue-700',
  partenariat: 'bg-purple-100 text-purple-700',
  solidarity:  'bg-red-100 text-red-700',
  insertion:   'bg-cyan-100 text-cyan-700',
  vie_asso:    'bg-emerald-100 text-emerald-700',
};

export default function ActualiteDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data, isLoading, isError } = usePublicArticle(slug);
  const article = data?.data;

  return (
    <main className="min-h-screen bg-[#fffdf8]">
      {/* Breadcrumb */}
      <div className="border-b border-neutral-200 bg-white px-5 py-4 md:px-8 lg:px-12">
        <div className="mx-auto flex max-w-5xl items-center gap-1.5 text-xs text-neutral-400">
          <Link href="/" className="hover:text-neutral-700 transition-colors">Accueil</Link>
          <ChevronRight size={10} />
          <Link href="/actualites" className="hover:text-neutral-700 transition-colors">Actualités</Link>
          <ChevronRight size={10} />
          <span className="truncate text-neutral-600 max-w-[200px]">
            {article?.title ?? 'Article'}
          </span>
        </div>
      </div>

      <div className="px-5 py-[clamp(3rem,6vw,5rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <Link href="/actualites" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 transition-colors hover:text-emerald-700">
            <ArrowLeft size={15} /> Toutes les actualités
          </Link>

          {isLoading && (
            <div className="flex flex-col items-center py-24 gap-4">
              <Loader2 size={28} className="animate-spin text-emerald-600" />
              <p className="text-sm text-neutral-500">Chargement…</p>
            </div>
          )}

          {(isError || (!isLoading && !article)) && (
            <div className="mt-4 flex flex-col items-center gap-6 rounded-[2rem] border border-dashed border-neutral-300 bg-white py-24 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100">
                <Newspaper size={28} className="text-neutral-400" />
              </div>
              <div>
                <h1 className="text-xl font-black text-neutral-900">Article introuvable</h1>
                <p className="mt-2 max-w-sm text-sm text-neutral-500">
                  Cet article n'existe pas ou n'est plus disponible.
                </p>
              </div>
              <Link href="/actualites" className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-700 hover:border-emerald-400 hover:text-emerald-700 transition-all">
                Voir toutes les actualités
              </Link>
            </div>
          )}

          {!isLoading && article && (
            <article className="space-y-6">
              <ArticleSchema
                title={article.title}
                description={article.data?.excerpt ?? article.data?.content ?? article.title}
                slug={article.slug || slug}
                image={articleImage(article) || undefined}
                publishedAt={article.createdAt}
                updatedAt={article.updatedAt}
              />
              {/* Cover */}
              <div className="aspect-[21/9] overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-emerald-400 to-teal-600">
                {articleImage(article) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={articleImage(article)} alt={article.title} className="h-full w-full object-cover" />
                )}
              </div>

              {/* Header */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {article.data?.category && (
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${CAT_COLORS[article.data.category] ?? 'bg-neutral-100 text-neutral-600'}`}>
                      <Tag size={10} />
                      {ARTICLE_CATEGORIES.find(c => c.value === article.data?.category)?.label ?? article.data.category}
                    </span>
                  )}
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                    Publié
                  </span>
                </div>
                <h1 className="text-[clamp(1.6rem,4vw,2.4rem)] font-black leading-[1.1] tracking-[-0.03em] text-neutral-900">
                  <RichText value={article.title} />
                </h1>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <Calendar size={12} />
                  <span>
                    {new Date(article.createdAt).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Excerpt */}
              {article.data?.excerpt && (
                <p className="text-base font-semibold leading-relaxed text-neutral-600 border-l-4 border-emerald-400 pl-4">
                  <RichText value={article.data.excerpt} />
                </p>
              )}

              {/* Content */}
              {article.data?.content && (
                <div className="rounded-[1.5rem] border border-neutral-100 bg-white p-6">
                  <div className="prose prose-sm max-w-none text-neutral-700 leading-relaxed whitespace-pre-wrap">
                    <RichText value={article.data.content} />
                  </div>
                </div>
              )}

              {/* CTA membres */}
              <div className="rounded-[1.5rem] bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white">
                <h3 className="font-black tracking-[-0.02em]">Rejoindre l'association SALAM</h3>
                <p className="mt-1.5 text-sm text-white/70">Accédez à toutes les actualités et activités en devenant membre de SALAM Cameroun.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href="/auth/login" className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 text-sm font-black text-emerald-700 transition-all hover:bg-emerald-50">
                    Se connecter
                  </Link>
                  <Link href="/adhesion" className="inline-flex h-10 items-center gap-2 rounded-full border border-white/30 px-5 text-sm font-semibold text-white/80 transition-all hover:border-white/60 hover:text-white">
                    Devenir membre
                  </Link>
                </div>
              </div>
            </article>
          )}
        </div>
      </div>
    </main>
  );
}
