'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  QrCode, Camera, Search, CheckCircle2, XCircle,
  Clock, Users, ScanLine, AlertCircle,
  UserCheck, Hash, CalendarDays, ChevronLeft, ChevronRight,
} from 'lucide-react';

import { DemoPortalShell } from '../../_components/DemoShell';

const DEMO_ACTIVITIES = [
  { id: 'a1', title: 'Tournoi de la fraternite SALAM', startDate: '2026-06-20' },
  { id: 'a2', title: 'Atelier orientation et carriere', startDate: '2026-07-05' },
  { id: 'a3', title: 'Soiree culturelle Cameroun-Maroc', startDate: '2026-08-12' },
];

const DEMO_SCANS = [
  { id: 's1', name: 'Amina Diallo',     initials: 'AD', num: 'SALAM-2026-014', activity: 'Tournoi de la fraternite SALAM', time: '09:14', date: '20 juin', scanner: 'Nadia Simo' },
  { id: 's2', name: 'Boris Tamko',      initials: 'BT', num: 'SALAM-2026-021', activity: 'Tournoi de la fraternite SALAM', time: '09:22', date: '20 juin', scanner: 'Nadia Simo' },
  { id: 's3', name: 'Youssef Mansouri', initials: 'YM', num: 'SALAM-2026-029', activity: 'Tournoi de la fraternite SALAM', time: '09:38', date: '20 juin', scanner: 'Nadia Simo' },
  { id: 's4', name: 'Sophie Nkolo',     initials: 'SN', num: 'SALAM-2026-007', activity: 'Tournoi de la fraternite SALAM', time: '09:41', date: '20 juin', scanner: 'Nadia Simo' },
];

const LOOKUP_CODES: Record<string, { name: string; initials: string; num: string; status: 'active' | 'pending' }> = {
  'SALAM-2026-014': { name: 'Amina Diallo',     initials: 'AD', num: 'SALAM-2026-014', status: 'active' },
  'SALAM-2026-021': { name: 'Boris Tamko',      initials: 'BT', num: 'SALAM-2026-021', status: 'pending' },
  'SALAM-2026-099': { name: 'Fatima Ouali',     initials: 'FO', num: 'SALAM-2026-099', status: 'active' },
};

const CAURIS_CODE_RE = /^\d{2}[A-Za-z]{2}\d{2}$/;

export default function DemoScannerPage() {
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [lookupResult, setLookupResult] = useState<{ found: boolean; member?: typeof LOOKUP_CODES[string] } | null>(null);
  const [checkinDone, setCheckinDone] = useState(false);
  const [manualActivityError, setManualActivityError] = useState('');

  const selectedActivity = DEMO_ACTIVITIES.find(a => a.id === selectedActivityId);

  const handleLookup = () => {
    if (!manualCode.trim()) return;
    if (!selectedActivityId) {
      setManualActivityError('Sélectionnez d\'abord une activité.');
      setLookupResult(null);
      return;
    }
    setManualActivityError('');
    const member = LOOKUP_CODES[manualCode.trim().toUpperCase()] ?? null;
    setLookupResult({ found: !!member, member: member ?? undefined });
    setCheckinDone(false);
  };

  const isCaurisCode = CAURIS_CODE_RE.test(manualCode.trim().toUpperCase());

  return (
    <DemoPortalShell type="admin" title="Scanner QR">
      <div className="mx-auto max-w-5xl overflow-x-hidden px-3 py-6 sm:px-6">

        {/* Titre */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <ScanLine size={20} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-black text-neutral-900">Scanner QR</h1>
            <p className="text-sm text-neutral-500">Contrôle de présence et d'accès</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">

          {/* ── Colonne gauche ── */}
          <div className="min-w-0 space-y-4">

            {/* Compteurs mobiles */}
            <div className="grid grid-cols-2 gap-3 lg:hidden">
              <div className="rounded-xl border border-neutral-200 bg-white p-3 text-center shadow-sm">
                <p className="text-2xl font-black text-emerald-700">4</p>
                <p className="text-xs font-semibold text-neutral-500">Aujourd'hui</p>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-white p-3 text-center shadow-sm">
                <p className="text-2xl font-black text-neutral-800">18</p>
                <p className="text-xs font-semibold text-neutral-500">Total scans</p>
              </div>
            </div>

            {/* Sélecteur activité */}
            <div className={`rounded-xl border bg-white p-4 shadow-sm transition-colors ${manualActivityError ? 'border-red-300 ring-2 ring-red-100' : 'border-neutral-200'}`}>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-neutral-500">Événement / Activité</label>
              <select
                value={selectedActivityId}
                onChange={e => { setSelectedActivityId(e.target.value); setManualActivityError(''); }}
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm font-semibold text-neutral-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">-- Choisir une activité pour valider une présence --</option>
                {DEMO_ACTIVITIES.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.title} — {new Date(a.startDate).toLocaleDateString('fr-FR')}
                  </option>
                ))}
              </select>
              {manualActivityError && (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-red-600">
                  <AlertCircle size={13} /> {manualActivityError}
                </p>
              )}
            </div>

            {/* Caméra (désactivée en démo) */}
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
                <span className="text-sm font-black text-neutral-700">Caméra QR</span>
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-100 px-3 py-2 text-xs font-black text-neutral-400">
                  <Camera size={14} /> Non disponible en démo
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-neutral-400">
                <QrCode size={36} strokeWidth={1.5} />
                <p className="text-sm">Utilisez la saisie manuelle ci-dessous</p>
                <p className="text-xs text-neutral-300">La caméra est désactivée en mode démo</p>
              </div>
            </div>

            {/* Saisie manuelle */}
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="mb-2.5 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wide text-neutral-500">Validation manuelle</label>
                  <p className="mt-1 text-[11px] leading-5 text-neutral-500">
                    Entrez un numéro membre SALAM ou un code invité.
                  </p>
                </div>
                {selectedActivityId ? (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">Présence activité</span>
                ) : (
                  <span className="rounded-full bg-yellow-50 px-2.5 py-1 text-[10px] font-black text-yellow-700">Scan général</span>
                )}
              </div>
              <div className="mb-2.5 flex flex-wrap gap-1.5 text-[10px] font-semibold text-neutral-500">
                <span className="rounded-full bg-neutral-100 px-2 py-1 font-mono">SALAM-2026-014</span>
                <span className="rounded-full bg-neutral-100 px-2 py-1 font-mono">SALAM-2026-099</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={e => { setManualCode(e.target.value); setLookupResult(null); setCheckinDone(false); }}
                  onKeyDown={e => e.key === 'Enter' && handleLookup()}
                  placeholder="N° membre ou code…"
                  className="min-w-0 flex-1 rounded-lg border border-neutral-200 px-3 py-2.5 font-mono text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
                <button
                  type="button"
                  disabled={!manualCode.trim()}
                  onClick={handleLookup}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-2.5 text-sm font-black text-white hover:bg-neutral-700 disabled:opacity-40 sm:px-4"
                >
                  <Search size={15} />
                  <span className="hidden sm:inline">Vérifier</span>
                </button>
              </div>

              {/* Détection code cauris */}
              {isCaurisCode && (
                <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                  <AlertCircle size={13} className="shrink-0 text-amber-500" />
                  <p className="flex-1 text-xs text-amber-800">
                    Code cauris détecté — <span className="font-mono font-bold">{manualCode.trim().toUpperCase()}</span>
                  </p>
                  <Link
                    href="/demo/admin/cauris/validation"
                    className="shrink-0 rounded-md bg-amber-600 px-3 py-1 text-[11px] font-black text-white hover:bg-amber-700"
                  >
                    Valider →
                  </Link>
                </div>
              )}

              {/* Résultat lookup */}
              {lookupResult && !isCaurisCode && (
                <div className="mt-3">
                  {!lookupResult.found ? (
                    <p className="flex items-center gap-1.5 text-xs text-red-600">
                      <XCircle size={13} /> Code introuvable — vérifiez le numéro
                    </p>
                  ) : lookupResult.member && (
                    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
                      <div className={`flex min-w-0 items-center gap-3 px-4 py-3 ${lookupResult.member.status !== 'active' ? 'bg-red-50' : 'bg-neutral-50'}`}>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-black text-white">
                          {lookupResult.member.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-black text-neutral-900">{lookupResult.member.name}</p>
                          <p className="font-mono text-xs text-neutral-500">N° {lookupResult.member.num}</p>
                          <span className={`mt-0.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-black ${lookupResult.member.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {lookupResult.member.status === 'active' ? 'Actif' : 'En attente'}
                          </span>
                        </div>
                      </div>
                      {selectedActivity && (
                        <div className="flex min-w-0 items-center gap-2 border-t border-neutral-100 px-4 py-2 text-sm text-neutral-700">
                          <CalendarDays size={13} className="shrink-0 text-emerald-600" />
                          <span className="truncate text-xs">{selectedActivity.title}</span>
                        </div>
                      )}
                      <div className="border-t border-neutral-100 px-4 py-3">
                        {checkinDone ? (
                          <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-50 p-3 font-bold text-emerald-700 text-sm">
                            <CheckCircle2 size={18} /> Présence enregistrée (démo) !
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setCheckinDone(true)}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-black text-white hover:bg-emerald-700"
                          >
                            <UserCheck size={16} /> Confirmer la présence
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Historique mobile */}
            <div className="lg:hidden">
              <HistPanel />
            </div>
          </div>

          {/* ── Colonne droite desktop ── */}
          <div className="hidden min-w-0 space-y-4 lg:block">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-neutral-200 bg-white p-4 text-center shadow-sm">
                <p className="text-3xl font-black text-emerald-700">4</p>
                <p className="mt-0.5 text-xs font-semibold text-neutral-500">Aujourd'hui</p>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-white p-4 text-center shadow-sm">
                <p className="text-3xl font-black text-neutral-800">18</p>
                <p className="mt-0.5 text-xs font-semibold text-neutral-500">Total</p>
              </div>
            </div>
            <HistPanel />
          </div>
        </div>
      </div>
    </DemoPortalShell>
  );
}

function HistPanel() {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-black text-neutral-700">
          <Clock size={14} className="text-emerald-600" /> Historique des scans
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-black text-neutral-500">4</span>
        </span>
      </div>
      <div className="px-4 divide-y divide-neutral-50">
        {DEMO_SCANS.map(s => (
          <div key={s.id} className="py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-black text-emerald-700">
                {s.initials}
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="truncate text-sm font-bold text-neutral-800">{s.name}</p>
                <p className="font-mono text-[10px] text-neutral-400">N° {s.num}</p>
              </div>
              <div className="ml-1 shrink-0 text-right">
                <p className="text-xs font-semibold text-neutral-700">{s.time}</p>
                <p className="text-[10px] text-neutral-400">{s.date}</p>
              </div>
            </div>
            <div className="ml-11 mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
              <span className="inline-flex min-w-0 items-center gap-1 text-[10px] text-emerald-700">
                <CalendarDays size={9} className="shrink-0" />
                <span className="truncate">{s.activity}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-neutral-400">
                <Users size={9} className="shrink-0" />
                <span className="truncate max-w-[100px]">{s.scanner}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-2.5">
        <button disabled className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-300">
          <ChevronLeft size={14} /> Préc.
        </button>
        <span className="text-xs text-neutral-400">Page 1</span>
        <button disabled className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-300">
          Suiv. <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
