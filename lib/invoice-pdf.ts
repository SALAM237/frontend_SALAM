import { toast } from 'sonner';
import { sanitizeRichHtml } from '@/lib/rich-text';
import type { MemberInvoiceDoc } from '@/lib/api/invoices';

/* Génération de factures imprimables/téléchargeables (impression navigateur →
   "Enregistrer en PDF") — PARTAGÉ entre la vue admin (app/admin/facturation) et
   la vue membre (app/member/factures), pour garantir un rendu strictement
   identique des deux côtés (même structure, mêmes données, même logo). */

export type InvoiceLine = { id: number; designation: string; qty: number | string; ht: number | string; vat: number | string };
export type InvoicePdfRecipient = { name: string; email?: string; phone?: string; address?: string; memberId?: string };
export type AssociationInvoiceInfo = {
  name: string;
  title: string;
  address: string;
  registration: string;
  email: string;
  phone: string;
  logo: string;
  logoUrl: string;
};

export type InvoicePdfDocument = {
  association: AssociationInvoiceInfo;
  invoiceTitle: string;
  invoiceNumber: string;
  recipient: InvoicePdfRecipient;
  lines: InvoiceLine[];
  notes: string;
  legal: string;
  dueDate: string;
};

const ASSOCIATION_STORAGE_KEY = 'salam_invoice_association_v1';
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

export const initialAssociation: AssociationInvoiceInfo = {
  name: 'ASSOCIATION SALAM',
  title: 'SALAM Cameroun · Maroc',
  address: 'Adresse de l’association',
  registration: 'N° d’immatriculation : SALAM-CMR-2026',
  email: 'contact@salam-cameroun.com',
  phone: '+237 000 000 000',
  logo: 'SALAM',
  logoUrl: '/images/logo/logo%20salam.jfif',
};

export function loadAssociationInfo(): AssociationInvoiceInfo {
  if (typeof window === 'undefined') return initialAssociation;
  try {
    const raw = window.localStorage.getItem(ASSOCIATION_STORAGE_KEY);
    const merged = raw ? { ...initialAssociation, ...JSON.parse(raw) } : initialAssociation;
    /* Un ancien enregistrement localStorage (avant l'ajout du logo par défaut) peut
       avoir persisté logoUrl: '' — ne jamais laisser ce vide écraser le logo SALAM. */
    if (!merged.logoUrl) merged.logoUrl = initialAssociation.logoUrl;
    return merged;
  } catch {
    return initialAssociation;
  }
}

export function saveAssociationInfo(info: AssociationInvoiceInfo) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ASSOCIATION_STORAGE_KEY, JSON.stringify(info));
}

export function seq(n: number) {
  return String(n).padStart(4, '0');
}

export function fmtCfa(amount: number) {
  return `${Number(amount || 0).toLocaleString('fr-FR')} F.CFA`;
}

export function calcInvoiceTotals(lines: InvoiceLine[]) {
  const ht = lines.reduce((sum, line) => sum + Number(line.qty || 0) * Number(line.ht || 0), 0);
  const vat = lines.reduce((sum, line) => sum + Number(line.qty || 0) * Number(line.ht || 0) * (Number(line.vat || 0) / 100), 0);
  return { ht, vat, ttc: ht + vat };
}

export function esc(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function rich(value: unknown) {
  return sanitizeRichHtml(String(value ?? '').replace(/\n/g, '<br>'));
}

export function openInvoicePdfPreview(params: {
  association: AssociationInvoiceInfo;
  invoiceTitle: string;
  invoiceNumber: string;
  recipient: { name: string; email?: string; phone?: string; address?: string; memberId?: string };
  lines: InvoiceLine[];
  notes: string;
  legal: string;
  dueDate: string;
}) {
  const totals = calcInvoiceTotals(params.lines);
  const rows = params.lines.map(line => {
    const ttc = Number(line.qty || 0) * Number(line.ht || 0) * (1 + Number(line.vat || 0) / 100);
    return `
      <tr>
        <td>${rich(line.designation)}</td>
        <td class="right">${esc(line.qty)}</td>
        <td class="right">${fmtCfa(Number(line.ht || 0))}</td>
        <td class="right">${esc(line.vat)}%</td>
        <td class="right strong">${fmtCfa(ttc)}</td>
      </tr>
    `;
  }).join('');

  const html = `
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>${esc(params.invoiceNumber)}</title>
  <style>
    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { margin: 0; background: #e5e7eb; font-family: Arial, sans-serif; color: #0f172a; }
    .page {
      width: ${A4_WIDTH}px;
      min-height: ${A4_HEIGHT}px;
      margin: 0 auto;
      background: #fff;
      padding: 48px;
      position: relative;
      overflow: hidden;
    }
    .flag { position: absolute; left: 0; right: 0; top: 0; height: 8px; background: linear-gradient(90deg,#0B8F3A 0 33%,#C8102E 33% 66%,#F7C600 66%); }
    .header { margin: -48px -48px 32px; padding: 54px 48px 34px; background: linear-gradient(135deg,#087348,#075f41 62%,#043d2d); color: white; }
    .eyebrow { color: #fde68a; font-size: 11px; font-weight: 800; letter-spacing: .24em; text-transform: uppercase; }
    h1 { margin: 14px 0 6px; font-size: 34px; line-height: 1; }
    .muted { color: #64748b; }
    .white-muted { color: rgba(255,255,255,.72); }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
    .card { border: 1px solid #e5e7eb; border-radius: 18px; padding: 22px; background: #fff; }
    .card h2 { margin: 0 0 14px; font-size: 12px; letter-spacing: .16em; text-transform: uppercase; color: #64748b; }
    .logo { width: 58px; height: 58px; border-radius: 18px; background: #047857; color: white; display: inline-flex; align-items:center; justify-content:center; font-size: 12px; font-weight: 900; overflow: hidden; vertical-align: middle; margin-right: 12px; }
    .logo img { width: 100%; height: 100%; object-fit: cover; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
    th { background: #0f172a; color: white; text-align: left; padding: 12px 10px; font-size: 10px; letter-spacing: .12em; text-transform: uppercase; }
    td { border-bottom: 1px solid #eef2f7; padding: 12px 10px; vertical-align: top; }
    .right { text-align: right; }
    .strong { font-weight: 800; }
    .totals { width: 310px; margin-left: auto; margin-top: 22px; border: 1px solid #e5e7eb; border-radius: 18px; padding: 18px; background: #f8fafc; }
    .row { display: flex; justify-content: space-between; gap: 20px; margin: 8px 0; font-size: 13px; }
    .total { background: #087348; color: white; border-radius: 14px; padding: 14px; margin-top: 12px; font-weight: 900; }
    .notes { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 24px; }
    .footer { position: absolute; left: 48px; right: 48px; bottom: 30px; border-top: 1px solid #e5e7eb; padding-top: 14px; text-align: center; color: #64748b; font-size: 11px; }
    @media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      body { background: white; }
      .page { margin: 0; box-shadow: none; width: 794px; min-height: 1123px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="flag"></div>
    <header class="header">
      <div class="eyebrow">${esc(params.association.name)}</div>
      <p class="white-muted">Solidaire Associative des Lauréats du Maroc</p>
      <h1>${esc(params.invoiceTitle)}</h1>
      <p class="white-muted">${esc(params.invoiceNumber)} · Échéance ${esc(params.dueDate || 'à renseigner')}</p>
    </header>
    <section class="grid">
      <div class="card">
        <h2>Émetteur</h2>
        <div>
          <span class="logo">${params.association.logoUrl ? `<img src="${esc(params.association.logoUrl)}" alt="Logo" />` : esc(params.association.logo)}</span>
          <strong>${esc(params.association.title)}</strong>
        </div>
        <p class="muted">${esc(params.association.address)}</p>
        <p class="muted">${esc(params.association.registration)}</p>
        <p class="muted">${esc(params.association.email)} · ${esc(params.association.phone)}</p>
      </div>
      <div class="card">
        <h2>Facturé à</h2>
        <strong>${esc(params.recipient.name)}</strong>
        <p class="muted">${esc(params.recipient.email)}</p>
        <p class="muted">${esc(params.recipient.phone)}</p>
        <p class="muted">${esc(params.recipient.address)}</p>
        ${params.recipient.memberId ? `<p class="muted">N° membre : ${esc(params.recipient.memberId)}</p>` : ''}
      </div>
    </section>
    <table>
      <thead>
        <tr><th>Désignation</th><th class="right">Qté</th><th class="right">HT</th><th class="right">TVA</th><th class="right">TTC</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <section class="totals">
      <div class="row"><span>Total HT</span><strong>${fmtCfa(totals.ht)}</strong></div>
      <div class="row"><span>TVA</span><strong>${fmtCfa(totals.vat)}</strong></div>
      <div class="row total"><span>Total TTC</span><span>${fmtCfa(totals.ttc)}</span></div>
    </section>
    <section class="notes">
      <div class="card"><h2>Observations</h2><p class="muted">${esc(params.notes)}</p></div>
      <div class="card"><h2>Mentions légales</h2><p class="muted">${esc(params.legal)}</p></div>
    </section>
    <footer class="footer">${esc(params.association.title)} · ${esc(params.association.email)} · ${esc(params.association.phone)} · ${esc(params.association.registration)}</footer>
  </div>
  <script>window.addEventListener('load', () => setTimeout(() => window.print(), 250));</script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=900,height=1200');
  if (!win) {
    toast.error('Ouverture du PDF bloquée par le navigateur. Autorisez les popups pour télécharger/imprimer.');
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
}

export function splitInvoiceLines(lines: InvoiceLine[]) {
  const chunks: InvoiceLine[][] = [];
  let index = 0;
  while (index < lines.length) {
    const size = chunks.length === 0 ? 8 : 14;
    chunks.push(lines.slice(index, index + size));
    index += size;
  }
  return chunks.length ? chunks : [[]];
}

export function openInvoicePdfBatch(documents: InvoicePdfDocument[]) {
  const pages = documents.flatMap(doc => {
    const chunks = splitInvoiceLines(doc.lines);
    const totals = calcInvoiceTotals(doc.lines);
    return chunks.map((chunk, pageIndex) => {
      const isLast = pageIndex === chunks.length - 1;
      const rows = chunk.map(line => {
        const ttc = Number(line.qty || 0) * Number(line.ht || 0) * (1 + Number(line.vat || 0) / 100);
        return `<tr><td>${rich(line.designation)}</td><td class="right">${esc(line.qty)}</td><td class="right">${fmtCfa(Number(line.ht || 0))}</td><td class="right">${esc(line.vat)}%</td><td class="right strong">${fmtCfa(ttc)}</td></tr>`;
      }).join('');
      return `
        <div class="page-wrap">
        <article class="page">
          <div class="flag"></div>
          <header class="header">
            <div class="eyebrow">${esc(doc.association.name)}</div>
            <p class="white-muted">Solidaire Associative des Lauréats du Maroc</p>
            <h1>${esc(doc.invoiceTitle)}</h1>
            <p class="white-muted">${esc(doc.invoiceNumber)} · Échéance ${esc(doc.dueDate || 'à renseigner')}</p>
          </header>
          <section class="grid">
            <div class="card compact"><h2>Émetteur</h2><div><span class="logo">${doc.association.logoUrl ? `<img src="${esc(doc.association.logoUrl)}" alt="Logo" />` : esc(doc.association.logo)}</span><strong>${esc(doc.association.title)}</strong></div><p class="muted">${esc(doc.association.address)}</p><p class="muted">${esc(doc.association.registration)}</p><p class="muted">${esc(doc.association.email)} · ${esc(doc.association.phone)}</p></div>
            <div class="card compact"><h2>Facturé à</h2><strong>${esc(doc.recipient.name)}</strong><p class="muted">${esc(doc.recipient.email)}</p><p class="muted">${esc(doc.recipient.phone)}</p><p class="muted">${esc(doc.recipient.address)}</p>${doc.recipient.memberId ? `<p class="muted">Réf. : ${esc(doc.recipient.memberId)}</p>` : ''}</div>
          </section>
          <table><thead><tr><th>Désignation</th><th class="right">Qté</th><th class="right">HT</th><th class="right">TVA</th><th class="right">TTC</th></tr></thead><tbody>${rows}</tbody></table>
          ${isLast ? `<section class="totals"><div class="row"><span>Total HT</span><strong>${fmtCfa(totals.ht)}</strong></div><div class="row"><span>TVA</span><strong>${fmtCfa(totals.vat)}</strong></div><div class="row total"><span>Total TTC</span><span>${fmtCfa(totals.ttc)}</span></div></section><section class="notes"><div class="card"><h2>Observations</h2><p class="muted">${rich(doc.notes)}</p></div><div class="card"><h2>Mentions légales</h2><p class="muted">${rich(doc.legal)}</p></div></section>` : '<p class="continued">Suite de la facture sur la page suivante.</p>'}
          <footer class="footer"><span>${esc(doc.association.title)} · ${esc(doc.association.email)}</span><strong>Page ${pageIndex + 1}/${chunks.length}</strong></footer>
        </article>
        </div>`;
    });
  }).join('');

  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Factures SALAM</title><style>
    @page{size:A4 portrait;margin:0}*{box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}body{margin:0;background:#e5e7eb;font-family:Arial,sans-serif;color:#0f172a;font-size:clamp(10px,1.45vw,13px)}.toolbar{position:sticky;top:0;z-index:10;display:flex;justify-content:center;padding:12px;background:rgba(15,23,42,.88)}.toolbar button{border:0;border-radius:999px;background:#059669;color:white;padding:10px 16px;font-weight:800}.page{width:min(100vw,794px);min-height:min(1123px,calc(100vw * 1.414));margin:0 auto 18px;background:white;padding:clamp(22px,4.8vw,42px);position:relative;overflow:hidden;box-shadow:0 18px 55px rgba(15,23,42,.18)}.flag{position:absolute;left:0;right:0;top:0;height:clamp(4px,.8vw,7px);background:linear-gradient(90deg,#0B8F3A 0 33%,#C8102E 33% 66%,#F7C600 66%)}.header{margin:calc(clamp(22px,4.8vw,42px) * -1) calc(clamp(22px,4.8vw,42px) * -1) clamp(18px,3vw,28px);padding:clamp(32px,5vw,42px) clamp(22px,4.8vw,42px) clamp(18px,3vw,26px);background:linear-gradient(135deg,#087348,#075f41 62%,#043d2d);color:white}.eyebrow{color:#fde68a;font-size:clamp(8px,1.6vw,11px);font-weight:800;letter-spacing:.2em;text-transform:uppercase}h1{margin:clamp(8px,2vw,12px) 0 5px;font-size:clamp(22px,5vw,31px);line-height:1}.white-muted{color:rgba(255,255,255,.74)}.muted{color:#64748b;overflow-wrap:anywhere}.grid,.notes{display:grid;grid-template-columns:1fr 1fr;gap:clamp(12px,2.4vw,18px)}.card{border:1px solid #e5e7eb;border-radius:clamp(12px,2.5vw,18px);padding:clamp(13px,2.6vw,20px);background:white}.compact{min-height:clamp(128px,23vw,170px)}.card h2{margin:0 0 10px;font-size:clamp(9px,1.7vw,12px);letter-spacing:.14em;text-transform:uppercase;color:#64748b}.logo{width:40px;height:40px;border-radius:12px;background:#047857;color:white;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;overflow:hidden;vertical-align:middle;margin-right:10px}.logo img{width:100%;height:100%;object-fit:cover}table{width:100%;border-collapse:collapse;margin-top:clamp(16px,3vw,22px);font-size:clamp(9px,1.6vw,12px);table-layout:fixed}th{background:#0f172a;color:white;text-align:left;padding:clamp(8px,1.7vw,11px) clamp(6px,1.5vw,10px);font-size:clamp(7px,1.4vw,10px);letter-spacing:.1em;text-transform:uppercase}td{border-bottom:1px solid #eef2f7;padding:clamp(8px,1.7vw,11px) clamp(6px,1.5vw,10px);vertical-align:top;overflow-wrap:anywhere}th:first-child,td:first-child{width:44%}.right{text-align:right}.strong{font-weight:800}.totals{width:min(100%,310px);margin-left:auto;margin-top:clamp(16px,3vw,22px);border:1px solid #e5e7eb;border-radius:18px;padding:clamp(14px,2.6vw,18px);background:#f8fafc}.row{display:flex;justify-content:space-between;gap:18px;margin:8px 0}.total{background:#087348;color:white;border-radius:14px;padding:clamp(11px,2.2vw,14px);margin-top:12px;font-weight:900}.notes{margin-top:clamp(18px,3vw,24px)}.continued{margin-top:20px;color:#64748b;font-weight:700;text-align:right}.footer{position:absolute;left:clamp(22px,4.8vw,42px);right:clamp(22px,4.8vw,42px);bottom:clamp(14px,3vw,26px);display:flex;justify-content:space-between;gap:14px;border-top:1px solid #e5e7eb;padding-top:12px;color:#64748b;font-size:clamp(8px,1.5vw,11px)}@media(max-width:640px){.grid,.notes{grid-template-columns:1fr}.footer{flex-direction:column}}@media print{*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}body{background:white;font-size:12px}.toolbar{display:none}.page{width:794px;min-height:1123px;margin:0;padding:38px;box-shadow:none;page-break-after:always}.header{margin:-38px -38px 26px;padding:40px 38px 24px}.flag{height:7px}.grid,.notes{grid-template-columns:1fr 1fr}.footer{left:38px;right:38px;bottom:24px}}
    .page-wrap{width:794px;height:1123px;margin:0 auto 18px}.page{width:794px!important;min-height:1123px!important;margin:0!important;padding:38px!important;transform-origin:top left}.header{margin:-38px -38px 26px!important;padding:36px 38px 22px!important}.flag{height:7px!important}.grid,.notes{grid-template-columns:1fr 1fr!important;gap:18px!important}.footer{left:38px!important;right:38px!important;bottom:24px!important;flex-direction:row!important;font-size:11px!important}@media screen and (max-width:860px){.page-wrap{width:calc(100vw - 24px);height:calc(1123px * ((100vw - 24px) / 794));margin:0 auto 18px}.page{transform:scale(calc((100vw - 24px) / 794))}}@media print{*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.page-wrap{width:794px;height:auto;margin:0}.page{transform:none!important;box-shadow:none!important;page-break-after:always}}
  </style></head><body><div class="toolbar"><button onclick="window.print()">Imprimer / enregistrer en PDF</button></div>${pages}<script>window.addEventListener('load',()=>{document.querySelectorAll('.footer strong').forEach(el=>{el.textContent=el.textContent.replace(/\\s+.{0,3}Document\\s+\\d+\\/\\d+$/,'')});setTimeout(()=>window.print(),300)});</script></body></html>`;

  const win = window.open('', '_blank', 'width=900,height=1200');
  if (!win) {
    toast.error('Ouverture du PDF bloquée par le navigateur. Autorisez les popups pour télécharger/imprimer.');
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
}

/* Construit le document imprimable/téléchargeable à partir des VRAIES données de la
   facture (émetteur identique à l'admin + identité réelle du membre connecté), pour
   que le PDF côté membre soit strictement identique à celui généré côté admin (même
   structure, mêmes champs) — remplace l'ancien PDF pdfkit backend qui divergeait. */
function buildMemberInvoicePdfDoc(invoice: MemberInvoiceDoc): InvoicePdfDocument {
  const identity = invoice.viewerIdentity;
  return {
    association: initialAssociation,
    invoiceTitle: invoice.title,
    invoiceNumber: invoice.myRecipient?.invoiceNumber ?? invoice.invoiceNumber,
    recipient: {
      name: identity?.name || 'Membre SALAM',
      email: identity?.email ?? '',
      phone: identity?.phone ?? '',
      address: identity?.address ?? '',
      memberId: identity?.memberId,
    },
    lines: [{ id: 1, designation: invoice.description || invoice.title, qty: 1, ht: invoice.amount, vat: 0 }],
    notes: 'Document généré depuis la facture enregistrée.',
    legal: 'Association SALAM — document généré électroniquement.',
    dueDate: invoice.dueDate,
  };
}

export function printMemberInvoice(invoice: MemberInvoiceDoc) {
  openInvoicePdfBatch([buildMemberInvoicePdfDoc(invoice)]);
}
