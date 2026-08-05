'use client';

import { MailWarning, X } from 'lucide-react';

export function DeviceVerificationModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="device-verification-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center"
      onMouseDown={onClose}
      onTouchStart={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
        onMouseDown={event => event.stopPropagation()}
        onTouchStart={event => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-amber-100 bg-amber-50/70 p-5">
          <div className="flex min-w-0 items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700">
              <MailWarning size={19} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-700">Verification de connexion</p>
              <h2 id="device-verification-title" className="mt-1 text-lg font-black leading-tight text-neutral-900">
                Email de verification envoye
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-neutral-400 transition hover:bg-white hover:text-neutral-700"
          >
            <X size={16} />
          </button>
        </div>
        <div className="space-y-3 p-5">
          <p className="text-sm leading-6 text-neutral-600">
            Un email de verification vient d'etre envoye. Consultez votre boite mail, puis cliquez sur le bouton d'autorisation pour finaliser la connexion.
          </p>
          <p className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5 text-xs font-semibold leading-5 text-amber-800">
            Pensez aussi a verifier les courriers indesirables si le mail n'apparait pas dans quelques instants.
          </p>
        </div>
      </div>
    </div>
  );
}