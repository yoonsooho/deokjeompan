import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ListVideo, MessageSquare } from 'lucide-react';
import { notFound } from 'next/navigation';
import { SessionHeader } from '../../../../../components/session-header';
import { Rating, ReviewList } from '../../../../../components/reviews';
import { ReviewAccess } from '../../../../../components/review-access';
import { getEpisode } from '../../../../../lib/api';

type Props = { params: Promise<{ slug: string; episode: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, episode } = await params;
  const detail = await getEpisode(slug, episode);
  return detail ? {
    title: `${detail.anime.title} ${detail.number}화 평점과 감상`,
    description: `${detail.anime.title} ${detail.number}화의 평점과 시청자 감상을 확인해 보세요.`,
  } : {};
}

export default async function EpisodePage({ params }: Props) {
  const { slug, episode } = await params;
  const detail = await getEpisode(slug, episode);
  if (!detail) notFound();
  const { anime, number } = detail;
  const animeHref = `/anime/${anime.slug}`;

  return <>
    <SessionHeader />
    <main className="wrap detail-main">
      <nav className="breadcrumbs" aria-label="현재 위치"><Link href="/#works">작품 탐색</Link><span aria-hidden="true">/</span><Link href={animeHref}>{anime.title}</Link><span aria-hidden="true">/</span><span aria-current="page">{number}화</span></nav>
      <section className="detail-intro episode-intro" aria-labelledby="episode-title">
        <div className="detail-cover"><Image src={anime.cover} alt="" fill sizes="135px" /></div>
        <div className="detail-description">
          <p className="original-title">{anime.originalTitle}</p>
          <h1 id="episode-title">{anime.title} <span className="episode-label">{number}화</span></h1>
          <p className="episode-caption">총 {anime.episodeCount}화 중 {number}화</p>
          <div className="detail-actions">
            <span className="score-panel"><Rating {...detail} /><span>{detail.count}명 참여</span></span>
            <Link className="button button-ghost" href={`${animeHref}#episodes`}><ListVideo size={19} aria-hidden="true" /> 회차 목록</Link>
          </div>
        </div>
      </section>
      <div className="discussion-grid section">
        <section aria-labelledby="discussion-title">
          <div className="section-heading"><div><h2 id="discussion-title"><MessageSquare size={23} aria-hidden="true" /> {number}화 감상</h2><p>시청자들이 이 회차에 남긴 이야기예요.</p></div></div>
          <ReviewList reviews={detail.reviews} />
        </section>
        <ReviewAccess slug={anime.slug} episode={number} />
      </div>
      <nav className="episode-navigation" aria-label="인접 회차">
        {number > 1 && <Link className="button button-ghost" href={`${animeHref}/episodes/${number - 1}`}>이전 {number - 1}화</Link>}
        {number < anime.episodeCount && <Link className="button button-ghost" href={`${animeHref}/episodes/${number + 1}`}>다음 {number + 1}화</Link>}
      </nav>
    </main>
  </>;
}
