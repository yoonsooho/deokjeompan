'use client';

import { Header } from '../components/site-shell';

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <>
    <Header />
    <main className="wrap fallback-main">
      <h1>페이지를 불러오지 못했어요</h1>
      <p>잠시 후 다시 시도해 주세요.</p>
      <button className="button button-primary" type="button" onClick={reset}>다시 시도</button>
    </main>
  </>;
}
