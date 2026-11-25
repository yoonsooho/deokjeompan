import type { Metadata } from 'next';
import { Footer } from '../components/site-shell';
import './globals.css';

export const metadata: Metadata = {
  title: { default: '덕점판 | 애니 감상과 회차별 평점', template: '%s | 덕점판' },
  description: '보고 온 애니에 평점을 남기고, 회차별로 다른 시청자의 감상을 읽어보세요.',
  icons: { icon: '/mark.svg' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}<Footer /></body></html>;
}
