'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Send, MessageSquare, Search, ArrowLeft, Pencil, Paperclip, X, Loader2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/store/auth.store';
import type { MembersListResponse } from '@/lib/api/members';
import { formatFullName } from '@/lib/format-name';

type Message = { id: number; from: string; subject: string; preview: string; date: string; read: boolean; body: string };
type Recipient = { id: string; name: string; email: string };

/* ── RecipientPicker ─────────────────────────────────────── */

function RecipientPicker({
  value, onChange, label, placeholder = 'Saisir le nom d\'un membre…',
}: {
  value: Recipient[];
  onChange: (v: Recipient[]) => void;
  label: string;
  placeholder?: string;
}) {
  const [q, setQ]       = useState('');
  const [open, setOpen] = useState(false);
  const token = useAuthStore(s => s.accessToken);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['msg-member-search', q],
    queryFn: async () => {
      const res = await apiClient<MembersListResponse>(
        `/api/v1/member/directory??search=${encodeURIComponent(q)}&limit=8`,
        { token: token ?? '' },
      );
      return res.data.data.map(m => ({
        id:    m._id,
        name:  formatFullName(m.firstName, m.lastName),
        email: m.email,
      }));
    },
    enabled: !!token && q.trim().length >= 2,
    staleTime: 15_000,
    retry: false,
  });

  const add = (r: Recipient) => {
    if (!value.find(v => v.id === r.id)) onChange([...value, r]);
    setQ(''); setOpen(false);
  };

  const addTyped = () => {
    const trimmed = q.trim();
    if (!trimmed) return;
    if (!value.find(v => v.name.toLowerCase() === trimmed.toLowerCase())) {
      onChange([...value, { id: trimmed, name: trimmed, email: '' }]);
    }
    setQ(''); setOpen(false);
  };

  const remove = (id: string) => onChange(value.filter(r => r.id !== id));

  return (
    <div>
      <label className="mb-1 block text-xs font-black uppercase tracking-[0.1em] text-neutral-500">{label}</label>
      <div className="relative">
        <div className="flex min-h-[38px] flex-wrap items-center gap-1.5 rounded-xl border border-neutral-200 px-2.5 py-1.5 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/10">
          {value.map(r => (
            <span key={r.id} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-100">
              {r.name}
              <button type="button" onClick={() => remove(r.id)} className="ml-0.5 text-emerald-400 hover:text-emerald-700">
                <X size={10} />
              </button>
            </span>
          ))}
          <input
            value={q}
            onChange={e => { setQ(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); results.length > 0 ? add(results[0]) : addTyped(); } }}
            placeholder={value.length === 0 ? placeholder : ''}
            className="min-w-[140px] flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-300"
          />
        </div>

        {open && q.trim().length >= 2 && (
          <>
            <div className="fixed inset-0 z-[19]" onClick={() => setOpen(false)} />
            <div className="absolute left-0 right-0 top-full z-[20] mt-1 overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-xl">
              {isLoading && (
                <div className="flex items-center gap-2 px-4 py-3">
                  <Loader2 size={13} className="animate-spin text-neutral-400" />
                  <span className="text-xs text-neutral-400">Recherche…</span>
                </div>
              )}
              {!isLoading && results.length === 0 && (
                <button type="button" onClick={addTyped} className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-neutral-50">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-xs font-black text-neutral-500">{q[0]?.toUpperCase()}</div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-700">Ajouter &ldquo;{q}&rdquo;</p>
                    <p className="text-xs text-neutral-400">Appuyez sur Entrée pour confirmer</p>
                  </div>
                </button>
              )}
              {results.map(r => (
                <button key={r.id} type="button" onClick={() => add(r)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-emerald-50/50">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-black text-emerald-600">
                    {r.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-neutral-900">{r.name}</p>
                    <p className="truncate text-xs text-neutral-400">{r.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── ComposeModal ────────────────────────────────────────── */

function ComposeModal({ onClose }: { onClose: () => void }) {
  const [to,        setTo]        = useState<Recipient[]>([]);
  const [cc,        setCc]        = useState<Recipient[]>([]);
  const [bcc,       setBcc]       = useState<Recipient[]>([]);
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [subject,   setSubject]   = useState('');
  const [body,      setBody]      = useState('');
  const [attachName,setAttachName]= useState('');
  const [sent,      setSent]      = useState(false);

  const canSend = to.length > 0 && subject.trim() !== '' && body.trim() !== '';

  const handleSend = () => {
    if (!canSend || sent) return;
    setSent(true);
    toast.success('Message envoyé');
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
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100">
            <X size={15} />
          </button>
        </div>

        <div className="space-y-3 px-5 py-4">
          <RecipientPicker value={to} onChange={setTo} label="À" placeholder="Saisir le nom d'un membre…" />

          {/* CC / CCI toggle */}
          <button
            type="button"
            onClick={() => setShowCcBcc(v => !v)}
            className="flex items-center gap-1 text-xs font-semibold text-neutral-400 hover:text-emerald-600 transition-colors"
          >
            <ChevronDown size={12} className={`transition-transform ${showCcBcc ? 'rotate-180' : ''}`} />
            {showCcBcc ? 'Masquer CC / CCI' : 'Ajouter CC / CCI'}
          </button>

          {showCcBcc && (
            <>
              <RecipientPicker value={cc}  onChange={setCc}  label="CC"  placeholder="Copie visible…" />
              <RecipientPicker value={bcc} onChange={setBcc} label="CCI" placeholder="Copie invisible…" />
            </>
          )}

          <div>
            <label className="mb-1 block text-xs font-black uppercase tracking-[0.1em] text-neutral-500">Objet</label>
            <input
              value={subject} onChange={e => setSubject(e.target.value)}
              placeholder="Sujet du message…"
              className="h-9 w-full rounded-xl border border-neutral-200 px-3 text-sm placeholder:text-neutral-300 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-black uppercase tracking-[0.1em] text-neutral-500">Message</label>
            <textarea
              value={body} onChange={e => setBody(e.target.value)}
              rows={5}
              placeholder="Rédigez votre message…"
              className="w-full resize-none rounded-xl border border-neutral-200 px-3 py-2.5 text-sm placeholder:text-neutral-300 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
            />
          </div>

          {/* Attachment */}
          <div className="flex items-center gap-2">
            <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-500 transition hover:border-emerald-300 hover:text-emerald-600">
              <Paperclip size={12} />
              {attachName || 'Joindre un document'}
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
            disabled={!canSend || sent}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-black transition-all disabled:opacity-40 ${sent ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
          >
            {sent ? '✓ Envoyé !' : <><Send size={13} /> Envoyer</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────── */

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
    toast.success('Réponse envoyée');
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
                type="text" placeholder="Rechercher…" value={search}
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
                  value={reply} onChange={e => setReply(e.target.value)}
                  placeholder="Écrire une réponse…" rows={2}
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

              {/* Attach */}
              <div className="flex items-center gap-2">
                <label className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-neutral-400 transition hover:text-emerald-600">
                  <Paperclip size={12} />
                  <span>{attachName || 'Joindre un document'}</span>
                  <input type="file" className="sr-only" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={e => { if (e.target.files?.[0]) setAttachName(e.target.files[0].name); }} />
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
