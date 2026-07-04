'use client';

import { useEffect } from 'react';
import { usePdfLogo } from '@/lib/api/settings';
import { usePdfLogoStore } from '@/store/pdf-logo.store';

/* Synchronise le logo PDF configuré (Admin > Compte) dans le store global, pour
   que toute génération de facture/reçu (admin ou membre) utilise la même image
   sans avoir à refaire l'appel réseau à chaque impression. Ne rend rien. */
export function PdfLogoSync() {
  const { data } = usePdfLogo();
  const setLogoUrl = usePdfLogoStore(s => s.setLogoUrl);

  useEffect(() => {
    if (data?.data?.logoUrl) setLogoUrl(data.data.logoUrl);
  }, [data, setLogoUrl]);

  return null;
}
