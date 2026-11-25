import { BadRequestException, Body, Controller, ForbiddenException, Get, Headers, NotFoundException, Param, Post, Query } from '@nestjs/common';
import type { AnimeCard, AnimeDetail, EpisodeDetail, LatestReview, ScoreSummary } from '@cutlog/contracts';
import { catalog } from './catalog';
import { AccountsService } from './accounts.service';
import { BadgesService } from './badges.service';
import { ReviewsService, type ReviewInput } from './reviews.service';

const unrated = { average: null, count: 0 };

function normalize(value: string) {
  return value.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
}

function animeCard(entry: (typeof catalog)[number], summary: ScoreSummary = unrated): AnimeCard {
  const { slug, title, originalTitle, year, genres, episodeCount, cover } = entry;
  return { slug, title, originalTitle, year, genres, episodeCount, cover, ...summary };
}

function findAnime(slug: string) {
  const anime = catalog.find((entry) => entry.slug === slug);
  if (!anime) throw new NotFoundException('작품을 찾을 수 없어요.');
  return anime;
}

function parseEpisode(value: string, episodeCount: number) {
  const episode = Number(value);
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(episode) || episode < 1 || episode > episodeCount) {
    throw new NotFoundException('회차를 찾을 수 없어요.');
  }
  return episode;
}

function validateReview(value: unknown): ReviewInput {
  if (typeof value !== 'object' || value === null) throw new BadRequestException('입력값을 확인해 주세요.');
  const { rating, comment, spoiler } = value as Record<string, unknown>;
  if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 10) {
    throw new BadRequestException('평점은 1점에서 10점까지 선택할 수 있어요.');
  }
  if (typeof comment !== 'string' || comment.trim().length > 500 || typeof spoiler !== 'boolean') {
    throw new BadRequestException('감상은 500자까지 입력할 수 있어요.');
  }
  return { rating, comment: comment.trim(), spoiler };
}

@Controller()
export class AnimeController {
  constructor(
    private readonly reviews: ReviewsService,
    private readonly accounts: AccountsService,
    private readonly badges: BadgesService,
  ) {}

  @Get('health')
  health() {
    return { status: 'ok' };
  }

  @Get('anime')
  list(@Query('q') query?: string, @Query('genre') genre?: string, @Query('sort') sort?: string): AnimeCard[] {
    const term = typeof query === 'string' ? normalize(query.slice(0, 120)) : '';
    const summaries = this.reviews.summaries(0);
    const works = catalog
      .filter((anime) => !genre || anime.genres.includes(genre))
      .filter((anime) => !term || [anime.title, anime.originalTitle, ...anime.aliases, ...anime.genres]
        .some((value) => normalize(value).includes(term)))
      .map((anime) => animeCard(anime, summaries.get(`${anime.slug}/0`)));

    if (sort === 'rating') {
      works.sort((a, b) => (b.average ?? 0) - (a.average ?? 0) || b.count - a.count);
    } else if (sort === 'recent') {
      works.sort((a, b) => b.year - a.year);
    }
    return works;
  }

  @Get('reviews/recent')
  latest(): LatestReview[] {
    return this.reviews.latest().map((review) => ({
      ...review,
      animeTitle: findAnime(review.animeSlug).title,
    }));
  }

  @Get('anime/:slug')
  detail(@Param('slug') slug: string): AnimeDetail {
    const anime = findAnime(slug);
    const summaries = this.reviews.summaries();
    return {
      ...animeCard(anime, summaries.get(`${slug}/0`)),
      description: anime.description,
      episodes: Array.from({ length: anime.episodeCount }, (_, index) => ({
        number: index + 1,
        ...(summaries.get(`${slug}/${index + 1}`) ?? unrated),
      })),
      reviews: this.reviews.list(slug, 0),
    };
  }

  @Get('anime/:slug/episodes/:episode')
  episode(@Param('slug') slug: string, @Param('episode') value: string): EpisodeDetail {
    const anime = findAnime(slug);
    const episode = parseEpisode(value, anime.episodeCount);
    const summaries = this.reviews.summaries();
    return {
      anime: animeCard(anime, summaries.get(`${slug}/0`)),
      number: episode,
      ...(summaries.get(`${slug}/${episode}`) ?? unrated),
      reviews: this.reviews.list(slug, episode),
    };
  }

  @Post('anime/:slug/reviews')
  rateAnime(@Param('slug') slug: string, @Headers('authorization') authorization: string | undefined, @Body() value: unknown) {
    findAnime(slug);
    return this.saveReview(slug, 0, authorization, value);
  }

  @Post('anime/:slug/episodes/:episode/reviews')
  rateEpisode(
    @Param('slug') slug: string,
    @Param('episode') value: string,
    @Headers('authorization') authorization: string | undefined,
    @Body() body: unknown,
  ) {
    const anime = findAnime(slug);
    const episode = parseEpisode(value, anime.episodeCount);
    return this.saveReview(slug, episode, authorization, body);
  }

  private saveReview(slug: string, episode: number, authorization: string | undefined, value: unknown) {
    const account = this.accounts.requireAccount(authorization);
    const badge = this.badges.get(account.id, slug);
    if (!badge) throw new ForbiddenException('이 작품의 퀴즈를 먼저 완료해 주세요.');
    return this.reviews.save(slug, episode, account, badge, validateReview(value));
  }
}
