export const SENSITIVE_ANALYTICS_ALLOWED_EMAIL = 'salamcameroun237@gmail.com';

export function isSensitiveAnalyticsEmail(value: unknown): boolean {
  return String(value ?? '').trim().toLowerCase() === SENSITIVE_ANALYTICS_ALLOWED_EMAIL;
}

