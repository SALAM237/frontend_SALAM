import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Newspaper } from 'lucide-react';
import { DemoPortalShell, DemoStatus } from '../../../_components/DemoShell';
import { demoNews } from '@/data/demo/demo-news';

export default async function DemoMemberNewsDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = demoNews.find(news => news.slug === id || news.id === id);
  if (!item) notFound();
  return (
    <DemoPortalShell type="member" title="Actualite">
      <div className="mx-auto max-w-4xl space-y-5">
        <Link href="/demo/member/actualites" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700"><ArrowLeft size={14} /> Retour</Link>
        <article className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
          <DemoStatus tone="blue">{item.category}</DemoStatus>
          <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] text-neutral-900">{item.title}</h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-neutral-400"><Newspaper size={14} /> {item.date}</p>
          <p className="mt-5 text-neutral-600">{item.excerpt}</p>
        </article>
      </div>
    </DemoPortalShell>
  );
}
