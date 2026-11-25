import { Injectable } from '@nestjs/common';
import type { AnimeBadge, EarnedBadge } from '@cutlog/contracts';
import { catalog } from './catalog';
import { CutlogDatabase } from './database';

interface BadgeRow {
  anime_slug: string;
  score: number;
  total: number;
  earned_at: string;
}

export function badgeFromScore(score: number, total: number): AnimeBadge {
  let tier: AnimeBadge['tier'] = 'participant';
  if (score === total) tier = 'gold';
  else if (score / total >= 0.6) tier = 'silver';
  else if (score > 0) tier = 'bronze';
  return { score, total, tier };
}

@Injectable()
export class BadgesService {
  constructor(private readonly storage: CutlogDatabase) {}

  get(accountId: string, slug: string): AnimeBadge | null {
    const row = this.storage.connection.prepare(`
      SELECT score, total FROM quiz_badges WHERE account_id = ? AND anime_slug = ?
    `).get(accountId, slug) as unknown as Pick<BadgeRow, 'score' | 'total'> | undefined;
    return row ? badgeFromScore(row.score, row.total) : null;
  }

  list(accountId: string): EarnedBadge[] {
    const rows = this.storage.connection.prepare(`
      SELECT anime_slug, score, total, earned_at FROM quiz_badges
      WHERE account_id = ? ORDER BY earned_at DESC, anime_slug
    `).all(accountId) as unknown as BadgeRow[];
    return rows.flatMap((row) => {
      const anime = catalog.find((entry) => entry.slug === row.anime_slug);
      return anime ? [{
        ...badgeFromScore(row.score, row.total),
        animeSlug: anime.slug,
        animeTitle: anime.title,
        cover: anime.cover,
        earnedAt: row.earned_at,
      }] : [];
    });
  }

  award(accountId: string, slug: string, score: number, total: number): AnimeBadge {
    this.storage.connection.prepare(`
      INSERT INTO quiz_badges (account_id, anime_slug, score, total, earned_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT (account_id, anime_slug) DO UPDATE SET
        score = excluded.score, total = excluded.total, earned_at = excluded.earned_at
      WHERE excluded.score * quiz_badges.total > quiz_badges.score * excluded.total
    `).run(accountId, slug, score, total, new Date().toISOString());
    const badge = this.get(accountId, slug);
    if (!badge) throw new Error('Quiz badge was not stored');
    return badge;
  }
}
