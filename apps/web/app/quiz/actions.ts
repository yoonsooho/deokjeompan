'use server';

import { revalidatePath } from 'next/cache';
import type { AnimeQuiz, QuizChoice, QuizResult } from '@cutlog/contracts';
import { api, getAnimeQuiz } from '../../lib/api';
import { sessionAuthorization } from '../../lib/session';

type Result<T> = { data: T; error?: never } | { error: string; data?: never };

const expired = { error: '로그인 세션이 만료됐어요. 다시 로그인해 주세요.' };
const unavailable = { error: '퀴즈 서버에 연결할 수 없어요. 다시 시도해 주세요.' };

export async function submitQuiz(slug: string, quizVersion: string, choices: QuizChoice[]): Promise<Result<QuizResult>> {
  if (typeof slug !== 'string' || slug.length > 90 || typeof quizVersion !== 'string'
      || quizVersion.length > 40 || !Array.isArray(choices) || choices.length > 20) {
    return { error: '퀴즈 응답을 확인해 주세요.' };
  }
  const headers = await sessionAuthorization();
  if (!headers) return expired;

  let result: QuizResult;
  try {
    const response = await api(`/anime/${encodeURIComponent(slug)}/quiz/attempts`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ quizVersion, choices }),
    });
    if (response.status === 401) return expired;
    if (response.status >= 500) return unavailable;
    if (!response.ok) {
      const body = await response.json() as { message?: string };
      return { error: body.message ?? '답을 확인하지 못했어요.' };
    }
    result = await response.json() as QuizResult;
  } catch {
    return unavailable;
  }
  revalidatePath('/');
  revalidatePath('/me');
  revalidatePath('/quiz');
  revalidatePath(`/anime/${encodeURIComponent(slug)}`);
  revalidatePath('/anime/[slug]/episodes/[episode]', 'page');
  return { data: result };
}

export async function startQuizRound(slug: string): Promise<Result<AnimeQuiz>> {
  if (typeof slug !== 'string' || slug.length > 90) return { error: '작품 정보가 올바르지 않아요.' };
  const headers = await sessionAuthorization();
  if (!headers) return expired;
  try {
    const data = await getAnimeQuiz(slug, headers);
    return data ? { data } : { error: '이 작품의 퀴즈를 찾을 수 없어요.' };
  } catch {
    return unavailable;
  }
}
