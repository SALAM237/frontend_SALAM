'use client';

import { Images } from 'lucide-react';
import { DemoCard, DemoPortalShell, DemoStatus } from '../../_components/DemoShell';
import { demoGallery } from '@/data/demo/demo-gallery';

export default function DemoMemberGalleryPage() {
  return (
    <DemoPortalShell type="member" title="Galerie">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {demoGallery.map(item => (
          <DemoCard key={item.id} className="overflow-hidden">
            <div className="grid aspect-video place-items-center bg-gradient-to-br from-emerald-100 via-yellow-50 to-red-100"><Images className="text-emerald-700" size={30} /></div>
            <div className="p-4"><p className="text-sm font-black">{item.title}</p><div className="mt-2"><DemoStatus tone="blue">{item.category}</DemoStatus></div></div>
          </DemoCard>
        ))}
      </div>
    </DemoPortalShell>
  );
}
