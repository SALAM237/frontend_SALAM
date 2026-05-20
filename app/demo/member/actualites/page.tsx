'use client';

import Link from 'next/link';
import { Newspaper } from 'lucide-react';
import { DemoCard, DemoPortalShell } from '../../_components/DemoShell';
import { demoNews } from '@/data/demo/demo-news';

export default function DemoMemberNewsPage() {
  return (
    <DemoPortalShell type="member" title="Actualites">
      <div className="grid gap-4 lg:grid-cols-2">
        {demoNews.map(news => (
          <Link key={news.id} href={`/demo/actualites/${news.slug}`}>
            <DemoCard className="p-5 transition hover:border-emerald-200">
              <Newspaper className="mb-3 text-emerald-600" size={20} />
              <p className="text-sm font-black">{news.title}</p>
              <p className="mt-2 text-sm text-neutral-500">{news.excerpt}</p>
            </DemoCard>
          </Link>
        ))}
      </div>
    </DemoPortalShell>
  );
}
