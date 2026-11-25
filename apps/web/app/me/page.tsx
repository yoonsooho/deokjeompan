import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { redirect } from 'next/navigation';
import { QuizBadge } from '../../components/quiz-badge';
import { SessionHeader } from '../../components/session-header';
import { loginPath } from '../../lib/return-path';
import { getMyBadges, getViewer } from '../../lib/session';
import { signOut } from '../login/actions';

export const metadata: Metadata = { title: '내 뱃지' };

export default async function Me() {
  const account = await getViewer();
  if (!account) redirect(loginPath('/me'));
  const badges = await getMyBadges();

  return <>
    <SessionHeader />
    <main className="wrap badges-main">
      <header className="badges-heading">
        <div><h1>내 뱃지</h1><p>{account.nickname} · 작품 퀴즈 뱃지 {badges.length}개</p></div>
        <form action={signOut}>
          <button className="button button-ghost" type="submit"><LogOut size={16} aria-hidden="true" /> 로그아웃</button>
        </form>
      </header>
      {badges.length ? <ul className="badge-grid">
        {badges.map((badge) => <li className="badge-card" key={badge.animeSlug}>
          <div className="badge-cover"><Image src={badge.cover} alt="" fill sizes="75px" /></div>
          <div className="badge-info">
            <Link href={`/anime/${badge.animeSlug}`}>{badge.animeTitle}</Link>
            <QuizBadge badge={badge} />
            <p>{badge.total}문제 중 {badge.score}개 정답</p>
          </div>
        </li>)}
      </ul> : <div className="empty-state"><p>작품 퀴즈를 풀면 첫 뱃지를 받을 수 있어요.</p>
        <Link href="/quiz" className="button button-primary">작품 퀴즈 고르기</Link>
      </div>}
    </main>
  </>;
}
