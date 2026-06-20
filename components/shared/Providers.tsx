'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ErrorAutoScroller } from './ErrorAutoScroller';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime:            5 * 60 * 1000,  // données fraîches 5 min
        gcTime:               30 * 60 * 1000, // cache gardé 30 min en mémoire
        retry:                1,
        refetchOnWindowFocus: false,          // pas de refetch au focus (inutile pour SALAM)
        networkMode:          'offlineFirst',  // pas de spinner sur reconnexion rapide
      },
    },
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={client}>
      <ErrorAutoScroller />
      {children}
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
