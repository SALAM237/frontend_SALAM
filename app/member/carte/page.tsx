'use client';

import { useState } from 'react';
import { CreditCard, Download, Share2, CheckCircle2, Smartphone, Info, Loader2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { MemberCard, type MemberCardData } from '@/components/portal/MemberCard';
import { useAuthStore } from '@/store/auth.store';

/* ── Canvas helpers ─────────────────────────────────────── */

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y,     x + w, y + r,     r);
  ctx.lineTo(x + w, y + h - r);  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);  ctx.arcTo(x,     y + h, x,     y + h - r, r);
  ctx.lineTo(x, y + r);  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

async function generateCardBlob(member: MemberCardData): Promise<Blob> {
  const W = 800, H = 500;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  /* clip rounded rect */
  ctx.beginPath(); rrect(ctx, 0, 0, W, H, 30); ctx.clip();

  /* background */
  const bg = ctx.createLinearGradient(0, 0, W * 0.7, H);
  bg.addColorStop(0,    '#07140d');
  bg.addColorStop(0.55, '#0b1f15');
  bg.addColorStop(1,    '#10261a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  /* dot pattern */
  ctx.fillStyle = 'rgba(255,255,255,0.035)';
  for (let x = 9; x < W; x += 18)
    for (let y = 9; y < H; y += 18) {
      ctx.beginPath(); ctx.arc(x, y, 1.2, 0, Math.PI * 2); ctx.fill();
    }

  /* flag stripe top */
  ctx.fillStyle = '#0B8F3A'; ctx.fillRect(0, 0, W / 3, 7);
  ctx.fillStyle = '#C8102E'; ctx.fillRect(W / 3, 0, W / 3, 7);
  ctx.fillStyle = '#F7C600'; ctx.fillRect((W * 2) / 3, 0, W / 3, 7);

  /* logo circle */
  try {
    const logo = await loadImg('/images/logo/logo_salam_wbg.png');
    ctx.save();
    ctx.beginPath(); ctx.arc(62, 78, 32, 0, Math.PI * 2); ctx.clip();
    ctx.drawImage(logo, 30, 46, 64, 64);
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(62, 78, 32.8, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  } catch { /* skip */ }

  /* SALAM label */
  ctx.fillStyle = 'white';
  ctx.font = 'bold 20px Arial';
  ctx.fillText('SALAM', 104, 76);
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '10px Arial';
  ctx.fillText('SOLIDAIRE ASSOCIATIVE', 104, 92);

  /* Carte de membre badge */
  ctx.save();
  ctx.strokeStyle = 'rgba(16,185,129,0.3)'; ctx.fillStyle = 'rgba(16,185,129,0.1)'; ctx.lineWidth = 1;
  ctx.beginPath(); rrect(ctx, 30, 112, 148, 24, 12); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#6ee7b7'; ctx.font = 'bold 9px Arial';
  ctx.textAlign = 'center'; ctx.fillText('CARTE DE MEMBRE', 104, 128); ctx.textAlign = 'left';
  ctx.restore();

  /* separator */
  ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(30, H - 168); ctx.lineTo(W - 30, H - 168); ctx.stroke();

  /* Titulaire */
  ctx.fillStyle = 'rgba(255,255,255,0.38)'; ctx.font = '12px Arial';
  ctx.fillText('Titulaire', 30, H - 140);

  /* name */
  ctx.fillStyle = 'white'; ctx.font = 'bold 38px Arial';
  const name = `${member.firstName} ${member.lastName.toUpperCase()}`;
  ctx.fillText(name, 30, H - 98, W - 240);

  /* role */
  ctx.fillStyle = '#6ee7b7'; ctx.font = 'bold 14px Arial';
  ctx.fillText(member.role, 30, H - 70);

  /* member ID right */
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255,255,255,0.33)'; ctx.font = '10px Arial';
  ctx.fillText('N° membre', W - 30, H - 70);
  ctx.fillStyle = 'rgba(255,255,255,0.68)'; ctx.font = 'bold 14px Arial';
  ctx.fillText(member.id, W - 30, H - 52);
  ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.font = '10px Arial';
  ctx.fillText(`Valide ${member.year}`, W - 30, H - 36);
  ctx.textAlign = 'left';

  /* QR code */
  try {
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://www.association-salam.org/verify/${member.id}`)}&bgcolor=07140d&color=ffffff&margin=8&qzone=1`;
    const qr = await loadImg(qrSrc);
    ctx.save();
    ctx.beginPath(); rrect(ctx, W - 220, 26, 190, 190, 14); ctx.clip();
    ctx.drawImage(qr, W - 220, 26, 190, 190);
    ctx.restore();
  } catch { /* skip */ }

  /* flag stripe bottom */
  ctx.fillStyle = '#0B8F3A'; ctx.fillRect(0, H - 4, W / 3, 4);
  ctx.fillStyle = '#C8102E'; ctx.fillRect(W / 3, H - 4, W / 3, 4);
  ctx.fillStyle = '#F7C600'; ctx.fillRect((W * 2) / 3, H - 4, W / 3, 4);

  return new Promise((resolve, reject) => {
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('toBlob'))), 'image/png');
  });
}

/* ── Page ───────────────────────────────────────────────── */

export default function MembreCartePage() {
  const [downloading, setDownloading] = useState(false);
  const [downloaded,  setDownloaded]  = useState(false);
  const [sharing,     setSharing]     = useState(false);
  const user = useAuthStore(s => s.user);

  const year     = new Date().getFullYear();
  const memberId = user?._id ? `SALAM-${year}-${user._id.slice(-4).toUpperCase()}` : '—';

  const memberData: MemberCardData = {
    id:        memberId,
    firstName: user?.firstName ?? '—',
    lastName:  user?.lastName  ?? '—',
    role:      'Membre actif',
    year,
  };

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const blob = await generateCardBlob(memberData);
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href     = url;
      a.download = `carte-salam-${memberId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloaded(true);
      toast.success('Carte téléchargée en PNG');
      setTimeout(() => setDownloaded(false), 2500);
    } catch {
      toast.error('Erreur lors du téléchargement');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    const url  = `https://www.association-salam.org/verify/${memberId}`;
    const text = `Ma carte de membre SALAM — ${memberId}`;
    setSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Carte de membre SALAM', text, url });
        toast.success('Carte partagée');
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Lien copié dans le presse-papiers');
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(url);
          toast.success('Lien copié dans le presse-papiers');
        } catch {
          toast.error('Impossible de partager');
        }
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Ma carte de membre</h1>
        <p className="mt-0.5 text-sm text-neutral-500">Votre carte officielle SALAM avec QR code de vérification</p>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
        <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-emerald-800">Carte active et valide</p>
          <p className="text-xs text-emerald-600">Valable jusqu&apos;au 31 décembre {year}</p>
        </div>
        <span className="hidden shrink-0 font-mono text-xs font-bold text-emerald-700 sm:block">{memberId}</span>
      </div>

      {/* Card display */}
      <div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm sm:p-8">
        <div className="mx-auto w-full max-w-[400px]">
          <MemberCard member={memberData} />
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading || downloaded}
            className={`inline-flex h-10 items-center gap-2 rounded-full px-6 text-sm font-black transition-all disabled:opacity-70 ${
              downloaded
                ? 'bg-neutral-100 text-neutral-500'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20'
            }`}
          >
            {downloading
              ? <><Loader2 size={14} className="animate-spin" /> Génération…</>
              : downloaded
                ? <><CheckCircle2 size={14} /> Téléchargée !</>
                : <><Download size={14} /> Télécharger (PNG)</>}
          </button>

          <button
            onClick={handleShare}
            disabled={sharing}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-200 px-6 text-sm font-semibold text-neutral-600 transition-all hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-50"
          >
            {sharing
              ? <><Loader2 size={14} className="animate-spin" /> Partage…</>
              : <><Share2 size={14} /> Partager</>}
          </button>

          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(memberId);
                toast.success('N° de membre copié');
              } catch {
                toast.error('Impossible de copier');
              }
            }}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-200 px-4 text-sm font-semibold text-neutral-600 transition-all hover:border-neutral-300"
          >
            <Copy size={14} /> Copier N°
          </button>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Smartphone size={15} className="text-emerald-600" />
            <p className="text-sm font-black text-neutral-900">Comment utiliser votre carte</p>
          </div>
          <ul className="space-y-2.5">
            {[
              'Présentez votre carte (physique ou écran) lors des événements SALAM',
              'Le QR code permet de vérifier votre adhésion instantanément',
              'Valable pour tous les événements de l\'année en cours',
              'Téléchargez-la en PNG pour y accéder hors connexion',
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-neutral-600">
                <div className="mt-1 h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Info size={15} className="text-emerald-600" />
            <p className="text-sm font-black text-neutral-900">Informations membre</p>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Nom complet', value: user ? `${user.firstName} ${user.lastName}` : '—' },
              { label: 'N° membre',   value: memberId },
              { label: 'Rôle',        value: 'Membre actif' },
              { label: 'Validité',    value: `Année ${year}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-2">
                <p className="text-xs font-black uppercase tracking-[0.1em] text-neutral-400">{label}</p>
                <p className="text-right text-xs font-semibold text-neutral-800">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Renewal notice */}
      <div className="flex items-start gap-3 rounded-xl border border-yellow-100 bg-yellow-50 p-4">
        <CreditCard size={15} className="mt-0.5 shrink-0 text-yellow-600" />
        <div>
          <p className="text-sm font-black text-yellow-800">Renouvellement annuel</p>
          <p className="mt-0.5 text-xs text-yellow-700">
            Votre carte est valable pour l&apos;année {year}. Le renouvellement s&apos;effectue en début d&apos;année
            via la page d&apos;adhésion ou en contactant l&apos;administration.
          </p>
        </div>
      </div>
    </div>
  );
}
