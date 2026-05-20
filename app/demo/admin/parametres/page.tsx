'use client';

import { Settings, ToggleRight } from 'lucide-react';
import { DemoCard, DemoPortalShell, DemoStatus } from '../../_components/DemoShell';

export default function DemoAdminSettingsPage() {
  const settings = ['Adhesions ouvertes', 'Validation manuelle', 'Notifications email', 'Mode maintenance'];
  return (
    <DemoPortalShell type="admin" title="Parametres">
      <div className="grid gap-4 lg:grid-cols-2">
        <DemoCard className="p-5">
          <Settings className="mb-3 text-emerald-600" size={20} />
          <p className="text-sm font-black text-neutral-900">Configuration generale</p>
          <p className="mt-1 text-xs text-neutral-400">Ces options sont fictives et ne modifient pas le site.</p>
          <div className="mt-4 space-y-3">
            {settings.map((label, index) => (
              <div key={label} className="flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-3">
                <span className="text-sm font-semibold text-neutral-700">{label}</span>
                <ToggleRight className={index === 3 ? 'text-neutral-300' : 'text-emerald-600'} size={22} />
              </div>
            ))}
          </div>
        </DemoCard>
        <DemoCard className="p-5">
          <p className="text-sm font-black text-neutral-900">Sante demo</p>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between"><span className="text-sm text-neutral-500">Source des donnees</span><DemoStatus tone="blue">Mock data</DemoStatus></div>
            <div className="flex justify-between"><span className="text-sm text-neutral-500">Base de donnees</span><DemoStatus tone="green">Non utilisee</DemoStatus></div>
            <div className="flex justify-between"><span className="text-sm text-neutral-500">Session requise</span><DemoStatus tone="green">Non</DemoStatus></div>
          </div>
        </DemoCard>
      </div>
    </DemoPortalShell>
  );
}
