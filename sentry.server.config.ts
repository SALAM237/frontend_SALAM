import * as Sentry from '@sentry/nextjs';
import {
  parseSentrySampleRate,
  scrubSentryBreadcrumb,
  scrubSentryEvent,
} from './lib/monitoring/sentry-privacy';

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: process.env.SENTRY_ENVIRONMENT ?? process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  sampleRate: 1,
  tracesSampleRate: parseSentrySampleRate(process.env.SENTRY_TRACES_SAMPLE_RATE),
  sendDefaultPii: false,
  attachStacktrace: true,
  includeLocalVariables: false,
  maxBreadcrumbs: 50,
  beforeSend: event => scrubSentryEvent(event),
  beforeBreadcrumb: breadcrumb => scrubSentryBreadcrumb(breadcrumb),
  initialScope: {
    tags: { service: 'frontend-nextjs-server' },
  },
});
