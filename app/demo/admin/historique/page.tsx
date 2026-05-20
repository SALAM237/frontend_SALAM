'use client';

import { History } from 'lucide-react';
import { DemoCard, DemoPortalShell } from '../../_components/DemoShell';
import { demoAuditLogs } from '@/data/demo/demo-portal';

export default function DemoAdminHistoryPage() {
  return (
    <DemoPortalShell type="admin" title="Historique">
      <DemoCard className="overflow-hidden">
        <div className="border-b border-neutral-100 px-5 py-4"><p className="text-sm font-black">Journal d'audit fictif</p></div>
        <div className="divide-y divide-neutral-50">
          {demoAuditLogs.map(log => (
            <div key={log.id} className="flex items-start gap-3 px-5 py-4">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-neutral-100 text-neutral-500"><History size={15} /></div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-neutral-900">{log.action}</p>
                <p className="text-xs text-neutral-500">{log.actor} sur {log.target}</p>
              </div>
              <span className="text-xs text-neutral-400">{log.date}</span>
            </div>
          ))}
        </div>
      </DemoCard>
    </DemoPortalShell>
  );
}
