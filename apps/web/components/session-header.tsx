import { getViewer } from '../lib/session';
import { Header } from './site-shell';

export async function SessionHeader({ query, quizPage = false }: { query?: string; quizPage?: boolean }) {
  const account = await getViewer();
  return <Header query={query} quizPage={quizPage} signedIn={Boolean(account)} />;
}
