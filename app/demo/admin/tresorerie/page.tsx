'use client';

import { DemoPortalShell } from '../../_components/DemoShell';
import { DemoTreasuryDashboard } from '@/components/demo/DemoTreasuryDashboard';

export default function DemoAdminTreasuryPage() {
  return (
    <DemoPortalShell type="admin" title="Tresorerie">
      <DemoTreasuryDashboard mode="admin" />
    </DemoPortalShell>
  );
}
