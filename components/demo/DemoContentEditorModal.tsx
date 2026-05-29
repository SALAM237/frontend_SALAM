'use client';

import { useState } from 'react';
import { ImagePlus, Loader2, PlusCircle, Save, Trash2, X } from 'lucide-react';
import { DesignEditorField, type DesignStyle } from '@/components/admin/DesignEditorField';
import { RichTextEditor } from '@/components/ui/RichTextEditor';

export type DemoEditorPayload = {
  title: string;
  category?: string;
  excerpt?: string;
  content?: string;
  imageUrl?: string;
  visibility?: 'public' | 'members' | 'office';
  status?: 'draft' | 'published' | 'finished' | 'cancelled';
};

type ExtraBlock = {
  id: string;
  label: string;
  title: string;
  description: string;
};

const defaultStyles: Record<string, DesignStyle> = {
  title: { x: 0, y: 0, fontSize: 15, fontFamily: 'Inter, system-ui, sans-serif', bold: false, italic: false, color: '#111827', bg: '#ffffff', border: '#e5e7eb', radius: 12 },
  excerpt: { x: 0, y: 0, fontSize: 14, fontFamily: 'Inter, system-ui, sans-serif', bold: false, italic: false, color: '#374151', bg: '#ffffff', border: '#e5e7eb', radius: 12 },
  content: { x: 0, y: 0, fontSize: 14, fontFamily: 'Inter, system-ui, sans-serif', bold: false, italic: false, color: '#374151', bg: '#ffffff', border: '#e5e7eb', radius: 12 },
};

const inputClass = (error?: string) =>
  `w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition focus:ring-2 placeholder:text-neutral-300 ${error ? 'border-red-300 focus:ring-red-500/15' : 'border-neutral-200 focus:border-emerald-500 focus:ring-emerald-500/15'}`;

export function DemoContentEditorModal({
  title,
  initial,
  categories,
  onSubmit,
  onClose,
  contentLabel = 'Contenu',
  submitLabel = 'Enregistrer demo',
}: {
  title: string;
  initial?: Partial<DemoEditorPayload>;
  categories: { value: string; label: string }[];
  onSubmit: (payload: DemoEditorPayload) => void;
  onClose: () => void;
  contentLabel?: string;
  submitLabel?: string;
}) {
  const [form, setForm] = useState<DemoEditorPayload>({
    title: initial?.title ?? '',
    category: initial?.category ?? categories[0]?.value,
    excerpt: initial?.excerpt ?? '',
    content: initial?.content ?? '',
    imageUrl: initial?.imageUrl ?? '/images/gallery/image_parallax_SALAM.png',
    visibility: initial?.visibility ?? 'public',
    status: initial?.status ?? 'draft',
  });
  const [styles, setStyles] = useState<Record<string, DesignStyle>>(defaultStyles);
  const [activeDesign, setActiveDesign] = useState<string | null>(null);
  const [extraBlocks, setExtraBlocks] = useState<ExtraBlock[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof DemoEditorPayload) => (value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const save = () => {
    if (!form.title?.trim()) {
      setErrors({ title: 'Titre requis' });
      return;
    }
    setSaving(true);
    const extraContent = extraBlocks
      .filter(block => block.title.trim() || block.description.trim())
      .map(block => [block.label, block.title, block.description].filter(Boolean).join('<br>'))
      .join('<br><br>');

    window.setTimeout(() => {
      onSubmit({
        ...form,
        content: [form.content, extraContent].filter(Boolean).join('<br><br>'),
      });
      setSaving(false);
      onClose();
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200">
        <div className="flex shrink-0 items-center justify-between border-b border-neutral-100 px-5 py-4 sm:px-6">
          <div>
            <h3 className="font-black text-neutral-900">{title}</h3>
            <p className="mt-0.5 text-xs text-neutral-400">Mode demo local. Aucune donnee reelle n'est modifiee.</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6" onClick={() => setActiveDesign(null)}>
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Titre <span className="text-red-500">*</span></label>
            <DesignEditorField id="title" label="Titre" styles={styles} setStyles={setStyles} active={activeDesign} setActive={setActiveDesign}>
              {style => <RichTextEditor value={form.title} onChange={set('title')} className={inputClass(errors.title)} style={style} placeholder="Titre" multiline={false} />}
            </DesignEditorField>
            {errors.title && <p className="text-[11px] text-red-500">{errors.title}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Categorie</label>
              <select value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))} className={inputClass()}>
                {categories.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Image</label>
              <div className="flex gap-2">
                <input value={form.imageUrl ?? ''} onChange={e => setForm(prev => ({ ...prev, imageUrl: e.target.value }))} className={inputClass()} placeholder="URL image demo" />
                <button type="button" onClick={() => setForm(prev => ({ ...prev, imageUrl: '/images/gallery/image_parallax_SALAM.png' }))} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 text-neutral-500 hover:border-emerald-300 hover:text-emerald-700">
                  <ImagePlus size={15} />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Resume</label>
            <DesignEditorField id="excerpt" label="Resume" styles={styles} setStyles={setStyles} active={activeDesign} setActive={setActiveDesign}>
              {style => <RichTextEditor value={form.excerpt ?? ''} onChange={set('excerpt')} className="min-h-[74px] w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" style={style} placeholder="Apercu court..." />}
            </DesignEditorField>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">{contentLabel}</label>
            <DesignEditorField id="content" label={contentLabel} styles={styles} setStyles={setStyles} active={activeDesign} setActive={setActiveDesign}>
              {style => <RichTextEditor value={form.content ?? ''} onChange={set('content')} className="min-h-[150px] w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" style={style} placeholder="Rediger le contenu..." />}
            </DesignEditorField>
          </div>

          <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-700">Blocs ajoutables</p>
                <p className="text-[11px] text-neutral-500">Champs titre et description, deplacables et stylisables.</p>
              </div>
              <button type="button" onClick={() => setExtraBlocks(prev => [...prev, { id: `extra-${Date.now()}`, label: `Bloc ${prev.length + 1}`, title: '', description: '' }])} className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-emerald-600 px-3 text-xs font-black text-white">
                <PlusCircle size={13} /> Ajouter
              </button>
            </div>
            <div className="space-y-3">
              {extraBlocks.map(block => (
                <DesignEditorField key={block.id} id={block.id} label={block.label} styles={styles} setStyles={setStyles} active={activeDesign} setActive={setActiveDesign}>
                  {style => (
                    <div className="rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <input value={block.label} onChange={e => setExtraBlocks(prev => prev.map(item => item.id === block.id ? { ...item, label: e.target.value } : item))} className="h-8 flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-xs font-black uppercase tracking-[0.1em] text-neutral-500 outline-none focus:border-emerald-400" />
                        <button type="button" onClick={() => setExtraBlocks(prev => prev.filter(item => item.id !== block.id))} className="flex h-8 w-8 items-center justify-center rounded-xl border border-red-100 text-red-400 hover:border-red-300 hover:text-red-600">
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <RichTextEditor value={block.title} onChange={value => setExtraBlocks(prev => prev.map(item => item.id === block.id ? { ...item, title: value } : item))} className={inputClass()} style={style} placeholder="Titre" multiline={false} />
                      <RichTextEditor value={block.description} onChange={value => setExtraBlocks(prev => prev.map(item => item.id === block.id ? { ...item, description: value } : item))} className="mt-3 min-h-[100px] w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" style={style} placeholder="Description detaillee" />
                    </div>
                  )}
                </DesignEditorField>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Visibilite</label>
              <select value={form.visibility} onChange={e => setForm(prev => ({ ...prev, visibility: e.target.value as DemoEditorPayload['visibility'] }))} className={inputClass()}>
                <option value="public">Public</option>
                <option value="members">Membres</option>
                <option value="office">Bureau</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Statut</label>
              <select value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value as DemoEditorPayload['status'] }))} className={inputClass()}>
                <option value="draft">Brouillon</option>
                <option value="published">Publie</option>
                <option value="finished">Passe</option>
                <option value="cancelled">Annule</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 gap-3 border-t border-neutral-100 px-5 py-4 sm:px-6">
          <button onClick={onClose} className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-600 hover:border-neutral-300">Annuler</button>
          <button onClick={save} disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-60">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
