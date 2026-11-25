import { Film, Search } from 'lucide-react';
import Link from 'next/link';

export function Brand() {
  return <Link className="brand" href="/" aria-label="컷로그 홈">
    <span className="brand-icon"><Film size={21} strokeWidth={2.4} /></span>
    <span>CUT<span>LOG</span></span>
  </Link>;
}

export function SearchForm({ initialQuery = '' }: { initialQuery?: string }) {
  return <form className="search" action="/#works" role="search">
    <Search size={18} aria-hidden="true" />
    <input name="q" type="search" aria-label="작품 검색" placeholder="작품을 검색해 보세요" maxLength={120} defaultValue={initialQuery} />
    <button className="sr-only" type="submit">검색</button>
  </form>;
}

export function Header({ query, quizPage = false, signedIn = false }: { query?: string; quizPage?: boolean; signedIn?: boolean }) {
  return <header className="site-header">
    <div className="wrap header-inner">
      <Brand />
      <nav aria-label="주 메뉴">
        <Link href="/#works">작품 탐색</Link>
        <Link href="/?sort=rating#works">평점 순위</Link>
        <Link href="/#recent">최근 감상</Link>
        <Link href="/quiz" aria-current={quizPage ? 'page' : undefined}>퀴즈</Link>
        {signedIn ? <Link href="/me">내 뱃지</Link> : <Link href="/login">로그인</Link>}
      </nav>
      <SearchForm initialQuery={query} />
    </div>
  </header>;
}

export function Footer() {
  return <footer className="site-footer">
    <div className="wrap footer-inner">
      <Brand />
      <p>작품 정보와 이미지 출처 <a href="https://anilist.co/">AniList</a> <span aria-hidden="true">·</span> 샘플 평점과 감상이 포함된 데모입니다.</p>
    </div>
  </footer>;
}
