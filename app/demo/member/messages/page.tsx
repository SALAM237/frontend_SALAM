'use client';

import { Send } from 'lucide-react';
import { DemoCard, DemoPortalShell } from '../../_components/DemoShell';
import { demoMessages } from '@/data/demo/demo-messages';

export default function DemoMemberMessagesPage() {
  return (
    <DemoPortalShell type="member" title="Messages">
      <DemoCard className="mx-auto flex min-h-[560px] max-w-5xl flex-col overflow-hidden">
        <div className="border-b border-neutral-100 px-5 py-4"><p className="text-sm font-black">Messagerie demo</p><p className="text-xs text-neutral-400">Aucun message n'est envoye.</p></div>
        <div className="flex-1 space-y-3 bg-neutral-50/70 p-5">
          {demoMessages.map((message, index) => (
            <div key={message.id} className={`max-w-[80%] rounded-2xl p-3 text-sm shadow-sm ${index % 2 ? 'ml-auto rounded-tr-sm bg-emerald-700 text-white' : 'rounded-tl-sm bg-white text-neutral-700'}`}>
              <p className="text-xs font-black opacity-70">{message.from}</p>
              {message.content}
            </div>
          ))}
        </div>
        <div className="flex gap-2 border-t border-neutral-100 p-4">
          <input className="h-10 flex-1 rounded-xl border border-neutral-200 px-3 text-sm" placeholder="Repondre dans la demo..." />
          <button className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-700 text-white"><Send size={15} /></button>
        </div>
      </DemoCard>
    </DemoPortalShell>
  );
}
