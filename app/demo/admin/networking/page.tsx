'use client';

import { DemoPortalShell } from '../../_components/DemoShell';
import { DemoNetworkingDirectory } from '@/components/demo/DemoNetworkingDirectory';

export default function DemoAdminNetworkingPage() {
  return (
    <DemoPortalShell type="admin" title="Networking">
      <DemoNetworkingDirectory mode="admin" />
    </DemoPortalShell>
  );
}
