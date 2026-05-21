'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Loader2, Tag } from 'lucide-react';
import { ARTICLE_CATEGORIES, usePublicArticle } from '@/lib/api/content';

export default function MemberArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, isError } = usePublicArticle(id);
  const article = data?.data;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link href="/member/actualites" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:underline">
        <ArrowLeft size={14} /> Retour aux actualites
      </Link>

      {isLoading && (
        <div className="flex flex-col items-center rounded-2xl border border-neutral-100 bg-white py-16 shadow-sm">
          <Loader2 size={24} className="animate-spin text-emerald-600" />
          <p className="mt-3 text-sm text-neutral-400">Chargement...</p>
        </div>
      )}

      {(isError || (!isLoading && !article)) && (
        <div className="rounded-2xl border border-neutral-100 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold text-neutral-500">Actualite introuvable ou indisponible.</p>
        </div>
      )}

      {article && (
        <article className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
          <div className="h-40 bg-gradient-to-br from-emerald-500 to-teal-700" />
          <div className="space-y-5 p-5 sm:p-7">
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-emerald-700 ring-1 ring-emerald-100">
                <Tag size={10} />
                {ARTICLE_CATEGORIES.find(c => c.value === article.data?.category)?.label ?? 'General'}
              </span>
              <h1 className="mt-3 text-[clamp(1.6rem,4vw,2.4rem)] font-black leading-tight tracking-[-0.03em] text-neutral-900">
                {article.title}
              </h1>
              <p className="mt-2 flex items-center gap-2 text-xs text-neutral-400">
                <Calendar size={12} />
                {new Date(article.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>

            {article.data?.excerpt && (
              <p className="border-l-4 border-emerald-400 pl-4 text-sm font-semibold leading-7 text-neutral-600">{article.data.excerpt}</p>
            )}
            <div className="rounded-2xl bg-neutral-50 p-5">
              <p className="whitespace-pre-line text-sm leading-7 text-neutral-700">{article.data?.content || article.data?.excerpt || 'Contenu indisponible.'}</p>
            </div>
          </div>
        </article>
      )}
    </div>
  );
}
