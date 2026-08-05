import { apiClient } from '@/lib/api/client';
import type { AuthUser } from '@/store/auth.store';

export type DeviceChallengeStatus = 'pending' | 'approved' | 'rejected' | 'expired';

const PENDING_CHALLENGE_KEY = 'salam:device-verification:pending';
const MAX_LOCAL_CHALLENGE_AGE_MS = 10 * 60 * 1000;
const CHALLENGE_PATTERN = /^[A-Za-z0-9_-]{40,160}$/;

type PendingDeviceChallenge = {
  challengeId: string;
  expiresAt?: string | null;
  createdAt: number;
};

function hasStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function isFreshChallenge(value: PendingDeviceChallenge): boolean {
  if (!CHALLENGE_PATTERN.test(value.challengeId)) return false;
  if (!Number.isFinite(value.createdAt)) return false;
  if (Date.now() - value.createdAt > MAX_LOCAL_CHALLENGE_AGE_MS) return false;
  if (value.expiresAt) {
    const expiresAtMs = Date.parse(value.expiresAt);
    if (!Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now()) return false;
  }
  return true;
}

export function saveDeviceChallenge(challengeId?: string | null, expiresAt?: string | null) {
  if (!hasStorage()) return;
  if (!challengeId || !CHALLENGE_PATTERN.test(challengeId)) {
    clearDeviceChallenge();
    return;
  }

  const payload: PendingDeviceChallenge = {
    challengeId,
    expiresAt: expiresAt ?? null,
    createdAt: Date.now(),
  };

  try {
    window.localStorage.setItem(PENDING_CHALLENGE_KEY, JSON.stringify(payload));
  } catch {
    // Le polling de l'onglet demandeur reste actif si le stockage local est bloque.
  }
}

export function readDeviceChallenge(): string | null {
  if (!hasStorage()) return null;

  try {
    const raw = window.localStorage.getItem(PENDING_CHALLENGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingDeviceChallenge;
    if (!isFreshChallenge(parsed)) {
      clearDeviceChallenge(parsed?.challengeId);
      return null;
    }
    return parsed.challengeId;
  } catch {
    clearDeviceChallenge();
    return null;
  }
}

export function clearDeviceChallenge(challengeId?: string | null) {
  if (!hasStorage()) return;

  try {
    if (challengeId) {
      const raw = window.localStorage.getItem(PENDING_CHALLENGE_KEY);
      const parsed = raw ? JSON.parse(raw) as PendingDeviceChallenge : null;
      if (parsed?.challengeId && parsed.challengeId !== challengeId) return;
    }
    window.localStorage.removeItem(PENDING_CHALLENGE_KEY);
  } catch {
    window.localStorage.removeItem(PENDING_CHALLENGE_KEY);
  }
}

export async function finalizeDeviceChallengeSession(challengeId: string): Promise<{
  status: DeviceChallengeStatus;
  accessToken?: string;
  user?: AuthUser;
}> {
  const res = await apiClient<{ status: DeviceChallengeStatus; accessToken?: string }>(
    `/api/v1/auth/device-challenge/${encodeURIComponent(challengeId)}/status`,
    { method: 'GET' },
  );

  if (res.data.status !== 'approved') {
    return { status: res.data.status };
  }

  if (!res.data.accessToken) {
    throw new Error('Session manquante apres autorisation.');
  }

  const sessionRes = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ accessToken: res.data.accessToken }),
  });
  if (!sessionRes.ok) throw new Error('Impossible de finaliser la session.');

  const sessionJson: { user?: AuthUser } = await sessionRes.json();
  if (!sessionJson.user) throw new Error('Utilisateur introuvable apres autorisation.');

  clearDeviceChallenge(challengeId);
  return { status: 'approved', accessToken: res.data.accessToken, user: sessionJson.user };
}
