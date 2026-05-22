'use client';

import { useEffect, useRef } from 'react';
import { refreshAuthSession } from '@/lib/api/client';
import { useAuthStore } from '@/store/auth.store';

const REFRESH_EVERY_MS = 4 * 60 * 1000;
const REFRESH_WHEN_BACK_AFTER_MS = 60 * 1000;

export default function AuthSessionKeeper() {
  const accessToken = useAuthStore(s => s.accessToken);
  const lastRefresh = useRef(Date.now());

  useEffect(() => {
    if (!accessToken) return;

    const refresh = async () => {
      const token = await refreshAuthSession();
      if (token) lastRefresh.current = Date.now();
    };

    const timer = window.setInterval(refresh, REFRESH_EVERY_MS);
    const onFocus = () => {
      if (document.visibilityState === 'hidden') return;
      if (Date.now() - lastRefresh.current > REFRESH_WHEN_BACK_AFTER_MS) {
        void refresh();
      }
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [accessToken]);

  return null;
}
