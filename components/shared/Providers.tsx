'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ErrorAutoScroller } from './ErrorAutoScroller';
import { ExclusiveMediaPlayback } from './ExclusiveMediaPlayback';
import { useRealtimeSync } from '@/lib/hooks/useRealtimeSync';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime:            5 * 60 * 1000,
        gcTime:               30 * 60 * 1000,
        retry:                1,
        refetchOnWindowFocus: false,
        networkMode:          'offlineFirst',
      },
    },
  });
}

function RealtimeSync() {
  useRealtimeSync();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={client}>
      <RealtimeSync />
      <ErrorAutoScroller />
      <ExclusiveMediaPlayback />
      {children}
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
