import { Award, Medal, Trophy } from 'lucide-react';
import type { AnimeBadge } from '@cutlog/contracts';

const labels = {
  participant: '참여',
  bronze: '브론즈',
  silver: '실버',
  gold: '골드',
};

export function QuizBadge({ badge, compact = false }: { badge: AnimeBadge; compact?: boolean }) {
  const Icon = badge.tier === 'gold' ? Trophy : badge.tier === 'participant' ? Award : Medal;
  return <span className={`quiz-badge ${badge.tier}${compact ? ' compact' : ''}`}
    aria-label={`${labels[badge.tier]} 뱃지, ${badge.total}문제 중 ${badge.score}개 정답`}>
    <Icon size={compact ? 13 : 16} aria-hidden="true" />
    <span>{labels[badge.tier]}</span>
  </span>;
}
