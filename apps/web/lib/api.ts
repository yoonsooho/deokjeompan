import { cache } from 'react';
import type { AnimeCard, AnimeDetail, AnimeQuiz, EpisodeDetail, LatestReview } from '@cutlog/contracts';

const apiUrl = (process.env.API_URL || 'http://127.0.0.1:4000/api').replace(/\/$/, '');

export function api(path: string, options?: RequestInit) {
  return fetch(`${apiUrl}${path}`, { ...options, cache: 'no-store', signal: AbortSignal.timeout(5000) });
}

async function get<T>(path: string): Promise<T | null> {
  const response = await api(path);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Cutlog API returned ${response.status}`);
  return response.json() as Promise<T>;
}

export function getAnimeList(filters: { q: string; genre: string; sort: string }) {
  return get<AnimeCard[]>(`/anime?${new URLSearchParams(filters)}`);
}

export const getAnime = cache((slug: string) => get<AnimeDetail>(`/anime/${encodeURIComponent(slug)}`));
export const getEpisode = cache((slug: string, episode: string) =>
  get<EpisodeDetail>(`/anime/${encodeURIComponent(slug)}/episodes/${encodeURIComponent(episode)}`),
);
export const getRecentReviews = () => get<LatestReview[]>('/reviews/recent');

export async function getAnimeQuiz(slug: string, headers: { Authorization: string }) {
  const response = await api(`/anime/${encodeURIComponent(slug)}/quiz`, { headers });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Unable to load quiz (${response.status})`);
  return response.json() as Promise<AnimeQuiz>;
}
