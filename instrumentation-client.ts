import * as Sentry from '@sentry/nextjs';
import {
  parseSentrySampleRate,
  scrubSentryBreadcrumb,
  scrubSentryEvent,
} from './lib/monitoring/sentry-privacy';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment:
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT
    ?? process.env.NEXT_PUBLIC_VERCEL_ENV
    ?? process.env.NODE_ENV,
  sampleRate: 1,
  tracesSampleRate: parseSentrySampleRate(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE),
  tracePropagationTargets: [
    /^https:\/\/backend\.salam-cameroun\.com\/api\//,
    /^https:\/\/backendsalam-production\.up\.railway\.app\/api\//,
    /^http:\/\/localhost:4000\/api\//,
  ],
  sendDefaultPii: false,
  attachStacktrace: true,
  maxBreadcrumbs: 50,
  beforeSend: event => scrubSentryEvent(event),
  beforeBreadcrumb: breadcrumb => scrubSentryBreadcrumb(breadcrumb),
  initialScope: {
    tags: { service: 'frontend-nextjs' },
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
