'use client';

import { useRef, useState } from 'react';
import { Bold, GripVertical, Italic, Palette, X } from 'lucide-react';
import { applyInlineTextStyle, captureTextSelection, type StoredTextSelection } from '@/lib/rich-text';

export type DesignStyle = {
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  color: string;
  bg: string;
  border: string;
  radius: number;
};

const defaultDesign: DesignStyle = {
  x: 0,
  y: 0,
  fontSize: 14,
  fontFamily: 'Inter, system-ui, sans-serif',
  bold: false,
  italic: false,
  color: '#111827',
  bg: '#ffffff',
  border: '#e5e7eb',
  radius: 12,
};

type PalettePosition = { x: number; y: number };

function DesignPalette({ label, style, position, onMove, onChange, onInlineStyle, onClose }: {
  label: string;
  style: DesignStyle;
  position: PalettePosition;
  onMove: (position: PalettePosition) => void;
  onChange: (patch: Partial<DesignStyle>) => void;
  onInlineStyle: (patch: Partial<DesignStyle>) => boolean;
  onClose: () => void;
}) {
  const [drag, setDrag] = useState<{ sx: number; sy: number; x: number; y: number } | null>(null);
  const apply = (patch: Partial<DesignStyle>) => {
    if (
      patch.bold !== undefined
      || patch.italic !== undefined
      || patch.color !== undefined
      || patch.fontSize !== undefined
      || patch.fontFamily !== undefined
    ) {
      onInlineStyle(patch);
      onChange(patch); // met à jour l'état palette pour feedback visuel (bold/slider/couleur)
      return;
    }
    onChange(patch);
  };
  return (
    <div
      data-design-palette="true"
      className="absolute z-40 w-[260px] rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xl"
      style={{ left: position.x, top: position.y }}
      onClick={e => e.stopPropagation()}
      onPointerMove={event => {
        if (!drag) return;
        onMove({ x: drag.x + event.clientX - drag.sx, y: drag.y + event.clientY - drag.sy });
      }}
      onPointerUp={() => setDrag(null)}
      onPointerLeave={() => setDrag(null)}
    >
      <div
        className="mb-3 flex cursor-grab items-center justify-between active:cursor-grabbing"
        onPointerDown={event => {
          event.preventDefault();
          event.stopPropagation();
          setDrag({ sx: event.clientX, sy: event.clientY, x: position.x, y: position.y });
        }}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Palette size={15} /></span>
          <div>
            <p className="text-sm font-black text-neutral-900">Design</p>
            <p className="text-[11px] font-semibold text-neutral-400">{label}</p>
          </div>
        </div>
        <button type="button" onPointerDown={event => event.stopPropagation()} onClick={onClose} className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100"><X size={14} /></button>
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-neutral-400">Police</span>
          <select value={style.fontFamily} onChange={e => apply({ fontFamily: e.target.value })} className="mt-1 h-9 w-full rounded-lg border border-neutral-200 px-2 text-xs outline-none">
            <option value="Inter, system-ui, sans-serif">Inter</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="'Times New Roman', serif">Times</option>
            <option value="'Courier New', monospace">Mono</option>
          </select>
        </label>
        <label className="block">
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-neutral-400">Taille : {style.fontSize}px</span>
          <input type="range" min="11" max="32" value={style.fontSize} onChange={e => apply({ fontSize: Number(e.target.value) })} className="mt-2 w-full accent-emerald-700" />
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => apply({ bold: !style.bold })} className={`h-9 rounded-lg border ${style.bold ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-neutral-200 text-neutral-500'}`}><Bold size={14} className="mx-auto" /></button>
          <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => apply({ italic: !style.italic })} className={`h-9 rounded-lg border ${style.italic ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-neutral-200 text-neutral-500'}`}><Italic size={14} className="mx-auto" /></button>
          <div className="h-9 rounded-lg border border-neutral-200 p-1"><input aria-label="Couleur du texte" type="color" value={style.color} onChange={e => apply({ color: e.target.value })} className="h-full w-full" /></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="block"><span className="text-[10px] font-black uppercase text-neutral-400">Fond</span><input type="color" value={style.bg} onChange={e => onChange({ bg: e.target.value })} className="mt-1 h-8 w-full rounded-lg" /></label>
          <label className="block"><span className="text-[10px] font-black uppercase text-neutral-400">Bordure</span><input type="color" value={style.border} onChange={e => onChange({ border: e.target.value })} className="mt-1 h-8 w-full rounded-lg" /></label>
        </div>
        <label className="block">
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-neutral-400">Arrondi : {style.radius}px</span>
          <input type="range" min="0" max="30" value={style.radius} onChange={e => onChange({ radius: Number(e.target.value) })} className="mt-2 w-full accent-emerald-700" />
        </label>
      </div>
    </div>
  );
}

export function DesignEditorField({ id, label, styles, setStyles, active, setActive, children }: {
  id: string;
  label: string;
  styles: Record<string, DesignStyle>;
  setStyles: React.Dispatch<React.SetStateAction<Record<string, DesignStyle>>>;
  active: string | null;
  setActive: (id: string | null) => void;
  children: (style: React.CSSProperties) => React.ReactNode;
}) {
  const style = styles[id] ?? defaultDesign;
  const [drag, setDrag] = useState<{ x: number; y: number; sx: number; sy: number } | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selectionRef = useRef<StoredTextSelection | null>(null);
  const selectionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [palettePosition, setPalettePosition] = useState<PalettePosition>({ x: 12, y: 42 });
  const update = (patch: Partial<DesignStyle>) => setStyles(prev => ({ ...prev, [id]: { ...(prev[id] ?? defaultDesign), ...patch } }));
  const closePalette = (clearSelection = true) => {
    // Annuler le timer de 80ms qui pourrait ré-ouvrir la palette après le clic sur X
    if (selectionTimer.current) clearTimeout(selectionTimer.current);
    selectionRef.current = null;
    if (clearSelection) { try { window.getSelection()?.removeAllRanges(); } catch {} }
    setActive(null);
  };
  const rememberSelection = (target: EventTarget | null) => {
    if (target instanceof HTMLElement && target.closest('[data-design-palette="true"]')) return;
    const selection = captureTextSelection(target);
    if (!selection) {
      if (target instanceof HTMLElement && rootRef.current?.contains(target)) closePalette(false);
      return;
    }
    selectionRef.current = selection;
    setActive(id);
    if (selection.kind === 'rich' && rootRef.current) {
      const rangeRect = selection.range.getBoundingClientRect();
      const rootRect = rootRef.current.getBoundingClientRect();
      setPalettePosition({
        x: Math.max(8, Math.min(rangeRect.left - rootRect.left, rootRect.width - 270)),
        y: Math.max(34, rangeRect.top - rootRect.top - 12),
      });
    }
  };
  const rememberSelectionAfterRelease = () => {
    if (selectionTimer.current) clearTimeout(selectionTimer.current);
    selectionTimer.current = setTimeout(() => {
      const root = rootRef.current;
      const selection = window.getSelection();
      if (!root || !selection || selection.rangeCount === 0 || selection.isCollapsed) return;
      const range = selection.getRangeAt(0);
      if (!root.contains(range.commonAncestorContainer)) return;
      rememberSelection(range.commonAncestorContainer instanceof HTMLElement ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement);
    }, 80);
  };
  const inlineStyle = (patch: Partial<DesignStyle>) => {
    const selection = selectionRef.current;
    if (!selection) return false;
    const applied = applyInlineTextStyle(selection, {
      bold: patch.bold,
      italic: patch.italic,
      color: patch.color,
      fontSize: patch.fontSize,
      fontFamily: patch.fontFamily,
    });
    if (applied) {
      selectionRef.current = captureTextSelection(selection.element);
    }
    return applied;
  };
  const fieldStyle: React.CSSProperties = {
    background: style.bg,
    borderColor: style.border,
    borderRadius: style.radius,
  };

  return (
    <div
      ref={rootRef}
      className={`group relative ${active === id ? 'z-30' : ''}`}
      style={{ transform: `translate(${style.x}px, ${style.y}px)` }}
      onClick={e => e.stopPropagation()}
      onPointerMove={event => {
        if (!drag) return;
        update({ x: drag.x + event.clientX - drag.sx, y: drag.y + event.clientY - drag.sy });
      }}
      onPointerUp={() => setDrag(null)}
      onPointerLeave={() => setDrag(null)}
      onMouseUpCapture={rememberSelectionAfterRelease}
      onTouchEndCapture={rememberSelectionAfterRelease}
      onKeyUpCapture={e => rememberSelection(e.target)}
    >
      <div className="absolute -top-8 left-2 z-40 hidden items-center gap-1 rounded-xl border border-neutral-200 bg-white/95 px-1.5 py-1 shadow-lg group-hover:flex">
        <button type="button" onPointerDown={e => { e.preventDefault(); e.stopPropagation(); setDrag({ x: style.x, y: style.y, sx: e.clientX, sy: e.clientY }); }} className="flex h-6 w-6 cursor-grab items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100" title="Déplacer"><GripVertical size={13} /></button>
        <button type="button" onClick={e => { e.stopPropagation(); if (selectionRef.current) setActive(active === id ? null : id); }} className="flex h-6 w-6 items-center justify-center rounded-lg text-emerald-700 hover:bg-emerald-50" title="Design"><Palette size={13} /></button>
        <span className="px-1 text-[9px] font-black uppercase tracking-[0.08em] text-neutral-400">{label}</span>
      </div>
      {children(fieldStyle)}
      {active === id && selectionRef.current && <DesignPalette label={label} style={style} position={palettePosition} onMove={setPalettePosition} onChange={update} onInlineStyle={inlineStyle} onClose={closePalette} />}
    </div>
  );
}
