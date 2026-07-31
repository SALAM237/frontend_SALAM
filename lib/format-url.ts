import { SITE_URL } from '@/lib/seo';

const SITE_HOST = SITE_URL.replace(/^https?:\/\//, '');

/* Affiche un chemin de page sous forme d'URL complete (salam-cameroun.com/xxx)
   plutot qu'un chemin relatif brut, pour rester lisible/verifiable dans les
   journaux d'activite. */
export function formatPageUrl(path?: string) {
  if (!path) return '';
  return `${SITE_HOST}${path}`;
}
