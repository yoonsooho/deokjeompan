import Image from 'next/image';
import Link from 'next/link';
import { CirclePlay, ListFilter, MessageSquare, SearchX, Sparkles } from 'lucide-react';
import { SessionHeader } from '../components/session-header';
import { Rating, ReviewCard } from '../components/reviews';
import { getAnime, getAnimeList, getRecentReviews } from '../lib/api';

const genres = ['판타지', '모험', '드라마', '미스터리', '음악', '액션'] as const;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? '';
}

function catalogLink(filters: Record<string, string>) {
  const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
  return `/${query.size ? `?${query}` : ''}#works`;
}

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = first(params.q).slice(0, 120);
  const requestedGenre = first(params.genre);
  const genre = genres.find((value) => value === requestedGenre) ?? '';
  const requestedSort = first(params.sort);
  const sort = ['rating', 'recent'].includes(requestedSort) ? requestedSort : '';
  const [works, recent, featured] = await Promise.all([
    getAnimeList({ q, genre, sort }),
    getRecentReviews(),
    getAnime('frieren'),
  ]);
  const featureEpisode = featured?.episodes[0];

  return <>
    <SessionHeader query={q} />
    <main className="wrap home-main">
      {featured && featureEpisode && <section className="hero" aria-labelledby="hero-title">
        <Image className="hero-image" src="/art/frieren-banner.jpg" alt="" fill sizes="(max-width: 1250px) 100vw, 1250px" preload />
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="eyebrow"><Sparkles size={16} aria-hidden="true" /> 에디터 픽</p>
          <h1 id="hero-title">{featured.title}</h1>
          <p className="hero-tagline">여행이 끝난 뒤, 또 다른 이야기가 시작된다.</p>
          <div className="hero-meta">
            <span>{featured.year}</span>
            <span className="meta-dot" aria-hidden="true" />
            <span>{featured.genres.join(' · ')}</span>
            <span className="meta-dot" aria-hidden="true" />
            <Rating {...featured} />
          </div>
          <div className="hero-actions">
            <Link className="button button-primary" href={`/anime/${featured.slug}`}><CirclePlay size={19} aria-hidden="true" /> 작품 보기</Link>
            <Link className="button button-ghost" href={`/anime/${featured.slug}/episodes/${featureEpisode.number}#review`}><MessageSquare size={17} aria-hidden="true" /> 1화 감상 남기기</Link>
          </div>
        </div>
      </section>}
      <section id="works" className="catalog section" aria-labelledby="works-title">
        <div className="section-heading">
          <div>
            <h2 id="works-title">{q ? `“${q}” 검색 결과` : sort === 'rating' ? '평점 순위' : '작품 탐색'}</h2>
            <p>{q ? `${works?.length ?? 0}개 작품을 찾았어요.` : '작품을 골라 회차별 평점과 감상을 확인해 보세요.'}</p>
          </div>
          {sort === 'rating'
            ? <Link className="subtle-link" href={catalogLink({ q, genre })}><ListFilter size={17} aria-hidden="true" /> 기본 순서</Link>
            : <Link className="subtle-link" href={catalogLink({ q, genre, sort: 'rating' })}><ListFilter size={17} aria-hidden="true" /> 평점순 보기</Link>}
        </div>
        <nav className="filters" aria-label="작품 장르">
          {['', ...genres].map((value) => <Link key={value || 'all'} className={value === genre ? 'chip active' : 'chip'} aria-current={value === genre ? 'true' : undefined} href={catalogLink({ q, genre: value, sort })}>{value || '전체'}</Link>)}
          {q && <Link className="chip clear-chip" href={catalogLink({ genre, sort })}>검색 초기화</Link>}
        </nav>
        {works?.length ? <div className="poster-grid">
          {works.map((anime) => <Link className="poster-card" key={anime.slug} href={`/anime/${anime.slug}`}>
            <div className="poster-image-wrap">
              <Image src={anime.cover} alt="" fill sizes="(max-width: 520px) 45vw, (max-width: 850px) 30vw, 195px" />
              <span className="poster-score"><Rating {...anime} /></span>
            </div>
            <h3>{anime.title}</h3>
            <p>{anime.year} <span aria-hidden="true">·</span> {anime.genres[0]} <span aria-hidden="true">·</span> {anime.episodeCount}화</p>
          </Link>)}
        </div> : <div className="empty-state"><SearchX size={30} aria-hidden="true" /><p>조건에 맞는 작품이 없어요.</p><Link className="subtle-link" href="/#works">전체 작품 보기</Link></div>}
      </section>
      <section id="recent" className="section recent-section" aria-labelledby="recent-title">
        <div className="section-heading"><div><h2 id="recent-title">최근 감상</h2><p>다른 사람들은 어떤 장면을 기억하고 있을까요?</p></div></div>
        {recent?.length
          ? <div className="recent-grid">{recent.map((review) => <ReviewCard key={review.id} review={review} source={review} />)}</div>
          : <div className="empty-state"><p>아직 등록된 감상이 없어요.</p></div>}
      </section>
    </main>
  </>;
}
