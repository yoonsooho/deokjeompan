import { cookies } from 'next/headers';
import { cache } from 'react';
import type { Account, EarnedBadge } from '@cutlog/contracts';
import { api } from './api';

export const sessionCookie = 'cutlog_session';

export async function sessionAuthorization() {
  const token = (await cookies()).get(sessionCookie)?.value;
  return token ? { Authorization: `Bearer ${token}` } : null;
}

export const getViewer = cache(async (): Promise<Account | null> => {
  const headers = await sessionAuthorization();
  if (!headers) return null;
  const response = await api('/auth/me', { headers });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error(`Unable to load account (${response.status})`);
  return response.json() as Promise<Account>;
});

export const getMyBadges = cache(async (): Promise<EarnedBadge[]> => {
  const headers = await sessionAuthorization();
  if (!headers) return [];
  const response = await api('/auth/badges', { headers });
  if (response.status === 401) return [];
  if (!response.ok) throw new Error(`Unable to load badges (${response.status})`);
  return response.json() as Promise<EarnedBadge[]>;
});
