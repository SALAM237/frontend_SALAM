'use client';

import { useMemo, useState } from 'react';
import { Download, Eye, FileText, FolderOpen, Loader2, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AnimatedTabBar } from '@/components/ui/AnimatedTabBar';
import { downloadMemberInvoicePdf, useMemberInvoices } from '@/lib/api/invoices';
import { useMemberSharedDocuments } from '@/lib/api/documents';

const TABS = [
  { value: 'all',     label: 'Tous' },
  { value: 'partage', label: 'Partagés' },
  { value: 'facture', label: 'Factures' },
] as const;
type Tab = typeof TABS[number]['value'];

function fmtSize(bytes: number) {
  if (bytes < 1024)         return `${bytes} o`;
  if (bytes < 1024 * 1024)  return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

export default function MemberDocumentsPage() {
  const [tab, setTab]       = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const router = useRouter();

  const { data: invoicesData, isLoading: loadingInvoices, isError: errorInvoices } = useMemberInvoices();
  const { data: sharedData,   isLoading: loadingShared,   isError: errorShared   } = useMemberSharedDocuments();

  const invoices        = invoicesData?.data ?? [];
  const sharedDocuments = sharedData?.data?.documents ?? [];

  const filteredInvoices = useMemo(() =>
    invoices.filter(invoice => {
      const number = invoice.myRecipient?.invoiceNumber ?? invoice.invoiceNumber;
      return [invoice.title, invoice.description, number].filter(Boolean).join(' ').toLowerCase().includes(search.toLowerCase());
    }), [invoices, search]);

  const filteredShared = useMemo(() =>
    sharedDocuments.filter(doc => doc.title.toLowerCase().includes(search.toLowerCase())),
    [sharedDocuments, search]);

  const showInvoices = tab === 'all' || tab === 'facture';
  const showShared   = tab === 'all' || tab === 'partage';
  const isLoading    = loadingInvoices || loadingShared;
  const isError      = errorInvoices   || errorShared;
  const totalCount   = (showInvoices ? filteredInvoices.length : 0) + (showShared ? filteredShared.length : 0);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-neutral-900">Mes documents</h1>
        <p className="mt-1 text-sm text-neutral-500">Consultez et téléchargez vos documents personnels.</p>
      </div>

      <AnimatedTabBar items={[...TABS]} value={tab} onChange={v => setTab(v as Tab)} />

      <div className="relative">
        <Search size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un document..."
          className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-emerald-500" />
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm">
        <div className="border-b border-neutral-100 bg-emerald-50/40 px-5 py-3.5 text-xs font-black uppercase text-neutral-500">
          {isLoading ? 'Chargement...' : `${totalCount} document(s)`}
        </div>

        {isLoading && <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin text-emerald-600" /></div>}
        {isError   && <div role="alert" className="px-5 py-10 text-center text-sm text-red-600">Impossible de charger vos documents.</div>}

        {!isLoading && !isError && totalCount === 0 && (
          <div className="flex flex-col items-center px-5 py-12 text-center">
            <FolderOpen size={32} className="mb-3 text-neutral-200" />
            <p className="text-sm font-semibold text-neutral-400">Aucun document pour le moment.</p>
          </div>
        )}

        <div className="divide-y divide-neutral-50">
          {/* Docs partagés par l'admin */}
          {showShared && filteredShared.map(doc => (
            <div key={doc._id} className="flex items-center gap-3 px-4 py-4 sm:px-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50">
                <FileText size={16} className="text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-black text-neutral-900">{doc.title}</p>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700">Partagé</span>
                </div>
                <p className="mt-0.5 text-[11px] text-neutral-400">{doc.mimeLabel} · {fmtSize(doc.fileSize)}</p>
              </div>
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Télécharger"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              >
                <Download size={14} />
              </a>
            </div>
          ))}

          {/* Factures */}
          {showInvoices && filteredInvoices.map(invoice => {
            const number  = invoice.myRecipient?.invoiceNumber ?? invoice.invoiceNumber;
            const pending = ['pending', 'sent'].includes(invoice.myRecipient?.status ?? 'pending');
            return (
              <div key={invoice._id} className="flex items-center gap-3 px-4 py-4 sm:px-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-violet-100 bg-violet-50">
                  <FileText size={16} className="text-violet-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-black text-neutral-900">{invoice.title}</p>
                    <span className={'rounded-full border px-2 py-0.5 text-[10px] font-black ' + (pending ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700')}>
                      {pending ? 'En attente' : 'Payée'}
                    </span>
                  </div>
                  <p className="mt-0.5 font-mono text-[11px] text-neutral-400">{number}</p>
                  <p className="mt-0.5 text-[11px] text-neutral-400">Facture PDF</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button type="button" title="Voir" onClick={() => router.push('/member/factures')}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50">
                    <Eye size={14} />
                  </button>
                  <button type="button" title="Télécharger en PDF"
                    onClick={() => downloadMemberInvoicePdf(invoice._id, number).catch(err => toast.error(err.message))}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100">
                    <Download size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showInvoices && (
        <p className="text-xs leading-5 text-neutral-400">Les factures en attente peuvent être téléchargées. Elles ne constituent pas un reçu de paiement avant validation.</p>
      )}
    </div>
  );
}
