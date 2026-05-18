'use client';

import { useState } from 'react';
import { Send, MessageSquare, Search, ArrowLeft, Pencil, Paperclip, X } from 'lucide-react';

type Message = { id: number; from: string; subject: string; preview: string; date: string; read: boolean; body: string };

function ComposeModal({ onClose }: { onClose: () => void }) {
  const [to,         setTo]         = useState('');
  const [subject,    setSubject]    = useState('');
  const [body,       setBody]       = useState('');
  const [attachName, setAttachName] = useState('');
  const [sent,       setSent]       = useState(false);

  const handleSend = () => {
    if (!subject.trim() || !body.trim()) return;
    setSent(true);
    setTimeout(onClose, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/50 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <Pencil size={14} className="text-emerald-600" />
            <h3 className="font-black text-neutral-900">Nouveau message</h3>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100"><X size={15} /></button>
        </div>

        <div className="space-y-3 px-5 py-4">
          <div>
            <label className="mb-1 block text-xs font-black uppercase tracking-[0.1em] text-neutral-500">Destinataire</label>
            <input
              value={to} onChange={e => setTo(e.target.value)}
              placeholder="Bureau exécutif SALAM"
              className="h-9 w-full rounded-xl border border-neutral-200 px-3 text-sm placeholder:text-neutral-300 focus:border-emerald-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-black uppercase tracking-[0.1em] text-neutral-500">Objet</label>
            <input
              value={subject} onChange={e => setSubject(e.target.value)}
              placeholder="Sujet du message…"
              className="h-9 w-full rounded-xl border border-neutral-200 px-3 text-sm placeholder:text-neutral-300 focus:border-emerald-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-black uppercase tracking-[0.1em] text-neutral-500">Message</label>
            <textarea
              value={body} onChange={e => setBody(e.target.value)}
              rows={5}
              placeholder="Rédigez votre message…"
              className="w-full resize-none rounded-xl border border-neutral-200 px-3 py-2.5 text-sm placeholder:text-neutral-300 focus:border-emerald-400 focus:outline-none"
            />
          </div>

          {/* Attachment */}
          <div className="flex items-center gap-2">
            <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-500 transition hover:border-emerald-300 hover:text-emerald-600">
              <Paperclip size={12} />
              {attachName ? attachName : 'Joindre un document'}
              <input
                type="file"
                className="sr-only"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={e => { if (e.target.files?.[0]) setAttachName(e.target.files[0].name); }}
              />
            </label>
            {attachName && (
              <button onClick={() => setAttachName('')} className="text-neutral-300 hover:text-neutral-600">
                <X size={11} />
              </button>
            )}
            <p className="text-[10px] text-neutral-300">PDF, JPG, PNG, DOC · max 5 Mo</p>
          </div>
        </div>

        <div className="flex gap-3 border-t border-neutral-100 px-5 py-4">
          <button onClick={onClose} className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-600 hover:border-neutral-300">
            Annuler
          </button>
          <button
            onClick={handleSend}
            disabled={!subject.trim() || !body.trim() || sent}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-black transition-all disabled:opacity-40 ${sent ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
          >
            {sent ? '✓ Envoyé !' : <><Send size={13} /> Envoyer</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  const [messages]                  = useState<Message[]>([]);
  const [selected, setSelected]     = useState<Message | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [search, setSearch]         = useState('');
  const [reply, setReply]           = useState('');
  const [replySent, setReplySent]   = useState(false);
  const [attachName, setAttachName] = useState('');
  const [compose, setCompose]       = useState(false);

  const filtered = messages.filter(m =>
    `${m.from} ${m.subject} ${m.preview}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleReply = () => {
    if (!reply.trim()) return;
    setReplySent(true);
    setReply('');
    setAttachName('');
    setTimeout(() => setReplySent(false), 2500);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Messages</h1>
          <p className="mt-0.5 text-sm text-neutral-500">Communications de l&apos;équipe SALAM</p>
        </div>
        <button
          onClick={() => setCompose(true)}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-black text-white transition-all hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20"
        >
          <Pencil size={13} /> Nouveau message
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr] min-h-[420px] lg:h-[calc(100vh-200px)]">

        {/* Message list */}
        <div className={`flex-col rounded-2xl border border-neutral-100 bg-white shadow-sm overflow-hidden ${showDetail ? 'hidden lg:flex' : 'flex'}`}>
          <div className="border-b border-neutral-100 p-3">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Rechercher…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-8 w-full rounded-lg border border-neutral-200 bg-neutral-50 pl-8 pr-3 text-xs placeholder:text-neutral-400 focus:outline-none focus:border-emerald-300"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-neutral-50">
            {filtered.map(m => (
              <button
                key={m.id}
                onClick={() => { setSelected(m); setShowDetail(true); }}
                className={`w-full text-left px-4 py-3.5 transition-colors hover:bg-neutral-50 ${selected?.id === m.id ? 'bg-emerald-50/60 border-l-[3px] border-l-emerald-500' : ''}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className={`truncate text-xs ${m.read ? 'font-semibold text-neutral-600' : 'font-black text-neutral-900'}`}>{m.from}</p>
                  <span className="shrink-0 text-[10px] text-neutral-400">{m.date}</span>
                </div>
                <p className={`mt-0.5 truncate text-xs ${m.read ? 'text-neutral-500' : 'font-semibold text-neutral-700'}`}>{m.subject}</p>
                <p className="mt-0.5 truncate text-[10px] text-neutral-400">{m.preview}</p>
                {!m.read && <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />}
              </button>
            ))}

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare size={32} className="mb-3 text-neutral-200" />
                <p className="text-sm font-semibold text-neutral-400">Aucun message</p>
                <p className="mt-1 text-xs text-neutral-300">Vos messages apparaîtront ici.</p>
                <button
                  onClick={() => setCompose(true)}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-black text-white hover:bg-emerald-700"
                >
                  <Pencil size={11} /> Écrire un message
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Message view */}
        {selected ? (
          <div className={`flex-col rounded-2xl border border-neutral-100 bg-white shadow-sm overflow-hidden ${showDetail ? 'flex' : 'hidden lg:flex'}`}>
            <div className="border-b border-neutral-100 p-5">
              <button onClick={() => setShowDetail(false)} className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 lg:hidden">
                <ArrowLeft size={13} /> Retour aux messages
              </button>
              <h2 className="font-black text-neutral-900">{selected.subject}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-[10px] font-black text-white">
                  {selected.from[0]}
                </div>
                <p className="text-xs font-semibold text-neutral-600">{selected.from}</p>
                <span className="text-[10px] text-neutral-400">{selected.date}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <p className="whitespace-pre-line text-sm leading-[1.75] text-neutral-700">{selected.body}</p>
            </div>

            {/* Reply area */}
            <div className="border-t border-neutral-100 p-4 space-y-2">
              <div className="flex gap-2">
                <textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  placeholder="Écrire une réponse…"
                  rows={2}
                  className="flex-1 resize-none rounded-xl border border-neutral-200 px-4 py-2.5 text-sm placeholder:text-neutral-400 focus:border-emerald-400 focus:outline-none"
                />
                <button
                  onClick={handleReply}
                  disabled={!reply.trim() || replySent}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-xl transition-all ${replySent ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-600 text-white hover:bg-emerald-700'} disabled:opacity-40`}
                >
                  <Send size={15} />
                </button>
              </div>

              {/* Attach document */}
              <div className="flex items-center gap-2">
                <label className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-neutral-400 transition hover:text-emerald-600">
                  <Paperclip size={12} />
                  <span>{attachName || 'Joindre un document'}</span>
                  <input
                    type="file"
                    className="sr-only"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={e => { if (e.target.files?.[0]) setAttachName(e.target.files[0].name); }}
                  />
                </label>
                {attachName && (
                  <>
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-500">{attachName}</span>
                    <button onClick={() => setAttachName('')} className="text-neutral-300 hover:text-neutral-600"><X size={11} /></button>
                  </>
                )}
              </div>

              {replySent && <p className="text-xs font-semibold text-emerald-600">✓ Réponse envoyée</p>}
            </div>
          </div>
        ) : (
          <div className="hidden items-center justify-center rounded-2xl border border-neutral-100 bg-white shadow-sm lg:flex">
            <div className="text-center">
              <MessageSquare size={40} className="mx-auto text-neutral-200" />
              <p className="mt-3 text-sm font-semibold text-neutral-400">Sélectionnez un message</p>
            </div>
          </div>
        )}
      </div>

      {compose && <ComposeModal onClose={() => setCompose(false)} />}
    </div>
  );
}
