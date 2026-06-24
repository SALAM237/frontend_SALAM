'use client';

type AnalyticsValue = string | number | boolean | null | undefined;
type AnalyticsObject = Record<string, AnalyticsValue>;
type AnalyticsParams = Record<string, AnalyticsValue | AnalyticsValue[] | AnalyticsObject | AnalyticsObject[]>;

export type SalamAnalyticsEvent =
  | 'adhesion_start'
  | 'adhesion_submit'
  | 'adhesion_abandon'
  | 'don_click'
  | 'don_start'
  | 'don_submit'
  | 'don_success'
  | 'don_error'
  | 'member_dashboard_view'
  | 'activity_click'
  | 'activity_view'
  | 'activity_registration_click'
  | 'opportunity_click'
  | 'opportunity_view'
  | 'opportunity_contact_click'
  | 'opportunity_contact_submit'
  | 'news_view'
  | 'news_click'
  | 'contact_submit'
  | 'login_click'
  | 'login_success'
  | 'member_registration'
  | 'demo_start'
  | 'generate_lead'
  | 'sign_up'
  | 'search'
  | 'view_item'
  | 'form_start'
  | 'form_submit'
  | 'file_download'
  | 'click';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function cleanParams(params: AnalyticsParams = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
}

export function trackEvent(eventName: SalamAnalyticsEvent, params: AnalyticsParams = {}) {
  if (typeof window === 'undefined') return;

  const cleanedParams = cleanParams(params);
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, cleanedParams);
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(['event', eventName, cleanedParams]);
}

export function trackFormStart(formName: string, params: AnalyticsParams = {}) {
  trackEvent('form_start', { form_name: formName, ...params });
}

export function trackFormSubmit(formName: string, params: AnalyticsParams = {}) {
  trackEvent('form_submit', { form_name: formName, ...params });
}

export function trackGenerateLead(source: string, params: AnalyticsParams = {}) {
  trackEvent('generate_lead', { lead_source: source, ...params });
}
