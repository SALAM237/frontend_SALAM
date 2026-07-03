'use client';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const DOMAIN_KEYS: Record<string, string[]> = {
  treasury:            ['admin-treasury-transactions', 'member-treasury-transactions', 'admin-treasury-overview', 'member-treasury-overview'],
  'treasury-assets':   ['admin-treasury-assets', 'member-treasury-assets', 'admin-treasury-overview', 'member-treasury-overview'],
  'membership-fee':    ['admin-membership-fee-proposals', 'member-membership-fee-proposals', 'admin-treasury-overview', 'member-treasury-overview'],
  members:             ['admin-members', 'admin-stats', 'admin-admins', 'member-bureau', 'public-bureau'],
  invoices:            ['admin-invoices', 'member-invoices'],
  cotisations:         ['admin-cotisations', 'member-cotisations', 'cotisation-logs', 'admin-treasury-overview', 'member-treasury-overview'],
  'cotisations-annuelles': ['admin-cotisations-annuelles', 'member-cotisations-annuelles', 'cotisation-annuelle-logs', 'admin-treasury-overview', 'member-treasury-overview', 'admin-members'],
  activities:          ['admin-activities', 'member-activities', 'public-activities', 'public-activity', 'member-activity', 'activity-invitations'],
  news:                ['admin-content', 'public-content', 'public-article', 'member-dashboard-kpis'],
  gallery:             ['admin-gallery', 'public-gallery'],
  opportunities:       ['admin-opportunities', 'member-opportunities', 'public-opportunities'],
  networking:          ['admin-networking', 'member-networking', 'member-directories'],
  documents:           ['admin-documents', 'member-shared-documents'],
  messages:            ['admin-messages', 'member-messages'],
  featured:            ['admin-featured', 'public-featured', 'member-featured'],
  validations:         ['admin-pending-validations'],
  roles:               ['admin-roles', 'admin-admins', 'admin-members'],
  cauris:              ['member-cauris', 'admin-cori-redemption'],
  scans:               ['scan-history', 'scan-stats'],
  notifications:       ['admin-notifications', 'member-notifications'],
};

export function useRealtimeSync() {
  const qc = useQueryClient();

  useEffect(() => {
    let es: EventSource;
    let retryTimeout: ReturnType<typeof setTimeout>;
    let retries = 0;

    function connect() {
      es = new EventSource(`${API}/api/v1/events`, { withCredentials: true });

      es.onmessage = (event) => {
        try {
          const { domain } = JSON.parse(event.data) as { domain: string };
          const keys = DOMAIN_KEYS[domain];
          if (keys) keys.forEach(k => qc.invalidateQueries({ queryKey: [k] }));
        } catch {}
      };

      es.onopen = () => { retries = 0; };

      es.onerror = () => {
        es.close();
        const delay = Math.min(3000 * 2 ** retries, 30_000);
        retries++;
        retryTimeout = setTimeout(connect, delay);
      };
    }

    connect();

    return () => {
      clearTimeout(retryTimeout);
      es?.close();
    };
  }, [qc]);
}
