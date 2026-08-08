/* Persistance de la pièce jointe (justificatif) d'un brouillon de paiement, en
   complément du brouillon texte déjà stocké en sessionStorage (StoredPaymentDraft
   dans app/admin/adherents/page.tsx) — utilisé quand la saisie d'un paiement
   déclenche une redirection vers la facturation (facture manquante) puis un
   retour automatique sur le formulaire entamé.
   Un `File` n'étant pas sérialisable en JSON/sessionStorage (et son encodage en
   base64 dépasserait vite le quota de sessionStorage sur certains navigateurs
   pour un fichier de 5 Mo), on le stocke en IndexedDB (API native, capacité
   largement suffisante), avec la même durée de vie que le brouillon texte. */

const DB_NAME = 'salam-payment-drafts';
const STORE_NAME = 'files';
const DB_VERSION = 1;
const TTL_MS = 60 * 60 * 1000; // 1h — identique au brouillon sessionStorage

type StoredFileRecord = { key: string; name: string; type: string; blob: Blob; savedAt: number };

function openDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) return Promise.resolve(null);
  return new Promise(resolve => {
    try {
      const req = window.indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE_NAME)) {
          req.result.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/** Enregistre (ou remplace) le fichier associé à un brouillon de paiement. Échoue silencieusement si IndexedDB est indisponible — dégradation gracieuse, le reste du formulaire reste fonctionnel. */
export async function savePaymentDraftFile(key: string, file: File): Promise<void> {
  const db = await openDb();
  if (!db) return;
  await new Promise<void>(resolve => {
    const record: StoredFileRecord = { key, name: file.name, type: file.type, blob: file, savedAt: Date.now() };
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
  db.close();
}

/** Relit le fichier d'un brouillon (respecte le même TTL que le brouillon texte). Retourne `null` si absent, expiré, ou si IndexedDB est indisponible. */
export async function readPaymentDraftFile(key: string): Promise<File | null> {
  const db = await openDb();
  if (!db) return null;
  const record = await new Promise<StoredFileRecord | null>(resolve => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve((req.result as StoredFileRecord) ?? null);
    req.onerror = () => resolve(null);
  });
  db.close();
  if (!record) return null;
  if (Date.now() - record.savedAt > TTL_MS) {
    clearPaymentDraftFile(key);
    return null;
  }
  return new File([record.blob], record.name, { type: record.type });
}

/** Supprime le fichier d'un brouillon (paiement confirmé, formulaire annulé, ou brouillon expiré). */
export async function clearPaymentDraftFile(key: string): Promise<void> {
  const db = await openDb();
  if (!db) return;
  await new Promise<void>(resolve => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
  db.close();
}
