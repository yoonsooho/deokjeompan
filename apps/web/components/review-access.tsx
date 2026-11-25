import Link from 'next/link';
import { LockKeyhole } from 'lucide-react';
import { getMyBadges, getViewer } from '../lib/session';
import { loginPath, reviewPath } from '../lib/return-path';
import { ReviewForm } from './review-form';

export async function ReviewAccess({ slug, episode = null }: { slug: string; episode?: number | null }) {
  const account = await getViewer();
  const next = reviewPath(slug, episode);
  const badge = account && (await getMyBadges()).find((item) => item.animeSlug === slug);

  return <section id="review" aria-labelledby="review-title">
    {account && badge ? <ReviewForm slug={slug} episode={episode} nickname={account.nickname} badge={badge} /> :
      <div className="review-form review-gate">
        <div className="form-heading"><LockKeyhole size={20} aria-hidden="true" /><h2 id="review-title">평점과 감상 남기기</h2></div>
        <p>이 작품의 퀴즈를 마치면 작품과 회차에 평점과 감상을 남길 수 있어요.</p>
        <Link className="button button-primary" href={account
          ? `/anime/${encodeURIComponent(slug)}/quiz?${new URLSearchParams({ next })}`
          : loginPath(next)}>
          {account ? '작품 퀴즈 풀기' : '로그인하고 참여하기'}
        </Link>
      </div>}
  </section>;
}
