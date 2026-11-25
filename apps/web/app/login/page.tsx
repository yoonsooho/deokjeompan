import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Header } from '../../components/site-shell';
import { internalPath, loginPath } from '../../lib/return-path';
import { getViewer } from '../../lib/session';
import { AuthForm } from './auth-form';

export const metadata: Metadata = { title: '로그인' };

type Props = { searchParams: Promise<{ mode?: string | string[]; next?: string | string[] }> };

export default async function Login({ searchParams }: Props) {
  const params = await searchParams;
  const next = internalPath(params.next, '/me');
  const register = params.mode === 'register';
  if (await getViewer()) redirect(next.startsWith('/login') ? '/me' : next);

  return <>
    <Header />
    <main className="wrap account-main">
      <section className="account-card" aria-labelledby="account-title">
        <h1 id="account-title">{register ? '회원가입' : '로그인'}</h1>
        <p>작품 퀴즈에서 받은 뱃지를 계정에 모아 보세요.</p>
        <AuthForm register={register} next={next} />
        <Link className="subtle-link" href={loginPath(next, !register)}>
          {register ? '이미 계정이 있어요' : '처음이라면 회원가입'}
        </Link>
      </section>
    </main>
  </>;
}
