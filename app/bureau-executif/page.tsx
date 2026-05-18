'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { hasAdminRole } from '@/lib/auth/roles';

export default function BureauExecutifPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user === null) return; // still loading store

    if (hasAdminRole(user)) {
      router.replace('/admin/dashboard');
    } else {
      router.replace('/bureau-executif/connexion');
    }
  }, [user, router]);

  // Fallback: if store never hydrates (no cookie), redirect after short delay
  useEffect(() => {
    const t = setTimeout(() => {
      if (!useAuthStore.getState().user) {
        router.replace('/bureau-executif/connexion');
      }
    }, 800);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#06100a]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
    </div>
  );
}
