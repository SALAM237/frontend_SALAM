'use client';

import { useState } from 'react';
import { Edit3, ImagePlus, Loader2, Plus, Sparkles, Trash2, Upload, X } from 'lucide-react';
import {
  type FeaturedDestination, type FeaturedItem, type FeaturedPayload,
  useAdminFeatured, useDeleteFeatured, useFeaturedTargets, useSaveFeatured, useUploadFeaturedMedia,
} from '@/lib/api/featured';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'heic', 'heif', 'gif', 'tif', 'tiff'];
const VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov', 'm4v', 'mkv', 'avi', 'mpeg', 'mpg', '3gp'];
const fileExtension = (file: File) => file.name.split('.').pop()?.toLowerCase() ?? '';
const IMAGE_MAX = 15 * 1024 * 1024;
const VIDEO_MAX = 80 * 1024 * 1024;
const emptyDestination = (): FeaturedDestination => ({ type: 'none', href: '' });
const emptyForm = (): FeaturedPayload => ({
  title: '', description: '', mediaType: 'image', mediaUrls: [], videoProvider: 'external', autoplay: false,
  visibility: 'public', status: 'published', buttonLabel: 'En savoir plus',
  mediaDestination: emptyDestination(), titleDestination: emptyDestination(), textDestination: emptyDestination(), buttonDestination: emptyDestination(), order: 0,
});

function DestinationField({ label, value, onChange }: { label: string; value: FeaturedDestination; onChange: (value: FeaturedDestination) => void }) {
  const { data } = useFeaturedTargets();
  const targets = data?.data ?? [];
  const input = 'h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-xs outline-none focus:border-emerald-500';
  return (
    <div className="grid gap-2 rounded-lg border border-neutral-100 bg-neutral-50 p-3 sm:grid-cols-[130px_1fr]">
      <label className="text-xs font-black text-neutral-700">{label}</label>
      <div className="grid gap-2 sm:grid-cols-[120px_1fr]">
        <select value={value.type} onChange={event => onChange({ type: event.target.value as FeaturedDestination['type'], href: '' })} className={input}>
          <option value="none">Aucun lien</option><option value="internal">Contenu du site</option><option value="external">Lien externe</option>
        </select>
        {value.type === 'internal' && (
          <select value={value.href} onChange={event => onChange({ ...value, href: event.target.value })} className={input}>
            <option value="">Choisir une actualite, opportunite ou activite</option>
            {targets.map(target => <option key={target.type + target.id} value={target.href}>{target.type} - {target.label}</option>)}
          </select>
        )}
        {value.type === 'external' && <input type="url" value={value.href} onChange={event => onChange({ ...value, href: event.target.value })} placeholder="https://exemple.com/page" className={input} />}
      </div>
    </div>
  );
}

function FeaturedEditor({ initial, onClose }: { initial?: FeaturedItem; onClose: () => void }) {
  const [form, setForm] = useState<FeaturedPayload>(() => initial ? { ...initial } : emptyForm());
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState('');
  const save = useSaveFeatured();
  const upload = useUploadFeaturedMedia();
  const set = <K extends keyof FeaturedPayload>(key: K, value: FeaturedPayload[K]) => setForm(previous => ({ ...previous, [key]: value }));
  const input = 'h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-emerald-500';

  const changeMediaType = (mediaType: 'image' | 'video') => {
    setForm(previous => ({ ...previous, mediaType, mediaUrls: [], videoProvider: mediaType === 'video' ? 'upload' : 'external' }));
    setPendingFiles([]);
    setError('');
  };

  const selectFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const selected = Array.from(files);
    const allowed = form.mediaType === 'image' ? IMAGE_EXTENSIONS : VIDEO_EXTENSIONS;
    const maxSize = form.mediaType === 'image' ? IMAGE_MAX : VIDEO_MAX;
    const invalidType = selected.find(file => !allowed.includes(fileExtension(file)));
    if (invalidType) {
      setError(form.mediaType === 'image'
        ? 'Format non accepte. Images : JPG, PNG, WEBP, AVIF, HEIC/HEIF, GIF ou TIFF.'
        : 'Format non accepte. Videos : MP4, WEBM, MOV, M4V, MKV, AVI, MPEG/MPG ou 3GP.');
      return;
    }
    const tooLarge = selected.find(file => file.size > maxSize);
    if (tooLarge) {
      setError((form.mediaType === 'image' ? 'Image' : 'Video') + ' trop lourde : ' + tooLarge.name + '. Taille maximale : ' + (form.mediaType === 'image' ? '15 Mo.' : '80 Mo.'));
      return;
    }
    if (form.mediaType === 'video' && selected.length > 1) {
      setError('Ajoutez une seule video par publication.');
      return;
    }
    if (form.mediaType === 'image' && form.mediaUrls.length + pendingFiles.length + selected.length > 10) {
      setError('Maximum 10 images par publication.');
      return;
    }
    setError('');
    setPendingFiles(previous => form.mediaType === 'video' ? selected.slice(0, 1) : [...previous, ...selected]);
  };

  const addUrl = () => {
    const value = urlInput.trim();
    if (!value) return;
    try {
      const parsed = new URL(value);
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error();
      if (form.mediaType === 'video' && form.mediaUrls.length >= 1) {
        setError('Une seule URL video est autorisee par publication.');
        return;
      }
      set('mediaUrls', [...form.mediaUrls, parsed.toString()].slice(0, 10));
      setUrlInput('');
      setError('');
    } catch {
      setError('Lien invalide. Saisissez une URL complete commencant par https://');
    }
  };

  const validate = () => {
    if (!form.title.trim()) return 'Le grand titre est obligatoire.';
    if (!form.description.trim()) return 'Le texte de presentation est obligatoire.';
    if (!form.mediaUrls.length && !pendingFiles.length) return 'Ajoutez au moins une image, une video ou une URL.';
    const destinations = [form.mediaDestination, form.titleDestination, form.textDestination, form.buttonDestination];
    if (destinations.some(destination => destination.type !== 'none' && !destination.href)) return 'Choisissez une destination pour chaque lien active.';
    return '';
  };

  const submit = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setProcessing(true);
    setError('');
    try {
      const uploadedUrls: string[] = [];
      for (let index = 0; index < pendingFiles.length; index += 1) {
        setProgress('Compression et import du fichier ' + (index + 1) + '/' + pendingFiles.length + '...');
        const response = await upload.mutateAsync(pendingFiles[index]);
        const uploadedUrl = response.data.url?.trim();
        if (!uploadedUrl || (!uploadedUrl.startsWith('/') && !uploadedUrl.startsWith('https://') && !uploadedUrl.startsWith('http://'))) {
          throw new Error('Le serveur a renvoye une adresse de media invalide. Reimportez le fichier.');
        }
        uploadedUrls.push(uploadedUrl);
      }
      setProgress('Enregistrement de la publication...');
      await save.mutateAsync({
        id: initial?._id,
        payload: {
          ...form,
          mediaUrls: [...form.mediaUrls, ...uploadedUrls],
          videoProvider: form.mediaType === 'video' && pendingFiles.length ? 'upload' : form.videoProvider,
        },
      });
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Impossible d enregistrer la publication.');
    } finally {
      setProcessing(false);
      setProgress('');
    }
  };

  const busy = processing || upload.isPending || save.isPending;
  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm">
      <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-neutral-100 px-4 py-3 sm:px-6">
          <div><p className="font-black text-neutral-900">{initial ? 'Modifier' : 'Ajouter'} une info a la une</p><p className="text-xs text-neutral-400">Les fichiers sont compresses sans forte perte de qualite lors de l enregistrement.</p></div>
          <button type="button" onClick={onClose} disabled={busy} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-neutral-100 disabled:opacity-40"><X size={17} /></button>
        </header>
        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
          {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
          {progress && <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700"><Loader2 size={15} className="animate-spin" />{progress}</div>}
          <section>
            <p className="mb-2 text-xs font-black uppercase text-neutral-500">1. Type de media</p>
            <div className="grid grid-cols-2 gap-2">
              {(['image', 'video'] as const).map(type => <button key={type} type="button" disabled={busy} onClick={() => changeMediaType(type)} className={'h-11 rounded-lg border text-sm font-black ' + (form.mediaType === type ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-neutral-200 text-neutral-500')}>{type === 'image' ? 'Image(s)' : 'Video'}</button>)}
            </div>
          </section>
          <section className="space-y-3">
            <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-emerald-300 bg-emerald-50/40 px-4 text-center transition hover:bg-emerald-50">
              <Upload size={20} className="mb-2 text-emerald-700" />
              <span className="text-xs font-black text-emerald-800">Choisir {form.mediaType === 'image' ? 'des images' : 'une video'}</span>
              <span className="mt-1 text-[11px] text-neutral-500">{form.mediaType === 'image' ? 'JPG, PNG, WEBP, AVIF, HEIC, GIF ou TIFF - 15 Mo maximum - 10 images' : 'MP4, WEBM, MOV, M4V, MKV, AVI, MPEG ou 3GP - 80 Mo maximum'}</span>
              <input type="file" multiple={form.mediaType === 'image'} accept={form.mediaType === 'image' ? '.jpg,.jpeg,.png,.webp,.avif,.heic,.heif,.gif,.tif,.tiff,image/*' : '.mp4,.webm,.mov,.m4v,.mkv,.avi,.mpeg,.mpg,.3gp,video/*'} className="hidden" disabled={busy} onChange={event => { selectFiles(event.target.files); event.target.value = ''; }} />
            </label>
            <div className="flex gap-2">
              <input value={urlInput} onChange={event => setUrlInput(event.target.value)} placeholder={form.mediaType === 'video' ? 'URL YouTube ou video : https://...' : 'URL d image : https://...'} className={input} />
              <button type="button" onClick={addUrl} disabled={busy} className="h-10 shrink-0 rounded-lg border border-neutral-200 px-3 text-xs font-black">Ajouter</button>
            </div>
            {form.mediaType === 'video' && (
              <div className="grid gap-2 sm:grid-cols-2">
                <select value={form.videoProvider} onChange={event => set('videoProvider', event.target.value as FeaturedPayload['videoProvider'])} className={input}><option value="youtube">Lien YouTube</option><option value="upload">Video MP4/WEBM importee</option><option value="external">URL video externe</option></select>
                <label className="flex h-10 items-center gap-2 rounded-lg border border-neutral-200 px-3 text-xs font-semibold"><input type="checkbox" checked={form.autoplay} onChange={event => set('autoplay', event.target.checked)} /> Lecture automatique muette</label>
              </div>
            )}
            <div className="grid gap-2 sm:grid-cols-2">
              {pendingFiles.map((file, index) => <div key={file.name + file.lastModified} className="flex min-w-0 items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 p-2"><div className="min-w-0 flex-1"><p className="truncate text-[11px] font-bold">{file.name}</p><p className="text-[10px] text-blue-600">A compresser - {(file.size / 1024 / 1024).toFixed(1)} Mo</p></div><button type="button" disabled={busy} onClick={() => setPendingFiles(files => files.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={13} className="text-red-500" /></button></div>)}
              {form.mediaUrls.map((url, index) => <div key={url + index} className="flex min-w-0 items-center gap-2 rounded-lg border border-neutral-100 bg-neutral-50 p-2"><span className="min-w-0 flex-1 truncate text-[11px]">{url}</span><button type="button" disabled={busy} onClick={() => set('mediaUrls', form.mediaUrls.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={13} className="text-red-500" /></button></div>)}
            </div>
          </section>
          <section className="grid gap-3 sm:grid-cols-2">
            <label className="sm:col-span-2"><span className="mb-1 block text-xs font-black text-neutral-600">Grand titre</span><input value={form.title} onChange={event => set('title', event.target.value)} maxLength={180} placeholder="Titre principal de la publication" className={input} /></label>
            <label className="sm:col-span-2"><span className="mb-1 block text-xs font-black text-neutral-600">Texte</span><textarea value={form.description} onChange={event => set('description', event.target.value)} maxLength={3000} rows={5} placeholder="Presentez clairement l information mise a la une..." className="w-full rounded-lg border border-neutral-200 p-3 text-sm outline-none focus:border-emerald-500" /></label>
            <label><span className="mb-1 block text-xs font-black text-neutral-600">Texte du bouton</span><input value={form.buttonLabel} onChange={event => set('buttonLabel', event.target.value)} placeholder="En savoir plus" className={input} /></label>
            <label><span className="mb-1 block text-xs font-black text-neutral-600">Position dans le carrousel</span><input type="number" min={0} value={form.order} onChange={event => set('order', Number(event.target.value))} className={input} /></label>
          </section>
          <section className="space-y-2">
            <p className="text-xs font-black uppercase text-neutral-500">Destinations au clic</p>
            <DestinationField label="Media" value={form.mediaDestination} onChange={value => set('mediaDestination', value)} />
            <DestinationField label="Titre" value={form.titleDestination} onChange={value => set('titleDestination', value)} />
            <DestinationField label="Texte" value={form.textDestination} onChange={value => set('textDestination', value)} />
            <DestinationField label="Bouton" value={form.buttonDestination} onChange={value => set('buttonDestination', value)} />
          </section>
          <section className="grid gap-3 sm:grid-cols-2">
            <label><span className="mb-1 block text-xs font-black text-neutral-600">Visibilite</span><select value={form.visibility} onChange={event => set('visibility', event.target.value as FeaturedPayload['visibility'])} className={input}><option value="public">Public et indexable</option><option value="members">Membres uniquement</option></select></label>
            <label><span className="mb-1 block text-xs font-black text-neutral-600">Statut</span><select value={form.status} onChange={event => set('status', event.target.value as FeaturedPayload['status'])} className={input}><option value="published">Publie sur le site</option><option value="draft">Brouillon non visible</option></select></label>
          </section>
        </div>
        <footer className="grid grid-cols-2 gap-2 border-t border-neutral-100 p-4 sm:flex sm:justify-end">
          <button type="button" onClick={onClose} disabled={busy} className="h-10 rounded-lg border border-neutral-200 px-5 text-sm font-bold disabled:opacity-40">Annuler</button>
          <button type="button" onClick={submit} disabled={busy} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 text-sm font-black text-white disabled:opacity-50">{busy && <Loader2 size={14} className="animate-spin" />} Enregistrer</button>
        </footer>
      </div>
    </div>
  );
}

export function FeaturedManager({ showButton = true, showList = true }: { showButton?: boolean; showList?: boolean }) {
  const [editor, setEditor] = useState<FeaturedItem | 'new' | null>(null);
  const { data, isLoading } = useAdminFeatured();
  const remove = useDeleteFeatured();
  const items = data?.data ?? [];
  return (
    <>
      {showButton && <button type="button" onClick={() => setEditor('new')} className="inline-flex h-9 items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 text-sm font-black text-emerald-800 hover:bg-emerald-100"><Sparkles size={14} /><span>Infos a la une</span><Plus size={13} /></button>}
      {showList && (
        <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3.5">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-neutral-500">À la une</p>
            <span className="text-xs text-neutral-400">{items.length} élément{items.length > 1 ? 's' : ''}</span>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 size={18} className="animate-spin text-emerald-600" /></div>
          ) : items.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-neutral-400">Aucun élément à la une.</p>
          ) : (
            <div className="divide-y divide-neutral-50">
              {items.map(item => (
                <article key={item._id} className="overflow-hidden transition hover:bg-neutral-50/70 sm:flex sm:items-stretch">
                  {/* Image */}
                  <div className="relative h-36 shrink-0 overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100 sm:h-auto sm:w-52">
                    {item.mediaType === 'image' && item.mediaUrls[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.mediaUrls[0]} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ImagePlus size={28} className="text-emerald-300" />
                      </div>
                    )}
                  </div>
                  {/* Contenu */}
                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black tracking-wide ${item.status === 'published' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-yellow-200 bg-yellow-50 text-yellow-700'}`}>
                          {item.status === 'published' ? 'Publié' : 'Brouillon'}
                        </span>
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black ${item.visibility === 'public' ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-violet-200 bg-violet-50 text-violet-700'}`}>
                          {item.visibility === 'public' ? 'Public' : 'Membres'}
                        </span>
                      </div>
                      <p className="text-sm font-black text-neutral-900 line-clamp-2">{item.title}</p>
                      {item.description && (
                        <p className="mt-1 text-xs leading-5 text-neutral-500 line-clamp-2">{item.description}</p>
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <button type="button" onClick={() => setEditor(item)}
                        className="inline-flex h-7 items-center gap-1 rounded-lg border border-neutral-200 px-2.5 text-[11px] font-black text-neutral-600 transition hover:border-emerald-300 hover:text-emerald-700">
                        <Edit3 size={11} /> Modifier
                      </button>
                      <button type="button" onClick={() => confirm('Supprimer cet élément ?') && remove.mutate(item._id)}
                        className="inline-flex h-7 items-center gap-1 rounded-lg border border-red-100 bg-red-50 px-2.5 text-[11px] font-black text-red-500 transition hover:bg-red-500 hover:text-white">
                        <Trash2 size={11} /> Supprimer
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
      {editor && <FeaturedEditor initial={editor === 'new' ? undefined : editor} onClose={() => setEditor(null)} />}
    </>
  );
}