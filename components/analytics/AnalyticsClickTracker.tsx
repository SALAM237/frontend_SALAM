'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

const DOWNLOAD_EXTENSIONS = /\.(pdf|docx?|xlsx?|pptx?|zip|rar|csv|ics)$/i;

export default function AnalyticsClickTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const link = target?.closest('a[href]');
      if (!(link instanceof HTMLAnchorElement)) return;

      const href = link.getAttribute('href') ?? '';
      const label = link.textContent?.trim().replace(/\s+/g, ' ').slice(0, 120);

      trackEvent('click', {
        link_url: href,
        link_text: label,
        link_domain: link.hostname,
      });

      if (href === '/don' || href.startsWith('/don?')) {
        trackEvent('don_click', {
          link_text: label,
          placement: 'site_link',
        });
      }

      if (href === '/demo' || href.startsWith('/demo/')) {
        trackEvent('demo_start', {
          link_text: label,
          destination: href,
        });
      }

      if (href.startsWith('/auth/login')) {
        trackEvent('login_click', {
          link_text: label,
          destination: href,
        });
      }

      if (DOWNLOAD_EXTENSIONS.test(href)) {
        trackEvent('file_download', {
          file_name: href.split('/').pop(),
          link_url: href,
        });
      }
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
