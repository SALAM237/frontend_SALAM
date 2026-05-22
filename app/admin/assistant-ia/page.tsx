'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Bot,
  CheckCircle,
  ChevronRight,
  Copy,
  Download,
  Loader2,
  RefreshCw,
  RotateCcw,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  WalletCards,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAdminAiAssistant, type AdminAiAction } from '@/lib/api/admin-ai';
import { useSendReminders } from '@/lib/api/cotisations';

type Role = 'user' | 'assistant';

interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  actions?: AdminAiAction[];
  thinking?: boolean;
}

const suggestions = [
  {
    category: 'Frais',
    color: 'bg-amber-50 text-amber-700 border-amber-100',
    icon: Users,
    label: 'Membres en retard',
    prompt: "Va chercher les membres en retard de frais d'adhésion et propose une relance",
  },
  {
    category: 'Trésorerie',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    icon: TrendingUp,
    label: 'Analyser la trésorerie',
    prompt: 'Analyse la trésorerie de cette année et donne les recommandations utiles',
  },
  {
    category: 'IDP/ISP',
    color: 'bg-rose-50 text-rose-700 border-rose-100',
    icon: Target,
    label: 'Leads prioritaires',
    prompt: 'Quels leads donateurs ou sponsors sont prioritaires ??',
  },
  {
    category: 'Contrôle',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: AlertTriangle,
    label: 'Points de vigilance',
    prompt: 'Quels sont les points de vigilance admin à traiter cette semaine ??',
  },
];

const insights = [
  {
    icon: AlertTriangle,
    tone: 'text-amber-700 bg-amber-50',
    text: "Relances d'adhésion ciblées",
    cta: 'Analyser',
    prompt: "Liste les membres en retard de frais d'adhésion",
  },
  {
    icon: WalletCards,
    tone: 'text-emerald-700 bg-emerald-50',
    text: 'Synthèse trésorerie et patrimoine',
    cta: 'Voir',
    prompt: 'Analyse la trésorerie et le patrimoine',
  },
  {
    icon: Target,
    tone: 'text-rose-700 bg-rose-50',
    text: 'Donateurs et sponsors chauds',
    cta: 'Prioriser',
    prompt: 'Analyse les leads IDP ISP',
  },
];

function renderInline(text: string) {
  return text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
}

function renderContent(text: string) {
  return text.split('\n').map((line, index) => {
    if (!line.trim()) return <br key={index} />;
    if (line.startsWith('- ')) {
      return <li key={index} className="ml-4 list-disc">{renderInline(line.slice(2))}</li>;
    }
    if (/^\d+\.\s/.test(line)) {
      return <p key={index} className="pl-1 text-[13px]">{renderInline(line)}</p>;
    }
    return <p key={index}>{renderInline(line)}</p>;
  });
}

export default function AdminAIAssistantPage() {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const shouldScrollRef = useRef(false);
  const ai = useAdminAiAssistant();
  const sendReminders = useSendReminders();
  const currentYear = new Date().getFullYear();

  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [pendingAction, setPendingAction] = useState<AdminAiAction | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      timestamp: new Date(),
      content: `Bonjour, je suis l'assistant IA admin de **SALAM**.\n\nJe peux analyser les données de l'espace admin et proposer des actions utiles :\n- membres en retard de frais d'adhésion ;\n- synthèse de trésorerie ;\n- leads donateurs et sponsors prioritaires ;\n- recommandations de suivi.\n\nLes actions sensibles, comme l'envoi de relances, nécessitent toujours une confirmation.`,
    },
  ]);

  useEffect(() => {
    if (!shouldScrollRef.current) return;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    shouldScrollRef.current = false;
  }, [messages]);

  const messagePayload = useMemo(
    () => messages
      .filter(m => !m.thinking)
      .map(m => ({ role: m.role, content: m.content }))
      .slice(-10),
    [messages],
  );

  const executeAction = (action: AdminAiAction) => {
    if (action.kind === 'navigation') {
      const href = typeof action.payload?.href === 'string' ? action.payload.href : '/admin/idp-isp';
      router.push(href);
      return;
    }

    if (action.kind === 'cotisation_reminder') {
      const year = typeof action.payload?.year === 'number' ? action.payload.year : currentYear;
      const userIds = Array.isArray(action.payload?.userIds)
        ? action.payload.userIds.filter((id): id is string => typeof id === 'string')
        : undefined;

      sendReminders.mutate({ year, userIds }, {
        onSuccess: res => {
          const sent = (res.data as any)?.sent ?? 0;
          setMessages(prev => [...prev, {
            id: `action-${Date.now()}`,
            role: 'assistant',
            timestamp: new Date(),
            content: `C'est fait : **${sent} relance(s)** ont été envoyées aux membres concernés. L'action est aussi tracée dans l'historique admin.`,
          }]);
          setPendingAction(null);
        },
      });
      return;
    }

    toast.info('Action non encore automatisée');
  };

  const sendMessage = async (prompt?: string, autoScroll = true) => {
    const text = (prompt ?? input).trim();
    if (!text || ai.isPending) return;

    if (/^(oui|ok|d'accord|vas-y|valide|confirme)$/i.test(text) && pendingAction) {
      setInput('');
      setMessages(prev => [...prev, {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: new Date(),
      }]);
      executeAction(pendingAction);
      return;
    }

    setInput('');
    setShowSuggestions(false);
    shouldScrollRef.current = autoScroll;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    const thinkingId = `thinking-${Date.now() + 1}`;

    setMessages(prev => [...prev, userMsg, {
      id: thinkingId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      thinking: true,
    }]);

    try {
      const res = await ai.mutateAsync({
        messages: [...messagePayload, { role: 'user', content: text }],
        year: currentYear,
      });
      const actions = res.data.actions ?? [];
      setPendingAction(actions.find(a => a.kind === 'cotisation_reminder') ?? null);
      setMessages(prev => prev.map(m => m.id === thinkingId
        ? {
            ...m,
            content: res.data.reply,
            actions,
            thinking: false,
            timestamp: new Date(),
          }
        : m));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur assistant IA';
      setMessages(prev => prev.map(m => m.id === thinkingId
        ? {
            ...m,
            content: `Je n'ai pas pu analyser les données pour le moment.\n\n${message}`,
            thinking: false,
            timestamp: new Date(),
          }
        : m));
    }
  };

  const clearConversation = () => {
    setPendingAction(null);
    setShowSuggestions(true);
    setMessages([{
      id: 'welcome-reset',
      role: 'assistant',
      timestamp: new Date(),
      content: 'Conversation réinitialisée. Quelle analyse voulez-vous lancer ??',
    }]);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] min-h-[680px] overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
      <aside className="hidden w-72 shrink-0 flex-col gap-5 border-r border-neutral-100 bg-[#f8faf8] p-4 xl:flex">
        <div>
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-neutral-400">Insights IA</p>
          <div className="space-y-2">
            {insights.map((ins, index) => (
              <button
                key={index}
                  onClick={() => sendMessage(ins.prompt, false)}
                className="group w-full rounded-2xl border border-neutral-100 bg-white p-3 text-left shadow-sm transition hover:border-emerald-200 hover:shadow-md"
              >
                <div className="flex items-start gap-2">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${ins.tone}`}>
                    <ins.icon size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-black text-neutral-800">{ins.text}</span>
                    <span className="mt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                      {ins.cta} <ChevronRight size={12} className="transition group-hover:translate-x-0.5" />
                    </span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-neutral-400">Actions rapides</p>
          <div className="space-y-1.5">
            {suggestions.map(s => (
              <button
                key={s.label}
                onClick={() => sendMessage(s.prompt, false)}
                className="group flex w-full items-center gap-2.5 rounded-xl border border-transparent p-2.5 text-left transition hover:border-neutral-200 hover:bg-white"
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${s.color}`}>
                  <s.icon size={13} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-black text-neutral-800">{s.label}</span>
                  <span className="text-[10px] font-semibold text-neutral-400">{s.category}</span>
                </span>
                <ChevronRight size={13} className="text-neutral-300 opacity-0 transition group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Zap size={15} className="text-emerald-700" />
            <p className="text-xs font-black text-emerald-900">Assistant contrôlé</p>
          </div>
          <p className="text-[11px] leading-relaxed text-emerald-800/75">
            Les analyses lisent les données admin. Les envois d'e-mails ne partent qu'après validation explicite.
          </p>
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-between border-b border-neutral-100 bg-white/95 px-4 py-3 backdrop-blur sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-700 to-amber-400 text-white shadow-lg shadow-emerald-900/10">
              <Bot size={19} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black text-neutral-900 sm:text-base">Assistant IA SALAM</h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> En ligne
                </span>
              </div>
              <p className="text-[11px] font-semibold text-neutral-400">Analyse admin, recommandations et actions assistées</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={clearConversation}
              className="hidden h-9 items-center gap-1.5 rounded-xl border border-neutral-200 px-3 text-xs font-bold text-neutral-600 transition hover:border-emerald-200 hover:text-emerald-700 sm:flex"
            >
              <RotateCcw size={13} /> Nouvelle conv.
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 text-neutral-500 transition hover:border-emerald-200 hover:text-emerald-700" title="Exporter">
              <Download size={14} />
            </button>
          </div>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto bg-gradient-to-b from-white to-[#f7faf8] p-4 sm:p-5">
          <AnimatePresence>
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                  msg.role === 'assistant'
                    ? 'bg-gradient-to-br from-emerald-700 to-amber-400 text-white'
                    : 'bg-neutral-900 text-white'
                }`}>
                  {msg.role === 'assistant' ? <Sparkles size={15} /> : <Users size={14} />}
                </div>
                <div className={`flex max-w-[88%] flex-col gap-2 sm:max-w-[74%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'rounded-tr-md bg-emerald-700 text-white'
                      : 'rounded-tl-md border border-neutral-100 bg-white text-neutral-700'
                  }`}>
                    {msg.thinking ? (
                      <div className="flex items-center gap-2 py-1 text-neutral-500">
                        <Loader2 size={15} className="animate-spin" />
                        <span className="text-xs font-semibold">Analyse des données admin...</span>
                      </div>
                    ) : (
                      <div className="space-y-1">{renderContent(msg.content)}</div>
                    )}
                  </div>

                  {msg.actions && msg.actions.length > 0 && !msg.thinking && (
                    <div className="flex flex-wrap gap-2">
                      {msg.actions.map(action => (
                        <button
                          key={action.id}
                          onClick={() => executeAction(action)}
                          disabled={sendReminders.isPending}
                          className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-emerald-700 px-3 text-xs font-black text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {action.kind === 'cotisation_reminder' && sendReminders.isPending ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {msg.role === 'assistant' && !msg.thinking && (
                    <div className="flex items-center gap-3 px-1 text-[10px] font-semibold text-neutral-400">
                      <span>{msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                      <button
                        onClick={() => navigator.clipboard?.writeText(msg.content).then(() => toast.success('Réponse copiée'))}
                        className="transition hover:text-emerald-700"
                        title="Copier"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-2 pl-11"
            >
              {suggestions.slice(0, 3).map(s => (
                <button
                  key={s.label}
                  onClick={() => sendMessage(s.prompt, false)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-bold text-neutral-600 transition hover:border-emerald-300 hover:text-emerald-700"
                >
                  <s.icon size={13} /> {s.label}
                </button>
              ))}
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        <footer className="shrink-0 border-t border-neutral-100 bg-white p-3 sm:p-4">
          <div className="mx-auto flex max-w-4xl items-end gap-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={event => {
                setInput(event.target.value);
                event.currentTarget.style.height = 'auto';
                event.currentTarget.style.height = `${Math.min(event.currentTarget.scrollHeight, 128)}px`;
              }}
              onKeyDown={handleKeyDown}
              rows={1}
              maxLength={700}
              placeholder="Ex : cherche les membres en retard de frais d'adhésion..."
              className="min-h-[44px] max-h-32 flex-1 resize-none rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || ai.isPending || sendReminders.isPending}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-900/10 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              {ai.isPending ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] font-semibold text-neutral-400">
            Entrée pour envoyer · Maj+Entrée pour une nouvelle ligne · Vérifiez les actions sensibles avant validation
          </p>
        </footer>
      </section>
    </div>
  );
}
