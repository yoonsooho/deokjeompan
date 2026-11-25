'use client';

import { Check, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState, useTransition } from 'react';
import type { AnimeQuiz, QuizResult } from '@cutlog/contracts';
import { QuizBadge } from '../../components/quiz-badge';
import { startQuizRound, submitQuiz } from './actions';

export function QuizGame({ initialQuiz, reviewHref }: { initialQuiz: AnimeQuiz; reviewHref: string }) {
  const [quiz, setQuiz] = useState(initialQuiz);
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();
  const title = useRef<HTMLHeadingElement>(null);
  const question = quiz.questions[index];
  const last = index === quiz.questions.length - 1;

  useEffect(() => {
    if (index > 0 || result || quiz !== initialQuiz) title.current?.focus();
  }, [index, result, quiz, initialQuiz]);

  function next() {
    if (!choices[question.id]) return;
    if (!last) {
      setIndex(index + 1);
      return;
    }
    setMessage('');
    startTransition(async () => {
      const response = await submitQuiz(quiz.anime.slug, quiz.quizVersion, quiz.questions.map(({ id }) => ({
        questionId: id,
        optionId: choices[id],
      })));
      if (response.error) setMessage(response.error);
      else if (response.data) setResult(response.data);
    });
  }

  function replay() {
    setMessage('');
    startTransition(async () => {
      const response = await startQuizRound(quiz.anime.slug);
      if (response.error) setMessage(response.error);
      else if (response.data) {
        setChoices({});
        setIndex(0);
        setResult(null);
        setQuiz(response.data);
      }
    });
  }

  if (result) {
    const { badge, bestBadge } = result;
    const improved = badge.score * bestBadge.total >= bestBadge.score * badge.total;

    return <section className="quiz-card quiz-result" aria-labelledby="quiz-result-title">
      <h2 ref={title} tabIndex={-1} id="quiz-result-title">퀴즈 결과</h2>
      <p className="quiz-result-score">{badge.score}<span> / {badge.total}</span></p>
      <p>{badge.total}문제 중 {badge.score}개를 맞혔어요.</p>
      <div className="quiz-result-badge">
        <span>{improved ? '내 뱃지에 저장됨' : '내 최고 뱃지'}</span><QuizBadge badge={bestBadge} />
      </div>
      <div className="quiz-result-actions">
        <Link className="button button-primary" href={reviewHref}>리뷰 쓰러 가기</Link>
        <Link className="button button-ghost" href="/me">내 뱃지 보기</Link>
        <button type="button" className="button button-ghost" onClick={replay} disabled={pending}>
          <RotateCcw size={17} aria-hidden="true" /> {pending ? '문제 준비 중…' : '다시 도전하기'}
        </button>
      </div>
      <p className="quiz-error" role="status">{message}</p>
      <details className="quiz-answer-key">
        <summary>문제별 정답 보기</summary>
        <ol>{quiz.questions.map((item) => {
          const feedback = result.feedback.find((entry) => entry.questionId === item.id);
          const picked = item.options.find((option) => option.id === feedback?.optionId);
          const correct = item.options.find((option) => option.id === feedback?.correctOptionId);
          return <li key={item.id}>
            <strong>{item.prompt}</strong>
            <p>{picked?.id === correct?.id ? '정답' : `내 답: ${picked?.label} · 정답`} {correct?.label}</p>
          </li>;
        })}</ol>
      </details>
    </section>;
  }

  return <section className="quiz-card" aria-labelledby="quiz-question-title">
    <div className="quiz-progress">
      <div><strong>문제 {index + 1} / {quiz.questions.length}</strong>
        {quiz.bestBadge && <QuizBadge badge={quiz.bestBadge} compact />}
      </div>
      <progress aria-label="퀴즈 진행" value={index + 1} max={quiz.questions.length} />
    </div>
    <div className="quiz-interaction">
      <h2 ref={title} tabIndex={-1} id="quiz-question-title">{question.prompt}</h2>
      <div className="quiz-options">
        {question.options.map((option, optionIndex) => {
          const selected = choices[question.id] === option.id;
          return <button key={option.id} type="button" className="quiz-option" aria-pressed={selected}
            onClick={() => setChoices((current) => ({ ...current, [question.id]: option.id }))} disabled={pending}>
            <span className="quiz-option-letter" aria-hidden="true">{String.fromCharCode(65 + optionIndex)}</span>
            <span>{option.label}</span>
            {selected && <Check className="quiz-option-icon" size={19} aria-hidden="true" />}
          </button>;
        })}
      </div>
      <div className="quiz-navigation">
        {index > 0 && <button className="button button-ghost" type="button" onClick={() => setIndex(index - 1)} disabled={pending}>이전 문제</button>}
        <button className="button button-primary" type="button" onClick={next} disabled={pending || !choices[question.id]}>
          {pending ? '채점 중…' : last ? '결과 보기' : '다음 문제'}
        </button>
      </div>
      <p className="quiz-error" role="status">{message}</p>
    </div>
  </section>;
}
