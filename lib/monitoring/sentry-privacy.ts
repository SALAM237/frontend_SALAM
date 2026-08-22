type MutableSentryEvent = {
  request?: {
    cookies?: Record<string, string>;
    data?: unknown;
    headers?: Record<string, string>;
    query_string?: unknown;
    url?: string;
  };
  user?: Record<string, unknown> & { id?: string | number };
  extra?: Record<string, unknown>;
  contexts?: Record<string, Record<string, unknown> | undefined>;
  tags?: Record<string, string | number | boolean | undefined>;
};

type MutableSentryBreadcrumb = {
  category?: string;
  data?: Record<string, unknown>;
};

const PRIVATE_KEYS = new Set([
  'authorization',
  'cookie',
  'setcookie',
  'xapikey',
  'apikey',
  'password',
  'passwd',
  'accesstoken',
  'refreshtoken',
  'resettoken',
  'verificationtoken',
  'token',
  'secret',
  'otp',
  'pin',
  'cvv',
  'cardnumber',
  'email',
  'phone',
  'telephone',
  'address',
  'firstname',
  'lastname',
  'fullname',
  'username',
  'ip',
  'ipaddress',
]);

const PRIVATE_HEADERS = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'proxy-authorization',
  'x-api-key',
  'x-forwarded-for',
  'x-real-ip',
  'cf-connecting-ip',
]);

function normalizedKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function isPrivateKey(key: string): boolean {
  const normalized = normalizedKey(key);
  for (const privateKey of PRIVATE_KEYS) {
    if (
      normalized === privateKey
      || normalized.startsWith(privateKey)
      || normalized.endsWith(privateKey)
    ) return true;
  }
  return false;
}

function scrubValue(value: unknown, depth = 0): unknown {
  if (depth > 5) return '[Truncated]';
  if (Array.isArray(value)) return value.map(item => scrubValue(item, depth + 1));
  if (!value || typeof value !== 'object') return value;

  const clean: Record<string, unknown> = {};
  for (const [key, nestedValue] of Object.entries(value)) {
    clean[key] = isPrivateKey(key)
      ? '[Filtered]'
      : scrubValue(nestedValue, depth + 1);
  }
  return clean;
}

function stripUrlDetails(url: string): string {
  return url.split(/[?#]/, 1)[0] || url;
}

export function parseSentrySampleRate(value: string | undefined, fallback = 0.1): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : fallback;
}

export function scrubSentryEvent<T>(event: T): T {
  const cleanEvent = event as T & MutableSentryEvent;

  if (cleanEvent.request) {
    if (cleanEvent.request.headers) {
      cleanEvent.request.headers = Object.fromEntries(
        Object.entries(cleanEvent.request.headers).filter(([key]) => !PRIVATE_HEADERS.has(key.toLowerCase())),
      );
    }
    if (cleanEvent.request.url) cleanEvent.request.url = stripUrlDetails(cleanEvent.request.url);
    delete cleanEvent.request.cookies;
    delete cleanEvent.request.data;
    delete cleanEvent.request.query_string;
  }

  if (cleanEvent.user) {
    cleanEvent.user = cleanEvent.user.id === undefined
      ? undefined
      : { id: String(cleanEvent.user.id) };
  }

  if (cleanEvent.extra) cleanEvent.extra = scrubValue(cleanEvent.extra) as Record<string, unknown>;
  if (cleanEvent.contexts) {
    cleanEvent.contexts = scrubValue(cleanEvent.contexts) as MutableSentryEvent['contexts'];
  }
  if (cleanEvent.tags) cleanEvent.tags = scrubValue(cleanEvent.tags) as MutableSentryEvent['tags'];

  return event;
}

export function scrubSentryBreadcrumb<T>(breadcrumb: T): T | null {
  const cleanBreadcrumb = breadcrumb as T & MutableSentryBreadcrumb;

  // Les consoles contiennent parfois des données métier ou des identifiants.
  if (cleanBreadcrumb.category === 'console') return null;

  if (cleanBreadcrumb.data) {
    const data = scrubValue(cleanBreadcrumb.data) as Record<string, unknown>;
    if (typeof data.url === 'string') data.url = stripUrlDetails(data.url);
    cleanBreadcrumb.data = data;
  }

  return breadcrumb;
}
