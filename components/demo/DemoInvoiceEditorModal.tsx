'use client';

import { useMemo, useRef, useState } from 'react';
import {
  Building2,
  CheckSquare,
  Download,
  FileText,
  GripVertical,
  Loader2,
  Palette,
  Plus,
  ReceiptText,
  Save,
  Search,
  Settings,
  Square,
  Trash2,
  Upload,
  X,
  Bold,
  Italic,
} from 'lucide-react';
import { applyInlineTextStyle, captureTextSelection, sanitizeRichHtml, type StoredTextSelection } from '@/lib/rich-text';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { demoMembers } from '@/data/demo/demo-members';
import { formatFullName } from '@/lib/format-name';

type InvoiceLine = { id: number; designation: string; qty: number | string; ht: number | string; vat: number | string };
type LayoutBlockId = 'assoc' | 'client' | 'items' | 'notes' | 'totals' | 'legal';
type BlockDesign = {
  bg: string;
  border: string;
  radius: number;
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  color: string;
};
type PalettePosition = { x: number; y: number };

type DemoMember = typeof demoMembers[number];

type AssociationInvoiceInfo = {
  name: string;
  title: string;
  address: string;
  registration: string;
  email: string;
  phone: string;
  logo: string;
  logoUrl: string;
};

type InvoicePdfDocument = {
  association: AssociationInvoiceInfo;
  invoiceTitle: string;
  invoiceNumber: string;
  recipient: { name: string; email?: string; phone?: string; address?: string; memberId?: string };
  lines: InvoiceLine[];
  notes: string;
  legal: string;
  dueDate: string;
};

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const ASSOCIATION_STORAGE_KEY = 'salam_demo_invoice_association_v1';

const defaultBlockDesign: BlockDesign = {
  bg: '#ffffff',
  border: '#e5e7eb',
  radius: 14,
  fontSize: 13,
  fontFamily: 'Inter, system-ui, sans-serif',
  bold: false,
  italic: false,
  color: '#111827',
};

const initialAssociation: AssociationInvoiceInfo = {
  name: 'ASSOCIATION SALAM',
  title: 'SALAM Cameroun - Maroc',
  address: "Adresse de l'association",
  registration: "N d'immatriculation : SALAM-CMR-2026",
  email: 'contact@salam-cameroun.com',
  phone: '+237 000 000 000',
  logo: 'SALAM',
  logoUrl: '',
};

const COTIS_LABEL: Record<string, string> = {
  paid: 'A jour',
  unpaid: 'Impaye',
  exempt: 'Exempte',
};

const COTIS_BADGE: Record<string, string> = {
  paid: 'bg-emerald-50 text-emerald-700',
  unpaid: 'bg-red-50 text-red-700',
  exempt: 'bg-neutral-100 text-neutral-600',
};

function seq(n: number) {
  return String(n).padStart(4, '0');
}

function fmtCfa(amount: number) {
  return `${Number(amount || 0).toLocaleString('fr-FR')} F.CFA`;
}

function loadAssociationInfo(): AssociationInvoiceInfo {
  if (typeof window === 'undefined') return initialAssociation;
  try {
    const raw = window.localStorage.getItem(ASSOCIATION_STORAGE_KEY);
    return raw ? { ...initialAssociation, ...JSON.parse(raw) } : initialAssociation;
  } catch {
    return initialAssociation;
  }
}

function saveAssociationInfo(info: AssociationInvoiceInfo) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ASSOCIATION_STORAGE_KEY, JSON.stringify(info));
}

function calcInvoiceTotals(lines: InvoiceLine[]) {
  const ht = lines.reduce((sum, line) => sum + Number(line.qty || 0) * Number(line.ht || 0), 0);
  const vat = lines.reduce((sum, line) => sum + Number(line.qty || 0) * Number(line.ht || 0) * (Number(line.vat || 0) / 100), 0);
  return { ht, vat, ttc: ht + vat };
}

function esc(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function rich(value: unknown) {
  return sanitizeRichHtml(String(value ?? '').replace(/\n/g, '<br>'));
}

function normalizeName(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function memberAddress(member: DemoMember) {
  return [member.residenceCity, member.city, member.country].filter(Boolean).join(', ');
}

function openInvoicePdfBatch(documents: InvoicePdfDocument[]) {
  const pages = documents.map(doc => {
    const totals = calcInvoiceTotals(doc.lines);
    const rows = doc.lines.map(line => {
      const ttc = Number(line.qty || 0) * Number(line.ht || 0) * (1 + Number(line.vat || 0) / 100);
      return `<tr><td>${rich(line.designation)}</td><td class="right">${esc(line.qty)}</td><td class="right">${fmtCfa(Number(line.ht || 0))}</td><td class="right">${esc(line.vat)}%</td><td class="right strong">${fmtCfa(ttc)}</td></tr>`;
    }).join('');

    return `
      <section class="page">
        <div class="flag"></div>
        <header class="header">
          <p class="eyebrow">${esc(doc.association.name)}</p>
          <h1>${esc(doc.invoiceTitle)}</h1>
          <p class="white-muted">${esc(doc.invoiceNumber)} - Echeance ${esc(doc.dueDate || 'a renseigner')}</p>
        </header>
        <div class="grid">
          <div class="card compact">
            <h2>Emetteur</h2>
            <p class="strong">${esc(doc.association.title)}</p>
            <p class="muted">${esc(doc.association.address)}</p>
            <p class="muted">${esc(doc.association.registration)}</p>
            <p class="muted">${esc(doc.association.email)} - ${esc(doc.association.phone)}</p>
          </div>
          <div class="card compact">
            <h2>Facture a</h2>
            <p class="strong">${esc(doc.recipient.name)}</p>
            <p class="muted">${esc(doc.recipient.email)}</p>
            <p class="muted">${esc(doc.recipient.phone)}</p>
            <p class="muted">${esc(doc.recipient.address)}</p>
            <p class="muted">${esc(doc.recipient.memberId)}</p>
          </div>
        </div>
        <table>
          <thead><tr><th>Designation</th><th class="right">Qte</th><th class="right">HT</th><th class="right">TVA</th><th class="right">TTC</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="totals">
          <div class="row"><span>Total HT</span><b>${fmtCfa(totals.ht)}</b></div>
          <div class="row"><span>TVA</span><b>${fmtCfa(totals.vat)}</b></div>
          <div class="row total"><span>Total TTC</span><b>${fmtCfa(totals.ttc)}</b></div>
        </div>
        <div class="notes">
          <div class="card"><h2>Observations</h2><p>${rich(doc.notes)}</p></div>
          <div class="card"><h2>Mentions</h2><p>${rich(doc.legal)}</p></div>
        </div>
        <footer class="footer">${esc(doc.association.name)} - Document de demonstration genere localement</footer>
      </section>
    `;
  }).join('');

  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Factures SALAM demo</title><style>
    @page{size:A4 portrait;margin:0}*{box-sizing:border-box}body{margin:0;background:#e5e7eb;font-family:Arial,sans-serif;color:#0f172a;font-size:clamp(10px,1.45vw,13px)}.toolbar{position:sticky;top:0;z-index:10;display:flex;justify-content:center;padding:12px;background:rgba(15,23,42,.88)}.toolbar button{border:0;border-radius:999px;background:#059669;color:white;padding:10px 16px;font-weight:800}.page{width:min(100vw,794px);min-height:min(1123px,calc(100vw * 1.414));margin:0 auto 18px;background:white;padding:clamp(22px,4.8vw,42px);position:relative;overflow:hidden;box-shadow:0 18px 55px rgba(15,23,42,.18)}.flag{position:absolute;left:0;right:0;top:0;height:clamp(4px,.8vw,7px);background:linear-gradient(90deg,#0B8F3A 0 33%,#C8102E 33% 66%,#F7C600 66%)}.header{margin:calc(clamp(22px,4.8vw,42px) * -1) calc(clamp(22px,4.8vw,42px) * -1) clamp(18px,3vw,28px);padding:clamp(32px,5vw,42px) clamp(22px,4.8vw,42px) clamp(18px,3vw,26px);background:linear-gradient(135deg,#087348,#075f41 62%,#043d2d);color:white}.eyebrow{color:#fde68a;font-size:clamp(8px,1.6vw,11px);font-weight:800;letter-spacing:.2em;text-transform:uppercase}h1{margin:clamp(8px,2vw,12px) 0 5px;font-size:clamp(22px,5vw,31px);line-height:1}.white-muted{color:rgba(255,255,255,.74)}.muted{color:#64748b;overflow-wrap:anywhere}.grid,.notes{display:grid;grid-template-columns:1fr 1fr;gap:clamp(12px,2.4vw,18px)}.card{border:1px solid #e5e7eb;border-radius:clamp(12px,2.5vw,18px);padding:clamp(13px,2.6vw,20px);background:white}.compact{min-height:clamp(128px,23vw,170px)}.card h2{margin:0 0 10px;font-size:clamp(9px,1.7vw,12px);letter-spacing:.14em;text-transform:uppercase;color:#64748b}table{width:100%;border-collapse:collapse;margin-top:clamp(16px,3vw,22px);font-size:clamp(9px,1.6vw,12px);table-layout:fixed}th{background:#0f172a;color:white;text-align:left;padding:clamp(8px,1.7vw,11px) clamp(6px,1.5vw,10px);font-size:clamp(7px,1.4vw,10px);letter-spacing:.1em;text-transform:uppercase}td{border-bottom:1px solid #eef2f7;padding:clamp(8px,1.7vw,11px) clamp(6px,1.5vw,10px);vertical-align:top;overflow-wrap:anywhere}th:first-child,td:first-child{width:44%}.right{text-align:right}.strong{font-weight:800}.totals{width:min(100%,310px);margin-left:auto;margin-top:clamp(16px,3vw,22px);border:1px solid #e5e7eb;border-radius:18px;padding:clamp(14px,2.6vw,18px);background:#f8fafc}.row{display:flex;justify-content:space-between;gap:18px;margin:8px 0}.total{background:#087348;color:white;border-radius:14px;padding:clamp(11px,2.2vw,14px);margin-top:12px;font-weight:900}.notes{margin-top:clamp(18px,3vw,24px)}.footer{position:absolute;left:clamp(22px,4.8vw,42px);right:clamp(22px,4.8vw,42px);bottom:clamp(14px,3vw,26px);display:flex;justify-content:center;border-top:1px solid #e5e7eb;padding-top:12px;color:#64748b;font-size:clamp(8px,1.5vw,11px)}@media(max-width:640px){.grid,.notes{grid-template-columns:1fr}.footer{position:static;margin-top:20px}}@media print{body{background:white;font-size:12px}.toolbar{display:none}.page{width:794px;min-height:1123px;margin:0;padding:38px;box-shadow:none;page-break-after:always}.header{margin:-38px -38px 26px;padding:40px 38px 24px}.flag{height:7px}.grid,.notes{grid-template-columns:1fr 1fr}.footer{left:38px;right:38px;bottom:24px;position:absolute}}
  </style></head><body><div class="toolbar"><button onclick="window.print()">Imprimer / PDF</button></div>${pages}</body></html>`;

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.close();
}

function InvoiceBlockPalette({ label, design, position, onMove, onChange, onInlineStyle, onClose }: {
  label: string;
  design: BlockDesign;
  position: PalettePosition;
  onMove: (position: PalettePosition) => void;
  onChange: (patch: Partial<BlockDesign>) => void;
  onInlineStyle: (patch: Partial<BlockDesign>) => boolean;
  onClose: () => void;
}) {
  const [drag, setDrag] = useState<{ sx: number; sy: number; x: number; y: number } | null>(null);
  const apply = (patch: Partial<BlockDesign>) => {
    if (patch.bold !== undefined || patch.italic !== undefined || patch.color !== undefined || patch.fontSize !== undefined || patch.fontFamily !== undefined) {
      onInlineStyle(patch);
      return;
    }
    onChange(patch);
  };

  return (
    <div
      data-design-palette="true"
      className="absolute z-50 w-[260px] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl"
      style={{ left: position.x, top: position.y }}
      onClick={event => event.stopPropagation()}
      onPointerMove={event => {
        if (!drag) return;
        onMove({ x: drag.x + event.clientX - drag.sx, y: drag.y + event.clientY - drag.sy });
      }}
      onPointerUp={() => setDrag(null)}
      onPointerLeave={() => setDrag(null)}
    >
      <div
        className="mb-4 flex cursor-grab items-center justify-between active:cursor-grabbing"
        onPointerDown={event => {
          event.preventDefault();
          event.stopPropagation();
          setDrag({ sx: event.clientX, sy: event.clientY, x: position.x, y: position.y });
        }}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Palette className="h-4 w-4" /></span>
          <div><p className="text-sm font-black text-slate-900">Design</p><p className="text-[11px] font-semibold text-slate-400">{label}</p></div>
        </div>
        <button type="button" onPointerDown={event => event.stopPropagation()} onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
      </div>
      <div className="space-y-3">
        <label className="block"><span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Police</span><select value={design.fontFamily} onChange={event => apply({ fontFamily: event.target.value })} className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2 text-xs outline-none"><option value="Inter, system-ui, sans-serif">Inter</option><option value="Georgia, serif">Georgia</option><option value="'Times New Roman', serif">Times</option><option value="'Courier New', monospace">Mono</option></select></label>
        <label className="block"><span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Taille : {design.fontSize}px</span><input type="range" min="10" max="26" value={design.fontSize} onChange={event => apply({ fontSize: Number(event.target.value) })} className="mt-2 w-full accent-emerald-700" /></label>
        <div className="grid grid-cols-3 gap-2">
          <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => apply({ bold: !design.bold })} className={`h-9 rounded-lg border ${design.bold ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500'}`}><Bold className="mx-auto h-4 w-4" /></button>
          <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => apply({ italic: !design.italic })} className={`h-9 rounded-lg border ${design.italic ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500'}`}><Italic className="mx-auto h-4 w-4" /></button>
          <div className="h-9 rounded-lg border border-slate-200 p-1"><input aria-label="Couleur du texte" type="color" value={design.color} onChange={event => apply({ color: event.target.value })} className="h-full w-full" /></div>
        </div>
        <div className="grid grid-cols-2 gap-2"><label className="block"><span className="text-[10px] font-black uppercase text-slate-400">Fond</span><input type="color" value={design.bg} onChange={event => onChange({ bg: event.target.value })} className="mt-1 h-8 w-full rounded-lg" /></label><label className="block"><span className="text-[10px] font-black uppercase text-slate-400">Bordure</span><input type="color" value={design.border} onChange={event => onChange({ border: event.target.value })} className="mt-1 h-8 w-full rounded-lg" /></label></div>
        <label className="block"><span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Arrondi : {design.radius}px</span><input type="range" min="0" max="36" value={design.radius} onChange={event => onChange({ radius: Number(event.target.value) })} className="mt-2 w-full accent-emerald-700" /></label>
      </div>
    </div>
  );
}

function DraggableBox({ id, label, offsets, setOffsets, designs, setDesigns, activeDesign, setActiveDesign, children }: {
  id: LayoutBlockId;
  label: string;
  offsets: Record<LayoutBlockId, { x: number; y: number }>;
  setOffsets: React.Dispatch<React.SetStateAction<Record<LayoutBlockId, { x: number; y: number }>>>;
  designs: Record<LayoutBlockId, BlockDesign>;
  setDesigns: React.Dispatch<React.SetStateAction<Record<LayoutBlockId, BlockDesign>>>;
  activeDesign: LayoutBlockId | null;
  setActiveDesign: React.Dispatch<React.SetStateAction<LayoutBlockId | null>>;
  children: React.ReactNode;
}) {
  const [drag, setDrag] = useState<{ startX: number; startY: number; x: number; y: number } | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selectionRef = useRef<StoredTextSelection | null>(null);
  const selectionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [palettePosition, setPalettePosition] = useState<PalettePosition>({ x: 12, y: 44 });
  const pos = offsets[id];
  const design = designs[id] ?? defaultBlockDesign;
  const updateDesign = (patch: Partial<BlockDesign>) => setDesigns(prev => ({ ...prev, [id]: { ...(prev[id] ?? defaultBlockDesign), ...patch } }));
  const closePalette = () => {
    selectionRef.current = null;
    setActiveDesign(null);
  };
  const rememberSelection = (target: EventTarget | null) => {
    if (target instanceof HTMLElement && target.closest('[data-design-palette="true"]')) return;
    const selection = captureTextSelection(target);
    if (!selection) {
      if (target instanceof HTMLElement && rootRef.current?.contains(target)) closePalette();
      return;
    }
    selectionRef.current = selection;
    setActiveDesign(id);
    if (selection.kind === 'rich' && rootRef.current) {
      const rangeRect = selection.range.getBoundingClientRect();
      const rootRect = rootRef.current.getBoundingClientRect();
      setPalettePosition({
        x: Math.max(8, Math.min(rangeRect.left - rootRect.left, rootRect.width - 270)),
        y: Math.max(36, rangeRect.top - rootRect.top - 12),
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
  const inlineStyle = (patch: Partial<BlockDesign>) => {
    const selection = selectionRef.current;
    if (!selection) return false;
    const applied = applyInlineTextStyle(selection, {
      bold: patch.bold,
      italic: patch.italic,
      color: patch.color,
      fontSize: patch.fontSize,
      fontFamily: patch.fontFamily,
    });
    if (applied) selectionRef.current = captureTextSelection(selection.element);
    return applied;
  };

  return (
    <div
      ref={rootRef}
      className="group relative border"
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        zIndex: drag || activeDesign === id ? 30 : undefined,
        background: design.bg,
        borderColor: design.border,
        borderRadius: design.radius,
      }}
      onPointerMove={event => {
        if (!drag) return;
        setOffsets(prev => ({ ...prev, [id]: { x: drag.x + event.clientX - drag.startX, y: drag.y + event.clientY - drag.startY } }));
      }}
      onPointerUp={() => setDrag(null)}
      onPointerLeave={() => setDrag(null)}
      onMouseUpCapture={rememberSelectionAfterRelease}
      onTouchEndCapture={rememberSelectionAfterRelease}
      onKeyUpCapture={event => rememberSelection(event.target)}
    >
      <div className="absolute -top-9 left-3 z-40 hidden items-center gap-1 rounded-2xl border border-emerald-200 bg-white/95 px-2 py-1 shadow-lg backdrop-blur group-hover:flex">
        <button type="button" onPointerDown={event => { event.preventDefault(); event.stopPropagation(); setDrag({ startX: event.clientX, startY: event.clientY, x: pos.x, y: pos.y }); }} className="flex h-7 w-7 cursor-grab items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100" title="Glisser-deposer ce bloc"><GripVertical className="h-4 w-4" /></button>
        <button type="button" onClick={event => { event.stopPropagation(); if (selectionRef.current) setActiveDesign(activeDesign === id ? null : id); }} className="flex h-7 w-7 items-center justify-center rounded-xl text-emerald-700 hover:bg-emerald-50" title="Personnaliser le design"><Palette className="h-4 w-4" /></button>
        <span className="px-1 text-[9px] font-black uppercase tracking-[0.08em] text-emerald-700">{label}</span>
      </div>
      {children}
      {activeDesign === id && selectionRef.current && <InvoiceBlockPalette label={label} design={design} position={palettePosition} onMove={setPalettePosition} onChange={updateDesign} onInlineStyle={inlineStyle} onClose={closePalette} />}
    </div>
  );
}

export function DemoInvoiceEditorModal({ onClose, onCreated }: { onClose: () => void; onCreated?: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [association, setAssociation] = useState<AssociationInvoiceInfo>(() => loadAssociationInfo());
  const [invoiceTitle, setInvoiceTitle] = useState('Adhesion');
  const [description, setDescription] = useState("Frais et contribution lies aux activites de l'association.");
  const [dueDate, setDueDate] = useState(today);
  const [paymentLink, setPaymentLink] = useState('');
  const [recipientMode, setRecipientMode] = useState<'all' | 'select'>('select');
  const [selected, setSelected] = useState<string[]>([demoMembers[0]?._id].filter(Boolean));
  const [memberSearch, setMemberSearch] = useState('');
  const [cotisFilter, setCotisFilter] = useState<'all' | string>('all');
  const [notes, setNotes] = useState("Merci pour votre engagement au sein de SALAM. Cette facture correspond aux frais ou contributions valides par l'association.");
  const [legal, setLegal] = useState('Association SALAM - document genere electroniquement. Paiement a effectuer selon les moyens valides par le bureau executif.');
  const [lines, setLines] = useState<InvoiceLine[]>([
    { id: 1, designation: "Frais d'adhesion annuelle", qty: 1, ht: 5000, vat: 0 },
  ]);
  const [blockOffsets, setBlockOffsets] = useState<Record<LayoutBlockId, { x: number; y: number }>>({
    assoc: { x: 0, y: 0 },
    client: { x: 0, y: 0 },
    items: { x: 0, y: 0 },
    notes: { x: 0, y: 0 },
    totals: { x: 0, y: 0 },
    legal: { x: 0, y: 0 },
  });
  const [blockDesigns, setBlockDesigns] = useState<Record<LayoutBlockId, BlockDesign>>({
    assoc: defaultBlockDesign,
    client: defaultBlockDesign,
    items: defaultBlockDesign,
    notes: defaultBlockDesign,
    totals: { ...defaultBlockDesign, bg: '#f9fafb' },
    legal: defaultBlockDesign,
  });
  const [activeBlockDesign, setActiveBlockDesign] = useState<LayoutBlockId | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const totals = useMemo(() => calcInvoiceTotals(lines), [lines]);
  const year = new Date().getFullYear();
  const previewNumber = `SALAM-FACT-${year}-0001`;

  const filteredMembers = useMemo(() =>
    demoMembers.filter(member => {
      const q = normalizeName(`${member.firstName} ${member.lastName} ${member.email ?? ''} ${member.memberId ?? ''}`);
      const matchSearch = !memberSearch.trim() || q.includes(normalizeName(memberSearch));
      const matchCotis = cotisFilter === 'all' || member.cotisationStatus === cotisFilter;
      return matchSearch && matchCotis;
    }),
  [memberSearch, cotisFilter]);

  const recipients = recipientMode === 'all'
    ? demoMembers
    : demoMembers.filter(member => selected.includes(member._id));
  const previewMember = recipients[0] ?? demoMembers[0];
  const allFilteredSelected = filteredMembers.length > 0 && filteredMembers.every(member => selected.includes(member._id));

  const inputCls = (err?: string) =>
    `w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${err ? 'border-red-300 focus:ring-red-500/15' : 'border-neutral-200 focus:border-emerald-500 focus:ring-emerald-500/15'}`;

  const updateAssociation = (patch: Partial<AssociationInvoiceInfo>) => setAssociation(prev => ({ ...prev, ...patch }));
  const persistAssociation = () => saveAssociationInfo(association);
  const updateLine = (id: number, patch: Partial<InvoiceLine>) => setLines(prev => prev.map(line => line.id === id ? { ...line, ...patch } : line));
  const addLine = () => setLines(prev => [...prev, { id: Date.now(), designation: 'Nouvelle ligne', qty: 1, ht: 0, vat: 0 }]);
  const removeLine = (id: number) => setLines(prev => prev.length > 1 ? prev.filter(line => line.id !== id) : prev);
  const toggleMember = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelected(prev => prev.filter(id => !filteredMembers.some(member => member._id === id)));
      return;
    }
    setSelected(prev => [...new Set([...prev, ...filteredMembers.map(member => member._id)])]);
  };

  const handleLogoImport = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateAssociation({ logoUrl: String(reader.result ?? '') });
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!invoiceTitle.trim()) next.title = 'Titre requis';
    if (!dueDate) next.dueDate = 'Echeance requise';
    if (totals.ttc <= 0) next.amount = 'Le total doit etre superieur a 0';
    if (recipientMode === 'select' && selected.length === 0) next.recipients = 'Selectionnez au moins un destinataire';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildDocs = () => {
    const targetRecipients = recipients.length ? recipients : [previewMember];
    return targetRecipients.map((member, index) => ({
      association,
      invoiceTitle,
      invoiceNumber: `${previewNumber}-${seq(index + 1)}`,
      recipient: {
        name: formatFullName(member.firstName, member.lastName),
        email: member.email,
        phone: (member as { phone?: string }).phone ?? '',
        address: memberAddress(member),
        memberId: member.memberId,
      },
      lines,
      notes,
      legal,
      dueDate,
    }));
  };

  const handlePdf = () => {
    persistAssociation();
    openInvoicePdfBatch(buildDocs());
  };

  const handleCreate = () => {
    if (!validate()) return;
    persistAssociation();
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      onCreated?.();
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-sm">
      <div className="mx-auto flex min-h-full max-w-7xl flex-col gap-4 py-4">
        <div className="flex flex-col gap-3 rounded-[26px] border border-white/10 bg-white px-4 py-4 shadow-2xl sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">Facturation SALAM</p>
            <h3 className="text-xl font-black tracking-[-0.04em] text-neutral-900">Editeur de facture A4</h3>
            <p className="mt-1 text-xs text-neutral-500">Mode demo local, calque sur l'editeur reel sans mutation backend.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button type="button" onClick={persistAssociation} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-black text-neutral-700 transition hover:border-emerald-200 hover:text-emerald-700">
              <Save size={14} /> Memoriser
            </button>
            <button type="button" onClick={handlePdf} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-black text-neutral-700 transition hover:border-emerald-200 hover:text-emerald-700">
              <Download size={14} /> Telecharger PDF
            </button>
            <button type="button" onClick={handleCreate} disabled={saving} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 text-xs font-black text-white transition hover:bg-emerald-700 disabled:opacity-60">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />} Creer
            </button>
            <button type="button" onClick={onClose} className="inline-flex h-10 items-center justify-center rounded-xl bg-neutral-950 px-3 text-xs font-black text-white transition hover:bg-neutral-800">
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="overflow-auto rounded-[28px] border border-white/10 bg-white p-3 shadow-2xl">
            <div className="min-w-[820px]">
              <div className="relative mx-auto overflow-hidden rounded-[18px] border border-neutral-200 bg-white shadow-xl" style={{ width: A4_WIDTH, minHeight: A4_HEIGHT }}>
                <div className="absolute left-0 right-0 top-0 h-2 bg-gradient-to-r from-emerald-600 via-red-600 to-amber-400" />
                <header className="bg-gradient-to-br from-[#087348] via-[#075f41] to-[#043d2d] px-10 pb-6 pt-10 text-white">
                  <input value={association.name} onChange={event => updateAssociation({ name: event.target.value })} className="w-full bg-transparent text-[11px] font-black uppercase tracking-[0.28em] text-yellow-200 outline-none" />
                  <p className="mt-1 text-xs font-semibold text-white/75">Solidaire Associative des Laureats du Maroc</p>
                  <input value={invoiceTitle} onChange={event => setInvoiceTitle(event.target.value)} className="mt-3 w-full bg-transparent text-[29px] font-black leading-none tracking-[-0.04em] text-white outline-none" />
                  <input value={previewNumber} readOnly className="mt-2 w-full bg-transparent font-mono text-xs text-white/70 outline-none" />
                </header>

                <div className="space-y-6 px-12 py-8">
                  <div className="grid grid-cols-2 gap-5">
                    <DraggableBox id="assoc" label="Emetteur" offsets={blockOffsets} setOffsets={setBlockOffsets} designs={blockDesigns} setDesigns={setBlockDesigns} activeDesign={activeBlockDesign} setActiveDesign={setActiveBlockDesign}>
                      <section className="rounded-[18px] border border-neutral-200 bg-white p-5">
                        <div className="mb-4 flex items-center gap-3">
                          <button type="button" onClick={() => logoInputRef.current?.click()} className="group relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-emerald-700 text-xs font-black text-white">
                            {association.logoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={association.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                            ) : association.logo}
                            <span className="absolute inset-0 hidden items-center justify-center bg-black/50 group-hover:flex"><Upload size={14} /></span>
                          </button>
                          <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={event => handleLogoImport(event.target.files?.[0])} />
                          <div className="min-w-0 flex-1">
                            <input value={association.title} onChange={event => updateAssociation({ title: event.target.value })} className="w-full font-black text-neutral-900 outline-none" />
                            <p className="text-xs text-neutral-400">Emetteur</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <input value={association.address} onChange={event => updateAssociation({ address: event.target.value })} className={inputCls()} />
                          <input value={association.registration} onChange={event => updateAssociation({ registration: event.target.value })} className={inputCls()} />
                          <input value={association.email} onChange={event => updateAssociation({ email: event.target.value })} className={inputCls()} />
                          <input value={association.phone} onChange={event => updateAssociation({ phone: event.target.value })} className={inputCls()} />
                        </div>
                      </section>
                    </DraggableBox>

                    <DraggableBox id="client" label="Client" offsets={blockOffsets} setOffsets={setBlockOffsets} designs={blockDesigns} setDesigns={setBlockDesigns} activeDesign={activeBlockDesign} setActiveDesign={setActiveBlockDesign}>
                      <section className="rounded-[18px] border border-neutral-200 bg-white p-5">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-400">Facture a</p>
                        {previewMember ? (
                          <div className="mt-4 space-y-1 text-sm">
                            <p className="text-base font-black text-neutral-900">{formatFullName(previewMember.firstName, previewMember.lastName)}</p>
                            <p className="text-neutral-500">{previewMember.email}</p>
                            <p className="text-neutral-500">{(previewMember as { phone?: string }).phone ?? 'Telephone non renseigne'}</p>
                            <p className="text-neutral-500">{memberAddress(previewMember) || 'Adresse non renseignee'}</p>
                            <p className="font-mono text-xs text-neutral-400">{previewMember.memberId}</p>
                          </div>
                        ) : (
                          <p className="mt-4 text-sm font-semibold text-neutral-400">Selectionnez un destinataire.</p>
                        )}
                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <label className="block">
                            <span className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Echeance</span>
                            <input type="date" min={today} value={dueDate} onChange={event => setDueDate(event.target.value)} className={inputCls(errors.dueDate)} />
                          </label>
                          <label className="block">
                            <span className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Lien paiement</span>
                            <input value={paymentLink} onChange={event => setPaymentLink(event.target.value)} placeholder="https://..." className={inputCls()} />
                          </label>
                        </div>
                      </section>
                    </DraggableBox>
                  </div>

                  <DraggableBox id="items" label="Lignes" offsets={blockOffsets} setOffsets={setBlockOffsets} designs={blockDesigns} setDesigns={setBlockDesigns} activeDesign={activeBlockDesign} setActiveDesign={setActiveBlockDesign}>
                    <section className="rounded-[18px] border border-neutral-200 bg-white p-5">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="font-black text-neutral-900">Designations</h4>
                        <button type="button" onClick={addLine} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-black text-white"><Plus size={13} /> Ligne</button>
                      </div>
                      <div className="grid grid-cols-[1fr_64px_95px_64px_100px_32px] rounded-t-xl bg-neutral-950 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white">
                        <span>Designation</span><span>Qte</span><span>HT</span><span>TVA</span><span>TTC</span><span />
                      </div>
                      {lines.map(line => {
                        const ttc = Number(line.qty || 0) * Number(line.ht || 0) * (1 + Number(line.vat || 0) / 100);
                        return (
                          <div key={line.id} className="grid grid-cols-[1fr_64px_95px_64px_100px_32px] items-center border-b border-neutral-100 px-3 py-2 text-sm">
                            <RichTextEditor value={String(line.designation ?? '')} onChange={value => updateLine(line.id, { designation: value })} className="min-w-0 rounded-lg px-2 py-1 outline-emerald-300" multiline={false} />
                            <input type="number" value={line.qty} onChange={event => updateLine(line.id, { qty: event.target.value })} className="w-14 rounded-lg px-2 py-1 outline-emerald-300" />
                            <input type="number" value={line.ht} onChange={event => updateLine(line.id, { ht: event.target.value })} className="w-20 rounded-lg px-2 py-1 outline-emerald-300" />
                            <input type="number" value={line.vat} onChange={event => updateLine(line.id, { vat: event.target.value })} className="w-14 rounded-lg px-2 py-1 outline-emerald-300" />
                            <b className="text-xs">{fmtCfa(ttc)}</b>
                            <button type="button" onClick={() => removeLine(line.id)} className="text-red-500"><Trash2 size={14} /></button>
                          </div>
                        );
                      })}
                    </section>
                  </DraggableBox>

                  <div className="grid grid-cols-[1fr_310px] gap-5">
                    <DraggableBox id="notes" label="Observations" offsets={blockOffsets} setOffsets={setBlockOffsets} designs={blockDesigns} setDesigns={setBlockDesigns} activeDesign={activeBlockDesign} setActiveDesign={setActiveBlockDesign}>
                      <section className="rounded-[18px] border border-neutral-200 bg-white p-5">
                        <h4 className="mb-2 font-black text-neutral-900">Observations</h4>
                        <RichTextEditor value={notes} onChange={setNotes} className="min-h-[98px] w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-emerald-300" />
                      </section>
                    </DraggableBox>
                    <DraggableBox id="totals" label="Totaux" offsets={blockOffsets} setOffsets={setBlockOffsets} designs={blockDesigns} setDesigns={setBlockDesigns} activeDesign={activeBlockDesign} setActiveDesign={setActiveBlockDesign}>
                      <section className="rounded-[18px] border border-neutral-200 bg-neutral-50 p-5">
                        <h4 className="mb-3 font-black text-neutral-900">Totaux</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span>Total HT</span><b>{fmtCfa(totals.ht)}</b></div>
                          <div className="flex justify-between"><span>TVA</span><b>{fmtCfa(totals.vat)}</b></div>
                          <div className="mt-3 flex justify-between rounded-xl bg-emerald-700 px-4 py-3 text-white"><span className="font-bold">Total TTC</span><b>{fmtCfa(totals.ttc)}</b></div>
                        </div>
                      </section>
                    </DraggableBox>
                  </div>

                  <DraggableBox id="legal" label="Mentions" offsets={blockOffsets} setOffsets={setBlockOffsets} designs={blockDesigns} setDesigns={setBlockDesigns} activeDesign={activeBlockDesign} setActiveDesign={setActiveBlockDesign}>
                    <section className="rounded-[18px] border border-neutral-200 bg-white p-5">
                      <h4 className="mb-2 font-black text-neutral-900">Mentions legales</h4>
                      <RichTextEditor value={legal} onChange={setLegal} className="min-h-[76px] w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs outline-emerald-300" />
                    </section>
                  </DraggableBox>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <section className="rounded-[26px] border border-white/10 bg-white p-5 shadow-xl">
              <div className="mb-4 flex items-center gap-2">
                <ReceiptText size={18} className="text-emerald-700" />
                <h4 className="font-black text-neutral-900">Parametres</h4>
              </div>
              <div className="space-y-3">
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Titre</span>
                  <input value={invoiceTitle} onChange={event => setInvoiceTitle(event.target.value)} className={inputCls(errors.title)} />
                </label>
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Description API</span>
                  <textarea value={description} onChange={event => setDescription(event.target.value)} rows={3} className="w-full resize-none rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-emerald-300" />
                </label>
              </div>
              {(errors.title || errors.amount || errors.recipients || errors.dueDate) && (
                <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-600">
                  {Object.values(errors).filter(Boolean).join(' - ')}
                </div>
              )}
            </section>

            <section className="rounded-[26px] border border-white/10 bg-white p-5 shadow-xl">
              <div className="mb-4 flex items-center gap-2">
                <Building2 size={18} className="text-emerald-700" />
                <h4 className="font-black text-neutral-900">Destinataires</h4>
              </div>
              <div className="mb-3 flex gap-2">
                <button type="button" onClick={() => setRecipientMode('all')} className={`flex-1 rounded-xl border px-3 py-2 text-xs font-black ${recipientMode === 'all' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-neutral-200 text-neutral-500'}`}>Tous actifs</button>
                <button type="button" onClick={() => setRecipientMode('select')} className={`flex-1 rounded-xl border px-3 py-2 text-xs font-black ${recipientMode === 'select' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-neutral-200 text-neutral-500'}`}>Selection</button>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input value={memberSearch} onChange={event => setMemberSearch(event.target.value)} placeholder="Rechercher..." className="h-10 w-full rounded-xl border border-neutral-200 pl-9 pr-3 text-sm outline-emerald-300" />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(['all', 'unpaid', 'paid', 'exempt'] as const).map(filter => (
                  <button key={filter} type="button" onClick={() => setCotisFilter(filter)} className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${cotisFilter === filter ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-neutral-200 text-neutral-500'}`}>
                    {filter === 'all' ? 'Tous' : COTIS_LABEL[filter]}
                  </button>
                ))}
              </div>
              {recipientMode === 'select' && (
                <>
                  <button type="button" onClick={toggleSelectAll} className="mt-3 flex items-center gap-2 text-xs font-black text-emerald-700">
                    {allFilteredSelected ? <CheckSquare size={15} /> : <Square size={15} />}
                    Selectionner tout ({filteredMembers.length})
                  </button>
                  <div className="mt-3 max-h-72 divide-y divide-neutral-50 overflow-auto rounded-2xl border border-neutral-100">
                    {filteredMembers.map(member => (
                      <label key={member._id} className="flex cursor-pointer items-center gap-3 px-3 py-2.5 transition hover:bg-neutral-50">
                        <input type="checkbox" checked={selected.includes(member._id)} onChange={() => toggleMember(member._id)} className="h-4 w-4 accent-emerald-600" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-black text-neutral-900">{formatFullName(member.firstName, member.lastName)}</p>
                          <p className="truncate font-mono text-[10px] text-neutral-400">{member.memberId}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black ${COTIS_BADGE[member.cotisationStatus]}`}>
                          {COTIS_LABEL[member.cotisationStatus]}
                        </span>
                      </label>
                    ))}
                  </div>
                </>
              )}
              <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-center">
                <p className="text-3xl font-black text-emerald-800">{recipients.length}</p>
                <p className="text-xs font-bold text-emerald-700">facture(s) preparee(s)</p>
              </div>
            </section>

            <section className="rounded-[26px] border border-white/10 bg-white p-5 shadow-xl">
              <div className="mb-3 flex items-center gap-2">
                <Settings size={18} className="text-emerald-700" />
                <h4 className="font-black text-neutral-900">Controle A4</h4>
              </div>
              <ul className="space-y-2 text-xs font-semibold text-neutral-500">
                <li>Format apercu : 794 x 1123 px</li>
                <li>Padding PDF : 48 px</li>
                <li>Export navigateur : A4 portrait</li>
                <li>Infos association memorisables</li>
                <li>Montant = Total TTC</li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
