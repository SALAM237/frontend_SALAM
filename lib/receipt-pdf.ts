import type { ReceiptDoc } from '@/lib/api/receipts';
import { formatFullName } from '@/lib/format-name';
import { usePdfLogoStore } from '@/store/pdf-logo.store';

const RECEIPT_ASSOCIATION_BASE = {
  name: 'ASSOCIATION SALAM',
  title: 'SALAM Cameroun · Maroc',
  address: "Adresse de l'association",
  registration: "N° d'immatriculation : SALAM-CMR-2026",
  email: 'contact@salam-cameroun.com',
  phone: '+237 000 000 000',
};

/* Logo TOUJOURS celui configuré centralement (Admin > Compte, store partagé
   synchronisé par PdfLogoSync) — identique entre reçu admin et reçu membre. */
function receiptAssociation() {
  return { ...RECEIPT_ASSOCIATION_BASE, logoUrl: usePdfLogoStore.getState().logoUrl };
}

function fmt(dateStr?: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatCfa(amount?: number) {
  return `${Number(amount ?? 0).toLocaleString('fr-FR')} F.CFA`;
}

function escReceipt(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* Reçu A4 imprimable/téléchargeable (impression navigateur → "Enregistrer en PDF")
   pour UNE tranche (ou un paiement intégral) — avec tampon "ANNULÉ" superposé en
   grand si le reçu a été annulé côté admin. Partagé entre la vue membre
   (app/member/cotisations-annuelles) et la vue admin (app/admin/facturation). */
export function downloadReceiptPdf(
  receipt: ReceiptDoc,
  user: { firstName: string; lastName: string; memberNumber?: string | null },
  resteAPayerOverride?: number,
) {
  const RECEIPT_ASSOCIATION = receiptAssociation();
  const memberName = formatFullName(user.firstName, user.lastName);
  const memberId = user.memberNumber ?? '-';
  const paidAt = fmt(receipt.paidAt);
  const designation = receipt.trancheIndex != null
    ? `${RECEIPT_TYPE_TITLE[receipt.type]} ${receipt.year} — Tranche ${receipt.trancheIndex + 1}`
    : `${RECEIPT_TYPE_TITLE[receipt.type]} ${receipt.year}`;
  const isCancelled = receipt.status === 'cancelled';
  /* Le solde restant est figé sur le reçu au moment de son édition (receipt.resteAPayer) —
     il ne doit jamais être recalculé après coup avec la mise à jour du solde de la dette.
     Le paramètre resteAPayerOverride n'existe que pour compatibilité ascendante. */
  const resteAPayer = resteAPayerOverride !== undefined ? resteAPayerOverride : receipt.resteAPayer ?? undefined;
  const previousTranches = receipt.previousTranches ?? [];
  const html = `
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>${escReceipt(receipt.receiptNumber)}</title>
  <style>
    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { margin: 0; background: #e5e7eb; font-family: Arial, sans-serif; color: #0f172a; font-size: clamp(10px, 1.45vw, 13px); }
    .page { width: min(100vw, 794px); min-height: min(1123px, calc(100vw * 1.414)); margin: 0 auto; background: white; padding: clamp(22px, 4.8vw, 42px); position: relative; overflow: hidden; }
    .flag { position: absolute; left: 0; right: 0; top: 0; height: clamp(4px, .8vw, 7px); background: linear-gradient(90deg,#0B8F3A 0 33%,#C8102E 33% 66%,#F7C600 66%); }
    .header { margin: calc(clamp(22px, 4.8vw, 42px) * -1) calc(clamp(22px, 4.8vw, 42px) * -1) clamp(18px, 3vw, 28px); padding: clamp(32px, 5vw, 42px) clamp(22px, 4.8vw, 42px) clamp(18px, 3vw, 26px); background: linear-gradient(135deg,#087348,#075f41 62%,#043d2d); color: white; }
    .eyebrow { color: #fde68a; font-size: clamp(8px, 1.6vw, 11px); font-weight: 800; letter-spacing: .2em; text-transform: uppercase; }
    h1 { margin: clamp(8px, 2vw, 12px) 0 5px; font-size: clamp(22px, 5vw, 31px); line-height: 1; }
    .muted { color: #64748b; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
    .card { border: 1px solid #e5e7eb; border-radius: 18px; padding: 22px; background: #fff; }
    .card h2 { margin: 0 0 14px; font-size: 12px; letter-spacing: .16em; text-transform: uppercase; color: #64748b; }
    table { width: 100%; border-collapse: collapse; margin-top: 24px; font-size: 13px; }
    th { background: #0f172a; color: white; text-align: left; padding: 12px 10px; font-size: 10px; letter-spacing: .12em; text-transform: uppercase; }
    td { border-bottom: 1px solid #eef2f7; padding: 12px 10px; }
    .right { text-align: right; }
    .paid { display: inline-flex; align-items:center; justify-content:center; border: 2px solid #059669; color: #047857; border-radius: 999px; padding: 10px 28px; font-weight: 900; letter-spacing: .18em; margin: 26px auto; }
    .thanks { margin-top: 24px; border: 1px solid #bbf7d0; background: #f0fdf4; border-radius: 18px; padding: 20px; color: #047857; font-weight: 700; line-height: 1.6; }
    .footer { position: absolute; left: 48px; right: 48px; bottom: 30px; border-top: 1px solid #e5e7eb; padding-top: 14px; text-align: center; color: #64748b; font-size: 11px; }
    .stamp { position: absolute; top: 42%; left: 50%; transform: translate(-50%,-50%) rotate(-18deg); font-size: 96px; font-weight: 900; letter-spacing: .1em; color: rgba(220,38,38,.35); border: 10px solid rgba(220,38,38,.35); border-radius: 24px; padding: 10px 40px; z-index: 20; pointer-events: none; }
    .logo { width: 44px; height: 44px; border-radius: 12px; background: rgba(255,255,255,.15); display: inline-flex; align-items: center; justify-content: center; overflow: hidden; vertical-align: middle; margin-right: 10px; }
    .logo img { width: 100%; height: 100%; object-fit: cover; }
    .recap-row td { color: #64748b; font-size: 12px; }
    @media print { body { background: white; font-size: 12px; } .page { width: 794px; min-height: 1123px; margin: 0; padding: 38px; } .header { margin: -38px -38px 26px; padding: 40px 38px 24px; } }
  </style>
</head>
<body>
  <div class="page">
    <div class="flag"></div>
    ${isCancelled ? '<div class="stamp">ANNULÉ</div>' : ''}
    <header class="header">
      <div class="eyebrow"><span class="logo"><img src="${RECEIPT_ASSOCIATION.logoUrl}" alt="Logo SALAM" /></span>${escReceipt(RECEIPT_ASSOCIATION.name)}</div>
      <p style="color:rgba(255,255,255,.72)">Solidaire Associative des Lauréats du Maroc</p>
      <h1>Reçu de paiement</h1>
      <p style="color:rgba(255,255,255,.72)">${escReceipt(receipt.receiptNumber)} · ${escReceipt(paidAt)}</p>
    </header>
    <section class="grid">
      <div class="card">
        <h2>Émetteur</h2>
        <strong>${escReceipt(RECEIPT_ASSOCIATION.title)}</strong>
        <p class="muted">${escReceipt(RECEIPT_ASSOCIATION.address)}</p>
        <p class="muted">${escReceipt(RECEIPT_ASSOCIATION.registration)}</p>
        <p class="muted">${escReceipt(RECEIPT_ASSOCIATION.email)} · ${escReceipt(RECEIPT_ASSOCIATION.phone)}</p>
      </div>
      <div class="card">
        <h2>Membre</h2>
        <strong>${escReceipt(memberName)}</strong>
        <p class="muted">N° membre : ${escReceipt(memberId)}</p>
        ${receipt.invoiceNumber ? `<p class="muted">Facture : ${escReceipt(receipt.invoiceNumber)}</p>` : ''}
        ${receipt.reference ? `<p class="muted">Référence : ${escReceipt(receipt.reference)}</p>` : ''}
      </div>
    </section>
    <div style="text-align:center"><span class="paid">${isCancelled ? 'ANNULÉ' : 'PAYÉ'}</span></div>
    <table>
      <thead><tr><th>Reçu</th><th>Désignation</th><th>Date de paiement</th><th class="right">Montant payé</th></tr></thead>
      <tbody>
        ${previousTranches.length ? [...previousTranches].sort((a, b) => (a.trancheIndex ?? 0) - (b.trancheIndex ?? 0)).map(t => `
        <tr class="recap-row">
          <td>${escReceipt(t.receiptNumber)}</td>
          <td>${escReceipt(RECEIPT_TYPE_TITLE[receipt.type])} ${escReceipt(receipt.year)}${t.trancheIndex != null ? ` — Tranche ${t.trancheIndex + 1}` : ''}</td>
          <td>${escReceipt(fmt(t.paidAt))}</td>
          <td class="right">${escReceipt(formatCfa(t.amount))}</td>
        </tr>`).join('') : ''}
        <tr>
          <td>${escReceipt(receipt.receiptNumber)}</td>
          <td>${escReceipt(designation)}</td>
          <td>${escReceipt(paidAt)}</td>
          <td class="right"><strong>${escReceipt(formatCfa(receipt.amount))}</strong></td>
        </tr>
        ${resteAPayer !== undefined ? `
        <tr>
          <td colspan="3" class="muted">Reste à payer (cotisation ${escReceipt(receipt.year)})</td>
          <td class="right"><strong>${escReceipt(formatCfa(resteAPayer))}</strong></td>
        </tr>` : ''}
      </tbody>
    </table>
    ${receipt.modifiedAt ? `<p class="muted" style="margin-top:12px;font-size:11px;">Ce reçu a été modifié le ${escReceipt(fmt(receipt.modifiedAt))}.</p>` : ''}
    ${receipt.notes ? `<div class="card" style="margin-top:24px"><h2>Commentaire</h2><p class="muted">${escReceipt(receipt.notes)}</p></div>` : ''}
    <div class="thanks">Merci pour votre engagement au sein de SALAM. Votre contribution annuelle soutient les actions d'orientation, de solidarité et d'insertion portées par l'association.</div>
    <footer class="footer">${escReceipt(RECEIPT_ASSOCIATION.title)} · ${escReceipt(RECEIPT_ASSOCIATION.email)} · ${escReceipt(RECEIPT_ASSOCIATION.phone)} · ${escReceipt(RECEIPT_ASSOCIATION.registration)}</footer>
  </div>
  <script>window.addEventListener('load', () => setTimeout(() => window.print(), 250));</script>
</body>
</html>`;
  const win = window.open('', '_blank', 'width=900,height=1200');
  if (!win) return;
  win.document.write(html);
  win.document.close();
}

const RECEIPT_TYPE_TITLE: Record<ReceiptDoc['type'], string> = {
  cotisation: "Frais d'adhésion",
  cotisation_annuelle: 'Cotisation annuelle',
};
