import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SessionHeader } from '../../components/session-header';
import { QuizBadge } from '../../components/quiz-badge';
import { getAnimeList } from '../../lib/api';
import { getMyBadges } from '../../lib/session';
import './quiz.css';

export const metadata: Metadata = {
  title: '작품 퀴즈',
  description: '작품별 퀴즈에 도전하고 뱃지를 모아 보세요.',
};

export default async function QuizIndex() {
  const [works, badges] = await Promise.all([
    getAnimeList({ q: '', genre: '', sort: '' }),
    getMyBadges(),
  ]);

  return <>
    <SessionHeader quizPage />
    <main className="wrap quiz-main">
      <header className="quiz-heading">
        <h1>작품 퀴즈</h1>
        <p>작품을 골라 퀴즈를 풀고 뱃지를 모아 보세요.</p>
      </header>
      <div className="quiz-library">
        {works?.map((anime) => {
          const badge = badges.find((item) => item.animeSlug === anime.slug);
          return <Link key={anime.slug} href={`/anime/${anime.slug}/quiz`} className="quiz-library-item">
            <div className="quiz-library-cover"><Image src={anime.cover} alt="" fill sizes="74px" /></div>
            <div><h2>{anime.title}</h2>{badge ? <QuizBadge badge={badge} compact /> : <p>작품 퀴즈 풀기</p>}</div>
          </Link>;
        })}
      </div>
    </main>
  </>;
}
