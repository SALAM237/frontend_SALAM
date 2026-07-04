import { create } from 'zustand';

/* Logo utilisé sur TOUS les documents PDF générés (factures, reçus), côté admin
   ET côté membre — configurable depuis Admin > Compte, source de vérité unique
   pour éviter tout écart entre les PDF admin et membre. */
export const DEFAULT_PDF_LOGO_URL = '/images/logo/logo_salam_wbg.png';

interface PdfLogoState {
  logoUrl: string;
  setLogoUrl: (url: string) => void;
}

export const usePdfLogoStore = create<PdfLogoState>(set => ({
  logoUrl: DEFAULT_PDF_LOGO_URL,
  setLogoUrl: url => set({ logoUrl: url }),
}));
