'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/store/auth.store';

/* Rapporte une vraie navigation de page (une entree par changement de route
   reel, pas une par appel API) au journal d'activite. Silencieux en cas
   d'echec — ne doit jamais impacter l'experience utilisateur. */
export function RouteChangeTracker() {
  const pathname = usePathname();
  const token = useAuthStore(s => s.accessToken);
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (!token || !pathname) return;
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;

    apiClient('/api/v1/activity/pageview', {
      method: 'POST',
      body: JSON.stringify({ path: pathname }),
      token,
    }).catch(() => {});
  }, [pathname, token]);

  return null;
}
