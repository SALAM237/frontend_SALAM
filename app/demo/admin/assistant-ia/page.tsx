'use client';

import { useState } from 'react';
import { AlertTriangle, Bot, Send, Sparkles, Users, WalletCards } from 'lucide-react';
import { DemoPortalShell } from '../../_components/DemoShell';

const suggestions = [
  'Liste les membres en retard de frais d adhesion',
  'Propose les relances de cotisation',
  'Analyse les dons et partenariats chauds',
  'Quels contenus doivent etre valides aujourd hui ?',
];

const insights: Array<{ icon: React.ElementType; text: string }> = [
  { icon: AlertTriangle, text: '2 cotisations en retard' },
  { icon: Users, text: '3 leads a traiter' },
  { icon: WalletCards, text: 'Tresorerie positive' },
];

export default function DemoAdminAssistantPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Bonjour, je suis l assistant IA admin SALAM demo. Je peux analyser les donnees mockees et proposer des actions sans toucher a la base.' },
  ]);
  const [input, setInput] = useState('');

  const send = (text = input) => {
    const value = text.trim();
    if (!value) return;
    setInput('');
    setMessages(prev => [
      ...prev,
      { role: 'user', content: value },
      { role: 'assistant', content: value.toLowerCase().includes('retard')
        ? 'J ai trouve 2 membres avec cotisation en retard : Youssef Mansouri et Boris Tamko. Action proposee : envoyer une relance douce avec lien de paiement.'
        : 'Analyse demo terminee. Recommandation : prioriser les leads chauds, valider les opportunites publiques et relancer les cotisations avant fin de semaine.' },
    ]);
  };

  return (
    <DemoPortalShell type="admin" title="Assistant IA">
      <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-3">
          <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">Insights demo</p>
            <div className="mt-4 space-y-2">
              {insights.map(({ icon: Icon, text }) => <div key={text} className="flex items-center gap-2 rounded-xl bg-neutral-50 p-3 text-sm font-bold text-neutral-700"><Icon size={15} />{text}</div>)}
            </div>
          </div>
          <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">Actions rapides</p>
            <div className="mt-4 space-y-2">{suggestions.map(s => <button key={s} onClick={() => send(s)} className="w-full rounded-xl border border-neutral-100 px-3 py-2 text-left text-xs font-bold text-neutral-600 hover:border-emerald-200 hover:text-emerald-700">{s}</button>)}</div>
          </div>
        </aside>
        <section className="flex min-h-[620px] flex-col rounded-2xl border border-neutral-100 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-neutral-100 p-4"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white"><Bot size={18} /></div><div><h1 className="font-black">SALAM Admin AI</h1><p className="text-xs text-neutral-400">Mode demonstration, donnees fictives</p></div></div>
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.map((msg, index) => <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-neutral-50 text-neutral-700'}`}>{msg.content}</div></div>)}
          </div>
          <div className="border-t border-neutral-100 p-4">
            <div className="flex gap-2"><input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Demander une analyse..." className="h-11 flex-1 rounded-xl border border-neutral-200 px-4 text-sm outline-none focus:border-emerald-400" /><button onClick={() => send()} className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white"><Send size={16} /></button></div>
            <p className="mt-2 flex items-center justify-center gap-1 text-[10px] text-neutral-400"><Sparkles size={11} /> Demo locale : aucun email n est envoye.</p>
          </div>
        </section>
      </div>
    </DemoPortalShell>
  );
}
