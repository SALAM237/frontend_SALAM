'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  QrCode, Camera, CameraOff, Search, CheckCircle2, XCircle,
  Clock, Users, CalendarDays, ScanLine, ChevronLeft, ChevronRight,
  Loader2, AlertCircle, RefreshCw, UserCheck, Ban, Hash, User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useScanLookup, useScanCheckin, useScanHistory, useScanActivities, useScanStats,
  type ScannedMember, type ScanRecord,
} from '@/lib/api/scans';
import { memberPhotoUrl } from '@/lib/avatar';
import { formatFullName } from '@/lib/format-name';

type ScannerControlsLike = { stop: () => void | Promise<void> };

// ── Feedback sensoriel ─────────────────────────────────────────────────────
function vibrate(pattern: number | number[]) {
  try { navigator.vibrate?.(pattern); } catch {}
}
function beepSuccess() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    osc.type = 'sine'; osc.frequency.value = 880;
    g.gain.value = 0.15;
    osc.start();
    osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.1);
    osc.stop(ctx.currentTime + 0.22);
  } catch {}
}
function beepError() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    osc.type = 'square'; osc.frequency.value = 320;
    g.gain.value = 0.2;
    osc.start();
    osc.frequency.setValueAtTime(200, ctx.currentTime + 0.3);
    osc.stop(ctx.currentTime + 0.6);
  } catch {}
}

// ── Badge statut membre ────────────────────────────────────────────────────
function StatusBadge({ status }: { status: ScannedMember['memberStatus'] }) {
  const map: Record<string, { label: string; cls: string }> = {
    active:    { label: 'Actif',      cls: 'bg-emerald-100 text-emerald-700' },
    pending:   { label: 'En attente', cls: 'bg-yellow-100  text-yellow-700'  },
    suspended: { label: 'Suspendu',   cls: 'bg-red-100     text-red-700'     },
    rejected:  { label: 'Rejeté',     cls: 'bg-neutral-100 text-neutral-500' },
  };
  const s = map[status] ?? map.rejected;
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide ${s.cls}`}>{s.label}</span>;
}

// ── Ligne historique enrichie ──────────────────────────────────────────────
function ScanRow({ scan }: { scan: ScanRecord }) {
  const member   = scan.memberId;
  const activity = scan.activityId;
  const scanner  = scan.scannedBy;

  const fullName    = member ? `${member.firstName} ${member.lastName}` : '—';
  const memberNum   = member?.memberNumber ?? '—';
  const qrCode      = member?.memberNumber ? `SALAM-MEMBER-${member.memberNumber}` : '—';
  const scannerName = scanner ? `${scanner.firstName} ${scanner.lastName}` : '—';

  const dt   = new Date(scan.createdAt);
  const time = dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const date = dt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' });

  const contextLabel: Record<string, string> = {
    activity: 'Événement',
    general:  'Général',
    manual:   'Manuel',
  };

  return (
    <div className="border-b border-neutral-100 py-3 last:border-0">
      {/* Ligne 1 : avatar + nom + heure */}
      <div className="flex items-center gap-3">
        {member?.avatar
          ? <img src={memberPhotoUrl({ avatar: member.avatar })} alt={fullName}
              className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-neutral-200" />
          : <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-black text-emerald-700">
              {member ? `${member.firstName[0]}${member.lastName[0]}` : '?'}
            </div>
        }
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-neutral-800">{fullName}</p>
          <p className="font-mono text-[11px] text-neutral-400">N° {memberNum}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs font-semibold text-neutral-700">{time}</p>
          <p className="text-[10px] text-neutral-400">{date}</p>
        </div>
      </div>

      {/* Ligne 2 : QR code lisible + événement + scanner */}
      <div className="ml-12 mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-neutral-400">
          <Hash size={9} /> {qrCode}
        </span>
        {activity && (
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700">
            <CalendarDays size={9} /> {activity.title}
          </span>
        )}
        {!activity && (
          <span className="inline-flex items-center gap-1 text-[10px] text-neutral-400">
            <ScanLine size={9} /> {contextLabel[scan.context] ?? scan.context}
          </span>
        )}
        <span className="inline-flex items-center gap-1 text-[10px] text-neutral-400">
          <User size={9} /> {scannerName}
        </span>
      </div>

      {/* Note optionnelle */}
      {scan.note && (
        <p className="ml-12 mt-1 text-[11px] italic text-neutral-400">"{scan.note}"</p>
      )}
    </div>
  );
}

// ── Composant principal ────────────────────────────────────────────────────
export default function ScannerPage() {
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [manualCode,   setManualCode]   = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError,  setCameraError]  = useState<string | null>(null);
  const [scannerReady, setScannerReady] = useState(false);
  const [scannedMember, setScannedMember] = useState<ScannedMember | null>(null);
  const [checkinDone,   setCheckinDone]   = useState(false);
  const [flashState,    setFlashState]    = useState<'success' | 'error' | null>(null);
  const [note,      setNote]      = useState('');
  const [histPage,  setHistPage]  = useState(1);

  const videoRef      = useRef<HTMLVideoElement | null>(null);
  const controlsRef   = useRef<ScannerControlsLike | null>(null);
  const processingRef = useRef(false);

  const { data: activitiesData } = useScanActivities();
  const activities = activitiesData?.data ?? [];

  const { data: statsData } = useScanStats(selectedActivityId || undefined);
  const stats = statsData?.data;

  const { data: histData, isLoading: histLoading, refetch: refetchHist } = useScanHistory(selectedActivityId || undefined);
  const scans = histData?.data?.scans ?? [];
  const total = histData?.data?.total ?? 0;

  const lookup  = useScanLookup();
  const checkin = useScanCheckin();

  useEffect(() => {
    if (!flashState) return;
    const t = setTimeout(() => setFlashState(null), 2000);
    return () => clearTimeout(t);
  }, [flashState]);

  const stopScanner = useCallback(async () => {
    try {
      if (controlsRef.current) {
        await Promise.resolve(controlsRef.current.stop());
        controlsRef.current = null;
      }
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
    } catch {}
    setCameraActive(false);
    setScannerReady(false);
  }, []);

  const processCode = useCallback(async (raw: string) => {
    if (!raw.trim() || processingRef.current) return;
    processingRef.current = true;
    setScannedMember(null); setCheckinDone(false); setNote('');
    try {
      const result = await lookup.mutateAsync(raw.trim());
      setScannedMember(result.data ?? null);
      setFlashState('success'); vibrate(80); beepSuccess();
    } catch {
      setFlashState('error'); vibrate([200, 80, 200]); beepError();
    } finally {
      processingRef.current = false;
      setManualCode('');
    }
  }, [lookup]);

  // ── CAMÉRA — permission demandée nativement par le navigateur ─────────────
  const toggleCamera = async () => {
    setCameraError(null);
    if (cameraActive) { await stopScanner(); return; }

    let stream: MediaStream | null = null;
    try {
      // Le navigateur affiche lui-même la popup de permission
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        });
      } catch {
        // Fallback : caméra quelconque
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      const { BrowserMultiFormatReader } = await import('@zxing/browser');
      const reader = new BrowserMultiFormatReader();
      setCameraActive(true);
      setScannerReady(false);

      const controls = await reader.decodeFromStream(
        stream,
        videoRef.current!,
        (result, err) => {
          if (result && !processingRef.current) {
            const text = result.getText();
            void (async () => { await stopScanner(); await processCode(text); })();
          }
          if (err && (err as Error).name !== 'NotFoundException') {
            // Ignorer les erreurs de frame sans QR
          }
        },
      );
      controlsRef.current = controls as ScannerControlsLike;
      setScannerReady(true);

    } catch (e) {
      if (stream) stream.getTracks().forEach(t => t.stop());
      await stopScanner();
      const err = e instanceof Error ? e : null;
      if (err?.name === 'NotAllowedError') {
        setCameraError('Permission caméra refusée. Dans votre navigateur, autorisez la caméra pour ce site puis réessayez.');
      } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
        setCameraError('Aucune caméra détectée sur cet appareil.');
      } else if (err?.name === 'NotReadableError' || err?.name === 'TrackStartError') {
        setCameraError('Caméra déjà utilisée par une autre application. Fermez-la et réessayez.');
      } else if (!navigator.mediaDevices) {
        setCameraError('Caméra non disponible. Assurez-vous que le site est ouvert en HTTPS.');
      } else {
        setCameraError(`Impossible de démarrer la caméra : ${err?.message ?? 'erreur inconnue'}`);
      }
    }
  };

  const handleCheckin = async () => {
    if (!scannedMember) return;
    await checkin.mutateAsync({
      memberId:   scannedMember._id,
      activityId: selectedActivityId || undefined,
      note:       note.trim() || undefined,
      context:    selectedActivityId ? 'activity' : 'general',
    });
    setCheckinDone(true);
    vibrate(100); beepSuccess();
  };

  const resetScan = () => { setScannedMember(null); setCheckinDone(false); setNote(''); };

  const selectedActivity = activities.find(a => a._id === selectedActivityId);

  // ── RENDU ──────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">

      {/* Titre */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <ScanLine size={20} />
        </div>
        <div>
          <h1 className="text-xl font-black text-neutral-900">Scanner QR</h1>
          <p className="text-sm text-neutral-500">Contrôle de présence et d'accès</p>
        </div>
      </div>

      {/* Compteurs — toujours visibles en haut sur mobile */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:hidden">
        <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm text-center">
          <p className="text-2xl font-black text-emerald-700">{stats?.today ?? '—'}</p>
          <p className="text-xs font-semibold text-neutral-500">Aujourd'hui</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm text-center">
          <p className="text-2xl font-black text-neutral-800">{stats?.total ?? '—'}</p>
          <p className="text-xs font-semibold text-neutral-500">Total scans</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

        {/* ── Colonne gauche ── */}
        <div className="space-y-4">

          {/* Sélecteur événement */}
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-neutral-500">
              Événement / Activité
            </label>
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
            {selectedActivity && (
              <p className="mt-1.5 text-[11px] text-neutral-400">
                {selectedActivity.location && <>{selectedActivity.location} · </>}
                Statut : {selectedActivity.status}
              </p>
            )}
          </div>

          {/* Caméra */}
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
              <span className="text-sm font-black text-neutral-700">Caméra QR</span>
              <button
                type="button"
                onClick={toggleCamera}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-black transition-all ${
                  cameraActive
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {cameraActive ? <><CameraOff size={14} /> Arrêter</> : <><Camera size={14} /> Démarrer</>}
              </button>
            </div>

            {cameraError && (
              <div className="flex items-start gap-2 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}

            <div className={cameraActive ? 'block' : 'hidden'}>
              <div className="relative">
                <AnimatePresence>
                  {flashState && (
                    <motion.div
                      key={flashState}
                      initial={{ opacity: 0.7 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      className={`pointer-events-none absolute inset-0 z-10 ${flashState === 'success' ? 'bg-emerald-400/40' : 'bg-red-400/40'}`}
                    />
                  )}
                </AnimatePresence>
                <video
                  ref={videoRef}
                  muted playsInline autoPlay
                  className="w-full bg-neutral-900 object-cover"
                  style={{ minHeight: 260, maxHeight: 420 }}
                />
                {/* Viseur */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="relative h-44 w-44">
                    {(['tl','tr','bl','br'] as const).map(c => (
                      <span key={c} className={`absolute h-8 w-8 border-emerald-400 ${
                        c === 'tl' ? 'left-0 top-0 border-l-[3px] border-t-[3px] rounded-tl-lg'
                        : c === 'tr' ? 'right-0 top-0 border-r-[3px] border-t-[3px] rounded-tr-lg'
                        : c === 'bl' ? 'bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-lg'
                        : 'bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-lg'
                      }`} />
                    ))}
                    <div className="absolute inset-x-0 top-1/2 h-[2px] animate-pulse bg-emerald-400/60" />
                  </div>
                </div>
                {!scannerReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/60">
                    <Loader2 size={28} className="animate-spin text-white" />
                  </div>
                )}
              </div>
            </div>

            {!cameraActive && (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-neutral-400">
                <QrCode size={36} strokeWidth={1.5} />
                <p className="text-sm">Cliquez sur Démarrer pour activer la caméra</p>
              </div>
            )}
          </div>

          {/* Saisie manuelle */}
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-neutral-500">
              Saisie manuelle — N° QR ou membre
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && processCode(manualCode)}
                placeholder="SALAM-MEMBER-XXX ou numéro direct"
                className="flex-1 rounded-lg border border-neutral-200 px-3 py-2.5 font-mono text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
              <button
                type="button"
                disabled={!manualCode.trim() || lookup.isPending}
                onClick={() => processCode(manualCode)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-black text-white transition hover:bg-neutral-700 disabled:opacity-40"
              >
                {lookup.isPending ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                Chercher
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-neutral-400">
              Format QR : <span className="font-mono">SALAM-MEMBER-&#123;numéro&#125;</span>
            </p>
          </div>

          {/* Résultat scan */}
          <AnimatePresence>
            {scannedMember && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`overflow-hidden rounded-xl border-2 bg-white shadow-lg ${
                  checkinDone ? 'border-emerald-400'
                  : scannedMember.memberStatus !== 'active' ? 'border-red-300'
                  : 'border-emerald-200'
                }`}
              >
                <div className={`flex items-center gap-4 p-4 ${
                  checkinDone ? 'bg-emerald-50'
                  : scannedMember.memberStatus !== 'active' ? 'bg-red-50'
                  : 'bg-emerald-50/50'
                }`}>
                  {scannedMember.avatar
                    ? <img src={memberPhotoUrl({ avatar: scannedMember.avatar })} alt=""
                        className="h-14 w-14 rounded-full object-cover ring-2 ring-white shadow" />
                    : <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-lg font-black text-white shadow">
                        {scannedMember.firstName[0]}{scannedMember.lastName[0]}
                      </div>
                  }
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg font-black text-neutral-900">
                      {formatFullName(scannedMember.firstName, scannedMember.lastName)}
                    </p>
                    <p className="font-mono text-xs text-neutral-500">N° {scannedMember.memberNumber}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-neutral-400">
                      QR : SALAM-MEMBER-{scannedMember.memberNumber}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <StatusBadge status={scannedMember.memberStatus} />
                      {scannedMember.promotionYear && (
                        <span className="text-[10px] text-neutral-500">Promo {scannedMember.promotionYear}</span>
                      )}
                      {scannedMember.antenne && (
                        <span className="text-[10px] text-neutral-500">{scannedMember.antenne}</span>
                      )}
                    </div>
                  </div>
                  <button type="button" onClick={resetScan}
                    className="ml-auto shrink-0 rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100">
                    <XCircle size={18} />
                  </button>
                </div>

                {!checkinDone ? (
                  <div className="space-y-3 p-4">
                    {scannedMember.memberStatus !== 'active' && (
                      <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
                        <Ban size={15} className="shrink-0" />
                        Membre non actif — présence possible mais signalée
                      </div>
                    )}
                    {selectedActivity && (
                      <div className="flex items-center gap-2 rounded-lg bg-neutral-50 px-3 py-2.5 text-sm text-neutral-700">
                        <CalendarDays size={14} className="shrink-0 text-emerald-600" />
                        {selectedActivity.title}
                      </div>
                    )}
                    <textarea
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      placeholder="Note optionnelle (arrivée tardive, délégation…)"
                      rows={2}
                      className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    />
                    <button
                      type="button"
                      onClick={handleCheckin}
                      disabled={checkin.isPending}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {checkin.isPending
                        ? <><Loader2 size={16} className="animate-spin" /> Enregistrement…</>
                        : <><UserCheck size={16} /> Confirmer la présence</>
                      }
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 p-5 text-center">
                    <CheckCircle2 size={36} className="text-emerald-500" />
                    <p className="text-base font-black text-emerald-700">Présence enregistrée !</p>
                    <button type="button" onClick={resetScan}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-50">
                      <ScanLine size={14} /> Scanner suivant
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Historique — mobile uniquement, affiché sous le scanner */}
          <div className="lg:hidden">
            <HistoriquePanel
              scans={scans}
              total={total}
              histLoading={histLoading}
              histPage={histPage}
              setHistPage={setHistPage}
              onRefresh={() => refetchHist()}
            />
          </div>
        </div>

        {/* ── Colonne droite (desktop/tablette) ── */}
        <div className="hidden space-y-4 lg:block">
          {/* Compteurs desktop */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm text-center">
              <p className="text-3xl font-black text-emerald-700">{stats?.today ?? '—'}</p>
              <p className="mt-0.5 text-xs font-semibold text-neutral-500">Aujourd'hui</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm text-center">
              <p className="text-3xl font-black text-neutral-800">{stats?.total ?? '—'}</p>
              <p className="mt-0.5 text-xs font-semibold text-neutral-500">Total</p>
            </div>
          </div>

          <HistoriquePanel
            scans={scans}
            total={total}
            histLoading={histLoading}
            histPage={histPage}
            setHistPage={setHistPage}
            onRefresh={() => refetchHist()}
          />
        </div>
      </div>
    </div>
  );
}

// ── Panneau historique réutilisé mobile + desktop ──────────────────────────
function HistoriquePanel({
  scans, total, histLoading, histPage, setHistPage, onRefresh,
}: {
  scans: ScanRecord[];
  total: number;
  histLoading: boolean;
  histPage: number;
  setHistPage: (fn: (p: number) => number) => void;
  onRefresh: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-black text-neutral-700">
          <Clock size={14} className="text-emerald-600" />
          Historique des scans
          {total > 0 && (
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-black text-neutral-500">
              {total}
            </span>
          )}
        </span>
        <button type="button" onClick={onRefresh}
          className="rounded-full p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600">
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="divide-y divide-neutral-50 px-4">
        {histLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={22} className="animate-spin text-neutral-300" />
          </div>
        ) : scans.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center text-neutral-400">
            <Users size={28} strokeWidth={1.5} />
            <p className="text-sm font-semibold">Aucun scan enregistré</p>
            <p className="text-xs">Les présences apparaîtront ici après chaque scan</p>
          </div>
        ) : (
          scans.map(s => <ScanRow key={s._id} scan={s} />)
        )}
      </div>

      {total > 50 && (
        <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-2.5">
          <button
            type="button"
            disabled={histPage <= 1}
            onClick={() => setHistPage(p => p - 1)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-700 disabled:opacity-30"
          >
            <ChevronLeft size={14} /> Préc.
          </button>
          <span className="text-xs text-neutral-400">Page {histPage}</span>
          <button
            type="button"
            disabled={histPage * 50 >= total}
            onClick={() => setHistPage(p => p + 1)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-700 disabled:opacity-30"
          >
            Suiv. <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
