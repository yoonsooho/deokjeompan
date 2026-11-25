import Link from 'next/link';
import { Header } from '../components/site-shell';

export default function NotFound() {
  return <>
    <Header />
    <main className="wrap fallback-main">
      <h1>페이지를 찾을 수 없어요</h1>
      <p>주소를 확인하거나 작품 탐색으로 돌아가 주세요.</p>
      <Link className="button button-primary" href="/#works">작품 탐색</Link>
    </main>
  </>;
}
