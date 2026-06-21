'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Loader2, MessageSquare, Pencil, Search, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/store/auth.store';
import { type Conversation, type MessageSpace, useConversations, useMarkConversationRead, useReplyInternalMessage, useSendInternalMessage } from '@/lib/api/messages';
import type { MembersListResponse } from '@/lib/api/members';
import { formatFullName } from '@/lib/format-name';

type Recipient = { id: string; name: string; email: string };

function Compose({ space, initial, onClose }: { space: MessageSpace; initial?: Recipient; onClose: () => void }) {
  const token = useAuthStore(s => s.accessToken);
  const [recipient, setRecipient] = useState(initial);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Recipient[]>([]);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const send = useSendInternalMessage(space);

  useEffect(() => {
    if (q.trim().length < 2) { setResults([]); return; }
    const timer = window.setTimeout(async () => {
      try {
        const endpoint = space === 'admin' ? '/api/v1/admin/members' : '/api/v1/member/directory';
        const response = await apiClient<MembersListResponse>(`${endpoint}?search=${encodeURIComponent(q)}&limit=8`, { token: token ?? '' });
        setResults(response.data.data.map(m => ({ id: m._id, name: formatFullName(m.firstName, m.lastName), email: m.email })));
      } catch (error) { toast.error(error instanceof Error ? error.message : 'Recherche impossible'); }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [q, space, token]);

  async function submit() {
    if (!recipient || !subject.trim() || !content.trim()) return;
    try {
      await send.mutateAsync({ recipientIds: [recipient.id], subject: subject.trim(), content: content.trim() });
      toast.success('Message envoye'); onClose();
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Envoi impossible'); }
  }

  return <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/55 p-3 backdrop-blur-sm sm:items-center" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <section className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
      <header className="flex items-center justify-between border-b border-neutral-100 px-5 py-4"><h2 className="flex items-center gap-2 font-black"><Pencil size={15} className="text-emerald-600" /> Nouveau message</h2><button type="button" aria-label="Fermer" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-neutral-100"><X size={17} /></button></header>
      <div className="space-y-4 p-5">
        <div className="relative"><label className="mb-1 block text-xs font-bold">Destinataire</label>{recipient ? <div className="flex h-11 items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-sm font-bold text-emerald-800"><span>{recipient.name}</span><button type="button" aria-label="Retirer" onClick={() => setRecipient(undefined)}><X size={14} /></button></div> : <input value={q} onChange={e => setQ(e.target.value)} placeholder="Nom du membre" className="h-11 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-emerald-500" />}
          {!recipient && q.trim().length >= 2 && <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border bg-white shadow-xl">{results.map(r => <button type="button" key={r.id} onClick={() => { setRecipient(r); setQ(''); }} className="block w-full px-4 py-3 text-left hover:bg-emerald-50"><span className="block text-sm font-bold">{r.name}</span><span className="text-xs text-neutral-400">{r.email}</span></button>)}{results.length === 0 && <p className="p-3 text-xs text-neutral-400">Recherche en cours ou aucun resultat.</p>}</div>}
        </div>
        <div><label className="mb-1 block text-xs font-bold">Objet</label><input value={subject} maxLength={160} onChange={e => setSubject(e.target.value)} className="h-11 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-emerald-500" /></div>
        <div><label className="mb-1 block text-xs font-bold">Message</label><textarea value={content} maxLength={4000} rows={6} onChange={e => setContent(e.target.value)} className="w-full resize-none rounded-xl border border-neutral-200 p-3 text-sm outline-none focus:border-emerald-500" /></div>
      </div>
      <footer className="flex justify-end gap-2 border-t p-4"><button type="button" onClick={onClose} className="h-10 rounded-xl border px-4 text-sm font-bold">Annuler</button><button type="button" onClick={submit} disabled={!recipient || !subject.trim() || !content.trim() || send.isPending} className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white disabled:opacity-40">{send.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Envoyer</button></footer>
    </section>
  </div>;
}

export function MessagingPage({ space }: { space: MessageSpace }) {
  const me = useAuthStore(s => s.user?._id);
  const query = useConversations(space); const conversations = query.data?.data ?? [];
  const [selectedId, setSelectedId] = useState<string>(); const [compose, setCompose] = useState(false);
  const [initial, setInitial] = useState<Recipient>(); const [search, setSearch] = useState(''); const [reply, setReply] = useState('');
  const markRead = useMarkConversationRead(space); const replyMutation = useReplyInternalMessage(space);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search); const id = params.get('to'); const name = params.get('name');
    if (id && name) { setInitial({ id, name, email: params.get('email') ?? '' }); setCompose(true); window.history.replaceState({}, '', window.location.pathname); }
  }, []);
  const filtered = useMemo(() => conversations.filter(c => { const peer = c.participants.find(p => p._id !== me); return `${c.subject} ${peer?.firstName} ${peer?.lastName}`.toLowerCase().includes(search.toLowerCase()); }), [conversations, me, search]);
  const selected = conversations.find(c => c._id === selectedId);
  function open(c: Conversation) { setSelectedId(c._id); if (c.messages.some(m => m.sender?._id !== me && !m.read)) markRead.mutate(c._id); }
  async function sendReply() { if (!selected || !reply.trim()) return; try { await replyMutation.mutateAsync({ id: selected._id, content: reply.trim() }); setReply(''); toast.success('Reponse envoyee'); } catch (error) { toast.error(error instanceof Error ? error.message : 'Envoi impossible'); } }

  return <div className="mx-auto max-w-6xl"><header className="mb-5 flex items-center justify-between gap-3"><div><h1 className="text-2xl font-black">Messages</h1><p className="text-sm text-neutral-500">Messagerie interne securisee SALAM</p></div><button type="button" onClick={() => { setInitial(undefined); setCompose(true); }} className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white"><Pencil size={14} /><span className="hidden sm:inline">Nouveau message</span></button></header>
    <div className="grid min-h-[520px] overflow-hidden rounded-2xl border bg-white shadow-sm lg:grid-cols-[330px_1fr]">
      <aside className={`${selected ? 'hidden lg:flex' : 'flex'} flex-col border-r`}><div className="relative border-b p-3"><Search size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher" className="h-10 w-full rounded-xl bg-neutral-50 pl-9 pr-3 text-sm outline-none" /></div><div className="flex-1 overflow-y-auto">{query.isLoading && <p className="p-8 text-center text-sm text-neutral-400">Chargement...</p>}{!query.isLoading && !filtered.length && <div className="p-10 text-center"><MessageSquare size={32} className="mx-auto text-neutral-200" /><p className="mt-3 text-sm font-bold text-neutral-400">Aucun message</p></div>}{filtered.map(c => { const peer = c.participants.find(p => p._id !== me); const last = c.messages.at(-1); const unread = c.messages.some(m => m.sender?._id !== me && !m.read); return <button type="button" key={c._id} onClick={() => open(c)} className="w-full border-b p-4 text-left hover:bg-neutral-50"><div className="flex justify-between gap-2"><span className={`truncate text-sm ${unread ? 'font-black' : 'font-bold text-neutral-600'}`}>{peer ? formatFullName(peer.firstName, peer.lastName) : 'Membre SALAM'}</span>{unread && <span className="h-2 w-2 rounded-full bg-emerald-500" />}</div><p className="mt-1 truncate text-xs font-semibold text-neutral-500">{c.subject}</p><p className="mt-1 truncate text-xs text-neutral-400">{last?.content}</p></button>; })}</div></aside>
      <main className={`${selected ? 'flex' : 'hidden lg:flex'} min-w-0 flex-col`}>{selected ? <><header className="flex items-center gap-3 border-b p-4"><button type="button" onClick={() => setSelectedId(undefined)} className="grid h-9 w-9 place-items-center lg:hidden"><ArrowLeft size={17} /></button><div><h2 className="font-black">{selected.subject}</h2><p className="text-xs text-neutral-400">{selected.messages.length} message(s)</p></div></header><div className="flex-1 space-y-3 overflow-y-auto bg-neutral-50 p-4 sm:p-6">{selected.messages.map(m => { const mine = m.sender?._id === me; return <div key={m._id} className={`flex ${mine ? 'justify-end' : ''}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${mine ? 'rounded-br-sm bg-emerald-600 text-white' : 'rounded-bl-sm bg-white shadow-sm'}`}><p className="whitespace-pre-wrap break-words">{m.content}</p><p className={`mt-1 text-[10px] ${mine ? 'text-emerald-100' : 'text-neutral-400'}`}>{new Date(m.createdAt).toLocaleString('fr-FR')}</p></div></div>; })}</div><footer className="flex gap-2 border-t p-3"><textarea value={reply} maxLength={4000} onChange={e => setReply(e.target.value)} rows={2} placeholder="Ecrire une reponse..." className="min-w-0 flex-1 resize-none rounded-xl border p-3 text-sm outline-none focus:border-emerald-500" /><button type="button" onClick={sendReply} disabled={!reply.trim() || replyMutation.isPending} className="grid h-11 w-11 place-items-center self-end rounded-xl bg-emerald-600 text-white disabled:opacity-40"><Send size={15} /></button></footer></> : <div className="m-auto text-center"><MessageSquare size={40} className="mx-auto text-neutral-200" /><p className="mt-3 text-sm font-bold text-neutral-400">Selectionnez une conversation</p></div>}</main>
    </div>{compose && <Compose space={space} initial={initial} onClose={() => setCompose(false)} />}</div>;
}