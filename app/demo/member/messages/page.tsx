'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageSquare, ArrowLeft, Send } from 'lucide-react';

const THREADS = [
  { id: 'm1', from: 'Administration SALAM', initials: 'SA', preview: "Votre renouvellement de cotisation a bien été reçu.",    time: 'Il y a 2h',  unread: true,  color: 'from-emerald-600 to-emerald-800' },
  { id: 'm2', from: 'Bureau SALAM',         initials: 'BS', preview: "Invitation à l'assemblée générale du 28 mai.",          time: 'Hier',        unread: false, color: 'from-blue-600 to-blue-800'       },
  { id: 'm3', from: 'Administration SALAM', initials: 'SA', preview: "Votre demande de changement d'antenne est confirmée.",  time: 'Il y a 3j',   unread: false, color: 'from-emerald-600 to-emerald-800' },
];

const MESSAGES: Record<string, { content: string; time: string; self?: boolean }[]> = {
  m1: [
    { content: "Bonjour, j'aimerais renouveler ma cotisation pour 2024.", time: '09:10', self: true },
    { content: 'Bonjour Amina, votre renouvellement a bien été pris en compte. Merci pour votre confiance !', time: '10:32' },
  ],
  m2: [
    { content: "Chère Amina, vous êtes invitée à l'assemblée générale du 28 mai 2024 à 18h00, Paris 12e.", time: 'Hier 14:00' },
  ],
  m3: [
    { content: "Bonjour, je souhaiterais changer d'antenne de Paris vers Lyon.", time: 'Il y a 3j', self: true },
    { content: 'Changement effectué. Bienvenue dans notre antenne de Lyon !', time: 'Il y a 2j' },
  ],
};

export default function DemoMemberMessages() {
  const [active, setActive] = useState('m1');
  const [reply,  setReply]  = useState('');
  const current = THREADS.find(t => t.id === active);

  return (
    <div className="min-h-[calc(100vh-40px)] bg-[#f4f6f5]">
      <header className="border-b border-neutral-200/80 bg-white/95 px-5 py-4">
        <div className="mx-auto max-w-4xl flex items-center gap-4">
          <Link href="/demo/member" className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-700 transition">
            <ArrowLeft size={13} /> Tableau de bord
          </Link>
          <div className="h-4 w-px bg-neutral-200" />
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-emerald-600" />
            <h1 className="text-sm font-black text-neutral-900">Messages</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-5">
        <div className="flex h-[calc(100vh-140px)] min-h-[420px] overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">

          {/* Thread list */}
          <div className="w-64 shrink-0 border-r border-neutral-100">
            {THREADS.map(t => (
              <button key={t.id} onClick={() => setActive(t.id)}
                className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors ${active === t.id ? 'bg-emerald-50' : 'hover:bg-neutral-50'}`}>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${t.color} text-[11px] font-black text-white`}>
                  {t.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`truncate text-xs ${t.unread ? 'font-black' : 'font-semibold'} text-neutral-900`}>{t.from}</p>
                  <p className="mt-0.5 line-clamp-2 text-[10px] text-neutral-400">{t.preview}</p>
                  <p className="mt-0.5 text-[10px] text-neutral-300">{t.time}</p>
                </div>
                {t.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />}
              </button>
            ))}
          </div>

          {/* Conversation */}
          {current && (
            <div className="flex flex-1 flex-col">
              <div className="flex items-center gap-3 border-b border-neutral-100 px-5 py-3.5">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${current.color} text-[11px] font-black text-white`}>
                  {current.initials}
                </div>
                <p className="text-sm font-black text-neutral-900">{current.from}</p>
              </div>
              <div className="flex-1 overflow-y-auto bg-[#f8faf9] p-5 space-y-4">
                {(MESSAGES[active] ?? []).map((m, i) => (
                  <div key={i} className={`flex ${m.self ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.self
                        ? 'rounded-br-sm bg-emerald-600 text-white'
                        : 'rounded-bl-sm border border-neutral-200 bg-white text-neutral-800 shadow-sm'
                    }`}>
                      <p>{m.content}</p>
                      <p className={`mt-1 text-[10px] ${m.self ? 'text-white/60' : 'text-neutral-400'}`}>{m.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-neutral-100 p-4">
                <div className="flex items-center gap-3">
                  <input
                    value={reply} onChange={e => setReply(e.target.value)}
                    placeholder="Votre message… (démo)"
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
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
