'use client';

import { Download, FolderOpen } from 'lucide-react';
import { DemoCard, DemoPortalShell } from '../../_components/DemoShell';
import { demoDocuments } from '@/data/demo/demo-portal';

export default function DemoMemberDocumentsPage() {
  return (
    <DemoPortalShell type="member" title="Mes documents">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {demoDocuments.map(doc => (
          <DemoCard key={doc.id} className="p-5">
            <FolderOpen className="mb-4 text-emerald-600" size={24} />
            <p className="text-sm font-black">{doc.title}</p>
            <p className="mt-1 text-xs text-neutral-400">{doc.type} - {doc.size} - {doc.updatedAt}</p>
            <button className="mt-4 inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 text-xs font-bold"><Download size={13} /> Telecharger</button>
          </DemoCard>
        ))}
      </div>
    </DemoPortalShell>
  );
}
