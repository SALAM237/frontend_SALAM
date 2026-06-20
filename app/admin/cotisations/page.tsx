'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronDown, Search, CheckCircle2, XCircle, ShieldOff,
  CalendarDays, History, X, Upload, AlertTriangle,
  Eye, Settings2, Send, Loader2, Edit3, Download,
  Trash2,
} from 'lucide-react';
import {
  useAdminCotisations, useUpdateCotisationStatus, useDeleteCotisation, useSendReminders, useCotisationLogs,
  useResendCotisationReceipt,
  type CotisationStatus, type AdminCotisationRow,
} from '@/lib/api/cotisations';
import type { AuditLogDoc } from '@/lib/api/audit-logs';
import { formatFullName, formatInitials } from '@/lib/format-name';
import { memberAvatarBorderClass, memberInitialsClass, memberPhotoUrl } from '@/lib/avatar';

/* ─── Types locaux (UI only) ────────────────────────────── */
interface MemberRow {
  userId: string;
  cotisationId?: string;
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
  status: CotisationStatus;
  paidAt?: string;
  reference?: string;
  notes?: string;
  amount: number;
  gender?: 'homme' | 'femme';
  avatar?: string | null;
  bureauPhoto?: string | null;
}

const YEARS = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

const REMINDER_OPTIONS = [
  { value: 'off', label: 'Désactivé' },
  { value: '30',  label: '30 jours avant' },
  { value: '15',  label: '15 jours avant' },
  { value: '7',   label: '7 jours avant' },
];

/* ─── Helpers ────────────────────────────────────────────── */
const STATUS_CONFIG: Record<CotisationStatus, { dot: string; badge: string; label: string; icon: React.ReactNode }> = {
  paid:   { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',        label: 'Payé',     icon: <CheckCircle2 size={11} /> },
  unpaid: { dot: 'bg-red-500',     badge: 'bg-red-50 text-red-700 border-red-200',                    label: 'Non payé', icon: <XCircle size={11} />     },
  exempt: { dot: 'bg-emerald-900', badge: 'bg-emerald-950/10 text-emerald-900 border-emerald-900/25', label: 'Exempté',  icon: <ShieldOff size={11} />   },
};

function fmt(dateStr?: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h'),
  };
}

function logDetails(log: AuditLogDoc): string {
  const d = log.details ?? log.meta ?? {};
  const parts: string[] = [];
  if (d.memberName) parts.push(String(d.memberName));
  if (d.year)       parts.push(`Année ${d.year}`);
  if (d.reference)  parts.push(`Réf. ${d.reference}`);
  if (d.sent)       parts.push(`${d.sent} envoyé(s)`);
  return parts.join(' — ') || log.action;
}

function mapRows(data: AdminCotisationRow[], year: number): MemberRow[] {
  return data.map(r => ({
    userId:       String(r.user._id),
    cotisationId: r.cotisation._id,
    memberId:     r.user.memberNumber ?? `SALAM-${year}-${String(r.user._id).slice(-4).toUpperCase()}`,
    firstName:    r.user.firstName,
    lastName:     r.user.lastName,
    email:        r.user.email,
    gender:       r.user.gender,
    avatar:       r.user.avatar,
    bureauPhoto:  r.user.bureauPhoto,
    status:       r.cotisation.status,
    amount:       r.cotisation.amount,
    paidAt:       r.cotisation.paidAt,
    reference:    r.cotisation.reference,
    notes:        r.cotisation.notes,
  }));
}

function formatCfa(amount?: number) {
  return `${Number(amount ?? 0).toLocaleString('fr-FR')} F.CFA`;
}

const RECEIPT_ASSOCIATION = {
  name: 'ASSOCIATION SALAM',
  title: 'SALAM Cameroun · Maroc',
  address: 'Adresse de l’association',
  registration: 'N° d’immatriculation : SALAM-CMR-2026',
  email: 'contact@salam-cameroun.com',
  phone: '+237 000 000 000',
};

function escReceipt(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function openPaymentReceiptPdf(member: MemberRow, year: number) {
  const receiptNum = member.cotisationId
    ? `SALAM-RECU-${year}-${member.cotisationId.slice(-6).toUpperCase()}`
    : `SALAM-RECU-${year}-${member.userId.slice(-4).toUpperCase()}`;
  const invoiceNum = `SALAM-ADH-${year}-${member.userId.slice(-4).toUpperCase()}`;
  const memberName = formatFullName(member.firstName, member.lastName);
  const paidAt = fmt(member.paidAt);
  const html = `
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>${escReceipt(receiptNum)}</title>
  <style>
    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; }
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
    @media print { body { background: white; font-size: 12px; } .page { width: 794px; min-height: 1123px; margin: 0; padding: 38px; } .header { margin: -38px -38px 26px; padding: 40px 38px 24px; } }
  </style>
</head>
<body>
  <div class="page">
    <div class="flag"></div>
    <header class="header">
      <div class="eyebrow">${escReceipt(RECEIPT_ASSOCIATION.name)}</div>
      <p style="color:rgba(255,255,255,.72)">Solidaire Associative des Lauréats du Maroc</p>
      <h1>Reçu de paiement</h1>
      <p style="color:rgba(255,255,255,.72)">${escReceipt(receiptNum)} · ${escReceipt(paidAt)}</p>
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
        <p class="muted">${escReceipt(member.email)}</p>
        <p class="muted">N° membre : ${escReceipt(member.memberId)}</p>
        ${member.reference ? `<p class="muted">Référence : ${escReceipt(member.reference)}</p>` : ''}
      </div>
    </section>
    <div style="text-align:center"><span class="paid">PAYÉ</span></div>
    <table>
      <thead><tr><th>Facture</th><th>Désignation</th><th>Date d'émission</th><th class="right">Montant payé</th></tr></thead>
      <tbody>
        <tr>
          <td>${escReceipt(invoiceNum)}</td>
          <td>Frais d'adhésion annuelle ${escReceipt(year)}</td>
          <td>${escReceipt(paidAt)}</td>
          <td class="right"><strong>${escReceipt(formatCfa(member.amount))}</strong></td>
        </tr>
      </tbody>
    </table>
    ${member.notes ? `<div class="card" style="margin-top:24px"><h2>Commentaire</h2><p class="muted">${escReceipt(member.notes)}</p></div>` : ''}
    <div class="thanks">Merci pour votre engagement au sein de SALAM. Votre contribution soutient les actions d'orientation, de solidarité et d'insertion portées par l'association.</div>
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


/* ─── Loading skeleton ───────────────────────────────────── */
function Skeleton() {
  return (
    <div className="divide-y divide-neutral-50">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="h-2.5 w-2.5 rounded-full bg-neutral-100" />
          <div className="h-9 w-9 rounded-full bg-neutral-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 rounded bg-neutral-100" />
            <div className="h-2 w-24 rounded bg-neutral-50" />
          </div>
          <div className="h-7 w-24 rounded-full bg-neutral-100" />
        </div>
      ))}
    </div>
  );
}

/* ─── Settings panel ──────────────────────────────────────── */
function SettingsPanel({ year, deadline, setDeadline }: {
  year: number;
  deadline: string;
  setDeadline: (v: string) => void;
}) {
  const [open,     setOpen]     = useState(false);
  const [reminder, setReminder] = useState('off');
  const [saved,    setSaved]    = useState(false);
  const sendReminders = useSendReminders();

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const handleRelance = () => {
    sendReminders.mutate({ year, dueDate: deadline || undefined });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
      <button onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 transition hover:bg-neutral-50/60 sm:px-5 sm:py-4">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
            <Settings2 size={15} className="text-neutral-600" />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-sm font-black text-neutral-900">Paramètres des cotisations {year}</p>
            <p className="text-[11px] text-neutral-500">Date limite · Relances automatiques</p>
          </div>
        </div>
        <ChevronDown size={16} className={`text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="space-y-4 border-t border-neutral-100 px-4 pb-4 pt-4 sm:space-y-5 sm:px-5 sm:pb-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Date limite de paiement</label>
              <div className="relative">
                <CalendarDays size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Programmer les relances</label>
              <div className="relative">
                <Send size={13} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <select value={reminder} onChange={e => setReminder(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-neutral-200 bg-white py-2.5 pl-9 pr-9 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15">
                  {REMINDER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <button onClick={handleSave}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98] sm:text-sm">
              {saved ? 'Enregistré ✓' : 'Enregistrer les paramètres'}
            </button>
            <button onClick={handleRelance} disabled={sendReminders.isPending}
              className="flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-black text-orange-700 transition hover:bg-orange-100 active:scale-[0.98] disabled:opacity-60 sm:text-sm">
              {sendReminders.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Relancer tous maintenant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Receipt modal ───────────────────────────────────────── */
function ReceiptModal({ member, year, onClose }: { member: MemberRow; year: number; onClose: () => void }) {
  const resendReceipt = useResendCotisationReceipt();
  const receiptNum = member.cotisationId
    ? `SALAM-RECU-${year}-${member.cotisationId.slice(-6).toUpperCase()}`
    : `SALAM-RECU-${year}-${member.userId.slice(-4).toUpperCase()}`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200">
        <div className="relative px-6 py-5" style={{ background: 'linear-gradient(135deg, #065f46 0%, #064e3b 60%, #022c22 100%)' }}>
          <div className="absolute top-0 left-0 h-[3px] w-full" style={{ background: 'linear-gradient(90deg, #0B8F3A 33%, #C8102E 33%, #C8102E 66%, #F7C600 66%)' }} />
          <button onClick={onClose} className="absolute right-4 top-4 text-white/40 hover:text-white/80"><X size={16} /></button>
          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-emerald-400/70">Association SALAM</p>
          <p className="mt-1 text-lg font-black text-white">Reçu de cotisation</p>
          <p className="text-[11px] text-white/50 font-mono mt-0.5">{receiptNum}</p>
        </div>
        <div className="flex justify-center py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2 rounded-full border-2 border-emerald-500 px-5 py-1.5">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span className="text-sm font-black tracking-[0.18em] text-emerald-700">PAYÉ</span>
          </div>
        </div>
        <div className="px-6 py-4 space-y-3">
          {[
            { label: 'Adhérent',         value: formatFullName(member.firstName, member.lastName) },
            { label: 'N° membre',        value: member.memberId },
            { label: 'Année',            value: String(year) },
            { label: 'Montant',          value: formatCfa(member.amount) },
            { label: 'Date de paiement', value: fmt(member.paidAt) },
            ...(member.reference ? [{ label: 'Référence', value: member.reference }] : []),
            ...(member.notes ? [{ label: 'Commentaire', value: member.notes }] : []),
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-400">{row.label}</span>
              <span className="text-xs font-black text-neutral-900">{row.value}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-neutral-100 px-6 py-4">
          <p className="text-center text-[10px] text-neutral-400">Reçu transmis par email à {member.email}.</p>
          <button onClick={() => openPaymentReceiptPdf(member, year)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-black text-white transition hover:bg-emerald-700">
            <Download size={14} /> Aperçu PDF A4
          </button>
          <button
            onClick={() => resendReceipt.mutate({ userId: member.userId, year })}
            disabled={resendReceipt.isPending || !member.email}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 py-2.5 text-sm font-black text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {resendReceipt.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Renvoyer le recu
          </button>
          <button onClick={onClose}
            className="mt-2 w-full rounded-xl bg-neutral-900 py-2.5 text-sm font-black text-white transition hover:bg-neutral-800">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Payment modal ───────────────────────────────────────── */
function PaymentModal({ member, onConfirm, onClose, loading }: {
  member: MemberRow;
  onConfirm: (data: { paidAt: string; reference: string; notes: string; filename: string }) => void;
  onClose: () => void;
  loading?: boolean;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [paidAt,    setPaidAt]    = useState(member.paidAt ? new Date(member.paidAt).toISOString().slice(0, 10) : today);
  const [reference, setReference] = useState(member.reference ?? '');
  const [notes,     setNotes]     = useState(member.notes ?? '');
  const [filename,  setFilename]  = useState('');
  const [error,     setError]     = useState('');

  const submit = () => {
    if (!paidAt) { setError('La date de paiement est requise.'); return; }
    onConfirm({ paidAt, reference, notes, filename });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200">
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <div>
            <h3 className="font-black text-neutral-900">Confirmer le paiement</h3>
            <p className="text-xs text-neutral-500 mt-0.5">{formatFullName(member.firstName, member.lastName)} · {member.memberId}</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100"><X size={16} /></button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
              Date de paiement reçu <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <CalendarDays size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input type="date" value={paidAt} max={today}
                onChange={e => { setPaidAt(e.target.value); setError(''); }}
                className={`w-full rounded-xl border bg-white py-3 pl-9 pr-4 text-sm outline-none transition-all focus:ring-2 ${error ? 'border-red-300 focus:ring-red-500/15' : 'border-neutral-200 focus:border-emerald-500 focus:ring-emerald-500/15'}`}
              />
            </div>
            {error && <p className="text-[11px] text-red-500">{error}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
              Référence <span className="text-neutral-300 font-normal normal-case">(optionnel)</span>
            </label>
            <input type="text" value={reference} onChange={e => setReference(e.target.value)}
              placeholder="Ex: VIR-BNP-0215, PAYPAL-XXXXX…"
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-neutral-300 transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
              Commentaire <span className="text-neutral-300 font-normal normal-case">(optionnel)</span>
            </label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Virement adressé au trésorier"
              rows={3}
              className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-neutral-300 transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
              Justificatif <span className="text-neutral-300 font-normal normal-case">(optionnel)</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-3 transition-all hover:border-emerald-300 hover:bg-emerald-50/30">
              <Upload size={15} className="shrink-0 text-neutral-400" />
              <span className="flex-1 truncate text-sm text-neutral-500">{filename || 'Sélectionner un fichier…'}</span>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => { if (e.target.files?.[0]) setFilename(e.target.files[0].name); }} className="sr-only" />
              {filename && <button type="button" onClick={() => setFilename('')} className="text-neutral-300 hover:text-neutral-600"><X size={12} /></button>}
            </label>
            <p className="text-[10px] text-neutral-400">PDF, JPG ou PNG · max 5 Mo</p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 flex gap-2">
            <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-500" />
            <p className="text-[11px] leading-relaxed text-amber-700">Un reçu de paiement sera automatiquement envoyé à l&apos;adhérent par email.</p>
          </div>
        </div>
        <div className="flex gap-3 border-t border-neutral-100 px-6 py-4">
          <button onClick={onClose} className="flex-1 rounded-xl border border-neutral-200 bg-white py-2.5 text-sm font-semibold text-neutral-600 transition hover:border-neutral-300">Annuler</button>
          <button onClick={submit} disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-60">
            {loading && <Loader2 size={14} className="animate-spin" />}
            Confirmer le paiement
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Page principale ─────────────────────────────────────── */
export default function CotisationsAdminPage() {
  const [year,       setYear]       = useState(new Date().getFullYear());
  const [deadline,   setDeadline]   = useState(`${new Date().getFullYear()}-03-31`);
  const [search,     setSearch]     = useState('');
  const [showLogs,   setShowLogs]   = useState(false);
  const [modal,      setModal]      = useState<MemberRow | null>(null);
  const [reminderSentId, setReminderSentId] = useState<string | null>(null);

  const { data: rawData, isLoading, isError } = useAdminCotisations(year);
  const { data: logsData, isLoading: logsLoading } = useCotisationLogs();
  const updateStatus = useUpdateCotisationStatus();
  const deleteCotisation = useDeleteCotisation();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const members = useMemo(() => {
    return rawData?.data ? mapRows(rawData.data, year) : [];
  }, [rawData, year]);

  const filtered = useMemo(() =>
    members.filter(m =>
      `${m.firstName} ${m.lastName} ${m.memberId} ${m.email}`
        .toLowerCase().includes(search.toLowerCase())
    ),
  [members, search]);

  const stats = useMemo(() => ({
    total:  members.length,
    paid:   members.filter(m => m.status === 'paid').length,
    unpaid: members.filter(m => m.status === 'unpaid').length,
    exempt: members.filter(m => m.status === 'exempt').length,
  }), [members]);

  const logs = logsData?.data ?? [];

  const handleStatusChange = (member: MemberRow, newStatus: CotisationStatus) => {
    if (newStatus === 'paid') { setModal(member); return; }
    updateStatus.mutate({ userId: member.userId, year, status: newStatus });
  };

  const confirmPayment = (data: { paidAt: string; reference: string; notes: string }) => {
    if (!modal) return;
    const paidMember: MemberRow = { ...modal, status: 'paid', paidAt: data.paidAt, reference: data.reference, notes: data.notes };
    updateStatus.mutate(
      { userId: modal.userId, year, status: 'paid', paidAt: data.paidAt, reference: data.reference, notes: data.notes },
      { onSuccess: () => { setModal(null); setTimeout(() => openPaymentReceiptPdf(paidMember, year), 250); } },
    );
  };

  const sendSingleReminder = useSendReminders();
  const triggerReminder = (member: MemberRow) => {
    setReminderSentId(member.userId);
    sendSingleReminder.mutate(
      { year, userIds: [member.userId] },
      { onSettled: () => setTimeout(() => setReminderSentId(null), 2500) },
    );
  };

  const handleDeleteCotisation = (member: MemberRow) => {
    if (deleteTarget !== member.userId) {
      setDeleteTarget(member.userId);
      setTimeout(() => setDeleteTarget(current => current === member.userId ? null : current), 3000);
      return;
    }
    deleteCotisation.mutate({ userId: member.userId, year }, { onSettled: () => setDeleteTarget(null) });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-4 sm:space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl font-black tracking-[-0.03em] text-neutral-900 sm:text-2xl">Frais d&apos;adhésion</h1>
          <p className="mt-1 text-sm text-neutral-500">Gérer les cotisations des membres actifs.</p>
        </div>
        <div className="relative">
          <select value={year} onChange={e => setYear(Number(e.target.value))}
            className="h-10 appearance-none rounded-xl border border-neutral-200 bg-white pl-4 pr-9 text-sm font-black text-neutral-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15">
            {YEARS.map(y => <option key={y} value={y}>Année {y}</option>)}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        </div>
      </div>

      <SettingsPanel year={year} deadline={deadline} setDeadline={setDeadline} />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total membres', value: stats.total,  color: 'text-neutral-900',  bg: 'bg-neutral-50  border-neutral-100'    },
          { label: 'Payés',         value: stats.paid,   color: 'text-emerald-700',  bg: 'bg-emerald-50  border-emerald-100'    },
          { label: 'Non payés',     value: stats.unpaid, color: 'text-red-700',      bg: 'bg-red-50      border-red-100'        },
          { label: 'Exemptés',      value: stats.exempt, color: 'text-emerald-900',  bg: 'bg-green-900/5 border-green-900/10'   },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-3 sm:p-4 ${s.bg}`}>
            <p className={`text-xl font-black leading-none sm:text-2xl ${s.color}`}>{isLoading ? '…' : s.value}</p>
            <p className="mt-1.5 text-[11px] font-semibold leading-tight text-neutral-500 sm:text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un adhérent…"
          className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-4 text-sm outline-none placeholder:text-neutral-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
        />
      </div>

      {/* Members list */}
      <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
        <div className="border-b border-neutral-100 px-5 py-3.5">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-neutral-500">
            {isLoading ? 'Chargement…' : `${filtered.length} adhérent${filtered.length > 1 ? 's' : ''}`}
          </p>
        </div>

        {isLoading && <Skeleton />}
        {isError && (
          <div className="px-5 py-10 text-center text-sm text-red-500">Erreur de chargement. Vérifiez la connexion au serveur.</div>
        )}
        {!isLoading && !isError && (
          <div className="divide-y divide-neutral-50">
            {filtered.length === 0 && (
              <div className="px-5 py-10 text-center text-sm text-neutral-400">Aucun adhérent trouvé.</div>
            )}
            {filtered.map(member => {
              const cfg = STATUS_CONFIG[member.status];
              const photoUrl = memberPhotoUrl(member);
              return (
                <div key={member.userId} className="flex items-center gap-2 px-3 py-3 transition-colors hover:bg-neutral-50/60 sm:gap-3 sm:px-5 sm:py-4">
                  <div className={`h-2 w-2 shrink-0 rounded-full sm:h-2.5 sm:w-2.5 ${cfg.dot} shadow-sm`} />
                  <Link href={`/admin/adherents/${member.userId}`} className="shrink-0" title="Voir la fiche membre">
                    {photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoUrl} alt={formatFullName(member.firstName, member.lastName)} className={`h-8 w-8 rounded-full border-2 object-cover sm:h-9 sm:w-9 ${memberAvatarBorderClass(member.gender)}`} />
                    ) : (
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-black text-white sm:h-9 sm:w-9 sm:text-xs ${memberInitialsClass(member.gender)}`}>
                        {formatInitials(member.firstName, member.lastName)}
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/admin/adherents/${member.userId}`} className="block truncate text-[13px] font-black text-neutral-900 transition hover:text-emerald-700 sm:text-sm">{formatFullName(member.firstName, member.lastName)}</Link>
                    <p className="truncate font-mono text-[10px] text-neutral-400 sm:text-[11px]">{member.memberId}</p>
                  </div>
                  <div className="hidden w-28 text-right sm:block">
                    {member.status === 'paid'
                      ? <span className="text-xs font-semibold text-neutral-600">{fmt(member.paidAt)}</span>
                      : <span className="text-xs text-neutral-300">—</span>
                    }
                  </div>
                  <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                    {member.status === 'unpaid' && (
                      <button onClick={() => triggerReminder(member)} title="Envoyer une relance"
                        className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                          reminderSentId === member.userId
                            ? 'border-orange-200 bg-orange-50 text-orange-500'
                            : 'border-neutral-200 bg-white text-neutral-400 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600'
                        }`}>
                        {reminderSentId === member.userId ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                      </button>
                    )}
                    {member.status === 'paid' && (
                      <button onClick={() => openPaymentReceiptPdf(member, year)} title="Voir le reçu"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-400 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600">
                        <Eye size={13} />
                      </button>
                    )}
                    {member.status === 'paid' && (
                      <button onClick={() => setModal(member)} title="Modifier le paiement"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-400 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600">
                        <Edit3 size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteCotisation(member)}
                      disabled={deleteCotisation.isPending}
                      title="Supprimer le frais d'adhésion généré"
                      className={`flex h-8 items-center justify-center rounded-lg transition ${
                        deleteTarget === member.userId
                          ? 'w-auto bg-red-500 px-2 text-[10px] font-black text-white'
                          : 'w-8 border border-red-100 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white'
                      } disabled:opacity-50`}
                    >
                      {deleteCotisation.isPending && deleteTarget === member.userId ? <Loader2 size={13} className="animate-spin" /> : deleteTarget === member.userId ? 'Confirmer' : <Trash2 size={13} />}
                    </button>
                  </div>
                  <div className="relative shrink-0">
                    <select value={member.status}
                      onChange={e => handleStatusChange(member, e.target.value as CotisationStatus)}
                      disabled={updateStatus.isPending}
                      className={`h-7 max-w-[6.6rem] appearance-none truncate rounded-full border pl-2.5 pr-6 text-[10px] font-black outline-none cursor-pointer disabled:opacity-60 sm:h-8 sm:max-w-none sm:pl-3 sm:pr-7 sm:text-[11px] ${cfg.badge}`}>
                      <option value="unpaid">Non payé</option>
                      <option value="paid">Payé</option>
                      <option value="exempt">Exempté</option>
                    </select>
                    <ChevronDown size={11} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 opacity-60" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Audit log toggle */}
      <button onClick={() => setShowLogs(v => !v)}
        className="flex w-full items-center justify-between rounded-2xl border border-neutral-100 bg-white px-5 py-4 shadow-sm transition hover:border-neutral-200">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100">
            <History size={15} className="text-neutral-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-black text-neutral-900">Historique des modifications</p>
            <p className="text-[11px] text-neutral-500">{logs.length} entrée{logs.length > 1 ? 's' : ''}</p>
          </div>
        </div>
        <ChevronDown size={16} className={`text-neutral-400 transition-transform ${showLogs ? 'rotate-180' : ''}`} />
      </button>

      {showLogs && (
        <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
          <div className="divide-y divide-neutral-50">
            {logsLoading && (
              <div className="flex justify-center py-8"><Loader2 size={18} className="animate-spin text-neutral-300" /></div>
            )}
            {!logsLoading && logs.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-neutral-400">Aucune modification enregistrée.</p>
            )}
            {logs.map((log: AuditLogDoc) => {
              const d = fmtTime(log.createdAt);
              const details = log.details ?? log.meta ?? {};
              const fromLabel = details.fromLabel as string | undefined;
              const toLabel   = details.toLabel   as string | undefined;
              const adminName = log.adminName ?? 'Système';
              return (
                <div key={log._id} className="flex items-start gap-4 px-5 py-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-[10px] font-black text-white">
                    {adminName.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-700">
                      <span className="font-black text-neutral-900">{adminName}</span>
                      <span className="text-neutral-400 mx-1">·</span>
                      <span className="text-[11px] text-neutral-400">{log.adminRole ?? 'Audit'}</span>
                    </p>
                    <p className="text-xs text-neutral-600 mt-0.5">{logDetails(log)}</p>
                    {fromLabel && toLabel && (
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        {fromLabel} → {toLabel}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[11px] font-semibold text-neutral-500">{d.date}</p>
                    <p className="text-[10px] text-neutral-400">{d.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {modal && (
        <PaymentModal
          member={modal}
          loading={updateStatus.isPending}
          onConfirm={confirmPayment}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
