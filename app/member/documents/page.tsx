'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download, Eye, FileText, FolderOpen, GraduationCap, Loader2, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AnimatedTabBar } from '@/components/ui/AnimatedTabBar';
import { useMemberInvoices } from '@/lib/api/invoices';
import { printMemberInvoice, loadAssociationInfo, esc } from '@/lib/invoice-pdf';
import { useMemberSharedDocuments, type SharedDocument } from '@/lib/api/documents';
import { useGenerateMemberAttestation } from '@/lib/api/attestation';
import { DocumentPreviewModal } from '@/components/portal/DocumentPreviewModal';
import { useMarkHrefRead } from '@/lib/api/notifications';

/* Ouvre une fenêtre d'impression A4 avec l'attestation DÉJÀ remplie par le
   serveur (jetons substitués côté back) — le membre ne voit jamais le modèle brut.
   L'identité SALAM (logo, adresse, immatriculation, contact) est reprise de la
   même source que les factures (loadAssociationInfo), pour un rendu cohérent. */
function printAttestation(title: string, bodyHtml: string) {
  const association = loadAssociationInfo();
  const html = `
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { margin: 0; background: #e5e7eb; font-family: Arial, sans-serif; color: #0f172a; }
    .page { width: min(100vw, 794px); min-height: min(1123px, calc(100vw * 1.414)); margin: 0 auto; background: white; padding: clamp(22px, 4.8vw, 42px); position: relative; }
    .flag { position: absolute; left: 0; right: 0; top: 0; height: clamp(4px, .8vw, 7px); background: linear-gradient(90deg,#0B8F3A 0 33%,#C8102E 33% 66%,#F7C600 66%); }
    .header { margin: calc(clamp(22px, 4.8vw, 42px) * -1) calc(clamp(22px, 4.8vw, 42px) * -1) clamp(24px, 4vw, 34px); padding: clamp(32px, 5vw, 42px) clamp(22px, 4.8vw, 42px) clamp(18px, 3vw, 26px); background: linear-gradient(135deg,#087348,#075f41 62%,#043d2d); color: white; }
    .brand-row { display: flex; align-items: center; gap: 10px; }
    .logo { width: 34px; height: 34px; border-radius: 10px; background: #ffffff; color: #047857; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 900; overflow: hidden; flex-shrink: 0; }
    .logo img { width: 100%; height: 100%; object-fit: cover; }
    .brand-name { font-size: clamp(13px, 2.4vw, 16px); font-weight: 900; letter-spacing: .06em; text-transform: uppercase; }
    .tagline { margin: 5px 0 0; font-size: clamp(10px, 1.8vw, 12px); color: rgba(255,255,255,.75); }
    h1 { margin: clamp(8px, 2vw, 12px) 0 0; font-size: clamp(22px, 5vw, 28px); line-height: 1.1; }
    .assoc-line { margin: 3px 0 0; font-size: clamp(10px, 1.8vw, 12px); color: rgba(255,255,255,.85); }
    .assoc-line.spaced { margin-top: 12px; }
    .body { max-width: 88%; margin: 0 auto; padding-top: clamp(28px, 5vw, 48px); font-size: 17px; line-height: 2.1; text-align: justify; }
    .body p { margin: 0 0 22px; }
    .body strong { color: #065f46; font-weight: 900; }
    .body .align-right { text-align: right; }
    .body .signature { margin-top: 90px; text-align: right; }
    .body .signature p { margin: 0 0 4px; }
    .footer { position: absolute; left: 48px; right: 48px; bottom: 30px; border-top: 1px solid #e5e7eb; padding-top: 14px; text-align: center; color: #64748b; font-size: 11px; }
    @media print { body { background: white; } .page { width: 794px; min-height: 1123px; margin: 0; padding: 38px; } .header { margin: -38px -38px 26px; padding: 40px 38px 24px; } }
  </style>
</head>
<body>
  <div class="page">
    <div class="flag"></div>
    <header class="header">
      <div class="brand-row">
        <span class="logo">${association.logoUrl ? `<img src="${esc(association.logoUrl)}" alt="Logo" />` : esc(association.logo)}</span>
        <span class="brand-name">${esc(association.name)}</span>
      </div>
      <p class="tagline">Solidaire Associative des Lauréats du Maroc</p>
      <h1>${title}</h1>
      <p class="assoc-line">${esc(association.address)}</p>
      <p class="assoc-line spaced">${esc(association.registration)}</p>
      <p class="assoc-line spaced">${esc(association.email)} · ${esc(association.phone)}</p>
      <p class="assoc-line">Hôtel SOMATEL, sis à montée Aurore</p>
      <p class="assoc-line">Yaoundé — CAMEROUN</p>
      <p class="assoc-line">B.P : 8389 Yaoundé</p>
    </header>
    <section class="body">${bodyHtml}</section>
    <footer class="footer">SALAM Cameroun · Maroc · contact@salam-cameroun.com · Fondée le 20/02/2010</footer>
  </div>
  <script>window.addEventListener('load', () => setTimeout(() => window.print(), 250));</script>
</body>
</html>`;
  const win = window.open('', '_blank', 'width=900,height=1200');
  if (!win) return;
  win.document.write(html);
  win.document.close();
}

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
  const [tab, setTab]         = useState<Tab>('all');
  const [search, setSearch]   = useState('');
  const [preview, setPreview] = useState<SharedDocument | null>(null);
  const router = useRouter();
  const generateAttestation = useGenerateMemberAttestation();

  const handleAttestation = () => {
    generateAttestation.mutate(undefined, {
      onSuccess: res => {
        const attestation = (res as any).data;
        if (attestation) printAttestation(attestation.title, attestation.bodyHtml);
      },
    });
  };

  // Décrémente les badges sidebar en marquant lues les notifs documents à l'arrivée sur la page
  const markHrefRead = useMarkHrefRead('member');
  useEffect(() => { markHrefRead('/member/documents'); }, [markHrefRead]);

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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">Mes documents</h1>
          <p className="mt-1 text-sm text-neutral-500">Consultez et téléchargez vos documents personnels.</p>
        </div>
        <button type="button" onClick={handleAttestation} disabled={generateAttestation.isPending}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-black text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-50">
          {generateAttestation.isPending ? <Loader2 size={14} className="animate-spin" /> : <GraduationCap size={15} />}
          Obtenir mon attestation
        </button>
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
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPreview(doc)}
                  title="Visualiser"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <Eye size={14} />
                </button>
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Télécharger"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                >
                  <Download size={14} />
                </a>
              </div>
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
                    onClick={() => printMemberInvoice(invoice)}
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

      {preview && <DocumentPreviewModal doc={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}
