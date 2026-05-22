import { Mail, Phone, ThermometerSun } from 'lucide-react';
import { DemoPortalShell, DemoStatus } from '../../_components/DemoShell';
import { demoChatLeads } from '@/data/demo/demo-extra';

export default function DemoAdminChatLeadsPage() {
  return (
    <DemoPortalShell type="admin" title="IDP/ISP - Leads chatbot">
      <div className="mx-auto max-w-6xl space-y-5">
        <div><h1 className="text-2xl font-black text-neutral-900">Leads chatbot</h1><p className="text-sm text-neutral-500">Demandes detectees par SALAMIEN en mode demo.</p></div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-2xl font-black">3</p><p className="text-xs text-neutral-500">Total leads</p></div>
          <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-2xl font-black text-red-500">2</p><p className="text-xs text-neutral-500">Chauds</p></div>
          <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-2xl font-black text-amber-500">1</p><p className="text-xs text-neutral-500">Tiede</p></div>
        </div>
        <div className="space-y-3">
          {demoChatLeads.map(lead => (
            <article key={lead.id} className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><ThermometerSun size={17} /></div>
                <div className="min-w-0 flex-1"><h2 className="font-black text-neutral-900">{lead.name}</h2><p className="text-sm text-neutral-500">{lead.summary}</p><p className="mt-2 text-xs text-neutral-400"><Mail className="mr-1 inline" size={12} />{lead.email} <Phone className="ml-3 mr-1 inline" size={12} />Non renseigne</p></div>
                <DemoStatus tone={lead.temperature === 'chaud' ? 'red' : 'amber'}>{lead.temperature} - {lead.score}/100</DemoStatus>
              </div>
            </article>
          ))}
        </div>
      </div>
    </DemoPortalShell>
  );
}
