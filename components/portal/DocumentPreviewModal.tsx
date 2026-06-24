'use client';

import { Download, ExternalLink, FileText, X } from 'lucide-react';

export interface PreviewableDoc {
  _id: string;
  title: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  mimeLabel: string;
}

function fmtSize(bytes: number) {
  if (bytes < 1024)         return `${bytes} o`;
  if (bytes < 1024 * 1024)  return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

function isPdf(mime: string)   { return mime.includes('pdf'); }
function isImage(mime: string) { return mime.startsWith('image/'); }

export function DocumentPreviewModal({ doc, onClose }: { doc: PreviewableDoc; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/70 backdrop-blur-sm"
      onMouseDown={e => e.target === e.currentTarget && onClose()}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-[#0b1f15] px-4 py-3">
        <FileText size={16} className="shrink-0 text-emerald-400" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-white">{doc.title}</p>
          <p className="text-[11px] text-white/40">{doc.mimeLabel} · {fmtSize(doc.fileSize)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <a
            href={doc.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 items-center gap-1.5 rounded-lg border border-white/15 px-3 text-xs font-semibold text-white/70 transition hover:border-emerald-500/50 hover:text-emerald-400"
            title="Ouvrir dans un nouvel onglet"
          >
            <ExternalLink size={12} /> Ouvrir
          </a>
          <a
            href={doc.fileUrl}
            download
            className="flex h-8 items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/20"
            title="Télécharger"
          >
            <Download size={12} /> Télécharger
          </a>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-4">
        {isPdf(doc.mimeType) && (
          <iframe
            src={doc.fileUrl}
            title={doc.title}
            className="h-full w-full max-w-4xl rounded-xl border border-white/10 bg-white shadow-2xl"
            style={{ minHeight: '70vh' }}
          />
        )}

        {isImage(doc.mimeType) && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={doc.fileUrl}
            alt={doc.title}
            className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
          />
        )}

        {!isPdf(doc.mimeType) && !isImage(doc.mimeType) && (
          <div className="flex flex-col items-center gap-5 rounded-2xl border border-white/10 bg-white/5 px-10 py-12 text-center">
            <FileText size={48} className="text-white/20" />
            <div>
              <p className="text-base font-black text-white">{doc.title}</p>
              <p className="mt-1 text-sm text-white/40">{doc.mimeLabel} · {fmtSize(doc.fileSize)}</p>
            </div>
            <p className="text-sm text-white/40">La prévisualisation n&apos;est pas disponible pour ce format.</p>
            <div className="flex gap-3">
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 px-5 text-sm font-semibold text-white/70 transition hover:border-emerald-500/50 hover:text-emerald-400"
              >
                <ExternalLink size={14} /> Ouvrir
              </a>
              <a
                href={doc.fileUrl}
                download
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-black text-white transition hover:bg-emerald-700"
              >
                <Download size={14} /> Télécharger
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
