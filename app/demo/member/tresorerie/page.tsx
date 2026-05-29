'use client';

import { DemoPortalShell } from '../../_components/DemoShell';
import { DemoTreasuryDashboard } from '@/components/demo/DemoTreasuryDashboard';

export default function DemoMemberTreasuryPage() {
  return (
    <DemoPortalShell type="member" title="Tresorerie">
      <DemoTreasuryDashboard mode="member" />
    </DemoPortalShell>
  );
}
