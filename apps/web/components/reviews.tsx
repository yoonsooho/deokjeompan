import { MessageSquare, Star } from 'lucide-react';
import Link from 'next/link';
import { QuizBadge } from './quiz-badge';
import type { LatestReview, Review, ScoreSummary } from '@cutlog/contracts';

export function Rating({ average, count }: ScoreSummary) {
  return <span className="rating" aria-label={average === null ? '평점 없음' : `평점 ${average.toFixed(1)}점, ${count}명 참여`}>
    <Star size={15} fill={average === null ? 'none' : 'currentColor'} aria-hidden="true" />
    <span>{average === null ? '–' : average.toFixed(1)}</span>
  </span>;
}

export function ReviewCard({ review, source }: { review: Review; source?: LatestReview }) {
  const link = source ? `/anime/${source.animeSlug}${source.episode ? `/episodes/${source.episode}` : ''}` : null;
  return <article className="review-card">
    {source && link && <Link className="review-source" href={link}>
      {source.animeTitle}{source.episode ? ` · ${source.episode}화` : ''}
    </Link>}
    <div className="review-byline">
      <span className="avatar" aria-hidden="true">{Array.from(review.nickname)[0]}</span>
      <strong>{review.nickname}</strong>
      {review.badge && <QuizBadge badge={review.badge} compact />}
      {review.sample && <span className="sample">샘플</span>}
      <time dateTime={review.updatedAt} className="sr-only">{review.updatedAt.slice(0, 10)}</time>
      <Rating average={review.rating} count={1} />
    </div>
    {review.spoiler
      ? <details className="spoiler"><summary>스포일러가 포함된 감상 보기</summary><p>{review.comment}</p></details>
      : <p>{review.comment}</p>}
  </article>;
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) return <div className="empty-state">
    <MessageSquare size={25} aria-hidden="true" />
    <p>아직 감상이 없어요. 첫 감상을 남겨 보세요.</p>
  </div>;
  return <div className="review-stack">{reviews.map((review) => <ReviewCard key={review.id} review={review} />)}</div>;
}
