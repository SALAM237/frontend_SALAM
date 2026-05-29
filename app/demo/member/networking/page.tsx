'use client';

import { DemoPortalShell } from '../../_components/DemoShell';
import { DemoNetworkingDirectory } from '@/components/demo/DemoNetworkingDirectory';

export default function DemoMemberNetworkingPage() {
  return (
    <DemoPortalShell type="member" title="Networking">
      <DemoNetworkingDirectory mode="member" />
    </DemoPortalShell>
  );
}
