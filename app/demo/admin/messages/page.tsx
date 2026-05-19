'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FlaskConical, MessageSquare, Send, Search, Circle } from 'lucide-react';

const THREADS = [
  { id: 't1', from: 'Amina Diallo',    initials: 'AD', preview: 'Bienvenue dans la messagerie SALAM ! N\'hésitez pas à nous contacter.', time: 'Il y a 2h',  unread: false, color: 'from-emerald-600 to-emerald-800' },
  { id: 't2', from: 'Boris T.',         initials: 'BT', preview: 'Merci de valider le planning des activités pour le mois de juin.',       time: 'Il y a 5h',  unread: true,  color: 'from-blue-600 to-blue-800'    },
  { id: 't3', from: 'Youssef M.',       initials: 'YM', preview: 'Ma demande d\'adhésion est-elle bien reçue ? Je n\'ai pas eu de retour.', time: 'Hier',       unread: true,  color: 'from-purple-600 to-purple-800' },
  { id: 't4', from: 'Sophie Nkolo',    initials: 'SN', preview: 'Est-ce possible de changer mon antenne de Paris à Lyon ?',                time: 'Il y a 2j',  unread: false, color: 'from-red-600 to-red-800'       },
  { id: 't5', from: 'Pierre Nguemo',   initials: 'PN', preview: 'Je voudrais savoir comment obtenir ma carte de membre numérique.',         time: 'Il y a 3j',  unread: false, color: 'from-yellow-600 to-yellow-700' },
];

const MESSAGES: Record<string, { from: string; content: string; time: string; self?: boolean }[]> = {
  t1: [
    { from: 'Admin', content: 'Bienvenue dans la messagerie SALAM ! N\'hésitez pas à nous contacter.', time: '09:12', self: true },
    { from: 'Amina Diallo', content: 'Merci beaucoup ! Je suis ravie de faire partie de l\'association.', time: '09:35' },
    { from: 'Admin', content: 'Avec plaisir ! N\'hésitez pas si vous avez des questions.', time: '10:02', self: true },
  ],
  t2: [
    { from: 'Boris T.', content: 'Merci de valider le planning des activités pour le mois de juin.', time: '08:15' },
    { from: 'Admin', content: 'Je transmets ça au bureau, on revient vers vous rapidement.', time: '10:30', self: true },
  ],
  t3: [
    { from: 'Youssef M.', content: 'Ma demande d\'adhésion est-elle bien reçue ? Je n\'ai pas eu de retour.', time: 'Hier 14:22' },
  ],
  t4: [
    { from: 'Sophie Nkolo', content: 'Est-ce possible de changer mon antenne de Paris à Lyon ?', time: 'Il y a 2j' },
    { from: 'Admin', content: 'Bien sûr, nous pouvons effectuer ce changement. Pouvez-vous confirmer votre nouvelle adresse ?', time: 'Il y a 2j', self: true },
    { from: 'Sophie Nkolo', content: '14 rue de la République, 69001 Lyon.', time: 'Il y a 2j' },
  ],
  t5: [
    { from: 'Pierre Nguemo', content: 'Je voudrais savoir comment obtenir ma carte de membre numérique.', time: 'Il y a 3j' },
    { from: 'Admin', content: 'Votre carte est générée automatiquement dans votre espace membre, rubrique "Ma carte".', time: 'Il y a 3j', self: true },
  ],
};

export default function DemoAdminMessagesPage() {
  const [activeThread, setActiveThread] = useState('t2');
  const [reply, setReply] = useState('');
  const [search, setSearch] = useState('');

  const filtered = THREADS.filter(t =>
    `${t.from} ${t.preview}`.toLowerCase().includes(search.toLowerCase())
  );
  const current = THREADS.find(t => t.id === activeThread);
  const msgs = MESSAGES[activeThread] ?? [];
  const unreadCount = THREADS.filter(t => t.unread).length;

  return (
    <main className="min-h-screen bg-[#fffdf8]">

      {/* Demo banner */}
      <div className="sticky top-16 z-20 flex items-center justify-between gap-3 border-b border-yellow-200 bg-yellow-50 px-5 py-2.5 md:px-8">
        <div className="flex items-center gap-2 text-xs font-bold text-yellow-800">
          <FlaskConical size={13} />
          Mode démo — données fictives
        </div>
        <Link href="/demo/admin" className="text-xs font-semibold text-yellow-700 hover:text-yellow-900 transition-colors">
          ← Dashboard démo
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-5 py-5 md:px-8">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-emerald-600" />
              <h1 className="text-xl font-black text-neutral-900">Messages</h1>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black text-white">{unreadCount} non lus</span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-neutral-400">{THREADS.length} conversations</p>
          </div>
          <Link href="/demo/admin/adherents" className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-400 hover:text-neutral-700 transition-colors">
            <ArrowLeft size={14} /> Adhérents
          </Link>
        </div>
      </div>

      {/* Messaging interface */}
      <div className="mx-auto max-w-6xl">
        <div className="flex h-[calc(100vh-180px)] min-h-[500px]">

          {/* Thread list */}
          <div className="flex w-full flex-col border-r border-neutral-200 bg-white md:w-72 lg:w-80">
            <div className="p-3 border-b border-neutral-100">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Rechercher…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="h-8 w-full rounded-lg border border-neutral-200 bg-neutral-50 pl-8 pr-3 text-xs placeholder:text-neutral-400 focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-neutral-50">
              {filtered.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveThread(t.id)}
                  className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors ${activeThread === t.id ? 'bg-emerald-50' : 'hover:bg-neutral-50'}`}
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${t.color} text-[11px] font-black text-white`}>
                    {t.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-${t.unread ? 'black' : 'semibold'} text-neutral-900 truncate`}>{t.from}</p>
                      <span className="shrink-0 text-[10px] text-neutral-400 ml-1">{t.time}</span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-neutral-500">{t.preview}</p>
                  </div>
                  {t.unread && <Circle size={7} className="mt-1.5 shrink-0 fill-emerald-500 text-emerald-500" />}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation */}
          <div className="hidden flex-1 flex-col md:flex">
            {current ? (
              <>
                {/* Conversation header */}
                <div className="flex items-center gap-3 border-b border-neutral-200 bg-white px-5 py-3.5">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${current.color} text-[11px] font-black text-white`}>
                    {current.initials}
                  </div>
                  <div>
                    <p className="text-sm font-black text-neutral-900">{current.from}</p>
                    <p className="text-[11px] text-neutral-400">Membre SALAM</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto bg-[#f8faf9] p-5 space-y-4">
                  {msgs.map((m, i) => (
                    <div key={i} className={`flex ${m.self ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        m.self
                          ? 'rounded-br-sm bg-emerald-600 text-white'
                          : 'rounded-bl-sm bg-white border border-neutral-200 text-neutral-800 shadow-sm'
                      }`}>
                        <p>{m.content}</p>
                        <p className={`mt-1 text-[10px] ${m.self ? 'text-white/60' : 'text-neutral-400'}`}>{m.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply box */}
                <div className="border-t border-neutral-200 bg-white p-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Votre réponse… (démo)"
                      value={reply}
                      onChange={e => setReply(e.target.value)}
                      className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm placeholder:text-neutral-400 focus:border-emerald-400 focus:outline-none"
                    />
                    <button
                      onClick={() => setReply('')}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white transition-colors hover:bg-emerald-700"
                    >
                      <Send size={15} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-sm text-neutral-400">Sélectionnez une conversation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
