'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Download, Eye, FileText, Loader2, Pencil, Send, Trash2, Upload, Users, X, Search, CheckSquare, Square, Mail, GraduationCap, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminDocuments, useDeleteDocument, useRenameDocument, useSendDocument, useUploadDocument, type SharedDocument } from '@/lib/api/documents';
import { useAdminMembers } from '@/lib/api/members';
import { MemberFilterPanel, EMPTY_MEMBER_FILTERS, memberMatchesFilters, type MemberFilters } from '@/components/admin/MemberFilterPanel';
import { useAdminAttestationTemplate, useSaveAttestationTemplate } from '@/lib/api/attestation';
import { DocumentPreviewModal } from '@/components/portal/DocumentPreviewModal';
import { RichTextEditor } from '@/components/ui/RichTextEditor';

/* ── Helpers ──────────────────────────────────────────── */
function fmtSize(bytes: number) {
  if (bytes < 1024)        return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

const MIME_ICON: Record<string, string> = {
  pdf: '📄', word: '📝', excel: '📊', powerpoint: '📑', image: '🖼️',
};
function mimeIcon(mime: string) {
  if (mime.includes('pdf')) return MIME_ICON.pdf;
  if (mime.includes('word')) return MIME_ICON.word;
  if (mime.includes('sheet')) return MIME_ICON.excel;
  if (mime.includes('presentation')) return MIME_ICON.powerpoint;
  if (mime.startsWith('image/')) return MIME_ICON.image;
  return '📎';
}

/* ── Send Modal ───────────────────────────────────────── */
function SendModal({ doc, onClose }: { doc: SharedDocument; onClose: () => void }) {
  const [search, setSearch]       = useState('');
  const [filters, setFilters]     = useState<MemberFilters>(EMPTY_MEMBER_FILTERS);
  const [selected, setSelected]   = useState<Set<string>>(new Set());
  const [sendAll, setSendAll]     = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const sendDoc = useSendDocument();
  const { data: membersData } = useAdminMembers({ limit: 500 });
  const members = membersData?.data?.data ?? [];

  const filtered = members.filter(m => {
    const name = `${m.firstName ?? ''} ${m.lastName ?? ''} ${m.email ?? ''}`.toLowerCase();
    return name.includes(search.toLowerCase()) && memberMatchesFilters(m, filters);
  });

  const toggle = (id: string) =>
    setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(m => m._id)));
  };

  const handleSend = () => {
    if (!sendAll && selected.size === 0) { toast.error('Sélectionnez au moins un membre'); return; }
    sendDoc.mutate(
      { id: doc._id, memberIds: sendAll ? undefined : [...selected], sendAll, sendByEmail: sendEmail },
      { onSuccess: onClose },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 backdrop-blur-sm sm:items-center">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 bg-emerald-50/40 px-6 py-4 shrink-0">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">Partager</p>
            <h2 className="font-black text-neutral-900">Envoyer aux membres</h2>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100"><X size={15} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Document info */}
          <div className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50 p-3">
            <span className="text-xl">{mimeIcon(doc.mimeType)}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-neutral-900">{doc.title}</p>
              <p className="text-xs text-neutral-400">{fmtSize(doc.fileSize)}</p>
            </div>
          </div>

          {/* Send all toggle */}
          <div className="flex items-center justify-between rounded-xl border border-neutral-100 p-3">
            <div>
              <p className="text-sm font-semibold text-neutral-800">Envoyer à tous les membres</p>
              <p className="text-xs text-neutral-400">Tous les membres, y compris en attente d&apos;inscription</p>
            </div>
            <button
              type="button"
              onClick={() => setSendAll(v => !v)}
              className={`relative h-5 w-9 shrink-0 rounded-full transition-all sm:h-6 sm:w-11 ${sendAll ? 'bg-emerald-500' : 'bg-neutral-200'}`}
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all sm:h-5 sm:w-5 ${sendAll ? 'left-[18px] sm:left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>

          {/* Member picker (if not send all) */}
          {!sendAll && (
            <div className="space-y-2">
              <div className="relative">
                <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher un membre…"
                  className="h-9 w-full rounded-xl border border-neutral-200 pl-9 pr-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>
              <MemberFilterPanel filters={filters} onChange={setFilters} />
              <div className="flex items-center justify-between px-1">
                <p className="text-xs text-neutral-400">{selected.size} sélectionné(s)</p>
                <button type="button" onClick={toggleAll} className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                  {selected.size === filtered.length && filtered.length > 0 ? <CheckSquare size={13} /> : <Square size={13} />}
                  Tout sélectionner
                </button>
              </div>
              <div className="max-h-52 overflow-y-auto rounded-xl border border-neutral-100 bg-white">
                {filtered.length === 0 && (
                  <p className="px-4 py-8 text-center text-sm text-neutral-400">Aucun membre trouvé</p>
                )}
                {filtered.map(m => {
                  const id = m._id;
                  const name = `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim();
                  const checked = selected.has(id);
                  return (
                    <button
                      type="button"
                      key={id}
                      onClick={() => toggle(id)}
                      className={`flex w-full items-center gap-3 border-b border-neutral-50 px-4 py-2.5 text-left last:border-b-0 transition-colors ${checked ? 'bg-emerald-50' : 'hover:bg-neutral-50'}`}
                    >
                      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${checked ? 'border-emerald-500 bg-emerald-500' : 'border-neutral-300'}`}>
                        {checked && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 12 10"><path d="M1.5 5L4.5 8L10.5 2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-neutral-900">{name || m.email}</p>
                        <p className="truncate text-xs text-neutral-400">{m.email}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Email option */}
          <div className="flex items-center gap-3 rounded-xl border border-neutral-100 p-3">
            <Mail size={15} className="shrink-0 text-neutral-400" />
            <p className="flex-1 text-sm text-neutral-700">Envoyer aussi par email</p>
            <button
              type="button"
              onClick={() => setSendEmail(v => !v)}
              className={`relative h-5 w-9 shrink-0 rounded-full transition-all sm:h-6 sm:w-11 ${sendEmail ? 'bg-emerald-500' : 'bg-neutral-200'}`}
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all sm:h-5 sm:w-5 ${sendEmail ? 'left-[18px] sm:left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-neutral-100 p-5 shrink-0">
          <button onClick={onClose} className="h-10 flex-1 rounded-xl border border-neutral-200 text-sm font-bold text-neutral-600 hover:border-neutral-300">Annuler</button>
          <button
            onClick={handleSend}
            disabled={sendDoc.isPending || (!sendAll && selected.size === 0)}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {sendDoc.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={13} />}
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Upload zone ─────────────────────────────────────── */
function UploadZone() {
  const inputRef     = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [file, setFile]   = useState<File | null>(null);
  const uploadDoc = useUploadDocument();

  const handleFile = (f: File) => { setFile(f); if (!title) setTitle(f.name.replace(/\.[^.]+$/, '')); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };
  const handleSubmit = () => {
    if (!file) return;
    uploadDoc.mutate({ file, title: title.trim() || file.name }, { onSuccess: () => { setFile(null); setTitle(''); } });
  };

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm space-y-3">
      <p className="text-sm font-black text-neutral-900">Importer un document</p>
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 px-6 py-8 text-center transition hover:border-emerald-400 hover:bg-emerald-50/30"
      >
        <Upload size={22} className="mb-2 text-emerald-600" />
        <p className="text-sm font-semibold text-neutral-700">{file ? file.name : 'Glissez un fichier ou cliquez pour parcourir'}</p>
        <p className="mt-1 text-xs text-neutral-400">PDF, Word, Excel, PowerPoint, images — max 20 Mo</p>
        <input ref={inputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/*" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </div>
      {file && (
        <div className="space-y-2">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Titre du document"
            className="h-9 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-emerald-500"
          />
          <button
            onClick={handleSubmit}
            disabled={uploadDoc.isPending}
            className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {uploadDoc.isPending ? <Loader2 size={14} className="animate-spin" /> : <Upload size={13} />} Importer
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Éditeur d'attestation (modèle unique, rempli par membre à la demande) ── */
const ATTESTATION_TOKENS: [string, string][] = [
  ['{{NOM_COMPLET}}', 'Prénom + nom du membre'],
  ['{{PRENOM}}', 'Prénom'],
  ['{{NOM}}', 'Nom'],
  ['{{CIVILITE}}', 'Monsieur / Madame'],
  ['{{NUMERO_MEMBRE}}', 'N° membre'],
  ['{{EMAIL}}', 'Email'],
  ['{{ANNEE_PROMOTION}}', 'Année de promotion'],
  ['{{VILLE}}', 'Ville de résidence'],
  ['{{PAYS}}', 'Pays'],
  ['{{DATE}}', "Date du jour (à l'édition)"],
];

function AttestationEditor() {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useAdminAttestationTemplate();
  const saveTemplate = useSaveAttestationTemplate();
  const [title, setTitle] = useState("Attestation d'adhésion");
  const [bodyHtml, setBodyHtml] = useState('');

  useEffect(() => {
    if (data?.data) {
      setTitle(data.data.title);
      setBodyHtml(data.data.bodyHtml);
    }
  }, [data]);

  return (
    <div className="rounded-2xl border border-violet-100 bg-white shadow-sm">
      <button type="button" onClick={() => setOpen(v => !v)} className="flex w-full items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-700"><GraduationCap size={16} /></span>
          <div className="text-left">
            <p className="text-sm font-black text-neutral-900">Modèle d&apos;attestation d&apos;adhésion</p>
            <p className="text-xs text-neutral-500">Chaque membre génère sa propre attestation depuis son espace, remplie automatiquement.</p>
          </div>
        </div>
        <ChevronDown size={16} className={`shrink-0 text-neutral-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="space-y-3 border-t border-neutral-100 px-5 py-4">
            {isLoading ? (
              <p className="text-sm text-neutral-400">Chargement…</p>
            ) : (
              <>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre du document"
                  className="h-9 w-full rounded-xl border border-neutral-200 px-3 text-sm font-semibold outline-none focus:border-violet-400" />
                <RichTextEditor value={bodyHtml} onChange={setBodyHtml} placeholder="Rédigez le texte de l'attestation en insérant les jetons ci-dessous…" />
                <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-3">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.12em] text-violet-600">Jetons disponibles (à saisir tels quels dans le texte)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ATTESTATION_TOKENS.map(([token, label]) => (
                      <span key={token} title={label} className="rounded-full border border-violet-200 bg-white px-2 py-1 font-mono text-[10px] font-bold text-violet-700">
                        {token}
                      </span>
                    ))}
                  </div>
                </div>
                <button type="button" onClick={() => saveTemplate.mutate({ title, bodyHtml })} disabled={saveTemplate.isPending || !bodyHtml.trim()}
                  className="inline-flex h-9 items-center gap-2 rounded-xl bg-violet-600 px-4 text-xs font-black text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-50">
                  {saveTemplate.isPending ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Enregistrer le modèle
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Page principale ────────────────────────────────── */
export default function AdminDocumentsPage() {
  const [sendModal,    setSendModal]    = useState<SharedDocument | null>(null);
  const [previewDoc,   setPreviewDoc]   = useState<SharedDocument | null>(null);
  const [renaming,     setRenaming]     = useState<string | null>(null);
  const [renameValue,  setRenameValue]  = useState('');
  const { data, isLoading } = useAdminDocuments();
  const deleteDoc  = useDeleteDocument();
  const renameDoc  = useRenameDocument();
  const documents  = data?.data?.documents ?? [];

  const startRename = (doc: SharedDocument) => {
    setRenaming(doc._id);
    setRenameValue(doc.title);
  };
  const commitRename = (id: string) => {
    const title = renameValue.trim();
    if (!title) { toast.error('Le titre ne peut pas être vide'); return; }
    renameDoc.mutate({ id, title }, { onSuccess: () => setRenaming(null) });
  };
  const cancelRename = () => setRenaming(null);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Documents internes</h1>
        <p className="mt-0.5 text-sm text-neutral-500">Importez des documents et partagez-les avec les membres de l&apos;association.</p>
      </div>

      <UploadZone />
      <AttestationEditor />

      <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
        <div className="border-b border-neutral-100 bg-emerald-50/40 px-5 py-3.5">
          <p className="text-xs font-black uppercase text-neutral-500">
            {isLoading ? 'Chargement…' : `${documents.length} document(s)`}
          </p>
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 size={20} className="animate-spin text-emerald-600" />
          </div>
        )}

        {!isLoading && documents.length === 0 && (
          <div className="flex flex-col items-center px-5 py-12 text-center">
            <FileText size={32} className="mb-3 text-neutral-200" />
            <p className="text-sm font-semibold text-neutral-400">Aucun document importé.</p>
          </div>
        )}

        <div className="divide-y divide-neutral-50">
          {documents.map(doc => {
            const isRenaming = renaming === doc._id;
            return (
              <div key={doc._id} className="flex items-center gap-3 px-4 py-3.5 sm:gap-4 sm:px-5">
                <span className="text-xl shrink-0">{mimeIcon(doc.mimeType)}</span>
                <div className="min-w-0 flex-1">
                  {isRenaming ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') commitRename(doc._id);
                          if (e.key === 'Escape') cancelRename();
                        }}
                        className="h-8 min-w-0 flex-1 rounded-lg border border-emerald-400 px-2 text-sm font-semibold text-neutral-900 outline-none ring-2 ring-emerald-500/15"
                      />
                      <button
                        type="button"
                        onClick={() => commitRename(doc._id)}
                        disabled={renameDoc.isPending}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                        title="Valider"
                      >
                        {renameDoc.isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={13} />}
                      </button>
                      <button
                        type="button"
                        onClick={cancelRename}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 hover:bg-neutral-50"
                        title="Annuler"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <p className="truncate text-sm font-black text-neutral-900">{doc.title}</p>
                  )}
                  <p className="mt-0.5 text-[11px] text-neutral-400">
                    {fmtSize(doc.fileSize)} · {doc.mimeLabel} · Importé le {fmtDate(doc.createdAt)}
                  </p>
                  {doc.sentAt && (
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-emerald-600">
                      <Users size={11} />
                      {doc.sentAll
                        ? 'Envoyé à tous les membres'
                        : `Envoyé à ${doc.sentToCount ?? doc.sentTo.length} membre(s)`} · {fmtDate(doc.sentAt)}
                    </p>
                  )}
                </div>
                {!isRenaming && (
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPreviewDoc(doc)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                      title="Visualiser"
                    >
                      <Eye size={13} />
                    </button>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 transition hover:border-neutral-300 hover:text-neutral-600"
                      title="Télécharger"
                    >
                      <Download size={13} />
                    </a>
                    <button
                      type="button"
                      onClick={() => startRename(doc)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                      title="Renommer"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSendModal(doc)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100"
                      title="Envoyer aux membres"
                    >
                      <Send size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Supprimer ce document ?')) deleteDoc.mutate(doc._id);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100"
                      title="Supprimer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {sendModal    && <SendModal doc={sendModal} onClose={() => setSendModal(null)} />}
      {previewDoc   && <DocumentPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />}
    </div>
  );
}
