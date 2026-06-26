'use client';

import Link from 'next/link';
import { ArrowRight, Newspaper, Tag } from 'lucide-react';
import { ARTICLE_CATEGORIES, ARTICLE_CAT_STYLES, articleHref, usePublicArticles } from '@/lib/api/content';
import { RichText } from '@/components/ui/RichText';
import { articleImage } from '@/lib/article-image';
import { trackEvent } from '@/lib/analytics';

export function NewsPreview() {
  const { data, isLoading } = usePublicArticles();
  const articles = (data?.data ?? []).slice(0, 3);

  return (
    <section className="bg-[#fffdf8] px-5 py-[clamp(3rem,6vw,5rem)] md:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Actualites</p>
            <h2 className="mt-2 text-[clamp(1.7rem,4vw,2.7rem)] font-black leading-tight tracking-[-0.04em] text-neutral-950">
              Dernieres nouvelles SALAM
            </h2>
          </div>
          <Link href="/actualites" className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-black text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-50">
            Toutes les actualites <ArrowRight size={14} />
          </Link>
        </div>

        {isLoading && (
          <div className="flex snap-x gap-5 overflow-x-auto scroll-smooth pb-3 [-ms-overflow-style:none] [scrollbar-width:none] lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden">
            {[1, 2, 3].map(i => <div key={i} className="h-72 min-w-[84%] snap-start animate-pulse rounded-[1.5rem] bg-white shadow-sm sm:min-w-[48%] lg:min-w-0" />)}
          </div>
        )}

        {!isLoading && articles.length > 0 && (
          <div className="flex snap-x gap-5 overflow-x-auto scroll-smooth pb-3 [-ms-overflow-style:none] [scrollbar-width:none] lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden">
            {articles.map((article: any) => {
              const image = articleImage(article);
              const category = article.data?.category as string | undefined;
              const catStyle = ARTICLE_CAT_STYLES[category ?? ''] ?? ARTICLE_CAT_STYLES.general;
              const catLabel = ARTICLE_CATEGORIES.find(c => c.value === category)?.label ?? category ?? 'Général';
              return (
                <Link
                  key={article._id}
                  href={articleHref(article)}
                  onClick={() => trackEvent('news_click', {
                    article_id: article._id,
                    article_slug: article.slug,
                    article_title: article.title,
                    category,
                    source: 'home_preview',
                    action: 'card_click',
                  })}
                  className="group min-w-[84%] snap-start overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-md transition hover:-translate-y-1 hover:border-emerald-500 hover:shadow-xl hover:ring-2 hover:ring-emerald-500/20 sm:min-w-[48%] lg:min-w-0"
                >
                  <div className="aspect-[16/10] bg-gradient-to-br from-emerald-100 to-emerald-50">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image} alt={article.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Newspaper className="h-9 w-9 text-emerald-600" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 p-5">
                    <span className={`inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${catStyle.bg} ${catStyle.text}`}>
                      <Tag size={10} />
                      {catLabel}
                    </span>
                    <h3 className="line-clamp-2 font-black leading-tight text-neutral-950 transition group-hover:text-emerald-700"><RichText value={article.title} /></h3>
                    {article.data?.excerpt && <p className="line-clamp-2 text-sm leading-relaxed text-neutral-500"><RichText value={article.data.excerpt} /></p>}
                    <div className="inline-flex items-center gap-1 text-xs font-black text-emerald-700">
                      Lire l'article <ArrowRight size={12} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!isLoading && articles.length === 0 && (
          <div className="rounded-[1.5rem] border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
            Les actualites publiees apparaitront ici.
          </div>
        )}
      </div>
    </section>
  );
}
