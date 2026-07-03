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

/* ══════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════ */
type Role = 'user' | 'assistant';
type QuickReply = { label: string; value: string };
type ChatMessage = { role: Role; content: string; sentAt: string; quickReplies?: QuickReply[] };

/* ══════════════════════════════════════════
   QUICK REPLIES SALAM
   ══════════════════════════════════════════ */
const REQUEST_OPTIONS: QuickReply[] = [
  { label: '🤝 Devenir membre',         value: 'Je souhaite devenir membre de SALAM' },
  { label: '🎓 Orientation étudiant',   value: 'Je souhaite des informations pour étudier au Maroc' },
  { label: '🤲 Soutenir SALAM',         value: 'Je souhaite soutenir SALAM ou faire un don' },
  { label: '🤝 Partenariat',            value: 'Je souhaite proposer un partenariat avec SALAM' },
  { label: '🙋 Bénévolat',             value: 'Je souhaite participer comme bénévole à SALAM' },
  { label: '📅 Activités & événements', value: 'Quelles sont les activités et événements de SALAM ?' },
  { label: '💼 Opportunités pro',       value: 'SALAM propose-t-elle des opportunités professionnelles ?' },
  { label: '📧 Contacter SALAM',       value: 'Comment contacter l\'association SALAM ?' },
];

const ADHESION_OPTIONS: QuickReply[] = [
  { label: '📋 Faire ma demande',       value: 'Je souhaite commencer ma demande d\'adhésion à SALAM' },
  { label: '💰 Cotisation',             value: 'Quel est le montant de la cotisation SALAM ?' },
  { label: '📧 Contacter le bureau',   value: 'Je souhaite contacter directement le bureau exécutif de SALAM' },
];

const ENGAGEMENT_OPTIONS: QuickReply[] = [
  { label: '🤝 Devenir membre',         value: 'Je souhaite devenir membre de SALAM' },
  { label: '🤝 Proposer un partenariat', value: 'Je souhaite proposer un partenariat avec SALAM' },
  { label: '📧 Nous contacter',         value: 'Comment contacter l\'association SALAM ?' },
];

/* ══════════════════════════════════════════
   RÉPONSES LOCALES (fallback sans API)
   ══════════════════════════════════════════ */
function normalizeText(value: string) {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function getLocalReply(text: string): { reply: string; quickReplies: QuickReply[] } {
  const t = normalizeText(text);

  if (t.includes('bonjour') || t.includes('salut') || t.includes('hello') || t.includes('bonsoir') || t.includes('coucou')) {
    return {
      reply: `Bonjour ! Je suis **SALAMIEN**, l'assistant de SALAM Cameroun · Maroc.\n\nJe peux vous orienter sur l'adhésion, les études au Maroc, les activités, les dons, les partenariats, le bénévolat ou l'espace membre.`,
      quickReplies: REQUEST_OPTIONS,
    };
  }

  if (t.includes('adhesion') || t.includes('adherer') || t.includes('rejoindre') || (t.includes('devenir') && t.includes('membre'))) {
    return {
      reply: `🤝 **Devenir membre de SALAM**\n\nSALAM rassemble les anciens étudiants camerounais formés au Maroc et toutes les personnes souhaitant contribuer à ses missions.\n\nL'adhésion vous permet de :\n\n✅ Rejoindre le réseau des lauréats\n✅ Participer aux activités et événements\n✅ Accéder à l'espace membre\n✅ Bénéficier du soutien du réseau\n✅ Contribuer au développement du Cameroun\n\nVous pouvez commencer votre demande sur la page **Adhésion** du site ou contacter directement le bureau.`,
      quickReplies: ADHESION_OPTIONS,
    };
  }

  if (t.includes('cotisation') || t.includes('frais') || t.includes('montant') || t.includes('combien')) {
    return {
      reply: `💰 **Cotisation SALAM**\n\nLa cotisation est la contribution annuelle des membres pour soutenir les activités et le fonctionnement de l'association.\n\nPour connaître le montant exact et les modalités de paiement, contactez directement le bureau exécutif.\n\n📧 contact@salam-cameroun.com`,
      quickReplies: ADHESION_OPTIONS,
    };
  }

  if (t.includes('orientation') || t.includes('etudier') || t.includes('maroc') || t.includes('bachelier') || t.includes('universite')) {
    return {
      reply: `🎓 **Orientation étudiant — Cameroun · Maroc**\n\nSALAM accompagne les futurs étudiants camerounais qui souhaitent poursuivre leurs études au Maroc :\n\n✅ Informations pratiques et administratives\n✅ Intégration dans le réseau SALAM\n✅ Transmission d'expérience de lauréats\n✅ Orientation vers les bonnes structures\n✅ Soutien à l'installation au Maroc\n\nSouhaitez-vous être orienté, devenir membre ou soutenir cette mission ?`,
      quickReplies: [
        { label: '🎓 Être orienté',         value: 'Je souhaite être orienté pour étudier au Maroc' },
        { label: '🤝 Devenir membre',       value: 'Je souhaite devenir membre de SALAM' },
        { label: '🤲 Soutenir la mission', value: 'Je souhaite soutenir cette mission' },
      ],
    };
  }

  if (t.includes('don') || t.includes('soutenir') || t.includes('soutien') || t.includes('contribution') || t.includes('aider')) {
    return {
      reply: `🤲 **Soutenir SALAM**\n\nVotre soutien permet à SALAM de renforcer ses missions :\n\n✅ Orientation des futurs étudiants\n✅ Actions solidaires du réseau\n✅ Événements culturels et éducatifs\n✅ Insertion socioprofessionnelle des membres\n✅ Accompagnement Cameroun · Maroc\n\nVous pouvez laisser votre email ou téléphone afin que le bureau exécutif vous recontacte.\n\n📧 contact@salam-cameroun.com`,
      quickReplies: ENGAGEMENT_OPTIONS,
    };
  }

  if (t.includes('partenariat') || t.includes('partenaire') || t.includes('collabor') || t.includes('entreprise')) {
    return {
      reply: `🤝 **Partenariat avec SALAM**\n\nSALAM accueille les partenariats avec :\n\n✅ Entreprises et institutions\n✅ Associations et ONG\n✅ Écoles et universités\n✅ Acteurs économiques de la diaspora\n✅ Organisations internationales\n\nVous pouvez laisser vos coordonnées afin que le bureau exécutif vous recontacte.\n\n📧 contact@salam-cameroun.com`,
      quickReplies: ENGAGEMENT_OPTIONS,
    };
  }

  if (t.includes('benevol') || t.includes('volontaire') || t.includes('aider') || t.includes('s\'impliquer')) {
    return {
      reply: `🙋 **Bénévolat & Implication**\n\nSALAM encourage l'implication active de ses membres et bénévoles dans ses projets :\n\n✅ Organisation d'événements\n✅ Programmes de mentorat\n✅ Actions de solidarité\n✅ Communication et relations membres\n✅ Projets éducatifs\n\nContactez le bureau exécutif pour rejoindre les équipes bénévoles.`,
      quickReplies: [
        { label: '🤝 Devenir membre',   value: 'Je souhaite devenir membre de SALAM' },
        { label: '📧 Nous contacter', value: 'Comment contacter SALAM ?' },
      ],
    };
  }

  if (t.includes('activit') || t.includes('evenement') || t.includes('programme') || t.includes('agenda')) {
    return {
      reply: `📅 **Activités & Événements SALAM**\n\nSALAM organise régulièrement :\n\n✅ Conférences et séminaires\n✅ Rencontres networking entre membres\n✅ Événements culturels et solidaires\n✅ Programmes de mentorat\n✅ Activités de développement professionnel\n✅ Cérémonies et moments conviviaux\n\nConsultez la section **Activités** du site pour découvrir les événements à venir.`,
      quickReplies: REQUEST_OPTIONS.slice(0, 4),
    };
  }

  if (t.includes('opportunit') || t.includes('emploi') || t.includes('professionnel') || t.includes('travail') || t.includes('carrieres') || t.includes('stage')) {
    return {
      reply: `💼 **Opportunités professionnelles**\n\nSALAM met en relation ses membres avec des opportunités professionnelles :\n\n✅ Offres d'emploi dans le réseau\n✅ Stages et missions\n✅ Mise en relation entre membres\n✅ Partage d'expériences métier\n✅ Accompagnement à l'insertion\n\nAccédez aux opportunités depuis la section dédiée du site ou via l'espace membre.`,
      quickReplies: ADHESION_OPTIONS,
    };
  }

  if (t.includes('bureau') || t.includes('president') || t.includes('direction') || t.includes('equipe') || t.includes('dirigeant')) {
    return {
      reply: `🏛️ **Bureau exécutif de SALAM**\n\nSALAM est dirigée par un bureau exécutif élu par les membres de l'association.\n\nLe bureau comprend un président, un bureau de coordination et des responsables de commission.\n\nConsultez la page **Bureau Exécutif** du site pour découvrir les membres actuels de la direction.`,
      quickReplies: [
        { label: '📧 Contacter le bureau', value: 'Comment contacter le bureau exécutif de SALAM ?' },
        { label: '🤝 Devenir membre',      value: 'Je souhaite devenir membre de SALAM' },
      ],
    };
  }

  if (t.includes('mission') || t.includes('valeur') || t.includes('objectif') || t.includes('but') || t.includes('salam')) {
    return {
      reply: `🎯 **Missions de SALAM**\n\n**SALAM** — Solidaire Associative des Lauréats du Maroc — fondée le 20 février 2010 à Yaoundé.\n\n✅ **Solidarité** — accompagnement mutuel des membres\n✅ **Éducation** — soutien à la réussite académique\n✅ **Insertion professionnelle** — connexion avec le marché du travail\n✅ **Leadership** — développement des compétences\n✅ **Développement du Cameroun** — contribution nationale\n\nSALAM mobilise la diaspora camerounaise autour de valeurs communes de solidarité et d'excellence.`,
      quickReplies: ENGAGEMENT_OPTIONS,
    };
  }

  if (t.includes('contact') || t.includes('joindre') || t.includes('bureau') || t.includes('email') || t.includes('telephone')) {
    return {
      reply: `📧 **Contacter SALAM**\n\n📧 **Email** : contact@salam-cameroun.com\n🌐 **Site** : salam-cameroun.com\n📍 **Siège** : Yaoundé, Cameroun\n\nNotre bureau exécutif vous répondra dans les meilleurs délais.\n\nVous pouvez également utiliser le formulaire de contact sur notre site !`,
      quickReplies: REQUEST_OPTIONS.slice(0, 4),
    };
  }

  if (t.includes('espace') || t.includes('connexion') || t.includes('connecter') || t.includes('se connecter')) {
    return {
      reply: `🔐 **Espace membre SALAM**\n\nL'espace membre vous permet de :\n\n✅ Accéder à vos informations et cotisations\n✅ Consulter les activités et événements\n✅ Échanger avec les autres membres\n✅ Découvrir les opportunités professionnelles\n✅ Suivre les actualités de l'association\n\nConnectez-vous via le bouton **Espace Membre** en haut du site.`,
      quickReplies: ADHESION_OPTIONS,
    };
  }

  if (t.includes('histoire') || t.includes('fondation') || t.includes('creation') || t.includes('quand') || t.includes('depuis')) {
    return {
      reply: `🏛️ **Histoire de SALAM**\n\n**SALAM** — Solidaire Associative des Lauréats du Maroc — a été fondée le **20 février 2010** à **Yaoundé, Cameroun**.\n\nDepuis sa création, SALAM rassemble les anciens étudiants camerounais formés au Maroc et mobilise la diaspora camerounaise autour de la solidarité, de l'éducation et du développement du Cameroun.\n\nPlus de **15 ans d'engagement** pour la communauté !`,
      quickReplies: ENGAGEMENT_OPTIONS,
    };
  }

  if (t.includes('merci') || t.includes('parfait') || t.includes('super') || t.includes('genial') || t.includes('nickel')) {
    return {
      reply: `Avec plaisir ! Je reste disponible pour vous orienter sur SALAM Cameroun · Maroc. 🌍\n\n📧 contact@salam-cameroun.com`,
      quickReplies: REQUEST_OPTIONS.slice(0, 4),
    };
  }

  return {
    reply: `Je suis spécialisé dans l'accompagnement et les activités liées à SALAM Cameroun · Maroc. Je peux vous aider concernant l'adhésion, l'orientation étudiant, les activités, les partenariats, les dons, le bénévolat ou l'espace membre.\n\nQue souhaitez-vous savoir ?`,
    quickReplies: REQUEST_OPTIONS,
  };
}

/* ══════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════ */
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
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={index} className="font-black text-white">{part.slice(2, -2)}</strong>
          : <span key={index}>{part}</span>,
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   MESSAGE D'ACCUEIL
   ══════════════════════════════════════════ */
const WELCOME: ChatMessage = {
  role: 'assistant',
  content: `Bonjour ! Je suis **SALAMIEN**, l'assistant officiel de SALAM Cameroun · Maroc.\n\nJe peux vous aider pour devenir membre, vous orienter pour étudier au Maroc, soutenir les actions de l'association, proposer un partenariat, découvrir les activités ou contacter le bureau.\n\nComment puis-je vous aider ?`,
  quickReplies: REQUEST_OPTIONS,
  sentAt: new Date().toISOString(),
};

/* ══════════════════════════════════════════
   COMPOSANT
   ══════════════════════════════════════════ */
export default function SalamChatbot() {
  const pathname = usePathname();

  const inputRef         = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef   = useRef<HTMLDivElement>(null);
  const lastAssistRef    = useRef<HTMLDivElement>(null);
  /* Flag : vrai pendant un scroll programmatique — ignore les events onScroll */
  const autoScrollingRef = useRef(false);
  const lastScrollTopRef = useRef(0);
  const scrollTimer      = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [open,       setOpen]      = useState(false);
  const [messages,   setMessages]  = useState<ChatMessage[]>([WELCOME]);
  const [input,      setInput]     = useState('');
  const [loading,    setLoading]   = useState(false);
  const [unread,     setUnread]    = useState(1);
  const [scrollDate, setScrollDate] = useState('');

  /* Masquer sur admin / membre / auth / demo */
  const hidden = useMemo(() => {
    const blocked = ['/admin', '/member', '/auth', '/demo', '/bureau-executif/connexion', '/choisir-espace'];
    return blocked.some(prefix => pathname.startsWith(prefix));
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    setUnread(0);
    setTimeout(() => inputRef.current?.focus(), 180);
  }, [open]);

  useEffect(() => {
    const last = messages.at(-1);
    /* Marquer le scroll comme programmatique AVANT de scroller */
    autoScrollingRef.current = true;
    if (last?.role === 'assistant') {
      lastAssistRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    /* Lever le flag après la durée max d'un smooth scroll (~650 ms) */
    const t = setTimeout(() => { autoScrollingRef.current = false; }, 700);
    if (!open && last?.role === 'assistant') {
      setUnread(n => Math.min(n + 1, 9));
    }
    return () => clearTimeout(t);
  }, [messages, open]);

  /* Scroll manuel uniquement : up → affiche la date, down → masque */
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (autoScrollingRef.current) return;          // ignorer les scrolls auto

    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const isNearBottom =
      container.scrollHeight - scrollTop - container.clientHeight < 60;
    const isScrollingUp = scrollTop < lastScrollTopRef.current;
    lastScrollTopRef.current = scrollTop;

    if (scrollTimer.current) clearTimeout(scrollTimer.current);

    /* Scroll vers le bas ou proche du bas → masquer la barre */
    if (!isScrollingUp || isNearBottom) {
      setScrollDate('');
      return;
    }

    /* Scroll vers le haut → trouver la date du premier message visible */
    const bubbles = container.querySelectorAll<HTMLElement>('[data-sent-at]');
    let current = '';
    bubbles.forEach(el => {
      if (el.offsetTop <= scrollTop + 80) current = el.getAttribute('data-sent-at') ?? '';
    });
    setScrollDate(formatDay(current || messages[0]?.sentAt || new Date().toISOString()));

    /* Masquer après 2 s sans scroll */
    scrollTimer.current = setTimeout(() => setScrollDate(''), 2000);
  }, [messages]);

  if (hidden) return null;

  /* ── Envoi ──────────────────────────────── */
  const sendMessage = async (value?: string) => {
    const text = (value ?? input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: text, sentAt: new Date().toISOString() };
    const nextMessages = [...messages.map(m => ({ ...m, quickReplies: undefined })), userMsg].slice(-20);
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/+$/, '');
      const res = await fetch(`${apiBase}/api/v1/chat`, {
        method:  'POST',
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

      const data  = payload?.data ?? payload;
      const local = getLocalReply(text);
      const lower = normalizeText(text);

      if (lower.includes('whatsapp') && data?.actions?.whatsapp) {
        window.open(data.actions.whatsapp, '_blank', 'noopener,noreferrer');
      }

      /* Quick replies contextuelles selon les actions backend */
      let contextReplies: QuickReply[] = local.quickReplies;
      if (data?.actions?.adhesion) contextReplies = ADHESION_OPTIONS;
      else if (data?.actions?.donation || data?.actions?.partnership) contextReplies = ENGAGEMENT_OPTIONS;

      setMessages(cur => [...cur, {
        role:         'assistant' as Role,
        content:      data?.reply || local.reply,
        sentAt:       data?.sentAt || new Date().toISOString(),
        quickReplies: contextReplies,
      }].slice(-20));
    } catch {
      const local = getLocalReply(text);
      setMessages(cur => [...cur, {
        role:         'assistant' as Role,
        content:      local.reply,
        quickReplies: local.quickReplies,
        sentAt:       new Date().toISOString(),
      }].slice(-20));
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void sendMessage(); }
  };

  /* ── Rendu ──────────────────────────────── */
  return (
    <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-3 z-[80] sm:bottom-5 sm:right-5">

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{   opacity: 0, y: 18,  scale: 0.97 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="mb-3 flex h-[min(80vh,580px)] w-[calc(100vw-1.5rem)] max-w-[400px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#07130d]/98 shadow-[0_24px_80px_rgba(0,0,0,0.38)] ring-1 ring-emerald-400/10 backdrop-blur-xl sm:h-[580px]"
          >
            {/* Header */}
            <div className="flex items-center gap-3 bg-gradient-to-br from-[#064e2b] to-[#0f6b3a] px-4 py-3 text-white">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/15">
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
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Fermer le chatbot"
              >
                <X size={17} />
              </button>
            </div>

            {/* Messages */}
            <div
              className="relative flex-1 space-y-3 overflow-y-auto px-3 py-4"
              onScroll={handleScroll}
            >
              {/* Barre de date flottante — apparaît au scroll UP, disparaît au scroll DOWN */}
              <AnimatePresence>
                {scrollDate && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1,  y: 0   }}
                    exit={{   opacity: 0,  y: -10  }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="pointer-events-none sticky top-0 z-10 mx-auto mb-1 w-fit rounded-full border border-white/15 bg-black/50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/75 backdrop-blur-md"
                  >
                    {scrollDate}
                  </motion.div>
                )}
              </AnimatePresence>

              {messages.map((msg, idx) => {
                const isLastAssistant = msg.role === 'assistant' && idx === messages.length - 1;
                return (
                  <div
                    key={`${msg.sentAt}-${idx}`}
                    data-sent-at={msg.sentAt}
                    ref={isLastAssistant ? lastAssistRef : undefined}
                  >
                    {/* Bulle */}
                    <div className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'assistant' && (
                        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#f5b400]/25 bg-[#f5b400]/10 text-[#f5b400]">
                          <BadgeCheck size={15} />
                        </div>
                      )}
                      <div className={`max-w-[82%] rounded-2xl px-3.5 py-3 shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-[#0f6b3a] to-[#064e2b] text-white'
                          : 'border border-white/8 bg-white/8 text-neutral-100'
                      }`}>
                        {msg.role === 'assistant' && (
                          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#f5b400]">
                            <ShieldCheck size={11} /> SALAMIEN
                          </div>
                        )}
                        <MessageText text={msg.content} />
                        <div className={`mt-2 text-right text-[10px] ${msg.role === 'user' ? 'text-white/55' : 'text-white/35'}`}>
                          {formatTime(msg.sentAt)}
                        </div>
                      </div>
                      {msg.role === 'user' && (
                        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-400/25 bg-emerald-400/10 text-emerald-200">
                          <UserRound size={15} />
                        </div>
                      )}
                    </div>

                    {/* Quick replies — hors bulle, uniquement sur le dernier message assistant */}
                    {msg.quickReplies && msg.role === 'assistant' && isLastAssistant && !loading && (
                      <div className="ml-10 mt-2 flex flex-wrap gap-1.5">
                        {msg.quickReplies.map(qr => (
                          <button
                            key={qr.value}
                            type="button"
                            onClick={() => void sendMessage(qr.value)}
                            className="rounded-full border border-[#f5b400]/35 bg-[#0f6b3a]/20 px-2.5 py-1 text-[11px] font-bold text-[#f5b400] transition hover:bg-[#f5b400]/15 hover:border-[#f5b400]/60"
                          >
                            {qr.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Indicateur de frappe */}
              {loading && (
                <div className="flex justify-start gap-2">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#f5b400]/25 bg-[#f5b400]/10 text-[#f5b400]">
                    <BadgeCheck size={15} />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/8 px-3.5 py-3 text-xs font-semibold text-neutral-200">
                    <Loader2 size={14} className="animate-spin text-[#f5b400]" />
                    SALAMIEN rédige une réponse…
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Footer — liens rapides + zone de saisie */}
            <div className="border-t border-white/8 bg-black/15 p-3">
              <div className="mb-2 flex gap-2">
                <Link
                  href="/adhesion"
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/10 px-3 py-2 text-[11px] font-black text-white/80 transition hover:border-[#f5b400]/45 hover:text-[#f5b400]"
                >
                  <HeartHandshake size={13} /> Adhésion
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/10 px-3 py-2 text-[11px] font-black text-white/80 transition hover:border-[#f5b400]/45 hover:text-[#f5b400]"
                >
                  <ShieldCheck size={13} /> Contact
                </Link>
              </div>

              <form
                className="flex items-end gap-2"
                onSubmit={e => { e.preventDefault(); void sendMessage(); }}
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value.slice(0, 500))}
                  onKeyDown={handleKeyDown}
                  placeholder="Votre message…"
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

      {/* Bouton toggle */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f6b3a] via-[#0f6b3a] to-[#f5b400] text-white shadow-[0_18px_45px_rgba(6,78,43,0.38)] ring-1 ring-white/25 transition hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(6,78,43,0.5)] sm:h-16 sm:w-16 sm:rounded-[26px]"
        aria-label="Ouvrir le chatbot SALAM"
      >
        {open
          ? <X size={23} />
          : <MessageCircle size={24} className="transition group-hover:scale-105 sm:size-7" />
        }
        {!open && unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-[#f5b400] px-1 text-[10px] font-black text-[#07130d]">
            {unread}
          </span>
        )}
      </button>
    </div>
  );
}
