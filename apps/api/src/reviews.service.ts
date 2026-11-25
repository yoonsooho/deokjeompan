import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Account, AnimeBadge, LatestReview, Review, ScoreSummary } from '@cutlog/contracts';
import { sampleReviews } from './catalog';
import { badgeFromScore } from './badges.service';
import { CutlogDatabase } from './database';

interface ReviewRow {
  id: string;
  anime_slug: string;
  episode: number;
  nickname: string;
  rating: number;
  comment: string;
  spoiler: number;
  sample: number;
  updated_at: string;
  badge_score?: number | null;
  badge_total?: number | null;
}

export interface ReviewInput {
  rating: number;
  comment: string;
  spoiler: boolean;
}

function toReview(row: ReviewRow): Review {
  return {
    id: row.id,
    nickname: row.nickname,
    rating: row.rating,
    comment: row.comment,
    spoiler: Boolean(row.spoiler),
    sample: Boolean(row.sample),
    updatedAt: row.updated_at,
    badge: row.badge_score != null && row.badge_total != null
      ? badgeFromScore(row.badge_score, row.badge_total)
      : null,
  };
}

const reviewsWithBadges = `
  SELECT reviews.*, quiz_badges.score AS badge_score, quiz_badges.total AS badge_total
  FROM reviews LEFT JOIN quiz_badges ON quiz_badges.account_id = reviews.account_id
    AND quiz_badges.anime_slug = reviews.anime_slug
`;

@Injectable()
export class ReviewsService {
  private readonly database: CutlogDatabase['connection'];

  constructor(storage: CutlogDatabase) {
    this.database = storage.connection;
    this.database.exec('BEGIN IMMEDIATE');
    try {
      this.database.exec(`
        CREATE TABLE IF NOT EXISTS reviews (
          id TEXT PRIMARY KEY,
          anime_slug TEXT NOT NULL,
          episode INTEGER NOT NULL CHECK (episode >= 0),
          viewer_id TEXT NOT NULL,
          account_id TEXT REFERENCES accounts(id),
          nickname TEXT NOT NULL,
          rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 10),
          comment TEXT NOT NULL,
          spoiler INTEGER NOT NULL CHECK (spoiler IN (0, 1)),
          sample INTEGER NOT NULL CHECK (sample IN (0, 1)),
          updated_at TEXT NOT NULL,
          UNIQUE (anime_slug, episode, viewer_id)
        ) STRICT;
        CREATE INDEX IF NOT EXISTS reviews_latest ON reviews (updated_at DESC, id DESC);
      `);
      const columns = this.database.prepare('PRAGMA table_info(reviews)').all();
      if (!columns.some((column) => column.name === 'account_id')) {
        this.database.exec('ALTER TABLE reviews ADD COLUMN account_id TEXT REFERENCES accounts(id)');
      }
      this.database.exec('COMMIT');
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }
    if (process.env.SEED_SAMPLE_REVIEWS !== 'false') this.seed();
  }

  summaries(episode?: number) {
    const select = 'SELECT anime_slug, episode, ROUND(AVG(rating), 1) AS average, COUNT(*) AS count FROM reviews';
    const rows = (episode === undefined
      ? this.database.prepare(`${select} GROUP BY anime_slug, episode`).all()
      : this.database.prepare(`${select} WHERE episode = ? GROUP BY anime_slug, episode`).all(episode)
    ) as unknown as (ScoreSummary & { anime_slug: string; episode: number })[];
    return new Map(rows.map((row) => [
      `${row.anime_slug}/${row.episode}`,
      { average: row.average, count: row.count },
    ]));
  }

  list(slug: string, episode: number): Review[] {
    const rows = this.database.prepare(`
      ${reviewsWithBadges} WHERE reviews.anime_slug = ? AND reviews.episode = ? AND reviews.comment <> ''
      ORDER BY reviews.updated_at DESC, reviews.id DESC LIMIT 50
    `).all(slug, episode) as unknown as ReviewRow[];
    return rows.map(toReview);
  }

  latest(): Omit<LatestReview, 'animeTitle'>[] {
    const rows = this.database.prepare(`
      ${reviewsWithBadges} WHERE reviews.comment <> ''
      ORDER BY reviews.updated_at DESC, reviews.id DESC LIMIT 6
    `).all() as unknown as ReviewRow[];
    return rows.map((row) => ({ ...toReview(row), animeSlug: row.anime_slug, episode: row.episode }));
  }

  save(slug: string, episode: number, account: Account, badge: AnimeBadge, review: ReviewInput): Review {
    const row = this.database.prepare(`
      INSERT INTO reviews (id, anime_slug, episode, viewer_id, account_id, nickname, rating, comment, spoiler, sample, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
      ON CONFLICT (anime_slug, episode, viewer_id) DO UPDATE SET
        nickname = excluded.nickname, rating = excluded.rating, comment = excluded.comment,
        spoiler = excluded.spoiler, updated_at = excluded.updated_at
      RETURNING *
    `).get(
      randomUUID(), slug, episode, `account:${account.id}`, account.id, account.nickname, review.rating,
      review.comment, Number(review.spoiler), new Date().toISOString(),
    ) as unknown as ReviewRow;
    return { ...toReview(row), badge };
  }

  private seed() {
    const insert = this.database.prepare(`
      INSERT INTO reviews (id, anime_slug, episode, viewer_id, nickname, rating, comment, spoiler, sample, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, 1, ?)
      ON CONFLICT (id) DO NOTHING
    `);
    this.database.exec('BEGIN IMMEDIATE');
    try {
      sampleReviews.forEach(([slug, episode, nickname, rating, comment], index) => {
        const id = `sample-${index + 1}`;
        const timestamp = new Date(Date.UTC(2025, 0, 14 - index)).toISOString();
        insert.run(id, slug, episode, id, nickname, rating, comment, timestamp);
      });
      this.database.exec('COMMIT');
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }
  }
}
