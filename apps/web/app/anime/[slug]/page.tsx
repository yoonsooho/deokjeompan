import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ListVideo, MessageSquare } from 'lucide-react';
import { notFound } from 'next/navigation';
import { SessionHeader } from '../../../components/session-header';
import { Rating, ReviewList } from '../../../components/reviews';
import { ReviewAccess } from '../../../components/review-access';
import { getAnime } from '../../../lib/api';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const anime = await getAnime((await params).slug);
  return anime ? { title: `${anime.title} 평점과 감상`, description: anime.description } : {};
}

export default async function AnimePage({ params }: Props) {
  const anime = await getAnime((await params).slug);
  if (!anime) notFound();

  return <>
    <SessionHeader />
    <main className="wrap detail-main">
      <nav className="breadcrumbs" aria-label="현재 위치"><Link href="/#works">작품 탐색</Link><span aria-hidden="true">/</span><span aria-current="page">{anime.title}</span></nav>
      <section className="detail-intro" aria-labelledby="detail-title">
        <div className="detail-cover"><Image src={anime.cover} alt="" fill sizes="(max-width: 560px) 120px, 205px" preload /></div>
        <div className="detail-description">
          <p className="original-title">{anime.originalTitle}</p>
          <h1 id="detail-title">{anime.title}</h1>
          <ul className="detail-meta"><li>{anime.year}</li><li>{anime.genres.join(' · ')}</li><li>{anime.episodeCount}화</li></ul>
          <p className="synopsis">{anime.description}</p>
          <div className="detail-actions">
            <span className="score-panel"><Rating {...anime} /><span>{anime.count}명 참여</span></span>
            <Link className="button button-primary" href="#episodes"><ListVideo size={19} aria-hidden="true" /> 회차 고르기</Link>
            <Link className="button button-ghost" href={`/anime/${anime.slug}/quiz`}>작품 퀴즈</Link>
          </div>
        </div>
      </section>
      <section className="section" id="episodes" aria-labelledby="episodes-title">
        <div className="section-heading"><div><h2 id="episodes-title">회차별 평점</h2><p>회차를 선택하면 감상을 읽거나 평가를 남길 수 있어요.</p></div></div>
        <div className="episode-grid">{anime.episodes.map((episode) => <Link className="episode-card" key={episode.number} href={`/anime/${anime.slug}/episodes/${episode.number}`}>
          <strong>{episode.number}화</strong><Rating {...episode} />
        </Link>)}</div>
      </section>
      <div className="discussion-grid section">
        <section aria-labelledby="discussion-title">
          <div className="section-heading"><div><h2 id="discussion-title"><MessageSquare size={23} aria-hidden="true" /> 작품 감상</h2><p>작품 전체를 본 시청자의 감상이에요.</p></div></div>
          <ReviewList reviews={anime.reviews} />
        </section>
        <ReviewAccess slug={anime.slug} />
      </div>
    </main>
  </>;
}
