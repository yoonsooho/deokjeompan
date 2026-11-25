'use server';

import { revalidatePath } from 'next/cache';
import { api } from '../lib/api';
import { sessionAuthorization } from '../lib/session';

export type ReviewState = { status: 'idle' | 'success' | 'error'; message: string };

export async function saveReview(
  slug: string,
  episode: number | null,
  _previous: ReviewState,
  form: FormData,
): Promise<ReviewState> {
  const rating = Number(form.get('rating'));
  const comment = String(form.get('comment') ?? '').trim();
  const failure = (message: string): ReviewState => ({ status: 'error', message });
  if (!Number.isInteger(rating) || rating < 1 || rating > 10) return failure('1점에서 10점 사이의 평점을 선택해 주세요.');
  if (comment.length > 500) return failure('감상은 500자까지 입력할 수 있어요.');

  const headers = await sessionAuthorization();
  if (!headers) return failure('로그인이 필요해요.');
  const target = `/anime/${encodeURIComponent(slug)}${episode === null ? '' : `/episodes/${episode}`}`;
  let response: Response;
  try {
    response = await api(`${target}/reviews`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, comment, spoiler: form.get('spoiler') === 'on' }),
    });
  } catch {
    return failure('서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.');
  }
  if (response.status === 401) return failure('로그인 세션이 만료됐어요. 다시 로그인해 주세요.');
  if (response.status === 403) return failure('이 작품의 퀴즈를 먼저 완료해 주세요.');
  if (!response.ok) return failure('저장에 실패했어요. 입력값을 확인한 뒤 다시 시도해 주세요.');

  revalidatePath('/');
  revalidatePath(`/anime/${encodeURIComponent(slug)}`);
  if (episode !== null) revalidatePath(target);
  return { status: 'success', message: comment ? '평점과 감상을 저장했어요.' : '평점을 저장했어요.' };
}
