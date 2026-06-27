'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Maximize2, X } from 'lucide-react';
import { formatFullName } from '@/lib/format-name';

export type MemberCardData = {
  id: string;
  cardVerifyToken?: string | null;
  firstName: string;
  lastName: string;
  gender?: 'homme' | 'femme';
  role: string;
  antenne?: string;
  year: number;
  photo?: string;
};

export function memberCardVerifyUrl(member: { id: string; cardVerifyToken?: string | null }) {
  return member.cardVerifyToken
    ? `https://salam-cameroun.com/verify-card/${encodeURIComponent(member.cardVerifyToken)}`
    : `SALAM-MEMBER-${member.id}`;
}

function QRCode({ data, size = 82, onPreview }: { data: string; size?: number; onPreview?: () => void }) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${encodeURIComponent(`${size}x${size}`)}&data=${encodeURIComponent(data)}&bgcolor=07140d&color=ffffff&margin=4&qzone=1`;
  return (
    <button
      type="button"
      onClick={onPreview}
      aria-label="Agrandir le QR code"
      className="group relative shrink-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
    >
      <img
        src={src}
        alt="QR code"
        width={size}
        height={size}
        className="shrink-0 rounded-xl ring-1 ring-white/15 transition group-hover:ring-emerald-300/60"
        crossOrigin="anonymous"
      />
      <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
        <Maximize2 size={11} />
      </span>
    </button>
  );
}

export function MemberCard({ member, printable = false }: { member: MemberCardData; printable?: boolean }) {
  const verifyUrl = memberCardVerifyUrl(member);
  const [qrPreview, setQrPreview] = useState(false);
  const qrPreviewSrc = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(verifyUrl)}&bgcolor=07140d&color=ffffff&margin=8&qzone=2`;

  return (
    <>
      <div
        className={`relative w-full overflow-hidden rounded-2xl ${printable ? 'shadow-none' : 'shadow-2xl shadow-emerald-950/40'}`}
        style={{
          maxWidth: 'clamp(18.55rem, 92vw, 25rem)',
          aspectRatio: '8/5',
          minHeight: 200,
          background: 'linear-gradient(135deg, #07140d 0%, #0b1f15 55%, #061009 100%)',
        }}
      >
        <div className="absolute left-0 right-0 top-0 h-[5px]" style={{ background: 'linear-gradient(90deg, #0B8F3A 33%, #C8102E 33%, #C8102E 66%, #F7C600 66%)' }} />

        <div
          className="pointer-events-none absolute inset-0 mix-blend-soft-light opacity-[0.14]"
          style={{
            backgroundImage: "url('/images/placeholders/ndop motif WBG.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute left-[-18%] top-[-24%] h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-[-28%] right-[-16%] h-52 w-52 rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="absolute right-[18%] top-[18%] h-36 w-36 rounded-full bg-red-500/5 blur-3xl" />

        <div className="relative z-10 flex h-full flex-col justify-between p-3.5 pt-5 sm:p-5 sm:pt-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-1.5 sm:gap-2">
                <Image src="/images/logo/logo_salam_96.webp" alt="SALAM" width={36} height={36} className="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-white/20 sm:h-9 sm:w-9" />
                <div className="min-w-0">
                  <p className="text-[10px] font-black tracking-[0.22em] text-white sm:text-[11px]">SALAM</p>
                  <p className="mt-0.5 whitespace-nowrap text-[5.7px] font-semibold tracking-[0.03em] text-white/52 sm:text-[7.2px]">
                    Solidaire Associative des Lauréats du Maroc
                  </p>
                  <span className="mt-1 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[6px] font-black uppercase tracking-[0.14em] text-emerald-300 sm:px-2 sm:text-[8px]">
                    Carte de membre
                  </span>
                </div>
              </div>
            </div>
            <QRCode data={verifyUrl} size={82} onPreview={() => setQrPreview(true)} />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-400 sm:text-[11px]">Titulaire</p>
            {member.gender && (
              <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-white/35 sm:text-[9px]">
                {member.gender === 'femme' ? 'Madame' : 'Monsieur'}
              </p>
            )}
            <p className="mt-0.5 truncate text-[1.1rem] font-black leading-tight tracking-[-0.02em] text-white sm:text-[1.3rem]">
              {formatFullName(member.firstName, member.lastName)}
            </p>

            <div className="mt-1.5 flex items-end justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[9px] font-semibold text-emerald-400 sm:text-[10px]">{member.role}</p>
                {member.antenne && <p className="truncate text-[8px] text-white/35 sm:text-[9px]">Antenne {member.antenne}</p>}
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-white/35 sm:text-[9px]">N° membre</p>
                <p className="text-[10px] font-black tracking-[0.06em] text-white/70 sm:text-[11px]">{member.id}</p>
                <p className="text-[8px] text-white/30 sm:text-[9px]">Valide {member.year}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg, #0B8F3A 33%, #C8102E 33%, #C8102E 66%, #F7C600 66%)' }} />
      </div>

      {qrPreview && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm" onClick={() => setQrPreview(false)}>
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl" onClick={event => event.stopPropagation()}>
            <button type="button" aria-label="Fermer" onClick={() => setQrPreview(false)} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200">
              <X size={16} />
            </button>
            <p className="pr-10 text-sm font-black text-neutral-950">QR code de verification</p>
            <p className="mt-1 text-xs text-neutral-500">Agrandissement de la carte membre SALAM.</p>
            <img src={qrPreviewSrc} alt="QR code agrandi" width={320} height={320} className="mx-auto mt-5 rounded-2xl bg-[#07140d] p-2" crossOrigin="anonymous" />
            <p className="mt-4 text-center text-sm font-black text-neutral-900">{formatFullName(member.firstName, member.lastName)}</p>
            <p className="mt-0.5 text-center text-[11px] text-neutral-400">Titulaire de la carte membre SALAM</p>
          </div>
        </div>
      )}
    </>
  );
}
