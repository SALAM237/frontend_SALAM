'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BadgeCheck,
  HeartHandshake,
  Headset,
  Loader2,
  MessageCircle,
  SendHorizontal,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react';

type Role = 'user' | 'assistant';
type QuickReply = { label: string; value: string };
type ChatMessage = { role: Role; content: string; sentAt: string; quickReplies?: QuickReply[] };

const REQUEST_OPTIONS: QuickReply[] = [
  { label: 'Devenir membre', value: 'Je souhaite devenir membre de SALAM' },
  { label: 'Orientation étudiant', value: 'Je souhaite des informations pour étudier au Maroc' },
  { label: 'Faire un don / soutenir', value: 'Je souhaite soutenir SALAM ou faire un don' },
  { label: 'Partenariat', value: 'Je souhaite proposer un partenariat avec SALAM' },
  { label: 'Bénévolat', value: 'Je souhaite participer comme bénévole' },
  { label: 'Activités', value: 'Quelles sont les activités de SALAM ?' },
  { label: 'Contact', value: 'Comment contacter SALAM ?' },
  { label: 'Espace membre', value: 'Je souhaite accéder à mon espace membre' },
];

const WELCOME: ChatMessage = {
  role: 'assistant',
  content: `Bonjour. Je suis **SALAMIEN**, l'assistant de SALAM Cameroun · Maroc.

Je peux vous aider pour devenir membre, obtenir une orientation pour étudier au Maroc, soutenir les actions de SALAM, proposer un partenariat, participer comme bénévole, découvrir les activités ou contacter l'association.

Comment puis-je vous aider ?`,
  quickReplies: REQUEST_OPTIONS,
  sentAt: new Date().toISOString(),
};

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function getLocalReply(text: string): { reply: string; quickReplies: QuickReply[] } {
  const t = normalizeText(text);

  if (t.includes('bonjour') || t.includes('salut') || t.includes('hello') || t.includes('bonsoir')) {
    return {
      reply: `Bonjour. Je suis **SALAMIEN**, l'assistant de SALAM Cameroun · Maroc.

Je peux vous orienter sur l'adhésion, les études au Maroc, les activités, les dons, les partenariats, le bénévolat ou l'espace membre.`,
      quickReplies: REQUEST_OPTIONS,
    };
  }

  if (t.includes('adhesion') || t.includes('adherer') || t.includes('membre')) {
    return {
      reply: `**Devenir membre de SALAM**

SALAM rassemble les anciens étudiants camerounais formés au Maroc et toutes les personnes souhaitant contribuer à ses missions.

L'adhésion permet de rejoindre le réseau SALAM, participer aux activités, accéder à l'espace membre et soutenir les actions d'orientation, de solidarité et d'insertion.

Vous pouvez vous rendre sur la page **Adhésion** du site pour commencer votre demande.`,
      quickReplies: [
        { label: 'Soutenir SALAM', value: 'Je souhaite soutenir SALAM' },
        { label: 'Proposer un partenariat', value: 'Je souhaite proposer un partenariat' },
        { label: 'Contacter SALAM', value: 'Comment contacter SALAM ?' },
      ],
    };
  }

  if (t.includes('orientation') || t.includes('etudier') || t.includes('maroc') || t.includes('bachelier')) {
    return {
      reply: `**Orientation étudiant**

SALAM accompagne les futurs étudiants camerounais qui souhaitent poursuivre leurs études au Maroc : préparation, intégration, transmission d'expérience et orientation vers les bonnes structures étudiantes.

Souhaitez-vous être orienté, devenir membre ou soutenir cette mission ?`,
      quickReplies: [
        { label: 'Être orienté', value: 'Je souhaite être orienté pour étudier au Maroc' },
        { label: 'Soutenir cette mission', value: 'Je souhaite soutenir cette mission' },
        { label: 'Partenariat', value: 'Je souhaite proposer un partenariat' },
      ],
    };
  }

  if (t.includes('don') || t.includes('soutien') || t.includes('soutenir')) {
    return {
      reply: `**Soutenir SALAM**

Votre soutien peut aider SALAM à renforcer ses missions : orientation des futurs étudiants, actions solidaires, événements culturels et éducatifs, insertion socioprofessionnelle et accompagnement du réseau Cameroun-Maroc.

Souhaitez-vous laisser votre email ou téléphone pour être contacté ?`,
      quickReplies: [
        { label: 'Être contacté', value: 'Je souhaite être contacté pour soutenir SALAM' },
        { label: 'Partenariat', value: 'Je souhaite proposer un partenariat avec SALAM' },
      ],
    };
  }

  if (t.includes('partenariat') || t.includes('partenaire')) {
    return {
      reply: `**Partenariat avec SALAM**

SALAM accueille les partenariats avec les entreprises, institutions, associations, écoles, acteurs économiques et organisations de la diaspora.

Vous pouvez laisser vos coordonnées afin que le bureau exécutif vous recontacte.`,
      quickReplies: [
        { label: 'Être recontacté', value: 'Je souhaite être recontacté pour un partenariat' },
        { label: 'Soutenir SALAM', value: 'Je souhaite soutenir SALAM' },
      ],
    };
  }

  if (t.includes('contact') || t.includes('whatsapp') || t.includes('telephone') || t.includes('mail')) {
    return {
      reply: `**Contacter SALAM**

Vous pouvez contacter SALAM via la page contact du site ou laisser ici votre email ou téléphone afin que votre demande soit transmise au bureau.

Email : contact@salam-cameroun.com`,
      quickReplies: REQUEST_OPTIONS,
    };
  }

  if (t.includes('merci') || t.includes('parfait') || t.includes('super')) {
    return {
      reply: `Avec plaisir. Je reste disponible pour vous orienter sur SALAM Cameroun · Maroc.`,
      quickReplies: REQUEST_OPTIONS,
    };
  }

  return {
    reply: `Je suis spécialisé uniquement dans l'accompagnement et les activités liées à SALAM Cameroun · Maroc. Je peux vous aider concernant l'adhésion, l'orientation étudiant, les activités, les partenariats, les dons, le bénévolat ou les services de l'association.`,
    quickReplies: REQUEST_OPTIONS,
  };
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function formatDay(date: string) {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (d.toDateString() === yesterday.toDateString()) return 'Hier';
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' });
}

function MessageText({ text }: { text: string }) {
  return (
    <div className="whitespace-pre-line text-[13px] leading-relaxed">
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => (
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={index} className="font-black text-white">{part.slice(2, -2)}</strong>
          : <span key={index}>{part}</span>
      ))}
    </div>
  );
}

export default function SalamChatbot() {
  const pathname = usePathname();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastAssistantRef = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(1);
  const [scrollDate, setScrollDate] = useState('');

  const hidden = useMemo(() => {
    const prefixes = ['/admin', '/member', '/auth', '/demo', '/bureau-executif/connexion', '/choisir-espace'];
    return prefixes.some(prefix => pathname.startsWith(prefix));
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    setUnread(0);
    setTimeout(() => inputRef.current?.focus(), 180);
  }, [open]);

  useEffect(() => {
    const last = messages.at(-1);
    if (last?.role === 'assistant') {
      lastAssistantRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    if (!open && last?.role === 'assistant') {
      setUnread(count => Math.min(count + 1, 9));
    }
  }, [messages, open]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    const bubbles = container.querySelectorAll<HTMLElement>('[data-sent-at]');
    let current = '';
    bubbles.forEach(el => {
      if (el.offsetTop <= container.scrollTop + 90) current = el.getAttribute('data-sent-at') ?? '';
    });
    if (!current) return;
    setScrollDate(formatDay(current));
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => setScrollDate(''), 1200);
  }, []);

  if (hidden) return null;

  const sendMessage = async (value?: string) => {
    const text = (value ?? input).trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: text, sentAt: new Date().toISOString() };
    const nextMessages = [...messages.map(m => ({ ...m, quickReplies: undefined })), userMessage].slice(-20);
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/+$/, '');
      const res = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          messages: nextMessages
            .filter(m => m !== WELCOME)
            .map(m => ({ role: m.role, content: m.content }))
            .slice(-20),
        }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.message ?? 'chat_failed');
      const data = payload?.data ?? payload;
      const local = getLocalReply(text);
      const lower = normalizeText(text);

      if (lower.includes('whatsapp') && data?.actions?.whatsapp) {
        window.open(data.actions.whatsapp, '_blank', 'noopener,noreferrer');
      }

      setMessages(current => [...current, {
        role: 'assistant' as const,
        content: data?.reply || local.reply,
        sentAt: data?.sentAt || new Date().toISOString(),
        quickReplies: local.quickReplies,
      }].slice(-20));
    } catch {
      const local = getLocalReply(text);
      setMessages(current => [...current, {
        role: 'assistant' as const,
        content: local.reply,
        quickReplies: local.quickReplies,
        sentAt: new Date().toISOString(),
      }].slice(-20));
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-3 z-[80] sm:bottom-5 sm:right-5">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="mb-3 flex h-[min(78vh,560px)] w-[calc(100vw-1.5rem)] max-w-[390px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#07130d]/98 shadow-[0_24px_80px_rgba(0,0,0,0.35)] ring-1 ring-emerald-400/10 backdrop-blur-xl sm:h-[560px]"
          >
            <div className="flex items-center gap-3 bg-gradient-to-br from-[#064e2b] to-[#0f6b3a] px-4 py-3 text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/15">
                <Headset size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black">SALAMIEN</p>
                <p className="flex items-center gap-1.5 truncate text-[11px] text-white/65">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#f5b400]" />
                  Assistant officiel SALAM
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Fermer le chatbot"
              >
                <X size={17} />
              </button>
            </div>

            <div className="relative flex-1 space-y-3 overflow-y-auto px-3 py-4" onScroll={handleScroll}>
              <AnimatePresence>
                {scrollDate && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="sticky top-0 z-10 mx-auto w-fit rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/70 backdrop-blur"
                  >
                    {scrollDate}
                  </motion.div>
                )}
              </AnimatePresence>

              {messages.map((message, index) => (
                <div
                  key={`${message.sentAt}-${index}`}
                  data-sent-at={message.sentAt}
                  ref={message.role === 'assistant' && index === messages.length - 1 ? lastAssistantRef : undefined}
                  className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#f5b400]/25 bg-[#f5b400]/10 text-[#f5b400]">
                      <BadgeCheck size={15} />
                    </div>
                  )}
                  <div className={`max-w-[82%] rounded-2xl px-3.5 py-3 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-[#0f6b3a] to-[#064e2b] text-white'
                      : 'border border-white/8 bg-white/8 text-neutral-100'
                  }`}>
                    {message.role === 'assistant' && (
                      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#f5b400]">
                        <ShieldCheck size={11} /> SALAMIEN
                      </div>
                    )}
                    <MessageText text={message.content} />
                    <div className={`mt-2 text-right text-[10px] ${message.role === 'user' ? 'text-white/55' : 'text-white/35'}`}>
                      {formatTime(message.sentAt)}
                    </div>
                    {message.quickReplies && message.role === 'assistant' && index === messages.length - 1 && !loading && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {message.quickReplies.map(reply => (
                          <button
                            key={reply.value}
                            type="button"
                            onClick={() => sendMessage(reply.value)}
                            className="rounded-full border border-[#f5b400]/35 bg-[#0f6b3a]/20 px-2.5 py-1 text-[11px] font-bold text-[#f5b400] transition hover:bg-[#f5b400]/10"
                          >
                            {reply.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-400/25 bg-emerald-400/10 text-emerald-200">
                      <UserRound size={15} />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex justify-start gap-2">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#f5b400]/25 bg-[#f5b400]/10 text-[#f5b400]">
                    <BadgeCheck size={15} />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/8 px-3.5 py-3 text-xs font-semibold text-neutral-200">
                    <Loader2 size={14} className="animate-spin text-[#f5b400]" />
                    SALAMIEN rédige une réponse...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-white/8 bg-black/15 p-3">
              <div className="mb-2 flex gap-2">
                <Link href="/adhesion" className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/10 px-3 py-2 text-[11px] font-black text-white/80 transition hover:border-[#f5b400]/40 hover:text-[#f5b400]">
                  <HeartHandshake size={13} /> Adhésion
                </Link>
                <Link href="/contact" className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/10 px-3 py-2 text-[11px] font-black text-white/80 transition hover:border-[#f5b400]/40 hover:text-[#f5b400]">
                  <ShieldCheck size={13} /> Contact
                </Link>
              </div>
              <form
                className="flex items-end gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  sendMessage();
                }}
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={event => setInput(event.target.value.slice(0, 500))}
                  onKeyDown={handleKeyDown}
                  placeholder="Votre message..."
                  rows={1}
                  maxLength={500}
                  className="max-h-24 min-h-11 min-w-0 flex-1 resize-none rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#f5b400]/45"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0f6b3a] to-[#f5b400] text-white shadow-lg shadow-emerald-950/30 transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Envoyer"
                >
                  <SendHorizontal size={17} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f6b3a] via-[#0f6b3a] to-[#f5b400] text-white shadow-[0_18px_45px_rgba(6,78,43,0.35)] ring-1 ring-white/30 transition hover:-translate-y-0.5 sm:h-16 sm:w-16 sm:rounded-[26px]"
        aria-label="Ouvrir le chatbot SALAM"
      >
        {open ? <X size={23} /> : <MessageCircle size={24} className="transition group-hover:scale-105 sm:size-7" />}
        {!open && unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-[#f5b400] px-1 text-[10px] font-black text-[#07130d]">
            {unread}
          </span>
        )}
      </button>
    </div>
  );
}
