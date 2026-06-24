'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Inbox, Loader2, MessageSquare, Paperclip, Pencil, Search, Send, SendHorizontal, X } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/store/auth.store';
import {
  type Conversation,
  type InternalMessage,
  type MessageSpace,
  type MessageUser,
  useConversations,
  useMarkConversationRead,
  useReplyInternalMessage,
  useSendInternalMessage,
} from '@/lib/api/messages';
import type { MembersListResponse } from '@/lib/api/members';
import { formatFullName } from '@/lib/format-name';

type Recipient = { id: string; name: string; email: string };
type Mailbox = 'inbox' | 'sent';

type ConversationRow = {
  conversation: Conversation;
  title: string;
  subject: string;
  preview: string;
  date: string;
  unread: boolean;
};

const displayName = (user?: MessageUser | null) => user ? formatFullName(user.firstName, user.lastName) : 'Membre SALAM';
const dateLabel = (value?: string) => value ? new Date(value).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
const lastMessage = (messages: InternalMessage[], predicate?: (message: InternalMessage) => boolean) => {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (!predicate || predicate(message)) return message;
  }
  return undefined;
};

function Compose({ space, initial, onClose }: { space: MessageSpace; initial?: Recipient; onClose: () => void }) {
  const token = useAuthStore(s => s.accessToken);
  const [recipient, setRecipient] = useState(initial);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Recipient[]>([]);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const send = useSendInternalMessage(space);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        const endpoint = space === 'admin' ? '/api/v1/admin/members' : '/api/v1/member/directory';
        const response = await apiClient<MembersListResponse>(`${endpoint}?search=${encodeURIComponent(q)}&limit=8`, { token: token ?? '' });
        setResults(response.data.data.map(member => ({
          id: member._id,
          name: formatFullName(member.firstName, member.lastName),
          email: member.email,
        })));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Recherche impossible');
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [q, space, token]);

  async function submit() {
    if (!recipient || !subject.trim() || !content.trim()) return;
    try {
      await send.mutateAsync({ recipientIds: [recipient.id], subject: subject.trim(), content: content.trim() });
      toast.success('Message envoye');
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Envoi impossible');
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/55 p-3 backdrop-blur-sm sm:items-center" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <section className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <h2 className="flex items-center gap-2 font-black text-neutral-900"><Pencil size={15} className="text-emerald-600" /> Nouveau message</h2>
          <button type="button" aria-label="Fermer" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full text-neutral-500 hover:bg-neutral-100"><X size={17} /></button>
        </header>

        <div className="space-y-4 p-5">
          <div className="relative">
            <label className="mb-1 block text-xs font-bold uppercase tracking-[0.1em] text-emerald-600">À</label>
            {recipient ? (
              <div className="flex h-11 items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-sm font-bold text-emerald-800">
                <span className="truncate">{recipient.name}</span>
                <button type="button" aria-label="Retirer" onClick={() => setRecipient(undefined)}><X size={14} /></button>
              </div>
            ) : (
              <input value={q} onChange={event => setQ(event.target.value)} placeholder="Saisir le nom d'un membre..." className="h-11 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-emerald-500" />
            )}
            {!recipient && q.trim().length >= 2 && (
              <div className="absolute z-10 mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-neutral-100 bg-white shadow-xl">
                {results.map(result => (
                  <button type="button" key={result.id} onClick={() => { setRecipient(result); setQ(''); }} className="block w-full px-4 py-3 text-left hover:bg-emerald-50">
                    <span className="block text-sm font-bold text-neutral-900">{result.name}</span>
                    <span className="text-xs text-neutral-400">{result.email}</span>
                  </button>
                ))}
                {results.length === 0 && <p className="p-3 text-xs text-neutral-400">Recherche en cours ou aucun resultat.</p>}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-[0.1em] text-emerald-600">Objet</label>
            <input value={subject} maxLength={160} onChange={event => setSubject(event.target.value)} placeholder="Sujet du message..." className="h-11 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-[0.1em] text-emerald-600">Message</label>
            <textarea value={content} maxLength={4000} rows={6} onChange={event => setContent(event.target.value)} placeholder="Rédigez votre message..." className="w-full resize-none rounded-xl border border-neutral-200 p-3 text-sm outline-none focus:border-emerald-500" />
          </div>

          {/* Pièce jointe */}
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-[0.1em] text-emerald-600">Joindre un fichier</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.zip"
              className="sr-only"
              onChange={e => setAttachment(e.target.files?.[0] ?? null)}
            />
            {attachment ? (
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                <span className="flex items-center gap-2 truncate text-sm font-bold text-emerald-800">
                  <Paperclip size={13} className="shrink-0" />
                  <span className="truncate">{attachment.name}</span>
                </span>
                <button type="button" onClick={() => { setAttachment(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="ml-2 shrink-0 text-neutral-400 hover:text-neutral-700">
                  <X size={13} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center gap-2 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-500 transition hover:border-emerald-300 hover:bg-emerald-50/40 hover:text-emerald-700"
              >
                <Paperclip size={14} />
                <span>Sélectionner un fichier…</span>
                <span className="ml-auto text-[10px] text-neutral-400">PDF, DOC, JPG, ZIP…</span>
              </button>
            )}
          </div>
        </div>

        <footer className="flex justify-end gap-2 border-t border-neutral-100 p-4">
          <button type="button" onClick={onClose} className="h-10 rounded-xl border border-neutral-200 px-4 text-sm font-bold text-neutral-600 hover:bg-neutral-50">Annuler</button>
          <button type="button" onClick={submit} disabled={!recipient || !subject.trim() || !content.trim() || send.isPending} className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white disabled:opacity-40">
            {send.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Envoyer
          </button>
        </footer>
      </section>
    </div>
  );
}

function buildRows(conversations: Conversation[], me: string | undefined, mailbox: Mailbox): ConversationRow[] {
  return conversations
    .map(conversation => {
      const own = (message: InternalMessage) => message.sender?._id === me;
      const incoming = (message: InternalMessage) => Boolean(message.sender?._id && message.sender._id !== me);
      const relevant = mailbox === 'sent' ? lastMessage(conversation.messages, own) : lastMessage(conversation.messages, incoming);
      if (!relevant) return null;

      const peerNames = conversation.participants
        .filter(participant => participant._id !== me)
        .map(displayName)
        .filter(Boolean);
      const title = mailbox === 'sent'
        ? `A: ${peerNames.join(', ') || 'Membre SALAM'}`
        : displayName(relevant.sender) || peerNames.join(', ') || 'Membre SALAM';

      return {
        conversation,
        title,
        subject: conversation.subject || 'Message SALAM',
        preview: relevant.content,
        date: dateLabel(relevant.createdAt),
        unread: mailbox === 'inbox' && conversation.messages.some(message => incoming(message) && !message.read),
      };
    })
    .filter((row): row is ConversationRow => Boolean(row));
}

export function MessagingPage({ space }: { space: MessageSpace }) {
  const me = useAuthStore(state => state.user?._id);
  const query = useConversations(space);
  const conversations = query.data?.data ?? [];
  const [mailbox, setMailbox] = useState<Mailbox>('inbox');
  const [selectedId, setSelectedId] = useState<string>();
  const [compose, setCompose] = useState(false);
  const [initial, setInitial] = useState<Recipient>();
  const [search, setSearch] = useState('');
  const [reply, setReply] = useState('');
  const markRead = useMarkConversationRead(space);
  const replyMutation = useReplyInternalMessage(space);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('to');
    const name = params.get('name');
    if (id && name) {
      setInitial({ id, name, email: params.get('email') ?? '' });
      setCompose(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const inboxCount = useMemo(() => buildRows(conversations, me, 'inbox').length, [conversations, me]);
  const sentCount = useMemo(() => buildRows(conversations, me, 'sent').length, [conversations, me]);
  const rows = useMemo(() => {
    const queryText = search.trim().toLowerCase();
    return buildRows(conversations, me, mailbox).filter(row => {
      if (!queryText) return true;
      const haystack = `${row.title} ${row.subject} ${row.preview}`.toLowerCase();
      return haystack.includes(queryText);
    });
  }, [conversations, mailbox, me, search]);
  const selected = conversations.find(conversation => conversation._id === selectedId);

  useEffect(() => {
    if (selectedId && !rows.some(row => row.conversation._id === selectedId)) setSelectedId(undefined);
  }, [rows, selectedId]);

  function open(row: ConversationRow) {
    setSelectedId(row.conversation._id);
    if (row.unread) markRead.mutate(row.conversation._id);
  }

  async function sendReply() {
    if (!selected || !reply.trim()) return;
    try {
      await replyMutation.mutateAsync({ id: selected._id, content: reply.trim() });
      setReply('');
      toast.success('Reponse envoyee');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Envoi impossible');
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Messages</h1>
          <p className="text-sm text-neutral-500">Messagerie interne securisee SALAM</p>
        </div>
        <button type="button" onClick={() => { setInitial(undefined); setCompose(true); }} className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white hover:bg-emerald-700">
          <Pencil size={14} /><span className="hidden sm:inline">Nouveau message</span>
        </button>
      </header>

      <div className="grid min-h-[560px] overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm lg:grid-cols-[340px_1fr]">
        <aside className={`${selected ? 'hidden lg:flex' : 'flex'} min-w-0 flex-col border-r border-neutral-100`}>
          <div className="space-y-3 border-b border-neutral-100 p-3">
            <div className="grid grid-cols-2 rounded-xl bg-neutral-100 p-1">
              <button type="button" onClick={() => setMailbox('inbox')} className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg text-xs font-black transition ${mailbox === 'inbox' ? 'bg-white text-emerald-700 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}>
                <Inbox size={13} /> Recus <span className="rounded-full bg-neutral-200 px-1.5 py-0.5 text-[10px] text-neutral-600">{inboxCount}</span>
              </button>
              <button type="button" onClick={() => setMailbox('sent')} className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg text-xs font-black transition ${mailbox === 'sent' ? 'bg-white text-emerald-700 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}>
                <SendHorizontal size={13} /> Envoyes <span className="rounded-full bg-neutral-200 px-1.5 py-0.5 text-[10px] text-neutral-600">{sentCount}</span>
              </button>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Rechercher" className="h-10 w-full rounded-xl bg-neutral-50 pl-9 pr-3 text-sm outline-none ring-1 ring-neutral-100 focus:ring-emerald-300" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {query.isLoading && <p className="p-8 text-center text-sm text-neutral-400">Chargement...</p>}
            {!query.isLoading && !rows.length && (
              <div className="p-10 text-center">
                <MessageSquare size={32} className="mx-auto text-neutral-200" />
                <p className="mt-3 text-sm font-bold text-neutral-400">Aucun message {mailbox === 'sent' ? 'envoye' : 'recu'}</p>
                <p className="mt-1 text-xs text-neutral-300">{mailbox === 'sent' ? 'Vos messages envoyes apparaitront ici.' : 'Vos messages recus apparaitront ici.'}</p>
              </div>
            )}
            {rows.map(row => (
              <button type="button" key={row.conversation._id} onClick={() => open(row)} className={`w-full border-b border-neutral-50 p-4 text-left hover:bg-neutral-50 ${selectedId === row.conversation._id ? 'bg-emerald-50/70' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <span className={`min-w-0 truncate text-sm ${row.unread ? 'font-black text-neutral-950' : 'font-bold text-neutral-600'}`}>{row.title}</span>
                  <span className="shrink-0 text-[10px] text-neutral-400">{row.date}</span>
                </div>
                <p className={`mt-1 truncate text-xs ${row.unread ? 'font-bold text-neutral-800' : 'font-semibold text-neutral-500'}`}>{row.subject}</p>
                <div className="mt-1 flex items-center gap-2">
                  {row.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />}
                  <p className="min-w-0 truncate text-xs text-neutral-400">{row.preview}</p>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <main className={`${selected ? 'flex' : 'hidden lg:flex'} min-w-0 flex-col`}>
          {selected ? (
            <>
              <header className="flex items-center gap-3 border-b border-neutral-100 p-4">
                <button type="button" onClick={() => setSelectedId(undefined)} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-neutral-100 lg:hidden"><ArrowLeft size={17} /></button>
                <div className="min-w-0">
                  <h2 className="truncate font-black text-neutral-900">{selected.subject || 'Message SALAM'}</h2>
                  <p className="text-xs text-neutral-400">{selected.messages.length} message(s)</p>
                </div>
              </header>
              <div className="flex-1 space-y-3 overflow-y-auto bg-neutral-50 p-4 sm:p-6">
                {selected.messages.map(message => {
                  const mine = message.sender?._id === me;
                  return (
                    <div key={message._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${mine ? 'rounded-br-sm bg-emerald-600 text-white' : 'rounded-bl-sm bg-white text-neutral-800 shadow-sm'}`}>
                        <p className={`mb-1 text-[10px] font-bold ${mine ? 'text-emerald-100' : 'text-neutral-400'}`}>{mine ? 'Moi' : displayName(message.sender)}</p>
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                        <p className={`mt-1 text-[10px] ${mine ? 'text-emerald-100' : 'text-neutral-400'}`}>{new Date(message.createdAt).toLocaleString('fr-FR')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <footer className="flex gap-2 border-t border-neutral-100 p-3">
                <textarea value={reply} maxLength={4000} onChange={event => setReply(event.target.value)} rows={2} placeholder="Ecrire une reponse..." className="min-w-0 flex-1 resize-none rounded-xl border border-neutral-200 p-3 text-sm outline-none focus:border-emerald-500" />
                <button type="button" onClick={sendReply} disabled={!reply.trim() || replyMutation.isPending} className="grid h-11 w-11 place-items-center self-end rounded-xl bg-emerald-600 text-white disabled:opacity-40"><Send size={15} /></button>
              </footer>
            </>
          ) : (
            <div className="m-auto text-center">
              <MessageSquare size={40} className="mx-auto text-neutral-200" />
              <p className="mt-3 text-sm font-bold text-neutral-400">Selectionnez une conversation</p>
            </div>
          )}
        </main>
      </div>

      {compose && <Compose space={space} initial={initial} onClose={() => setCompose(false)} />}
    </div>
  );
}
