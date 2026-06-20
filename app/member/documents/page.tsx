'use client';

import { useMemo, useState } from 'react';
import { Download, Eye, FileText, FolderOpen, Loader2, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AnimatedTabBar } from '@/components/ui/AnimatedTabBar';
import { downloadMemberInvoicePdf, useMemberInvoices } from '@/lib/api/invoices';

const TABS = [
  { value: 'all', label: 'Tous' },
  { value: 'facture', label: 'Factures' },
] as const;

export default function MemberDocumentsPage() {
  const [tab, setTab] = useState<'all' | 'facture'>('all');
  const [search, setSearch] = useState('');
  const router = useRouter();
  const { data, isLoading, isError } = useMemberInvoices();
  const invoices = data?.data ?? [];
  const documents = useMemo(() => invoices.filter(invoice => {
    const number = invoice.myRecipient?.invoiceNumber ?? invoice.invoiceNumber;
    return [invoice.title, invoice.description, number].filter(Boolean).join(' ').toLowerCase().includes(search.toLowerCase());
  }), [invoices, search]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-neutral-900">Mes documents</h1>
        <p className="mt-1 text-sm text-neutral-500">Consultez et telechargez vos documents personnels au format PDF.</p>
      </div>
      <AnimatedTabBar items={[...TABS]} value={tab} onChange={setTab} />
      <div className="relative">
        <Search size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Rechercher une facture ou un document..."
          className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-emerald-500" />
      </div>
      <div className="overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm">
        <div className="border-b border-neutral-100 px-5 py-3.5 text-xs font-black uppercase text-neutral-500">
          {isLoading ? 'Chargement...' : documents.length + ' document(s)'}
        </div>
        {isLoading && <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin text-emerald-600" /></div>}
        {isError && <div role="alert" className="px-5 py-10 text-center text-sm text-red-600">Impossible de charger vos documents.</div>}
        {!isLoading && !isError && documents.length === 0 && (
          <div className="flex flex-col items-center px-5 py-12 text-center">
            <FolderOpen size={32} className="mb-3 text-neutral-200" />
            <p className="text-sm font-semibold text-neutral-400">Aucun document pour le moment.</p>
          </div>
        )}
        <div className="divide-y divide-neutral-50">
          {documents.map(invoice => {
            const number = invoice.myRecipient?.invoiceNumber ?? invoice.invoiceNumber;
            const pending = ['pending', 'sent'].includes(invoice.myRecipient?.status ?? 'pending');
            return (
              <div key={invoice._id} className="flex items-center gap-3 px-4 py-4 sm:px-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-violet-100 bg-violet-50"><FileText size={16} className="text-violet-600" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-black text-neutral-900">{invoice.title}</p>
                    <span className={'rounded-full border px-2 py-0.5 text-[10px] font-black ' + (pending ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700')}>{pending ? 'En attente' : 'Payee'}</span>
                  </div>
                  <p className="mt-0.5 font-mono text-[11px] text-neutral-400">{number}</p>
                  <p className="mt-0.5 text-[11px] text-neutral-400">PDF genere a la demande</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button type="button" title="Voir" onClick={() => router.push('/member/factures')}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50"><Eye size={14} /></button>
                  <button type="button" title="Telecharger en PDF"
                    onClick={() => downloadMemberInvoicePdf(invoice._id, number).catch(error => toast.error(error.message))}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"><Download size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <p className="text-xs leading-5 text-neutral-400">Les factures en attente peuvent etre telechargees. Elles ne constituent pas un recu de paiement avant validation.</p>
    </div>
  );
}
