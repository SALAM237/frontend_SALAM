'use client';

import { CheckCircle2, ClipboardCheck, XCircle } from 'lucide-react';
import { DemoPortalShell, DemoStatus } from '../../_components/DemoShell';
import { demoValidationQueue } from '@/data/demo/demo-extra';

export default function DemoAdminValidationsPage() {
  return (
    <DemoPortalShell type="admin" title="Validations">
      <div className="mx-auto max-w-5xl space-y-5">
        <div><h1 className="text-2xl font-black text-neutral-900">Validations</h1><p className="text-sm text-neutral-500">Centre demo de validation avant publication ou activation.</p></div>
        <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm">
          <div className="divide-y divide-neutral-50">
            {demoValidationQueue.map(item => (
              <div key={item.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><ClipboardCheck size={16} /></div>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-black text-neutral-900">{item.title}</p><p className="text-xs text-neutral-400">{item.type} - {item.date}</p></div>
                <DemoStatus tone={item.priority === 'Haute' ? 'red' : 'blue'}>{item.priority}</DemoStatus>
                <button className="h-8 rounded-lg bg-emerald-600 px-3 text-xs font-black text-white"><CheckCircle2 className="mr-1 inline" size={12} />Valider</button>
                <button className="h-8 rounded-lg border border-red-100 px-3 text-xs font-black text-red-600"><XCircle className="mr-1 inline" size={12} />Refuser</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DemoPortalShell>
  );
}
