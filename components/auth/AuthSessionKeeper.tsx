'use client';

import { useEffect, useRef } from 'react';
import { refreshAuthSession } from '@/lib/api/client';
import { useAuthStore } from '@/store/auth.store';

const REFRESH_EVERY_MS = 4 * 60 * 1000;
const REFRESH_WHEN_BACK_AFTER_MS = 30 * 1000;
const REFRESH_AFTER_ACTIVITY_MS = 3 * 60 * 1000;

export default function AuthSessionKeeper() {
  const accessToken = useAuthStore(s => s.accessToken);
  const lastRefresh = useRef(Date.now());

  useEffect(() => {
    if (!accessToken) return;

    const refresh = async () => {
      const token = await refreshAuthSession({ reason: 'periodic', logoutOnFailure: false });
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

    const onActivity = () => {
      if (document.visibilityState === 'hidden') return;
      if (Date.now() - lastRefresh.current > REFRESH_AFTER_ACTIVITY_MS) {
        void refresh();
      }
    };
    const activityEvents: Array<keyof WindowEventMap> = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'];
    activityEvents.forEach(event => window.addEventListener(event, onActivity, { passive: true }));

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
      activityEvents.forEach(event => window.removeEventListener(event, onActivity));
    };
  }, [accessToken]);

  return null;
}
