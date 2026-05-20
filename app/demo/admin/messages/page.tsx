'use client';

import { MessageSquare, Send } from 'lucide-react';
import { DemoCard, DemoPortalShell } from '../../_components/DemoShell';
import { demoMessages } from '@/data/demo/demo-messages';

export default function DemoAdminMessagesPage() {
  return (
    <DemoPortalShell type="admin" title="Messages">
      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <DemoCard className="overflow-hidden">
          <div className="border-b border-neutral-100 px-5 py-4"><p className="text-sm font-black">Conversations</p></div>
          {demoMessages.map(message => (
            <button key={message.id} className="flex w-full items-start gap-3 border-b border-neutral-50 px-5 py-4 text-left hover:bg-neutral-50">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-emerald-700 text-xs font-black text-white">{message.from[0]}</div>
              <div className="min-w-0 flex-1"><p className="text-sm font-black">{message.from}</p><p className="truncate text-xs text-neutral-500">{message.content}</p></div>
            </button>
          ))}
        </DemoCard>
        <DemoCard className="flex min-h-[460px] flex-col overflow-hidden">
          <div className="flex items-center gap-3 border-b border-neutral-100 px-5 py-4"><MessageSquare size={18} className="text-emerald-600" /><p className="text-sm font-black">Conversation demo</p></div>
          <div className="flex-1 space-y-3 bg-neutral-50/70 p-5">
            <div className="max-w-[75%] rounded-2xl rounded-tl-sm bg-white p-3 text-sm shadow-sm">Bonjour, ceci est une messagerie fictive SALAM.</div>
            <div className="ml-auto max-w-[75%] rounded-2xl rounded-tr-sm bg-emerald-700 p-3 text-sm text-white shadow-sm">Parfait, aucun message n'est envoye en base.</div>
          </div>
          <div className="flex gap-2 border-t border-neutral-100 p-4">
            <input className="h-10 flex-1 rounded-xl border border-neutral-200 px-3 text-sm" placeholder="Ecrire un message demo..." />
            <button className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-700 text-white"><Send size={15} /></button>
          </div>
        </DemoCard>
      </div>
    </DemoPortalShell>
  );
}
