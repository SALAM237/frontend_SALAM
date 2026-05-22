import { MessageSquareText, Users } from 'lucide-react';
import { DemoPortalShell, DemoStatus } from '../../_components/DemoShell';
import { demoNetworkingPosts } from '@/data/demo/demo-extra';

export default function DemoMemberNetworkingPage() {
  return (
    <DemoPortalShell type="member" title="Networking">
      <div className="mx-auto max-w-5xl space-y-5">
        <div><h1 className="text-2xl font-black text-neutral-900">Networking</h1><p className="text-sm text-neutral-500">Echanges entre laureats, mentors et membres SALAM.</p></div>
        <button className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-4 text-xs font-black text-white"><MessageSquareText size={13} /> Publier une demande</button>
        <div className="grid gap-4 md:grid-cols-2">
          {demoNetworkingPosts.filter(post => post.status === 'published').map(post => (
            <article key={post.id} className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
              <DemoStatus tone="blue">{post.category}</DemoStatus>
              <h2 className="mt-3 text-lg font-black text-neutral-900">{post.title}</h2>
              <p className="mt-1 flex items-center gap-2 text-sm text-neutral-500"><Users size={13} /> {post.author}</p>
            </article>
          ))}
        </div>
      </div>
    </DemoPortalShell>
  );
}
