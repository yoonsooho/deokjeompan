import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { SessionHeader } from '../../../../components/session-header';
import { getAnime, getAnimeQuiz } from '../../../../lib/api';
import { internalPath, loginPath, reviewPath } from '../../../../lib/return-path';
import { getViewer, sessionAuthorization } from '../../../../lib/session';
import { QuizGame } from '../../../quiz/quiz-game';
import '../../../quiz/quiz.css';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ next?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const anime = await getAnime((await params).slug);
  return anime ? { title: `${anime.title} 퀴즈` } : {};
}

export default async function AnimeQuizPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const anime = await getAnime(slug);
  if (!anime) notFound();
  const next = internalPath((await searchParams).next, reviewPath(anime.slug));
  const quizPath = `/anime/${anime.slug}/quiz?${new URLSearchParams({ next })}`;
  const headers = await sessionAuthorization();
  if (!headers || !(await getViewer())) redirect(loginPath(quizPath));
  const quiz = await getAnimeQuiz(anime.slug, headers);
  if (!quiz) notFound();

  return <>
    <SessionHeader quizPage />
    <main className="wrap quiz-main">
      <nav className="breadcrumbs" aria-label="현재 위치">
        <Link href="/quiz">작품 퀴즈</Link><span aria-hidden="true">/</span>
        <Link href={`/anime/${anime.slug}`}>{anime.title}</Link><span aria-hidden="true">/</span>
        <span aria-current="page">퀴즈</span>
      </nav>
      <header className="quiz-heading">
        <h1>{anime.title} 퀴즈</h1>
        <p>{quiz.questions.length}문제를 풀면 뱃지를 받고 이 작품과 회차의 리뷰를 작성할 수 있어요.</p>
      </header>
      <QuizGame initialQuiz={quiz} reviewHref={next} />
    </main>
  </>;
}
