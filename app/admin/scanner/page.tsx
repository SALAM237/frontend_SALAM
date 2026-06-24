'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  QrCode, Camera, CameraOff, Search, CheckCircle2, XCircle,
  Clock, Users, ScanLine, Loader2, AlertCircle, RefreshCw,
  UserCheck, Ban, Hash, User, CalendarDays, ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useScanLookup, useScanCheckin, useScanHistory, useScanActivities, useScanStats,
  type ScannedMember, type ScanRecord,
} from '@/lib/api/scans';
import { memberPhotoUrl } from '@/lib/avatar';
import { formatFullName } from '@/lib/format-name';
import { toast } from 'sonner';

// Code cauris : 2 chiffres + 2 lettres + 2 chiffres (ex: 87WF88)
const CAURIS_CODE_RE = /^\d{2}[A-Za-z]{2}\d{2}$/;

type ScannerControlsLike = { stop: () => void | Promise<void> };

// ── Feedback sensoriel ─────────────────────────────────────────────────────
function vibrate(p: number | number[]) { try { navigator.vibrate?.(p); } catch {} }
function beepOk() {
  try {
    const ctx = new AudioContext(); const o = ctx.createOscillator(); const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination); o.type = 'sine'; o.frequency.value = 880; g.gain.value = 0.15;
    o.start(); o.frequency.setValueAtTime(1200, ctx.currentTime + 0.1); o.stop(ctx.currentTime + 0.22);
  } catch {}
}
function beepErr() {
  try {
    const ctx = new AudioContext(); const o = ctx.createOscillator(); const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination); o.type = 'square'; o.frequency.value = 320; g.gain.value = 0.2;
    o.start(); o.frequency.setValueAtTime(200, ctx.currentTime + 0.3); o.stop(ctx.currentTime + 0.6);
  } catch {}
}

// ── Badge statut ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: ScannedMember['memberStatus'] }) {
  const m: Record<string, { l: string; c: string }> = {
    active:    { l: 'Actif',      c: 'bg-emerald-100 text-emerald-700' },
    pending:   { l: 'En attente', c: 'bg-yellow-100  text-yellow-700'  },
    suspended: { l: 'Suspendu',   c: 'bg-red-100     text-red-700'     },
    rejected:  { l: 'Rejeté',     c: 'bg-neutral-100 text-neutral-500' },
  };
  const s = m[status] ?? m.rejected;
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${s.c}`}>{s.l}</span>;
}

// ── Ligne historique ───────────────────────────────────────────────────────
function ScanRow({ scan }: { scan: ScanRecord }) {
  const member   = scan.memberId;
  const activity = scan.activityId;
  const scanner  = scan.scannedBy;
  const name     = member ? `${member.firstName} ${member.lastName}` : scan.guestName ?? 'Invite externe';
  const num      = member?.memberNumber ?? scan.shortCode ?? '-';
  const scanName = scanner ? `${scanner.firstName} ${scanner.lastName}` : '-';
  const dt       = new Date(scan.createdAt);
  const time     = dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const date     = dt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  const ctxLabel: Record<string, string> = { activity: 'Événement', general: 'Général', manual: 'Manuel' };

  return (
    <div className="border-b border-neutral-100 py-3 last:border-0">
      <div className="flex min-w-0 items-center gap-3">
        {member?.avatar
          ? <img src={memberPhotoUrl({ avatar: member.avatar })} alt={name} className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-neutral-200" />
          : <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-black text-emerald-700">
              {member ? `${member.firstName[0]}${member.lastName[0]}` : name.slice(0, 2).toUpperCase()}
            </div>
        }
        <div className="min-w-0 flex-1 overflow-hidden">
          <p className="truncate text-sm font-bold text-neutral-800">{name}</p>
          <p className="font-mono text-[10px] text-neutral-400">N° {num}</p>
        </div>
        <div className="ml-1 shrink-0 text-right">
          <p className="text-xs font-semibold text-neutral-700">{time}</p>
          <p className="text-[10px] text-neutral-400">{date}</p>
        </div>
      </div>
      {/* Métadonnées — wrap sur mobile */}
      <div className="ml-11 mt-1.5 flex min-w-0 flex-wrap gap-x-3 gap-y-1 overflow-hidden">
        {activity
          ? <span className="inline-flex min-w-0 items-center gap-1 text-[10px] text-emerald-700">
              <CalendarDays size={9} className="shrink-0"/>
              <span className="truncate">{activity.title}</span>
            </span>
          : <span className="inline-flex items-center gap-1 text-[10px] text-neutral-400">
              <ScanLine size={9}/> {ctxLabel[scan.context] ?? scan.context}
            </span>
        }
        <span className="inline-flex items-center gap-1 text-[10px] text-neutral-400">
          <User size={9} className="shrink-0"/>
          <span className="truncate max-w-[100px]">{scanName}</span>
        </span>
      </div>
      {scan.note && <p className="ml-11 mt-1 truncate text-[11px] italic text-neutral-400">"{scan.note}"</p>}
      {!member && (scan.guestEmail || scan.guestPhone) && <p className="ml-11 mt-1 truncate text-[10px] text-neutral-400">{scan.guestEmail || scan.guestPhone}</p>}
    </div>
  );
}

// ── Panneau historique ─────────────────────────────────────────────────────
function HistPanel({
  scans, total, histLoading, histError, page, setPage, onRefresh,
}: {
  scans: ScanRecord[]; total: number; histLoading: boolean; histError: boolean;
  page: number; setPage: (fn: (p: number) => number) => void; onRefresh: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-black text-neutral-700">
          <Clock size={14} className="text-emerald-600"/> Historique des scans
          {total > 0 && <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-black text-neutral-500">{total}</span>}
        </span>
        <button type="button" onClick={onRefresh} className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600">
          <RefreshCw size={14}/>
        </button>
      </div>
      <div className="px-4">
        {histLoading
          ? <div className="flex justify-center py-8"><Loader2 size={22} className="animate-spin text-neutral-300"/></div>
          : histError
          ? <div className="flex flex-col items-center gap-2 py-8 text-center">
              <XCircle size={28} strokeWidth={1.5} className="text-red-300"/>
              <p className="text-sm font-semibold text-red-500">Impossible de charger l'historique</p>
              <button type="button" onClick={onRefresh} className="text-xs text-emerald-600 hover:underline">Réessayer</button>
            </div>
          : scans.length === 0
          ? <div className="flex flex-col items-center gap-2 py-8 text-center text-neutral-400">
              <Users size={28} strokeWidth={1.5}/>
              <p className="text-sm font-semibold">Aucune présence enregistrée</p>
              <p className="text-xs leading-5">Scannez un QR puis cliquez<br/><span className="font-bold text-emerald-600">Confirmer la présence</span></p>
            </div>
          : <div className="divide-y divide-neutral-50">
              {scans.map(s => <ScanRow key={s._id} scan={s}/>)}
            </div>
        }
      </div>
      {total > 50 && (
        <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-2.5">
          <button type="button" disabled={page<=1} onClick={() => setPage(p => p-1)} className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-700 disabled:opacity-30">
            <ChevronLeft size={14}/> Préc.
          </button>
          <span className="text-xs text-neutral-400">Page {page}</span>
          <button type="button" disabled={page*50>=total} onClick={() => setPage(p => p+1)} className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-700 disabled:opacity-30">
            Suiv. <ChevronRight size={14}/>
          </button>
        </div>
      )}
    </div>
  );
}

// ── Modal résultat scan (slide-up mobile, centré desktop) ──────────────────
function ScanResultModal({
  member, checkinDone, scanning, note, setNote,
  selectedActivity, onCheckin, onClose,
}: {
  member: ScannedMember; checkinDone: boolean; scanning: boolean; note: string;
  setNote: (v: string) => void; selectedActivity?: { title: string };
  onCheckin: () => void; onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={checkinDone ? onClose : undefined}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 32 }}
        className={`w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-sm sm:rounded-2xl border-t-4 ${checkinDone ? 'border-emerald-400' : member.memberStatus !== 'active' ? 'border-red-300' : 'border-emerald-200'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Poignée mobile */}
        <div className="flex justify-center pt-2.5 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-neutral-200"/>
        </div>

        {/* Header membre */}
        <div className={`flex min-w-0 items-center gap-3 px-4 py-4 ${checkinDone ? 'bg-emerald-50' : member.memberStatus !== 'active' ? 'bg-red-50' : 'bg-neutral-50'}`}>
          {member.avatar
            ? <img src={memberPhotoUrl({ avatar: member.avatar })} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-white shadow"/>
            : <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-lg font-black text-white shadow">
                {member.firstName[0]}{member.lastName[0]}
              </div>
          }
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="truncate text-base font-black text-neutral-900">{formatFullName(member.firstName, member.lastName)}</p>
            <p className="font-mono text-xs text-neutral-500">N° {member.memberNumber}</p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <StatusBadge status={member.memberStatus}/>
              {member.promotionYear && <span className="text-[10px] text-neutral-500">Promo {member.promotionYear}</span>}
            </div>
          </div>
          <button type="button" onClick={onClose} className="ml-1 shrink-0 rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100">
            <X size={18}/>
          </button>
        </div>

        {/* Corps */}
        {!checkinDone ? (
          <div className="space-y-3 px-4 py-4 pb-8 sm:pb-5">
            {member.memberStatus !== 'active' && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
                <Ban size={15} className="shrink-0"/> Membre non actif — présence signalée
              </div>
            )}
            {selectedActivity && (
              <div className="flex min-w-0 items-center gap-2 rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
                <CalendarDays size={14} className="shrink-0 text-emerald-600"/>
                <span className="truncate">{selectedActivity.title}</span>
              </div>
            )}
            <textarea
              value={note} onChange={e => setNote(e.target.value)}
              placeholder="Note optionnelle (arrivée tardive, délégation…)" rows={2}
              className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
            <button
              type="button" onClick={onCheckin} disabled={scanning}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {scanning ? <><Loader2 size={16} className="animate-spin"/> Enregistrement…</> : <><UserCheck size={16}/> Confirmer la présence</>}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 py-6 pb-8 text-center sm:pb-6">
            <CheckCircle2 size={40} className="text-emerald-500"/>
            <p className="text-base font-black text-emerald-700">Présence enregistrée !</p>
            <button type="button" onClick={onClose}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-5 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-50">
              <ScanLine size={14}/> Scanner suivant
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ── Page principale ────────────────────────────────────────────────────────

function ScanAlertModal({ title, message, onClose }: { title: string; message: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 14 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 10 }}
        className="w-full max-w-sm rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
            <AlertCircle size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-black">{title}</h2>
            <p className="mt-1 text-sm leading-5 text-red-700">{message}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-red-600 hover:bg-red-100">
            <X size={17} />
          </button>
        </div>
        <button type="button" onClick={onClose} className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-xl bg-red-600 text-sm font-black text-white hover:bg-red-700">
          Compris
        </button>
      </motion.div>
    </div>
  );
}
export default function ScannerPage() {
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [manualCode,  setManualCode]   = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError,  setCameraError]  = useState<string | null>(null);
  const [scannerReady, setScannerReady] = useState(false);
  const [scannedMember, setScannedMember] = useState<ScannedMember | null>(null);
  const [checkinDone, setCheckinDone]   = useState(false);
  const [scanAlert, setScanAlert] = useState<{ title: string; message: string } | null>(null);
  const [flashState, setFlashState]     = useState<'success' | 'error' | null>(null);
  const [note, setNote]    = useState('');
  const [histPage, setHistPage] = useState(1);

  const videoRef    = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<ScannerControlsLike | null>(null);
  const processingRef = useRef(false);

  const { data: activitiesData } = useScanActivities();
  const activities = activitiesData?.data ?? [];

  const { data: statsData }  = useScanStats(selectedActivityId || undefined);
  const stats = statsData?.data;

  const { data: histData, isLoading: histLoading, isError: histError, refetch: refetchHist } = useScanHistory(selectedActivityId || undefined, histPage);
  const scans = histData?.data?.scans ?? [];
  const total = histData?.data?.total ?? 0;

  const lookup  = useScanLookup();
  const checkin = useScanCheckin();

  useEffect(() => {
    if (!flashState) return;
    const t = setTimeout(() => setFlashState(null), 1800);
    return () => clearTimeout(t);
  }, [flashState]);

  const stopScanner = useCallback(async () => {
    try {
      if (controlsRef.current) { await Promise.resolve(controlsRef.current.stop()); controlsRef.current = null; }
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
    } catch {}
    setCameraActive(false); setScannerReady(false);
  }, []);

  const processCode = useCallback(async (raw: string) => {
    if (!raw.trim() || processingRef.current) return;
    const trimmed = raw.trim();

    if (trimmed.includes('/admin/cauris/validation')) {
      window.location.href = trimmed;
      return;
    }
    if (CAURIS_CODE_RE.test(trimmed)) {
      window.location.href = `/admin/cauris/validation?token=${encodeURIComponent(trimmed.toUpperCase())}`;
      return;
    }

    processingRef.current = true;
    setScannedMember(null); setCheckinDone(false); setScanAlert(null); setNote('');
    try {
      const res = await lookup.mutateAsync(trimmed);
      setScannedMember(res.data ?? null);
      setFlashState('success'); vibrate(80); beepOk();
    } catch {
      setFlashState('error'); vibrate([200, 80, 200]); beepErr();
    } finally {
      processingRef.current = false;
      setManualCode('');
    }
  }, [lookup]);

  const toggleCamera = async () => {
    setCameraError(null);
    if (cameraActive) { await stopScanner(); return; }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera non disponible. Ouvrez le site en HTTPS et utilisez un navigateur compatible.');
      return;
    }
    setCameraActive(true);
    setScannerReady(false);
    let stream: MediaStream | null = null;
    try {
      try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } } }); }
      catch { stream = await navigator.mediaDevices.getUserMedia({ video: true }); }

      const { BrowserMultiFormatReader } = await import('@zxing/browser');
      const reader = new BrowserMultiFormatReader();
      const controls = await reader.decodeFromStream(stream, videoRef.current!, (result, err) => {
        if (result && !processingRef.current) {
          const text = result.getText();
          void (async () => { await stopScanner(); await processCode(text); })();
        }
        if (err && (err as Error).name !== 'NotFoundException') { /* frame sans QR — ignorer */ }
      });
      controlsRef.current = controls as ScannerControlsLike;
      setScannerReady(true);
    } catch (e) {
      if (stream) stream.getTracks().forEach(t => t.stop());
      await stopScanner();
      const err = e instanceof Error ? e : null;
      if (err?.name === 'NotAllowedError')       setCameraError('Permission caméra refusée. Autorisez-la dans les paramètres du navigateur.');
      else if (err?.name === 'NotFoundError')    setCameraError('Aucune caméra détectée sur cet appareil.');
      else if (err?.name === 'NotReadableError') setCameraError('Caméra utilisée par une autre application. Fermez-la et réessayez.');
      else if (!navigator.mediaDevices)          setCameraError('Caméra non disponible. Ouvrez le site en HTTPS.');
      else setCameraError(`Impossible de démarrer la caméra. ${err?.message ?? ''}`);
    }
  };

  const handleCheckin = async () => {
    if (!scannedMember) return;
    try {
      await checkin.mutateAsync(scannedMember.kind === 'activityInvitation' ? {
        invitationId: scannedMember.invitationId,
        activityId: selectedActivityId || undefined,
        note: note.trim() || undefined,
        context: 'activity',
      } : {
        memberId: scannedMember._id,
        activityId: selectedActivityId || undefined,
        note: note.trim() || undefined,
        context: selectedActivityId ? 'activity' : 'general',
      });
      setCheckinDone(true);
      vibrate(100);
      beepOk();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur lors de l\'enregistrement';
      const alreadyUsed = /deja|déjà|utilise|utilisé|enregistree|enregistrée/i.test(msg);
      setFlashState('error');
      vibrate([220, 80, 220]);
      beepErr();
      if (alreadyUsed) {
        setScanAlert({
          title: 'QR code deja valide',
          message: 'Ce QR code a deja ete utilise. La presence a deja ete prise en compte, il ne faut pas le valider une seconde fois.',
        });
      } else {
        toast.error(msg);
      }
    }
  };

  const selectedActivity = activities.find(a => a._id === selectedActivityId);

  return (
    <div className="mx-auto max-w-5xl overflow-x-hidden px-3 py-6 sm:px-6">

      {/* Titre */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <ScanLine size={20}/>
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-black text-neutral-900">Scanner QR</h1>
          <p className="text-sm text-neutral-500">Contrôle de présence et d'accès</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">

        {/* ── Colonne gauche ── */}
        <div className="min-w-0 space-y-4">

          {/* Compteurs — mobiles uniquement */}
          <div className="grid grid-cols-2 gap-3 lg:hidden">
            <div className="rounded-xl border border-neutral-200 bg-white p-3 text-center shadow-sm">
              <p className="text-2xl font-black text-emerald-700">{stats?.today ?? '—'}</p>
              <p className="text-xs font-semibold text-neutral-500">Aujourd'hui</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-3 text-center shadow-sm">
              <p className="text-2xl font-black text-neutral-800">{stats?.total ?? '—'}</p>
              <p className="text-xs font-semibold text-neutral-500">Total scans</p>
            </div>
          </div>

          {/* Sélecteur événement */}
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-neutral-500">Événement / Activité</label>
            <select
              value={selectedActivityId}
              onChange={e => { setSelectedActivityId(e.target.value); setHistPage(1); }}
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm font-semibold text-neutral-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            >
              <option value="">— Scan général (sans événement) —</option>
              {activities.map(a => (
                <option key={a._id} value={a._id}>
                  {a.title}{a.startDate ? ` — ${new Date(a.startDate).toLocaleDateString('fr-FR')}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Caméra */}
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
              <span className="text-sm font-black text-neutral-700">Caméra QR</span>
              <button
                type="button"
                onClick={toggleCamera}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-black transition-all sm:gap-2 sm:px-4 ${cameraActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
              >
                {cameraActive ? <><CameraOff size={14}/> <span className="hidden sm:inline">Arrêter</span></> : <><Camera size={14}/> <span className="hidden sm:inline">Démarrer</span></>}
              </button>
            </div>

            {cameraError && (
              <div className="flex items-start gap-2 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle size={16} className="mt-0.5 shrink-0"/><span>{cameraError}</span>
              </div>
            )}

            <div className={cameraActive ? 'block' : 'hidden'}>
              <div className="relative">
                <AnimatePresence>
                  {flashState && (
                    <motion.div
                      key={flashState}
                      initial={{ opacity: 0.8 }} animate={{ opacity: 0 }} transition={{ duration: 0.8 }}
                      className={`pointer-events-none absolute inset-0 z-10 ${flashState === 'success' ? 'bg-emerald-400/40' : 'bg-red-400/40'}`}
                    />
                  )}
                </AnimatePresence>
                <video
                  ref={videoRef} muted playsInline autoPlay
                  className="w-full bg-neutral-900 object-cover"
                  style={{ minHeight: 220, maxHeight: 360 }}
                />
                {/* Viseur */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="relative h-40 w-40">
                    {(['tl','tr','bl','br'] as const).map(c => (
                      <span key={c} className={`absolute h-7 w-7 border-emerald-400 ${
                        c==='tl'?'left-0 top-0 border-l-[3px] border-t-[3px] rounded-tl-lg'
                        :c==='tr'?'right-0 top-0 border-r-[3px] border-t-[3px] rounded-tr-lg'
                        :c==='bl'?'bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-lg'
                        :'bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-lg'
                      }`}/>
                    ))}
                    <div className="absolute inset-x-0 top-1/2 h-[2px] animate-pulse bg-emerald-400/70"/>
                  </div>
                </div>
                {!scannerReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/60">
                    <Loader2 size={28} className="animate-spin text-white"/>
                  </div>
                )}
              </div>
            </div>

            {!cameraActive && !cameraError && (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-neutral-400">
                <QrCode size={36} strokeWidth={1.5}/>
                <p className="text-sm">Appuyez sur Démarrer pour activer la caméra</p>
              </div>
            )}
          </div>

          {/* Saisie manuelle */}
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-neutral-500">Saisie manuelle</label>
            <p className="mb-2.5 text-[11px] text-neutral-400">
              Entrez le code à 6 caractères imprimé sous le QR code du membre — ex : <span className="font-mono font-bold text-neutral-600">47BK23</span>
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && processCode(manualCode)}
                placeholder="ex : 47BK23"
                className="min-w-0 flex-1 rounded-lg border border-neutral-200 px-3 py-2.5 font-mono text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
              <button
                type="button"
                disabled={!manualCode.trim() || lookup.isPending}
                onClick={() => processCode(manualCode)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-2.5 text-sm font-black text-white hover:bg-neutral-700 disabled:opacity-40 sm:px-4"
              >
                {lookup.isPending ? <Loader2 size={15} className="animate-spin"/> : <Search size={15}/>}
                <span className="hidden sm:inline">Chercher</span>
              </button>
            </div>

            {/* Détection code cauris */}
            {CAURIS_CODE_RE.test(manualCode.trim()) ? (
              <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                <AlertCircle size={13} className="shrink-0 text-amber-500"/>
                <p className="flex-1 text-xs text-amber-800">
                  Code cauris détecté — <span className="font-mono font-bold">{manualCode.trim().toUpperCase()}</span>
                </p>
                <Link
                  href={`/admin/cauris/validation?token=${encodeURIComponent(manualCode.trim().toUpperCase())}`}
                  className="shrink-0 rounded-md bg-amber-600 px-3 py-1 text-[11px] font-black text-white hover:bg-amber-700"
                >
                  Valider →
                </Link>
              </div>
            ) : lookup.isError ? (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
                <XCircle size={13}/> {(lookup.error as Error)?.message || 'Code introuvable - verifiez le code'}
              </p>
            ) : null}
          </div>

          {/* Historique — mobile uniquement */}
          <div className="lg:hidden">
            <HistPanel
              scans={scans} total={total}
              histLoading={histLoading} histError={histError}
              page={histPage} setPage={setHistPage}
              onRefresh={() => refetchHist()}
            />
          </div>
        </div>

        {/* ── Colonne droite desktop ── */}
        <div className="hidden min-w-0 space-y-4 lg:block">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-neutral-200 bg-white p-4 text-center shadow-sm">
              <p className="text-3xl font-black text-emerald-700">{stats?.today ?? '—'}</p>
              <p className="mt-0.5 text-xs font-semibold text-neutral-500">Aujourd'hui</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4 text-center shadow-sm">
              <p className="text-3xl font-black text-neutral-800">{stats?.total ?? '—'}</p>
              <p className="mt-0.5 text-xs font-semibold text-neutral-500">Total</p>
            </div>
          </div>
          <HistPanel
            scans={scans} total={total}
            histLoading={histLoading} histError={histError}
            page={histPage} setPage={setHistPage}
            onRefresh={() => refetchHist()}
          />
        </div>
      </div>

      {/* Modal résultat scan */}
      <AnimatePresence>
        {scanAlert && (
          <ScanAlertModal title={scanAlert.title} message={scanAlert.message} onClose={() => setScanAlert(null)} />
        )}
        {scannedMember && (
          <ScanResultModal
            member={scannedMember}
            checkinDone={checkinDone}
            scanning={checkin.isPending}
            note={note}
            setNote={setNote}
            selectedActivity={selectedActivity}
            onCheckin={handleCheckin}
            onClose={() => { setScannedMember(null); setCheckinDone(false); setScanAlert(null); setNote(''); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
