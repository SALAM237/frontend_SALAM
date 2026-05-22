'use client';

import { CheckCircle2, MessageSquareText, Trash2 } from 'lucide-react';
import { DemoPortalShell, DemoStatus } from '../../_components/DemoShell';
import { demoNetworkingPosts } from '@/data/demo/demo-extra';

export default function DemoAdminNetworkingPage() {
  return (
    <DemoPortalShell type="admin" title="Networking">
      <div className="mx-auto max-w-5xl space-y-5">
        <div><h1 className="text-2xl font-black text-neutral-900">Networking</h1><p className="text-sm text-neutral-500">File demo des publications a moderer avant diffusion.</p></div>
        <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm">
          <div className="divide-y divide-neutral-50">
            {demoNetworkingPosts.map(post => (
              <div key={post.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><MessageSquareText size={16} /></div>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-black text-neutral-900">{post.title}</p><p className="text-xs text-neutral-400">{post.author} - {post.category} - {post.date}</p></div>
                <DemoStatus tone={post.status === 'published' ? 'green' : 'amber'}>{post.status === 'published' ? 'Publie' : 'En attente'}</DemoStatus>
                <button className="h-8 rounded-lg border border-emerald-200 px-3 text-xs font-black text-emerald-700"><CheckCircle2 className="mr-1 inline" size={12} />Valider</button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-500"><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DemoPortalShell>
  );
}
