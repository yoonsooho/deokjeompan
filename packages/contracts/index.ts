export interface ScoreSummary {
  average: number | null;
  count: number;
}

export interface AnimeCard extends ScoreSummary {
  slug: string;
  title: string;
  originalTitle: string;
  year: number;
  genres: string[];
  episodeCount: number;
  cover: string;
}

export interface Review {
  id: string;
  nickname: string;
  rating: number;
  comment: string;
  spoiler: boolean;
  sample: boolean;
  updatedAt: string;
  badge: AnimeBadge | null;
}

export interface LatestReview extends Review {
  animeSlug: string;
  animeTitle: string;
  episode: number;
}

export interface AnimeDetail extends AnimeCard {
  description: string;
  episodes: EpisodeSummary[];
  reviews: Review[];
}

export interface EpisodeSummary extends ScoreSummary {
  number: number;
}

export interface EpisodeDetail extends EpisodeSummary {
  anime: AnimeCard;
  reviews: Review[];
}

export interface QuizOption {
  id: string;
  label: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
}

export interface Account {
  id: string;
  username: string;
  nickname: string;
}

export interface AccountSession {
  account: Account;
  token: string;
  expiresAt: number;
}

export type BadgeTier = 'participant' | 'bronze' | 'silver' | 'gold';

export interface AnimeBadge {
  tier: BadgeTier;
  score: number;
  total: number;
}

export interface EarnedBadge extends AnimeBadge {
  animeSlug: string;
  animeTitle: string;
  cover: string;
  earnedAt: string;
}

export interface AnimeQuiz {
  quizVersion: string;
  anime: Pick<AnimeCard, 'slug' | 'title' | 'cover'>;
  questions: QuizQuestion[];
  bestBadge: AnimeBadge | null;
}

export interface QuizChoice {
  questionId: string;
  optionId: string;
}

export interface QuizFeedback extends QuizChoice {
  correctOptionId: string;
}

export interface QuizResult {
  badge: AnimeBadge;
  bestBadge: AnimeBadge;
  feedback: QuizFeedback[];
}
