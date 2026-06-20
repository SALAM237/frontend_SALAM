'use client';

import { useEffect, useState } from 'react';
import { Edit3, ImagePlus, Loader2, Plus, Sparkles, Trash2, Upload, X } from 'lucide-react';
import { type FeaturedDestination, type FeaturedItem, type FeaturedPayload, useAdminFeatured, useDeleteFeatured, useFeaturedTargets, useSaveFeatured, useUploadFeaturedMedia } from '@/lib/api/featured';

const emptyDestination = (): FeaturedDestination => ({ type: 'none', href: '' });
const emptyForm = (): FeaturedPayload => ({
  title: '', description: '', mediaType: 'image', mediaUrls: [], videoProvider: 'external', autoplay: false,
  visibility: 'public', status: 'draft', buttonLabel: 'En savoir plus',
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
            <option value="">Choisir un contenu</option>
            {targets.map(target => <option key={target.type + target.id} value={target.href}>{target.type} - {target.label}</option>)}
          </select>
        )}
        {value.type === 'external' && <input type="url" value={value.href} onChange={event => onChange({ ...value, href: event.target.value })} placeholder="https://..." className={input} />}
      </div>
    </div>
  );
}

function FeaturedEditor({ initial, onClose }: { initial?: FeaturedItem; onClose: () => void }) {
  const [form, setForm] = useState<FeaturedPayload>(() => initial ? { ...initial } : emptyForm());
  const save = useSaveFeatured();
  const upload = useUploadFeaturedMedia();
  const set = <K extends keyof FeaturedPayload>(key: K, value: FeaturedPayload[K]) => setForm(previous => ({ ...previous, [key]: value }));
  const submit = () => save.mutate({ id: initial?._id, payload: form }, { onSuccess: onClose });
  const uploadFile = (file?: File) => {
    if (!file) return;
    upload.mutate(file, { onSuccess: response => {
      setForm(previous => ({ ...previous, mediaType: response.data.mediaType, mediaUrls: [...previous.mediaUrls, response.data.url].slice(0, 10), videoProvider: response.data.mediaType === 'video' ? 'upload' : previous.videoProvider }));
    } });
  };
  const input = 'h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-emerald-500';

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm">
      <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-neutral-100 px-4 py-3 sm:px-6">
          <div><p className="font-black text-neutral-900">{initial ? 'Modifier' : 'Ajouter'} une info a la une</p><p className="text-xs text-neutral-400">Composez le media, le texte et chaque destination.</p></div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-neutral-100"><X size={17} /></button>
        </header>
        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
          <section>
            <p className="mb-2 text-xs font-black uppercase text-neutral-500">1. Type de media</p>
            <div className="grid grid-cols-2 gap-2">
              {(['image', 'video'] as const).map(type => <button key={type} type="button" onClick={() => set('mediaType', type)} className={'h-11 rounded-lg border text-sm font-black ' + (form.mediaType === type ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-neutral-200 text-neutral-500')}>{type === 'image' ? 'Image(s)' : 'Video'}</button>)}
            </div>
          </section>
          <section className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-emerald-700 px-4 text-xs font-black text-white">
                {upload.isPending ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Importer
                <input type="file" accept={form.mediaType === 'image' ? 'image/jpeg,image/png,image/webp' : 'video/mp4,video/webm'} className="hidden" onChange={event => uploadFile(event.target.files?.[0])} />
              </label>
              <span className="text-xs text-neutral-400">ou ajoutez une URL {form.mediaType === 'video' ? 'YouTube / video' : 'image'}</span>
            </div>
            <div className="flex gap-2">
              <input id="featured-url" placeholder="https://..." className={input} />
              <button type="button" onClick={() => {
                const element = document.getElementById('featured-url') as HTMLInputElement | null;
                if (element?.value.trim()) { set('mediaUrls', [...form.mediaUrls, element.value.trim()].slice(0, 10)); element.value = ''; }
              }} className="h-10 shrink-0 rounded-lg border border-neutral-200 px-3 text-xs font-black">Ajouter</button>
            </div>
            {form.mediaType === 'video' && (
              <div className="grid gap-2 sm:grid-cols-2">
                <select value={form.videoProvider} onChange={event => set('videoProvider', event.target.value as FeaturedPayload['videoProvider'])} className={input}><option value="youtube">YouTube</option><option value="upload">Video importee</option><option value="external">URL video</option></select>
                <label className="flex h-10 items-center gap-2 rounded-lg border border-neutral-200 px-3 text-xs font-semibold"><input type="checkbox" checked={form.autoplay} onChange={event => set('autoplay', event.target.checked)} /> Lecture automatique muette</label>
              </div>
            )}
            <div className="grid gap-2 sm:grid-cols-2">
              {form.mediaUrls.map((url, index) => <div key={url + index} className="flex min-w-0 items-center gap-2 rounded-lg border border-neutral-100 bg-neutral-50 p-2"><span className="min-w-0 flex-1 truncate text-[11px]">{url}</span><button type="button" onClick={() => set('mediaUrls', form.mediaUrls.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={13} className="text-red-500" /></button></div>)}
            </div>
          </section>
          <section className="grid gap-3 sm:grid-cols-2">
            <label className="sm:col-span-2"><span className="mb-1 block text-xs font-black text-neutral-600">Grand titre</span><input value={form.title} onChange={event => set('title', event.target.value)} maxLength={180} className={input} /></label>
            <label className="sm:col-span-2"><span className="mb-1 block text-xs font-black text-neutral-600">Texte</span><textarea value={form.description} onChange={event => set('description', event.target.value)} maxLength={3000} rows={5} className="w-full rounded-lg border border-neutral-200 p-3 text-sm outline-none focus:border-emerald-500" /></label>
            <label><span className="mb-1 block text-xs font-black text-neutral-600">Texte du bouton</span><input value={form.buttonLabel} onChange={event => set('buttonLabel', event.target.value)} className={input} /></label>
            <label><span className="mb-1 block text-xs font-black text-neutral-600">Ordre</span><input type="number" min={0} value={form.order} onChange={event => set('order', Number(event.target.value))} className={input} /></label>
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
            <label><span className="mb-1 block text-xs font-black text-neutral-600">Statut</span><select value={form.status} onChange={event => set('status', event.target.value as FeaturedPayload['status'])} className={input}><option value="draft">Brouillon</option><option value="published">Publie</option></select></label>
          </section>
        </div>
        <footer className="grid grid-cols-2 gap-2 border-t border-neutral-100 p-4 sm:flex sm:justify-end">
          <button type="button" onClick={onClose} className="h-10 rounded-lg border border-neutral-200 px-5 text-sm font-bold">Annuler</button>
          <button type="button" onClick={submit} disabled={save.isPending || !form.title.trim() || !form.description.trim() || !form.mediaUrls.length} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 text-sm font-black text-white disabled:opacity-50">{save.isPending && <Loader2 size={14} className="animate-spin" />} Enregistrer</button>
        </footer>
      </div>
    </div>
  );
}

export function FeaturedManager() {
  const [editor, setEditor] = useState<FeaturedItem | 'new' | null>(null);
  const { data, isLoading } = useAdminFeatured();
  const remove = useDeleteFeatured();
  const items = data?.data ?? [];
  return (
    <>
      <button type="button" onClick={() => setEditor('new')} className="inline-flex h-9 items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 text-sm font-black text-emerald-800 hover:bg-emerald-100"><Sparkles size={14} /> <span className="hidden sm:inline">Infos a la une</span><Plus size={13} /></button>
      <div className="mt-4 overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3"><p className="text-sm font-black">A la une</p><span className="text-xs text-neutral-400">{items.length} element(s)</span></div>
        {isLoading ? <div className="flex justify-center py-8"><Loader2 size={18} className="animate-spin" /></div> : items.map(item => (
          <div key={item._id} className="flex items-center gap-3 border-b border-neutral-50 px-4 py-3">
            <div className="flex h-10 w-12 items-center justify-center overflow-hidden rounded-lg bg-neutral-100">{item.mediaType === 'image' && item.mediaUrls[0] ? <img src={item.mediaUrls[0]} alt="" className="h-full w-full object-cover" /> : <ImagePlus size={16} />}</div>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-black">{item.title}</p><p className="text-[11px] text-neutral-400">{item.status} - {item.visibility}</p></div>
            <button type="button" onClick={() => setEditor(item)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200"><Edit3 size={13} /></button>
            <button type="button" onClick={() => confirm('Supprimer cet element ?') && remove.mutate(item._id)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-500"><Trash2 size={13} /></button>
          </div>
        ))}
      </div>
      {editor && <FeaturedEditor initial={editor === 'new' ? undefined : editor} onClose={() => setEditor(null)} />}
    </>
  );
}