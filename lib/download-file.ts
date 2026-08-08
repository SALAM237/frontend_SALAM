/* Téléchargement forcé d'un fichier distant (justificatifs de paiement, pièces
   jointes S3/R2…) depuis une simple URL publique.
   L'attribut HTML `download` sur un <a href> est IGNORÉ par les navigateurs
   quand l'URL est cross-origin (cas de nos fichiers hébergés sur le bucket
   S3/R2, domaine différent de l'appli) — cliquer ouvre juste le fichier au
   lieu de le télécharger. On récupère donc le contenu en blob (même origine
   une fois en mémoire) puis on déclenche un clic sur une ancre pointant vers
   ce blob, où `download` fonctionne correctement. */
export async function downloadFileFromUrl(url: string, filename: string): Promise<void> {
  if (!url) throw new Error('Aucun fichier à télécharger.');
  const response = await fetch(url);
  if (!response.ok) throw new Error('Téléchargement impossible (fichier introuvable).');
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename || 'document';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
