'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Plus, X, Send, Eye, ChevronDown, Search,
  CalendarDays, Banknote, FileText, CheckCircle2, Clock,
  Link as LinkIcon, Loader2, Trash2, Save, Download, Upload, Building2,
  CheckSquare, Square, UserPlus, Settings, ReceiptText, Pencil,
  Palette, GripVertical, Bold, Italic, Ban, SlidersHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useAdminInvoices, useCreateInvoice, useDeleteInvoice, useRemoveInvoiceRecipient,
  useUpdateInvoice,
  useInvoiceClients, useSaveInvoiceClient, useDeleteInvoiceClient, useClientDocuments,
  useResendClientDocument, useResendInvoiceRecipient,
  type InvoiceClientDoc, type InvoiceDoc, type RecipientDoc,
} from '@/lib/api/invoices';
import { useAdminReceipts, useUpdateReceipt, useCancelReceipt, type ReceiptDoc } from '@/lib/api/receipts';
import { downloadReceiptPdf } from '@/lib/receipt-pdf';
import { useAdminMembers, useAdminMember, type MemberListItem } from '@/lib/api/members';
import { formatFullName } from '@/lib/format-name';
import { applyInlineTextStyle, captureTextSelection, sanitizeRichHtml, type StoredTextSelection } from '@/lib/rich-text';
import { RichTextEditor } from '@/components/ui/RichTextEditor';

/* ─── Helpers ─────────────────────────────────────────── */
type InvoiceStatus = 'draft' | 'sent' | 'closed';

const STATUS_CONFIG: Record<InvoiceStatus, { badge: string; label: string; icon: React.ReactNode }> = {
  draft:  { badge: 'bg-neutral-50 text-neutral-600 border-neutral-200',  label: 'Brouillon', icon: <FileText size={10} />    },
  sent:   { badge: 'bg-blue-50 text-blue-700 border-blue-200',           label: 'Envoyée',   icon: <Clock size={10} />       },
  closed: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',  label: 'Clôturée',  icon: <CheckCircle2 size={10} /> },
};

const RECIPIENT_STATUS_CONFIG: Record<RecipientDoc['status'], { badge: string; label: string }> = {
  pending:   { badge: 'bg-neutral-50 text-neutral-600 border-neutral-200', label: 'A envoyer' },
  sent:      { badge: 'bg-red-50 text-red-600 border-red-200', label: 'Impayee' },
  partiel:   { badge: 'bg-orange-50 text-orange-600 border-orange-200', label: 'Partiel' },
  paid:      { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Payee' },
  cancelled: { badge: 'bg-red-50 text-red-700 border-red-200', label: 'Annulee' },
};

/* "T1".."T4" — dernière tranche payée, affiché hors du badge "Partiel" */
function trancheTag(lastPaidTranche?: number | null) {
  if (lastPaidTranche === undefined || lastPaidTranche === null) return null;
  return (
    <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-100 px-1 text-[9px] font-black text-orange-700">
      T{lastPaidTranche + 1}
    </span>
  );
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtCfa(amount: number) {
  return `${Number(amount || 0).toLocaleString('fr-FR')} F.CFA`;
}

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
type InvoicePdfRecipient = { name: string; email?: string; phone?: string; address?: string; memberId?: string };
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
  recipient: InvoicePdfRecipient;
  lines: InvoiceLine[];
  notes: string;
  legal: string;
  dueDate: string;
};

const ASSOCIATION_STORAGE_KEY = 'salam_invoice_association_v1';
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
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

function seq(n: number) {
  return String(n).padStart(4, '0');
}

const initialAssociation: AssociationInvoiceInfo = {
  name: 'ASSOCIATION SALAM',
  title: 'SALAM Cameroun · Maroc',
  address: 'Adresse de l’association',
  registration: 'N° d’immatriculation : SALAM-CMR-2026',
  email: 'contact@salam-cameroun.com',
  phone: '+237 000 000 000',
  logo: 'SALAM',
  logoUrl: '',
};

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
    if (
      patch.bold !== undefined
      || patch.italic !== undefined
      || patch.color !== undefined
      || patch.fontSize !== undefined
      || patch.fontFamily !== undefined
    ) {
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
      onClick={e => e.stopPropagation()}
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
        <label className="block"><span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Police</span><select value={design.fontFamily} onChange={e => apply({ fontFamily: e.target.value })} className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2 text-xs outline-none"><option value="Inter, system-ui, sans-serif">Inter</option><option value="Georgia, serif">Georgia</option><option value="'Times New Roman', serif">Times</option><option value="'Courier New', monospace">Mono</option></select></label>
        <label className="block"><span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Taille : {design.fontSize}px</span><input type="range" min="10" max="26" value={design.fontSize} onChange={e => apply({ fontSize: Number(e.target.value) })} className="mt-2 w-full accent-emerald-700" /></label>
        <div className="grid grid-cols-3 gap-2"><button type="button" onMouseDown={e => e.preventDefault()} onClick={() => apply({ bold: !design.bold })} className={`h-9 rounded-lg border ${design.bold ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500'}`}><Bold className="mx-auto h-4 w-4" /></button><button type="button" onMouseDown={e => e.preventDefault()} onClick={() => apply({ italic: !design.italic })} className={`h-9 rounded-lg border ${design.italic ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500'}`}><Italic className="mx-auto h-4 w-4" /></button><div className="h-9 rounded-lg border border-slate-200 p-1"><input aria-label="Couleur du texte" type="color" value={design.color} onChange={e => apply({ color: e.target.value })} className="h-full w-full" /></div></div>
        <div className="grid grid-cols-2 gap-2"><label className="block"><span className="text-[10px] font-black uppercase text-slate-400">Fond</span><input type="color" value={design.bg} onChange={e => onChange({ bg: e.target.value })} className="mt-1 h-8 w-full rounded-lg" /></label><label className="block"><span className="text-[10px] font-black uppercase text-slate-400">Bordure</span><input type="color" value={design.border} onChange={e => onChange({ border: e.target.value })} className="mt-1 h-8 w-full rounded-lg" /></label></div>
        <label className="block"><span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Arrondi : {design.radius}px</span><input type="range" min="0" max="36" value={design.radius} onChange={e => onChange({ radius: Number(e.target.value) })} className="mt-2 w-full accent-emerald-700" /></label>
      </div>
    </div>
  );
}

function DraggableBox({ id, label, offsets, setOffsets, designs, setDesigns, activeDesign, setActiveDesign, children, className = '' }: {
  id: LayoutBlockId;
  label: string;
  offsets: Record<LayoutBlockId, { x: number; y: number }>;
  setOffsets: React.Dispatch<React.SetStateAction<Record<LayoutBlockId, { x: number; y: number }>>>;
  designs: Record<LayoutBlockId, BlockDesign>;
  setDesigns: React.Dispatch<React.SetStateAction<Record<LayoutBlockId, BlockDesign>>>;
  activeDesign: LayoutBlockId | null;
  setActiveDesign: React.Dispatch<React.SetStateAction<LayoutBlockId | null>>;
  children: React.ReactNode;
  className?: string;
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
    if (applied) {
      selectionRef.current = captureTextSelection(selection.element);
    }
    return applied;
  };

  return (
    <div
      ref={rootRef}
      className={`group relative border ${className}`}
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
        <button type="button" onPointerDown={event => { event.preventDefault(); event.stopPropagation(); setDrag({ startX: event.clientX, startY: event.clientY, x: pos.x, y: pos.y }); }} className="flex h-7 w-7 cursor-grab items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100" title="Glisser-déposer ce bloc"><GripVertical className="h-4 w-4" /></button>
        <button type="button" onClick={event => { event.stopPropagation(); if (selectionRef.current) setActiveDesign(activeDesign === id ? null : id); }} className="flex h-7 w-7 items-center justify-center rounded-xl text-emerald-700 hover:bg-emerald-50" title="Personnaliser le design"><Palette className="h-4 w-4" /></button>
        <button type="button" className="flex h-7 w-7 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100" title="Modifier"><Pencil className="h-4 w-4" /></button>
        <span className="px-1 text-[9px] font-black uppercase tracking-[0.08em] text-emerald-700">{label}</span>
      </div>
      {children}
      {activeDesign === id && selectionRef.current && <InvoiceBlockPalette label={label} design={design} position={palettePosition} onMove={setPalettePosition} onChange={updateDesign} onInlineStyle={inlineStyle} onClose={closePalette} />}
    </div>
  );
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

function openInvoicePdfPreview(params: {
  association: AssociationInvoiceInfo;
  invoiceTitle: string;
  invoiceNumber: string;
  recipient: { name: string; email?: string; phone?: string; address?: string; memberId?: string };
  lines: InvoiceLine[];
  notes: string;
  legal: string;
  dueDate: string;
}) {
  const totals = calcInvoiceTotals(params.lines);
  const rows = params.lines.map(line => {
    const ttc = Number(line.qty || 0) * Number(line.ht || 0) * (1 + Number(line.vat || 0) / 100);
    return `
      <tr>
        <td>${rich(line.designation)}</td>
        <td class="right">${esc(line.qty)}</td>
        <td class="right">${fmtCfa(Number(line.ht || 0))}</td>
        <td class="right">${esc(line.vat)}%</td>
        <td class="right strong">${fmtCfa(ttc)}</td>
      </tr>
    `;
  }).join('');

  const html = `
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>${esc(params.invoiceNumber)}</title>
  <style>
    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { margin: 0; background: #e5e7eb; font-family: Arial, sans-serif; color: #0f172a; }
    .page {
      width: ${A4_WIDTH}px;
      min-height: ${A4_HEIGHT}px;
      margin: 0 auto;
      background: #fff;
      padding: 48px;
      position: relative;
      overflow: hidden;
    }
    .flag { position: absolute; left: 0; right: 0; top: 0; height: 8px; background: linear-gradient(90deg,#0B8F3A 0 33%,#C8102E 33% 66%,#F7C600 66%); }
    .header { margin: -48px -48px 32px; padding: 54px 48px 34px; background: linear-gradient(135deg,#087348,#075f41 62%,#043d2d); color: white; }
    .eyebrow { color: #fde68a; font-size: 11px; font-weight: 800; letter-spacing: .24em; text-transform: uppercase; }
    h1 { margin: 14px 0 6px; font-size: 34px; line-height: 1; }
    .muted { color: #64748b; }
    .white-muted { color: rgba(255,255,255,.72); }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
    .card { border: 1px solid #e5e7eb; border-radius: 18px; padding: 22px; background: #fff; }
    .card h2 { margin: 0 0 14px; font-size: 12px; letter-spacing: .16em; text-transform: uppercase; color: #64748b; }
    .logo { width: 58px; height: 58px; border-radius: 18px; background: #047857; color: white; display: inline-flex; align-items:center; justify-content:center; font-size: 12px; font-weight: 900; overflow: hidden; vertical-align: middle; margin-right: 12px; }
    .logo img { width: 100%; height: 100%; object-fit: cover; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
    th { background: #0f172a; color: white; text-align: left; padding: 12px 10px; font-size: 10px; letter-spacing: .12em; text-transform: uppercase; }
    td { border-bottom: 1px solid #eef2f7; padding: 12px 10px; vertical-align: top; }
    .right { text-align: right; }
    .strong { font-weight: 800; }
    .totals { width: 310px; margin-left: auto; margin-top: 22px; border: 1px solid #e5e7eb; border-radius: 18px; padding: 18px; background: #f8fafc; }
    .row { display: flex; justify-content: space-between; gap: 20px; margin: 8px 0; font-size: 13px; }
    .total { background: #087348; color: white; border-radius: 14px; padding: 14px; margin-top: 12px; font-weight: 900; }
    .notes { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 24px; }
    .footer { position: absolute; left: 48px; right: 48px; bottom: 30px; border-top: 1px solid #e5e7eb; padding-top: 14px; text-align: center; color: #64748b; font-size: 11px; }
    @media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      body { background: white; }
      .page { margin: 0; box-shadow: none; width: 794px; min-height: 1123px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="flag"></div>
    <header class="header">
      <div class="eyebrow">${esc(params.association.name)}</div>
      <p class="white-muted">Solidaire Associative des Lauréats du Maroc</p>
      <h1>${esc(params.invoiceTitle)}</h1>
      <p class="white-muted">${esc(params.invoiceNumber)} · Échéance ${esc(params.dueDate || 'à renseigner')}</p>
    </header>
    <section class="grid">
      <div class="card">
        <h2>Émetteur</h2>
        <div>
          <span class="logo">${params.association.logoUrl ? `<img src="${esc(params.association.logoUrl)}" alt="Logo" />` : esc(params.association.logo)}</span>
          <strong>${esc(params.association.title)}</strong>
        </div>
        <p class="muted">${esc(params.association.address)}</p>
        <p class="muted">${esc(params.association.registration)}</p>
        <p class="muted">${esc(params.association.email)} · ${esc(params.association.phone)}</p>
      </div>
      <div class="card">
        <h2>Facturé à</h2>
        <strong>${esc(params.recipient.name)}</strong>
        <p class="muted">${esc(params.recipient.email)}</p>
        <p class="muted">${esc(params.recipient.phone)}</p>
        <p class="muted">${esc(params.recipient.address)}</p>
        ${params.recipient.memberId ? `<p class="muted">N° membre : ${esc(params.recipient.memberId)}</p>` : ''}
      </div>
    </section>
    <table>
      <thead>
        <tr><th>Désignation</th><th class="right">Qté</th><th class="right">HT</th><th class="right">TVA</th><th class="right">TTC</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <section class="totals">
      <div class="row"><span>Total HT</span><strong>${fmtCfa(totals.ht)}</strong></div>
      <div class="row"><span>TVA</span><strong>${fmtCfa(totals.vat)}</strong></div>
      <div class="row total"><span>Total TTC</span><span>${fmtCfa(totals.ttc)}</span></div>
    </section>
    <section class="notes">
      <div class="card"><h2>Observations</h2><p class="muted">${esc(params.notes)}</p></div>
      <div class="card"><h2>Mentions légales</h2><p class="muted">${esc(params.legal)}</p></div>
    </section>
    <footer class="footer">${esc(params.association.title)} · ${esc(params.association.email)} · ${esc(params.association.phone)} · ${esc(params.association.registration)}</footer>
  </div>
  <script>window.addEventListener('load', () => setTimeout(() => window.print(), 250));</script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=900,height=1200');
  if (!win) {
    toast.error('Ouverture du PDF bloquée par le navigateur. Autorisez les popups pour télécharger/imprimer.');
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
}

function splitInvoiceLines(lines: InvoiceLine[]) {
  const chunks: InvoiceLine[][] = [];
  let index = 0;
  while (index < lines.length) {
    const size = chunks.length === 0 ? 8 : 14;
    chunks.push(lines.slice(index, index + size));
    index += size;
  }
  return chunks.length ? chunks : [[]];
}

function openInvoicePdfBatch(documents: InvoicePdfDocument[]) {
  const pages = documents.flatMap(doc => {
    const chunks = splitInvoiceLines(doc.lines);
    const totals = calcInvoiceTotals(doc.lines);
    return chunks.map((chunk, pageIndex) => {
      const isLast = pageIndex === chunks.length - 1;
      const rows = chunk.map(line => {
        const ttc = Number(line.qty || 0) * Number(line.ht || 0) * (1 + Number(line.vat || 0) / 100);
        return `<tr><td>${rich(line.designation)}</td><td class="right">${esc(line.qty)}</td><td class="right">${fmtCfa(Number(line.ht || 0))}</td><td class="right">${esc(line.vat)}%</td><td class="right strong">${fmtCfa(ttc)}</td></tr>`;
      }).join('');
      return `
        <div class="page-wrap">
        <article class="page">
          <div class="flag"></div>
          <header class="header">
            <div class="eyebrow">${esc(doc.association.name)}</div>
            <p class="white-muted">Solidaire Associative des Lauréats du Maroc</p>
            <h1>${esc(doc.invoiceTitle)}</h1>
            <p class="white-muted">${esc(doc.invoiceNumber)} · Échéance ${esc(doc.dueDate || 'à renseigner')}</p>
          </header>
          <section class="grid">
            <div class="card compact"><h2>Émetteur</h2><strong>${esc(doc.association.title)}</strong><p class="muted">${esc(doc.association.address)}</p><p class="muted">${esc(doc.association.registration)}</p><p class="muted">${esc(doc.association.email)} · ${esc(doc.association.phone)}</p></div>
            <div class="card compact"><h2>Facturé à</h2><strong>${esc(doc.recipient.name)}</strong><p class="muted">${esc(doc.recipient.email)}</p><p class="muted">${esc(doc.recipient.phone)}</p><p class="muted">${esc(doc.recipient.address)}</p>${doc.recipient.memberId ? `<p class="muted">Réf. : ${esc(doc.recipient.memberId)}</p>` : ''}</div>
          </section>
          <table><thead><tr><th>Désignation</th><th class="right">Qté</th><th class="right">HT</th><th class="right">TVA</th><th class="right">TTC</th></tr></thead><tbody>${rows}</tbody></table>
          ${isLast ? `<section class="totals"><div class="row"><span>Total HT</span><strong>${fmtCfa(totals.ht)}</strong></div><div class="row"><span>TVA</span><strong>${fmtCfa(totals.vat)}</strong></div><div class="row total"><span>Total TTC</span><span>${fmtCfa(totals.ttc)}</span></div></section><section class="notes"><div class="card"><h2>Observations</h2><p class="muted">${rich(doc.notes)}</p></div><div class="card"><h2>Mentions légales</h2><p class="muted">${rich(doc.legal)}</p></div></section>` : '<p class="continued">Suite de la facture sur la page suivante.</p>'}
          <footer class="footer"><span>${esc(doc.association.title)} · ${esc(doc.association.email)}</span><strong>Page ${pageIndex + 1}/${chunks.length}</strong></footer>
        </article>
        </div>`;
    });
  }).join('');

  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Factures SALAM</title><style>
    @page{size:A4 portrait;margin:0}*{box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}body{margin:0;background:#e5e7eb;font-family:Arial,sans-serif;color:#0f172a;font-size:clamp(10px,1.45vw,13px)}.toolbar{position:sticky;top:0;z-index:10;display:flex;justify-content:center;padding:12px;background:rgba(15,23,42,.88)}.toolbar button{border:0;border-radius:999px;background:#059669;color:white;padding:10px 16px;font-weight:800}.page{width:min(100vw,794px);min-height:min(1123px,calc(100vw * 1.414));margin:0 auto 18px;background:white;padding:clamp(22px,4.8vw,42px);position:relative;overflow:hidden;box-shadow:0 18px 55px rgba(15,23,42,.18)}.flag{position:absolute;left:0;right:0;top:0;height:clamp(4px,.8vw,7px);background:linear-gradient(90deg,#0B8F3A 0 33%,#C8102E 33% 66%,#F7C600 66%)}.header{margin:calc(clamp(22px,4.8vw,42px) * -1) calc(clamp(22px,4.8vw,42px) * -1) clamp(18px,3vw,28px);padding:clamp(32px,5vw,42px) clamp(22px,4.8vw,42px) clamp(18px,3vw,26px);background:linear-gradient(135deg,#087348,#075f41 62%,#043d2d);color:white}.eyebrow{color:#fde68a;font-size:clamp(8px,1.6vw,11px);font-weight:800;letter-spacing:.2em;text-transform:uppercase}h1{margin:clamp(8px,2vw,12px) 0 5px;font-size:clamp(22px,5vw,31px);line-height:1}.white-muted{color:rgba(255,255,255,.74)}.muted{color:#64748b;overflow-wrap:anywhere}.grid,.notes{display:grid;grid-template-columns:1fr 1fr;gap:clamp(12px,2.4vw,18px)}.card{border:1px solid #e5e7eb;border-radius:clamp(12px,2.5vw,18px);padding:clamp(13px,2.6vw,20px);background:white}.compact{min-height:clamp(128px,23vw,170px)}.card h2{margin:0 0 10px;font-size:clamp(9px,1.7vw,12px);letter-spacing:.14em;text-transform:uppercase;color:#64748b}table{width:100%;border-collapse:collapse;margin-top:clamp(16px,3vw,22px);font-size:clamp(9px,1.6vw,12px);table-layout:fixed}th{background:#0f172a;color:white;text-align:left;padding:clamp(8px,1.7vw,11px) clamp(6px,1.5vw,10px);font-size:clamp(7px,1.4vw,10px);letter-spacing:.1em;text-transform:uppercase}td{border-bottom:1px solid #eef2f7;padding:clamp(8px,1.7vw,11px) clamp(6px,1.5vw,10px);vertical-align:top;overflow-wrap:anywhere}th:first-child,td:first-child{width:44%}.right{text-align:right}.strong{font-weight:800}.totals{width:min(100%,310px);margin-left:auto;margin-top:clamp(16px,3vw,22px);border:1px solid #e5e7eb;border-radius:18px;padding:clamp(14px,2.6vw,18px);background:#f8fafc}.row{display:flex;justify-content:space-between;gap:18px;margin:8px 0}.total{background:#087348;color:white;border-radius:14px;padding:clamp(11px,2.2vw,14px);margin-top:12px;font-weight:900}.notes{margin-top:clamp(18px,3vw,24px)}.continued{margin-top:20px;color:#64748b;font-weight:700;text-align:right}.footer{position:absolute;left:clamp(22px,4.8vw,42px);right:clamp(22px,4.8vw,42px);bottom:clamp(14px,3vw,26px);display:flex;justify-content:space-between;gap:14px;border-top:1px solid #e5e7eb;padding-top:12px;color:#64748b;font-size:clamp(8px,1.5vw,11px)}@media(max-width:640px){.grid,.notes{grid-template-columns:1fr}.footer{flex-direction:column}}@media print{*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}body{background:white;font-size:12px}.toolbar{display:none}.page{width:794px;min-height:1123px;margin:0;padding:38px;box-shadow:none;page-break-after:always}.header{margin:-38px -38px 26px;padding:40px 38px 24px}.flag{height:7px}.grid,.notes{grid-template-columns:1fr 1fr}.footer{left:38px;right:38px;bottom:24px}}
    .page-wrap{width:794px;height:1123px;margin:0 auto 18px}.page{width:794px!important;min-height:1123px!important;margin:0!important;padding:38px!important;transform-origin:top left}.header{margin:-38px -38px 26px!important;padding:36px 38px 22px!important}.flag{height:7px!important}.grid,.notes{grid-template-columns:1fr 1fr!important;gap:18px!important}.footer{left:38px!important;right:38px!important;bottom:24px!important;flex-direction:row!important;font-size:11px!important}@media screen and (max-width:860px){.page-wrap{width:calc(100vw - 24px);height:calc(1123px * ((100vw - 24px) / 794));margin:0 auto 18px}.page{transform:scale(calc((100vw - 24px) / 794))}}@media print{*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.page-wrap{width:794px;height:auto;margin:0}.page{transform:none!important;box-shadow:none!important;page-break-after:always}}
  </style></head><body><div class="toolbar"><button onclick="window.print()">Imprimer / enregistrer en PDF</button></div>${pages}<script>window.addEventListener('load',()=>{document.querySelectorAll('.footer strong').forEach(el=>{el.textContent=el.textContent.replace(/\\s+.{0,3}Document\\s+\\d+\\/\\d+$/,'')});setTimeout(()=>window.print(),300)});</script></body></html>`;

  const win = window.open('', '_blank', 'width=900,height=1200');
  if (!win) {
    toast.error('Ouverture du PDF bloquée par le navigateur. Autorisez les popups pour télécharger/imprimer.');
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
}

function openSavedInvoicePdfLegacy(invoice: InvoiceDoc) {
  const association = loadAssociationInfo();
  openInvoicePdfBatch([{
    association,
    invoiceTitle: invoice.title,
    invoiceNumber: invoice.invoiceNumber,
    recipient: {
      name: `${invoice.recipients.length} destinataire(s)`,
      email: 'Document généré depuis la facturation SALAM',
      phone: '',
      address: '',
    },
    lines: [{ id: 1, designation: invoice.description || invoice.title, qty: 1, ht: invoice.amount, vat: 0 }],
    notes: 'Document généré depuis la facture enregistrée.',
    legal: 'Association SALAM — document généré électroniquement.',
    dueDate: invoice.dueDate,
  }]);
}

/* ─── Skeleton ────────────────────────────────────────── */
function openSavedInvoicePdf(invoice: InvoiceDoc) {
  const association = loadAssociationInfo();
  const lines = [{ id: 1, designation: invoice.description || invoice.title, qty: 1, ht: invoice.amount, vat: 0 }];
  const docs = invoice.recipients.length > 0
    ? invoice.recipients.map((recipient, index) => {
      const member = typeof recipient.userId === 'object' ? recipient.userId : null;
      const client = typeof recipient.clientId === 'object' ? recipient.clientId : null;
      const name = client?.name || [member?.firstName, member?.lastName].filter(Boolean).join(' ') || `Destinataire ${index + 1}`;
      return {
        association,
        invoiceTitle: invoice.title,
        invoiceNumber: recipient.invoiceNumber || `${invoice.invoiceNumber}-${seq(index + 1)}`,
        recipient: {
          name,
          email: client?.email || member?.email || '',
          phone: client?.phone || member?.phone || '',
          address: client?.address || [member?.residenceCity || member?.city, member?.country].filter(Boolean).join(', '),
          memberId: (member as { memberId?: string } | undefined)?.memberId ?? client?.registration,
        },
        lines,
        notes: 'Document genere depuis la facture enregistree.',
        legal: 'Association SALAM - document genere electroniquement.',
        dueDate: invoice.dueDate,
      };
    })
    : [{
      association,
      invoiceTitle: invoice.title,
      invoiceNumber: invoice.invoiceNumber,
      recipient: { name: 'Destinataire non renseigne', email: '', phone: '', address: '' },
      lines,
      notes: 'Document genere depuis la facture enregistree.',
      legal: 'Association SALAM - document genere electroniquement.',
      dueDate: invoice.dueDate,
    }];
  openInvoicePdfBatch(docs);
}

type InvoiceRecipientRow = {
  key: string;
  invoice: InvoiceDoc;
  recipient: RecipientDoc;
  name: string;
  email: string;
  phone: string;
  address: string;
  memberId?: string;
  invoiceNumber: string;
  status: RecipientDoc['status'] | InvoiceDoc['status'];
  isClient: boolean;
};

function invoiceRecipientIdentity(recipient: RecipientDoc, index: number) {
  const member = typeof recipient.userId === 'object' ? recipient.userId : null;
  const client = typeof recipient.clientId === 'object' ? recipient.clientId : null;
  const name = client?.name || [member?.firstName, member?.lastName].filter(Boolean).join(' ') || `Destinataire ${index + 1}`;
  return {
    name,
    email: client?.email || member?.email || '',
    phone: client?.phone || member?.phone || '',
    address: client?.address || [member?.residenceCity || member?.city, member?.country].filter(Boolean).join(', '),
    memberId: (member as { memberId?: string } | undefined)?.memberId ?? client?.registration,
    isClient: Boolean(client || recipient.recipientType === 'client'),
  };
}

function makeInvoiceRecipientRows(invoices: InvoiceDoc[]): InvoiceRecipientRow[] {
  return invoices.flatMap(invoice => {
    if (!invoice.recipients.length) {
      return [{
        key: `${invoice._id}-fallback`,
        invoice,
        recipient: { invoiceNumber: invoice.invoiceNumber, status: invoice.status === 'draft' ? 'pending' : 'sent' },
        name: 'Destinataire non renseigne',
        email: '',
        phone: '',
        address: '',
        memberId: undefined,
        invoiceNumber: invoice.invoiceNumber,
        status: 'pending',
        isClient: false,
      }];
    }

    return invoice.recipients.map((recipient, index) => {
      const identity = invoiceRecipientIdentity(recipient, index);
      return {
        key: `${invoice._id}-${recipient.invoiceNumber || index}`,
        invoice,
        recipient,
        ...identity,
        invoiceNumber: recipient.invoiceNumber || `${invoice.invoiceNumber}-${seq(index + 1)}`,
        status: recipient.status || invoice.status,
      };
    });
  });
}

function openSavedInvoiceRecipientPdf(invoice: InvoiceDoc, recipient: RecipientDoc) {
  openSavedInvoicePdf({ ...invoice, recipients: [recipient] });
}

function Skeleton() {
  return (
    <div className="divide-y divide-neutral-50">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="h-10 w-10 rounded-xl bg-neutral-100 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-40 rounded bg-neutral-100" />
            <div className="h-2 w-28 rounded bg-neutral-50" />
          </div>
          <div className="h-8 w-24 rounded-lg bg-neutral-100" />
        </div>
      ))}
    </div>
  );
}

/* ─── Invoice detail modal ────────────────────────────── */
function InvoiceDetailModal({ invoice, onClose }: { invoice: InvoiceDoc; onClose: () => void }) {
  const cfg = STATUS_CONFIG[invoice.status];
  const paidCount = invoice.recipients.filter(r => r.status === 'paid').length;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200">
        <div className="relative px-6 py-5" style={{ background: 'linear-gradient(135deg, #065f46 0%, #064e3b 60%, #022c22 100%)' }}>
          <div className="absolute top-0 left-0 h-[3px] w-full" style={{ background: 'linear-gradient(90deg, #0B8F3A 33%, #C8102E 33%, #C8102E 66%, #F7C600 66%)' }} />
          <button onClick={onClose} className="absolute right-4 top-4 text-white/40 hover:text-white/80"><X size={16} /></button>
          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-emerald-400/70">Association SALAM</p>
          <p className="mt-1 text-lg font-black text-white">{invoice.title}</p>
          <p className="text-[11px] text-white/50 font-mono mt-0.5">{invoice.invoiceNumber}</p>
        </div>
        <div className="px-6 py-5 space-y-3">
          {invoice.description && (
            <p className="text-xs text-neutral-500 leading-relaxed">{invoice.description}</p>
          )}
          {[
            { label: 'Montant',          value: fmtCfa(invoice.amount) },
            { label: 'Date d\'émission', value: fmt(invoice.issuedAt) },
            { label: 'Échéance',         value: fmt(invoice.dueDate) },
            { label: 'Destinataires',    value: `${invoice.recipients.length} membres` },
            { label: 'Paiements reçus',  value: `${paidCount} / ${invoice.recipients.length}` },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between border-b border-neutral-50 pb-2 last:border-0">
              <span className="text-xs font-semibold text-neutral-400">{row.label}</span>
              <span className="text-xs font-black text-neutral-900">{row.value}</span>
            </div>
          ))}
          {invoice.paymentLink && (
            <div className="flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-100 px-3 py-2">
              <LinkIcon size={12} className="text-blue-500 shrink-0" />
              <span className="truncate text-xs font-semibold text-blue-700">{invoice.paymentLink}</span>
            </div>
          )}
          <div className="pt-1">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black ${cfg.badge}`}>
              {cfg.icon} {cfg.label}
            </span>
          </div>
        </div>
        <div className="border-t border-neutral-100 px-6 py-4">
          <button onClick={onClose} className="w-full rounded-xl bg-neutral-900 py-2.5 text-sm font-black text-white transition hover:bg-neutral-800">Fermer</button>
        </div>
      </div>
    </div>
  );
}

function RecipientInvoiceModal({ row, onClose }: { row: InvoiceRecipientRow; onClose: () => void }) {
  const resendInvoiceRecipient = useResendInvoiceRecipient();
  const recipientCfg = RECIPIENT_STATUS_CONFIG[row.recipient.status] ?? RECIPIENT_STATUS_CONFIG.pending;
  const invoiceCfg = STATUS_CONFIG[row.invoice.status];
  const canResend = Boolean(row.email);
  const sendLabel = row.status === 'sent' || row.status === 'paid' ? 'Renvoyer la facture' : 'Envoyer la facture';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200">
        <div className="relative px-6 py-5" style={{ background: 'linear-gradient(135deg, #065f46 0%, #064e3b 60%, #022c22 100%)' }}>
          <div className="absolute left-0 top-0 h-[3px] w-full" style={{ background: 'linear-gradient(90deg, #0B8F3A 33%, #C8102E 33%, #C8102E 66%, #F7C600 66%)' }} />
          <button onClick={onClose} className="absolute right-4 top-4 text-white/40 transition hover:text-white/80"><X size={16} /></button>
          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-emerald-400/70">Facture individuelle</p>
          <p className="mt-1 text-lg font-black text-white">{row.invoice.title}</p>
          <p className="mt-0.5 font-mono text-[11px] text-white/50">{row.invoiceNumber}</p>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black ${invoiceCfg.badge}`}>
                {invoiceCfg.icon} {invoiceCfg.label}
              </span>
              <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-black ${recipientCfg.badge}`}>
                {recipientCfg.label}
              </span>
              {row.recipient.status === 'partiel' && trancheTag(row.recipient.lastPaidTranche)}
              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-black ${row.isClient ? 'bg-amber-100 text-amber-700' : 'bg-violet-100 text-violet-700'}`}>
                {row.isClient ? 'Client' : 'Membre'}
              </span>
            </div>
            <p className="mt-3 text-sm font-black text-neutral-900">{row.name}</p>
            <p className="mt-1 truncate text-xs text-neutral-500">{row.email || row.phone || row.memberId || 'Coordonnees non renseignees'}</p>
            {row.address && <p className="mt-1 text-xs text-neutral-400">{row.address}</p>}
          </div>

          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div className="rounded-xl border border-neutral-100 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Montant</p>
              <p className="mt-1 font-black text-neutral-900">{fmtCfa(row.invoice.amount)}</p>
            </div>
            <div className="rounded-xl border border-neutral-100 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Echeance</p>
              <p className="mt-1 font-black text-neutral-900">{fmt(row.invoice.dueDate)}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-2 border-t border-neutral-100 px-6 py-4 sm:grid-cols-3">
          <button
            onClick={() => openSavedInvoiceRecipientPdf(row.invoice, row.recipient)}
            className="flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 py-2.5 text-xs font-black text-violet-700 transition hover:bg-violet-100"
          >
            <Eye size={14} /> Apercu PDF A4
          </button>
          <button
            onClick={() => resendInvoiceRecipient.mutate({ id: row.invoice._id, invoiceNumber: row.invoiceNumber })}
            disabled={resendInvoiceRecipient.isPending || !canResend}
            className="flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 py-2.5 text-xs font-black text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {resendInvoiceRecipient.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {sendLabel}
          </button>
          <button onClick={onClose} className="rounded-xl bg-neutral-900 py-2.5 text-xs font-black text-white transition hover:bg-neutral-800">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

function ClientDocuments({ client, onView }: { client: InvoiceClientDoc; onView: (invoice: InvoiceDoc) => void }) {
  const { data, isLoading } = useClientDocuments(client._id);
  const docs = data?.data ?? [];

  return (
    <div className="mt-3 rounded-2xl border border-amber-100 bg-amber-50/60 p-2">
      {isLoading && <p className="px-2 py-2 text-xs font-semibold text-amber-700">Chargement des documents...</p>}
      {!isLoading && docs.length === 0 && <p className="px-2 py-2 text-xs font-semibold text-amber-700">Aucun document lié.</p>}
      {!isLoading && docs.map(doc => (
        <button key={doc._id} type="button" onClick={() => onView(doc)} className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-xs font-bold text-amber-900 transition hover:bg-white">
          <span className="min-w-0 truncate">{doc.title}</span>
          <span className="font-mono text-[10px] text-amber-700">{doc.invoiceNumber}</span>
        </button>
      ))}
    </div>
  );
}

function ClientsModal({ onClose }: { onClose: () => void }) {
  const { data, isLoading } = useInvoiceClients();
  const saveClient = useSaveInvoiceClient();
  const deleteClient = useDeleteInvoiceClient();
  const deleteInvoice = useDeleteInvoice();
  const resendDoc = useResendClientDocument();
  const [editing, setEditing] = useState<Partial<InvoiceClientDoc> | null>(null);
  const [docsOpen, setDocsOpen] = useState<string | null>(null);
  const [viewDoc, setViewDoc] = useState<InvoiceDoc | null>(null);
  const clients = data?.data ?? [];
  const form = editing ?? { name: '', email: '', phone: '', address: '', registration: '', notes: '' };

  const setField = (key: keyof InvoiceClientDoc, value: string) => setEditing(prev => ({ ...(prev ?? {}), [key]: value }));
  const submit = () => {
    if (!String(form.name ?? '').trim()) return;
    saveClient.mutate(form as InvoiceClientDoc & { name: string }, { onSuccess: () => setEditing(null) });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
      <div className="mx-auto max-w-4xl rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <div>
            <h3 className="text-lg font-black text-neutral-900">Clients externes</h3>
            <p className="text-xs text-neutral-500">Contacts réutilisables dans les factures et documents édités.</p>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500"><X size={16} /></button>
        </div>
        <div className="grid gap-4 p-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            {isLoading && <p className="py-8 text-center text-sm text-neutral-400">Chargement...</p>}
            {!isLoading && clients.length === 0 && <p className="py-8 text-center text-sm text-neutral-400">Aucun client externe.</p>}
            {clients.map(client => (
              <div key={client._id} className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-black text-neutral-900">{client.name}</p>
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-700">Client externe</span>
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">{client.email || 'Email non renseigné'} · {client.phone || 'Téléphone non renseigné'}</p>
                    {client.address && <p className="mt-1 text-xs text-neutral-400">{client.address}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setDocsOpen(docsOpen === client._id ? null : client._id)} className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-black text-amber-700">Voir doc</button>
                    <button onClick={() => setEditing(client)} className="rounded-xl border border-neutral-200 px-3 py-2 text-xs font-black text-neutral-600">Modifier</button>
                    <button onClick={() => deleteClient.mutate(client._id)} className="rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-600">Supprimer</button>
                  </div>
                </div>
                {docsOpen === client._id && <ClientDocuments client={client} onView={setViewDoc} />}
              </div>
            ))}
          </div>
          <aside className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
            <h4 className="font-black text-neutral-900">{form._id ? 'Modifier le client' : 'Nouveau client'}</h4>
            <div className="mt-4 space-y-3">
              {[
                ['name', 'Nom / Raison sociale *'], ['email', 'Email'], ['phone', 'Téléphone'], ['address', 'Adresse'], ['registration', 'N° immatriculation'],
              ].map(([key, label]) => (
                <input key={key} value={String((form as any)[key] ?? '')} onChange={event => setField(key as keyof InvoiceClientDoc, event.target.value)} placeholder={label} className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-emerald-300" />
              ))}
              <textarea value={form.notes ?? ''} onChange={event => setField('notes', event.target.value)} placeholder="Notes internes" rows={3} className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-emerald-300" />
              <button onClick={submit} disabled={saveClient.isPending} className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-black text-white disabled:opacity-60">
                {saveClient.isPending ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />} Enregistrer
              </button>
              {editing && <button onClick={() => setEditing(null)} className="h-10 w-full rounded-xl border border-neutral-200 bg-white text-sm font-black text-neutral-600">Nouveau client</button>}
            </div>
          </aside>
        </div>
      </div>
      {viewDoc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="bg-gradient-to-br from-[#087348] to-[#043d2d] px-6 py-5 text-white">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-yellow-200">Document client</p>
              <p className="mt-1 text-lg font-black">{viewDoc.title}</p>
              <p className="font-mono text-xs text-white/60">{viewDoc.invoiceNumber}</p>
            </div>
            <div className="space-y-3 px-6 py-5 text-sm">
              <div className="flex justify-between"><span className="text-neutral-400">Montant</span><b>{fmtCfa(viewDoc.amount)}</b></div>
              <div className="flex justify-between"><span className="text-neutral-400">Échéance</span><b>{fmt(viewDoc.dueDate)}</b></div>
              <div className="flex justify-between"><span className="text-neutral-400">Statut</span><b>{STATUS_CONFIG[viewDoc.status].label}</b></div>
            </div>
            <div className="flex gap-2 border-t border-neutral-100 px-6 py-4">
              <button onClick={() => {
                const clientRecipient = viewDoc.recipients.find(r => r.clientId);
                const clientId = typeof clientRecipient?.clientId === 'object' ? clientRecipient.clientId._id : clientRecipient?.clientId;
                if (clientId) resendDoc.mutate({ clientId, invoiceId: viewDoc._id });
              }} className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-black text-white">Renvoyer</button>
              <button onClick={() => setViewDoc(null)} className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-xs font-black text-neutral-600">Fermer</button>
              <button onClick={() => deleteInvoice.mutate(viewDoc._id, { onSuccess: () => setViewDoc(null) })} className="flex-1 rounded-xl bg-red-50 py-2.5 text-xs font-black text-red-600">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Create invoice modal ────────────────────────────── */

const COTIS_LABEL: Record<MemberListItem['cotisationStatus'], string> = {
  paid: 'À jour', unpaid: 'Impayé', exempt: 'Exempté',
};
const COTIS_BADGE: Record<MemberListItem['cotisationStatus'], string> = {
  paid:   'bg-emerald-50 text-emerald-700',
  unpaid: 'bg-red-50 text-red-700',
  exempt: 'bg-neutral-100 text-neutral-600',
};

type InvoiceMotif = 'cotisation' | 'cotisation_annuelle' | 'other' | 'avoir';

const MOTIF_CONFIG: Record<InvoiceMotif, { title: string; designation: string; amount: number | null; locked: boolean }> = {
  cotisation:           { title: "FRAIS D'ADHÉSION",  designation: "FRAIS D'ADHÉSION - MEMBRE SALAM",  amount: 5000,  locked: true  },
  cotisation_annuelle:  { title: 'COTISATION ANNUELLE', designation: 'COTISATION ANNUELLE - MEMBRE SALAM', amount: 30000, locked: true  },
  avoir:                { title: 'AVOIR',              designation: 'Avoir — Association SALAM',        amount: null,  locked: false },
  other:                { title: '',                   designation: '',                                 amount: null,  locked: false },
};

function MotifPickerModal({ onClose, onSelect }: { onClose: () => void; onSelect: (motif: InvoiceMotif) => void }) {
  const options: { motif: InvoiceMotif; label: string; description: string; cls: string }[] = [
    { motif: 'cotisation',          label: "Frais d'adhésion",  description: '5 000 F.CFA TTC — montant et libellé verrouillés',  cls: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' },
    { motif: 'cotisation_annuelle', label: 'Cotisation annuelle', description: '30 000 F.CFA TTC — montant et libellé verrouillés', cls: 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100' },
    { motif: 'other',                label: 'Autres',             description: 'Facture libre, entièrement personnalisable',        cls: 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100' },
    { motif: 'avoir',                label: 'Avoir',              description: 'Crédite le solde du membre et débite la trésorerie', cls: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200">
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">Facturation SALAM</p>
            <h3 className="text-lg font-black text-neutral-900">Motif de la facture</h3>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100"><X size={16} /></button>
        </div>
        <div className="grid gap-3 p-6 sm:grid-cols-2">
          {options.map(o => (
            <button key={o.motif} type="button" onClick={() => onSelect(o.motif)}
              className={`flex flex-col items-start gap-1 rounded-2xl border px-4 py-4 text-left transition ${o.cls}`}>
              <span className="text-sm font-black">{o.label}</span>
              <span className="text-[11px] font-semibold opacity-80">{o.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CreateInvoiceModal({ motif, presetMemberId, onClose }: { motif: InvoiceMotif; presetMemberId?: string; onClose: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const cfg = MOTIF_CONFIG[motif];
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [association, setAssociation] = useState<AssociationInvoiceInfo>(() => loadAssociationInfo());
  const [invoiceTitle, setInvoiceTitle] = useState(cfg.title || 'Facture');
  const [description, setDescription] = useState(motif === 'other' ? "Frais et contribution liés aux activités de l'association." : cfg.designation);
  const [dueDate, setDueDate] = useState(today);
  const [paymentLink, setPaymentLink] = useState('');
  const [recipientMode, setRecipientMode] = useState<'all' | 'select'>('select');
  const [selected, setSelected] = useState<string[]>(presetMemberId ? [presetMemberId] : []);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [cotisFilter, setCotisFilter] = useState<'all' | MemberListItem['cotisationStatus']>('all');
  const [notes, setNotes] = useState("Merci pour votre engagement au sein de SALAM. Cette facture correspond aux frais ou contributions validés par l'association.");
  const [legal, setLegal] = useState('Association SALAM — document généré électroniquement. Paiement à effectuer selon les moyens validés par le bureau exécutif.');
  const [isExempt, setIsExempt] = useState(false);
  const [lines, setLines] = useState<InvoiceLine[]>([
    cfg.locked && cfg.amount != null
      ? { id: 1, designation: cfg.designation, qty: 1, ht: cfg.amount, vat: 0 }
      : { id: 1, designation: motif === 'avoir' ? cfg.designation : 'Frais d’adhésion annuelle', qty: 1, ht: motif === 'avoir' ? 0 : 5000, vat: 0 },
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
  const createInvoice = useCreateInvoice();
  const { data: membersData } = useAdminMembers({ limit: 200, status: 'active' });
  const { data: clientsData } = useInvoiceClients();
  const { data: presetMemberData } = useAdminMember(presetMemberId ?? '');
  const clients = clientsData?.data ?? [];

  /* Le membre visé par le raccourci "facture requise" n'est pas forcément dans
     les 200 premiers actifs récupérés ci-dessus : on le fusionne explicitement
     pour garantir qu'il apparaisse dans l'aperçu et la sélection. */
  const allMembers: MemberListItem[] = useMemo(() => {
    const base = membersData?.data?.data ?? [];
    const preset = presetMemberData?.data;
    if (preset && !base.some(m => m._id === preset._id)) return [preset, ...base];
    return base;
  }, [membersData, presetMemberData]);

  const rawTotals = useMemo(() => calcInvoiceTotals(lines), [lines]);
  const totals = isExempt ? { ht: 0, vat: 0, ttc: 0 } : rawTotals;
  const year = new Date().getFullYear();
  const previewNumber = `SALAM-FACT-${year}-0001`;

  const filteredMembers = useMemo(() =>
    allMembers.filter(m => {
      const q = normalizeName(`${m.firstName} ${m.lastName} ${m.email ?? ''} ${m.memberId ?? ''}`);
      const matchSearch = !memberSearch.trim() || q.includes(normalizeName(memberSearch));
      const matchCotis = cotisFilter === 'all' || m.cotisationStatus === cotisFilter;
      return matchSearch && matchCotis;
    }),
  [allMembers, memberSearch, cotisFilter]);

  const recipients = recipientMode === 'all'
    ? allMembers
    : allMembers.filter(member => selected.includes(member._id));
  const selectedClientDocs = clients.filter(client => selectedClients.includes(client._id));
  const previewMember = recipients[0] ?? allMembers[0];
  const previewClient = !previewMember ? selectedClientDocs[0] : null;
  const allFilteredSelected = filteredMembers.length > 0 && filteredMembers.every(m => selected.includes(m._id));
  const someFilteredSelected = filteredMembers.some(m => selected.includes(m._id));

  const updateAssociation = (patch: Partial<AssociationInvoiceInfo>) => {
    setAssociation(prev => ({ ...prev, ...patch }));
  };

  const persistAssociation = () => {
    saveAssociationInfo(association);
  };

  const updateLine = (id: number, patch: Partial<InvoiceLine>) => {
    setLines(prev => prev.map(line => {
      if (line.id !== id) return line;
      const next = { ...line, ...patch };
      /* Montant TTC verrouillé : on recalcule le HT pour que le total reste fixe quand la TVA change */
      if (cfg.locked && cfg.amount != null && patch.vat !== undefined) {
        const vatPct = Number(patch.vat || 0);
        next.ht = Math.round((cfg.amount / (1 + vatPct / 100)) * 100) / 100;
      }
      return next;
    }));
  };

  const addLine = () => {
    if (cfg.locked) return;
    setLines(prev => [...prev, { id: Date.now(), designation: 'Nouvelle ligne', qty: 1, ht: 0, vat: 0 }]);
  };

  const removeLine = (id: number) => {
    if (cfg.locked) return;
    setLines(prev => prev.length > 1 ? prev.filter(line => line.id !== id) : prev);
  };

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelected(prev => prev.filter(id => !filteredMembers.some(m => m._id === id)));
      return;
    }
    setSelected(prev => [...new Set([...prev, ...filteredMembers.map(m => m._id)])]);
  };

  const toggleMember = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
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
    if (!dueDate) next.dueDate = 'Échéance requise';
    if (!isExempt && totals.ttc <= 0) next.amount = 'Le total doit être supérieur à 0';
    if (recipientMode === 'select' && selected.length === 0 && selectedClients.length === 0) next.recipients = 'Sélectionnez au moins un destinataire';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleCreate = () => {
    if (!validate()) return;
    persistAssociation();
    createInvoice.mutate(
      {
        title: invoiceTitle.trim(),
        description: description.trim() || notes.trim() || undefined,
        amount: totals.ttc,
        dueDate,
        paymentLink: paymentLink.trim() || undefined,
        type: motif,
        isExempt,
        recipientIds: recipientMode === 'select' ? selected : undefined,
        clientIds: recipientMode === 'select' ? selectedClients : undefined,
      },
      { onSuccess: () => onClose() },
    );
  };

  const handlePdf = () => {
    const memberRecipients = recipients.map(member => ({
      name: formatFullName(member.firstName, member.lastName),
      email: member.email,
      phone: member.phone ?? '',
      address: [(member as any).residenceCity, (member as any).city, (member as any).country].filter(Boolean).join(', '),
      memberId: member.memberId,
    }));
    const clientRecipients = selectedClientDocs.map(client => ({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      memberId: client.registration,
    }));
    const fallbackRecipients = previewMember
      ? [{
          name: formatFullName(previewMember.firstName, previewMember.lastName),
          email: previewMember.email,
          phone: previewMember.phone ?? '',
          address: [(previewMember as any).residenceCity, (previewMember as any).city, (previewMember as any).country].filter(Boolean).join(', '),
          memberId: previewMember.memberId,
        }]
      : previewClient ? [{
          name: previewClient.name,
          email: previewClient.email,
          phone: previewClient.phone,
          address: previewClient.address,
          memberId: previewClient.registration,
        }]
      : [{ name: 'Destinataire à renseigner' }];

    const pdfLines = isExempt ? lines.map(l => ({ ...l, ht: 0, vat: 0 })) : lines;
    const targetRecipients = [...memberRecipients, ...clientRecipients];
    const docs = (targetRecipients.length ? targetRecipients : fallbackRecipients).map((recipient, index) => ({
      association,
      invoiceTitle,
      invoiceNumber: `${previewNumber}-${seq(index + 1)}`,
      recipient,
      lines: pdfLines,
      notes,
      legal,
      dueDate,
    }));

    openInvoicePdfBatch(docs);
  };

  const inputCls = (err?: string) =>
    `w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${err ? 'border-red-300 focus:ring-red-500/15' : 'border-neutral-200 focus:border-emerald-500 focus:ring-emerald-500/15'}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-sm">
      <div className="mx-auto flex min-h-full max-w-7xl flex-col gap-4 py-4">
        <div className="flex flex-col gap-3 rounded-[26px] border border-white/10 bg-white px-4 py-4 shadow-2xl sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">Facturation SALAM</p>
            <h3 className="text-xl font-black tracking-[-0.04em] text-neutral-900">Éditeur de facture A4</h3>
            <p className="mt-1 text-xs text-neutral-500">Aperçu PDF au format A4 avec padding fixe pour éviter les débordements.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button type="button" onClick={persistAssociation} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-black text-neutral-700 transition hover:border-emerald-200 hover:text-emerald-700">
              <Save size={14} /> Mémoriser
            </button>
            <button type="button" onClick={handlePdf} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-black text-neutral-700 transition hover:border-emerald-200 hover:text-emerald-700">
              <Download size={14} /> Télécharger PDF
            </button>
            <button type="button" onClick={handleCreate} disabled={createInvoice.isPending} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 text-xs font-black text-white transition hover:bg-emerald-700 disabled:opacity-60">
              {createInvoice.isPending ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />} Créer
            </button>
            <button type="button" onClick={onClose} className="inline-flex h-10 items-center justify-center rounded-xl bg-neutral-950 px-3 text-xs font-black text-white transition hover:bg-neutral-800">
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="overflow-auto rounded-[28px] border border-white/10 bg-white p-3 shadow-2xl">
            <div className="min-w-[820px]">
              <div
                className="relative mx-auto overflow-hidden rounded-[18px] border border-neutral-200 bg-white shadow-xl"
                style={{ width: A4_WIDTH, minHeight: A4_HEIGHT }}
              >
                <div className="absolute left-0 right-0 top-0 h-2 bg-gradient-to-r from-emerald-600 via-red-600 to-amber-400" />
                <header className="bg-gradient-to-br from-[#087348] via-[#075f41] to-[#043d2d] px-10 pb-6 pt-10 text-white">
                  <input value={association.name} onChange={event => updateAssociation({ name: event.target.value })} className="w-full bg-transparent text-[11px] font-black uppercase tracking-[0.28em] text-yellow-200 outline-none" />
                  <p className="mt-1 text-xs font-semibold text-white/75">Solidaire Associative des Lauréats du Maroc</p>
                  <input value={invoiceTitle} readOnly={cfg.locked} onChange={event => !cfg.locked && setInvoiceTitle(event.target.value)} className={`mt-3 w-full bg-transparent text-[29px] font-black leading-none tracking-[-0.04em] text-white outline-none ${cfg.locked ? 'cursor-not-allowed opacity-90' : ''}`} />
                  <input value={previewNumber} readOnly className="mt-2 w-full bg-transparent font-mono text-xs text-white/70 outline-none" />
                </header>

                <div className="space-y-6 px-12 py-8">
                  <div className="grid grid-cols-2 gap-5">
                    <DraggableBox id="assoc" label="Émetteur" offsets={blockOffsets} setOffsets={setBlockOffsets} designs={blockDesigns} setDesigns={setBlockDesigns} activeDesign={activeBlockDesign} setActiveDesign={setActiveBlockDesign}>
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
                          <p className="text-xs text-neutral-400">Émetteur</p>
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
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-400">Facturé à</p>
                      {previewMember ? (
                        <div className="mt-4 space-y-1 text-sm">
                          <p className="text-base font-black text-neutral-900">{formatFullName(previewMember.firstName, previewMember.lastName)}</p>
                          <p className="text-neutral-500">{previewMember.email}</p>
                          <p className="text-neutral-500">{previewMember.phone ?? 'Téléphone non renseigné'}</p>
                          <p className="text-neutral-500">{[(previewMember as any).residenceCity, (previewMember as any).city, (previewMember as any).country].filter(Boolean).join(', ') || 'Adresse non renseignée'}</p>
                          <p className="font-mono text-xs text-neutral-400">{previewMember.memberId}</p>
                        </div>
                      ) : previewClient ? (
                        <div className="mt-4 space-y-1 text-sm">
                          <p className="text-base font-black text-neutral-900">{previewClient.name}</p>
                          <p className="text-neutral-500">{previewClient.email || 'Email non renseigné'}</p>
                          <p className="text-neutral-500">{previewClient.phone || 'Téléphone non renseigné'}</p>
                          <p className="text-neutral-500">{previewClient.address || 'Adresse non renseignée'}</p>
                          <p className="font-mono text-xs text-amber-600">{previewClient.registration || 'Client externe'}</p>
                        </div>
                      ) : (
                        <p className="mt-4 text-sm font-semibold text-neutral-400">Sélectionnez un destinataire.</p>
                      )}
                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <label className="block">
                          <span className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Échéance</span>
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
                      <h4 className="font-black text-neutral-900">Désignations</h4>
                      {!cfg.locked && (
                        <button type="button" onClick={addLine} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-black text-white"><Plus size={13} /> Ligne</button>
                      )}
                    </div>
                    <div className="grid grid-cols-[1fr_64px_95px_64px_100px_32px] rounded-t-xl bg-neutral-950 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white">
                      <span>Désignation</span><span>Qté</span><span>HT</span><span>TVA</span><span>TTC</span><span />
                    </div>
                    {lines.map(line => {
                      const ttc = isExempt ? 0 : Number(line.qty || 0) * Number(line.ht || 0) * (1 + Number(line.vat || 0) / 100);
                      return (
                        <div key={line.id} className="grid grid-cols-[1fr_64px_95px_64px_100px_32px] items-center border-b border-neutral-100 px-3 py-2 text-sm">
                          {cfg.locked ? (
                            <span className="min-w-0 truncate rounded-lg px-2 py-1 font-semibold text-neutral-800">{line.designation}</span>
                          ) : (
                            <RichTextEditor value={String(line.designation ?? '')} onChange={value => updateLine(line.id, { designation: value })} className="min-w-0 rounded-lg px-2 py-1 outline-emerald-300" multiline={false} />
                          )}
                          <input type="number" value={line.qty} readOnly={cfg.locked} onChange={event => !cfg.locked && updateLine(line.id, { qty: event.target.value })} className={`w-14 rounded-lg px-2 py-1 outline-emerald-300 ${cfg.locked ? 'cursor-not-allowed bg-neutral-50 text-neutral-400' : ''}`} />
                          <input type="number" value={line.ht} readOnly={cfg.locked} onChange={event => !cfg.locked && updateLine(line.id, { ht: event.target.value })} className={`w-20 rounded-lg px-2 py-1 outline-emerald-300 ${cfg.locked ? 'cursor-not-allowed bg-neutral-50 text-neutral-400' : ''}`} />
                          <input type="number" value={line.vat} onChange={event => updateLine(line.id, { vat: event.target.value })} className="w-14 rounded-lg px-2 py-1 outline-emerald-300" />
                          <b className="text-xs">{fmtCfa(ttc)}</b>
                          {!cfg.locked && <button type="button" onClick={() => removeLine(line.id)} className="text-red-500"><Trash2 size={14} /></button>}
                        </div>
                      );
                    })}
                    {cfg.locked && (
                      <p className="px-3 py-2 text-[11px] font-semibold text-neutral-400">
                        Montant TTC fixé à {fmtCfa(cfg.amount ?? 0)} — seule la TVA est ajustable (le HT se recalcule automatiquement).
                      </p>
                    )}
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
                    <h4 className="mb-2 font-black text-neutral-900">Mentions légales</h4>
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
                <h4 className="font-black text-neutral-900">Paramètres</h4>
              </div>
              <div className="space-y-3">
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Titre</span>
                  <input value={invoiceTitle} readOnly={cfg.locked} onChange={event => !cfg.locked && setInvoiceTitle(event.target.value)} className={`${inputCls(errors.title)} ${cfg.locked ? 'cursor-not-allowed bg-neutral-50 text-neutral-500' : ''}`} />
                </label>
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Description API</span>
                  <textarea value={description} onChange={event => setDescription(event.target.value)} rows={3} className="w-full resize-none rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-emerald-300" />
                </label>
                <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                  <input type="checkbox" checked={isExempt} onChange={event => setIsExempt(event.target.checked)} className="h-4 w-4 accent-amber-600" />
                  <span className="text-xs font-black text-amber-800">Membre exempté (facture à 0 F.CFA)</span>
                </label>
              </div>
              {(errors.title || errors.amount || errors.recipients || errors.dueDate) && (
                <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-600">
                  {Object.values(errors).filter(Boolean).join(' · ')}
                </div>
              )}
            </section>

            <section className="rounded-[26px] border border-white/10 bg-white p-5 shadow-xl">
              <div className="mb-4 flex items-center gap-2">
                <Building2 size={18} className="text-emerald-700" />
                <h4 className="font-black text-neutral-900">Destinataires</h4>
              </div>
              <div className="mb-3 flex gap-2">
                <button type="button" onClick={() => setRecipientMode('all')} className={`flex-1 rounded-xl border px-3 py-2 text-xs font-black ${recipientMode === 'all' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-neutral-200 text-neutral-500'}`}>
                  Tous actifs
                </button>
                <button type="button" onClick={() => setRecipientMode('select')} className={`flex-1 rounded-xl border px-3 py-2 text-xs font-black ${recipientMode === 'select' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-neutral-200 text-neutral-500'}`}>
                  Sélection
                </button>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input value={memberSearch} onChange={event => setMemberSearch(event.target.value)} placeholder="Rechercher..." className="h-10 w-full rounded-xl border border-neutral-200 pl-9 pr-3 text-sm outline-emerald-300" />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(['all', 'unpaid', 'paid', 'exempt'] as const).map(filter => (
                  <button key={filter} type="button" onClick={() => setCotisFilter(filter)} className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${cotisFilter === filter ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-neutral-200 text-neutral-500'}`}>
                    {filter === 'all' ? 'Tous' : filter === 'unpaid' ? 'Impayé' : filter === 'paid' ? 'À jour' : 'Exempté'}
                  </button>
                ))}
              </div>
              {recipientMode === 'select' && (
                <>
                  <button type="button" onClick={toggleSelectAll} className="mt-3 flex items-center gap-2 text-xs font-black text-emerald-700">
                    {allFilteredSelected ? <CheckSquare size={15} /> : <Square size={15} />}
                    Sélectionner tout ({filteredMembers.length})
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
                  {clients.length > 0 && (
                    <div className="mt-3 rounded-2xl border border-amber-100 bg-amber-50/50 p-2">
                      <p className="mb-1 px-2 text-[10px] font-black uppercase tracking-[0.14em] text-amber-700">Clients externes</p>
                      {clients.map(client => (
                        <label key={client._id} className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-white">
                          <input
                            type="checkbox"
                            checked={selectedClients.includes(client._id)}
                            onChange={() => setSelectedClients(prev => prev.includes(client._id) ? prev.filter(id => id !== client._id) : [...prev, client._id])}
                            className="h-4 w-4 accent-amber-500"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-black text-neutral-900">{client.name}</p>
                            <p className="truncate text-[10px] text-amber-700">{client.email || 'Email non renseigné'}</p>
                          </div>
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-black text-amber-700">Client</span>
                        </label>
                      ))}
                    </div>
                  )}
                </>
              )}
              <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-center">
                <p className="text-3xl font-black text-emerald-800">{recipients.length + selectedClientDocs.length}</p>
                <p className="text-xs font-bold text-emerald-700">facture(s) préparée(s)</p>
              </div>
            </section>

            <section className="rounded-[26px] border border-white/10 bg-white p-5 shadow-xl">
              <div className="mb-3 flex items-center gap-2">
                <Settings size={18} className="text-emerald-700" />
                <h4 className="font-black text-neutral-900">Contrôle A4</h4>
              </div>
              <ul className="space-y-2 text-xs font-semibold text-neutral-500">
                <li>Format aperçu : 794 × 1123 px</li>
                <li>Padding PDF : 48 px</li>
                <li>Export navigateur : A4 portrait</li>
                <li>Infos association mémorisables</li>
                <li>Montant API = Total TTC</li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function normalizeName(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function EditInvoiceModal({ invoice, onClose }: { invoice: InvoiceDoc; onClose: () => void }) {
  const updateInvoice = useUpdateInvoice();
  const [title, setTitle] = useState(invoice.title);
  const [description, setDescription] = useState(invoice.description ?? '');
  const [amount, setAmount] = useState(String(invoice.amount ?? 0));
  const [dueDate, setDueDate] = useState(invoice.dueDate ? invoice.dueDate.slice(0, 10) : '');
  const [paymentLink, setPaymentLink] = useState(invoice.paymentLink ?? '');

  const submit = () => {
    if (!title.trim()) return toast.error('Titre requis');
    if (!Number(amount)) return toast.error('Montant invalide');
    if (!dueDate) return toast.error('Date d echeance requise');
    updateInvoice.mutate({
      id: invoice._id,
      body: {
        title: title.trim(),
        description: description.trim(),
        amount: Number(amount),
        dueDate,
        paymentLink: paymentLink.trim(),
        type: invoice.type as 'cotisation' | 'event' | 'other',
      },
    }, { onSuccess: () => onClose() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <div>
            <p className="text-sm font-black text-neutral-900">Modifier le brouillon</p>
            <p className="text-[11px] font-mono text-neutral-400">{invoice.invoiceNumber}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-50"><X size={16} /></button>
        </div>
        <div className="space-y-3 px-5 py-4">
          <label className="block">
            <span className="text-[11px] font-black uppercase tracking-[0.12em] text-neutral-400">Titre</span>
            <input value={title} onChange={e => setTitle(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-emerald-400" />
          </label>
          <label className="block">
            <span className="text-[11px] font-black uppercase tracking-[0.12em] text-neutral-400">Description</span>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="mt-1 w-full resize-none rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-emerald-400" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-[11px] font-black uppercase tracking-[0.12em] text-neutral-400">Montant</span>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-emerald-400" />
            </label>
            <label className="block">
              <span className="text-[11px] font-black uppercase tracking-[0.12em] text-neutral-400">Echeance</span>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-emerald-400" />
            </label>
          </div>
          <label className="block">
            <span className="text-[11px] font-black uppercase tracking-[0.12em] text-neutral-400">Lien de paiement</span>
            <input value={paymentLink} onChange={e => setPaymentLink(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-emerald-400" />
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-neutral-100 px-5 py-4">
          <button onClick={onClose} className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-black text-neutral-600">Annuler</button>
          <button onClick={submit} disabled={updateInvoice.isPending} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white disabled:opacity-60">
            {updateInvoice.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

function LegacyCreateInvoiceModal({ onClose }: { onClose: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const [title,         setTitle]         = useState('');
  const [description,   setDescription]   = useState('');
  const [amount,        setAmount]        = useState('');
  const [dueDate,       setDueDate]       = useState('');
  const [paymentLink,   setPaymentLink]   = useState('');
  const [recipientMode, setRecipientMode] = useState<'all' | 'select'>('all');
  const [selected,      setSelected]      = useState<string[]>([]);
  const [memberSearch,  setMemberSearch]  = useState('');
  const [cotisFilter,   setCotisFilter]   = useState<'all' | MemberListItem['cotisationStatus']>('all');
  const [errors,        setErrors]        = useState<Record<string, string>>({});
  const recipientRef = useRef<HTMLDivElement>(null);

  const createInvoice = useCreateInvoice();
  const { data: membersData } = useAdminMembers({ limit: 200, status: 'active' });
  const allMembers: MemberListItem[] = membersData?.data?.data ?? [];

  const filteredMembers = useMemo(() =>
    allMembers.filter(m => {
      const q = memberSearch.trim().toLowerCase();
      const matchSearch = !q || `${m.firstName} ${m.lastName}`.toLowerCase().includes(q);
      const matchCotis  = cotisFilter === 'all' || m.cotisationStatus === cotisFilter;
      return matchSearch && matchCotis;
    }),
  [allMembers, memberSearch, cotisFilter]);

  const allFilteredSelected  = filteredMembers.length > 0 && filteredMembers.every(m => selected.includes(m._id));
  const someFilteredSelected = filteredMembers.some(m => selected.includes(m._id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelected(prev => prev.filter(id => !filteredMembers.some(m => m._id === id)));
    } else {
      setSelected(prev => {
        const toAdd = filteredMembers.map(m => m._id).filter(id => !prev.includes(id));
        return [...prev, ...toAdd];
      });
    }
  };

  const toggleMember = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim())                                          e.title      = 'Titre requis';
    if (!amount || Number(amount) <= 0)                         e.amount     = 'Montant invalide';
    if (!dueDate)                                               e.dueDate    = 'Échéance requise';
    if (recipientMode === 'select' && selected.length === 0)    e.recipients = 'Sélectionnez au moins un destinataire';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = () => {
    if (!validate()) return;
    createInvoice.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        amount: Number(amount),
        dueDate,
        paymentLink: paymentLink.trim() || undefined,
        recipientIds: recipientMode === 'select' ? selected : undefined,
      },
      { onSuccess: () => onClose() },
    );
  };

  const inputCls = (err?: string) =>
    `w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition-all focus:ring-2 placeholder:text-neutral-300 ${err ? 'border-red-300 focus:ring-red-500/15' : 'border-neutral-200 focus:border-emerald-500 focus:ring-emerald-500/15'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-neutral-100 bg-emerald-50/40 px-6 py-4 shrink-0">
          <div>
            <h3 className="font-black text-neutral-900">Nouvelle facture</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Générer une facture pour un événement</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100"><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Titre <span className="text-red-500">*</span></label>
            <input value={title} onChange={e => { setTitle(e.target.value); setErrors(p => ({...p, title: ''})); }}
              placeholder="Ex: Soirée Gala 2025" className={inputCls(errors.title)} />
            {errors.title && <p className="text-[11px] text-red-500">{errors.title}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Description <span className="text-neutral-300 font-normal normal-case">(optionnel)</span></label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Description de l'événement…" rows={2}
              className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-neutral-300 transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Montant (F.CFA) <span className="text-red-500">*</span></label>
              <div className="relative">
                <Banknote size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input type="number" min="0" step="1" value={amount}
                  onChange={e => { setAmount(e.target.value); setErrors(p => ({...p, amount: ''})); }}
                  placeholder="5000" className={`${inputCls(errors.amount)} pl-9`} />
              </div>
              {errors.amount && <p className="text-[11px] text-red-500">{errors.amount}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Échéance <span className="text-red-500">*</span></label>
              <div className="relative">
                <CalendarDays size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input type="date" value={dueDate} min={today}
                  onChange={e => { setDueDate(e.target.value); setErrors(p => ({...p, dueDate: ''})); }}
                  className={`${inputCls(errors.dueDate)} pl-9`} />
              </div>
              {errors.dueDate && <p className="text-[11px] text-red-500">{errors.dueDate}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Lien de paiement <span className="text-neutral-300 font-normal normal-case">(optionnel)</span></label>
            <div className="relative">
              <LinkIcon size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input value={paymentLink} onChange={e => setPaymentLink(e.target.value)}
                placeholder="https://…" className={`${inputCls()} pl-9`} />
            </div>
          </div>

          {/* Destinataires */}
          <div className="space-y-3" ref={recipientRef}>
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Destinataires</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setRecipientMode('all')}
                className={`rounded-xl border px-4 py-2 text-xs font-black transition ${recipientMode === 'all' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300'}`}>
                Tous les actifs
              </button>
              <button type="button" onClick={() => {
                  setRecipientMode('select');
                  setTimeout(() => recipientRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
                }}
                className={`rounded-xl border px-4 py-2 text-xs font-black transition ${recipientMode === 'select' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300'}`}>
                Sélection manuelle
              </button>
            </div>

            {recipientMode === 'select' && (
              <div className="overflow-hidden rounded-xl border border-neutral-200">
                {/* Search */}
                <div className="relative border-b border-neutral-100">
                  <Search size={13} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input value={memberSearch} onChange={e => setMemberSearch(e.target.value)}
                    placeholder="Rechercher par nom ou prénom…"
                    className="h-9 w-full bg-neutral-50 pl-9 pr-4 text-sm outline-none placeholder:text-neutral-300 focus:bg-white" />
                </div>

                {/* Cotisation filter chips */}
                <div className="flex flex-wrap gap-1.5 border-b border-neutral-100 px-3 py-2">
                  {(['all', 'unpaid', 'paid', 'exempt'] as const).map(f => (
                    <button key={f} type="button" onClick={() => setCotisFilter(f)}
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black transition ${cotisFilter === f ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300'}`}>
                      {f === 'all' ? 'Tous' : f === 'unpaid' ? 'Impayé' : f === 'paid' ? 'À jour' : 'Exempté'}
                    </button>
                  ))}
                </div>

                {/* Select all row */}
                <div className="flex items-center gap-3 border-b border-neutral-100 bg-neutral-50 px-3 py-2">
                  <input type="checkbox" id="select-all"
                    checked={allFilteredSelected}
                    ref={el => { if (el) el.indeterminate = !allFilteredSelected && someFilteredSelected; }}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 cursor-pointer rounded border-neutral-300 accent-emerald-600" />
                  <label htmlFor="select-all" className="flex-1 cursor-pointer text-xs font-black text-neutral-600">
                    Sélectionner tout ({filteredMembers.length})
                  </label>
                  {selected.length > 0 && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700">
                      {selected.length} sélectionné{selected.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Member list */}
                <div className="max-h-44 divide-y divide-neutral-50 overflow-y-auto">
                  {filteredMembers.length === 0 && (
                    <p className="py-6 text-center text-xs text-neutral-400">Aucun membre trouvé</p>
                  )}
                  {filteredMembers.map(m => (
                    <label key={m._id} htmlFor={`m-${m._id}`}
                      className="flex cursor-pointer items-center gap-3 px-3 py-2.5 transition hover:bg-neutral-50">
                      <input type="checkbox" id={`m-${m._id}`}
                        checked={selected.includes(m._id)}
                        onChange={() => toggleMember(m._id)}
                        className="h-4 w-4 cursor-pointer rounded border-neutral-300 accent-emerald-600" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-black text-neutral-900">{formatFullName(m.firstName, m.lastName)}</p>
                        <p className="truncate font-mono text-[10px] text-neutral-400">{m.memberId}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black ${COTIS_BADGE[m.cotisationStatus]}`}>
                        {COTIS_LABEL[m.cotisationStatus]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            {errors.recipients && <p className="text-[11px] text-red-500">{errors.recipients}</p>}
          </div>
        </div>

        <div className="flex gap-3 border-t border-neutral-100 px-6 py-4 shrink-0">
          <button onClick={onClose} className="flex-1 rounded-xl border border-neutral-200 bg-white py-2.5 text-sm font-semibold text-neutral-600 transition hover:border-neutral-300">Annuler</button>
          <button onClick={handleCreate} disabled={createInvoice.isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-60">
            {createInvoice.isPending && <Loader2 size={14} className="animate-spin" />}
            Créer la facture
          </button>
        </div>
      </div>
    </div>
  );
}


/* ─── Reçus de paiement ──────────────────────────────── */
const RECEIPT_TYPE_LABEL: Record<string, string> = { cotisation: "Frais d'adhésion", cotisation_annuelle: 'Cotisation annuelle' };

function receiptMemberName(r: ReceiptDoc) {
  const u = typeof r.userId === 'object' ? r.userId : null;
  return u ? formatFullName(u.firstName ?? '', u.lastName ?? '') : 'Membre';
}

function receiptMemberInfo(r: ReceiptDoc): { firstName: string; lastName: string; memberNumber?: string | null } {
  const u = typeof r.userId === 'object' ? r.userId : null;
  return { firstName: u?.firstName ?? '', lastName: u?.lastName ?? '', memberNumber: u?.memberNumber };
}

function EditReceiptModal({ receipt, onClose }: { receipt: ReceiptDoc; onClose: () => void }) {
  const updateReceipt = useUpdateReceipt();
  const [amount, setAmount] = useState(String(receipt.amount));
  const [paidAt, setPaidAt] = useState(receipt.paidAt.slice(0, 10));
  const [notes, setNotes]   = useState(receipt.notes ?? '');

  const submit = () => {
    updateReceipt.mutate(
      { id: receipt._id, body: { amount: Number(amount), paidAt, notes } },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200">
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">{receipt.receiptNumber}</p>
            <h3 className="font-black text-neutral-900">Modifier le reçu</h3>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100"><X size={16} /></button>
        </div>
        <div className="space-y-3 px-6 py-5">
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Montant (F.CFA)</span>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-emerald-400" />
          </label>
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Date de paiement</span>
            <input type="date" value={paidAt} onChange={e => setPaidAt(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-emerald-400" />
          </label>
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Notes</span>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              className="mt-1 w-full resize-none rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-emerald-400" />
          </label>
          <p className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
            Toute modification laisse une trace visible ("Modifié le …") sur la fiche du reçu, y compris côté membre.
          </p>
        </div>
        <div className="flex gap-3 border-t border-neutral-100 px-6 py-4">
          <button onClick={onClose} className="flex-1 rounded-xl border border-neutral-200 bg-white py-2.5 text-sm font-semibold text-neutral-600 transition hover:border-neutral-300">Annuler</button>
          <button onClick={submit} disabled={updateReceipt.isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-60">
            {updateReceipt.isPending && <Loader2 size={14} className="animate-spin" />} Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

function ReceiptsTab() {
  const [search,          setSearch]          = useState('');
  const [typeFilter,      setTypeFilter]      = useState<'all' | 'cotisation' | 'cotisation_annuelle'>('all');
  const [editing,         setEditing]         = useState<ReceiptDoc | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  const { data, isLoading, isError } = useAdminReceipts(typeFilter === 'all' ? undefined : { type: typeFilter });
  const cancelReceipt = useCancelReceipt();
  const receipts = data?.data ?? [];

  const filtered = receipts.filter(r => {
    const name = receiptMemberName(r);
    const searchable = `${r.receiptNumber} ${name} ${r.invoiceNumber ?? ''}`.toLowerCase();
    return searchable.includes(search.toLowerCase());
  });

  const handleCancel = (id: string) => {
    if (confirmCancelId !== id) {
      setConfirmCancelId(id);
      setTimeout(() => setConfirmCancelId(cur => (cur === id ? null : cur)), 3000);
      return;
    }
    cancelReceipt.mutate(id, { onSettled: () => setConfirmCancelId(null) });
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:min-w-[140px] sm:max-w-[240px]">
          <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un reçu, un membre…"
            className="h-9 w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-4 text-sm outline-none placeholder:text-neutral-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {([['all', 'Tous'], ['cotisation', "Frais d'adhésion"], ['cotisation_annuelle', 'Cotisation annuelle']] as const).map(([val, lbl]) => (
            <button key={val} onClick={() => setTypeFilter(val)}
              className={`rounded-full border px-3 py-1.5 text-xs font-black transition ${typeFilter === val ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'}`}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
        <div className="border-b border-neutral-100 px-5 py-3.5">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-neutral-500">
            {isLoading ? 'Chargement...' : `${filtered.length} reçu${filtered.length > 1 ? 's' : ''} (Reçus de paiement émis)`}
          </p>
        </div>
        <div className="divide-y divide-neutral-50">
          {isLoading && <Skeleton />}
          {isError && <div role="alert" className="px-5 py-10 text-center text-sm text-red-500">Erreur de chargement.</div>}
          {!isLoading && !isError && filtered.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-neutral-400">Aucun reçu trouvé.</div>
          )}
          {!isLoading && !isError && filtered.map(r => {
            const name = receiptMemberName(r);
            const isCancelled = r.status === 'cancelled';
            const trancheLabel = r.trancheIndex != null ? ` · Tranche ${r.trancheIndex + 1}` : '';
            return (
              <div key={r._id} className={`flex flex-wrap items-center gap-3 px-4 py-3 transition-colors hover:bg-neutral-50/60 sm:flex-nowrap sm:gap-4 sm:px-5 sm:py-4 ${isCancelled ? 'opacity-60' : ''}`}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50">
                  <ReceiptText size={16} className="text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-black text-sm text-neutral-900">{RECEIPT_TYPE_LABEL[r.type]}{trancheLabel} - {name}</p>
                    {isCancelled && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-black text-red-700">
                        <Ban size={10} /> ANNULÉ
                      </span>
                    )}
                    {r.modifiedAt && !isCancelled && (
                      <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-700">
                        Modifié le {fmt(r.modifiedAt)}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate font-mono text-[11px] text-neutral-400">
                    {r.receiptNumber}{r.invoiceNumber ? ` · Facture ${r.invoiceNumber}` : ''} · {fmt(r.paidAt)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-black text-neutral-900">{fmtCfa(r.amount)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button onClick={() => downloadReceiptPdf(r, receiptMemberInfo(r))} title="Voir le reçu"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-50 text-neutral-500 transition hover:bg-emerald-500 hover:text-white">
                    <Eye size={12} />
                  </button>
                  <button onClick={() => setEditing(r)} disabled={isCancelled} title="Modifier"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-50 text-neutral-500 transition hover:bg-yellow-400 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-40">
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => handleCancel(r._id)} disabled={isCancelled || cancelReceipt.isPending} title="Annuler le reçu"
                    className={`flex h-8 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-40 ${confirmCancelId === r._id ? 'w-auto gap-1 bg-red-500 px-2 text-[10px] font-black text-white' : 'w-8 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white'}`}>
                    {cancelReceipt.isPending && confirmCancelId === r._id ? <Loader2 size={12} className="animate-spin" /> : confirmCancelId === r._id ? 'Confirmer ?' : <Trash2 size={12} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {editing && <EditReceiptModal receipt={editing} onClose={() => setEditing(null)} />}
    </>
  );
}

/* ─── Page principale ─────────────────────────────────── */
export default function FacturationAdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentFilter = searchParams.get('payment');
  const motifParam = searchParams.get('motif');
  const presetMemberId = searchParams.get('memberId') ?? undefined;
  const [mainTab,     setMainTab]     = useState<'factures' | 'recus'>('factures');
  const [search,      setSearch]      = useState('');
  const [statusFilter, setStatusFilter] = useState<Set<RecipientDoc['status']>>(new Set());
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [showMotifPicker, setShowMotifPicker] = useState(false);
  const [createMotif,     setCreateMotif]     = useState<InvoiceMotif | null>(null);

  useEffect(() => {
    if (!showFilterPanel) return;
    const h = (e: MouseEvent) => { if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilterPanel(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [showFilterPanel]);

  /* Raccourci "facture requise" depuis Adhérents : motif + membre déjà connus,
     on saute directement l'éditeur sans repasser par la modale de choix. */
  useEffect(() => {
    if (motifParam && Object.prototype.hasOwnProperty.call(MOTIF_CONFIG, motifParam)) {
      setCreateMotif(motifParam as InvoiceMotif);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [showClients, setShowClients] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<InvoiceDoc | null>(null);
  const [viewRecipientInvoice, setViewRecipientInvoice] = useState<InvoiceRecipientRow | null>(null);
  const [editInvoice, setEditInvoice] = useState<InvoiceDoc | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);

  const { data, isLoading, isError } = useAdminInvoices();
  const resendInvoiceRecipient = useResendInvoiceRecipient();
  const deleteInvoice = useDeleteInvoice();
  const removeRecipient = useRemoveInvoiceRecipient();

  const invoices = data?.data ?? [];
  const invoiceRows = useMemo(() => makeInvoiceRecipientRows(invoices), [invoices]);

  const filtered = useMemo(() =>
    invoiceRows.filter(row => {
      const searchable = [row.invoice.title, row.invoice.invoiceNumber, row.invoiceNumber, row.name, row.email].join(' ').toLowerCase();
      const matchesSearch = searchable.includes(search.toLowerCase());
      const open = row.status === 'pending' || row.status === 'sent';
      const overdue = new Date(row.invoice.dueDate).getTime() < Date.now();
      const matchesPayment = paymentFilter === 'overdue' ? open && overdue : paymentFilter === 'pending' ? open && !overdue : true;
      const matchesStatus = statusFilter.size === 0 || statusFilter.has(row.recipient.status);
      return matchesSearch && matchesPayment && matchesStatus;
    }),
  [invoiceRows, search, paymentFilter, statusFilter]);
  const stats = useMemo(() => ({
    total:  invoiceRows.length,
    sent:   invoiceRows.filter(r => r.status === 'sent').length,
    closed: invoiceRows.filter(r => r.status === 'paid').length,
    draft:  invoiceRows.filter(r => r.invoice.status === 'draft' || r.status === 'pending').length,
  }), [invoiceRows]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Facturation</h1>
          <p className="mt-1 text-sm text-neutral-500">Générer et envoyer des factures pour les événements de l&apos;association.</p>
        </div>
        {mainTab === 'factures' && (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setShowClients(true)}
              className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-black text-amber-700 shadow-sm transition hover:bg-amber-100 active:scale-[0.98]">
              <UserPlus size={15} /> Clients
            </button>
            <button onClick={() => setShowMotifPicker(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98]">
              <Plus size={15} /> Nouvelle facture
            </button>
          </div>
        )}
      </div>

      {/* Onglets */}
      <div className="relative flex gap-1.5 rounded-2xl border border-neutral-100 bg-neutral-50/70 p-1.5">
        <div
          className="absolute inset-y-1.5 w-[calc(50%-0.375rem)] rounded-xl bg-emerald-600 shadow-sm transition-all duration-300 ease-in-out"
          style={{ left: mainTab === 'factures' ? '0.375rem' : 'calc(50% + 0.075rem)' }}
        />
        <button onClick={() => setMainTab('factures')}
          className={`relative z-10 flex-1 rounded-xl px-3 py-2 text-xs font-black transition-colors duration-300 ease-in-out sm:text-sm ${mainTab === 'factures' ? 'text-white' : 'text-neutral-500 hover:text-neutral-700'}`}>
          Factures
        </button>
        <button onClick={() => setMainTab('recus')}
          className={`relative z-10 flex-1 rounded-xl px-3 py-2 text-xs font-black transition-colors duration-300 ease-in-out sm:text-sm ${mainTab === 'recus' ? 'text-white' : 'text-neutral-500 hover:text-neutral-700'}`}>
          Reçus de paiement
        </button>
      </div>

      {mainTab === 'recus' ? <ReceiptsTab /> : <>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total',      value: stats.total,  color: 'text-neutral-900', bg: 'bg-neutral-50 border-neutral-100'  },
          { label: 'Envoyées',   value: stats.sent,   color: 'text-blue-700',    bg: 'bg-blue-50    border-blue-100'     },
          { label: 'Clôturées',  value: stats.closed, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100'  },
          { label: 'Brouillons', value: stats.draft,  color: 'text-neutral-600', bg: 'bg-neutral-50 border-neutral-200'  },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.bg}`}>
            <p className={`text-2xl font-black leading-none ${s.color}`}>{isLoading ? '…' : s.value}</p>
            <p className="mt-1.5 text-xs font-semibold text-neutral-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + filtres */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative w-full sm:min-w-[140px] sm:max-w-[240px]">
          <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une facture…"
            className="h-9 w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-4 text-sm outline-none placeholder:text-neutral-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
          />
        </div>
        <div ref={filterRef} className="relative">
          <button type="button" onClick={() => setShowFilterPanel(v => !v)}
            className={`relative flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-bold transition-all sm:px-4 ${statusFilter.size > 0 ? 'border-emerald-500 bg-emerald-600 text-white' : 'border-neutral-200 bg-white text-neutral-600 hover:border-emerald-300 hover:text-emerald-700'}`}>
            <SlidersHorizontal size={13} /> Filtrer
            {statusFilter.size > 0 && <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-black text-emerald-700">{statusFilter.size}</span>}
          </button>
          {showFilterPanel && (
            <div className="absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-2xl ring-1 ring-black/5">
              <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
                <span className="text-sm font-black text-neutral-900">Statut</span>
                {statusFilter.size > 0 && (
                  <button type="button" onClick={() => setStatusFilter(new Set())} className="text-[11px] font-bold text-emerald-700 hover:underline">
                    Réinitialiser
                  </button>
                )}
              </div>
              <div className="space-y-1 px-4 py-3">
                {(Object.keys(RECIPIENT_STATUS_CONFIG) as RecipientDoc['status'][]).map(val => {
                  const checked = statusFilter.has(val);
                  return (
                    <label key={val} className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 transition ${checked ? 'border-emerald-200 bg-emerald-50' : 'border-transparent hover:bg-neutral-50'}`}>
                      <input type="checkbox" checked={checked} onChange={() => setStatusFilter(prev => {
                        const n = new Set(prev);
                        checked ? n.delete(val) : n.add(val);
                        return n;
                      })} className="h-3.5 w-3.5 rounded border-neutral-300 accent-emerald-600" />
                      <span className="text-xs font-semibold text-neutral-700">{RECIPIENT_STATUS_CONFIG[val].label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invoice list */}
      <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
        <div className="border-b border-neutral-100 px-5 py-3.5">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-neutral-500">
            {isLoading ? 'Chargement...' : `${filtered.length} document${filtered.length > 1 ? 's' : ''} (Facture émise)`}
          </p>
        </div>
        <div className="divide-y divide-neutral-50">
          {isLoading && <Skeleton />}
          {isError && <div role="alert" className="px-5 py-10 text-center text-sm text-red-500">Erreur de chargement.</div>}
          {!isLoading && !isError && filtered.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-neutral-400">Aucune facture trouvée.</div>
          )}
          {!isLoading && !isError && filtered.map(row => {
            const inv = row.invoice;
            const invoiceCfg = STATUS_CONFIG[inv.status];
            const recipientCfg = RECIPIENT_STATUS_CONFIG[row.recipient.status] ?? RECIPIENT_STATUS_CONFIG.pending;
            {/* confirmDeleteId suit row.key (par DESTINATAIRE), pas inv._id (par facture) :
                une facture groupée partage un seul _id entre plusieurs destinataires — suivre
                inv._id ferait apparaître "Confirmer" sur toutes les lignes du groupe à la fois. */}
            const isDeleting = confirmDeleteId === row.key;
            const isSending = resendInvoiceRecipient.isPending;
            return (
              <div key={row.key} className="flex flex-wrap items-center gap-3 px-4 py-3 transition-colors hover:bg-neutral-50/60 sm:flex-nowrap sm:gap-4 sm:px-5 sm:py-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${row.isClient ? 'border-amber-100 bg-amber-50' : 'border-violet-100 bg-violet-50'}`}>
                  <FileText size={16} className="text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-black text-sm text-neutral-900">{inv.title}</p>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black ${invoiceCfg.badge}`}>
                      {invoiceCfg.icon} {invoiceCfg.label}
                    </span>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-black ${recipientCfg.badge}`}>
                      {recipientCfg.label}
                    </span>
                    {row.recipient.status === 'partiel' && trancheTag(row.recipient.lastPaidTranche)}
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-black ${row.isClient ? 'bg-amber-100 text-amber-700' : 'bg-violet-100 text-violet-700'}`}>
                      {row.isClient ? 'Client' : 'Membre'}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] font-mono text-neutral-400">{row.invoiceNumber}</p>
                  <p className="mt-1 truncate text-xs font-bold text-neutral-700">{row.name}</p>
                  <p className="truncate text-[11px] text-neutral-400">{row.email || row.phone || row.memberId || 'Coordonnees non renseignees'}</p>
                </div>
                <div className="hidden text-right sm:block shrink-0">
                  <p className="text-xs font-black text-neutral-700">{fmtCfa(inv.amount)}</p>
                  <p className="text-[10px] text-neutral-400">Échéance {fmt(inv.dueDate)}</p>
                </div>
                                <button type="button" onClick={() => setExpandedInvoice(expandedInvoice === row.key ? null : row.key)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 sm:hidden"
                  aria-label="Afficher les details">
                  <ChevronDown size={15} className={expandedInvoice === row.key ? 'rotate-180 transition' : 'transition'} />
                </button>
                {expandedInvoice === row.key && (
                  <div className="order-last mt-3 w-full rounded-lg border border-neutral-100 bg-neutral-50 p-3 sm:hidden">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div><p className="text-neutral-400">Montant</p><p className="mt-1 font-black">{fmtCfa(inv.amount)}</p></div>
                      <div><p className="text-neutral-400">Echeance</p><p className="mt-1 font-black">{fmt(inv.dueDate)}</p></div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setViewRecipientInvoice(row)} className="h-9 rounded-lg border border-violet-200 bg-white text-xs font-black text-violet-700">Voir</button>
                      <button type="button" onClick={() => resendInvoiceRecipient.mutate({ id: inv._id, invoiceNumber: row.invoiceNumber })} disabled={isSending || !row.email} className="h-9 rounded-lg border border-blue-200 bg-blue-50 text-xs font-black text-blue-700 disabled:opacity-50">Envoyer</button>
                      {inv.status === 'draft' && <button type="button" onClick={() => setEditInvoice(inv)} className="h-9 rounded-lg border border-emerald-200 bg-emerald-50 text-xs font-black text-emerald-700">Modifier</button>}
                      <button type="button" onClick={() => isDeleting ? removeRecipient.mutate({ id: inv._id, invoiceNumber: row.invoiceNumber }, { onSuccess: () => setConfirmDeleteId(null) }) : setConfirmDeleteId(row.key)} className="h-9 rounded-lg border border-red-100 bg-red-50 text-xs font-black text-red-600">{isDeleting ? 'Confirmer' : 'Supprimer'}</button>
                    </div>
                  </div>
                )}
<div className="hidden items-center gap-2 shrink-0 sm:flex">
                  <button onClick={() => setViewRecipientInvoice(row)} title="Voir la facture"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-400 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600">
                    <Eye size={13} />
                  </button>
                  {inv.status === 'draft' && (
                    <button onClick={() => setEditInvoice(inv)} title="Modifier le brouillon"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100">
                      <Pencil size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => resendInvoiceRecipient.mutate({ id: inv._id, invoiceNumber: row.invoiceNumber })}
                    disabled={isSending || !row.email}
                    title={row.status === 'sent' || row.status === 'paid' ? 'Renvoyer la facture' : 'Envoyer la facture'}
                    className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700 transition hover:bg-blue-100 disabled:opacity-60">
                    {isSending ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
                    {row.status === 'sent' || row.status === 'paid' ? 'Renvoyer' : 'Envoyer'}
                  </button>
                  {isDeleting ? (
                    <button
                      onClick={() => removeRecipient.mutate({ id: inv._id, invoiceNumber: row.invoiceNumber }, { onSuccess: () => setConfirmDeleteId(null) })}
                      disabled={removeRecipient.isPending}
                      className="flex h-8 items-center justify-center rounded-lg bg-red-500 px-2.5 text-[10px] font-black text-white transition hover:bg-red-600 disabled:opacity-50"
                    >
                      {removeRecipient.isPending ? <Loader2 size={11} className="animate-spin" /> : 'Confirmer'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(row.key)}
                      title="Retirer ce destinataire de la facture"
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-400 transition hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </>}

      {showMotifPicker && (
        <MotifPickerModal
          onClose={() => setShowMotifPicker(false)}
          onSelect={m => { setShowMotifPicker(false); setCreateMotif(m); }}
        />
      )}
      {createMotif && (
        <CreateInvoiceModal
          motif={createMotif}
          presetMemberId={presetMemberId}
          onClose={() => {
            setCreateMotif(null);
            if (motifParam) router.replace('/admin/facturation');
          }}
        />
      )}
      {showClients && <ClientsModal onClose={() => setShowClients(false)} />}
      {editInvoice && <EditInvoiceModal invoice={editInvoice} onClose={() => setEditInvoice(null)} />}
      {viewInvoice && <InvoiceDetailModal invoice={viewInvoice} onClose={() => setViewInvoice(null)} />}
      {viewRecipientInvoice && <RecipientInvoiceModal row={viewRecipientInvoice} onClose={() => setViewRecipientInvoice(null)} />}
    </div>
  );
}
