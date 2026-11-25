'use client';

import { useActionState, useState } from 'react';
import { PenLine } from 'lucide-react';
import type { AnimeBadge } from '@cutlog/contracts';
import { QuizBadge } from './quiz-badge';
import { saveReview, type ReviewState } from '../app/actions';

const initialState: ReviewState = { status: 'idle', message: '' };

export function ReviewForm({ slug, episode, nickname, badge }: {
  slug: string;
  episode: number | null;
  nickname: string;
  badge: AnimeBadge;
}) {
  const [state, action, pending] = useActionState(saveReview.bind(null, slug, episode), initialState);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [spoiler, setSpoiler] = useState(false);

  return <form className="review-form" action={action}>
    <div className="form-heading"><PenLine size={20} aria-hidden="true" /><h2 id="review-title">평점과 감상 남기기</h2></div>
    <div className="review-author"><strong>{nickname}</strong><QuizBadge badge={badge} compact /></div>
    <p className="form-help">다시 저장하면 이 계정의 이전 평가가 수정돼요.</p>
    <fieldset disabled={pending}>
      <legend>평점</legend>
      <div className="score-choices">
        {Array.from({ length: 10 }, (_, index) => {
          const number = index + 1;
          return <label key={number} className="score-choice">
            <input className="sr-only" type="radio" name="rating" value={number} checked={rating === number} onChange={() => setRating(number)} required />
            <span>{number}<span className="sr-only">점</span></span>
          </label>;
        })}
      </div>
      <label className="field">감상 <span className="optional">(선택)</span><textarea name="comment" maxLength={500} rows={4} placeholder="기억에 남은 장면이나 감정을 적어 보세요." value={comment} onChange={(event) => setComment(event.target.value)} /></label>
      <div className="form-bottom">
        <label className="checkbox"><input name="spoiler" type="checkbox" checked={spoiler} onChange={(event) => setSpoiler(event.target.checked)} /> 스포일러 포함</label>
        <span className="character-count">{comment.length}/500</span>
      </div>
      <button className="button button-primary save-button" type="submit">{pending ? '저장 중…' : '저장하기'}</button>
    </fieldset>
    <p aria-live="polite" className={`form-status ${state.status}`}>{state.message}</p>
  </form>;
}
