'use client';

import { useState } from 'react';
import { Eye, EyeOff, Laptop, Loader2, Lock, MapPin, Power, Shield, ShieldCheck, Trash2, X } from 'lucide-react';
import { useChangeMemberPassword, useMyDevices, useRequestAccountDeletion, type MemberDevice } from '@/lib/api/members';

const PW_CHECKS = [
  { label: '8 caracteres minimum', test: (v: string) => v.length >= 8 },
  { label: 'Une majuscule', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Une minuscule', test: (v: string) => /[a-z]/.test(v) },
  { label: 'Un chiffre', test: (v: string) => /\d/.test(v) },
  { label: 'Un caractere special', test: (v: string) => /[^\sA-Za-z0-9]/.test(v) },
];
const STRENGTH_LABEL = ['', 'Tres faible', 'Faible', 'Moyen', 'Fort', 'Excellent'];
const STRENGTH_COLOR = ['', 'bg-red-500', 'bg-red-400', 'bg-orange-400', 'bg-emerald-500', 'bg-emerald-600'];

function fmt(value?: string | null) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function MemberSecurityPage() {
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [deletionOpen, setDeletionOpen] = useState(false);
  const [devicesOpen, setDevicesOpen] = useState(false);
  const devices = useMyDevices();
  const rows = devices.data?.data ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <h1 className="text-[clamp(1.35rem,3vw,2rem)] font-black tracking-[-0.03em] text-neutral-900">Securite</h1>
        <p className="mt-0.5 text-sm text-neutral-500">Protegez votre compte et consultez les appareils autorises.</p>
      </div>

      <section className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button type="button" onClick={() => setPasswordOpen(true)} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-neutral-200 px-4 text-xs font-semibold text-neutral-600 hover:border-neutral-300 sm:w-auto">
            <Lock size={13} /> Changer le mot de passe
          </button>
          <button type="button" className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-neutral-200 px-4 text-xs font-semibold text-neutral-600 hover:border-neutral-300 sm:w-auto">
            <Shield size={13} /> Authentification 2FA
          </button>
          <button type="button" onClick={() => setDevicesOpen(v => !v)} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-emerald-200 px-4 text-xs font-black text-emerald-700 hover:bg-emerald-50 sm:w-auto">
            <Laptop size={13} /> Appareils
          </button>
          <button type="button" onClick={() => setDeletionOpen(true)} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-red-200 px-4 text-xs font-semibold text-red-600 hover:bg-red-50 sm:w-auto">
            <Trash2 size={13} /> Supprimer mon compte
          </button>
        </div>
      </section>

      {devicesOpen && <DeviceList loading={devices.isLoading} devices={rows} />}
      {passwordOpen && <PasswordModal onClose={() => setPasswordOpen(false)} />}
      {deletionOpen && <AccountDeletionModal onClose={() => setDeletionOpen(false)} />}
    </div>
  );
}

function DeviceList({ devices, loading }: { devices: MemberDevice[]; loading: boolean }) {
  return (
    <section className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-neutral-900">Appareils connus</p>
          <p className="mt-1 text-xs text-neutral-400">Historique des appareils approuves pour acceder a votre compte.</p>
        </div>
        {loading && <Loader2 size={16} className="animate-spin text-emerald-600" />}
      </div>
      {!loading && devices.length === 0 && <p className="rounded-xl border border-dashed border-neutral-200 py-8 text-center text-sm font-bold text-neutral-400">Aucun appareil enregistre.</p>}
      <div className="grid gap-3">
        {devices.map(device => <DeviceCard key={device.id} device={device} />)}
      </div>
    </section>
  );
}

function DeviceCard({ device }: { device: MemberDevice }) {
  const connected = device.status === 'connected';
  return (
    <article className="rounded-xl border border-neutral-100 bg-neutral-50/70 p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-neutral-900">{device.label}</p>
          <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-neutral-500"><MapPin size={12} /> {device.location || device.countryCode || 'Lieu non renseigne'}</p>
        </div>
        <span className={`inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black ${connected ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
          <Power size={11} /> {connected ? 'Connecte' : 'Deconnecte'}
        </span>
      </div>
      <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
        <Info label="IP" value={device.ip || '-'} />
        <Info label="Verifie" value={fmt(device.verifiedAt)} />
        <Info label="Derniere connexion" value={fmt(device.lastUsed)} />
        <Info label="Derniere deconnexion" value={fmt(device.lastLogout)} />
        <Info label="Expire" value={fmt(device.expiresAt)} />
        <Info label="Connexions" value={String(device.loginCount ?? 0)} />
        <Info label="Pays" value={device.countryCode || '-'} />
        <Info label="Statut" value={connected ? 'Autorise actif' : 'Autorise deconnecte'} />
      </div>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-white px-3 py-2"><p className="text-[9px] font-black uppercase tracking-[0.12em] text-neutral-400">{label}</p><p className="mt-0.5 break-words font-semibold text-neutral-700">{value}</p></div>;
}

function PasswordModal({ onClose }: { onClose: () => void }) {
  const changePassword = useChangeMemberPassword();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const checks = PW_CHECKS.map(c => ({ ...c, valid: c.test(newPassword) }));
  const strength = checks.filter(c => c.valid).length;
  const valid = currentPassword && strength === 5 && newPassword === confirmPassword;
  const submit = () => { if (valid && !changePassword.isPending) changePassword.mutate({ currentPassword, newPassword }, { onSuccess: onClose }); };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <ModalHead title="Changer le mot de passe" onClose={onClose} />
        <div className="space-y-3 p-5">
          <PasswordField label="Mot de passe actuel *" value={currentPassword} onChange={setCurrentPassword} autoComplete="current-password" />
          <PasswordField label="Nouveau mot de passe *" value={newPassword} onChange={setNewPassword} autoComplete="new-password" showToggle />
          {newPassword.length > 0 && <div className="space-y-1.5"><div className="flex gap-1">{[1,2,3,4,5].map(i => <div key={i} className={`h-1 flex-1 rounded-full ${i <= strength ? STRENGTH_COLOR[strength] : 'bg-neutral-100'}`} />)}</div><p className="text-[10px] font-semibold text-neutral-500">Force : <span>{STRENGTH_LABEL[strength]}</span></p><ul className="grid gap-0.5">{checks.map(c => <li key={c.label} className={`flex items-center gap-1.5 text-[10px] ${c.valid ? 'text-emerald-600' : 'text-neutral-400'}`}><span className={`h-1.5 w-1.5 rounded-full ${c.valid ? 'bg-emerald-500' : 'bg-neutral-300'}`} />{c.label}</li>)}</ul></div>}
          <PasswordField label="Confirmer le nouveau mot de passe *" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" showToggle />
        </div>
        <ModalActions onClose={onClose} onSubmit={submit} disabled={!valid || changePassword.isPending} busy={changePassword.isPending} submitLabel="Enregistrer" />
      </div>
    </div>
  );
}

function AccountDeletionModal({ onClose }: { onClose: () => void }) {
  const requestDeletion = useRequestAccountDeletion();
  const [reason, setReason] = useState('');
  const [confirm, setConfirm] = useState('');
  const canSubmit = confirm.trim().toUpperCase() === 'SUPPRIMER';
  const submit = () => { if (canSubmit && !requestDeletion.isPending) requestDeletion.mutate({ reason: reason.trim() || undefined }, { onSuccess: onClose }); };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <ModalHead title="Demande de suppression" onClose={onClose} danger />
        <div className="space-y-3 p-5"><textarea value={reason} onChange={e => setReason(e.target.value)} rows={4} placeholder="Motif facultatif" className="w-full rounded-xl border border-neutral-200 p-3 text-sm outline-none focus:border-red-300" /><input value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Tapez SUPPRIMER" className="h-10 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-red-300" /></div>
        <ModalActions onClose={onClose} onSubmit={submit} disabled={!canSubmit || requestDeletion.isPending} busy={requestDeletion.isPending} submitLabel="Envoyer la demande" danger />
      </div>
    </div>
  );
}

function ModalHead({ title, onClose, danger = false }: { title: string; onClose: () => void; danger?: boolean }) {
  return <div className={`flex items-center justify-between border-b border-neutral-100 p-5 ${danger ? 'bg-red-50/50' : 'bg-emerald-50/40'}`}><div><p className={`text-[10px] font-black uppercase tracking-[0.16em] ${danger ? 'text-red-600' : 'text-emerald-600'}`}>Securite</p><h2 className="text-lg font-black text-neutral-900">{title}</h2></div><button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100"><X size={15} /></button></div>;
}

function ModalActions({ onClose, onSubmit, disabled, busy, submitLabel, danger = false }: { onClose: () => void; onSubmit: () => void; disabled: boolean; busy: boolean; submitLabel: string; danger?: boolean }) {
  return <div className="flex gap-3 border-t border-neutral-100 p-5"><button type="button" onClick={onClose} className="h-10 flex-1 rounded-xl border border-neutral-200 text-sm font-bold text-neutral-600 hover:border-neutral-300">Annuler</button><button type="button" onClick={onSubmit} disabled={disabled} className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-black text-white transition disabled:opacity-50 ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>{busy && <Loader2 size={14} className="animate-spin" />}{submitLabel}</button></div>;
}

function PasswordField({ label, value, onChange, autoComplete, showToggle = false }: { label: string; value: string; onChange: (value: string) => void; autoComplete: string; showToggle?: boolean }) {
  const [show, setShow] = useState(false);
  return <div><label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">{label}</label><div className="relative"><input type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)} autoComplete={autoComplete} className="h-10 w-full rounded-xl border border-neutral-200 px-3 text-sm text-neutral-900 outline-none focus:border-emerald-400" style={showToggle ? { paddingRight: '2.25rem' } : undefined} />{showToggle && <button type="button" tabIndex={-1} onClick={() => setShow(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">{show ? <EyeOff size={15} /> : <Eye size={15} />}</button>}</div></div>;
}