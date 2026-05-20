'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, ShieldCheck, ArrowRight, LogOut } from 'lucide-react';
import Image from 'next/image';
import { useAuthStore } from '@/store/auth.store';
import { hasAdminRole, hasMemberAccess } from '@/lib/auth/roles';
import { apiClient } from '@/lib/api/client';

const SPACE_COOKIE = 'salam_space';
const COOKIE_OPTS  = 'path=/; SameSite=Lax; max-age=86400';

export default function ChoisirEspacePage() {
  const router  = useRouter();
  const { user, clearAuth } = useAuthStore();

  // If a space was already chosen (this session), go there directly
  useEffect(() => {
    const current = document.cookie
      .split(';')
      .find(c => c.trim().startsWith(SPACE_COOKIE + '='))
      ?.split('=')[1];
    if (current === 'admin')  { router.replace('/admin/dashboard');  return; }
    if (current === 'member') { router.replace('/member/dashboard'); return; }
  }, [router]);

  // Redirect based on roles once store is hydrated
  useEffect(() => {
    if (!user) return;
    const admin  = hasAdminRole(user);
    const member = hasMemberAccess(user);
    if (!admin && !member) { router.replace('/auth/login'); return; }
    if (!admin)  { handleSelectSpace('member'); return; }
    if (!member) { handleSelectSpace('admin');  return; }
    // both — stay on this page for user to choose
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Fallback: if store never hydrates (page refresh without re-login), redirect to login
  useEffect(() => {
    const t = setTimeout(() => {
      if (!useAuthStore.getState().user) {
        router.replace('/auth/login');
      }
    }, 800);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectSpace = (space: 'member' | 'admin') => {
    document.cookie = `${SPACE_COOKIE}=${space}; ${COOKIE_OPTS}`;
    router.push(space === 'admin' ? '/admin/dashboard' : '/member/dashboard');
  };

  const handleLogout = async () => {
    try { await apiClient('/api/v1/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
    await fetch('/api/auth/session', { method: 'DELETE' });
    clearAuth();
    router.push('/auth/login');
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#06100a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#06100a] via-[#08160e] to-[#06100a]">

      {/* Flag stripe */}
      <div className="h-[4px] w-full shrink-0"
        style={{ background: 'linear-gradient(90deg, #0B8F3A 33%, #C8102E 33%, #C8102E 66%, #F7C600 66%)' }} />

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/images/logo/logo_salam_wbg.png" alt="SALAM" width={36} height={36}
            className="h-9 w-9 rounded-full object-cover ring-1 ring-emerald-500/30" priority />
          <div>
            <p className="text-sm font-black tracking-[0.2em] text-white">SALAM</p>
            <p className="text-[9px] font-semibold tracking-[0.18em] text-white/30">ASSOCIATION</p>
          </div>
        </Link>

        <button onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs font-semibold text-white/30 transition hover:text-red-400">
          <LogOut size={13} />
          Déconnexion
        </button>
      </header>

      {/* Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-5 py-12">

        <div className="mb-10 text-center">
          <p className="mb-2 inline-block rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
            Connexion réussie
          </p>
          <h1 className="text-[1.9rem] font-black leading-[1.1] tracking-[-0.04em] text-white sm:text-[2.4rem]">
            Bonjour,{' '}
            <span className="text-emerald-400">{user.firstName}</span>
          </h1>
          <p className="mt-3 text-sm text-white/40">
            Choisissez l&apos;espace auquel vous souhaitez accéder.
          </p>
        </div>

        <div className="grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">

          {/* Espace membre */}
          <button
            onClick={() => handleSelectSpace('member')}
            className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.07] p-7 text-left transition-all duration-200 hover:border-emerald-400/40 hover:bg-emerald-500/[0.12] hover:shadow-[0_0_40px_rgba(16,185,129,0.1)]">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15">
              <Users size={22} className="text-emerald-400" />
            </div>

            <div className="flex-1">
              <h2 className="text-base font-black tracking-[-0.02em] text-white">
                Espace Membre
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-white/40">
                Accédez à votre profil, vos cotisations, activités et documents.
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400">
              Accéder
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </div>

            {/* Lueur */}
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />
          </button>

          {/* Bureau Exécutif */}
          <button
            onClick={() => handleSelectSpace('admin')}
            className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-yellow-300 bg-yellow-200 p-7 text-left transition-all duration-200 hover:border-yellow-400 hover:bg-yellow-300 hover:shadow-[0_0_40px_rgba(234,179,8,0.15)]">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-300/60">
              <ShieldCheck size={22} className="text-yellow-800" />
            </div>

            <div className="flex-1">
              <h2 className="text-base font-black tracking-[-0.02em] text-yellow-900">
                Bureau Exécutif
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-yellow-700">
                Gestion des membres, activités, cotisations et paramètres.
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-black text-yellow-800">
              Accéder
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </div>

            {/* Badge rôle */}
            {user.roles[0] && (
              <span className="absolute right-4 top-4 rounded-full border border-yellow-400 bg-yellow-300/60 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-yellow-800">
                {user.roles[0].name}
              </span>
            )}
          </button>

        </div>
      </main>
    </div>
  );
}
