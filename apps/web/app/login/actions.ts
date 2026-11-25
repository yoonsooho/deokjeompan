'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { AccountSession } from '@cutlog/contracts';
import { api } from '../../lib/api';
import { internalPath } from '../../lib/return-path';
import { sessionAuthorization, sessionCookie } from '../../lib/session';

export async function authenticate(
  mode: 'login' | 'register',
  next: string,
  _previous: string,
  form: FormData,
): Promise<string> {
  const username = form.get('username');
  const password = form.get('password');
  const nickname = form.get('nickname');
  if (typeof username !== 'string' || typeof password !== 'string'
      || username.length > 24 || password.length > 128 || (typeof nickname === 'string' && nickname.length > 20)) {
    return '입력한 아이디, 비밀번호, 닉네임을 확인해 주세요.';
  }

  let session: AccountSession;
  try {
    const response = await api(mode === 'register' ? '/auth/register' : '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, nickname }),
    });
    if (response.status >= 500) return '로그인 서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.';
    if (!response.ok) {
      const error = await response.json() as { message?: string };
      return error.message ?? '입력 정보를 확인해 주세요.';
    }
    session = await response.json() as AccountSession;
  } catch {
    return '로그인 서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.';
  }

  const jar = await cookies();
  jar.set(sessionCookie, session.token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.SITE_URL?.startsWith('https://') ?? false,
    path: '/',
    expires: new Date(session.expiresAt),
  });
  redirect(internalPath(next, '/me'));
}

export async function signOut() {
  const headers = await sessionAuthorization();
  if (headers) {
    try {
      await api('/auth/logout', { method: 'POST', headers });
    } catch {
      // The local session can still be cleared while the API is temporarily unavailable.
    }
  }
  (await cookies()).delete(sessionCookie);
  redirect('/');
}
