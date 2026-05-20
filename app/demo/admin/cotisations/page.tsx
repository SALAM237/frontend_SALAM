'use client';

import { useMemo, useState } from 'react';
import {
  AlertTriangle, Bell, CalendarDays, CheckCircle2, ChevronDown, Eye,
  History, Loader2, Search, Send, Settings2, ShieldOff, Upload, X, XCircle,
} from 'lucide-react';
import { DemoPortalShell } from '../../_components/DemoShell';
import { demoMembers } from '@/data/demo/demo-members';
import { formatFullName, formatInitials } from '@/lib/format-name';

type CotisationStatus = 'paid' | 'unpaid' | 'exempt';

type MemberRow = {
  userId: string;
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
  status: CotisationStatus;
  paidAt?: string;
  reference?: string;
};

const YEARS = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

const STATUS_CONFIG: Record<CotisationStatus, { dot: string; badge: string; label: string; icon: React.ReactNode }> = {
  paid: { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Paye', icon: <CheckCircle2 size={11} /> },
  unpaid: { dot: 'bg-red-500', badge: 'bg-red-50 text-red-700 border-red-200', label: 'Non paye', icon: <XCircle size={11} /> },
  exempt: { dot: 'bg-emerald-900', badge: 'bg-emerald-950/10 text-emerald-900 border-emerald-900/25', label: 'Exempte', icon: <ShieldOff size={11} /> },
};

const REMINDER_OPTIONS = [
  { value: 'off', label: 'Desactive' },
  { value: '30', label: '30 jours avant' },
  { value: '15', label: '15 jours avant' },
  { value: '7', label: '7 jours avant' },
];

function fmt(dateStr?: string | null) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function SettingsPanel({ year, deadline, setDeadline }: { year: number; deadline: string; setDeadline: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [reminder, setReminder] = useState('off');
  const [saved, setSaved] = useState(false);
  const [sent, setSent] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
      <button onClick={() => setOpen(v => !v)} className="flex w-full items-center justify-between px-5 py-4 transition hover:bg-neutral-50/60">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100">
            <Settings2 size={15} className="text-neutral-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-black text-neutral-900">Parametres des cotisations {year}</p>
            <p className="text-[11px] text-neutral-500">Date limite - Relances automatiques</p>
          </div>
        </div>
        <ChevronDown size={16} className={`text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="space-y-5 border-t border-neutral-100 px-5 pb-5 pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Date limite de paiement</label>
              <div className="relative">
                <CalendarDays size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Programmer les relances</label>
              <div className="relative">
                <Bell size={13} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <select value={reminder} onChange={e => setReminder(e.target.value)} className="w-full appearance-none rounded-xl border border-neutral-200 bg-white py-2.5 pl-9 pr-9 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15">
                  {REMINDER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2400); }} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98]">
              {saved ? 'Enregistre' : 'Enregistrer les parametres'}
            </button>
            <button onClick={() => { setSent(true); setTimeout(() => setSent(false), 2400); }} className="flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-black text-orange-700 transition hover:bg-orange-100 active:scale-[0.98]">
              {sent ? <CheckCircle2 size={14} /> : <Send size={14} />}
              Relancer tous maintenant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ReceiptModal({ member, year, onClose }: { member: MemberRow; year: number; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200">
        <div className="relative px-6 py-5" style={{ background: 'linear-gradient(135deg, #065f46 0%, #064e3b 60%, #022c22 100%)' }}>
          <div className="absolute left-0 top-0 h-[3px] w-full" style={{ background: 'linear-gradient(90deg, #0B8F3A 33%, #C8102E 33%, #C8102E 66%, #F7C600 66%)' }} />
          <button onClick={onClose} className="absolute right-4 top-4 text-white/40 hover:text-white/80"><X size={16} /></button>
          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-emerald-400/70">Association SALAM</p>
          <p className="mt-1 text-lg font-black text-white">Recu de cotisation</p>
          <p className="mt-0.5 font-mono text-[11px] text-white/50">SALAM-RECU-{year}-{member.userId.slice(-4).toUpperCase()}</p>
        </div>
        <div className="flex justify-center border-b border-neutral-100 py-4">
          <div className="flex items-center gap-2 rounded-full border-2 border-emerald-500 px-5 py-1.5">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span className="text-sm font-black tracking-[0.18em] text-emerald-700">PAYE</span>
          </div>
        </div>
        <div className="space-y-3 px-6 py-4">
          {[
            ['Adherent', formatFullName(member.firstName, member.lastName)],
            ['No membre', member.memberId],
            ['Annee', String(year)],
            ['Montant', '30,00 EUR'],
            ['Date de paiement', fmt(member.paidAt)],
            ['Reference', member.reference ?? 'DEMO-REF'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-400">{label}</span>
              <span className="text-xs font-black text-neutral-900">{value}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-neutral-100 px-6 py-4">
          <p className="text-center text-[10px] text-neutral-400">Recu fictif, aucune donnee n'est envoyee.</p>
          <button onClick={onClose} className="mt-3 w-full rounded-xl bg-neutral-900 py-2.5 text-sm font-black text-white transition hover:bg-neutral-800">Fermer</button>
        </div>
      </div>
    </div>
  );
}

function PaymentModal({ member, onConfirm, onClose }: { member: MemberRow; onConfirm: (data: { paidAt: string; reference: string }) => void; onClose: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const [paidAt, setPaidAt] = useState(today);
  const [reference, setReference] = useState('');
  const [filename, setFilename] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200">
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <div>
            <h3 className="font-black text-neutral-900">Confirmer le paiement</h3>
            <p className="mt-0.5 text-xs text-neutral-500">{formatFullName(member.firstName, member.lastName)} - {member.memberId}</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100"><X size={16} /></button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Date de paiement recu <span className="text-red-500">*</span></label>
            <div className="relative">
              <CalendarDays size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input type="date" value={paidAt} max={today} onChange={e => setPaidAt(e.target.value)} className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-9 pr-4 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Reference <span className="font-normal normal-case text-neutral-300">(optionnel)</span></label>
            <input value={reference} onChange={e => setReference(e.target.value)} placeholder="Ex: VIR-BNP-0215" className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-neutral-300 transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Justificatif <span className="font-normal normal-case text-neutral-300">(optionnel)</span></label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-3 transition-all hover:border-emerald-300 hover:bg-emerald-50/30">
              <Upload size={15} className="shrink-0 text-neutral-400" />
              <span className="flex-1 truncate text-sm text-neutral-500">{filename || 'Selectionner un fichier...'}</span>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => { if (e.target.files?.[0]) setFilename(e.target.files[0].name); }} className="sr-only" />
              {filename && <button type="button" onClick={() => setFilename('')} className="text-neutral-300 hover:text-neutral-600"><X size={12} /></button>}
            </label>
            <p className="text-[10px] text-neutral-400">PDF, JPG ou PNG - max 5 Mo</p>
          </div>
          <div className="flex gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
            <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-500" />
            <p className="text-[11px] leading-relaxed text-amber-700">En mode demo, le recu est simule et aucun email n'est envoye.</p>
          </div>
        </div>
        <div className="flex gap-3 border-t border-neutral-100 px-6 py-4">
          <button onClick={onClose} className="flex-1 rounded-xl border border-neutral-200 bg-white py-2.5 text-sm font-semibold text-neutral-600 transition hover:border-neutral-300">Annuler</button>
          <button onClick={() => onConfirm({ paidAt, reference })} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98]">Confirmer le paiement</button>
        </div>
      </div>
    </div>
  );
}

export default function DemoAdminCotisationsPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [deadline, setDeadline] = useState(`${new Date().getFullYear()}-03-31`);
  const [search, setSearch] = useState('');
  const [showLogs, setShowLogs] = useState(false);
  const [modal, setModal] = useState<MemberRow | null>(null);
  const [receiptFor, setReceiptFor] = useState<MemberRow | null>(null);
  const [reminderSentId, setReminderSentId] = useState<string | null>(null);

  const [members, setMembers] = useState<MemberRow[]>(() => demoMembers.map((member, index) => ({
    userId: member._id,
    memberId: member.memberId,
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    status: index === 1 ? 'unpaid' : index === 3 ? 'exempt' : 'paid',
    paidAt: index === 1 ? undefined : '2026-02-18T12:00:00.000Z',
    reference: index === 1 ? undefined : `DEMO-${1000 + index}`,
  })));

  const filtered = useMemo(() => members.filter(m => `${m.firstName} ${m.lastName} ${m.memberId} ${m.email}`.toLowerCase().includes(search.toLowerCase())), [members, search]);
  const stats = useMemo(() => ({
    total: members.length,
    paid: members.filter(m => m.status === 'paid').length,
    unpaid: members.filter(m => m.status === 'unpaid').length,
    exempt: members.filter(m => m.status === 'exempt').length,
  }), [members]);

  const handleStatusChange = (member: MemberRow, newStatus: CotisationStatus) => {
    if (newStatus === 'paid') {
      setModal(member);
      return;
    }
    setMembers(prev => prev.map(m => m.userId === member.userId ? { ...m, status: newStatus, paidAt: undefined, reference: undefined } : m));
  };

  const confirmPayment = (data: { paidAt: string; reference: string }) => {
    if (!modal) return;
    setMembers(prev => prev.map(m => m.userId === modal.userId ? { ...m, status: 'paid', paidAt: data.paidAt, reference: data.reference || 'DEMO-REF' } : m));
    setModal(null);
  };

  const triggerReminder = (member: MemberRow) => {
    setReminderSentId(member.userId);
    setTimeout(() => setReminderSentId(null), 2200);
  };

  return (
    <DemoPortalShell type="admin" title="Frais d'adhesion">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Frais d&apos;adhesion</h1>
            <p className="mt-1 text-sm text-neutral-500">Gerer les cotisations des membres actifs.</p>
          </div>
          <div className="relative">
            <select value={year} onChange={e => setYear(Number(e.target.value))} className="h-10 appearance-none rounded-xl border border-neutral-200 bg-white pl-4 pr-9 text-sm font-black text-neutral-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15">
              {YEARS.map(y => <option key={y} value={y}>Annee {y}</option>)}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          </div>
        </div>

        <SettingsPanel year={year} deadline={deadline} setDeadline={setDeadline} />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total membres', value: stats.total, color: 'text-neutral-900', bg: 'bg-neutral-50 border-neutral-100' },
            { label: 'Payes', value: stats.paid, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
            { label: 'Non payes', value: stats.unpaid, color: 'text-red-700', bg: 'bg-red-50 border-red-100' },
            { label: 'Exemptes', value: stats.exempt, color: 'text-emerald-900', bg: 'bg-green-900/5 border-green-900/10' },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl border p-4 ${s.bg}`}>
              <p className={`text-2xl font-black leading-none ${s.color}`}>{s.value}</p>
              <p className="mt-1.5 text-xs font-semibold text-neutral-500">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un adherent..." className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-4 text-sm outline-none placeholder:text-neutral-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" />
        </div>

        <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
          <div className="border-b border-neutral-100 px-5 py-3.5">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-neutral-500">{filtered.length} adherent{filtered.length > 1 ? 's' : ''}</p>
          </div>
          <div className="divide-y divide-neutral-50">
            {filtered.length === 0 && <div className="px-5 py-10 text-center text-sm text-neutral-400">Aucun adherent trouve.</div>}
            {filtered.map(member => {
              const cfg = STATUS_CONFIG[member.status];
              return (
                <div key={member.userId} className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-neutral-50/60">
                  <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${cfg.dot} shadow-sm`} />
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-xs font-black text-white">
                    {formatInitials(member.firstName, member.lastName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-neutral-900">{formatFullName(member.firstName, member.lastName)}</p>
                    <p className="font-mono text-[11px] text-neutral-400">{member.memberId}</p>
                  </div>
                  <div className="hidden w-28 text-right sm:block">
                    {member.status === 'paid' ? <span className="text-xs font-semibold text-neutral-600">{fmt(member.paidAt)}</span> : <span className="text-xs text-neutral-300">-</span>}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {member.status === 'unpaid' && (
                      <button onClick={() => triggerReminder(member)} title="Envoyer une relance" className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${reminderSentId === member.userId ? 'border-orange-200 bg-orange-50 text-orange-500' : 'border-neutral-200 bg-white text-neutral-400 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600'}`}>
                        {reminderSentId === member.userId ? <Loader2 size={13} className="animate-spin" /> : <Bell size={13} />}
                      </button>
                    )}
                    {member.status === 'paid' && (
                      <button onClick={() => setReceiptFor(member)} title="Voir le recu" className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-400 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600">
                        <Eye size={13} />
                      </button>
                    )}
                  </div>
                  <div className="relative shrink-0">
                    <select value={member.status} onChange={e => handleStatusChange(member, e.target.value as CotisationStatus)} className={`h-8 cursor-pointer appearance-none rounded-full border pl-3 pr-7 text-[11px] font-black outline-none ${cfg.badge}`}>
                      <option value="unpaid">Non paye</option>
                      <option value="paid">Paye</option>
                      <option value="exempt">Exempte</option>
                    </select>
                    <ChevronDown size={11} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 opacity-60" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button onClick={() => setShowLogs(v => !v)} className="flex w-full items-center justify-between rounded-2xl border border-neutral-100 bg-white px-5 py-4 shadow-sm transition hover:border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100">
              <History size={15} className="text-neutral-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-black text-neutral-900">Historique des modifications</p>
              <p className="text-[11px] text-neutral-500">3 entrees</p>
            </div>
          </div>
          <ChevronDown size={16} className={`text-neutral-400 transition-transform ${showLogs ? 'rotate-180' : ''}`} />
        </button>

        {showLogs && (
          <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
            <div className="divide-y divide-neutral-50">
              {members.slice(0, 3).map((member, index) => (
                <div key={member.userId} className="flex items-start gap-4 px-5 py-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-[10px] font-black text-white">ND</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-neutral-700"><span className="font-black text-neutral-900">Nadia Diallo</span><span className="mx-1 text-neutral-400">-</span><span className="text-[11px] text-neutral-400">Tresoriere</span></p>
                    <p className="mt-0.5 text-xs text-neutral-600">{formatFullName(member.firstName, member.lastName)} - Annee {year}</p>
                    <p className="mt-0.5 text-[11px] text-neutral-400">Non paye vers {index === 0 ? 'Paye' : 'Exempte'}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[11px] font-semibold text-neutral-500">18 mai 2026</p>
                    <p className="text-[10px] text-neutral-400">10h2{index}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {modal && <PaymentModal member={modal} onConfirm={confirmPayment} onClose={() => setModal(null)} />}
        {receiptFor && <ReceiptModal member={receiptFor} year={year} onClose={() => setReceiptFor(null)} />}
      </div>
    </DemoPortalShell>
  );
}
